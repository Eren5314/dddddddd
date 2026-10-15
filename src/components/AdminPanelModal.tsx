import React, { useState } from 'react';
import { WeekData, Resource } from '../types';
import {
  ShieldCheck,
  X,
  Link as LinkIcon,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Check,
  LogOut,
  FolderOpen,
  Calendar,
  Layers,
  Sparkles,
  Sun,
  Moon
} from 'lucide-react';
import { GoogleDriveIcon } from './GoogleDriveIcon';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  weeks: WeekData[];
  onUpdateDriveUrl: (weekId: string, url: string) => void;
  onAddResource: (weekId: string, resource: Omit<Resource, 'id'>) => void;
  onDeleteResource: (weekId: string, resourceId: string) => void;
  onQuickAddTaskToWeek: (weekId: string, title: string) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onLogout: () => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  weeks,
  onUpdateDriveUrl,
  onAddResource,
  onDeleteResource,
  onQuickAddTaskToWeek,
  theme,
  onToggleTheme,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'links' | 'tasks' | 'settings'>('links');
  const [selectedWeekId, setSelectedWeekId] = useState<string>(weeks[0]?.id || '');
  
  // Link editing state
  const [editingDriveWeekId, setEditingDriveWeekId] = useState<string | null>(null);
  const [driveInput, setDriveInput] = useState('');

  // Add Resource state
  const [showAddResource, setShowAddResource] = useState(false);
  const [targetWeekForRes, setTargetWeekForRes] = useState<string>(weeks[0]?.id || '');
  const [resTitle, setResTitle] = useState('');
  const [resUrl, setResUrl] = useState('');
  const [resType, setResType] = useState<Resource['type']>('Google Drive');
  const [resDesc, setResDesc] = useState('');

  // Add Task state
  const [taskWeekId, setTaskWeekId] = useState<string>(weeks[0]?.id || '');
  const [taskTitle, setTaskTitle] = useState('');

  if (!isOpen) return null;

  const currentSelectedWeek = weeks.find((w) => w.id === selectedWeekId) || weeks[0];

  const handleSaveDrive = (weekId: string) => {
    onUpdateDriveUrl(weekId, driveInput.trim());
    setEditingDriveWeekId(null);
    setDriveInput('');
  };

  const handleCreateResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resTitle.trim()) return;
    onAddResource(targetWeekForRes, {
      title: resTitle.trim(),
      url: resUrl.trim() || undefined,
      type: resType,
      description: resDesc.trim() || undefined,
    });
    setResTitle('');
    setResUrl('');
    setResDesc('');
    setShowAddResource(false);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    onQuickAddTaskToWeek(taskWeekId, taskTitle.trim());
    setTaskTitle('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div
        className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-800 dark:text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-5 sm:p-6 border-b border-slate-150 dark:border-slate-800 flex items-center justify-between gap-4 bg-slate-50/70 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-2xl shadow-sm shadow-blue-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  Yönetici Kontrol Paneli
                </h2>
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Aktif Oturum
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Tüm haftaların linklerini, Google Drive bağlantılarını ve görevlerini buradan yönetebilirsiniz.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleTheme}
              className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors cursor-pointer"
              title={theme === 'dark' ? 'Açık Temaya Geç' : 'Koyu Temaya Geç'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-600" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-6 border-b border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 gap-2">
          <button
            onClick={() => setActiveTab('links')}
            className={`py-3.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'links'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Link & Drive Yönetimi</span>
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className={`py-3.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'tasks'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Haftalık Görev Ekleme</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'settings'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Güvenlik & Ayarlar</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'links' && (
            <div className="space-y-6">
              {/* Top Action to Add Resource */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50">
                <div>
                  <h4 className="text-sm font-bold text-blue-950 dark:text-blue-200 flex items-center gap-2">
                    <GoogleDriveIcon className="w-4 h-4 shrink-0" />
                    <span>Haftalık Link & Google Drive Bağlantıları</span>
                  </h4>
                  <p className="text-xs text-blue-800/80 dark:text-blue-300/80 mt-0.5">
                    Aşağıdaki tablodan istediğiniz haftanın Google Drive veya kaynak linkini doğrudan düzenleyebilirsiniz.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddResource(!showAddResource)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all cursor-pointer shadow-xs whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Özel Link / Kaynak Ekle</span>
                </button>
              </div>

              {/* Add Resource Form Modal / Inline */}
              {showAddResource && (
                <form
                  onSubmit={handleCreateResource}
                  className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-3 animate-in fade-in"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Yeni Bağlantı / Kaynak Oluştur
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAddResource(false)}
                      className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      Kapat
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1 block">
                        Hangi Hafta:
                      </label>
                      <select
                        value={targetWeekForRes}
                        onChange={(e) => setTargetWeekForRes(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                      >
                        {weeks.map((w) => (
                          <option key={w.id} value={w.id}>
                            {w.weekNumber}. Hafta: {w.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1 block">
                        Bağlantı Türü:
                      </label>
                      <select
                        value={resType}
                        onChange={(e) => setResType(e.target.value as any)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                      >
                        <option value="Google Drive">Google Drive</option>
                        <option value="Link">Web Bağlantısı (Link)</option>
                        <option value="Doküman">Doküman / PDF</option>
                        <option value="Video">Video / Kurs</option>
                        <option value="Kitap">Kitap</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1 block">
                      Başlık:
                    </label>
                    <input
                      type="text"
                      value={resTitle}
                      onChange={(e) => setResTitle(e.target.value)}
                      placeholder="Örn: 1. Hafta Notları & Çözümlü Sorular"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1 block">
                      URL (Bağlantı Adresi):
                    </label>
                    <input
                      type="url"
                      value={resUrl}
                      onChange={(e) => setResUrl(e.target.value)}
                      placeholder="https://drive.google.com/... veya https://..."
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 font-mono placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1 block">
                      Açıklama (Opsiyonel):
                    </label>
                    <input
                      type="text"
                      value={resDesc}
                      onChange={(e) => setResDesc(e.target.value)}
                      placeholder="Bu bağlantı hakkında kısa not..."
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddResource(false)}
                      className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    >
                      Vazgeç
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                    >
                      Bağlantıyı Kaydet
                    </button>
                  </div>
                </form>
              )}

              {/* Weeks Google Drive List */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">
                  Haftalık Google Drive Klasörleri
                </h5>

                <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
                  {weeks.map((week) => {
                    const isEditing = editingDriveWeekId === week.id;

                    return (
                      <div
                        key={week.id}
                        className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-blue-900 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded text-xs font-mono shrink-0">
                              {week.weekNumber}. Hafta
                            </span>
                            <span className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                              {week.title}
                            </span>
                          </div>

                          {!isEditing ? (
                            <div className="mt-1.5 flex items-center gap-2 text-xs">
                              {week.driveUrl ? (
                                <a
                                  href={week.driveUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:underline font-mono text-[11px] truncate max-w-md"
                                >
                                  <GoogleDriveIcon className="w-3.5 h-3.5 shrink-0" />
                                  <span className="truncate">{week.driveUrl}</span>
                                  <ExternalLink className="w-3 h-3 shrink-0" />
                                </a>
                              ) : (
                                <span className="text-slate-400 dark:text-slate-500 italic text-[11px]">
                                  Google Drive bağlantısı henüz tanımlanmadı
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="mt-2 flex items-center gap-2">
                              <input
                                type="url"
                                value={driveInput}
                                onChange={(e) => setDriveInput(e.target.value)}
                                placeholder="https://drive.google.com/..."
                                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                                autoFocus
                              />
                              <button
                                onClick={() => handleSaveDrive(week.id)}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs"
                              >
                                Kaydet
                              </button>
                              <button
                                onClick={() => setEditingDriveWeekId(null)}
                                className="px-2 py-1 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                              >
                                Vazgeç
                              </button>
                            </div>
                          )}
                        </div>

                        {!isEditing && (
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => {
                                setEditingDriveWeekId(week.id);
                                setDriveInput(week.driveUrl || '');
                              }}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-xs transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>{week.driveUrl ? 'Düzenle' : 'Drive Ekle'}</span>
                            </button>

                            {week.driveUrl && (
                              <button
                                onClick={() => {
                                  if (window.confirm(`${week.weekNumber}. Hafta Drive bağlantısını kaldırmak istiyor musunuz?`)) {
                                    onUpdateDriveUrl(week.id, '');
                                  }
                                }}
                                className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
                                title="Drive Bağlantısını Kaldır"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Custom Resources list */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">
                  Ek Bağlantılar & Kaynaklar
                </h5>
                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
                  {weeks.flatMap((w) =>
                    w.resources.map((r) => (
                      <div
                        key={r.id}
                        className="p-3.5 flex items-center justify-between gap-3 text-xs hover:bg-slate-50/50 dark:hover:bg-slate-800/40"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-mono text-[10px] text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 px-1.5 py-0.5 rounded">
                            {w.weekNumber}. Hafta
                          </span>
                          <span className="font-bold text-slate-800 dark:text-slate-200 truncate">{r.title}</span>
                          <span className="text-[11px] text-slate-400 font-medium">({r.type})</span>
                          {r.url && (
                            <a
                              href={r.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 font-mono text-[11px] truncate max-w-[200px]"
                            >
                              <span className="truncate">{r.url}</span>
                              <ExternalLink className="w-3 h-3 shrink-0" />
                            </a>
                          )}
                        </div>

                        <button
                          onClick={() => onDeleteResource(w.id, r.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                          title="Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}

                  {weeks.every((w) => w.resources.length === 0) && (
                    <div className="p-4 text-center text-xs text-slate-400 dark:text-slate-500">
                      Henüz ek kaynak eklenmedi. Yukarıdaki "Özel Link / Kaynak Ekle" butonundan ekleyebilirsiniz.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="space-y-6">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-4">
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-blue-600" />
                  <span>Hızlı Görev Ekle (Hafta Seçerek)</span>
                </h4>

                <form onSubmit={handleCreateTask} className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 block">
                      Hedef Hafta:
                    </label>
                    <select
                      value={taskWeekId}
                      onChange={(e) => setTaskWeekId(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                    >
                      {weeks.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.weekNumber}. Hafta: {w.title} ({w.tasks.length} Görev)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 block">
                      Görev Başlığı:
                    </label>
                    <input
                      type="text"
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                      placeholder="Örn: 1. Hafta için yeni konu çalışması..."
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                    >
                      Görevi Ekip Listesine Ekle
                    </button>
                  </div>
                </form>
              </div>

              {/* Week Tasks Preview */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">
                    Haftalık Görev Sayıları
                  </h5>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {weeks.map((w) => (
                    <div
                      key={w.id}
                      className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
                    >
                      <div className="text-xs font-extrabold text-blue-600 dark:text-blue-400">
                        {w.weekNumber}. Hafta
                      </div>
                      <div className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate mt-0.5">
                        {w.title}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-mono">
                        {w.tasks.filter((t) => t.completed).length} / {w.tasks.length} Tamamlandı
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Theme Settings */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Arayüz Teması (Koyu / Açık)
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Göz yormayan koyu tema veya aydınlık açık tema arasında geçiş yapın.
                  </p>
                </div>
                <button
                  onClick={onToggleTheme}
                  className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 hover:border-blue-500 transition-colors flex items-center gap-2 cursor-pointer shadow-2xs"
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="w-4 h-4 text-amber-400" />
                      <span>Açık Temaya Geç</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-4 h-4 text-blue-600" />
                      <span>Koyu Temaya Geç</span>
                    </>
                  )}
                </button>
              </div>

              {/* Password info & Security */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-3">
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Yönetici Şifre Güvenliği
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Admin paneli ve korumalı alanlar (1. Hafta hızlı görev ekleme ve link ekleme işlemleri) yönetici şifresi ile korunmaktadır.
                </p>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      onLogout();
                      onClose();
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-950/70 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Yönetici Oturumunu Kapat</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-150 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Şifre ile korumalı</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl transition-colors cursor-pointer"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
