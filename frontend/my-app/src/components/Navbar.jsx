import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Menu, Bell, Loader2 } from 'lucide-react';
import { authService } from '../services/api';

const Navbar = ({ toggleSidebar, user }) => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // ✅ FIXED: getNotifications returns array directly (not .data wrapper)
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await authService.getNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ✅ FIXED: backend uses isRead not read, _id not id
  const markAllAsRead = async () => {
    try {
      await authService.markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  // ✅ FIXED: count unread using isRead field
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <nav className="fixed top-0 left-0 right-0 z-30 border-b border-white/5 lg:left-72 bg-slateDark-950/80 backdrop-blur-md">
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">

        {/* Menu toggle (mobile) */}
        <button
          onClick={toggleSidebar}
          className="p-2 transition-colors rounded-lg hover:bg-white/[0.05]"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5 text-slate-400" />
        </button>

        {/* Right side */}
        <div className="flex items-center gap-4">

          {/* Notifications */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowNotifDropdown(prev => !prev)}
              className="relative p-2 transition-colors rounded-lg hover:bg-white/[0.05]"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-slate-400" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-2 w-2">
                  <span className="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping bg-brand-500" />
                  <span className="relative inline-flex w-2 h-2 rounded-full bg-brand-500" />
                </span>
              )}
            </button>

            {showNotifDropdown && (
              <div className="absolute right-0 z-50 mt-2 border rounded-2xl shadow-xl w-80 bg-slateDark-950 border-white/10">
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                  <h3 className="text-sm font-bold text-white">
                    Notifications {unreadCount > 0 && (
                      <span className="ml-1.5 rounded-full bg-brand-500 px-1.5 py-0.5 text-[9px] font-bold">
                        {unreadCount}
                      </span>
                    )}
                  </h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs font-semibold transition-colors text-brand-400 hover:text-brand-300"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="overflow-y-auto max-h-80">
                  {loading ? (
                    <div className="flex items-center justify-center p-6">
                      <Loader2 className="w-5 h-5 animate-spin text-brand-500" />
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="p-6 text-xs font-semibold text-center text-slate-500">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif._id}
                        className={`px-4 py-3 border-b border-white/5 transition-colors ${
                          !notif.isRead
                            ? 'bg-brand-500/5'
                            : 'hover:bg-white/[0.02]'
                        }`}
                      >
                        {/* ✅ FIXED: use notif.title and notif.message from backend schema */}
                        {notif.title && (
                          <p className="mb-0.5 text-xs font-bold text-slate-200">{notif.title}</p>
                        )}
                        <p className="text-xs text-slate-400">{notif.message}</p>
                        <p className="mt-1 text-[10px] text-slate-600">
                          {new Date(notif.createdAt).toLocaleString([], {
                            dateStyle: 'short',
                            timeStyle: 'short'
                          })}
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
              <p className="text-sm font-semibold text-white">{user?.name || 'User'}</p>
              <p className="text-xs text-slate-400">{user?.role || 'Guest'}</p>
            </div>
            <div className="flex items-center justify-center w-9 h-9 font-bold text-white rounded-full bg-gradient-to-br from-brand-500 to-purple-500">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;