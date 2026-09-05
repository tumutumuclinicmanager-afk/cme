import React from 'react';
import {
  Clock,
  Award,
  Video,
  Image,
  BookOpen,
  Lock,
  CheckCircle2,
  Download,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Presentation, Language, UserProgress } from '../types';
import { getTranslation } from '../translations';

interface PresentationCardProps {
  presentation: Presentation;
  lang: Language;
  progress?: UserProgress;
  isUnlocked: boolean;
  onOpenPresentation: () => void;
  onOpenQuiz: () => void;
  onOpenCertificate: () => void;
  onOpenMPesa: () => void;
  onOpenOfflineDownload: () => void;
  isOfflineCached?: boolean;
}

export const PresentationCard: React.FC<PresentationCardProps> = ({
  presentation,
  lang,
  progress,
  isUnlocked,
  onOpenPresentation,
  onOpenQuiz,
  onOpenCertificate,
  onOpenMPesa,
  onOpenOfflineDownload,
  isOfflineCached = false,
}) => {
  const t = getTranslation(lang);
  const title = lang === 'fr' && presentation.titleFr ? presentation.titleFr : presentation.title;
  const summary = lang === 'fr' && presentation.summaryFr ? presentation.summaryFr : presentation.summary;

  const totalSlides = presentation.slides.length;
  const completedSlidesCount = progress?.completedSlides?.length || 0;
  const slideProgressPercent = Math.round((completedSlidesCount / totalSlides) * 100);

  const hasVideo = presentation.slides.some((s) => s.videoUrl);
  const hasImaging = presentation.slides.some((s) => s.imageDetails);
  const isPassed = progress?.quizAttempt?.passed;

  return (
    <div
      id={`presentation-card-${presentation.id}`}
      className="bg-white rounded-2xl border border-slate-200 hover:border-blue-300 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden group"
    >
      {/* Top Banner / Image */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-100">
        <img
          src={presentation.thumbnailUrl}
          alt={title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-white/95 backdrop-blur-md text-blue-700 shadow-xs">
            {presentation.specialty}
          </span>
          <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-900/80 backdrop-blur-md text-white">
            {presentation.level}
          </span>
          {presentation.sourceFileType === 'ms-powerpoint' && (
            <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-orange-600 text-white shadow-xs">
              MS PowerPoint
            </span>
          )}
          {presentation.sourceFileType === 'wps-presentation' && (
            <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-blue-600 text-white shadow-xs">
              WPS Presentation
            </span>
          )}
        </div>

        {/* Price / Access Pill */}
        <div className="absolute top-3 right-3">
          {isUnlocked ? (
            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-600 text-white shadow-xs flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>{presentation.isFree ? t.freeBadge : 'Unlocked'}</span>
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-900 text-white shadow-xs flex items-center gap-1 font-mono">
              <Lock className="w-3 h-3" />
              <span>KES {presentation.priceKes}</span>
            </span>
          )}
        </div>

        {/* Media indicators overlay bottom-left */}
        <div className="absolute bottom-2.5 left-3 flex items-center gap-2 text-[11px] text-white">
          <span className="flex items-center gap-1 bg-slate-900/70 backdrop-blur px-2 py-0.5 rounded">
            <BookOpen className="w-3 h-3 text-blue-300" />
            {totalSlides} {t.slidesCount}
          </span>
          {hasVideo && (
            <span className="flex items-center gap-1 bg-slate-900/70 backdrop-blur px-2 py-0.5 rounded text-sky-200">
              <Video className="w-3 h-3" />
              <span>Video</span>
            </span>
          )}
          {hasImaging && (
            <span className="flex items-center gap-1 bg-slate-900/70 backdrop-blur px-2 py-0.5 rounded text-amber-200">
              <Image className="w-3 h-3" />
              <span>Imaging</span>
            </span>
          )}
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Credits & Time meta */}
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="flex items-center gap-1 text-blue-600 font-bold font-mono">
              <Award className="w-3.5 h-3.5" />
              {presentation.cmeCredits.toFixed(1)} {t.creditsLabel}
            </span>
            <span className="flex items-center gap-1 text-slate-500">
              <Clock className="w-3.5 h-3.5" />
              {presentation.estimatedMinutes} {t.minsLabel}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
            {title}
          </h3>

          {/* Faculty Author */}
          <p className="text-xs text-slate-500 italic truncate">
            {presentation.facultyAuthor}
          </p>

          {/* Summary */}
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {summary}
          </p>
        </div>

        {/* Progress & Quiz Status */}
        {isUnlocked && (
          <div className="space-y-1.5 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between text-[11px] font-medium text-slate-500">
              <span>{lang === 'fr' ? 'Progression des diapositives' : 'Slide Progress'}</span>
              <span className="font-mono font-semibold text-blue-600">{slideProgressPercent}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${slideProgressPercent}%` }}
              />
            </div>

            {/* Quiz Result Pill if attempted */}
            {progress?.quizAttempt && (
              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-slate-500">{t.quizScore}:</span>
                <span
                  className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                    isPassed
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {progress.quizAttempt.score}% {isPassed ? '✓ ' + t.passed : '✗ ' + t.failed}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Card Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          {/* Offline download icon button */}
          <button
            type="button"
            onClick={onOpenOfflineDownload}
            title={t.downloadOffline}
            className={`p-2 rounded-xl text-xs border transition-colors ${
              isOfflineCached
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 border-slate-200'
            }`}
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Primary Action Button based on unlock / progress state */}
          {!isUnlocked ? (
            <button
              type="button"
              onClick={onOpenMPesa}
              className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all active:scale-98 flex items-center justify-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{t.unlockWithMpesa} (KES {presentation.priceKes})</span>
            </button>
          ) : isPassed ? (
            <div className="flex items-center gap-1.5 flex-1">
              <button
                type="button"
                onClick={onOpenPresentation}
                className="py-2 px-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors flex-1 text-center"
              >
                {lang === 'fr' ? 'Revoir' : 'Review'}
              </button>
              <button
                type="button"
                onClick={onOpenCertificate}
                className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{lang === 'fr' ? 'Attestation' : 'Certificate'}</span>
              </button>
            </div>
          ) : completedSlidesCount >= totalSlides ? (
            <div className="flex items-center gap-1.5 flex-1">
              <button
                type="button"
                onClick={onOpenPresentation}
                className="py-2 px-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors"
              >
                {lang === 'fr' ? 'Diapos' : 'Slides'}
              </button>
              <button
                type="button"
                onClick={onOpenQuiz}
                className="py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all flex-1 flex items-center justify-center gap-1"
              >
                <Award className="w-3.5 h-3.5" />
                <span>{t.takeQuiz}</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenPresentation}
              className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all active:scale-98 flex items-center justify-center gap-1.5"
            >
              <span>{completedSlidesCount > 0 ? t.continuePresentation : t.startPresentation}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
