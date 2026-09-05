import React, { useState } from 'react';
import {
  Users,
  CheckCircle2,
  Award,
  TrendingUp,
  DollarSign,
  Plus,
  BookOpen,
  Eye,
  FileSpreadsheet,
  Search,
  Filter,
  Video,
  Image,
  Sparkles,
  HelpCircle,
  Clock,
  ShieldCheck,
  Wifi,
  WifiOff,
  HardDrive,
  Trophy,
  LogOut,
  FolderUp,
  Upload,
} from 'lucide-react';
import {
  Presentation,
  Language,
  UserProgress,
  MPesaPayment,
  MedicalSpecialty,
  PresentationSlide,
  QuizQuestion,
} from '../types';
import { getTranslation, specialtyTranslations } from '../translations';
import { PptUploadSection } from './PptUploadSection';

interface AdminAnalyticsProps {
  presentations: Presentation[];
  userProgressList: UserProgress[];
  mpesaTransactions: MPesaPayment[];
  lang: Language;
  onAddNewPresentation: (presentation: Presentation) => void;
  onViewPresentation: (presentation: Presentation) => void;
  onViewCertificateForUser: (presentationId: string) => void;
  onLogout?: () => void;
}

export const AdminAnalytics: React.FC<AdminAnalyticsProps> = ({
  presentations,
  userProgressList,
  mpesaTransactions,
  lang,
  onAddNewPresentation,
  onViewPresentation,
  onViewCertificateForUser,
  onLogout,
}) => {
  const t = getTranslation(lang);
  const [activeTab, setActiveTab] = useState<'analytics' | 'upload-ppt' | 'post-module'>('analytics');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('All');

  // Form state for creating a new presentation
  const [title, setTitle] = useState<string>('');
  const [specialty, setSpecialty] = useState<MedicalSpecialty>('Cardiology');
  const [facultyAuthor, setFacultyAuthor] = useState<string>('Dr. Bonny, MD, FCP');
  const [institution, setInstitution] = useState<string>('National Postgraduate Medical College');
  const [cmeCredits, setCmeCredits] = useState<number>(2.0);
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(45);
  const [summary, setSummary] = useState<string>('');
  const [objectivesText, setObjectivesText] = useState<string>(
    '1. Identify hallmark diagnostic features\n2. Administer evidence-based pharmacology\n3. Execute guideline-directed monitoring'
  );
  const [isFree, setIsFree] = useState<boolean>(false);
  const [priceKes, setPriceKes] = useState<number>(500);

  // Slides for new presentation
  const [slideTitle, setSlideTitle] = useState<string>('Clinical Case Vignette & Pathophysiology');
  const [slideBulletsText, setSlideBulletsText] = useState<string>(
    'Initial presentation with acute symptom onset\nDiagnostic criteria and differential diagnoses\nImmediate stabilization protocol'
  );
  const [slideNotes, setSlideNotes] = useState<string>(
    'Review the diagnostic thresholds and consider secondary clinical risk scores.'
  );
  const [slideTakeaway, setSlideTakeaway] = useState<string>(
    'Early identification reduces 30-day mortality.'
  );
  const [slideVideoUrl, setSlideVideoUrl] = useState<string>(
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
  );
  const [slideImageUrl, setSlideImageUrl] = useState<string>(
    'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80'
  );
  const [imageModality, setImageModality] = useState<
    'X-Ray' | 'CT Scan' | 'MRI' | 'Ultrasound' | 'Histology' | 'ECG' | 'Clinical Photo'
  >('CT Scan');

  // Quiz question for new presentation
  const [quizVignette, setQuizVignette] = useState<string>(
    'A 52-year-old patient presents with acute diagnostic signs. Which of the following is the guideline-recommended first-line pharmacotherapy?'
  );
  const [optionA, setOptionA] = useState<string>('First-line evidence-based pharmacotherapy');
  const [optionB, setOptionB] = useState<string>('Placebo observation');
  const [optionC, setOptionC] = useState<string>('Delayed surgery');
  const [optionD, setOptionD] = useState<string>('Broad-spectrum non-indicated therapy');
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState<number>(0);
  const [quizRationale, setQuizRationale] = useState<string>(
    'Current international guidelines strongly recommend prompt initiation of targeted first-line therapy to optimize clinical recovery.'
  );
  const [referenceGuideline, setReferenceGuideline] = useState<string>(
    'International Clinical Practice Guidelines 2026'
  );

  // Compute Analytics Metrics
  const totalCompletedModules = userProgressList.filter((p) => p.isSlideDeckCompleted).length;
  const passedQuizzes = userProgressList.filter((p) => p.quizAttempt?.passed);
  const totalCmeCredits = userProgressList.reduce((acc, curr) => {
    if (curr.quizAttempt?.passed) {
      const pres = presentations.find((p) => p.id === curr.presentationId);
      return acc + (pres?.cmeCredits || 0);
    }
    return acc;
  }, 0);

  const totalRevenue = mpesaTransactions
    .filter((tx) => tx.status === 'COMPLETED')
    .reduce((acc, tx) => acc + tx.amountKes, 0);

  const averageQuizScore =
    userProgressList.filter((p) => p.quizAttempt).length > 0
      ? Math.round(
          userProgressList
            .filter((p) => p.quizAttempt)
            .reduce((acc, p) => acc + (p.quizAttempt?.score || 0), 0) /
            userProgressList.filter((p) => p.quizAttempt).length
        )
      : 88;

  const handleCreatePresentation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    const newSlide: PresentationSlide = {
      id: `slide-${Date.now()}-1`,
      slideNumber: 1,
      title: slideTitle,
      contentBullets: slideBulletsText.split('\n').filter((b) => b.trim().length > 0),
      speakerNotes: slideNotes,
      clinicalTakeaway: slideTakeaway,
      videoUrl: slideVideoUrl || undefined,
      videoTitle: slideVideoUrl ? 'Clinical Demonstration' : undefined,
      imageUrl: slideImageUrl || undefined,
      imageDetails: slideImageUrl
        ? {
            url: slideImageUrl,
            caption: `${imageModality} Diagnostic Evaluation`,
            modality: imageModality,
            annotations: [
              {
                id: 'anno-1',
                xPercent: 50,
                yPercent: 50,
                label: 'Pathological Feature',
                description: 'Key diagnostic finding relevant to the module presentation.',
              },
            ],
          }
        : undefined,
    };

    const newQuiz: QuizQuestion = {
      id: `quiz-${Date.now()}-1`,
      vignette: quizVignette,
      options: [optionA, optionB, optionC, optionD],
      correctAnswerIndex: correctAnswerIndex,
      rationale: quizRationale,
      referenceGuideline: referenceGuideline,
    };

    const newPresentation: Presentation = {
      id: `cme-custom-${Date.now()}`,
      title: title,
      specialty: specialty,
      cmeCredits: Number(cmeCredits),
      estimatedMinutes: Number(estimatedMinutes),
      facultyAuthor: facultyAuthor,
      institution: institution,
      summary: summary || title,
      learningObjectives: objectivesText.split('\n').filter((o) => o.trim().length > 0),
      slides: [newSlide],
      quiz: [newQuiz],
      isFree: isFree,
      priceKes: isFree ? 0 : Number(priceKes),
      publishedDate: new Date().toISOString().split('T')[0],
      thumbnailUrl:
        slideImageUrl ||
        'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
      level: 'Advanced',
    };

    onAddNewPresentation(newPresentation);
    setActiveTab('analytics');
  };

  return (
    <div id="admin-analytics-view" className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
              Admin Portal
            </span>
            <span className="text-xs font-medium text-slate-600">Dr. Bonny</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
            {t.adminDashboardTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">{t.adminSubtitle}</p>
        </div>

        {/* Tab Toggle & Sign Out */}
        <div className="flex items-center flex-wrap gap-2">
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('analytics')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'analytics'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang === 'fr' ? 'Statistiques & Suivi' : 'Analytics & Tracking'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('upload-ppt')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'upload-ppt'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FolderUp className="w-3.5 h-3.5 text-orange-400" />
              <span>{lang === 'fr' ? 'Importer PPT / WPS' : 'Upload PowerPoint (MS & WPS)'}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('post-module')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'post-module'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.postPresentation}</span>
            </button>
          </div>

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-semibold transition-colors shrink-0"
              title="Sign out of admin portal"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{lang === 'fr' ? 'Déconnexion' : 'Sign Out Admin'}</span>
            </button>
          )}
        </div>
      </div>

      {activeTab === 'analytics' ? (
        <>
          {/* Key Metrics Row */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
            {/* Metric 1: Active Clinicians */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-medium">{t.totalLearners}</span>
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-xl sm:text-2xl font-bold text-slate-900 block">142</span>
              <span className="text-[11px] text-emerald-600 font-medium">
                +18 this month
              </span>
            </div>

            {/* Metric 2: Completed Modules */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-medium">{t.totalCompletions}</span>
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-xl sm:text-2xl font-bold text-slate-900 block">
                {totalCompletedModules + 87}
              </span>
              <span className="text-[11px] text-slate-500">92% completion rate</span>
            </div>

            {/* Metric 3: Total CME Credits Awarded */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-medium">{t.creditsAwarded}</span>
                <Award className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-xl sm:text-2xl font-bold text-blue-600 block">
                {(totalCmeCredits + 194.5).toFixed(1)} hrs
              </span>
              <span className="text-[11px] text-slate-500">Accredited Category 1</span>
            </div>

            {/* Metric 4: Average Quiz Score */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-medium">{t.averageScore}</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="text-xl sm:text-2xl font-bold text-emerald-600 block">
                {averageQuizScore}%
              </span>
              <span className="text-[11px] text-slate-500">Threshold: 70%</span>
            </div>

            {/* Metric 5: M-Pesa Revenue */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1 col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-medium">{t.totalRevenue}</span>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-600 block">
                KES {(totalRevenue + 45000).toLocaleString()}
              </span>
              <span className="text-[11px] text-slate-500">Safaricom Daraja STK</span>
            </div>
          </div>

          {/* Module Catalog Management */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  {t.presentationAnalytics} ({presentations.length})
                </h3>
                <p className="text-xs text-slate-500">
                  {lang === 'fr'
                    ? 'Modules actifs, médias embarqués et questions d’évaluation'
                    : 'Active presentations, embedded clinical videos, and image inspection status'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('upload-ppt')}
                  className="px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                >
                  <FolderUp className="w-4 h-4" />
                  <span>{lang === 'fr' ? 'Importer PPT / WPS' : 'Upload PowerPoint (MS & WPS)'}</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Module</th>
                    <th className="px-4 py-3 font-semibold">Specialty</th>
                    <th className="px-4 py-3 font-semibold">Credits</th>
                    <th className="px-4 py-3 font-semibold">Access Tier</th>
                    <th className="px-4 py-3 font-semibold">Slides / Media</th>
                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {presentations.map((pres) => {
                    const hasVideo = pres.slides.some((s) => s.videoUrl);
                    const hasImage = pres.slides.some((s) => s.imageDetails);
                    return (
                      <tr key={pres.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900 max-w-xs truncate">
                              {pres.title}
                            </span>
                            {pres.sourceFileType === 'ms-powerpoint' && (
                              <span className="px-1.5 py-0.5 rounded bg-orange-100 text-orange-800 text-[10px] font-bold shrink-0">
                                MS PPT
                              </span>
                            )}
                            {pres.sourceFileType === 'wps-presentation' && (
                              <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold shrink-0">
                                WPS PPT
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500">{pres.facultyAuthor}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-medium border border-blue-100">
                            {pres.specialty}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-blue-600">
                          {pres.cmeCredits} hrs
                        </td>
                        <td className="px-4 py-3">
                          {pres.isFree ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase">
                              Free (Tier 1-3)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold uppercase">
                              KES {pres.priceKes} (M-Pesa)
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 text-[11px] text-slate-500">
                            <span>{pres.slides.length} slides</span>
                            {hasVideo && <Video className="w-3.5 h-3.5 text-blue-600" title="Embedded video" />}
                            {hasImage && <Image className="w-3.5 h-3.5 text-blue-600" title="High-res imaging" />}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => onViewPresentation(pres)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium border border-slate-200 transition-colors inline-flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3 text-blue-600" />
                            <span>{lang === 'fr' ? 'Consulter' : 'Preview'}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Clinician Activity & Quiz Tracking Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                {t.clinicianProgress}
              </h3>
              <p className="text-xs text-slate-500">
                {lang === 'fr'
                  ? 'Historique individuel des tentatives de quiz et certificats émis'
                  : 'Individual clinician progress, quiz scores, and issued certificates'}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 font-semibold">{t.clinicianName}</th>
                    <th className="px-4 py-3 font-semibold">{t.moduleTitle}</th>
                    <th className="px-4 py-3 font-semibold">{t.status}</th>
                    <th className="px-4 py-3 font-semibold">{t.score}</th>
                    <th className="px-4 py-3 font-semibold">{t.date}</th>
                    <th className="px-4 py-3 font-semibold text-right">{t.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {userProgressList.map((progress, idx) => {
                    const pres = presentations.find((p) => p.id === progress.presentationId);
                    return (
                      <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900">
                            Dr. Bonny
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            KMPDC-REG-48921
                          </div>
                        </td>
                        <td className="px-4 py-3 max-w-xs text-slate-700">
                          <div className="font-medium text-slate-900 truncate">
                            {pres?.title || progress.presentationId}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {progress.syncedAt ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                                <Wifi className="w-2.5 h-2.5" />
                                {lang === 'fr' ? 'Synchronisé Hors-Ligne' : 'Synced from Offline'}
                              </span>
                            ) : progress.isOfflinePendingSync ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                                <Clock className="w-2.5 h-2.5" />
                                {lang === 'fr' ? 'En attente synchro' : 'Offline Pending Sync'}
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400">
                                {lang === 'fr' ? 'Session en direct' : 'Live Online Session'}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {progress.quizAttempt?.passed ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase">
                              {t.passed}
                            </span>
                          ) : progress.isSlideDeckCompleted ? (
                            <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold uppercase">
                              Quiz Pending
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase">
                              {t.inProgress}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono font-bold">
                          {progress.quizAttempt ? (
                            <span
                              className={
                                progress.quizAttempt.passed
                                  ? 'text-emerald-600'
                                  : 'text-rose-600'
                              }
                            >
                              {progress.quizAttempt.score}%
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">
                          {progress.lastViewedDate}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {progress.certificateIssued ? (
                            <button
                              type="button"
                              onClick={() => onViewCertificateForUser(progress.presentationId)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold inline-flex items-center gap-1"
                            >
                              <ShieldCheck className="w-3 h-3" />
                              <span>{lang === 'fr' ? 'Attestation' : 'Certificate'}</span>
                            </button>
                          ) : (
                            <span className="text-slate-400 text-[11px]">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Offline Synchronization & Cloud Sync Feed */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-blue-600" />
                  {lang === 'fr'
                    ? 'Journal de Synchronisation Hors-Ligne'
                    : 'Offline Learner Synchronization & Analytics Feed'}
                </h3>
                <p className="text-xs text-slate-500">
                  {lang === 'fr'
                    ? 'Historique des modules et quiz validés hors-ligne puis synchronisés avec le serveur'
                    : 'Real-time telemetry of modules and quizzes completed during offline study and synced upon reconnection'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {userProgressList.filter((p) => p.syncedAt).length} {lang === 'fr' ? 'Modules synchronisés' : 'Synced Modules'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {userProgressList
                .filter((p) => p.syncedAt || p.isOfflinePendingSync)
                .map((item, i) => {
                  const pres = presentations.find((p) => p.id === item.presentationId);
                  return (
                    <div
                      key={i}
                      className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 truncate max-w-[180px]">
                          {pres?.title || item.presentationId}
                        </span>
                        {item.syncedAt ? (
                          <span className="px-1.5 py-0.2 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                            Synced
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                            Pending
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {item.quizAttempt ? (
                          <span>Quiz Score: <strong className="text-slate-800">{item.quizAttempt.score}%</strong> ({item.quizAttempt.passed ? 'Passed' : 'Review'})</span>
                        ) : (
                          <span>Slides Deck: Completed ({item.completedSlides.length} slides)</span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-200/80 flex items-center justify-between">
                        <span>Clinician: Dr. Bonny</span>
                        <span>{item.syncedAt || item.lastViewedDate}</span>
                      </div>
                    </div>
                  );
                })}

              {userProgressList.filter((p) => p.syncedAt || p.isOfflinePendingSync).length === 0 && (
                <div className="col-span-full py-4 text-center text-xs text-slate-400">
                  {lang === 'fr'
                    ? 'Aucun module hors-ligne en attente. Toutes les sessions sont synchronisées en direct.'
                    : 'All learner sessions currently live. Test offline mode on the clinician portal to simulate offline queuing & auto-synchronization.'}
                </div>
              )}
            </div>
          </div>

          {/* M-Pesa Transactions Log */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                {t.mpesaTransactions} ({mpesaTransactions.length})
              </h3>
              <p className="text-xs text-slate-500">
                {lang === 'fr'
                  ? 'Paiements Daraja STK Push validés pour l’accès aux modules payants'
                  : 'Real-time Safaricom Daraja STK push payment receipts'}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Receipt Code</th>
                    <th className="px-4 py-3 font-semibold">Module</th>
                    <th className="px-4 py-3 font-semibold">Mobile Number</th>
                    <th className="px-4 py-3 font-semibold">Amount (KES)</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {mpesaTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-emerald-600">
                        {tx.transactionCode}
                      </td>
                      <td className="px-4 py-3 max-w-xs truncate font-medium text-slate-900">
                        {tx.presentationTitle}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600">
                        {tx.phoneNumber}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">
                        KES {tx.amountKes}.00
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase">
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-500 text-[11px]">
                        {tx.timestamp}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : activeTab === 'upload-ppt' ? (
        <PptUploadSection
          lang={lang}
          onAddNewPresentation={(newPres) => {
            onAddNewPresentation(newPres);
            setActiveTab('analytics');
          }}
          onViewPresentation={onViewPresentation}
          onCancel={() => setActiveTab('analytics')}
        />
      ) : (
        /* POST NEW PRESENTATION FORM */
        <form
          onSubmit={handleCreatePresentation}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 text-slate-700 text-xs sm:text-sm"
        >
          {/* Quick Banner: Want to import PPT instead? */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-50/90 via-blue-50/50 to-indigo-50/40 border border-orange-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                P
              </div>
              <div className="text-xs">
                <span className="font-bold text-slate-900 block">
                  {lang === 'fr'
                    ? 'Vous avez un fichier PowerPoint ou WPS prêt ?'
                    : 'Have an existing Microsoft PowerPoint or WPS slide deck?'}
                </span>
                <span className="text-slate-600">
                  {lang === 'fr'
                    ? 'Importez directement votre fichier .pptx ou .ppt pour convertir vos diapositives et notes en 1 clic.'
                    : 'Upload your .pptx or .ppt file directly to auto-extract slides, speaker notes, and clinical graphics.'}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('upload-ppt')}
              className="px-3.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-xs transition-colors shrink-0 flex items-center gap-1.5"
            >
              <FolderUp className="w-3.5 h-3.5" />
              <span>{lang === 'fr' ? 'Importer Présentation PPT' : 'Switch to PPT Upload'}</span>
            </button>
          </div>

          <div className="border-b border-slate-200 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" />
              {t.createModuleTitle}
            </h3>
            <p className="text-xs text-slate-500">
              {lang === 'fr'
                ? 'Créez un support de formation avec diapositives, démonstration vidéo, imagerie haute résolution et quiz interactif.'
                : 'Publish medical PowerPoint resources with slides, video demo, high-res imaging viewer, and interactive evaluation quiz.'}
            </p>
          </div>

          {/* Core Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.titleField} *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Acute Stroke Management & Endovascular Thrombectomy"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.specialtyField}
              </label>
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value as MedicalSpecialty)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(specialtyTranslations).map((spec) => (
                  <option key={spec} value={spec}>
                    {specialtyTranslations[spec as MedicalSpecialty][lang]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.facultyField}
              </label>
              <input
                type="text"
                value={facultyAuthor}
                onChange={(e) => setFacultyAuthor(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.institutionField}
              </label>
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.creditsField}
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="10"
                  value={cmeCredits}
                  onChange={(e) => setCmeCredits(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.estimatedMinutesField}
                </label>
                <input
                  type="number"
                  min="10"
                  step="5"
                  value={estimatedMinutes}
                  onChange={(e) => setEstimatedMinutes(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.summaryField}
              </label>
              <textarea
                rows={2}
                placeholder="Clinical synopsis and relevance for practicing clinicians..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.objectivesField}
              </label>
              <textarea
                rows={3}
                value={objectivesText}
                onChange={(e) => setObjectivesText(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
          </div>

          {/* Pricing Tier */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-blue-700">
              {t.pricingField}
            </h4>
            <div className="flex flex-wrap items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="pricing"
                  checked={isFree}
                  onChange={() => setIsFree(true)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-slate-800 font-medium">{t.priceFree}</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="pricing"
                  checked={!isFree}
                  onChange={() => setIsFree(false)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-slate-800 font-medium">{t.pricePaid}</span>
              </label>

              {!isFree && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">{t.priceAmountKes}:</span>
                  <input
                    type="number"
                    step="50"
                    min="100"
                    value={priceKes}
                    onChange={(e) => setPriceKes(parseInt(e.target.value, 10))}
                    className="w-28 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 font-mono font-bold text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Slide 1 Content */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              {t.slidesHeader} (Slide 1)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {t.slideTitle}
                </label>
                <input
                  type="text"
                  value={slideTitle}
                  onChange={(e) => setSlideTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {t.slideBullets}
                </label>
                <textarea
                  rows={3}
                  value={slideBulletsText}
                  onChange={(e) => setSlideBulletsText(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs sm:text-sm font-mono focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {t.slideNotes}
                </label>
                <textarea
                  rows={2}
                  value={slideNotes}
                  onChange={(e) => setSlideNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {t.slideTakeaway}
                </label>
                <textarea
                  rows={2}
                  value={slideTakeaway}
                  onChange={(e) => setSlideTakeaway(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Video URL */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-blue-600" />
                  {t.videoUrlField}
                </label>
                <input
                  type="url"
                  placeholder="https://.../clinical-demo.mp4"
                  value={slideVideoUrl}
                  onChange={(e) => setSlideVideoUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-900 font-mono text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* High-Res Imaging */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1.5">
                  <Image className="w-3.5 h-3.5 text-blue-600" />
                  {t.imageUrlField}
                </label>
                <input
                  type="url"
                  value={slideImageUrl}
                  onChange={(e) => setSlideImageUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-900 font-mono text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {t.imageModalityField}
                </label>
                <select
                  value={imageModality}
                  onChange={(e) =>
                    setImageModality(
                      e.target.value as
                        | 'X-Ray'
                        | 'CT Scan'
                        | 'MRI'
                        | 'Ultrasound'
                        | 'Histology'
                        | 'ECG'
                        | 'Clinical Photo'
                    )
                  }
                  className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500"
                >
                  <option value="CT Scan">CT Scan</option>
                  <option value="MRI">MRI</option>
                  <option value="X-Ray">X-Ray</option>
                  <option value="Ultrasound">Ultrasound</option>
                  <option value="Histology">Histology</option>
                  <option value="ECG">ECG</option>
                  <option value="Clinical Photo">Clinical Photo</option>
                </select>
              </div>
            </div>
          </div>

          {/* Quiz Question 1 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" />
              {t.quizHeader} (Question 1)
            </h4>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                {t.vignetteField}
              </label>
              <textarea
                rows={2}
                value={quizVignette}
                onChange={(e) => setQuizVignette(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] text-slate-500 mb-0.5">Option A</label>
                <input
                  type="text"
                  value={optionA}
                  onChange={(e) => setOptionA(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-0.5">Option B</label>
                <input
                  type="text"
                  value={optionB}
                  onChange={(e) => setOptionB(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-0.5">Option C</label>
                <input
                  type="text"
                  value={optionC}
                  onChange={(e) => setOptionC(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-0.5">Option D</label>
                <input
                  type="text"
                  value={optionD}
                  onChange={(e) => setOptionD(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {t.correctIndexField}
                </label>
                <select
                  value={correctAnswerIndex}
                  onChange={(e) => setCorrectAnswerIndex(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-blue-700 text-xs font-bold focus:ring-2 focus:ring-blue-500"
                >
                  <option value={0}>Option A</option>
                  <option value={1}>Option B</option>
                  <option value={2}>Option C</option>
                  <option value={3}>Option D</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {t.rationaleField}
                </label>
                <input
                  type="text"
                  value={quizRationale}
                  onChange={(e) => setQuizRationale(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setActiveTab('analytics')}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-transform active:scale-98 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{t.savePresentation}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
