export type Role = 'ADMIN' | 'MANAGER' | 'EMPLOYEE';

export interface Employee {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  avatarUrl?: string;
  department: string;
  designation?: string;
  dateOfJoining?: string;
  role: Role;
  status: 'ACTIVE' | 'INACTIVE' | 'UNUSED';
  monthlySalary: number;
  dailyWorkingRequirementMinutes: number;
  weeklyOff: string; // e.g. "Sunday"
  casualAllowance: number;
  plannedAllowance: number;
  sickAllowance: number;
  reportingManager?: string;
  primaryManager?: string;
  secondaryManager?: string;
  manager1?: string;
  managerName?: string;
  employeeType?: string;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  managerName?: string;
  description?: string;
  employeeCount?: number;
}

export interface LeaveRecord {
  id: string;
  employeeId: string;
  leaveType: 'Casual Leave' | 'Planned Leave' | 'Sick Leave';
  startDate: string;
  endDate: string;
  dayType?: 'full' | 'first_half' | 'second_half';
  daysCount: number;
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  year: number;
  status: 'APPROVED' | 'PENDING' | 'REJECTED' | 'CANCELLED' | 'MORE_INFO_REQUIRED';
  managerStatus?: 'Pending' | 'Approved' | 'Rejected';
  hrStatus?: 'Pending' | 'Approved' | 'Rejected';
  note?: string;
  handoverNote?: string;
  emergencyContact?: string;
  createdAt: string;
}

export interface AttendanceLog {
  id: string;
  employeeId: string;
  date: string;
  attendanceCode: 'P' | 'HD' | 'A' | 'PL' | 'UL' | 'WO' | 'WO-I' | 'H' | 'MP' | 'SW';
  checkIn?: string;
  checkOut?: string;
  workedMinutes: number;
  requiredMinutes: number;
  shortMinutes: number;
  extraMinutes: number;
  sundayWorkedMinutes: number;
  isManual?: boolean;
  correctionReason?: string;
  location?: string;
  createdAt?: string;
}

export interface CompanySettings {
  companyName: string;
  companyLogoUrl: string;
  shiftStartTime: string;
  lunchBreakMinutes: number;
  halfDayThresholdMinutes: number;
  loginUrl: string;
  employeePortalUrl: string;
  managerPortalUrl: string;
}

export interface LeaveSummary {
  employeeId: string;
  employeeName: string;
  avatarUrl?: string;
  department: string;
  status: string;
  casualUsed: number;
  plannedUsed: number;
  totalUsed: number;
  remaining: number;
  totalAllowance: number;
  utilizationPercentage: number;
  extraDeduct: number;
  monthDeductionText?: string;
}

export interface PayrollPreview {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  month: number;
  year: number;
  monthlySalary: number;
  requiredHours: number;
  creditedHours: number;
  shortHours: number;
  hourlyRate: number;
  estimatedDeduction: number;
  missingPunches: number;
  status: 'Ready for Payroll' | 'Needs Attendance Review' | 'Finalized';
  hrComment?: string;
}

export interface Holiday {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  isOptional: boolean;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  action: string;
  objectType: string;
  objectId: string;
  oldValue?: string;
  newValue?: string;
  ipAddress?: string;
  timestamp: string;
}

export interface AttendanceImport {
  id: string;
  filename: string;
  uploadedBy: string;
  uploadDate: string;
  totalEmployees: number;
  totalRows: number;
  importedRows: number;
  missingPunches: number;
  status: 'Completed' | 'Pending' | 'Error';
}

export interface NotificationItem {
  id: string;
  employeeId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export function mergeLeavesNonRegressive(primaryList: LeaveRecord[], secondaryList: LeaveRecord[]): LeaveRecord[] {
  if (!Array.isArray(primaryList)) primaryList = [];
  if (!Array.isArray(secondaryList)) secondaryList = [];

  const map = new Map<string, LeaveRecord>();

  const getCleanKey = (l: LeaveRecord): string => {
    if (!l) return '';
    if (l.id) return String(l.id).replace(/[^0-9a-zA-Z_-]/g, '').toLowerCase();
    return `${String(l.employeeId).toLowerCase()}_${l.startDate}_${l.leaveType}`.toLowerCase();
  };

  const processRecord = (record: LeaveRecord) => {
    if (!record) return;
    const key = getCleanKey(record);
    if (!key) return;

    const existing = map.get(key);
    if (!existing) {
      map.set(key, { ...record });
    } else {
      const bestManagerStatus =
        existing.managerStatus === 'Approved' || record.managerStatus === 'Approved'
          ? 'Approved'
          : existing.managerStatus === 'Rejected' || record.managerStatus === 'Rejected'
          ? 'Rejected'
          : record.managerStatus || existing.managerStatus || 'Pending';

      const bestHrStatus =
        existing.hrStatus === 'Approved' || record.hrStatus === 'Approved'
          ? 'Approved'
          : existing.hrStatus === 'Rejected' || record.hrStatus === 'Rejected'
          ? 'Rejected'
          : record.hrStatus || existing.hrStatus || 'Pending';

      const bestStatus =
        (bestManagerStatus === 'Approved' && bestHrStatus === 'Approved') ||
        existing.status === 'APPROVED' ||
        record.status === 'APPROVED'
          ? 'APPROVED'
          : existing.status === 'REJECTED' || record.status === 'REJECTED'
          ? 'REJECTED'
          : record.status || existing.status || 'PENDING';

      map.set(key, {
        ...existing,
        ...record,
        managerStatus: bestManagerStatus,
        hrStatus: bestHrStatus,
        status: bestStatus,
      });
    }
  };

  primaryList.forEach(processRecord);
  secondaryList.forEach(processRecord);

  return Array.from(map.values());
}
