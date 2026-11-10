/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const ARABIC_DAYS = [
  'الأحد',
  'الإثنين',
  'الثلاثاء',
  'الأربعاء',
  'الخميس',
  'الجمعة',
  'السبت',
];

export const ARABIC_MONTHS = [
  'يناير',
  'فبراير',
  'مارس',
  'أبريل',
  'مايو',
  'يونيو',
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر',
];

/**
 * Returns formatted ISO date YYYY-MM-DD
 */
export function formatISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Parses YYYY-MM-DD into a local Date object safely
 */
export function parseISODate(isoString: string): Date {
  const [year, month, day] = isoString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Formats a date into a rich Arabic string, e.g. "الثلاثاء، 10 نوفمبر 2026"
 */
export function formatFullArabicDate(date: Date): string {
  const dayName = ARABIC_DAYS[date.getDay()];
  const dayNumber = date.getDate();
  const monthName = ARABIC_MONTHS[date.getMonth()];
  const year = date.getFullYear();
  return `${dayName}، ${dayNumber} ${monthName} ${year}`;
}

/**
 * Formats a time into Arabic 12-hour format with AM/PM (ص / م)
 */
export function formatArabicTime(date: Date = new Date()): string {
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const period = hours >= 12 ? 'م' : 'ص';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  return `${String(hours).padStart(2, '0')}:${minutes}:${seconds} ${period}`;
}

/**
 * Returns number of days in a specific year and month (1-indexed month 1-12)
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * Returns weekday index of the first day of the month (0 = Sunday, 6 = Saturday)
 */
export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month - 1, 1).getDay();
}

/**
 * Checks if a given ISO date is today
 */
export function isTodayISO(isoString: string): boolean {
  return isoString === formatISODate(new Date());
}

/**
 * Returns status text in Arabic
 */
export function getStatusLabel(status: 'present' | 'absent' | 'off'): string {
  switch (status) {
    case 'present':
      return 'حضور';
    case 'absent':
      return 'غياب';
    case 'off':
      return 'لا عمل';
  }
}
