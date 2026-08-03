'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { UserCheck2, ShieldCheck, Mail, Building2, UserPlus, CheckCircle } from 'lucide-react';
import { Employee, Department } from '@/lib/types';

export default function ManagersAdminPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadManagersData() {
      try {
        const [empRes, deptRes] = await Promise.all([
          fetch('/api/employees'),
          fetch('/api/departments'),
        ]);
        const empData = await empRes.json();
        const deptData = await deptRes.json();

        setEmployees(Array.isArray(empData) ? empData : []);
        setDepartments(Array.isArray(deptData) ? deptData : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadManagersData();
  }, []);

  const managers = employees.filter(
    (e) => e.role === 'MANAGER' || e.role === 'ADMIN' || departments.some((d) => d.managerName === e.name)
  );

  return (
    <div className="min-h-screen bg-slate-950 font-sans antialiased text-slate-100 flex flex-col">
      <Navbar currentRole="ADMIN" />
      <div className="flex flex-1">
        <Sidebar currentTab="managers" />
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto overflow-y-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <h1 className="text-2xl font-extrabold text-white font-heading flex items-center space-x-3">
                <UserCheck2 className="w-6 h-6 text-purple-400" />
                <span>Managers & Department Heads Desk</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Configure manager roles, department head assignments, and team approval authorities matching WordPress plugin capabilities.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold">
                {managers.length} Designated Managers
              </span>
            </div>
          </div>

          {/* Manager Allocation Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full py-12 text-center text-xs text-slate-400">Loading manager roster...</div>
            ) : managers.length === 0 ? (
              <div className="col-span-full py-12 text-center text-xs text-slate-400">No designated managers found. Assign managers in Employee Directory.</div>
            ) : (
              managers.map((mgr) => {
                const managedDepts = departments.filter((d) => d.managerName === mgr.name);
                return (
                  <div
                    key={mgr.id}
                    className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/40 transition space-y-4 shadow-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-md">
                        {mgr.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base">{mgr.name}</h3>
                        <p className="text-xs text-slate-400">{mgr.designation || 'Department Manager'}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-bold">
                          {mgr.role}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="flex items-center space-x-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-500" />
                          <span>Email:</span>
                        </span>
                        <span className="text-slate-200 font-mono font-medium">{mgr.email}</span>
                      </div>

                      <div className="flex items-center justify-between text-slate-400">
                        <span className="flex items-center space-x-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-500" />
                          <span>Department:</span>
                        </span>
                        <span className="text-slate-200 font-semibold">{mgr.department}</span>
                      </div>

                      <div className="flex items-center justify-between text-slate-400">
                        <span className="flex items-center space-x-1.5">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Head of Depts:</span>
                        </span>
                        <span className="text-emerald-400 font-bold">
                          {managedDepts.length > 0 ? managedDepts.map((d) => d.name).join(', ') : 'General Oversight'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
