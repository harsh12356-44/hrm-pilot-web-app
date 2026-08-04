'use client';

import React, { useState, useEffect } from 'react';
import { Upload, Clock, Edit2, Calendar, LayoutGrid, List } from 'lucide-react';
import * as XLSX from 'xlsx';

interface AttendanceLogTabProps {
  hideImport?: boolean;
}

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

export default function AttendanceLogTab({ hideImport = false }: AttendanceLogTabProps) {
  const [viewMode, setViewMode] = useState<'matrix' | 'daily'>('matrix');
  const [selectedMonth, setSelectedMonth] = useState('7'); // July
  const [selectedYear, setSelectedYear] = useState('2026');
  const [department, setDepartment] = useState('ALL');
  const [date, setDate] = useState('2026-07-30');

  const [logs, setLogs] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [importMessage, setImportMessage] = useState('');

  // Quick edit modal state
  const [editLog, setEditLog] = useState<any | null>(null);
  const [editCode, setEditCode] = useState('P');
  const [editIn, setEditIn] = useState('09:00');
  const [editOut, setEditOut] = useState('18:00');
  const [reason, setReason] = useState('');

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      let url = `/api/attendance?department=${department}`;
      if (viewMode === 'matrix') {
        url += `&month=${selectedMonth}&year=${selectedYear}`;
      } else {
        url += `&date=${date}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      setLogs(data.logs || []);
      setEmployees(data.employees || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [viewMode, selectedMonth, selectedYear, department, date]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async evt => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rawMatrix = XLSX.utils.sheet_to_json(ws, { header: 1 });
        const objectData = XLSX.utils.sheet_to_json(ws);

        const res = await fetch('/api/attendance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'IMPORT_MONTHLY_PUNCHES',
            filename: file.name,
            monthYear: `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`,
            rows: rawMatrix.length > 0 ? rawMatrix : objectData,
          }),
        });

        const data = await res.json();
        const count = data.totalLogsParsed || data.import?.importedRows || 0;
        setImportMessage(`Successfully imported ${count} biometric punch logs!`);
        setTimeout(() => setImportMessage(''), 5000);
        fetchAttendance();
      } catch (err) {
        setImportMessage('Error processing biometric import file.');
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleSaveCorrection = async () => {
    if (!editLog) return;
    try {
      await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'MANUAL_EDIT',
          id: editLog.id,
          employeeId: editLog.employeeId,
          date: editLog.date,
          attendanceCode: editCode,
          checkIn: editIn,
          checkOut: editOut,
          correctionReason: reason,
        }),
      });
      setEditLog(null);
      fetchAttendance();
    } catch (err) {
      console.error(err);
    }
  };

  // Days count for selected month/year
  const totalDaysInMonth = new Date(Number(selectedYear), Number(selectedMonth), 0).getDate();
  const daysArray = Array.from({ length: totalDaysInMonth }, (_, i) => i + 1);

  // Map logs by key: employeeId_date
  const logsMap: { [key: string]: any } = {};
  logs.forEach(l => {
    logsMap[`${l.employeeId}_${l.date}`] = l;
  });

  return (
    <div className="space-y-6 text-slate-100 pb-12">
      {/* Header & Importer */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center space-x-2 font-heading">
            <Clock className="w-5 h-5 text-amber-400" />
            <span>{hideImport ? 'My Attendance Log' : 'Attendance Log & Biometric Punch Importer'}</span>
          </h2>
          <p className="text-xs text-slate-400">
            {hideImport
              ? 'View your daily punch records, attendance codes, and shift duration.'
              : 'View monthly biometric matrix grid, daily check-in/out records, and import device log files.'}
          </p>
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          {/* View Switcher */}
          <div className="flex items-center bg-slate-800 border border-slate-700 rounded-xl p-1">
            <button
              onClick={() => setViewMode('matrix')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === 'matrix' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Monthly Grid</span>
            </button>
            <button
              onClick={() => setViewMode('daily')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === 'daily' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Daily List</span>
            </button>
          </div>

          {!hideImport && (
            <div>
              <input type="file" id="biometric-import" accept=".csv, .xlsx, .xls" onChange={handleFileUpload} className="hidden" />
              <label htmlFor="biometric-import" className="cursor-pointer px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md transition flex items-center space-x-2 shrink-0">
                <Upload className="w-4 h-4" />
                <span>Import Biometric File</span>
              </label>
            </div>
          )}
        </div>
      </div>

      {importMessage && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs font-semibold text-emerald-400">
          {importMessage}
        </div>
      )}

      {/* Filter Controls Bar (Matching Reference Image 1:1) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-md">
        <div className="flex flex-wrap items-center gap-4">
          {viewMode === 'matrix' ? (
            <>
              {/* Month Dropdown */}
              <div className="flex items-center space-x-2">
                <label className="text-xs font-bold text-slate-300">Month</label>
                <select
                  value={selectedMonth}
                  onChange={e => setSelectedMonth(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-blue-500 min-w-[120px]"
                >
                  {MONTHS.map(m => (
                    <option key={m.value} value={m.value}>{m.name}</option>
                  ))}
                </select>
              </div>

              {/* Year Dropdown */}
              <div className="flex items-center space-x-2">
                <label className="text-xs font-bold text-slate-300">Year</label>
                <select
                  value={selectedYear}
                  onChange={e => setSelectedYear(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-blue-500 min-w-[90px]"
                >
                  {YEARS.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <label className="text-xs font-bold text-slate-300">Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          {/* Department Filter */}
          {!hideImport && (
            <div className="flex items-center space-x-2">
              <label className="text-xs font-bold text-slate-300">Department</label>
              <select
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-blue-500 min-w-[150px]"
              >
                <option value="ALL">All Departments</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Development">Development</option>
                <option value="SEO">SEO</option>
                <option value="Founders Office">Founders Office</option>
                <option value="General">General</option>
              </select>
            </div>
          )}

          {/* Filter Action Button */}
          <button
            onClick={fetchAttendance}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition"
          >
            Filter
          </button>
        </div>

        <div className="text-xs text-slate-400 font-semibold">
          {viewMode === 'matrix' ? (
            <span>Showing matrix for <strong className="text-white">{MONTHS.find(m => m.value === selectedMonth)?.name} {selectedYear}</strong> ({employees.length} employees)</span>
          ) : (
            <span>Showing <strong className="text-white">{logs.length}</strong> log records for {date}</span>
          )}
        </div>
      </div>

      {/* MONTHLY MATRIX GRID VIEW (Matching Reference Image 1:1) */}
      {viewMode === 'matrix' ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto max-w-full">
            <table className="w-full text-left text-xs border-collapse min-w-[1200px]">
              <thead>
                <tr className="bg-slate-950 text-slate-400 uppercase font-black tracking-wider text-[11px] border-b border-slate-800">
                  {/* Sticky Employee Name Column Header */}
                  <th className="py-4 px-4 sticky left-0 z-20 bg-slate-950 border-r border-slate-800 min-w-[200px] shadow-md">
                    EMPLOYEE NAME
                  </th>
                  {/* Days Columns 1..31 Header */}
                  {daysArray.map(dayNum => {
                    const padDay = String(dayNum).padStart(2, '0');
                    const padMonth = String(selectedMonth).padStart(2, '0');
                    const dateObj = new Date(`${selectedYear}-${padMonth}-${padDay}`);
                    const isSunday = dateObj.getDay() === 0;

                    return (
                      <th
                        key={dayNum}
                        className={`py-3 px-2 text-center border-r border-slate-800/80 min-w-[70px] ${
                          isSunday ? 'bg-amber-500/10 text-amber-300 font-extrabold' : ''
                        }`}
                      >
                        <span className="block text-xs">{dayNum}</span>
                        <span className="block text-[9px] font-normal opacity-70">
                          {dateObj.toLocaleDateString('en-US', { weekday: 'short' })}
                        </span>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {employees.map(emp => (
                  <tr key={emp.id} className="hover:bg-slate-850/50 transition">
                    {/* Sticky Employee Name & Department Cell */}
                    <td className="py-3 px-4 sticky left-0 z-10 bg-slate-900 border-r border-slate-800 min-w-[200px] shadow-sm">
                      <p className="font-bold text-white text-xs truncate max-w-[180px]">{emp.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium truncate max-w-[180px]">{emp.department} • {emp.designation}</p>
                    </td>

                    {/* Days 1..31 Punch Cells */}
                    {daysArray.map(dayNum => {
                      const padDay = String(dayNum).padStart(2, '0');
                      const padMonth = String(selectedMonth).padStart(2, '0');
                      const dateStr = `${selectedYear}-${padMonth}-${padDay}`;
                      const log = logsMap[`${emp.id}_${dateStr}`];

                      const dateObj = new Date(dateStr);
                      const isSunday = dateObj.getDay() === 0;

                      // Sunday / Weekly Off
                      const isWeeklyOff = (log && (log.attendanceCode === 'WO-I' || log.attendanceCode === 'WO')) || (isSunday && (!log || log.attendanceCode === 'WO-I' || log.attendanceCode === 'WO'));

                      return (
                        <td
                          key={dayNum}
                          onClick={() => {
                            if (!hideImport) {
                              setEditLog(log || { id: `att-${emp.id}-${dateStr}`, employeeId: emp.id, employeeName: emp.name, date: dateStr });
                              setEditCode(log ? log.attendanceCode : (isSunday ? 'WO-I' : 'P'));
                              setEditIn(log ? log.checkIn || '09:00' : '09:00');
                              setEditOut(log ? log.checkOut || '18:00' : '18:00');
                            }
                          }}
                          className={`py-2 px-1 text-center border-r border-slate-800/60 transition cursor-pointer hover:bg-blue-600/20 ${
                            isSunday ? 'bg-amber-500/5' : ''
                          }`}
                        >
                          {isWeeklyOff ? (
                            /* WO Badge Matching User Reference Image 1:1 */
                            <span className="inline-block px-2 py-1 rounded bg-amber-500/20 border border-amber-500/30 text-amber-300 font-extrabold text-[10px] uppercase shadow-sm">
                              WO
                            </span>
                          ) : log ? (
                            log.attendanceCode === 'A' ? (
                              <span className="inline-block px-2 py-1 rounded bg-red-500/20 border border-red-500/30 text-red-400 font-bold text-[10px]">
                                A
                              </span>
                            ) : log.attendanceCode === 'HD' ? (
                              <span className="inline-block px-2 py-1 rounded bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 font-bold text-[10px]">
                                HD
                              </span>
                            ) : log.attendanceCode === 'PL' || log.attendanceCode === 'UL' ? (
                              <span className="inline-block px-2 py-1 rounded bg-purple-500/20 border border-purple-500/30 text-purple-300 font-bold text-[10px]">
                                {log.attendanceCode}
                              </span>
                            ) : (
                              /* Present Check-In & Check-Out Times Stacked */
                              <div className="font-mono text-[10px] leading-tight space-y-0.5 font-medium">
                                <span className="block text-emerald-400">{log.checkIn || '--:--'}</span>
                                <span className="block text-slate-300">{log.checkOut || '--:--'}</span>
                              </div>
                            )
                          ) : (
                            <span className="text-slate-600 text-xs font-mono">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* DAILY PUNCH LIST VIEW */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <th className="py-3.5 px-4">EMPLOYEE</th>
                  <th className="py-3.5 px-4 text-center">CODE</th>
                  <th className="py-3.5 px-4 text-center">CHECK IN</th>
                  <th className="py-3.5 px-4 text-center">CHECK OUT</th>
                  <th className="py-3.5 px-4 text-center">WORKED MINS</th>
                  <th className="py-3.5 px-4 text-center">SHORT MINS</th>
                  <th className="py-3.5 px-4 text-center">STATUS / REASON</th>
                  {!hideImport && <th className="py-3.5 px-4 text-right">ACTION</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-white">{log.employeeName}</p>
                      <p className="text-[10px] text-slate-400">{log.department}</p>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full font-bold font-mono text-[10px] ${
                        log.attendanceCode === 'P' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        log.attendanceCode === 'HD' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        log.attendanceCode === 'MP' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        log.attendanceCode === 'WO-I' || log.attendanceCode === 'WO' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                        {log.attendanceCode}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono">{log.checkIn || '--:--'}</td>
                    <td className="py-3.5 px-4 text-center font-mono">{log.checkOut || '--:--'}</td>
                    <td className="py-3.5 px-4 text-center font-mono text-emerald-400">{log.workedMinutes}m</td>
                    <td className="py-3.5 px-4 text-center font-mono text-red-400">{log.shortMinutes}m</td>
                    <td className="py-3.5 px-4 text-center text-[11px] text-slate-400">
                      {log.isManual ? `Manual Edit (${log.correctionReason || 'Corrected'})` : 'Device Punch'}
                    </td>
                    {!hideImport && (
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setEditLog(log);
                            setEditCode(log.attendanceCode);
                            setEditIn(log.checkIn || '09:00');
                            setEditOut(log.checkOut || '18:00');
                          }}
                          className="p-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Manual Punch Correction Modal */}
      {!hideImport && editLog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Edit Attendance Punch</h3>
            <p className="text-xs text-slate-400">Editing log entry for <strong className="text-white">{editLog.employeeName}</strong> ({editLog.date})</p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Attendance Code</label>
              <select value={editCode} onChange={e => setEditCode(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white">
                <option value="P">P - Present</option>
                <option value="WO-I">WO - Weekly Off / Sunday</option>
                <option value="HD">HD - Half Day</option>
                <option value="A">A - Absent</option>
                <option value="PL">PL - Paid Leave</option>
                <option value="UL">UL - Unpaid Leave</option>
                <option value="MP">MP - Missing Punch</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Check In Time</label>
                <input type="time" value={editIn} onChange={e => setEditIn(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Check Out Time</label>
                <input type="time" value={editOut} onChange={e => setEditOut(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Correction Reason</label>
              <input type="text" value={reason} onChange={e => setReason(e.target.value)} placeholder="Reason for correction..." className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white" />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button onClick={() => setEditLog(null)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold">
                Cancel
              </button>
              <button onClick={handleSaveCorrection} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/30">
                Save Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
