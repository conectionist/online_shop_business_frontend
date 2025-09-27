// Hook for VAPID key management
// Step 4: VAPID key API integration - NO actual subscription yet

import { useQuery } from '@tanstack/react-query';
import { getVapidPublicKey } from '@/services/pushService';
import { queryKeys } from '@/lib/queryKeys';

/**
 * Hook to get VAPID public key from backend
 * This is iOS-safe as it only retrieves the key, no subscription yet
 */
export function useVapidKey() {
  return useQuery({
    queryKey: queryKeys.push.vapidKey(),
    queryFn: getVapidPublicKey,
    staleTime: 5 * 60 * 1000, // 5 minutes - VAPID keys don't change often
    retry: 3,
    retryDelay: 1000,
  });
}

/**
 * Hook to check if VAPID key is available
 * Useful for conditional rendering of push notification features
 */
export function useVapidKeyAvailable() {
  const { data, isLoading, error } = useVapidKey();
  
  return {
    isAvailable: !!data && !error,
    isLoading,
    error,
    key: data
  };
}
