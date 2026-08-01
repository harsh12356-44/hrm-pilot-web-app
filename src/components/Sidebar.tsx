'use client';

import React from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  Users,
  DollarSign,
  CalendarDays,
  FileCheck,
  Building2,
  UserCheck,
  UserCheck2,
  Settings,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
}

export default function Sidebar({ currentTab }: SidebarProps) {
  const menuItems = [
    { id: 'leave-tracker', label: 'Leave Tracker', icon: Calendar, href: '/admin' },
    { id: 'attendance', label: 'Attendance & Biometrics', icon: Clock, href: '/admin/attendance' },
    { id: 'employees', label: 'Employee Directory', icon: Users, href: '/admin/employees' },
    { id: 'departments', label: 'Departments Roster', icon: Building2, href: '/admin/departments' },
    { id: 'payroll', label: 'Payroll & Deductions', icon: DollarSign, href: '/admin/payroll' },
    { id: 'holidays', label: 'Company Holidays', icon: CalendarDays, href: '/admin/holidays' },
    { id: 'audit-logs', label: 'Audit Activity Trail', icon: FileCheck, href: '/admin/audit-logs' },
    { id: 'employee-portal', label: 'Employee Portal Desk', icon: UserCheck, href: '/employee' },
    { id: 'manager-desk', label: 'Manager Desk', icon: UserCheck2, href: '/manager' },
    { id: 'settings', label: 'System Settings', icon: Settings, href: '/admin/settings' },
  ];

  return (
    <aside className="w-64 bg-slate-900/60 border-r border-slate-800 text-slate-300 min-h-[calc(100vh-65px)] p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        <div className="px-3 py-1">
          <p className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
            Admin Modules
          </p>
        </div>

        <nav className="space-y-1.5">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600/90 text-white shadow-md shadow-blue-600/20'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer info badge */}
      <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-left space-y-1">
        <p className="text-xs font-bold text-slate-200">HRM Pilot Enterprise</p>
        <p className="text-[10px] text-slate-400">100% WP Parity Achieved</p>
      </div>
    </aside>
  );
}
