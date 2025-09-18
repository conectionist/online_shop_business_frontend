export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  user_agent: string;
}

export interface PushSubscriptionResponse {
  id: number;
  endpoint: string;
  is_active: boolean;
}

export interface VapidPublicKeyResponse {
  publicKey: string;
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  actions?: NotificationAction[];
}


