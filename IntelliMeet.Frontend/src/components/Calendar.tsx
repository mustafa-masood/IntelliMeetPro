import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { imApi, type GoogleAuthConfig, type RawCalendarItem, type CalendarConnection, type CalendarEventDto } from '../api/intellimeet';
import { getGoogleRefreshToken, getGoogleEmail, clearGoogleSession } from '../lib/googleSession';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

type Step = 'input' | 'summary';
type InputStepProps = {
    meetingTitle: string;
    setMeetingTitle: (val: string) => void;
    selectedDate: any;
    setSelectedDate: (val: any) => void;
    selectedTime: any;
    setSelectedTime: (val: any) => void;
    duration: number;
    setDuration: (val: number) => void;
    name: string;
    setName: (val: string) => void;
    email: string;
    setEmail: (val: string) => void;
    handleNextStep: () => void;
    isFormValid: boolean;
};
const InputStep: React.FC<InputStepProps> = ({
    meetingTitle,
    setMeetingTitle,
    selectedDate,
    setSelectedDate,
    selectedTime,
    setSelectedTime,
    duration,
    setDuration,
    name,
    setName,
    email,
    setEmail,
    handleNextStep,
    isFormValid,
}) => {
    return (
        <>
      
            {/* LEFT PANEL - Preview */}
            <div className="hidden lg:flex lg:w-[35%] border-r border-stroke-primary p-6 flex-col">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600" />
                    <div>
                        <p className="text-sm text-text-secondary">You</p>
                        <h2 className="font-semibold text-lg text-text-primary">
                            {meetingTitle || 'Event title'}
                        </h2>
                    </div>
                </div>

                <div className="text-sm text-text-secondary space-y-2">
                    <p>⏱ Duration</p>
                    <p>📅 Date</p>
                    <p>⏰ Time</p>
                    <p>✉️ Email</p>


                </div>
            </div>

            {/* RIGHT PANEL */}
            <div className="w-full lg:flex-1 p-4 lg:p-6 flex flex-col overflow-hidden">
                <div className="flex-1  pr-2">
                    <LocalizationProvider dateAdapter={AdapterDayjs}>

                        {/* Title */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-text-primary mb-1">
                                Meeting Title
                            </label>
                            <input
                                value={meetingTitle}
                                onChange={(e) => setMeetingTitle(e.target.value)}
                                placeholder="e.g., Product Demo"
                                className="w-full px-3 py-2 border border-stroke-primary rounded text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                            />
                        </div>
                        <div className="grid grid-cols-3 gap-4 items-end mb-3">
                            {/* Date */}
                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-1">
                                    Select Date
                                </label>

                                <DatePicker
                                    value={selectedDate}
                                    onChange={(newValue) => setSelectedDate(newValue)}
                                    disablePast
                                    slotProps={{
                                        textField: {
                                            size: "small",
                                            fullWidth: true,
                                            sx: {
                                                "& .MuiInputBase-root": {
                                                    height: 38,
                                                    fontSize: "0.875rem",
                                                    borderRadius: "6px",
                                                },

                                                // OUTLINED BORDER MATCH
                                                "& .MuiOutlinedInput-notchedOutline": {
                                                    borderColor: "var(--stroke-primary)",
                                                },

                                                "&:hover .MuiOutlinedInput-notchedOutline": {
                                                    borderColor: "var(--stroke-primary)",
                                                },

                                                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                                    borderColor: "var(--primary-500)",
                                                    borderWidth: 1,
                                                },
                                            },
                                        },
                                    }}
                                />
                            </div>

                            {/* Time */}
                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-1">
                                    Select Time
                                </label>

                                <TimePicker
                                    value={selectedTime}
                                    onChange={(newValue) => setSelectedTime(newValue)}
                                    slotProps={{
                                        textField: {
                                            size: "small",
                                            fullWidth: true,
                                            sx: {
                                                "& .MuiInputBase-root": {
                                                    height: 38,
                                                    fontSize: "0.875rem",
                                                    borderRadius: "6px",
                                                },

                                                "& .MuiOutlinedInput-notchedOutline": {
                                                    borderColor: "var(--stroke-primary)",
                                                },

                                                "&:hover .MuiOutlinedInput-notchedOutline": {
                                                    borderColor: "var(--stroke-primary)",
                                                },

                                                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                                    borderColor: "var(--primary-500)",
                                                    borderWidth: 1,
                                                },
                                            },
                                        },
                                    }}
                                />
                            </div>

                            {/* Duration */}
                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-1">
                                    Duration
                                </label>

                                <select
                                    value={duration}
                                    onChange={(e) => setDuration(Number(e.target.value))}
                                    className="w-full px-3 py-2 border border-stroke-primary rounded text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm h-[38px]"
                                >
                                    <option value={15}>15 minutes</option>
                                    <option value={30}>30 minutes</option>
                                    <option value={60}>1 hour</option>
                                </select>
                            </div>
                        </div>
                    </LocalizationProvider>



                    {/* Name */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-text-primary mb-1">
                            Your Name
                        </label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your full name"
                            className="w-full px-3 py-2 border border-stroke-primary rounded text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                        />
                    </div>

                    {/* Email */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-text-primary mb-1">
                            Email
                        </label>
                        <input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your.email@example.com"
                            className="w-full px-3 py-2 border border-stroke-primary rounded text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                        />
                    </div>
                </div>

                {/* Next */}
                <button
                    onClick={handleNextStep}
                    disabled={!isFormValid}
                    className="w-full px-4 py-2 bg-primary-500 text-white font-medium rounded hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm mt-4 cursor-pointer"
                >
                    Next
                </button>
            </div>
        </>
    );
};
type SummaryProps = {
    meetingTitle: string;
    selectedDate: any;
    selectedTime: any;
    duration: number;
    name: string;
    email: string;
    setStep: (step: Step) => void;
    handleAddToCalendar: () => void;
};

const SummaryStep: React.FC<SummaryProps> = ({
    meetingTitle,
    selectedDate,
    selectedTime,
    duration,
    name,
    email,
    setStep,
    handleAddToCalendar,
}) => {
    return (
        <>
            {/* LEFT PANEL */}
            <div className="hidden lg:flex lg:w-[35%] border-r border-stroke-primary p-6 flex-col">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600" />
                    <div>
                        <p className="text-sm text-text-secondary">{name}</p>
                        <h2 className="font-semibold text-lg text-text-primary">
                            {meetingTitle}
                        </h2>
                    </div>
                </div>

                <div className="text-sm text-text-secondary space-y-2 flex-1">
                    <p>⏱ {duration} min</p>
                    <p>📅 {selectedDate?.format('DD MMM YYYY')}</p>
                    <p>⏰ {selectedTime?.format('HH:mm')}</p>
                    <p>✉️ {email}</p>
                </div>


            </div>

            {/* RIGHT PANEL */}
            <div className="w-full lg:flex-1 p-4 lg:p-6 flex flex-col justify-center items-center overflow-hidden">
                <div className="text-center max-w-sm w-full flex flex-col items-center ">
                    <div className="flex items-center justify-center gap-2 text-center mb-3">

                        <svg
                            className="w-8 lg:w-10 h-8 lg:h-10 text-primary-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>

                        <h2 className="text-lg lg:text-2xl font-semibold text-text-primary">
                            Review Your Meeting
                        </h2>

                    </div>
                    <div className="bg-primary-50 border border-stroke-primary rounded-lg p-3 lg:p-4 mb-4 lg:mb-6 text-left w-full">
                        <div className="space-y-2 lg:space-y-3">
                            <div>
                                <p className="text-xs text-text-secondary uppercase">Title</p>
                                <p className="font-semibold text-text-primary text-sm">{meetingTitle}</p>
                            </div>

                            <div>
                                <p className="text-xs text-text-secondary uppercase">Date & Time</p>
                                <p className="font-semibold text-text-primary text-sm">
                                    {selectedDate?.format('DD MMM YYYY')} at {selectedTime?.format('HH:mm')}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-text-secondary uppercase">Duration</p>
                                <p className="font-semibold text-text-primary text-sm">{duration} minutes</p>
                            </div>

                            <div>
                                <p className="text-xs text-text-secondary uppercase">Organizer</p>
                                <p className="font-semibold text-text-primary text-sm">{name}</p>
                                <p className="text-xs lg:text-sm text-text-secondary">{email}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2 lg:gap-3 w-full">
                        <button
                            onClick={() => setStep('input')}
                            className="flex-1 px-3 lg:px-4 py-2 border border-stroke-primary text-text-primary font-medium rounded hover:bg-bg-surface-lv1 transition-all text-sm cursor-pointer"
                        >
                            Back
                        </button>

                        <button
                            onClick={handleAddToCalendar}
                            className="flex-1 px-3 lg:px-4 py-2 bg-primary-500 text-white font-medium rounded hover:bg-primary-600 transition-all text-sm cursor-pointer"
                        >
                            Add to Calendar
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

const Calendar: React.FC = () => {
    const [googleCfg, setGoogleCfg] = useState<GoogleAuthConfig | null>(null);
    const [rawCalendars, setRawCalendars] = useState<RawCalendarItem[]>([]);
    const [selectedRawId, setSelectedRawId] = useState('');
    const [connections, setConnections] = useState<CalendarConnection[]>([]);
    const [selectedConnectionId, setSelectedConnectionId] = useState('');
    const [events, setEvents] = useState<CalendarEventDto[]>([]);
    const [integMsg, setIntegMsg] = useState<string | null>(null);
    const [integBusy, setIntegBusy] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const cfg = await imApi.googleAuthConfig();
                setGoogleCfg(cfg);
                const conns = await imApi.listCalendarConnections();
                setConnections(conns);
            } catch {
                setGoogleCfg(null);
            }
        })();
    }, []);

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
            }
        })();
    }, [selectedConnectionId]);

    const [step, setStep] = useState<Step>('input');
    const [meetingTitle, setMeetingTitle] = useState('');
    const [selectedDate, setSelectedDate] = useState<any>(null);
    const [selectedTime, setSelectedTime] = useState<any>(null);
    const [duration, setDuration] = useState(30);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');

    const isFormValid =
        meetingTitle &&
        selectedDate &&
        selectedTime &&
        name &&
        email;

    const handleNextStep = () => {
        if (isFormValid) setStep('summary');
    };

    const handleAddToCalendar = () => {
        const payload = {
            meetingTitle,
            date: selectedDate?.format('YYYY-MM-DD'),
            time: selectedTime?.format('HH:mm'),
            duration,
            name,
            email,
        };

        console.log('Schedule:', payload);
    };


    return (
        <div className="flex w-screen h-screen bg-bg-surface-lv1 overflow-hidden">
            <Sidebar />

            <div className="ml-[270px] flex-1 flex flex-col h-screen overflow-hidden relative">
                {/* Page Header */}
                <div className="px-8 pt-[10px] flex flex-col gap-4 max-w-[1106px] w-full mx-auto">
                    <h1 className="font-inter font-medium text-2xl text-text-primary tracking-[-0.084px] mt-5">
                        Calendar
                    </h1>

                    <div className="bg-bg-surface-pure border border-stroke-primary rounded-8 p-4 flex flex-col gap-3">
                        <h2 className="font-inter font-medium text-sm text-text-primary">Google Calendar → Meeting BaaS</h2>
                        <p className="font-inter text-xs text-text-secondary">
                            Add redirect URI <code className="bg-bg-surface-lv1 px-1 rounded">http://localhost:5173/oauth/google/callback</code> in Google Cloud Console. Configure backend{' '}
                            <code className="bg-bg-surface-lv1 px-1 rounded">MeetingBaas:ApiKey</code> and{' '}
                            <code className="bg-bg-surface-lv1 px-1 rounded">GoogleOAuth</code> (user secrets).
                        </p>
                        {integMsg && <p className="text-xs text-primary-700 font-inter">{integMsg}</p>}
                        <div className="flex flex-wrap gap-2 items-center">
                            {googleCfg?.clientId ? (
                                <button
                                    type="button"
                                    className="px-3 py-2 bg-white border border-stroke-primary rounded-8 text-sm font-inter"
                                    onClick={() => {
                                        window.location.href = googleCfg.authorizeUrl;
                                    }}
                                >
                                    Sign in with Google
                                </button>
                            ) : (
                                <span className="text-xs text-amber-700">Backend Google OAuth not configured.</span>
                            )}
                            <span className="text-xs text-text-secondary font-inter truncate max-w-[240px]">
                                {getGoogleEmail() || getGoogleRefreshToken() ? `Session: ${getGoogleEmail() || 'token stored'}` : 'Not signed in'}
                            </span>
                            <button type="button" className="text-xs text-text-secondary underline" onClick={() => { clearGoogleSession(); setIntegMsg('Cleared Google session'); }}>
                                Clear browser session
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2 items-end">
                            <button
                                type="button"
                                disabled={integBusy || !getGoogleRefreshToken()}
                                className="px-3 py-2 bg-bg-surface-lv1 border border-stroke-primary rounded-8 text-sm font-inter disabled:opacity-50"
                                onClick={async () => {
                                    const rt = getGoogleRefreshToken();
                                    if (!rt) return;
                                    setIntegBusy(true);
                                    setIntegMsg(null);
                                    try {
                                        const list = await imApi.listRawCalendars(rt);
                                        setRawCalendars(list);
                                        const primary = list.find((c) => c.isPrimary);
                                        setSelectedRawId(primary?.id || list[0]?.id || '');
                                        setIntegMsg(`Loaded ${list.length} calendar(s) from Google.`);
                                    } catch (e) {
                                        setIntegMsg(e instanceof Error ? e.message : 'list-raw failed');
                                    } finally {
                                        setIntegBusy(false);
                                    }
                                }}
                            >
                                List my calendars
                            </button>
                            <select
                                className="border border-stroke-primary rounded-8 px-2 py-2 text-sm font-inter min-w-[200px]"
                                value={selectedRawId}
                                onChange={(e) => setSelectedRawId(e.target.value)}
                            >
                                <option value="">Select calendar…</option>
                                {rawCalendars.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name} ({c.email})
                                    </option>
                                ))}
                            </select>
                            <button
                                type="button"
                                disabled={integBusy || !getGoogleRefreshToken() || !selectedRawId}
                                className="px-3 py-2 bg-primary-500 text-white rounded-8 text-sm font-inter disabled:opacity-50"
                                onClick={async () => {
                                    const rt = getGoogleRefreshToken();
                                    if (!rt || !selectedRawId) return;
                                    setIntegBusy(true);
                                    setIntegMsg(null);
                                    try {
                                        const conn = await imApi.connectCalendar(rt, selectedRawId);
                                        setConnections(await imApi.listCalendarConnections());
                                        setSelectedConnectionId(conn.id);
                                        setIntegMsg('Connected to Meeting BaaS.');
                                    } catch (e) {
                                        setIntegMsg(e instanceof Error ? e.message : 'connect failed');
                                    } finally {
                                        setIntegBusy(false);
                                    }
                                }}
                            >
                                Connect to Meeting BaaS
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2 items-center">
                            <label className="text-xs font-inter text-text-secondary">Active connection</label>
                            <select
                                className="border border-stroke-primary rounded-8 px-2 py-2 text-sm font-inter flex-1 min-w-[200px]"
                                value={selectedConnectionId}
                                onChange={(e) => setSelectedConnectionId(e.target.value)}
                            >
                                <option value="">—</option>
                                {connections.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.externalCalendarId.slice(0, 8)}… ({c.status})
                                    </option>
                                ))}
                            </select>
                            <button
                                type="button"
                                disabled={integBusy || !selectedConnectionId}
                                className="px-3 py-2 border border-stroke-primary rounded-8 text-sm font-inter"
                                onClick={async () => {
                                    setIntegBusy(true);
                                    try {
                                        await imApi.syncCalendar(selectedConnectionId);
                                        setEvents(await imApi.listCalendarEvents(selectedConnectionId));
                                        setIntegMsg('Synced.');
                                    } catch (e) {
                                        setIntegMsg(e instanceof Error ? e.message : 'sync failed');
                                    } finally {
                                        setIntegBusy(false);
                                    }
                                }}
                            >
                                Sync now
                            </button>
                        </div>
                        <p className="text-xs text-text-secondary font-inter max-w-xl">
                            Meeting BaaS joins only after you schedule a bot per event. The calendar entry must include a meeting link (Google Meet, Zoom, Teams, etc.). Use Sync now after adding or changing events.
                        </p>
                        {events.length > 0 && (
                            <div className="border border-stroke-primary rounded-8 overflow-hidden max-h-56 overflow-y-auto">
                                <table className="w-full text-xs font-inter">
                                    <thead className="bg-bg-surface-lv1">
                                        <tr>
                                            <th className="text-left p-2">Event</th>
                                            <th className="text-left p-2">Start</th>
                                            <th className="p-2">Bot</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {events.map((ev) => (
                                            <tr key={ev.id} className="border-t border-stroke-primary">
                                                <td className="p-2">{ev.title}</td>
                                                <td className="p-2 whitespace-nowrap">{new Date(ev.startUtc).toLocaleString()}</td>
                                                <td className="p-2">
                                                    <button
                                                        type="button"
                                                        className="text-primary-600 underline disabled:opacity-50"
                                                        disabled={integBusy || !selectedConnectionId || ev.isCancelled}
                                                        onClick={async () => {
                                                            setIntegBusy(true);
                                                            try {
                                                                await imApi.scheduleCalendarBot(selectedConnectionId, ev.externalEventId, 'IntelliMeet Notetaker');
                                                                setEvents(await imApi.listCalendarEvents(selectedConnectionId));
                                                                setIntegMsg(`Scheduled bot for ${ev.title}`);
                                                            } catch (e) {
                                                                setIntegMsg(e instanceof Error ? e.message : 'schedule failed');
                                                            } finally {
                                                                setIntegBusy(false);
                                                            }
                                                        }}
                                                    >
                                                        Schedule bot
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Table Container */}
                <div className="px-8 pt-4 flex-1 overflow-hidden">
                    <div className="max-w-[1106px] w-full mx-auto bg-bg-surface-pure border border-stroke-primary rounded-8 h-full flex flex-col">
                        {/* Tab Menu */}
                        <div className="px-4 pt-4 flex items-center gap-6 border-b border-stroke-primary">
                            <button
                                className="pb-3 font-inter font-medium text-sm tracking-[-0.084px] border-b-2 text-text-primary border-primary-500 transition-colors"
                            >
                                Schedule
                            </button>
                        </div>

                        {/* Calendar Info Section */}
                        <div className="px-4 pt-4 pb-3 bg-bg-surface-lv1 flex-1 overflow-hidden flex flex-col">
                            <div className="flex items-center gap-2 w-full mb-4">
                                <div className="border border-stroke-primary rounded-8 px-3 py-2 flex items-center gap-3 bg-bg-surface-pure w-full">
                                    {/* Icon */}
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                        <path d="M15.8333 3.33333H4.16667C3.24619 3.33333 2.5 4.07952 2.5 5V16.6667C2.5 17.5871 3.24619 18.3333 4.16667 18.3333H15.8333C16.7538 18.3333 17.5 17.5871 17.5 16.6667V5C17.5 4.07952 16.7538 3.33333 15.8333 3.33333Z" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M13.3333 1.66667V5" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M6.66667 1.66667V5" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M2.5 8.33333H17.5" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>

                                    {/* Text (takes full space) */}
                                    <span className="flex-1 font-inter font-medium text-sm text-text-secondary tracking-[-0.084px]">
                                        Scheduling based on mustafa@gmail.com (Google Calendar)
                                    </span>

                                    {/* Button pushed right */}
                                    <button className="px-3 py-2 font-inter font-medium text-sm text-text-secondary tracking-[-0.084px] cursor-pointer hover:opacity-80 whitespace-nowrap">
                                        Change Calendar
                                    </button>
                                </div>
                            </div>

                            {/* Scheduling UI */}
                            <div className="border-stroke-primary bg-bg-surface-pure flex flex-1 flex-col lg:flex-row rounded overflow-hidden">
                                {step === 'input' && (
                                    <InputStep
                                        meetingTitle={meetingTitle}
                                        setMeetingTitle={setMeetingTitle}
                                        selectedDate={selectedDate}
                                        setSelectedDate={setSelectedDate}
                                        selectedTime={selectedTime}
                                        setSelectedTime={setSelectedTime}
                                        duration={duration}
                                        setDuration={setDuration}
                                        name={name}
                                        setName={setName}
                                        email={email}
                                        setEmail={setEmail}
                                        handleNextStep={handleNextStep}
                                        isFormValid={isFormValid}
                                    />
                                )}

                                {step === 'summary' && (
                                    <SummaryStep
                                        meetingTitle={meetingTitle}
                                        selectedDate={selectedDate}
                                        selectedTime={selectedTime}
                                        duration={duration}
                                        name={name}
                                        email={email}
                                        setStep={setStep}
                                        handleAddToCalendar={handleAddToCalendar}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Calendar;