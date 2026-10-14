import { apiClient, createQueryParams } from './api';
import {
  CurrentListStats,
  CustomerStatsResponse,
  ProductStatsResponse,
  StatsOverview,
  StatsRange,
} from '@/types/statistics';

// Statistics service functions (ADMIN ONLY)
export const statisticsService = {
  getOverview: async (range: StatsRange): Promise<StatsOverview> => {
    const response = await apiClient.get<StatsOverview>(
      `/statistics/overview?${createQueryParams(range)}`
    );
    return response.data;
  },

  getProducts: async (range: StatsRange, limit = 10): Promise<ProductStatsResponse> => {
    const response = await apiClient.get<ProductStatsResponse>(
      `/statistics/products?${createQueryParams({ ...range, limit })}`
    );
    return response.data;
  },

  getCustomers: async (range: StatsRange, limit = 10): Promise<CustomerStatsResponse> => {
    const response = await apiClient.get<CustomerStatsResponse>(
      `/statistics/customers?${createQueryParams({ ...range, limit })}`
    );
    return response.data;
  },

  getCurrentList: async (): Promise<CurrentListStats> => {
    const response = await apiClient.get<CurrentListStats>('/statistics/current-list');
    return response.data;
  },
};
