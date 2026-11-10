/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ReminderSettings } from '../types/attendance';
import {
  getBrowserNotificationPermission,
  requestBrowserNotificationPermission,
  sendBrowserNotification,
} from '../utils/notificationManager';
import { playAttendanceChime } from '../utils/audioChime';
import {
  X,
  Bell,
  Clock,
  Volume2,
  VolumeX,
  CheckCircle2,
  ShieldCheck,
  Building,
  User,
  Sparkles,
  Play,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ReminderSettings;
  onSaveSettings: (settings: ReminderSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [formData, setFormData] = useState<ReminderSettings>(settings);
  const [permissionState, setPermissionState] = useState(getBrowserNotificationPermission());
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    const res = await requestBrowserNotificationPermission();
    setPermissionState(res);
    if (res === 'granted') {
      setFormData((prev) => ({ ...prev, notificationsEnabled: true }));
      sendBrowserNotification('تم تفعيل إشعارات الحضور بنجاح!', {
        body: 'سيتم تذكيرك يومياً بتسجيل الحضور بدءاً من الوقت المحدد وحتى تسجيل حالتك.',
        playChime: formData.soundChimeEnabled,
      });
    }
  };

  const handleTestChimeAndNotification = () => {
    if (formData.soundChimeEnabled) {
      playAttendanceChime();
    }
    sendBrowserNotification('تجربة تذكير الحضور والدوام', {
      body: 'هذا نموذج لتنبيه الدوام الدوري. عند بدء يوم العمل ستتلقى هذا الإشعار حتى تسجل حالتك.',
      playChime: false, // already played above if enabled
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs no-print animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden text-right">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">إعدادات التنبيه والدوام</h2>
              <p className="text-xs text-slate-500">تخصيص مواعيد التذكيرات والنغمة والبيانات الشخصية</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSave} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Section 1: Reminder Schedule */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              جدولة التذكير المستمر
            </h3>

            {/* Start Time */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>وقت بدء التذكير الصباحي:</span>
              </label>
              <input
                type="time"
                value={formData.reminderStartTime}
                onChange={(e) =>
                  setFormData({ ...formData, reminderStartTime: e.target.value })
                }
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                required
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                يبدأ إرسال التنبيهات يومياً عند هذا الوقت إذا لم يتم تسجيل الحضور مسبقاً.
              </span>
            </div>

            {/* Reminder Interval */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                تكرار التنبيه حتى التسجيل:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[15, 30, 45, 60].map((interval) => (
                  <button
                    key={interval}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, reminderIntervalMinutes: interval })
                    }
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                      formData.reminderIntervalMinutes === interval
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    كل {interval} د
                  </button>
                ))}
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                يستمر إرسال الإشعار كل {formData.reminderIntervalMinutes} دقيقة حتى اختيار حالة اليوم.
              </span>
            </div>
          </div>

          {/* Section 2: Audio Chime & Browser Notification */}
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              التنبيهات الصوتية والمتصفح
            </h3>

            {/* Sound Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2.5">
                {formData.soundChimeEnabled ? (
                  <Volume2 className="w-5 h-5 text-blue-600" />
                ) : (
                  <VolumeX className="w-5 h-5 text-slate-400" />
                )}
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    النغمة الصوتية (Chime Sound)
                  </span>
                  <span className="text-[11px] text-slate-500">
                    تشغيل رنين لطيف عند وصول التذكير وعند تأكيد الحضور
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.soundChimeEnabled}
                onChange={(e) =>
                  setFormData({ ...formData, soundChimeEnabled: e.target.checked })
                }
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
              />
            </div>

            {/* Browser Push Permission & Test */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-slate-600" />
                  <span className="text-xs font-bold text-slate-800">إشعارات المتصفح (Web Notifications)</span>
                </div>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded font-semibold ${
                    permissionState === 'granted'
                      ? 'bg-emerald-100 text-emerald-800'
                      : permissionState === 'denied'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {permissionState === 'granted'
                    ? 'مفعل ومسموح'
                    : permissionState === 'denied'
                    ? 'محظور بالمتصفح'
                    : 'بحاجة إذن'}
                </span>
              </div>

              {permissionState !== 'granted' ? (
                <button
                  type="button"
                  onClick={handleRequestPermission}
                  className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>السماح بإشعارات المتصفح الآن</span>
                </button>
              ) : (
                <p className="text-[11px] text-emerald-700">
                  الإشعارات مفعّلة: ستصلك تنبيهات سطح المكتب حتى عند تصغير النافذة.
                </p>
              )}

              {/* Instant Test Button */}
              <button
                type="button"
                onClick={handleTestChimeAndNotification}
                className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors flex items-center justify-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 text-blue-600" />
                <span>زر فوري لاختبار الإشعار والنغمة الصوتية الآن</span>
              </button>
            </div>
          </div>

          {/* Section 3: Profile for Print Reports */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              بيانات الموظف للتقارير الرسمية
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>اسم الموظف:</span>
              </label>
              <input
                type="text"
                value={formData.employeeName}
                onChange={(e) =>
                  setFormData({ ...formData, employeeName: e.target.value })
                }
                placeholder="مثال: أيمن بوجدار"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-slate-500" />
                  <span>القسم / الإدارة:</span>
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) =>
                    setFormData({ ...formData, department: e.target.value })
                  }
                  placeholder="إدارة العمليات والتطوير"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  جهة العمل / المقر:
                </label>
                <input
                  type="text"
                  value={formData.workplace}
                  onChange={(e) =>
                    setFormData({ ...formData, workplace: e.target.value })
                  }
                  placeholder="المقر الرئيسي"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Footer Save Button */}
          <div className="pt-5 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-all flex items-center gap-1.5"
            >
              {saveSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                  <span>تم الحفظ!</span>
                </>
              ) : (
                <span>حفظ التعديلات</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
