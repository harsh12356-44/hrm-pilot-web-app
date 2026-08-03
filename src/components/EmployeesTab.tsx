'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Edit,
  Mail,
  Phone,
  Building,
  DollarSign,
  Trash2,
  Power,
  Shield,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import { Employee } from '@/lib/types';

export default function EmployeesTab() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [empToDelete, setEmpToDelete] = useState<Employee | null>(null);
  const [message, setMessage] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dept, setDept] = useState('Engineering');
  const [designation, setDesignation] = useState('Senior Engineer');
  const [role, setRole] = useState<'ADMIN' | 'MANAGER' | 'EMPLOYEE'>('EMPLOYEE');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [salary, setSalary] = useState(75000);
  const [dailyMins, setDailyMins] = useState(480);
  const [casualAllowance, setCasualAllowance] = useState(6);
  const [plannedAllowance, setPlannedAllowance] = useState(6);

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/employees');
      const data = await res.json();
      setEmployees(Array.isArray(data) ? data : []);
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
    setRole('EMPLOYEE');
    setStatus('ACTIVE');
    setSalary(75000);
    setDailyMins(480);
    setCasualAllowance(6);
    setPlannedAllowance(6);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (emp: Employee) => {
    setSelectedEmp(emp);
    setName(emp.name);
    setEmail(emp.email);
    setPhone(emp.phone || '');
    setDept(emp.department);
    setDesignation(emp.designation || 'Staff');
    setRole((emp.role as any) || 'EMPLOYEE');
    setStatus((emp.status as any) || 'ACTIVE');
    setSalary(emp.monthlySalary || 75000);
    setDailyMins(emp.dailyWorkingRequirementMinutes || 480);
    setCasualAllowance(emp.casualAllowance || 6);
    setPlannedAllowance(emp.plannedAllowance || 6);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (emp: Employee) => {
    try {
      const newStatus = emp.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      const res = await fetch('/api/employees', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: emp.id,
          action: 'TOGGLE_STATUS',
          status: newStatus,
        }),
      });
      const data = await res.json();
      setMessage(`Employee ${emp.name} is now ${newStatus}!`);
      setTimeout(() => setMessage(''), 4000);
      fetchEmployees();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!empToDelete) return;
    try {
      await fetch(`/api/employees?id=${empToDelete.id}`, {
        method: 'DELETE',
      });
      setMessage(`Employee ${empToDelete.name} permanently deleted. Portal access revoked.`);
      setTimeout(() => setMessage(''), 4000);
      setIsDeleteModalOpen(false);
      setEmpToDelete(null);
      fetchEmployees();
    } catch (err) {
      console.error(err);
    }
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
          role,
          status,
          monthlySalary: salary,
          dailyWorkingRequirementMinutes: dailyMins,
          casualAllowance,
          plannedAllowance,
        }),
      });

      setMessage(selectedEmp ? `Updated details for ${name}!` : `Created new employee profile for ${name}!`);
      setTimeout(() => setMessage(''), 4000);
      setIsModalOpen(false);
      fetchEmployees();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = employees.filter(
    e =>
      (e.name.toLowerCase().includes(search.toLowerCase()) || e.email.toLowerCase().includes(search.toLowerCase()) || (e.employeeId && e.employeeId.toLowerCase().includes(search.toLowerCase()))) &&
      (department === 'ALL' || e.department === department) &&
      (statusFilter === 'ALL' || e.status === statusFilter)
  );

  return (
    <div className="space-y-6 text-slate-100 pb-12">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center space-x-2 font-heading">
            <Users className="w-5 h-5 text-blue-400" />
            <span>Employee Directory & Roster Manager</span>
          </h2>
          <p className="text-xs text-slate-400">Edit employee details, toggle active/inactive status, or permanently revoke portal access.</p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/30 transition flex items-center space-x-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Employee</span>
        </button>
      </div>

      {message && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs font-semibold text-emerald-400 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{message}</span>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search name, email, or ID..."
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

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Deactivated Only</option>
          </select>
        </div>

        <p className="text-xs text-slate-400">Total Roster Members: <span className="text-white font-bold">{employees.length}</span></p>
      </div>

      {/* Employee Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {filtered.map(emp => {
          const initials = emp.name.split(' ').map(n => n[0]).join('').toUpperCase();
          const isActive = emp.status === 'ACTIVE';

          return (
            <div
              key={emp.id}
              className={`bg-slate-900 border rounded-2xl p-5 shadow-lg space-y-4 transition ${
                isActive ? 'border-slate-800 hover:border-slate-700' : 'border-red-900/40 bg-slate-900/60 opacity-80'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm shadow ${
                    isActive
                      ? 'bg-gradient-to-tr from-blue-600 to-indigo-500'
                      : 'bg-gradient-to-tr from-slate-700 to-slate-600'
                  }`}>
                    {initials}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm font-heading">{emp.name}</h4>
                    <span className="text-[10px] text-slate-400">{emp.designation || emp.role}</span>
                  </div>
                </div>

                {/* Edit & Actions */}
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => handleOpenEditModal(emp)}
                    title="Edit Employee Details"
                    className="p-1.5 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded-lg transition"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleToggleStatus(emp)}
                    title={isActive ? 'Deactivate Employee' : 'Activate Employee'}
                    className={`p-1.5 rounded-lg transition ${
                      isActive
                        ? 'bg-amber-500/20 hover:bg-amber-500/40 text-amber-400'
                        : 'bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      setEmpToDelete(emp);
                      setIsDeleteModalOpen(true);
                    }}
                    title="Delete Employee"
                    className="p-1.5 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
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
                  <span className="text-slate-200 font-mono text-[11px] truncate max-w-[140px]">{emp.email}</span>
                </div>

                <div className="flex items-center justify-between text-slate-400">
                  <span className="flex items-center space-x-1.5">
                    <Shield className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Role</span>
                  </span>
                  <span className="text-slate-200 font-semibold text-[11px]">{emp.role}</span>
                </div>

                <div className="flex items-center justify-between text-slate-400">
                  <span className="flex items-center space-x-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Monthly Base</span>
                  </span>
                  <span className="text-emerald-400 font-bold font-mono">₹{emp.monthlySalary?.toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px]">
                <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                  {emp.status}
                </span>
                <span className="text-slate-500 font-mono font-bold">ID: {emp.employeeId || emp.id}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Employee Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-xl w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-extrabold text-white font-heading">
              {selectedEmp ? `Edit Profile: ${selectedEmp.name}` : 'Add New Employee Profile'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Department</label>
                  <select
                    value={dept}
                    onChange={e => setDept(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-medium"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Sales">Sales</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Designation</label>
                  <input
                    type="text"
                    value={designation}
                    onChange={e => setDesignation(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">System Access Role</label>
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-medium"
                  >
                    <option value="EMPLOYEE">EMPLOYEE</option>
                    <option value="MANAGER">MANAGER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Account Status</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-medium"
                  >
                    <option value="ACTIVE">ACTIVE (Allowed Access)</option>
                    <option value="INACTIVE">INACTIVE (Revoked Access)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Monthly Salary (INR)</label>
                  <input
                    type="number"
                    value={salary}
                    onChange={e => setSalary(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Daily Target (Mins)</label>
                  <input
                    type="number"
                    value={dailyMins}
                    onChange={e => setDailyMins(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-medium"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-600/30"
                >
                  Save Employee Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && empToDelete && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center space-x-3 text-red-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-extrabold text-white font-heading">Permanently Delete Employee</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-white">{empToDelete.name}</strong> ({empToDelete.email})?
              <br /><br />
              <span className="text-red-400 font-semibold">Warning:</span> Once deleted, this employee will no longer be able to log into the portal, and their roster record will be permanently removed.
            </p>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setEmpToDelete(null);
                }}
                className="px-4 py-2 bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs shadow-md shadow-red-600/30"
              >
                Permanently Delete Employee
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
