import { useEffect, useState } from 'react';
import { notificationService } from '@/services/notificationService';
import { CalendarDays, CheckCircle2, XCircle, Info, CheckCheck, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getMyNotifications(false);
      setNotifications(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'BOOKING_CREATED': return <Info className="h-5 w-5 text-blue-500" />;
      case 'BOOKING_CONFIRMED': return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      case 'BOOKING_CANCELLED': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'CHECK_IN_REMINDER': return <CalendarDays className="h-5 w-5 text-amber-500" />;
      default: return <Bell className="h-5 w-5 text-slate-400" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-slate-200 rounded mb-8" />
            <div className="h-24 bg-slate-200 rounded-2xl" />
            <div className="h-24 bg-slate-200 rounded-2xl" />
            <div className="h-24 bg-slate-200 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <PageHeader
          eyebrow="Inbox"
          title="Notifications"
          description="Stay updated on your bookings and check-ins."
          action={
            unreadCount > 0 ? (
              <Button onClick={markAllAsRead} variant="outline" className="text-slate-600 bg-white">
                <CheckCheck className="mr-2 h-4 w-4" />
                Mark all as read
              </Button>
            ) : null
          }
        />

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl">
            {error}
          </div>
        )}

        {notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No notifications yet"
            description="We'll let you know when there are updates to your bookings."
          />
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-6 rounded-3xl border transition-all ${
                  !notification.read
                    ? 'bg-white border-slate-200 shadow-md ring-1 ring-slate-900/5'
                    : 'bg-slate-50 border-slate-200/50'
                }`}
              >
                <div className="flex gap-4">
                  <div className={`shrink-0 mt-1 flex h-10 w-10 items-center justify-center rounded-full ${!notification.read ? 'bg-slate-50' : 'bg-transparent'}`}>
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2 mb-2">
                      <h3 className={`font-semibold text-base ${!notification.read ? 'text-slate-900' : 'text-slate-700'}`}>
                        {notification.title}
                      </h3>
                      <span className="text-xs font-medium text-slate-400 whitespace-nowrap">
                        {formatDate(notification.createdAt)}
                      </span>
                    </div>
                    <p className={`text-sm leading-relaxed mb-4 ${!notification.read ? 'text-slate-700' : 'text-slate-500'}`}>
                      {notification.message}
                    </p>

                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="text-xs font-medium text-emerald-600 hover:text-emerald-800 transition-colors"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
