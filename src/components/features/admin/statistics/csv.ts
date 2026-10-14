import {
  CustomerStatsResponse,
  ProductStatsResponse,
  StatsOverview,
  StatsSummary,
} from '@/types/statistics';
import { formatDateShortRomanian } from '@/utils/dateFormatters';
import { formatWeekdayDay } from './format';
import { displayPhone } from './phone';

export type CsvCell = string | number | null | undefined;
export type CsvRow = CsvCell[];

// Spreadsheets run cells that start like a formula; customer names come from the public
// order form, so such text gets a leading apostrophe
const FORMULA_START = /^[=+\-@\t\r]/;

const toCell = (value: CsvCell): string => {
  if (value === null || value === undefined) {
    return '';
  }
  const text = typeof value === 'number' ? String(value).replace('.', ',') : value;
  const safe = typeof value === 'string' && FORMULA_START.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
};

// UTF-8 with BOM, ";" between cells and CRLF line ends, as Excel expects in ro-RO
export const toCsv = (rows: CsvRow[]): string =>
  '﻿' + rows.map((row) => row.map(toCell).join(';')).join('\r\n');

export const downloadCsv = (filename: string, rows: CsvRow[]): void => {
  const blob = new Blob([toCsv(rows)], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 0);
};

// 0.7128 -> 71.3 (shown as "71,3")
const percentValue = (rate: number): number => Math.round(rate * 1000) / 10;
const oneDecimal = (value: number): number => Math.round(value * 10) / 10;

const header = (title: string, periodText: string, generatedAt: Date): CsvRow[] => [
  [title],
  ['Perioada', periodText],
  ['Generat la', generatedAt.toLocaleString('ro-RO')],
  [],
];

export const summaryRows = (overview: StatsOverview, periodText: string, generatedAt: Date = new Date()): CsvRow[] => {
  const s = overview.summary;
  const p = overview.previous_summary;
  const row = (label: string, pick: (summary: StatsSummary) => number): CsvRow => [
    label,
    pick(s),
    p ? pick(p) : null,
  ];
  return [
    ...header('Statistici – sumar', periodText, generatedAt),
    ['Indicator', 'Valoare', 'Perioada anterioară'],
    row('Încasări (RON)', (x) => x.revenue),
    row('Comenzi', (x) => x.orders),
    row('Produse comandate (buc)', (x) => x.items_sold),
    row('Valoare medie comandă (RON)', (x) => oneDecimal(x.average_order_value)),
    row('Clienți unici', (x) => x.unique_customers),
    row('Clienți care au mai comandat', (x) => x.returning_customers),
    row('Rata clienților fideli (%)', (x) => percentValue(x.repeat_customer_rate)),
    row('Comenzi anulate', (x) => x.cancelled_orders),
    row('Rata anulărilor (%)', (x) => percentValue(x.cancelled_rate)),
    [],
    ['Evoluție pe liste'],
    ['Livrare', 'Comenzi', 'Încasări (RON)', 'Valoare medie (RON)', 'Clienți', 'Clienți noi', 'Clienți recurenți'],
    ...overview.lists.map((l) => [
      formatWeekdayDay(l.data),
      l.orders,
      l.revenue,
      oneDecimal(l.average_order_value),
      l.customers,
      l.new_customers,
      l.returning_customers,
    ]),
  ];
};

export const productRows = (
  products: ProductStatsResponse,
  periodText: string,
  generatedAt: Date = new Date()
): CsvRow[] => [
  ...header('Statistici – top produse', periodText, generatedAt),
  ['Poziție', 'Produs', 'Categorie', 'Cantitate (buc)', 'Încasări (RON)', 'Comenzi'],
  ...products.top_by_revenue.map((p, index) => [
    index + 1,
    p.name,
    p.category_name ?? '',
    p.quantity,
    p.revenue,
    p.orders,
  ]),
  [],
  ['Încasări pe categorii'],
  ['Categorie', 'Cantitate (buc)', 'Încasări (RON)'],
  ...products.categories.map((c) => [c.name, c.quantity, c.revenue]),
  [],
  ['Produse epuizate'],
  ['Produs', 'Categorie', 'Liste în care s-a epuizat', 'Liste în care a fost oferit'],
  ...products.sell_outs.map((p) => [p.name, p.category_name ?? '', p.sold_out, p.offered]),
];

export const customerRows = (
  customers: CustomerStatsResponse,
  periodText: string,
  generatedAt: Date = new Date()
): CsvRow[] => [
  ...header('Statistici – activitate clienți', periodText, generatedAt),
  ['Client', 'Telefon', 'Comenzi', 'Liste', 'Încasări (RON)', 'Ultima comandă'],
  ...customers.top_customers.map((c) => [
    c.name,
    c.phone_number ? displayPhone(c.phone_number) : '',
    c.orders,
    c.lists,
    c.revenue,
    formatDateShortRomanian(c.last_order_date),
  ]),
];
