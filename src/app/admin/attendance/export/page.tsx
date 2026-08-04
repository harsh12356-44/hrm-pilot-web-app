'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { Download, Calendar, FileSpreadsheet, CheckCircle2, FileDown } from 'lucide-react';

const MONTHS = [
  { value: '1', name: 'January' },
  { value: '2', name: 'February' },
  { value: '3', name: 'March' },
  { value: '4', name: 'April' },
  { value: '5', name: 'May' },
  { value: '6', name: 'June' },
  { value: '7', name: 'July' },
  { value: '8', name: 'August' },
  { value: '9', name: 'September' },
  { value: '10', name: 'October' },
  { value: '11', name: 'November' },
  { value: '12', name: 'December' },
];

const YEARS = ['2024', '2025', '2026', '2027'];

export default function AttendanceExportPage() {
  const [selectedMonth, setSelectedMonth] = useState('7'); // July default
  const [selectedYear, setSelectedYear] = useState('2026');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [exporting, setExporting] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleExportExcel = () => {
    setExporting(true);
    setDownloaded(false);

    // Direct browser navigation to server-side export API with attachment headers
    const downloadUrl = `/api/attendance/export?month=${selectedMonth}&year=${selectedYear}&department=${departmentFilter}`;
    window.location.href = downloadUrl;

    setTimeout(() => {
      setDownloaded(true);
      setExporting(false);
    }, 1500);
  };

  const selectedMonthName = MONTHS.find(m => m.value === selectedMonth)?.name;

  return (
    <div className="min-h-screen bg-slate-950 font-sans antialiased text-slate-100 flex flex-col">
      <Navbar currentRole="ADMIN" />
      <div className="flex flex-1">
        <Sidebar currentTab="attendance-export" />
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto overflow-y-auto space-y-6">
          <div className="border-b border-slate-800 pb-5">
            <h1 className="text-2xl font-extrabold text-white font-heading flex items-center space-x-3">
              <Download className="w-6 h-6 text-emerald-400" />
              <span>Attendance Export Desk</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Export monthly biometric punch logs, attendance status codes, and worked minutes reports into Excel format.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 max-w-2xl mx-auto text-center shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto shadow-inner">
              <FileSpreadsheet className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-white font-heading">Export Monthly Attendance Master</h3>
              <p className="text-xs text-slate-400 mt-1">
                Generates a multi-sheet Excel workbook containing the 1:1 Monthly Matrix Grid and detailed punch logs.
              </p>
            </div>

            {/* Select Month, Year, and Department Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              {/* Month Dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Select Month</span>
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-bold focus:outline-none focus:border-emerald-500"
                >
                  {MONTHS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Year Dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Select Year</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-bold focus:outline-none focus:border-emerald-500"
                >
                  {YEARS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              {/* Department Dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Department</label>
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-bold focus:outline-none focus:border-emerald-500"
                >
                  <option value="ALL">All Departments</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Development">Development</option>
                  <option value="SEO">SEO</option>
                  <option value="Founders Office">Founders Office</option>
                  <option value="General">General</option>
                </select>
              </div>
            </div>

            {/* Download Button */}
            <button
              onClick={handleExportExcel}
              disabled={exporting}
              className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white text-xs transition shadow-lg shadow-emerald-600/20 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <FileDown className="w-5 h-5" />
              <span>
                {exporting
                  ? `Downloading ${selectedMonthName} ${selectedYear} Master Excel...`
                  : `Download ${selectedMonthName} ${selectedYear} Master Excel`}
              </span>
            </button>

            {downloaded && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>
                  Spreadsheet <strong>HRM_Pilot_Attendance_{selectedMonthName}_{selectedYear}.xlsx</strong> downloaded!
                </span>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
