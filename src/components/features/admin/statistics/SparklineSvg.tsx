import React, { useState } from 'react';
import { THEME } from './theme';

interface SparklineSvgProps {
  // Per-list values, oldest first
  values: number[];
  // 'wide' fills its container, adds an area wash and a hover readout (hero figure)
  variant?: 'inline' | 'wide';
  // wide only: what the readout says for each point
  labels?: string[];
  formatValue?: (value: number) => string;
}

const toPoints = (values: number[], width: number, height: number, padX: number, padY: number) => {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  return values.map((v, i) => {
    const x = padX + (i / (values.length - 1)) * (width - padX * 2);
    const y = padY + (1 - (v - min) / span) * (height - padY * 2);
    return [x, y] as const;
  });
};

const InlineSparkline: React.FC<{ values: number[] }> = ({ values }) => {
  const width = 96;
  const height = 32;
  const points = toPoints(values, width, height, 5, 5);
  const [lastX, lastY] = points[points.length - 1];
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true" className="shrink-0">
      <polyline
        points={points.map(([x, y]) => `${x},${y}`).join(' ')}
        fill="none"
        stroke={THEME.muted}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx={lastX} cy={lastY} r={4} fill={THEME.crust} stroke="#ffffff" strokeWidth={2} />
    </svg>
  );
};

// The SVG stretches to the container (x in percent), so strokes opt out of scaling and
// the dots are HTML elements that stay round.
const WIDTH = 100;
const HEIGHT = 40;

const WideSparkline: React.FC<Omit<SparklineSvgProps, 'variant'>> = ({ values, labels, formatValue }) => {
  const [active, setActive] = useState<number | null>(null);
  const points = toPoints(values, WIDTH, HEIGHT, 1.5, 4);
  const line = points.map(([x, y]) => `${x},${y}`).join(' ');
  const [firstX] = points[0];
  const [lastX, lastY] = points[points.length - 1];
  const area = `M${firstX},${HEIGHT} L${line.split(' ').join(' L')} L${lastX},${HEIGHT} Z`;
  const interactive = Boolean(labels && formatValue);

  // Snap the pointer to the nearest list
  const track = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    if (!rect.width) {
      return;
    }
    const x = ((event.clientX - rect.left) / rect.width) * WIDTH;
    let nearest = 0;
    points.forEach(([px], i) => {
      if (Math.abs(px - x) < Math.abs(points[nearest][0] - x)) {
        nearest = i;
      }
    });
    setActive(nearest);
  };

  const dot = (x: number, y: number, emphasis: boolean) => (
    <span
      className={`absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full ${
        emphasis ? 'h-5 w-5 bg-[#b4561b]/15' : 'h-3 w-3'
      }`}
      style={{ left: `${x}%`, top: `${(y / HEIGHT) * 100}%` }}
    >
      <span className="h-2.5 w-2.5 rounded-full ring-2 ring-white" style={{ backgroundColor: THEME.crust }} />
    </span>
  );

  const activePoint = active !== null ? points[active] : null;
  // Keep the readout inside the card near either end
  const position = active === null ? 0 : active / (values.length - 1);
  const readoutAlign = position > 0.7 ? '-translate-x-full' : position < 0.3 ? '' : '-translate-x-1/2';

  return (
    <div
      className={`relative h-16 w-full ${interactive ? 'cursor-crosshair touch-none' : ''}`}
      aria-hidden="true"
      onPointerMove={interactive ? track : undefined}
      onPointerDown={interactive ? track : undefined}
      onPointerLeave={interactive ? () => setActive(null) : undefined}
    >
      <svg
        className="absolute inset-0 h-full w-full overflow-visible"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="none"
      >
        <path d={area} fill={THEME.crust} fillOpacity={0.1} />
        <polyline
          points={line}
          fill="none"
          stroke={THEME.muted}
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        {activePoint && (
          <line
            x1={activePoint[0]}
            x2={activePoint[0]}
            y1={0}
            y2={HEIGHT}
            stroke="#d1d5db"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>
      {/* The latest list is always marked; the hovered one gets its own dot */}
      {dot(lastX, lastY, true)}
      {activePoint && active !== values.length - 1 && dot(activePoint[0], activePoint[1], false)}
      {activePoint && active !== null && labels && formatValue && (
        <span
          className={`pointer-events-none absolute -top-7 whitespace-nowrap rounded-md bg-[#1f1a15] px-2 py-1 text-xs text-white shadow-lg ${readoutAlign}`}
          style={{ left: `${activePoint[0]}%` }}
        >
          <span className="font-semibold">{formatValue(values[active])}</span>
          <span className="text-gray-300"> · {labels[active]}</span>
        </span>
      )}
    </div>
  );
};

// Trend line in the de-emphasis hue, with the latest list marked in the accent
const SparklineSvg: React.FC<SparklineSvgProps> = ({ values, variant = 'inline', labels, formatValue }) => {
  if (values.length < 2) {
    return null;
  }
  return variant === 'wide' ? (
    <WideSparkline values={values} labels={labels} formatValue={formatValue} />
  ) : (
    <InlineSparkline values={values} />
  );
};

export default SparklineSvg;
