/**
 * Date helpers.
 *
 * CRITICAL: "today" is always resolved from the device's LOCAL timezone.
 * The backend treats log dates as plain calendar days (date column), so we
 * send `YYYY-MM-DD` strings derived locally and never shift them to UTC.
 */

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

const WEEKDAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

const pad2 = (n: number) => String(n).padStart(2, '0');

/** Local calendar date → "YYYY-MM-DD" string (never UTC-shifted). */
export function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

/** Local date at start of day. Keeps tz-sensitive 23:59 issues away. */
export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Parse "YYYY-MM-DD" into a LOCAL Date (noon to dodge DST edge cases). */
export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Add days, returned as a new local Date. */
export function addDays(date: Date, days: number): Date {
  const result = startOfDay(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * The backend serialises `log_date` (a `date` column) as an ISO timestamp,
 * e.g. "2026-08-11T18:30:00.000Z" for the day 2026-08-12 in IST. Because the
 * device lives in the same timezone as the server (the user's machine), we
 * recover the intended calendar day by reading the LOCAL date parts.
 */
export function milkLogDateToKey(logDate: string): string {
  const parsed = new Date(logDate);
  if (Number.isNaN(parsed.getTime())) {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(logDate);
    if (match) return `${match[1]}-${match[2]}-${match[3]}`;
    return toDateKey(new Date());
  }
  return toDateKey(parsed);
}

export function monthKeyOf(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}`;
}

export const isToday = (dateKey: string) => dateKey === toDateKey(new Date());

export function formatWeekdayLong(date: Date): string {
  return WEEKDAY_NAMES[date.getDay()];
}

export function formatMonthLong(date: Date): string {
  return MONTH_NAMES[date.getMonth()];
}

export function formatMonthShort(date: Date): string {
  return MONTH_NAMES[date.getMonth()].slice(0, 3);
}

/** e.g. "Tuesday, 12 August" */
export function formatDateLong(date: Date): string {
  return `${formatWeekdayLong(date)}, ${date.getDate()} ${formatMonthLong(date)}`;
}

/** e.g. "Tuesday, 12 August 2026" */
export function formatDateLongWithYear(date: Date): string {
  return `${formatWeekdayLong(date)}, ${date.getDate()} ${formatMonthLong(date)} ${date.getFullYear()}`;
}

/** e.g. "12 August 2026" */
export function formatDateFull(date: Date): string {
  return `${date.getDate()} ${formatMonthLong(date)} ${date.getFullYear()}`;
}

/** e.g. "August 2026" */
export function formatMonthYear(date: Date): string {
  return `${formatMonthLong(date)} ${date.getFullYear()}`;
}

/** e.g. "12 Aug" */
export function formatDateCompact(date: Date): string {
  return `${date.getDate()} ${formatMonthShort(date)}`;
}