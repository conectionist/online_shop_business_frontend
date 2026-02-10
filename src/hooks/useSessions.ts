import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sessionService } from '@/services/sessionService';
import { authService } from '@/services/authService';

// Fetch all sessions
export const useSessions = () => {
  return useQuery({
    queryKey: ['sessions'],
    queryFn: () => sessionService.getSessions(),
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });
};

// Fetch current session
export const useCurrentSession = () => {
  return useQuery({
    queryKey: ['sessions', 'current'],
    queryFn: () => sessionService.getCurrentSession(),
  });
};

// Revoke specific session
export const useRevokeSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: number) => sessionService.revokeSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
};

// Logout from all devices
export const useLogoutAll = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.logoutAll(),
    onSuccess: () => {
      queryClient.clear();
    },
  });
};
