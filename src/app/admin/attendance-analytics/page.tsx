'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { BarChart3, TrendingUp, PieChart, Users, CheckCircle2, AlertTriangle, Calendar } from 'lucide-react';
import { AttendanceLog, Employee } from '@/lib/types';

export default function AttendanceAnalyticsPage() {
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [attRes, empRes] = await Promise.all([
          fetch('/api/attendance'),
          fetch('/api/employees'),
        ]);
        const attData = await attRes.json();
        const empData = await empRes.json();
        setLogs(Array.isArray(attData) ? attData : []);
        setEmployees(Array.isArray(empData) ? empData : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalLogs = logs.length || 1;
  const presentCount = logs.filter((l) => l.attendanceCode === 'P').length;
  const hdCount = logs.filter((l) => l.attendanceCode === 'HD').length;
  const absentCount = logs.filter((l) => l.attendanceCode === 'A').length;
  const leaveCount = logs.filter((l) => l.attendanceCode === 'PL' || l.attendanceCode === 'UL').length;

  const attendanceRate = Math.round(((presentCount + hdCount * 0.5) / totalLogs) * 100) || 0;

  return (
    <div className="min-h-screen bg-slate-950 font-sans antialiased text-slate-100 flex flex-col">
      <Navbar currentRole="ADMIN" />
      <div className="flex flex-1">
        <Sidebar currentTab="attendance-analytics" />
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto overflow-y-auto space-y-6">
          <div className="border-b border-slate-800 pb-5">
            <h1 className="text-2xl font-extrabold text-white font-heading flex items-center space-x-3">
              <BarChart3 className="w-6 h-6 text-purple-400" />
              <span>Attendance Analytics & Performance Visualizer</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Visual attendance rate percentages, status breakdown distribution, and organizational workforce metrics.
            </p>
          </div>

          {/* Top Analytics Hero Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-gradient-to-tr from-slate-900 to-indigo-950 border border-slate-800 space-y-3 shadow-xl">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Overall Attendance Rate</span>
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-4xl font-extrabold text-white font-heading">{loading ? '...' : `${attendanceRate}%`}</p>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-blue-500" style={{ width: `${attendanceRate}%` }}></div>
              </div>
              <p className="text-[11px] text-slate-400">Calculated over {totalLogs} biometric punch logs</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-xl">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Status Distribution</span>
              <div className="space-y-2 pt-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center space-x-2 text-slate-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                    <span>Full Present (P)</span>
                  </span>
                  <span className="font-bold text-white">{presentCount} logs</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center space-x-2 text-slate-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                    <span>Half Day (HD)</span>
                  </span>
                  <span className="font-bold text-white">{hdCount} logs</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center space-x-2 text-slate-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
                    <span>Absent (A)</span>
                  </span>
                  <span className="font-bold text-white">{absentCount} logs</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center space-x-2 text-slate-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
                    <span>Approved Leave (PL/UL)</span>
                  </span>
                  <span className="font-bold text-white">{leaveCount} logs</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-xl">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Workforce Roster</span>
              <div className="flex items-center space-x-3 pt-2">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-lg">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-white font-heading">{employees.length}</p>
                  <p className="text-xs text-slate-400">Total Registered Employees</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
