import React, { useState } from 'react';
import {
  X,
  Globe,
  User,
  Shield,
  HardDrive,
  Check,
  Building2,
  Trash2,
  Save,
  Moon,
  Sun,
} from 'lucide-react';
import { Language, UserProfile } from '../types';
import { getTranslation } from '../translations';

interface SettingsModalProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  offlineCount: number;
  onClearOfflineCache: () => void;
  onSignOut: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  currentLang,
  onLanguageChange,
  profile,
  onUpdateProfile,
  offlineCount,
  onClearOfflineCache,
  onSignOut,
  darkMode,
  onToggleDarkMode,
  onClose,
}) => {
  const t = getTranslation(currentLang);
  const [name, setName] = useState<string>(profile.name);
  const [title, setTitle] = useState<string>(profile.title);
  const [license, setLicense] = useState<string>(profile.medicalLicenseNumber);
  const [hospital, setHospital] = useState<string>(profile.hospitalAffiliation);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...profile,
      name,
      title,
      medicalLicenseNumber: license,
      hospitalAffiliation: hospital,
      language: currentLang,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div
      id="settings-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col my-auto text-slate-800 dark:text-slate-100 transition-colors">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{t.settingsTitle}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-6 overflow-y-auto max-h-[80vh] text-xs sm:text-sm">
          {/* Section 1: Dark Mode / Night Shift */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
              <Moon className="w-3.5 h-3.5" />
              {currentLang === 'fr' ? 'Mode Nuit / Sombre' : 'Night Shift / Dark Mode'}
            </h4>
            <p className="text-slate-500 dark:text-slate-400 text-xs">
              {currentLang === 'fr'
                ? 'Optimiser l’affichage pour les gardes de nuit et les environnements faiblement éclairés.'
                : 'Optimize interface contrast for night shifts and low-light clinical environments.'}
            </p>

            <button
              type="button"
              onClick={onToggleDarkMode}
              className={`w-full p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                darkMode
                  ? 'bg-blue-950/40 border-blue-500 text-blue-200 shadow-xs ring-1 ring-blue-500'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-750'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${darkMode ? 'bg-blue-900 text-blue-300' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'}`}>
                  {darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                </div>
                <div className="text-left">
                  <span className="font-bold block text-sm">
                    {darkMode ? (currentLang === 'fr' ? 'Mode Sombre Activé' : 'Dark Mode Enabled') : (currentLang === 'fr' ? 'Mode Clair Activé' : 'Light Mode Enabled')}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    {currentLang === 'fr' ? 'Basculer entre clair et sombre' : 'Toggle between light and dark UI'}
                  </span>
                </div>
              </div>
              <div className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${darkMode ? 'bg-blue-600 justify-end' : 'bg-slate-300 dark:bg-slate-600 justify-start'}`}>
                <div className="bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300" />
              </div>
            </button>
          </div>

          <div className="h-[1px] bg-slate-200 dark:bg-slate-800" />

          {/* Section 2: Language Switcher (Dynamic EN / FR) */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              {t.languageSection}
            </h4>
            <p className="text-slate-500 dark:text-slate-400 text-xs">{t.selectLanguage}</p>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onLanguageChange('en')}
                className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                  currentLang === 'en'
                    ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-slate-900 dark:text-slate-100 shadow-xs ring-1 ring-blue-500'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">🇬🇧</span>
                  <div className="text-left">
                    <span className="font-bold block text-sm">English</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Continuous Medical Education</span>
                  </div>
                </div>
                {currentLang === 'en' && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />}
              </button>

              <button
                type="button"
                onClick={() => onLanguageChange('fr')}
                className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                  currentLang === 'fr'
                    ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-slate-900 dark:text-slate-100 shadow-xs ring-1 ring-blue-500'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">🇫🇷</span>
                  <div className="text-left">
                    <span className="font-bold block text-sm">Français</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Formation Médicale Continue</span>
                  </div>
                </div>
                {currentLang === 'fr' && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />}
              </button>
            </div>
          </div>

          <div className="h-[1px] bg-slate-200 dark:bg-slate-800" />

          {/* Section 3: Practitioner Credentials */}
          <form onSubmit={handleSave} className="space-y-3.5">
            <h4 className="font-bold text-xs uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              {t.profileSection}
            </h4>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t.fullName}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {currentLang === 'fr' ? 'Titre & Fonction' : 'Title & Specialty'}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t.medicalLicense}
                </label>
                <input
                  type="text"
                  value={license}
                  onChange={(e) => setLicense(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t.hospitalAffiliation}
              </label>
              <input
                type="text"
                value={hospital}
                onChange={(e) => setHospital(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              className="mt-2 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-xs transition-transform active:scale-98"
            >
              <Save className="w-4 h-4" />
              <span>{t.saveSettings}</span>
            </button>

            {savedSuccess && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium text-center">
                ✓ {currentLang === 'fr' ? 'Modifications enregistrées !' : 'Profile credentials updated successfully!'}
              </p>
            )}
          </form>

          <div className="h-[1px] bg-slate-200 dark:bg-slate-800" />

          {/* Section 4: Offline Storage Cache */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5" />
              {t.offlineStorage}
            </h4>

            <div className="bg-slate-50 dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block text-xs">
                  {offlineCount} {currentLang === 'fr' ? 'module(s) enregistré(s) pour consultation hors-ligne' : 'module(s) stored for offline study'}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {currentLang === 'fr'
                    ? 'Disponibles sans réseau sur votre navigateur'
                    : 'Available without internet connectivity'}
                </span>
              </div>
              {offlineCount > 0 && (
                <button
                  type="button"
                  onClick={onClearOfflineCache}
                  className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:text-rose-600 dark:hover:text-rose-400 text-slate-600 dark:text-slate-300 text-xs border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t.clearCache}</span>
                </button>
              )}
            </div>
          </div>

          <div className="h-[1px] bg-slate-200 dark:bg-slate-800" />

          {/* Section 5: Sign Out / Return to Landing */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={onSignOut}
              className="w-full py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 border border-slate-300 dark:border-slate-700 transition-colors"
            >
              <span>{currentLang === 'fr' ? 'Se Déconnecter (Retour Accueil)' : 'Sign Out & Return to Landing Page'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
