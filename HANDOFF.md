# HRM Pilot Web App - Technical Handoff Document

## 1. Project Overview
- **Project Name**: HRM Pilot Web App
- **Repository**: `https://github.com/harsh12356-44/hrm-pilot-web-app`
- **Live Vercel Deployment**: `https://hrm-pilot-web-app.vercel.app`
- **Local Dev Server**: `http://localhost:3000`
- **WordPress Target URL**: `http://localhost:10040/wp-admin/` (User: `Ravina` / Pass: `Ravina@15`)

---

## 2. 1:1 WordPress Plugin Feature Parity Matrix
All 13 WordPress plugin admin tabs, employee/manager shortcode portals, biometric punch importers, and leave policies have been fully cloned into Next.js 15:

1. **Dashboard Overview (`/admin`)**: KPI Stat Cards, Shortcut Operations, Attendance Trend Visualizer.
2. **Employees Roster (`/admin/employees`)**: Profile Manager, Salary & Shift Attributes, CSV Import.
3. **Managers & Department Heads (`/admin/managers`)**: Manager Roster, Subordinate Allocations, Direct Approvals.
4. **Departments Desk (`/admin/departments`)**: Code Allocations, Head Assignment, Member Counts.
5. **Attendance Grid (`/admin/attendance`)**: Monthly Matrix, Status Codes (`P`, `HD`, `A`, `WO`), Manual Punch Corrections.
6. **Biometric Attendance Import (`/admin/attendance/import`)**: Punch CSV/XLSX Uploader, Real-time Validation Engine.
7. **Attendance Export (`/admin/attendance/export`)**: Monthly Working Hours & Salary Deduction Exporters.
8. **Working Hours & Overtime Engine (`/admin/working-hours`)**: Worked Minutes vs 480 Mins Shift Target, Short Hours Calculation.
9. **Attendance Analytics Visualizer (`/admin/attendance-analytics`)**: Attendance Rate Gauge, Monthly Trend Bars.
10. **Holidays List (`/admin/holidays`)**: Annual Public Holiday Roster, Add Holiday Engine.
11. **Quarterly Leave Tracker (`/admin/leave-tracker`)**: Q1-Q4 Quarter Pills, Leave Distribution Donut Chart, Leave Policy Uploader.
12. **Administrative Leave Requests (`/admin/leave-records`)**: Leave Application Inbox, One-click HR Approvals & Rejections.
13. **Settings Rules (`/admin/settings`)**: Company Branding, Shift Start Time (09:00), Grace Thresholds, Shortcode Portals.
14. **Payroll & Salary Deduction Preview (`/admin/payroll`)**: Monthly Salary Calculations, Short Hours Deductions, Excel Exporter.
15. **System Audit Logs (`/admin/audit-logs`)**: Event Logging, System Operations Roster.
16. **Manager Desk (`/manager`)**: Direct Manager Approvals, Team Reporting.
17. **Employee Portal (`/employee`)**: Live Biometric Punch Clock, Leave Quota Summary, Leave Application Modal.

---

## 3. Key Architectural Decisions & Bug Fixes
- **Webpack Dev Cache Fix**: Disabled Webpack disk pack caching in development mode in `next.config.ts` to prevent `.next` cache corruption errors permanently.
- **Hydration Warning Fix**: Added `suppressHydrationWarning` to both `<html>` and `<body>` in `src/app/layout.tsx` to handle browser extension DOM attribute injections cleanly.
- **Full Light/Dark Theme Switcher**: Added a topbar toggle button in `Navbar.tsx` that switches the entire web application (navbar, sidebar, cards, tables, inputs) between Dark Navy and 100% Crisp White Light Theme with persistent `localStorage` support.

---

## 4. How to Run Locally
```bash
cd d:/Ravina/Antigravity/hrm-pilot-web-app
npm run dev
```
Open `http://localhost:3000/admin` in your browser.
