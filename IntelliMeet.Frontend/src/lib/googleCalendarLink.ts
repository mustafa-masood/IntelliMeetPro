import type { Dayjs } from 'dayjs';

/** Google Calendar “create event” template URL (no API key required). */
export function buildGoogleCalendarTemplateUrl(params: {
  title: string;
  start: Dayjs;
  end: Dayjs;
  details?: string;
  location?: string;
}): string {
  const { title, start, end, details = '', location = '' } = params;
  const fmt = (d: Dayjs) => d.format('YYYYMMDDTHHmmss');
  const dates = `${fmt(start)}/${fmt(end)}`;
  const q = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates,
    details,
    location,
  });
  return `https://calendar.google.com/calendar/render?${q.toString()}`;
}
