'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import RecordLeaveModal from '@/components/RecordLeaveModal';
import {
  FileCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Plus,
  AlertTriangle,
  FileText,
  Paperclip,
  Printer,
  HelpCircle,
  UserCheck,
  Building2,
  Calendar,
  MessageSquare,
} from 'lucide-react';
import { LeaveRecord, Employee } from '@/lib/types';

export default function LeaveRecordsAdminPage() {
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [actionStatusMsg, setActionStatusMsg] = useState('');

  const fetchLeavesAndEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const [leaveRes, empRes] = await Promise.all([
        fetch(`/api/leaves?t=${Date.now()}`, { cache: 'no-store' }),
        fetch(`/api/employees?t=${Date.now()}`, { cache: 'no-store' }),
      ]);

      const leaveData = await leaveRes.json();
      const empData = await empRes.json();

      setLeaves(Array.isArray(leaveData) ? leaveData : leaveData.records || []);
      setEmployees(Array.isArray(empData) ? empData : empData.employees || []);
    } catch (err) {
      console.error('Error fetching leave requests data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeavesAndEmployees();
  }, [fetchLeavesAndEmployees]);

  const handleUpdateStatus = async (id: string, newStatus: 'APPROVED' | 'REJECTED' | 'MORE_INFO_REQUIRED') => {
    let comment = '';
    if (newStatus === 'MORE_INFO_REQUIRED') {
      const input = prompt('Please enter the detail request message for the employee:');
      if (!input) return;
      comment = input;
    }

    try {
      setActionStatusMsg('Updating leave request status...');
      const res = await fetch('/api/leaves', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          status: newStatus,
          approverRole: 'HR Final Approver',
          comment,
        }),
      });

      if (res.ok) {
        setActionStatusMsg(`Leave request #${id} updated to ${newStatus}!`);
        fetchLeavesAndEmployees();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('leaveDataUpdated'));
        }
      } else {
        const errData = await res.json();
        setActionStatusMsg(`Failed: ${errData.error || 'Could not update status'}`);
      }
      setTimeout(() => setActionStatusMsg(''), 4000);
    } catch (err) {
      console.error('Error updating leave status:', err);
      setActionStatusMsg('Failed to update leave request status.');
    }
  };

  // Extract Departments for Filter
  const departmentsList = Array.from(new Set(employees.map(e => e.department).filter(Boolean)));

  // Filter Leaves
  const filteredLeaves = leaves.filter(l => {
    const emp = employees.find(e => e.id === l.employeeId || e.employeeId === l.employeeId || e.name === l.employeeId);
    const empName = emp ? emp.name.toLowerCase() : '';
    const empId = emp ? emp.employeeId.toLowerCase() : '';
    const note = (l.note || '').toLowerCase();
    const searchLower = search.toLowerCase();

    const matchesSearch =
      !search ||
      empName.includes(searchLower) ||
      empId.includes(searchLower) ||
      l.leaveType.toLowerCase().includes(searchLower) ||
      note.includes(searchLower);

    const matchesDept = departmentFilter === 'ALL' || (emp && emp.department === departmentFilter);
    const matchesStatus = statusFilter === 'ALL' || l.status === statusStatusMap(statusFilter);

    return matchesSearch && matchesDept && matchesStatus;
  });

  // Pending Leave Requests for SLA Manager Section
  const pendingApprovals = leaves.filter(
    l => l.status === 'PENDING' || l.status === 'MORE_INFO_REQUIRED'
  );

  function statusStatusMap(filter: string) {
    if (filter === 'PENDING') return 'PENDING';
    if (filter === 'APPROVED') return 'APPROVED';
    if (filter === 'REJECTED') return 'REJECTED';
    if (filter === 'MORE_INFO') return 'MORE_INFO_REQUIRED';
    return filter;
  }

  // Calculate Manager SLA Delay Badge
  const getSLABadge = (createdDateStr: string) => {
    const created = new Date(createdDateStr || Date.now());
    const now = new Date();
    const diffMs = Math.max(0, now.getTime() - created.getTime());
    const delayHours = Math.floor(diffMs / (1000 * 60 * 60));
    const delayDays = Math.floor(delayHours / 24);

    if (delayDays >= 1) {
      return (
        <span className="px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 font-bold text-[11px] flex items-center space-x-1">
          <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
          <span>⚠️ Manager Delay: {delayDays} Day(s) ({delayHours}h)</span>
        </span>
      );
    } else {
      return (
        <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 font-medium text-[11px] flex items-center space-x-1">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>⏳ Manager Reviewing ({delayHours}h elapsed)</span>
        </span>
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans antialiased text-slate-100 flex flex-col">
      <Navbar currentRole="ADMIN" />
      <div className="flex flex-1">
        <Sidebar currentTab="leave-records" />
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto overflow-y-auto space-y-6">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <h1 className="text-2xl font-extrabold text-white font-heading flex items-center space-x-3">
                <FileCheck className="w-7 h-7 text-rose-400" />
                <span>Leave Requests & SLA Approvals Desk</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Monitor manager response delays, review subordinate leave applications, and issue final HR decisions.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsRecordModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg shadow-rose-600/20 flex items-center space-x-2 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Submit Leave Request</span>
              </button>
            </div>
          </div>

          {/* Action Status Notification Toast */}
          {actionStatusMsg && (
            <div className="p-3 bg-blue-950/60 border border-blue-500/40 rounded-xl text-xs text-blue-200 font-medium flex items-center justify-between animate-fadeIn">
              <span>{actionStatusMsg}</span>
              <button onClick={() => setActionStatusMsg('')} className="text-blue-400 hover:text-white font-bold ml-2">
                ✕
              </button>
            </div>
          )}

          {/* 1. Pending Approvals & Manager SLA Tracker Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>System Pending Leave Approvals & Manager SLA Tracker</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Require HR final action or manager SLA intervention ({pendingApprovals.length} pending)
                </p>
              </div>
            </div>

            {pendingApprovals.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500 font-medium">
                ✅ No pending leave applications requiring approval. All requests are up to date!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Employee</th>
                      <th className="py-3 px-4">Leave Dates & Type</th>
                      <th className="py-3 px-4">Subject & Reason</th>
                      <th className="py-3 px-4">Manager Review Status</th>
                      <th className="py-3 px-4">SLA Delay Alert</th>
                      <th className="py-3 px-4 text-right">HR Final Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {pendingApprovals.map(l => {
                      const emp = employees.find(
                        e => e.id === l.employeeId || e.employeeId === l.employeeId || e.name === l.employeeId
                      );

                      return (
                        <tr key={l.id} className="hover:bg-slate-850 transition">
                          {/* Employee */}
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-600 to-pink-600 flex items-center justify-center font-bold text-white text-xs shadow-md">
                                {emp ? emp.name.charAt(0) : 'E'}
                              </div>
                              <div>
                                <div className="font-bold text-white">{emp ? emp.name : l.employeeId}</div>
                                <div className="text-[10px] text-slate-400">
                                  {emp?.designation || 'Staff'} • {emp?.department || 'General'}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Leave Dates & Type */}
                          <td className="py-3 px-4">
                            <div className="font-bold text-rose-300">{l.leaveType}</div>
                            <div className="text-[11px] text-slate-300 font-mono">
                              {l.startDate} {l.endDate && l.endDate !== l.startDate ? `to ${l.endDate}` : ''}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              ({l.daysCount} day(s) · {l.dayType || 'full day'})
                            </div>
                          </td>

                          {/* Subject & Reason */}
                          <td className="py-3 px-4 max-w-xs">
                            <div className="font-bold text-slate-200 text-xs truncate">
                              {l.note || 'Leave Application'}
                            </div>
                            {l.handoverNote && (
                              <div className="text-[10px] text-slate-400 truncate mt-0.5">
                                📌 Handover: {l.handoverNote}
                              </div>
                            )}
                          </td>

                          {/* Manager Review Status */}
                          <td className="py-3 px-4">
                            <div className="space-y-1 text-[11px]">
                              <div className="text-amber-400 font-semibold flex items-center space-x-1">
                                <span>Manager 1:</span>
                                <span>Pending Review</span>
                              </div>
                              {emp?.reportingManager && (
                                <div className="text-[10px] text-slate-400">
                                  Assigned: {emp.reportingManager}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* SLA Delay Alert */}
                          <td className="py-3 px-4">
                            {getSLABadge(l.createdAt)}
                          </td>

                          {/* HR Final Action */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              <button
                                onClick={() => handleUpdateStatus(l.id, 'APPROVED')}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow transition flex items-center space-x-1"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Approve</span>
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(l.id, 'REJECTED')}
                                className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] shadow transition flex items-center space-x-1"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Reject</span>
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(l.id, 'MORE_INFO_REQUIRED')}
                                className="px-2 py-1 rounded-lg bg-sky-950 border border-sky-500/40 hover:bg-sky-900 text-sky-300 font-semibold text-[11px] transition flex items-center space-x-1"
                                title="Request More Information"
                              >
                                <HelpCircle className="w-3.5 h-3.5" />
                                <span>Request Info</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 2. Historical Leave Requests Records Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            {/* Table Controls Header */}
            <div className="p-5 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/50">
              <div>
                <h3 className="text-base font-bold text-white">Historical Leave Requests Records</h3>
                <p className="text-xs text-slate-400">
                  Searchable, filterable audit log of all leave applications ({filteredLeaves.length} records shown)
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search name, ID or subject..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="pl-9 pr-4 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-rose-500 transition w-48 md:w-60"
                  />
                </div>

                {/* Department Filter */}
                <select
                  value={departmentFilter}
                  onChange={e => setDepartmentFilter(e.target.value)}
                  className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-rose-500 transition"
                >
                  <option value="ALL">All Departments</option>
                  {departmentsList.map(d => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-rose-500 transition"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="MORE_INFO">More Info Required</option>
                </select>

                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-semibold text-xs transition flex items-center space-x-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Roster</span>
                </button>
              </div>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Request ID</th>
                    <th className="py-3.5 px-4">Employee</th>
                    <th className="py-3.5 px-4">Leave Type & Dates</th>
                    <th className="py-3.5 px-4">Subject & Details</th>
                    <th className="py-3.5 px-4 text-center">Manager Status</th>
                    <th className="py-3.5 px-4 text-center">Final Status</th>
                    <th className="py-3.5 px-4 text-center">Submitted Date</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-slate-500">
                        Loading leave requests archive...
                      </td>
                    </tr>
                  ) : filteredLeaves.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-slate-500">
                        No leave records found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredLeaves.map(l => {
                      const emp = employees.find(
                        e => e.id === l.employeeId || e.employeeId === l.employeeId || e.name === l.employeeId
                      );

                      return (
                        <tr key={l.id} className="hover:bg-slate-850 transition">
                          {/* ID */}
                          <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400 font-bold">
                            #{l.id.slice(-6)}
                          </td>

                          {/* Employee */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center space-x-2.5">
                              <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-[11px]">
                                {emp ? emp.name.charAt(0) : 'E'}
                              </div>
                              <div>
                                <div className="font-bold text-white">{emp ? emp.name : l.employeeId}</div>
                                <div className="text-[10px] text-slate-400 font-mono">
                                  {emp?.employeeId || l.employeeId} • {emp?.department || 'General'}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Dates */}
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-purple-300">{l.leaveType}</div>
                            <div className="text-[11px] text-slate-300 font-mono">
                              {l.startDate} {l.endDate && l.endDate !== l.startDate ? `to ${l.endDate}` : ''}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {l.daysCount} day(s) ({l.dayType || 'full day'})
                            </div>
                          </td>

                          {/* Subject & Details */}
                          <td className="py-3.5 px-4 max-w-xs">
                            <div className="font-medium text-slate-200 truncate">{l.note || 'Leave Request'}</div>
                            {l.handoverNote && (
                              <div className="text-[10px] text-slate-400 truncate mt-0.5">
                                Handover: {l.handoverNote}
                              </div>
                            )}
                          </td>

                          {/* Manager Status */}
                          <td className="py-3.5 px-4 text-center">
                            <span className="text-[11px] font-semibold text-slate-300">
                              {l.status === 'APPROVED' ? 'Approved' : l.status === 'REJECTED' ? 'Rejected' : 'Pending'}
                            </span>
                          </td>

                          {/* Final Status */}
                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                                l.status === 'APPROVED'
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                  : l.status === 'PENDING'
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                  : l.status === 'MORE_INFO_REQUIRED'
                                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                                  : 'bg-red-500/20 text-red-300 border-red-500/30'
                              }`}
                            >
                              {l.status === 'MORE_INFO_REQUIRED' ? 'MORE INFO REQUIRED' : l.status}
                            </span>
                          </td>

                          {/* Submitted Date */}
                          <td className="py-3.5 px-4 text-center text-[11px] font-mono text-slate-400">
                            {l.createdAt ? l.createdAt.split('T')[0] : '2026-08-01'}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end space-x-1">
                              {l.status !== 'APPROVED' && (
                                <button
                                  onClick={() => handleUpdateStatus(l.id, 'APPROVED')}
                                  className="p-1.5 rounded-lg bg-emerald-950 border border-emerald-500/30 hover:bg-emerald-900 text-emerald-300 transition"
                                  title="Approve Request"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {l.status !== 'REJECTED' && (
                                <button
                                  onClick={() => handleUpdateStatus(l.id, 'REJECTED')}
                                  className="p-1.5 rounded-lg bg-red-950 border border-red-500/30 hover:bg-red-900 text-red-300 transition"
                                  title="Reject Request"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                onClick={() => handleUpdateStatus(l.id, 'MORE_INFO_REQUIRED')}
                                className="p-1.5 rounded-lg bg-sky-950 border border-sky-500/30 hover:bg-sky-900 text-sky-300 transition"
                                title="Request Info"
                              >
                                <HelpCircle className="w-3.5 h-3.5" />
                              </button>
                            </div>
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

      {/* Submit Leave Application Modal */}
      <RecordLeaveModal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        employees={employees}
        onSuccess={() => {
          setActionStatusMsg('New leave request submitted successfully!');
          fetchLeavesAndEmployees();
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('leaveDataUpdated'));
          }
        }}
      />
    </div>
  );
}
