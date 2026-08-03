'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Bell, Check, X, LogOut, Shield, UserCheck, LayoutDashboard, UserCheck2, User, Sun, Moon } from 'lucide-react';
import { NotificationItem } from '@/lib/types';

interface NavbarProps {
  currentRole?: string;
  onRoleChange?: (role: string) => void;
}

export default function Navbar({ currentRole = 'ADMIN' }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifPopover, setShowNotifPopover] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

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
    const savedTheme = (localStorage.getItem('hrm_theme') as 'dark' | 'light') || 'dark';
    setTheme(savedTheme);
    if (savedTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('hrm_theme', nextTheme);
    if (nextTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

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

  const setRoleCookie = (role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE') => {
    document.cookie = `hrm_user_role=${role}; path=/`;
  };

  const handleAccountSwitch = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
    setRoleCookie(val);
    const targetUrl = val === 'ADMIN' ? '/admin' : val === 'MANAGER' ? '/manager' : '/employee';
    router.push(targetUrl);
  };

  return (
    <header className="bg-[#0f172a] border-b border-slate-800 text-white sticky top-0 z-40 px-6 py-3 flex items-center justify-between shadow-xl transition-colors duration-300">
      <div className="flex items-center space-x-6">
        <Link href="/admin" onClick={() => setRoleCookie('ADMIN')} className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-black text-lg shadow-md text-white">
            H
          </div>
          <div>
            <span className="font-black text-base tracking-tight text-white font-heading">
              HRM Pilot
            </span>
            <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold uppercase tracking-wider">
              WP 1:1 SaaS
            </span>
          </div>
        </Link>

        {/* Dynamic Portal Switcher Links (Admin, Manager, Employee) */}
        <div className="hidden lg:flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 space-x-1">
          <Link
            href="/admin"
            onClick={() => setRoleCookie('ADMIN')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
              pathname.startsWith('/admin')
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>HR Admin Suite</span>
          </Link>

          <Link
            href="/manager"
            onClick={() => setRoleCookie('MANAGER')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
              pathname === '/manager'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <UserCheck2 className="w-3.5 h-3.5" />
            <span>Manager Desk</span>
          </Link>

          <Link
            href="/employee"
            onClick={() => setRoleCookie('EMPLOYEE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
              pathname === '/employee'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Employee Portal</span>
          </Link>
        </div>
      </div>

      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* WP Admin Account Switcher Dropdown */}
        <div className="hidden md:flex items-center space-x-2 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Switch View:</span>
          <select
            onChange={handleAccountSwitch}
            value={pathname.startsWith('/admin') ? 'ADMIN' : pathname === '/manager' ? 'MANAGER' : 'EMPLOYEE'}
            className="bg-transparent text-xs font-bold text-blue-400 focus:outline-none cursor-pointer"
          >
            <option value="ADMIN" className="bg-slate-900 text-white">Super Admin (Harshit Bhootra)</option>
            <option value="MANAGER" className="bg-slate-900 text-white">HR Manager (Ananya Sharma)</option>
            <option value="EMPLOYEE" className="bg-slate-900 text-white">Employee (Rajesh Kumar)</option>
          </select>
        </div>

        {/* Authenticated Role Badge */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700/60 text-xs text-slate-200">
          {currentRole === 'ADMIN' ? (
            <Shield className="w-3.5 h-3.5 text-blue-400" />
          ) : (
            <UserCheck className="w-3.5 h-3.5 text-purple-400" />
          )}
          <span className="font-bold text-[11px] uppercase tracking-wider text-slate-300">
            Role: <span className="text-white font-extrabold">{currentRole}</span>
          </span>
        </div>

        {/* Theme Switcher Toggle (Light / Dark Mode) */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 transition flex items-center space-x-1.5 text-xs font-bold shadow-sm"
          title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span className="hidden xl:inline text-amber-300">Light</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-indigo-400" />
              <span className="hidden xl:inline text-indigo-400">Dark</span>
            </>
          )}
        </button>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifPopover(!showNotifPopover)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition relative"
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
                  notifications.map((n) => (
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
