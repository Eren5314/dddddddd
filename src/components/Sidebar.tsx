import React, { useState } from 'react';
import { WeekData, UserProfile, WeekStatus } from '../types';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  BarChart3,
  Settings,
  Search,
  X,
  Edit2,
  Trash2,
  MoreVertical,
  Flame,
  ChevronRight,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { GoogleDriveIcon } from './GoogleDriveIcon';
import { Shield, ShieldCheck, Sun, Moon } from 'lucide-react';

interface SidebarProps {
  weeks: WeekData[];
  selectedWeekId: string;
  onSelectWeek: (weekId: string) => void;
  onAddWeek: () => void;
  onEditWeek: (week: WeekData) => void;
  onDeleteWeek: (weekId: string) => void;
  user: UserProfile;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSettings: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  isAdmin: boolean;
  onOpenAdminPanel: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  weeks,
  selectedWeekId,
  onSelectWeek,
  onAddWeek,
  onEditWeek,
  onDeleteWeek,
  user,
  activeTab,
  setActiveTab,
  onOpenSettings,
  isOpenMobile,
  onCloseMobile,
  isAdmin,
  onOpenAdminPanel,
  theme,
  onToggleTheme,
}) => {
  const [filter, setFilter] = useState<'all' | 'in_progress' | 'completed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState(false);

  const filteredWeeks = weeks.filter((w) => {
    if (filter !== 'all' && w.status !== filter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchNumber = `${w.weekNumber}`.includes(q) || `${w.weekNumber}. hafta`.includes(q);
      const matchTitle = w.title.toLowerCase().includes(q);
      const matchTheme = w.theme.toLowerCase().includes(q);
      return matchNumber || matchTitle || matchTheme;
    }
    return true;
  });

  const totalTasks = weeks.reduce((sum, w) => sum + w.tasks.length, 0);
  const completedTasks = weeks.reduce(
    (sum, w) => sum + w.tasks.filter((t) => t.completed).length,
    0
  );
  const overallPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden backdrop-blur-xs transition-opacity duration-200"
          onClick={onCloseMobile}
        />
      )}

      {/* Modern Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-r border-slate-200/90 dark:border-slate-800 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* User Identity Header */}
        <div className="p-4 border-b border-slate-150 dark:border-slate-800 flex items-center justify-between shrink-0 bg-gradient-to-b from-slate-50/50 to-transparent dark:from-slate-800/30">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-250 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shadow-xs">
                {!avatarError ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-700 text-white font-black text-sm">
                    {user.name.charAt(0)}
                  </div>
                )}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full ring-1 ring-emerald-500/20" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate tracking-tight">
                  {user.name}
                </h1>
                <span className="text-[10px] font-bold text-blue-900 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/70 px-1.5 py-0.2 rounded-md border border-blue-200 dark:border-blue-800 font-mono">
                  {weeks.length} Hafta
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate" title={user.goalTitle}>
                {user.goalTitle}
              </p>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Overall Progress Widget */}
        <div className="px-4 py-3 bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-150 dark:border-slate-800 shrink-0">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Genel İlerleme</span>
            <span className="font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums">
              %{overallPercentage}
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-200/80 dark:bg-slate-700/80 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${overallPercentage}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 font-mono tabular-nums">
            <span>{completedTasks} / {totalTasks} Görev Bitti</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">{weeks.length} Hafta Planı</span>
          </div>
        </div>

        {/* Section Header, Search & Filter Controls */}
        <div className="p-3 space-y-2 shrink-0 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Haftalık Program</span>
            </div>
            <button
              onClick={() => {
                onAddWeek();
                if (isOpenMobile) onCloseMobile();
              }}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-900 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/70 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 rounded-lg transition-colors cursor-pointer shadow-2xs"
              title="Yeni Hafta Ekle"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Hafta Ekle</span>
            </button>
          </div>

          {/* Search box for 20+ weeks */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Hafta no veya konu ara..."
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 rounded-lg pl-8 pr-7 py-1.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Filter Segmented Control */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-100/90 dark:bg-slate-800/90 rounded-lg text-[11px] border border-slate-200/60 dark:border-slate-700/60">
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 py-1 rounded-md font-medium transition-all cursor-pointer ${
                filter === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Tümü ({weeks.length})
            </button>
            <button
              onClick={() => setFilter('in_progress')}
              className={`flex-1 py-1 rounded-md font-medium transition-all cursor-pointer ${
                filter === 'in_progress'
                  ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-2xs font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Aktif
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`flex-1 py-1 rounded-md font-medium transition-all cursor-pointer ${
                filter === 'completed'
                  ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-2xs font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Biten
            </button>
          </div>
        </div>

        {/* Scrollable Weeks List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5 scrollbar-thin">
          {filteredWeeks.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400 dark:text-slate-500">
              Aramanıza uygun hafta bulunamadı.
            </div>
          ) : (
            filteredWeeks.map((week) => {
              const isSelected = week.id === selectedWeekId;
              const completedCount = week.tasks.filter((t) => t.completed).length;
              const weekTotal = week.tasks.length;
              const weekPct = weekTotal > 0 ? Math.round((completedCount / weekTotal) * 100) : 0;

              return (
                <div
                  key={week.id}
                  onClick={() => {
                    onSelectWeek(week.id);
                    if (activeTab === 'stats') {
                      setActiveTab('tasks');
                    }
                    if (isOpenMobile) onCloseMobile();
                  }}
                  className={`group relative rounded-xl p-2.5 transition-all duration-150 cursor-pointer border text-left ${
                    isSelected
                      ? 'bg-gradient-to-r from-blue-50/90 to-blue-100/40 dark:from-blue-950/80 dark:to-blue-900/40 border-blue-300 dark:border-blue-700 text-slate-900 dark:text-slate-100 shadow-xs ring-1 ring-blue-500/30'
                      : 'bg-white dark:bg-slate-900 hover:bg-slate-50/90 dark:hover:bg-slate-800/80 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {/* Left accent bar on active */}
                  {isSelected && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 bg-blue-600 dark:bg-blue-400 rounded-r-full" />
                  )}

                  <div className="flex items-start justify-between gap-2 pl-1">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span
                          className={`text-xs font-bold tracking-tight font-mono ${
                            isSelected ? 'text-blue-950 dark:text-blue-300 font-extrabold' : 'text-slate-900 dark:text-slate-100'
                          }`}
                        >
                          {week.weekNumber}. Hafta
                        </span>
                        {week.driveUrl && (
                          <a
                            href={week.driveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            title="Google Drive Klasörünü Yeni Sekmede Aç"
                            className="inline-flex items-center p-0.5 hover:scale-120 transition-transform"
                          >
                            <GoogleDriveIcon className="w-3 h-3" />
                          </a>
                        )}
                        <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          {week.status === 'completed'
                            ? 'Tamamlandı'
                            : week.status === 'in_progress'
                            ? 'Devam Ediyor'
                            : 'Planlandı'}
                        </span>
                      </div>

                      <div className="text-xs font-medium text-slate-800 dark:text-slate-200 line-clamp-1 leading-snug">
                        {week.title}
                      </div>

                      {/* Progress micro-bar & unboxed stats */}
                      <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                        <span>{completedCount}/{weekTotal} Görev</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">%{weekPct}</span>
                      </div>
                      <div className="mt-1 w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            weekPct === 100
                              ? 'bg-emerald-500'
                              : week.status === 'in_progress'
                              ? 'bg-gradient-to-r from-blue-600 to-blue-500'
                              : 'bg-slate-300 dark:bg-slate-700'
                          }`}
                          style={{ width: `${weekPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Context menu for week */}
                    <div
                      className="relative shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => setMenuOpenId(menuOpenId === week.id ? null : week.id)}
                        className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>

                      {menuOpenId === week.id && (
                        <div className="absolute right-0 top-6 w-40 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg py-1 z-30 text-xs">
                          {week.driveUrl && (
                            <a
                              href={week.driveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full flex items-center gap-1.5 px-3 py-1.5 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 border-b border-slate-100 dark:border-slate-750"
                              onClick={() => setMenuOpenId(null)}
                            >
                              <GoogleDriveIcon className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">Drive'ı Aç</span>
                              <ExternalLink className="w-3 h-3 text-slate-400 ml-auto shrink-0" />
                            </a>
                          )}
                          <button
                            onClick={() => {
                              onEditWeek(week);
                              setMenuOpenId(null);
                            }}
                            className="w-full flex items-center gap-1.5 px-3 py-1.5 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                            <span>Düzenle</span>
                          </button>
                          {weeks.length > 1 && (
                            <button
                              onClick={() => {
                                if (window.confirm(`${week.weekNumber}. Haftayı silmek istediğinizden emin misiniz?`)) {
                                  onDeleteWeek(week.id);
                                }
                                setMenuOpenId(null);
                              }}
                              className="w-full flex items-center gap-1.5 px-3 py-1.5 text-left text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Sil</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Navigation & Profile Links */}
        <div className="p-3 border-t border-slate-150 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/90 space-y-1.5 text-xs shrink-0">
          {/* Admin Panel Button */}
          <button
            onClick={() => {
              onOpenAdminPanel();
              if (isOpenMobile) onCloseMobile();
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-bold transition-all cursor-pointer border ${
              isAdmin
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 shadow-2xs'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-750'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {isAdmin ? (
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Shield className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              )}
              <span>Admin Paneli</span>
            </div>
            {isAdmin ? (
              <span className="text-[10px] font-mono bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded">
                Giriş Yapıldı
              </span>
            ) : (
              <span className="text-[10px] text-slate-400 font-mono">Korumalı</span>
            )}
          </button>

          {/* Theme switcher button in sidebar */}
          <button
            onClick={onToggleTheme}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white dark:hover:bg-slate-800 border border-transparent transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-blue-600" />
              )}
              <span>{theme === 'dark' ? 'Açık Tema (Gündüz)' : 'Koyu Tema (Gece)'}</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 uppercase">{theme}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('stats');
              if (isOpenMobile) onCloseMobile();
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium transition-all cursor-pointer ${
              activeTab === 'stats'
                ? 'bg-blue-50 dark:bg-blue-950/70 text-blue-900 dark:text-blue-300 font-semibold shadow-2xs border border-blue-200/80 dark:border-blue-800'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white dark:hover:bg-slate-800 border border-transparent'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-slate-500" />
            <span>Genel İlerleme & İstatistik</span>
          </button>

          <button
            onClick={() => {
              onOpenSettings();
              if (isOpenMobile) onCloseMobile();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white dark:hover:bg-slate-800 border border-transparent transition-all cursor-pointer"
          >
            <Settings className="w-4 h-4 text-slate-500" />
            <span>Profil ve Hedef Ayarları</span>
          </button>
        </div>
      </aside>
    </>
  );
};
