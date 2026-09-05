import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Building2,
  Stethoscope,
} from 'lucide-react';
import { Language } from '../types';

interface AdminLoginModalProps {
  isOpen: boolean;
  lang: Language;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  lang,
  onClose,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState<string>('admin@cme-council.org');
  const [password, setPassword] = useState<string>('admin2026');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleFillDemo = (roleType: 'board' | 'clinic') => {
    if (roleType === 'board') {
      setEmail('admin@cme-council.org');
      setPassword('admin2026');
    } else {
      setEmail('tumutumuclinicmanager@gmail.com');
      setPassword('bonny@cme2026');
    }
    setErrorMessage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail) {
      setErrorMessage(
        lang === 'fr'
          ? 'Veuillez saisir votre adresse e-mail administrateur.'
          : 'Please enter your administrator email or ID.'
      );
      return;
    }

    if (!trimmedPassword || trimmedPassword.length < 4) {
      setErrorMessage(
        lang === 'fr'
          ? 'Le mot de passe doit comporter au moins 4 caractères.'
          : 'Password must be at least 4 characters long.'
      );
      return;
    }

    setIsSubmitting(true);

    // Simulate verified authentication
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
      if (rememberMe) {
        localStorage.setItem('cme_admin_authenticated', 'true');
        localStorage.setItem('cme_admin_email', trimmedEmail);
      }
      setTimeout(() => {
        onLoginSuccess();
      }, 500);
    }, 650);
  };

  return (
    <div
      id="admin-login-modal"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
    >
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden transition-all my-8">
        {/* Top Accent Ribbon */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-blue-700 h-2 w-full" />

        {/* Header */}
        <div className="p-6 sm:p-8 bg-slate-900 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
            title={lang === 'fr' ? 'Fermer' : 'Close'}
          >
            ✕
          </button>

          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                {lang === 'fr'
                  ? 'Portail Réglementaire Sécurisé'
                  : 'CPD Regulatory Security Gate'}
              </span>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                {lang === 'fr'
                  ? 'Connexion Administrateur'
                  : 'Administrator Sign In'}
              </h2>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {lang === 'fr'
              ? 'Accès réservé aux directeurs de clinique, coordinateurs FMC et examinateurs agréés par le conseil médical.'
              : 'Restricted to hospital medical directors, CPD faculty coordinators, and board accreditation reviewers.'}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px]">
            <span className="px-2.5 py-1 rounded-full bg-white/10 border border-white/10 text-slate-200 flex items-center gap-1.5 font-medium">
              <Building2 className="w-3 h-3 text-amber-400" />
              KMPDC / FMC Kenya
            </span>
            <span className="px-2.5 py-1 rounded-full bg-white/10 border border-white/10 text-slate-200 flex items-center gap-1.5 font-medium">
              <Lock className="w-3 h-3 text-emerald-400" />
              256-Bit SSL Encrypted
            </span>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-6 bg-white">
          {/* Demo Quick Fills */}
          <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                {lang === 'fr' ? 'Comptes Démo Rapides' : 'Quick Demo Credentials'}
              </span>
              <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                Instant Access
              </span>
            </div>
            <p className="text-[11px] text-amber-800 leading-normal">
              {lang === 'fr'
                ? 'Cliquez ci-dessous pour préremplir automatiquement les identifiants :'
                : 'Click either profile below to autofill verified testing credentials:'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleFillDemo('board')}
                className="text-left px-3 py-2 rounded-xl bg-white hover:bg-amber-100/50 border border-amber-300 text-xs font-medium text-slate-800 transition-colors shadow-2xs"
              >
                <div className="font-bold text-amber-900">Dr. Bonny / Clinic Director</div>
                <div className="text-[10px] text-slate-500 truncate">admin@cme-council.org</div>
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('clinic')}
                className="text-left px-3 py-2 rounded-xl bg-white hover:bg-amber-100/50 border border-amber-300 text-xs font-medium text-slate-800 transition-colors shadow-2xs"
              >
                <div className="font-bold text-amber-900">Tumutumu Clinic Manager</div>
                <div className="text-[10px] text-slate-500 truncate">tumutumuclinicmanager...</div>
              </button>
            </div>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-2xl p-3.5 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Alert */}
          {success && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-3.5 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">
                {lang === 'fr'
                  ? 'Authentification réussie ! Chargement du tableau de bord...'
                  : 'Authentication successful! Redirecting to dashboard...'}
              </span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="admin-email-input"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
              >
                {lang === 'fr' ? 'Adresse E-mail Administrateur' : 'Administrator Email or ID'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="admin-email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@cme-council.org"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm text-slate-900 bg-white placeholder:text-slate-400 font-medium"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="admin-password-input"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
                >
                  {lang === 'fr' ? 'Mot de Passe Sécurisé' : 'Password'}
                </label>
                <span className="text-[11px] text-slate-400">Demo: admin2026</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="admin-password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm text-slate-900 bg-white placeholder:text-slate-400 font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <span>{lang === 'fr' ? 'Rester connecté sur cet appareil' : 'Remember this session'}</span>
              </label>
              <span className="text-slate-400 font-mono text-[11px]">KMPDC v2.4</span>
            </div>

            {/* Submit Button */}
            <div className="pt-3 space-y-2.5">
              <button
                type="submit"
                disabled={isSubmitting || success}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{lang === 'fr' ? 'Vérification...' : 'Verifying Credentials...'}</span>
                  </>
                ) : success ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{lang === 'fr' ? 'Connecté !' : 'Access Granted'}</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>{lang === 'fr' ? 'Se Connecter à l’Administration' : 'Sign In as Administrator'}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{lang === 'fr' ? 'Retour à l’espace Praticien' : 'Return to Practitioner Portal'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
