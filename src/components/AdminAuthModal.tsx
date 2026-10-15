import React, { useState } from 'react';
import { ShieldAlert, Lock, KeyRound, X, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  description?: string;
}

export const ADMIN_PASSWORD = 'Eren9852';

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title = 'Yönetici Doğrulaması',
  description = 'Bu işlemi gerçekleştirmek ve link eklemek için Admin şifresi gereklidir.',
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setError('');
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setPassword('');
        onSuccess();
      }, 500);
    } else {
      setError('Hatalı şifre! Lütfen şifrenizi kontrol edip tekrar deneyin.');
      setIsSuccess(false);
    }
  };

  const handleClose = () => {
    setPassword('');
    setError('');
    setIsSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white border border-slate-200 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-150 bg-gradient-to-r from-slate-50 to-blue-50/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100/80 text-blue-700 rounded-xl">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">{title}</h3>
              <p className="text-[11px] text-slate-500 font-mono">Şifre: Eren9852</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            {description}
          </p>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Admin Şifresi:
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Şifreyi girin..."
                autoFocus
                className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl pl-9 pr-10 py-2.5 text-xs text-slate-900 font-mono focus:outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                title={showPassword ? 'Şifreyi Gizle' : 'Şifreyi Göster'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isSuccess && (
            <div className="flex items-center gap-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs animate-in fade-in font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Giriş başarılı! Yönlendiriliyorsunuz...</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleClose}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={isSuccess || !password}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs shadow-blue-500/20 transition-all cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Doğrula & Devam Et</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
