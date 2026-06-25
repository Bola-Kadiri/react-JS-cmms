import { api } from './apiClient';
import { Notification } from '@/types/notification';

const BASE = '/work/api/notifications';

export const fetchNotifications = async (): Promise<Notification[]> => {
  const res = await api.get(`${BASE}/`);
  return Array.isArray(res.data) ? res.data : res.data?.results ?? [];
};

export const fetchUnreadCount = async (): Promise<number> => {
  const res = await api.get(`${BASE}/unread-count/`);
  return res.data?.unread_count ?? 0;
};

export const markNotificationRead = async (id: number): Promise<void> => {
  await api.patch(`${BASE}/${id}/read/`);
};

export const markAllNotificationsRead = async (): Promise<void> => {
  await api.patch(`${BASE}/read-all/`);
};
