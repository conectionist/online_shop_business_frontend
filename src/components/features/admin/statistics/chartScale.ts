// Axis helpers for the bar charts

// Round ticks from 0 to just above max, in 1 / 2 / 2,5 / 5 × 10^k steps.
// Every value plotted is a whole number, so the step never drops below 1.
export const niceTicks = (max: number, count = 4): number[] => {
  if (!(max > 0)) {
    return [0, 1];
  }
  const rough = max / count;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const step = Math.max(1, [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s >= rough) ?? rough);
  const top = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let i = 0; i * step <= top; i++) {
    ticks.push(i * step);
  }
  return ticks;
};

// Show every n-th x label so at most maxLabels are printed
export const labelStep = (count: number, maxLabels: number): number => Math.max(1, Math.ceil(count / maxLabels));
