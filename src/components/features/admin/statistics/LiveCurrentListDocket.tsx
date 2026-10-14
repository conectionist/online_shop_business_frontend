import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, CheckCircle2, ChevronDown, Clock, Radio, XCircle } from 'lucide-react';
import { CurrentListStats, StockItem } from '@/types/statistics';
import {
  formatCountdown,
  formatLongWeekdayDay,
  formatNumber,
  formatPercent,
  formatRON,
  pluralRo,
} from './format';
import { THEME } from './theme';

// Same threshold as the API's low_stock_count: 80% sold, under 20% left
const LOW_STOCK = 0.8;
const STOCK_PREVIEW = 4;
const CLOSING_SOON_MS = 6 * 60 * 60 * 1000;

interface LiveCurrentListDocketProps {
  data?: CurrentListStats;
  isLoading: boolean;
}

// Re-render on a timer so the countdown keeps moving between refetches
const useNow = (intervalMs: number): Date => {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
};

const Metric: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="rounded-lg border border-amber-100 bg-white/80 p-4">
    <dt className="text-sm font-medium text-gray-600">{label}</dt>
    <dd className="mt-1">{children}</dd>
  </div>
);

const StockRow: React.FC<{ item: StockItem; className?: string }> = ({ item, className = '' }) => {
  const soldOut = item.sell_through >= 1;
  const low = !soldOut && item.sell_through >= LOW_STOCK;
  const fill = soldOut ? 'bg-rose-600' : low ? 'bg-amber-500' : 'bg-gray-400';
  const status = soldOut ? 'Epuizat' : item.remaining === 1 ? '1 rămas' : `${formatNumber(item.remaining)} rămase`;
  return (
    <li className={`py-2 ${className}`}>
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="flex min-w-0 items-center gap-1.5 font-medium text-gray-900">
          {soldOut && <XCircle className="h-3.5 w-3.5 shrink-0 text-rose-600" aria-label="Epuizat" />}
          {low && <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-600" aria-label="Stoc critic" />}
          <span className="truncate">{item.name}</span>
        </span>
        <span className="shrink-0 tabular-nums text-gray-700">
          {formatNumber(item.ordered)} / {formatNumber(item.stock)}{' '}
          <span className={`text-xs ${soldOut ? 'font-semibold text-rose-700' : low ? 'text-amber-800' : 'text-gray-500'}`}>
            ({formatPercent(item.sell_through)} · {status})
          </span>
        </span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-gray-100">
        <div className={`h-full rounded-full ${fill}`} style={{ width: `${Math.min(item.sell_through, 1) * 100}%` }} />
      </div>
    </li>
  );
};

// The list taking orders right now, drawn as a bakery order docket. It does not follow
// the period filter: it is always the live list.
const LiveCurrentListDocket: React.FC<LiveCurrentListDocketProps> = ({ data, isLoading }) => {
  const [showAllStock, setShowAllStock] = useState(false);
  const now = useNow(30 * 1000);

  const shell = (children: React.ReactNode) => (
    <section
      aria-labelledby="live-list-title"
      className="rounded-xl border border-amber-200 border-t-4 border-t-amber-600 bg-gradient-to-b from-white to-amber-50/40 p-5 sm:p-6 print:break-inside-avoid print:bg-none"
    >
      <h2
        id="live-list-title"
        className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#8d3e0f]"
      >
        <Radio className="h-4 w-4" aria-hidden="true" />
        Lista curentă
      </h2>
      {children}
    </section>
  );

  if (isLoading) {
    return shell(<div className="mt-4 h-56 animate-pulse rounded-lg bg-amber-100/60" />);
  }
  if (!data?.list) {
    return shell(<p className="mt-4 text-sm text-gray-600">Nu există nicio listă curentă.</p>);
  }

  const { list, previous } = data;
  const msLeft = list.expiration_date ? new Date(list.expiration_date).getTime() - now.getTime() : null;
  const timeLeft = list.expiration_date ? formatCountdown(list.expiration_date, now) : null;
  const closingSoon = msLeft !== null && msLeft > 0 && msLeft < CLOSING_SOON_MS;
  const ordersRatio = previous?.orders ? data.orders / previous.orders : null;
  const ordersLink =
    data.orders === 0
      ? 'Vezi comenzile listei'
      : data.orders === 1
        ? 'Vezi comanda'
        : `Vezi cele ${pluralRo(data.orders, 'comandă', 'comenzi')}`;
  const stockLink = `/admin/lists/${list.id}/manage?tab=products2`;

  return shell(
    <>
      <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            {/* Rubber-stamp status */}
            <span
              className={`inline-flex -rotate-2 items-center rounded-sm border-2 px-2 py-0.5 text-xs font-bold uppercase tracking-widest ${
                list.is_published
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                  : 'border-gray-400 bg-gray-100 text-gray-700'
              }`}
            >
              {list.is_published ? 'Publicată' : 'Ciornă'}
            </span>
            <p className="text-xl font-bold text-gray-900 sm:text-2xl">Livrare: {formatLongWeekdayDay(list.data)}</p>
          </div>
          {list.expiration_date &&
            (timeLeft ? (
              <p
                className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm ${
                  closingSoon ? 'bg-amber-100 font-medium text-amber-900 ring-1 ring-amber-300' : 'bg-white/80 text-gray-700'
                }`}
              >
                <Clock
                  className={`h-4 w-4 ${closingSoon ? 'text-amber-600 motion-safe:animate-pulse' : 'text-gray-500'}`}
                  aria-hidden="true"
                />
                Comenzile se închid în: <span className="font-semibold tabular-nums">{timeLeft}</span>
              </p>
            ) : (
              <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-sm text-gray-700">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                Comenzile s-au închis · În faza de producție
              </p>
            ))}
        </div>
        <Link
          to={`/admin/lists/${list.id}/manage?tab=orders`}
          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md bg-[#b4561b] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#8d3e0f] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 print:hidden"
        >
          {ordersLink}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      <dl className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Metric label="Comenzi">
          <p className="text-3xl font-bold text-gray-900">{formatNumber(data.orders)}</p>
          <p className="text-xs text-gray-600">de la {pluralRo(data.customers, 'client', 'clienți')}</p>
          {previous && (
            <div className="mt-2">
              <div
                className="h-1.5 overflow-hidden rounded-full bg-amber-100"
                role="meter"
                aria-label="Comenzi față de lista anterioară"
                aria-valuemin={0}
                aria-valuemax={previous.orders}
                aria-valuenow={data.orders}
              >
                <div
                  className="h-full rounded-full"
                  style={{ width: `${Math.min(ordersRatio ?? 0, 1) * 100}%`, backgroundColor: THEME.crust }}
                />
              </div>
              <p className="mt-1 text-xs text-gray-600">
                {ordersRatio !== null
                  ? `${formatPercent(ordersRatio)} din lista anterioară (${formatNumber(previous.orders)})`
                  : 'Lista anterioară nu a avut comenzi'}
              </p>
            </div>
          )}
        </Metric>
        <Metric label="Încasări curente">
          <p className="text-3xl font-bold text-gray-900">
            {formatNumber(data.revenue)} <span className="text-base font-semibold text-gray-600">RON</span>
          </p>
          {previous && <p className="text-xs text-gray-600">lista anterioară: {formatRON(previous.revenue)}</p>}
        </Metric>
        <Metric label="Produse de copt">
          <p className="text-3xl font-bold text-gray-900">
            {formatNumber(data.items_sold)} <span className="text-base font-semibold text-gray-600">buc</span>
          </p>
          <p className="text-xs text-gray-600">comandate până acum</p>
        </Metric>
      </dl>

      {data.stock.length > 0 && (
        <div className="mt-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-gray-900">Stoc</h3>
            <div className="flex flex-wrap gap-1.5 text-xs">
              {data.sold_out_count > 0 && (
                <Link
                  to={stockLink}
                  className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 font-semibold text-rose-700 ring-1 ring-rose-200 hover:bg-rose-100"
                >
                  <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
                  {data.sold_out_count} epuizate
                </Link>
              )}
              {data.low_stock_count > 0 && (
                <Link
                  to={stockLink}
                  className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 font-semibold text-amber-900 ring-1 ring-amber-200 hover:bg-amber-100"
                >
                  <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                  {data.low_stock_count} stoc critic
                </Link>
              )}
              {data.sold_out_count === 0 && data.low_stock_count === 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-800">
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Stoc suficient
                </span>
              )}
            </div>
          </div>
          {/* Rows past the preview stay in the printout, so the kitchen sees every product */}
          <ul className="mt-2 divide-y divide-amber-100">
            {data.stock.map((item, index) => (
              <StockRow
                key={item.product_id}
                item={item}
                className={!showAllStock && index >= STOCK_PREVIEW ? 'hidden print:block' : ''}
              />
            ))}
          </ul>
          {data.stock.length > STOCK_PREVIEW && (
            <button
              type="button"
              onClick={() => setShowAllStock((v) => !v)}
              aria-expanded={showAllStock}
              className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-[#8d3e0f] hover:text-[#6b3210] print:hidden"
            >
              {showAllStock ? 'Arată mai puțin' : `Vezi tot stocul (${pluralRo(data.stock.length, 'produs', 'produse')})`}
              <ChevronDown
                className={`h-4 w-4 transition-transform ${showAllStock ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
            </button>
          )}
        </div>
      )}
    </>
  );
};

export default LiveCurrentListDocket;
