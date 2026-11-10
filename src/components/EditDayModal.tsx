/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AttendanceRecord, AttendanceStatus } from '../types/attendance';
import {
  parseISODate,
  formatFullArabicDate,
  formatArabicTime,
  getStatusLabel,
} from '../utils/dateUtils';
import { X, CheckCircle2, XCircle, Coffee, Trash2, Check, Clock } from 'lucide-react';

interface EditDayModalProps {
  isoDate: string | null;
  initialRecord?: AttendanceRecord;
  onClose: () => void;
  onSave: (record: AttendanceRecord) => void;
  onDelete?: (id: string) => void;
}

const COMMON_NOTES = [
  'عمل عن بعد (Remote)',
  'إجازة سنوية',
  'إجازة مرضية',
  'عطلة نهاية الأسبوع',
  'تأخير مبرر',
  'مهمة عمل ميدانية',
];

export const EditDayModal: React.FC<EditDayModalProps> = ({
  isoDate,
  initialRecord,
  onClose,
  onSave,
  onDelete,
}) => {
  if (!isoDate) return null;

  const dateObj = parseISODate(isoDate);
  const arabicDate = formatFullArabicDate(dateObj);

  const [status, setStatus] = useState<AttendanceStatus>(initialRecord?.status || 'present');
  const [timestamp, setTimestamp] = useState<string>(initialRecord?.timestamp || formatArabicTime());
  const [note, setNote] = useState<string>(initialRecord?.note || '');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: AttendanceRecord = {
      id: isoDate,
      date: isoDate,
      status,
      timestamp,
      note: note.trim() || undefined,
      updatedAt: Date.now(),
    };
    onSave(updated);
    onClose();
  };

  const handleDelete = () => {
    if (confirm(`هل أنت متأكد من مسح بيانات يوم ${arabicDate} وإعادته كغير مسجل؟`)) {
      if (onDelete && initialRecord) {
        onDelete(initialRecord.id);
      }
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs no-print animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden text-right">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div>
            <span className="text-xs font-semibold text-blue-600 block">تفاصيل وتسجيل اليوم</span>
            <h2 className="text-lg font-bold text-slate-900">{arabicDate}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          {/* Status Choice */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              حالة دوام اليوم:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setStatus('present')}
                className={`py-2.5 px-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                  status === 'present'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs font-bold'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-xs">حضور</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('absent')}
                className={`py-2.5 px-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                  status === 'absent'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-xs font-bold'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <XCircle className="w-4 h-4" />
                <span className="text-xs">غياب</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('off')}
                className={`py-2.5 px-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                  status === 'off'
                    ? 'bg-slate-800 text-white border-slate-800 shadow-xs font-bold'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Coffee className="w-4 h-4" />
                <span className="text-xs">لا عمل / راحة</span>
              </button>
            </div>
          </div>

          {/* Timestamp */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>توقيت التسجيل:</span>
            </label>
            <input
              type="text"
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
              placeholder="مثال: 08:30:00 ص"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              الملاحظة:
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="إجازة، عمل عن بعد، تأخير..."
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 mb-2"
            />
            {/* Quick badges */}
            <div className="flex flex-wrap items-center gap-1.5">
              {COMMON_NOTES.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setNote(n)}
                  className="text-[11px] bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded text-slate-600 transition-colors"
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            {initialRecord ? (
              <button
                type="button"
                onClick={handleDelete}
                className="px-3 py-2 text-xs font-semibold rounded-lg text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>مسح السجل</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>حفظ التعديل</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
