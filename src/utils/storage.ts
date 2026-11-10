/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AttendanceRecord, ReminderSettings } from '../types/attendance';
import { formatISODate } from './dateUtils';

const STORAGE_KEY_RECORDS = 'attendance_tracker_records_v1';
const STORAGE_KEY_SETTINGS = 'attendance_tracker_settings_v1';

export const DEFAULT_SETTINGS: ReminderSettings = {
  reminderStartTime: '08:30',
  reminderIntervalMinutes: 30,
  soundChimeEnabled: true,
  notificationsEnabled: false,
  employeeName: 'أيمن بوجدار',
  department: 'إدارة العمليات والتطوير',
  workplace: 'المقر الرئيسي',
};

/**
 * Generate sensible initial sample records for current month up to yesterday
 */
function generateSeedRecords(): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); // 0-indexed
  const currentDay = today.getDate();

  // Seed previous days of the current month
  for (let d = 1; d < currentDay; d++) {
    const dateObj = new Date(year, month, d);
    const dayOfWeek = dateObj.getDay(); // 0 = Sunday, 5 = Friday, 6 = Saturday
    const iso = formatISODate(dateObj);

    if (dayOfWeek === 5 || dayOfWeek === 6) {
      // Weekend: off
      records.push({
        id: iso,
        date: iso,
        status: 'off',
        timestamp: '10:00:00 ص',
        note: 'عطلة نهاية الأسبوع',
        updatedAt: dateObj.getTime(),
      });
    } else if (d === Math.max(1, currentDay - 2) && currentDay > 3) {
      // An occasional recorded absence with note
      records.push({
        id: iso,
        date: iso,
        status: 'absent',
        timestamp: '09:00:00 ص',
        note: 'إجازة اعتيادية مبررة',
        updatedAt: dateObj.getTime(),
      });
    } else {
      // Normal present day
      const randomMinutes = Math.floor(Math.random() * 20) + 15;
      const note = d % 4 === 0 ? 'عمل عن بعد' : undefined;
      records.push({
        id: iso,
        date: iso,
        status: 'present',
        timestamp: `08:${String(randomMinutes).padStart(2, '0')}:12 ص`,
        note,
        updatedAt: dateObj.getTime(),
      });
    }
  }

  // Also seed some records in the previous month for rich history navigation
  const prevMonthDate = new Date(year, month - 1, 1);
  const prevYear = prevMonthDate.getFullYear();
  const prevMonth = prevMonthDate.getMonth();
  const prevMonthDays = new Date(prevYear, prevMonth + 1, 0).getDate();

  for (let d = 1; d <= prevMonthDays; d++) {
    const dObj = new Date(prevYear, prevMonth, d);
    const dow = dObj.getDay();
    const iso = formatISODate(dObj);

    if (dow === 5 || dow === 6) {
      records.push({
        id: iso,
        date: iso,
        status: 'off',
        timestamp: '09:00:00 ص',
        note: 'عطلة نهاية الأسبوع',
        updatedAt: dObj.getTime(),
      });
    } else if (d === 14) {
      records.push({
        id: iso,
        date: iso,
        status: 'absent',
        timestamp: '09:15:00 ص',
        note: 'مهمة عمل خارجية',
        updatedAt: dObj.getTime(),
      });
    } else {
      records.push({
        id: iso,
        date: iso,
        status: 'present',
        timestamp: '08:25:30 ص',
        note: d === 10 ? 'حضور مبكر' : undefined,
        updatedAt: dObj.getTime(),
      });
    }
  }

  return records;
}

export function loadStoredRecords(): AttendanceRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY_RECORDS);
    if (!stored) {
      const seeded = generateSeedRecords();
      localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(seeded));
      return seeded;
    }
    return JSON.parse(stored) as AttendanceRecord[];
  } catch (e) {
    console.error('Failed to load records from storage:', e);
    return [];
  }
}

export function saveStoredRecords(records: AttendanceRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to save records to storage:', e);
  }
}

export function loadStoredSettings(): ReminderSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
    return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
  } catch (e) {
    console.error('Failed to load settings from storage:', e);
    return DEFAULT_SETTINGS;
  }
}

export function saveStoredSettings(settings: ReminderSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings to storage:', e);
  }
}
