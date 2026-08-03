'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  UserCheck2,
  Building2,
  Calendar,
  Upload,
  Download,
  Clock,
  BarChart3,
  CalendarDays,
  FileSpreadsheet,
  FileCheck,
  DollarSign,
  Settings,
  ShieldAlert,
  UserCheck,
  User,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  role?: string;
}

export default function Sidebar({ currentTab, role }: SidebarProps) {
  const pathname = usePathname();
  const [activeRole, setActiveRole] = useState<string>('ADMIN');

  const getCookieRole = () => {
    if (typeof document === 'undefined') return 'ADMIN';
    const match = document.cookie.match(new RegExp('(^| )hrm_user_role=([^;]+)'));
    return match ? match[2] : 'ADMIN';
  };

  useEffect(() => {
    const updateRole = () => {
      const currentRole = role || getCookieRole();
      setActiveRole(currentRole);
    };

    updateRole();

    window.addEventListener('roleChange', updateRole);
    return () => window.removeEventListener('roleChange', updateRole);
  }, [role, pathname]);

  // Determine effective role based on current path if cookie/prop is ambiguous
  const effectiveRole = pathname.startsWith('/employee')
    ? 'EMPLOYEE'
    : pathname.startsWith('/manager')
    ? 'MANAGER'
    : activeRole;

  // Role-specific Sidebar Sections
  const adminSections = [
    {
      title: 'CORE MANAGEMENT',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
        { id: 'employees', label: 'Employees Roster', icon: Users, href: '/admin/employees' },
        { id: 'managers', label: 'Managers Desk', icon: UserCheck2, href: '/admin/managers' },
        { id: 'departments', label: 'Departments', icon: Building2, href: '/admin/departments' },
      ],
    },
    {
      title: 'ATTENDANCE & TIME',
      items: [
        { id: 'attendance', label: 'Attendance Grid', icon: Calendar, href: '/admin/attendance' },
        { id: 'attendance-import', label: 'Attendance Import', icon: Upload, href: '/admin/attendance/import' },
        { id: 'attendance-export', label: 'Attendance Export', icon: Download, href: '/admin/attendance/export' },
        { id: 'working-hours', label: 'Working Hours', icon: Clock, href: '/admin/working-hours' },
        { id: 'attendance-analytics', label: 'Attendance Analytics', icon: BarChart3, href: '/admin/attendance-analytics' },
      ],
    },
    {
      title: 'LEAVES & PAYROLL',
      items: [
        { id: 'holidays', label: 'Holidays List', icon: CalendarDays, href: '/admin/holidays' },
        { id: 'leave-tracker', label: 'Leave Tracker', icon: FileSpreadsheet, href: '/admin/leave-tracker' },
        { id: 'leave-records', label: 'Leave Requests', icon: FileCheck, href: '/admin/leave-records' },
        { id: 'payroll', label: 'Payroll & Salary', icon: DollarSign, href: '/admin/payroll' },
      ],
    },
    {
      title: 'PORTALS & CONFIG',
      items: [
        { id: 'employee-portal', label: 'Employee Portal', icon: UserCheck, href: '/employee' },
        { id: 'manager-desk', label: 'Manager Desk', icon: UserCheck2, href: '/manager' },
        { id: 'audit-logs', label: 'System Audit Logs', icon: ShieldAlert, href: '/admin/audit-logs' },
        { id: 'settings', label: 'Settings Rules', icon: Settings, href: '/admin/settings' },
      ],
    },
  ];

  const managerSections = [
    {
      title: 'MANAGER WORKSPACE',
      items: [
        { id: 'manager-desk', label: 'Manager Approval Desk', icon: UserCheck2, href: '/manager' },
        { id: 'employees', label: 'Team Employees', icon: Users, href: '/admin/employees' },
        { id: 'attendance', label: 'Team Attendance Grid', icon: Calendar, href: '/admin/attendance' },
        { id: 'leave-records', label: 'Team Leave Requests', icon: FileCheck, href: '/admin/leave-records' },
        { id: 'working-hours', label: 'Working Hours Summary', icon: Clock, href: '/admin/working-hours' },
        { id: 'holidays', label: 'Holidays Roster', icon: CalendarDays, href: '/admin/holidays' },
      ],
    },
  ];

  const employeeSections = [
    {
      title: 'EMPLOYEE PORTAL',
      items: [
        { id: 'employee-portal', label: 'Punch Clock & Portal', icon: User, href: '/employee' },
        { id: 'attendance', label: 'My Attendance Log', icon: Calendar, href: '/admin/attendance' },
        { id: 'leave-records', label: 'My Leave Applications', icon: FileCheck, href: '/admin/leave-records' },
        { id: 'holidays', label: 'Public Holidays', icon: CalendarDays, href: '/admin/holidays' },
      ],
    },
  ];

  const sections =
    effectiveRole === 'EMPLOYEE'
      ? employeeSections
      : effectiveRole === 'MANAGER'
      ? managerSections
      : adminSections;

  return (
    <aside className="w-64 bg-[#0f172a] border-r border-slate-800 text-slate-300 min-h-[calc(100vh-65px)] p-4 flex flex-col justify-between shrink-0 transition-all duration-200">
      <div className="space-y-5 overflow-y-auto max-h-[calc(100vh-140px)] pr-1">
        {/* Role Badge Indicator in Sidebar */}
        <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 mb-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sidebar Menu View:</p>
          <p className="text-xs font-extrabold text-blue-400">
            {effectiveRole === 'ADMIN'
              ? 'Super Admin Mode'
              : effectiveRole === 'MANAGER'
              ? 'Manager Mode'
              : 'Employee Mode'}
          </p>
        </div>

        {sections.map((sec, idx) => (
          <div key={idx} className="space-y-1.5">
            <div className="px-3 pt-2">
              <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                {sec.title}
              </p>
            </div>
            <nav className="space-y-1">
              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white font-semibold shadow-sm shadow-blue-600/30'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Footer info badge */}
      <div className="pt-3 border-t border-slate-800/80">
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-left space-y-1">
          <p className="text-xs font-bold text-slate-200">HRM Pilot Web App</p>
          <p className="text-[10px] text-emerald-400 font-medium">● Role Menu Filter Active</p>
        </div>
      </div>
    </aside>
  );
}
