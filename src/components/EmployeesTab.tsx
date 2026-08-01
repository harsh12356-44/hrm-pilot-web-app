'use client';

import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Search, Edit, Mail, Phone, Building, DollarSign } from 'lucide-react';
import { Employee } from '@/lib/types';

export default function EmployeesTab() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dept, setDept] = useState('Engineering');
  const [designation, setDesignation] = useState('Staff');
  const [salary, setSalary] = useState(60000);

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/employees');
      const data = await res.json();
      setEmployees(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleOpenAddModal = () => {
    setSelectedEmp(null);
    setName('');
    setEmail('');
    setPhone('');
    setDept('Engineering');
    setDesignation('Software Engineer');
    setSalary(75000);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (emp: Employee) => {
    setSelectedEmp(emp);
    setName(emp.name);
    setEmail(emp.email);
    setPhone(emp.phone || '');
    setDept(emp.department);
    setDesignation(emp.designation || 'Staff');
    setSalary(emp.monthlySalary || 60000);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedEmp ? selectedEmp.id : undefined,
          name,
          email,
          phone,
          department: dept,
          designation,
          monthlySalary: salary,
        }),
      });

      setIsModalOpen(false);
      fetchEmployees();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = employees.filter(
    e =>
      e.name.toLowerCase().includes(search.toLowerCase()) &&
      (department === 'ALL' || e.department === department)
  );

  return (
    <div className="space-y-6 text-slate-100 pb-12">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-400" />
            <span>Employee Directory & Profiles</span>
          </h2>
          <p className="text-xs text-slate-400">Manage employee accounts, designations, monthly salaries, and shift policies.</p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/30 transition flex items-center space-x-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Employee</span>
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-full"
            />
          </div>

          <select
            value={department}
            onChange={e => setDepartment(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Human Resources">Human Resources</option>
            <option value="Sales">Sales</option>
            <option value="Marketing">Marketing</option>
          </select>
        </div>

        <p className="text-xs text-slate-400">Total Active Employees: <span className="text-white font-bold">{employees.length}</span></p>
      </div>

      {/* Employee Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {filtered.map(emp => {
          const initials = emp.name.split(' ').map(n => n[0]).join('').toUpperCase();

          return (
            <div key={emp.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 hover:border-slate-700 transition">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white text-sm shadow">
                    {initials}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">{emp.name}</h4>
                    <span className="text-[10px] text-slate-400">{emp.designation || emp.role}</span>
                  </div>
                </div>

                <button onClick={() => handleOpenEditModal(emp)} className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition">
                  <Edit className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-800/60 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="flex items-center space-x-1.5">
                    <Building className="w-3.5 h-3.5 text-blue-400" />
                    <span>Department</span>
                  </span>
                  <span className="text-slate-200 font-semibold">{emp.department}</span>
                </div>

                <div className="flex items-center justify-between text-slate-400">
                  <span className="flex items-center space-x-1.5">
                    <Mail className="w-3.5 h-3.5 text-purple-400" />
                    <span>Email</span>
                  </span>
                  <span className="text-slate-200 font-mono text-[11px]">{emp.email}</span>
                </div>

                <div className="flex items-center justify-between text-slate-400">
                  <span className="flex items-center space-x-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Monthly Salary</span>
                  </span>
                  <span className="text-emerald-400 font-bold font-mono">₹{emp.monthlySalary?.toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px]">
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                  {emp.status}
                </span>
                <span className="text-slate-500 font-mono">ID: {emp.employeeId}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Employee Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">{selectedEmp ? 'Edit Employee Profile' : 'Add New Employee Profile'}</h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Full Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white" required />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Email Address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white" required />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Phone Number</label>
                  <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Department</label>
                  <select value={dept} onChange={e => setDept(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white">
                    <option value="Engineering">Engineering</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Sales">Sales</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Designation</label>
                  <input type="text" value={designation} onChange={e => setDesignation(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white" />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Monthly Salary (INR)</label>
                <input type="number" value={salary} onChange={e => setSalary(Number(e.target.value))} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white" required />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs">Save Employee Profile</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
