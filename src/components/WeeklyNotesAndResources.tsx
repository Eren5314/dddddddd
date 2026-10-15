import React, { useState } from 'react';
import { WeekData, Resource } from '../types';
import {
  BookOpen,
  Star,
  Plus,
  ExternalLink,
  Trash2,
  Bookmark,
  CheckCircle,
  Lightbulb,
  AlertTriangle,
  ArrowRight,
  Edit3,
  Link as LinkIcon,
  CheckCheck,
  Lock
} from 'lucide-react';
import { GoogleDriveIcon } from './GoogleDriveIcon';

interface WeeklyNotesAndResourcesProps {
  week: WeekData;
  onUpdateNotes: (notes: string) => void;
  onUpdateRating: (rating: number) => void;
  onUpdateRetrospective: (retrospective: { highlights: string; challenges: string; nextWeekFocus: string }) => void;
  onAddResource: (resource: Omit<Resource, 'id'>) => void;
  onDeleteResource: (resourceId: string) => void;
  onUpdateDriveUrl?: (url: string) => void;
  isAdmin?: boolean;
  onRequireAdmin?: (action: () => void, promptReason?: string, title?: string) => void;
}

export const WeeklyNotesAndResources: React.FC<WeeklyNotesAndResourcesProps> = ({
  week,
  onUpdateNotes,
  onUpdateRating,
  onUpdateRetrospective,
  onAddResource,
  onDeleteResource,
  onUpdateDriveUrl,
  isAdmin = false,
  onRequireAdmin,
}) => {
  const [notes, setNotes] = useState(week.notes || '');
  const [highlights, setHighlights] = useState(week.retrospective?.highlights || '');
  const [challenges, setChallenges] = useState(week.retrospective?.challenges || '');
  const [nextFocus, setNextFocus] = useState(week.retrospective?.nextWeekFocus || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Dedicated Drive card state
  const [isEditingDrive, setIsEditingDrive] = useState(false);
  const [driveInput, setDriveInput] = useState(week.driveUrl || '');
  const [copiedDrive, setCopiedDrive] = useState(false);

  // New resource modal/form
  const [showResourceForm, setShowResourceForm] = useState(false);
  const [resourceTitle, setResourceTitle] = useState('');
  const [resourceUrl, setResourceUrl] = useState('');
  const [resourceType, setResourceType] = useState<'Link' | 'Kitap' | 'Video' | 'Doküman' | 'Google Drive'>('Link');
  const [resourceDesc, setResourceDesc] = useState('');

  const handleSaveAll = () => {
    onUpdateNotes(notes);
    onUpdateRetrospective({
      highlights,
      challenges,
      nextWeekFocus: nextFocus,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleOpenResourceForm = () => {
    if (onRequireAdmin && !isAdmin) {
      onRequireAdmin(
        () => setShowResourceForm(true),
        'Haftaya yeni bağlantı veya kaynak eklemek için yönetici şifresini girin.',
        'Kaynak Ekleme - Yönetici Doğrulaması'
      );
    } else {
      setShowResourceForm(true);
    }
  };

  const handleCreateResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resourceTitle.trim()) return;

    const resourceData = {
      title: resourceTitle.trim(),
      url: resourceUrl.trim() || undefined,
      type: resourceType,
      description: resourceDesc.trim() || undefined,
    };

    if (onRequireAdmin && !isAdmin) {
      onRequireAdmin(
        () => {
          onAddResource(resourceData);
          setResourceTitle('');
          setResourceUrl('');
          setResourceDesc('');
          setShowResourceForm(false);
        },
        'Kaynağı kaydetmek için yönetici şifresini girin.',
        'Kaynak Doğrulaması'
      );
    } else {
      onAddResource(resourceData);
      setResourceTitle('');
      setResourceUrl('');
      setResourceDesc('');
      setShowResourceForm(false);
    }
  };

  const handleStartEditingDrive = () => {
    if (onRequireAdmin && !isAdmin) {
      onRequireAdmin(
        () => {
          setDriveInput(week.driveUrl || '');
          setIsEditingDrive(true);
        },
        'Google Drive bağlantısı eklemek veya düzenlemek için yönetici şifresini girin.',
        'Drive Bağlantısı'
      );
    } else {
      setDriveInput(week.driveUrl || '');
      setIsEditingDrive(true);
    }
  };

  const handleSaveDriveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const url = driveInput.trim();

    if (onRequireAdmin && !isAdmin) {
      onRequireAdmin(
        () => {
          if (onUpdateDriveUrl) onUpdateDriveUrl(url);
          setIsEditingDrive(false);
        },
        'Google Drive linkini kaydetmek için yönetici şifresini girin.',
        'Drive Kaydı'
      );
    } else {
      if (onUpdateDriveUrl) onUpdateDriveUrl(url);
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

  const handleRemoveDrive = () => {
    const doRemove = () => {
      if (window.confirm('Bu haftaya ait Google Drive bağlantısını kaldırmak istiyor musunuz?')) {
        if (onUpdateDriveUrl) {
          onUpdateDriveUrl('');
        }
        setDriveInput('');
        setIsEditingDrive(false);
      }
    };

    if (onRequireAdmin && !isAdmin) {
      onRequireAdmin(
        doRemove,
        'Google Drive bağlantısını kaldırmak için yönetici şifresini girin.',
        'Drive Kaldırma'
      );
    } else {
      doRemove();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Save Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs transition-colors">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400 mb-1">
            <span className="font-extrabold text-blue-900 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/70 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800">
              {week.weekNumber}. Hafta
            </span>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
            <span>Notlar, Kaynaklar ve Değerlendirme</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Haftalık Not Defteri & Kaynaklar</h2>
        </div>

        <div className="flex items-center gap-3">
          {saveSuccess && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-800 dark:text-emerald-400 font-medium animate-in fade-in">
              <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Kaydedildi</span>
            </span>
          )}
          <button
            onClick={handleSaveAll}
            className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors cursor-pointer shadow-xs shadow-blue-500/20"
          >
            Değişiklikleri Kaydet
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Markdown-style Notes & Retrospective (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Notes Area */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 shadow-xs transition-colors">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Haftalık Notlar & Günlük</span>
              </label>
              <span className="text-xs text-slate-400 dark:text-slate-500">Serbest çalışma notları</span>
            </div>
            <textarea
              rows={8}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Bu hafta ne öğrendin? Karşılaştığın önemli noktalar, çözümler veya unutulmaması gereken detaylar..."
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 font-sans leading-relaxed resize-y"
            />
          </div>

          {/* Retrospective Section */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-xs transition-colors">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Haftalık Değerlendirme & Retrospektif</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                  <span>Bu haftanın en iyi başarıları ve iyi gidenler:</span>
                </label>
                <textarea
                  rows={2}
                  value={highlights}
                  onChange={(e) => setHighlights(e.target.value)}
                  placeholder="Başarıyla bitirdiğim konular, düzenli çalıştığım anlar..."
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                  <span>Zorlandığım kısımlar veya dikkat dağıtıcılar:</span>
                </label>
                <textarea
                  rows={2}
                  value={challenges}
                  onChange={(e) => setChallenges(e.target.value)}
                  placeholder="Zamanımı alan engeller, tam oturtamadığım kavramlar..."
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  <ArrowRight className="w-3.5 h-3.5 text-blue-800 dark:text-blue-400" />
                  <span>Gelecek hafta için ana odak & stratejim:</span>
                </label>
                <textarea
                  rows={2}
                  value={nextFocus}
                  onChange={(e) => setNextFocus(e.target.value)}
                  placeholder="Gelecek haftaya taşınacak aksiyonlar..."
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Google Drive & Resources & Rating (1 col) */}
        <div className="space-y-6">
          {/* Dedicated Google Drive Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3.5 shadow-xs transition-colors">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <GoogleDriveIcon className="w-4 h-4 shrink-0" />
                <span>Google Drive Klasörü</span>
              </h3>
              {week.driveUrl && !isEditingDrive && (
                <button
                  onClick={handleStartEditingDrive}
                  className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                  title="Düzenle (Admin Şifresi Gerekir)"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {week.driveUrl && !isEditingDrive ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Bu haftaya ait ders notları, çalışma kağıtları veya proje dosyalarınız:
                </p>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between gap-2">
                  <a
                    href={week.driveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-bold text-xs truncate"
                  >
                    <GoogleDriveIcon className="w-4 h-4 shrink-0" />
                    <span className="truncate">Google Drive'ı Aç</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={handleCopyDriveLink}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700 rounded-md transition-colors cursor-pointer"
                      title="Linki Kopyala"
                    >
                      {copiedDrive ? (
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <LinkIcon className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={handleRemoveDrive}
                      className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-md transition-colors cursor-pointer"
                      title="Kaldır (Admin Şifresi Gerekir)"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ) : isEditingDrive ? (
              <form onSubmit={handleSaveDriveUrl} className="space-y-2.5">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Google Drive klasör veya dosya bağlantınızı buraya yapıştırın:
                </p>
                <input
                  type="url"
                  value={driveInput}
                  onChange={(e) => setDriveInput(e.target.value)}
                  placeholder="https://drive.google.com/drive/folders/..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 font-mono focus:outline-none"
                  autoFocus
                  required
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingDrive(false)}
                    className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs shadow-2xs cursor-pointer"
                  >
                    Kaydet
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-4 border border-dashed border-slate-200 dark:border-slate-750 rounded-xl bg-slate-50/50 dark:bg-slate-800/40">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2.5">
                  Bu haftaya henüz bir Google Drive bağlantısı eklenmedi.
                </p>
                <button
                  onClick={handleStartEditingDrive}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/70 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800 rounded-lg text-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Google Drive Linki Ekle</span>
                  {!isAdmin && <Lock className="w-3 h-3 text-slate-400 ml-0.5" />}
                </button>
              </div>
            )}
          </div>

          {/* Week Rating */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 shadow-xs transition-colors">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Star className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Haftayı Değerlendir (1-5)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Bu haftanın verimliliğini ve hissiyatını puanlayın:
            </p>
            <div className="flex items-center gap-2 pt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => onUpdateRating(star)}
                  className="p-1 text-slate-300 dark:text-slate-700 hover:text-blue-500 transition-colors cursor-pointer"
                >
                  <Star
                    className={`w-6 h-6 transition-all ${
                      week.rating && week.rating >= star
                        ? 'fill-blue-600 text-blue-600 dark:fill-blue-400 dark:text-blue-400 scale-110'
                        : 'text-slate-300 dark:text-slate-700 hover:scale-105'
                    }`}
                  />
                </button>
              ))}
              {week.rating && (
                <span className="ml-2 text-xs font-bold text-blue-900 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/70 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800 font-mono">
                  {week.rating} / 5
                </span>
              )}
            </div>
          </div>

          {/* Resources List */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-xs transition-colors">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Haftalık Ek Kaynaklar</span>
              </h3>
              <button
                onClick={handleOpenResourceForm}
                className="flex items-center gap-1 text-xs text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Kaynak Ekle</span>
                {!isAdmin && <Lock className="w-3 h-3 text-slate-400 ml-0.5" />}
              </button>
            </div>

            {/* Inline Resource Form */}
            {showResourceForm && (
              <form onSubmit={handleCreateResource} className="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2.5 animate-in fade-in">
                <input
                  type="text"
                  placeholder="Kaynak başlığı (Örn: Modern JavaScript Kılavuzu)"
                  value={resourceTitle}
                  onChange={(e) => setResourceTitle(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  required
                />
                <input
                  type="text"
                  placeholder="URL (Opsiyonel / Drive veya Web Linki)"
                  value={resourceUrl}
                  onChange={(e) => setResourceUrl(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-mono text-[11px]"
                />
                <div className="flex gap-2">
                  <select
                    value={resourceType}
                    onChange={(e) => setResourceType(e.target.value as any)}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Google Drive">Google Drive</option>
                    <option value="Link">Bağlantı</option>
                    <option value="Kitap">Kitap</option>
                    <option value="Video">Video</option>
                    <option value="Doküman">Doküman</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Kısa açıklama (Opsiyonel)"
                    value={resourceDesc}
                    onChange={(e) => setResourceDesc(e.target.value)}
                    className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowResourceForm(false)}
                    className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs shadow-2xs cursor-pointer"
                  >
                    Ekle
                  </button>
                </div>
              </form>
            )}

            {/* List */}
            <div className="space-y-2">
              {week.resources.length === 0 ? (
                <p className="text-xs text-slate-400 dark:text-slate-500 py-3 text-center">
                  Henüz ek kaynak eklenmedi.
                </p>
              ) : (
                week.resources.map((res) => (
                  <div
                    key={res.id}
                    className="group flex items-start justify-between gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-750 hover:border-slate-300 dark:hover:border-slate-650 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-slate-100">
                        {res.type === 'Google Drive' && (
                          <GoogleDriveIcon className="w-3.5 h-3.5 shrink-0" />
                        )}
                        <span className="truncate">{res.title}</span>
                        {res.url && (
                          <a
                            href={res.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 inline-flex shrink-0"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        <span className="text-blue-800 dark:text-blue-400 font-medium">{res.type}</span>
                        {res.description && (
                          <>
                            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                            <span className="truncate">{res.description}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteResource(res.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-opacity cursor-pointer"
                      title="Sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
