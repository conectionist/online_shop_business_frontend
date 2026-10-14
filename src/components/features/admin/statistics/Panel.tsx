import React from 'react';
import { LucideIcon } from 'lucide-react';
import { EMPTY_MESSAGE } from './format';

const ERROR_MESSAGE = 'Nu s-au putut încărca datele.';

interface PanelProps {
  title: string;
  icon: LucideIcon;
  subtitle?: React.ReactNode;
  // Small count shown after the title
  badge?: React.ReactNode;
  // Controls shown on the right of the title (metric toggles etc.)
  actions?: React.ReactNode;
  isLoading?: boolean;
  // True while newer data loads: keep the old render, dimmed, instead of a skeleton
  isRefreshing?: boolean;
  // The request failed and there is nothing to show; takes precedence over isEmpty
  isError?: boolean;
  errorMessage?: string;
  isEmpty?: boolean;
  emptyMessage?: string;
  // Height of the skeleton / empty placeholder, matching the content it replaces
  placeholderHeight?: number;
  className?: string;
  children?: React.ReactNode;
}

// White card used by every section of the statistics page
const Panel: React.FC<PanelProps> = ({
  title,
  icon: Icon,
  subtitle,
  badge,
  actions,
  isLoading = false,
  isRefreshing = false,
  isError = false,
  errorMessage = ERROR_MESSAGE,
  isEmpty = false,
  emptyMessage = EMPTY_MESSAGE,
  placeholderHeight = 240,
  className = '',
  children,
}) => {
  return (
    <section
      className={`flex flex-col rounded-xl border border-gray-200 bg-white print:break-inside-avoid ${className}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 px-5 pt-5">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900">
            <Icon className="h-4 w-4 shrink-0 text-[#b4561b]" aria-hidden="true" />
            {title}
            {badge !== undefined && (
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold tabular-nums text-[#8d3e0f]">
                {badge}
              </span>
            )}
          </h2>
          {subtitle && <p className="mt-1 text-sm text-gray-600">{subtitle}</p>}
        </div>
        {actions && <div className="max-w-full print:hidden">{actions}</div>}
      </div>

      <div className={`flex-1 px-5 pb-5 pt-4 transition-opacity ${isRefreshing ? 'opacity-60' : ''}`}>
        {isLoading ? (
          <div
            className="animate-pulse rounded-md bg-gray-100"
            style={{ height: placeholderHeight }}
            aria-label="Se încarcă"
          />
        ) : isError ? (
          <div
            className="flex items-center justify-center rounded-md border border-dashed border-rose-200 px-4 text-center text-sm text-rose-700"
            style={{ minHeight: Math.min(placeholderHeight, 160) }}
          >
            {errorMessage}
          </div>
        ) : isEmpty ? (
          <div
            className="flex items-center justify-center rounded-md border border-dashed border-gray-200 px-4 text-center text-sm text-gray-500"
            style={{ minHeight: Math.min(placeholderHeight, 160) }}
          >
            {emptyMessage}
          </div>
        ) : (
          children
        )}
      </div>
    </section>
  );
};

export default Panel;

// "Vezi toate (N)" toggle under a list of products cut to its first rows
export const ShowAllButton: React.FC<{ expanded: boolean; total: number; onToggle: () => void }> = ({
  expanded,
  total,
  onToggle,
}) => (
  <button
    type="button"
    onClick={onToggle}
    aria-expanded={expanded}
    className="mt-2 text-sm font-medium text-[#8d3e0f] hover:text-[#6b3210] print:hidden"
  >
    {expanded ? 'Arată mai puțin' : `Vezi toate (${total})`}
  </button>
);

// Segmented control for metric and view toggles inside panels
interface SegmentedProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
}

export function Segmented<T extends string>({ options, value, onChange, ariaLabel }: SegmentedProps<T>) {
  return (
    <div role="group" aria-label={ariaLabel} className="inline-flex rounded-lg bg-gray-100 p-0.5 text-xs">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={`rounded-md px-2.5 py-1 font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
            value === option.value
              ? 'bg-white text-[#8d3e0f] shadow-sm ring-1 ring-amber-200'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
