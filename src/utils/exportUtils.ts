/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AttendanceRecord } from '../types/attendance';
import { ARABIC_DAYS, parseISODate, getStatusLabel } from './dateUtils';

/**
 * Exports attendance records to a downloadable CSV with UTF-8 BOM for Excel support
 */
export function exportAttendanceToCSV(records: AttendanceRecord[], filename = 'تقرير_الحضور_والدوام.csv'): void {
  // UTF-8 BOM character ensures Excel displays Arabic letters correctly without encoding issues
  const BOM = '\uFEFF';

  const headers = ['التاريخ', 'اليوم', 'الحالة', 'وقت التسجيل', 'الملاحظات'];

  const rows = records
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((record) => {
      const dateObj = parseISODate(record.date);
      const dayName = ARABIC_DAYS[dateObj.getDay()] || '';
      const statusArabic = getStatusLabel(record.status);
      const note = record.note ? `"${record.note.replace(/"/g, '""')}"` : '""';

      return [record.date, dayName, statusArabic, record.timestamp, note].join(',');
    });

  const csvContent = BOM + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports data as a JSON backup file
 */
export function exportBackupJSON(records: AttendanceRecord[], filename = 'نسخة_احتياطية_الحضور.json'): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(records, null, 2));
  const link = document.createElement('a');
  link.setAttribute('href', dataStr);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
