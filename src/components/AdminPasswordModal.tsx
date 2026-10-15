import React, { useState } from 'react';
import { Lock, ShieldAlert, KeyRound, Eye, EyeOff, X, CheckCircle } from 'lucide-react';

interface AdminPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  description?: string;
}

export const ADMIN_PASSWORD = 'Eren985253';

export const AdminPasswordModal: React.FC<AdminPasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title = 'Yönetici Şifresi Gerekli',
  description = 'Bu işlemi gerçekleştirmek için admin şifresini girmeniz gerekmektedir.',
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setError(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setPassword('');
        onSuccess();
        onClose();
      }, 500);
    } else {
      setError(true);
      setSuccess(false);
    }
  };

  const handleClose = () => {
    setPassword('');
    setError(false);
    setSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />

        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3.5 mb-5">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/50 text-blue-600 dark:text-blue-400 rounded-xl shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div className="min-w-0 pr-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-900/60 font-mono">
                Admin Koruması
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Admin Şifresi:
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(false);
                }}
                placeholder="Yönetici şifresini girin..."
                className={`w-full bg-slate-50 dark:bg-slate-800/80 border rounded-xl pl-9 pr-10 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none transition-all ${
                  error
                    ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/30 dark:bg-rose-950/20'
                    : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                }`}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1.5 mt-2 font-medium animate-in fade-in">
                <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                <span>Hatalı şifre! Lütfen doğru şifreyi girin.</span>
              </p>
            )}

            {success && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mt-2 font-medium animate-in fade-in">
                <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Yönetici doğrulaması başarılı! Giriş yapılıyor...</span>
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-150 dark:border-slate-800">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 active:scale-98 rounded-xl shadow-xs shadow-blue-500/20 transition-all cursor-pointer"
            >
              Doğrula ve Devam Et
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
