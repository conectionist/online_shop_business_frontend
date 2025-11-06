import { useQuery } from '@tanstack/react-query';
import { paymentTypeService } from '@/services/paymentTypes';
import { queryKeys } from '@/lib/queryKeys';

// Get all payment types
export const usePaymentTypes = () => {
  return useQuery({
    queryKey: queryKeys.paymentTypes.all,
    queryFn: paymentTypeService.getAll,
  });
};

