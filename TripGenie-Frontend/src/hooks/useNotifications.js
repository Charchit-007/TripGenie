// hooks/useNotifications.js
import { useState, useEffect, useCallback } from 'react';

const BASE_URL = 'http://localhost:5000';

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const userId = localStorage.getItem('userId');

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/notifications/${userId}`);
      const data = await res.json();
      const notifs = data.notifications || [];
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.isRead).length);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Initial fetch + poll every 5 minutes
  useEffect(() => {
    if (!userId) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchNotifications, userId]);

  const markAsRead = async (notificationId) => {
    try {
      await fetch(`${BASE_URL}/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
      });
      setNotifications(prev =>
        prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const markAllRead = async () => {
    if (!userId) return;
    try {
      await fetch(`${BASE_URL}/api/notifications/${userId}/read-all`, {
        method: 'PATCH',
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await fetch(`${BASE_URL}/api/notifications/${notificationId}`, {
        method: 'DELETE',
      });
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      setUnreadCount(prev => {
        const wasUnread = notifications.find(n => n._id === notificationId && !n.isRead);
        return wasUnread ? Math.max(0, prev - 1) : prev;
      });
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllRead,
    deleteNotification,
    refetch: fetchNotifications,
  };
}