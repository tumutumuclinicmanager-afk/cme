import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  BookOpen,
  Award,
  Clock,
  Download,
  FileSpreadsheet,
  Layers,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Eye,
  Check,
  RefreshCw,
  FolderUp,
} from 'lucide-react';
import {
  Presentation,
  PresentationSlide,
  MedicalSpecialty,
  Language,
  QuizQuestion,
} from '../types';
import { specialtyTranslations } from '../translations';
import {
  parsePPTXFile,
  generateQuizForPresentation,
  ParsedPPTResult,
} from '../utils/pptxParser';
import {
  SAMPLE_MS_POWERPOINT,
  SAMPLE_WPS_POWERPOINT,
  generateSamplePptxBlob,
} from '../utils/samplePptx';

interface PptUploadSectionProps {
  lang: Language;
  onAddNewPresentation: (newPres: Presentation) => void;
  onViewPresentation?: (pres: Presentation) => void;
  onCancel?: () => void;
}

export const PptUploadSection: React.FC<PptUploadSectionProps> = ({
  lang,
  onAddNewPresentation,
  onViewPresentation,
  onCancel,
}) => {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [parseStatus, setParseStatus] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Extracted Result State
  const [extractedData, setExtractedData] = useState<ParsedPPTResult | null>(null);

  // Editable fields before publishing
  const [title, setTitle] = useState<string>('');
  const [specialty, setSpecialty] = useState<MedicalSpecialty>('Cardiology');
  const [facultyAuthor, setFacultyAuthor] = useState<string>('Dr. Bonny, MD, FCP');
  const [institution, setInstitution] = useState<string>('Tumutumu Medical Centre');
  const [cmeCredits, setCmeCredits] = useState<number>(2.0);
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(45);
  const [summary, setSummary] = useState<string>('');
  const [isFree, setIsFree] = useState<boolean>(true);
  const [priceKes, setPriceKes] = useState<number>(500);
  const [slides, setSlides] = useState<PresentationSlide[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);

  // UI state
  const [expandedSlideIndex, setExpandedSlideIndex] = useState<number | null>(0);
  const [publishedPresentation, setPublishedPresentation] = useState<Presentation | null>(null);
  const [isDownloadingSample, setIsDownloadingSample] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProcessFile = async (file: File) => {
    setIsParsing(true);
    setErrorMessage(null);
    setPublishedPresentation(null);
    setParseStatus(
      lang === 'fr'
        ? 'Lecture de la structure du fichier PowerPoint...'
        : 'Analyzing PowerPoint OpenXML archive structure...'
    );

    try {
      // Small visual delay for smooth experience
      await new Promise((resolve) => setTimeout(resolve, 350));
      setParseStatus(
        lang === 'fr'
          ? 'Extraction des diapositives, notes et médias...'
          : 'Extracting slides, speaker notes, and clinical media...'
      );

      const result = await parsePPTXFile(file);

      setTitle(result.title);
      setSpecialty(result.specialty);
      setFacultyAuthor(result.author || 'Dr. Bonny, MD');
      setInstitution(result.institution || 'Tumutumu Medical Centre');
      setSummary(result.summary);
      setSlides(result.slides);

      // Auto-calculate credits & minutes based on slide count
      const computedMins = Math.max(20, Math.min(120, result.slides.length * 5));
      setEstimatedMinutes(computedMins);
      const computedCredits = Math.max(1.0, Math.min(5.0, Number((result.slides.length * 0.5).toFixed(1))));
      setCmeCredits(computedCredits);

      // Auto-generate 3-question CME evaluation quiz
      const generatedQuiz = generateQuizForPresentation(result.title, result.specialty, result.slides);
      setQuizQuestions(generatedQuiz);

      setExtractedData(result);
    } catch (err: any) {
      console.error('Error parsing presentation file:', err);
      setErrorMessage(
        err?.message ||
          (lang === 'fr'
            ? 'Impossible de lire ce fichier de présentation. Vérifiez qu’il s’agit d’un fichier .pptx ou .ppt valide.'
            : 'Could not parse presentation file. Please ensure it is a valid .pptx or .ppt file created in PowerPoint or WPS Office.')
      );
    } finally {
      setIsParsing(false);
      setParseStatus('');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  // Demo generators
  const handleLoadDemo = async (demoType: 'ms-powerpoint' | 'wps-presentation') => {
    setIsParsing(true);
    setErrorMessage(null);
    setParseStatus(
      demoType === 'wps-presentation'
        ? 'Generating & Parsing sample WPS Office Presentation (.pptx)...'
        : 'Generating & Parsing sample Microsoft PowerPoint (.pptx)...'
    );

    try {
      const demoOptions = demoType === 'wps-presentation' ? SAMPLE_WPS_POWERPOINT : SAMPLE_MS_POWERPOINT;
      const blob = await generateSamplePptxBlob(demoOptions);
      const fileName =
        demoType === 'wps-presentation'
          ? 'Pediatric_Severe_Malaria_WPS.pptx'
          : 'Acute_Heart_Failure_MS_PowerPoint.pptx';
      const file = new File([blob], fileName, {
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      });
      await handleProcessFile(file);
    } catch (err: any) {
      console.error('Demo generation error', err);
      setErrorMessage('Failed to generate sample presentation demo.');
      setIsParsing(false);
    }
  };

  const handleDownloadSamplePptx = async (toolType: 'ms-powerpoint' | 'wps-presentation') => {
    setIsDownloadingSample(true);
    try {
      const demoOptions = toolType === 'wps-presentation' ? SAMPLE_WPS_POWERPOINT : SAMPLE_MS_POWERPOINT;
      const blob = await generateSamplePptxBlob(demoOptions);
      const fileName =
        toolType === 'wps-presentation'
          ? 'Sample_CME_WPS_Presentation.pptx'
          : 'Sample_CME_MS_PowerPoint.pptx';
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download sample error', err);
    } finally {
      setIsDownloadingSample(false);
    }
  };

  // Slide content editing
  const handleUpdateSlideTitle = (idx: number, newTitle: string) => {
    setSlides((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], title: newTitle };
      return updated;
    });
  };

  const handleUpdateSlideNotes = (idx: number, newNotes: string) => {
    setSlides((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], speakerNotes: newNotes };
      return updated;
    });
  };

  const handleUpdateSlideBullets = (idx: number, bulletsText: string) => {
    setSlides((prev) => {
      const updated = [...prev];
      updated[idx] = {
        ...updated[idx],
        contentBullets: bulletsText.split('\n').filter((b) => b.trim().length > 0),
      };
      return updated;
    });
  };

  const handleRemoveSlide = (idx: number) => {
    if (slides.length <= 1) return;
    setSlides((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAddBlankSlide = () => {
    const newSlideNum = slides.length + 1;
    const newSlide: PresentationSlide = {
      id: `slide-added-${Date.now()}-${newSlideNum}`,
      slideNumber: newSlideNum,
      title: `Clinical Topic ${newSlideNum}`,
      contentBullets: [
        'Guideline-directed diagnostic recommendations and assessment criteria.',
        'Immediate pharmacotherapy titration and inpatient monitoring parameters.',
      ],
      speakerNotes: 'Clinical notes: ensure standard precautions and review contraindications.',
      clinicalTakeaway: 'Strict protocol compliance prevents acute decompensation.',
    };
    setSlides((prev) => [...prev, newSlide]);
    setExpandedSlideIndex(slides.length);
  };

  // Final Publish Handler
  const handlePublish = () => {
    if (!title) return;

    const newPresentation: Presentation = {
      id: `cme-ppt-${Date.now()}`,
      title: title,
      specialty: specialty,
      cmeCredits: Number(cmeCredits),
      estimatedMinutes: Number(estimatedMinutes),
      facultyAuthor: facultyAuthor || 'Dr. Bonny, MD',
      institution: institution || 'Tumutumu Medical Centre',
      summary: summary || title,
      learningObjectives: [
        `Understand hallmark pathophysiology and diagnostic evaluation for ${title}`,
        'Apply current evidence-based clinical practice guidelines in hospital settings',
        'Demonstrate competency in emergency pharmacotherapy and patient follow-up',
      ],
      slides: slides.map((s, idx) => ({ ...s, slideNumber: idx + 1 })),
      quiz: quizQuestions,
      isFree: isFree,
      priceKes: isFree ? 0 : Number(priceKes),
      publishedDate: new Date().toISOString().split('T')[0],
      thumbnailUrl:
        slides.find((s) => s.imageUrl)?.imageUrl ||
        'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
      level: 'Advanced',
      sourceFileName: extractedData?.fileName || 'presentation.pptx',
      sourceFileType: extractedData?.detectedTool || 'ms-powerpoint',
      sourceFileSize: extractedData?.fileSizeBytes,
      sourceFileBlobUrl: extractedData?.rawBlobUrl,
    };

    onAddNewPresentation(newPresentation);
    setPublishedPresentation(newPresentation);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-8 space-y-8 animate-fade-in text-slate-800">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <FolderUp className="w-3.5 h-3.5" />
              {lang === 'fr' ? 'Importation PowerPoint' : 'PowerPoint Uploader'}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
              MS PowerPoint & WPS Presentation (.pptx / .ppt)
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {lang === 'fr'
              ? 'Mettre en Ligne une Présentation PowerPoint / WPS'
              : 'Upload PowerPoint Presentation (MS PPT & WPS)'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            {lang === 'fr'
              ? 'Importez directement des présentations créées avec Microsoft PowerPoint (.pptx, .ppt) ou WPS Office (.pptx, .dps). Les diapositives, puces, notes d’orateur et médias diagnostiques sont automatiquement extraits dans le format de formation médicale continue interactive.'
              : 'Upload existing medical slide decks designed in Microsoft PowerPoint (.pptx, .ppt) or WPS Office Presentation (.pptx, .dps). Slides, clinical concepts, speaker notes, and diagnostic media are automatically converted into interactive accredited CME modules.'}
          </p>
        </div>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="self-start md:self-auto px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            {lang === 'fr' ? 'Annuler' : 'Back to Dashboard'}
          </button>
        )}
      </div>

      {/* 2. Success Banner if just published */}
      {publishedPresentation && (
        <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-4 animate-fade-in shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-emerald-950">
                {lang === 'fr'
                  ? 'Présentation Publiée avec Succès !'
                  : 'PowerPoint Module Successfully Published to Catalog!'}
              </h3>
              <p className="text-xs sm:text-sm text-emerald-800">
                {lang === 'fr'
                  ? `« ${publishedPresentation.title} » est désormais accessible aux cliniciens avec ses ${publishedPresentation.slides.length} diapositives et son quiz d'évaluation.`
                  : `"${publishedPresentation.title}" is now live in the CME course catalog with ${publishedPresentation.slides.length} interactive slides, clinical notes, and post-module self-evaluation.`}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {onViewPresentation && (
              <button
                type="button"
                onClick={() => onViewPresentation(publishedPresentation)}
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
              >
                <Eye className="w-4 h-4" />
                <span>{lang === 'fr' ? 'Visualiser les Diapositives' : 'Preview Interactive Slides'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setExtractedData(null);
                setPublishedPresentation(null);
              }}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-emerald-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <Upload className="w-4 h-4 text-emerald-600" />
              <span>{lang === 'fr' ? 'Mettre en ligne un autre fichier' : 'Upload Another PPT File'}</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Drag & Drop Upload Zone (Shown if not yet published or wanting to replace) */}
      {!publishedPresentation && !extractedData && (
        <div className="space-y-6">
          {/* Supported Tools Highlight Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-orange-50/70 border border-orange-200/80 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                P
              </div>
              <div className="space-y-1 text-xs">
                <span className="font-bold text-orange-950 text-sm flex items-center gap-1.5">
                  Microsoft PowerPoint
                  <span className="text-[10px] px-2 py-0.5 rounded bg-orange-200/70 text-orange-900 font-mono">
                    .pptx / .ppt
                  </span>
                </span>
                <p className="text-orange-900/80 leading-relaxed">
                  Full XML support for slides, titles, body paragraphs, speaker notes, and embedded high-resolution graphics.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                W
              </div>
              <div className="space-y-1 text-xs">
                <span className="font-bold text-blue-950 text-sm flex items-center gap-1.5">
                  WPS Office Presentation
                  <span className="text-[10px] px-2 py-0.5 rounded bg-blue-200/70 text-blue-900 font-mono">
                    .pptx / .dps
                  </span>
                </span>
                <p className="text-blue-900/80 leading-relaxed">
                  Native support for WPS Presentation decks exported as modern .pptx or WPS document packages with full slide mapping.
                </p>
              </div>
            </div>
          </div>

          {/* Drag & Drop Card */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all ${
              isDragging
                ? 'border-blue-500 bg-blue-50/50 scale-[1.01]'
                : 'border-slate-300 hover:border-blue-400 bg-slate-50/60 hover:bg-slate-50'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pptx,.ppt,.dps,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.ms-powerpoint"
              className="hidden"
            />

            <div className="max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-md transform transition-transform hover:scale-105">
                <Upload className="w-8 h-8" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  {lang === 'fr'
                    ? 'Glissez-déposez votre présentation ici'
                    : 'Drag & Drop your PowerPoint presentation here'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  {lang === 'fr'
                    ? 'ou cliquez pour parcourir vos fichiers (.pptx, .ppt, .dps)'
                    : 'or click to browse from your computer (.pptx, .ppt, .dps)'}
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 pt-2">
                <span className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 text-xs font-medium shadow-2xs">
                  Microsoft PowerPoint (.pptx)
                </span>
                <span className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 text-xs font-medium shadow-2xs">
                  WPS Presentation (.pptx)
                </span>
              </div>
            </div>
          </div>

          {/* Parsing State */}
          {isParsing && (
            <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200 flex items-center gap-4 animate-pulse">
              <RefreshCw className="w-6 h-6 text-blue-600 animate-spin shrink-0" />
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-blue-950">
                  {lang === 'fr' ? 'Analyse du fichier en cours...' : 'Processing PowerPoint Deck...'}
                </h4>
                <p className="text-xs text-blue-700">{parseStatus}</p>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold">Error importing presentation:</span>
                <p>{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Demo Presets & Templates */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                {lang === 'fr' ? 'Tester avec un fichier de démonstration' : 'Test With Instant Demo Presentations'}
              </span>
              <span className="text-[11px] text-slate-400">1-Click Automated Extraction</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleLoadDemo('ms-powerpoint')}
                className="p-3.5 rounded-2xl bg-slate-50 hover:bg-orange-50/50 border border-slate-200 hover:border-orange-300 text-left transition-all group flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                    P
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-orange-950">
                      Sample MS PowerPoint Deck
                    </div>
                    <div className="text-[11px] text-slate-500 truncate max-w-[200px]">
                      Acute Heart Failure & Inotropic Support
                    </div>
                  </div>
                </div>
                <span className="text-xs font-bold text-orange-600 group-hover:underline">
                  Try Demo →
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleLoadDemo('wps-presentation')}
                className="p-3.5 rounded-2xl bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-300 text-left transition-all group flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                    W
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-blue-950">
                      Sample WPS Presentation Deck
                    </div>
                    <div className="text-[11px] text-slate-500 truncate max-w-[200px]">
                      Pediatric Severe Malaria & IV Artesunate
                    </div>
                  </div>
                </div>
                <span className="text-xs font-bold text-blue-600 group-hover:underline">
                  Try Demo →
                </span>
              </button>
            </div>

            <div className="flex items-center justify-center gap-4 pt-1 text-xs text-slate-500">
              <span>{lang === 'fr' ? 'Besoin d’un modèle ?' : 'Want to test with your desktop app?'}</span>
              <button
                type="button"
                disabled={isDownloadingSample}
                onClick={() => handleDownloadSamplePptx('ms-powerpoint')}
                className="font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Sample MS PowerPoint (.pptx)</span>
              </button>
              <span>•</span>
              <button
                type="button"
                disabled={isDownloadingSample}
                onClick={() => handleDownloadSamplePptx('wps-presentation')}
                className="font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Sample WPS (.pptx)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Extracted Presentation Review & Customizer */}
      {!publishedPresentation && extractedData && (
        <div className="space-y-8 animate-fade-in">
          {/* Extraction Confirmation Bar */}
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs ${
                  extractedData.detectedTool === 'wps-presentation' ? 'bg-blue-600' : 'bg-orange-600'
                }`}
              >
                {extractedData.detectedTool === 'wps-presentation' ? 'W' : 'P'}
              </div>
              <div>
                <span className="font-bold text-emerald-950 text-sm flex items-center gap-2">
                  {extractedData.detectedTool === 'wps-presentation'
                    ? 'WPS Presentation Extracted'
                    : 'Microsoft PowerPoint Extracted'}
                  <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-200/70 text-emerald-900 font-mono font-normal">
                    {extractedData.fileName} ({(extractedData.fileSizeBytes / 1024).toFixed(1)} KB)
                  </span>
                </span>
                <p className="text-emerald-800 text-[11px]">
                  Successfully identified {slides.length} slides with content paragraphs, speaker notes, and clinical takeaways.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setExtractedData(null);
                setPublishedPresentation(null);
              }}
              className="self-start sm:self-auto px-3 py-1.5 rounded-lg bg-white border border-emerald-200 text-slate-700 hover:bg-slate-50 font-semibold transition-colors flex items-center gap-1 shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span>{lang === 'fr' ? 'Changer de fichier' : 'Upload Different File'}</span>
            </button>
          </div>

          {/* Warnings or Tips */}
          {extractedData.warnings && extractedData.warnings.length > 0 && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-amber-800">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                Format Notice:
              </div>
              {extractedData.warnings.map((w, i) => (
                <p key={i} className="text-amber-700 leading-relaxed">
                  {w}
                </p>
              ))}
            </div>
          )}

          {/* Module Core Metadata Fields */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              1. CME Course Information & Accreditation
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Presentation Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Medical Specialty
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
                  Faculty Author / Presenter
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
                  Medical Institution
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
                    CME Credits
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="10"
                    value={cmeCredits}
                    onChange={(e) => setCmeCredits(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Estimated Duration (Mins)
                  </label>
                  <input
                    type="number"
                    step="5"
                    min="10"
                    value={estimatedMinutes}
                    onChange={(e) => setEstimatedMinutes(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Course Synopsis & Clinical Summary
                </label>
                <textarea
                  rows={2}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Pricing Section */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Access Pricing:
                </span>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium">
                  <input
                    type="radio"
                    name="ppt-pricing"
                    checked={isFree}
                    onChange={() => setIsFree(true)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span>Free Tier (First 3 Modules)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium">
                  <input
                    type="radio"
                    name="ppt-pricing"
                    checked={!isFree}
                    onChange={() => setIsFree(false)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span>Paid Module (M-Pesa STK Push)</span>
                </label>
              </div>

              {!isFree && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Amount:</span>
                  <input
                    type="number"
                    step="50"
                    min="100"
                    value={priceKes}
                    onChange={(e) => setPriceKes(parseInt(e.target.value, 10))}
                    className="w-28 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 font-mono font-bold text-xs focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-xs font-mono font-bold text-slate-700">KES</span>
                </div>
              )}
            </div>
          </div>

          {/* 5. Slides Editor Accordion */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                2. Extracted Slides ({slides.length})
              </h3>

              <button
                type="button"
                onClick={handleAddBlankSlide}
                className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Extra Slide</span>
              </button>
            </div>

            <div className="space-y-3">
              {slides.map((slide, idx) => {
                const isExpanded = expandedSlideIndex === idx;

                return (
                  <div
                    key={slide.id || idx}
                    className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs transition-all"
                  >
                    {/* Slide Row Header */}
                    <div
                      onClick={() => setExpandedSlideIndex(isExpanded ? null : idx)}
                      className="px-4 py-3 bg-slate-50 hover:bg-slate-100/80 cursor-pointer flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-[11px] shrink-0 font-mono">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-slate-900 truncate text-sm">
                          {slide.title}
                        </span>
                        <span className="text-[11px] text-slate-500 shrink-0 hidden sm:inline">
                          ({slide.contentBullets.length} bullets
                          {slide.speakerNotes ? ' • notes included' : ''}
                          {slide.imageUrl ? ' • image included' : ''})
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveSlide(idx);
                          }}
                          disabled={slides.length <= 1}
                          className="p-1 rounded text-slate-400 hover:text-red-600 disabled:opacity-30 transition-colors"
                          title="Remove slide"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-500" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-500" />
                        )}
                      </div>
                    </div>

                    {/* Slide Expanded Content */}
                    {isExpanded && (
                      <div className="p-4 sm:p-5 space-y-4 text-xs border-t border-slate-200">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            Slide Title
                          </label>
                          <input
                            type="text"
                            value={slide.title}
                            onChange={(e) => handleUpdateSlideTitle(idx, e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            Bullet Points (one per line)
                          </label>
                          <textarea
                            rows={4}
                            value={slide.contentBullets.join('\n')}
                            onChange={(e) => handleUpdateSlideBullets(idx, e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 font-mono leading-relaxed"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            Speaker Notes & Clinical Pearls
                          </label>
                          <textarea
                            rows={2}
                            value={slide.speakerNotes}
                            onChange={(e) => handleUpdateSlideNotes(idx, e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 leading-relaxed"
                          />
                        </div>

                        {slide.imageUrl && (
                          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                            <img
                              src={slide.imageUrl}
                              alt={slide.title}
                              className="w-16 h-12 object-cover rounded-lg border border-slate-300"
                            />
                            <div className="text-[11px] text-slate-600">
                              <span className="font-bold text-slate-800 block">
                                Embedded Image Extracted
                              </span>
                              <span>Extracted from PowerPoint media archive.</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 6. Post-Module Assessment Quiz */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" />
              3. Auto-Generated CME Quiz ({quizQuestions.length} Questions)
            </h3>

            <div className="space-y-3 text-xs">
              {quizQuestions.map((q, qIdx) => (
                <div
                  key={q.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2"
                >
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span>Question {qIdx + 1}:</span>
                    <span className="text-[11px] text-blue-600 font-medium">
                      Pass Threshold: 70%
                    </span>
                  </div>
                  <p className="font-semibold text-slate-900 text-xs sm:text-sm">{q.vignette}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {q.options.map((opt, optIdx) => (
                      <div
                        key={optIdx}
                        className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
                          optIdx === q.correctAnswerIndex
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-medium'
                            : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                            optIdx === q.correctAnswerIndex
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className="truncate">{opt}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-500 pt-1 italic">
                    Rationale: {q.rationale}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 7. Bottom Action Bar */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500">
              <span>Ready to publish </span>
              <strong className="text-slate-900">{slides.length} slides</strong>
              <span> with </span>
              <strong className="text-slate-900">{cmeCredits} CME Credits</strong>.
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setExtractedData(null)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              >
                Cancel & Re-upload
              </button>

              <button
                type="button"
                onClick={handlePublish}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Publish Presentation to CME Catalog</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
