# Statistics Page Specification: The Artisanal Command Center

> **Document Status**: Final Design Specification & Architectural Blueprint  
> **Audience**: Frontend Engineers, UI/UX Designers, Product Stakeholders  
> **Target Path**: `src/pages/admin/Statistics.tsx` and `src/components/features/admin/statistics/*`  
> **Locale**: Romanian (`ro-RO`), Currency: `RON`  

---

## 1. Executive Vision & Problem Statement

### 1.1 The Context & The Two Experimental Prototypes
The shop operates on a **list-based batch pre-ordering model** for an artisanal bakery. Sales do not happen continuously; they revolve around scheduled production runs and delivery dates (e.g., *"Livrare: Joi, 15 Oct"*), with strict order cutoff deadlines (`expiration_date`).

Two experimental versions were created side-by-side to gather feedback:
* **Version 1 (Clinical Dashboard)**: Standard white cards and gray borders. It blends into the admin template but lacks hierarchy, bakery soul, and executive punch. Every KPI looks identical.
* **Version 2 (The Baker's Ledger)**: Introduced high-craft editorial design (warm paper, docket punch-holes, rubber stamps, serif headers). However, it behaves like an isolated micro-app: it breaks the layout with `-m-6` negative margin hacks, imports 4 custom WOFF2 font files, suffers from low contrast on small metadata, and buries operational actions.

### 1.2 The Unified Vision: "The Artisanal Modern Command Center"
This specification defines the unified, single-version design that marries the best of both worlds:
1. **Container & System Harmony**: Sits properly inside [`AdminLayout`](file:///home/dan/Projects/online_shop_business_v2/online_shop_business_frontend/src/components/layout/AdminLayout.tsx) without CSS layout hacks, respecting global navigation and header conventions.
2. **Bakery Character with Modern Polish**: Retains warm artisanal accents (warm amber/crust `#b4561b`, subtle docket receipts, status stamps) while maintaining WCAG AA contrast standards and ultra-crisp typography.
3. **Operational Hierarchy First**: The **Current Active List** is crowned as the primary command docket at the top of the page. Historical analysis lives in a dedicated, period-scoped section below.
4. **Actionable Retention**: Moves lapsed high-value customers and unsold items out of collapsed footers and equips them with direct, 1-tap **WhatsApp & Phone re-engagement**.
5. **Zero-Dependency Native Visualizations**: Eliminates the heavy `recharts` package (~500KB bundle overhead and ResizeObserver instability) in favor of performant, accessible native SVG and HTML/CSS visualizations.
6. **Data Export & Print Readiness**: Native CSV data export and clean kitchen print stylesheets.

---

## 2. Information Architecture & Page Layout

### 2.1 Page Section Hierarchy

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  ADMIN PAGE HEADER: Standard breadcrumb, title, subtitle & utility actions (Export/Print)│
├────────────────────────────────────────────────────────────────────────────────────────┤
│  SECTION 1: LIVE BAKE RUN (Current Active List Docket)                                 │
│  - Live status indicator ("În desfășurare" / "Comenzi închise") & Countdown clock       │
│  - Bake volume summary (Items to bake, capacity meter, order count, revenue)           │
│  - Critical stock pills (Sold out & near-capacity alerts with direct edit shortcuts)   │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  SECTION 2: STICKY PERIOD CONTROL & COMPARISON TIMELINE                                │
│  - Preset selector pills (4 liste, 12 liste, 6 luni, 12 luni, Tot, Interval...)       │
│  - Comparison period resolution badge & summary                                        │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  SECTION 3: EXECUTIVE FINANCIAL & CUSTOMER LEDGER                                      │
│  - Hero Metric: Total Revenue with full-width trend sparkline                          │
│  - Core KPIs: Orders, Average Order Value (AOV), Unique Customers, Repeat Rate,        │
│    and Cancellation Rate with signed delta comparison pills                            │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  SECTION 4: LONGITUDINAL TRENDS & MIX (Zero-Dependency SVG Charts)                     │
│  - Left: Evoluție pe Liste (Interactive SVG Bar Chart with Metric Toggle)              │
│  - Right: Compoziție Clienți (Returning vs. New Customers Stacked Ratio)              │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  SECTION 5: PRODUCT & CATEGORY PERFORMANCE ENGINE                                      │
│  - Left: Top Produse (Sortable by Volume or Revenue with podium badges)                │
│  - Right: Vânzări pe Categorii (Ranked share bars with % distribution)                 │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  SECTION 6: ACTIONABLE RETENTION & OPERATIONS                                          │
│  - Left Card: Clienți de Reactivat (Lapsed regulars with 1-tap WhatsApp/Phone CTAs)    │
│  - Left Card: Produse Fără Comenzi (Unsold menu items)                                │
│  - Right Card: Când se comandă (Adaptive Heatmap: Matrix on Desktop, Peak-Day Cards on Mobile)
│  - Right Card: Logistică & Plată (Delivery and Payment method distribution)            │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Detailed Component Specifications

### 3.1 Section 1: Live Bake Run (`LiveCurrentListDocket.tsx`)

#### Purpose
Provides the baker and shop manager with an immediate operational snapshot of the order run currently taking orders or in preparation for delivery.

#### Anatomy & Layout
* **Container Styling**: Designed as a modern take on the bakery order docket. Soft warm border (`border-amber-200`), white-to-cream gradient surface (`bg-gradient-to-b from-white to-amber-50/40`), subtle top punch-hole receipt border accent (`border-t-4 border-amber-600`), and clean rounded corners (`rounded-xl`).
* **Header Row**:
  * **Status Badge**: Rubber-stamp style badge.
    * *Published*: Emerald border and text (`border-emerald-600 text-emerald-800 bg-emerald-50`), text: `PUBLICATĂ`.
    * *Unpublished*: Neutral slate badge (`border-gray-400 text-gray-700 bg-gray-100`), text: `CIORNĂ`.
  * **Delivery Target**: `Livrare: [Weekday], [Day] [Month]` (e.g., `Livrare: Joi, 15 Octombrie`).
  * **Live Countdown Timer**:
    * If `expiration_date` is in the future: `<Clock /> Comenzile se închid în: 4 ore 12 min` (with amber warning pulse when `< 6h`).
    * If expired: `<CheckCircle /> Comenzile s-au închis · În faza de producție`.
  * **Direct Quick-Links**:
    * Button to open orders: `Vezi cele X comenzi →` linking to `/admin/lists/${list.id}/manage?tab=orders`.
* **Primary Metric Trio**:
  1. **Comenzi (Orders)**: e.g., `48 comenzi` with a comparison meter against the previous list's final count (e.g., `85% din lista anterioară`).
  2. **Încasări Curente (Revenue)**: e.g., `3.420 RON` (bold numeric display with `RON` label).
  3. **Produse de Copt (Items Sold)**: Total units ordered across all recipes (e.g., `184 buc`).
* **Stock & Capacity Strip**:
  * A horizontal alert strip highlighting sell-through issues:
    * `X Epuizate (Sold Out)`: Red badge pill with link to stock management.
    * `Y Stoc Critic (<20% rămas)`: Amber warning pill.
  * Preview of the top 4 fast-selling products with inline visual progress bars:
    * `Cozonac cu nucă: 30 / 30 (100% - Epuizat)` [Red bar]
    * `Pâine cu maia: 42 / 50 (84% - 8 rămase)` [Amber bar]
    * Expand button: `Vezi tot stocul ([N] produse) ▾` to toggle a compact table of all list items.

---

### 3.2 Section 2: Sticky Period & Comparison Control (`StickyPeriodFilter.tsx`)

#### Purpose
Ensures temporal context is never lost as the user scrolls through in-depth statistics, and clarifies the comparison baseline.

#### Anatomy & Layout
* **Behavior**: Uses CSS `sticky top-0 z-30` inside the main scrollable area, with background blur `bg-white/95 backdrop-blur-md border-b border-gray-200 py-3 -mx-6 px-6`.
* **Preset Buttons**: Pill-shaped toggle group:
  * `Ultimele 4 liste` (Default for weekly rhythm)
  * `Ultimele 12 liste` (Quarterly perspective)
  * `6 luni`
  * `12 luni`
  * `Tot`
  * `Interval...` (reveals inline `start_date` and `end_date` calendar pickers)
* **Resolved Period Badge**:
  * Displays the exact human-readable date bounds returned by the server:
    * e.g., `12 liste (15 aug – 15 oct 2026) · comparat cu 12 liste anterioare (15 iun – 14 aug 2026)`.
* **Visual Scope Separation**:
  * An unobtrusive helper caption reminds the user: `* Indicatorii de mai jos reflectă perioada selectată. Lista curentă de mai sus rămâne mereu live.`

---

### 3.3 Section 3: Executive Financial Ledger (`KpiLedger.tsx`)

#### Purpose
Delivers a high-contrast executive summary of revenue, average basket, and customer loyalty with contextual trend lines and comparison deltas.

#### Layout
An asymmetric 12-column grid (`grid grid-cols-1 lg:grid-cols-12 gap-4`):
* **Hero Card (5 columns)**: `Încasări (Revenue)`
  * Massive typography: `clamp(2.5rem, 4vw, 3.5rem)` font weight 700.
  * Formatted with Romanian grouping: `148.920 RON`.
  * Comparison Pill: `+12,4% vs perioada anterioară` (Emerald background for positive, Rose for negative).
  * Contextual Sparkline: Full-width SVG area sparkline spanning all lists in the selected period, with the latest list distinctly highlighted with an interactive target circle.
* **Secondary KPIs (7 columns)**: Structured as a 2x2 or 2x3 grid of clean metric tiles:
  1. **Comenzi (Orders)**: Total count + total individual product items sold as helper text.
  2. **Valoare Medie Comandă (AOV)**: Average basket spend in RON + delta pill.
  3. **Clienți Unici (Unique Customers)**: Count of unique buyers (deduplicated by phone/name) + new customer acquisition badge.
  4. **Rata Clienți Fideli (Repeat Rate)**: Percentage with percentage-point delta (`+3,4 pp`) and returning customer count.
  5. **Comenzi Anulate (Cancellations)**: Red-flagged metric where an increase is negative (`goodWhenUp = false`), plus cancellation rate percentage.

---

### 3.4 Section 4: Longitudinal Trends & Customer Mix

#### Purpose
Two side-by-side analytical visualizations showing list-by-list performance and customer cohort evolution, built **without** Recharts.

#### 1. Lists Trend Chart (`ListsTrendBarChart.tsx`)
* **Metric Switcher**: Inline toggle pill: `[Încasări] [Comenzi] [Valoare medie]`.
* **View Switcher**: `[Grafic] [Tabel]`.
* **Native SVG Bar Visualization**:
  * Clean SVG canvas with horizontal dashed gridlines at calculated nice-interval ticks.
  * Vertical bars representing each list:
    * Historical completed lists: Rich warm amber (`#b4561b`).
    * Active in-flight list: Lighter hatched/tinted amber (`#f3e3cf` with `#b4561b` border) with an `(în curs)` label.
    * Highest peak list: Directly annotated with its numerical value on top of the bar (e.g. `14.280 RON`).
  * Hover / Touch Interaction:
    * Displays a crisp floating tooltip box with dark ink background (`#1f1a15`), displaying List Delivery Date, Orders, Revenue, and AOV.

#### 2. Customer Mix Chart (`CustomerMixBarChart.tsx`)
* **Concept**: Stacked bars showing the proportion of **Returning Customers** vs. **First-time Customers** across each delivery list.
* **Palette**:
  * Returning Customers (Loyal): Deep Amber/Crust (`#b4561b`).
  * New Customers (Acquisition): Crisp Teal (`#0d9488`).
* **Visual Annotations**:
  * Summary kicker above the chart: e.g., `42 clienți noi atrași în această perioadă (24% din total)`.
  * Stacked SVG bars normalized with clean rounded top corners and subtle border separation.

---

### 3.5 Section 5: Product & Category Performance Engine

#### 1. Top Products (`TopProductsCard.tsx`)
* **Toggle Controls**: Sort by `[După Cantitate]` or `[După Încasări]`.
* **Table Structure**:
  * **Column 1 (# Rank)**: Numbers 1, 2, and 3 styled with prominent podium styling (Deep Amber bold badge for #1, Warm Bronze for #2, Subdued Gold for #3).
  * **Column 2 (Produs)**: Product title, category pill, and a proportional horizontal fill bar indicating its relative share compared to the top item.
  * **Column 3 (Cantitate)**: Total units sold with unit label (e.g. `140 buc`).
  * **Column 4 (Încasări)**: Total revenue generated in RON.

#### 2. Category Revenue Breakdown (`CategoryRevenueCard.tsx`)
* **Visualization**: Horizontal ranked bars with auto-wrapping Romanian category labels.
* **Values**: Displays absolute revenue in RON alongside the category's percentage of total bakery turnover (e.g. `Pâine Artizanală: 34.200 RON · 58%`).
* **Sub-text**: Total categories active in the period.

---

### 3.6 Section 6: Actionable Retention & Operational Intelligence

#### 1. Customer Re-engagement Card (`LapsedCustomersCard.tsx`)
* **The Problem It Solves**: In v1/v2, this was buried in a closed `<details>` tag. In the new design, it is a prominent **Revenue Recovery** card.
* **Criteria**: Regulars who ordered in at least 2 of the prior 4 lists, but missed the most recent list(s).
* **Customer Row Anatomy**:
  * Customer Name + Total lifetime spend (e.g., `Elena Ionescu · 1.450 RON total (4 liste)`).
  * Last order date + days since last order (e.g., `Ultima comandă: 24 Sep (acum 3 săptămâni)`).
  * **Action Hub**:
    * **WhatsApp Button (1-Click)**: Opens WhatsApp Web/App (`https://wa.me/[phone]`) with a pre-composed personalized template:
      > *"Bună Elena! Am deschis comenzile pentru lista de joi la brutărie. Dacă dorești să-ți păstrăm produsele preferate, te așteptăm pe site!"*
    * **Phone Call Button**: Direct `tel:[phone]` link for quick dialing.

#### 2. Zero-Sales Products Card (`UnsoldProductsCard.tsx`)
* Highlights items included on lists during the period that received **0 orders**.
* Identifies menu bloat, helping the baker eliminate prep waste or revise recipes.
* Shows how many times the product was offered (`Oferit în 3 liste`).

#### 3. Order Time Heatmap (`OrdersHeatmap.tsx`)
* **Desktop View**: 7-day x 24-hour grid colored with a 6-step sequential amber heat scale.
* **Mobile Adaptive View (< 640px)**:
  * Instead of breaking into a horizontally scrolling table that is impossible to tap on a phone, the mobile view transforms into an executive summary:
    * **Ziua de vârf (Busiest Day)**: e.g. `Miercuri (42% din comenzi)`.
    * **Interval orar de vârf (Peak Hours)**: e.g. `18:00 – 21:00`.
    * **Top 3 Ferestre de Comandă**: Compact ranked cards showing the exact hours when customers submit orders.

#### 4. Delivery & Payment Method Distribution (`BreakdownCard.tsx`)
* Clear breakdown of:
  * Delivery choices: Pickup from bakery (*Ridicare sediu*) vs. Home delivery (*Livrare la domiciliu*).
  * Payment choices: Cash/Card on delivery (*Ramburs la livrare*) vs. Online card (*Plată online*).

---

### 3.7 Section 7: Export & Print Capabilities (`ExportToolbar.tsx`)

* **CSV Export**:
  * Direct client-side generation of structured UTF-8 BOM CSV files for:
    * `statistici_sumar_[perioada].csv` (KPIs, revenue, orders).
    * `top_produse_[perioada].csv` (Products, quantities, revenues).
    * `activitate_clienti_[perioada].csv` (Customer name, phone, orders, spend).
* **Kitchen Print View (`@media print`)**:
  * Clean, ink-efficient black-and-white print layout omitting filters, buttons, and dark backgrounds, allowing the baker to print production totals directly for the baking station.

---

## 4. Visual Tokens & Styling System

All styles are built with standard Tailwind CSS utility classes and semantic CSS variables that align with `AdminLayout`.

### 4.1 Color System

| Token | Hex | Tailwind Utility | Semantic Purpose |
| :--- | :--- | :--- | :--- |
| `surface-canvas` | `#f9fafb` | `bg-gray-50` | Admin layout background |
| `surface-card` | `#ffffff` | `bg-white` | Card container surface |
| `surface-docket` | `#fffdf9` | `bg-[#fffdf9]` | Live docket background |
| `brand-crust` | `#b4561b` | `text-[#b4561b]`, `bg-[#b4561b]` | Primary bakery amber / crust accent |
| `brand-crust-dark` | `#8d3e0f` | `text-[#8d3e0f]` | Deep crust text for guaranteed WCAG AA |
| `brand-wash` | `#fdf3e7` | `bg-amber-50` | Background highlight and light badges |
| `brand-teal` | `#0d9488` | `text-teal-700`, `bg-teal-600` | New customer secondary series |
| `text-primary` | `#111827` | `text-gray-900` | Primary numbers, headings |
| `text-secondary` | `#4b5563` | `text-gray-600` | Subtitles, labels, table headers |
| `text-muted` | `#6b7280` | `text-gray-500` | Secondary hints, timestamps |
| `status-good` | `#15803d` | `text-emerald-700`, `bg-emerald-50` | Positive deltas, published status |
| `status-bad` | `#b91c1c` | `text-rose-700`, `bg-rose-50` | Negative deltas, sold out warnings |

### 4.2 Typography & Formatting Rules
* **No external WOFF2 font bloat**: Uses system font stack (`system-ui, -apple-system, sans-serif`) matching the admin portal for instantaneous loading with zero FOUT.
* **Numbers & Tables**: Strict usage of `font-variant-numeric: tabular-nums` (`tabular-nums` in Tailwind) across all prices, dates, percentages, and table cells to ensure stable decimal alignment.
* **Romanian Localization**:
  * Prices: `1.240 RON` (space before RON, period for thousands grouping).
  * Decimals: `8,2%` (comma for decimal separation).
  * Deltas: Signed format `+8,2%` / `−3,1%` with proper Unicode minus sign `−` (`U+2212`).
  * Rate differences: `+2,4 pp` (percentage points).

---

## 5. Architectural Blueprint & File Layout

When consolidating into a single production implementation, the file layout should be structured cleanly under `src/components/features/admin/statistics/`:

```
src/
├── pages/
│   └── admin/
│       ├── Statistics.tsx               # Main page controller (replaces StatisticsVersions)
│       └── __tests__/
│           └── Statistics.test.tsx      # Comprehensive page test suite
└── components/
    └── features/
        └── admin/
            └── statistics/
                ├── LiveCurrentListDocket.tsx  # Section 1: Live active list docket
                ├── StickyPeriodFilter.tsx     # Section 2: Sticky preset filter & date badge
                ├── KpiLedger.tsx              # Section 3: Headline KPIs & Hero revenue card
                ├── KpiCard.tsx                # Reusable individual KPI card
                ├── ListsTrendBarChart.tsx     # Section 4: Native SVG list trend chart
                ├── CustomerMixBarChart.tsx    # Section 4: Native SVG customer mix chart
                ├── SvgBarChartBase.tsx        # Reusable responsive SVG bar engine
                ├── TopProductsCard.tsx        # Section 5: Top products ranked table
                ├── CategoryRevenueCard.tsx    # Section 5: Category distribution bars
                ├── LapsedCustomersCard.tsx    # Section 6: Retention card with WhatsApp CTAs
                ├── UnsoldProductsCard.tsx     # Section 6: Unsold products diagnostic
                ├── OrdersHeatmap.tsx          # Section 6: Desktop matrix / Mobile cards
                ├── BreakdownCard.tsx          # Section 6: Delivery & payment splits
                ├── ExportToolbar.tsx          # Section 7: CSV export & print triggers
                ├── RankedBars.tsx             # Shared horizontal progress bar component
                ├── SparklineSvg.tsx           # Shared responsive SVG sparkline
                ├── format.ts                  # Romanian locale number/date formatters
                ├── period.ts                  # Period preset resolver
                └── theme.ts                   # Color constants & heatmap palettes
```

---

## 6. Implementation Blueprints for Critical Innovations

### 6.1 Native SVG Bar Chart (Zero-Dependency Replacement for Recharts)

To completely eliminate `recharts` and its 500KB footprint, a lightweight, responsive native SVG bar component is used:

```tsx
// SvgBarChartBase.tsx (Sample Architecture)
import React, { useState, useId } from 'react';

export interface BarDatum {
  id: string | number;
  label: string;
  value: number;
  secondaryValue?: number;
  isHighlighted?: boolean;
  tooltipData: Record<string, string>;
}

interface SvgBarChartProps {
  data: BarDatum[];
  height?: number;
  formatValue: (v: number) => string;
  primaryColor?: string;
  highlightColor?: string;
}

export const SvgBarChartBase: React.FC<SvgBarChartProps> = ({
  data,
  height = 260,
  formatValue,
  primaryColor = '#b4561b',
  highlightColor = '#e3a877',
}) => {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const chartId = useId();
  
  if (data.length === 0) return null;

  const maxValue = Math.max(...data.map(d => d.value), 1);
  const padBottom = 28;
  const padTop = 24;
  const usableHeight = height - padTop - padBottom;
  
  return (
    <div className="relative w-full select-none" style={{ height }}>
      <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${data.length * 40} ${height}`} preserveAspectRatio="none">
        {/* Horizontal grid lines */}
        {[0, 0.5, 1].map((pct) => {
          const y = padTop + usableHeight * (1 - pct);
          return (
            <line
              key={pct}
              x1="0"
              x2={data.length * 40}
              y1={y}
              y2={y}
              stroke="#e5e7eb"
              strokeDasharray="3 3"
              vectorEffect="non-scaling-stroke"
            />
          );
        })}

        {/* Bars */}
        {data.map((d, i) => {
          const barHeight = (d.value / maxValue) * usableHeight;
          const x = i * 40 + 8;
          const y = padTop + usableHeight - barHeight;
          const isSelected = activeIdx === i;

          return (
            <g
              key={d.id}
              className="cursor-pointer group"
              onMouseEnter={() => setActiveIdx(i)}
              onMouseLeave={() => setActiveIdx(null)}
              onClick={() => setActiveIdx(isSelected ? null : i)}
            >
              {/* Invisible touch/hover target */}
              <rect x={i * 40} y={0} width={40} height={height} fill="transparent" />

              {/* Bar rect */}
              <rect
                x={x}
                y={y}
                width={24}
                height={Math.max(barHeight, 2)}
                rx={4}
                fill={d.isHighlighted ? highlightColor : primaryColor}
                className="transition-opacity duration-150 group-hover:opacity-80"
              />

              {/* X-axis label */}
              <text
                x={x + 12}
                y={height - 8}
                textAnchor="middle"
                className="text-[10px] fill-gray-500 font-medium"
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Floating Tooltip */}
      {activeIdx !== null && (
        <div
          className="absolute z-10 pointer-events-none -translate-x-1/2 -top-2 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl whitespace-nowrap"
          style={{ left: `${((activeIdx + 0.5) / data.length) * 100}%` }}
        >
          <p className="font-semibold">{data[activeIdx].label}</p>
          <p className="text-amber-300 font-bold">{formatValue(data[activeIdx].value)}</p>
          {Object.entries(data[activeIdx].tooltipData).map(([k, v]) => (
            <p key={k} className="text-gray-300 text-[11px]">{k}: {v}</p>
          ))}
        </div>
      )}
    </div>
  );
};
```

---

### 6.2 WhatsApp 1-Click Retention Generator

```typescript
// Helper function in format.ts or a dedicated contactHelper.ts

export const buildWhatsAppReactivationLink = (
  phone: string,
  customerName: string,
  upcomingDeliveryDay: string
): string => {
  // Normalize Romanian phone: 07xxxxxxxx -> 407xxxxxxxx
  let cleanPhone = phone.replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '4' + cleanPhone;
  }
  
  const firstName = customerName.split(' ')[0] || customerName;
  const message = `Bună ${firstName}! 👋 Am deschis lista de comenzi cu livrare ${upcomingDeliveryDay} la brutărie. Dacă dorești să-ți pregătim pâinea sau produsele tale preferate, te așteptăm cu drag cu o comandă!`;
  
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
};
```

---

### 6.3 CSV Data Exporter (`ExportToolbar.tsx`)

```typescript
export const exportStatisticsToCsv = (
  periodName: string,
  overviewData: StatsOverview,
  productData: ProductStatsResponse
) => {
  const rows: string[][] = [
    ['RAPORT STATISTICI BRUTARIE'],
    ['Perioada:', periodName],
    ['Generat la:', new Date().toLocaleString('ro-RO')],
    [],
    ['INDICATORI PRINCIPALI'],
    ['Indicator', 'Valoare'],
    ['Incasari totale (RON)', overviewData.summary.revenue.toString()],
    ['Comenzi totale', overviewData.summary.orders.toString()],
    ['Valoare medie comanda (RON)', overviewData.summary.average_order_value.toString()],
    ['Clienti unici', overviewData.summary.unique_customers.toString()],
    ['Rata clienti fideli', `${(overviewData.summary.repeat_customer_rate * 100).toFixed(1)}%`],
    ['Comenzi anulate', overviewData.summary.cancelled_orders.toString()],
    [],
    ['TOP PRODUSE VANZARI'],
    ['Pozitie', 'Produs', 'Categorie', 'Cantitate Vanduta', 'Incasari (RON)'],
  ];

  productData.top_by_revenue.forEach((p, idx) => {
    rows.push([
      (idx + 1).toString(),
      p.name,
      p.category_name || '-',
      p.quantity.toString(),
      p.revenue.toString(),
    ]);
  });

  const csvContent = '\uFEFF' + rows.map((e) => e.map((val) => `"${val.replace(/"/g, '""')}"`).join(';')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `statistici_brutarie_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
```

---

## 7. Responsive Breakpoint Matrix

| Viewport | Layout Strategy |
| :--- | :--- |
| **Mobile (< 640px)** | • Single column stack.<br>• Live Docket displays primary numbers + emergency stock pills; detail table collapsed.<br>• Period pills scroll horizontally.<br>• Heatmap adapts into top 3 peak shopping hour cards.<br>• Table cards display scroll indicator or compact card list. |
| **Tablet (640px - 1024px)** | • 2-column grid for secondary KPIs and Top Products / Categories.<br>• Trend and Customer Mix charts stack vertically.<br>• Live Docket displays full stock gauges. |
| **Desktop (≥ 1024px)** | • 12-column asymmetric layout (Hero 5 cols, Sub-KPIs 7 cols).<br>• Full side-by-side analytical comparisons.<br>• Full 7x24 interactive orders heatmap. |

---

## 8. Summary of Benefits

1. **Brand Authenticity without Layout Breakage**: The page honors the bakery's identity through artisanal accents, status stamps, and warm palette tokens, but stays firmly within the parent `AdminLayout` without rogue negative margins or bloated fonts.
2. **Operations-First Hierarchy**: The Current List docket is elevated to the very top, giving staff immediate visibility into active bake quantities and sold-out items.
3. **Turn Data into Cash**: Lapsed regulars are elevated from bottom accordions to a high-priority retention card with one-click WhatsApp re-engagement.
4. **Performance & Reliability**: Dropping `recharts` in favor of native SVG eliminates unit test failures, reduces frontend bundle weight by ~500KB, and prevents mobile rendering hitches.
5. **Clear Roadmap for Production**: When the site owner is ready to exit the experimental dual-version phase, this blueprint allows removing `StatisticsVersions.tsx` and replacing it with a single, production-grade page.
