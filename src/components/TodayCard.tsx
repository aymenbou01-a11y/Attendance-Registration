/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { AttendanceRecord, AttendanceStatus } from '../types/attendance';
import { formatFullArabicDate, formatArabicTime, formatISODate } from '../utils/dateUtils';
import { playSuccessChime, playAttendanceChime } from '../utils/audioChime';
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  XCircle,
  Coffee,
  Sparkles,
  Edit3,
  MessageSquare,
  Check,
  RotateCcw,
} from 'lucide-react';

interface TodayCardProps {
  todayRecord?: AttendanceRecord;
  onSaveAttendance: (status: AttendanceStatus, note?: string) => void;
  onClearAttendance: () => void;
}

const COMMON_NOTES = [
  'عمل عن بعد (Remote)',
  'إجازة سنوية',
  'إجازة مرضية',
  'تأخير مبرر',
  'مهمة عمل ميدانية',
  'نصف يوم عمل',
];

export const TodayCard: React.FC<TodayCardProps> = ({
  todayRecord,
  onSaveAttendance,
  onClearAttendance,
}) => {
  const [currentTime, setCurrentTime] = useState<string>(formatArabicTime());
  const [note, setNote] = useState<string>(todayRecord?.note || '');
  const [isEditingNote, setIsEditingNote] = useState<boolean>(false);

  // Sync internal note if todayRecord changes externally
  useEffect(() => {
    if (todayRecord) {
      setNote(todayRecord.note || '');
    }
  }, [todayRecord]);

  // Live ticking clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(formatArabicTime());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2563eb', '#38bdf8', '#10b981', '#f59e0b'],
      });
    } catch {
      // Graceful fallback if canvas is not available
    }
  };

  const handleSelectStatus = (status: AttendanceStatus) => {
    if (status === 'present') {
      triggerConfetti();
      playSuccessChime();
    } else {
      playAttendanceChime();
    }
    onSaveAttendance(status, note.trim() || undefined);
    setIsEditingNote(false);
  };

  const handleUpdateNoteOnly = () => {
    if (todayRecord) {
      onSaveAttendance(todayRecord.status, note.trim() || undefined);
      setIsEditingNote(false);
    }
  };

  const today = new Date();
  const fullDateArabic = formatFullArabicDate(today);

  return (
    <section className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 mb-8 no-print">
      {/* Top row: Date, Day of Week, and Live Clock */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 tracking-wide mb-1">
            <CalendarDays className="w-4 h-4" />
            <span>تسجيل الحضور اليومي التلقائي (Auto-Date Tracker)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {fullDateArabic}
          </h1>
        </div>

        {/* Live Clock with seconds */}
        <div className="flex items-center gap-2.5 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl self-start sm:self-center">
          <Clock className="w-5 h-5 text-blue-600 animate-spin-slow" />
          <div className="flex flex-col">
            <span className="text-xs text-slate-500">التوقيت الحالي الدقيق</span>
            <span className="text-lg font-bold font-mono text-slate-900 tabular-nums">
              {currentTime}
            </span>
          </div>
        </div>
      </div>

      {/* Main interaction section */}
      <div className="pt-6">
        {todayRecord ? (
          /* Recorded State */
          <div className="bg-slate-50/80 rounded-xl p-5 border border-slate-200">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {todayRecord.status === 'present' && (
                  <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                )}
                {todayRecord.status === 'absent' && (
                  <div className="w-14 h-14 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-md">
                    <XCircle className="w-8 h-8" />
                  </div>
                )}
                {todayRecord.status === 'off' && (
                  <div className="w-14 h-14 rounded-2xl bg-slate-800 text-white flex items-center justify-center shadow-md">
                    <Coffee className="w-8 h-8" />
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">حالة دوام اليوم:</span>
                    <span
                      className={`text-sm font-bold px-2.5 py-0.5 rounded-md ${
                        todayRecord.status === 'present'
                          ? 'bg-blue-100 text-blue-800'
                          : todayRecord.status === 'absent'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-200 text-slate-800'
                      }`}
                    >
                      {todayRecord.status === 'present' && 'حضور (Present)'}
                      {todayRecord.status === 'absent' && 'غياب (Absent)'}
                      {todayRecord.status === 'off' && 'لا عمل / عطلة (Off)'}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 mt-1 flex items-center gap-2">
                    <span>سُجل في تمام:</span>
                    <span className="font-mono font-semibold text-slate-900 tabular-nums">
                      {todayRecord.timestamp}
                    </span>
                    {todayRecord.note && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-slate-700 italic">"{todayRecord.note}"</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Status change actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditingNote(!isEditingNote)}
                  className="px-3 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{todayRecord.note ? 'تعديل الملاحظة' : 'إضافة ملاحظة'}</span>
                </button>
                <button
                  onClick={onClearAttendance}
                  className="px-3 py-2 text-xs font-semibold rounded-lg bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 transition-colors flex items-center gap-1.5"
                  title="إلغاء التسجيل لإعادة الاختيار"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>تغيير الحالة</span>
                </button>
              </div>
            </div>

            {/* Note Editor Drawer when editing */}
            {isEditingNote && (
              <div className="mt-4 pt-4 border-t border-slate-200 flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-700">ملاحظات دوام اليوم:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="مثال: عمل عن بعد، إجازة سنوية، تأخير 20 دقيقة..."
                    className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleUpdateNoteOnly}
                    className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>حفظ الملاحظة</span>
                  </button>
                </div>
                {/* Note shortcuts */}
                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                  <span className="text-xs text-slate-500">خيارات سريعة:</span>
                  {COMMON_NOTES.map((commonNote) => (
                    <button
                      key={commonNote}
                      type="button"
                      onClick={() => setNote(commonNote)}
                      className="text-xs bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-600 px-2 py-1 rounded-md text-slate-600 transition-colors"
                    >
                      {commonNote}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Unrecorded / Primary Selector State */
          <div>
            <p className="text-sm text-slate-600 mb-4 font-medium">
              اختر حالة الدوام الخاصة بك لليوم. بمجرد الاختيار، سيتم توثيق وقت التسجيل بدقة وإيقاف التنبيهات لبقية اليوم:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
              {/* Option 1: حضور (Present) */}
              <button
                type="button"
                onClick={() => handleSelectStatus('present')}
                className="group relative flex flex-col p-5 rounded-xl border-2 border-blue-600 bg-blue-50/40 hover:bg-blue-600 hover:text-white transition-all duration-200 shadow-xs hover:shadow-md text-right cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white group-hover:bg-white group-hover:text-blue-600 flex items-center justify-center transition-colors">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <Sparkles className="w-4 h-4 text-blue-500 group-hover:text-amber-300 transition-colors" />
                </div>
                <span className="text-lg font-bold text-blue-900 group-hover:text-white mb-1">
                  حضور (Present)
                </span>
                <span className="text-xs text-blue-800/80 group-hover:text-blue-100">
                  تسجيل دوام في المقر أو عن بعد مع احتساب نسبة الالتزام
                </span>
              </button>

              {/* Option 2: غياب (Absent) */}
              <button
                type="button"
                onClick={() => handleSelectStatus('absent')}
                className="group relative flex flex-col p-5 rounded-xl border-2 border-rose-300 hover:border-rose-600 bg-rose-50/40 hover:bg-rose-600 hover:text-white transition-all duration-200 shadow-xs hover:shadow-md text-right cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 rounded-xl bg-rose-600 text-white group-hover:bg-white group-hover:text-rose-600 flex items-center justify-center transition-colors">
                    <XCircle className="w-6 h-6" />
                  </div>
                </div>
                <span className="text-lg font-bold text-rose-900 group-hover:text-white mb-1">
                  غياب (Absent)
                </span>
                <span className="text-xs text-rose-800/80 group-hover:text-rose-100">
                  توثيق الإجازات السنوية أو المرضية أو الغياب الطارئ
                </span>
              </button>

              {/* Option 3: لا عمل (Off / No Work) */}
              <button
                type="button"
                onClick={() => handleSelectStatus('off')}
                className="group relative flex flex-col p-5 rounded-xl border-2 border-slate-300 hover:border-slate-800 bg-slate-50 hover:bg-slate-800 hover:text-white transition-all duration-200 shadow-xs hover:shadow-md text-right cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 rounded-xl bg-slate-700 text-white group-hover:bg-white group-hover:text-slate-800 flex items-center justify-center transition-colors">
                    <Coffee className="w-6 h-6" />
                  </div>
                </div>
                <span className="text-lg font-bold text-slate-900 group-hover:text-white mb-1">
                  لا عمل (Off / Rest)
                </span>
                <span className="text-xs text-slate-600 group-hover:text-slate-300">
                  عطلات نهاية الأسبوع، أيام الراحة الرسمية، والأعياد
                </span>
              </button>
            </div>

            {/* Note & Shortcuts before clicking */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                ملاحظة اختيارية لليوم (تُحفظ مع الحالة):
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="أدخل ملاحظة إن وجدت (مثال: عمل عن بعد، تأخير معتمد...)"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 mb-2"
              />
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-slate-500">إضافة سريعة:</span>
                {COMMON_NOTES.map((commonNote) => (
                  <button
                    key={commonNote}
                    type="button"
                    onClick={() => setNote(commonNote)}
                    className="text-xs bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-600 px-2 py-0.5 rounded text-slate-600 transition-colors"
                  >
                    + {commonNote}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
