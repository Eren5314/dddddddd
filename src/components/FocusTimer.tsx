import React, { useState, useEffect } from 'react';
import { WeekData } from '../types';
import { Play, Pause, RotateCcw, Flame, CheckCircle, Plus } from 'lucide-react';

interface FocusTimerProps {
  week: WeekData;
  onLogMinutes: (weekId: string, minutes: number) => void;
}

export const FocusTimer: React.FC<FocusTimerProps> = ({ week, onLogMinutes }) => {
  const [selectedDuration, setSelectedDuration] = useState<number>(25 * 60); // seconds
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [justLogged, setJustLogged] = useState<boolean>(false);
  const [manualMinutes, setManualMinutes] = useState<string>('30');

  useEffect(() => {
    let timer: any = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      setIsRunning(false);
      const minutesSpent = Math.round(selectedDuration / 60);
      onLogMinutes(week.id, minutesSpent);
      setJustLogged(true);
      setTimeout(() => setJustLogged(false), 3000);
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, selectedDuration, onLogMinutes, week.id]);

  const handleSetPreset = (minutes: number) => {
    setIsRunning(false);
    setSelectedDuration(minutes * 60);
    setTimeLeft(minutes * 60);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(selectedDuration);
  };

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const mins = parseInt(manualMinutes, 10);
    if (!isNaN(mins) && mins > 0) {
      onLogMinutes(week.id, mins);
      setJustLogged(true);
      setTimeout(() => setJustLogged(false), 3000);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const progressPercent = ((selectedDuration - timeLeft) / selectedDuration) * 100;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-bold text-blue-900 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/70 px-2 py-0.5 rounded border border-blue-200/80 dark:border-blue-800 font-mono">
            {week.weekNumber}. Hafta
          </span>
          <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
          <span>Çalışma & Odak Sayacı</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Derin Çalışma (Deep Work)
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Bu haftaki hedefleriniz için dikkatinizi toplayın ve odak sürenizi kaydedin.
        </p>
      </div>

      {/* Preset Selector */}
      <div className="flex items-center justify-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 max-w-sm mx-auto text-xs">
        <button
          onClick={() => handleSetPreset(25)}
          className={`flex-1 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
            selectedDuration === 25 * 60
              ? 'bg-white dark:bg-slate-900 text-blue-900 dark:text-blue-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          25 dk (Pomodoro)
        </button>
        <button
          onClick={() => handleSetPreset(50)}
          className={`flex-1 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
            selectedDuration === 50 * 60
              ? 'bg-white dark:bg-slate-900 text-blue-900 dark:text-blue-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          50 dk (Derin Blok)
        </button>
        <button
          onClick={() => handleSetPreset(5)}
          className={`flex-1 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
            selectedDuration === 5 * 60
              ? 'bg-white dark:bg-slate-900 text-blue-900 dark:text-blue-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          5 dk (Mola)
        </button>
      </div>

      {/* Timer Display */}
      <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-12 text-center shadow-xs overflow-hidden transition-colors">
        {/* Progress bar border indicator */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full bg-blue-600 dark:bg-blue-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="text-6xl sm:text-8xl font-black tracking-tight text-slate-900 dark:text-slate-100 font-mono tabular-nums select-none my-4">
          {formattedTime}
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          {isRunning ? 'Odaklanma oturumu devam ediyor...' : 'Başlamaya hazır'}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-xs cursor-pointer ${
              isRunning
                ? 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 fill-current" />
                <span>Duraklat</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>Başlat</span>
              </>
            )}
          </button>

          <button
            onClick={handleReset}
            className="p-3 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors cursor-pointer"
            title="Sıfırla"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        {justLogged && (
          <div className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 py-1.5 px-3 rounded-lg border border-emerald-200 dark:border-emerald-800 inline-flex">
            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Süre başarıyla {week.weekNumber}. Haftaya işlendi!</span>
          </div>
        )}
      </div>

      {/* Manual Time Logging & Week Summary */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs transition-colors">
        <div>
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
            <Flame className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Toplam Kayıtlı Odak</span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {week.weekNumber}. Hafta için şimdiye kadar kaydedilen:
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xl font-black font-mono text-slate-900 dark:text-slate-100">
            {week.studyMinutesLogged || 0} <span className="text-xs text-slate-400 font-normal">dakika</span>
          </div>

          <form onSubmit={handleManualAdd} className="flex items-center gap-1.5">
            <input
              type="number"
              min="1"
              max="600"
              value={manualMinutes}
              onChange={(e) => setManualMinutes(e.target.value)}
              className="w-16 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-900 dark:text-slate-100 font-mono text-center focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 dark:bg-blue-950/70 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-800 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800 rounded-lg text-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ekle</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
