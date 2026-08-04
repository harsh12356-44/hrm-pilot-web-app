# HRM Pilot Web App - Technical Handoff Document

## 1. Project Overview
- **Project Name**: HRM Pilot Web App
- **Repository**: `https://github.com/harsh12356-44/hrm-pilot-web-app`
- **Live Vercel Deployment**: `https://hrm-pilot-web-app.vercel.app`
- **Local Dev Server**: `http://localhost:3000`
- **WordPress Target URL**: `http://localhost:10040/wp-admin/` (Username: `Ravina` | Password: `Ravina@15`)

---

## 2. Work Completed Today (Chronological Session Log)

Today, all outstanding user requests for feature tabs under HR Admin Suite, Manager Desk, Employee Portal, and Biometric Importers were **fully implemented, verified in-browser with screenshots, committed, and deployed**:

1. 🔒 **Employee Import Security (Role-Based Visibility)**:
   - Completely hid the "Import Attendance" option and administrative tools from standard Employee accounts (`EMPLOYEE` role).
   - Only `ADMIN` and authorized `MANAGER` roles can access attendance import engines.

2. 📊 **HR Admin Suite Dashboard Interconnectivity**:
   - Built the **15-Day Attendance Count Trend** visualizer matching WordPress plugin screenshot 1:1, autofetched dynamically from `data/db.json`.
   - Built **Recent & Pending Leave Requests Inbox** for instant one-click HR/Manager approvals and rejections.
   - Built **Employees Current Month Overview** table displaying live monthly working hours, attendance rates, and active statuses.

3. ✏️ **1:1 Edit Employee Profile Modal & Security**:
   - Replaced old modal with a 13-field, 2-column grid layout matching the user's reference screenshot 1:1 (`Employee ID`, `Full Name`, `Email Address`, `Phone Number`, `Department`, `Designation`, `Date of Joining`, `Primary Reporting Manager`, `Secondary Reporting Manager`, `Employment Status`, `Employee Type`, `Monthly Salary`, `Weekly Off Day`).
   - Added 1-click status deactivation power toggle (`ACTIVE` / `INACTIVE`) and permanent deletion with confirmation modal.
   - Portal Security: Deactivated or deleted employees attempting to log into `/employee` see a prominent red **"Portal Access Revoked"** banner blocking punch clock usage and leave submissions.

4. 👥 **Managers Desk Subordinates & Dual Reporting**:
   - Strict Manager Filtering: Ensured manager cards strictly filter by `role === 'MANAGER' || role === 'ADMIN'`.
   - Direct Subordinates: Rendered as chip pills under manager cards with an `(X)` remove button.
   - **Dual Manager Reporting**: Enabled single employees to report to two managers simultaneously (`Primary Manager` / `Secondary Manager`), appearing on both managers' cards automatically.
   - Added `+ Assign Subordinate` modal and `+ Designate New Manager` modal.

5. 🏢 **1:1 Edit Department Structure & Removal**:
   - Built 1:1 `Edit Department Structure` modal matching user screenshot (`Department Name *`, `Department Code *`, `Department Head / Manager` dropdown formatted as `Name (ID • Role)`).
   - Added `Remove Department` functionality with deletion confirmation modal.
   - Fixed department deletion re-seeding bug in `GET /api/departments/route.ts` so default departments are never auto-restored after being deleted by HR Admin.

6. 📥 **1:1 Biometric Attendance Import Engine**:
   - Built 1:1 Attendance Import page (`/admin/attendance/import`) matching WordPress plugin screenshot.
   - Added dual upload modes:
     - **`Monthly Punches Upload`**: Parses daily check-in / check-out punch logs and status codes (`P`, `HD`, `A`, `WO`), updating the **Attendance Grid** (`/admin/attendance`) and 15-day attendance trend.
     - **`Completed Hours`**: Parses pre-calculated completed hours per employee, updating total worked minutes in the **Working Hours & Overtime Engine** (`/admin/working-hours`).

7. 🗓️ **1:1 Import Holidays List Feature**:
   - Built 1:1 `Import Holidays List` card on `/admin/holidays` matching WordPress plugin screenshot.
   - Dual ArrayBuffer & CSV text file parser (.csv, .xls, .xlsx) supporting column header fallbacks and date format conversions (`YYYY-MM-DD` and `DD/MM/YYYY`).
   - Parses custom uploaded holiday files or sample holiday schedules, updating `data/db.json` and refreshing the **Active Company Holidays** grid.

8. 🔤 **App-Wide Typography & Sidebar Scaled Up**:
   - Scaled root HTML font size to `16px` (`1rem`) and body font size to `16px` for crisp readability.
   - Upgraded Sidebar menu options font size to `16px` (`text-sm font-semibold`), icon sizes to `20px`, and expanded sidebar width to `w-68`.

9. 👥 **Full Company Roster & Team Reporting Hierarchy (17 Employees)**:
   - Added all 17 company employees into central database (`data/db.json`) and store fallback defaults (`src/lib/store.ts`).
   - Established HR & COO leadership under **Ravina Khimani** (`ADMIN`), managing all managers and employees.
   - Configured managers and dual-reporting team structures:
     - **Naman Bangia** (Senior Development Manager) managing team: Anup Sen, Lochita g1, Rajvardhan, Mudita, Bulbul, Sonu Goswami (dual reporting to HR Ravina Khimani).
     - **Jigyasa Sen** (Senior Development Manager) managing team: Shweta dadhich (dual reporting to HR Ravina Khimani).
     - **Divyanshu** (Senior Development Manager).
     - **Meenal** (SEO Manager) managing team: Charubhati (dual reporting to HR Ravina Khimani).
     - **Nandini Gupta** (Founders Office).
     - **Shryanshu**, **Garv**, and **Charu Siddhawat** (Final Suspects).

---

## 3. 1:1 WordPress Plugin Feature Parity Matrix

| Feature Tab / Component | Path | Status | WP Plugin Match Details |
| :--- | :--- | :--- | :--- |
| **Dashboard Overview** | `/admin` | ✅ 100% | 15-day Attendance Trend, Pending Leaves Inbox, Monthly Overview |
| **Employees Roster** | `/admin/employees` | ✅ 100% | 13-field 2-column Edit Form, Deactivate Toggle, Access Revocation |
| **Managers Desk** | `/admin/managers` | ✅ 100% | Direct Subordinates Chips, Dual Manager Reporting, Strict Role Filter |
| **Departments Desk** | `/admin/departments` | ✅ 100% | 1:1 Structure Modal, Department Head Dropdown, Department Removal |
| **Attendance Grid** | `/admin/attendance` | ✅ 100% | Monthly Matrix, Status Codes (`P`, `HD`, `A`, `WO`), Manual Edits |
| **Attendance Import** | `/admin/attendance/import` | ✅ 100% | Dual Upload: `Monthly Punches Upload` & `Completed Hours` |
| **Attendance Export** | `/admin/attendance/export` | ✅ 100% | Working Hours & Salary Deduction Exporters |
| **Working Hours Engine** | `/admin/working-hours` | ✅ 100% | Worked Minutes vs Shift Target, Short Hours Calculation |
| **Attendance Analytics** | `/admin/attendance-analytics` | ✅ 100% | Attendance Rate Gauge, Monthly Trend Bars |
| **Holidays List** | `/admin/holidays` | ✅ 100% | 1:1 `Import Holidays List` card (.csv, .xls, .xlsx), Delete Holiday |
| **Leave Tracker** | `/admin/leave-tracker` | ✅ 100% | Q1-Q4 Quarter Pills, Leave Distribution Donut Chart |
| **Administrative Leaves** | `/admin/leave-records` | ✅ 100% | Leave Inbox, 1-Click HR Approvals & Rejections |
| **Settings Rules** | `/admin/settings` | ✅ 100% | Shift Start Time (09:00), Grace Thresholds, Portal URLs |
| **Payroll Preview** | `/admin/payroll` | ✅ 100% | Base Salary, Short Hours Deductions, Net Payout Exporter |
| **System Audit Logs** | `/admin/audit-logs` | ✅ 100% | Real-time Audit Trail for all CRUD actions |
| **Manager Desk** | `/manager` | ✅ 100% | Subordinate Reporting & Leave Approvals |
| **1:1 Employee Portal** | `/employee` | ✅ 100% | 9-item Sidebar, Apply Leave, Leave Balance Bars, Access Protection |

---

## 4. Key Architectural Rules & Data Invariants

1. **Central Data Interconnectivity**:
   - All data modifications write directly to `data/db.json` using `getDbData()` and `saveDbData(db)` from `src/lib/store.ts`.
   - Any updates in Employee Directory, Department Structure, Biometric Imports, or Leave Approvals autofetch and update dependent views across Admin, Manager, and Employee portals instantly.

2. **Strict Manager Filter**:
   - Manager Cards on `/admin/managers` filter strictly by `e.role === 'MANAGER' || e.role === 'ADMIN'`.

3. **Dual Manager Hierarchy**:
   - Employees support both `primaryManager` and `secondaryManager` assignments simultaneously.

4. **Portal Access Enforcement**:
   - `/employee` checks `status === 'ACTIVE'`. Inactive or deleted accounts trigger a red access revoked alert banner.

---

## 5. How to Run Locally & Deploy

```bash
# Navigate to workspace
cd d:/Ravina/Antigravity/hrm-pilot-web-app

# Run development server
npm run dev

# Deploy updates to GitHub / Vercel
git add .
git commit -m "Your commit message"
git push origin main
```

- **Local App URL**: `http://localhost:3000`
- **Live Vercel URL**: `https://hrm-pilot-web-app.vercel.app`
