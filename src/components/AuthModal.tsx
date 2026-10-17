import React, { useState } from 'react';
import { X, Stethoscope, Mail, Lock, User, Briefcase, CheckCircle2 } from 'lucide-react';
import { Language, UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'signup';
  lang: Language;
  onClose: () => void;
  onSuccess: (profile: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  lang,
  onClose,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [fullName, setFullName] = useState('Dr. Bonny');
  const [email, setEmail] = useState('bonny@tumutumuclinic.org');
  const [profession, setProfession] = useState('Medical Doctor (MBChB)');
  const [password, setPassword] = useState('••••••••');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const updatedProfile: UserProfile = {
        id: 'user-1',
        name: fullName,
        title: profession,
        email,
        medicalLicenseNumber: 'REG-KE-84920',
        hospitalAffiliation: 'Tumutumu Mission Hospital',
        language: lang,
        unlockedPresentationIds: ['pres-1', 'pres-2', 'pres-3'],
        areasOfInterest: ['Cardiology', 'Emergency Medicine'],
        cmePoints: 45,
        unlockedBadges: ['badge-1', 'badge-2'],
      };
      localStorage.setItem('cme_user_profile', JSON.stringify(updatedProfile));
      localStorage.setItem('cme_is_logged_in', 'true');
      onSuccess(updatedProfile);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">
                {mode === 'login'
                  ? lang === 'fr'
                    ? 'Connexion Praticien'
                    : 'Practitioner Sign In'
                  : lang === 'fr'
                  ? 'Créer un Compte Praticien'
                  : 'Create Clinician Account'}
              </h3>
              <p className="text-xs text-slate-300">
                {lang === 'fr' ? 'Accès CME & Certificats CPD' : 'Access CME Slide Decks & CPD Credits'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 py-3 text-xs font-bold transition-colors ${
              mode === 'login'
                ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {lang === 'fr' ? 'Connexion' : 'Login'}
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`flex-1 py-3 text-xs font-bold transition-colors ${
              mode === 'signup'
                ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {lang === 'fr' ? "S'inscrire" : 'Sign Up'}
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {mode === 'signup' && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                {lang === 'fr' ? 'Nom Complet & Titre' : 'Full Name & Title'}
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Dr. Jane Doe"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              {lang === 'fr' ? 'Adresse Email Professionnelle' : 'Professional Email'}
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="doctor@hospital.org"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          {mode === 'signup' && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                {lang === 'fr' ? 'Profession / Spécialité' : 'Profession & Specialty'}
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <select
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                >
                  <option value="Medical Doctor (MBChB)">Medical Doctor (MBChB)</option>
                  <option value="Clinical Officer (BSc)">Clinical Officer (BSc)</option>
                  <option value="Registered Nurse (BScN)">Registered Nurse (BScN)</option>
                  <option value="Pharmacist / Specialist">Pharmacist / Specialist</option>
                  <option value="Medical Student">Medical Student</option>
                </select>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              {lang === 'fr' ? 'Mot de passe' : 'Password'}
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all"
            >
              {loading ? (
                <span>{lang === 'fr' ? 'Connexion en cours...' : 'Processing...'}</span>
              ) : mode === 'login' ? (
                <>
                  <span>{lang === 'fr' ? 'Se Connecter' : 'Sign In'}</span>
                  <CheckCircle2 className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>{lang === 'fr' ? 'Créer mon Compte' : 'Create Account & Start'}</span>
                  <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          <p className="text-[11px] text-center text-slate-500 pt-2">
            {lang === 'fr'
              ? 'En continuant, vous accédez à la plateforme CME accréditée.'
              : 'Secure authentication for accredited healthcare professionals.'}
          </p>
        </form>
      </div>
    </div>
  );
};
