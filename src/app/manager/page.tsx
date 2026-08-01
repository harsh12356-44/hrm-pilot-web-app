'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { Users, CheckCircle, XCircle } from 'lucide-react';

export default function ManagerPortalPage() {
  return (
    <div className="min-h-screen bg-slate-950 font-sans antialiased text-slate-100 flex flex-col">
      <Navbar currentRole="MANAGER" />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-extrabold text-white flex items-center space-x-2.5">
                <Users className="w-5 h-5 text-indigo-400" />
                <span>Manager Approval Desk</span>
              </h2>
              <p className="text-xs text-slate-400">Review team attendance and approve pending leave applications.</p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
            <h3 className="text-sm font-bold text-white">Pending Team Leave Requests</h3>
            <div className="space-y-3">
              <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/60 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white">Rajesh Kumar (Sales)</p>
                  <p className="text-[11px] text-slate-400">Casual Leave • Jul 10 - Jul 11 (2 Days) • Reason: Family emergency</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition flex items-center space-x-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>
                  <button className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-xs font-semibold rounded-lg transition flex items-center space-x-1">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
