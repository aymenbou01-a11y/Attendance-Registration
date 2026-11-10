/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AttendanceRecord, ReminderSettings } from '../types/attendance';
import {
  ARABIC_MONTHS,
  ARABIC_DAYS,
  getDaysInMonth,
  parseISODate,
  getStatusLabel,
} from '../utils/dateUtils';
import { Printer, Download, ArrowRight, CheckCircle2, Building, UserCheck } from 'lucide-react';
import { exportAttendanceToCSV } from '../utils/exportUtils';

interface PrintReportViewProps {
  selectedYear: number;
  selectedMonth: number;
  records: AttendanceRecord[];
  settings: ReminderSettings;
  onBackToDashboard: () => void;
}

export const PrintReportView: React.FC<PrintReportViewProps> = ({
  selectedYear,
  selectedMonth,
  records,
  settings,
  onBackToDashboard,
}) => {
  const monthNameArabic = ARABIC_MONTHS[selectedMonth - 1];
  const monthPrefix = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);

  // Month records
  const monthRecords = records.filter((r) => r.date.startsWith(monthPrefix));
  const recordsMap = new Map<string, AttendanceRecord>();
  monthRecords.forEach((r) => recordsMap.set(r.date, r));

  const presentCount = monthRecords.filter((r) => r.status === 'present').length;
  const absentCount = monthRecords.filter((r) => r.status === 'absent').length;
  const offCount = monthRecords.filter((r) => r.status === 'off').length;

  const totalWorkDays = presentCount + absentCount;
  const commitmentRate = totalWorkDays > 0 ? Math.round((presentCount / totalWorkDays) * 100) : 100;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    exportAttendanceToCSV(
      monthRecords,
      `تقرير_حضور_${monthNameArabic}_${selectedYear}.csv`
    );
  };

  return (
    <div className="space-y-6">
      {/* Top action bar - hidden on print */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs no-print">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToDashboard}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors flex items-center gap-1.5 text-xs font-semibold"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة للرئيسية</span>
          </button>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              معاينة التقرير الشهري للطباعة ({monthNameArabic} {selectedYear})
            </h2>
            <p className="text-xs text-slate-500">جاهز للطباعة المباشرة أو الحفظ كملف PDF</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-100 text-slate-800 hover:bg-slate-200 transition-colors flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>تصدير Excel CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة التقرير / حفظ PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Sheet */}
      <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 shadow-sm max-w-4xl mx-auto print:border-none print:shadow-none print:p-0">
        {/* Document Header */}
        <div className="border-b-2 border-slate-900 pb-6 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-500 font-bold block mb-1">
                تقرير الموارد البشرية والدوام الرسمي
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                بيان متابعة الحضور والانصراف الشهري
              </h1>
              <p className="text-sm font-semibold text-blue-700 mt-1">
                شهر: {monthNameArabic} {selectedYear}
              </p>
            </div>

            <div className="text-left text-xs text-slate-600 border border-slate-200 rounded-lg p-3 bg-slate-50 print:bg-transparent">
              <div className="font-bold text-slate-900">{settings.workplace || 'المقر الرئيسي'}</div>
              <div>{settings.department || 'إدارة العمليات'}</div>
              <div className="text-slate-400 mt-1 font-mono">
                تاريخ الإصدار: {new Date().toLocaleDateString('ar-EG')}
              </div>
            </div>
          </div>
        </div>

        {/* Employee Details Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 mb-6 text-xs print:bg-white print:border-slate-300">
          <div>
            <span className="text-slate-500 block">اسم الموظف:</span>
            <span className="font-bold text-slate-900 text-sm">{settings.employeeName || 'غير محدد'}</span>
          </div>
          <div>
            <span className="text-slate-500 block">القسم / الإدارة:</span>
            <span className="font-semibold text-slate-800">{settings.department || 'عام'}</span>
          </div>
          <div>
            <span className="text-slate-500 block">أيام العمل المجدولة:</span>
            <span className="font-semibold text-slate-800 font-mono">{totalWorkDays} أيام</span>
          </div>
          <div>
            <span className="text-slate-500 block">نسبة الالتزام بالدوام:</span>
            <span className="font-bold text-blue-700 text-sm font-mono">{commitmentRate}%</span>
          </div>
        </div>

        {/* Statistical Summary Box */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="border border-blue-200 bg-blue-50/50 rounded-lg p-3 text-center">
            <span className="text-xs text-blue-800 font-semibold block">إجمالي أيام الحضور</span>
            <span className="text-2xl font-extrabold text-blue-700 font-mono">{presentCount}</span>
          </div>
          <div className="border border-rose-200 bg-rose-50/50 rounded-lg p-3 text-center">
            <span className="text-xs text-rose-800 font-semibold block">إجمالي أيام الغياب</span>
            <span className="text-2xl font-extrabold text-rose-700 font-mono">{absentCount}</span>
          </div>
          <div className="border border-slate-200 bg-slate-50 rounded-lg p-3 text-center">
            <span className="text-xs text-slate-700 font-semibold block">أيام العطل والراحة</span>
            <span className="text-2xl font-extrabold text-slate-800 font-mono">{offCount}</span>
          </div>
        </div>

        {/* Full Days Table */}
        <div className="overflow-x-auto mb-8">
          <table className="w-full text-right text-xs border border-slate-300">
            <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
              <tr>
                <th className="p-2.5 border-l border-slate-300">اليوم والتاريخ</th>
                <th className="p-2.5 border-l border-slate-300">اسم اليوم</th>
                <th className="p-2.5 border-l border-slate-300">حالة الدوام</th>
                <th className="p-2.5 border-l border-slate-300">توقيت التسجيل</th>
                <th className="p-2.5">الملاحظات والبيان</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {Array.from({ length: daysInMonth }, (_, i) => {
                const dayNum = i + 1;
                const iso = `${monthPrefix}-${String(dayNum).padStart(2, '0')}`;
                const record = recordsMap.get(iso);
                const dateObj = parseISODate(iso);
                const dayOfWeek = ARABIC_DAYS[dateObj.getDay()];

                return (
                  <tr key={iso} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                    <td className="p-2 font-mono font-semibold text-slate-900 border-l border-slate-200">
                      {iso}
                    </td>
                    <td className="p-2 text-slate-700 border-l border-slate-200">
                      {dayOfWeek}
                    </td>
                    <td className="p-2 border-l border-slate-200 font-medium">
                      {record ? (
                        record.status === 'present' ? (
                          <span className="text-blue-700 font-semibold">حضور</span>
                        ) : record.status === 'absent' ? (
                          <span className="text-rose-700 font-semibold">غياب</span>
                        ) : (
                          <span className="text-slate-600">لا عمل</span>
                        )
                      ) : (
                        <span className="text-slate-400">غير مسجل</span>
                      )}
                    </td>
                    <td className="p-2 font-mono text-slate-600 border-l border-slate-200">
                      {record ? record.timestamp : '-'}
                    </td>
                    <td className="p-2 text-slate-600">
                      {record?.note || '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Signatures & Approvals Section */}
        <div className="pt-8 border-t border-slate-300 grid grid-cols-3 gap-6 text-center text-xs text-slate-700">
          <div>
            <div className="font-bold text-slate-900 mb-12">توقيع الموظف</div>
            <div className="border-t border-dashed border-slate-400 mx-auto w-32 pt-1">
              {settings.employeeName}
            </div>
          </div>
          <div>
            <div className="font-bold text-slate-900 mb-12">اعتماد المشرف المباشر</div>
            <div className="border-t border-dashed border-slate-400 mx-auto w-32 pt-1">
              التوقيع والختم
            </div>
          </div>
          <div>
            <div className="font-bold text-slate-900 mb-12">إدارة الموارد البشرية</div>
            <div className="border-t border-dashed border-slate-400 mx-auto w-32 pt-1">
              الاعتماد النهائي
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
