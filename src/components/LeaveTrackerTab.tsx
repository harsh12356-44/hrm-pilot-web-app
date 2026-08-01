'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Upload,
  Download,
  Calendar,
  PlusCircle,
  Users,
  Search,
  PieChart,
  BarChart3,
  Edit2,
  Eye,
} from 'lucide-react';
import RecordLeaveModal from './RecordLeaveModal';
import { LeaveSummary, Employee } from '@/lib/types';
import * as XLSX from 'xlsx';

export default function LeaveTrackerTab() {
  const [quarter, setQuarter] = useState<'Q1' | 'Q2' | 'Q3' | 'Q4'>('Q3');
  const [department, setDepartment] = useState('ALL');
  const [search, setSearch] = useState('');
  const [summaries, setSummaries] = useState<LeaveSummary[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [importStatus, setImportStatus] = useState('');

  const fetchLeaveData = useCallback(async () => {
    try {
      const res = await fetch(`/api/leaves?quarter=${quarter}&department=${department}`);
      const data = await res.json();
      setSummaries(data.summaries || []);
      setEmployees(data.employees || []);
    } catch (err) {
      console.error('Failed to fetch leave data:', err);
    }
  }, [quarter, department]);

  useEffect(() => {
    fetchLeaveData();
  }, [fetchLeaveData]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async evt => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const data = XLSX.utils.sheet_to_json(ws);
        setImportStatus(`Successfully parsed ${data.length} records from ${file.name}!`);
        setTimeout(() => setImportStatus(''), 4000);
      } catch {
        setImportStatus('Error parsing file. Please upload a valid CSV or XLSX.');
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(summaries);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Leave_Summary_${quarter}`);
    XLSX.writeFile(wb, `HRM_Pilot_Leave_Summary_${quarter}.xlsx`);
  };

  // Filter summaries by search
  const filteredSummaries = summaries.filter(s =>
    s.employeeName.toLowerCase().includes(search.toLowerCase())
  );

  // Stat calculations
  const totalEmployeesCount = summaries.length;
  const totalCasualUsed = summaries.reduce((sum, s) => sum + s.casualUsed, 0);
  const totalPlannedUsed = summaries.reduce((sum, s) => sum + s.plannedUsed, 0);
  const totalLeavesUsed = totalCasualUsed + totalPlannedUsed;
  const totalDeductionAlerts = summaries.reduce((sum, s) => sum + s.extraDeduct, 0);

  // Departments list for filter dropdown
  const departments = ['ALL', ...Array.from(new Set(employees.map(e => e.department)))];

  return (
    <div className="space-y-6 text-slate-100 pb-12">
      {/* 1. Top Import Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Upload className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Import Leave Summary Tracker</h4>
            <p className="text-xs text-slate-400">Upload legacy policy spreadsheets (.csv, .xlsx, .xls)</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <input
            type="file"
            id="csv-import"
            accept=".csv, .xlsx, .xls"
            onChange={handleFileUpload}
            className="hidden"
          />
          <label
            htmlFor="csv-import"
            className="cursor-pointer px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 transition"
          >
            Choose File
          </label>
          <button
            onClick={() => document.getElementById('csv-import')?.click()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-600/30 transition flex items-center space-x-2"
          >
            <span>Import Data</span>
          </button>
        </div>
      </div>

      {importStatus && (
        <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-xs font-medium text-blue-300">
          {importStatus}
        </div>
      )}

      {/* 2. Hero Banner */}
      <div className="rounded-2xl p-6 md:p-8 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-white text-xs font-semibold border border-white/20">
            <Calendar className="w-3.5 h-3.5 text-blue-300" />
            <span>Quarterly Leave System</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Quarterly Leave Overview
          </h2>
          <p className="text-xs md:text-sm text-blue-100 leading-relaxed opacity-95">
            This dashboard mirrors your uploaded tracker with Casual Used, Planned Used, Total Used, Remaining, and Extra Leaves to Deduct for every employee.
          </p>

          <div className="pt-3 flex flex-wrap items-center gap-3">
            <button className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold border border-white/20 backdrop-blur-md transition flex items-center space-x-2">
              <span>⚡ Adjust Employee Leave</span>
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-900/40 transition flex items-center space-x-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Record Leave Period</span>
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-white text-xs font-semibold border border-slate-700 transition flex items-center space-x-2"
            >
              <Download className="w-4 h-4 text-blue-400" />
              <span>Export Current Quarter</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Quarter Selector Pills */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 overflow-x-auto">
        {[
          { key: 'Q1', label: 'Q1 - Jan-Mar' },
          { key: 'Q2', label: 'Q2 - Apr-Jun' },
          { key: 'Q3', label: 'Q3 - Jul-Sep' },
          { key: 'Q4', label: 'Q4 - Oct-Dec' },
        ].map(q => (
          <button
            key={q.key}
            onClick={() => setQuarter(q.key as 'Q1' | 'Q2' | 'Q3' | 'Q4')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              quarter === q.key
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800 hover:bg-slate-800'
            }`}
          >
            {q.label}
          </button>
        ))}
      </div>

      {/* 4. 5 Stat Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Card 1 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Employees</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-white">{totalEmployeesCount}</span>
            <span className="text-[10px] text-slate-500 ml-2">Active Profiles</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Casual Leaves Used</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-sm">
              C
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-amber-400">{totalCasualUsed}</span>
            <span className="text-[10px] text-slate-500 ml-2">Days</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Planned Leaves Used</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-sm">
              P
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-purple-400">{totalPlannedUsed}</span>
            <span className="text-[10px] text-slate-500 ml-2">Days</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Leaves Used</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-sm">
              Σ
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-indigo-400">{totalLeavesUsed}</span>
            <span className="text-[10px] text-slate-500 ml-2">Days</span>
          </div>
        </div>

        {/* Card 5 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Deduction Alerts</span>
            <div className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 font-bold text-sm">
              !
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-red-400">{totalDeductionAlerts}</span>
            <span className="text-[10px] text-slate-500 ml-2">Excess Days</span>
          </div>
        </div>
      </div>

      {/* 5. 2 Charts Cards Side-by-Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Card: Leave Usage Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center space-x-2">
              <PieChart className="w-4 h-4 text-blue-400" />
              <span>Leave Usage Distribution</span>
            </h4>
            <span className="text-xs text-slate-500">{quarter} Real-time</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 pt-2">
            {/* Donut graphic */}
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-blue-500"
                  strokeDasharray={`${Math.min(100, totalLeavesUsed * 10)}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-lg font-extrabold text-white">{totalLeavesUsed}</span>
                <span className="text-[10px] text-slate-400">Total Used</span>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                <span className="text-slate-300">Casual used: {totalCasualUsed}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-purple-500 inline-block" />
                <span className="text-slate-300">Planned used: {totalPlannedUsed}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-slate-700 inline-block" />
                <span className="text-slate-400">
                  Remaining allowance:{' '}
                  {summaries.reduce((sum, s) => sum + s.remaining, 0)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Card: Highest Leave Usage */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-purple-400" />
              <span>Highest Leave Usage</span>
            </h4>
            <span className="text-xs text-slate-500">Employee Ranking</span>
          </div>

          <div className="space-y-3 pt-1">
            {summaries.slice(0, 4).map(s => (
              <div key={s.employeeId} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">{s.employeeName}</span>
                  <span className="text-slate-400 font-mono">{s.totalUsed} used</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(5, s.utilizationPercentage)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 6. Employee Leave Register Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {/* Table Controls Header */}
        <div className="p-5 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/50">
          <div>
            <h3 className="text-base font-bold text-white">Employee Leave Register</h3>
            <p className="text-xs text-slate-400">
              {quarter} • {filteredSummaries.length} records shown
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search employee..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-48 transition"
              />
            </div>

            {/* Department Filter */}
            <select
              value={department}
              onChange={e => setDepartment(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition"
            >
              <option value="ALL">All Departments</option>
              {departments.filter(d => d !== 'ALL').map(dept => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <th className="py-3.5 px-4">EMPLOYEE</th>
                <th className="py-3.5 px-4 text-center">CASUAL USED</th>
                <th className="py-3.5 px-4 text-center">PLANNED USED</th>
                <th className="py-3.5 px-4 text-center">TOTAL USED</th>
                <th className="py-3.5 px-4 text-center">REMAINING</th>
                <th className="py-3.5 px-4">UTILIZATION</th>
                <th className="py-3.5 px-4 text-center">EXTRA LEAVES TO DEDUCT</th>
                <th className="py-3.5 px-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredSummaries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 text-sm">
                    No employee records found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredSummaries.map(s => {
                  const avatarInitials = s.employeeName
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase();

                  return (
                    <tr key={s.employeeId} className="hover:bg-slate-800/40 transition">
                      {/* Employee Cell */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white text-xs shadow">
                            {avatarInitials}
                          </div>
                          <div>
                            <p className="font-semibold text-white text-xs">{s.employeeName}</p>
                            <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                              Active
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Casual Used */}
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-amber-400">
                        {s.casualUsed}
                      </td>

                      {/* Planned Used */}
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-purple-400">
                        {s.plannedUsed}
                      </td>

                      {/* Total Used */}
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-white">
                        {s.totalUsed}
                      </td>

                      {/* Remaining */}
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-300">
                        {s.remaining}
                      </td>

                      {/* Utilization */}
                      <td className="py-3.5 px-4 w-40">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-slate-400">
                            <span>{s.utilizationPercentage}%</span>
                          </div>
                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-blue-500 h-full rounded-full transition-all"
                              style={{ width: `${s.utilizationPercentage}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Extra Leaves to Deduct */}
                      <td className="py-3.5 px-4 text-center">
                        {s.extraDeduct > 0 ? (
                          <span className="px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 font-bold font-mono text-xs">
                            {s.extraDeduct} Extra
                          </span>
                        ) : (
                          <span className="text-slate-500 font-mono text-xs">0</span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition">
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button className="p-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 transition">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Leave Modal */}
      <RecordLeaveModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        employees={employees}
        onSuccess={fetchLeaveData}
      />
    </div>
  );
}
