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
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  currentLang,
  onLanguageChange,
  profile,
  onUpdateProfile,
  offlineCount,
  onClearOfflineCache,
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
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col my-auto text-slate-800">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">{t.settingsTitle}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-6 overflow-y-auto max-h-[80vh] text-xs sm:text-sm">
          {/* Section 1: Language Switcher (Dynamic EN / FR) */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              {t.languageSection}
            </h4>
            <p className="text-slate-500 text-xs">{t.selectLanguage}</p>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onLanguageChange('en')}
                className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                  currentLang === 'en'
                    ? 'bg-blue-50 border-blue-500 text-slate-900 shadow-xs ring-1 ring-blue-500'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">🇬🇧</span>
                  <div className="text-left">
                    <span className="font-bold block text-sm">English</span>
                    <span className="text-[10px] text-slate-500">Continuous Medical Education</span>
                  </div>
                </div>
                {currentLang === 'en' && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
              </button>

              <button
                type="button"
                onClick={() => onLanguageChange('fr')}
                className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                  currentLang === 'fr'
                    ? 'bg-blue-50 border-blue-500 text-slate-900 shadow-xs ring-1 ring-blue-500'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">🇫🇷</span>
                  <div className="text-left">
                    <span className="font-bold block text-sm">Français</span>
                    <span className="text-[10px] text-slate-500">Formation Médicale Continue</span>
                  </div>
                </div>
                {currentLang === 'fr' && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
              </button>
            </div>
          </div>

          <div className="h-[1px] bg-slate-200" />

          {/* Section 2: Practitioner Credentials */}
          <form onSubmit={handleSave} className="space-y-3.5">
            <h4 className="font-bold text-xs uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              {t.profileSection}
            </h4>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                {t.fullName}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {currentLang === 'fr' ? 'Titre & Fonction' : 'Title & Specialty'}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {t.medicalLicense}
                </label>
                <input
                  type="text"
                  value={license}
                  onChange={(e) => setLicense(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-900 font-mono text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                {t.hospitalAffiliation}
              </label>
              <input
                type="text"
                value={hospital}
                onChange={(e) => setHospital(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <p className="text-xs text-emerald-600 font-medium text-center">
                ✓ {currentLang === 'fr' ? 'Modifications enregistrées !' : 'Profile credentials updated successfully!'}
              </p>
            )}
          </form>

          <div className="h-[1px] bg-slate-200" />

          {/* Section 3: Offline Storage Cache */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5" />
              {t.offlineStorage}
            </h4>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800 block text-xs">
                  {offlineCount} {currentLang === 'fr' ? 'module(s) enregistré(s) pour consultation hors-ligne' : 'module(s) stored for offline study'}
                </span>
                <span className="text-[11px] text-slate-500">
                  {currentLang === 'fr'
                    ? 'Disponibles sans réseau sur votre navigateur'
                    : 'Available without internet connectivity'}
                </span>
              </div>
              {offlineCount > 0 && (
                <button
                  type="button"
                  onClick={onClearOfflineCache}
                  className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-rose-50 hover:text-rose-600 text-slate-600 text-xs border border-slate-200 transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t.clearCache}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
