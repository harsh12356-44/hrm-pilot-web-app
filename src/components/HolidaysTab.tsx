'use client';

import React, { useState, useEffect } from 'react';
import { CalendarDays, Plus, Calendar } from 'lucide-react';
import { Holiday } from '@/lib/types';

export default function HolidaysTab() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [isOptional, setIsOptional] = useState(false);

  const fetchHolidays = async () => {
    try {
      const res = await fetch('/api/holidays');
      const data = await res.json();
      setHolidays(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/holidays', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, date, isOptional }),
      });
      setName('');
      setDate('');
      setIsOptional(false);
      setIsModalOpen(false);
      fetchHolidays();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 text-slate-100 pb-12">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center space-x-2">
            <CalendarDays className="w-5 h-5 text-purple-400" />
            <span>Company Holidays Calendar</span>
          </h2>
          <p className="text-xs text-slate-400">Manage annual paid holidays and optional leaves.</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/30 transition flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Holiday</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {holidays.map(h => (
          <div key={h.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">{h.name}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                h.isOptional ? 'bg-amber-500/20 text-amber-400' : 'bg-purple-500/20 text-purple-400'
              }`}>
                {h.isOptional ? 'Optional' : 'Public Holiday'}
              </span>
            </div>
            <p className="text-sm font-mono font-bold text-slate-300 flex items-center space-x-2">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{h.date}</span>
            </p>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Add New Company Holiday</h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Holiday Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white" required />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Holiday Date</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white" required />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input type="checkbox" id="opt" checked={isOptional} onChange={e => setIsOptional(e.target.checked)} className="rounded bg-slate-800 border-slate-700" />
                <label htmlFor="opt" className="text-slate-300 font-medium">Optional / Restricted Holiday</label>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold">Add Holiday</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
