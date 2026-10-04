'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useFoodRescue } from '@/lib/store';
import { Bell, Check, Trash2, ExternalLink } from 'lucide-react';

export function NotificationCenter() {
  const { notifications, markNotificationRead, clearNotifications, currentUser } = useFoodRescue();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter notifications for current user or admin
  const userNotifs = notifications.filter(
    (n) => n.user_id === currentUser.id || currentUser.role === 'admin'
  );
  const unreadCount = userNotifs.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full text-neutral-text hover:bg-neutral-bg transition-colors focus:outline-none"
        aria-label="Open notifications"
      >
        <Bell className="w-5 h-5 text-neutral-text" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-black text-white bg-[#C62828] rounded-full border-2 border-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-card shadow-floating border border-neutral-border z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-neutral-bg border-b border-neutral-border">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-neutral-text">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-xs bg-primary-light text-primary font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {userNotifs.length > 0 && (
              <button
                onClick={clearNotifications}
                className="text-xs text-neutral-muted hover:text-red-600 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear all</span>
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-neutral-border">
            {userNotifs.length === 0 ? (
              <div className="py-8 text-center text-xs text-neutral-muted">
                No notifications right now.
              </div>
            ) : (
              userNotifs.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markNotificationRead(n.id)}
                  className={`p-3.5 hover:bg-neutral-bg transition-colors cursor-pointer flex items-start gap-3 ${
                    !n.read ? 'bg-emerald-50/40' : ''
                  }`}
                >
                  <div className="mt-0.5">
                    {!n.read ? (
                      <span className="w-2 h-2 rounded-full bg-primary block" />
                    ) : (
                      <Check className="w-3.5 h-3.5 text-neutral-muted" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-neutral-text truncate">{n.title}</p>
                    <p className="text-xs text-neutral-muted mt-0.5 leading-relaxed">{n.message}</p>
                    <span className="text-[10px] text-gray-400 mt-1 block">
                      {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
