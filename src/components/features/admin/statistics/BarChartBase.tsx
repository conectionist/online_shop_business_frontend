import React, { useId, useState } from 'react';
import { formatCompact } from './format';
import { labelStep, niceTicks } from './chartScale';
import { THEME } from './theme';

export interface BarSegment {
  value: number;
  color: string;
}

export interface BarDatum {
  key: string | number;
  // X-axis label
  label: string;
  // Full description for screen readers
  ariaLabel: string;
  // Stacked bottom-up
  segments: BarSegment[];
  // The list still taking orders: tinted, hatched and outlined
  inProgress?: boolean;
  // Short text above the bar (peak value, "în curs")
  annotation?: string;
  annotationTone?: 'strong' | 'muted';
}

interface BarChartBaseProps {
  data: BarDatum[];
  ariaLabel: string;
  renderTooltip: (index: number) => React.ReactNode;
  formatTick?: (value: number) => string;
  // Plot height in px
  height?: number;
}

// Hatched, lighter version of a segment's color for the in-progress list
const IN_PROGRESS_HATCH =
  'repeating-linear-gradient(135deg, rgba(255,255,255,0.72) 0 4px, rgba(255,255,255,0.5) 4px 7px)';

// Plain HTML/CSS columns: bars are sized in percent of the plot, so they stay crisp at
// any width without measuring the container, and text is ordinary HTML.
const BarChartBase: React.FC<BarChartBaseProps> = ({
  data,
  ariaLabel,
  renderTooltip,
  formatTick = formatCompact,
  height = 240,
}) => {
  const [active, setActive] = useState<number | null>(null);
  const tooltipId = useId();

  const totals = data.map((d) => d.segments.reduce((sum, s) => sum + s.value, 0));
  const ticks = niceTicks(Math.max(...totals, 0));
  const top = ticks[ticks.length - 1];
  const columns = { gridTemplateColumns: `repeat(${data.length}, minmax(0, 1fr))` };
  // Fewer x labels on phones than on wider screens
  const mobileStep = labelStep(data.length, 6);
  const desktopStep = labelStep(data.length, 12);

  const labelVisibility = (index: number) => {
    // Hidden labels stay in the grid (invisible, not display:none) so the rest keep their column
    const onMobile = index % mobileStep === 0 ? '' : 'invisible';
    const onDesktop = index % desktopStep === 0 ? 'sm:visible' : 'sm:invisible';
    return `${onMobile} ${onDesktop}`;
  };

  const position = active === null ? 0 : (active + 0.5) / data.length;
  // Keep the tooltip inside the card near either end
  const tooltipAlign = position < 0.25 ? '' : position > 0.75 ? '-translate-x-full' : '-translate-x-1/2';

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="relative select-none pt-5"
      onKeyDown={(event) => event.key === 'Escape' && setActive(null)}
    >
      <div className="flex" style={{ height }}>
        {/* Y axis */}
        <div className="relative w-10 shrink-0" aria-hidden="true">
          {ticks.map((tick) => (
            <span
              key={tick}
              className="absolute right-2 translate-y-1/2 text-[11px] tabular-nums text-gray-500"
              style={{ bottom: `${(tick / top) * 100}%` }}
            >
              {formatTick(tick)}
            </span>
          ))}
        </div>

        {/* Plot */}
        <div className="relative flex-1 border-b border-gray-300">
          {ticks.slice(1).map((tick) => (
            <div
              key={tick}
              className="absolute inset-x-0 border-t border-dashed border-gray-200"
              style={{ bottom: `${(tick / top) * 100}%` }}
              aria-hidden="true"
            />
          ))}
          <div className="absolute inset-0 grid" style={columns}>
            {data.map((datum, index) => {
              const total = totals[index];
              const isActive = active === index;
              return (
                <button
                  key={datum.key}
                  type="button"
                  aria-label={datum.ariaLabel}
                  aria-describedby={isActive ? tooltipId : undefined}
                  onMouseEnter={() => setActive(index)}
                  onMouseLeave={() => setActive(null)}
                  onFocus={() => setActive(index)}
                  onBlur={() => setActive(null)}
                  onClick={() => setActive(index)}
                  className={`relative flex h-full flex-col items-center justify-end rounded-t-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                    isActive ? 'bg-amber-50/70' : ''
                  }`}
                >
                  {datum.annotation && (
                    <span
                      className={`pointer-events-none absolute whitespace-nowrap text-[11px] tabular-nums ${
                        datum.annotationTone === 'muted' ? 'text-gray-500' : 'font-semibold text-[#8d3e0f]'
                      }`}
                      style={{ bottom: `calc(${(total / top) * 100}% + 4px)` }}
                    >
                      {datum.annotation}
                    </span>
                  )}
                  <span
                    className={`flex w-[60%] max-w-6 flex-col-reverse overflow-hidden rounded-t transition-opacity ${
                      datum.inProgress ? 'border border-b-0' : ''
                    } ${active !== null && !isActive ? 'opacity-70' : ''}`}
                    style={{
                      height: `${(total / top) * 100}%`,
                      minHeight: total > 0 ? 2 : 0,
                      borderColor: datum.inProgress ? THEME.crust : undefined,
                    }}
                  >
                    {datum.segments.map((segment, i) => (
                      <span
                        key={i}
                        // 2px surface gap between stacked segments
                        className={i > 0 ? 'border-b-2 border-white' : ''}
                        style={{
                          height: total > 0 ? `${(segment.value / total) * 100}%` : 0,
                          backgroundColor: segment.color,
                          backgroundImage: datum.inProgress ? IN_PROGRESS_HATCH : undefined,
                        }}
                      />
                    ))}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* X axis */}
      <div className="ml-10 grid pt-1.5" style={columns} aria-hidden="true">
        {data.map((datum, index) => (
          <span key={datum.key} className={`flex justify-center ${labelVisibility(index)}`}>
            <span className="whitespace-nowrap text-[11px] tabular-nums text-gray-500">{datum.label}</span>
          </span>
        ))}
      </div>

      {active !== null && data[active] && (
        <div
          id={tooltipId}
          role="tooltip"
          className={`pointer-events-none absolute top-0 z-20 min-w-44 rounded-lg bg-[#1f1a15] px-3 py-2 text-xs text-white shadow-xl ${tooltipAlign}`}
          style={{ left: `calc(2.5rem + (100% - 2.5rem) * ${position})` }}
        >
          {renderTooltip(active)}
        </div>
      )}
    </div>
  );
};

export default BarChartBase;
