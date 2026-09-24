import React, { useState, useEffect } from 'react';
import { WeekData, WeekStatus } from '../types';
import { X, Calendar } from 'lucide-react';
import { GoogleDriveIcon } from './GoogleDriveIcon';

interface WeekModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (weekData: {
    weekNumber: number;
    title: string;
    theme: string;
    status: WeekStatus;
    driveUrl?: string;
  }) => void;
  editingWeek?: WeekData | null;
  suggestedWeekNumber: number;
}

export const WeekModal: React.FC<WeekModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingWeek,
  suggestedWeekNumber,
}) => {
  const [weekNumber, setWeekNumber] = useState<number>(suggestedWeekNumber);
  const [title, setTitle] = useState('');
  const [theme, setTheme] = useState('');
  const [status, setStatus] = useState<WeekStatus>('upcoming');
  const [driveUrl, setDriveUrl] = useState('');

  useEffect(() => {
    if (editingWeek) {
      setWeekNumber(editingWeek.weekNumber);
      setTitle(editingWeek.title);
      setTheme(editingWeek.theme);
      setStatus(editingWeek.status);
      setDriveUrl(editingWeek.driveUrl || '');
    } else {
      setWeekNumber(suggestedWeekNumber);
      setTitle(`${suggestedWeekNumber}. Hafta`);
      setTheme('');
      setStatus('upcoming');
      setDriveUrl('');
    }
  }, [editingWeek, suggestedWeekNumber, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      weekNumber: Number(weekNumber),
      title: title.trim(),
      theme: theme.trim(),
      status,
      driveUrl: driveUrl.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        className="bg-white border border-slate-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-150 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {editingWeek ? 'Haftayı Düzenle' : 'Yeni Hafta Ekle'}
              </h3>
              <p className="text-xs text-slate-500">Yol haritası haftalık programı</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Hafta No *
              </label>
              <input
                type="number"
                min="1"
                required
                value={weekNumber}
                onChange={(e) => setWeekNumber(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-500 rounded-lg px-3 py-2 text-slate-900 font-mono text-center focus:outline-none"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Durum
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as WeekStatus)}
                className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-500 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
              >
                <option value="upcoming">Planlandı (Gelecek)</option>
                <option value="in_progress">Devam Ediyor</option>
                <option value="completed">Tamamlandı</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Hafta Başlığı *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Örn: İleri Düzey Konular & Proje Geliştirme"
              className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-500 rounded-lg px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none transition-colors"
              autoFocus
            />
          </div>

          {/* Google Drive Link Input */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
              <GoogleDriveIcon className="w-4 h-4 shrink-0" />
              <span>Google Drive Linki (Klasör / Dosya)</span>
            </label>
            <div className="relative">
              <input
                type="url"
                value={driveUrl}
                onChange={(e) => setDriveUrl(e.target.value)}
                placeholder="https://drive.google.com/drive/folders/... veya doküman linki"
                className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-500 rounded-lg px-3.5 py-2 text-slate-900 placeholder-slate-400 focus:outline-none transition-colors font-mono text-xs"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Bu haftaya ait ders notları, çalışma kağıtları veya proje klasörünüzün Drive bağlantısını yapıştırın.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Odak Teması / Ana Hedef (Opsiyonel)
            </label>
            <textarea
              rows={2}
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="Bu haftanın ana felsefesi ve varmak istediğiniz sonuç..."
              className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-500 rounded-lg px-3.5 py-2 text-slate-900 placeholder-slate-400 focus:outline-none resize-none transition-colors"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-150">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors cursor-pointer shadow-xs shadow-blue-500/20"
            >
              {editingWeek ? 'Güncelle' : 'Haftayı Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
