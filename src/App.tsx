/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Sparkles,
  Lock,
  Download,
  ShieldCheck,
  Stethoscope,
  Info,
  GraduationCap,
  ShieldAlert,
} from 'lucide-react';
import {
  Presentation,
  Language,
  UserProgress,
  MPesaPayment,
  UserProfile,
  MedicalSpecialty,
  QuizAttempt,
} from './types';
import { SyncQueueItem } from './types';
import { getTranslation, specialtyTranslations } from './translations';
import {
  initialPresentations,
  initialUserProfile,
  initialUserProgressList,
  initialMPesaTransactions,
} from './data/mockData';
import { Header } from './components/Header';
import { PresentationCard } from './components/PresentationCard';
import { SlideViewer } from './components/SlideViewer';
import { QuizModal } from './components/QuizModal';
import { CertificateModal } from './components/CertificateModal';
import { MPesaModal } from './components/MPesaModal';
import { OfflineDownloadModal } from './components/OfflineDownloadModal';
import { SettingsModal } from './components/SettingsModal';
import { AdminAnalytics } from './components/AdminAnalytics';
import { AdminLoginModal } from './components/AdminLoginModal';
import { OfflineSyncBanner } from './components/OfflineSyncBanner';
import { RecommendationsSection } from './components/RecommendationsSection';
import { GamificationDashboard } from './components/GamificationDashboard';
import {
  getOfflineSyncQueue,
  enqueueOfflineProgress,
  executeSynchronization,
  savePresentationOffline,
} from './utils/offlineSync';
import { generateRecommendations } from './utils/recommendationEngine';
import {
  calculateUserPoints,
  evaluateBadges,
  buildLeaderboard,
  getClinicianTier,
} from './utils/gamification';

export default function App() {
  // Persistence state
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('cme_app_lang');
    return (saved as Language) || 'en';
  });

  const [role, setRole] = useState<'learner' | 'admin'>('learner');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('cme_admin_authenticated') === 'true';
  });
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState<boolean>(false);

  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('cme_user_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.fullName === 'Dr. Tumutumu Clinic Manager' || !parsed.fullName) {
          parsed.fullName = 'Dr. Bonny';
          localStorage.setItem('cme_user_profile', JSON.stringify(parsed));
        }
        return parsed;
      } catch {
        // fallback
      }
    }
    return initialUserProfile;
  });

  const handleAdminLoginSuccess = () => {
    setIsAdminAuthenticated(true);
    setIsAdminLoginOpen(false);
    setRole('admin');
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('cme_admin_authenticated');
    setIsAdminAuthenticated(false);
    setRole('learner');
  };

  const [presentations, setPresentations] = useState<Presentation[]>(() => {
    const saved = localStorage.getItem('cme_presentations');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return initialPresentations;
  });

  const [userProgressList, setUserProgressList] = useState<UserProgress[]>(() => {
    const saved = localStorage.getItem('cme_user_progress');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return initialUserProgressList;
  });

  const [mpesaTransactions, setMpesaTransactions] = useState<MPesaPayment[]>(() => {
    const saved = localStorage.getItem('cme_mpesa_transactions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return initialMPesaTransactions;
  });

  const [offlineCachedIds, setOfflineCachedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('cme_offline_cached_ids');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return ['cme-cardio-01'];
  });

  // Modals state
  const [activeSlidePresentation, setActiveSlidePresentation] = useState<Presentation | null>(null);
  const [activeQuizPresentation, setActiveQuizPresentation] = useState<Presentation | null>(null);
  const [activeCertificatePresentation, setActiveCertificatePresentation] = useState<Presentation | null>(null);
  const [activeMPesaPresentation, setActiveMPesaPresentation] = useState<Presentation | null>(null);
  const [activeOfflinePresentation, setActiveOfflinePresentation] = useState<Presentation | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('All');

  // Offline Synchronization state
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(false);
  const [pendingSyncQueue, setPendingSyncQueue] = useState<SyncQueueItem[]>(() =>
    getOfflineSyncQueue()
  );
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncToastMessage, setSyncToastMessage] = useState<string | null>(null);
  const [lastSyncedTimestamp, setLastSyncedTimestamp] = useState<string | null>(null);

  const effectiveOnline = isOnline && !isSimulatedOffline;

  const t = getTranslation(lang);

  // Set document title
  useEffect(() => {
    document.title = 'CME Kenya';
  }, []);

  // Network online / offline listeners
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('cme_app_lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('cme_user_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('cme_presentations', JSON.stringify(presentations));
  }, [presentations]);

  useEffect(() => {
    localStorage.setItem('cme_user_progress', JSON.stringify(userProgressList));
  }, [userProgressList]);

  useEffect(() => {
    localStorage.setItem('cme_mpesa_transactions', JSON.stringify(mpesaTransactions));
  }, [mpesaTransactions]);

  useEffect(() => {
    localStorage.setItem('cme_offline_cached_ids', JSON.stringify(offlineCachedIds));
  }, [offlineCachedIds]);

  // Trigger synchronization from offline queue to server
  const handleTriggerSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      const result = executeSynchronization(userProgressList, presentations);
      if (result.syncedCount > 0) {
        setUserProgressList(result.updatedProgressList);
        setPendingSyncQueue([]);
        const nowFormatted = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setLastSyncedTimestamp(nowFormatted);
        setSyncToastMessage(
          lang === 'fr'
            ? `Synchronisation terminée ! ${result.syncedCount} module(s) et réponses de quiz transmis à l’analytique administrateur.`
            : `Synchronization completed! ${result.syncedCount} module(s) & quiz responses uploaded to administrator analytics.`
        );
        setTimeout(() => setSyncToastMessage(null), 6000);
      }
      setIsSyncing(false);
    }, 600);
  };

  // Auto-sync when effectiveOnline becomes true and there are pending items
  useEffect(() => {
    if (effectiveOnline) {
      const queue = getOfflineSyncQueue();
      if (queue.length > 0) {
        handleTriggerSync();
      }
    }
  }, [effectiveOnline]);

  // Check whether presentation is unlocked (First 3 are free or in unlockedPresentationIds)
  const isPresentationUnlocked = (presentation: Presentation, index: number) => {
    if (presentation.isFree || index < 3) return true;
    return profile.unlockedPresentationIds.includes(presentation.id);
  };

  // Handlers for slide completion
  const handleCompleteSlide = (presentationId: string, slideNumber: number) => {
    const targetPres = presentations.find((p) => p.id === presentationId);
    const totalSlides = targetPres?.slides.length || 3;
    const existing = userProgressList.find((p) => p.presentationId === presentationId);
    const completed = Array.from(
      new Set([...(existing?.completedSlides || []), slideNumber])
    );
    const isFinished = completed.length >= totalSlides;

    if (!effectiveOnline) {
      enqueueOfflineProgress(
        presentationId,
        targetPres?.title || presentationId,
        completed,
        isFinished,
        existing?.quizAttempt
      );
      setPendingSyncQueue(getOfflineSyncQueue());
    }

    setUserProgressList((prev) => {
      if (existing) {
        return prev.map((item) =>
          item.presentationId === presentationId
            ? {
                ...item,
                completedSlides: completed,
                isSlideDeckCompleted: isFinished,
                lastViewedDate: new Date().toISOString().split('T')[0],
                isOfflinePendingSync: !effectiveOnline,
              }
            : item
        );
      } else {
        return [
          ...prev,
          {
            presentationId,
            completedSlides: completed,
            isSlideDeckCompleted: isFinished,
            certificateIssued: false,
            lastViewedDate: new Date().toISOString().split('T')[0],
            isOfflinePendingSync: !effectiveOnline,
          },
        ];
      }
    });
  };

  // Quiz submission handler
  const handleSaveQuizResult = (attempt: QuizAttempt) => {
    const targetPres = presentations.find((p) => p.id === attempt.presentationId);
    const existing = userProgressList.find((p) => p.presentationId === attempt.presentationId);

    if (!effectiveOnline) {
      enqueueOfflineProgress(
        attempt.presentationId,
        targetPres?.title || attempt.presentationId,
        existing?.completedSlides || [1, 2, 3],
        true,
        attempt
      );
      setPendingSyncQueue(getOfflineSyncQueue());
    }

    const certId =
      existing?.certificateId ||
      `CME-KE-${new Date().getFullYear()}-${attempt.presentationId.slice(-4).toUpperCase()}-${Math.floor(
        1000 + Math.random() * 9000
      )}`;

    setUserProgressList((prev) => {
      if (existing) {
        return prev.map((item) =>
          item.presentationId === attempt.presentationId
            ? {
                ...item,
                quizAttempt: attempt,
                certificateIssued: attempt.passed ? true : item.certificateIssued,
                certificateId: attempt.passed ? certId : item.certificateId,
                issuedDate: attempt.passed ? attempt.attemptDate : item.issuedDate,
                isOfflinePendingSync: !effectiveOnline,
              }
            : item
        );
      } else {
        return [
          ...prev,
          {
            presentationId: attempt.presentationId,
            completedSlides: [1, 2, 3],
            isSlideDeckCompleted: true,
            quizAttempt: attempt,
            certificateIssued: attempt.passed,
            certificateId: attempt.passed ? certId : undefined,
            issuedDate: attempt.passed ? attempt.attemptDate : undefined,
            lastViewedDate: attempt.attemptDate,
            isOfflinePendingSync: !effectiveOnline,
          },
        ];
      }
    });
  };

  // Areas of Interest updater
  const handleUpdateAreasOfInterest = (interests: MedicalSpecialty[]) => {
    setProfile((prev) => ({
      ...prev,
      areasOfInterest: interests,
    }));
  };

  // M-Pesa payment success handler
  const handlePaymentSuccess = (payment: MPesaPayment) => {
    setMpesaTransactions((prev) => [payment, ...prev]);
    setProfile((prev) => ({
      ...prev,
      unlockedPresentationIds: Array.from(
        new Set([...prev.unlockedPresentationIds, payment.presentationId])
      ),
    }));
  };

  // Offline cache marker
  const handleMarkOfflineCached = (id: string) => {
    setOfflineCachedIds((prev) => Array.from(new Set([...prev, id])));
  };

  // Clear offline cache
  const handleClearOfflineCache = () => {
    setOfflineCachedIds([]);
  };

  // Add new presentation from Admin form
  const handleAddNewPresentation = (newPres: Presentation) => {
    setPresentations((prev) => [newPres, ...prev]);
  };

  // Filtered presentations
  const filteredPresentations = useMemo(() => {
    return presentations.filter((pres) => {
      const matchesSpecialty =
        selectedSpecialty === 'All' || pres.specialty === selectedSpecialty;

      const titleMatch =
        pres.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (pres.titleFr && pres.titleFr.toLowerCase().includes(searchQuery.toLowerCase()));

      const summaryMatch =
        pres.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (pres.summaryFr && pres.summaryFr.toLowerCase().includes(searchQuery.toLowerCase()));

      const facultyMatch = pres.facultyAuthor.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSpecialty && (titleMatch || summaryMatch || facultyMatch);
    });
  }, [presentations, selectedSpecialty, searchQuery]);

  // Overall CME Credit Hours Earned by Current Clinician
  const userEarnedCredits = useMemo(() => {
    return userProgressList.reduce((acc, curr) => {
      if (curr.quizAttempt?.passed) {
        const pres = presentations.find((p) => p.id === curr.presentationId);
        return acc + (pres?.cmeCredits || 0);
      }
      return acc;
    }, 0);
  }, [userProgressList, presentations]);

  const earnedCertificatesCount = userProgressList.filter((p) => p.certificateIssued).length;

  // Gamification: points, tier, badges, leaderboard
  const userCmePoints = useMemo(() => {
    return calculateUserPoints(userProgressList, presentations) + (profile.cmePoints || 0);
  }, [userProgressList, presentations, profile.cmePoints]);

  const clinicianTier = useMemo(() => {
    return getClinicianTier(userCmePoints);
  }, [userCmePoints]);

  const clinicianBadges = useMemo(() => {
    return evaluateBadges(userProgressList, presentations, profile);
  }, [userProgressList, presentations, profile]);

  const { leaderboard, userRank } = useMemo(() => {
    const unlockedCount = clinicianBadges.filter((b) => b.isUnlocked).length;
    return buildLeaderboard(profile, userCmePoints, userEarnedCredits, unlockedCount);
  }, [profile, userCmePoints, userEarnedCredits, clinicianBadges]);

  // Content Recommendations
  const recommendations = useMemo(() => {
    return generateRecommendations(presentations, userProgressList, profile, lang);
  }, [presentations, userProgressList, profile, lang]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Header */}
      <Header
        lang={lang}
        onLanguageToggle={() => setLang((prev) => (prev === 'en' ? 'fr' : 'en'))}
        role={role}
        isAdminAuthenticated={isAdminAuthenticated}
        onRoleToggle={() => {
          if (role === 'admin') {
            setRole('learner');
          } else {
            if (isAdminAuthenticated) {
              setRole('admin');
            } else {
              setIsAdminLoginOpen(true);
            }
          }
        }}
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
        onAdminLogout={handleAdminLogout}
        onOpenSettings={() => setIsSettingsOpen(true)}
        profile={profile}
        freeCountAvailable={3}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {role === 'admin' ? (
          /* ADMIN PORTAL */
          !isAdminAuthenticated ? (
            /* Admin Login Gate */
            <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-8 sm:p-12 text-center max-w-xl mx-auto my-12 space-y-6 animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100/80 px-3 py-1 rounded-full border border-amber-200">
                  {lang === 'fr' ? 'Accès Restreint' : 'Restricted Access'}
                </span>
                <h2 className="text-2xl font-black text-slate-900">
                  {lang === 'fr' ? 'Portail Administrateur & Régulateur' : 'Administrator & Faculty Portal'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                  {lang === 'fr'
                    ? 'Cette section est réservée aux coordinateurs de formation continue et directeurs médicaux agréés.'
                    : 'This portal requires verified administrative credentials to monitor institution-wide completions, review CME points, and manage learning modules.'}
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsAdminLoginOpen(true)}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>{lang === 'fr' ? 'Se Connecter en Tant qu’Admin' : 'Sign In to Admin Portal'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('learner')}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
                >
                  {lang === 'fr' ? 'Retour aux Formations' : 'Return to Practitioner View'}
                </button>
              </div>
            </div>
          ) : (
            <AdminAnalytics
              presentations={presentations}
              userProgressList={userProgressList}
              mpesaTransactions={mpesaTransactions}
              lang={lang}
              onAddNewPresentation={handleAddNewPresentation}
              onViewPresentation={(pres) => setActiveSlidePresentation(pres)}
              onLogout={handleAdminLogout}
              onViewCertificateForUser={(presentationId) => {
                const pres = presentations.find((p) => p.id === presentationId);
                if (pres) setActiveCertificatePresentation(pres);
              }}
            />
          )
        ) : (
          /* CLINICIAN / LEARNER PORTAL */
          <div className="space-y-6">
            {/* Offline Sync Banner */}
            <OfflineSyncBanner
              isOnline={isOnline}
              isSimulatedOffline={isSimulatedOffline}
              onToggleSimulatedOffline={() => setIsSimulatedOffline(!isSimulatedOffline)}
              pendingQueue={pendingSyncQueue}
              onTriggerSync={handleTriggerSync}
              isSyncing={isSyncing}
              lastSyncedTimestamp={lastSyncedTimestamp}
              lang={lang}
            />

            {/* Offline Sync Success Toast */}
            {syncToastMessage && (
              <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl p-4 shadow-xs flex items-center justify-between gap-3 text-xs sm:text-sm animate-fade-in">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="font-semibold">{syncToastMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSyncToastMessage(null)}
                  className="text-emerald-700 hover:text-emerald-900 font-bold px-2 py-1 rounded-lg"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Clinician Overview Banner */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                    {profile.hospitalAffiliation}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Lic. {profile.medicalLicenseNumber}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    Tier: {clinicianTier.title}
                  </span>
                </div>
                <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
                  {lang === 'fr'
                    ? `Bienvenue, ${profile.name}`
                    : `Welcome, ${profile.name}`}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {lang === 'fr'
                    ? 'Modules interactifs de formation médicale continue avec diapositives cliniques, vidéos de gestes et évaluations interactives après chaque module.'
                    : 'Interactive medical PowerPoint resources with embedded surgical & ultrasound videos, high-resolution imaging inspection, and accredited post-module quizzes.'}
                </p>
              </div>

              {/* Badges / Credits / Points tally */}
              <div className="flex items-center gap-3 sm:gap-4 shrink-0 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="text-center px-2">
                  <span className="text-xl sm:text-2xl font-black text-blue-600 font-mono block">
                    {userEarnedCredits.toFixed(1)}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    {t.creditsLabel}
                  </span>
                </div>
                <div className="h-8 w-[1px] bg-slate-200" />
                <div className="text-center px-2">
                  <span className="text-xl sm:text-2xl font-black text-amber-600 font-mono block">
                    {userCmePoints}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    {lang === 'fr' ? 'Points FMC' : 'CME Points'}
                  </span>
                </div>
                <div className="h-8 w-[1px] bg-slate-200" />
                <div className="text-center px-2">
                  <span className="text-xl sm:text-2xl font-black text-emerald-600 font-mono block">
                    {earnedCertificatesCount}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    {lang === 'fr' ? 'Attestations' : 'Certificates'}
                  </span>
                </div>
              </div>
            </div>

            {/* Content Recommendation Engine */}
            <RecommendationsSection
              recommendations={recommendations}
              profile={profile}
              lang={lang}
              onSelectPresentation={(pres) => setActiveSlidePresentation(pres)}
              onOpenQuiz={(pres) => setActiveQuizPresentation(pres)}
              onUpdateInterests={handleUpdateAreasOfInterest}
            />

            {/* Gamification Dashboard: Points, Badges, and Leaderboard */}
            <GamificationDashboard
              points={userCmePoints}
              tier={clinicianTier}
              badges={clinicianBadges}
              leaderboard={leaderboard}
              userRank={userRank}
              profile={profile}
              lang={lang}
            />

            {/* Freemium Notice Banner */}
            <div className="bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-700 text-white rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center shrink-0 shadow-inner">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-white block text-sm sm:text-base">
                    {lang === 'fr'
                      ? 'Accès Libre : Les 3 premières présentations sont gratuites'
                      : 'Freemium Access: First 3 presentations are 100% free'}
                  </span>
                  <p className="text-blue-100 text-xs">
                    {lang === 'fr'
                      ? 'Les modules suivants sont déblocables instantanément par paiement mobile M-Pesa sécurisé.'
                      : 'Subsequent specialist modules can be unlocked seamlessly with Safaricom M-Pesa STK Push.'}
                  </p>
                </div>
              </div>
              <span className="font-mono text-white font-bold bg-white/20 px-3.5 py-1.5 rounded-full border border-white/30 text-xs shrink-0 shadow-sm">
                3 / 3 Free Modules
              </span>
            </div>

            {/* Search and Specialty Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
              {/* Search input */}
              <div className="relative flex-1 min-w-0">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="w-full pl-10 pr-4 py-2 rounded-full bg-slate-100 border border-transparent text-slate-800 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>

              {/* Specialty dropdown */}
              <div className="flex items-center gap-2 shrink-0">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="px-4 py-2 rounded-full bg-slate-100 border border-transparent text-slate-700 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-medium cursor-pointer"
                >
                  <option value="All">{t.allSpecialties}</option>
                  {Object.keys(specialtyTranslations).map((spec) => (
                    <option key={spec} value={spec}>
                      {specialtyTranslations[spec as MedicalSpecialty][lang]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Catalog Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {t.navCatalog} ({filteredPresentations.length})
                </h3>
              </div>

              {filteredPresentations.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-xs">
                  <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
                  <h4 className="text-base font-semibold text-slate-800">
                    {lang === 'fr' ? 'Aucun module trouvé' : 'No presentations matched your search'}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {lang === 'fr'
                      ? 'Essayez de modifier vos filtres ou termes de recherche.'
                      : 'Try adjusting your search terms or specialty filters.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedSpecialty('All');
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-blue-600 text-xs font-semibold"
                  >
                    {lang === 'fr' ? 'Réinitialiser les filtres' : 'Reset filters'}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPresentations.map((pres, index) => {
                    const originalIndex = presentations.findIndex((p) => p.id === pres.id);
                    const unlocked = isPresentationUnlocked(pres, originalIndex);
                    const progress = userProgressList.find((p) => p.presentationId === pres.id);
                    const isCached = offlineCachedIds.includes(pres.id);

                    return (
                      <PresentationCard
                        key={pres.id}
                        presentation={pres}
                        lang={lang}
                        progress={progress}
                        isUnlocked={unlocked}
                        onOpenPresentation={() => setActiveSlidePresentation(pres)}
                        onOpenQuiz={() => setActiveQuizPresentation(pres)}
                        onOpenCertificate={() => setActiveCertificatePresentation(pres)}
                        onOpenMPesa={() => setActiveMPesaPresentation(pres)}
                        onOpenOfflineDownload={() => setActiveOfflinePresentation(pres)}
                        isOfflineCached={isCached}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-slate-800">
              Continuous Medical Education Platform
            </span>
            <span className="text-slate-300">•</span>
            <span>Accredited CPD / FMC Provider</span>
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            <span>Dr. Bonny</span>
            <span>•</span>
            <span>Safaricom M-Pesa Daraja 2.0</span>
            <span>•</span>
            <button
              type="button"
              onClick={() => setLang((prev) => (prev === 'en' ? 'fr' : 'en'))}
              className="text-blue-600 hover:underline font-medium"
            >
              {lang === 'en' ? 'Passer en Français' : 'Switch to English'}
            </button>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      {/* 0. Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        lang={lang}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />

      {/* 1. Slide Viewer Modal */}
      {activeSlidePresentation && (
        <SlideViewer
          presentation={activeSlidePresentation}
          lang={lang}
          onClose={() => setActiveSlidePresentation(null)}
          onCompleteSlide={(slideNum) =>
            handleCompleteSlide(activeSlidePresentation.id, slideNum)
          }
          onOpenQuiz={() => {
            const pres = activeSlidePresentation;
            setActiveSlidePresentation(null);
            setActiveQuizPresentation(pres);
          }}
          onOpenOfflineDownload={() => {
            const pres = activeSlidePresentation;
            setActiveOfflinePresentation(pres);
          }}
          completedSlides={
            userProgressList.find((p) => p.presentationId === activeSlidePresentation.id)
              ?.completedSlides || []
          }
          quizPassed={
            userProgressList.find((p) => p.presentationId === activeSlidePresentation.id)
              ?.quizAttempt?.passed
          }
        />
      )}

      {/* 2. Quiz Modal */}
      {activeQuizPresentation && (
        <QuizModal
          presentation={activeQuizPresentation}
          lang={lang}
          onClose={() => setActiveQuizPresentation(null)}
          onSaveQuizResult={handleSaveQuizResult}
          onViewCertificate={() => {
            const pres = activeQuizPresentation;
            setActiveQuizPresentation(null);
            setActiveCertificatePresentation(pres);
          }}
          existingAttempt={
            userProgressList.find((p) => p.presentationId === activeQuizPresentation.id)
              ?.quizAttempt
          }
        />
      )}

      {/* 3. Certificate Modal */}
      {activeCertificatePresentation && (
        <CertificateModal
          presentation={activeCertificatePresentation}
          profile={profile}
          lang={lang}
          certificateId={
            userProgressList.find(
              (p) => p.presentationId === activeCertificatePresentation.id
            )?.certificateId ||
            `CME-KE-${new Date().getFullYear()}-${activeCertificatePresentation.id
              .slice(-4)
              .toUpperCase()}-0914`
          }
          issuedDate={
            userProgressList.find(
              (p) => p.presentationId === activeCertificatePresentation.id
            )?.issuedDate || new Date().toISOString().split('T')[0]
          }
          onClose={() => setActiveCertificatePresentation(null)}
        />
      )}

      {/* 4. M-Pesa Modal */}
      {activeMPesaPresentation && (
        <MPesaModal
          presentation={activeMPesaPresentation}
          lang={lang}
          onClose={() => setActiveMPesaPresentation(null)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* 5. Offline Download Modal */}
      {activeOfflinePresentation && (
        <OfflineDownloadModal
          presentation={activeOfflinePresentation}
          lang={lang}
          onClose={() => setActiveOfflinePresentation(null)}
          onMarkOfflineCached={handleMarkOfflineCached}
        />
      )}

      {/* 6. Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          currentLang={lang}
          onLanguageChange={(newLang) => setLang(newLang)}
          profile={profile}
          onUpdateProfile={(updated) => setProfile(updated)}
          offlineCount={offlineCachedIds.length}
          onClearOfflineCache={handleClearOfflineCache}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </div>
  );
}
