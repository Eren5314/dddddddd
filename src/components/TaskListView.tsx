import React, { useState } from 'react';
import { WeekData, Task, TaskCategory, TaskPriority } from '../types';
import {
  Plus,
  Check,
  Trash2,
  Edit3,
  Filter,
  Clock,
  ExternalLink,
  Link as LinkIcon,
  X,
  CheckCheck
} from 'lucide-react';
import { GoogleDriveIcon } from './GoogleDriveIcon';

interface TaskListViewProps {
  week: WeekData;
  onToggleTask: (taskId: string) => void;
  onAddTask: () => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onQuickAddTask: (title: string) => void;
  onUpdateDriveUrl?: (url: string) => void;
}

export const TaskListView: React.FC<TaskListViewProps> = ({
  week,
  onToggleTask,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onQuickAddTask,
  onUpdateDriveUrl,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [quickInput, setQuickInput] = useState('');

  // Inline Google Drive edit mode
  const [isEditingDrive, setIsEditingDrive] = useState(false);
  const [driveInput, setDriveInput] = useState(week.driveUrl || '');
  const [copiedDrive, setCopiedDrive] = useState(false);

  const categories: TaskCategory[] = ['Çalışma', 'Kodlama', 'Okuma', 'Proje', 'Sağlık / Spor', 'Diğer'];

  const filteredTasks = week.tasks.filter((t) => {
    if (filterStatus === 'pending' && t.completed) return false;
    if (filterStatus === 'completed' && !t.completed) return false;
    if (filterCategory !== 'all' && t.category !== filterCategory) return false;
    return true;
  });

  const completedCount = week.tasks.filter((t) => t.completed).length;
  const totalTasks = week.tasks.length;
  const percentage = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    onQuickAddTask(quickInput.trim());
    setQuickInput('');
  };

  const handleSaveDriveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateDriveUrl) {
      onUpdateDriveUrl(driveInput.trim());
    }
    setIsEditingDrive(false);
  };

  const handleRemoveDriveUrl = () => {
    if (window.confirm('Bu haftaya bağlı Google Drive linkini kaldırmak istediğinize emin misiniz?')) {
      if (onUpdateDriveUrl) {
        onUpdateDriveUrl('');
      }
      setDriveInput('');
      setIsEditingDrive(false);
    }
  };

  const handleCopyDriveLink = () => {
    if (week.driveUrl) {
      navigator.clipboard.writeText(week.driveUrl);
      setCopiedDrive(true);
      setTimeout(() => setCopiedDrive(false), 2000);
    }
  };

  const getCategoryBadge = (category: TaskCategory) => {
    switch (category) {
      case 'Kodlama':
        return 'bg-sky-50 text-sky-700 border-sky-200/80';
      case 'Çalışma':
        return 'bg-blue-50 text-blue-800 border-blue-200/80';
      case 'Okuma':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
      case 'Proje':
        return 'bg-purple-50 text-purple-700 border-purple-200/80';
      case 'Sağlık / Spor':
        return 'bg-rose-50 text-rose-700 border-rose-200/80';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'Yüksek':
        return (
          <span className="inline-flex items-center gap-1 text-rose-700 font-semibold text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Yüksek
          </span>
        );
      case 'Orta':
        return (
          <span className="inline-flex items-center gap-1 text-blue-800 font-medium text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Orta
          </span>
        );
      case 'Düşük':
        return (
          <span className="inline-flex items-center gap-1 text-slate-500 font-normal text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Düşük
          </span>
        );
    }
  };

  return (
    <div className="space-y-5">
      {/* Modern Week Header Summary Card */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-extrabold text-blue-900 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/80 font-mono">
                {week.weekNumber}. Hafta
              </span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="font-semibold text-slate-700">
                {week.status === 'completed'
                  ? 'Tamamlandı'
                  : week.status === 'in_progress'
                  ? 'Devam Ediyor'
                  : 'Planlandı'}
              </span>
              {week.startDate && (
                <>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span className="font-mono">{week.startDate}</span>
                </>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {week.title}
            </h2>
            {week.theme && (
              <p className="text-xs sm:text-sm text-slate-500 font-normal">{week.theme}</p>
            )}
          </div>

          <div className="shrink-0 flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-slate-400 font-medium">Tamamlanma Oranı</div>
              <div className="text-lg font-bold text-slate-900 font-mono tabular-nums">
                %{percentage}{' '}
                <span className="text-xs text-slate-400 font-normal">
                  ({completedCount}/{totalTasks})
                </span>
              </div>
            </div>
            <button
              onClick={onAddTask}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-b from-blue-500 via-blue-600 to-blue-700 hover:brightness-105 rounded-xl transition-all cursor-pointer shadow-xs whitespace-nowrap border border-blue-600/90 shadow-blue-500/20 active:scale-98"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Yeni Görev</span>
            </button>
          </div>
        </div>

        {/* Linear progress bar with blue gradient */}
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mt-4">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Dedicated Google Drive Action Bar */}
        <div className="mt-4 pt-3.5 border-t border-slate-150 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Left: Google Drive Info / Action */}
          {!isEditingDrive ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-slate-600 flex items-center gap-1.5">
                <GoogleDriveIcon className="w-4 h-4 shrink-0" />
                <span>Google Drive:</span>
              </span>

              {week.driveUrl ? (
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-250 rounded-lg px-2.5 py-1">
                  <a
                    href={week.driveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-blue-700 hover:text-blue-800 font-semibold max-w-[220px] sm:max-w-xs truncate"
                    title={week.driveUrl}
                  >
                    <span>Haftalık Klasörü / Dosyayı Aç</span>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </a>

                  <span className="text-slate-300">|</span>

                  <button
                    onClick={handleCopyDriveLink}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                    title="Bağlantıyı Kopyala"
                  >
                    {copiedDrive ? (
                      <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <LinkIcon className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setDriveInput(week.driveUrl || '');
                      setIsEditingDrive(true);
                    }}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                    title="Drive Bağlantısını Değiştir"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={handleRemoveDriveUrl}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                    title="Drive Bağlantısını Kaldır"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setDriveInput('');
                    setIsEditingDrive(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold border border-blue-200 rounded-lg transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Google Drive Linki Ekle</span>
                </button>
              )}
            </div>
          ) : (
            /* Inline Drive input form */
            <form onSubmit={handleSaveDriveUrl} className="flex-1 flex items-center gap-2 max-w-xl">
              <div className="relative flex-1">
                <input
                  type="url"
                  value={driveInput}
                  onChange={(e) => setDriveInput(e.target.value)}
                  placeholder="https://drive.google.com/drive/folders/... linkini yapıştırın"
                  className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-500 rounded-lg pl-3 pr-8 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none font-mono"
                  autoFocus
                  required
                />
                {driveInput && (
                  <button
                    type="button"
                    onClick={() => setDriveInput('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-2xs"
              >
                Kaydet
              </button>
              <button
                type="button"
                onClick={() => setIsEditingDrive(false)}
                className="px-2.5 py-1.5 text-slate-500 hover:text-slate-800 text-xs font-medium"
              >
                Vazgeç
              </button>
            </form>
          )}

          <div className="text-[11px] text-slate-400 hidden md:inline">
            Ders notları, ödevler ve çalışma dosyalarını tek tıkla açabilirsiniz.
          </div>
        </div>
      </div>

      {/* Modern Quick Add Bar */}
      <form onSubmit={handleQuickSubmit} className="relative flex items-center">
        <input
          type="text"
          value={quickInput}
          onChange={(e) => setQuickInput(e.target.value)}
          placeholder={`${week.weekNumber}. Hafta için hızlıca görev yaz ve Enter'a bas...`}
          className="w-full bg-white border border-slate-200/90 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl pl-4 pr-24 py-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-all shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
        />
        <div className="absolute right-2 flex items-center gap-1.5">
          <button
            type="submit"
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs"
          >
            Ekle
          </button>
        </div>
      </form>

      {/* Filter and Category Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Status filters */}
        <div className="flex items-center gap-1 p-1 bg-slate-100/90 rounded-xl border border-slate-200/70">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              filterStatus === 'all'
                ? 'bg-white text-slate-950 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tümü ({totalTasks})
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              filterStatus === 'pending'
                ? 'bg-white text-blue-800 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Yapılacak ({totalTasks - completedCount})
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              filterStatus === 'completed'
                ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tamamlanan ({completedCount})
          </button>
        </div>

        {/* Category selector */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 font-medium rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-2xs transition-all"
          >
            <option value="all">Tüm Kategoriler</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Task List Cards */}
      <div className="space-y-2">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 px-4 border border-dashed border-slate-250 rounded-2xl bg-white/80 shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200/80 flex items-center justify-center mx-auto mb-3 text-blue-600">
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">
              {totalTasks === 0 ? 'Bu haftaya henüz görev eklenmedi' : 'Seçili filtrede görev bulunamadı'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {totalTasks === 0
                ? 'Yukarıdaki hızlı ekleme kutusunu veya butonu kullanarak kendi görev ve hedeflerinizi belirleyin.'
                : 'Filtreleri sıfırlayarak tüm görevleri görüntüleyebilirsiniz.'}
            </p>
            <button
              onClick={onAddTask}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-b from-blue-500 via-blue-600 to-blue-700 hover:brightness-105 rounded-xl transition-all cursor-pointer shadow-xs border border-blue-600/90 shadow-blue-500/20"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>İlk Görevini Ekle</span>
            </button>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`group relative flex items-start sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl border transition-all duration-150 ${
                task.completed
                  ? 'bg-slate-50/70 border-slate-200/70 opacity-80'
                  : 'bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-[0_2px_6px_rgba(0,0,0,0.03)] shadow-2xs'
              }`}
            >
              {/* Checkbox & Task details */}
              <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                <button
                  onClick={() => onToggleTask(task.id)}
                  className={`mt-0.5 sm:mt-0 w-5 h-5 rounded-lg flex items-center justify-center border transition-all cursor-pointer shrink-0 ${
                    task.completed
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                      : 'border-slate-300 hover:border-blue-500 bg-white hover:bg-blue-50/40'
                  }`}
                  aria-label={task.completed ? 'Görevi geri al' : 'Görevi tamamla'}
                >
                  {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </button>

                <div className="min-w-0 flex-1">
                  <div
                    className={`text-sm font-semibold tracking-tight transition-colors ${
                      task.completed ? 'line-through text-slate-400' : 'text-slate-900'
                    }`}
                  >
                    {task.title}
                  </div>

                  {/* Clean modern metadata */}
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                    <span className="font-semibold text-slate-700">{task.day}</span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span className={`px-2 py-0.2 rounded-md border text-[11px] font-semibold ${getCategoryBadge(task.category)}`}>
                      {task.category}
                    </span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    {getPriorityBadge(task.priority)}
                    {task.timeEstimateMinutes && (
                      <>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <span className="font-mono tabular-nums text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {task.timeEstimateMinutes} dk
                        </span>
                      </>
                    )}
                  </div>

                  {task.notes && (
                    <p className="text-xs text-slate-600 mt-2 bg-slate-50 rounded-lg p-2.5 border border-slate-150 leading-relaxed">
                      {task.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onEditTask(task)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  title="Düzenle"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDeleteTask(task.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Sil"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
