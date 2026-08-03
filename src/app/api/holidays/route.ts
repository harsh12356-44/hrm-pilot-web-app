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
          if (!row) return;

          let name =
            row['Holiday Name'] ||
            row['Name'] ||
            row.name ||
            row.HolidayName ||
            row.Title ||
            row['title'];

          let date =
            row['Holiday Date'] ||
            row['Date'] ||
            row.date ||
            row.HolidayDate ||
            row.dateStr;

          // Fallback to array / object values if keys differ
          if (!name || !date) {
            const vals = Object.values(row).filter((v) => v !== null && v !== undefined && String(v).trim() !== '');
            if (vals.length >= 2) {
              name = name || String(vals[0]);
              date = date || String(vals[1]);
            }
          }

          const isOptional = Boolean(row.isOptional || row.Optional || row['Is Optional'] || row.optional);

          if (name && date) {
            // Standardize date format YYYY-MM-DD
            let formattedDate = String(date).trim();
            if (formattedDate.includes('/')) {
              const parts = formattedDate.split('/');
              if (parts.length === 3) {
                // DD/MM/YYYY to YYYY-MM-DD
                if (parts[2].length === 4) {
                  formattedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                }
              }
            }

            const newHoliday: Holiday = {
              id: `h-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
              name: String(name).trim(),
              date: formattedDate,
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
        message: `Successfully imported ${importedHolidays.length} holidays into calendar!`,
        importedCount: importedHolidays.length,
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
