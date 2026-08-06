import { NextResponse } from 'next/server';
import { getDbData, saveDbData, getQuarterlyLeaveSummaries, getEmployeeAllQuarters, addNotification, logAudit } from '@/lib/store';
import { LeaveRecord } from '@/lib/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const quarter = searchParams.get('quarter') || 'Q3';
  const department = searchParams.get('department') || 'ALL';
  const employeeDetails = searchParams.get('employeeDetails');

  if (employeeDetails) {
    const detail = getEmployeeAllQuarters(employeeDetails);
    if (!detail) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, detail });
  }

  const summaries = getQuarterlyLeaveSummaries(quarter, department);
  const db = getDbData();

  return NextResponse.json({
    quarter,
    department,
    summaries,
    records: db.leaveRecords,
    employees: db.employees,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Manual Numerical Override Action (from EditTrackerModal)
    if (body.action === 'override') {
      const { employeeName, quarter, casualUsed, plannedUsed } = body;
      const db = getDbData();
      const emp = db.employees.find(e => e.name === employeeName || e.id === employeeName || e.employeeId === employeeName);
      if (!emp) {
        return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
      }

      // Remove existing approved records for this quarter and create specific override entries
      db.leaveRecords = db.leaveRecords.filter(
        l => !((l.employeeId === emp.id || l.employeeId === emp.employeeId || l.employeeId === emp.name) && l.quarter === quarter && l.status === 'APPROVED')
      );

      const targetQuarter = quarter || 'Q3';
      let datePrefix = '2026-08-15';
      if (targetQuarter === 'Q1') datePrefix = '2026-02-15';
      else if (targetQuarter === 'Q2') datePrefix = '2026-05-15';
      else if (targetQuarter === 'Q3') datePrefix = '2026-08-15';
      else if (targetQuarter === 'Q4') datePrefix = '2026-11-15';

      if (casualUsed > 0) {
        db.leaveRecords.unshift({
          id: `l-override-cas-${Date.now()}`,
          employeeId: emp.id,
          leaveType: 'Casual Leave',
          dayType: 'full',
          startDate: datePrefix,
          endDate: datePrefix,
          daysCount: Number(casualUsed),
          quarter: targetQuarter,
          year: 2026,
          status: 'APPROVED',
          note: 'Manual HR Override (Casual)',
          createdAt: new Date().toISOString(),
        });
      }

      if (plannedUsed > 0) {
        db.leaveRecords.unshift({
          id: `l-override-pla-${Date.now()}`,
          employeeId: emp.id,
          leaveType: 'Planned Leave',
          dayType: 'full',
          startDate: datePrefix,
          endDate: datePrefix,
          daysCount: Number(plannedUsed),
          quarter: targetQuarter,
          year: 2026,
          status: 'APPROVED',
          note: 'Manual HR Override (Planned)',
          createdAt: new Date().toISOString(),
        });
      }

      logAudit('Override Quarterly Leave', 'LeaveRecord', emp.id, undefined, JSON.stringify({ casualUsed, plannedUsed, quarter }));
      saveDbData(db);

      const summaries = getQuarterlyLeaveSummaries(targetQuarter, 'ALL');
      return NextResponse.json({ success: true, message: 'Quarterly leave updated', summaries });
    }

    // 2. Batch Import Action (from file upload)
    if (body.action === 'import' && Array.isArray(body.records)) {
      const db = getDbData();
      let importedCount = 0;

      body.records.forEach((row: any) => {
        const empName = row.employeeName || row['Employee Name'] || row['Employee'] || row['Name'];
        const quarter = row.quarter || row['Quarter'] || 'Q3';
        const casual = Number(row.casualUsed || row['Casual Used'] || row['Casual'] || 0);
        const planned = Number(row.plannedUsed || row['Planned Used'] || row['Planned'] || 0);

        if (empName) {
          const emp = db.employees.find(
            e => e.name.toLowerCase().trim() === String(empName).toLowerCase().trim() || e.employeeId === empName
          );
          if (emp) {
            db.leaveRecords = db.leaveRecords.filter(
              l => !(l.employeeId === emp.id && l.quarter === quarter && l.status === 'APPROVED')
            );

            let datePrefix = '2026-08-15';
            if (quarter === 'Q1') datePrefix = '2026-02-15';
            else if (quarter === 'Q2') datePrefix = '2026-05-15';
            else if (quarter === 'Q3') datePrefix = '2026-08-15';
            else if (quarter === 'Q4') datePrefix = '2026-11-15';

            if (casual > 0) {
              db.leaveRecords.unshift({
                id: `l-imp-cas-${Date.now()}-${Math.random()}`,
                employeeId: emp.id,
                leaveType: 'Casual Leave',
                dayType: 'full',
                startDate: datePrefix,
                endDate: datePrefix,
                daysCount: casual,
                quarter,
                year: 2026,
                status: 'APPROVED',
                note: 'Imported from spreadsheet',
                createdAt: new Date().toISOString(),
              });
            }

            if (planned > 0) {
              db.leaveRecords.unshift({
                id: `l-imp-pla-${Date.now()}-${Math.random()}`,
                employeeId: emp.id,
                leaveType: 'Planned Leave',
                dayType: 'full',
                startDate: datePrefix,
                endDate: datePrefix,
                daysCount: planned,
                quarter,
                year: 2026,
                status: 'APPROVED',
                note: 'Imported from spreadsheet',
                createdAt: new Date().toISOString(),
              });
            }
            importedCount++;
          }
        }
      });

      saveDbData(db);
      logAudit('Import Quarterly Leaves', 'LeaveRecord', 'batch', undefined, `Imported ${importedCount} records`);
      const summaries = getQuarterlyLeaveSummaries('Q3', 'ALL');
      return NextResponse.json({ success: true, message: `Successfully imported ${importedCount} employee records!`, summaries });
    }

    // 3. Regular Leave Submission / Record Leave Period
    const employeeId = body.employeeId || 'emp-1';
    const { leaveType, dayType, startDate, endDate, note, handoverNote, emergencyContact, reason } = body;

    if (!startDate) {
      return NextResponse.json({ error: 'Missing required start date' }, { status: 400 });
    }

    const db = getDbData();
    const emp = db.employees.find(e => e.id === employeeId || e.name === body.employeeName || e.employeeId === employeeId) || db.employees[0];

    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : start;

    // Overlap detection check (only if not an explicit HR adjustment override)
    if (!body.allowOverlap) {
      const existingOverlap = db.leaveRecords.find(
        l =>
          l.employeeId === emp.id &&
          l.status !== 'REJECTED' &&
          l.status !== 'CANCELLED' &&
          !(new Date(l.startDate) > end || new Date(l.endDate) < start)
      );

      if (existingOverlap) {
        return NextResponse.json(
          { error: `An existing leave request (#${existingOverlap.id}, Status: ${existingOverlap.status}) overlaps with the selected dates (${existingOverlap.startDate} to ${existingOverlap.endDate}).` },
          { status: 400 }
        );
      }
    }

    const diffTime = Math.abs(end.getTime() - start.getTime());
    let daysCount = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    if (dayType === 'first_half' || dayType === 'second_half') {
      daysCount = 0.5;
    }
    if (typeof body.daysCount === 'number') {
      daysCount = body.daysCount;
    }

    // Determine quarter
    const month = start.getMonth() + 1;
    let quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4' = 'Q3';
    if (month >= 1 && month <= 3) quarter = 'Q1';
    else if (month >= 4 && month <= 6) quarter = 'Q2';
    else if (month >= 7 && month <= 9) quarter = 'Q3';
    else if (month >= 10 && month <= 12) quarter = 'Q4';

    const newRecord: LeaveRecord = {
      id: `l-${Date.now()}`,
      employeeId: emp.id,
      leaveType: leaveType || 'Casual Leave',
      dayType: dayType || 'full',
      startDate,
      endDate: endDate || startDate,
      daysCount,
      quarter,
      year: start.getFullYear(),
      status: body.status || 'APPROVED',
      note: note || reason || 'Leave application',
      handoverNote: handoverNote || '',
      emergencyContact: emergencyContact || '',
      createdAt: new Date().toISOString(),
    };

    db.leaveRecords.unshift(newRecord);
    logAudit('Submit Leave Request', 'LeaveRecord', newRecord.id, undefined, JSON.stringify(newRecord));

    if (emp) {
      addNotification(
        emp.id,
        'leave_submitted',
        'Leave Application Submitted',
        `Your request for ${leaveType} (${startDate} to ${endDate || startDate}) has been submitted for approval.`
      );
    }

    saveDbData(db);

    const summaries = getQuarterlyLeaveSummaries(quarter, 'ALL');

    return NextResponse.json({
      success: true,
      message: 'Leave request submitted successfully',
      record: newRecord,
      summaries,
      records: db.leaveRecords,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status, approverRole } = body;

    const db = getDbData();
    const index = db.leaveRecords.findIndex(l => l.id === id);

    if (index !== -1) {
      const oldVal = JSON.stringify(db.leaveRecords[index]);
      db.leaveRecords[index].status = status;

      logAudit(`Leave Request ${status}`, 'LeaveRecord', id, oldVal, JSON.stringify(db.leaveRecords[index]));

      const emp = db.employees.find(e => e.id === db.leaveRecords[index].employeeId);
      if (emp) {
        addNotification(
          emp.id,
          'leave_status_updated',
          `Leave Request ${status}`,
          `Your leave request #${id} has been ${status.toLowerCase()} by ${approverRole || 'HR'}.`
        );
      }

      saveDbData(db);
      return NextResponse.json({ success: true, record: db.leaveRecords[index], records: db.leaveRecords });
    }

    return NextResponse.json({ error: 'Leave record not found' }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

