import { NextResponse } from 'next/server';
import { getDbData, saveDbData, logAudit } from '@/lib/store';
import { AttendanceLog, AttendanceImport } from '@/lib/types';
import { parseBiometricPunches } from '@/lib/biometricParser';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  const month = searchParams.get('month');
  const year = searchParams.get('year') || '2026';
  const monthYear = searchParams.get('monthYear');
  const department = searchParams.get('department') || 'ALL';

  const db = getDbData();
  let logs = db.attendanceLogs;
  let employees = db.employees;

  if (department !== 'ALL') {
    employees = employees.filter(e => e.department === department);
    const deptEmpIds = employees.map(e => e.id);
    logs = logs.filter(l => deptEmpIds.includes(l.employeeId));
  }

  if (date) {
    logs = logs.filter(l => l.date === date);
  } else if (monthYear) {
    logs = logs.filter(l => l.date.startsWith(monthYear));
  } else if (month) {
    const padMonth = String(month).padStart(2, '0');
    const targetPrefix = `${year}-${padMonth}`;
    logs = logs.filter(l => l.date.startsWith(targetPrefix));
  }

  const enrichedLogs = logs.map(l => {
    const emp = db.employees.find(e => e.id === l.employeeId);
    return {
      ...l,
      employeeName: emp ? emp.name : 'Unknown',
      department: emp ? emp.department : 'General',
    };
  });

  return NextResponse.json({
    logs: enrichedLogs,
    employees,
    imports: db.attendanceImports,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = getDbData();

    // 1. Monthly Punches Upload
    if (body.action === 'IMPORT' || body.action === 'IMPORT_MONTHLY_PUNCHES') {
      const rawRows = body.rows || [];
      const monthYear = body.monthYear || '2026-07';

      const parsedLogs = parseBiometricPunches(rawRows, db.employees, monthYear);

      if (parsedLogs.length > 0) {
        parsedLogs.forEach(newLog => {
          const existingIdx = db.attendanceLogs.findIndex(l => l.employeeId === newLog.employeeId && l.date === newLog.date);
          if (existingIdx !== -1) {
            db.attendanceLogs[existingIdx] = newLog;
          } else {
            db.attendanceLogs.push(newLog);
          }
        });
      }

      const uniqueEmps = new Set(parsedLogs.map(l => l.employeeId)).size;

      const newImport: AttendanceImport = {
        id: `imp-${Date.now()}`,
        filename: body.filename || 'monthly_punches.xls',
        uploadedBy: 'Ravina Khimani',
        uploadDate: new Date().toISOString(),
        totalEmployees: uniqueEmps || db.employees.length,
        totalRows: parsedLogs.length || rawRows.length,
        importedRows: parsedLogs.length || rawRows.length,
        missingPunches: parsedLogs.filter(l => l.attendanceCode === 'MP').length,
        status: 'Completed',
      };

      db.attendanceImports.unshift(newImport);
      logAudit('Import Biometric Monthly Punches', 'AttendanceImport', newImport.id, undefined, newImport.filename);
      saveDbData(db);

      return NextResponse.json({ success: true, import: newImport, logs: db.attendanceLogs, totalLogsParsed: parsedLogs.length });
    }

    // 2. Completed Hours Import
    if (body.action === 'IMPORT_COMPLETED_HOURS') {
      const rows = body.rows || [];

      if (Array.isArray(rows) && rows.length > 0) {
        rows.forEach((row: any) => {
          const empId = row.employeeId || row.EmployeeID || 'emp-1';
          const totalHours = Number(row.completedHours || row.TotalHours || row.hours) || 176;

          // Update worked minutes on employee's attendance logs
          db.attendanceLogs.forEach((log) => {
            if (log.employeeId === empId) {
              log.workedMinutes = Math.round((totalHours * 60) / 22);
            }
          });
        });
      }

      const newImport: AttendanceImport = {
        id: `imp-hrs-${Date.now()}`,
        filename: body.filename || 'completed_hours.csv',
        uploadedBy: 'Harshit Bhootra',
        uploadDate: new Date().toISOString(),
        totalEmployees: db.employees.length || 5,
        totalRows: rows.length || 5,
        importedRows: rows.length || 5,
        missingPunches: 0,
        status: 'Completed',
      };

      db.attendanceImports.unshift(newImport);
      logAudit('Import Completed Hours Spreadsheet', 'AttendanceImport', newImport.id, undefined, newImport.filename);
      saveDbData(db);

      return NextResponse.json({ success: true, import: newImport, logs: db.attendanceLogs });
    }

    if (body.action === 'MANUAL_EDIT') {
      const { id, employeeId, date, attendanceCode, checkIn, checkOut, correctionReason } = body;
      
      let index = db.attendanceLogs.findIndex(l => l.id === id);
      if (index === -1 && employeeId && date) {
        index = db.attendanceLogs.findIndex(l => l.employeeId === employeeId && l.date === date);
      }

      let workedMinutes = 0;
      if (attendanceCode === 'P' || attendanceCode === 'MP') {
        workedMinutes = 480;
        try {
          if (checkIn && checkOut && checkIn.includes(':') && checkOut.includes(':')) {
            const [inH, inM] = checkIn.split(':').map(Number);
            const [outH, outM] = checkOut.split(':').map(Number);
            if (!isNaN(inH) && !isNaN(outH)) {
              workedMinutes = Math.max(0, (outH * 60 + outM) - (inH * 60 + inM));
            }
          }
        } catch (e) {}
      } else if (attendanceCode === 'HD') {
        workedMinutes = 240;
      }

      const shortMinutes = Math.max(0, 480 - workedMinutes);
      const extraMinutes = Math.max(0, workedMinutes - 480);

      if (index !== -1) {
        const oldVal = JSON.stringify(db.attendanceLogs[index]);
        db.attendanceLogs[index].attendanceCode = attendanceCode;
        db.attendanceLogs[index].checkIn = checkIn;
        db.attendanceLogs[index].checkOut = checkOut;
        db.attendanceLogs[index].workedMinutes = workedMinutes;
        db.attendanceLogs[index].shortMinutes = shortMinutes;
        db.attendanceLogs[index].extraMinutes = extraMinutes;
        db.attendanceLogs[index].isManual = true;
        db.attendanceLogs[index].correctionReason = correctionReason;

        logAudit('Manual Attendance Correction', 'AttendanceLog', db.attendanceLogs[index].id, oldVal, JSON.stringify(db.attendanceLogs[index]));
        saveDbData(db);

        return NextResponse.json({ success: true, log: db.attendanceLogs[index] });
      } else if (employeeId && date) {
        const newLog: AttendanceLog = {
          id: id || `att-${employeeId}-${date}`,
          employeeId,
          date,
          attendanceCode,
          checkIn,
          checkOut,
          workedMinutes,
          requiredMinutes: 480,
          shortMinutes,
          extraMinutes,
          sundayWorkedMinutes: 0,
          isManual: true,
          correctionReason,
        };

        db.attendanceLogs.push(newLog);
        logAudit('Manual Attendance Entry', 'AttendanceLog', newLog.id, undefined, JSON.stringify(newLog));
        saveDbData(db);

        return NextResponse.json({ success: true, log: newLog });
      }

      return NextResponse.json({ error: 'Log entry or target employee date details not found' }, { status: 400 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error processing attendance' }, { status: 500 });
  }
}
