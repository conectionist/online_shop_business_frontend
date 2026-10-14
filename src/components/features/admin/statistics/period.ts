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

const monthsAgo = (months: number, today: Date): string => {
  const date = new Date(today.getFullYear(), today.getMonth() - months, today.getDate());
  return toISODate(date);
};

// Turn the selected preset into API parameters. Dates select lists by delivery date.
// Presets have an open end so the list currently taking orders (delivery date in the
// future) is included.
export const resolveRange = (
  preset: PeriodPreset,
  custom: CustomRange,
  today: Date = new Date()
): StatsRange => {
  switch (preset) {
    case 'days7':
      // Today and the 6 days before it
      return { start_date: daysAgo(6, today) };
    case 'days15':
      return { start_date: daysAgo(14, today) };
    case 'months1':
      return { start_date: monthsAgo(1, today) };
    case 'months2':
      return { start_date: monthsAgo(2, today) };
    case 'months3':
      return { start_date: monthsAgo(3, today) };
    case 'months6':
      return { start_date: monthsAgo(6, today) };
    case 'months12':
      return { start_date: monthsAgo(12, today) };
    case 'thisYear':
      return { start_date: `${today.getFullYear()}-01-01` };
    case 'custom':
      return {
        ...(custom.start_date ? { start_date: custom.start_date } : {}),
        ...(custom.end_date ? { end_date: custom.end_date } : {}),
      };
    case 'all':
    default:
      return {};
  }
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
