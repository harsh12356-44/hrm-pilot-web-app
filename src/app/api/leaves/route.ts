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
    const { employeeId, leaveType, dayType, startDate, endDate, note, handoverNote, emergencyContact } = body;

    if (!employeeId || !leaveType || !startDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = getDbData();
    const emp = db.employees.find(e => e.id === employeeId);

    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : start;

    // 1. Overlap detection check
    const existingOverlap = db.leaveRecords.find(
      l =>
        l.employeeId === employeeId &&
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
      employeeId,
      leaveType,
      dayType: dayType || 'full',
      startDate,
      endDate: endDate || startDate,
      daysCount,
      quarter,
      year: start.getFullYear(),
      status: 'APPROVED',
      note: note || '',
      handoverNote: handoverNote || '',
      emergencyContact: emergencyContact || '',
      createdAt: new Date().toISOString(),
    };

    db.leaveRecords.push(newRecord);
    logAudit('Submit Leave Request', 'LeaveRecord', newRecord.id, undefined, JSON.stringify(newRecord));

    // Dispatch system notification
    if (emp) {
      addNotification(
        emp.id,
        'leave_submitted',
        'Leave Period Recorded',
        `Your request for ${leaveType} (${startDate} to ${endDate || startDate}) has been recorded.`
      );
    }

    saveDbData(db);

    const summaries = getQuarterlyLeaveSummaries(quarter, 'ALL');

    return NextResponse.json({
      success: true,
      message: 'Leave period recorded successfully',
      record: newRecord,
      summaries,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
