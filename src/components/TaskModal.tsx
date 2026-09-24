import React, { useState, useEffect } from 'react';
import { Task, DayOfWeek, TaskCategory, TaskPriority } from '../types';
import { X } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Omit<Task, 'id' | 'completed'>) => void;
  editingTask?: Task | null;
  defaultDay?: DayOfWeek;
  weekNumber: number;
}

const DAYS: DayOfWeek[] = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
const CATEGORIES: TaskCategory[] = ['Çalışma', 'Kodlama', 'Okuma', 'Proje', 'Sağlık / Spor', 'Diğer'];
const PRIORITIES: TaskPriority[] = ['Düşük', 'Orta', 'Yüksek'];

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTask,
  defaultDay = 'Pazartesi',
  weekNumber,
}) => {
  const [title, setTitle] = useState('');
  const [day, setDay] = useState<DayOfWeek>(defaultDay);
  const [category, setCategory] = useState<TaskCategory>('Çalışma');
  const [priority, setPriority] = useState<TaskPriority>('Orta');
  const [estimate, setEstimate] = useState<number | ''>(45);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDay(editingTask.day);
      setCategory(editingTask.category);
      setPriority(editingTask.priority);
      setEstimate(editingTask.timeEstimateMinutes || '');
      setNotes(editingTask.notes || '');
    } else {
      setTitle('');
      setDay(defaultDay);
      setCategory('Çalışma');
      setPriority('Orta');
      setEstimate(45);
      setNotes('');
    }
  }, [editingTask, defaultDay, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      day,
      category,
      priority,
      timeEstimateMinutes: estimate === '' ? undefined : Number(estimate),
      notes: notes.trim() || undefined,
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
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {editingTask ? 'Görevi Düzenle' : 'Yeni Görev Ekle'}
            </h3>
            <p className="text-xs text-slate-500">{weekNumber}. Hafta için görev planı</p>
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
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Görev Başlığı *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Örn: Algoritma soruları çöz ve özet çıkar"
              className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none transition-colors"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Gün</label>
              <select
                value={day}
                onChange={(e) => setDay(e.target.value as DayOfWeek)}
                className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-500 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
              >
                {DAYS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Kategori</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-500 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Öncelik</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-500 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p} Öncelik
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Tahmini Süre (dakika)
              </label>
              <input
                type="number"
                min="5"
                step="5"
                value={estimate}
                onChange={(e) => setEstimate(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="45"
                className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-500 rounded-lg px-3 py-2 text-slate-900 focus:outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Not / Açıklama (Opsiyonel)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Gerekli kaynaklar, hatırlatmalar..."
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
              {editingTask ? 'Güncelle' : 'Görevi Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
