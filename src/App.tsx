/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { AttendanceRecord, AttendanceStatus, ReminderSettings, ActiveTab } from './types/attendance';
import {
  loadStoredRecords,
  saveStoredRecords,
  loadStoredSettings,
  saveStoredSettings,
} from './utils/storage';
import { formatISODate, formatArabicTime } from './utils/dateUtils';
import {
  isTimeAtOrAfter,
  sendBrowserNotification,
} from './utils/notificationManager';
import { Header } from './components/Header';
import { NotificationBanner } from './components/NotificationBanner';
import { TodayCard } from './components/TodayCard';
import { MonthlyStats } from './components/MonthlyStats';
import { CalendarView } from './components/CalendarView';
import { HistoryTableView } from './components/HistoryTableView';
import { PrintReportView } from './components/PrintReportView';
import { SettingsModal } from './components/SettingsModal';
import { EditDayModal } from './components/EditDayModal';

export default function App() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [settings, setSettings] = useState<ReminderSettings>(loadStoredSettings());
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  const today = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth() + 1);

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingDayISO, setEditingDayISO] = useState<string | null>(null);

  // Tracking last reminder dispatch in this session
  const lastReminderTimeRef = useRef<number>(0);

  // Load initial records on mount
  useEffect(() => {
    const loaded = loadStoredRecords();
    setRecords(loaded);
  }, []);

  // Save records whenever changed
  const updateRecords = (newRecords: AttendanceRecord[]) => {
    setRecords(newRecords);
    saveStoredRecords(newRecords);
  };

  const todayISO = formatISODate(today);
  const todayRecord = records.find((r) => r.date === todayISO);

  // Periodic Reminder Engine (Web Notifications & Chime)
  useEffect(() => {
    const checkReminder = () => {
      // 1. If today is already recorded, STOP alerts for the rest of today
      if (todayRecord) {
        return;
      }

      // 2. Check if current time is past start time
      const pastStartTime = isTimeAtOrAfter(settings.reminderStartTime);
      if (!pastStartTime) {
        return;
      }

      // 3. Check interval cadence
      const now = Date.now();
      const intervalMs = settings.reminderIntervalMinutes * 60 * 1000;
      if (now - lastReminderTimeRef.current >= intervalMs) {
        lastReminderTimeRef.current = now;

        // Dispatch notification & audio chime
        sendBrowserNotification('تذكير الحضور والدوام اليومي 🔔', {
          body: `مرحباً ${settings.employeeName}، لم تقم بتسجيل حضور اليوم بعد. يُرجى الدخول واختيار حالتك لإيقاف التنبيهات.`,
          playChime: settings.soundChimeEnabled,
          tag: 'attendance-daily-reminder',
        });
      }
    };

    // Check once immediately on load
    checkReminder();

    // Check every 30 seconds
    const intervalTimer = setInterval(checkReminder, 30000);
    return () => clearInterval(intervalTimer);
  }, [todayRecord, settings]);

  // Handlers for Today's Attendance
  const handleSaveTodayAttendance = (status: AttendanceStatus, note?: string) => {
    const existingIndex = records.findIndex((r) => r.date === todayISO);
    const newRecord: AttendanceRecord = {
      id: todayISO,
      date: todayISO,
      status,
      timestamp: formatArabicTime(),
      note,
      updatedAt: Date.now(),
    };

    let updated: AttendanceRecord[];
    if (existingIndex >= 0) {
      updated = [...records];
      updated[existingIndex] = newRecord;
    } else {
      updated = [newRecord, ...records];
    }

    updateRecords(updated);
  };

  const handleClearTodayAttendance = () => {
    const updated = records.filter((r) => r.date !== todayISO);
    updateRecords(updated);
  };

  // Handlers for Editing any Day
  const handleSaveDayRecord = (record: AttendanceRecord) => {
    const index = records.findIndex((r) => r.date === record.date);
    let updated: AttendanceRecord[];
    if (index >= 0) {
      updated = [...records];
      updated[index] = record;
    } else {
      updated = [record, ...records];
    }
    updateRecords(updated);
  };

  const handleDeleteRecord = (id: string) => {
    const updated = records.filter((r) => r.id !== id);
    updateRecords(updated);
  };

  const handleImportRecords = (imported: AttendanceRecord[]) => {
    updateRecords(imported);
  };

  const handleSaveSettings = (newSettings: ReminderSettings) => {
    setSettings(newSettings);
    saveStoredSettings(newSettings);
  };

  const editingRecord = editingDayISO
    ? records.find((r) => r.date === editingDayISO)
    : undefined;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isTodayLogged={Boolean(todayRecord)}
        unreadReminderCount={todayRecord ? 0 : 1}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Persistent Alert Banner if today is unlogged */}
        <NotificationBanner
          todayRecord={todayRecord}
          settings={settings}
          onQuickRecord={(status) => handleSaveTodayAttendance(status)}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* Tab 1: Dashboard (Today Card + Monthly Stats) */}
        {activeTab === 'dashboard' && (
          <div>
            <TodayCard
              todayRecord={todayRecord}
              onSaveAttendance={handleSaveTodayAttendance}
              onClearAttendance={handleClearTodayAttendance}
            />

            <MonthlyStats
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
              records={records}
              onMonthChange={(y, m) => {
                setSelectedYear(y);
                setSelectedMonth(m);
              }}
              onSelectDay={(iso) => setEditingDayISO(iso)}
            />
          </div>
        )}

        {/* Tab 2: Calendar View */}
        {activeTab === 'calendar' && (
          <div>
            <MonthlyStats
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
              records={records}
              onMonthChange={(y, m) => {
                setSelectedYear(y);
                setSelectedMonth(m);
              }}
              onSelectDay={(iso) => setEditingDayISO(iso)}
            />

            <CalendarView
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
              records={records}
              onSelectDay={(iso) => setEditingDayISO(iso)}
            />
          </div>
        )}

        {/* Tab 3: Detailed History Table */}
        {activeTab === 'history' && (
          <HistoryTableView
            records={records}
            onEditRecord={(iso) => setEditingDayISO(iso)}
            onDeleteRecord={handleDeleteRecord}
            onImportRecords={handleImportRecords}
          />
        )}

        {/* Tab 4: Official Printable Monthly Report */}
        {activeTab === 'reports' && (
          <PrintReportView
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            records={records}
            settings={settings}
            onBackToDashboard={() => setActiveTab('dashboard')}
          />
        )}
      </main>

      {/* Clean Footer (Anti-Slop: quiet copyright and actions, no fake tickers) */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>نظام متابعة الحضور والدوام اليومي © {new Date().getFullYear()}</span>
          <div className="flex items-center gap-4 text-xs">
            <span>التنبيه الصباحي: {settings.reminderStartTime}</span>
            <span aria-hidden="true">·</span>
            <span>التكرار: كل {settings.reminderIntervalMinutes} دقيقة</span>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="text-blue-600 hover:underline"
            >
              ضبط التنبيهات
            </button>
          </div>
        </div>
      </footer>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
      />

      {/* Edit Day Modal */}
      <EditDayModal
        isoDate={editingDayISO}
        initialRecord={editingRecord}
        onClose={() => setEditingDayISO(null)}
        onSave={handleSaveDayRecord}
        onDelete={handleDeleteRecord}
      />
    </div>
  );
}
