import React from 'react';
import { Ban, Receipt, Repeat, ShoppingCart, Users, Wallet } from 'lucide-react';
import { ListStatsPoint, StatsSummary } from '@/types/statistics';
import {
  computeDelta,
  formatNumber,
  formatPercent,
  formatRON,
  formatShortDay,
} from './format';
import KpiCard from './KpiCard';

interface KpiLedgerProps {
  summary?: StatsSummary;
  previous?: StatsSummary | null;
  lists: ListStatsPoint[];
  isLoading: boolean;
  isRefreshing: boolean;
}

// Headline revenue plus the supporting KPIs for the selected period
const KpiLedger: React.FC<KpiLedgerProps> = ({ summary, previous, lists, isLoading, isRefreshing }) => {
  // Deltas only make sense when the API returned a comparison period
  const delta = (pick: (s: StatsSummary) => number) =>
    summary ? (previous ? computeDelta(pick(summary), pick(previous)) : null) : undefined;
  const newCustomers = lists.reduce((sum, l) => sum + l.new_customers, 0);

  return (
    <section
      aria-label="Indicatori principali"
      className={`grid grid-cols-1 gap-4 transition-opacity lg:grid-cols-12 ${isRefreshing ? 'opacity-60' : ''}`}
    >
      <KpiCard
        hero
        className="lg:col-span-5"
        label="Încasări"
        icon={Wallet}
        value={summary ? formatRON(summary.revenue) : '–'}
        hint="din produse, fără taxa de livrare"
        delta={delta((s) => s.revenue)}
        trend={lists.map((l) => l.revenue)}
        trendLabels={lists.map((l) => formatShortDay(l.data))}
        formatTrend={formatRON}
        isLoading={isLoading}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-7">
        <KpiCard
          label="Comenzi"
          icon={ShoppingCart}
          value={summary ? formatNumber(summary.orders) : '–'}
          hint={summary ? `${formatNumber(summary.items_sold)} produse comandate` : undefined}
          delta={delta((s) => s.orders)}
          trend={lists.map((l) => l.orders)}
          isLoading={isLoading}
        />
        <KpiCard
          label="Valoare medie comandă"
          icon={Receipt}
          value={summary ? formatRON(summary.average_order_value) : '–'}
          delta={delta((s) => s.average_order_value)}
          trend={lists.map((l) => l.average_order_value)}
          isLoading={isLoading}
        />
        <KpiCard
          label="Clienți unici"
          icon={Users}
          value={summary ? formatNumber(summary.unique_customers) : '–'}
          badge={
            newCustomers > 0 ? (
              <span className="rounded-full bg-teal-50 px-2 py-0.5 text-xs font-semibold text-teal-800">
                +{formatNumber(newCustomers)} {newCustomers === 1 ? 'nou' : 'noi'}
              </span>
            ) : undefined
          }
          hint="identificați după telefon sau nume"
          delta={delta((s) => s.unique_customers)}
          trend={lists.map((l) => l.customers)}
          isLoading={isLoading}
        />
        <KpiCard
          label="Clienți fideli"
          icon={Repeat}
          value={summary ? formatPercent(summary.repeat_customer_rate) : '–'}
          hint={summary ? `${formatNumber(summary.returning_customers)} au mai comandat înainte` : undefined}
          delta={summary ? (previous ? summary.repeat_customer_rate - previous.repeat_customer_rate : null) : undefined}
          deltaKind="points"
          isLoading={isLoading}
        />
        <KpiCard
          className="sm:col-span-2"
          label="Comenzi anulate"
          icon={Ban}
          value={summary ? formatNumber(summary.cancelled_orders) : '–'}
          hint={summary ? `${formatPercent(summary.cancelled_rate)} din total` : undefined}
          delta={delta((s) => s.cancelled_orders)}
          goodWhenUp={false}
          isLoading={isLoading}
        />
      </div>
    </section>
  );
};

export default KpiLedger;
