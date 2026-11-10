/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AttendanceStatus = 'present' | 'absent' | 'off';

export interface AttendanceRecord {
  id: string; // ISO date 'YYYY-MM-DD'
  date: string; // 'YYYY-MM-DD'
  status: AttendanceStatus;
  timestamp: string; // e.g., '08:42:15 ص'
  note?: string; // Optional note (e.g. 'عمل عن بعد', 'إجازة سنوية', 'تأخير 15 دقيقة')
  updatedAt: number;
}

export interface ReminderSettings {
  reminderStartTime: string; // 'HH:mm' e.g., '08:30'
  reminderIntervalMinutes: number; // 15 | 30 | 45 | 60
  soundChimeEnabled: boolean;
  notificationsEnabled: boolean;
  employeeName: string;
  department: string;
  workplace: string;
  lastReminderSentDate?: string;
  lastReminderSentTime?: number;
}

export type ActiveTab = 'dashboard' | 'calendar' | 'history' | 'reports';

export interface MonthlyStatsData {
  totalDaysInMonth: number;
  presentCount: number;
  absentCount: number;
  offCount: number;
  pendingCount: number;
  commitmentRate: number; // Percentage 0 - 100
  totalWorkDaysScheduled: number;
}
