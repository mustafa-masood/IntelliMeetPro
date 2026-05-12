import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import Sidebar from './Sidebar';
import MobileMenuButton from './MobileMenuButton';
import SearchBar from './SearchBar';
import {
    ensureBackendUserId,
    googleCalendarConnectUrl,
    imApi,
    type CalendarMeetingListItem,
    type CalendarMbaasStatus,
    type RawCalendarItem,
} from '../api/intellimeet';
import { getGoogleRefreshToken } from '../lib/googleSession';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import type { Dayjs } from 'dayjs';

function pickersTextFieldSx() {
    return {
        '& .MuiInputBase-root': { height: 42, fontSize: '0.875rem', borderRadius: '10px' },
        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--stroke-secondary)' },
        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--stroke-secondary)' },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#16a34a', borderWidth: 1 },
    } as const;
}

/** Earliest selectable start: a few minutes from now (aligns with backend scheduled-bot threshold). */
function nextScheduleSlot(): Dayjs {
    return dayjs().add(5, 'minute').second(0).millisecond(0);
}

const Calendar: React.FC = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [upcoming, setUpcoming] = useState<CalendarMeetingListItem[]>([]);
    const [past, setPast] = useState<CalendarMeetingListItem[]>([]);
    const [toast, setToast] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
    const [busy, setBusy] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [scheduleTitle, setScheduleTitle] = useState('');
    const [scheduleDate, setScheduleDate] = useState<Dayjs | null>(() => nextScheduleSlot());
    const [scheduleTime, setScheduleTime] = useState<Dayjs | null>(() => nextScheduleSlot());
    const [durationMin, setDurationMin] = useState(30);
    const [attendeesInput, setAttendeesInput] = useState('');
    const [mbaasStatus, setMbaasStatus] = useState<CalendarMbaasStatus | null>(null);
    const [mbaasLoading, setMbaasLoading] = useState(true);
    const [rawCalendars, setRawCalendars] = useState<RawCalendarItem[]>([]);
    const [selectedRawId, setSelectedRawId] = useState('');
    const [connectBusy, setConnectBusy] = useState(false);

    const showToast = (type: 'ok' | 'err', text: string) => {
        setToast({ type, text });
        window.setTimeout(() => setToast(null), 5200);
    };

    const refreshLists = async () => {
        setBusy(true);
        try {
            const [u, p] = await Promise.all([
                imApi.listUpcomingCalendarMeetings(),
                imApi.listPastCalendarMeetings(),
            ]);
            setUpcoming(u);
            setPast(p);
        } catch (e) {
            showToast('err', e instanceof Error ? e.message : 'Could not load calendar meetings');
        } finally {
            setBusy(false);
        }
    };

    useEffect(() => {
        void refreshLists();
    }, []);

    const refreshMbaasStatus = async () => {
        setMbaasLoading(true);
        try {
            const s = await imApi.calendarMbaasStatus();
            setMbaasStatus(s);
        } catch {
            setMbaasStatus(null);
        } finally {
            setMbaasLoading(false);
        }
    };

    useEffect(() => {
        void refreshMbaasStatus();
    }, []);

    const loadRawCalendars = async () => {
        const rt = getGoogleRefreshToken();
        if (!rt) {
            showToast('err', 'Use “Sign in with Google” first, then load calendars.');
            return;
        }
        setConnectBusy(true);
        try {
            const list = await imApi.listRawCalendars(rt);
            setRawCalendars(list);
            const primary = list.find((x) => x.isPrimary);
            setSelectedRawId(primary?.id ?? list[0]?.id ?? '');
            if (list.length === 0) showToast('err', 'No calendars returned.');
            else showToast('ok', 'Pick a calendar and click Link.');
        } catch (e) {
            showToast('err', e instanceof Error ? e.message : 'Could not list calendars');
        } finally {
            setConnectBusy(false);
        }
    };

    const linkCalendar = async () => {
        const rt = getGoogleRefreshToken();
        if (!rt || !selectedRawId) return;
        setConnectBusy(true);
        try {
            const row = rawCalendars.find((r) => r.id === selectedRawId);
            await imApi.connectCalendar(rt, selectedRawId, row?.email ?? null);
            showToast('ok', 'Calendar linked. Meeting BaaS will sync events.');
            setRawCalendars([]);
            await refreshMbaasStatus();
            await refreshLists();
        } catch (e) {
            showToast('err', e instanceof Error ? e.message : 'Link failed');
        } finally {
            setConnectBusy(false);
        }
    };

    const unlinkCalendar = async () => {
        if (!mbaasStatus?.localConnectionId) {
            showToast('err', 'No local connection id. Try refreshing.');
            return;
        }
        setConnectBusy(true);
        try {
            await imApi.disconnectCalendar(mbaasStatus.localConnectionId);
            showToast('ok', 'Calendar disconnected.');
            setRawCalendars([]);
            await refreshMbaasStatus();
            await refreshLists();
        } catch (e) {
            showToast('err', e instanceof Error ? e.message : 'Disconnect failed');
        } finally {
            setConnectBusy(false);
        }
    };

    const scheduleValid = Boolean(scheduleTitle.trim() && scheduleDate && scheduleTime);

    const createMeeting = async () => {
        if (!scheduleDate || !scheduleTime || !scheduleTitle.trim()) return;
        const start = scheduleDate.hour(scheduleTime.hour()).minute(scheduleTime.minute()).second(0);
        const end = start.add(durationMin, 'minute');
        const attendees = attendeesInput
            .split(/[,\n;]/g)
            .map((x) => x.trim())
            .filter(Boolean);
        setBusy(true);
        try {
            const res = await imApi.createMeetingFromUi({
                title: scheduleTitle.trim(),
                startUtc: start.toDate().toISOString(),
                endUtc: end.toDate().toISOString(),
                attendees,
                provider: 'google',
            });
            showToast('ok', `Meeting created: ${res.meetingUrl}. Bot scheduled.`);
            setIsModalOpen(false);
            setScheduleTitle('');
            setAttendeesInput('');
            await refreshLists();
        } catch (e) {
            const msg = e instanceof Error ? e.message : 'Create meeting failed';
            showToast('err', msg);
            if (msg.includes('Google calendar is not connected for this user')) {
                window.location.href = '/deferred/app-integrations?connect=google-calendar';
            }
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="flex h-dvh max-h-dvh min-h-0 w-full max-w-full bg-bg-surface-lv1 overflow-hidden">
            <MobileMenuButton isOpen={isMobileMenuOpen} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
            <Sidebar isMobileOpen={isMobileMenuOpen} onMobileClose={() => setIsMobileMenuOpen(false)} />

            <main className="flex-1 flex flex-col min-h-0 h-full overflow-hidden ml-0 md:ml-[270px] transition-all duration-300">
                <div className="bg-bg-surface-pure/90 backdrop-blur-md border-b border-stroke-primary h-14 flex items-center px-4 sm:px-7 shrink-0 z-10">
                    <SearchBar placeholder="Search calendar & events…" className="sm:w-72 max-w-full" />
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
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
                                <h1 className="font-inter-tight font-medium text-2xl sm:text-3xl text-text-primary tracking-tight m-0">
                                    Calendar
                                </h1>
                                <p className="text-sm text-text-secondary font-inter mt-2 max-w-xl m-0">
                                    Schedule meetings directly here. IntelliMeet creates the calendar event with auto Meet link
                                    and schedules the notetaker automatically.
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        const slot = nextScheduleSlot();
                                        setScheduleDate(slot);
                                        setScheduleTime(slot);
                                        setIsModalOpen(true);
                                    }}
                                    className="px-4 py-2 rounded-10 text-sm font-inter font-semibold bg-primary-500 text-white hover:opacity-95 transition-colors"
                                >
                                    Schedule meeting
                                </button>
                                <button
                                    type="button"
                                    onClick={() => void refreshLists()}
                                    className="px-4 py-2 rounded-10 text-sm font-inter font-medium border border-stroke-secondary bg-bg-surface-pure text-text-primary hover:bg-bg-surface-lv1 transition-colors"
                                >
                                    Refresh
                                </button>
                            </div>
                        </header>

                        <section className="rounded-16 border border-stroke-primary bg-bg-surface-pure p-5 space-y-3">
                            <h2 className="font-inter font-semibold text-lg text-text-primary m-0">Calendar (Meeting BaaS)</h2>
                            <p className="text-sm text-text-secondary m-0 max-w-2xl">
                                Connect Google Calendar via Meeting BaaS. Your link is saved on your account and survives refresh and
                                new sessions.
                            </p>
                            {mbaasLoading ? (
                                <p className="text-sm text-text-tertiary m-0">Checking connection…</p>
                            ) : mbaasStatus?.isConnected ? (
                                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:items-center">
                                    <span className="text-sm font-medium text-emerald-700">
                                        Connected
                                        {mbaasStatus.provider ? ` · ${mbaasStatus.provider}` : ''}
                                    </span>
                                    {mbaasStatus.calendarId && (
                                        <span className="text-xs text-text-tertiary font-mono truncate max-w-full" title={mbaasStatus.calendarId}>
                                            ID: {mbaasStatus.calendarId}
                                        </span>
                                    )}
                                    <button
                                        type="button"
                                        disabled={connectBusy}
                                        onClick={() => void refreshMbaasStatus()}
                                        className="px-3 py-1.5 rounded-10 text-xs font-inter font-medium border border-stroke-secondary bg-bg-surface-lv1 text-text-primary"
                                    >
                                        Refresh status
                                    </button>
                                    <button
                                        type="button"
                                        disabled={connectBusy || !mbaasStatus.localConnectionId}
                                        onClick={() => void unlinkCalendar()}
                                        className="px-3 py-1.5 rounded-10 text-xs font-inter font-medium border border-stroke-secondary text-text-primary hover:bg-orange-50"
                                    >
                                        Disconnect
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                void (async () => {
                                                    try {
                                                        const uid = await ensureBackendUserId();
                                                        window.location.href = googleCalendarConnectUrl(uid);
                                                    } catch (e) {
                                                        showToast(
                                                            'err',
                                                            e instanceof Error ? e.message : 'Could not start Google sign-in'
                                                        );
                                                    }
                                                })();
                                            }}
                                            className="px-4 py-2 rounded-10 text-sm font-inter font-semibold bg-primary-500 text-white"
                                        >
                                            Sign in with Google
                                        </button>
                                        <button
                                            type="button"
                                            disabled={connectBusy}
                                            onClick={() => void loadRawCalendars()}
                                            className="px-4 py-2 rounded-10 text-sm font-inter font-medium border border-stroke-secondary bg-bg-surface-pure"
                                        >
                                            Load my calendars
                                        </button>
                                    </div>
                                    {rawCalendars.length > 0 && (
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-wrap">
                                            <select
                                                value={selectedRawId}
                                                onChange={(e) => setSelectedRawId(e.target.value)}
                                                className="min-w-[220px] px-3 py-2 rounded-10 border border-stroke-secondary text-sm"
                                            >
                                                {rawCalendars.map((r) => (
                                                    <option key={r.id} value={r.id}>
                                                        {r.name} ({r.email})
                                                    </option>
                                                ))}
                                            </select>
                                            <button
                                                type="button"
                                                disabled={connectBusy || !selectedRawId}
                                                onClick={() => void linkCalendar()}
                                                className="px-4 py-2 rounded-10 text-sm font-inter font-semibold bg-primary-500 text-white disabled:opacity-50"
                                            >
                                                {connectBusy ? 'Linking…' : 'Link calendar'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </section>

                        <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                            <div className="rounded-16 border border-stroke-primary bg-bg-surface-pure p-5">
                                <h2 className="font-inter font-semibold text-lg text-text-primary m-0 mb-3">Upcoming</h2>
                                {busy ? (
                                    <p className="text-sm text-text-secondary">Loading…</p>
                                ) : upcoming.length === 0 ? (
                                    <p className="text-sm text-text-secondary">No upcoming meetings.</p>
                                ) : (
                                    <ul className="space-y-3 m-0 p-0 list-none">
                                        {upcoming.map((m) => (
                                            <li key={m.meetingId} className="border border-stroke-primary rounded-12 p-3">
                                                <p className="m-0 font-medium text-text-primary">{m.title}</p>
                                                <p className="m-0 text-xs text-text-secondary mt-1">
                                                    {m.startUtc ? new Date(m.startUtc).toLocaleString() : '—'} ·{' '}
                                                    {m.endUtc ? new Date(m.endUtc).toLocaleTimeString() : '—'}
                                                </p>
                                                <div className="flex gap-2 flex-wrap mt-2">
                                                    {m.botScheduled && (
                                                        <span className="text-[11px] px-2 py-0.5 rounded-8 bg-emerald-100 text-emerald-800">
                                                            Bot scheduled
                                                        </span>
                                                    )}
                                                    {m.transcriptReady && (
                                                        <span className="text-[11px] px-2 py-0.5 rounded-8 bg-primary-100 text-primary-700">
                                                            Transcript ready
                                                        </span>
                                                    )}
                                                    {m.calendarEventLink && (
                                                        <a
                                                            href={m.calendarEventLink}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-xs underline text-text-secondary"
                                                        >
                                                            View in Google Calendar
                                                        </a>
                                                    )}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <div className="rounded-16 border border-stroke-primary bg-bg-surface-pure p-5">
                                <h2 className="font-inter font-semibold text-lg text-text-primary m-0 mb-3">Past</h2>
                                {past.length === 0 ? (
                                    <p className="text-sm text-text-secondary">No recent past meetings.</p>
                                ) : (
                                    <ul className="space-y-3 m-0 p-0 list-none">
                                        {past.map((m) => (
                                            <li key={m.meetingId} className="border border-stroke-primary rounded-12 p-3">
                                                <p className="m-0 font-medium text-text-primary">{m.title}</p>
                                                <p className="m-0 text-xs text-text-secondary mt-1">
                                                    {m.startUtc ? new Date(m.startUtc).toLocaleString() : '—'}
                                                </p>
                                                <div className="flex gap-2 flex-wrap mt-2">
                                                    {m.transcriptReady ? (
                                                        <a
                                                            href={`/meetings`}
                                                            className="text-xs underline text-primary-600"
                                                        >
                                                            Open in Meetings / Ask AI
                                                        </a>
                                                    ) : (
                                                        <span className="text-[11px] text-text-tertiary">Processing transcript</span>
                                                    )}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </main>
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div className="w-full max-w-xl rounded-16 bg-bg-surface-pure border border-stroke-primary p-5">
                        <h3 className="m-0 text-lg font-semibold text-text-primary">Schedule meeting</h3>
                        <p className="text-sm text-text-secondary mt-1 mb-4">
                            No manual URL needed. IntelliMeet creates the calendar event and schedules the bot.
                        </p>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <div className="flex flex-col gap-3">
                                <input
                                    value={scheduleTitle}
                                    onChange={(e) => setScheduleTitle(e.target.value)}
                                    placeholder="Meeting title"
                                    className="w-full px-3 py-2.5 rounded-10 border border-stroke-secondary text-sm"
                                />
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <DatePicker
                                        value={scheduleDate}
                                        onChange={(v) => {
                                            setScheduleDate(v);
                                            if (!v) return;
                                            const t = scheduleTime ?? nextScheduleSlot();
                                            const combined = v.hour(t.hour()).minute(t.minute()).second(0).millisecond(0);
                                            const minStart = nextScheduleSlot();
                                            if (!combined.isAfter(minStart)) setScheduleTime(minStart);
                                        }}
                                        disablePast
                                        slotProps={{ textField: { size: 'small', fullWidth: true, sx: pickersTextFieldSx() } }}
                                    />
                                    <TimePicker
                                        value={scheduleTime}
                                        onChange={(v) => setScheduleTime(v)}
                                        minTime={
                                            scheduleDate?.isSame(dayjs(), 'day')
                                                ? nextScheduleSlot()
                                                : undefined
                                        }
                                        slotProps={{ textField: { size: 'small', fullWidth: true, sx: pickersTextFieldSx() } }}
                                    />
                                    <select
                                        value={durationMin}
                                        onChange={(e) => setDurationMin(Number(e.target.value))}
                                        className="w-full px-3 py-2 rounded-10 border border-stroke-secondary text-sm h-[42px]"
                                    >
                                        <option value={15}>15 min</option>
                                        <option value={30}>30 min</option>
                                        <option value={45}>45 min</option>
                                        <option value={60}>1 hour</option>
                                        <option value={90}>1.5 hours</option>
                                    </select>
                                </div>
                                <textarea
                                    value={attendeesInput}
                                    onChange={(e) => setAttendeesInput(e.target.value)}
                                    placeholder="Attendee emails (comma or newline separated)"
                                    rows={3}
                                    className="w-full px-3 py-2.5 rounded-10 border border-stroke-secondary text-sm"
                                />
                            </div>
                        </LocalizationProvider>
                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 rounded-10 border border-stroke-secondary text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={!scheduleValid || busy}
                                onClick={() => void createMeeting()}
                                className="px-4 py-2 rounded-10 bg-primary-500 text-white text-sm disabled:opacity-50"
                            >
                                {busy ? 'Creating…' : 'Create meeting'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Calendar;
