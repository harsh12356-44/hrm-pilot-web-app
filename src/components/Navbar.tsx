'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, Check, X, LogOut } from 'lucide-react';
import { NotificationItem } from '@/lib/types';

interface NavbarProps {
  currentRole?: string;
  onRoleChange?: (role: string) => void;
}

export default function Navbar({ currentRole = 'ADMIN', onRoleChange }: NavbarProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifPopover, setShowNotifPopover] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      setNotifications(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkRead = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    document.cookie = 'hrm_user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    router.push('/login');
  };

  return (
    <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 text-white sticky top-0 z-40 px-6 py-3.5 flex items-center justify-between shadow-lg">
      <div className="flex items-center space-x-3">
        <Link href="/admin" className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-xl shadow-md text-white">
            H
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-blue-300 bg-clip-text text-transparent">
              HRM Pilot
            </span>
            <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-medium">
              SaaS v2.0
            </span>
          </div>
        </Link>
      </div>

      <div className="flex items-center space-x-4">
        {/* Role Switcher */}
        <div className="flex items-center bg-slate-800/90 rounded-lg p-1 border border-slate-700/60 text-xs">
          {['ADMIN', 'EMPLOYEE', 'MANAGER'].map(r => (
            <Link
              key={r}
              href={r === 'ADMIN' ? '/admin' : r === 'EMPLOYEE' ? '/employee' : '/manager'}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                currentRole === r
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              onClick={() => onRoleChange && onRoleChange(r)}
            >
              {r}
            </Link>
          ))}
        </div>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifPopover(!showNotifPopover)}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition relative"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-slate-900">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Popover Tray */}
          {showNotifPopover && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="text-xs font-bold text-white">Notifications Center</h4>
                <button onClick={() => setShowNotifPopover(false)} className="text-slate-400 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-[11px] text-slate-500 text-center py-4">No recent notifications</p>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      className={`p-2.5 rounded-xl border text-xs space-y-1 transition ${
                        n.isRead
                          ? 'bg-slate-950/40 border-slate-800/60 text-slate-400'
                          : 'bg-blue-500/10 border-blue-500/30 text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[11px] text-blue-300">{n.title}</span>
                        {!n.isRead && (
                          <button
                            onClick={() => handleMarkRead(n.id)}
                            className="p-1 hover:bg-blue-600/30 rounded text-blue-400"
                            title="Mark as read"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <p className="text-[10px] leading-relaxed text-slate-300">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3 pl-3 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow">
            {currentRole === 'ADMIN' ? 'HB' : currentRole === 'MANAGER' ? 'AS' : 'RK'}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-white">
              {currentRole === 'ADMIN' ? 'Harshit Bhootra' : currentRole === 'MANAGER' ? 'Ananya Sharma' : 'Rajesh Kumar'}
            </p>
            <p className="text-[10px] text-slate-400">
              {currentRole === 'ADMIN' ? 'Super Administrator' : currentRole === 'MANAGER' ? 'HR Manager' : 'Sales Executive'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 transition text-xs flex items-center space-x-1"
            title="Logout of session"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline font-semibold">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
