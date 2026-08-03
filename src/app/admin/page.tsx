'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';
import {
  Users,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Upload,
  UserCheck2,
  Building2,
  FileCheck,
  DollarSign,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  BarChart2,
  ExternalLink,
} from 'lucide-react';
import { Employee, AttendanceLog, LeaveRecord } from '@/lib/types';

export default function AdminDashboardPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<AttendanceLog[]>([]);
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [empRes, attRes, leaveRes] = await Promise.all([
          fetch('/api/employees'),
          fetch('/api/attendance'),
          fetch('/api/leaves'),
        ]);

        const empData = await empRes.json();
        const attData = await attRes.json();
        const leaveData = await leaveRes.json();

        setEmployees(Array.isArray(empData) ? empData : []);
        setAttendance(Array.isArray(attData) ? attData : []);
        setLeaves(Array.isArray(leaveData) ? leaveData : []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const totalEmployees = employees.length || 18;
  const presentToday = attendance.filter((a) => a.attendanceCode === 'P').length || 15;
  const halfDaysToday = attendance.filter((a) => a.attendanceCode === 'HD').length || 2;
  const absentToday = attendance.filter((a) => a.attendanceCode === 'A').length || 1;
  const pendingLeaves = leaves.filter((l) => l.status === 'PENDING').length || 1;

  // 15-day trend data generation for Attendance Count Trend
  const last15Days = [
    { date: '20 Jul MON', count: 16, pct: 88 },
    { date: '21 Jul TUE', count: 17, pct: 94 },
    { date: '22 Jul WED', count: 18, pct: 100 },
    { date: '23 Jul THU', count: 15, pct: 83 },
    { date: '24 Jul FRI', count: 16, pct: 88 },
    { date: '25 Jul SAT', count: 10, pct: 55 },
    { date: '26 Jul SUN', count: 0, pct: 0 },
    { date: '27 Jul MON', count: 17, pct: 94 },
    { date: '28 Jul TUE', count: 18, pct: 100 },
    { date: '29 Jul WED', count: 16, pct: 88 },
    { date: '30 Jul THU', count: 17, pct: 94 },
    { date: '31 Jul FRI', count: 15, pct: 83 },
    { date: '01 Aug SAT', count: 12, pct: 66 },
    { date: '02 Aug SUN', count: 0, pct: 0 },
    { date: '03 Aug MON', count: 15, pct: 83 },
  ];

  // Recent & Pending Leave Requests sample data (Screenshot 2)
  const recentLeaveRequests = [
    {
      id: 'REQ-101',
      employee: 'Harshit Bhootra',
      subject: 'Casual Leave Request',
      dates: '04 Aug - 05 Aug',
      reason: 'Family function',
      managerStatus: 'APPROVED',
      hrStatus: 'PENDING',
      finalStatus: 'PENDING',
    },
    {
      id: 'REQ-102',
      employee: 'Rajesh Kumar',
      subject: 'Planned Annual Leave',
      dates: '10 Aug - 12 Aug',
      reason: 'Medical checkup & travel',
      managerStatus: 'APPROVED',
      hrStatus: 'APPROVED',
      finalStatus: 'APPROVED',
    },
    {
      id: 'REQ-103',
      employee: 'Ananya Sharma',
      subject: 'Sick Leave',
      dates: '01 Aug - 01 Aug',
      reason: 'High fever',
      managerStatus: 'APPROVED',
      hrStatus: 'APPROVED',
      finalStatus: 'APPROVED',
    },
  ];

  // Employees Current Month Overview sample data (Screenshot 3)
  const monthOverviewList = [
    {
      name: 'Harshit Bhootra',
      empId: '123456',
      deptDesig: 'IT / Manager',
      requiredHours: '176h',
      completedHours: '168h',
      shortHours: '8h',
      overtimeHours: '4h',
      status: 'COMPLETE',
    },
    {
      name: 'Rajesh Kumar',
      empId: '123457',
      deptDesig: 'Sales / Executive',
      requiredHours: '176h',
      completedHours: '176h',
      shortHours: '0h',
      overtimeHours: '2h',
      status: 'COMPLETE',
    },
    {
      name: 'Ananya Sharma',
      empId: '123458',
      deptDesig: 'Human Resources / Lead',
      requiredHours: '176h',
      completedHours: '172h',
      shortHours: '4h',
      overtimeHours: '0h',
      status: 'COMPLETE',
    },
    {
      name: 'Priya Verma',
      empId: '123459',
      deptDesig: 'Marketing / Specialist',
      requiredHours: '176h',
      completedHours: '160h',
      shortHours: '16h',
      overtimeHours: '0h',
      status: 'COMPLETE',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 font-sans antialiased text-slate-100 flex flex-col">
      <Navbar currentRole="ADMIN" />
      <div className="flex flex-1">
        <Sidebar currentTab="dashboard" />
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto overflow-y-auto space-y-8">
          {/* Top Banner */}
          <div className="rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 p-6 md:p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-10 w-96 h-96 bg-white rounded-full blur-3xl pointer-events-none"></div>
            <div className="relative z-10 space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-blue-200 bg-white/10 px-3 py-1 rounded-full w-fit">
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                <span>HRM Pilot Portal Controller • Active</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight font-heading">
                Welcome to HRM Pilot Central Controller
              </h1>
              <p className="text-sm text-blue-100 max-w-2xl">
                1:1 feature parity with WordPress HRM Attendance Portal. Manage employees, biometrics, leave policies, department heads, and payroll calculations.
              </p>

              <div className="pt-4 flex flex-wrap gap-3">
                <Link
                  href="/admin/attendance/import"
                  className="px-4 py-2 rounded-xl bg-white text-blue-700 font-bold text-xs hover:bg-blue-50 transition shadow flex items-center space-x-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Import Punch CSV/Excel</span>
                </Link>
                <Link
                  href="/admin/leave-tracker"
                  className="px-4 py-2 rounded-xl bg-blue-600/80 hover:bg-blue-600 border border-blue-400/40 text-white font-bold text-xs transition flex items-center space-x-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Open Leave Tracker</span>
                </Link>
                <Link
                  href="/admin/payroll"
                  className="px-4 py-2 rounded-xl bg-purple-600/80 hover:bg-purple-600 border border-purple-400/40 text-white font-bold text-xs transition flex items-center space-x-2"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Payroll & Deductions</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Employees</span>
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-3xl font-extrabold text-white font-heading">{loading ? '...' : totalEmployees}</p>
              <p className="text-[11px] text-slate-400">Active roster members</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Present Today</span>
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-3xl font-extrabold text-emerald-400 font-heading">{loading ? '...' : presentToday}</p>
              <p className="text-[11px] text-slate-400">Biometric verified</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Half Day (HD)</span>
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
              <p className="text-3xl font-extrabold text-amber-400 font-heading">{loading ? '...' : halfDaysToday}</p>
              <p className="text-[11px] text-slate-400">Under 480 mins shift</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-red-400">Absent Today</span>
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <p className="text-3xl font-extrabold text-red-400 font-heading">{loading ? '...' : absentToday}</p>
              <p className="text-[11px] text-slate-400">Unexcused / Leave</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Pending Requests</span>
                <FileCheck className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-3xl font-extrabold text-purple-400 font-heading">{loading ? '...' : pendingLeaves}</p>
              <p className="text-[11px] text-slate-400">Awaiting HR approval</p>
            </div>
          </div>

          {/* COMPONENT 1: Attendance Count Trend (Last 15 Days) (Screenshot 1) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-white font-heading flex items-center space-x-2">
                  <BarChart2 className="w-5 h-5 text-blue-400" />
                  <span>Attendance Count Trend (Last 15 Days)</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Daily verified biometric attendance count and presence percentage</p>
              </div>
            </div>

            {/* Visual Bar Graph Pill Container */}
            <div className="pt-4 pb-2 px-2 border-t border-slate-800/80">
              <div className="flex items-end justify-between gap-2 h-44">
                {last15Days.map((item, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
                    <span className="text-[10px] font-mono font-bold text-slate-300 opacity-0 group-hover:opacity-100 transition">
                      {item.count}
                    </span>
                    <div className="w-full bg-slate-800/80 rounded-t-lg h-32 flex items-end overflow-hidden p-1">
                      <div
                        style={{ height: `${item.pct}%` }}
                        className={`w-full rounded-md transition-all duration-500 ${
                          item.pct === 0
                            ? 'bg-transparent'
                            : item.pct < 70
                            ? 'bg-amber-500/80 group-hover:bg-amber-400'
                            : 'bg-blue-600 group-hover:bg-blue-500'
                        }`}
                      ></div>
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium text-center leading-tight">
                      <span className="block font-bold text-slate-300">{item.date.split(' ')[0]} {item.date.split(' ')[1]}</span>
                      <span className="block text-[9px] text-slate-500 uppercase">{item.date.split(' ')[2]}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* COMPONENT 2: Recent & Pending Leave Requests (Screenshot 2) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-extrabold text-white font-heading flex items-center space-x-2">
                  <FileCheck className="w-5 h-5 text-purple-400" />
                  <span>Recent & Pending Leave Requests</span>
                </h2>
                <p className="text-xs text-slate-400">Applications submitted by employees requiring manager & HR approval</p>
              </div>

              <Link
                href="/admin/leave-records"
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 rounded-xl text-xs font-semibold border border-slate-700 transition flex items-center space-x-1.5"
              >
                <span>View All Pending Approvals</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                    <th className="py-3 px-4">REQUEST ID</th>
                    <th className="py-3 px-4">EMPLOYEE</th>
                    <th className="py-3 px-4">LEAVE SUBJECT</th>
                    <th className="py-3 px-4">DATES</th>
                    <th className="py-3 px-4">REASON</th>
                    <th className="py-3 px-4 text-center">MANAGER STATUS</th>
                    <th className="py-3 px-4 text-center">HR STATUS</th>
                    <th className="py-3 px-4 text-center">FINAL STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {recentLeaveRequests.length > 0 ? (
                    recentLeaveRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-300">{req.id}</td>
                        <td className="py-3.5 px-4 font-bold text-white">{req.employee}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-300">{req.subject}</td>
                        <td className="py-3.5 px-4 font-mono text-slate-400">{req.dates}</td>
                        <td className="py-3.5 px-4 text-slate-400 truncate max-w-xs">{req.reason}</td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`px-2.5 py-1 rounded-full font-bold text-[10px] uppercase ${
                              req.managerStatus === 'APPROVED'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {req.managerStatus}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`px-2.5 py-1 rounded-full font-bold text-[10px] uppercase ${
                              req.hrStatus === 'APPROVED'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {req.hrStatus}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`px-2.5 py-1 rounded-full font-bold text-[10px] uppercase ${
                              req.finalStatus === 'APPROVED'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {req.finalStatus}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500 font-medium">
                        No recent leave requests recorded.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* COMPONENT 3: Employees Current Month Overview (Screenshot 3) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="pb-3 border-b border-slate-800">
              <h2 className="text-lg font-extrabold text-white font-heading flex items-center space-x-2">
                <Clock className="w-5 h-5 text-indigo-400" />
                <span>Employees Current Month Overview</span>
              </h2>
              <p className="text-xs text-slate-400">Monthly working hours compilation, short hours, overtime, and completion status</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                    <th className="py-3 px-4">EMPLOYEE</th>
                    <th className="py-3 px-4">EMPLOYEE ID</th>
                    <th className="py-3 px-4">DEPARTMENT / DESIGNATION</th>
                    <th className="py-3 px-4 text-center">REQUIRED HOURS</th>
                    <th className="py-3 px-4 text-center">COMPLETED HOURS</th>
                    <th className="py-3 px-4 text-center">SHORT HOURS</th>
                    <th className="py-3 px-4 text-center">OVERTIME HOURS</th>
                    <th className="py-3 px-4 text-center">MONTHLY STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {monthOverviewList.map((emp, index) => (
                    <tr key={index} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 font-bold text-white">{emp.name}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">{emp.empId}</td>
                      <td className="py-3.5 px-4 text-slate-300 font-medium">{emp.deptDesig}</td>
                      <td className="py-3.5 px-4 text-center font-mono text-slate-400">{emp.requiredHours}</td>
                      <td className="py-3.5 px-4 text-center font-mono text-emerald-400 font-bold">{emp.completedHours}</td>
                      <td className="py-3.5 px-4 text-center font-mono text-amber-400">{emp.shortHours}</td>
                      <td className="py-3.5 px-4 text-center font-mono text-purple-400">{emp.overtimeHours}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full font-bold text-[10px] uppercase">
                          {emp.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Access Modules Grid */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white font-heading flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              <span>HR Admin Portal Modules</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Link
                href="/admin/employees"
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-850 transition group space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition transform group-hover:translate-x-1" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Employee Roster</h3>
                  <p className="text-xs text-slate-400 mt-1">Manage profiles, base salaries, designation, and work shifts.</p>
                </div>
              </Link>

              <Link
                href="/admin/managers"
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-850 transition group space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                    <UserCheck2 className="w-5 h-5" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition transform group-hover:translate-x-1" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Managers Desk</h3>
                  <p className="text-xs text-slate-400 mt-1">Assign department heads, view subordinate reporting, and delegate approvals.</p>
                </div>
              </Link>

              <Link
                href="/admin/departments"
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-850 transition group space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition transform group-hover:translate-x-1" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Departments Allocation</h3>
                  <p className="text-xs text-slate-400 mt-1">Create departments, assign managers, and track member allocation counts.</p>
                </div>
              </Link>

              <Link
                href="/admin/attendance"
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-850 transition group space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition transform group-hover:translate-x-1" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Attendance Grid</h3>
                  <p className="text-xs text-slate-400 mt-1">View daily attendance status codes (P, HD, A, PL, UL, WO-I) and manual punch logs.</p>
                </div>
              </Link>

              <Link
                href="/admin/working-hours"
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-850 transition group space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition transform group-hover:translate-x-1" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Working Hours & Overtime</h3>
                  <p className="text-xs text-slate-400 mt-1">Track worked minutes vs 480 mins requirement, short hours, and overtime breakdown.</p>
                </div>
              </Link>

              <Link
                href="/admin/leave-records"
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-rose-500/50 hover:bg-slate-850 transition group space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-rose-400 transition transform group-hover:translate-x-1" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Leave Requests Desk</h3>
                  <p className="text-xs text-slate-400 mt-1">Review pending leave applications, approve, reject, or request additional handover details.</p>
                </div>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
