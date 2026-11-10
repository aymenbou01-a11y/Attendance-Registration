/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AttendanceRecord, AttendanceStatus, ReminderSettings } from '../types/attendance';
import { getStatusLabel } from '../utils/dateUtils';
import { AlertTriangle, Bell, BellOff, CheckCircle, Clock } from 'lucide-react';

interface NotificationBannerProps {
  todayRecord?: AttendanceRecord;
  settings: ReminderSettings;
  onQuickRecord: (status: AttendanceStatus) => void;
  onOpenSettings: () => void;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  todayRecord,
  settings,
  onQuickRecord,
  onOpenSettings,
}) => {
  if (todayRecord) {
    // Attendance is registered for today! Show confirmation of silenced reminders
    return (
      <div className="bg-emerald-50/90 border border-emerald-200 rounded-xl p-3.5 mb-6 text-sm text-emerald-900 shadow-xs flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="font-semibold text-emerald-900">
              تم تسجيل حالة اليوم بنجاح: {getStatusLabel(todayRecord.status)} (في تمام {todayRecord.timestamp})
            </div>
            <div className="text-xs text-emerald-700 flex items-center gap-1.5 mt-0.5">
              <BellOff className="w-3.5 h-3.5 inline" />
              <span>تم إيقاف التنبيهات الدورية لبقية اليوم تلقائياً. موعد التنبيه القادم: غداً الساعة {settings.reminderStartTime} ص.</span>
            </div>
          </div>
        </div>

        <button
          onClick={onOpenSettings}
          className="text-xs font-medium text-emerald-800 hover:text-emerald-950 underline underline-offset-2 shrink-0"
        >
          تعديل وقت التنبيه
        </button>
      </div>
    );
  }

  // Today is NOT recorded: Show persistent warning banner
  return (
    <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 mb-6 shadow-xs text-amber-950 no-print animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5">
            <Bell className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2 font-bold text-amber-900">
              <span>تنبيه دوري مستمر: لم يتم تسجيل حضور اليوم بعد!</span>
              <span className="text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded font-mono font-normal">
                كل {settings.reminderIntervalMinutes} دقيقة
              </span>
            </div>
            <p className="text-xs sm:text-sm text-amber-800 mt-1">
              تستمر التنبيهات بالظهور وإصدار الصوت حتى تقوم باختيار حالة اليوم. بمجرد التسجيل، ستتوقف فوراً لبقية اليوم.
            </p>
          </div>
        </div>

        {/* Instant action buttons directly in the banner */}
        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          <button
            onClick={() => onQuickRecord('present')}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition-colors"
          >
            تسجيل حضور
          </button>
          <button
            onClick={() => onQuickRecord('absent')}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 text-white hover:bg-rose-700 shadow-xs transition-colors"
          >
            غياب
          </button>
          <button
            onClick={() => onQuickRecord('off')}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-700 text-white hover:bg-slate-800 shadow-xs transition-colors"
          >
            لا عمل
          </button>
        </div>
      </div>
    </div>
  );
};
