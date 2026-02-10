import { apiClient } from '@/services/api';
import { Session, SessionsResponse } from '@/types/api';

export const sessionService = {
  // Get all active sessions (PROTECTED - requires auth, cookies sent automatically)
  getSessions: async (): Promise<Session[]> => {
    const response = await apiClient.get<SessionsResponse>('/auth/sessions');
    return response.data.sessions;
  },

  // Get current session details (PROTECTED - requires auth, cookies sent automatically)
  getCurrentSession: async (): Promise<Session> => {
    const response = await apiClient.get<Session>('/auth/sessions/current');
    return response.data;
  },

  // Get specific session by ID (PROTECTED - requires auth, cookies sent automatically)
  getSession: async (id: number): Promise<Session> => {
    const response = await apiClient.get<Session>(`/auth/sessions/${id}`);
    return response.data;
  },

  // Revoke specific session (PROTECTED - requires auth, cookies sent automatically)
  revokeSession: async (id: number): Promise<void> => {
    await apiClient.delete(`/auth/sessions/${id}`);
  },
};
