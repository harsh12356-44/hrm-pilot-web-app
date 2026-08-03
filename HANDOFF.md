# HRM Pilot Web App - Technical Handoff Document

## 1. Project Overview
- **Project Name**: HRM Pilot Web App
- **Repository**: `https://github.com/harsh12356-44/hrm-pilot-web-app`
- **Live Vercel Deployment**: `https://hrm-pilot-web-app.vercel.app`
- **Local Dev Server**: `http://localhost:3000`
- **WordPress Target URL**: `http://localhost:10040/wp-admin/` (User: `Ravina` / Pass: `Ravina@15`)

---

## 2. 1:1 WordPress Plugin Feature Parity Matrix
All 13 WordPress plugin admin tabs, employee/manager shortcode portals, biometric punch importers, and leave policies have been cloned into Next.js 15:

1. **Dashboard Overview (`/admin`)**: KPI Stat Cards, Shortcut Operations, Interconnected Attendance Trend Visualizer (15-day pillar chart autofetched from DB), Recent & Pending Leave Requests, Employees Current Month Overview.
2. **Employees Roster (`/admin/employees`)**: Profile Manager, 1:1 2-Column Edit Employee Profile Modal (13 fields: Employee ID, Date of Joining, Primary/Secondary Managers, Employment Status, Employee Type, Weekly Off Day, Base Salary), 1-Click Status Deactivate Toggle, Permanent Delete Action, and Automatic Portal Access Revocation for deactivated/deleted members.
3. **Managers & Department Heads (`/admin/managers`)**: Manager Roster, Assign Subordinates Modal, Remove Subordinates Action, View Direct Subordinates Chips, and Designate New Manager Modal. Fully interconnected with Employee Directory additions/edits.
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
17. **1:1 Employee Portal (`/employee`)**: Dynamic 9-item sidebar navigation matching WordPress plugin (Dashboard, Attendance, Apply Leave, Leave History, Team Approvals, Working Hours, Holidays List, Notifications, My Profile). Includes 1:1 Apply for Leave form, Leave Balance progress bars (2 of 2 left Q3), Approval Flow timeline, and Employee ID badge.

---

## 3. Key Architectural Decisions & Interconnection Rules
- **Full Central Data Interconnectivity**: Database modifications (punching in/out, importing biometric CSV files, submitting leave requests, approving/rejecting applications, adding/editing employees) instantly update `data/db.json` and automatically reflect across Admin Dashboard, Managers Desk, and Employee Portal without full page reloads.
- **Dynamic Managers Synchronization**: Adding or editing an employee with role `MANAGER` or assigning a `primaryManager` automatically synchronizes the Managers Desk roster and subordinate lists in real time.
- **Role-Based Security & Deactivation Protection**: Employee view (`/employee`) hides HR administrative actions. Deactivated (`INACTIVE`) or deleted employees are automatically denied access to the Employee Portal with a prominent alert banner.
- **Dynamic Role-Based Sidebar Navigation**: Sidebar dynamically switches items based on active role (`ADMIN`, `MANAGER`, `EMPLOYEE`) and emits instant `roleChange` window events without page reload.
- **Webpack Dev Cache Fix**: Disabled Webpack disk pack caching in development mode in `next.config.ts` to prevent `.next` cache corruption errors permanently.
- **Full Light/Dark Theme Switcher**: Topbar toggle button in `Navbar.tsx` switches the entire application between Dark Navy and 100% Crisp White Light Theme with persistent `localStorage` support.

---

## 4. How to Run Locally
```bash
cd d:/Ravina/Antigravity/hrm-pilot-web-app
npm run dev
```
Open `http://localhost:3000/employee` or `http://localhost:3000/admin` in your browser.
