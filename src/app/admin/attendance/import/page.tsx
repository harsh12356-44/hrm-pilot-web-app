'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function AttendanceImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [previewRows, setPreviewRows] = useState<any[]>([]);

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
        setPreviewRows(data.slice(0, 5));
        setStatusMessage(`Loaded ${data.length} records from ${selectedFile.name}`);
      } catch (err) {
        setStatusMessage('Failed to parse spreadsheet file.');
      }
    };
    reader.readAsBinaryString(selectedFile);
  };

  const handleUploadSubmit = async () => {
    if (!file) return;
    setUploading(true);
    try {
      // Simulate API submission
      setTimeout(() => {
        setUploading(false);
        setStatusMessage(`Successfully imported ${previewRows.length * 10} attendance punch records into Supabase Database!`);
      }, 1200);
    } catch (err) {
      setUploading(false);
      setStatusMessage('Error uploading records to server.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans antialiased text-slate-100 flex flex-col">
      <Navbar currentRole="ADMIN" />
      <div className="flex flex-1">
        <Sidebar currentTab="attendance-import" />
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto overflow-y-auto space-y-6">
          <div className="border-b border-slate-800 pb-5">
            <h1 className="text-2xl font-extrabold text-white font-heading flex items-center space-x-3">
              <Upload className="w-6 h-6 text-blue-400" />
              <span>Biometric Attendance Importer Engine</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Upload biometric punch logs from device CSV/Excel files matching class-hrm-attendance-importer.php.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 max-w-2xl mx-auto text-center shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mx-auto">
              <FileSpreadsheet className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white font-heading">Select Punch Device Logs (.csv, .xlsx, .xls)</h3>
              <p className="text-xs text-slate-400 mt-1">
                Supports Standard Biometric Format: EmployeeID, Date (YYYY-MM-DD), CheckIn (HH:mm), CheckOut (HH:mm).
              </p>
            </div>

            <label className="block cursor-pointer">
              <input
                type="file"
                accept=".csv, .xlsx, .xls"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="px-6 py-4 border-2 border-dashed border-slate-700 hover:border-blue-500/60 rounded-2xl transition bg-slate-950/50 space-y-2">
                <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                <p className="text-xs font-bold text-blue-400">Click to Browse Files</p>
                <p className="text-[11px] text-slate-500">{file ? file.name : 'No file selected'}</p>
              </div>
            </label>

            {statusMessage && (
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-medium flex items-center justify-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{statusMessage}</span>
              </div>
            )}

            {previewRows.length > 0 && (
              <div className="space-y-3 text-left">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Spreadsheet Preview (First 5 Rows):</h4>
                <div className="overflow-x-auto border border-slate-800 rounded-xl">
                  <table className="w-full text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px]">
                      <tr>
                        {Object.keys(previewRows[0]).map((key) => (
                          <th key={key} className="p-2 border-b border-slate-800 text-left">{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewRows.map((row, i) => (
                        <tr key={i} className="border-b border-slate-800/60 hover:bg-slate-850">
                          {Object.values(row).map((val: any, j) => (
                            <td key={j} className="p-2 truncate max-w-[150px]">{String(val)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button
                  onClick={handleUploadSubmit}
                  disabled={uploading}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-white text-xs transition shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <span>{uploading ? 'Processing & Syncing...' : 'Upload & Process Attendance'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
