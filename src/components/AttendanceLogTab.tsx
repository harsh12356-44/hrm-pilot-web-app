'use client';

import React, { useState, useEffect } from 'react';
import { Upload, Clock, AlertCircle, Edit2, Search, Filter, CheckCircle2 } from 'lucide-react';
import { AttendanceLog } from '@/lib/types';
import * as XLSX from 'xlsx';

interface AttendanceLogTabProps {
  hideImport?: boolean;
}

export default function AttendanceLogTab({ hideImport = false }: AttendanceLogTabProps) {
  const [date, setDate] = useState('2026-07-30');
  const [department, setDepartment] = useState('ALL');
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [importMessage, setImportMessage] = useState('');
  const [editLog, setEditLog] = useState<any | null>(null);
  const [editCode, setEditCode] = useState('P');
  const [editIn, setEditIn] = useState('09:00:00');
  const [editOut, setEditOut] = useState('18:00:00');
  const [reason, setReason] = useState('');

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/attendance?date=${date}&department=${department}`);
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [date, department]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async evt => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const parsed = XLSX.utils.sheet_to_json(ws);

        await fetch('/api/attendance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'IMPORT',
            filename: file.name,
            totalRows: parsed.length,
            importedRows: parsed.length,
          }),
        });

        setImportMessage(`Successfully imported ${parsed.length} biometric punch logs!`);
        setTimeout(() => setImportMessage(''), 4000);
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
              : 'View daily punch records, attendance codes, and import device log files.'}
          </p>
        </div>

        {!hideImport && (
          <div className="flex items-center space-x-3 w-full md:w-auto">
            <input type="file" id="biometric-import" accept=".csv, .xlsx, .xls" onChange={handleFileUpload} className="hidden" />
            <label htmlFor="biometric-import" className="cursor-pointer px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md transition flex items-center space-x-2">
              <Upload className="w-4 h-4" />
              <span>Import Biometric File</span>
            </label>
          </div>
        )}
      </div>

      {importMessage && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs font-semibold text-emerald-400">
          {importMessage}
        </div>
      )}

      {/* Date & Filter Controls */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-[10px] font-semibold uppercase text-slate-400 mb-1">Attendance Date</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {!hideImport && (
            <div>
              <label className="block text-[10px] font-semibold uppercase text-slate-400 mb-1">Department</label>
              <select
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">All Departments</option>
                <option value="Engineering">Engineering</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Sales">Sales</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>
          )}
        </div>

        <div className="text-xs text-slate-400">
          Showing <span className="text-white font-bold">{logs.length}</span> log records for {date}
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
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
                          setEditIn(log.checkIn || '09:00:00');
                          setEditOut(log.checkOut || '18:00:00');
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

      {/* Edit Punch Modal */}
      {!hideImport && editLog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Manual Punch Correction</h3>
            <p className="text-xs text-slate-400">Correcting punch entry for {editLog.employeeName}</p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Attendance Code</label>
              <select value={editCode} onChange={e => setEditCode(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white">
                <option value="P">P - Present</option>
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
              <label className="block text-xs font-semibold text-slate-300 mb-1">Correction Audit Reason</label>
              <input type="text" placeholder="e.g. Biometric reader missed punch" value={reason} onChange={e => setReason(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white" />
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
              <button onClick={() => setEditLog(null)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-medium">Cancel</button>
              <button onClick={handleSaveCorrection} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold">Save Correction</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
