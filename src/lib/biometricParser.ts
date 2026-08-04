import { Employee, AttendanceLog } from './types';

export function parseBiometricPunches(rawData: any[], employees: Employee[], monthYear: string = '2026-07'): AttendanceLog[] {
  if (!Array.isArray(rawData) || rawData.length === 0) return [];

  // Determine if rawData is 2D array matrix (like ONtime / Secureye / ESSL export) or array of objects
  const is2DMatrix = Array.isArray(rawData[0]);

  if (!is2DMatrix) {
    // Flat rows format (Object array)
    const logs: AttendanceLog[] = [];
    rawData.forEach((row: any, idx: number) => {
      const empIdInput = String(row.employeeId || row.EmployeeID || row.empId || row['Emp Code'] || row['Emp ID'] || '').trim();
      const empNameInput = String(row.employeeName || row.EmployeeName || row.name || row['Emp Name'] || '').trim();

      const matchedEmp = employees.find(e => {
        if (empIdInput && (e.id === empIdInput || e.employeeId === empIdInput)) return true;
        if (empNameInput && e.name.toLowerCase().includes(empNameInput.toLowerCase())) return true;
        return false;
      }) || employees[0];

      if (!matchedEmp) return;

      const date = row.date || row.Date || new Date().toISOString().split('T')[0];
      const checkIn = row.checkIn || row.CheckIn || '09:00';
      const checkOut = row.checkOut || row.CheckOut || '18:00';
      const attendanceCode = row.attendanceCode || row.Status || 'P';

      let workedMinutes = 480;
      try {
        if (checkIn && checkOut && checkIn.includes(':') && checkOut.includes(':')) {
          const [inH, inM] = checkIn.split(':').map(Number);
          const [outH, outM] = checkOut.split(':').map(Number);
          workedMinutes = Math.max(0, (outH * 60 + outM) - (inH * 60 + inM));
        }
      } catch (e) {}

      logs.push({
        id: `att-${matchedEmp.id}-${date}-${idx}`,
        employeeId: matchedEmp.id,
        date,
        checkIn,
        checkOut,
        workedMinutes,
        requiredMinutes: 480,
        shortMinutes: Math.max(0, 480 - workedMinutes),
        extraMinutes: Math.max(0, workedMinutes - 480),
        sundayWorkedMinutes: 0,
        attendanceCode,
        isManual: false,
      });
    });
    return logs;
  }

  // 2D Array Matrix Parsing (ONtime, Secureye, ESSL, ZKAccess)
  let headerRowIdx = -1;
  const dayColumns: { [day: number]: number } = {};

  for (let r = 0; r < rawData.length; r++) {
    const row = rawData[r];
    if (!Array.isArray(row)) continue;
    const rowStr = row.map(c => String(c).toLowerCase()).join(' ');
    if (rowStr.includes('emp code') || rowStr.includes('emp name')) {
      headerRowIdx = r;
      row.forEach((cell: any, colIdx: number) => {
        if (cell !== null && cell !== undefined) {
          const valStr = String(cell).trim();
          const num = parseInt(valStr, 10);
          if (!isNaN(num) && num >= 1 && num <= 31) {
            dayColumns[num] = colIdx;
          }
        }
      });
      break;
    }
  }

  if (headerRowIdx === -1) return [];

  function matchEmployee(rawName: string, empCode: string): Employee | undefined {
    if (!rawName) return undefined;
    const normRaw = rawName.toLowerCase().trim();
    const rawFirstName = normRaw.split(' ')[0];

    return employees.find(e => {
      const normSys = e.name.toLowerCase().trim();
      const sysFirstName = normSys.split(' ')[0];

      if (e.employeeId === empCode) return true;
      if (normSys === normRaw) return true;
      if (normSys.includes(normRaw) || normRaw.includes(normSys)) return true;
      if (rawFirstName && rawFirstName.length > 2 && rawFirstName === sysFirstName) return true;

      return false;
    });
  }

  const logs: AttendanceLog[] = [];

  for (let r = headerRowIdx + 1; r < rawData.length; r++) {
    const row = rawData[r];
    if (!Array.isArray(row) || row.length < 3) continue;

    const empCode = String(row[0] || '').trim();
    const rawName = String(row[2] || '').trim();

    if (!rawName || rawName.toLowerCase().includes('generated') || rawName.toLowerCase().includes('total')) continue;

    const matchedEmp = matchEmployee(rawName, empCode);
    if (!matchedEmp) continue;

    Object.keys(dayColumns).forEach(dayKey => {
      const dayNum = Number(dayKey);
      const colIdx = dayColumns[dayNum];
      const cellVal = row[colIdx];
      if (cellVal === null || cellVal === undefined) return;

      const dayStr = String(dayNum).padStart(2, '0');
      const dateStr = `${monthYear}-${dayStr}`;

      const cellText = String(cellVal).trim();
      if (!cellText || cellText === 'NA') return;

      let checkIn = '09:00';
      let checkOut = '18:00';
      let attendanceCode: any = 'P';
      let workedMinutes = 480;

      if (cellText === 'WO-I' || cellText === 'WO') {
        attendanceCode = 'WO-I';
        checkIn = '';
        checkOut = '';
        workedMinutes = 0;
      } else if (cellText === 'A') {
        attendanceCode = 'A';
        checkIn = '';
        checkOut = '';
        workedMinutes = 0;
      } else if (cellText === 'HD') {
        attendanceCode = 'HD';
        workedMinutes = 240;
      } else if (cellText.includes('\n')) {
        const parts = cellText.split('\n').map(p => p.trim());
        checkIn = parts[0] || '09:00';
        checkOut = parts[1] || '18:00';
        attendanceCode = 'P';

        try {
          const [inH, inM] = checkIn.split(':').map(Number);
          const [outH, outM] = checkOut.split(':').map(Number);
          if (!isNaN(inH) && !isNaN(outH)) {
            const totalInMins = inH * 60 + inM;
            const totalOutMins = outH * 60 + outM;
            workedMinutes = Math.max(0, totalOutMins - totalInMins);
          }
        } catch (e) {}
      } else if (cellText.match(/^\d{2}:\d{2}$/)) {
        checkIn = cellText;
        checkOut = '';
        attendanceCode = 'MP';
        workedMinutes = 0;
      }

      logs.push({
        id: `att-${matchedEmp.id}-${dateStr}`,
        employeeId: matchedEmp.id,
        date: dateStr,
        attendanceCode,
        checkIn,
        checkOut,
        workedMinutes,
        requiredMinutes: 480,
        shortMinutes: Math.max(0, 480 - workedMinutes),
        extraMinutes: Math.max(0, workedMinutes - 480),
        sundayWorkedMinutes: 0,
        isManual: false,
      });
    });
  }

  return logs;
}
