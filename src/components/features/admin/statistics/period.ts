import { StatsPeriod, StatsRange } from '@/types/statistics';
import { formatDateRange, pluralRo, toISODate } from './format';

export type PeriodPreset =
  | 'days7'
  | 'days15'
  | 'months1'
  | 'months2'
  | 'months3'
  | 'months6'
  | 'months12'
  | 'thisYear'
  | 'all'
  | 'custom';

export interface CustomRange {
  start_date: string;
  end_date: string;
}

export const PERIOD_PRESETS: { value: PeriodPreset; label: string }[] = [
  { value: 'days7', label: 'Ultima săptămână' },
  { value: 'days15', label: 'Ultimele 15 zile' },
  { value: 'months1', label: 'Ultima lună' },
  { value: 'months2', label: 'Ultimele 2 luni' },
  { value: 'months3', label: 'Ultimele 3 luni' },
  { value: 'months6', label: 'Ultimele 6 luni' },
  { value: 'months12', label: 'Ultimele 12 luni' },
  { value: 'thisYear', label: 'Anul acesta' },
  { value: 'all', label: 'Toată perioada' },
  { value: 'custom', label: 'Interval personalizat…' },
];

const daysAgo = (days: number, today: Date): string =>
  toISODate(new Date(today.getFullYear(), today.getMonth(), today.getDate() - days));

// The same day `months` months back, moved to the month's last day when it is shorter:
// a month before 31 March is 28 (or 29) February, not 3 March
const monthsAgo = (months: number, today: Date): string => {
  const month = today.getMonth() - months;
  const lastDay = new Date(today.getFullYear(), month + 1, 0).getDate();
  return toISODate(new Date(today.getFullYear(), month, Math.min(today.getDate(), lastDay)));
};

const presetStart = (preset: PeriodPreset, today: Date): string | undefined => {
  switch (preset) {
    case 'days7':
      // Today and the 6 days before it
      return daysAgo(6, today);
    case 'days15':
      return daysAgo(14, today);
    case 'months1':
      return monthsAgo(1, today);
    case 'months2':
      return monthsAgo(2, today);
    case 'months3':
      return monthsAgo(3, today);
    case 'months6':
      return monthsAgo(6, today);
    case 'months12':
      return monthsAgo(12, today);
    case 'thisYear':
      return `${today.getFullYear()}-01-01`;
    default:
      return undefined;
  }
};

// Turn the selected preset into API parameters. Dates select lists by delivery date.
// Presets end today, so they cover lists already delivered: the list still taking
// orders has unfinished numbers and is shown only in the live docket. Ending today
// also gives the API's comparison period the same length.
export const resolveRange = (
  preset: PeriodPreset,
  custom: CustomRange,
  today: Date = new Date()
): StatsRange => {
  if (preset === 'custom') {
    return {
      ...(custom.start_date ? { start_date: custom.start_date } : {}),
      ...(custom.end_date ? { end_date: custom.end_date } : {}),
    };
  }
  const start = presetStart(preset, today);
  return { ...(start ? { start_date: start } : {}), end_date: toISODate(today) };
};

const MIN_YEAR = 2000;
const ISO_DATE = /^(\d{4})-\d{2}-\d{2}$/;

const isPlausibleDate = (value: string): boolean => {
  const match = ISO_DATE.exec(value);
  return match !== null && Number(match[1]) >= MIN_YEAR;
};

// Whether a custom range can be sent to the API. A date input reports every keystroke
// of a typed year (0002, 0020, 0202, 2026), so dates before 2000 count as unfinished
// and get no message; only a complete range in the wrong order does.
export const checkCustomRange = (custom: CustomRange): { usable: boolean; message?: string } => {
  if (!isPlausibleDate(custom.start_date) || !isPlausibleDate(custom.end_date)) {
    return { usable: false };
  }
  if (custom.start_date > custom.end_date) {
    return { usable: false, message: 'Data de început trebuie să fie înaintea datei de sfârșit.' };
  }
  return { usable: true };
};

export const NO_LISTS_MESSAGE = 'Nicio listă cu comenzi în perioada selectată';

// The period the API resolved: "2 liste (24 sep – 15 oct 2026) · comparat cu 2 liste
// anterioare (27 aug – 17 sep 2026)"
export const describePeriod = (period: StatsPeriod): string => {
  if (period.list_count === 0) {
    return NO_LISTS_MESSAGE;
  }
  const range =
    period.start_date && period.end_date ? formatDateRange(period.start_date, period.end_date) : 'de la început';
  const comparison =
    period.previous_list_count > 0 && period.previous_start_date && period.previous_end_date
      ? ` · comparat cu ${pluralRo(period.previous_list_count, 'listă anterioară', 'liste anterioare')} (${formatDateRange(period.previous_start_date, period.previous_end_date)})`
      : '';
  return `${pluralRo(period.list_count, 'listă', 'liste')} (${range})${comparison}`;
};

// File name part for exports: "2026-09-24_2026-10-15", or today's date without bounds
export const periodSlug = (period: StatsPeriod | undefined, today: Date = new Date()): string =>
  period?.start_date && period.end_date ? `${period.start_date}_${period.end_date}` : toISODate(today);
