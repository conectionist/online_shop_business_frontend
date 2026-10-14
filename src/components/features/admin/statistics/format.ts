// Formatting helpers for the statistics page (Romanian locale)

export const EMPTY_MESSAGE = 'Nu există date pentru perioada selectată.';

const SHORT_MONTHS = ['ian', 'feb', 'mar', 'apr', 'mai', 'iun', 'iul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const LONG_MONTHS = [
  'ianuarie',
  'februarie',
  'martie',
  'aprilie',
  'mai',
  'iunie',
  'iulie',
  'august',
  'septembrie',
  'octombrie',
  'noiembrie',
  'decembrie',
];
export const WEEKDAYS_SHORT = ['L', 'Ma', 'Mi', 'J', 'V', 'S', 'D'];
export const WEEKDAYS_LONG = ['Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri', 'Sâmbătă', 'Duminică'];

const integerFormat = new Intl.NumberFormat('ro-RO', { maximumFractionDigits: 0, useGrouping: true });

export const formatNumber = (value: number): string => integerFormat.format(Math.round(value));

export const formatRON = (value: number): string => `${formatNumber(value)} RON`;

// Romanian counted nouns: "1 oră", "3 ore", "20 de ore" (from 20 up, "de" joins number and noun)
export const pluralRo = (n: number, one: string, many: string): string => {
  if (n === 1) {
    return `1 ${one}`;
  }
  const lastTwo = Math.abs(n) % 100;
  const de = n !== 0 && (lastTwo === 0 || lastTwo >= 20);
  return `${formatNumber(n)} ${de ? 'de ' : ''}${many}`;
};

// Compact axis labels: 950, 1,2k, 12k
export const formatCompact = (value: number): string => {
  if (Math.abs(value) < 1000) {
    return formatNumber(value);
  }
  const thousands = value / 1000;
  const digits = Math.abs(thousands) >= 10 ? 0 : 1;
  return `${thousands.toFixed(digits).replace('.', ',').replace(/,0$/, '')}k`;
};

// 0.9286 -> "92,9%", 0.5 -> "50%"
export const formatPercent = (rate: number): string =>
  `${(rate * 100).toFixed(1).replace('.', ',').replace(/,0$/, '')}%`;

// Relative change between two values, or null when there is nothing to compare against
export const computeDelta = (current: number, previous: number | null | undefined): number | null => {
  if (previous === null || previous === undefined || previous === 0) {
    return null;
  }
  return (current - previous) / previous;
};

// Signed percentage for delta pills: "+8,2%", "−1,1%"
export const formatDelta = (delta: number): string => {
  const sign = delta > 0 ? '+' : delta < 0 ? '−' : '';
  return `${sign}${formatPercent(Math.abs(delta))}`;
};

// Difference between two rates in percentage points: 0.089 -> "+8,9 pp"
export const formatPoints = (difference: number): string => {
  const sign = difference > 0 ? '+' : difference < 0 ? '−' : '';
  const points = (Math.abs(difference) * 100).toFixed(1).replace('.', ',').replace(/,0$/, '');
  return `${sign}${points} pp`;
};

// Parse "YYYY-MM-DD" as a calendar date (no time zone shift)
const parseDay = (value: string): Date => {
  const [y, m, d] = value.slice(0, 10).split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};

// "2026-10-16" -> "16 oct"
export const formatShortDay = (value: string): string => {
  const date = parseDay(value);
  return `${date.getDate()} ${SHORT_MONTHS[date.getMonth()]}`;
};

// "2026-10-16" -> "Joi, 16 oct"
export const formatWeekdayDay = (value: string): string => {
  const date = parseDay(value);
  const weekday = WEEKDAYS_LONG[(date.getDay() + 6) % 7];
  return `${weekday}, ${formatShortDay(value)}`;
};

// "2026-10-15" -> "Joi, 15 octombrie"
export const formatLongWeekdayDay = (value: string): string => {
  const date = parseDay(value);
  const weekday = WEEKDAYS_LONG[(date.getDay() + 6) % 7];
  return `${weekday}, ${date.getDate()} ${LONG_MONTHS[date.getMonth()]}`;
};

// "15 aug – 15 oct 2026"; the start gets its own year only when the years differ
export const formatDateRange = (start: string, end: string): string => {
  const startYear = parseDay(start).getFullYear();
  const endYear = parseDay(end).getFullYear();
  const endLabel = `${formatShortDay(end)} ${endYear}`;
  if (start.slice(0, 10) === end.slice(0, 10)) {
    return endLabel;
  }
  const startLabel = startYear === endYear ? formatShortDay(start) : `${formatShortDay(start)} ${startYear}`;
  return `${startLabel} – ${endLabel}`;
};

// Time left until a deadline, spelled out: "2 zile 4 ore", "4 ore 12 min", "45 min",
// or null when it has passed
export const formatCountdown = (deadline: string, now: Date = new Date()): string | null => {
  const ms = new Date(deadline).getTime() - now.getTime();
  if (isNaN(ms) || ms <= 0) {
    return null;
  }
  const minutes = Math.floor(ms / 60000);
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  if (days > 0) {
    const dayPart = pluralRo(days, 'zi', 'zile');
    return hours > 0 ? `${dayPart} ${pluralRo(hours, 'oră', 'ore')}` : dayPart;
  }
  if (hours > 0) {
    return `${pluralRo(hours, 'oră', 'ore')} ${minutes % 60} min`;
  }
  return minutes > 0 ? `${minutes} min` : 'mai puțin de 1 min';
};

// Local calendar date as YYYY-MM-DD
export const toISODate = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};
