import { NextResponse } from 'next/server';
import { getDbData, saveDbData, logAudit } from '@/lib/store';
import { Employee } from '@/lib/types';

export async function GET() {
  const db = getDbData();
  return NextResponse.json(db.employees);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = getDbData();

    if (body.id) {
      // Edit existing employee
      const index = db.employees.findIndex(e => e.id === body.id);
      if (index !== -1) {
        const oldVal = JSON.stringify(db.employees[index]);
        db.employees[index] = { ...db.employees[index], ...body };
        logAudit('Update Employee', 'Employee', body.id, oldVal, JSON.stringify(db.employees[index]));
        saveDbData(db);
        return NextResponse.json({ success: true, employee: db.employees[index] });
      }
    }

    // Create new employee
    const newEmp: Employee = {
      id: `emp-${Date.now()}`,
      employeeId: body.employeeId || `EMP${Math.floor(100 + Math.random() * 900)}`,
      name: body.name,
      email: body.email,
      phone: body.phone || '',
      department: body.department || 'General',
      designation: body.designation || 'Staff',
      dateOfJoining: body.dateOfJoining || new Date().toISOString().split('T')[0],
      role: body.role || 'EMPLOYEE',
      status: 'ACTIVE',
      monthlySalary: Number(body.monthlySalary) || 50000,
      dailyWorkingRequirementMinutes: 480,
      weeklyOff: body.weeklyOff || 'Sunday',
      casualAllowance: Number(body.casualAllowance) || 6,
      plannedAllowance: Number(body.plannedAllowance) || 6,
      sickAllowance: Number(body.sickAllowance) || 6,
    };

    db.employees.push(newEmp);
    logAudit('Create Employee', 'Employee', newEmp.id, undefined, JSON.stringify(newEmp));
    saveDbData(db);

    return NextResponse.json({ success: true, employee: newEmp });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to save employee' }, { status: 500 });
  }
}
