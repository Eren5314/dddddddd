import React, { useState } from 'react';
import { UserProfile } from '../types';
import { X, User } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onSave: (updated: Partial<UserProfile>) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onSave,
}) => {
  const [name, setName] = useState(user.name);
  const [goalTitle, setGoalTitle] = useState(user.goalTitle);
  const [subtitle, setSubtitle] = useState(user.subtitle);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      goalTitle: goalTitle.trim() || 'Haftalık Gelişim & Takip',
      subtitle: subtitle.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150 transition-colors"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-50 dark:bg-blue-950/70 rounded-lg text-blue-600 dark:text-blue-400">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Profil & Hedef Ayarları</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Kişiselleştirme bilgileri</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              İsminiz *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 rounded-lg px-3.5 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Program / Hedef Başlığı
            </label>
            <input
              type="text"
              value={goalTitle}
              onChange={(e) => setGoalTitle(e.target.value)}
              placeholder="Örn: 2026 Başarı ve Gelişim Yolculuğu"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 rounded-lg px-3.5 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Açıklama / Slogan
            </label>
            <textarea
              rows={2}
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Örn: Haftalık disiplin, hedefler ve sürekli ilerleme..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 rounded-lg px-3.5 py-2 text-slate-900 dark:text-slate-100 focus:outline-none resize-none transition-colors"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-150 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors cursor-pointer shadow-xs shadow-blue-500/20"
            >
              Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
