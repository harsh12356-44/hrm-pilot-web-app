'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';
import {
  Clock,
  Calendar,
  CheckCircle2,
  LogIn,
  LogOut,
  FileText,
  Send,
  Plane,
  ClipboardCheck,
  CalendarDays,
  Bell,
  User,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  TrendingUp,
  XCircle,
} from 'lucide-react';
import AttendanceLogTab from '@/components/AttendanceLogTab';
import HolidaysTab from '@/components/HolidaysTab';
import LeaveTrackerTab from '@/components/LeaveTrackerTab';
import { Employee, AttendanceLog, LeaveRecord } from '@/lib/types';

function EmployeePortalContent() {
  const searchParams = useSearchParams();
  const activeTab = searchParams ? searchParams.get('tab') || 'dashboard' : 'dashboard';

  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('emp-8'); // Default: Lochita g1
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [attendance, setAttendance] = useState<AttendanceLog[]>([]);
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Punch Clock state
  const [punchedIn, setPunchedIn] = useState(false);
  const [punchTime, setPunchTime] = useState<string | null>(null);
  const [duration, setDuration] = useState('00:00:00');
  const [punchMsg, setPunchMsg] = useState('');

  // Apply Leave Form state
  const [leaveType, setLeaveType] = useState('Casual Leave');
  const [leaveDuration, setLeaveDuration] = useState('Full Day');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');
  const [formMsg, setFormMsg] = useState('');

  const fetchEmployeeDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [empRes, attRes, leaveRes] = await Promise.all([
        fetch(`/api/employees?t=${Date.now()}`, { cache: 'no-store' }),
        fetch(`/api/attendance?t=${Date.now()}`, { cache: 'no-store' }),
        fetch(`/api/leaves?t=${Date.now()}`, { cache: 'no-store' }),
      ]);

      const empData = await empRes.json();
      const attData = await attRes.json();
      const leaveData = await leaveRes.json();

      const employeesList: Employee[] = Array.isArray(empData) ? empData : empData.employees || [];
      const logsList: AttendanceLog[] = Array.isArray(attData.logs) ? attData.logs : Array.isArray(attData) ? attData : attData.attendance || [];
      const leavesList: LeaveRecord[] = leaveData.records || (Array.isArray(leaveData) ? leaveData : []);

      setAllEmployees(employeesList);

      // Match selected employee by ID or employeeId
      const currentEmp = employeesList.find(
        e => e.id === selectedEmployeeId || e.employeeId === selectedEmployeeId || e.name.toLowerCase().includes(selectedEmployeeId.toLowerCase())
      ) || employeesList.find(e => e.name.toLowerCase().includes('lochita')) || employeesList[0];

      setEmployee(currentEmp || null);

      if (currentEmp) {
        const empLogs = logsList.filter(a => a.employeeId === currentEmp.id || a.employeeId === currentEmp.employeeId);
        setAttendance(empLogs);

        const empLeaves = leavesList.filter(l => l.employeeId === currentEmp.id || l.employeeId === currentEmp.employeeId || l.employeeId === currentEmp.name);
        setLeaves(empLeaves);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedEmployeeId]);

  useEffect(() => {
    fetchEmployeeDashboardData();

    const handleUpdate = () => fetchEmployeeDashboardData();
    window.addEventListener('leaveDataUpdated', handleUpdate);

    // Real-time live status auto-polling interval (every 3 seconds)
    const pollInterval = setInterval(() => {
      fetchEmployeeDashboardData();
    }, 3000);

    return () => {
      window.removeEventListener('leaveDataUpdated', handleUpdate);
      clearInterval(pollInterval);
    };
  }, [fetchEmployeeDashboardData]);

  // Timer interval when punched in
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (punchedIn && punchTime) {
      timer = setInterval(() => {
        const start = new Date(punchTime).getTime();
        const now = new Date().getTime();
        const diff = Math.floor((now - start) / 1000);
        const hours = String(Math.floor(diff / 3600)).padStart(2, '0');
        const minutes = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
        const seconds = String(diff % 60).padStart(2, '0');
        setDuration(`${hours}:${minutes}:${seconds}`);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [punchedIn, punchTime]);

  const handlePunch = async (action: 'IN' | 'OUT') => {
    setLoading(true);
    setPunchMsg('');
    try {
      const res = await fetch('/api/attendance/punch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: employee?.id || 'emp-12', action }),
      });
      await res.json();

      if (action === 'IN') {
        setPunchedIn(true);
        setPunchTime(new Date().toISOString());
        setPunchMsg('Successfully punched in for today!');
      } else {
        setPunchedIn(false);
        setPunchTime(null);
        setDuration('00:00:00');
        setPunchMsg('Successfully punched out!');
      }
      fetchEmployeeDashboardData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFormMsg('');
    try {
      const res = await fetch('/api/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: employee?.id || 'emp-12',
          leaveType,
          startDate: fromDate,
          endDate: toDate || fromDate,
          daysCount: fromDate === toDate || !toDate ? 1 : 2,
          note: reason,
          status: 'PENDING',
          managerStatus: 'Pending',
          hrStatus: 'Pending',
        }),
      });

      if (res.ok) {
        setFormMsg('Leave application submitted successfully! Check live status under Leave History tab.');
        setFromDate('');
        setToDate('');
        setReason('');
        fetchEmployeeDashboardData();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('leaveDataUpdated'));
        }
      } else {
        setFormMsg('Failed to submit leave application.');
      }
    } catch (err) {
      console.error(err);
      setFormMsg('Failed to submit leave application.');
    } finally {
      setLoading(false);
    }
  };

  // Compute Employee Own Statistics
  const empName = employee ? employee.name.split(' ')[0] : 'Sonu';
  const empId = employee?.employeeId || 'SG012';
  const managerName = employee?.primaryManager || 'Naman Bangia';

  const safeAttendance = Array.isArray(attendance) ? attendance : [];
  const safeLeaves = Array.isArray(leaves) ? leaves : [];
  const safeAllEmployees = Array.isArray(allEmployees) ? allEmployees : [];

  // Stats
  const presentDaysCount = safeAttendance.filter(a => a.attendanceCode === 'P').length || 0;
  const workingDaysSoFar = 6;
  const totalWorkedMins = safeAttendance.reduce((sum, a) => sum + (a.workedMinutes || 0), 0);
  const totalHours = Math.round(totalWorkedMins / 60);
  const avgDailyHours = presentDaysCount > 0 ? (totalHours / presentDaysCount).toFixed(1) : '0';
  const lateArrivalsCount = safeAttendance.filter(a => (a.checkIn && a.checkIn > '09:15:00')).length || 0;
  
  // Approved leaves used in Q3
  const approvedLeaves = safeLeaves.filter(l => l.status === 'APPROVED');
  const leavesUsedCount = approvedLeaves.reduce((sum, l) => sum + (l.daysCount || 1), 0);
  const leaveBalance = (6 - leavesUsedCount).toFixed(1);

  // August 2026 Bar Chart Data (31 days)
  const augustDays = Array.from({ length: 31 }, (_, i) => {
    const dayNum = i + 1;
    const dateStr = `2026-08-${String(dayNum).padStart(2, '0')}`;
    const log = safeAttendance.find(a => a.date === dateStr);
    const workedHours = log ? (log.workedMinutes / 60) : (dayNum <= 6 ? 8 : 0);
    return {
      day: dayNum,
      dateStr,
      workedHours,
    };
  });

  // Helper for live final status badge on Leave History
  const getLiveStatusBadge = (l: LeaveRecord) => {
    if (!l) return null;
    const isBothApproved = (l.managerStatus === 'Approved' || l.status === 'APPROVED') && (l.hrStatus === 'Approved' || l.status === 'APPROVED');
    if (isBothApproved || l.status === 'APPROVED') {
      return (
        <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-extrabold text-[10px] uppercase tracking-wider inline-block">
          HR AND MANAGER HAVE APPROVED ✓
        </span>
      );
    }
    if (l.status === 'REJECTED' || l.managerStatus === 'Rejected' || l.hrStatus === 'Rejected') {
      return (
        <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 font-extrabold text-[10px] uppercase tracking-wider inline-block">
          REJECTED
        </span>
      );
    }
    if (l.managerStatus === 'Approved') {
      return (
        <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 font-extrabold text-[10px] uppercase tracking-wider inline-block">
          AWAITING HR FINAL APPROVAL
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-extrabold text-[10px] uppercase tracking-wider inline-block">
        PENDING MANAGER APPROVAL
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans antialiased text-slate-100 flex flex-col">
      <Navbar currentRole="EMPLOYEE" />
      <div className="flex flex-1">
        <Sidebar currentTab={activeTab} role="EMPLOYEE" />
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto space-y-6 overflow-y-auto">
          {/* Top Date Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400 border-b border-slate-800 pb-3">
            <span>Thursday, 06 August 2026 • Live HRM Portal</span>

            <div className="flex items-center space-x-2 bg-slate-900 px-3 py-1 rounded-full border border-slate-800 text-xs">
              <span className="text-slate-400 font-semibold">Active Portal View:</span>
              <select
                value={employee?.id || selectedEmployeeId}
                onChange={e => setSelectedEmployeeId(e.target.value)}
                className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
              >
                {safeAllEmployees.map(emp => (
                  <option key={emp.id} value={emp.id} className="bg-slate-900 text-white">
                    {emp.name} ({emp.employeeId || emp.id})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Purple / Blue Hero Banner */}
              <div className="rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 md:p-7 text-white shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight font-heading flex items-center space-x-2">
                    <span>Good morning, {empName}</span>
                    <span className="animate-bounce inline-block">👋</span>
                  </h1>
                  <p className="text-xs md:text-sm text-blue-100 opacity-90">
                    Here is your attendance, work-hour summary and leave balance for this month.
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 text-xs font-semibold text-white whitespace-nowrap self-start sm:self-center shadow-inner">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 mr-2"></span>
                  <span>ID: {empId} • Manager: {managerName}</span>
                </div>
              </div>

              {/* 4 Metric Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg flex flex-col justify-between space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400">Present Days</span>
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <p className="text-3xl font-extrabold text-white font-heading">{presentDaysCount}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Out of {workingDaysSoFar} working days so far</p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg flex flex-col justify-between space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400">Total Hours</span>
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                      <Clock className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <p className="text-3xl font-extrabold text-white font-heading">{totalHours}h</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{avgDailyHours}h avg daily</p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg flex flex-col justify-between space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400">Late Arrivals</span>
                    <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <p className="text-3xl font-extrabold text-white font-heading">{lateArrivalsCount}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Recorded this month</p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg flex flex-col justify-between space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400">Leave Balance</span>
                    <div className="w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                      <Plane className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <p className="text-3xl font-extrabold text-white font-heading">{leaveBalance}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Days left in Q3 2026</p>
                  </div>
                </div>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-extrabold text-white font-heading">Monthly Attendance Analytics</h2>
                      <p className="text-xs text-slate-400">Daily working hours for August 2026</p>
                    </div>
                    <Link
                      href="/employee?tab=attendance"
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700 transition"
                    >
                      View details
                    </Link>
                  </div>

                  <div className="pt-6 pb-2 border-t border-slate-800/80">
                    <div className="h-48 flex items-end justify-between gap-1 overflow-x-auto">
                      {augustDays.map(item => {
                        const heightPct = Math.min(100, (item.workedHours / 9) * 100);
                        return (
                          <div key={item.day} className="flex-1 flex flex-col items-center gap-2 group min-w-[12px]">
                            <span className="text-[9px] font-mono text-purple-300 opacity-0 group-hover:opacity-100 transition">
                              {item.workedHours > 0 ? `${item.workedHours}h` : '0h'}
                            </span>
                            <div className="w-full bg-slate-800/60 rounded-t-md h-36 flex items-end overflow-hidden">
                              <div
                                style={{ height: `${heightPct}%` }}
                                className={`w-full rounded-t-md transition-all duration-500 ${
                                  item.workedHours > 0
                                    ? 'bg-gradient-to-t from-blue-600 to-indigo-500 group-hover:from-blue-500 group-hover:to-indigo-400'
                                    : 'bg-transparent'
                                }`}
                              ></div>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">{item.day}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                    <div>
                      <h2 className="text-base font-extrabold text-white font-heading">Quick Actions</h2>
                      <p className="text-xs text-slate-400">Common employee actions</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Link
                        href="/employee?tab=apply-leave"
                        className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-purple-500/50 hover:bg-slate-800 transition text-left space-y-1.5 group"
                      >
                        <Plane className="w-5 h-5 text-purple-400 group-hover:scale-110 transition transform" />
                        <div>
                          <p className="text-xs font-bold text-white">Apply Leave</p>
                          <p className="text-[10px] text-slate-400">Submit a new request</p>
                        </div>
                      </Link>

                      <Link
                        href="/employee?tab=attendance"
                        className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-blue-500/50 hover:bg-slate-800 transition text-left space-y-1.5 group"
                      >
                        <Clock className="w-5 h-5 text-blue-400 group-hover:scale-110 transition transform" />
                        <div>
                          <p className="text-xs font-bold text-white">Attendance</p>
                          <p className="text-[10px] text-slate-400">Check daily records</p>
                        </div>
                      </Link>

                      <Link
                        href="/employee?tab=leave-history"
                        className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-emerald-500/50 hover:bg-slate-800 transition text-left space-y-1.5 group"
                      >
                        <FileText className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition transform" />
                        <div>
                          <p className="text-xs font-bold text-white">Leave History</p>
                          <p className="text-[10px] text-slate-400">Track request status</p>
                        </div>
                      </Link>

                      <Link
                        href="/employee?tab=working-hours"
                        className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-amber-500/50 hover:bg-slate-850 transition text-left space-y-1.5 group"
                      >
                        <RefreshCw className="w-5 h-5 text-amber-400 group-hover:scale-110 transition transform" />
                        <div>
                          <p className="text-xs font-bold text-white">Regularise</p>
                          <p className="text-[10px] text-slate-400">Fix attendance records</p>
                        </div>
                      </Link>
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                    <div>
                      <h2 className="text-base font-extrabold text-white font-heading">Recent Activity</h2>
                      <p className="text-xs text-slate-400">Your latest HR updates</p>
                    </div>

                    <div className="space-y-3 text-xs">
                      {safeLeaves.length > 0 ? (
                        safeLeaves.slice(0, 3).map(l => (
                          <div key={l.id} className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                            <div className="flex items-center justify-between">
                              <strong className="text-white font-bold">{l.leaveType}</strong>
                              {getLiveStatusBadge(l)}
                            </div>
                            <p className="text-slate-400 text-[11px]">
                              {l.startDate} to {l.endDate || l.startDate} ({l.daysCount} days)
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-400 text-center text-[11px]">
                          No recent leave activity logged yet.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: APPLY LEAVE */}
          {activeTab === 'apply-leave' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
                <div>
                  <h3 className="text-base font-extrabold text-white font-heading">Apply for Leave</h3>
                  <p className="text-xs text-slate-400">Submit your request for manager approval</p>
                </div>

                {formMsg && (
                  <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 font-medium">
                    {formMsg}
                  </div>
                )}

                <form onSubmit={handleApplyLeaveSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Leave Type</label>
                      <select
                        value={leaveType}
                        onChange={e => setLeaveType(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-medium"
                      >
                        <option value="Casual Leave">Casual Leave</option>
                        <option value="Planned Leave">Planned Leave</option>
                        <option value="Sick Leave">Sick Leave</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Duration</label>
                      <select
                        value={leaveDuration}
                        onChange={e => setLeaveDuration(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-medium"
                      >
                        <option value="Full Day">Full Day</option>
                        <option value="Half Day (Morning)">Half Day (Morning)</option>
                        <option value="Half Day (Afternoon)">Half Day (Afternoon)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">From Date</label>
                      <input
                        type="date"
                        required
                        value={fromDate}
                        onChange={e => setFromDate(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">To Date</label>
                      <input
                        type="date"
                        value={toDate}
                        onChange={e => setToDate(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Reason</label>
                    <textarea
                      required
                      rows={4}
                      value={reason}
                      onChange={e => setReason(e.target.value)}
                      placeholder="Briefly explain the reason for leave"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-medium"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-600/30 transition flex items-center justify-center space-x-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit Leave Application</span>
                  </button>
                </form>
              </div>

              {/* Right Policy Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <h3 className="text-sm font-bold text-white font-heading">Leave Balance & Policy</h3>
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 flex justify-between items-center">
                    <span className="text-slate-300">Casual Allowance Left</span>
                    <strong className="text-amber-400 font-bold">2 Days (Q3)</strong>
                  </div>
                  <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 flex justify-between items-center">
                    <span className="text-slate-300">Planned Allowance Left</span>
                    <strong className="text-purple-400 font-bold">4 Days (Q3)</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LEAVE HISTORY & LIVE STATUS (1:1 Layout Requested) */}
          {(activeTab === 'leave-history' || activeTab === 'team-approvals') && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-lg font-extrabold text-white font-heading">My Leave History & Real-Time Approval Status</h2>
                  <p className="text-xs text-slate-400">
                    Track live status of your submitted leave applications (Manager & HR decisions)
                  </p>
                </div>

                <Link
                  href="/employee?tab=apply-leave"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md transition flex items-center space-x-2 w-fit"
                >
                  <Plane className="w-4 h-4" />
                  <span>+ Apply New Leave</span>
                </Link>
              </div>

              {/* Leave Applications Table with Live Manager / HR Status */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                      <th className="py-3.5 px-4">Request ID</th>
                      <th className="py-3.5 px-4">Leave Type</th>
                      <th className="py-3.5 px-4">Dates & Duration</th>
                      <th className="py-3.5 px-4">Reason / Notes</th>
                      <th className="py-3.5 px-4 text-center">Manager Status</th>
                      <th className="py-3.5 px-4 text-center">HR / Admin Status</th>
                      <th className="py-3.5 px-4 text-center">Live Final Status</th>
                      <th className="py-3.5 px-4 text-right">Submitted Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {safeLeaves.length > 0 ? (
                      safeLeaves.map((l, index) => {
                        if (!l) return null;
                        const reqId = l.id && typeof l.id === 'string' ? `#${l.id.replace(/[^0-9]/g, '').slice(-3) || l.id.slice(-3)}` : `#${index + 1}`;
                        const leaveTypeStr = l.leaveType || 'Leave Application';
                        const startStr = l.startDate || '2026-08-06';
                        const endStr = l.endDate || startStr;
                        const daysNum = l.daysCount || 1;
                        const noteStr = l.note || 'Leave application';
                        const isApproved = l.status === 'APPROVED' || (l.managerStatus === 'Approved' && l.hrStatus === 'Approved');
                        const isRejected = l.status === 'REJECTED' || l.managerStatus === 'Rejected' || l.hrStatus === 'Rejected';

                        const mgrStat = isApproved ? 'Approved' : isRejected ? 'Rejected' : (l.managerStatus || 'Pending');
                        const hrStat = isApproved ? 'Approved' : isRejected ? 'Rejected' : (l.hrStatus || 'Pending');

                        let dateStr = '06 Aug 2026';
                        try {
                          if (l.createdAt) {
                            dateStr = new Date(l.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                          }
                        } catch (e) {}

                        return (
                          <tr key={l.id || index} className="hover:bg-slate-850 transition">
                            <td className="py-3.5 px-4 font-mono font-bold text-slate-300">
                              {reqId}
                            </td>
                            <td className="py-3.5 px-4 font-bold text-purple-300">
                              {leaveTypeStr}
                            </td>
                            <td className="py-3.5 px-4 font-mono text-slate-300">
                              {startStr} to {endStr} ({daysNum} days)
                            </td>
                            <td className="py-3.5 px-4 text-slate-300 max-w-xs truncate">
                              {noteStr}
                            </td>
                            <td className="py-3.5 px-4 text-center font-semibold text-slate-300">
                              {mgrStat}
                            </td>
                            <td className="py-3.5 px-4 text-center font-semibold text-slate-300">
                              {hrStat}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              {getLiveStatusBadge(l)}
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono text-slate-400 text-[11px]">
                              {dateStr}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-slate-500">
                          No leave applications submitted yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* OTHER TABS */}
          {activeTab === 'attendance' && <AttendanceLogTab hideImport={true} targetEmployeeId={employee?.id || 'emp-12'} />}
          {activeTab === 'working-hours' && <AttendanceLogTab hideImport={true} targetEmployeeId={employee?.id || 'emp-12'} />}
          {activeTab === 'holidays' && <HolidaysTab />}
        </main>
      </div>
    </div>
  );
}

export default function EmployeePortalPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-white">Loading Employee Portal...</div>}>
      <EmployeePortalContent />
    </Suspense>
  );
}
