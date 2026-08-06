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
    employeeId: 'RK001',
    name: 'Ravina Khimani',
    email: 'ravina@hrmpilot.com',
    password: 'Admin@123',
    phone: '+91 98765 00001',
    department: 'Human Resources',
    designation: 'HR / COO',
    dateOfJoining: '2024-01-01',
    role: 'ADMIN',
    status: 'ACTIVE',
    monthlySalary: 0,
    dailyWorkingRequirementMinutes: 480,
    weeklyOff: 'Sunday',
    casualAllowance: 2,
    plannedAllowance: 4,
    sickAllowance: 4,
  },
  {
    id: 'emp-2',
    employeeId: 'NB002',
    name: 'Naman Bangia',
    email: 'naman@hrmpilot.com',
    password: 'Manager@123',
    phone: '+91 98765 00002',
    department: 'Development',
    designation: 'Senior Development Manager',
    dateOfJoining: '2024-01-15',
    role: 'MANAGER',
    status: 'ACTIVE',
    primaryManager: 'Ravina Khimani',
    monthlySalary: 0,
    dailyWorkingRequirementMinutes: 480,
    weeklyOff: 'Sunday',
    casualAllowance: 2,
    plannedAllowance: 4,
    sickAllowance: 4,
  },
  {
    id: 'emp-3',
    employeeId: 'JS003',
    name: 'Jigyasa Sen',
    email: 'jigyasa@hrmpilot.com',
    password: 'Manager@123',
    phone: '+91 98765 00003',
    department: 'Development',
    designation: 'Senior Development Manager',
    dateOfJoining: '2024-02-01',
    role: 'MANAGER',
    status: 'ACTIVE',
    primaryManager: 'Ravina Khimani',
    monthlySalary: 0,
    dailyWorkingRequirementMinutes: 480,
    weeklyOff: 'Sunday',
    casualAllowance: 2,
    plannedAllowance: 4,
    sickAllowance: 4,
  },
  {
    id: 'emp-4',
    employeeId: 'DV004',
    name: 'Divyanshu',
    email: 'divyanshu@hrmpilot.com',
    password: 'Manager@123',
    phone: '+91 98765 00004',
    department: 'Development',
    designation: 'Senior Development Manager',
    dateOfJoining: '2024-02-15',
    role: 'MANAGER',
    status: 'ACTIVE',
    primaryManager: 'Ravina Khimani',
    monthlySalary: 0,
    dailyWorkingRequirementMinutes: 480,
    weeklyOff: 'Sunday',
    casualAllowance: 2,
    plannedAllowance: 4,
    sickAllowance: 4,
  },
  {
    id: 'emp-5',
    employeeId: 'MN005',
    name: 'Meenal',
    email: 'meenal@hrmpilot.com',
    password: 'Manager@123',
    phone: '+91 98765 00005',
    department: 'SEO',
    designation: 'SEO Manager',
    dateOfJoining: '2024-03-01',
    role: 'MANAGER',
    status: 'ACTIVE',
    primaryManager: 'Ravina Khimani',
    monthlySalary: 0,
    dailyWorkingRequirementMinutes: 480,
    weeklyOff: 'Sunday',
    casualAllowance: 2,
    plannedAllowance: 4,
    sickAllowance: 4,
  },
  {
    id: 'emp-6',
    employeeId: 'NG006',
    name: 'Nandini Gupta',
    email: 'nandini@hrmpilot.com',
    password: 'Employee@123',
    phone: '+91 98765 00006',
    department: 'Founders Office',
    designation: 'Founders Office',
    dateOfJoining: '2024-03-15',
    role: 'EMPLOYEE',
    status: 'ACTIVE',
    primaryManager: 'Ravina Khimani',
    monthlySalary: 0,
    dailyWorkingRequirementMinutes: 480,
    weeklyOff: 'Sunday',
    casualAllowance: 2,
    plannedAllowance: 4,
    sickAllowance: 4,
  },
  {
    id: 'emp-7',
    employeeId: 'AS007',
    name: 'Anup Sen',
    email: 'anup@hrmpilot.com',
    password: 'Employee@123',
    phone: '+91 98765 00007',
    department: 'Development',
    designation: 'Web Designer',
    dateOfJoining: '2024-04-01',
    role: 'EMPLOYEE',
    status: 'ACTIVE',
    primaryManager: 'Naman Bangia',
    secondaryManager: 'Ravina Khimani',
    monthlySalary: 0,
    dailyWorkingRequirementMinutes: 480,
    weeklyOff: 'Sunday',
    casualAllowance: 2,
    plannedAllowance: 4,
    sickAllowance: 4,
  },
  {
    id: 'emp-8',
    employeeId: 'LG008',
    name: 'Lochita g1',
    email: 'lochita@hrmpilot.com',
    password: 'Employee@123',
    phone: '+91 98765 00008',
    department: 'Development',
    designation: 'Web Designer',
    dateOfJoining: '2024-04-10',
    role: 'EMPLOYEE',
    status: 'ACTIVE',
    primaryManager: 'Naman Bangia',
    secondaryManager: 'Ravina Khimani',
    monthlySalary: 0,
    dailyWorkingRequirementMinutes: 480,
    weeklyOff: 'Sunday',
    casualAllowance: 2,
    plannedAllowance: 4,
    sickAllowance: 4,
  },
  {
    id: 'emp-9',
    employeeId: 'RV009',
    name: 'Rajvardhan',
    email: 'rajvardhan@hrmpilot.com',
    password: 'Employee@123',
    phone: '+91 98765 00009',
    department: 'Development',
    designation: 'Web Designer',
    dateOfJoining: '2024-04-15',
    role: 'EMPLOYEE',
    status: 'ACTIVE',
    primaryManager: 'Naman Bangia',
    secondaryManager: 'Ravina Khimani',
    monthlySalary: 0,
    dailyWorkingRequirementMinutes: 480,
    weeklyOff: 'Sunday',
    casualAllowance: 2,
    plannedAllowance: 4,
    sickAllowance: 4,
  },
  {
    id: 'emp-10',
    employeeId: 'MD010',
    name: 'Mudita',
    email: 'mudita@hrmpilot.com',
    password: 'Employee@123',
    phone: '+91 98765 00010',
    department: 'Development',
    designation: 'Web Designer',
    dateOfJoining: '2024-05-01',
    role: 'EMPLOYEE',
    status: 'ACTIVE',
    primaryManager: 'Naman Bangia',
    secondaryManager: 'Ravina Khimani',
    monthlySalary: 0,
    dailyWorkingRequirementMinutes: 480,
    weeklyOff: 'Sunday',
    casualAllowance: 2,
    plannedAllowance: 4,
    sickAllowance: 4,
  },
  {
    id: 'emp-11',
    employeeId: 'BB011',
    name: 'Bulbul',
    email: 'bulbul@hrmpilot.com',
    password: 'Employee@123',
    phone: '+91 98765 00011',
    department: 'Development',
    designation: 'Web Designer',
    dateOfJoining: '2024-05-10',
    role: 'EMPLOYEE',
    status: 'ACTIVE',
    primaryManager: 'Naman Bangia',
    secondaryManager: 'Ravina Khimani',
    monthlySalary: 0,
    dailyWorkingRequirementMinutes: 480,
    weeklyOff: 'Sunday',
    casualAllowance: 2,
    plannedAllowance: 4,
    sickAllowance: 4,
  },
  {
    id: 'emp-12',
    employeeId: 'SG012',
    name: 'Sonu Goswami',
    email: 'sonu@hrmpilot.com',
    password: 'Employee@123',
    phone: '+91 98765 00012',
    department: 'Development',
    designation: 'Web Developer',
    dateOfJoining: '2024-05-15',
    role: 'EMPLOYEE',
    status: 'ACTIVE',
    primaryManager: 'Naman Bangia',
    secondaryManager: 'Ravina Khimani',
    monthlySalary: 0,
    dailyWorkingRequirementMinutes: 480,
    weeklyOff: 'Sunday',
    casualAllowance: 2,
    plannedAllowance: 4,
    sickAllowance: 4,
  },
  {
    id: 'emp-13',
    employeeId: 'SD013',
    name: 'Shweta dadhich',
    email: 'shweta@hrmpilot.com',
    password: 'Employee@123',
    phone: '+91 98765 00013',
    department: 'Development',
    designation: 'Web Designer',
    dateOfJoining: '2024-06-01',
    role: 'EMPLOYEE',
    status: 'ACTIVE',
    primaryManager: 'Jigyasa Sen',
    secondaryManager: 'Ravina Khimani',
    monthlySalary: 0,
    dailyWorkingRequirementMinutes: 480,
    weeklyOff: 'Sunday',
    casualAllowance: 2,
    plannedAllowance: 4,
    sickAllowance: 4,
  },
  {
    id: 'emp-14',
    employeeId: 'CB014',
    name: 'Charubhati',
    email: 'charubhati@hrmpilot.com',
    password: 'Employee@123',
    phone: '+91 98765 00014',
    department: 'SEO',
    designation: 'SEO Executive',
    dateOfJoining: '2024-06-10',
    role: 'EMPLOYEE',
    status: 'ACTIVE',
    primaryManager: 'Meenal',
    secondaryManager: 'Ravina Khimani',
    monthlySalary: 0,
    dailyWorkingRequirementMinutes: 480,
    weeklyOff: 'Sunday',
    casualAllowance: 2,
    plannedAllowance: 4,
    sickAllowance: 4,
  },
  {
    id: 'emp-15',
    employeeId: 'SY015',
    name: 'Shryanshu',
    email: 'shryanshu@hrmpilot.com',
    password: 'Employee@123',
    phone: '+91 98765 00015',
    department: 'General',
    designation: 'Final Suspect',
    dateOfJoining: '2024-07-01',
    role: 'EMPLOYEE',
    status: 'ACTIVE',
    primaryManager: 'Ravina Khimani',
    monthlySalary: 0,
    dailyWorkingRequirementMinutes: 480,
    weeklyOff: 'Sunday',
    casualAllowance: 2,
    plannedAllowance: 4,
    sickAllowance: 4,
  },
  {
    id: 'emp-16',
    employeeId: 'GV016',
    name: 'Garv',
    email: 'garv@hrmpilot.com',
    password: 'Employee@123',
    phone: '+91 98765 00016',
    department: 'General',
    designation: 'Final Suspect',
    dateOfJoining: '2024-07-05',
    role: 'EMPLOYEE',
    status: 'ACTIVE',
    primaryManager: 'Ravina Khimani',
    monthlySalary: 0,
    dailyWorkingRequirementMinutes: 480,
    weeklyOff: 'Sunday',
    casualAllowance: 2,
    plannedAllowance: 4,
    sickAllowance: 4,
  },
  {
    id: 'emp-17',
    employeeId: 'CS017',
    name: 'Charu Siddhawat',
    email: 'charu@hrmpilot.com',
    password: 'Employee@123',
    phone: '+91 98765 00017',
    department: 'General',
    designation: 'Final Suspect',
    dateOfJoining: '2024-07-10',
    role: 'EMPLOYEE',
    status: 'ACTIVE',
    primaryManager: 'Ravina Khimani',
    monthlySalary: 0,
    dailyWorkingRequirementMinutes: 480,
    weeklyOff: 'Sunday',
    casualAllowance: 2,
    plannedAllowance: 4,
    sickAllowance: 4,
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

const DEFAULT_LEAVES: LeaveRecord[] = [];

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
  { id: 'h-2026-01', name: 'New Year', date: '2026-01-01', isOptional: false },
  { id: 'h-2026-02', name: 'Republic Day', date: '2026-01-26', isOptional: false },
  { id: 'h-2026-03', name: 'Holi', date: '2026-03-04', isOptional: false },
  { id: 'h-2026-04', name: 'Independence Day', date: '2026-08-15', isOptional: false },
  { id: 'h-2026-05', name: 'Raksha Bandhan', date: '2026-08-28', isOptional: false },
  { id: 'h-2026-06', name: 'Diwali', date: '2026-11-08', isOptional: false },
  { id: 'h-2026-07', name: 'Diwali (Rama Shama)', date: '2026-11-09', isOptional: false },
  { id: 'h-2026-08', name: 'Christmas', date: '2026-12-25', isOptional: false },
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

let memoryDb: InitialState | null = (globalThis as any)._inMemoryDbData || null;

export function getDbData(): InitialState {
  if (memoryDb) {
    return memoryDb;
  }

  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const data = JSON.parse(raw);
      const employeesList = (data.employees || DEFAULT_EMPLOYEES).map((e: any) => ({
        ...e,
        casualAllowance: 2,
        plannedAllowance: 4,
        sickAllowance: 4,
      }));

      memoryDb = {
        employees: employeesList,
        leaveRecords: Array.isArray(data.leaveRecords) ? data.leaveRecords : [],
        attendanceLogs: data.attendanceLogs || DEFAULT_ATTENDANCE,
        settings: data.settings || DEFAULT_SETTINGS,
        payrollPreviews: data.payrollPreviews || [],
        holidays: data.holidays || DEFAULT_HOLIDAYS,
        auditLogs: data.auditLogs || DEFAULT_AUDIT_LOGS,
        attendanceImports: data.attendanceImports || [],
        notifications: data.notifications || DEFAULT_NOTIFICATIONS,
        departments: data.departments || [],
      };
      (globalThis as any)._inMemoryDbData = memoryDb;
      return memoryDb;
    }
  } catch (e) {
    console.warn('Error reading db.json, falling back to in-memory store');
  }

  memoryDb = {
    employees: DEFAULT_EMPLOYEES,
    leaveRecords: DEFAULT_LEAVES,
    attendanceLogs: DEFAULT_ATTENDANCE,
    settings: DEFAULT_SETTINGS,
    payrollPreviews: [],
    holidays: DEFAULT_HOLIDAYS,
    auditLogs: DEFAULT_AUDIT_LOGS,
    attendanceImports: [],
    notifications: DEFAULT_NOTIFICATIONS,
    departments: [],
  };
  (globalThis as any)._inMemoryDbData = memoryDb;
  return memoryDb;
}

export function saveDbData(data: InitialState): void {
  memoryDb = data;
  (globalThis as any)._inMemoryDbData = data;
  try {
    ensureDataDir();
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.warn('FileSystem write skipped (read-only environment), updated in-memory store.');
  }
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
      l => (l.employeeId === emp.id || l.employeeId === emp.employeeId) && l.quarter === quarter && l.status === 'APPROVED'
    );

    const casualUsed = empLeaves
      .filter(l => l.leaveType === 'Casual Leave')
      .reduce((sum, l) => sum + (l.dayType === 'first_half' || l.dayType === 'second_half' ? 0.5 : l.daysCount), 0);

    const plannedUsed = empLeaves
      .filter(l => l.leaveType === 'Planned Leave' || l.leaveType === 'Sick Leave')
      .reduce((sum, l) => sum + (l.dayType === 'first_half' || l.dayType === 'second_half' ? 0.5 : l.daysCount), 0);

    const totalUsed = casualUsed + plannedUsed;
    const casualAllowance = 2;
    const plannedAllowance = 4;
    const totalAllowance = casualAllowance + plannedAllowance; // 6 Days

    // Deduction / Unpaid LOP triggers ONLY when total leaves taken in a quarter exceed 6 days
    const extraDeduct = Math.max(0, totalUsed - totalAllowance);

    // Month-wise breakdown of extra leaves over 6 days
    let monthDeductionText = '';
    if (extraDeduct > 0) {
      const sortedLeaves = [...empLeaves].sort((a, b) => (a.startDate || '').localeCompare(b.startDate || ''));
      const monthMap: Record<string, number> = {};
      let cumulative = 0;

      sortedLeaves.forEach(l => {
        const count = l.dayType === 'first_half' || l.dayType === 'second_half' ? 0.5 : l.daysCount;
        const prev = cumulative;
        cumulative += count;

        if (cumulative > totalAllowance) {
          const extraInThis = prev >= totalAllowance ? count : (cumulative - totalAllowance);
          let monthName = 'July';
          try {
            const d = new Date(l.startDate || '2026-07-01');
            if (!isNaN(d.getTime())) {
              monthName = d.toLocaleString('en-US', { month: 'long' });
            }
          } catch (e) {}
          monthMap[monthName] = (monthMap[monthName] || 0) + extraInThis;
        }
      });

      const parts = Object.entries(monthMap).map(([m, count]) => `${m}: ${count} day(s)`);
      monthDeductionText = parts.join(', ');
    }

    const remaining = Math.max(0, totalAllowance - totalUsed);
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
      monthDeductionText,
    };
  });
}

export function getEmployeeAllQuarters(employeeId: string) {
  const db = getDbData();
  const cleanSearch = employeeId.trim().toLowerCase();
  const emp = db.employees.find(
    e => e.id.toLowerCase() === cleanSearch || 
         e.employeeId.toLowerCase() === cleanSearch || 
         e.name.toLowerCase() === cleanSearch ||
         e.name.toLowerCase().includes(cleanSearch)
  );
  if (!emp) return null;

  const quarters = ['Q1', 'Q2', 'Q3', 'Q4'] as const;
  const result: Record<string, { label: string; casual: number; planned: number; total: number; remaining: number; extra: number; monthText: string }> = {};

  quarters.forEach(q => {
    const qLeaves = db.leaveRecords.filter(
      l => (l.employeeId === emp.id || l.employeeId === emp.employeeId || l.employeeId === emp.name) && l.quarter === q && l.status === 'APPROVED'
    );
    const casual = qLeaves
      .filter(l => l.leaveType === 'Casual Leave')
      .reduce((sum, l) => sum + (l.dayType === 'first_half' || l.dayType === 'second_half' ? 0.5 : l.daysCount), 0);
    const planned = qLeaves
      .filter(l => l.leaveType === 'Planned Leave' || l.leaveType === 'Sick Leave')
      .reduce((sum, l) => sum + (l.dayType === 'first_half' || l.dayType === 'second_half' ? 0.5 : l.daysCount), 0);
    const total = casual + planned;
    const remaining = Math.max(0, 6 - total);
    const extra = Math.max(0, total - 6);

    let monthText = '';
    if (extra > 0) {
      const sorted = [...qLeaves].sort((a, b) => (a.startDate || '').localeCompare(b.startDate || ''));
      const monthMap: Record<string, number> = {};
      let cumulative = 0;

      sorted.forEach(l => {
        const count = l.dayType === 'first_half' || l.dayType === 'second_half' ? 0.5 : l.daysCount;
        const prev = cumulative;
        cumulative += count;

        if (cumulative > 6) {
          const extraInThis = prev >= 6 ? count : (cumulative - 6);
          let monthName = 'July';
          try {
            const d = new Date(l.startDate || '2026-07-01');
            if (!isNaN(d.getTime())) {
              monthName = d.toLocaleString('en-US', { month: 'long' });
            }
          } catch (e) {}
          monthMap[monthName] = (monthMap[monthName] || 0) + extraInThis;
        }
      });

      monthText = Object.entries(monthMap).map(([m, c]) => `${m}: ${c} day(s)`).join(', ');
    }

    const labels: Record<string, string> = { Q1: 'Jan–Mar', Q2: 'Apr–Jun', Q3: 'Jul–Sep', Q4: 'Oct–Dec' };
    result[q] = { label: labels[q], casual, planned, total, remaining, extra, monthText };
  });

  return { employeeName: emp.name, employeeId: emp.employeeId || emp.id, department: emp.department, quarters: result };
}

