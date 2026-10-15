import React from 'react';
import { Menu, Plus, Calendar, CheckSquare, Clock, BookOpen, BarChart3, Settings, Shield, ShieldCheck, Sun, Moon } from 'lucide-react';
import { WeekData } from '../types';
import { LiveClock } from './LiveClock';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onAddTask: () => void;
  onToggleMobileSidebar: () => void;
  onOpenSettings: () => void;
  currentWeek: WeekData | null;
  userName: string;
  isAdmin: boolean;
  onOpenAdminPanel: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onAddTask,
  onToggleMobileSidebar,
  onOpenSettings,
  currentWeek,
  userName,
  isAdmin,
  onOpenAdminPanel,
  theme,
  onToggleTheme,
}) => {
  const tabs = [
    { id: 'tasks', label: 'Görevler & Plan', icon: CheckSquare },
    { id: 'daily', label: 'Günlük Akış', icon: Calendar },
    { id: 'notes', label: 'Not & Kaynaklar', icon: BookOpen },
    { id: 'timer', label: 'Odak Sayacı', icon: Clock },
    { id: 'stats', label: 'İstatistik', icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800 shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-colors animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Left: Mobile Toggle & Breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onToggleMobileSidebar}
              className="lg:hidden p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              title="Haftaları Göster"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb Trail */}
            <div className="flex items-center gap-2 text-xs sm:text-sm min-w-0">
              <span className="font-extrabold text-slate-900 dark:text-slate-100 tracking-tight shrink-0 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                {userName}
              </span>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-700 font-normal">/</span>
              {currentWeek ? (
                <div className="flex items-center gap-2 truncate">
                  <span className="inline-flex items-center font-bold text-blue-900 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded-md text-xs font-mono">
                    {currentWeek.weekNumber}. Hafta
                  </span>
                  <span className="text-slate-600 dark:text-slate-400 font-medium truncate hidden md:inline text-xs">
                    {currentWeek.title}
                  </span>
                </div>
              ) : (
                <span className="text-slate-500 dark:text-slate-400 text-xs">Genel Bakış</span>
              )}
            </div>
          </div>

          {/* Center: Modern Floating Pill Navigation */}
          <nav className="hidden xl:flex items-center p-1 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-white dark:bg-slate-900 text-blue-950 dark:text-blue-300 shadow-xs ring-1 ring-slate-900/5 dark:ring-white/10'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right: Actions, Theme & Admin */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Live Clock Component */}
            <LiveClock />

            {/* Theme Toggle (Light / Dark) */}
            <button
              onClick={onToggleTheme}
              className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 rounded-xl transition-all duration-150 cursor-pointer"
              title={theme === 'dark' ? 'Açık Temaya Geç (Gündüz Modu)' : 'Koyu Temaya Geç (Gece Modu)'}
              aria-label="Temayı Değiştir"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 transition-transform hover:rotate-45" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600 transition-transform hover:-rotate-12" />
              )}
            </button>

            {/* Admin Panel Button */}
            <button
              onClick={onOpenAdminPanel}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer border ${
                isAdmin
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 shadow-2xs hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
              }`}
            >
              {isAdmin ? (
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Shield className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              )}
              <span className="hidden md:inline">Admin Paneli</span>
              {isAdmin && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </button>

            {/* Quick Action Button */}
            <button
              onClick={onAddTask}
              className="group relative inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-gradient-to-b from-blue-500 via-blue-600 to-blue-700 hover:brightness-105 active:scale-98 rounded-xl transition-all duration-150 cursor-pointer shadow-xs whitespace-nowrap border border-blue-600/90 shadow-blue-500/20"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5] transition-transform group-hover:rotate-90 duration-200" />
              <span className="hidden sm:inline">Yeni Görev</span>
            </button>

            {/* Settings */}
            <button
              onClick={onOpenSettings}
              className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 rounded-xl transition-all duration-150 cursor-pointer"
              title="Profil & Hedef Ayarları"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Horizontal Tab Scrollbar */}
        <div className="flex xl:hidden overflow-x-auto py-2 gap-1.5 border-t border-slate-100 dark:border-slate-800 -mx-4 px-4 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-950/70 text-blue-900 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 bg-slate-50 dark:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
