import React, { useMemo, useState } from 'react';
import { Clock } from 'lucide-react';
import { HeatmapCell } from '@/types/statistics';
import { WEEKDAYS_LONG, WEEKDAYS_SHORT, formatPercent, pluralRo } from './format';
import Panel from './Panel';
import { HEATMAP_SCALE } from './theme';

interface OrdersHeatmapProps {
  cells: HeatmapCell[];
  isLoading: boolean;
  isRefreshing: boolean;
  isError?: boolean;
}

const HOURS = Array.from({ length: 24 }, (_, h) => h);
const PEAK_WINDOW_HOURS = 3;
const hour = (h: number) => `${String(h % 24).padStart(2, '0')}:00`;
const hourRange = (h: number) => `${hour(h)}–${hour(h + 1)}`;
const ordersLabel = (n: number) => pluralRo(n, 'comandă', 'comenzi');

// Desktop: a 7 × 24 matrix. Phones get a summary instead, since 168 cells are too small to tap.
const OrdersHeatmap: React.FC<OrdersHeatmapProps> = ({ cells, isLoading, isRefreshing, isError }) => {
  const [hovered, setHovered] = useState<HeatmapCell | null>(null);

  const { grid, max, total, busiestDay, busiestDayShare, peakWindow, topCells } = useMemo(() => {
    const grid: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
    for (const cell of cells) {
      grid[cell.weekday][cell.hour] = cell.orders;
    }
    const total = cells.reduce((sum, c) => sum + c.orders, 0);
    const dayTotals = grid.map((row) => row.reduce((a, b) => a + b, 0));
    const busiestDay = dayTotals.indexOf(Math.max(...dayTotals));

    // Busiest run of consecutive hours across the week; on a tie, the one centered on
    // the busier hour
    const hourTotals = HOURS.map((h) => grid.reduce((sum, row) => sum + row[h], 0));
    let peakWindow = 0;
    let best = -1;
    for (let h = 0; h <= 24 - PEAK_WINDOW_HOURS; h++) {
      const sum = hourTotals.slice(h, h + PEAK_WINDOW_HOURS).reduce((a, b) => a + b, 0);
      if (sum > best || (sum === best && hourTotals[h + 1] > hourTotals[peakWindow + 1])) {
        best = sum;
        peakWindow = h;
      }
    }

    const topCells = [...cells].filter((c) => c.orders > 0).sort((a, b) => b.orders - a.orders).slice(0, 3);
    return {
      grid,
      max: Math.max(0, ...cells.map((c) => c.orders)),
      total,
      busiestDay,
      busiestDayShare: total ? dayTotals[busiestDay] / total : 0,
      peakWindow,
      topCells,
    };
  }, [cells]);

  const colorFor = (value: number) => {
    if (value <= 0 || max === 0) {
      return HEATMAP_SCALE[0];
    }
    const bins = HEATMAP_SCALE.length - 1;
    return HEATMAP_SCALE[Math.max(1, Math.ceil((value / max) * bins))];
  };

  const peak = topCells[0];
  const readout = hovered
    ? `${WEEKDAYS_LONG[hovered.weekday]}, ${hourRange(hovered.hour)}: ${ordersLabel(hovered.orders)}`
    : peak
      ? `Vârf: ${WEEKDAYS_LONG[peak.weekday]}, ${hourRange(peak.hour)} (${ordersLabel(peak.orders)})`
      : '';

  return (
    <Panel
      title="Când se comandă"
      subtitle="Comenzi pe zi și oră (ora României)"
      icon={Clock}
      isLoading={isLoading}
      isRefreshing={isRefreshing}
      isError={isError}
      isEmpty={max === 0}
      placeholderHeight={220}
    >
      {/* Phones: peak day, peak hours and the three busiest slots */}
      <div className="space-y-3 sm:hidden">
        <dl className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-amber-50 p-3">
            <dt className="text-xs font-medium text-gray-600">Ziua de vârf</dt>
            <dd className="mt-0.5 text-base font-semibold text-gray-900">{WEEKDAYS_LONG[busiestDay]}</dd>
            <dd className="text-xs text-gray-600">{formatPercent(busiestDayShare)} din comenzi</dd>
          </div>
          <div className="rounded-lg bg-amber-50 p-3">
            <dt className="text-xs font-medium text-gray-600">Interval orar de vârf</dt>
            <dd className="mt-0.5 text-base font-semibold tabular-nums text-gray-900">
              {hour(peakWindow)} – {hour(peakWindow + PEAK_WINDOW_HOURS)}
            </dd>
            <dd className="text-xs text-gray-600">toată săptămâna</dd>
          </div>
        </dl>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-600">Top ferestre de comandă</h3>
          <ol className="mt-2 space-y-2">
            {topCells.map((cell, index) => (
              <li
                key={`${cell.weekday}-${cell.hour}`}
                className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 px-3 py-2 text-sm"
              >
                <span className="flex items-center gap-2">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-900">
                    {index + 1}
                  </span>
                  <span className="text-gray-900">
                    {WEEKDAYS_LONG[cell.weekday]}, <span className="tabular-nums">{hourRange(cell.hour)}</span>
                  </span>
                </span>
                <span className="shrink-0 text-xs tabular-nums text-gray-600">{ordersLabel(cell.orders)}</span>
              </li>
            ))}
          </ol>
        </div>
        <p className="text-xs text-gray-500">{ordersLabel(total)} în total</p>
      </div>

      {/* Wider screens: the full matrix */}
      <div className="hidden sm:block">
        <div role="grid" aria-label="Comenzi pe zi și oră">
          <div
            className="grid grid-cols-[2rem_repeat(24,minmax(0,1fr))] gap-[2px] text-[10px] text-gray-500"
            aria-hidden="true"
          >
            <span />
            {HOURS.map((h) => (
              <span key={h} className="text-center tabular-nums">
                {h % 3 === 0 ? h : ''}
              </span>
            ))}
          </div>
          {grid.map((row, weekday) => (
            <div key={weekday} role="row" className="mt-[2px] grid grid-cols-[2rem_repeat(24,minmax(0,1fr))] gap-[2px]">
              <span role="rowheader" className="self-center text-xs text-gray-600">
                {WEEKDAYS_SHORT[weekday]}
              </span>
              {row.map((value, h) => {
                const label = `${WEEKDAYS_LONG[weekday]}, ${hourRange(h)}: ${ordersLabel(value)}`;
                return (
                  <div
                    key={h}
                    role="gridcell"
                    tabIndex={-1}
                    aria-label={label}
                    title={label}
                    onMouseEnter={() => setHovered({ weekday, hour: h, orders: value })}
                    onMouseLeave={() => setHovered(null)}
                    className="h-6 rounded-[3px] outline-none ring-gray-900 hover:ring-1"
                    style={{ backgroundColor: colorFor(value) }}
                  />
                );
              })}
            </div>
          ))}
        </div>

        <div className="mt-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <p className="min-h-[1rem] text-xs text-gray-700" aria-live="polite">
            {readout}
          </p>
          <div className="flex items-center gap-1 text-[10px] text-gray-500" aria-hidden="true">
            <span className="mr-1">Puține</span>
            {HEATMAP_SCALE.map((color) => (
              <span key={color} className="h-3 w-4 rounded-[2px]" style={{ backgroundColor: color }} />
            ))}
            <span className="ml-1">Multe</span>
          </div>
        </div>
      </div>
    </Panel>
  );
};

export default OrdersHeatmap;
