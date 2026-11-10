/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef } from 'react';
import { AttendanceRecord, AttendanceStatus } from '../types/attendance';
import { ARABIC_DAYS, parseISODate, getStatusLabel } from '../utils/dateUtils';
import { exportAttendanceToCSV, exportBackupJSON } from '../utils/exportUtils';
import {
  Search,
  Download,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Coffee,
  Edit2,
  Trash2,
  Filter,
  ArrowUpDown,
  FileJson,
} from 'lucide-react';

interface HistoryTableViewProps {
  records: AttendanceRecord[];
  onEditRecord: (isoDate: string) => void;
  onDeleteRecord: (id: string) => void;
  onImportRecords: (records: AttendanceRecord[]) => void;
}

export const HistoryTableView: React.FC<HistoryTableViewProps> = ({
  records,
  onEditRecord,
  onDeleteRecord,
  onImportRecords,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | AttendanceStatus>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter & Sort
  const filteredRecords = useMemo(() => {
    return records
      .filter((record) => {
        // Status filter
        if (statusFilter !== 'all' && record.status !== statusFilter) {
          return false;
        }

        // Search filter
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const dateObj = parseISODate(record.date);
          const dayName = (ARABIC_DAYS[dateObj.getDay()] || '').toLowerCase();
          const noteText = (record.note || '').toLowerCase();
          const dateStr = record.date.toLowerCase();

          return (
            dayName.includes(term) ||
            noteText.includes(term) ||
            dateStr.includes(term)
          );
        }

        return true;
      })
      .sort((a, b) => {
        return sortOrder === 'desc'
          ? b.date.localeCompare(a.date)
          : a.date.localeCompare(b.date);
      });
  }, [records, statusFilter, searchTerm, sortOrder]);

  const handleExportCSV = () => {
    exportAttendanceToCSV(filteredRecords, `سجل_الدوام_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const handleExportJSON = () => {
    exportBackupJSON(records, `نسخة_احتياطية_الدوام_${new Date().toISOString().slice(0, 10)}.json`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
          onImportRecords(json);
          alert(`تم استيراد ${json.length} سجل حضور بنجاح!`);
        } else {
          alert('الملف المحدد ليس بتنسيق JSON صحيح لسجلات الحضور.');
        }
      } catch (err) {
        alert('حدث خطأ أثناء قراءة ملف النسخة الاحتياطية.');
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  return (
    <section className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 mb-8 no-print">
      {/* Header and Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-100 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-900">سجل الحضور والدوام التفصيلي</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            إجمالي السجلات المحفوظة: <span className="font-semibold text-slate-800 font-mono tabular-nums">{records.length}</span> يوم
          </p>
        </div>

        {/* Export & Import Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors flex items-center gap-1.5"
            title="تصدير جدول الحضور بتنسيق Excel CSV يدعم اللغة العربية"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>تصدير CSV (Excel)</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-50 text-slate-800 border border-slate-200 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
            title="حفظ نسخة احتياطية كاملة للملفات بصيغة JSON"
          >
            <FileJson className="w-4 h-4 text-slate-600" />
            <span>نسخ احتياطي JSON</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-50 text-slate-800 border border-slate-200 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
            title="استيراد بيانات من نسخة سابقة"
          >
            <Upload className="w-4 h-4 text-slate-600" />
            <span>استيراد</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث بالتاريخ، اليوم، أو الملاحظة..."
            className="w-full pl-3 pr-9 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Status Filters & Sort Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Segmented status filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                statusFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setStatusFilter('present')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                statusFilter === 'present'
                  ? 'bg-blue-600 text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              حضور
            </button>
            <button
              onClick={() => setStatusFilter('absent')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                statusFilter === 'absent'
                  ? 'bg-rose-600 text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              غياب
            </button>
            <button
              onClick={() => setStatusFilter('off')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                statusFilter === 'off'
                  ? 'bg-slate-700 text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              لا عمل
            </button>
          </div>

          {/* Sort Button */}
          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center gap-1.5"
            title="تبديل ترتيب التاريخ"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>{sortOrder === 'desc' ? 'الأحدث أولاً' : 'الأقدم أولاً'}</span>
          </button>
        </div>
      </div>

      {/* Table Data */}
      <div className="overflow-x-auto border border-slate-200 rounded-xl mt-2">
        <table className="w-full text-right text-sm">
          <thead className="bg-slate-50/80 border-b border-slate-200 text-xs text-slate-500 uppercase">
            <tr>
              <th className="px-4 py-3 font-semibold">التاريخ</th>
              <th className="px-4 py-3 font-semibold">اليوم</th>
              <th className="px-4 py-3 font-semibold">حالة الدوام</th>
              <th className="px-4 py-3 font-semibold">وقت التسجيل</th>
              <th className="px-4 py-3 font-semibold">الملاحظات</th>
              <th className="px-4 py-3 font-semibold text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredRecords.length > 0 ? (
              filteredRecords.map((record) => {
                const dateObj = parseISODate(record.date);
                const dayName = ARABIC_DAYS[dateObj.getDay()] || '';

                return (
                  <tr key={record.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Date */}
                    <td className="px-4 py-3 font-mono font-semibold text-slate-900 tabular-nums">
                      {record.date}
                    </td>

                    {/* Day */}
                    <td className="px-4 py-3 text-slate-700 font-medium">
                      {dayName}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      {record.status === 'present' && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-md">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>حضور</span>
                        </span>
                      )}
                      {record.status === 'absent' && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-md">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>غياب</span>
                        </span>
                      )}
                      {record.status === 'off' && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md">
                          <Coffee className="w-3.5 h-3.5" />
                          <span>لا عمل / عطلة</span>
                        </span>
                      )}
                    </td>

                    {/* Timestamp */}
                    <td className="px-4 py-3 font-mono text-xs text-slate-600 tabular-nums">
                      {record.timestamp}
                    </td>

                    {/* Note */}
                    <td className="px-4 py-3 text-xs text-slate-600 max-w-xs truncate">
                      {record.note || <span className="text-slate-300">-</span>}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-center">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => onEditRecord(record.date)}
                          className="p-1.5 rounded-md text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="تعديل هذا اليوم"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`هل أنت متأكد من حذف سجل يوم ${record.date}؟`)) {
                              onDeleteRecord(record.id);
                            }
                          }}
                          className="p-1.5 rounded-md text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="حذف هذا السجل"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                  لا توجد سجلات تطابق معايير البحث الحالية
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};
