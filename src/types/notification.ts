export type NotificationType = 'WORK_REQUEST' | 'WORK_ORDER' | 'WCC' | 'PAYMENT_REQUISITION';

export interface Notification {
  id: number;
  title: string;
  message: string;
  notification_type: NotificationType;
  object_id: number | null;
  is_read: boolean;
  created_at: string;
}
