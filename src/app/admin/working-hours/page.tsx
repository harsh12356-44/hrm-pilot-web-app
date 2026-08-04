'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { Clock, AlertCircle, CheckCircle, TrendingUp, Search } from 'lucide-react';
import { AttendanceLog, Employee } from '@/lib/types';

export default function WorkingHoursPage() {
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [attRes, empRes] = await Promise.all([
          fetch('/api/attendance'),
          fetch('/api/employees'),
        ]);
        const attData = await attRes.json();
        const empData = await empRes.json();
        setLogs(Array.isArray(attData.logs) ? attData.logs : Array.isArray(attData) ? attData : []);
        setEmployees(Array.isArray(empData.employees) ? empData.employees : Array.isArray(empData) ? empData : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const emp = employees.find((e) => e.id === log.employeeId || e.employeeId === log.employeeId);
    const empName = emp ? emp.name.toLowerCase() : '';
    return empName.includes(search.toLowerCase()) || log.date.includes(search);
  });

  const totalWorkedMins = logs.reduce((sum, l) => sum + (l.workedMinutes || 0), 0);
  const totalShortMins = logs.reduce((sum, l) => sum + (l.shortMinutes || 0), 0);
  const totalExtraMins = logs.reduce((sum, l) => sum + (l.extraMinutes || 0), 0);

  return (
    <div className="min-h-screen bg-slate-950 font-sans antialiased text-slate-100 flex flex-col">
      <Navbar currentRole="ADMIN" />
      <div className="flex flex-1">
        <Sidebar currentTab="working-hours" />
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto overflow-y-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <h1 className="text-2xl font-extrabold text-white font-heading flex items-center space-x-3">
                <Clock className="w-6 h-6 text-indigo-400" />
                <span>Working Hours & Overtime Engine</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Detailed working hours breakdown, 480 mins daily requirement tracking, short hours, and overtime calculations.
              </p>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search employee or date..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-64"
              />
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Worked Hours</span>
              <p className="text-2xl font-extrabold text-indigo-400 font-heading">
                {loading ? '...' : (totalWorkedMins / 60).toFixed(1)} hrs
              </p>
              <p className="text-[10px] text-slate-500">Cumulative shift hours</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">Total Short Hours</span>
              <p className="text-2xl font-extrabold text-amber-400 font-heading">
                {loading ? '...' : (totalShortMins / 60).toFixed(1)} hrs
              </p>
              <p className="text-[10px] text-slate-500">Deduction calculation pool</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Overtime Extra Hours</span>
              <p className="text-2xl font-extrabold text-emerald-400 font-heading">
                {loading ? '...' : (totalExtraMins / 60).toFixed(1)} hrs
              </p>
              <p className="text-[10px] text-slate-500">Above 480 mins threshold</p>
            </div>
          </div>

          {/* Table */}
          <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900 shadow-lg">
            <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Working Hours Daily Log Table</h3>
              <span className="text-[11px] text-slate-500">{filteredLogs.length} Records</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3">Employee</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Check In / Out</th>
                    <th className="p-3">Worked Mins</th>
                    <th className="p-3">Required Mins</th>
                    <th className="p-3">Short Mins</th>
                    <th className="p-3">Overtime Mins</th>
                    <th className="p-3">Status Code</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-500">Loading hours log...</td>
                    </tr>
                  ) : filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-500">No working hours logs found.</td>
                    </tr>
                  ) : (
                    filteredLogs.map((l) => {
                      const emp = employees.find((e) => e.id === l.employeeId || e.employeeId === l.employeeId);
                      return (
                        <tr key={l.id} className="hover:bg-slate-850 transition">
                          <td className="p-3 font-semibold text-white">{emp ? emp.name : l.employeeId}</td>
                          <td className="p-3 font-mono text-slate-400">{l.date}</td>
                          <td className="p-3 font-mono text-slate-300">
                            {l.checkIn || '--:--'} - {l.checkOut || '--:--'}
                          </td>
                          <td className="p-3 font-mono font-bold text-indigo-400">{l.workedMinutes} mins</td>
                          <td className="p-3 font-mono text-slate-400">{l.requiredMinutes} mins</td>
                          <td className="p-3 font-mono text-amber-400">{l.shortMinutes > 0 ? `${l.shortMinutes} mins` : '-'}</td>
                          <td className="p-3 font-mono text-emerald-400">{l.extraMinutes > 0 ? `${l.extraMinutes} mins` : '-'}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                l.attendanceCode === 'P'
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : l.attendanceCode === 'HD'
                                  ? 'bg-amber-500/20 text-amber-300'
                                  : 'bg-red-500/20 text-red-300'
                              }`}
                            >
                              {l.attendanceCode}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
