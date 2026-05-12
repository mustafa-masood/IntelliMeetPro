import { useAuth } from '@clerk/clerk-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Sidebar from './Sidebar';

import { FaSlack, FaTrello } from 'react-icons/fa';
import { SiJira, SiAsana } from 'react-icons/si';
import {
    ensureBackendUserId,
    imApi,
    pmIntegrationAuthUrl,
    setClerkBearerToken,
    type CalendarMbaasStatus,
    type IntegrationConnection,
    type IntegrationSetupOption,
    type PmPlatform,
} from '../api/intellimeet';
import { isClerkConfigured } from '../config/clerk';

type PmKey = 'asana' | 'jira' | 'trello';

interface Integration {
    id: string;
    name: string;
    description: string;
    icon: string;
    isConnected: boolean;
    category: 'recommended' | 'connected' | 'disconnected';
}

function connectionFor(connections: IntegrationConnection[], platform: PmPlatform) {
    return connections.find((c) => c.platform === platform);
}

/** Keeps apiJson Authorization in sync after OAuth full-page redirects (must render under ClerkProvider). */
function ClerkBearerRegistrar({ register }: { register: (fn: () => Promise<void>) => void }) {
    const { getToken } = useAuth();
    useEffect(() => {
        register(async () => {
            const t = await getToken();
            if (t) setClerkBearerToken(t);
        });
    }, [getToken, register]);
    return null;
}

const AppIntegrations: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [activeFilter, setActiveFilter] = useState<'all' | 'connected' | 'disconnected'>('all');
    const [integrations, setIntegrations] = useState<Integration[]>([
        { id: 'slack', name: 'Slack', description: 'Coming soon — unified workflows', icon: 'slack', isConnected: false, category: 'disconnected' },
        { id: 'asana', name: 'Asana', description: 'Automation for task management', icon: 'asana', isConnected: false, category: 'disconnected' },
        { id: 'jira', name: 'Jira', description: 'Adapt workflows for agile teams', icon: 'jira', isConnected: false, category: 'disconnected' },
        { id: 'trello', name: 'Trello', description: 'Visual project collaboration tools', icon: 'trello', isConnected: false, category: 'disconnected' },
    ]);

    const [pmConnections, setPmConnections] = useState<IntegrationConnection[]>([]);
    const [pmLoading, setPmLoading] = useState(true);
    const [pmError, setPmError] = useState<string | null>(null);

    const [setupModalOpen, setSetupModalOpen] = useState(false);
    const [setupPlatform, setSetupPlatform] = useState<PmKey | null>(null);
    const [setupOptions, setSetupOptions] = useState<IntegrationSetupOption[]>([]);
    const [setupSelection, setSetupSelection] = useState('');
    const [setupBusy, setSetupBusy] = useState(false);

    const [calendarMbaas, setCalendarMbaas] = useState<CalendarMbaasStatus | null>(null);
    const [calendarLoading, setCalendarLoading] = useState(true);

    const refreshClerkBearerRef = useRef<(() => Promise<void>) | null>(null);
    const registerClerkBearerRefresh = useCallback((fn: () => Promise<void>) => {
        refreshClerkBearerRef.current = fn;
    }, []);

    const refreshCalendarStatus = useCallback(async () => {
        setCalendarLoading(true);
        try {
            const s = await imApi.calendarMbaasStatus();
            setCalendarMbaas(s);
        } catch {
            setCalendarMbaas(null);
        } finally {
            setCalendarLoading(false);
        }
    }, []);

    useEffect(() => {
        void refreshCalendarStatus();
    }, [refreshCalendarStatus]);

    const refreshPmStatus = useCallback(async () => {
        setPmLoading(true);
        setPmError(null);
        try {
            const rows = await imApi.integrationsStatus();
            setPmConnections(rows);
            setIntegrations((prev) =>
                prev.map((i) => {
                    if (i.icon === 'asana')
                        return {
                            ...i,
                            isConnected: !!connectionFor(rows, 1)?.connected,
                            category: connectionFor(rows, 1)?.connected ? 'connected' : 'disconnected',
                        };
                    if (i.icon === 'jira')
                        return {
                            ...i,
                            isConnected: !!connectionFor(rows, 2)?.connected,
                            category: connectionFor(rows, 2)?.connected ? 'connected' : 'disconnected',
                        };
                    if (i.icon === 'trello')
                        return {
                            ...i,
                            isConnected: !!connectionFor(rows, 3)?.connected,
                            category: connectionFor(rows, 3)?.connected ? 'connected' : 'disconnected',
                        };
                    return i;
                })
            );
        } catch (e) {
            setPmError(e instanceof Error ? e.message : 'Could not load integrations');
        } finally {
            setPmLoading(false);
        }
    }, []);

    useEffect(() => {
        void refreshPmStatus();
    }, [refreshPmStatus]);

    const openSetupModal = useCallback(async (key: PmKey) => {
        setSetupPlatform(key);
        setSetupSelection('');
        setSetupModalOpen(true);
        setSetupBusy(true);
        try {
            const opts = await imApi.getIntegrationSetup(key);
            setSetupOptions(opts);
            const projectOrBoard = opts.find((o) => o.type === 'project' || o.type === 'board');
            if (projectOrBoard) setSetupSelection(projectOrBoard.id);
            else if (opts.length > 0) setSetupSelection(opts[0].id);
        } catch (e) {
            setPmError(e instanceof Error ? e.message : 'Setup load failed');
            setSetupModalOpen(false);
        } finally {
            setSetupBusy(false);
        }
    }, []);

    useEffect(() => {
        const setup = searchParams.get('setup');
        if (setup !== 'asana' && setup !== 'jira' && setup !== 'trello') return;
        const key = setup as PmKey;
        let cancelled = false;
        void (async () => {
            try {
                await openSetupModal(key);
            } finally {
                if (!cancelled) {
                    setSearchParams((prev) => {
                        const next = new URLSearchParams(prev);
                        if (next.get('setup') === setup) next.delete('setup');
                        return next;
                    }, { replace: true });
                }
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [searchParams, openSetupModal, setSearchParams]);

    useEffect(() => {
        if (searchParams.get('connect') !== 'google-calendar') return;
        window.location.replace('/calendar');
    }, [searchParams]);

    const submitSetup = async () => {
        if (!setupPlatform || !setupSelection) return;
        setSetupBusy(true);
        try {
            if (isClerkConfigured()) {
                await refreshClerkBearerRef.current?.();
                await ensureBackendUserId();
            }
            const body =
                setupPlatform === 'trello'
                    ? { boardId: setupSelection }
                    : { projectId: setupSelection };
            await imApi.postIntegrationSetup(setupPlatform, body);
            setSetupModalOpen(false);
            await refreshPmStatus();
        } catch (e) {
            setPmError(e instanceof Error ? e.message : 'Setup save failed');
        } finally {
            setSetupBusy(false);
        }
    };

    const iconMap: Record<string, React.ReactNode> = {
        slack: <FaSlack />,
        trello: <FaTrello />,
        jira: <SiJira />,
        asana: <SiAsana />,
    };

    const getFilteredIntegrations = () => {
        if (activeFilter === 'connected') {
            return integrations.filter((i) => i.isConnected);
        }
        if (activeFilter === 'disconnected') {
            return integrations.filter((i) => !i.isConnected);
        }
        return integrations;
    };

    const visibleIntegrations = getFilteredIntegrations();

    const startConnect = async (icon: string) => {
        try {
            if (icon === 'trello') {
                window.location.href = imApi.trelloAuthorizeUrl();
                return;
            }
            const uid = await ensureBackendUserId();
            if (icon === 'asana') window.location.href = pmIntegrationAuthUrl('asana', uid);
            else if (icon === 'jira') window.location.href = pmIntegrationAuthUrl('jira', uid);
        } catch (e) {
            setPmError(e instanceof Error ? e.message : 'Could not start OAuth');
        }
    };

    const disconnectPm = async (key: PmKey) => {
        setPmError(null);
        try {
            await imApi.disconnectPmIntegration(key);
            setSetupModalOpen(false);
            await refreshPmStatus();
        } catch (e) {
            setPmError(e instanceof Error ? e.message : 'Disconnect failed');
        }
    };

    const renderPmActions = (integration: Integration) => {
        const c =
            integration.icon === 'asana'
                ? connectionFor(pmConnections, 1)
                : integration.icon === 'jira'
                  ? connectionFor(pmConnections, 2)
                  : integration.icon === 'trello'
                    ? connectionFor(pmConnections, 3)
                    : undefined;
        if (!['asana', 'jira', 'trello'].includes(integration.icon)) return null;

        const key = integration.icon as PmKey;
        return (
            <div className="flex flex-wrap gap-2 mt-2">
                {!c?.connected ? (
                    <button
                        type="button"
                        onClick={() => void startConnect(integration.icon)}
                        className="px-3 py-1.5 rounded-8 bg-primary-500 text-white text-xs font-medium"
                    >
                        Connect
                    </button>
                ) : (
                    <>
                        <span className="text-xs text-emerald-600 font-medium self-center">Connected</span>
                        {c.displayName && (
                            <span className="text-xs text-text-tertiary self-center truncate max-w-[140px]" title={c.displayName}>
                                {c.displayName}
                            </span>
                        )}
                        <button
                            type="button"
                            onClick={() => void openSetupModal(key)}
                            className="px-3 py-1.5 rounded-8 border border-stroke-primary text-xs text-text-primary"
                        >
                            Configure
                        </button>
                        <button
                            type="button"
                            onClick={() => void disconnectPm(key)}
                            className="px-3 py-1.5 rounded-8 border border-stroke-primary text-xs text-red-600"
                        >
                            Disconnect
                        </button>
                    </>
                )}
            </div>
        );
    };

    const renderIntegrationCard = (integration: Integration) => (
        <div
            key={integration.id}
            className="bg-bg-surface-pure border border-stroke-primary rounded-12 shadow-card flex flex-col gap-2 md:gap-3 p-3 md:p-4"
        >
            <div className="flex items-center justify-between">
                <div className="w-8 md:w-10 h-8 md:h-10 flex items-center justify-center text-base md:text-lg text-text-secondary bg-bg-surface-lv2 rounded-8">
                    {iconMap[integration.icon] || integration.name.charAt(0)}
                </div>

                {['asana', 'jira', 'trello'].includes(integration.icon) ? (
                    <span
                        className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-6 ${
                            integration.isConnected ? 'bg-emerald-100 text-emerald-800' : 'bg-bg-surface-lv2 text-text-tertiary'
                        }`}
                    >
                        {integration.isConnected ? 'On' : 'Off'}
                    </span>
                ) : integration.icon === 'slack' ? (
                    <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-6 bg-bg-surface-lv2 text-text-tertiary">
                        Soon
                    </span>
                ) : (
                    <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-6 bg-bg-surface-lv2 text-text-tertiary">
                        —
                    </span>
                )}
            </div>

            <div className="flex flex-col gap-1">
                <h3 className="font-inter font-medium text-sm md:text-base text-text-primary">{integration.name}</h3>
                <p className="text-xs text-text-secondary line-clamp-2">{integration.description}</p>
            </div>

            {renderPmActions(integration)}
        </div>
    );

    return (
        <div className="flex h-[100dvh] max-h-[100dvh] min-h-0 w-full max-w-full bg-bg-surface-lv1 overflow-hidden">
            {isClerkConfigured() ? <ClerkBearerRegistrar register={registerClerkBearerRefresh} /> : null}
            <Sidebar />

            <div className="ml-0 md:ml-[270px] flex-1 flex flex-col min-h-0 h-full overflow-hidden">
                <div className="px-4 md:px-8 mt-4 md:mt-6 max-w-[1106px] mx-auto w-full flex flex-col md:flex-row md:items-center md:justify-between gap-4 shrink-0">
                    <h1 className="text-xl md:text-2xl font-medium text-text-primary">App & Integrations</h1>

                    <div className="flex gap-2 flex-wrap">
                        {(['all', 'connected', 'disconnected'] as const).map((filter) => (
                            <button
                                key={filter}
                                type="button"
                                onClick={() => setActiveFilter(filter)}
                                className={`px-3 py-2 rounded-8 text-xs md:text-sm font-medium transition ${
                                    activeFilter === filter ? 'bg-primary-500 text-white' : 'bg-bg-surface-pure text-text-secondary'
                                }`}
                            >
                                {filter.charAt(0).toUpperCase() + filter.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {pmLoading && (
                    <p className="px-4 md:px-8 max-w-[1106px] mx-auto text-xs text-text-tertiary w-full">Loading integration status…</p>
                )}
                {pmError && (
                    <p className="px-4 md:px-8 max-w-[1106px] mx-auto text-xs text-red-600 w-full">{pmError}</p>
                )}

                <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 md:px-8 py-4 md:py-6 max-w-[1106px] mx-auto w-full space-y-4">
                    <div className="bg-bg-surface-pure border border-stroke-primary rounded-12 shadow-card p-4 md:p-5 flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                            <div className="w-9 h-9 flex items-center justify-center text-text-secondary bg-bg-surface-lv2 rounded-8 text-sm font-semibold">
                                MB
                            </div>
                            <h2 className="font-inter font-medium text-base md:text-lg text-text-primary m-0">Calendar (Meeting BaaS)</h2>
                        </div>
                        {calendarLoading ? (
                            <p className="text-xs text-text-tertiary m-0">Loading calendar status…</p>
                        ) : calendarMbaas?.isConnected ? (
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-wrap">
                                <p className="text-sm text-text-secondary m-0">
                                    Connected{calendarMbaas.provider ? ` to ${calendarMbaas.provider}` : ''}.
                                </p>
                                <Link
                                    to="/calendar"
                                    className="inline-flex px-3 py-1.5 rounded-8 bg-primary-500 text-white text-xs font-medium w-fit"
                                >
                                    Open Calendar
                                </Link>
                            </div>
                        ) : (
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-wrap">
                                <p className="text-sm text-text-secondary m-0">Not connected.</p>
                                <Link
                                    to="/calendar"
                                    className="inline-flex px-3 py-1.5 rounded-8 bg-primary-500 text-white text-xs font-medium w-fit"
                                >
                                    Connect calendar
                                </Link>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
                        {visibleIntegrations.map(renderIntegrationCard)}
                    </div>
                </div>
            </div>

            {setupModalOpen && setupPlatform && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 px-4" role="dialog">
                    <div className="bg-bg-surface-pure border border-stroke-primary rounded-12 max-w-md w-full p-5 shadow-lg">
                        <h2 className="text-lg font-medium text-text-primary m-0 mb-3 capitalize">Choose {setupPlatform} target</h2>
                        <p className="text-xs text-text-secondary m-0 mb-3">
                            Pick the default project or board IntelliMeet uses when pushing action items.
                        </p>
                        {setupBusy && !setupOptions.length ? (
                            <p className="text-sm text-text-tertiary">Loading options…</p>
                        ) : (
                            <select
                                value={setupSelection}
                                onChange={(e) => setSetupSelection(e.target.value)}
                                className="w-full border border-stroke-primary rounded-8 px-3 py-2 text-sm bg-bg-surface-lv1 mb-4"
                            >
                                {setupOptions.map((o) => (
                                    <option key={`${o.type}:${o.id}`} value={o.id}>
                                        [{o.type}] {o.name}
                                    </option>
                                ))}
                            </select>
                        )}
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setSetupModalOpen(false)}
                                className="px-4 py-2 rounded-8 text-sm border border-stroke-primary"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={setupBusy || !setupSelection}
                                onClick={() => void submitSetup()}
                                className="px-4 py-2 rounded-8 text-sm bg-primary-500 text-white disabled:opacity-50"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AppIntegrations;
