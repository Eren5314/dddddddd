import React from 'react';
import { Menu, Plus, Calendar, CheckSquare, Clock, BookOpen, BarChart3, Settings } from 'lucide-react';
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
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onAddTask,
  onToggleMobileSidebar,
  onOpenSettings,
  currentWeek,
  userName,
}) => {
  const tabs = [
    { id: 'tasks', label: 'Görevler & Plan', icon: CheckSquare },
    { id: 'daily', label: 'Günlük Akış', icon: Calendar },
    { id: 'notes', label: 'Not & Kaynaklar', icon: BookOpen },
    { id: 'timer', label: 'Odak Sayacı', icon: Clock },
    { id: 'stats', label: 'İstatistik', icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Left: Mobile Toggle & Breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onToggleMobileSidebar}
              className="lg:hidden p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              title="Haftaları Göster"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb Trail */}
            <div className="flex items-center gap-2 text-xs sm:text-sm min-w-0">
              <span className="font-extrabold text-slate-900 tracking-tight shrink-0 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                {userName}
              </span>
              <span aria-hidden="true" className="text-slate-300 font-normal">/</span>
              {currentWeek ? (
                <div className="flex items-center gap-2 truncate">
                  <span className="inline-flex items-center font-bold text-blue-900 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md text-xs font-mono">
                    {currentWeek.weekNumber}. Hafta
                  </span>
                  <span className="text-slate-600 font-medium truncate hidden md:inline text-xs">
                    {currentWeek.title}
                  </span>
                </div>
              ) : (
                <span className="text-slate-500 text-xs">Genel Bakış</span>
              )}
            </div>
          </div>

          {/* Center: Modern Floating Pill Navigation */}
          <nav className="hidden xl:flex items-center p-1 bg-slate-100/80 border border-slate-200/80 rounded-xl">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-white text-blue-950 shadow-xs ring-1 ring-slate-900/5'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right: Live Clock & Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Live Clock Component */}
            <LiveClock />

            {/* Quick Action Button with vibrant modern blue */}
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
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-transparent hover:border-slate-200 rounded-xl transition-all duration-150 cursor-pointer"
              title="Profil & Hedef Ayarları"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Horizontal Tab Scrollbar */}
        <div className="flex xl:hidden overflow-x-auto py-2 gap-1.5 border-t border-slate-100 -mx-4 px-4 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-900 font-bold border border-blue-200 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 bg-slate-50'
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
