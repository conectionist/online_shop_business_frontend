import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { notificationService, NotificationPayload } from '@/services/notifications';

// Hook to get all admins
export const useAdmins = () => {
  return useQuery({
    queryKey: queryKeys.admins.list(),
    queryFn: () => notificationService.getAdmins(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to send notification to all admins
export const useNotifyAllAdmins = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: NotificationPayload) => notificationService.notifyAllAdmins(payload),
    onSuccess: () => {
      // Optionally invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.lists() });
    },
  });
};

// Hook to send notification to specific admin
export const useNotifySpecificAdmin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ adminId, payload }: { adminId: number; payload: NotificationPayload }) => 
      notificationService.notifySpecificAdmin(adminId, payload),
    onSuccess: () => {
      // Optionally invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.lists() });
    },
  });
};

// Hook to send notification to all customers
export const useNotifyAllCustomers = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: NotificationPayload) => notificationService.notifyAllCustomers(payload),
    onSuccess: () => {
      // Optionally invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.lists() });
    },
  });
};
