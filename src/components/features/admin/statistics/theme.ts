// Colors for the statistics page: the admin's white cards with bakery accents.
//
// crust + teal were validated as a series pair on white (dataviz validate_palette.js):
// CVD worst ΔE 12.9 (deutan), normal-vision ΔE 23, both >= 3:1. Text on the accents:
// white on crust 4.9:1, crustDark on white 7.4:1, ink tooltip on crustLight 8.3:1.
export const THEME = {
  crust: '#b4561b', // primary bakery accent, main series
  crustDark: '#8d3e0f', // accent text
  crustLight: '#e3a877',
  crustWash: '#f3e3cf', // in-progress list fill
  docket: '#fffdf9',
  teal: '#0d9488', // second series (new customers)
  ink: '#1f1a15', // tooltip background
  muted: '#9ca3af', // de-emphasised marks (sparkline lines)
};

// Sequential crust scale for the heatmap, light -> dark. Index 0 (no orders) is gray-100;
// steps 1-5 are monotone in lightness and the lightest clears 2:1 on white.
export const HEATMAP_SCALE = ['#f3f4f6', '#e3a877', '#d28b4f', '#bd6c2f', '#a04d18', '#6b3210'];

// Rank badges for the top three products: deep crust, warm bronze, subdued gold
export const PODIUM_CLASSES = [
  'bg-[#b4561b] text-white',
  'bg-[#e7c9a9] text-[#5c2a0a]',
  'bg-amber-100 text-amber-900',
];
