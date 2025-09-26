import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { systemService } from '@/services/system';

// Hook to get next delivery date
export const useNextDeliveryDate = (referenceDate?: string) => {
  return useQuery({
    queryKey: queryKeys.system.nextDeliveryDate(referenceDate),
    queryFn: () => systemService.getNextDeliveryDate(referenceDate),
    staleTime: 5 * 60 * 1000, // 5 minutes - delivery dates don't change frequently
  });
};
