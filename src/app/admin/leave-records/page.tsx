'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { FileCheck, CheckCircle2, XCircle, Clock, Search, Filter } from 'lucide-react';
import { LeaveRecord, Employee } from '@/lib/types';

export default function LeaveRecordsAdminPage() {
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const fetchLeaves = async () => {
    try {
      const [leaveRes, empRes] = await Promise.all([
        fetch('/api/leaves'),
        fetch('/api/employees'),
      ]);
      const leaveData = await leaveRes.json();
      const empData = await empRes.json();
      setLeaves(Array.isArray(leaveData) ? leaveData : leaveData.leaves || []);
      setEmployees(Array.isArray(empData) ? empData : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleAction = async (id: string, action: 'APPROVE' | 'REJECT') => {
    try {
      const res = await fetch('/api/leaves', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED' }),
      });
      if (res.ok) {
        fetchLeaves();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredLeaves = leaves.filter((l) => {
    const emp = employees.find((e) => e.id === l.employeeId || e.employeeId === l.employeeId);
    const empName = emp ? emp.name.toLowerCase() : '';
    const matchesSearch = empName.includes(search.toLowerCase()) || l.leaveType.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-950 font-sans antialiased text-slate-100 flex flex-col">
      <Navbar currentRole="ADMIN" />
      <div className="flex flex-1">
        <Sidebar currentTab="leave-records" />
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto overflow-y-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <h1 className="text-2xl font-extrabold text-white font-heading flex items-center space-x-3">
                <FileCheck className="w-6 h-6 text-rose-400" />
                <span>Administrative Leave Requests Desk</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Review, approve, or reject employee leave applications, handover notes, and emergency contact details.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search request..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 w-56"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-semibold focus:outline-none focus:border-rose-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>

          {/* Leave Requests Table */}
          <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900 shadow-lg">
            <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Leave Applications Register</h3>
              <span className="text-[11px] text-slate-500">{filteredLeaves.length} Records</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3">Employee</th>
                    <th className="p-3">Leave Type</th>
                    <th className="p-3">Dates</th>
                    <th className="p-3">Days</th>
                    <th className="p-3">Handover / Note</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500">Loading leave requests...</td>
                    </tr>
                  ) : filteredLeaves.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500">No leave applications found.</td>
                    </tr>
                  ) : (
                    filteredLeaves.map((l) => {
                      const emp = employees.find((e) => e.id === l.employeeId || e.employeeId === l.employeeId);
                      return (
                        <tr key={l.id} className="hover:bg-slate-850 transition">
                          <td className="p-3 font-semibold text-white">{emp ? emp.name : l.employeeId}</td>
                          <td className="p-3 font-medium text-rose-300">{l.leaveType}</td>
                          <td className="p-3 font-mono text-slate-400">
                            {l.startDate} {l.endDate !== l.startDate ? `to ${l.endDate}` : ''}
                          </td>
                          <td className="p-3 font-bold text-white">{l.daysCount} day(s)</td>
                          <td className="p-3 text-slate-400 max-w-xs truncate">{l.note || l.handoverNote || '-'}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                l.status === 'APPROVED'
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : l.status === 'PENDING'
                                  ? 'bg-amber-500/20 text-amber-300'
                                  : 'bg-red-500/20 text-red-300'
                              }`}
                            >
                              {l.status}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            {l.status === 'PENDING' ? (
                              <div className="flex items-center justify-end space-x-2">
                                <button
                                  onClick={() => handleAction(l.id, 'APPROVE')}
                                  className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition shadow"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleAction(l.id, 'REJECT')}
                                  className="px-2.5 py-1 rounded bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] transition shadow"
                                >
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-500 font-mono">Processed</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
