import React, { useState } from 'react';
import { UserProfile, WeekData } from '../types';
import { CheckCircle2, Flame, ArrowRight, Calendar, Sparkles, TrendingUp } from 'lucide-react';

interface HeroBannerProps {
  user: UserProfile;
  currentWeek: WeekData | null;
  totalWeeksCount: number;
  totalTasks: number;
  completedTasks: number;
  totalMinutes: number;
  onSelectWeek: (weekId: string) => void;
  onEditProfile: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  user,
  currentWeek,
  totalWeeksCount,
  totalTasks,
  completedTasks,
  totalMinutes,
  onSelectWeek,
  onEditProfile,
}) => {
  const [avatarError, setAvatarError] = useState(false);
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const totalHours = (totalMinutes / 60).toFixed(1);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/90 shadow-[0_2px_8px_rgba(0,0,0,0.03)] mb-6 transition-all">
      {/* Background modern ambient glow with blue hue */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-gradient-to-br from-blue-100/60 to-indigo-100/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 -mb-20 w-80 h-80 bg-slate-100/70 rounded-full blur-3xl pointer-events-none" />

      <div className="relative p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: User identity & welcome */}
        <div className="flex items-start sm:items-center gap-4 sm:gap-5">
          <div className="relative group shrink-0">
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-xs ring-2 ring-blue-500/20">
              {!avatarError ? (
                <img
                  src={user.avatarUrl}
                  alt={`${user.name} profil`}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-blue-600 to-blue-500 text-white font-black text-2xl">
                  {user.name.charAt(0)}
                </div>
              )}
            </div>
            <button
              onClick={onEditProfile}
              className="absolute -bottom-1 -right-1 p-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-full text-slate-700 transition-all shadow-xs hover:scale-105 cursor-pointer"
              title="Profili Düzenle"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            </button>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/80">
                Hoş Geldin, {user.name} 👋
              </span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="font-semibold text-slate-700">{totalWeeksCount} Haftalık Program</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950">
              {user.goalTitle}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl font-normal">
              {user.subtitle}
            </p>
          </div>
        </div>

        {/* Right: Key Modern Progress Metrics */}
        <div className="grid grid-cols-3 gap-3 border-t lg:border-t-0 lg:border-l border-slate-150 pt-4 lg:pt-0 lg:pl-6">
          {/* Card 1: Completed */}
          <div className="bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-center transition-colors">
            <div className="flex items-center justify-center gap-1.5 text-slate-500 text-xs mb-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tamamlanan</span>
            </div>
            <div className="text-lg font-bold text-slate-900 font-mono tabular-nums">
              {completedTasks}<span className="text-xs text-slate-400 font-normal">/{totalTasks}</span>
            </div>
            <div className="text-[11px] text-emerald-700 font-bold font-mono tabular-nums mt-0.5 flex items-center justify-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>%{completionPercentage}</span>
            </div>
          </div>

          {/* Card 2: Deep Focus */}
          <div className="bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-center transition-colors">
            <div className="flex items-center justify-center gap-1.5 text-slate-500 text-xs mb-1 font-medium">
              <Flame className="w-3.5 h-3.5 text-blue-600" />
              <span>Odak Süresi</span>
            </div>
            <div className="text-lg font-bold text-slate-900 font-mono tabular-nums">
              {totalHours}<span className="text-xs text-slate-400 font-normal">sa</span>
            </div>
            <div className="text-[11px] text-slate-500 font-mono tabular-nums mt-0.5">
              {totalMinutes} dakika
            </div>
          </div>

          {/* Card 3: Active Week */}
          <div className="bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-center transition-colors">
            <div className="flex items-center justify-center gap-1.5 text-slate-500 text-xs mb-1 font-medium">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>Aktif Hafta</span>
            </div>
            <div className="text-lg font-bold text-blue-900 font-mono tabular-nums">
              {currentWeek ? `${currentWeek.weekNumber}. Hafta` : '-'}
            </div>
            <div className="text-[11px] text-slate-500 truncate mt-0.5 font-medium" title={currentWeek?.title}>
              {currentWeek ? currentWeek.title.slice(0, 12) + '...' : 'Seçilmedi'}
            </div>
          </div>
        </div>
      </div>

      {/* Quick week info bar */}
      {currentWeek && (
        <div className="px-5 py-2.5 bg-slate-50/90 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <span className="font-extrabold text-blue-950">{currentWeek.weekNumber}. Hafta Teması:</span>
            <span className="text-slate-900 font-semibold">{currentWeek.title}</span>
            {currentWeek.theme && (
              <>
                <span aria-hidden="true" className="text-slate-300 hidden sm:inline">·</span>
                <span className="text-slate-500 hidden sm:inline">{currentWeek.theme}</span>
              </>
            )}
          </div>
          <span className="text-[11px] text-slate-500 font-medium ml-auto hidden sm:inline">
            Sol menüdeki arama veya listeden dilediğiniz haftaya tek tıkla geçiş yapabilirsiniz
          </span>
        </div>
      )}
    </div>
  );
};
