import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Menu, Bell, Check, Loader2 } from 'lucide-react';
import { authService } from '../services/api';

const Navbar = ({ toggleSidebar, user }) => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // ✅ FIXED: Wrap fetchNotifications in useCallback
  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      // Adjust this API call based on your actual service
      const response = await authService.getNotifications?.(user.id);
      setNotifications(response?.data || []);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]); // Dependency: user.id (only recreates when user.id changes)

  // ✅ FIXED: Effect now has stable fetchNotifications dependency
  useEffect(() => {
    if (!user?.id) return;
    
    fetchNotifications();

    // Poll notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);

    // Cleanup
    return () => clearInterval(interval);
  }, [fetchNotifications, user?.id]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []); // ✅ Empty dependency array - runs once

  const markAsRead = async (notificationId) => {
    try {
      await authService.markNotificationAsRead?.(notificationId);
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await authService.markAllNotificationsAsRead?.();
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, read: true }))
      );
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <nav className="fixed top-0 left-0 right-0 z-30 border-b border-gray-800 lg:left-72 bg-gray-900/80 backdrop-blur-md">
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">
        {/* Left side - Menu button */}
        <button
          onClick={toggleSidebar}
          className="p-2 transition-colors rounded-lg hover:bg-gray-800"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5 text-gray-400" />
        </button>

        {/* Right side - User info & Notifications */}
        <div className="flex items-center gap-4">
          {/* Notifications Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="relative p-2 transition-colors rounded-lg hover:bg-gray-800"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-gray-400" />
              {unreadCount > 0 && (
                <span className="absolute w-2 h-2 bg-red-500 rounded-full top-1 right-1"></span>
              )}
            </button>

            {showNotifDropdown && (
              <div className="absolute right-0 z-50 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl w-80">
                <div className="flex items-center justify-between p-3 border-b border-gray-700">
                  <h3 className="text-sm font-semibold text-white">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-blue-400 hover:text-blue-300"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="overflow-y-auto max-h-96">
                  {loading ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="p-4 text-sm text-center text-gray-500">
                      No notifications
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-3 border-b border-gray-700 hover:bg-gray-700 cursor-pointer transition-colors ${
                          !notif.read ? 'bg-gray-750' : ''
                        }`}
                        onClick={() => markAsRead(notif.id)}
                      >
                        <p className="text-sm text-white">{notif.message}</p>
                        <p className="mt-1 text-xs text-gray-400">
                          {new Date(notif.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-white">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-400">{user?.role || 'Guest'}</p>
            </div>
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
              <span className="text-sm font-medium text-white">
                {user?.name?.charAt(0) || 'U'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;