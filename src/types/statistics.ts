// Types for the admin statistics endpoints (/statistics/*).
// Money values are whole RON and cover product sales only (no delivery fees).

// Period selection: a range of list delivery dates. Without a start date the
// period is "all time".
export interface StatsRange {
  start_date?: string; // YYYY-MM-DD
  end_date?: string; // YYYY-MM-DD
}

export interface StatsPeriod {
  start_date: string | null;
  end_date: string | null;
  list_count: number;
  previous_start_date: string | null;
  previous_end_date: string | null;
  previous_list_count: number;
}

export interface StatsSummary {
  revenue: number;
  orders: number;
  average_order_value: number;
  items_sold: number;
  unique_customers: number;
  returning_customers: number;
  repeat_customer_rate: number; // 0-1
  cancelled_orders: number;
  cancelled_rate: number; // 0-1
}

export interface ListStatsPoint {
  list_id: number;
  data: string;
  orders: number;
  revenue: number;
  average_order_value: number;
  customers: number;
  new_customers: number;
  returning_customers: number;
}

export interface BreakdownSlice {
  id: number;
  name: string;
  orders: number;
  revenue: number;
}

export interface HeatmapCell {
  weekday: number; // 0 = Monday ... 6 = Sunday
  hour: number;
  orders: number;
}

export interface StatsOverview {
  period: StatsPeriod;
  summary: StatsSummary;
  previous_summary: StatsSummary | null;
  lists: ListStatsPoint[];
  delivery_types: BreakdownSlice[];
  payment_methods: BreakdownSlice[];
  heatmap: HeatmapCell[];
}

export interface ProductStat {
  product_id: number;
  name: string;
  category_name: string | null;
  unit: string | null;
  quantity: number;
  revenue: number;
  orders: number;
}

export interface CategoryStat {
  category_id: number;
  name: string;
  quantity: number;
  revenue: number;
}

export interface UnsoldProduct {
  product_id: number;
  name: string;
  category_name: string | null;
  times_offered: number;
}

// How often a product sold out: the admin marks a product unavailable (stoc_produs 0)
// once it sells out, so "sold out" means marked unavailable after it had orders
export interface ProductSellOut {
  product_id: number;
  name: string;
  category_name: string | null;
  sold_out: number; // lists where it sold out
  offered: number; // lists where it could be ordered, sold out or not
}

export interface ProductStatsResponse {
  period: StatsPeriod;
  top_by_quantity: ProductStat[];
  top_by_revenue: ProductStat[];
  categories: CategoryStat[];
  unsold_products: UnsoldProduct[];
  sell_outs: ProductSellOut[]; // most often first
}

export interface CustomerStat {
  name: string;
  phone_number: string | null;
  orders: number;
  lists: number;
  revenue: number;
  last_order_date: string;
}

export interface CustomerStatsResponse {
  period: StatsPeriod;
  top_customers: CustomerStat[]; // by revenue
  top_customers_by_orders: CustomerStat[];
}

export interface SoldOutProduct {
  product_id: number;
  name: string;
  unit: string | null;
  ordered: number;
}

export interface CurrentListStats {
  list: {
    id: number;
    data: string;
    expiration_date: string | null;
    is_published: boolean;
  } | null;
  orders: number;
  revenue: number;
  customers: number;
  items_sold: number;
  previous: {
    id: number;
    data: string;
    orders: number;
    revenue: number;
  } | null;
  sold_out: SoldOutProduct[]; // most ordered first
}
