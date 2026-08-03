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

  const totalEmployees = employees.length;
  const presentToday = attendance.filter((a) => a.attendanceCode === 'P').length;
  const halfDaysToday = attendance.filter((a) => a.attendanceCode === 'HD').length;
  const absentToday = attendance.filter((a) => a.attendanceCode === 'A').length;
  const pendingLeaves = leaves.filter((l) => l.status === 'PENDING').length;

  return (
    <div className="min-h-screen bg-slate-950 font-sans antialiased text-slate-100 flex flex-col">
      <Navbar currentRole="ADMIN" />
      <div className="flex flex-1">
        <Sidebar currentTab="dashboard" />
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto overflow-y-auto space-y-6">
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
