'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { Download, Calendar, FileSpreadsheet, CheckCircle2, FileDown } from 'lucide-react';
import * as XLSX from 'xlsx';

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
  const [exportedCount, setExportedCount] = useState(0);

  const handleExportExcel = async () => {
    setExporting(true);
    setDownloaded(false);
    try {
      const [attRes, empRes] = await Promise.all([
        fetch(`/api/attendance?month=${selectedMonth}&year=${selectedYear}&department=${departmentFilter}`),
        fetch(`/api/employees`),
      ]);

      const attData = await attRes.json();
      const empData = await empRes.json();

      const logs: any[] = Array.isArray(attData.logs) ? attData.logs : [];
      let employees: any[] = Array.isArray(empData.employees) ? empData.employees : Array.isArray(empData) ? empData : [];

      if (departmentFilter !== 'ALL') {
        employees = employees.filter(e => e.department === departmentFilter);
      }

      const totalDaysInMonth = new Date(Number(selectedYear), Number(selectedMonth), 0).getDate();
      const daysArray = Array.from({ length: totalDaysInMonth }, (_, i) => i + 1);

      // Create Matrix Data for Sheet 1
      const matrixRows: any[] = [];

      employees.forEach(emp => {
        const empLogs = logs.filter(l => l.employeeId === emp.id);
        const row: any = {
          'Emp Code': emp.employeeId || emp.id,
          'Employee Name': emp.name,
          'Department': emp.department,
          'Designation': emp.designation,
        };

        let totalWorkedMins = 0;
        let totalShortMins = 0;
        let totalExtraMins = 0;

        daysArray.forEach(dayNum => {
          const padDay = String(dayNum).padStart(2, '0');
          const padMonth = String(selectedMonth).padStart(2, '0');
          const dateStr = `${selectedYear}-${padMonth}-${padDay}`;
          const log = empLogs.find(l => l.date === dateStr);

          const dateObj = new Date(dateStr);
          const isSunday = dateObj.getDay() === 0;

          if ((log && (log.attendanceCode === 'WO-I' || log.attendanceCode === 'WO')) || (isSunday && (!log || log.attendanceCode === 'WO-I' || log.attendanceCode === 'WO'))) {
            row[dayNum] = 'WO';
          } else if (log) {
            if (log.attendanceCode === 'A') {
              row[dayNum] = 'A';
            } else if (log.attendanceCode === 'HD') {
              row[dayNum] = 'HD (4h)';
              totalWorkedMins += 240;
            } else if (log.workedMinutes > 0) {
              const h = Math.floor(log.workedMinutes / 60);
              const m = log.workedMinutes % 60;
              row[dayNum] = m > 0 ? `${h}h ${m}m` : `${h}h`;
              totalWorkedMins += log.workedMinutes;
              totalShortMins += log.shortMinutes || 0;
              totalExtraMins += log.extraMinutes || 0;
            } else {
              row[dayNum] = log.attendanceCode || '-';
            }
          } else {
            row[dayNum] = '-';
          }
        });

        row['Total Worked Hours'] = `${(totalWorkedMins / 60).toFixed(1)} hrs`;
        row['Total Short Hours'] = `${(totalShortMins / 60).toFixed(1)} hrs`;
        row['Overtime Extra Hours'] = `${(totalExtraMins / 60).toFixed(1)} hrs`;

        matrixRows.push(row);
      });

      // Create Detailed Punch Logs for Sheet 2
      const detailedLogs = logs.map(l => {
        const emp = employees.find(e => e.id === l.employeeId);
        return {
          'Emp ID': emp?.employeeId || l.employeeId,
          'Employee Name': emp?.name || l.employeeName || 'Unknown',
          'Department': emp?.department || l.department || 'General',
          'Date': l.date,
          'Check In': l.checkIn || '--:--',
          'Check Out': l.checkOut || '--:--',
          'Worked Minutes': l.workedMinutes || 0,
          'Worked Hours': (l.workedMinutes / 60).toFixed(2),
          'Short Minutes': l.shortMinutes || 0,
          'Overtime Minutes': l.extraMinutes || 0,
          'Status Code': l.attendanceCode || 'P',
        };
      });

      const wb = XLSX.utils.book_new();

      // Sheet 1: Monthly Matrix
      const wsMatrix = XLSX.utils.json_to_sheet(matrixRows);
      XLSX.utils.book_append_sheet(wb, wsMatrix, 'Monthly Matrix Grid');

      // Sheet 2: Daily Punch Logs
      const wsDetails = XLSX.utils.json_to_sheet(detailedLogs);
      XLSX.utils.book_append_sheet(wb, wsDetails, 'Daily Punch Logs');

      const monthName = MONTHS.find(m => m.value === selectedMonth)?.name || selectedMonth;
      const filename = `HRM_Pilot_Attendance_${monthName}_${selectedYear}.xlsx`;

      XLSX.writeFile(wb, filename);

      setExportedCount(matrixRows.length);
      setDownloaded(true);
    } catch (err) {
      console.error(err);
    } finally {
      setExporting(false);
    }
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
                  ? `Generating ${selectedMonthName} ${selectedYear} Excel...`
                  : `Download ${selectedMonthName} ${selectedYear} Master Excel`}
              </span>
            </button>

            {downloaded && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>
                  Successfully exported <strong>{selectedMonthName} {selectedYear}</strong> attendance matrix for {exportedCount} employees!
                </span>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
