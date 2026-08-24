import React, { createContext, useState, useEffect, useContext } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext.jsx';
import api from '../services/api.js';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toast, setToast] = useState(null);

  // Fetch notifications initially
  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const { data } = await api.get('/notifications');
      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error.message);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  // Set up socket listener for live alerts
  useEffect(() => {
    if (!user) return;

    const socketUrl = import.meta.env.VITE_SOCKET_URL || 
      (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : window.location.origin);
    const socket = io(socketUrl, {
      transports: ['polling', 'websocket']
    });

    socket.on('connect', () => {
      socket.emit('register', user._id);
    });

    socket.on('notification', (newNotif) => {
      // Add to notifications array
      setNotifications((prev) => [newNotif, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // Trigger custom UI Toast
      setToast({
        title: newNotif.title,
        message: newNotif.message,
        id: Date.now()
      });

      // Clear toast after 5 seconds
      setTimeout(() => {
        setToast(null);
      }, 5000);
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const markAsRead = async (id) => {
    try {
      const { data } = await api.put(`/notifications/${id}/read`);
      if (data.success) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { data } = await api.put('/notifications/read-all');
      if (data.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all read:', error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        refreshNotifications: fetchNotifications
      }}
    >
      {children}

      {/* Floating Glassmorphism Toast Component */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full rounded-2xl glass shadow-2xl border border-white/20 p-4 transition-all duration-300 transform translate-y-0 animate-bounce">
          <div className="flex items-start">
            <div className="flex-1">
              <p className="text-sm font-bold text-blue-600 font-display">{toast.title}</p>
              <p className="mt-1 text-xs text-slate-600">{toast.message}</p>
            </div>
            <button
              onClick={() => setToast(null)}
              className="ml-4 text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};
