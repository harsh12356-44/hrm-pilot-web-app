'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, Mail, ArrowRight, UserCheck, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('ravina@hrmpilot.com');
  const [password, setPassword] = useState('Admin@123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSelectRole = (userEmail: string, userPass: string) => {
    setEmail(userEmail);
    setPassword(userPass);
    setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Demo authentication routine
      if ((email === 'ravina@hrmpilot.com' || email === 'harshit@hrmpilot.com') && password === 'Admin@123') {
        document.cookie = 'hrm_user_role=ADMIN; path=/; max-age=86400';
        router.push('/admin');
      } else if (
        (email === 'naman@hrmpilot.com' || email === 'jigyasa@hrmpilot.com' || email === 'meenal@hrmpilot.com' || email === 'divyanshu@hrmpilot.com' || email === 'ananya@hrmpilot.com') &&
        password === 'Manager@123'
      ) {
        document.cookie = 'hrm_user_role=MANAGER; path=/; max-age=86400';
        router.push('/manager');
      } else if (password === 'Employee@123') {
        document.cookie = 'hrm_user_role=EMPLOYEE; path=/; max-age=86400';
        router.push('/employee');
      } else {
        throw new Error('Invalid email or password. Please use one of the demo credentials below.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full space-y-6 z-10">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-xl shadow-blue-500/20 text-white font-extrabold text-2xl">
            H
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">HRM Pilot Portal</h1>
          <p className="text-xs text-slate-400">Enterprise Attendance, Leave Management & Payroll SaaS v2.0</p>
        </div>

        {/* Login Form Container */}
        <div className="bg-slate-900/80 border border-slate-800 backdrop-blur-xl rounded-3xl p-7 shadow-2xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="font-bold text-sm text-white">Sign In to Your Workspace</h2>
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">
              SSL Protected 🔒
            </span>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2 transition disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Credentials Switcher */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <p className="text-[11px] font-bold text-slate-400 text-center uppercase tracking-wider">
              Quick Role Sign-In Presets
            </p>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleSelectRole('ravina@hrmpilot.com', 'Admin@123')}
                className={`p-2.5 rounded-xl border text-left space-y-1 transition ${
                  email === 'ravina@hrmpilot.com'
                    ? 'bg-blue-600/20 border-blue-500 text-white'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Shield className="w-3.5 h-3.5 text-blue-400" />
                  {email === 'ravina@hrmpilot.com' && <CheckCircle2 className="w-3 h-3 text-blue-400" />}
                </div>
                <p className="font-extrabold text-[11px] text-white">HR / COO</p>
                <p className="text-[9px] text-slate-400 truncate">Ravina Khimani</p>
              </button>

              <button
                type="button"
                onClick={() => handleSelectRole('naman@hrmpilot.com', 'Manager@123')}
                className={`p-2.5 rounded-xl border text-left space-y-1 transition ${
                  email === 'naman@hrmpilot.com'
                    ? 'bg-purple-600/20 border-purple-500 text-white'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <UserCheck className="w-3.5 h-3.5 text-purple-400" />
                  {email === 'naman@hrmpilot.com' && <CheckCircle2 className="w-3 h-3 text-purple-400" />}
                </div>
                <p className="font-extrabold text-[11px] text-white">Dev Manager</p>
                <p className="text-[9px] text-slate-400 truncate">Naman Bangia</p>
              </button>

              <button
                type="button"
                onClick={() => handleSelectRole('sonu@hrmpilot.com', 'Employee@123')}
                className={`p-2.5 rounded-xl border text-left space-y-1 transition ${
                  email === 'sonu@hrmpilot.com'
                    ? 'bg-emerald-600/20 border-emerald-500 text-white'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  {email === 'sonu@hrmpilot.com' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                </div>
                <p className="font-extrabold text-[11px] text-white">Developer</p>
                <p className="text-[9px] text-slate-400 truncate">Sonu Goswami</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
