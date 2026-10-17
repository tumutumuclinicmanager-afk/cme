import React, { useState } from 'react';
import {
  Stethoscope,
  BookOpen,
  Award,
  ShieldCheck,
  Smartphone,
  Sparkles,
  ChevronRight,
  Globe,
  Menu,
  X,
  Play,
  CheckCircle,
  Zap,
} from 'lucide-react';
import { Language } from '../types';

interface LandingPageProps {
  lang: Language;
  onLanguageToggle: () => void;
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onContinueAsGuest: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  lang,
  onLanguageToggle,
  onOpenAuth,
  onContinueAsGuest,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-600 selection:text-white flex flex-col">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
              <Stethoscope className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900">
                  {lang === 'fr' ? 'Plateforme FMC Médicale' : 'Clinical CME & Slides'}
                </span>
                <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                  CPD Accredited
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden md:block">
                {lang === 'fr' ? 'Formation Médicale Continue et Présentations' : 'Interactive PowerPoint Decks & Continuing Education'}
              </p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#features" className="hover:text-blue-600 transition-colors">
              {lang === 'fr' ? 'Fonctionnalités' : 'Features'}
            </a>
            <a href="#presentations" className="hover:text-blue-600 transition-colors">
              {lang === 'fr' ? 'Présentations' : 'Presentations'}
            </a>
            <a href="#accreditation" className="hover:text-blue-600 transition-colors">
              {lang === 'fr' ? 'Accréditation CPD' : 'CPD & Certificates'}
            </a>
            <a href="#mobile" className="hover:text-blue-600 transition-colors">
              {lang === 'fr' ? 'Mobile & Offline' : 'Mobile Ready'}
            </a>
          </nav>

          {/* Right Side: Language & Small Login/Sign Up buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Switcher */}
            <button
              type="button"
              onClick={onLanguageToggle}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 transition-colors"
            >
              <Globe className="w-4 h-4 text-blue-600" />
              <span className="font-mono">{lang.toUpperCase()}</span>
            </button>

            {/* Small Login Button */}
            <button
              type="button"
              onClick={() => onOpenAuth('login')}
              className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors"
            >
              {lang === 'fr' ? 'Connexion' : 'Login'}
            </button>

            {/* Small Sign Up Button */}
            <button
              type="button"
              onClick={() => onOpenAuth('signup')}
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20 transition-all hover:scale-105 active:scale-95"
            >
              {lang === 'fr' ? "S'inscrire" : 'Sign Up'}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-3 shadow-lg">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-slate-700 hover:text-blue-600"
            >
              {lang === 'fr' ? 'Fonctionnalités' : 'Features'}
            </a>
            <a
              href="#presentations"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-slate-700 hover:text-blue-600"
            >
              {lang === 'fr' ? 'Présentations' : 'Presentations'}
            </a>
            <a
              href="#accreditation"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-slate-700 hover:text-blue-600"
            >
              {lang === 'fr' ? 'Accréditation CPD' : 'CPD & Certificates'}
            </a>
            <div className="pt-2 border-t border-slate-100 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth('login');
                }}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 text-center"
              >
                {lang === 'fr' ? 'Connexion' : 'Login'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth('signup');
                }}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 text-xs font-bold text-white text-center shadow-sm"
              >
                {lang === 'fr' ? "S'inscrire" : 'Sign Up'}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32 bg-gradient-to-b from-white via-blue-50/40 to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Hero Text */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 text-blue-800 text-xs font-bold border border-blue-200">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>
                  {lang === 'fr' ? 'Plateforme Officielle pour Praticiens' : 'Premier Clinical CME & PowerPoint Deck Platform'}
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
                {lang === 'fr' ? (
                  <>Formation Médicale Continue <span className="text-blue-600">PowerPoint & Slides</span></>
                ) : (
                  <>Master Clinical Presentations & <span className="text-blue-600">Earn CPD Credits</span></>
                )}
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                {lang === 'fr'
                  ? 'Accédez à des présentations médicales interactives style PowerPoint, passez des évaluations cliniques, téléchargez vos certificats CPD accrédités et réglez via M-Pesa.'
                  : 'Access peer-reviewed interactive slide decks, clinical case studies, surgical guides, and accredited CPD certificates designed for doctors, clinical officers, and nurses.'}
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <button
                  type="button"
                  onClick={() => onOpenAuth('signup')}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
                >
                  <span>{lang === 'fr' ? 'Commencer Gratuitement' : 'Get Started Free'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={onContinueAsGuest}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 font-semibold text-sm border border-slate-300 shadow-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Play className="w-4 h-4 text-blue-600 fill-blue-600" />
                  <span>{lang === 'fr' ? 'Explorer la Galerie' : 'Explore Catalog'}</span>
                </button>
              </div>

              {/* Trust badges */}
              <div className="pt-6 border-t border-slate-200/80 grid grid-cols-3 gap-4 text-center lg:text-left">
                <div>
                  <div className="text-lg sm:text-2xl font-extrabold text-slate-900">50+</div>
                  <div className="text-xs text-slate-500">{lang === 'fr' ? 'Modules PowerPoint' : 'Slide Decks'}</div>
                </div>
                <div>
                  <div className="text-lg sm:text-2xl font-extrabold text-slate-900">10 CPD</div>
                  <div className="text-xs text-slate-500">{lang === 'fr' ? 'Unités par Cours' : 'Credits / Course'}</div>
                </div>
                <div>
                  <div className="text-lg sm:text-2xl font-extrabold text-slate-900">100%</div>
                  <div className="text-xs text-slate-500">{lang === 'fr' ? 'Mobile & Offline' : 'Mobile Optimized'}</div>
                </div>
              </div>
            </div>

            {/* Hero Visual Card / Mockup */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 relative overflow-hidden group">
                <div className="absolute -right-12 -top-12 w-48 h-48 bg-blue-100 rounded-full blur-3xl opacity-60 group-hover:opacity-90 transition-opacity"></div>
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                      <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                      PowerPoint Slide 01 / 18
                    </span>
                  </div>

                  <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-inner space-y-3">
                    <div className="flex items-center justify-between text-xs text-blue-400 font-mono">
                      <span>INTERNAL MEDICINE</span>
                      <span>CPD: 10 PTS</span>
                    </div>
                    <h3 className="text-base font-bold text-white leading-snug">
                      Advanced Management of Acute Hypertensive Emergency
                    </h3>
                    <p className="text-xs text-slate-300 line-clamp-2">
                      Comprehensive slide deck covering IV vasodilator protocols, cerebral autoregulation, and ICU monitoring guidelines.
                    </p>
                  </div>

                  <div className="space-y-2.5 text-xs text-slate-600 font-medium">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{lang === 'fr' ? 'Visualiseur de diapositives style PPT' : 'PowerPoint-style immersive slideshow'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{lang === 'fr' ? 'Paiement instantané M-Pesa Daraja 2.0' : 'Instant M-Pesa mobile money checkout'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{lang === 'fr' ? 'Certificats PDF accrédités vérifiables' : 'Verifiable PDF certificates & badges'}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpenAuth('signup')}
                    className="w-full py-3 rounded-xl bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <span>{lang === 'fr' ? 'Accéder aux Présentations' : 'Access Slide Decks Now'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest">
              {lang === 'fr' ? 'Pourquoi Choisir Notre Plateforme' : 'Designed for Clinical Excellence'}
            </h2>
            <h3 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {lang === 'fr'
                ? 'Tout ce dont un praticien a besoin pour sa formation continue'
                : 'Everything clinicians need to learn, evaluate, and earn CPD'}
            </h3>
            <p className="text-sm sm:text-base text-slate-600">
              {lang === 'fr'
                ? 'Une expérience fluide optimisée pour mobile et ordinateur, conçue spécifiquement pour le corps médical.'
                : 'Built with speed, offline resilience, and mobile optimization for busy physicians and nurses.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 hover:border-blue-300 transition-all hover:shadow-lg space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md">
                <BookOpen className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">
                {lang === 'fr' ? 'Présentations Style PowerPoint' : 'PowerPoint Slide Viewer'}
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {lang === 'fr'
                  ? 'Visualisez les diapositives plein écran avec notes de l’intervenant, mode diaporama et recherche de mots-clés.'
                  : 'Immersive full-screen slideshow mode with speaker notes, slide navigation, and instant search.'}
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 hover:border-blue-300 transition-all hover:shadow-lg space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md">
                <Zap className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">
                {lang === 'fr' ? 'Paiement M-Pesa Intégré' : 'M-Pesa Daraja 2.0 Checkout'}
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {lang === 'fr'
                  ? 'Réglez vos modules premium instantanément via STK Push M-Pesa avec validation automatique en temps réel.'
                  : 'Seamless mobile money checkout with automated STK push verification for instant course unlocking.'}
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 hover:border-blue-300 transition-all hover:shadow-lg space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-600 flex items-center justify-center text-white shadow-md">
                <Award className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">
                {lang === 'fr' ? 'Certificats CPD & Quiz' : 'CPD Certificates & Quizzes'}
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {lang === 'fr'
                  ? 'Passez les évaluations cliniques à choix multiples et téléchargez instantanément vos certificats CPD signés.'
                  : 'Test clinical knowledge with interactive quizzes and instantly download verifiable CPD completion certificates.'}
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 hover:border-blue-300 transition-all hover:shadow-lg space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-600 flex items-center justify-center text-white shadow-md">
                <Smartphone className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">
                {lang === 'fr' ? 'Optimisé Mobile & Offline' : 'Mobile & Offline Ready'}
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {lang === 'fr'
                  ? 'Téléchargez vos présentations pour une consultation hors-ligne complète sur smartphone et tablette.'
                  : 'Fully responsive design optimized for mobile devices with offline PWA caching for hospital wards.'}
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 hover:border-blue-300 transition-all hover:shadow-lg space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-600 flex items-center justify-center text-white shadow-md">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">
                {lang === 'fr' ? 'Atlas Clinique & Imagerie' : 'Clinical Image Atlas'}
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {lang === 'fr'
                  ? 'Explorez une galerie interactive d’images médicales haute résolution, ECG, radiographies et cas chirurgicaux.'
                  : 'High-resolution medical image viewer with zoom, clinical annotations, and case study breakdowns.'}
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 hover:border-blue-300 transition-all hover:shadow-lg space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">
                {lang === 'fr' ? 'Gamification & Badges' : 'Gamification & Tiers'}
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {lang === 'fr'
                  ? 'Gagnez des points d’excellence clinique, débloquez des badges de spécialité et suivez votre classement.'
                  : 'Earn CME points, unlock clinician achievement badges, and climb the professional leaderboard.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-400 py-12 text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white text-sm">Clinical CME Platform</span>
              <p className="text-[11px] text-slate-400">Accredited Continuing Professional Development</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-slate-400 font-medium">
            <button type="button" onClick={() => onOpenAuth('login')} className="hover:text-white transition-colors">
              {lang === 'fr' ? 'Connexion' : 'Login'}
            </button>
            <button type="button" onClick={() => onOpenAuth('signup')} className="hover:text-white transition-colors">
              {lang === 'fr' ? "S'inscrire" : 'Sign Up'}
            </button>
            <button type="button" onClick={onContinueAsGuest} className="hover:text-white transition-colors">
              {lang === 'fr' ? 'Catalogue' : 'Browse Catalog'}
            </button>
            <button
              type="button"
              onClick={onLanguageToggle}
              className="text-blue-400 hover:underline font-mono"
            >
              {lang === 'en' ? 'Français' : 'English'}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
