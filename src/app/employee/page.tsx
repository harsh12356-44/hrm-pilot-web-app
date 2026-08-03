'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import {
  Clock,
  Calendar,
  CheckCircle2,
  LogIn,
  LogOut,
  FileText,
  X,
  Send,
  Plane,
  ClipboardCheck,
  CalendarDays,
  Bell,
  User,
  ShieldCheck,
} from 'lucide-react';
import AttendanceLogTab from '@/components/AttendanceLogTab';
import HolidaysTab from '@/components/HolidaysTab';
import LeaveTrackerTab from '@/components/LeaveTrackerTab';

function EmployeePortalContent() {
  const searchParams = useSearchParams();
  const activeTab = searchParams ? searchParams.get('tab') || 'dashboard' : 'dashboard';

  const [punchedIn, setPunchedIn] = useState(false);
  const [punchTime, setPunchTime] = useState<string | null>(null);
  const [duration, setDuration] = useState('00:00:00');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [employeeStatus, setEmployeeStatus] = useState<'ACTIVE' | 'INACTIVE' | 'NOT_FOUND'>('ACTIVE');

  // Check if current employee is active in DB
  useEffect(() => {
    async function checkEmployeeStatus() {
      try {
        const res = await fetch('/api/employees');
        const data = await res.json();
        const emp = data.find((e: any) => e.id === 'emp-1' || e.employeeId === 'HB001' || e.name === 'Harshit Bhootra');
        if (!emp) {
          setEmployeeStatus('NOT_FOUND');
        } else if (emp.status === 'INACTIVE') {
          setEmployeeStatus('INACTIVE');
        } else {
          setEmployeeStatus('ACTIVE');
        }
      } catch (err) {
        console.error(err);
      }
    }
    checkEmployeeStatus();
  }, []);

  // Apply Leave Form state (1:1 Screenshot 1)
  const [leaveType, setLeaveType] = useState('Casual Leave');
  const [leaveDuration, setLeaveDuration] = useState('Full Day');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');

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

  const handleApplyLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch('/api/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeName: 'Harshit Bhootra',
          leaveType,
          startDate: fromDate,
          endDate: toDate || fromDate,
          reason,
        }),
      });
      setMessage('Leave application submitted successfully for manager approval!');
      setFromDate('');
      setToDate('');
      setReason('');
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
        <Sidebar currentTab={activeTab} />
        <main className="flex-1 p-6 md:p-8 max-w-6xl mx-auto space-y-6">
          {/* Top Info Header */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h1 className="text-2xl font-extrabold text-white capitalize font-heading">
                {activeTab === 'apply-leave'
                  ? 'Apply for Leave'
                  : activeTab === 'leave-history'
                  ? 'Leave History & Status'
                  : activeTab === 'team-approvals'
                  ? 'Team Approvals'
                  : activeTab === 'attendance'
                  ? 'My Attendance Log'
                  : activeTab === 'working-hours'
                  ? 'Working Hours & Overtime'
                  : activeTab === 'holidays'
                  ? 'Annual Holidays List'
                  : activeTab === 'notifications'
                  ? 'Notifications Center'
                  : activeTab === 'profile'
                  ? 'My Employee Profile'
                  : 'Employee Dashboard'}
              </h1>
              <p className="text-xs text-slate-400">
                Monday, 03 August 2026 • Live HRM Portal
              </p>
            </div>

            <div className="bg-slate-900 px-4 py-2 rounded-xl border border-slate-800 text-xs flex items-center space-x-2 text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>
                Managing Portal for:{' '}
                <strong className="text-white">Harshit Bhootra (123456)</strong>
              </span>
            </div>
          </div>

          {message && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs font-semibold text-emerald-400 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{message}</span>
            </div>
          )}

          {employeeStatus !== 'ACTIVE' && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-xs font-semibold text-red-400 flex items-center space-x-3 shadow-xl">
              <div className="w-3 h-3 rounded-full bg-red-500 shrink-0 animate-ping"></div>
              <div>
                <p className="font-extrabold text-sm text-red-300 font-heading">Portal Access Revoked</p>
                <p className="text-slate-300 mt-0.5">
                  Your employee account has been {employeeStatus === 'INACTIVE' ? 'deactivated' : 'permanently removed'} by HR Admin. Access to Punch Clock, Leave Applications, and Portal features is denied.
                </p>
              </div>
            </div>
          )}

          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Welcome Banner */}
              <div className="bg-gradient-to-r from-blue-900/60 to-indigo-900/60 border border-blue-800/50 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider">Employee Portal</span>
                  <h2 className="text-2xl font-extrabold text-white mt-1 font-heading">Welcome back, Harshit Bhootra!</h2>
                  <p className="text-xs text-slate-300">Engineering • Employee ID: HB001</p>
                </div>
                <div className="bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-800 text-center">
                  <p className="text-[10px] text-slate-400">Shift Hours</p>
                  <p className="text-xs font-bold text-white">09:00 AM - 06:00 PM</p>
                </div>
              </div>

              {/* Punch Clock & Leave Quota Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="text-sm font-bold text-white flex items-center space-x-2 font-heading">
                      <Clock className="w-4 h-4 text-blue-400" />
                      <span>Punch Clock</span>
                    </h3>
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        punchedIn
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {punchedIn ? 'ON DUTY' : 'OFF DUTY'}
                    </span>
                  </div>

                  <div className="text-center py-4 bg-slate-950/60 rounded-2xl border border-slate-800/80">
                    <p className="text-xs text-slate-400">Shift Elapsed Duration</p>
                    <p className="text-4xl font-mono font-black text-white mt-1 tracking-wider">{duration}</p>
                    <p className="text-[10px] text-slate-500 mt-1">Location: Office Main Gate</p>
                  </div>

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

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="text-sm font-bold text-white flex items-center space-x-2 font-heading">
                      <Calendar className="w-4 h-4 text-purple-400" />
                      <span>My Leave Summary (Q3)</span>
                    </h3>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50 text-center">
                      <span className="text-[10px] text-slate-400 font-medium">Casual Left</span>
                      <p className="text-xl font-bold text-amber-400 mt-1 font-heading">6</p>
                    </div>
                    <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50 text-center">
                      <span className="text-[10px] text-slate-400 font-medium">Planned Left</span>
                      <p className="text-xl font-bold text-purple-400 mt-1 font-heading">6</p>
                    </div>
                    <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50 text-center">
                      <span className="text-[10px] text-slate-400 font-medium">Total Left</span>
                      <p className="text-xl font-bold text-emerald-400 mt-1 font-heading">12</p>
                    </div>
                  </div>

                  <a
                    href="/employee?tab=apply-leave"
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md transition flex items-center justify-center space-x-2"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Apply for Leave Request</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: APPLY LEAVE (1:1 Screenshot 1 Design) */}
          {activeTab === 'apply-leave' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Form Box */}
              <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
                <div>
                  <h3 className="text-base font-extrabold text-white font-heading">Apply for Leave</h3>
                  <p className="text-xs text-slate-400">Submit your request for manager approval</p>
                </div>

                <form onSubmit={handleApplyLeaveSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Leave Type</label>
                      <select
                        value={leaveType}
                        onChange={(e) => setLeaveType(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-medium"
                      >
                        <option value="Casual Leave">Casual Leave</option>
                        <option value="Planned Leave">Planned Leave</option>
                        <option value="Sick Leave">Sick Leave</option>
                        <option value="Unpaid Leave">Unpaid Leave</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Duration</label>
                      <select
                        value={leaveDuration}
                        onChange={(e) => setLeaveDuration(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-medium"
                      >
                        <option value="Full Day">Full Day</option>
                        <option value="Half Day (Morning)">Half Day (Morning)</option>
                        <option value="Half Day (Afternoon)">Half Day (Afternoon)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">From Date</label>
                      <input
                        type="date"
                        required
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        To Date <span className="text-[10px] text-slate-500 font-normal">(Optional for 1 day leave)</span>
                      </label>
                      <input
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Reason</label>
                    <textarea
                      required
                      rows={4}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Briefly explain the reason for leave"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-medium"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-600/30 transition flex items-center justify-center space-x-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit Leave Request</span>
                  </button>
                </form>
              </div>

              {/* Right Summary Sidebar (1:1 Screenshot 1) */}
              <div className="space-y-6">
                {/* Leave Balance */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-white font-heading">Leave Balance</h3>
                    <p className="text-[11px] text-slate-400">Available paid days for Current Quarter (Q3 2026)</p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-slate-300">Casual Leave</span>
                        <span className="text-blue-400">2 of 2 left (Q3)</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-full w-full"></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-slate-300">Planned Leave</span>
                        <span className="text-purple-400">4 of 4 left (Q3)</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-purple-600 h-full w-full"></div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-xl text-[11px] text-slate-400 leading-relaxed">
                    📌 <strong>Company Policy:</strong> Each quarter includes 2 Casual Leaves and 4 Planned Leaves (6 paid days total). Leaves do not carry forward across quarters.
                  </div>
                </div>

                {/* Approval Flow */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-white font-heading">Approval Flow</h3>
                    <p className="text-[11px] text-slate-400">What happens after submission</p>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex items-start space-x-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-1 shrink-0"></div>
                      <div>
                        <p className="font-semibold text-white">Request submitted</p>
                        <p className="text-[10px] text-slate-400">Employee completes leave form</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-purple-500 mt-1 shrink-0"></div>
                      <div>
                        <p className="font-semibold text-white">Manager review</p>
                        <p className="text-[10px] text-slate-400">Reporting manager approves or rejects</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 shrink-0"></div>
                      <div>
                        <p className="font-semibold text-white">Balance updated</p>
                        <p className="text-[10px] text-slate-400">Approved days update analytics</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ATTENDANCE */}
          {activeTab === 'attendance' && <AttendanceLogTab hideImport={true} />}

          {/* TAB 4: LEAVE HISTORY & RECS */}
          {(activeTab === 'leave-history' || activeTab === 'team-approvals') && <LeaveTrackerTab />}

          {/* TAB 6: WORKING HOURS */}
          {activeTab === 'working-hours' && <AttendanceLogTab hideImport={true} />}

          {/* TAB 7: HOLIDAYS LIST */}
          {activeTab === 'holidays' && <HolidaysTab />}

          {/* TAB 8: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-white font-heading">My Notifications</h3>
              <p className="text-xs text-slate-400">System alerts and leave approval updates</p>

              <div className="space-y-3 pt-2">
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-xs space-y-1">
                  <p className="font-bold text-blue-400">Biometric Punch Verified</p>
                  <p className="text-slate-300">Your morning punch-in at 09:02 AM was recorded successfully.</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs space-y-1">
                  <p className="font-bold text-slate-300">Q3 Leave Allowance Loaded</p>
                  <p className="text-slate-400">Quarter 3 leave quota of 6 days is active.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: MY PROFILE */}
          {activeTab === 'profile' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-white font-heading">My Profile & Shift Info</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50 space-y-1">
                  <p className="text-slate-400 font-semibold">Full Name</p>
                  <p className="text-sm font-bold text-white">Harshit Bhootra</p>
                </div>
                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50 space-y-1">
                  <p className="text-slate-400 font-semibold">Department</p>
                  <p className="text-sm font-bold text-white">Engineering</p>
                </div>
                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50 space-y-1">
                  <p className="text-slate-400 font-semibold">Designation</p>
                  <p className="text-sm font-bold text-white">Senior Software Engineer</p>
                </div>
                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50 space-y-1">
                  <p className="text-slate-400 font-semibold">Shift Schedule</p>
                  <p className="text-sm font-bold text-white">09:00 AM - 06:00 PM (480 mins)</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function EmployeePortalPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-white">Loading Employee Portal...</div>}>
      <EmployeePortalContent />
    </Suspense>
  );
}
