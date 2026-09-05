import React, { useState } from 'react';
import {
  Sparkles,
  Compass,
  ArrowRight,
  HelpCircle,
  Award,
  CheckCircle2,
  Clock,
  BookOpen,
  Filter,
  Check,
  Zap,
  Target,
  FileCheck,
} from 'lucide-react';
import {
  Presentation,
  RecommendationItem,
  Language,
  MedicalSpecialty,
  UserProfile,
} from '../types';
import { specialtyTranslations } from '../translations';

interface RecommendationsSectionProps {
  recommendations: RecommendationItem[];
  profile: UserProfile;
  lang: Language;
  onSelectPresentation: (pres: Presentation) => void;
  onOpenQuiz: (pres: Presentation) => void;
  onUpdateInterests: (interests: MedicalSpecialty[]) => void;
}

const ALL_SPECIALTIES: MedicalSpecialty[] = [
  'Cardiology',
  'Pediatrics',
  'Infectious Diseases',
  'Emergency Medicine',
  'Oncology',
  'Obstetrics & Gynecology',
  'Neurology',
  'General Surgery',
];

export const RecommendationsSection: React.FC<RecommendationsSectionProps> = ({
  recommendations,
  profile,
  lang,
  onSelectPresentation,
  onOpenQuiz,
  onUpdateInterests,
}) => {
  const [isEditingInterests, setIsEditingInterests] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<MedicalSpecialty[]>(
    profile.areasOfInterest || []
  );

  const toggleInterest = (spec: MedicalSpecialty) => {
    let next: MedicalSpecialty[];
    if (selectedInterests.includes(spec)) {
      next = selectedInterests.filter((s) => s !== spec);
    } else {
      next = [...selectedInterests, spec];
    }
    setSelectedInterests(next);
    onUpdateInterests(next);
  };

  const getBadgeStyle = (badgeType: RecommendationItem['badgeType']) => {
    switch (badgeType) {
      case 'weakness':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'interest':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'next_track':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'high_cme':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getBadgeIcon = (badgeType: RecommendationItem['badgeType']) => {
    switch (badgeType) {
      case 'weakness':
        return <Target className="w-3.5 h-3.5 text-amber-600 shrink-0" />;
      case 'interest':
        return <Zap className="w-3.5 h-3.5 text-blue-600 shrink-0" />;
      case 'next_track':
        return <Compass className="w-3.5 h-3.5 text-purple-600 shrink-0" />;
      case 'high_cme':
        return <Award className="w-3.5 h-3.5 text-emerald-600 shrink-0" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-slate-500 shrink-0" />;
    }
  };

  return (
    <section className="space-y-3.5" aria-label="Content Recommendations">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                {lang === 'fr' ? 'Recommandations Personnalisées' : 'Adaptive Clinical Recommendations'}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                AI Engine
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {lang === 'fr'
                ? 'Analysé selon vos quiz validés, scores à consolider et spécialités déclarées'
                : 'Formulated from your completed modules, quiz diagnostic scores, and clinical interests'}
            </p>
          </div>
        </div>

        {/* Edit Clinical Interests Button */}
        <button
          type="button"
          onClick={() => setIsEditingInterests(!isEditingInterests)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors self-start sm:self-auto ${
            isEditingInterests
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-2xs'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          <span>
            {isEditingInterests
              ? lang === 'fr'
                ? 'Terminer la sélection'
                : 'Done Editing'
              : lang === 'fr'
              ? 'Mes Centres d’Intérêt'
              : 'My Clinical Interests'}
          </span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-700 font-mono">
            {selectedInterests.length}
          </span>
        </button>
      </div>

      {/* Clinical Interests Chip Picker Drawer */}
      {isEditingInterests && (
        <div className="bg-white rounded-2xl border border-blue-200 p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">
              {lang === 'fr'
                ? 'Sélectionnez vos spécialités médicales d’intérêt prioritaire :'
                : 'Select your priority areas of medical interest:'}
            </span>
            <span className="text-[11px] text-slate-400">
              {selectedInterests.length} {lang === 'fr' ? 'sélectionnée(s)' : 'selected'}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {ALL_SPECIALTIES.map((spec) => {
              const isSelected = selectedInterests.includes(spec);
              const label = specialtyTranslations[spec][lang];
              return (
                <button
                  key={spec}
                  type="button"
                  onClick={() => toggleInterest(spec)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    isSelected
                      ? 'bg-blue-50 text-blue-700 border-blue-300 ring-1 ring-blue-400'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Recommendations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {recommendations.map((rec) => {
          const pres = rec.presentation;
          return (
            <div
              key={pres.id}
              className="bg-white rounded-2xl border border-slate-200 p-4.5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-3 relative overflow-hidden"
            >
              {/* Top Meta Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getBadgeStyle(
                      rec.badgeType
                    )}`}
                  >
                    {getBadgeIcon(rec.badgeType)}
                    <span>{lang === 'fr' ? rec.badgeLabelFr : rec.badgeLabel}</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                    {rec.relevanceScore}% Match
                  </span>
                </div>

                {/* Title */}
                <h4 className="text-sm font-bold text-slate-900 line-clamp-2 hover:text-blue-600 transition-colors">
                  {lang === 'fr' && pres.titleFr ? pres.titleFr : pres.title}
                </h4>

                {/* Subtitle / Author */}
                <p className="text-[11px] text-slate-500 truncate">
                  {pres.facultyAuthor} • {pres.institution}
                </p>

                {/* Rationale Callout Box */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-[11px] text-slate-700 leading-relaxed">
                  <div className="flex items-start gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                    <span>{lang === 'fr' ? rec.reasonFr : rec.reason}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Details & Actions */}
              <div className="pt-2 border-t border-slate-100 space-y-2.5">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span className="flex items-center gap-1 font-semibold text-slate-700">
                    <Award className="w-3.5 h-3.5 text-blue-600" />
                    {pres.cmeCredits.toFixed(1)} CME Credits
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {pres.estimatedMinutes} min
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectPresentation(pres)}
                    className="w-full py-2 px-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-2xs transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{lang === 'fr' ? 'Étudier' : 'View Slides'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenQuiz(pres)}
                    className="w-full py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                  >
                    <FileCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>{lang === 'fr' ? 'Quiz' : 'Take Quiz'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
