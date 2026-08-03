'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { Download, Calendar, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function AttendanceExportPage() {
  const [month, setMonth] = useState('2026-08');
  const [exporting, setExporting] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const res = await fetch('/api/attendance');
      const data = await res.json();
      const ws = XLSX.utils.json_to_sheet(Array.isArray(data) ? data : []);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, `Attendance_${month}`);
      XLSX.writeFile(wb, `HRM_Pilot_Attendance_Log_${month}.xlsx`);
      setDownloaded(true);
    } catch (err) {
      console.error(err);
    } finally {
      setExporting(false);
    }
  };

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

          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 max-w-xl mx-auto text-center shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
              <FileSpreadsheet className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white font-heading">Export Monthly Attendance Master</h3>
              <p className="text-xs text-slate-400 mt-1">
                Generates a clean spreadsheet containing worked minutes, short hours, overtime, and daily codes.
              </p>
            </div>

            <div className="space-y-2 text-left">
              <label className="text-xs font-bold text-slate-300">Select Month / Year Period:</label>
              <input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              onClick={handleExportCSV}
              disabled={exporting}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white text-xs transition shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{exporting ? 'Generating Excel Spreadsheet...' : 'Download Attendance Master Excel'}</span>
            </button>

            {downloaded && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center justify-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Spreadsheet successfully exported to your downloads folder!</span>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
