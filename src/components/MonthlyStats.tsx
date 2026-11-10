/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AttendanceRecord } from '../types/attendance';
import { ARABIC_MONTHS, ARABIC_DAYS, getDaysInMonth, formatISODate, parseISODate, getStatusLabel } from '../utils/dateUtils';
import {
  CheckCircle2,
  XCircle,
  Coffee,
  TrendingUp,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Info,
} from 'lucide-react';

interface MonthlyStatsProps {
  selectedYear: number;
  selectedMonth: number; // 1-12
  records: AttendanceRecord[];
  onMonthChange: (year: number, month: number) => void;
  onSelectDay?: (isoDate: string) => void;
}

export const MonthlyStats: React.FC<MonthlyStatsProps> = ({
  selectedYear,
  selectedMonth,
  records,
  onMonthChange,
  onSelectDay,
}) => {
  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
  const monthNameArabic = ARABIC_MONTHS[selectedMonth - 1];

  // Filter records for this selected year & month
  const monthPrefix = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
  const monthRecords = records.filter((r) => r.date.startsWith(monthPrefix));

  const presentCount = monthRecords.filter((r) => r.status === 'present').length;
  const absentCount = monthRecords.filter((r) => r.status === 'absent').length;
  const offCount = monthRecords.filter((r) => r.status === 'off').length;

  const totalWorkingDaysLogged = presentCount + absentCount;
  const commitmentRate =
    totalWorkingDaysLogged > 0
      ? Math.round((presentCount / totalWorkingDaysLogged) * 100)
      : 100;

  // Build full days map for the monthly distribution timeline bar
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => {
    const dayNum = i + 1;
    const iso = `${monthPrefix}-${String(dayNum).padStart(2, '0')}`;
    const record = monthRecords.find((r) => r.date === iso);
    const dateObj = parseISODate(iso);
    const dayOfWeek = ARABIC_DAYS[dateObj.getDay()];
    return {
      dayNum,
      iso,
      record,
      dayOfWeek,
    };
  });

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      onMonthChange(selectedYear - 1, 12);
    } else {
      onMonthChange(selectedYear, selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      onMonthChange(selectedYear + 1, 1);
    } else {
      onMonthChange(selectedYear, selectedMonth + 1);
    }
  };

  const handleCurrentMonth = () => {
    const now = new Date();
    onMonthChange(now.getFullYear(), now.getMonth() + 1);
  };

  const isCurrentMonthNow =
    selectedYear === new Date().getFullYear() &&
    selectedMonth === new Date().getMonth() + 1;

  // Commitment rating label
  const getCommitmentBadge = (rate: number) => {
    if (rate >= 95) return { text: 'التزام استثنائي', color: 'text-emerald-700 bg-emerald-50' };
    if (rate >= 85) return { text: 'التزام ممتاز', color: 'text-blue-700 bg-blue-50' };
    if (rate >= 75) return { text: 'التزام جيد', color: 'text-amber-700 bg-amber-50' };
    return { text: 'بحاجة لمتابعة', color: 'text-rose-700 bg-rose-50' };
  };

  const rating = getCommitmentBadge(commitmentRate);

  return (
    <section className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 mb-8 no-print">
      {/* Month Navigator Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
        <div>
          <span className="text-xs font-semibold text-slate-500">الملخص والإحصائيات الشهرية</span>
          <div className="flex items-center gap-3 mt-1">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              {monthNameArabic} {selectedYear}
            </h2>
            {!isCurrentMonthNow && (
              <button
                onClick={handleCurrentMonth}
                className="text-xs px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium transition-colors"
              >
                العودة للشهر الحالي
              </button>
            )}
          </div>
        </div>

        {/* Month Arrows */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
            title="الشهر السابق"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <span className="text-sm font-semibold text-slate-700 px-2 min-w-28 text-center font-mono">
            {String(selectedMonth).padStart(2, '0')} / {selectedYear}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
            title="الشهر التالي"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 4 Stat Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 py-6">
        {/* Card 1: Present */}
        <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">أيام الحضور (Present)</span>
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-blue-700 font-mono tabular-nums">
              {presentCount}
            </span>
            <span className="text-xs text-slate-500">أيام عمل</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            سجلت بدقة بالوقت والتاريخ
          </div>
        </div>

        {/* Card 2: Absent */}
        <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">أيام الغياب (Absent)</span>
            <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-rose-700 font-mono tabular-nums">
              {absentCount}
            </span>
            <span className="text-xs text-slate-500">أيام</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            إجازات معتمدة وغياب موثق
          </div>
        </div>

        {/* Card 3: Off / No Work */}
        <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">العطل والراحة (Off)</span>
            <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center">
              <Coffee className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-slate-800 font-mono tabular-nums">
              {offCount}
            </span>
            <span className="text-xs text-slate-500">أيام عطلة</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            نهاية أسبوع وإجازات رسمية
          </div>
        </div>

        {/* Card 4: Commitment Rate */}
        <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">نسبة الالتزام بالدوام</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
              {commitmentRate}%
            </span>
            <span className={`text-xs px-2 py-0.5 rounded font-medium ${rating.color}`}>
              {rating.text}
            </span>
          </div>
          {/* Visual Mini Progress Bar */}
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2.5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                commitmentRate >= 85 ? 'bg-blue-600' : commitmentRate >= 70 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${commitmentRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Visual Monthly Distribution Bar */}
      <div className="pt-4 border-t border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800">
              الشريط البياني البصري لتوزيع أيام الشهر ({daysInMonth} يوماً):
            </span>
            <span className="text-xs text-slate-400 hidden sm:inline">
              (انقر على أي يوم لعرضه أو تسجيله)
            </span>
          </div>

          {/* Color Legend */}
          <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-blue-600 inline-block" />
              <span>حضور ({presentCount})</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-rose-600 inline-block" />
              <span>غياب ({absentCount})</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-slate-700 inline-block" />
              <span>لا عمل ({offCount})</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-slate-200 border border-slate-300 inline-block" />
              <span>معلق / قادم</span>
            </span>
          </div>
        </div>

        {/* The Distribution Strip */}
        <div className="grid grid-cols-7 sm:grid-cols-10 md:grid-cols-15 lg:grid-cols-31 gap-1.5">
          {daysArray.map(({ dayNum, iso, record, dayOfWeek }) => {
            const isToday = iso === formatISODate(new Date());

            let bgClass = 'bg-slate-100 hover:bg-slate-200 text-slate-400 border border-dashed border-slate-300';
            let titleText = `${dayOfWeek} ${dayNum} ${monthNameArabic}: غير مسجل`;

            if (record?.status === 'present') {
              bgClass = 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs';
              titleText = `${dayOfWeek} ${dayNum} ${monthNameArabic}: حضور (${record.timestamp})${record.note ? ' - ' + record.note : ''}`;
            } else if (record?.status === 'absent') {
              bgClass = 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs';
              titleText = `${dayOfWeek} ${dayNum} ${monthNameArabic}: غياب${record.note ? ' - ' + record.note : ''}`;
            } else if (record?.status === 'off') {
              bgClass = 'bg-slate-700 hover:bg-slate-800 text-white shadow-xs';
              titleText = `${dayOfWeek} ${dayNum} ${monthNameArabic}: لا عمل / عطلة`;
            }

            return (
              <button
                key={iso}
                type="button"
                onClick={() => onSelectDay && onSelectDay(iso)}
                title={titleText}
                className={`relative h-11 rounded-lg flex flex-col items-center justify-center font-mono text-xs transition-transform hover:scale-105 cursor-pointer ${bgClass} ${
                  isToday ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                }`}
              >
                <span className="font-bold tabular-nums text-xs">{dayNum}</span>
                <span className="text-[9px] opacity-80">{dayOfWeek.slice(0, 3)}</span>
                {isToday && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
