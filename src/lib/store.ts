import {
  Employee,
  LeaveRecord,
  AttendanceLog,
  CompanySettings,
  LeaveSummary,
  PayrollPreview,
  Holiday,
  AuditLogEntry,
  AttendanceImport,
  NotificationItem,
} from './types';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

interface InitialState {
  employees: Employee[];
  leaveRecords: LeaveRecord[];
  attendanceLogs: AttendanceLog[];
  settings: CompanySettings;
  payrollPreviews: PayrollPreview[];
  holidays: Holiday[];
  auditLogs: AuditLogEntry[];
  attendanceImports: AttendanceImport[];
  notifications: NotificationItem[];
  departments?: any[];
}

const DEFAULT_EMPLOYEES: Employee[] = [
  {
    id: 'emp-1',
    employeeId: 'HB001',
    name: 'Harshit Bhootra',
    email: 'harshit@hrmpilot.com',
    phone: '+91 98765 43210',
    department: 'Engineering',
    designation: 'Senior Lead Engineer',
    dateOfJoining: '2024-01-15',
    role: 'ADMIN',
    status: 'ACTIVE',
    monthlySalary: 120000,
    dailyWorkingRequirementMinutes: 480,
    weeklyOff: 'Sunday',
    casualAllowance: 6,
    plannedAllowance: 6,
    sickAllowance: 6,
  },
  {
    id: 'emp-2',
    employeeId: 'AS002',
    name: 'Ananya Sharma',
    email: 'ananya@hrmpilot.com',
    phone: '+91 98765 43211',
    department: 'Human Resources',
    designation: 'HR Manager',
    dateOfJoining: '2024-03-01',
    role: 'MANAGER',
    status: 'ACTIVE',
    monthlySalary: 95000,
    dailyWorkingRequirementMinutes: 480,
    weeklyOff: 'Sunday',
    casualAllowance: 6,
    plannedAllowance: 6,
    sickAllowance: 6,
  },
  {
    id: 'emp-3',
    employeeId: 'RK003',
    name: 'Rajesh Kumar',
    email: 'rajesh@hrmpilot.com',
    phone: '+91 98765 43212',
    department: 'Sales',
    designation: 'Senior Sales Executive',
    dateOfJoining: '2024-05-10',
    role: 'EMPLOYEE',
    status: 'ACTIVE',
    monthlySalary: 75000,
    dailyWorkingRequirementMinutes: 480,
    weeklyOff: 'Sunday',
    casualAllowance: 6,
    plannedAllowance: 6,
    sickAllowance: 6,
  },
  {
    id: 'emp-4',
    employeeId: 'PP004',
    name: 'Priya Patel',
    email: 'priya@hrmpilot.com',
    phone: '+91 98765 43213',
    department: 'Engineering',
    designation: 'Frontend Developer',
    dateOfJoining: '2024-06-20',
    role: 'EMPLOYEE',
    status: 'ACTIVE',
    monthlySalary: 85000,
    dailyWorkingRequirementMinutes: 480,
    weeklyOff: 'Sunday',
    casualAllowance: 6,
    plannedAllowance: 6,
    sickAllowance: 6,
  },
  {
    id: 'emp-5',
    employeeId: 'VS005',
    name: 'Vikram Singh',
    email: 'vikram@hrmpilot.com',
    phone: '+91 98765 43214',
    department: 'Marketing',
    designation: 'Marketing Specialist',
    dateOfJoining: '2024-07-01',
    role: 'EMPLOYEE',
    status: 'ACTIVE',
    monthlySalary: 65000,
    dailyWorkingRequirementMinutes: 480,
    weeklyOff: 'Sunday',
    casualAllowance: 6,
    plannedAllowance: 6,
    sickAllowance: 6,
  },
];

const DEFAULT_SETTINGS: CompanySettings = {
  companyName: 'HRM Pilot',
  companyLogoUrl: '',
  shiftStartTime: '09:00',
  lunchBreakMinutes: 60,
  halfDayThresholdMinutes: 240,
  loginUrl: '/login',
  employeePortalUrl: '/employee',
  managerPortalUrl: '/manager',
};

const DEFAULT_LEAVES: LeaveRecord[] = [
  {
    id: 'l-1',
    employeeId: 'emp-3',
    leaveType: 'Casual Leave',
    startDate: '2026-07-10',
    endDate: '2026-07-11',
    dayType: 'full',
    daysCount: 2,
    quarter: 'Q3',
    year: 2026,
    status: 'APPROVED',
    note: 'Family emergency',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'l-2',
    employeeId: 'emp-4',
    leaveType: 'Planned Leave',
    startDate: '2026-07-15',
    endDate: '2026-07-18',
    dayType: 'full',
    daysCount: 4,
    quarter: 'Q3',
    year: 2026,
    status: 'APPROVED',
    note: 'Vacation trip',
    createdAt: new Date().toISOString(),
  },
];

const DEFAULT_ATTENDANCE: AttendanceLog[] = [
  {
    id: 'att-1',
    employeeId: 'emp-1',
    date: '2026-07-30',
    attendanceCode: 'P',
    checkIn: '09:00:00',
    checkOut: '18:00:00',
    workedMinutes: 480,
    requiredMinutes: 480,
    shortMinutes: 0,
    extraMinutes: 0,
    sundayWorkedMinutes: 0,
    isManual: false,
  },
  {
    id: 'att-2',
    employeeId: 'emp-2',
    date: '2026-07-30',
    attendanceCode: 'P',
    checkIn: '09:10:00',
    checkOut: '18:00:00',
    workedMinutes: 470,
    requiredMinutes: 480,
    shortMinutes: 10,
    extraMinutes: 0,
    sundayWorkedMinutes: 0,
    isManual: false,
  },
  {
    id: 'att-3',
    employeeId: 'emp-3',
    date: '2026-07-30',
    attendanceCode: 'MP',
    checkIn: '09:30:00',
    checkOut: undefined,
    workedMinutes: 0,
    requiredMinutes: 480,
    shortMinutes: 480,
    extraMinutes: 0,
    sundayWorkedMinutes: 0,
    isManual: false,
  },
];

const DEFAULT_HOLIDAYS: Holiday[] = [
  { id: 'h-1', name: 'Independence Day', date: '2026-08-15', isOptional: false },
  { id: 'h-2', name: 'Mahatma Gandhi Jayanti', date: '2026-10-02', isOptional: false },
  { id: 'h-3', name: 'Diwali Festival', date: '2026-11-08', isOptional: false },
];

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    employeeId: 'emp-1',
    type: 'leave_submitted',
    title: 'New Leave Request Received',
    message: 'Rajesh Kumar has requested Casual Leave from 2026-07-10 to 2026-07-11.',
    isRead: false,
    createdAt: new Date().toISOString(),
  },
];

const DEFAULT_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'aud-1',
    userId: 'emp-1',
    userName: 'Harshit Bhootra',
    action: 'System Initialized',
    objectType: 'System',
    objectId: 'sys-0',
    timestamp: new Date().toISOString(),
  },
];

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function getDbData(): InitialState {
  ensureDataDir();
  if (!fs.existsSync(DB_FILE)) {
    const initial: InitialState = {
      employees: DEFAULT_EMPLOYEES,
      leaveRecords: DEFAULT_LEAVES,
      attendanceLogs: DEFAULT_ATTENDANCE,
      settings: DEFAULT_SETTINGS,
      payrollPreviews: [],
      holidays: DEFAULT_HOLIDAYS,
      auditLogs: DEFAULT_AUDIT_LOGS,
      attendanceImports: [],
      notifications: DEFAULT_NOTIFICATIONS,
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const data = JSON.parse(raw);
    return {
      employees: data.employees || DEFAULT_EMPLOYEES,
      leaveRecords: data.leaveRecords || DEFAULT_LEAVES,
      attendanceLogs: data.attendanceLogs || DEFAULT_ATTENDANCE,
      settings: data.settings || DEFAULT_SETTINGS,
      payrollPreviews: data.payrollPreviews || [],
      holidays: data.holidays || DEFAULT_HOLIDAYS,
      auditLogs: data.auditLogs || DEFAULT_AUDIT_LOGS,
      attendanceImports: data.attendanceImports || [],
      notifications: data.notifications || DEFAULT_NOTIFICATIONS,
      departments: data.departments || [],
    };
  } catch {
    return {
      employees: DEFAULT_EMPLOYEES,
      leaveRecords: DEFAULT_LEAVES,
      attendanceLogs: DEFAULT_ATTENDANCE,
      settings: DEFAULT_SETTINGS,
      payrollPreviews: [],
      holidays: DEFAULT_HOLIDAYS,
      auditLogs: DEFAULT_AUDIT_LOGS,
      attendanceImports: [],
      notifications: DEFAULT_NOTIFICATIONS,
    };
  }
}

export function saveDbData(data: InitialState): void {
  ensureDataDir();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

export function addNotification(employeeId: string, type: string, title: string, message: string) {
  const db = getDbData();
  const notif: NotificationItem = {
    id: `notif-${Date.now()}`,
    employeeId,
    type,
    title,
    message,
    isRead: false,
    createdAt: new Date().toISOString(),
  };
  if (!db.notifications) db.notifications = [];
  db.notifications.unshift(notif);
  saveDbData(db);
}

export function logAudit(action: string, objectType: string, objectId: string, oldValue?: string, newValue?: string) {
  const db = getDbData();
  const entry: AuditLogEntry = {
    id: `aud-${Date.now()}`,
    userId: 'emp-1',
    userName: 'Harshit Bhootra',
    action,
    objectType,
    objectId,
    oldValue,
    newValue,
    timestamp: new Date().toISOString(),
  };
  db.auditLogs.unshift(entry);
  saveDbData(db);
}

export function getQuarterlyLeaveSummaries(quarter: string = 'Q3', departmentFilter: string = 'ALL'): LeaveSummary[] {
  const db = getDbData();
  let employees = db.employees;

  if (departmentFilter && departmentFilter !== 'ALL') {
    employees = employees.filter(e => e.department === departmentFilter);
  }

  return employees.map(emp => {
    const empLeaves = db.leaveRecords.filter(
      l => l.employeeId === emp.id && l.quarter === quarter && l.status === 'APPROVED'
    );

    const casualUsed = empLeaves
      .filter(l => l.leaveType === 'Casual Leave')
      .reduce((sum, l) => sum + (l.dayType === 'first_half' || l.dayType === 'second_half' ? 0.5 : l.daysCount), 0);

    const plannedUsed = empLeaves
      .filter(l => l.leaveType === 'Planned Leave' || l.leaveType === 'Sick Leave')
      .reduce((sum, l) => sum + (l.dayType === 'first_half' || l.dayType === 'second_half' ? 0.5 : l.daysCount), 0);

    const totalUsed = casualUsed + plannedUsed;
    const totalAllowance = emp.casualAllowance + emp.plannedAllowance;
    const remaining = Math.max(0, totalAllowance - totalUsed);
    const extraDeduct = Math.max(0, totalUsed - totalAllowance);
    const utilizationPercentage = Math.min(100, Math.round((totalUsed / totalAllowance) * 100));

    return {
      employeeId: emp.id,
      employeeName: emp.name,
      avatarUrl: emp.avatarUrl,
      department: emp.department,
      status: emp.status,
      casualUsed,
      plannedUsed,
      totalUsed,
      remaining,
      totalAllowance,
      utilizationPercentage,
      extraDeduct,
    };
  });
}
