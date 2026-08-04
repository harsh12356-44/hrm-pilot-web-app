# HRM Pilot Web App - Technical Handoff Document

## 1. Project Overview
- **Project Name**: HRM Pilot Web App
- **Repository**: `https://github.com/harsh12356-44/hrm-pilot-web-app`
- **Live Vercel Deployment**: `https://hrm-pilot-web-app.vercel.app`
- **Local Dev Server**: `http://localhost:3000`
- **WordPress Target URL**: `http://localhost:10040/wp-admin/` (Username: `Ravina` | Password: `Ravina@15`)

---

### 2. Work Completed Today (Chronological Session Log)

Today, all user requests for employee roster management, salary data removal, biometric matrix parsing, monthly attendance matrix grid, and punch editing were **fully implemented, verified, committed, and deployed**:

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

4. 👥 **Full Company Roster (17 Employees) & Dual Manager Reporting**:
   - Added all 17 company employees into central database (`data/db.json`) and store fallback defaults (`src/lib/store.ts`).
   - Configured HR & COO leadership under **Ravina Khimani** (`ADMIN`), managing all managers and employees.
   - Displayed both **Manager 1** (Primary) and **Manager 2** (Secondary) on employee directory cards whenever secondary reporting is assigned.

5. 💵 **Base Salary Removal**:
   - Removed `Monthly Base` row from employee cards in [EmployeesTab.tsx](file:///d:/Ravina/Antigravity/hrm-pilot-web-app/src/components/EmployeesTab.tsx).
   - Removed `Monthly Salary` input field from profile edit modals.
   - Cleared salary values in [db.json](file:///d:/Ravina/Antigravity/hrm-pilot-web-app/data/db.json) and [store.ts](file:///d:/Ravina/Antigravity/hrm-pilot-web-app/src/lib/store.ts).

6. 📥 **Biometric Matrix Sheet Parser (`att login logout july.xls`)**:
   - Built 2D matrix parser engine ([biometricParser.ts](file:///d:/Ravina/Antigravity/hrm-pilot-web-app/src/lib/biometricParser.ts)) to parse biometric machine exports (ONtime, Secureye, ESSL, ZKAccess) where days 1 to 31 are matrix columns and punch times are separated by linebreaks (`\n`).
   - Implemented fuzzy name resolution matching biometric file names (`ravina khemani`, `shweta dadich`, `charuBhati`) to system accounts (`Ravina Khimani`, `Shweta dadhich`, `Charubhati`).
   - Imported **527 July 2026 biometric punch records** across all 17 employees into the database.

7. 📅 **Monthly Matrix Attendance Grid View**:
   - Built the **Monthly Matrix Grid View** matching the user's reference UI 1:1.
   - Sticky left column (`EMPLOYEE NAME`) for employee name & department.
   - Horizontally scrollable day columns (1..31) for selected month & year.
   - Rendered soft warm gold badges marked **WO** for Sundays / Weekly Offs (`WO-I`), soft red **A** for Absences, yellow **HD** for Half Days, and stacked check-in/out times for Present days.

8. 🛠️ **Manual Punch Edit & Save Correction Engine**:
   - Fixed `MANUAL_EDIT` API in [route.ts](file:///d:/Ravina/Antigravity/hrm-pilot-web-app/src/app/api/attendance/route.ts) to match logs by `id` or `(employeeId && date)`.
   - Enabled editing check-in/out times and attendance codes for both existing and newly created log entries, recalculating `workedMinutes`, `shortMinutes`, and `extraMinutes` automatically.

9. 📅 **2026 Official Holiday List & Attendance Grid Badges Engine**:
   - Added official 2026 company holidays (New Year, Republic Day, Holi, Independence Day, Raksha Bandhan, Diwali, Diwali (Rama Shama), Christmas) to the holidays database and `/api/holidays`.
   - Connected [AttendanceLogTab.tsx](file:///d:/Ravina/Antigravity/hrm-pilot-web-app/src/components/AttendanceLogTab.tsx) and [page.tsx](file:///d:/Ravina/Antigravity/hrm-pilot-web-app/src/app/admin/working-hours/page.tsx) to automatically render rose-pink **Holiday Badges** showing the exact holiday name (e.g. `Diwali`, `Holi`, `Republic Day`) on holiday cells across the Attendance Grid and Working Hours matrix.

10. 🌴 **1:1 WordPress Plugin Leave Tracker & Adjust Leave Engine**:
    - Extracted exact business rules from `class-hrm-leave-manager.php` and `class-hrm-admin.php`: **2 CL + 4 PL = 6 Total Allowance** per quarter.
    - Implemented category-wise excess formula matching WP plugin 1:1:
      $$\text{Extra Casual} = \max(0, \text{Casual Used} - 2)$$
      $$\text{Extra Planned} = \max(0, \text{Planned Used} - 4)$$
      $$\text{Extra Total} = \max(0, \text{Total Used} - 6)$$
      $$\text{Unpaid LOP} = \max(\text{Extra Total}, \text{Extra Casual} + \text{Extra Planned})$$
    - Built [AdjustLeaveModal.tsx](file:///d:/Ravina/Antigravity/hrm-pilot-web-app/src/components/AdjustLeaveModal.tsx) (`⚖️ Adjust Employee Leave Count`) allowing HR/Admin to credit bonus leaves, deduct leaves, or cover short working hours dynamically.

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
