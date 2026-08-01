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
  status: 'APPROVED' | 'PENDING' | 'REJECTED' | 'CANCELLED';
  note?: string;
  handoverNote?: string;
  emergencyContact?: string;
  createdAt: string;
}

export interface AttendanceLog {
  id: string;
  employeeId: string;
  date: string;
  attendanceCode: 'P' | 'HD' | 'A' | 'PL' | 'UL' | 'WO-I' | 'H' | 'MP' | 'SW';
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
