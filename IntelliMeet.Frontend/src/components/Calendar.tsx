import React, { useState, useEffect, useCallback, useMemo } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import Sidebar from './Sidebar';
import MobileMenuButton from './MobileMenuButton';
import SearchBar from './SearchBar';
import {
    imApi,
    type GoogleAuthConfig,
    type RawCalendarItem,
    type CalendarConnection,
    type CalendarEventDto,
} from '../api/intellimeet';
import { getGoogleRefreshToken, getGoogleEmail, clearGoogleSession } from '../lib/googleSession';
import { buildGoogleCalendarTemplateUrl } from '../lib/googleCalendarLink';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

const CAL_CONN_STORAGE = 'intellimeet.calendarConnectionId';

type MainTab = 'events' | 'schedule';

function pickersTextFieldSx() {
    return {
        '& .MuiInputBase-root': { height: 42, fontSize: '0.875rem', borderRadius: '10px' },
        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--stroke-secondary)' },
        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--stroke-secondary)' },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#16a34a', borderWidth: 1 },
    } as const;
}

function platformLabel(url?: string | null): string {
    if (!url) return 'No link';
    const u = url.toLowerCase();
    if (u.includes('meet.google')) return 'Google Meet';
    if (u.includes('zoom.us')) return 'Zoom';
    if (u.includes('teams.microsoft') || u.includes('teams.live')) return 'Microsoft Teams';
    return 'Video call';
}

const Calendar: React.FC = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [googleCfg, setGoogleCfg] = useState<GoogleAuthConfig | null>(null);
    const [rawCalendars, setRawCalendars] = useState<RawCalendarItem[]>([]);
    const [selectedRawId, setSelectedRawId] = useState('');
    const [connections, setConnections] = useState<CalendarConnection[]>([]);
    const [selectedConnectionId, setSelectedConnectionId] = useState('');
    const [events, setEvents] = useState<CalendarEventDto[]>([]);
    const [toast, setToast] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
    const [busy, setBusy] = useState(false);
    const [mainTab, setMainTab] = useState<MainTab>('events');
    const [viewMonth, setViewMonth] = useState(() => dayjs());
    const [selectedDay, setSelectedDay] = useState(() => dayjs().startOf('day'));

    const [scheduleTitle, setScheduleTitle] = useState('');
    const [scheduleDesc, setScheduleDesc] = useState('');
    const [meetingUrl, setMeetingUrl] = useState('');
    const [scheduleDate, setScheduleDate] = useState<Dayjs | null>(dayjs());
    const [scheduleTime, setScheduleTime] = useState<Dayjs | null>(dayjs().add(1, 'hour').minute(0));
    const [durationMin, setDurationMin] = useState(30);
    const [joinNowBusy, setJoinNowBusy] = useState(false);

    const showToast = useCallback((type: 'ok' | 'err', text: string) => {
        setToast({ type, text });
        window.setTimeout(() => setToast(null), 5200);
    }, []);

    const refreshConnections = useCallback(async () => {
        try {
            const conns = await imApi.listCalendarConnections();
            setConnections(conns);
            return conns;
        } catch (e) {
            showToast('err', e instanceof Error ? e.message : 'Could not load connections');
            return [];
        }
    }, [showToast]);

    useEffect(() => {
        (async () => {
            try {
                const cfg = await imApi.googleAuthConfig();
                setGoogleCfg(cfg);
            } catch {
                setGoogleCfg(null);
            }
            const conns = await refreshConnections();
            const saved = sessionStorage.getItem(CAL_CONN_STORAGE);
            if (saved && conns.some((c) => c.id === saved)) setSelectedConnectionId(saved);
            else if (conns.length === 1) setSelectedConnectionId(conns[0].id);
        })();
    }, [refreshConnections]);

    useEffect(() => {
        if (selectedConnectionId) sessionStorage.setItem(CAL_CONN_STORAGE, selectedConnectionId);
        else sessionStorage.removeItem(CAL_CONN_STORAGE);
    }, [selectedConnectionId]);

    useEffect(() => {
        if (!selectedConnectionId) {
            setEvents([]);
            return;
        }
        (async () => {
            try {
                const ev = await imApi.listCalendarEvents(selectedConnectionId);
                setEvents(ev);
            } catch {
                setEvents([]);
                showToast('err', 'Could not load calendar events. Try Sync.');
            }
        })();
    }, [selectedConnectionId, showToast]);

    const activeConn = useMemo(
        () => connections.find((c) => c.id === selectedConnectionId),
        [connections, selectedConnectionId]
    );

    const eventsForSelectedDay = useMemo(() => {
        const d = selectedDay.format('YYYY-MM-DD');
        return events.filter((ev) => dayjs(ev.startUtc).format('YYYY-MM-DD') === d);
    }, [events, selectedDay]);

    const monthCells = useMemo(() => {
        const start = viewMonth.startOf('month');
        const dim = viewMonth.daysInMonth();
        const lead = start.day();
        const cells: { label: string | number; date: Dayjs | null }[] = [];
        for (let i = 0; i < lead; i++) cells.push({ label: '', date: null });
        for (let day = 1; day <= dim; day++) {
            const date = start.date(day);
            cells.push({ label: day, date });
        }
        while (cells.length % 7 !== 0) cells.push({ label: '', date: null });
        return cells;
    }, [viewMonth]);

    const eventCountByDay = useMemo(() => {
        const map = new Map<string, number>();
        for (const ev of events) {
            const k = dayjs(ev.startUtc).format('YYYY-MM-DD');
            map.set(k, (map.get(k) ?? 0) + 1);
        }
        return map;
    }, [events]);

    const scheduleValidForGcal = Boolean(scheduleTitle.trim() && scheduleDate && scheduleTime);
    const meetingUrlOk = meetingUrl.trim().length > 8 && /^https?:\/\//i.test(meetingUrl.trim());

    const openGoogleComposer = () => {
        if (!scheduleDate || !scheduleTime || !scheduleTitle.trim()) return;
        const start = scheduleDate.hour(scheduleTime.hour()).minute(scheduleTime.minute()).second(0);
        const end = start.add(durationMin, 'minute');
        const linkLine = meetingUrlOk ? `Join video: ${meetingUrl.trim()}` : 'Add a Google Meet, Zoom, or Teams link in the event so the notetaker can join.';
        const details = [
            scheduleDesc.trim(),
            '',
            linkLine,
            '',
            'After saving in Google Calendar, return here and tap Sync so Meeting BaaS can see this event. Then use “Schedule notetaker” on the event row.',
        ]
            .filter(Boolean)
            .join('\n');
        const url = buildGoogleCalendarTemplateUrl({
            title: scheduleTitle.trim(),
            start,
            end,
            details,
        });
        window.open(url, '_blank', 'noopener,noreferrer');
        showToast(
            'ok',
            'Google Calendar opened. Save the event, then sync here and schedule the notetaker on the event.'
        );
    };

    const inviteBotNow = async () => {
        if (!meetingUrl.trim()) return;
        setJoinNowBusy(true);
        try {
            await imApi.joinBot(meetingUrl.trim(), 'IntelliMeet Notetaker');
            showToast('ok', 'Notetaker bot is joining (Meeting BaaS v2). Check My Meetings for status.');
            setMeetingUrl('');
        } catch (e) {
            showToast('err', e instanceof Error ? e.message : 'Could not start bot');
        } finally {
            setJoinNowBusy(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-bg-surface-lv1">
            <MobileMenuButton isOpen={isMobileMenuOpen} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
            <Sidebar isMobileOpen={isMobileMenuOpen} onMobileClose={() => setIsMobileMenuOpen(false)} />

            <main className="flex-1 flex flex-col min-h-screen ml-0 md:ml-[270px] transition-all duration-300">
                <div className="bg-bg-surface-pure/90 backdrop-blur-md border-b border-stroke-primary h-14 flex items-center px-4 sm:px-7 shrink-0 z-10">
                    <SearchBar placeholder="Search calendar & events…" className="sm:w-72 max-w-full" />
                </div>

                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-8 flex flex-col gap-6">
                        {toast && (
                            <div
                                role="status"
                                className={`rounded-12 border px-4 py-3 text-sm font-inter shadow-sm ${
                                    toast.type === 'ok'
                                        ? 'bg-primary-50 border-primary-100 text-text-primary'
                                        : 'bg-orange-50 border-orange-100 text-text-primary'
                                }`}
                            >
                                {toast.text}
                            </div>
                        )}

                        <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                            <div>
                                <p className="text-xs font-inter font-medium uppercase tracking-wider text-text-tertiary mb-1">
                                    Meeting BaaS · Calendars v2
                                </p>
                                <h1 className="font-inter-tight font-medium text-2xl sm:text-3xl text-text-primary tracking-tight m-0">
                                    Calendar
                                </h1>
                                <p className="text-sm text-text-secondary font-inter mt-2 max-w-xl m-0">
                                    Link Google Calendar, sync events from Meeting BaaS, schedule the notetaker per event, or
                                    drop a meeting URL to invite the bot immediately.
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() => void refreshConnections().then((c) => showToast('ok', `${c.length} connection(s) loaded`))}
                                    className="px-4 py-2 rounded-10 text-sm font-inter font-medium border border-stroke-secondary bg-bg-surface-pure text-text-primary hover:bg-bg-surface-lv1 transition-colors"
                                >
                                    Refresh connections
                                </button>
                            </div>
                        </header>

                        <section className="grid grid-cols-1 xl:grid-cols-5 gap-6">
                            <div className="xl:col-span-2 flex flex-col gap-4">
                                <div className="rounded-16 border border-stroke-primary bg-bg-surface-pure p-5 shadow-[0_1px_3px_rgba(6,27,22,0.06)]">
                                    <h2 className="font-inter font-semibold text-base text-text-primary m-0 mb-1">
                                        Connection
                                    </h2>
                                    <p className="text-xs text-text-secondary font-inter m-0 mb-4">
                                        Uses{' '}
                                        <code className="text-[11px] bg-bg-surface-lv1 px-1 rounded">POST /v2/calendars</code>{' '}
                                        via your backend. Redirect:{' '}
                                        <code className="text-[11px] bg-bg-surface-lv1 px-1 rounded break-all">
                                            http://localhost:5173/oauth/google/callback
                                        </code>
                                    </p>

                                    <div className="flex flex-col gap-3">
                                        {googleCfg?.clientId ? (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    window.location.href = googleCfg.authorizeUrl;
                                                }}
                                                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-10 border border-stroke-secondary bg-bg-surface-pure font-inter font-medium text-sm text-text-primary hover:bg-bg-surface-lv1 transition-colors"
                                            >
                                                <span className="text-lg leading-none">G</span>
                                                Sign in with Google
                                            </button>
                                        ) : (
                                            <p className="text-xs text-amber-800 font-inter m-0">Google OAuth is not configured on the API.</p>
                                        )}

                                        <div className="flex items-center justify-between text-xs font-inter text-text-secondary">
                                            <span className="truncate">
                                                {getGoogleEmail() || getGoogleRefreshToken()
                                                    ? `Signed in: ${getGoogleEmail() || 'token stored'}`
                                                    : 'No Google session in this browser'}
                                            </span>
                                            <button
                                                type="button"
                                                className="text-primary-500 underline shrink-0 ml-2"
                                                onClick={() => {
                                                    clearGoogleSession();
                                                    showToast('ok', 'Browser Google session cleared');
                                                }}
                                            >
                                                Clear
                                            </button>
                                        </div>

                                        <button
                                            type="button"
                                            disabled={busy || !getGoogleRefreshToken()}
                                            onClick={async () => {
                                                const rt = getGoogleRefreshToken();
                                                if (!rt) return;
                                                setBusy(true);
                                                try {
                                                    const list = await imApi.listRawCalendars(rt);
                                                    setRawCalendars(list);
                                                    const primary = list.find((c) => c.isPrimary);
                                                    setSelectedRawId(primary?.id || list[0]?.id || '');
                                                    showToast('ok', `Found ${list.length} Google calendar(s)`);
                                                } catch (e) {
                                                    showToast('err', e instanceof Error ? e.message : 'List calendars failed');
                                                } finally {
                                                    setBusy(false);
                                                }
                                            }}
                                            className="py-2.5 rounded-10 text-sm font-inter font-medium bg-[#f0f4f3] text-text-primary disabled:opacity-50 hover:opacity-90 transition-opacity"
                                        >
                                            List calendars from Google
                                        </button>

                                        <select
                                            className="w-full border border-stroke-secondary rounded-10 px-3 py-2.5 text-sm font-inter bg-bg-surface-pure text-text-primary"
                                            value={selectedRawId}
                                            onChange={(e) => setSelectedRawId(e.target.value)}
                                        >
                                            <option value="">Choose a calendar…</option>
                                            {rawCalendars.map((c) => (
                                                <option key={c.id} value={c.id}>
                                                    {c.name} · {c.email}
                                                </option>
                                            ))}
                                        </select>

                                        <button
                                            type="button"
                                            disabled={busy || !getGoogleRefreshToken() || !selectedRawId}
                                            onClick={async () => {
                                                const rt = getGoogleRefreshToken();
                                                if (!rt || !selectedRawId) return;
                                                setBusy(true);
                                                try {
                                                    const conn = await imApi.connectCalendar(rt, selectedRawId);
                                                    await refreshConnections();
                                                    setSelectedConnectionId(conn.id);
                                                    showToast('ok', 'Linked to Meeting BaaS. Syncing…');
                                                } catch (e) {
                                                    await refreshConnections();
                                                    showToast('err', e instanceof Error ? e.message : 'Connect failed');
                                                } finally {
                                                    setBusy(false);
                                                }
                                            }}
                                            className="py-2.5 rounded-10 text-sm font-inter font-semibold text-white bg-primary-500 hover:opacity-95 disabled:opacity-50 transition-opacity"
                                        >
                                            Link calendar to Meeting BaaS
                                        </button>

                                        <div className="pt-2 border-t border-stroke-primary">
                                            <label className="text-xs font-inter font-medium text-text-secondary block mb-1.5">
                                                Active Meeting BaaS calendar
                                            </label>
                                            <div className="flex gap-2 flex-col sm:flex-row">
                                                <select
                                                    className="flex-1 border border-stroke-secondary rounded-10 px-3 py-2.5 text-sm font-inter bg-bg-surface-pure"
                                                    value={selectedConnectionId}
                                                    onChange={(e) => setSelectedConnectionId(e.target.value)}
                                                >
                                                    <option value="">Select…</option>
                                                    {connections.map((c) => (
                                                        <option key={c.id} value={c.id}>
                                                            {(c.accountEmail || c.externalCalendarId.slice(0, 12)) + '…'} · {c.status}
                                                        </option>
                                                    ))}
                                                </select>
                                                <button
                                                    type="button"
                                                    disabled={busy || !selectedConnectionId}
                                                    onClick={async () => {
                                                        setBusy(true);
                                                        try {
                                                            await imApi.syncCalendar(selectedConnectionId);
                                                            const ev = await imApi.listCalendarEvents(selectedConnectionId);
                                                            setEvents(ev);
                                                            showToast('ok', 'Synced with Meeting BaaS');
                                                        } catch (e) {
                                                            showToast('err', e instanceof Error ? e.message : 'Sync failed');
                                                        } finally {
                                                            setBusy(false);
                                                        }
                                                    }}
                                                    className="px-4 py-2.5 rounded-10 border border-stroke-secondary text-sm font-inter font-medium whitespace-nowrap disabled:opacity-50 hover:bg-bg-surface-lv1"
                                                >
                                                    Sync now
                                                </button>
                                            </div>
                                            {activeConn?.lastSyncedAt && (
                                                <p className="text-[11px] text-text-tertiary font-inter mt-2 m-0">
                                                    Last sync: {new Date(activeConn.lastSyncedAt).toLocaleString()}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-16 border border-stroke-primary bg-gradient-to-br from-bg-surface-pure to-primary-50/40 p-5">
                                    <h3 className="font-inter font-semibold text-sm text-text-primary m-0 mb-2">How it maps to API v2</h3>
                                    <ul className="text-xs text-text-secondary font-inter space-y-2 m-0 pl-4 list-disc">
                                        <li>
                                            <code className="text-[11px]">list-raw</code> → calendars visible for your OAuth token
                                        </li>
                                        <li>
                                            <code className="text-[11px]">POST /v2/calendars</code> → persistent connection
                                        </li>
                                        <li>
                                            <code className="text-[11px]">POST …/sync</code> then <code className="text-[11px]">GET …/events</code>
                                        </li>
                                        <li>
                                            Notetaker: <code className="text-[11px]">schedule-bot</code> on an event (needs video link), or{' '}
                                            <code className="text-[11px]">POST /v2/bots</code> for live URL
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <div className="xl:col-span-3 flex flex-col gap-4 min-h-[480px]">
                                <div className="flex p-1 rounded-12 bg-bg-surface-lv1 border border-stroke-primary w-fit">
                                    {(
                                        [
                                            ['events', 'Agenda'],
                                            ['schedule', 'New meeting'],
                                        ] as const
                                    ).map(([id, label]) => (
                                        <button
                                            key={id}
                                            type="button"
                                            onClick={() => setMainTab(id)}
                                            className={`px-4 py-2 rounded-10 text-sm font-inter font-medium transition-all ${
                                                mainTab === id
                                                    ? 'bg-bg-surface-pure text-text-primary shadow-sm'
                                                    : 'text-text-secondary hover:text-text-primary'
                                            }`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>

                                {mainTab === 'events' && (
                                    <div className="rounded-16 border border-stroke-primary bg-bg-surface-pure overflow-hidden shadow-[0_1px_3px_rgba(6,27,22,0.06)] flex flex-col flex-1">
                                        <div className="p-4 sm:p-5 border-b border-stroke-primary flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div>
                                                <h2 className="font-inter font-semibold text-lg text-text-primary m-0">Agenda</h2>
                                                <p className="text-xs text-text-secondary font-inter m-0 mt-1">
                                                    Events from Meeting BaaS. Each row can attach a scheduled bot (notetaker).
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    aria-label="Previous month"
                                                    className="w-9 h-9 rounded-10 border border-stroke-secondary flex items-center justify-center hover:bg-bg-surface-lv1 text-text-secondary"
                                                    onClick={() => {
                                                        setViewMonth((m) => m.subtract(1, 'month'));
                                                    }}
                                                >
                                                    ‹
                                                </button>
                                                <span className="font-inter font-medium text-sm text-text-primary min-w-[140px] text-center">
                                                    {viewMonth.format('MMMM YYYY')}
                                                </span>
                                                <button
                                                    type="button"
                                                    aria-label="Next month"
                                                    className="w-9 h-9 rounded-10 border border-stroke-secondary flex items-center justify-center hover:bg-bg-surface-lv1 text-text-secondary"
                                                    onClick={() => setViewMonth((m) => m.add(1, 'month'))}
                                                >
                                                    ›
                                                </button>
                                            </div>
                                        </div>

                                        <div className="p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            <div>
                                                <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-inter font-medium text-text-tertiary mb-2">
                                                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                                                        <div key={d}>{d}</div>
                                                    ))}
                                                </div>
                                                <div className="grid grid-cols-7 gap-1">
                                                    {monthCells.map((cell, idx) => {
                                                        if (!cell.date) {
                                                            return <div key={`e-${idx}`} className="aspect-square" />;
                                                        }
                                                        const key = cell.date.format('YYYY-MM-DD');
                                                        const count = eventCountByDay.get(key) ?? 0;
                                                        const isSel = selectedDay.isSame(cell.date, 'day');
                                                        return (
                                                            <button
                                                                key={key}
                                                                type="button"
                                                                onClick={() => setSelectedDay(cell.date!.startOf('day'))}
                                                                className={`aspect-square rounded-10 text-sm font-inter font-medium transition-all relative flex flex-col items-center justify-center ${
                                                                    isSel
                                                                        ? 'bg-primary-500 text-white shadow-md'
                                                                        : 'hover:bg-bg-surface-lv1 text-text-primary border border-transparent'
                                                                }`}
                                                            >
                                                                <span>{cell.label}</span>
                                                                {count > 0 && (
                                                                    <span
                                                                        className={`absolute bottom-1 w-1 h-1 rounded-full ${
                                                                            isSel ? 'bg-white' : 'bg-primary-500'
                                                                        }`}
                                                                    />
                                                                )}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            <div className="flex flex-col min-h-[280px]">
                                                <h3 className="font-inter font-medium text-sm text-text-primary m-0 mb-3">
                                                    {selectedDay.format('dddd, MMM D')}
                                                </h3>
                                                {!selectedConnectionId ? (
                                                    <p className="text-sm text-text-secondary font-inter m-0">
                                                        Link a calendar to see synced events.
                                                    </p>
                                                ) : eventsForSelectedDay.length === 0 ? (
                                                    <p className="text-sm text-text-secondary font-inter m-0">
                                                        No events this day. Use Sync after adding meetings in Google Calendar.
                                                    </p>
                                                ) : (
                                                    <ul className="flex flex-col gap-2 overflow-y-auto max-h-[360px] pr-1">
                                                        {eventsForSelectedDay.map((ev) => (
                                                            <li
                                                                key={ev.id}
                                                                className="rounded-12 border border-stroke-primary p-3 bg-bg-surface-lv1/50 hover:bg-bg-surface-lv1 transition-colors"
                                                            >
                                                                <div className="flex justify-between gap-2 items-start">
                                                                    <div className="min-w-0">
                                                                        <p className="font-inter font-semibold text-sm text-text-primary m-0 truncate">
                                                                            {ev.title}
                                                                        </p>
                                                                        <p className="text-xs text-text-secondary font-inter m-0 mt-0.5">
                                                                            {dayjs(ev.startUtc).format('HH:mm')} –{' '}
                                                                            {dayjs(ev.endUtc).format('HH:mm')} ·{' '}
                                                                            {platformLabel(ev.meetingUrl)}
                                                                        </p>
                                                                        {ev.isCancelled && (
                                                                            <span className="text-[11px] text-orange-600 font-inter">Cancelled</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="flex flex-wrap gap-2 mt-3">
                                                                    {ev.meetingUrl ? (
                                                                        <>
                                                                            <a
                                                                                href={ev.meetingUrl}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="text-xs font-inter font-medium text-primary-500 hover:underline"
                                                                            >
                                                                                Open meeting
                                                                            </a>
                                                                            <button
                                                                                type="button"
                                                                                className="text-xs font-inter text-text-secondary hover:text-text-primary underline"
                                                                                onClick={() => {
                                                                                    void navigator.clipboard.writeText(ev.meetingUrl!);
                                                                                    showToast('ok', 'Link copied');
                                                                                }}
                                                                            >
                                                                                Copy link
                                                                            </button>
                                                                        </>
                                                                    ) : (
                                                                        <span className="text-xs text-text-tertiary font-inter">
                                                                            Add a Meet/Zoom/Teams link in Google Calendar, then Sync.
                                                                        </span>
                                                                    )}
                                                                    <button
                                                                        type="button"
                                                                        disabled={busy || !selectedConnectionId || ev.isCancelled || !ev.meetingUrl}
                                                                        onClick={async () => {
                                                                            setBusy(true);
                                                                            try {
                                                                                await imApi.scheduleCalendarBot(
                                                                                    selectedConnectionId,
                                                                                    ev.externalEventId,
                                                                                    'IntelliMeet Notetaker'
                                                                                );
                                                                                const list = await imApi.listCalendarEvents(selectedConnectionId);
                                                                                setEvents(list);
                                                                                showToast('ok', 'Notetaker scheduled for this event');
                                                                            } catch (e) {
                                                                                showToast('err', e instanceof Error ? e.message : 'Schedule failed');
                                                                            } finally {
                                                                                setBusy(false);
                                                                            }
                                                                        }}
                                                                        className="text-xs font-inter font-semibold px-2 py-1 rounded-8 bg-primary-500 text-white disabled:opacity-40 hover:opacity-95"
                                                                    >
                                                                        Schedule notetaker
                                                                    </button>
                                                                    {ev.linkedMeetingId && (
                                                                        <span className="text-[11px] text-text-tertiary font-inter self-center">
                                                                            Linked in app
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {mainTab === 'schedule' && (
                                    <div className="rounded-16 border border-stroke-primary bg-bg-surface-pure p-5 sm:p-6 shadow-[0_1px_3px_rgba(6,27,22,0.06)]">
                                        <h2 className="font-inter font-semibold text-lg text-text-primary m-0 mb-1">
                                            Plan a meeting
                                        </h2>
                                        <p className="text-sm text-text-secondary font-inter m-0 mb-6">
                                            Build the event locally, open Google Calendar with one click, then sync on the left. Or send a
                                            notetaker to a live link right away (
                                            <code className="text-xs bg-bg-surface-lv1 px-1 rounded">POST /v2/bots</code>).
                                        </p>

                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <div className="flex flex-col gap-4 max-w-xl">
                                                <div>
                                                    <label className="block text-xs font-inter font-medium text-text-secondary mb-1.5">
                                                        Title
                                                    </label>
                                                    <input
                                                        value={scheduleTitle}
                                                        onChange={(e) => setScheduleTitle(e.target.value)}
                                                        placeholder="e.g. Q2 planning"
                                                        className="w-full px-3 py-2.5 rounded-10 border border-stroke-secondary text-sm font-inter text-text-primary placeholder:text-text-disable outline-none focus:ring-2 focus:ring-primary-500/25 focus:border-primary-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-inter font-medium text-text-secondary mb-1.5">
                                                        Video link (required for notetaker)
                                                    </label>
                                                    <input
                                                        value={meetingUrl}
                                                        onChange={(e) => setMeetingUrl(e.target.value)}
                                                        placeholder="https://meet.google.com/xxx-xxxx-xxx"
                                                        className="w-full px-3 py-2.5 rounded-10 border border-stroke-secondary text-sm font-inter text-text-primary placeholder:text-text-disable outline-none focus:ring-2 focus:ring-primary-500/25 focus:border-primary-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-inter font-medium text-text-secondary mb-1.5">
                                                        Notes for invite description
                                                    </label>
                                                    <textarea
                                                        value={scheduleDesc}
                                                        onChange={(e) => setScheduleDesc(e.target.value)}
                                                        rows={3}
                                                        placeholder="Agenda, context, attachments…"
                                                        className="w-full px-3 py-2.5 rounded-10 border border-stroke-secondary text-sm font-inter text-text-primary placeholder:text-text-disable outline-none focus:ring-2 focus:ring-primary-500/25 focus:border-primary-500 resize-y min-h-[80px]"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-inter font-medium text-text-secondary mb-1.5">
                                                            Date
                                                        </label>
                                                        <DatePicker
                                                            value={scheduleDate}
                                                            onChange={(v) => setScheduleDate(v)}
                                                            disablePast
                                                            slotProps={{ textField: { size: 'small', fullWidth: true, sx: pickersTextFieldSx() } }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-inter font-medium text-text-secondary mb-1.5">
                                                            Time
                                                        </label>
                                                        <TimePicker
                                                            value={scheduleTime}
                                                            onChange={(v) => setScheduleTime(v)}
                                                            slotProps={{ textField: { size: 'small', fullWidth: true, sx: pickersTextFieldSx() } }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-inter font-medium text-text-secondary mb-1.5">
                                                            Duration
                                                        </label>
                                                        <select
                                                            value={durationMin}
                                                            onChange={(e) => setDurationMin(Number(e.target.value))}
                                                            className="w-full px-3 py-2 rounded-10 border border-stroke-secondary text-sm font-inter h-[42px] bg-bg-surface-pure text-text-primary"
                                                        >
                                                            <option value={15}>15 min</option>
                                                            <option value={30}>30 min</option>
                                                            <option value={45}>45 min</option>
                                                            <option value={60}>1 hour</option>
                                                            <option value={90}>1.5 hours</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                                    <button
                                                        type="button"
                                                        disabled={!scheduleValidForGcal}
                                                        onClick={openGoogleComposer}
                                                        className="flex-1 py-3 rounded-12 font-inter font-semibold text-sm text-white bg-primary-500 disabled:opacity-40 hover:opacity-95 transition-opacity"
                                                    >
                                                        Open Google Calendar
                                                    </button>
                                                    <button
                                                        type="button"
                                                        disabled={joinNowBusy || !meetingUrlOk}
                                                        onClick={() => void inviteBotNow()}
                                                        className="flex-1 py-3 rounded-12 font-inter font-semibold text-sm border-2 border-primary-500 text-primary-500 bg-bg-surface-pure disabled:opacity-40 hover:bg-primary-50/50 transition-colors"
                                                    >
                                                        {joinNowBusy ? 'Sending…' : 'Invite notetaker now'}
                                                    </button>
                                                </div>
                                                {!meetingUrlOk && (
                                                    <p className="text-xs text-text-tertiary font-inter m-0">
                                                        Paste an https meeting link to use “Invite notetaker now” (
                                                        <code className="text-[10px]">POST /v2/bots</code>). You can still create the calendar event first.
                                                    </p>
                                                )}
                                            </div>
                                        </LocalizationProvider>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Calendar;
