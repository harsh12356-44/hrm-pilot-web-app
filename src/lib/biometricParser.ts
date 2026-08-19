import { Employee, AttendanceLog } from './types';

export function parseBiometricPunches(rawData: any[], employees: Employee[], monthYear: string = '2026-07'): AttendanceLog[] {
  if (!Array.isArray(rawData) || rawData.length === 0) return [];

  const logs: AttendanceLog[] = [];

  // 1. Process 2D Array Matrix (ONtime / Secureye / ESSL 2D exports)
  if (Array.isArray(rawData[0])) {
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

    if (headerRowIdx !== -1) {
      function matchEmployee(rawName: string, empCode: string): Employee | undefined {
        if (!rawName && !empCode) return undefined;
        const normRaw = (rawName || '').toLowerCase().trim();
        const rawFirstName = normRaw.split(' ')[0];

        return employees.find(e => {
          if (empCode && (e.id.toLowerCase() === empCode.toLowerCase() || e.employeeId.toLowerCase() === empCode.toLowerCase())) return true;
          const normSys = e.name.toLowerCase().trim();
          const sysFirstName = normSys.split(' ')[0];
          if (normSys === normRaw) return true;
          if (normSys.includes(normRaw) || normRaw.includes(normSys)) return true;
          if (rawFirstName && rawFirstName.length > 2 && rawFirstName === sysFirstName) return true;
          return false;
        });
      }

      for (let r = headerRowIdx + 1; r < rawData.length; r++) {
        const row = rawData[r];
        if (!Array.isArray(row) || row.length < 3) continue;

        const empCode = String(row[0] || '').trim();
        const rawName = String(row[2] || row[1] || '').trim();

        if (!rawName && !empCode) continue;
        if (rawName.toLowerCase().includes('generated') || rawName.toLowerCase().includes('total')) continue;

        const matchedEmp = matchEmployee(rawName, empCode) || employees.find(e => e.id.toLowerCase() === empCode.toLowerCase());
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
          } else if (cellText.includes('\n') || cellText.includes(' ')) {
            const parts = cellText.split(/[\n\s]+/).map(p => p.trim()).filter(Boolean);
            checkIn = parts[0] || '09:00';
            checkOut = parts[1] || parts[0] || '18:00';
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
  }

  // 2. Process Object Array Matrix (e.g. sheet_to_json rows with day keys 1..31 or flat date rows)
  rawData.forEach((row: any, idx: number) => {
    if (!row || Array.isArray(row)) return;

    const keys = Object.keys(row);
    const findKeyVal = (patterns: string[]) => {
      const matchedKey = keys.find(k => patterns.some(p => k.toLowerCase().replace(/[^a-z0-9]/g, '').includes(p)));
      return matchedKey ? String(row[matchedKey] || '').trim() : '';
    };

    const empCode = findKeyVal(['employeeid', 'empcode', 'code', 'empid', 'id']);
    const rawName = findKeyVal(['employeename', 'empname', 'name', 'fullname', 'staffname']);

    const matchedEmp = employees.find(e => {
      if (empCode && (e.id.toLowerCase() === empCode.toLowerCase() || e.employeeId.toLowerCase() === empCode.toLowerCase())) return true;
      if (rawName) {
        const sysName = e.name.toLowerCase().trim();
        const inputName = rawName.toLowerCase().trim();
        if (sysName.includes(inputName) || inputName.includes(sysName)) return true;
        const inputFirst = inputName.split(' ')[0];
        const sysFirst = sysName.split(' ')[0];
        if (inputFirst.length >= 3 && sysFirst === inputFirst) return true;
      }
      return false;
    }) || (empCode || rawName ? employees[0] : undefined);

    if (!matchedEmp) return;

    let foundDayCols = false;
    for (let dayNum = 1; dayNum <= 31; dayNum++) {
      const dayStrKey = String(dayNum);
      const padDayKey = String(dayNum).padStart(2, '0');
      const cellVal = row[dayStrKey] !== undefined ? row[dayStrKey] : row[padDayKey];

      if (cellVal !== undefined && cellVal !== null) {
        foundDayCols = true;
        const cellText = String(cellVal).trim();
        if (!cellText || cellText === 'NA') continue;

        const dateStr = `${monthYear}-${padDayKey}`;
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
        } else if (cellText.includes('\n') || cellText.includes(' ')) {
          const parts = cellText.split(/[\n\s]+/).map(p => p.trim()).filter(Boolean);
          checkIn = parts[0] || '09:00';
          checkOut = parts[1] || parts[0] || '18:00';
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
      }
    }

    // 3. Process Flat Date Row Object (e.g. { date: "2026-08-01", checkIn: "...", ... })
    if (!foundDayCols && (row.date || row.Date)) {
      const date = row.date || row.Date;
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
    }
  });

  return logs;
}
