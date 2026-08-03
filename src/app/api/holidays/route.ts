import { NextResponse } from 'next/server';
import { getDbData, saveDbData, logAudit } from '@/lib/store';
import { Holiday } from '@/lib/types';

export async function GET() {
  const db = getDbData();
  return NextResponse.json(db.holidays);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = getDbData();

    // 1. Bulk Import Holidays from spreadsheet (.csv, .xls, .xlsx)
    if (body.action === 'BULK_IMPORT') {
      const rows = body.rows || [];
      const importedHolidays: Holiday[] = [];

      if (Array.isArray(rows) && rows.length > 0) {
        rows.forEach((row: any) => {
          const name = row['Holiday Name'] || row['Name'] || row.name || row.HolidayName;
          const date = row['Holiday Date'] || row['Date'] || row.date || row.HolidayDate;
          const isOptional = Boolean(row.isOptional || row.Optional || row['Is Optional']);

          if (name && date) {
            const newHoliday: Holiday = {
              id: `h-${Date.now()}-${Math.random()}`,
              name: String(name).trim(),
              date: String(date).trim(),
              isOptional,
            };
            db.holidays.push(newHoliday);
            importedHolidays.push(newHoliday);
          }
        });
      }

      logAudit('Import Holidays List', 'Holiday', `count-${importedHolidays.length}`, undefined, `${importedHolidays.length} holidays imported`);
      saveDbData(db);

      return NextResponse.json({
        success: true,
        message: `Successfully imported ${importedHolidays.length} holidays!`,
        holidays: db.holidays,
      });
    }

    // 2. Single Holiday Addition
    const { name, date, isOptional } = body;
    if (!name || !date) {
      return NextResponse.json({ error: 'Name and date are required' }, { status: 400 });
    }

    const newHoliday: Holiday = {
      id: `h-${Date.now()}`,
      name,
      date,
      isOptional: Boolean(isOptional),
    };

    db.holidays.push(newHoliday);
    logAudit('Add Holiday', 'Holiday', newHoliday.id, undefined, JSON.stringify(newHoliday));
    saveDbData(db);

    return NextResponse.json({ success: true, holiday: newHoliday, holidays: db.holidays });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error adding holiday' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Holiday ID required' }, { status: 400 });
    }

    const db = getDbData();
    const index = db.holidays.findIndex(h => h.id === id);

    if (index !== -1) {
      const deletedHoliday = db.holidays[index];
      db.holidays.splice(index, 1);
      logAudit('Delete Holiday', 'Holiday', id, JSON.stringify(deletedHoliday), undefined);
      saveDbData(db);
      return NextResponse.json({ success: true, message: `Holiday ${deletedHoliday.name} deleted`, holidays: db.holidays });
    }

    return NextResponse.json({ error: 'Holiday not found' }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error deleting holiday' }, { status: 500 });
  }
}
