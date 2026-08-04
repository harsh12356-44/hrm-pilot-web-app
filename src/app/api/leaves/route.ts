import { NextResponse } from 'next/server';
import { getDbData, saveDbData, getQuarterlyLeaveSummaries, addNotification, logAudit } from '@/lib/store';
import { LeaveRecord } from '@/lib/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const quarter = searchParams.get('quarter') || 'Q3';
  const department = searchParams.get('department') || 'ALL';

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
    const employeeId = body.employeeId || 'emp-1';
    const { leaveType, dayType, startDate, endDate, note, handoverNote, emergencyContact, reason } = body;

    if (!startDate) {
      return NextResponse.json({ error: 'Missing required start date' }, { status: 400 });
    }

    const db = getDbData();
    const emp = db.employees.find(e => e.id === employeeId || e.name === body.employeeName) || db.employees[0];

    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : start;

    // Overlap detection check
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

    const diffTime = Math.abs(end.getTime() - start.getTime());
    let daysCount = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    if (dayType === 'first_half' || dayType === 'second_half') {
      daysCount = 0.5;
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
