import React from 'react';
import { WeekData, UserProfile } from '../types';
import { BarChart3, CheckCircle2, Clock, Calendar, Download, Printer, RefreshCw } from 'lucide-react';

interface ProgressStatsProps {
  weeks: WeekData[];
  user: UserProfile;
  onResetData: () => void;
  onExportData: () => void;
}

export const ProgressStats: React.FC<ProgressStatsProps> = ({
  weeks,
  user,
  onResetData,
  onExportData,
}) => {
  const totalTasks = weeks.reduce((sum, w) => sum + w.tasks.length, 0);
  const completedTasks = weeks.reduce(
    (sum, w) => sum + w.tasks.filter((t) => t.completed).length,
    0
  );
  const overallPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const totalMinutes = weeks.reduce((sum, w) => sum + (w.studyMinutesLogged || 0), 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

  const completedWeeks = weeks.filter((w) => w.status === 'completed').length;
  const inProgressWeeks = weeks.filter((w) => w.status === 'in_progress').length;

  // Category counts
  const categoryCounts: Record<string, { total: number; completed: number }> = {};
  weeks.forEach((w) => {
    w.tasks.forEach((t) => {
      if (!categoryCounts[t.category]) {
        categoryCounts[t.category] = { total: 0, completed: 0 };
      }
      categoryCounts[t.category].total += 1;
      if (t.completed) {
        categoryCounts[t.category].completed += 1;
      }
    });
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Gelişim ve İlerleme Raporu
          </h2>
          <p className="text-xs text-slate-500">
            {user.name} için haftalık hedeflerin genel durum analizi ve metrikler.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onExportData}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Veriyi İndir (JSON)</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            <span>Yazdır / PDF</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Genel Tamamlanma</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            %{overallPercentage}
          </div>
          <div className="text-xs text-slate-400 font-mono tabular-nums mt-1">
            {completedTasks} / {totalTasks} görev
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>Hafta Durumu</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {completedWeeks} / {weeks.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {inProgressWeeks} hafta şu an devam ediyor
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Clock className="w-4 h-4 text-sky-600" />
            <span>Toplam Odak Süresi</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {totalHours} <span className="text-sm font-normal text-slate-500">saat</span>
          </div>
          <div className="text-xs text-slate-400 font-mono tabular-nums mt-1">
            {totalMinutes} net çalışma dakikası
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <BarChart3 className="w-4 h-4 text-purple-600" />
            <span>Ortalama Verim</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {(
              weeks.reduce((acc, w) => acc + (w.rating || 0), 0) /
              (weeks.filter((w) => w.rating).length || 1)
            ).toFixed(1)}{' '}
            <span className="text-sm font-normal text-slate-500">/ 5</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Haftalık değerlendirmeler
          </div>
        </div>
      </div>

      {/* Week by Week Progress Breakdown */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-2xs">
        <h3 className="text-sm font-bold text-slate-900">
          Haftalık Tamamlanma Grafiği
        </h3>

        <div className="space-y-3">
          {weeks.map((week) => {
            const wTasks = week.tasks.length;
            const wDone = week.tasks.filter((t) => t.completed).length;
            const wPct = wTasks > 0 ? Math.round((wDone / wTasks) * 100) : 0;

            return (
              <div key={week.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-blue-900 w-16 font-mono">{week.weekNumber}. Hafta</span>
                    <span className="text-slate-800 font-medium truncate max-w-xs sm:max-w-md">
                      {week.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 font-mono tabular-nums text-slate-500">
                    <span>{wDone}/{wTasks} Görev</span>
                    <span className="font-semibold text-slate-800 w-10 text-right">%{wPct}</span>
                  </div>
                </div>

                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      wPct === 100 ? 'bg-emerald-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${wPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-2xs">
        <h3 className="text-sm font-bold text-slate-900">
          Kategori Dağılımı ve Başarı Oranları
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(categoryCounts).map(([cat, counts]) => {
            const catPct = counts.total > 0 ? Math.round((counts.completed / counts.total) * 100) : 0;
            return (
              <div key={cat} className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-800">{cat}</span>
                  <span className="font-mono tabular-nums font-bold text-blue-900">%{catPct}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-blue-600" style={{ width: `${catPct}%` }} />
                </div>
                <div className="text-[11px] text-slate-500 font-mono tabular-nums flex justify-between">
                  <span>{counts.completed} tamamlandı</span>
                  <span>{counts.total} toplam</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reset Data Warning Box */}
      <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
        <span>Tüm veriler tarayıcınızın yerel hafızasında (localStorage) saklanır.</span>
        <button
          onClick={() => {
            if (window.confirm('Tüm verileri ilk başlangıç durumuna döndürmek istediğinize emin misiniz?')) {
              onResetData();
            }
          }}
          className="flex items-center gap-1 text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Başlangıç Verilerine Dön</span>
        </button>
      </div>
    </div>
  );
};
