/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { playAttendanceChime } from './audioChime';

export type NotificationPermissionState = 'granted' | 'denied' | 'default' | 'unsupported';

export function getBrowserNotificationPermission(): NotificationPermissionState {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission as NotificationPermissionState;
}

export async function requestBrowserNotificationPermission(): Promise<NotificationPermissionState> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  try {
    const perm = await Notification.requestPermission();
    return perm as NotificationPermissionState;
  } catch (err) {
    console.warn('Error requesting notification permission:', err);
    return Notification.permission as NotificationPermissionState;
  }
}

export function sendBrowserNotification(
  title: string,
  options: {
    body: string;
    icon?: string;
    playChime?: boolean;
    tag?: string;
  }
): boolean {
  if (options.playChime) {
    playAttendanceChime();
  }

  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    try {
      const notifOptions: NotificationOptions = {
        body: options.body,
        icon: options.icon || '/favicon.ico',
        tag: options.tag || 'attendance-reminder',
      };
      // renotify is part of modern Notifications API specification
      (notifOptions as Record<string, unknown>).renotify = true;
      new Notification(title, notifOptions);
      return true;
    } catch (e) {
      console.warn('Failed to dispatch native notification:', e);
      return false;
    }
  }
  return false;
}

/**
 * Checks if current time is at or after 'HH:mm'
 */
export function isTimeAtOrAfter(targetTimeStr: string, currentDate: Date = new Date()): boolean {
  const [targetH, targetM] = targetTimeStr.split(':').map(Number);
  const currentH = currentDate.getHours();
  const currentM = currentDate.getMinutes();

  if (currentH > targetH) return true;
  if (currentH === targetH && currentM >= targetM) return true;
  return false;
}
