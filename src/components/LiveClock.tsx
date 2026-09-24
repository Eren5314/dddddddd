import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export const LiveClock: React.FC = () => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format Turkish date: e.g., "24 Eylül Perşembe"
  const dateString = currentTime.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short',
    weekday: 'short',
  });

  // Hours, minutes, seconds
  const hours = String(currentTime.getHours()).padStart(2, '0');
  const minutes = String(currentTime.getMinutes()).padStart(2, '0');
  const seconds = String(currentTime.getSeconds()).padStart(2, '0');

  return (
    <div
      className="group relative flex items-center gap-2.5 px-3 py-1.5 bg-white/80 hover:bg-white border border-slate-250/80 hover:border-slate-300 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.04)] backdrop-blur-md transition-all duration-150 select-none"
      title="Canlı Sistem Saati (Türkiye Saati)"
    >
      <div className="relative flex items-center justify-center shrink-0">
        <Clock className="w-3.5 h-3.5 text-blue-600 transition-transform group-hover:rotate-12 duration-300" />
        <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
        </span>
      </div>

      <div className="flex items-center gap-1.5 text-xs font-mono tabular-nums">
        <span className="font-bold text-slate-800 tracking-tight text-xs sm:text-sm">
          {hours}:{minutes}
          <span className="text-blue-600 text-xs font-semibold">:{seconds}</span>
        </span>
        <span aria-hidden="true" className="text-slate-300 font-sans hidden sm:inline">
          ·
        </span>
        <span className="text-[11px] font-sans text-slate-500 font-medium hidden sm:inline capitalize">
          {dateString}
        </span>
      </div>
    </div>
  );
};
