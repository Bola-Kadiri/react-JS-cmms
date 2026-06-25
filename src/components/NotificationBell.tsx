import { Bell, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useNotifications, useUnreadCount, useMarkRead, useMarkAllRead } from '@/hooks/useNotifications';
import { Notification } from '@/types/notification';

const TYPE_LABELS: Record<Notification['notification_type'], string> = {
  WORK_REQUEST: 'Work Request',
  WORK_ORDER: 'Work Order',
  WCC: 'WCC',
  PAYMENT_REQUISITION: 'Payment Requisition',
};

const NotificationBell = () => {
  const { data: notifications = [] } = useNotifications();
  const { data: unreadCount = 0 } = useUnreadCount();
  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();

  const handleClick = (n: Notification) => {
    if (!n.is_read) markRead.mutate(n.id);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-white hover:bg-green-700">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-amber-500 text-white text-[10px]"
              variant="destructive"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-[420px] overflow-y-auto">
        <div className="flex items-center justify-between px-3 py-2">
          <DropdownMenuLabel className="p-0 font-semibold">Notifications</DropdownMenuLabel>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllRead.mutate()}
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <CheckCheck className="h-3 w-3" />
              Mark all read
            </button>
          )}
        </div>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No notifications</p>
        ) : (
          notifications.slice(0, 20).map((n) => (
            <DropdownMenuItem
              key={n.id}
              onClick={() => handleClick(n)}
              className={`flex flex-col items-start gap-0.5 px-3 py-2 cursor-pointer ${
                !n.is_read ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2 w-full">
                <span className="text-xs font-semibold text-primary">{TYPE_LABELS[n.notification_type]}</span>
                {!n.is_read && <span className="ml-auto h-2 w-2 rounded-full bg-blue-500 shrink-0" />}
              </div>
              <p className="text-sm font-medium leading-tight">{n.title}</p>
              <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
              </p>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;
