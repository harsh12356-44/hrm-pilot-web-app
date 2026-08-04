import { NextResponse } from 'next/server';
import { getDbData } from '@/lib/store';
import * as XLSX from 'xlsx';

const MONTHS = [
  { value: '1', name: 'January' },
  { value: '2', name: 'February' },
  { value: '3', name: 'March' },
  { value: '4', name: 'April' },
  { value: '5', name: 'May' },
  { value: '6', name: 'June' },
  { value: '7', name: 'July' },
  { value: '8', name: 'August' },
  { value: '9', name: 'September' },
  { value: '10', name: 'October' },
  { value: '11', name: 'November' },
  { value: '12', name: 'December' },
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month') || '7';
    const year = searchParams.get('year') || '2026';
    const departmentFilter = searchParams.get('department') || 'ALL';

    const db = getDbData();
    let employees = db.employees || [];
    if (departmentFilter !== 'ALL') {
      employees = employees.filter(e => e.department === departmentFilter);
    }

    const monthStr = `${year}-${String(month).padStart(2, '0')}`;
    const logs = (db.attendanceLogs || []).filter(l => l.date && l.date.startsWith(monthStr));

    const totalDaysInMonth = new Date(Number(year), Number(month), 0).getDate();
    const daysArray = Array.from({ length: totalDaysInMonth }, (_, i) => i + 1);

    // Sheet 1: Monthly Matrix Grid
    const matrixRows: any[] = [];
    employees.forEach(emp => {
      const empLogs = logs.filter(l => l.employeeId === emp.id);
      const row: any = {
        'Emp Code': emp.employeeId || emp.id,
        'Employee Name': emp.name,
        'Department': emp.department,
        'Designation': emp.designation,
      };

      let totalWorkedMins = 0;
      let totalShortMins = 0;
      let totalExtraMins = 0;

      daysArray.forEach(dayNum => {
        const padDay = String(dayNum).padStart(2, '0');
        const dateStr = `${monthStr}-${padDay}`;
        const log = empLogs.find(l => l.date === dateStr);

        const dateObj = new Date(dateStr);
        const isSunday = dateObj.getDay() === 0;

        if ((log && (log.attendanceCode === 'WO-I' || log.attendanceCode === 'WO')) || (isSunday && (!log || log.attendanceCode === 'WO-I' || log.attendanceCode === 'WO'))) {
          row[dayNum] = 'WO';
        } else if (log) {
          if (log.attendanceCode === 'A') {
            row[dayNum] = 'A';
          } else if (log.attendanceCode === 'HD') {
            row[dayNum] = 'HD (4h)';
            totalWorkedMins += 240;
          } else if (log.workedMinutes > 0) {
            const h = Math.floor(log.workedMinutes / 60);
            const m = log.workedMinutes % 60;
            row[dayNum] = m > 0 ? `${h}h ${m}m` : `${h}h`;
            totalWorkedMins += log.workedMinutes;
            totalShortMins += log.shortMinutes || 0;
            totalExtraMins += log.extraMinutes || 0;
          } else {
            row[dayNum] = log.attendanceCode || '-';
          }
        } else {
          row[dayNum] = '-';
        }
      });

      row['Total Worked Hours'] = `${(totalWorkedMins / 60).toFixed(1)} hrs`;
      row['Total Short Hours'] = `${(totalShortMins / 60).toFixed(1)} hrs`;
      row['Overtime Extra Hours'] = `${(totalExtraMins / 60).toFixed(1)} hrs`;

      matrixRows.push(row);
    });

    // Sheet 2: Daily Punch Logs
    const detailedLogs = logs.map(l => {
      const emp = db.employees.find(e => e.id === l.employeeId);
      return {
        'Emp ID': emp?.employeeId || l.employeeId,
        'Employee Name': emp?.name || 'Unknown',
        'Department': emp?.department || 'General',
        'Date': l.date,
        'Check In': l.checkIn || '--:--',
        'Check Out': l.checkOut || '--:--',
        'Worked Minutes': l.workedMinutes || 0,
        'Worked Hours': (l.workedMinutes / 60).toFixed(2),
        'Short Minutes': l.shortMinutes || 0,
        'Overtime Minutes': l.extraMinutes || 0,
        'Status Code': l.attendanceCode || 'P',
      };
    });

    const wb = XLSX.utils.book_new();

    const wsMatrix = XLSX.utils.json_to_sheet(matrixRows);
    XLSX.utils.book_append_sheet(wb, wsMatrix, 'Monthly Matrix Grid');

    const wsDetails = XLSX.utils.json_to_sheet(detailedLogs);
    XLSX.utils.book_append_sheet(wb, wsDetails, 'Daily Punch Logs');

    const monthName = MONTHS.find(m => m.value === month)?.name || month;
    const filename = `HRM_Pilot_Attendance_${monthName}_${year}.xlsx`;

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });

    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err: any) {
    console.error('Export Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
