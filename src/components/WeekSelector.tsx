import React, { useState } from 'react';
import { WeekData, WeekStatus } from '../types';
import { Plus, Check, Clock, CalendarDays, MoreVertical, Edit2, Trash2, ArrowUpRight } from 'lucide-react';

interface WeekSelectorProps {
  weeks: WeekData[];
  selectedWeekId: string;
  onSelectWeek: (id: string) => void;
  onAddWeek: () => void;
  onEditWeek: (week: WeekData) => void;
  onDeleteWeek: (id: string) => void;
  onSetStatus: (id: string, status: WeekStatus) => void;
}

export const WeekSelector: React.FC<WeekSelectorProps> = ({
  weeks,
  selectedWeekId,
  onSelectWeek,
  onAddWeek,
  onEditWeek,
  onDeleteWeek,
  onSetStatus,
}) => {
  const [filter, setFilter] = useState<'all' | 'in_progress' | 'completed' | 'upcoming'>('all');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const filteredWeeks = weeks.filter((w) => {
    if (filter === 'all') return true;
    return w.status === filter;
  });

  return (
    <div className="space-y-6">
      {/* Controls & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-800">
        <div>
          <h2 className="text-lg font-bold text-neutral-100 tracking-tight">Haftalar & Yol Haritası</h2>
          <p className="text-xs text-neutral-400">
            Tüm haftalık programlarınızı, hedeflerinizi ve tamamlanma oranlarınızı yönetin.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter Segmented Control */}
          <div className="flex items-center gap-1 p-1 bg-neutral-800/80 rounded-lg border border-neutral-700/60 text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                filter === 'all'
                  ? 'bg-neutral-700 text-neutral-100 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Tümü ({weeks.length})
            </button>
            <button
              onClick={() => setFilter('in_progress')}
              className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                filter === 'in_progress'
                  ? 'bg-neutral-700 text-amber-400 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Devam Eden
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                filter === 'completed'
                  ? 'bg-neutral-700 text-emerald-400 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Tamamlanan
            </button>
          </div>

          <button
            onClick={onAddWeek}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-900 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Hafta</span>
          </button>
        </div>
      </div>

      {/* Grid of Weeks */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredWeeks.map((week) => {
          const isSelected = week.id === selectedWeekId;
          const completedCount = week.tasks.filter((t) => t.completed).length;
          const totalTasks = week.tasks.length;
          const percentage = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

          return (
            <div
              key={week.id}
              onClick={() => onSelectWeek(week.id)}
              className={`relative group rounded-xl p-5 border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-neutral-800/90 border-amber-500/60 shadow-lg shadow-amber-500/5'
                  : 'bg-neutral-850/60 hover:bg-neutral-800/60 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              {/* Header row: Week title and actions */}
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
                    <span className="font-bold text-amber-400">{week.weekNumber}. Hafta</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-neutral-400">
                      {week.status === 'completed' && 'Tamamlandı'}
                      {week.status === 'in_progress' && 'Devam Ediyor'}
                      {week.status === 'upcoming' && 'Planlandı'}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-neutral-100 group-hover:text-amber-300 transition-colors line-clamp-1">
                    {week.title}
                  </h3>
                </div>

                {/* Dropdown menu */}
                <div
                  className="relative shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <button
                    onClick={() => setMenuOpenId(menuOpenId === week.id ? null : week.id)}
                    className="p-1 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700/60 rounded-md transition-colors"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {menuOpenId === week.id && (
                    <div className="absolute right-0 top-7 w-44 bg-neutral-900 border border-neutral-750 rounded-lg shadow-xl py-1 z-20 text-xs">
                      <button
                        onClick={() => {
                          onEditWeek(week);
                          setMenuOpenId(null);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-left text-neutral-300 hover:bg-neutral-800 hover:text-neutral-100"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Haftayı Düzenle</span>
                      </button>
                      <button
                        onClick={() => {
                          onSetStatus(
                            week.id,
                            week.status === 'completed'
                              ? 'in_progress'
                              : week.status === 'in_progress'
                              ? 'completed'
                              : 'in_progress'
                          );
                          setMenuOpenId(null);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-left text-neutral-300 hover:bg-neutral-800 hover:text-neutral-100"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>
                          {week.status === 'completed'
                            ? 'Devam Ediyor Yap'
                            : 'Tamamlandı Olarak İşaretle'}
                        </span>
                      </button>
                      {weeks.length > 1 && (
                        <button
                          onClick={() => {
                            if (window.confirm(`${week.weekNumber}. Haftayı silmek istediğinizden emin misiniz?`)) {
                              onDeleteWeek(week.id);
                            }
                            setMenuOpenId(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-left text-red-400 hover:bg-neutral-800 hover:text-red-300"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Haftayı Sil</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Theme/Subtext */}
              <p className="text-xs text-neutral-400 line-clamp-2 mb-4 h-8">
                {week.theme || 'Bu hafta için odak teması belirlenmedi.'}
              </p>

              {/* Progress Bar & Numerical stats */}
              <div className="space-y-1.5 pt-2 border-t border-neutral-800/80">
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span className="font-mono tabular-nums">
                    {completedCount}/{totalTasks} Görev
                  </span>
                  <span className="font-mono font-semibold text-neutral-200 tabular-nums">
                    %{percentage}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      percentage === 100
                        ? 'bg-emerald-500'
                        : week.status === 'in_progress'
                        ? 'bg-amber-400'
                        : 'bg-neutral-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>

              {/* Footer row */}
              <div className="mt-3 flex items-center justify-between text-[11px] text-neutral-400">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-neutral-400" />
                  <span className="font-mono tabular-nums">
                    {week.studyMinutesLogged ? `${(week.studyMinutesLogged / 60).toFixed(1)} sa odak` : '0 sa'}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-amber-400 font-medium group-hover:translate-x-0.5 transition-transform">
                  <span>İncele</span>
                  <ArrowUpRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredWeeks.length === 0 && (
        <div className="text-center py-12 border border-dashed border-neutral-800 rounded-xl bg-neutral-900/40">
          <CalendarDays className="w-8 h-8 mx-auto text-neutral-600 mb-2" />
          <p className="text-sm text-neutral-400 font-medium">Bu filtrede gösterilecek hafta bulunamadı.</p>
          <button
            onClick={() => setFilter('all')}
            className="mt-3 text-xs text-amber-400 hover:text-amber-300 font-medium"
          >
            Tüm Haftaları Göster
          </button>
        </div>
      )}
    </div>
  );
};
