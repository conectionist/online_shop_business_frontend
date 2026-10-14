import React, { useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { ListStatsPoint } from '@/types/statistics';
import { formatNumber, formatRON, formatShortDay, formatWeekdayDay } from './format';
import BarChartBase, { BarDatum } from './BarChartBase';
import Panel, { Segmented } from './Panel';
import { THEME } from './theme';

type Metric = 'revenue' | 'orders' | 'average_order_value';
type View = 'chart' | 'table';

const METRICS: { value: Metric; label: string; format: (v: number) => string }[] = [
  { value: 'revenue', label: 'Încasări', format: formatRON },
  { value: 'orders', label: 'Comenzi', format: formatNumber },
  { value: 'average_order_value', label: 'Valoare medie', format: formatRON },
];

interface ListsTrendBarChartProps {
  lists: ListStatsPoint[];
  // The list still taking orders is drawn lighter: its figures are not final
  currentListId?: number;
  isLoading: boolean;
  isRefreshing: boolean;
  isError?: boolean;
}

const ListsTrendBarChart: React.FC<ListsTrendBarChartProps> = ({
  lists,
  currentListId,
  isLoading,
  isRefreshing,
  isError,
}) => {
  const [metric, setMetric] = useState<Metric>('revenue');
  const [view, setView] = useState<View>('chart');
  const metricDef = METRICS.find((m) => m.value === metric)!;

  // The best finished list gets its value printed on top
  const finished = lists.filter((l) => l.list_id !== currentListId);
  const peakId = finished.length
    ? finished.reduce((best, l) => (l[metric] > best[metric] ? l : best)).list_id
    : null;

  const data = lists.map((point): BarDatum => {
    const inProgress = point.list_id === currentListId;
    return {
      key: point.list_id,
      label: formatShortDay(point.data),
      ariaLabel: `${formatWeekdayDay(point.data)}: ${metricDef.format(point[metric])}${inProgress ? ' (în curs)' : ''}`,
      segments: [{ value: point[metric], color: THEME.crust }],
      inProgress,
      annotation: inProgress ? 'în curs' : point.list_id === peakId ? metricDef.format(point[metric]) : undefined,
      annotationTone: inProgress ? 'muted' : 'strong',
    };
  });
  const hasCurrent = data.some((d) => d.inProgress);

  const renderTooltip = (index: number) => {
    const point = lists[index];
    const rows: { key: Metric; label: string; value: string }[] = [
      { key: 'revenue', label: 'Încasări', value: formatRON(point.revenue) },
      { key: 'orders', label: 'Comenzi', value: formatNumber(point.orders) },
      { key: 'average_order_value', label: 'Valoare medie', value: formatRON(point.average_order_value) },
    ];
    return (
      <>
        <p className="font-semibold">
          {formatWeekdayDay(point.data)}
          {point.list_id === currentListId && <span className="ml-1 font-normal text-gray-300">(în curs)</span>}
        </p>
        <dl className="mt-1 grid grid-cols-[auto_auto] gap-x-4 gap-y-0.5 tabular-nums">
          {rows.map((row) => (
            <React.Fragment key={row.key}>
              <dt className="text-gray-300">{row.label}</dt>
              <dd className={`text-right font-semibold ${row.key === metric ? 'text-amber-300' : 'text-white'}`}>
                {row.value}
              </dd>
            </React.Fragment>
          ))}
        </dl>
      </>
    );
  };

  return (
    <Panel
      title="Evoluție pe liste"
      subtitle={`${metricDef.label} pentru fiecare listă (dată de livrare)`}
      icon={BarChart3}
      isLoading={isLoading}
      isRefreshing={isRefreshing}
      isError={isError}
      isEmpty={lists.length === 0}
      placeholderHeight={280}
      actions={
        <div className="flex flex-wrap gap-2">
          <Segmented ariaLabel="Indicator" options={METRICS} value={metric} onChange={setMetric} />
          <Segmented
            ariaLabel="Mod de afișare"
            options={[
              { value: 'chart', label: 'Grafic' },
              { value: 'table', label: 'Tabel' },
            ]}
            value={view}
            onChange={setView}
          />
        </div>
      }
    >
      {view === 'chart' ? (
        <>
          <BarChartBase
            data={data}
            ariaLabel={`${metricDef.label} pe liste`}
            renderTooltip={renderTooltip}
          />
          {hasCurrent && (
            <p className="mt-3 flex items-center gap-1.5 text-xs text-gray-600">
              <span
                className="inline-block h-2.5 w-2.5 rounded-sm border"
                style={{ backgroundColor: THEME.crustWash, borderColor: THEME.crust }}
                aria-hidden="true"
              />
              Lista curentă – încă primește comenzi
            </p>
          )}
        </>
      ) : (
        <div className="max-h-[320px] overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white">
              <tr className="border-b text-left text-xs text-gray-600">
                <th className="py-2 pr-3 font-medium">Livrare</th>
                <th className="py-2 pr-3 text-right font-medium">Comenzi</th>
                <th className="py-2 pr-3 text-right font-medium">Încasări</th>
                <th className="py-2 text-right font-medium">Valoare medie</th>
              </tr>
            </thead>
            <tbody className="tabular-nums">
              {[...lists].reverse().map((point) => (
                <tr key={point.list_id} className="border-b border-gray-100 last:border-0">
                  <td className="py-2 pr-3 text-gray-800">
                    {formatWeekdayDay(point.data)}
                    {point.list_id === currentListId && <span className="ml-1 text-xs text-gray-500">(în curs)</span>}
                  </td>
                  <td className="py-2 pr-3 text-right">{formatNumber(point.orders)}</td>
                  <td className="py-2 pr-3 text-right">{formatRON(point.revenue)}</td>
                  <td className="py-2 text-right">{formatRON(point.average_order_value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
};

export default ListsTrendBarChart;
