import React from 'react';
import { THEME } from './theme';

export interface RankedBarItem {
  key: string | number;
  label: string;
  value: number;
  // Text shown at the bar's end (formatted value, share, ...)
  valueLabel: string;
  detail?: string;
}

interface RankedBarsProps {
  items: RankedBarItem[];
  ariaLabel: string;
  color?: string;
}

// Horizontal bars in plain HTML: long Romanian labels wrap instead of being clipped,
// and every value is printed, so no tooltip is needed to read it.
const RankedBars: React.FC<RankedBarsProps> = ({ items, ariaLabel, color = THEME.crust }) => {
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <ul className="space-y-3" aria-label={ariaLabel}>
      {items.map((item) => (
        <li key={item.key}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 text-gray-800">{item.label}</span>
            <span className="shrink-0 font-medium tabular-nums text-gray-900">{item.valueLabel}</span>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full"
                style={{ width: `${(item.value / max) * 100}%`, backgroundColor: color }}
              />
            </div>
            {item.detail && (
              <span className="w-24 shrink-0 text-right text-xs tabular-nums text-gray-500">{item.detail}</span>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
};

export default RankedBars;
