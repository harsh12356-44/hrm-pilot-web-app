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

  let customDepts: DepartmentItem[] = db.departments || [];

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

  db.departments = customDepts;
  saveDbData(db);

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

export async function PUT(request: Request) {
  try {
    const { id, name, code, managerName, description } = await request.json();

    const db = getDbData();
    if (!db.departments) db.departments = [];

    const index = db.departments.findIndex(d => d.id === id);

    if (index !== -1) {
      const oldVal = JSON.stringify(db.departments[index]);
      db.departments[index] = {
        ...db.departments[index],
        name: name || db.departments[index].name,
        code: code || db.departments[index].code,
        managerName: managerName || db.departments[index].managerName,
        description: description || db.departments[index].description,
      };

      logAudit('Update Department Structure', 'Department', id, oldVal, JSON.stringify(db.departments[index]));
      saveDbData(db);
      return NextResponse.json({ success: true, department: db.departments[index], departments: db.departments });
    }

    return NextResponse.json({ error: 'Department not found' }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error updating department' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Department ID required' }, { status: 400 });
    }

    const db = getDbData();
    if (!db.departments) db.departments = [];

    const index = db.departments.findIndex(d => d.id === id);

    if (index !== -1) {
      const deletedDept = db.departments[index];
      db.departments.splice(index, 1);
      logAudit('Delete Department', 'Department', id, JSON.stringify(deletedDept), undefined);
      saveDbData(db);
      return NextResponse.json({ success: true, message: `Department ${deletedDept.name} deleted`, departments: db.departments });
    }

    return NextResponse.json({ error: 'Department not found' }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error deleting department' }, { status: 500 });
  }
}
