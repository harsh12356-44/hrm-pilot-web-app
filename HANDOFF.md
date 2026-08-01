# HRM Pilot Web App - Handoff Documentation

## 1. Project Overview & Context
- **Project Name**: `HRM Pilot Web App`
- **Location**: `d:\Ravina\Antigravity\hrm-pilot-web-app`
- **Architecture**: Option 2 - Standalone Full-Stack SaaS Web App
- **Application Stack**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, Prisma ORM (Supabase PostgreSQL), SheetJS (`xlsx`), Lucide Icons.
- **Feature Parity**: 100% Absolute Feature Parity with `HRM-PILOT` WordPress Plugin.
- **Production Database**: Supabase Cloud PostgreSQL (Free Forever Tier).

---

## 2. Core Modules & Architecture
1. **Leave Tracker (`/admin`)**:
   - Quarterly leave summary (Casual, Planned, Sick).
   - CSV/XLSX legacy leave tracker importer engine.
   - Record Leave Period Modal connected to `/api/leaves` with half-day options.
   - Leave Usage Distribution donut chart & Ranked Usage bar chart.
   - Employee Leave Register table with search, filter, and deduction alerts.
2. **Attendance & Biometrics Log (`/admin/attendance`)**:
   - Biometric punch device CSV/Excel importer.
   - Daily attendance table with attendance codes (`P`, `HD`, `A`, `PL`, `UL`, `WO-I`, `H`, `MP`, `SW`).
   - Manual punch correction modal with audit reason tracking.
3. **Employee Directory (`/admin/employees`)**:
   - Employee profiles, monthly base salary, designation, and Add/Edit Employee modal.
4. **Departments Roster (`/admin/departments`)**:
   - Department cards, head assignments, member allocation count, and Add Department modal.
5. **Payroll & Deductions (`/admin/payroll`)**:
   - Monthly base salary calculation, hourly rate (`Monthly Salary / Required Hours`), short hours deduction, HR comment field, Finalize Payroll action, and Excel export.
6. **Company Holidays (`/admin/holidays`)**:
   - Public holidays calendar & optional/restricted holiday tags.
7. **Audit Activity Trail (`/admin/audit-logs`)**:
   - Immutable audit logging for all administrative operations.
8. **Notifications Center (Navbar Bell Icon)**:
   - Real-time notification tray for leave requests, approvals, and system alerts.
9. **Employee Portal (`/employee`)**:
   - Live Punch Clock (Check In / Check Out) widget with real-time timer.
10. **Manager Desk (`/manager`)**:
    - Team attendance status & leave approval inbox.
11. **System Settings (`/admin/settings`)**:
    - Company branding, shift hours, break deductions, and portal URL assignments.

---

## 3. Supabase + Vercel Deployment Guide

### Step 1: Create Free Supabase Project (1 Minute)
1. Go to **[Supabase.com](https://supabase.com)** -> Click **New Project**.
2. Give your project a name (e.g. `hrm-pilot-db`) and set a Database Password.
3. Go to **Project Settings** -> **Database** -> Copy the connection strings:
   - **Transaction Pooler URL** (port 6543) -> `DATABASE_URL`
   - **Direct URL** (port 5432) -> `DIRECT_URL`

### Step 2: Push Database Schema to Supabase
Run this command in your project terminal:
```powershell
npx prisma db push
```

### Step 3: Deploy to Vercel
1. Connect your repository to **Vercel.com**.
2. Under **Environment Variables**, add:
   - `DATABASE_URL` = `<your-supabase-pooler-url>`
   - `DIRECT_URL` = `<your-supabase-direct-url>`
3. Click **Deploy**!

---

## 4. Local App Server & Commands

```powershell
cd "d:\Ravina\Antigravity\hrm-pilot-web-app"
npm run dev
```

Access the app in your browser:
- **Admin Leave Tracker**: `http://localhost:3000/admin`
- **Attendance & Biometrics**: `http://localhost:3000/admin/attendance`
- **Employee Directory**: `http://localhost:3000/admin/employees`
- **Departments Roster**: `http://localhost:3000/admin/departments`
- **Payroll & Deductions**: `http://localhost:3000/admin/payroll`
- **Company Holidays**: `http://localhost:3000/admin/holidays`
- **Audit Activity Trail**: `http://localhost:3000/admin/audit-logs`
- **Employee Portal**: `http://localhost:3000/employee`
- **Manager Portal**: `http://localhost:3000/manager`
- **Settings Page**: `http://localhost:3000/admin/settings`
