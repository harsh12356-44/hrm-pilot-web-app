'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
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
  Plane,
  FileText,
  ClipboardCheck,
  Bell,
} from 'lucide-react';

interface SidebarProps {
  currentTab?: string;
  role?: string;
}

function SidebarContent({ currentTab, role }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTabParam = searchParams ? searchParams.get('tab') : null;
  const activeTab = activeTabParam || currentTab || 'dashboard';

  const [activeRole, setActiveRole] = useState<string>('ADMIN');
  const [isManager, setIsManager] = useState<boolean>(false);
  const [empCodeDisplay, setEmpCodeDisplay] = useState<string>('NB002');

  const getCookieRole = () => {
    if (typeof document === 'undefined') return 'ADMIN';
    const match = document.cookie.match(new RegExp('(^| )hrm_user_role=([^;]+)'));
    return match ? match[2] : 'ADMIN';
  };

  useEffect(() => {
    const updateSidebarData = async () => {
      const currentRole = role || getCookieRole();
      setActiveRole(currentRole);

      if (typeof window !== 'undefined') {
        const storedId = localStorage.getItem('hrm_active_employee_id');
        const isMgr =
          localStorage.getItem('hrm_active_employee_is_manager') === 'true' ||
          localStorage.getItem('hrm_active_employee_role') === 'MANAGER' ||
          localStorage.getItem('hrm_active_employee_role') === 'ADMIN';
        setIsManager(isMgr);

        try {
          const res = await fetch(`/api/employees?t=${Date.now()}`);
          const data = await res.json();
          const employeesList: any[] = Array.isArray(data) ? data : data.employees || [];
          const emp = employeesList.find((e: any) => e.id === storedId || e.employeeId === storedId);
          if (emp) {
            setEmpCodeDisplay(emp.employeeId || emp.id);
          } else if (storedId) {
            setEmpCodeDisplay(storedId);
          }
        } catch (e) {}
      }
    };

    updateSidebarData();

    window.addEventListener('roleChange', updateSidebarData);
    window.addEventListener('employeeChanged', updateSidebarData);
    return () => {
      window.removeEventListener('roleChange', updateSidebarData);
      window.removeEventListener('employeeChanged', updateSidebarData);
    };
  }, [role, pathname]);

  // Determine effective role based on current path
  const effectiveRole = pathname.startsWith('/employee')
    ? 'EMPLOYEE'
    : pathname.startsWith('/manager')
    ? 'MANAGER'
    : activeRole;

  // 1. Admin Suite Sections
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

  // 2. Employee Portal Menu Options
  const employeeSections = [
    {
      title: '',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/employee?tab=dashboard' },
        { id: 'attendance', label: 'Attendance', icon: Clock, href: '/employee?tab=attendance' },
        { id: 'apply-leave', label: 'Apply Leave', icon: Plane, href: '/employee?tab=apply-leave' },
        { id: 'leave-history', label: 'Leave History', icon: FileText, href: '/employee?tab=leave-history' },
        ...(isManager ? [{ id: 'team-approvals', label: 'Team Approvals', icon: ClipboardCheck, href: '/employee?tab=team-approvals' }] : []),
        { id: 'working-hours', label: 'Working Hours', icon: Clock, href: '/employee?tab=working-hours' },
        { id: 'holidays', label: 'Holidays List', icon: CalendarDays, href: '/employee?tab=holidays' },
        { id: 'notifications', label: 'Notifications', icon: Bell, href: '/employee?tab=notifications' },
        { id: 'profile', label: 'My Profile', icon: User, href: '/employee?tab=profile' },
      ],
    },
  ];

  const sections = effectiveRole === 'ADMIN' ? adminSections : employeeSections;

  return (
    <aside className="w-68 bg-[#0f172a] border-r border-slate-800 text-slate-300 min-h-[calc(100vh-65px)] p-4 flex flex-col justify-between shrink-0 transition-all duration-200">
      <div className="space-y-5 overflow-y-auto max-h-[calc(100vh-140px)] pr-1">
        {/* Brand Header for Portal View */}
        {effectiveRole !== 'ADMIN' && (
          <div className="px-3.5 py-2.5 border-b border-slate-800/80 mb-2">
            <p className="text-base font-black text-white tracking-tight font-heading">PeopleFlow HRM</p>
            <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Employee Portal</p>
          </div>
        )}

        {sections.map((sec, idx) => (
          <div key={idx} className="space-y-2">
            {sec.title && (
              <div className="px-3.5 pt-2">
                <p className="text-xs font-black tracking-wider text-slate-400 uppercase">
                  {sec.title}
                </p>
              </div>
            )}
            <nav className="space-y-1.5">
              {sec.items.map((item) => {
                const Icon = item.icon;
                const cleanHref = item.href.split('?')[0];
                const isActive = activeTabParam
                  ? activeTabParam === item.id
                  : currentTab
                  ? currentTab === item.id
                  : cleanHref === '/admin' || cleanHref === '/employee'
                  ? pathname === cleanHref
                  : pathname === cleanHref || pathname.startsWith(cleanHref);

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => {
                      if (typeof window !== 'undefined' && window.innerWidth < 768) {
                        window.dispatchEvent(new CustomEvent('closeMobileSidebar'));
                      }
                    }}
                    className={`flex items-center space-x-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-extrabold text-sm'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/80 font-medium'
                    }`}
                  >
                    <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span className="truncate text-sm">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Footer Employee ID Info Box (Matching Screenshot 1) */}
      <div className="pt-3 border-t border-slate-800/80">
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-left space-y-1">
          <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Employee ID</p>
          <p className="text-sm font-mono font-bold text-white">{empCodeDisplay}</p>
        </div>
      </div>
    </aside>
  );
}

export default function Sidebar(props: SidebarProps) {
  return (
    <React.Suspense fallback={<aside className="w-68 bg-[#0f172a] border-r border-slate-800 shrink-0"></aside>}>
      <SidebarContent {...props} />
    </React.Suspense>
  );
}
