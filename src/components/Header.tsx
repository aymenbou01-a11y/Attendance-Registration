/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ActiveTab } from '../types/attendance';
import { Bell, Calendar, CheckCircle2, FileSpreadsheet, Printer, Sliders } from 'lucide-react';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenSettings: () => void;
  isTodayLogged: boolean;
  unreadReminderCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onOpenSettings,
  isTodayLogged,
  unreadReminderCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Wordmark Brand Title */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
                متابع الحضور والدوام
              </span>
              <span className="text-xs text-slate-500 hidden sm:inline-block">
                نظام التسجيل والتنبيهات اليومية الذكية
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2 text-sm font-medium text-slate-600">
            <button
              onClick={() => onTabChange('dashboard')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'dashboard'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>تسجيل اليوم</span>
            </button>
            <button
              onClick={() => onTabChange('calendar')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'calendar'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>التقويم الشهري</span>
            </button>
            <button
              onClick={() => onTabChange('history')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'history'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>سجل الحضور</span>
            </button>
            <button
              onClick={() => onTabChange('reports')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'reports'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Printer className="w-4 h-4" />
              <span>التقرير والطباعة</span>
            </button>
          </nav>

          {/* Zone 3: 1 Primary Action (Settings & Alerts Trigger) */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenSettings}
              className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
                !isTodayLogged
                  ? 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
                  : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
              }`}
              title="إعدادات التنبيه والمزامنة"
            >
              <Sliders className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">إعدادات التنبيه</span>
              {!isTodayLogged && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="التسجيل معلق" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-100 py-1.5 px-2 bg-slate-50/80">
        <button
          onClick={() => onTabChange('dashboard')}
          className={`flex flex-col items-center py-1 px-2 text-xs ${
            activeTab === 'dashboard' ? 'text-blue-600 font-bold' : 'text-slate-600'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 mb-0.5" />
          <span>اليوم</span>
        </button>
        <button
          onClick={() => onTabChange('calendar')}
          className={`flex flex-col items-center py-1 px-2 text-xs ${
            activeTab === 'calendar' ? 'text-blue-600 font-bold' : 'text-slate-600'
          }`}
        >
          <Calendar className="w-4 h-4 mb-0.5" />
          <span>التقويم</span>
        </button>
        <button
          onClick={() => onTabChange('history')}
          className={`flex flex-col items-center py-1 px-2 text-xs ${
            activeTab === 'history' ? 'text-blue-600 font-bold' : 'text-slate-600'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 mb-0.5" />
          <span>السجل</span>
        </button>
        <button
          onClick={() => onTabChange('reports')}
          className={`flex flex-col items-center py-1 px-2 text-xs ${
            activeTab === 'reports' ? 'text-blue-600 font-bold' : 'text-slate-600'
          }`}
        >
          <Printer className="w-4 h-4 mb-0.5" />
          <span>التقرير</span>
        </button>
      </div>
    </header>
  );
};
