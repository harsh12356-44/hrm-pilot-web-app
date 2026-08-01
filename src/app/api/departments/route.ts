import { NextResponse } from 'next/server';
import { getDbData, saveDbData, logAudit } from '@/lib/store';

export interface DepartmentItem {
  id: string;
  code: string;
  name: string;
  managerName?: string;
  description?: string;
  employeeCount: number;
}

export async function GET() {
  const db = getDbData();

  // Compute base count map
  const deptsMap = new Map<string, number>();
  db.employees.forEach(e => {
    const dept = e.department || 'General';
    deptsMap.set(dept, (deptsMap.get(dept) || 0) + 1);
  });

  const customDepts: DepartmentItem[] = db.departments || [];

  // Seed default departments if missing
  const defaultNames = ['Engineering', 'Human Resources', 'Sales', 'Marketing'];
  defaultNames.forEach(name => {
    if (!customDepts.some(d => d.name.toLowerCase() === name.toLowerCase())) {
      customDepts.push({
        id: `dept-${name.toLowerCase()}`,
        code: name.substring(0, 3).toUpperCase(),
        name,
        managerName: db.employees.find(e => e.department === name && e.role === 'MANAGER')?.name || 'Harshit Bhootra',
        description: `Core ${name} Department operations and personnel management.`,
        employeeCount: deptsMap.get(name) || 0,
      });
    }
  });

  // Update counts
  const finalDepts = customDepts.map(d => ({
    ...d,
    employeeCount: deptsMap.get(d.name) || d.employeeCount || 0,
  }));

  return NextResponse.json(finalDepts);
}

export async function POST(request: Request) {
  try {
    const { name, code, managerName, description } = await request.json();
    if (!name) {
      return NextResponse.json({ error: 'Department name is required' }, { status: 400 });
    }

    const db = getDbData();
    if (!db.departments) db.departments = [];

    const newDept: DepartmentItem = {
      id: `dept-${Date.now()}`,
      code: code || name.substring(0, 3).toUpperCase(),
      name,
      managerName: managerName || 'Unassigned',
      description: description || `Custom ${name} Department.`,
      employeeCount: 0,
    };

    db.departments.push(newDept);
    saveDbData(db);

    logAudit('Create Department', 'Department', newDept.code, undefined, newDept.name);

    return NextResponse.json({
      success: true,
      department: newDept,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error creating department' }, { status: 500 });
  }
}
