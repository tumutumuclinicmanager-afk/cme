import React from 'react';
import {
  Stethoscope,
  Globe,
  Settings,
  ShieldAlert,
  UserCheck,
  Search,
  Sparkles,
  Award,
  BookOpen,
  Lock,
  LogOut,
} from 'lucide-react';
import { Language, UserProfile } from '../types';
import { getTranslation } from '../translations';

interface HeaderProps {
  lang: Language;
  onLanguageToggle: () => void;
  role: 'learner' | 'admin';
  isAdminAuthenticated: boolean;
  onRoleToggle: () => void;
  onOpenAdminLogin: () => void;
  onAdminLogout: () => void;
  onOpenSettings: () => void;
  profile: UserProfile;
  freeCountAvailable: number;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  onLanguageToggle,
  role,
  isAdminAuthenticated,
  onRoleToggle,
  onOpenAdminLogin,
  onAdminLogout,
  onOpenSettings,
  profile,
  freeCountAvailable,
}) => {
  const t = getTranslation(lang);

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 text-slate-800 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Left: Brand / Title */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shrink-0">
            <Stethoscope className="w-5 h-5 text-white stroke-[2.5]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 truncate">
                {t.appTitle}
              </h1>
              <span className="hidden md:inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-blue-50 text-blue-700 border border-blue-100">
                CPD Accredited
              </span>
            </div>
            <p className="text-[11px] text-slate-500 truncate hidden sm:block">
              {t.appSubtitle}
            </p>
          </div>
        </div>

        {/* Center: Free Tier Status Pill */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-600">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>
            {lang === 'fr'
              ? 'Offre Découverte : 3 Présentations Offertes'
              : 'Free Tier: First 3 Presentations Free'}
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Dynamic Language Switcher (EN / FR) */}
          <button
            type="button"
            onClick={onLanguageToggle}
            title={lang === 'en' ? 'Passer en Français' : 'Switch to English'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-blue-600" />
            <span className="font-mono">{lang.toUpperCase()}</span>
          </button>

          {/* Role / Admin Toggle */}
          {role === 'admin' ? (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onRoleToggle}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border bg-amber-50 text-amber-900 border-amber-300 shadow-xs"
                title="Admin Dashboard (Click to switch back to Practitioner View)"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                <span>{t.roleAdmin}</span>
              </button>
              <button
                type="button"
                onClick={onAdminLogout}
                className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors"
                title={lang === 'fr' ? 'Déconnexion Admin' : 'Sign Out Admin'}
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  if (isAdminAuthenticated) {
                    onRoleToggle();
                  } else {
                    onOpenAdminLogin();
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  isAdminAuthenticated
                    ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                }`}
                title={
                  isAdminAuthenticated
                    ? 'Open Administrator Portal'
                    : 'Sign in to Administrator Portal'
                }
              >
                {isAdminAuthenticated ? (
                  <>
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                    <span className="hidden sm:inline">{t.roleAdmin}</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 text-slate-500" />
                    <span className="hidden sm:inline">
                      {lang === 'fr' ? 'Connexion Admin' : 'Admin Login'}
                    </span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Settings Button */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors"
            title={t.navSettings}
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
