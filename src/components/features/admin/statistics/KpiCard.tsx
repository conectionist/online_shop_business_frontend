import React from 'react';
import { ArrowDownRight, ArrowUpRight, LucideIcon, Minus } from 'lucide-react';
import { formatDelta, formatPoints } from './format';
import SparklineSvg from './SparklineSvg';

interface KpiCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  hint?: React.ReactNode;
  // Extra badge beside the value (e.g. new customers)
  badge?: React.ReactNode;
  // Change vs the previous period (relative: 0.08 = +8%), null when not comparable
  delta?: number | null;
  // 'points' renders delta as percentage points (for rates): 0.089 -> +8,9 pp
  deltaKind?: 'relative' | 'points';
  // Whether an increase is good news (false for cancellations)
  goodWhenUp?: boolean;
  // Per-list values, oldest first, drawn as a sparkline
  trend?: number[];
  // Hero only: labels and value format for the sparkline readout
  trendLabels?: string[];
  formatTrend?: (value: number) => string;
  // The headline figure of the page: larger type and a full-width sparkline
  hero?: boolean;
  isLoading?: boolean;
  className?: string;
}

// Signed change vs the previous period, green or red depending on whether it is good news
export const DeltaPill: React.FC<{
  delta?: number | null;
  deltaKind?: 'relative' | 'points';
  goodWhenUp?: boolean;
}> = ({ delta, deltaKind = 'relative', goodWhenUp = true }) => {
  if (delta === undefined) {
    return null;
  }
  if (delta === null) {
    return <span className="text-xs text-gray-500">fără comparație</span>;
  }
  const flat = Math.abs(delta) < 0.0005;
  const isGood = flat ? null : (delta > 0) === goodWhenUp;
  const DeltaIcon = flat ? Minus : delta > 0 ? ArrowUpRight : ArrowDownRight;
  const format = deltaKind === 'points' ? formatPoints : formatDelta;
  const tone =
    isGood === null
      ? 'bg-gray-100 text-gray-700'
      : isGood
        ? 'bg-emerald-50 text-emerald-700'
        : 'bg-rose-50 text-rose-700';
  return (
    <span className="inline-flex flex-wrap items-center gap-x-1.5 gap-y-1">
      <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ${tone}`}>
        <DeltaIcon className="h-3 w-3" aria-hidden="true" />
        <span>{format(flat ? 0 : delta)}</span>
      </span>
      <span className="text-xs text-gray-500">vs perioada anterioară</span>
    </span>
  );
};

const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  icon: Icon,
  hint,
  badge,
  delta,
  deltaKind,
  goodWhenUp,
  trend,
  trendLabels,
  formatTrend,
  hero = false,
  isLoading = false,
  className = '',
}) => {
  const heading = (
    <div className={`flex items-center gap-2 font-medium ${hero ? 'text-sm text-[#8d3e0f]' : 'text-sm text-gray-600'}`}>
      <Icon className={`h-4 w-4 shrink-0 ${hero ? '' : 'text-gray-500'}`} aria-hidden="true" />
      <span className="truncate">{label}</span>
    </div>
  );

  if (isLoading) {
    return (
      <div className={`rounded-xl border border-gray-200 bg-white p-4 ${className}`}>
        {heading}
        <div className="mt-3 space-y-2">
          <div className={`animate-pulse rounded bg-gray-100 ${hero ? 'h-14 w-56' : 'h-8 w-32'}`} />
          <div className="h-4 w-40 animate-pulse rounded bg-gray-100" />
        </div>
      </div>
    );
  }

  if (hero) {
    return (
      <div
        className={`flex flex-col rounded-xl border border-amber-200 border-t-4 border-t-[#b4561b] bg-white p-5 sm:p-6 ${className}`}
      >
        {heading}
        <p className="mt-3 text-[clamp(2.5rem,4vw,3.5rem)] leading-none font-bold tracking-tight text-gray-900">
          {value}
        </p>
        {hint && <p className="mt-2 text-sm text-gray-600">{hint}</p>}
        <div className="mt-3">
          <DeltaPill delta={delta} deltaKind={deltaKind} goodWhenUp={goodWhenUp} />
        </div>
        {trend && trend.length > 1 && (
          <div className="mt-auto pt-8">
            <SparklineSvg values={trend} variant="wide" labels={trendLabels} formatValue={formatTrend} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`rounded-xl border border-gray-200 bg-white p-4 ${className}`}>
      {heading}
      <div className="mt-2 flex items-end justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
          <p className="text-2xl font-semibold text-gray-900 sm:text-3xl">{value}</p>
          {badge}
        </div>
        {trend && <SparklineSvg values={trend} />}
      </div>
      {hint && <p className="mt-0.5 text-xs text-gray-600">{hint}</p>}
      <div className="mt-2 min-h-[1.25rem]">
        <DeltaPill delta={delta} deltaKind={deltaKind} goodWhenUp={goodWhenUp} />
      </div>
    </div>
  );
};

export default KpiCard;
