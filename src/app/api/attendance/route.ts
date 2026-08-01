import { NextResponse } from 'next/server';
import { getDbData, saveDbData, logAudit } from '@/lib/store';
import { AttendanceLog, AttendanceImport } from '@/lib/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  const department = searchParams.get('department') || 'ALL';

  const db = getDbData();
  let logs = db.attendanceLogs;

  if (date) {
    logs = logs.filter(l => l.date === date);
  }

  if (department !== 'ALL') {
    const deptEmpIds = db.employees.filter(e => e.department === department).map(e => e.id);
    logs = logs.filter(l => deptEmpIds.includes(l.employeeId));
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
    imports: db.attendanceImports,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = getDbData();

    if (body.action === 'IMPORT') {
      // Record biometric attendance import batch
      const newImport: AttendanceImport = {
        id: `imp-${Date.now()}`,
        filename: body.filename || 'biometric_punches.csv',
        uploadedBy: 'Harshit Bhootra',
        uploadDate: new Date().toISOString(),
        totalEmployees: body.totalEmployees || 5,
        totalRows: body.totalRows || 10,
        importedRows: body.importedRows || 10,
        missingPunches: body.missingPunches || 1,
        status: 'Completed',
      };

      db.attendanceImports.unshift(newImport);
      logAudit('Import Attendance CSV', 'AttendanceImport', newImport.id, undefined, newImport.filename);
      saveDbData(db);

      return NextResponse.json({ success: true, import: newImport });
    }

    if (body.action === 'MANUAL_EDIT') {
      // Manual attendance correction
      const { id, attendanceCode, checkIn, checkOut, correctionReason } = body;
      const index = db.attendanceLogs.findIndex(l => l.id === id);
      if (index !== -1) {
        const oldVal = JSON.stringify(db.attendanceLogs[index]);
        db.attendanceLogs[index].attendanceCode = attendanceCode;
        db.attendanceLogs[index].checkIn = checkIn;
        db.attendanceLogs[index].checkOut = checkOut;
        db.attendanceLogs[index].isManual = true;
        db.attendanceLogs[index].correctionReason = correctionReason;

        logAudit('Manual Attendance Correction', 'AttendanceLog', id, oldVal, JSON.stringify(db.attendanceLogs[index]));
        saveDbData(db);

        return NextResponse.json({ success: true, log: db.attendanceLogs[index] });
      }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error processing attendance' }, { status: 500 });
  }
}
