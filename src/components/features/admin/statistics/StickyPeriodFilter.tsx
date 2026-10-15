import React, { useEffect, useState } from 'react';
import { CalendarRange } from 'lucide-react';
import { StatsPeriod } from '@/types/statistics';
import { CustomRange, PERIOD_PRESETS, PeriodPreset } from './period';
import { checkCustomRange, describePeriod } from './period';

interface StickyPeriodFilterProps {
  preset: PeriodPreset;
  onPresetChange: (preset: PeriodPreset) => void;
  custom: CustomRange;
  onCustomChange: (range: CustomRange) => void;
  // Resolved period returned by the API, used for the summary line
  period?: StatsPeriod;
}

const FIELD =
  'rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500';

// Wait for typing to pause before loading a new custom range
const CUSTOM_DEBOUNCE_MS = 500;

interface CustomRangeInputsProps {
  custom: CustomRange;
  onCustomChange: (range: CustomRange) => void;
}

// Date inputs for a custom range. Edits stay local until they form a usable range, so
// half-typed dates never reach the API.
const CustomRangeInputs: React.FC<CustomRangeInputsProps> = ({ custom, onCustomChange }) => {
  const [draft, setDraft] = useState(custom);
  const check = checkCustomRange(draft);

  useEffect(() => {
    if (!check.usable || (draft.start_date === custom.start_date && draft.end_date === custom.end_date)) {
      return;
    }
    const id = setTimeout(() => onCustomChange(draft), CUSTOM_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [draft, check.usable, custom, onCustomChange]);

  return (
    <>
      <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
        De la
        <input
          type="date"
          value={draft.start_date}
          max={draft.end_date || undefined}
          onChange={(e) => setDraft({ ...draft, start_date: e.target.value })}
          className={FIELD}
        />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
        Până la
        <input
          type="date"
          value={draft.end_date}
          min={draft.start_date || undefined}
          onChange={(e) => setDraft({ ...draft, end_date: e.target.value })}
          className={FIELD}
        />
      </label>
      {check.message && (
        <p role="alert" className="text-xs text-rose-700 sm:basis-full">
          {check.message}
        </p>
      )}
    </>
  );
};

// Period dropdown that scopes every section below; sticks to the top of the viewport.
// The -mx-6/px-6 bleed matches the admin layout card's p-6, so the bar spans the card.
const StickyPeriodFilter: React.FC<StickyPeriodFilterProps> = ({
  preset,
  onPresetChange,
  custom,
  onCustomChange,
  period,
}) => {
  return (
    <div className="sticky top-0 z-30 -mx-6 border-y border-gray-200 bg-white/95 px-6 py-3 backdrop-blur-md print:static print:mx-0 print:border-0 print:px-0">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end print:hidden">
          <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
            Perioadă
            <select
              value={preset}
              onChange={(e) => onPresetChange(e.target.value as PeriodPreset)}
              className={`${FIELD} pr-8 font-medium sm:min-w-52`}
            >
              {PERIOD_PRESETS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          {preset === 'custom' && <CustomRangeInputs custom={custom} onCustomChange={onCustomChange} />}
        </div>

        {period && (
          <p className="flex items-start gap-1.5 text-xs font-medium text-gray-700 lg:text-right">
            <CalendarRange className="mt-px h-3.5 w-3.5 shrink-0 text-[#b4561b]" aria-hidden="true" />
            <span>{describePeriod(period)}</span>
          </p>
        )}
      </div>

      <p className="mt-2 text-xs text-gray-500 print:hidden">
        * Indicatorii de mai jos reflectă listele cu livrare în perioada selectată. Lista de mai sus rămâne mereu
        live.
      </p>
    </div>
  );
};

export default StickyPeriodFilter;
