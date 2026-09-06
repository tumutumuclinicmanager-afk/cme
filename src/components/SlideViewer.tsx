import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  X,
  FileText,
  Lightbulb,
  Video,
  Download,
  CheckCircle2,
  Award,
  BookOpen,
  Maximize,
  Minimize,
  Search,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  List,
  Layers,
  Sparkles,
  ArrowDownCircle,
  Eye,
  RotateCcw,
} from 'lucide-react';
import { Presentation, Language, PresentationSlide } from '../types';
import { getTranslation } from '../translations';
import { MedicalImageViewer } from './MedicalImageViewer';

interface SlideViewerProps {
  presentation: Presentation;
  lang: Language;
  onClose: () => void;
  onCompleteSlide: (slideNumber: number) => void;
  onOpenQuiz: () => void;
  onOpenOfflineDownload: () => void;
  completedSlides: number[];
  quizPassed?: boolean;
}

// Text highlighter component
const HighlightedText: React.FC<{ text: string; query: string }> = ({ text, query }) => {
  if (!query || !query.trim()) return <>{text}</>;
  const trimmed = query.trim();
  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  try {
    const regex = new RegExp(`(${escaped})`, 'gi');
    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <mark
              key={i}
              className="bg-amber-300 text-amber-950 font-bold px-1 py-0.5 rounded shadow-2xs"
            >
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  } catch {
    return <>{text}</>;
  }
};

export const SlideViewer: React.FC<SlideViewerProps> = ({
  presentation,
  lang,
  onClose,
  onCompleteSlide,
  onOpenQuiz,
  onOpenOfflineDownload,
  completedSlides,
  quizPassed = false,
}) => {
  const t = getTranslation(lang);
  const slides = presentation.slides;
  const totalSlides = slides.length;

  // View state
  const [viewMode, setViewMode] = useState<'scrollable' | 'slideshow'>('scrollable');
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [showNotes, setShowNotes] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [textScale, setTextScale] = useState<'normal' | 'large' | 'xl'>('normal');

  // Search state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterOnlyMatches, setFilterOnlyMatches] = useState<boolean>(false);
  const [activeMatchIndex, setActiveMatchIndex] = useState<number>(0);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Slide matching logic
  const isSlideMatch = (slide: PresentationSlide, query: string) => {
    if (!query || !query.trim()) return true;
    const q = query.toLowerCase().trim();
    if (slide.title.toLowerCase().includes(q)) return true;
    if (slide.subtitle?.toLowerCase().includes(q)) return true;
    if (slide.contentBullets.some((b) => b.toLowerCase().includes(q))) return true;
    if (slide.clinicalTakeaway?.toLowerCase().includes(q)) return true;
    if (slide.speakerNotes?.toLowerCase().includes(q)) return true;
    if (slide.imageDetails?.modality?.toLowerCase().includes(q)) return true;
    if (slide.imageDetails?.caption?.toLowerCase().includes(q)) return true;
    if (
      slide.imageDetails?.annotations?.some(
        (a) =>
          a.label.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q)
      )
    )
      return true;
    return false;
  };

  const matchingSlideIndices = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return slides
      .map((slide, index) => (isSlideMatch(slide, searchQuery) ? index : -1))
      .filter((idx) => idx !== -1);
  }, [slides, searchQuery]);

  const displayedSlides = useMemo(() => {
    if (!searchQuery.trim() || !filterOnlyMatches) return slides;
    return slides.filter((slide) => isSlideMatch(slide, searchQuery));
  }, [slides, searchQuery, filterOnlyMatches]);

  // Slideshow mode: mark current slide as completed
  useEffect(() => {
    if (viewMode === 'slideshow') {
      const current = slides[currentSlideIndex];
      if (current) {
        onCompleteSlide(current.slideNumber);
      }
    }
  }, [viewMode, currentSlideIndex, slides, onCompleteSlide]);

  // Scrollable mode: intersection observer to track which slides user has scrolled into view
  useEffect(() => {
    if (viewMode !== 'scrollable') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const slideNumStr = entry.target.getAttribute('data-slide-number');
            if (slideNumStr) {
              const slideNum = parseInt(slideNumStr, 10);
              onCompleteSlide(slideNum);
              const idx = slides.findIndex((s) => s.slideNumber === slideNum);
              if (idx !== -1) {
                setCurrentSlideIndex(idx);
              }
            }
          }
        });
      },
      {
        root: scrollContainerRef.current,
        threshold: 0.35,
      }
    );

    slideRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [viewMode, slides, onCompleteSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If user is focused on the search input, do not hijack arrows
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (e.key === 'ArrowRight' || e.key === ' ') {
        if (viewMode === 'slideshow') {
          if (currentSlideIndex < totalSlides - 1) {
            setCurrentSlideIndex((prev) => prev + 1);
          }
        }
      } else if (e.key === 'ArrowLeft') {
        if (viewMode === 'slideshow') {
          if (currentSlideIndex > 0) {
            setCurrentSlideIndex((prev) => prev - 1);
          }
        }
      } else if (e.key === 'Escape') {
        if (searchQuery) {
          setSearchQuery('');
        } else if (isFullscreen) {
          setIsFullscreen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, currentSlideIndex, totalSlides, isFullscreen, searchQuery]);

  // Jump to specific slide
  const handleJumpToSlide = (index: number) => {
    setCurrentSlideIndex(index);
    const targetSlide = slides[index];
    if (targetSlide) {
      onCompleteSlide(targetSlide.slideNumber);
    }

    if (viewMode === 'scrollable') {
      const el = slideRefs.current[index];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  // Next / Prev match navigation
  const handleNavigateMatch = (direction: 'next' | 'prev') => {
    if (matchingSlideIndices.length === 0) return;
    let nextIndex = activeMatchIndex;
    if (direction === 'next') {
      nextIndex = (activeMatchIndex + 1) % matchingSlideIndices.length;
    } else {
      nextIndex =
        (activeMatchIndex - 1 + matchingSlideIndices.length) % matchingSlideIndices.length;
    }
    setActiveMatchIndex(nextIndex);
    const slideIdx = matchingSlideIndices[nextIndex];
    handleJumpToSlide(slideIdx);
  };

  const progressPercent = Math.min(
    100,
    Math.round((completedSlides.length / totalSlides) * 100)
  );

  const getTextScaleClasses = () => {
    switch (textScale) {
      case 'xl':
        return {
          title: 'text-2xl sm:text-3xl lg:text-4xl',
          subtitle: 'text-base sm:text-lg',
          bullets: 'text-base sm:text-lg leading-loose',
          pearl: 'text-sm sm:text-base leading-relaxed',
          notes: 'text-sm sm:text-base leading-relaxed',
        };
      case 'large':
        return {
          title: 'text-xl sm:text-2xl lg:text-3xl',
          subtitle: 'text-sm sm:text-base',
          bullets: 'text-sm sm:text-base leading-relaxed',
          pearl: 'text-xs sm:text-sm leading-relaxed',
          notes: 'text-xs sm:text-sm leading-relaxed',
        };
      case 'normal':
      default:
        return {
          title: 'text-lg sm:text-xl lg:text-2xl',
          subtitle: 'text-xs sm:text-sm',
          bullets: 'text-xs sm:text-sm leading-relaxed',
          pearl: 'text-xs sm:text-sm leading-relaxed',
          notes: 'text-xs leading-relaxed',
        };
    }
  };

  const scaleClasses = getTextScaleClasses();

  return (
    <div
      id="slide-viewer-modal"
      className="fixed inset-0 z-50 bg-slate-950/80 flex flex-col backdrop-blur-xs transition-all overflow-hidden animate-fade-in"
    >
      {/* 1. TOP CONTROL BAR */}
      <div className="flex flex-col border-b border-slate-200 bg-white shrink-0 text-slate-800 shadow-xs z-20">
        {/* Upper Row: Title, View Switcher & Actions */}
        <div className="flex items-center justify-between px-3 sm:px-6 py-2.5 gap-2 sm:gap-4 flex-wrap">
          {/* Left: Close & Presentation Info */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors shrink-0"
              title={t.exitViewer}
            >
              <X className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wide">
                  {presentation.specialty}
                </span>
                {presentation.sourceFileType === 'ms-powerpoint' && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-orange-50 text-orange-800 border border-orange-200 uppercase tracking-wide">
                    MS PowerPoint
                  </span>
                )}
                {presentation.sourceFileType === 'wps-presentation' && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200 uppercase tracking-wide">
                    WPS Presentation
                  </span>
                )}
                <span className="text-xs font-semibold text-slate-500 hidden md:inline">
                  {presentation.cmeCredits} {t.creditsLabel}
                </span>
                <span className="text-xs text-slate-400 hidden lg:inline">•</span>
                <span className="text-xs text-slate-500 hidden lg:inline italic truncate max-w-xs">
                  {presentation.facultyAuthor}
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 truncate max-w-xs sm:max-w-md md:max-w-lg">
                {lang === 'fr' && presentation.titleFr ? presentation.titleFr : presentation.title}
              </h2>
            </div>
          </div>

          {/* Center/Right: View Mode Selector & Tools */}
          <div className="flex items-center flex-wrap gap-2">
            {/* View Mode Switcher: Scrollable vs Slideshow */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-2xs">
              <button
                type="button"
                onClick={() => setViewMode('scrollable')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'scrollable'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="View all slides in a continuous scrollable presentation view"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{lang === 'fr' ? 'Vue Défilante (Tout)' : 'Scrollable Deck'}</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('slideshow')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'slideshow'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Step-by-step single slide presentation mode"
              >
                <List className="w-3.5 h-3.5" />
                <span>{lang === 'fr' ? 'Diaporama 1-à-1' : 'Slide-by-Slide'}</span>
              </button>
            </div>

            {/* Font / Legibility Scale Control */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 px-1.5 uppercase">
                {lang === 'fr' ? 'Taille' : 'Size'}
              </span>
              {(['normal', 'large', 'xl'] as const).map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setTextScale(sz)}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase transition-colors ${
                    textScale === sz
                      ? 'bg-white text-blue-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {sz === 'normal' ? '1x' : sz === 'large' ? '1.25x' : '1.5x'}
                </button>
              ))}
            </div>

            {/* Offline download */}
            <button
              type="button"
              onClick={onOpenOfflineDownload}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors shadow-2xs"
              title={t.downloadOffline}
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden md:inline">{t.downloadOffline}</span>
            </button>

            {/* Toggle Notes */}
            <button
              type="button"
              onClick={() => setShowNotes(!showNotes)}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors shadow-2xs ${
                showNotes
                  ? 'bg-blue-50 text-blue-700 border-blue-200 font-bold'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.speakerNotes}</span>
            </button>

            {/* Quiz / Certificate Button */}
            <button
              type="button"
              onClick={onOpenQuiz}
              className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-xs transition-transform active:scale-95 ${
                quizPassed
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>{quizPassed ? t.viewCertificate : t.takeQuiz}</span>
            </button>
          </div>
        </div>

        {/* Lower Row: Integrated Presentation Search Bar */}
        <div className="px-3 sm:px-6 py-2 bg-slate-50/90 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2.5">
          {/* Search Input */}
          <div className="flex items-center gap-2 flex-1 min-w-[220px] max-w-xl">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setActiveMatchIndex(0);
                }}
                placeholder={
                  lang === 'fr'
                    ? 'Rechercher dans les diapositives (termes, ECG, diagnostics, notes)...'
                    : 'Search presentation slides (e.g. ECG, Troponin, Aspirin, dosage, notes)...'
                }
                className="w-full pl-9 pr-8 py-1.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-xs sm:text-sm bg-white text-slate-900 placeholder:text-slate-400 shadow-inner transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Search Match Controls & Status */}
          <div className="flex items-center gap-2 text-xs">
            {searchQuery.trim() ? (
              <>
                <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 font-bold border border-amber-200 shrink-0">
                  {matchingSlideIndices.length === 0
                    ? lang === 'fr'
                      ? 'Aucun résultat'
                      : '0 matches'
                    : lang === 'fr'
                    ? `${matchingSlideIndices.length} diapo(s) trouvée(s)`
                    : `${matchingSlideIndices.length} slide(s) matched`}
                </span>

                {matchingSlideIndices.length > 0 && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleNavigateMatch('prev')}
                      className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700"
                      title="Previous matching slide"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-mono text-slate-600 text-[11px] px-1">
                      {activeMatchIndex + 1}/{matchingSlideIndices.length}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleNavigateMatch('next')}
                      className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700"
                      title="Next matching slide"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>

                    <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer ml-2 select-none">
                      <input
                        type="checkbox"
                        checked={filterOnlyMatches}
                        onChange={(e) => setFilterOnlyMatches(e.target.checked)}
                        className="w-3.5 h-3.5 text-blue-600 rounded border-slate-300"
                      />
                      <span className="hidden sm:inline">
                        {lang === 'fr' ? 'Filtrer uniquement' : 'Filter matching only'}
                      </span>
                    </label>
                  </div>
                )}
              </>
            ) : (
              <span className="text-[11px] text-slate-500 hidden sm:inline">
                {lang === 'fr'
                  ? 'Tapez un mot-clé pour surligner et naviguer instantanément'
                  : 'Type keywords to highlight & jump across slides'}
              </span>
            )}
          </div>
        </div>

        {/* Progress Track */}
        <div className="w-full bg-slate-200 h-1 shrink-0 relative">
          <div
            className="bg-blue-600 h-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 2. MAIN CONTENT STAGE */}
      <div className="flex-1 min-h-0 flex overflow-hidden bg-slate-100 relative">
        {/* Floating Quick Slide Index Rail (Visible on md+ screens) */}
        <div className="hidden lg:flex flex-col justify-start p-3 w-16 shrink-0 bg-white/80 backdrop-blur-xs border-r border-slate-200 z-10 overflow-y-auto space-y-1.5">
          <div className="text-[9px] font-extrabold uppercase text-slate-400 text-center tracking-wider pb-1">
            Slides
          </div>
          {slides.map((s, idx) => {
            const isCompleted = completedSlides.includes(s.slideNumber);
            const isCurrent = idx === currentSlideIndex;
            const isMatch = matchingSlideIndices.includes(idx);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => handleJumpToSlide(idx)}
                className={`w-10 h-10 rounded-xl text-xs font-bold mx-auto flex flex-col items-center justify-center transition-all relative ${
                  isCurrent
                    ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-300 scale-105'
                    : isMatch
                    ? 'bg-amber-100 text-amber-900 border border-amber-300 font-black'
                    : isCompleted
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                title={`Jump to Slide ${s.slideNumber}: ${s.title}`}
              >
                <span>{s.slideNumber}</span>
                {isCompleted && (
                  <CheckCircle2 className="w-2.5 h-2.5 text-blue-500 absolute bottom-1 right-1" />
                )}
              </button>
            );
          })}
        </div>

        {/* ========================================================= */}
        {/* MODE A: CONTINUOUS SCROLLABLE VIEW (ALL SLIDES STACKED)  */}
        {/* ========================================================= */}
        {viewMode === 'scrollable' ? (
          <div
            ref={scrollContainerRef}
            className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-8 scroll-smooth"
          >
            <div className="max-w-5xl mx-auto space-y-8">
              {/* Presentation Cover Header Banner */}
              <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-800 space-y-4">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="px-3 py-1 rounded-md bg-blue-500/20 text-blue-300 border border-blue-400/30 font-bold uppercase tracking-wider">
                    {presentation.specialty}
                  </span>
                  <span className="px-3 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-bold">
                    {presentation.cmeCredits} {t.creditsLabel}
                  </span>
                  <span className="text-slate-400 font-mono">
                    {totalSlides} {lang === 'fr' ? 'Diapositives' : 'Slides'}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-tight">
                  <HighlightedText
                    text={
                      lang === 'fr' && presentation.titleFr
                        ? presentation.titleFr
                        : presentation.title
                    }
                    query={searchQuery}
                  />
                </h1>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-white/10 text-xs sm:text-sm text-slate-300">
                  <div>
                    <span className="text-slate-400">Faculty: </span>
                    <strong className="text-white">{presentation.facultyAuthor}</strong>
                    <div className="text-slate-400 text-xs">{presentation.institution}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-300">
                      {completedSlides.length} / {totalSlides}{' '}
                      {lang === 'fr' ? 'diapos lues' : 'slides completed'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Empty state for search filter */}
              {displayedSlides.length === 0 && (
                <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs space-y-3">
                  <Search className="w-10 h-10 text-slate-300 mx-auto" />
                  <h3 className="text-lg font-bold text-slate-800">
                    {lang === 'fr'
                      ? 'Aucune diapositive ne correspond à la recherche'
                      : 'No slides matched your search'}
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    {lang === 'fr'
                      ? `Aucune diapositive ne contient "${searchQuery}". Essayez avec un autre terme ou désactivez le filtre.`
                      : `No content matched "${searchQuery}". Try terms like 'ECG', 'Troponin', 'PCI', or 'Management'.`}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setFilterOnlyMatches(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs hover:bg-blue-100 transition-colors"
                  >
                    {lang === 'fr' ? 'Réinitialiser la recherche' : 'Clear Search'}
                  </button>
                </div>
              )}

              {/* Stacked Slides Loop */}
              {displayedSlides.map((slide, sIdx) => {
                const isMatching = isSlideMatch(slide, searchQuery);
                const isCompleted = completedSlides.includes(slide.slideNumber);

                return (
                  <div
                    key={slide.id}
                    id={`slide-section-${slide.slideNumber}`}
                    data-slide-number={slide.slideNumber}
                    ref={(el) => (slideRefs.current[sIdx] = el)}
                    className={`bg-white rounded-3xl border transition-all duration-200 shadow-md overflow-hidden relative ${
                      isMatching && searchQuery.trim()
                        ? 'border-amber-400 ring-2 ring-amber-300/60'
                        : 'border-slate-300/80 hover:border-blue-400'
                    }`}
                  >
                    {/* Slide Top Badge Header */}
                    <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2 text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-mono font-black text-xs shadow-2xs">
                          SLIDE {slide.slideNumber.toString().padStart(2, '0')} /{' '}
                          {totalSlides.toString().padStart(2, '0')}
                        </span>
                        {isCompleted && (
                          <span className="flex items-center gap-1 text-emerald-600 font-bold text-[11px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {lang === 'fr' ? 'Vu & Validé' : 'Viewed'}
                          </span>
                        )}
                        {isMatching && searchQuery.trim() && (
                          <span className="bg-amber-100 text-amber-900 font-bold text-[11px] px-2 py-0.5 rounded border border-amber-300 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-600" />
                            {lang === 'fr' ? 'Correspondance' : 'Search Match'}
                          </span>
                        )}
                      </div>

                      <div className="text-slate-400 font-medium text-[11px]">
                        {presentation.specialty} • CPD Accreditation
                      </div>
                    </div>

                    {/* Slide Main Body */}
                    <div className="p-6 sm:p-8 lg:p-10 space-y-6">
                      {/* Slide Title & Subtitle */}
                      <div className="space-y-1.5 border-b border-slate-100 pb-4">
                        <h2 className={`${scaleClasses.title} font-black text-slate-900 tracking-tight`}>
                          <HighlightedText text={slide.title} query={searchQuery} />
                        </h2>
                        {slide.subtitle && (
                          <p className={`${scaleClasses.subtitle} font-medium text-slate-600`}>
                            <HighlightedText text={slide.subtitle} query={searchQuery} />
                          </p>
                        )}
                      </div>

                      {/* Content Grid: Bullets & Media */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Bullets List */}
                        <div
                          className={`space-y-4 ${
                            slide.imageDetails || slide.videoUrl
                              ? 'lg:col-span-7'
                              : 'lg:col-span-12'
                          }`}
                        >
                          <div className="bg-slate-50/70 rounded-2xl p-5 sm:p-6 border border-slate-200/80 space-y-3.5 shadow-2xs">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                              <BookOpen className="w-4 h-4 text-blue-600" />
                              {lang === 'fr'
                                ? 'Points Cliniques Majeurs'
                                : 'Core Clinical Concepts & Protocol'}
                            </h3>
                            <ul className="space-y-3">
                              {slide.contentBullets.map((bullet, bIdx) => (
                                <li
                                  key={bIdx}
                                  className={`flex items-start gap-3 ${scaleClasses.bullets} text-slate-800 font-medium`}
                                >
                                  <span className="w-2 h-2 rounded-full bg-blue-600 mt-2 shrink-0 shadow-2xs" />
                                  <span>
                                    <HighlightedText text={bullet} query={searchQuery} />
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Key Clinical Pearl */}
                          {slide.clinicalTakeaway && (
                            <div className="bg-amber-50/90 border border-amber-300/80 rounded-2xl p-5 flex items-start gap-3.5 text-amber-950 shadow-2xs">
                              <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                              <div className="space-y-1">
                                <span className="font-extrabold text-xs uppercase tracking-wider text-amber-900 block">
                                  {t.takeaway}
                                </span>
                                <p className={`${scaleClasses.pearl} font-semibold text-amber-950`}>
                                  <HighlightedText
                                    text={slide.clinicalTakeaway}
                                    query={searchQuery}
                                  />
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Media Section: High-Res Imaging Viewer or Embedded Video */}
                        {(slide.imageDetails || slide.videoUrl) && (
                          <div className="lg:col-span-5 space-y-4">
                            {/* High-Resolution Diagnostic Imaging Viewer */}
                            {slide.imageDetails && (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                                  <span className="flex items-center gap-1.5 text-blue-700 font-bold">
                                    <Eye className="w-4 h-4 text-blue-600" />
                                    {t.imagingAnalysis}
                                  </span>
                                </div>
                                <MedicalImageViewer image={slide.imageDetails} lang={lang} />
                              </div>
                            )}

                            {/* Embedded Clinical Video Playback */}
                            {slide.videoUrl && (
                              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-2">
                                <div className="flex items-center justify-between text-xs font-medium text-slate-700">
                                  <span className="flex items-center gap-1.5 text-blue-600 font-bold">
                                    <Video className="w-4 h-4" />
                                    {slide.videoTitle || t.videoDemonstration}
                                  </span>
                                  {slide.videoDuration && (
                                    <span className="text-[11px] font-mono text-slate-500">
                                      {slide.videoDuration}
                                    </span>
                                  )}
                                </div>
                                <div className="rounded-xl overflow-hidden bg-black aspect-video relative shadow-inner">
                                  <video
                                    controls
                                    className="w-full h-full object-contain"
                                    src={slide.videoUrl}
                                    poster={slide.imageUrl}
                                  >
                                    <track kind="captions" />
                                    Your browser does not support the video tag.
                                  </video>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Inline Speaker Notes (if enabled) */}
                      {showNotes && slide.speakerNotes && (
                        <div className="pt-4 border-t border-slate-200/80 bg-slate-50/60 rounded-2xl p-4 border space-y-1.5">
                          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-700">
                            <FileText className="w-3.5 h-3.5" />
                            {t.speakerNotes}
                          </div>
                          <p className={`${scaleClasses.notes} text-slate-700 italic`}>
                            <HighlightedText text={slide.speakerNotes} query={searchQuery} />
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* End of Deck Action Card */}
              <div className="bg-blue-900 text-white rounded-2xl p-8 sm:p-10 text-center shadow-sm space-y-4">
                <Award className="w-12 h-12 mx-auto text-amber-300" />
                <h3 className="text-xl sm:text-2xl font-bold">
                  {lang === 'fr'
                    ? 'Module de formation terminé avec succès !'
                    : 'Presentation Deck Complete! Ready to Claim CME Credits?'}
                </h3>
                <p className="text-xs sm:text-sm text-blue-100 max-w-lg mx-auto">
                  {lang === 'fr'
                    ? 'Passez l’évaluation formative clinique pour obtenir votre certificat officiel accrédité par le conseil des médecins.'
                    : `You have completed all ${totalSlides} slides. Pass the CPD clinical diagnostic quiz (minimum 80% pass mark) to generate your verified KMPDC certificate.`}
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={onOpenQuiz}
                    className="px-8 py-3 rounded-xl bg-white hover:bg-slate-100 text-blue-950 font-bold text-sm shadow-xs transition-colors inline-flex items-center gap-2"
                  >
                    <Award className="w-5 h-5 text-amber-500" />
                    <span>{quizPassed ? t.viewCertificate : t.takeQuiz}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================= */
          /* MODE B: STEP-BY-STEP SLIDESHOW (1-AT-A-TIME PRESENTATION)  */
          /* ========================================================= */
          <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
            {/* Left: Current Slide Viewport */}
            <div className="flex-1 min-h-0 p-4 sm:p-6 lg:p-8 overflow-y-auto flex flex-col justify-start">
              <div className="max-w-4xl mx-auto w-full space-y-6">
                {/* Slide Card Frame */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-slate-300 shadow-md space-y-6">
                  {/* Slide Header */}
                  <div className="space-y-2 border-b border-slate-100 pb-4">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                      <span className="uppercase tracking-wider px-2.5 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200">
                        {t.slide} {slides[currentSlideIndex].slideNumber} {t.of} {totalSlides}
                      </span>
                      <span className="font-mono font-bold text-blue-600">
                        {Math.round(((currentSlideIndex + 1) / totalSlides) * 100)}%{' '}
                        {lang === 'fr' ? 'Complété' : 'Completed'}
                      </span>
                    </div>
                    <h1 className={`${scaleClasses.title} font-black text-slate-900 tracking-tight`}>
                      <HighlightedText
                        text={slides[currentSlideIndex].title}
                        query={searchQuery}
                      />
                    </h1>
                    {slides[currentSlideIndex].subtitle && (
                      <p className={`${scaleClasses.subtitle} font-medium text-slate-600`}>
                        <HighlightedText
                          text={slides[currentSlideIndex].subtitle!}
                          query={searchQuery}
                        />
                      </p>
                    )}
                  </div>

                  {/* Slide Content Grid: Bullets & Media */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Bullets List */}
                    <div
                      className={`space-y-4 ${
                        slides[currentSlideIndex].imageDetails ||
                        slides[currentSlideIndex].videoUrl
                          ? 'lg:col-span-6'
                          : 'lg:col-span-12'
                      }`}
                    >
                      <div className="bg-slate-50/70 rounded-2xl p-5 sm:p-6 border border-slate-200/80 space-y-3 shadow-2xs">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-blue-600" />
                          {lang === 'fr' ? 'Points Cliniques Majeurs' : 'Core Clinical Concepts'}
                        </h3>
                        <ul className="space-y-3">
                          {slides[currentSlideIndex].contentBullets.map((bullet, idx) => (
                            <li
                              key={idx}
                              className={`flex items-start gap-3 ${scaleClasses.bullets} text-slate-800 font-medium`}
                            >
                              <span className="w-2 h-2 rounded-full bg-blue-600 mt-2 shrink-0 shadow-2xs" />
                              <span>
                                <HighlightedText text={bullet} query={searchQuery} />
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Key Clinical Pearl */}
                      {slides[currentSlideIndex].clinicalTakeaway && (
                        <div className="bg-amber-50/90 border border-amber-300/80 rounded-2xl p-5 flex items-start gap-3 text-amber-950 shadow-2xs">
                          <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-extrabold text-xs uppercase tracking-wider text-amber-900 block mb-0.5">
                              {t.takeaway}
                            </span>
                            <p className={`${scaleClasses.pearl} font-semibold text-amber-950`}>
                              <HighlightedText
                                text={slides[currentSlideIndex].clinicalTakeaway!}
                                query={searchQuery}
                              />
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Media Section: High-Res Imaging Viewer or Embedded Video */}
                    {(slides[currentSlideIndex].imageDetails ||
                      slides[currentSlideIndex].videoUrl) && (
                      <div className="lg:col-span-6 space-y-4">
                        {slides[currentSlideIndex].imageDetails && (
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                              <span className="flex items-center gap-1.5 text-blue-700 font-bold">
                                <Eye className="w-4 h-4 text-blue-600" />
                                {t.imagingAnalysis}
                              </span>
                            </div>
                            <MedicalImageViewer
                              image={slides[currentSlideIndex].imageDetails!}
                              lang={lang}
                            />
                          </div>
                        )}

                        {slides[currentSlideIndex].videoUrl && (
                          <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs space-y-2">
                            <div className="flex items-center justify-between text-xs font-medium text-slate-700">
                              <span className="flex items-center gap-1.5 text-blue-600 font-bold">
                                <Video className="w-4 h-4" />
                                {slides[currentSlideIndex].videoTitle || t.videoDemonstration}
                              </span>
                              {slides[currentSlideIndex].videoDuration && (
                                <span className="text-[11px] font-mono text-slate-500">
                                  {slides[currentSlideIndex].videoDuration}
                                </span>
                              )}
                            </div>
                            <div className="rounded-xl overflow-hidden bg-black aspect-video relative">
                              <video
                                controls
                                className="w-full h-full object-contain"
                                src={slides[currentSlideIndex].videoUrl}
                                poster={slides[currentSlideIndex].imageUrl}
                              >
                                <track kind="captions" />
                                Your browser does not support the video tag.
                              </video>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Drawer: Speaker Notes in Slideshow mode */}
            {showNotes && (
              <aside className="w-full lg:w-80 shrink-0 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 p-4 sm:p-5 overflow-y-auto space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    {t.speakerNotes}
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowNotes(false)}
                    className="text-xs text-slate-400 hover:text-slate-700"
                  >
                    {t.close}
                  </button>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed shadow-2xs">
                  <HighlightedText
                    text={slides[currentSlideIndex].speakerNotes}
                    query={searchQuery}
                  />
                </div>

                <div className="pt-2 border-t border-slate-200 space-y-1.5 text-xs text-slate-500">
                  <p className="font-semibold text-slate-800">
                    {lang === 'fr' ? 'Accréditation & Auteur' : 'Accreditation & Faculty'}
                  </p>
                  <p className="italic text-slate-700">{presentation.facultyAuthor}</p>
                  <p className="text-[11px] text-slate-500">{presentation.institution}</p>
                </div>

                {/* Slide Index Grid navigator */}
                <div className="pt-2 border-t border-slate-200 space-y-2">
                  <p className="text-xs font-semibold text-slate-800">
                    {lang === 'fr' ? 'Diapositives du Module' : 'Module Slides'}
                  </p>
                  <div className="grid grid-cols-4 gap-1.5">
                    {slides.map((s, idx) => {
                      const isCurrent = idx === currentSlideIndex;
                      const isDone = completedSlides.includes(s.slideNumber);
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setCurrentSlideIndex(idx)}
                          className={`h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-colors ${
                            isCurrent
                              ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                              : isDone
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {s.slideNumber}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </aside>
            )}
          </div>
        )}
      </div>

      {/* 3. BOTTOM NAVIGATION TOOLBAR (Slideshow Mode Only) */}
      {viewMode === 'slideshow' && (
        <div className="px-4 sm:px-6 py-3 bg-white border-t border-slate-200 flex items-center justify-between shrink-0 text-slate-800 z-20">
          <button
            type="button"
            onClick={() => {
              if (currentSlideIndex > 0) {
                setCurrentSlideIndex((prev) => prev - 1);
              }
            }}
            disabled={currentSlideIndex === 0}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs sm:text-sm font-semibold transition-colors text-slate-700"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{t.prevSlide}</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-bold text-slate-900">
              {slides[currentSlideIndex].slideNumber} / {totalSlides}
            </span>
            <span className="text-slate-300 hidden sm:inline">•</span>
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              {lang === 'fr'
                ? 'Utilisez ← / → ou Espace pour naviguer'
                : 'Use ← / → or Spacebar to navigate'}
            </span>
          </div>

          {currentSlideIndex < totalSlides - 1 ? (
            <button
              type="button"
              onClick={() => {
                if (currentSlideIndex < totalSlides - 1) {
                  setCurrentSlideIndex((prev) => prev + 1);
                }
              }}
              className="flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors"
            >
              <span>{t.nextSlide}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenQuiz}
              className="flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-transform active:scale-95 animate-pulse"
            >
              <Award className="w-4 h-4" />
              <span>{t.takeQuiz}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
