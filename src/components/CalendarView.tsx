/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AttendanceRecord } from '../types/attendance';
import {
  ARABIC_DAYS,
  ARABIC_MONTHS,
  getDaysInMonth,
  getFirstDayOfMonth,
  formatISODate,
  getStatusLabel,
} from '../utils/dateUtils';
import { CheckCircle2, XCircle, Coffee, Plus, Calendar as CalendarIcon } from 'lucide-react';

interface CalendarViewProps {
  selectedYear: number;
  selectedMonth: number;
  records: AttendanceRecord[];
  onSelectDay: (isoDate: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  selectedYear,
  selectedMonth,
  records,
  onSelectDay,
}) => {
  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
  const firstDayWeekday = getFirstDayOfMonth(selectedYear, selectedMonth); // 0 = Sun, 6 = Sat
  const monthNameArabic = ARABIC_MONTHS[selectedMonth - 1];
  const todayISO = formatISODate(new Date());

  // Map records by date string
  const recordsMap = new Map<string, AttendanceRecord>();
  records.forEach((r) => recordsMap.set(r.date, r));

  // Build grid items
  const calendarCells = [];

  // Empty padding cells before first day
  for (let i = 0; i < firstDayWeekday; i++) {
    calendarCells.push({ isPad: true, key: `pad-${i}` });
  }

  // Actual days
  for (let day = 1; day <= daysInMonth; day++) {
    const iso = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const record = recordsMap.get(iso);
    const isToday = iso === todayISO;
    calendarCells.push({
      isPad: false,
      day,
      iso,
      record,
      isToday,
      key: iso,
    });
  }

  return (
    <section className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 mb-8 no-print">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2 mb-4">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-bold text-slate-900">
            تقويم الحضور لشهر {monthNameArabic} {selectedYear}
          </h2>
        </div>
        <span className="text-xs text-slate-500">
          انقر على أي خلية لتسجيل أو تعديل حضور وملاحظات ذلك اليوم
        </span>
      </div>

      {/* Weekday Columns Header */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {ARABIC_DAYS.map((dayName, idx) => {
          const isWeekend = idx === 5 || idx === 6; // Friday & Saturday
          return (
            <div
              key={dayName}
              className={`py-2 text-center text-xs font-bold rounded-lg ${
                isWeekend ? 'bg-slate-100/80 text-slate-500' : 'bg-slate-50 text-slate-700'
              }`}
            >
              {dayName}
            </div>
          );
        })}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {calendarCells.map((cell) => {
          if (cell.isPad) {
            return (
              <div
                key={cell.key}
                className="min-h-24 rounded-xl bg-slate-50/40 border border-transparent"
              />
            );
          }

          const { day, iso, record, isToday } = cell;

          return (
            <button
              key={cell.key}
              type="button"
              onClick={() => onSelectDay(iso!)}
              className={`min-h-24 p-2 sm:p-2.5 rounded-xl border text-right transition-all flex flex-col justify-between group cursor-pointer ${
                isToday
                  ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50/20'
                  : 'border-slate-200/80 hover:border-blue-300 hover:bg-slate-50/80 bg-white'
              }`}
            >
              {/* Day header */}
              <div className="flex items-center justify-between w-full">
                <span
                  className={`text-sm font-bold font-mono tabular-nums ${
                    isToday
                      ? 'w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs'
                      : 'text-slate-800'
                  }`}
                >
                  {day}
                </span>

                {isToday && (
                  <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.2 rounded font-semibold">
                    اليوم
                  </span>
                )}
              </div>

              {/* Attendance Status Badge / Indicator */}
              <div className="my-1">
                {record ? (
                  <div>
                    {record.status === 'present' && (
                      <div className="flex items-center gap-1 text-blue-700 bg-blue-50 border border-blue-200/80 px-1.5 py-1 rounded-md text-[11px] font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">حضور ({record.timestamp.slice(0, 5)})</span>
                      </div>
                    )}
                    {record.status === 'absent' && (
                      <div className="flex items-center gap-1 text-rose-700 bg-rose-50 border border-rose-200/80 px-1.5 py-1 rounded-md text-[11px] font-semibold">
                        <XCircle className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">غياب</span>
                      </div>
                    )}
                    {record.status === 'off' && (
                      <div className="flex items-center gap-1 text-slate-700 bg-slate-100 border border-slate-200 px-1.5 py-1 rounded-md text-[11px] font-semibold">
                        <Coffee className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">لا عمل</span>
                      </div>
                    )}

                    {record.note && (
                      <p className="text-[10px] text-slate-500 truncate mt-1">
                        {record.note}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="hidden group-hover:flex items-center justify-center text-xs text-slate-400 py-1 border border-dashed border-slate-300 rounded-md">
                    <Plus className="w-3 h-3 ml-1" />
                    <span>تسجيل</span>
                  </div>
                )}
              </div>

              <div className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                تعديل ↗
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
