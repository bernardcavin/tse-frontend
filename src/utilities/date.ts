import dayjs, { type Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import { z } from 'zod';

dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(relativeTime);

export type CustomDate = Dayjs;

export const date = dayjs;

export function formatDate(value: Date | CustomDate | string, format = 'YYYY-MM-DD') {
  return date(value).format(format);
}

export const normalizeDate = (date: Date | string) => {
  return new Date(formatDate(date, 'YYYY-MM-DD') + 'T00:00:00Z');
};

export function formatRelativeDate(value: Date | CustomDate | string) {
  return date(value).fromNow();
}

export const dateSchema = z
  .union([z.string(), z.date()])
  .refine((value) => dayjs(value).isValid(), { message: 'Invalid date' })
  .transform((value) => new Date(dayjs(value).format('YYYY-MM-DD')));

export const timeSchema = z.string().regex(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, {
  message: 'End time must be in HH:mm:ss format',
});

export const nullableDateSchema = z.preprocess((input) => {
  if (input === null) return null;
  return input;
}, z.coerce.date().nullable());

export function formatDateRange(start: Date, end: Date): string {
  const sameDate = start.toDateString() === end.toDateString();

  const formatDate = (d: Date) =>
    d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const formatTime = (d: Date) =>
    d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

  const diffMs = Math.abs(end.getTime() - start.getTime());
  const diffMins = Math.floor(diffMs / 60000);
  const days = Math.floor(diffMins / (60 * 24));
  const hours = Math.floor((diffMins % (60 * 24)) / 60);
  const minutes = diffMins % 60;

  const durationParts = [];
  if (days) durationParts.push(`${days}d`);
  if (hours) durationParts.push(`${hours}h`);
  if (minutes) durationParts.push(`${minutes}m`);
  const duration = durationParts.join(' ') || '0m';

  if (sameDate) {
    return `${formatDate(start)} (${formatTime(start)} - ${formatTime(end)}, ${duration})`;
  } else {
    return `${formatDate(start)} ${formatTime(start)} → ${formatDate(end)} ${formatTime(end)} (${duration})`;
  }
}

export const compareDates = (
  date1: Date,
  date2: Date,
  inputString: string,
  fasterText: string, // Example: "lebih cepat"
  slowerText: string // Example: "lebih lambat"
): string => {
  const timeDiff = date2.getTime() - date1.getTime();
  const daysDiff = Math.ceil(Math.abs(timeDiff) / (1000 * 60 * 60 * 24)); // Convert ms to days

  const resultText = timeDiff > 0 ? slowerText : fasterText; // Choose based on order

  return `${daysDiff} ${inputString} ${resultText}`;
};

export const formatDateReadable = (date: Date | null | undefined): string => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export const formatDateTimeReadable = (
  date: Date | string | null | undefined,
  timeZone: string | undefined = 'Asia/Jakarta'
): string => {
  if (!date) return '-';

  const d = new Date(date);

  return d.toLocaleString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: timeZone,
    timeZoneName: 'long',
  });
};

export function countDates(
  startDate: Date | null | undefined,
  endDate: Date | null | undefined
): number {
  // Convert the start and end dates to Date objects

  if (!startDate || !endDate) {
    throw new Error('Both start and end dates are required.');
  }

  // Ensure the start date is before the end date
  if (startDate > endDate) {
    throw new Error('Start date must be before end date.');
  }

  // Calculate the difference in milliseconds
  const diffInMillis = endDate.getTime() - startDate.getTime();

  // Convert milliseconds to days
  const diffInDays = diffInMillis / (1000 * 3600 * 24);

  // Return the number of full days between the two dates
  return diffInDays + 1; // Include the start date in the count
}

export function countDaysBetween(
  startDate: Date | null | undefined,
  endDate: Date | null | undefined
): number {
  if (!startDate || !endDate) {
    throw new Error('Both start and end dates are required.');
  }

  const diffInMillis = endDate.getTime() - startDate.getTime();
  return diffInMillis / (1000 * 3600 * 24);
}
