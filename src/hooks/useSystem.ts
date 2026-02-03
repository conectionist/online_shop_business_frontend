import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { systemService } from '@/services/system';

// Hook to get system config (max_image_size_mb, etc.)
export const useSystemConfig = () => {
  return useQuery({
    queryKey: queryKeys.system.config(),
    queryFn: () => systemService.getConfig(),
    staleTime: 60 * 60 * 1000, // 1 hour - config rarely changes
  });
};

// Hook to get next delivery date
export const useNextDeliveryDate = (referenceDate?: string) => {
  return useQuery({
    queryKey: queryKeys.system.nextDeliveryDate(referenceDate),
    queryFn: () => systemService.getNextDeliveryDate(referenceDate),
    staleTime: 60 * 60 * 1000, // 1 hour - delivery dates don't change frequently
  });
};
