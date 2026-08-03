# HRM Pilot Web App - Comprehensive Project Handoff Documentation

## 1. Project Overview & Context
- **Project Name**: `HRM Pilot Web App`
- **Location**: `d:\Ravina\Antigravity\hrm-pilot-web-app`
- **GitHub Repository**: [https://github.com/harsh12356-44/hrm-pilot-web-app](https://github.com/harsh12356-44/hrm-pilot-web-app)
- **Live Vercel Production URL**: [https://hrm-pilot-web-app.vercel.app](https://hrm-pilot-web-app.vercel.app)
- **Live Login Portal**: [https://hrm-pilot-web-app.vercel.app/login](https://hrm-pilot-web-app.vercel.app/login)
- **Production Database**: Supabase Cloud PostgreSQL Project `hrm-pilot-db` (`fzkwrphhjebngiinevrr`).
- **Architecture**: Full-Stack SaaS Web App & 1:1 WordPress Plugin Feature Clone (Next.js 15 App Router, React 19, TypeScript, Tailwind CSS v4, Prisma ORM, SheetJS `xlsx`, Lucide Icons).

---

## 2. Live Role Credentials & Login Matrix

| User Role | Designation | Email Address | Password | Accessible Views |
| :--- | :--- | :--- | :--- | :--- |
| **Super Administrator (ADMIN)** | Senior Lead Engineer | `harshit@hrmpilot.com` | `Admin@123` | Full Admin Suite (`/admin`), All 13 Admin Tabs, Biometric Importer, Payroll, Directory, Settings |
| **HR Manager (MANAGER)** | HR Manager | `ananya@hrmpilot.com` | `Manager@123` | Manager Team Approval Desk (`/manager`), Subordinate Approvals, Managers Desk (`/admin/managers`) |
| **Employee (EMPLOYEE)** | Senior Sales Executive | `rajesh@hrmpilot.com` | `Employee@123` | Employee Portal (`/employee`), Live Punch Clock, Personal Leaves |
| **Employee (EMPLOYEE)** | Frontend Developer | `priya@hrmpilot.com` | `Employee@123` | Employee Portal (`/employee`), Live Punch Clock, Personal Leaves |
| **Employee (EMPLOYEE)** | Marketing Specialist | `vikram@hrmpilot.com` | `Employee@123` | Employee Portal (`/employee`), Live Punch Clock, Personal Leaves |

---

## 3. Completed Modules & 1:1 WordPress Plugin Feature Directory

1. **Central Admin Dashboard Overview (`/admin`)**:
   - Welcome Hero Banner with quick action launch buttons.
   - 5 KPI metric cards (Total Employees, Present Today, Half Day HD, Absent Today, Pending Leave Requests).
   - Module shortcuts to all 13 WordPress plugin tabs.

2. **Employee Roster & Profiles (`/admin/employees`)**:
   - Employee profile cards, department filter, designation, monthly base salary specification, daily working requirement (480 mins), weekly off, and `Add/Edit Employee` modal (`GET/POST /api/employees`).

3. **Managers & Department Heads Desk (`/admin/managers`)**:
   - Dedicated manager allocation grid, department head assignments, email addresses, and approval authority configuration.

4. **Departments Roster (`/admin/departments`)**:
   - Department cards roster, code, head assignment, member allocation count, and `Add Department` modal (`GET/POST /api/departments`).

5. **Attendance Grid (`/admin/attendance`)**:
   - Daily attendance table tagging codes (`P`, `HD`, `A`, `PL`, `UL`, `WO-I`, `H`, `MP`, `SW`).
   - Worked hours, short hours, and overtime calculations.
   - Manual punch correction modal with audit reason tracking.

6. **Biometric Attendance Importer (`/admin/attendance/import`)**:
   - Biometric punch device CSV/Excel importer engine (`xlsx`) matching `class-hrm-attendance-importer.php`.
   - Real-time spreadsheet data preview table and Supabase DB sync.

7. **Attendance Export Desk (`/admin/attendance/export`)**:
   - Month/Year selector and one-click download for Attendance Master Excel (`.xlsx`).

8. **Working Hours & Overtime Engine (`/admin/working-hours`)**:
   - Cumulative worked hours, 480 mins shift requirement tracking, short hours deduction pool, and overtime breakdown table.

9. **Attendance Analytics & Visualizer (`/admin/attendance-analytics`)**:
   - Overall attendance rate percentage gauge, status distribution breakdown, and active workforce charts.

10. **Company Holidays Calendar (`/admin/holidays`)**:
    - Public annual holidays list and optional/restricted holiday tags with `Add Holiday` popup modal (`GET/POST /api/holidays`).

11. **Leave Tracker & Quarterly Hero Banner (`/admin/leave-tracker`)**:
    - Hero banner (`linear-gradient(to right, #1d4ed8, #7c3aed)`), policy spreadsheet importer, quarter selector pills (Q1-Q4), donut chart, progress bar ranking, and `Record Leave Period` modal supporting 0.5-day half-day increments.

12. **Administrative Leave Requests Desk (`/admin/leave-records`)**:
    - Central leave application register with search, status filters (Pending, Approved, Rejected), and one-click `Approve` / `Reject` administrative actions.

13. **Payroll & Salary Deduction Preview (`/admin/payroll`)**:
    - Base monthly salary calculation, hourly rate (`Monthly Salary / Required Hours`), short hours deduction calculation, missing punch warnings, HR comment field, `Finalize Payroll` workflow, and `Export Payroll Excel` download (`GET/POST /api/payroll`).

14. **System Audit Activity Trail (`/admin/audit-logs`)**:
    - Immutable audit logging for all administrative operations, punch edits, department additions, and payroll approvals (`GET /api/audit-logs`).

15. **System Rules & Settings (`/admin/settings`)**:
    - Company branding, shift start time (`09:00`), lunch break deduction (`60` mins), half day threshold (`240` mins), and portal URL assignments (`GET/POST /api/settings`).

16. **Employee Self-Service Desk (`/employee`)**:
    - Standalone portal design system matching `class-hrm-portal.php`. Live Punch Clock widget (Clock In / Clock Out with real-time timer), personal leave balance breakdown, and leave application desk.

17. **Manager Approval Desk (`/manager`)**:
    - Team attendance status & leave request approval inbox (`Approve` / `Reject` / `Request Info`).

---

## 4. Supabase Database Architecture

- **Supabase Cloud PostgreSQL Project**: `hrm-pilot-db` (`fzkwrphhjebngiinevrr`)
- **Prisma Schema**: `prisma/schema.prisma` configured for PostgreSQL with `DATABASE_URL` (Pooler) & `DIRECT_URL` (Direct).

---

## 5. Vercel CI/CD Auto-Deployment

- **GitHub Repository**: `harsh12356-44/hrm-pilot-web-app`
- **Vercel Hook**: Connected directly to `main` branch. Any commit pushed to `main` automatically triggers Vercel to compile, test, and update the live web app at [https://hrm-pilot-web-app.vercel.app](https://hrm-pilot-web-app.vercel.app).
