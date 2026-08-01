'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { Clock, Calendar, CheckCircle2, LogIn, LogOut, FileText } from 'lucide-react';

export default function EmployeePortalPage() {
  const [punchedIn, setPunchedIn] = useState(false);
  const [punchTime, setPunchTime] = useState<string | null>(null);
  const [duration, setDuration] = useState('00:00:00');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Timer interval when punched in
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (punchedIn && punchTime) {
      timer = setInterval(() => {
        const start = new Date(punchTime).getTime();
        const now = new Date().getTime();
        const diff = Math.floor((now - start) / 1000);
        const hours = String(Math.floor(diff / 3600)).padStart(2, '0');
        const minutes = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
        const seconds = String(diff % 60).padStart(2, '0');
        setDuration(`${hours}:${minutes}:${seconds}`);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [punchedIn, punchTime]);

  const handlePunch = async (action: 'IN' | 'OUT') => {
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/attendance/punch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: 'emp-1', action }),
      });
      await res.json();

      if (action === 'IN') {
        setPunchedIn(true);
        setPunchTime(new Date().toISOString());
        setMessage('Successfully punched in for today!');
      } else {
        setPunchedIn(false);
        setPunchTime(null);
        setDuration('00:00:00');
        setMessage('Successfully punched out!');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans antialiased text-slate-100 flex flex-col">
      <Navbar currentRole="EMPLOYEE" />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 max-w-6xl mx-auto space-y-6">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-blue-900/60 to-indigo-900/60 border border-blue-800/50 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider">Employee Portal</span>
              <h2 className="text-2xl font-extrabold text-white mt-1">Welcome back, Harshit Bhootra!</h2>
              <p className="text-xs text-slate-300">Engineering • Employee ID: HB001</p>
            </div>
            <div className="bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-800 text-center">
              <p className="text-[10px] text-slate-400">Shift Hours</p>
              <p className="text-xs font-bold text-white">09:00 AM - 06:00 PM</p>
            </div>
          </div>

          {message && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs font-semibold text-emerald-400 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{message}</span>
            </div>
          )}

          {/* Grid Layout: Punch Clock & Leave Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Punch Clock Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span>Punch Clock</span>
                </h3>
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  punchedIn
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}>
                  {punchedIn ? 'ON DUTY' : 'OFF DUTY'}
                </span>
              </div>

              {/* Timer Display */}
              <div className="text-center py-4 bg-slate-950/60 rounded-2xl border border-slate-800/80">
                <p className="text-xs text-slate-400">Shift Elapsed Duration</p>
                <p className="text-4xl font-mono font-black text-white mt-1 tracking-wider">{duration}</p>
                <p className="text-[10px] text-slate-500 mt-1">Location: Office Main Gate</p>
              </div>

              {/* Punch Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handlePunch('IN')}
                  disabled={punchedIn || loading}
                  className="py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 transition flex items-center justify-center space-x-2 disabled:opacity-40"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Clock In</span>
                </button>
                <button
                  onClick={() => handlePunch('OUT')}
                  disabled={!punchedIn || loading}
                  className="py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-900/30 transition flex items-center justify-center space-x-2 disabled:opacity-40"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Clock Out</span>
                </button>
              </div>
            </div>

            {/* My Leave Quota Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  <span>My Leave Summary (Q3)</span>
                </h3>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50 text-center">
                  <span className="text-[10px] text-slate-400 font-medium">Casual Left</span>
                  <p className="text-xl font-bold text-amber-400 mt-1">6</p>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50 text-center">
                  <span className="text-[10px] text-slate-400 font-medium">Planned Left</span>
                  <p className="text-xl font-bold text-purple-400 mt-1">6</p>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50 text-center">
                  <span className="text-[10px] text-slate-400 font-medium">Total Left</span>
                  <p className="text-xl font-bold text-emerald-400 mt-1">12</p>
                </div>
              </div>

              <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md transition flex items-center justify-center space-x-2">
                <FileText className="w-3.5 h-3.5" />
                <span>Apply for Leave Request</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
