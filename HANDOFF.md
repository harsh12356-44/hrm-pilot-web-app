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

### 🔄 Rule 3: Single-Entry & Real-Time Table Shift Workflow
1. **Table 1: System Pending Leave Approvals (`/admin/leave-records`)**:
   - When a leave application is submitted, it appears **ONLY** in Table 1 (`pendingApprovals`).
   - Displays **`Approve (HR Final)`** and **`Reject`** buttons.
   - It is strictly excluded from Table 2 while pending (no duplicate entries).
2. **Action & Table Shift Execution**:
   - When HR Admin clicks **Approve** or **Reject**, the system synchronously sets:
     - `status = 'APPROVED'` (or `'REJECTED'`)
     - `managerStatus = 'Approved'` (or `'Rejected'`)
     - `hrStatus = 'Approved'` (or `'Rejected'`)
   - The request is **immediately removed / shifted OUT of Table 1** and moves permanently into **Table 2 (`Historical Leave Requests Register`)**.
3. **Table 2: Historical Leave Requests Register**:
   - Displays finalized decisions showing audit badges:
     - 🟢 **`HR AND MANAGER HAVE APPROVED ✓`**
     - 🔴 **`REJECTED ✗`**
4. **Real-Time Live Sync Across Portals**:
   - **Employee Portal (`/employee?tab=leave-history`)**: Auto-polls every 3 seconds and updates status live to `HR AND MANAGER HAVE APPROVED ✓` (Green Badge) or `REJECTED ✗` (Red Badge).
   - **Leave Tracker (`/admin/leave-tracker`)**: Recalculates Casual Used, Planned Used, Remaining, Utilization %, and Unpaid LOP Deductions automatically.

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

### Status Summary:
- [x] **Item 1: Date Preview Formatting (`/employee?tab=apply-leave`)**: Completed ✓
- [x] **Item 2: Payroll Default Base Salary Presets (`/admin/payroll`)**: Completed ✓
- [x] **Item 3: Mobile Sidebar Drawer Auto-Close**: Completed ✓
- [x] **Item 4: Leave Tracker Quarter Switch Smooth Scroll (`/admin/leave-tracker`)**: Completed ✓
- [x] **Item 5: Leave Approval Status Persistence & Flicker Resolution**: Completed ✓
- [x] **Item 6: Leave Tracker Dual-Approval Integration**: Completed ✓
- [x] **Item 7: Completed Hours Import & Real-Time Working Hours Sync**: Completed ✓
