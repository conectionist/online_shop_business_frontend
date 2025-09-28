import { apiClient } from './api';
import { authService } from './authService';

export interface Admin {
  id: number;
  username: string;
  email?: string;
  is_active: boolean;
}

export interface NotificationPayload {
  title: string;
  body: string;
  data?: {
    type?: string;
    [key: string]: any;
  };
  icon?: string;
  tag?: string;
}

// Notification service functions
export const notificationService = {
  // Get all admins (PROTECTED - requires auth)
  getAdmins: async (): Promise<Admin[]> => {
    return authService.makeAuthenticatedRequest(async () => {
      const response = await apiClient.get('/admins');
      return response.data;
    });
  },

  // Send notification to all admins (PROTECTED - requires auth)
  notifyAllAdmins: async (payload: NotificationPayload): Promise<{ status: string }> => {
    return authService.makeAuthenticatedRequest(async () => {
      const response = await apiClient.post('/push/admin/notify', payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    });
  },

  // Send notification to specific admin (PROTECTED - requires auth)
  notifySpecificAdmin: async (adminId: number, payload: NotificationPayload): Promise<{ status: string }> => {
    return authService.makeAuthenticatedRequest(async () => {
      const response = await apiClient.post(`/push/admin/notify/${adminId}`, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    });
  },

  // Send notification to all customers (PROTECTED - requires auth)
  notifyAllCustomers: async (payload: NotificationPayload): Promise<{ status: string }> => {
    return authService.makeAuthenticatedRequest(async () => {
      const response = await apiClient.post('/push/notify', payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    });
  },
};
