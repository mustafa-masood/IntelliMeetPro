import React, { useState, useRef, useEffect, useCallback } from 'react';
import { imApi, type UpcomingMeetingCard } from '../api/intellimeet';
import { getGoogleEmail } from '../lib/googleSession';

const RightSidebar: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(16);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [upcoming, setUpcoming] = useState<UpcomingMeetingCard[]>([]);
  const [calError, setCalError] = useState<string | null>(null);
  const [joinUrl, setJoinUrl] = useState('');
  const [joinBusy, setJoinBusy] = useState(false);
  const [joinMsg, setJoinMsg] = useState<string | null>(null);

  const calendarDays = [
    [1, 2, 3, 4, 5, 6, 7],
    [8, 9, 10, 11, 12, 13, 14],
    [15, 16, 17, 18, 19, 20, 21],
    [22, 23, 24, 25, 26, 27, 28],
    [29, 30, 31, null, null, null, null],
  ];
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadUpcoming = useCallback(async () => {
    try {
      const u = await imApi.upcomingMeetings();
      setUpcoming(u);
      setCalError(null);
    } catch (e) {
      setCalError(e instanceof Error ? e.message : 'Calendar load failed');
    }
  }, []);

  useEffect(() => {
    loadUpcoming();
  }, [loadUpcoming]);

  useEffect(() => {
    const t = window.setInterval(() => loadUpcoming(), 45000);
    return () => window.clearInterval(t);
  }, [loadUpcoming]);

  const first = upcoming[0];
  const googleEmail = getGoogleEmail();

  const formatRange = (a?: string | null, b?: string | null) => {
    if (!a) return '—';
    try {
      const s = new Date(a).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
      const e = b ? new Date(b).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : '';
      return e ? `${s} – ${e}` : s;
    } catch {
      return a;
    }
  };

  return (
    <div className="w-full xl:w-[300px] flex flex-col gap-3">
      <h2 className="mb-2 font-inter-tight text-base font-semibold tracking-tight text-text-primary">
        Upcoming Meetings
      </h2>

      <div className="w-full overflow-visible rounded-16 border border-stroke-primary bg-bg-surface-pure shadow-float xl:w-[300px]">
        <div className="border-b border-stroke-primary p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="font-inter text-sm font-medium leading-5 text-text-primary">April 2026</div>
            <div className="flex gap-1.5 items-center">
              <button
                type="button"
                className="bg-bg-surface-pure border border-stroke-secondary rounded-8 w-7 h-7 flex items-center justify-center font-inter font-medium text-sm text-text-secondary cursor-pointer hover:bg-bg-surface-lv1 transition-colors"
                aria-label="Previous month"
              >
                ‹
              </button>
              <button
                type="button"
                className="bg-bg-surface-pure border border-stroke-secondary rounded-8 w-7 h-7 flex items-center justify-center font-inter font-medium text-sm text-text-secondary cursor-pointer hover:bg-bg-surface-lv1 transition-colors"
                aria-label="Next month"
              >
                ›
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-0.5">
            <div className="grid grid-cols-7">
              {weekdays.map((day) => (
                <div key={day} className="flex items-center justify-center py-1 font-inter font-medium text-[11px] text-text-primary leading-4">
                  {day}
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-0.5">
              {calendarDays.map((week, wi) => (
                <div key={wi} className="grid grid-cols-7">
                  {week.map((day, di) => (
                    <button
                      key={di}
                      type="button"
                      className={`flex items-center justify-center py-1 rounded-full font-inter font-medium text-[11px] cursor-pointer transition-colors
                        ${day === selectedDate ? 'bg-primary-500 text-white' : day ? 'text-text-primary hover:bg-bg-surface-lv1' : 'text-text-disable cursor-not-allowed'}`}
                      onClick={() => day && setSelectedDate(day)}
                      disabled={!day}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-b border-stroke-primary p-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 shrink-0 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-base">G</div>
            <div className="flex-1 flex flex-col gap-0.5 min-w-0">
              <div className="font-inter truncate text-sm font-medium leading-5 tracking-tight text-text-primary">
                {googleEmail || 'Google Calendar'}
              </div>
              <div className="flex items-center gap-1 font-inter font-normal text-xs text-text-secondary leading-4">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${googleEmail ? 'bg-primary-500' : 'bg-text-disable'}`} />
                <span>{googleEmail ? 'Browser session connected' : 'Connect from Calendar page'}</span>
              </div>
            </div>
            <div className="relative shrink-0" ref={dropdownRef}>
              <button
                type="button"
                className="bg-bg-surface-lv1 border border-bg-surface-pure rounded-8 p-1 cursor-pointer hover:bg-bg-surface-lv2 transition-colors"
                onClick={() => setDropdownOpen((p) => !p)}
              >
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="4" r="1.5" fill="#2b3d39" />
                  <circle cx="10" cy="10" r="1.5" fill="#2b3d39" />
                  <circle cx="10" cy="16" r="1.5" fill="#2b3d39" />
                </svg>
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 top-8 z-20 bg-bg-surface-pure border border-stroke-secondary rounded-8 shadow-md min-w-[160px] overflow-hidden">
                  <a
                    href="/calendar"
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-inter text-text-primary hover:bg-bg-surface-lv1 transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Open Calendar
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-3">
          {calError && <p className="text-xs text-amber-700 mb-2 font-inter">{calError}</p>}
          {first ? (
            <div className="rounded-r-10 border-l-[3px] border-primary-500 bg-gradient-to-r from-primary-50/90 to-bg-surface-pure px-3 py-2.5">
              <div className="flex items-start justify-between gap-2">
                <span className="font-inter text-sm font-semibold text-text-primary">{first.title}</span>
                <span className="shrink-0 rounded-full bg-primary-500 px-2 py-0.5 font-inter text-[10px] font-semibold text-white">
                  {first.botStatus}
                </span>
              </div>
              <div className="flex items-center gap-1 font-inter text-xs text-text-secondary">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                  <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2" className="text-primary-500" />
                  <polyline
                    points="6,3 6,6 8,7.5"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    className="text-primary-500"
                  />
                </svg>
                {formatRange(first.startUtc, first.endUtc)}
              </div>
            </div>
          ) : (
            <p className="text-xs text-text-secondary font-inter">No upcoming meetings from API. Connect a calendar or send a bot.</p>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-16 border border-stroke-primary bg-bg-surface-pure shadow-float">
        <div className="flex items-center gap-2.5 border-b border-stroke-primary px-4 py-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-10 border border-stroke-primary bg-bg-surface-lv1 text-text-secondary">
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <rect x="3" y="1" width="8" height="12" rx="1" stroke="currentColor" strokeWidth="1.2" />
              <rect x="5" y="0" width="4" height="2.5" rx="0.5" fill="currentColor" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-inter font-medium text-sm text-text-primary tracking-[-0.176px] leading-5">Paste meeting link</div>
            <div className="font-inter font-normal text-xs text-text-secondary leading-4">
                Invite IntelliMeet Pro Notetaker via Meeting BaaS
            </div>
          </div>
        </div>
        <div className="p-3 flex flex-col gap-2.5">
          <input
            type="url"
            value={joinUrl}
            onChange={(e) => setJoinUrl(e.target.value)}
            className="w-full rounded-10 border border-stroke-primary bg-bg-surface-pure px-3 py-2.5 font-inter text-sm text-text-primary outline-none transition-[border-color,box-shadow] placeholder:text-text-tertiary focus:border-primary-500/40 focus:ring-2 focus:ring-primary-500/15"
            placeholder="https://meet.google.com/..."
          />
          {joinMsg && <p className="text-xs text-primary-700 font-inter">{joinMsg}</p>}
          <button
            type="button"
            disabled={joinBusy || !joinUrl.trim()}
            onClick={async () => {
              setJoinBusy(true);
              setJoinMsg(null);
              try {
                const r = await imApi.joinBot(joinUrl.trim());
                setJoinMsg(`Bot queued. ID: ${r.externalBotId.slice(0, 8)}…`);
                setJoinUrl('');
                const u = await imApi.upcomingMeetings();
                setUpcoming(u);
              } catch (e) {
                setJoinMsg(e instanceof Error ? e.message : 'Failed');
              } finally {
                setJoinBusy(false);
              }
            }}
            className="w-full cursor-pointer rounded-10 border border-primary-600 bg-primary-500 px-4 py-2.5 font-inter text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-600 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
          >
            {joinBusy ? 'Sending…' : 'Join Meeting'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;
