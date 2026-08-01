import { NextResponse } from 'next/server';
import { getDbData, saveDbData, logAudit } from '@/lib/store';
import { Holiday } from '@/lib/types';

export async function GET() {
  const db = getDbData();
  return NextResponse.json(db.holidays);
}

export async function POST(request: Request) {
  try {
    const { name, date, isOptional } = await request.json();
    if (!name || !date) {
      return NextResponse.json({ error: 'Name and date are required' }, { status: 400 });
    }

    const db = getDbData();
    const newHoliday: Holiday = {
      id: `h-${Date.now()}`,
      name,
      date,
      isOptional: Boolean(isOptional),
    };

    db.holidays.push(newHoliday);
    logAudit('Add Holiday', 'Holiday', newHoliday.id, undefined, JSON.stringify(newHoliday));
    saveDbData(db);

    return NextResponse.json({ success: true, holiday: newHoliday });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error adding holiday' }, { status: 500 });
  }
}
