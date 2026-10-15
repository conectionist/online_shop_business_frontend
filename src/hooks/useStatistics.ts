import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { statisticsService } from '@/services/statistics';
import { StatsRange } from '@/types/statistics';

// Statistics change only when orders come in, so a short stale time is enough.
// keepPreviousData keeps the old numbers on screen while a new period loads.
const STATS_STALE_TIME = 60 * 1000;

// The top customers card shows 10 at a time, up to the API's maximum
export const TOP_CUSTOMERS_LIMIT = 100;

export const useStatisticsOverview = (range: StatsRange) => {
  return useQuery({
    queryKey: queryKeys.statistics.overview(range),
    queryFn: () => statisticsService.getOverview(range),
    staleTime: STATS_STALE_TIME,
    placeholderData: keepPreviousData,
  });
};

export const useProductStats = (range: StatsRange) => {
  return useQuery({
    queryKey: queryKeys.statistics.products(range),
    queryFn: () => statisticsService.getProducts(range),
    staleTime: STATS_STALE_TIME,
    placeholderData: keepPreviousData,
  });
};

export const useCustomerStats = (range: StatsRange) => {
  return useQuery({
    queryKey: queryKeys.statistics.customers(range),
    queryFn: () => statisticsService.getCustomers(range, TOP_CUSTOMERS_LIMIT),
    staleTime: STATS_STALE_TIME,
    placeholderData: keepPreviousData,
  });
};

// Live panel for the list currently taking orders
export const useCurrentListStats = () => {
  return useQuery({
    queryKey: queryKeys.statistics.currentList(),
    queryFn: () => statisticsService.getCurrentList(),
    staleTime: 0,
    refetchInterval: 60 * 1000,
  });
};
