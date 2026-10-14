import { apiClient } from './api';
import {
  CurrentListStats,
  CustomerStatsResponse,
  ProductStatsResponse,
  StatsOverview,
  StatsRange,
} from '@/types/statistics';

const buildRangeParams = (range: StatsRange, limit?: number): string => {
  const params = new URLSearchParams();

  if (range.start_date) {
    params.append('start_date', range.start_date);
  }
  if (range.end_date) {
    params.append('end_date', range.end_date);
  }
  if (limit) {
    params.append('limit', limit.toString());
  }

  return params.toString();
};

// Statistics service functions (ADMIN ONLY)
export const statisticsService = {
  getOverview: async (range: StatsRange): Promise<StatsOverview> => {
    const response = await apiClient.get<StatsOverview>(
      `/statistics/overview?${buildRangeParams(range)}`
    );
    return response.data;
  },

  getProducts: async (range: StatsRange, limit = 10): Promise<ProductStatsResponse> => {
    const response = await apiClient.get<ProductStatsResponse>(
      `/statistics/products?${buildRangeParams(range, limit)}`
    );
    return response.data;
  },

  getCustomers: async (range: StatsRange, limit = 10): Promise<CustomerStatsResponse> => {
    const response = await apiClient.get<CustomerStatsResponse>(
      `/statistics/customers?${buildRangeParams(range, limit)}`
    );
    return response.data;
  },

  getCurrentList: async (): Promise<CurrentListStats> => {
    const response = await apiClient.get<CurrentListStats>('/statistics/current-list');
    return response.data;
  },
};
