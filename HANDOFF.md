# HRM Pilot Web App - Comprehensive Technical & Business Logic Handoff Document

## 1. Project Overview
- **Project Name**: HRM Pilot Web App
- **Repository**: `https://github.com/harsh12356-44/hrm-pilot-web-app`
- **Live Vercel Deployment**: `https://hrm-pilot-web-app.vercel.app`
- **Local Dev Server**: `http://localhost:3000`
- **WordPress Target URL**: `http://localhost:10040/wp-admin/` (Username: `Ravina` | Password: `Ravina@15`)

---

## 2. Core Business Rules, Formulas & Policy Logic

### 🌴 Rule 1: Quarterly Leave Allowance & Unpaid LOP Deductions
1. **Quarterly Allowance Structure**:
   - Each employee is allocated **2 Casual Leaves (CL)** + **4 Planned Leaves (PL)** = **6 Total Allowance Days per Quarter** (Q1: Jan–Mar, Q2: Apr–Jun, Q3: Jul–Sep, Q4: Oct–Dec).
2. **Unpaid Loss of Pay (LOP) Extra Deduction Formula**:
   - Unpaid salary deductions trigger **ONLY when the employee exceeds their overall 6-day quarterly limit**:
   $$\text{Extra Leaves to Deduct (Unpaid LOP)} = \max(0, \text{Total Leaves Used in Quarter} - 6)$$
3. **Monthly Salary Deduction Attribution**:
   - The system attributes unpaid deductions to the specific month in which excess leaves occurred:
   $$\text{Monthly Deduction Text} = \text{"Month Name: } X \text{ day(s)"}$$

---

### 📅 Rule 2: Single Day vs. Period Range Leave Application Formula
1. **Single Day Application (`From Date` Only)**:
   - If an employee fills `From Date` (e.g. `2026-09-01`) and leaves `To Date` empty or equal to `From Date`:
   - System sets `endDate = fromDate` and calculates **1 Day** (`daysCount = 1`).
   - If `Half Day (Morning)` or `Half Day (Afternoon)` is selected, `daysCount = 0.5`.
2. **Period Range Application (`From Date` & `To Date`)**:
   - If an employee selects a date range (e.g. `2026-09-10` to `2026-09-14`):
   - System calculates inclusive days count:
   $$\text{daysCount} = (\text{endDate} - \text{startDate}) + 1$$
   - A live calculated duration preview badge (`⚡ Calculated Leave Duration: X Days`) appears dynamically in the form.

---

### 🔄 Rule 3: 2-Tier Leave Request & Approval Workflow
1. **Leave Application & Dual Dispatch**:
   - Employee submits leave request. Initial state: `status = 'PENDING'`, `managerStatus = 'Pending'`, `hrStatus = 'Pending'`.
   - Sent simultaneously to both **Manager Desk (`/manager` & `/employee?tab=team-approvals`)** and **HR Desk (`/admin/leave-records` & `/admin/team-approvals`)**.
2. **Intermediate State (Manager Approves First)**:
   - When Manager approves, system sets `managerStatus = 'Approved'`, keeping `hrStatus = 'Pending'` and `status = 'PENDING'`.
   - Live status across Employee Leave History, Manager Team Approvals, and HR Pending Requests updates immediately to:
     - 🔵 **`APPROVED BY MANAGER (AWAITING HR)`**
     - Manager Status Column: `Approved ✓`
     - HR Status Column: `Pending HR`
3. **Final Approval (HR Approves Second or HR Approves First / Direct HR Approval)**:
   - When HR approves:
     - System synchronously sets `hrStatus = 'Approved'`, `managerStatus = 'Approved'`, and `status = 'APPROVED'`.
     - If HR approves first while pending (or if the employee has no assigned reporting manager), HR's decision marks leave as approved by **both Manager and HR**.
   - Live status across all portals updates immediately to:
     - 🟢 **`HR AND MANAGER HAVE APPROVED ✓`**
4. **Leave Tracker Integration (`/admin/leave-tracker`)**:
   - In both cases (Manager then HR, or HR first / HR direct), once fully approved by HR (`status = 'APPROVED'`), the leave record is automatically added to the **Leave Tracker**, deducting from Casual/Planned allowances and updating balance metrics in real time.

---

### 🔒 Rule 4: Employee Portal Scoping & Security
1. **Single Employee View Restriction**:
   - Under `/employee?tab=attendance` and `/employee?tab=working-hours`, the attendance grid and daily logs display **ONLY 1 row** (the active employee's own record). All other roster members are hidden.
2. **Active Portal View Selector**:
   - Allows switching active employee view (**`Lochita g1 (LG008)`**, **`Bulbul (BB011)`**, **`Sonu Goswami (SG012)`**, etc.) dynamically in the top header.
3. **Deactivated Account Access Revocation**:
   - Deactivated (`INACTIVE`) or deleted employee accounts attempting to access `/employee` see a prominent red **"Portal Access Revoked"** banner blocking punch clock usage and leave submissions.

---

### ⚡ Rule 5: Server-Authoritative Storage & Robust Leave Matching
1. **Server Storage Integrity**: `data/db.json` and in-memory store (`memoryDb`) are the single source of truth. Unsafe client backup overwrites have been removed to prevent `localStorage` from wiping server data.
3. **Strict Manager & Subordinate Isolation**: `isManager` and `teamSubordinates` in `employee/page.tsx` strictly evaluate direct reporting lines (`primaryManager` or `secondaryManager`). Non-manager employees (such as `Lochita g1`) evaluate to `isManager = false`, completely hiding the `Team Approvals` menu tab from their sidebar.
4. **Live Vercel Auto-Deployment**: All changes pushed to `main` branch automatically deploy live to `https://hrm-pilot-web-app.vercel.app`. Every fix must be committed and pushed (`git push origin main`) to keep the production Vercel app in 100% sync.

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
| **Administrative Leaves** | `/admin/leave-records` | ✅ 100% | Single-entry Table Shift, 1-Click HR Approvals & Rejections |
| **Settings Rules** | `/admin/settings` | ✅ 100% | Shift Start Time (09:00), Grace Thresholds, Portal URLs |
| **Payroll Preview** | `/admin/payroll` | ✅ 100% | Base Salary, Short Hours Deductions, Net Payout Exporter |
| **System Audit Logs** | `/admin/audit-logs` | ✅ 100% | Real-time Audit Trail for all CRUD actions |
| **Manager Desk** | `/manager` | ✅ 100% | Subordinate Reporting & Leave Approvals |
| **1:1 Employee Portal** | `/employee` | ✅ 100% | 9-item Sidebar, Apply Leave, Leave Balance Bars, Access Protection |

---

## 4. How to Run Locally & Deploy

```bash
# Navigate to workspace
cd d:/Ravina/Antigravity/hrm-pilot-web-app

# Run development server
npm run dev

# Deploy updates to GitHub / Vercel
git add .
git commit -m "Update documentation and rules"
git push origin main
```

- **Local App URL**: `http://localhost:3000`
- **Live Vercel URL**: `https://hrm-pilot-web-app.vercel.app`

---

## 5. Current Project Status & Action Plan

### Today's Completed Accomplishments:
1. **Dynamic Login & RBAC Routing**: Resolved login redirection so HR Admin routes to `/admin`, Manager to `/manager`, and Employee to `/employee`. Logout clears cookies and `localStorage` session keys.
2. **Systematic 2-Tier Approval Workflow**: Synchronized Manager Desk (`/manager`) and HR Admin Suite (`/admin/leave-records`) so Manager approval sets `managerStatus = 'Approved'` (displaying `AWAITING HR FINAL APPROVAL`), and HR approval sets `hrStatus = 'Approved'` and `status = 'APPROVED'` (displaying `HR AND MANAGER HAVE APPROVED ✓`).
3. **Server Auto-Recovery**: Fixed `Leave record not found` error by implementing multi-fallback ID/record matching and server auto-recovery for client backup records on Vercel serverless environments.
4. **Date Preview Formatting (`/employee?tab=apply-leave`)**: Formatted raw ISO date strings into clean formatted dates (e.g. `01 Sep 2026`).
5. **Payroll Default Base Salary Presets (`/admin/payroll`)**: Configured realistic default base salary values (₹48,000 to ₹95,000) across `db.json`, `store.ts`, and API fallback calculations.
6. **Mobile Sidebar Drawer Auto-Close**: Integrated responsive auto-close handler for mobile viewports (< 768px).
7. **Leave Tracker Quarter Switch Smooth Scroll (`/admin/leave-tracker`)**: Added smooth-scroll animation when switching between Q1, Q2, Q3, and Q4 quarter pills.
8. **Full Live QA Audit**: Completed an end-to-end live testing audit across all 17 functional modules.
9. **Leave Approval Status Persistence & Flicker Resolution**: Fixed leave request status updates across `/admin`, `/admin/leave-records`, `/admin/team-approvals`, `/manager`, and `/employee` by enhancing API matching, synchronizing `localStorage` entries, and resolving duplicate pending record overwrites.
10. **Leave Tracker Real-Time Dual-Approval Integration**: Updated [`store.ts`](file:///d:/Ravina/Antigravity/hrm-pilot-web-app/src/lib/store.ts) (`getQuarterlyLeaveSummaries` and `getEmployeeAllQuarters`) so leaves update Leave Tracker counts (Casual Used, Planned Used, Remaining, Utilization %) **ONLY ONCE fully approved by both Manager and HR**.
11. **Completed Hours Import & Real-Time Working Hours Sync**: Enhanced [`/api/attendance`](file:///d:/Ravina/Antigravity/hrm-pilot-web-app/src/app/api/attendance/route.ts) with flexible column title detection (`Employee ID`, `Emp Code`, `Completed Hours`, `Worked Hours`, `Date`), added Target Month & Year selection on [`/admin/attendance/import`](file:///d:/Ravina/Antigravity/hrm-pilot-web-app/src/app/admin/attendance/import/page.tsx), and connected `attendanceUpdated` event to auto-refresh [`/admin/working-hours`](file:///d:/Ravina/Antigravity/hrm-pilot-web-app/src/app/admin/working-hours/page.tsx).
12. **Attendance Grid Persistence & Dual-Key Lookup Resolution**: Updated [`store.ts`](file:///d:/Ravina/Antigravity/hrm-pilot-web-app/src/lib/store.ts) (`getDbData`) to prioritize `data/db.json` so saved attendance records never vanish from server storage, and enhanced [`working-hours/page.tsx`](file:///d:/Ravina/Antigravity/hrm-pilot-web-app/src/app/admin/working-hours/page.tsx) `logsMap` to index logs under both `emp.id` (`emp-1`) and `emp.employeeId` (`RK001`) with `{ cache: 'no-store' }` dynamic fetching.
13. **GET Attendance Canonical Matching & Working Hours Sync**: Updated [`/api/attendance`](file:///d:/Ravina/Antigravity/hrm-pilot-web-app/src/app/api/attendance/route.ts) to canonicalize `employeeId` in enriched API responses and handle department Set lookups across IDs, employeeId strings, and names.
14. **Removed Auto-Populate Hours Options**: Removed auto-populate action buttons and banner from [`/admin/working-hours`](file:///d:/Ravina/Antigravity/hrm-pilot-web-app/src/app/admin/working-hours/page.tsx) per user request to maintain clean manual/imported records.
15. **Direct Import Working Hours Modal Integration**: Added a prominent **Import Working Hours** button and interactive modal dialog directly to [`/admin/working-hours`](file:///d:/Ravina/Antigravity/hrm-pilot-web-app/src/app/admin/working-hours/page.tsx), enabling drag-and-drop spreadsheet uploads (`.csv`, `.xlsx`, `.xls`), target month selection, live row preview, and immediate grid auto-refresh.
16. **Dynamic Working Hours Time Period Auto-Switching**: Configured `attendanceUpdated` `CustomEvent` payload passing across [`AttendanceLogTab.tsx`](file:///d:/Ravina/Antigravity/hrm-pilot-web-app/src/components/AttendanceLogTab.tsx), [`attendance/import/page.tsx`](file:///d:/Ravina/Antigravity/hrm-pilot-web-app/src/app/admin/attendance/import/page.tsx), and [`working-hours/page.tsx`](file:///d:/Ravina/Antigravity/hrm-pilot-web-app/src/app/admin/working-hours/page.tsx) so that Working Hours automatically updates its target month and year filters to match the exact updated time period and re-fetches grid data dynamically.
17. **Disk Storage Enforcement & Anti-Flicker Resolution**: Updated [`store.ts`](file:///d:/Ravina/Antigravity/hrm-pilot-web-app/src/lib/store.ts) (`getDbData`) to re-sync directly from persistent disk JSON (`data/db.json`) on every call before falling back to memory snapshots. Added `export const dynamic = 'force-dynamic'` and `export const revalidate = 0` to API routes so serverless lambda instances and Next.js HMR modules never return stale cached state.
18. **Monthly Punches Object Array Matrix Parsing Fix**: Updated [`biometricParser.ts`](file:///d:/Ravina/Antigravity/hrm-pilot-web-app/src/lib/biometricParser.ts) (`parseBiometricPunches`) to support object array matrices where day numbers `1` through `31` are key properties on row objects (e.g. `row["1"] = "10:54\n19:54"`), correctly populating biometric check-in/out, WO, HD, and absent records for uploaded sheets.
19. **Vercel Seed Database & Read-Write Priority Resolution**: Committed all 5,000+ imported attendance records into [`data/db.json`](file:///d:/Ravina/Antigravity/hrm-pilot-web-app/data/db.json) so Vercel builds with the complete seed database. Re-ordered `getDbData()` in [`store.ts`](file:///d:/Ravina/Antigravity/hrm-pilot-web-app/src/lib/store.ts) to prioritize `memoryDb` and `/tmp/hrm_db.json` over Vercel's read-only filesystem layer.
20. **Attendance Matrix Dual-Key Lookup Synchronization**: Updated [`AttendanceLogTab.tsx`](file:///d:/Ravina/Antigravity/hrm-pilot-web-app/src/components/AttendanceLogTab.tsx) `logsMap` key indexing and matrix cell lookup to check both `emp.id` (`emp-1`) and `emp.employeeId` (`RK001`), bringing `/admin/attendance` into 100% feature parity with Working Hours and eliminating blank matrix cells.
21. **Permanent Dual-Sync Cloud Auto-Recovery Architecture**: Added `action: 'sync_client_backup'` to [`/api/attendance`](file:///d:/Ravina/Antigravity/hrm-pilot-web-app/src/app/api/attendance/route.ts) and integrated client-side `localStorage` backup auto-recovery into [`AttendanceLogTab.tsx`](file:///d:/Ravina/Antigravity/hrm-pilot-web-app/src/components/AttendanceLogTab.tsx) and [`working-hours/page.tsx`](file:///d:/Ravina/Antigravity/hrm-pilot-web-app/src/app/admin/working-hours/page.tsx). If a Vercel serverless lambda ever cold-starts with reset memory, the client automatically restores attendance logs to server memory seamlessly.
22. **Active Profile Attendance & Working Hours Rendering Fix**: Fixed a `ReferenceError` (`attData.logs` -> `data.logs`) in [`AttendanceLogTab.tsx`](file:///d:/Ravina/Antigravity/hrm-pilot-web-app/src/components/AttendanceLogTab.tsx) that prevented state updates when viewing employee attendance under active employee profiles (such as Naman Bangia or Sonu Goswami). Now, switching active profiles displays their respective monthly attendance matrix and working hours.
23. **Working Hours Portal Mode Formatting & Total Hours Column**: Added `showHoursFormat` prop support to [`AttendanceLogTab.tsx`](file:///d:/Ravina/Antigravity/hrm-pilot-web-app/src/components/AttendanceLogTab.tsx) and updated [`src/app/employee/page.tsx`](file:///d:/Ravina/Antigravity/hrm-pilot-web-app/src/app/employee/page.tsx) so `/employee?tab=working-hours` displays completed shift hours (e.g. `9h 0m`, `8h 19m`) and a cumulative `TOTAL HRS` column instead of check-in / check-out times.
25. **Non-Regressive State Engine & Permanent Anti-Flicker Architecture**: Created `mergeLeavesNonRegressive` in [`src/lib/types.ts`](file:///d:/Ravina/Antigravity/hrm-pilot-web-app/src/lib/types.ts) and integrated it into `/employee`, `/manager`, `/admin/leave-records`, `/admin/team-approvals`, and `/admin`. Guarantees that once a leave request status is marked as `Approved` by Manager or HR, serverless cold-start lambda polls on Vercel can **never** regress or flip status back to `Pending`. Synchronizes `localStorage` (`hrm_user_submitted_leaves`) on all approval actions, eliminating UI flickering permanently across all portals.
26. **Strict HR Profile Switching Restriction**: Restricted account/profile switching strictly to HR Admin (`RK001` / Ravina Khimani / `ADMIN` role). Removed account switching dropdown for regular employee and manager logins.
27. **Sunday (Weekly Off) Exclusion from Leave Duration Calculation**: Created `calculateWorkingDaysCount` in [`src/lib/types.ts`](file:///d:/Ravina/Antigravity/hrm-pilot-web-app/src/lib/types.ts) and connected it across `/api/leaves` and `/employee` apply leave form. Iterates through date ranges and skips Sundays (`getDay() === 0`), ensuring leave days calculations count working days only.
28. **Employee Dashboard Light Mode Removal**: Forced dark theme on Employee and Manager portals and restricted theme toggle in [`Navbar.tsx`](file:///d:/Ravina/Antigravity/hrm-pilot-web-app/src/components/Navbar.tsx) strictly to HR Admin.
29. **HR-Only Holiday Import/Add/Delete Restrictions**: Updated [`HolidaysTab.tsx`](file:///d:/Ravina/Antigravity/hrm-pilot-web-app/src/components/HolidaysTab.tsx) so regular employees can only view the company holiday calendar. Hid the **Add Holiday** button, **Import Holidays List** card, and **Delete Holiday** controls for non-HR logins.
30. **Complete Removal of Active Employee View Dropdown for Non-HR Accounts**: Updated [`src/app/employee/page.tsx`](file:///d:/Ravina/Antigravity/hrm-pilot-web-app/src/app/employee/page.tsx) so the `Active Employee View:` `<select>` dropdown is hidden for non-HR employees, displaying only a static read-only badge of their logged-in identity.
31. **Employee Dashboard Analytics & Full Name Greeting Synchronization**: Updated [`src/app/employee/page.tsx`](file:///d:/Ravina/Antigravity/hrm-pilot-web-app/src/app/employee/page.tsx) to change hero greeting to `Hello, {Full Name}` and synchronized metric cards:
    - **Present Days**: Filtered for current month (August 2026) from attendance grid.
    - **Total Hours**: Calculated total completed working hours & minutes for current month (`152h 30m`).
    - **Late Arrivals**: Counted late arrivals (`checkIn > 09:15:00`) for current month from attendance grid.
    - **Leave Balance**: Connected directly to Leave Tracker remaining balance for current quarter (Q3 2026).

### Status Summary:
- [x] **Item 1: Date Preview Formatting (`/employee?tab=apply-leave`)**: Completed ✓
- [x] **Item 2: Payroll Default Base Salary Presets (`/admin/payroll`)**: Completed ✓
- [x] **Item 3: Mobile Sidebar Drawer Auto-Close**: Completed ✓
- [x] **Item 4: Leave Tracker Quarter Switch Smooth Scroll (`/admin/leave-tracker`)**: Completed ✓
- [x] **Item 5: Leave Approval Status Persistence & Flicker Resolution**: Completed ✓
- [x] **Item 6: Leave Tracker Dual-Approval Integration**: Completed ✓
- [x] **Item 7: Completed Hours Import & Real-Time Working Hours Sync**: Completed ✓
- [x] **Item 8: Attendance Grid Persistence & Dual-Key Lookup Resolution**: Completed ✓
- [x] **Item 9: GET Attendance Canonical Matching & Working Hours Sync**: Completed ✓
- [x] **Item 10: Removed Auto-Populate Hours Options**: Completed ✓
- [x] **Item 11: Direct Import Working Hours Modal Integration**: Completed ✓
- [x] **Item 12: Dynamic Working Hours Time Period Auto-Switching**: Completed ✓
- [x] **Item 13: Disk Storage Enforcement & Anti-Flicker Resolution**: Completed ✓
- [x] **Item 14: Monthly Punches Object Array Matrix Parsing Fix**: Completed ✓
- [x] **Item 15: Vercel Seed Database & Read-Write Priority Resolution**: Completed ✓
- [x] **Item 16: Attendance Matrix Dual-Key Lookup Synchronization**: Completed ✓
- [x] **Item 17: Permanent Dual-Sync Cloud Auto-Recovery Architecture**: Completed ✓
- [x] **Item 18: Active Profile Attendance & Working Hours Rendering Fix**: Completed ✓
- [x] **Item 19: Working Hours Portal Mode Formatting & Total Hours Column**: Completed ✓
- [x] **Item 20: Strict Admin Access Control & Individual Profile Attendance/Working Hours Grids**: Completed ✓
- [x] **Item 21: Non-Regressive State Engine & Permanent Anti-Flicker Architecture**: Completed ✓
- [x] **Item 22: Strict HR Profile Switching Restriction**: Completed ✓
- [x] **Item 23: Sunday Exclusion from Leave Duration Calculation**: Completed ✓
- [x] **Item 24: Employee Dashboard Light Mode Removal**: Completed ✓
- [x] **Item 25: HR-Only Holiday Import/Add/Delete Restrictions**: Completed ✓
- [x] **Item 26: Complete Removal of Active Employee View Dropdown for Non-HR Accounts**: Completed ✓
- [x] **Item 27: Employee Dashboard Analytics & Full Name Greeting Synchronization**: Completed ✓
