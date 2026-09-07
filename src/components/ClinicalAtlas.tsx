import React, { useState, useMemo } from 'react';
import {
  Image as ImageIcon,
  Search,
  Filter,
  Eye,
  ZoomIn,
  BookOpen,
  Sparkles,
  Layers,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Tag,
  CheckCircle2,
} from 'lucide-react';
import { Presentation, Language, SlideImage, PresentationSlide } from '../types';
import { MedicalImageViewer } from './MedicalImageViewer';

interface AtlasImageItem {
  id: string;
  presentationId: string;
  presentationTitle: string;
  presentationTitleFr?: string;
  specialty: string;
  slideNumber: number;
  slideTitle: string;
  imageDetails: SlideImage;
  presentation: Presentation;
}

interface ClinicalAtlasProps {
  presentations: Presentation[];
  lang: Language;
  onOpenPresentationSlide: (presentation: Presentation, slideNumber: number) => void;
}

export const ClinicalAtlas: React.FC<ClinicalAtlasProps> = ({
  presentations,
  lang,
  onOpenPresentationSlide,
}) => {
  const [selectedModality, setSelectedModality] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeInspectingItem, setActiveInspectingItem] = useState<AtlasImageItem | null>(null);

  // Extract all images across all slides
  const allImages = useMemo(() => {
    const items: AtlasImageItem[] = [];
    presentations.forEach((pres) => {
      pres.slides.forEach((slide) => {
        if (slide.imageDetails) {
          items.push({
            id: `${pres.id}-s${slide.slideNumber}-img`,
            presentationId: pres.id,
            presentationTitle: pres.title,
            presentationTitleFr: pres.titleFr,
            specialty: pres.specialty,
            slideNumber: slide.slideNumber,
            slideTitle: slide.title,
            imageDetails: slide.imageDetails,
            presentation: pres,
          });
        }
      });
    });
    return items;
  }, [presentations]);

  // Modality counts
  const modalities = useMemo(() => {
    const counts: Record<string, number> = {};
    allImages.forEach((item) => {
      const mod = item.imageDetails.modality;
      counts[mod] = (counts[mod] || 0) + 1;
    });
    return counts;
  }, [allImages]);

  // Filtered images
  const filteredImages = useMemo(() => {
    return allImages.filter((item) => {
      const matchesModality =
        selectedModality === 'All' || item.imageDetails.modality === selectedModality;

      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesModality;

      const matchesSearch =
        item.imageDetails.caption.toLowerCase().includes(q) ||
        item.imageDetails.modality.toLowerCase().includes(q) ||
        item.slideTitle.toLowerCase().includes(q) ||
        item.specialty.toLowerCase().includes(q) ||
        item.imageDetails.annotations?.some(
          (ann) =>
            ann.label.toLowerCase().includes(q) ||
            ann.description.toLowerCase().includes(q)
        );

      return matchesModality && matchesSearch;
    });
  }, [allImages, selectedModality, searchQuery]);

  return (
    <div id="clinical-imaging-atlas" className="space-y-6">
      {/* Visual Header / Hero */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30">
                {lang === 'fr' ? 'Atlas d’Imagerie Médicale' : 'Clinical Imaging Atlas'}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {allImages.length} {lang === 'fr' ? 'Clichés diagnostiques' : 'Diagnostic Scans'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {lang === 'fr'
                ? 'Banque Visuelle & Diagnostic Haute Résolution'
                : 'High-Resolution Diagnostic & Pathology Repository'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {lang === 'fr'
                ? 'Explorez directement les électrocardiogrammes 12 dérivations, clichés radiographiques, échographies POCUS d’urgence et imageries tomodensitométriques avec repères annotés.'
                : 'Explore interactive 12-lead ECGs, trauma POCUS ultrasound scans, cross-sectional CT/MRIs, and histological slides with annotated diagnostic pathology hotspots.'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-center min-w-[90px]">
              <span className="block text-xl font-mono font-bold text-blue-400">{allImages.length}</span>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">
                {lang === 'fr' ? 'Images' : 'Scans'}
              </span>
            </div>
            <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-center min-w-[90px]">
              <span className="block text-xl font-mono font-bold text-emerald-400">
                {allImages.reduce((sum, item) => sum + (item.imageDetails.annotations?.length || 0), 0)}
              </span>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">
                {lang === 'fr' ? 'Repères' : 'Hotspots'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              lang === 'fr'
                ? 'Rechercher un cliché (ex: Steeple, Morison, ST, ECG)...'
                : 'Search visual atlas (e.g. ECG, Morison pouch, Steeple sign, MRI)...'
            }
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-100 border border-transparent text-slate-800 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>

        {/* Modality Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
          <button
            type="button"
            onClick={() => setSelectedModality('All')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedModality === 'All'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            {lang === 'fr' ? 'Tous' : 'All'} ({allImages.length})
          </button>
          {Object.entries(modalities).map(([modality, count]) => (
            <button
              key={modality}
              type="button"
              onClick={() => setSelectedModality(modality)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedModality === modality
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {modality} ({count})
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Clinical Visual Scans */}
      {filteredImages.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <ImageIcon className="w-10 h-10 text-slate-400 mx-auto" />
          <h4 className="text-base font-bold text-slate-800">
            {lang === 'fr' ? 'Aucune image trouvée' : 'No clinical scans matched your filter'}
          </h4>
          <p className="text-xs text-slate-500">
            {lang === 'fr'
              ? 'Modifiez votre terme de recherche ou sélectionnez une autre modalité.'
              : 'Try selecting a different modality or clearing your search keywords.'}
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedModality('All');
            }}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-blue-600 text-xs font-semibold"
          >
            {lang === 'fr' ? 'Réinitialiser' : 'Reset Atlas'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredImages.map((item) => {
            const hasAnnotations = (item.imageDetails.annotations?.length || 0) > 0;
            const title =
              lang === 'fr' && item.presentationTitleFr
                ? item.presentationTitleFr
                : item.presentationTitle;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-blue-300 shadow-xs hover:shadow-md transition-all flex flex-col overflow-hidden group"
              >
                {/* Visual Image Container */}
                <div className="relative h-52 w-full bg-slate-950 overflow-hidden cursor-pointer"
                  onClick={() => setActiveInspectingItem(item)}
                >
                  <img
                    src={item.imageDetails.url}
                    alt={item.imageDetails.caption}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-600 text-white shadow-xs uppercase tracking-wider">
                      {item.imageDetails.modality}
                    </span>
                    <span className="px-2 py-1 rounded-md text-[10px] font-semibold bg-slate-900/80 backdrop-blur text-slate-200">
                      Slide {item.slideNumber}
                    </span>
                  </div>

                  {hasAnnotations && (
                    <div className="absolute top-3 right-3">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500 text-slate-950 shadow-xs flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        <span>{item.imageDetails.annotations?.length} Hotspots</span>
                      </span>
                    </div>
                  )}

                  {/* Hover Inspect Overlay */}
                  <div className="absolute inset-0 bg-blue-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white pointer-events-none">
                    <div className="px-3.5 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur text-xs font-bold shadow-md flex items-center gap-1.5">
                      <ZoomIn className="w-4 h-4 text-blue-400" />
                      <span>{lang === 'fr' ? 'Inspecter en Haute Résolution' : 'Interactive Zoom & Annotations'}</span>
                    </div>
                  </div>

                  {/* Bottom Caption Overlay */}
                  <div className="absolute bottom-2 left-3 right-3 pointer-events-none">
                    <p className="text-[11px] text-slate-200 font-medium line-clamp-1">
                      {item.imageDetails.caption}
                    </p>
                  </div>
                </div>

                {/* Card Meta Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span className="font-semibold text-blue-700">{item.specialty}</span>
                      <span>•</span>
                      <span className="truncate">{title}</span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2">
                      {item.slideTitle}
                    </h4>

                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                      {item.imageDetails.caption}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveInspectingItem(item)}
                      className="flex-1 py-1.5 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5 text-blue-600" />
                      <span>{lang === 'fr' ? 'Zoom & Diagnostic' : 'Inspect Scan'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenPresentationSlide(item.presentation, item.slideNumber)}
                      className="py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1"
                      title={lang === 'fr' ? 'Voir dans la présentation' : 'Open Slide in Deck'}
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{lang === 'fr' ? 'Module' : 'Slide'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Inspector for Full-Screen Scan Review */}
      {activeInspectingItem && (
        <div
          id="atlas-scan-inspector-modal"
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
        >
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col my-auto max-h-[95vh]">
            {/* Modal Toolbar */}
            <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="px-2.5 py-0.5 rounded font-mono font-bold text-xs bg-blue-600 text-white uppercase">
                  {activeInspectingItem.imageDetails.modality}
                </span>
                <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                  {activeInspectingItem.imageDetails.caption}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const pres = activeInspectingItem.presentation;
                    const slideNum = activeInspectingItem.slideNumber;
                    setActiveInspectingItem(null);
                    onOpenPresentationSlide(pres, slideNum);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{lang === 'fr' ? 'Ouvrir le Module' : 'Open in Deck'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveInspectingItem(null)}
                  className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Interactive Image Viewer */}
            <div className="p-4 sm:p-6 overflow-y-auto bg-slate-100 flex-1 space-y-4">
              <MedicalImageViewer image={activeInspectingItem.imageDetails} lang={lang} />

              <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                  <span>Specialty: {activeInspectingItem.specialty}</span>
                  <span>Slide {activeInspectingItem.slideNumber} of {activeInspectingItem.presentation.slides.length}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  {activeInspectingItem.slideTitle}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {activeInspectingItem.imageDetails.caption}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
