import React, { useMemo, useState } from 'react';
import AdminPageHeader from '@/components/layout/AdminPageHeader';
import Alert from '@/components/ui/Alert';
import {
  useCurrentListStats,
  useCustomerStats,
  useProductStats,
  useStatisticsOverview,
} from '@/hooks/useStatistics';
import { CustomRange, PeriodPreset, resolveRange } from '@/components/features/admin/statistics/period';
import { parseDay, toISODate } from '@/components/features/admin/statistics/format';
import { useNow } from '@/components/features/admin/statistics/useNow';
import ExportToolbar from '@/components/features/admin/statistics/ExportToolbar';
import LiveCurrentListDocket from '@/components/features/admin/statistics/LiveCurrentListDocket';
import StickyPeriodFilter from '@/components/features/admin/statistics/StickyPeriodFilter';
import KpiLedger from '@/components/features/admin/statistics/KpiLedger';
import ListsTrendBarChart from '@/components/features/admin/statistics/ListsTrendBarChart';
import CustomerMixBarChart from '@/components/features/admin/statistics/CustomerMixBarChart';
import TopProductsCard from '@/components/features/admin/statistics/TopProductsCard';
import CategoryRevenueCard from '@/components/features/admin/statistics/CategoryRevenueCard';
import TopCustomersCard from '@/components/features/admin/statistics/TopCustomersCard';
import UnsoldProductsCard from '@/components/features/admin/statistics/UnsoldProductsCard';
import OrdersHeatmap from '@/components/features/admin/statistics/OrdersHeatmap';
import BreakdownCard from '@/components/features/admin/statistics/BreakdownCard';

// Admin statistics: the list taking orders first, then the selected period's numbers.
// Bars and sparklines are plain HTML/CSS and SVG.
const Statistics: React.FC = () => {
  const [preset, setPreset] = useState<PeriodPreset>('months1');
  const [custom, setCustom] = useState<CustomRange>({ start_date: '', end_date: '' });
  // The page is meant to stay open: presets move with the calendar day, and the open
  // list stops counting as open once its orders close
  const now = useNow(60 * 1000);
  const today = toISODate(now);
  const range = useMemo(() => resolveRange(preset, custom, parseDay(today)), [preset, custom, today]);

  const overview = useStatisticsOverview(range);
  const products = useProductStats(range);
  const customers = useCustomerStats(range);
  const currentList = useCurrentListStats();

  // A custom range starts from the dates on screen, so switching to it loads nothing new
  const handlePresetChange = (next: PeriodPreset) => {
    if (next === 'custom') {
      setCustom({
        start_date: range.start_date ?? resolveRange('months1', custom, parseDay(today)).start_date ?? '',
        end_date: range.end_date ?? today,
      });
    }
    setPreset(next);
  };

  const summary = overview.data?.summary;
  const lists = overview.data?.lists ?? [];
  // Charts mark the current list as in progress only while it still takes orders
  const liveList = currentList.data?.list;
  const openListId =
    liveList?.is_published && (!liveList.expiration_date || new Date(liveList.expiration_date) > now)
      ? liveList.id
      : undefined;
  const overviewLoading = overview.isLoading;
  const overviewRefreshing = overview.isFetching && overview.isPlaceholderData;
  const productsRefreshing = products.isFetching && products.isPlaceholderData;

  // A failed request with nothing cached gets an error state instead of an empty one.
  // A failed background refetch keeps showing the data it already has.
  const overviewFailed = overview.isError && !overview.data;
  const productsFailed = products.isError && !products.data;
  const customersFailed = customers.isError && !customers.data;
  const currentListFailed = currentList.isError && !currentList.data;

  const error = overview.error || products.error || customers.error || currentList.error;

  return (
    // print-color-adjust keeps bar fills (CSS backgrounds) on paper
    <div className="space-y-8 [print-color-adjust:exact]">
      <AdminPageHeader title="Statistici" subtitle="Cum merge afacerea: vânzări, produse, clienți și comenzi.">
        {/* Placeholder data still belongs to the previous period */}
        <ExportToolbar range={range} overview={overview.isPlaceholderData ? undefined : overview.data} />
      </AdminPageHeader>

      {error && (
        <Alert
          type="error"
          title="Eroare la încărcarea statisticilor"
          message="Nu s-au putut încărca toate datele. Încercați din nou mai târziu."
        />
      )}

      <LiveCurrentListDocket data={currentList.data} isLoading={currentList.isLoading} isError={currentListFailed} />

      <StickyPeriodFilter
        preset={preset}
        onPresetChange={handlePresetChange}
        custom={custom}
        onCustomChange={setCustom}
        period={overview.data?.period}
      />

      <KpiLedger
        summary={summary}
        previous={overview.data?.previous_summary}
        lists={lists}
        isLoading={overviewLoading}
        isRefreshing={overviewRefreshing}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ListsTrendBarChart
          lists={lists}
          currentListId={openListId}
          isLoading={overviewLoading}
          isRefreshing={overviewRefreshing}
          isError={overviewFailed}
        />
        <CustomerMixBarChart
          lists={lists}
          uniqueCustomers={summary?.unique_customers}
          currentListId={openListId}
          isLoading={overviewLoading}
          isRefreshing={overviewRefreshing}
          isError={overviewFailed}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <TopProductsCard
          data={products.data}
          isLoading={products.isLoading}
          isRefreshing={productsRefreshing}
          isError={productsFailed}
        />
        <CategoryRevenueCard
          categories={products.data?.categories ?? []}
          isLoading={products.isLoading}
          isRefreshing={productsRefreshing}
          isError={productsFailed}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
        <div className="space-y-6">
          <TopCustomersCard
            data={customers.data}
            isLoading={customers.isLoading}
            isRefreshing={customers.isFetching && customers.isPlaceholderData}
            isError={customersFailed}
          />
          <UnsoldProductsCard
            data={products.data}
            isLoading={products.isLoading}
            isRefreshing={productsRefreshing}
            isError={productsFailed}
          />
        </div>
        <div className="space-y-6">
          <OrdersHeatmap
            cells={overview.data?.heatmap ?? []}
            isLoading={overviewLoading}
            isRefreshing={overviewRefreshing}
            isError={overviewFailed}
          />
          <BreakdownCard
            deliveryTypes={overview.data?.delivery_types ?? []}
            paymentMethods={overview.data?.payment_methods ?? []}
            isLoading={overviewLoading}
            isRefreshing={overviewRefreshing}
            isError={overviewFailed}
          />
        </div>
      </div>
    </div>
  );
};

export default Statistics;
