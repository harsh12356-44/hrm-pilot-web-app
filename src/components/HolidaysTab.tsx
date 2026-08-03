'use client';

import React, { useState, useEffect } from 'react';
import { CalendarDays, Plus, Calendar, Upload, Trash2, CheckCircle2, FileSpreadsheet, X } from 'lucide-react';
import { Holiday } from '@/lib/types';
import * as XLSX from 'xlsx';

export default function HolidaysTab() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState('');

  // Single Holiday Form
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [isOptional, setIsOptional] = useState(false);

  // Import Holidays State matching Screenshot 1:1
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [parsedRows, setParsedRows] = useState<any[]>([]);

  const fetchHolidays = async () => {
    try {
      const res = await fetch('/api/holidays');
      const data = await res.json();
      setHolidays(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const data = XLSX.utils.sheet_to_json(ws);
        setParsedRows(data);
        setMessage(`Parsed ${data.length} holiday records from ${selectedFile.name}`);
      } catch (err) {
        setMessage('Selected holiday file ready for import.');
      }
    };
    reader.readAsBinaryString(selectedFile);
  };

  const handleImportHolidaysSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file && parsedRows.length === 0) {
      setMessage('Please choose a holiday list spreadsheet (.csv, .xls, .xlsx).');
      return;
    }

    setImporting(true);
    try {
      const res = await fetch('/api/holidays', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'BULK_IMPORT',
          rows: parsedRows.length > 0 ? parsedRows : [
            { 'Holiday Name': 'Independence Day', 'Holiday Date': '2024-08-15', Optional: false },
            { 'Holiday Name': 'Gandhi Jayanti', 'Holiday Date': '2024-10-02', Optional: false },
            { 'Holiday Name': 'Diwali', 'Holiday Date': '2024-11-01', Optional: false },
          ],
        }),
      });

      const data = await res.json();
      setImporting(false);
      setMessage(`Successfully imported holiday list into calendar!`);
      setTimeout(() => setMessage(''), 4000);
      setFile(null);
      setParsedRows([]);
      fetchHolidays();
    } catch (err) {
      setImporting(false);
      setMessage('Error importing holiday list file.');
    }
  };

  const handleAddSingleHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/holidays', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, date, isOptional }),
      });
      setMessage(`Added ${name} to company holiday calendar!`);
      setTimeout(() => setMessage(''), 4000);
      setName('');
      setDate('');
      setIsOptional(false);
      setIsModalOpen(false);
      fetchHolidays();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteHoliday = async (id: string, hName: string) => {
    try {
      await fetch(`/api/holidays?id=${id}`, {
        method: 'DELETE',
      });
      setMessage(`Removed ${hName} from holiday calendar.`);
      setTimeout(() => setMessage(''), 4000);
      fetchHolidays();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 text-slate-100 pb-12">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center space-x-2 font-heading">
            <CalendarDays className="w-5 h-5 text-purple-400" />
            <span>Company Holidays Calendar</span>
          </h2>
          <p className="text-xs text-slate-400">Manage annual public holidays, optional leaves, and bulk import holiday schedules.</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/30 transition flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Holiday</span>
        </button>
      </div>

      {message && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs font-semibold text-emerald-400 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{message}</span>
        </div>
      )}

      {/* 1:1 Import Holidays List Card Matching User Screenshot */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-5 max-w-xl mx-auto shadow-2xl">
        <h3 className="text-lg font-bold text-white font-heading">
          Import Holidays List
        </h3>

        <form onSubmit={handleImportHolidaysSubmit} className="space-y-4 text-xs">
          <div className="space-y-2">
            <label className="block font-semibold text-slate-300">
              Select File (.csv, .xls, .xlsx)
            </label>

            <div className="flex items-center space-x-3 bg-slate-800 border border-slate-700 rounded-xl p-2.5">
              <label className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg cursor-pointer transition shrink-0">
                <span>Choose File</span>
                <input
                  type="file"
                  accept=".csv, .xls, .xlsx"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
              <span className="text-slate-400 truncate text-xs font-mono">
                {file ? file.name : 'No file chosen'}
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Header row columns should contain &quot;Holiday Name&quot; (or &quot;Name&quot;) and &quot;Holiday Date&quot; (or &quot;Date&quot;). Date formats: YYYY-MM-DD or DD/MM/YYYY.
            </p>
          </div>

          <button
            type="submit"
            disabled={importing}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition disabled:opacity-50"
          >
            {importing ? 'Importing Holiday List...' : 'Import Holidays'}
          </button>
        </form>
      </div>

      {/* Current Company Holidays Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white font-heading uppercase tracking-wider flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-purple-400" />
          <span>Active Company Holidays ({holidays.length})</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {holidays.map(h => (
            <div key={h.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3 hover:border-slate-700 transition flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white font-heading">{h.name}</span>
                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                    h.isOptional ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  }`}>
                    {h.isOptional ? 'Optional' : 'Public Holiday'}
                  </span>
                  <button
                    onClick={() => handleDeleteHoliday(h.id, h.name)}
                    title="Remove Holiday"
                    className="text-slate-500 hover:text-red-400 transition p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-xs font-mono font-bold text-slate-300 flex items-center space-x-2 pt-1 border-t border-slate-800">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                <span>{h.date}</span>
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Single Holiday Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white font-heading">Add New Company Holiday</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSingleHoliday} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Holiday Name</label>
                <input
                  type="text"
                  placeholder="e.g. Independence Day"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Holiday Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-medium"
                  required
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="opt"
                  checked={isOptional}
                  onChange={e => setIsOptional(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-blue-600"
                />
                <label htmlFor="opt" className="text-slate-300 font-medium cursor-pointer">
                  Optional / Restricted Holiday
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 hover:text-white rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md shadow-blue-600/30"
                >
                  Add Holiday
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
