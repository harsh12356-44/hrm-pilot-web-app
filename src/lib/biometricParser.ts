import { Employee, AttendanceLog } from './types';

export interface ParsedPunchResult {
  checkIn: string;
  checkOut: string;
  workedMinutes: number;
  attendanceCode: 'P' | 'A' | 'HD' | 'WO' | 'WO-I' | 'MP' | string;
}

export function parsePunchTimes(cellVal: any): ParsedPunchResult {
  if (cellVal === null || cellVal === undefined) {
    return { checkIn: '', checkOut: '', workedMinutes: 0, attendanceCode: 'A' };
  }

  // Convert number / float Excel time fraction (e.g. 0.3854 = 09:15)
  if (typeof cellVal === 'number') {
    if (cellVal > 0 && cellVal < 1) {
      const totalMins = Math.round(cellVal * 24 * 60);
      const h = Math.floor(totalMins / 60);
      const m = totalMins % 60;
      const formatted = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      return { checkIn: formatted, checkOut: '', workedMinutes: 0, attendanceCode: 'MP' };
    }
  }

  const origText = String(cellVal).trim();
  if (!origText || origText === 'NA' || origText === '-') {
    return { checkIn: '', checkOut: '', workedMinutes: 0, attendanceCode: 'A' };
  }

  const upperText = origText.toUpperCase();

  if (upperText === 'WO-I' || upperText === 'WO' || upperText === 'WEEKLY OFF') {
    return { checkIn: '', checkOut: '', workedMinutes: 0, attendanceCode: 'WO-I' };
  }
  if (upperText === 'A' || upperText === 'ABSENT') {
    return { checkIn: '', checkOut: '', workedMinutes: 0, attendanceCode: 'A' };
  }
  if (upperText === 'HD' || upperText === 'HALF DAY' || upperText === 'HALF-DAY') {
    return { checkIn: '09:00', checkOut: '13:00', workedMinutes: 240, attendanceCode: 'HD' };
  }
  if (['PL', 'CL', 'SL', 'UL'].includes(upperText)) {
    return { checkIn: '', checkOut: '', workedMinutes: 0, attendanceCode: upperText };
  }

  // Clean status prefixes like "P ", "PRESENT ", "P\n", "P ("
  let cleanedText = origText
    .replace(/^P\s*\((.*?)\)$/i, '$1')
    .replace(/^(P|PRESENT)\s*[\n\t\s:\-]*/i, '')
    .trim();

  if (!cleanedText && (upperText.startsWith('P') || upperText === 'PRESENT')) {
    return { checkIn: '09:00', checkOut: '18:00', workedMinutes: 480, attendanceCode: 'P' };
  }

  // Regex to capture HH:mm or HH:mm:ss with optional AM/PM
  const timeRegex = /\b([0-1]?[0-9]|2[0-3]):([0-5][0-9])(?::([0-5][0-9]))?\s*(AM|PM|am|pm)?\b/g;
  const matches = Array.from((cleanedText || origText).matchAll(timeRegex));

  if (matches.length >= 2) {
    const firstMatch = matches[0];
    const lastMatch = matches[matches.length - 1];

    let inH = parseInt(firstMatch[1], 10);
    const inM = parseInt(firstMatch[2], 10);
    const inAmPm = firstMatch[4] ? firstMatch[4].toUpperCase() : null;

    if (inAmPm === 'PM' && inH < 12) inH += 12;
    if (inAmPm === 'AM' && inH === 12) inH = 0;

    let outH = parseInt(lastMatch[1], 10);
    const outM = parseInt(lastMatch[2], 10);
    const outAmPm = lastMatch[4] ? lastMatch[4].toUpperCase() : null;

    if (outAmPm === 'PM' && outH < 12) outH += 12;
    if (outAmPm === 'AM' && outH === 12) outH = 0;

    // Auto 12-hour rollover conversion if AM/PM was omitted (e.g. CheckIn: 09:15, CheckOut: 06:30)
    if (!outAmPm && outH < inH && outH < 12) {
      outH += 12;
    }

    const checkIn = `${String(inH).padStart(2, '0')}:${String(inM).padStart(2, '0')}`;
    const checkOut = `${String(outH).padStart(2, '0')}:${String(outM).padStart(2, '0')}`;

    const totalInMins = inH * 60 + inM;
    const totalOutMins = outH * 60 + outM;
    const workedMinutes = Math.max(0, totalOutMins - totalInMins);

    return {
      checkIn,
      checkOut,
      workedMinutes,
      attendanceCode: workedMinutes > 0 ? 'P' : 'A',
    };
  }

  if (matches.length === 1) {
    const match = matches[0];
    let inH = parseInt(match[1], 10);
    const inM = parseInt(match[2], 10);
    const inAmPm = match[4] ? match[4].toUpperCase() : null;

    if (inAmPm === 'PM' && inH < 12) inH += 12;
    if (inAmPm === 'AM' && inH === 12) inH = 0;

    const checkIn = `${String(inH).padStart(2, '0')}:${String(inM).padStart(2, '0')}`;
    return {
      checkIn,
      checkOut: '',
      workedMinutes: 0,
      attendanceCode: 'MP',
    };
  }

  // Fallback for plain "P" or unparsed non-empty string
  if (upperText === 'P' || upperText.startsWith('P') || upperText === 'PRESENT') {
    return { checkIn: '09:00', checkOut: '18:00', workedMinutes: 480, attendanceCode: 'P' };
  }

  return { checkIn: '', checkOut: '', workedMinutes: 0, attendanceCode: 'A' };
}

export function parseBiometricPunches(rawData: any[], employees: Employee[], monthYear: string = '2026-07'): AttendanceLog[] {
  if (!Array.isArray(rawData) || rawData.length === 0) return [];

  const logs: AttendanceLog[] = [];

  // Robust employee matcher handling numeric IDs (e.g. 2 vs 002 vs NB002) and name variations
  function matchEmployee(rawName: string, empCode: string): Employee | undefined {
    if (!rawName && !empCode) return undefined;
    const normRawCode = (empCode || '').toLowerCase().trim();
    const cleanRawNum = normRawCode.replace(/[^0-9]/g, '');
    const rawNumVal = cleanRawNum ? parseInt(cleanRawNum, 10) : NaN;

    const matched = employees.find(e => {
      if (empCode && (e.id.toLowerCase() === normRawCode || e.employeeId.toLowerCase() === normRawCode)) return true;
      
      const sysIdNum = parseInt(e.id.replace(/[^0-9]/g, ''), 10);
      const sysEmpCodeNum = parseInt(e.employeeId.replace(/[^0-9]/g, ''), 10);

      if (!isNaN(rawNumVal)) {
        if (!isNaN(sysIdNum) && sysIdNum === rawNumVal) return true;
        if (!isNaN(sysEmpCodeNum) && sysEmpCodeNum === rawNumVal) return true;
      }

      if (rawName) {
        const normSys = e.name.toLowerCase().trim();
        const normInput = rawName.toLowerCase().trim();
        if (normSys === normInput || normSys.includes(normInput) || normInput.includes(normSys)) return true;
        const sysFirst = normSys.split(' ')[0];
        const rawFirst = normInput.split(' ')[0];
        if (rawFirst && rawFirst.length >= 2 && sysFirst === rawFirst) return true;
      }
      return false;
    });

    return matched;
  }

  // 1. Process 2D Array Matrix (ONtime / Secureye / ESSL 2D exports)
  if (Array.isArray(rawData[0])) {
    let headerRowIdx = -1;
    const dayColumns: { [day: number]: number } = {};

    for (let r = 0; r < rawData.length; r++) {
      const row = rawData[r];
      if (!Array.isArray(row)) continue;
      const rowStr = row.map(c => String(c).toLowerCase()).join(' ');

      const dayCount = row.filter((cell: any) => {
        const valStr = String(cell || '').trim();
        const num = parseInt(valStr, 10);
        return !isNaN(num) && num >= 1 && num <= 31 && valStr === String(num);
      }).length;

      if (dayCount >= 5 || rowStr.includes('emp code') || rowStr.includes('emp name') || rowStr.includes('employee') || rowStr.includes('code') || rowStr.includes('id')) {
        headerRowIdx = r;
        row.forEach((cell: any, colIdx: number) => {
          if (cell !== null && cell !== undefined) {
            const valStr = String(cell).trim();
            const num = parseInt(valStr, 10);
            if (!isNaN(num) && num >= 1 && num <= 31 && valStr === String(num)) {
              dayColumns[num] = colIdx;
            }
          }
        });
        if (Object.keys(dayColumns).length >= 5) break;
      }
    }

    if (headerRowIdx !== -1) {
      for (let r = headerRowIdx + 1; r < rawData.length; r++) {
        const row = rawData[r];
        if (!Array.isArray(row) || row.length < 2) continue;

        const empCode = String(row[0] || '').trim();
        const rawName = String(row[2] || row[1] || '').trim();

        if (!rawName && !empCode) continue;
        if (rawName.toLowerCase().includes('generated') || rawName.toLowerCase().includes('total')) continue;

        let matchedEmp: Employee | undefined;
        for (let c = 0; c < Math.min(5, row.length); c++) {
          const cellStr = String(row[c] || '').trim();
          if (cellStr) {
            matchedEmp = matchEmployee(cellStr, cellStr);
            if (matchedEmp) break;
          }
        }

        if (!matchedEmp && (empCode || rawName)) {
          matchedEmp = matchEmployee(rawName, empCode);
        }

        if (!matchedEmp) {
          const empIdx = (r - (headerRowIdx + 1)) % employees.length;
          matchedEmp = employees[empIdx];
        }

        if (!matchedEmp) continue;

        Object.keys(dayColumns).forEach(dayKey => {
          const dayNum = Number(dayKey);
          const colIdx = dayColumns[dayNum];
          const cellVal = row[colIdx];
          if (cellVal === null || cellVal === undefined) return;

          const dayStr = String(dayNum).padStart(2, '0');
          const dateStr = `${monthYear}-${dayStr}`;

          const parsed = parsePunchTimes(cellVal);
          if (parsed.attendanceCode === 'A' && !String(cellVal).trim()) return;

          logs.push({
            id: `att-${matchedEmp.id}-${dateStr}`,
            employeeId: matchedEmp.id,
            date: dateStr,
            attendanceCode: parsed.attendanceCode as any,
            checkIn: parsed.checkIn,
            checkOut: parsed.checkOut,
            workedMinutes: parsed.workedMinutes,
            requiredMinutes: 480,
            shortMinutes: Math.max(0, 480 - parsed.workedMinutes),
            extraMinutes: Math.max(0, parsed.workedMinutes - 480),
            sundayWorkedMinutes: 0,
            isManual: false,
          });
        });
      }
      return logs;
    }
  }

  // 2. Process Object Array Matrix & Flat Date Rows
  rawData.forEach((row: any, idx: number) => {
    if (!row || Array.isArray(row)) return;

    const keys = Object.keys(row);
    const findKeyVal = (patterns: string[]) => {
      const matchedKey = keys.find(k => patterns.some(p => k.toLowerCase().replace(/[^a-z0-9]/g, '').includes(p)));
      return matchedKey ? String(row[matchedKey] || '').trim() : '';
    };

    const empCode = findKeyVal(['employeeid', 'empcode', 'code', 'empid', 'id']);
    const rawName = findKeyVal(['employeename', 'empname', 'name', 'fullname', 'staffname']);

    const matchedEmp = matchEmployee(rawName, empCode) || (empCode || rawName ? employees[idx % employees.length] : undefined);
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
        const parsed = parsePunchTimes(cellVal);

        logs.push({
          id: `att-${matchedEmp.id}-${dateStr}`,
          employeeId: matchedEmp.id,
          date: dateStr,
          attendanceCode: parsed.attendanceCode as any,
          checkIn: parsed.checkIn,
          checkOut: parsed.checkOut,
          workedMinutes: parsed.workedMinutes,
          requiredMinutes: 480,
          shortMinutes: Math.max(0, 480 - parsed.workedMinutes),
          extraMinutes: Math.max(0, parsed.workedMinutes - 480),
          sundayWorkedMinutes: 0,
          isManual: false,
        });
      }
    }

    // 3. Process Flat Date Row Object (e.g. { Date: "2026-08-01", "In Time": "09:15 AM", "Out Time": "06:30 PM", ... })
    if (!foundDayCols) {
      const dateVal = findKeyVal(['date', 'workdate', 'attendancedate', 'day']);
      if (dateVal) {
        let dateStr = dateVal;
        if (!dateStr.includes('-') && dateStr.length === 8) {
          dateStr = `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
        }

        const rawIn = findKeyVal(['intime', 'checkin', 'punchin', 'login', 'timein', 'entry', 'start']);
        const rawOut = findKeyVal(['outtime', 'checkout', 'punchout', 'logout', 'timeout', 'exit', 'end']);
        const rawStatus = findKeyVal(['status', 'attendancecode', 'code']);

        let parsed: ParsedPunchResult;

        if (rawIn || rawOut) {
          const combinedPunch = `${rawIn} ${rawOut}`.trim();
          parsed = parsePunchTimes(combinedPunch);
          if (rawStatus && ['WO', 'WO-I', 'A', 'HD', 'PL', 'CL', 'SL', 'UL'].includes(rawStatus.toUpperCase())) {
            parsed.attendanceCode = rawStatus.toUpperCase();
          }
        } else if (rawStatus) {
          parsed = parsePunchTimes(rawStatus);
        } else {
          parsed = { checkIn: '09:00', checkOut: '18:00', workedMinutes: 480, attendanceCode: 'P' };
        }

        logs.push({
          id: `att-${matchedEmp.id}-${dateStr}-${idx}`,
          employeeId: matchedEmp.id,
          date: dateStr,
          checkIn: parsed.checkIn,
          checkOut: parsed.checkOut,
          workedMinutes: parsed.workedMinutes,
          requiredMinutes: 480,
          shortMinutes: Math.max(0, 480 - parsed.workedMinutes),
          extraMinutes: Math.max(0, parsed.workedMinutes - 480),
          sundayWorkedMinutes: 0,
          attendanceCode: parsed.attendanceCode as any,
          isManual: false,
        });
      }
    }
  });

  return logs;
}
