# HRM Pilot Web App - Comprehensive Project Handoff Documentation

## 1. Project Overview & Context
- **Project Name**: `HRM Pilot Web App`
- **Location**: `d:\Ravina\Antigravity\hrm-pilot-web-app`
- **GitHub Repository**: [https://github.com/harsh12356-44/hrm-pilot-web-app](https://github.com/harsh12356-44/hrm-pilot-web-app)
- **Live Vercel Production URL**: [https://hrm-pilot-web-app.vercel.app](https://hrm-pilot-web-app.vercel.app)
- **Live Login Portal**: [https://hrm-pilot-web-app.vercel.app/login](https://hrm-pilot-web-app.vercel.app/login)
- **Production Database**: Supabase Cloud PostgreSQL Project `hrm-pilot-db` (`fzkwrphhjebngiinevrr`).
- **Architecture**: Standalone Full-Stack SaaS Web App (Next.js 15 App Router, React 19, TypeScript, Tailwind CSS v4, Prisma ORM, SheetJS `xlsx`, Lucide Icons).

---

## 2. Live Role Credentials & Login Matrix

| User Role | Designation | Email Address | Password | Accessible Views |
| :--- | :--- | :--- | :--- | :--- |
| **Super Administrator (ADMIN)** | Senior Lead Engineer | `harshit@hrmpilot.com` | `Admin@123` | Full Admin Suite (`/admin`), Attendance, Payroll, Directory, Settings |
| **HR Manager (MANAGER)** | HR Manager | `ananya@hrmpilot.com` | `Manager@123` | Manager Team Approval Desk (`/manager`), Subordinate Approvals |
| **Employee (EMPLOYEE)** | Senior Sales Executive | `rajesh@hrmpilot.com` | `Employee@123` | Employee Portal (`/employee`), Live Punch Clock, Personal Leaves |
| **Employee (EMPLOYEE)** | Frontend Developer | `priya@hrmpilot.com` | `Employee@123` | Employee Portal (`/employee`), Live Punch Clock, Personal Leaves |
| **Employee (EMPLOYEE)** | Marketing Specialist | `vikram@hrmpilot.com` | `Employee@123` | Employee Portal (`/employee`), Live Punch Clock, Personal Leaves |

---

## 3. Completed Modules & Feature Directory

1. **Leave Tracker & Quarterly Summary (`/admin`)**:
   - Quarterly leave summary (Casual, Planned, Sick).
   - Legacy CSV/XLSX leave tracker spreadsheet importer engine (`xlsx`).
   - `Record Leave Period` Modal supporting 0.5-day half-day increments (`full`, `first_half`, `second_half`), handover notes, and emergency contact details.
   - Leave Usage Distribution donut chart & Ranked Usage progress bars.
   - Employee Leave Register table with search, department filter, and deduction alerts.

2. **Attendance Log & Biometric Importer (`/admin/attendance`)**:
   - Biometric punch device CSV/Excel importer (`GET/POST /api/attendance`).
   - Daily attendance table tagging codes (`P`, `HD`, `A`, `PL`, `UL`, `WO-I`, `H`, `MP`, `SW`).
   - Worked hours, short hours, and overtime calculations.
   - Manual punch correction modal with audit reason tracking.

3. **Employee Directory & Profiles (`/admin/employees`)**:
   - Employee profile cards, department filter, designation, monthly base salary specification, daily working requirement (480 mins), weekly off, and `Add/Edit Employee` modal (`GET/POST /api/employees`).

4. **Departments Roster (`/admin/departments`)**:
   - Department cards roster, code, head assignment, member allocation count, and `Add Department` modal (`GET/POST /api/departments`).

5. **Payroll & Salary Deduction Preview (`/admin/payroll`)**:
   - Base monthly salary calculation, hourly rate (`Monthly Salary / Required Hours`), short hours deduction calculation, missing punch warnings, HR comment field, `Finalize Payroll` workflow, and `Export Payroll Excel` download (`GET/POST /api/payroll`).

6. **Company Holidays Calendar (`/admin/holidays`)**:
   - Public annual holidays list and optional/restricted holiday tags with `Add Holiday` popup modal (`GET/POST /api/holidays`).

7. **System Audit Activity Trail (`/admin/audit-logs`)**:
   - Immutable audit logging for all administrative operations, punch edits, department additions, and payroll approvals (`GET /api/audit-logs`).

8. **Notifications Center (Navbar Bell Icon & `/api/notifications`)**:
   - Real-time notification popover tray displaying system alerts for leave requests, approvals, and punch events.

9. **Employee Self-Service Desk (`/employee`)**:
   - Live Punch Clock widget (Check In / Check Out with real-time timer), personal leave balance breakdown, and leave application desk.

10. **Manager Desk (`/manager`)**:
    - Team attendance status & leave request approval inbox (`Approve` / `Reject`).

11. **System Rules & Settings (`/admin/settings`)**:
    - Company branding, shift start time (`09:00`), lunch break deduction (`60` mins), half day threshold (`240` mins), and portal URL assignments (`GET/POST /api/settings`).

---

## 4. Supabase Database Architecture

- **Supabase Cloud PostgreSQL Project**: `hrm-pilot-db` (`fzkwrphhjebngiinevrr`)
- **Prisma Schema**: `prisma/schema.prisma` configured for PostgreSQL with `DATABASE_URL` (Pooler) & `DIRECT_URL` (Direct).
- **Vercel Environment Variables**:
  - `DATABASE_URL`: `postgresql://postgres.fzkwrphhjebngiinevrr:WZ1P9iwbtMrHz5sQ@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true`
  - `DIRECT_URL`: `postgresql://postgres.fzkwrphhjebngiinevrr:WZ1P9iwbtMrHz5sQ@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres`

---

## 5. Vercel CI/CD Auto-Deployment

- **GitHub Repository**: `harsh12356-44/hrm-pilot-web-app`
- **Vercel Hook**: Connected directly to `main` branch. Any commit pushed to `main` automatically triggers Vercel to compile, test, and update the live web app at [https://hrm-pilot-web-app.vercel.app](https://hrm-pilot-web-app.vercel.app).
