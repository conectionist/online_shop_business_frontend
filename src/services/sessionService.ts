import { apiClient } from '@/services/api';
import { Session, SessionsResponse } from '@/types/api';

export const sessionService = {
  getSessions: async (): Promise<Session[]> => {
    const response = await apiClient.get<SessionsResponse>('/auth/sessions');
    return response.data.sessions;
  },

  getCurrentSession: async (): Promise<Session> => {
    const response = await apiClient.get<Session>('/auth/sessions/current');
    return response.data;
  },

  getSession: async (id: number): Promise<Session> => {
    const response = await apiClient.get<Session>(`/auth/sessions/${id}`);
    return response.data;
  },

  revokeSession: async (id: number): Promise<void> => {
    await apiClient.delete(`/auth/sessions/${id}`);
  },
};
