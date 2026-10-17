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
  AdminUser,
} from '../types';
import { getTranslation, specialtyTranslations } from '../translations';
import { PptUploadSection } from './PptUploadSection';
import { AdminTeamSection } from './AdminTeamSection';
import { PresentationCreator } from './PresentationCreator';
import { AttachImageModal } from './AttachImageModal';

interface AdminAnalyticsProps {
  presentations: Presentation[];
  userProgressList: UserProgress[];
  mpesaTransactions: MPesaPayment[];
  lang: Language;
  onAddNewPresentation: (presentation: Presentation) => void;
  onUpdatePresentation: (presentation: Presentation) => void;
  onViewPresentation: (presentation: Presentation) => void;
  onViewCertificateForUser: (presentationId: string) => void;
  adminUsers: AdminUser[];
  onAddAdmin: (newAdmin: AdminUser) => void;
  onRemoveAdmin: (adminId: string) => void;
  currentAdminEmail?: string;
  onLogout?: () => void;
}

export const AdminAnalytics: React.FC<AdminAnalyticsProps> = ({
  presentations,
  userProgressList,
  mpesaTransactions,
  lang,
  onAddNewPresentation,
  onUpdatePresentation,
  onViewPresentation,
  onViewCertificateForUser,
  adminUsers,
  onAddAdmin,
  onRemoveAdmin,
  currentAdminEmail,
  onLogout,
}) => {
  const t = getTranslation(lang);
  const [activeTab, setActiveTab] = useState<'analytics' | 'upload-ppt' | 'post-module' | 'admins'>('analytics');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('All');
  const [isAttachImageModalOpen, setIsAttachImageModalOpen] = useState<boolean>(false);
  const [selectedTargetPresId, setSelectedTargetPresId] = useState<string>('');

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
            <button
              type="button"
              onClick={() => setActiveTab('admins')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'admins'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>{lang === 'fr' ? 'Équipe Admins' : 'Admin Team & Roles'}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                  activeTab === 'admins' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {adminUsers.length}
              </span>
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

              <div className="flex items-center flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTargetPresId(presentations[0]?.id || '');
                    setIsAttachImageModalOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                >
                  <Image className="w-4 h-4" />
                  <span>{lang === 'fr' ? '+ Ajouter Cliché' : '+ Attach Clinical Image'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('post-module')}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>{lang === 'fr' ? 'Nouveau Module' : 'Post Presentation'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('upload-ppt')}
                  className="px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                >
                  <FolderUp className="w-4 h-4" />
                  <span>{lang === 'fr' ? 'Importer PPT / WPS' : 'Upload PowerPoint'}</span>
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
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedTargetPresId(pres.id);
                                setIsAttachImageModalOpen(true);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-200 transition-colors inline-flex items-center gap-1"
                              title="Attach diagnostic imaging scan or add image slide"
                            >
                              <Image className="w-3 h-3 text-emerald-600" />
                              <span>{lang === 'fr' ? '+ Cliché' : '+ Image'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => onViewPresentation(pres)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium border border-slate-200 transition-colors inline-flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3 text-blue-600" />
                              <span>{lang === 'fr' ? 'Consulter' : 'Preview'}</span>
                            </button>
                          </div>
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
      ) : activeTab === 'admins' ? (
        <AdminTeamSection
          adminUsers={adminUsers}
          onAddAdmin={onAddAdmin}
          onRemoveAdmin={onRemoveAdmin}
          lang={lang}
          currentAdminEmail={currentAdminEmail}
        />
      ) : (
        /* Multi-Slide Presentation & Media Creator */
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                P
              </div>
              <div className="text-xs">
                <span className="font-bold text-slate-900 block">
                  {lang === 'fr'
                    ? 'Vous avez un fichier PowerPoint ou WPS (.pptx / .ppt) ?'
                    : 'Have an existing Microsoft PowerPoint (.pptx) or WPS presentation?'}
                </span>
                <span className="text-slate-600">
                  {lang === 'fr'
                    ? 'Importez directement votre fichier pour convertir automatiquement vos diapositives, graphiques et notes.'
                    : 'Upload your file directly to auto-extract slides, speaker notes, and clinical graphics.'}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('upload-ppt')}
              className="px-3.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-xs transition-colors shrink-0 flex items-center gap-1.5"
            >
              <FolderUp className="w-3.5 h-3.5" />
              <span>{lang === 'fr' ? 'Importer PPT / WPS' : 'Switch to PPT Upload'}</span>
            </button>
          </div>

          <PresentationCreator
            lang={lang}
            onSavePresentation={(newPres) => {
              onAddNewPresentation(newPres);
              setActiveTab('analytics');
            }}
            onCancel={() => setActiveTab('analytics')}
          />
        </div>
      )}

      {/* Attach Clinical Image / Diagnostic Scan Modal */}
      <AttachImageModal
        isOpen={isAttachImageModalOpen}
        onClose={() => setIsAttachImageModalOpen(false)}
        presentations={presentations}
        targetPresentationId={selectedTargetPresId}
        onSaveUpdatedPresentation={(updated) => {
          onUpdatePresentation(updated);
        }}
        lang={lang}
      />
    </div>
  );
};
