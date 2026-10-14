import React from 'react';
import { UserPlus } from 'lucide-react';
import { ListStatsPoint } from '@/types/statistics';
import { formatNumber, formatPercent, formatShortDay, formatWeekdayDay, pluralRo } from './format';
import BarChartBase, { BarDatum } from './BarChartBase';
import Panel from './Panel';
import { THEME } from './theme';

interface CustomerMixBarChartProps {
  lists: ListStatsPoint[];
  // Unique customers in the period, the base for the new-customer share
  uniqueCustomers?: number;
  currentListId?: number;
  isLoading: boolean;
  isRefreshing: boolean;
}

const SERIES = [
  { key: 'returning_customers', label: 'Clienți recurenți', color: THEME.crust },
  { key: 'new_customers', label: 'Clienți noi', color: THEME.teal },
] as const;

const CustomerMixBarChart: React.FC<CustomerMixBarChartProps> = ({
  lists,
  uniqueCustomers,
  currentListId,
  isLoading,
  isRefreshing,
}) => {
  const totalNew = lists.reduce((sum, p) => sum + p.new_customers, 0);
  const kicker = `${totalNew === 1 ? '1 client nou atras' : `${pluralRo(totalNew, 'client nou', 'clienți noi')} atrași`} în această perioadă${
    uniqueCustomers ? ` (${formatPercent(totalNew / uniqueCustomers)} din total)` : ''
  }`;

  const data: BarDatum[] = lists.map((point) => ({
    key: point.list_id,
    label: formatShortDay(point.data),
    ariaLabel: `${formatWeekdayDay(point.data)}: ${formatNumber(point.returning_customers)} recurenți, ${formatNumber(point.new_customers)} noi`,
    segments: SERIES.map((s) => ({ value: point[s.key], color: s.color })),
    inProgress: point.list_id === currentListId,
  }));

  const renderTooltip = (index: number) => {
    const point = lists[index];
    return (
      <>
        <p className="font-semibold">
          {formatWeekdayDay(point.data)}
          {point.list_id === currentListId && <span className="ml-1 font-normal text-gray-300">(în curs)</span>}
        </p>
        <ul className="mt-1 space-y-0.5 tabular-nums">
          {SERIES.map((s) => (
            <li key={s.key} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-gray-300">
                <span className="h-0.5 w-3 rounded-full" style={{ backgroundColor: s.color }} aria-hidden="true" />
                {s.label}
              </span>
              <span className="font-semibold">{formatNumber(point[s.key])}</span>
            </li>
          ))}
          {point.customers > 0 && (
            <li className="pt-0.5 text-gray-300">{formatPercent(point.new_customers / point.customers)} clienți noi</li>
          )}
        </ul>
      </>
    );
  };

  return (
    <Panel
      title="Compoziție clienți"
      subtitle="Clienți recurenți și clienți noi pe fiecare listă"
      icon={UserPlus}
      isLoading={isLoading}
      isRefreshing={isRefreshing}
      isEmpty={lists.length === 0}
      placeholderHeight={280}
    >
      <p className="text-sm font-medium text-gray-900">{kicker}</p>
      <ul className="mt-2 flex flex-wrap gap-4 text-xs text-gray-600" aria-label="Legendă">
        {SERIES.map((s) => (
          <li key={s.key} className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: s.color }} aria-hidden="true" />
            {s.label}
          </li>
        ))}
      </ul>
      <BarChartBase
        data={data}
        ariaLabel="Clienți recurenți și noi pe liste"
        renderTooltip={renderTooltip}
        formatTick={formatNumber}
        height={208}
      />
    </Panel>
  );
};

export default CustomerMixBarChart;
