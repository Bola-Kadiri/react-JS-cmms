import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
} from '@/services/notificationsApi';

const KEYS = {
  all: ['notifications'] as const,
  unread: ['notifications', 'unread-count'] as const,
};

export const useNotifications = () =>
  useQuery({
    queryKey: KEYS.all,
    queryFn: fetchNotifications,
    staleTime: 30_000,
    refetchInterval: 60_000, // poll every 60 s
  });

export const useUnreadCount = () =>
  useQuery({
    queryKey: KEYS.unread,
    queryFn: fetchUnreadCount,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

export const useMarkRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all });
      qc.invalidateQueries({ queryKey: KEYS.unread });
    },
  });
};

export const useMarkAllRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all });
      qc.invalidateQueries({ queryKey: KEYS.unread });
    },
  });
};
