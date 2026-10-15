import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, ChevronDown, Clock, Lock, PauseCircle, Radio, XCircle } from 'lucide-react';
import { CurrentListStats } from '@/types/statistics';
import {
  formatCountdown,
  formatLongWeekdayDay,
  formatNumber,
  formatPercent,
  formatRON,
  pluralRo,
  pluralWordRo,
} from './format';
import { ListStatus, listStatus } from './listStatus';
import { THEME } from './theme';
import { useNow } from './useNow';

const SOLD_OUT_PREVIEW = 4;
const CLOSING_SOON_MS = 6 * 60 * 60 * 1000;

const CHIP = 'mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm';

// Heading and rubber stamp per status: only a published list that has not expired takes
// orders, so only that one is "current"
const STATUS: Record<ListStatus, { heading: string; stamp: string; stampClass: string }> = {
  active: { heading: 'Lista curentă', stamp: 'Publicată', stampClass: 'border-emerald-600 bg-emerald-50 text-emerald-800' },
  expired: { heading: 'Ultima listă', stamp: 'Expirată', stampClass: 'border-rose-600 bg-rose-50 text-rose-800' },
  draft: { heading: 'Ultima listă', stamp: 'Ciornă', stampClass: 'border-gray-400 bg-gray-100 text-gray-700' },
};

interface LiveCurrentListDocketProps {
  data?: CurrentListStats;
  isLoading: boolean;
  // The request failed and there is nothing to show
  isError?: boolean;
}

const Metric: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="rounded-lg border border-amber-100 bg-white/80 p-4">
    <dt className="text-sm font-medium text-gray-600">{label}</dt>
    <dd className="mt-1">{children}</dd>
  </div>
);

// The list taking orders right now, or else the latest list, drawn as a bakery order
// docket. It does not follow the period filter: it is always live. Hidden when there are
// no lists at all.
const LiveCurrentListDocket: React.FC<LiveCurrentListDocketProps> = ({ data, isLoading, isError = false }) => {
  const [showAllSoldOut, setShowAllSoldOut] = useState(false);
  // Keeps the countdown moving between refetches
  const now = useNow(30 * 1000);

  const shell = (children: React.ReactNode, heading = STATUS.active.heading) => (
    <section
      aria-labelledby="live-list-title"
      className="rounded-xl border border-amber-200 border-t-4 border-t-amber-600 bg-gradient-to-b from-white to-amber-50/40 p-5 sm:p-6 print:break-inside-avoid print:bg-none"
    >
      <h2
        id="live-list-title"
        className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#8d3e0f]"
      >
        <Radio className="h-4 w-4" aria-hidden="true" />
        {heading}
      </h2>
      {children}
    </section>
  );

  if (isLoading) {
    return shell(<div className="mt-4 h-56 animate-pulse rounded-lg bg-amber-100/60" />);
  }
  if (isError) {
    return shell(<p className="mt-4 text-sm text-rose-700">Nu s-a putut încărca lista curentă.</p>);
  }
  if (!data?.list) {
    return null;
  }

  const { list, previous } = data;
  const status = listStatus(list, now);
  const { heading, stamp, stampClass } = STATUS[status];
  const msLeft = list.expiration_date ? new Date(list.expiration_date).getTime() - now.getTime() : null;
  const timeLeft = status === 'active' && list.expiration_date ? formatCountdown(list.expiration_date, now) : null;
  const closingSoon = timeLeft !== null && msLeft !== null && msLeft < CLOSING_SOON_MS;
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
              className={`inline-flex -rotate-2 items-center rounded-sm border-2 px-2 py-0.5 text-xs font-bold uppercase tracking-widest ${stampClass}`}
            >
              {stamp}
            </span>
            <p className="text-xl font-bold text-gray-900 sm:text-2xl">Livrare: {formatLongWeekdayDay(list.data)}</p>
          </div>
          {status === 'active' ? (
            <p
              className={`${CHIP} ${
                closingSoon ? 'bg-amber-100 font-medium text-amber-900 ring-1 ring-amber-300' : 'bg-white/80 text-gray-700'
              }`}
            >
              {timeLeft ? (
                <Clock
                  className={`h-4 w-4 ${closingSoon ? 'text-amber-600 motion-safe:animate-pulse' : 'text-gray-500'}`}
                  aria-hidden="true"
                />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
              )}
              <span>
                Se pot primi comenzi
                {timeLeft && (
                  <>
                    {' · lista expiră în '}
                    <span className="font-semibold tabular-nums">{timeLeft}</span>
                  </>
                )}
              </span>
            </p>
          ) : (
            <p className={`${CHIP} bg-white/80 text-gray-700`}>
              {status === 'expired' ? (
                <Lock className="h-4 w-4 text-gray-500" aria-hidden="true" />
              ) : (
                <PauseCircle className="h-4 w-4 text-gray-500" aria-hidden="true" />
              )}
              {status === 'expired' ? 'Nu se mai pot primi comenzi' : 'Nu se pot primi comenzi încă'}
            </p>
          )}
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
            {formatNumber(data.items_sold)}{' '}
            <span className="text-base font-semibold text-gray-600">{pluralWordRo(data.items_sold, 'bucată', 'bucăți')}</span>
          </p>
          <p className="text-xs text-gray-600">{data.items_sold === 1 ? 'comandată' : 'comandate'} până acum</p>
        </Metric>
      </dl>

      <div className="mt-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            Produse epuizate
            {data.sold_out.length > 0 && (
              <span className="rounded-full bg-rose-50 px-2 py-0.5 text-xs font-semibold tabular-nums text-rose-700 ring-1 ring-rose-200">
                {data.sold_out.length}
              </span>
            )}
          </h3>
          <Link
            to={stockLink}
            className="inline-flex items-center gap-1 text-sm font-medium text-[#8d3e0f] hover:text-[#6b3210] print:hidden"
          >
            Gestionează produsele
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        {data.sold_out.length === 0 ? (
          <p className="mt-2 flex items-center gap-1.5 text-sm text-emerald-800">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            Niciun produs epuizat până acum
          </p>
        ) : (
          <>
            {/* Rows past the preview stay in the printout, so the kitchen sees every product */}
            <ul className="mt-2 divide-y divide-amber-100" aria-label="Produse epuizate">
              {data.sold_out.map((item, index) => (
                <li
                  key={item.product_id}
                  className={`items-baseline justify-between gap-3 py-2 text-sm ${
                    !showAllSoldOut && index >= SOLD_OUT_PREVIEW ? 'hidden print:flex' : 'flex'
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-1.5 font-medium text-gray-900">
                    <XCircle className="h-3.5 w-3.5 shrink-0 text-rose-600" aria-hidden="true" />
                    <span className="truncate">{item.name}</span>
                  </span>
                  {/* Counted in pieces: the product's unit describes one piece ("500 gr") */}
                  <span className="shrink-0 tabular-nums text-gray-600">
                    {pluralRo(item.ordered, 'bucată comandată', 'bucăți comandate')}
                  </span>
                </li>
              ))}
            </ul>
            {data.sold_out.length > SOLD_OUT_PREVIEW && (
              <button
                type="button"
                onClick={() => setShowAllSoldOut((v) => !v)}
                aria-expanded={showAllSoldOut}
                className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-[#8d3e0f] hover:text-[#6b3210] print:hidden"
              >
                {showAllSoldOut ? 'Arată mai puțin' : `Vezi toate (${data.sold_out.length})`}
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${showAllSoldOut ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                />
              </button>
            )}
          </>
        )}
      </div>
    </>,
    heading
  );
};

export default LiveCurrentListDocket;
