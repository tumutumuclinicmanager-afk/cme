import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Trash2,
  Image as ImageIcon,
  Video,
  Award,
  Upload,
  Layers,
  HelpCircle,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eye,
  ChevronRight,
  Crosshair,
  FileText,
  DollarSign,
} from 'lucide-react';
import {
  Presentation,
  Language,
  MedicalSpecialty,
  PresentationSlide,
  QuizQuestion,
  SlideImage,
  SlideImageAnnotation,
} from '../types';
import { specialtyTranslations } from '../translations';

interface PresentationCreatorProps {
  lang: Language;
  onSavePresentation: (presentation: Presentation) => void;
  onCancel: () => void;
}

const PRESET_COVERS = [
  {
    label: 'Emergency / Trauma Ultrasound',
    url: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Coronary Angiography & Cardiology',
    url: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Pediatric Radiography & Inpatient Care',
    url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Neurology / Brain CT & Stroke',
    url: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Dermatology & Clinical Photography',
    url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Obstetrics & Fetal Biometry',
    url: 'https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&w=1200&q=80',
  },
];

const PRESET_DIAGNOSTIC_IMAGES = [
  {
    title: 'Focused Assessment with Sonography in Trauma (FAST)',
    modality: 'Ultrasound' as const,
    url: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80',
    caption: 'Longitudinal view of Right Upper Quadrant (Morison pouch) showing anechoic free fluid strip.',
  },
  {
    title: 'Coronary Angiography - Proximal LAD Stenosis',
    modality: 'Angiography' as const,
    url: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&w=1200&q=80',
    caption: 'Right Anterior Oblique (RAO) cranial fluoroscopy demonstrating 95% proximal LAD stenosis.',
  },
  {
    title: 'Pediatric Frontal Chest Radiograph',
    modality: 'X-Ray' as const,
    url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80',
    caption: 'Anteroposterior view exhibiting right middle lobe lobar consolidation with air bronchograms.',
  },
  {
    title: 'Non-Contrast Brain CT - Hyperdense MCA Sign',
    modality: 'CT Scan' as const,
    url: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=1200&q=80',
    caption: 'Axial slice showing attenuation loss in right insular ribbon with early ischemic changes.',
  },
];

export const PresentationCreator: React.FC<PresentationCreatorProps> = ({
  lang,
  onSavePresentation,
  onCancel,
}) => {
  // Step navigation: 1 = Metadata, 2 = Slides, 3 = Quiz, 4 = Review
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  const [formError, setFormError] = useState<string | null>(null);

  // 1. General Metadata
  const [title, setTitle] = useState<string>('');
  const [titleFr, setTitleFr] = useState<string>('');
  const [specialty, setSpecialty] = useState<MedicalSpecialty>('Emergency Medicine');
  const [facultyAuthor, setFacultyAuthor] = useState<string>('Dr. Bonny, MD, FCP');
  const [institution, setInstitution] = useState<string>('Tumutumu Mission Hospital & Medical Centre');
  const [cmeCredits, setCmeCredits] = useState<number>(2.0);
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(45);
  const [level, setLevel] = useState<'Core' | 'Advanced' | 'Specialist'>('Core');
  const [summary, setSummary] = useState<string>('');
  const [objectivesText, setObjectivesText] = useState<string>(
    '1. Recognize critical bedside clinical signs and diagnostic algorithms.\n2. Formulate immediate evidence-based stabilization protocols.\n3. Execute post-intervention follow-up and monitoring metrics.'
  );
  const [isFree, setIsFree] = useState<boolean>(true);
  const [priceKes, setPriceKes] = useState<number>(500);
  const [thumbnailUrl, setThumbnailUrl] = useState<string>(PRESET_COVERS[0].url);

  // 2. Slides State
  const [slides, setSlides] = useState<
    Array<{
      id: string;
      slideNumber: number;
      title: string;
      subtitle: string;
      contentBulletsText: string;
      speakerNotes: string;
      clinicalTakeaway: string;
      videoUrl: string;
      hasImage: boolean;
      imageUrl: string;
      imageModality: SlideImage['modality'];
      imageCaption: string;
      annotations: SlideImageAnnotation[];
    }>
  >([
    {
      id: 'slide-1',
      slideNumber: 1,
      title: 'Clinical Presentation & Initial Triage',
      subtitle: 'Pathophysiology & Rapid Bedside Evaluation',
      contentBulletsText:
        'Rapid initial assessment of airway, breathing, and circulatory parameters.\nBedside diagnostic confirmation within 10 minutes of admission.\nEarly initiation of targeted guideline-directed pharmacotherapy.',
      speakerNotes:
        'Emphasize the importance of timely baseline clinical documentation and protocol adherence.',
      clinicalTakeaway: 'Early identification reduces morbidity and in-hospital mortality.',
      videoUrl: '',
      hasImage: true,
      imageUrl: PRESET_DIAGNOSTIC_IMAGES[0].url,
      imageModality: 'Ultrasound',
      imageCaption: PRESET_DIAGNOSTIC_IMAGES[0].caption,
      annotations: [
        {
          id: 'ann-1',
          xPercent: 54,
          yPercent: 46,
          label: 'Pathology Site',
          description: 'Acutely altered tissue density or acoustic acoustic shadow.',
        },
      ],
    },
    {
      id: 'slide-2',
      slideNumber: 2,
      title: 'Diagnostic Imaging & Pathognomonic Signs',
      subtitle: 'Correlative Imaging and Caliper Measurements',
      contentBulletsText:
        'High-resolution imaging confirmation with calibrated anatomical evaluation.\nDifferential diagnosis and risk stratification based on biomarker kinetics.\nExclusion of critical mimicking conditions.',
      speakerNotes:
        'Compare baseline scans with post-treatment imaging to monitor recovery and complication rate.',
      clinicalTakeaway: 'Always correlate diagnostic imaging findings with patient hemodynamics.',
      videoUrl: '',
      hasImage: true,
      imageUrl: PRESET_DIAGNOSTIC_IMAGES[1].url,
      imageModality: 'Angiography',
      imageCaption: PRESET_DIAGNOSTIC_IMAGES[1].caption,
      annotations: [],
    },
  ]);

  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);

  // 3. Quiz State
  const [quizQuestions, setQuizQuestions] = useState<
    Array<{
      id: string;
      vignette: string;
      options: [string, string, string, string];
      correctAnswerIndex: number;
      rationale: string;
      referenceGuideline: string;
    }>
  >([
    {
      id: 'q-1',
      vignette:
        'A 48-year-old patient presents with acute diagnostic features detailed in the module. Which of the following represents the guideline-directed first-line intervention?',
      options: [
        'Immediate initiation of evidence-based pharmacotherapy and close monitoring',
        'Watchful waiting without pharmacological intervention',
        'Delayed referral for elective non-targeted procedures',
        'Routine high-dose empirical therapy outside clinical protocols',
      ],
      correctAnswerIndex: 0,
      rationale:
        'Current clinical guidelines strongly recommend prompt targeted first-line therapy to optimize clinical outcomes and prevent acute decompensation.',
      referenceGuideline: 'Ministry of Health & KMPDC Clinical Guidelines 2026',
    },
  ]);

  // Handle local file upload for cover image
  const handleCoverFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setThumbnailUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle local file upload for current slide image
  const handleSlideImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        updateActiveSlide({ imageUrl: reader.result, hasImage: true });
      }
    };
    reader.readAsDataURL(file);
  };

  // Slide helper functions
  const updateActiveSlide = (
    fields: Partial<(typeof slides)[0]>
  ) => {
    setSlides((prev) =>
      prev.map((s, idx) => (idx === activeSlideIndex ? { ...s, ...fields } : s))
    );
  };

  const handleAddSlide = () => {
    const newSlideNumber = slides.length + 1;
    const newSlide = {
      id: `slide-${Date.now()}`,
      slideNumber: newSlideNumber,
      title: `Clinical Topic ${newSlideNumber}`,
      subtitle: 'Guideline Protocol & Decision Matrix',
      contentBulletsText:
        'Step 1: Clinical assessment and diagnostic triage\nStep 2: Evidence-based pharmacological intervention\nStep 3: Monitoring and follow-up criteria',
      speakerNotes: 'Key instructional guidance and clinical pearls for faculty presentation.',
      clinicalTakeaway: 'Adherence to protocol ensures consistent standard of care.',
      videoUrl: '',
      hasImage: false,
      imageUrl: PRESET_DIAGNOSTIC_IMAGES[0].url,
      imageModality: 'Ultrasound' as SlideImage['modality'],
      imageCaption: 'Bedside diagnostic study demonstrating clinical parameters.',
      annotations: [],
    };
    setSlides([...slides, newSlide]);
    setActiveSlideIndex(slides.length);
  };

  const handleRemoveSlide = (indexToRemove: number) => {
    if (slides.length <= 1) {
      alert('A presentation must contain at least 1 slide.');
      return;
    }
    const updated = slides
      .filter((_, idx) => idx !== indexToRemove)
      .map((s, idx) => ({ ...s, slideNumber: idx + 1 }));
    setSlides(updated);
    setActiveSlideIndex(Math.max(0, indexToRemove - 1));
  };

  // Add Annotation on current slide image
  const handleAddAnnotationToSlide = () => {
    const current = slides[activeSlideIndex];
    const newAnnotation: SlideImageAnnotation = {
      id: `ann-${Date.now()}`,
      xPercent: 50,
      yPercent: 50,
      label: 'Clinical Finding',
      description: 'Diagnostic landmark or pathological feature observed on scan.',
    };
    updateActiveSlide({
      annotations: [...current.annotations, newAnnotation],
    });
  };

  const handleUpdateAnnotation = (
    annIndex: number,
    field: keyof SlideImageAnnotation,
    val: string | number
  ) => {
    const current = slides[activeSlideIndex];
    const updated = current.annotations.map((ann, idx) =>
      idx === annIndex ? { ...ann, [field]: val } : ann
    );
    updateActiveSlide({ annotations: updated });
  };

  const handleRemoveAnnotation = (annIndex: number) => {
    const current = slides[activeSlideIndex];
    updateActiveSlide({
      annotations: current.annotations.filter((_, idx) => idx !== annIndex),
    });
  };

  // Quiz helper functions
  const handleAddQuizQuestion = () => {
    const newQ = {
      id: `q-${Date.now()}`,
      vignette:
        'A patient presents for routine follow-up after the initial stabilization protocol. Which diagnostic parameter confirms treatment efficacy?',
      options: [
        'Normalization of hemodynamic parameters and clinical resolution',
        'Persistence of initial abnormal values without clinical change',
        'Unexplained acute worsening of laboratory indices',
        'Premature cessation of required therapy without monitoring',
      ] as [string, string, string, string],
      correctAnswerIndex: 0,
      rationale:
        'Therapeutic success is objectively confirmed by resolution of clinical symptoms and normalization of physiologic biomarkers.',
      referenceGuideline: 'Clinical Practice Guidelines 2026',
    };
    setQuizQuestions([...quizQuestions, newQ]);
  };

  const handleRemoveQuizQuestion = (qIndex: number) => {
    if (quizQuestions.length <= 1) {
      alert('A presentation must have at least one post-module quiz question.');
      return;
    }
    setQuizQuestions(quizQuestions.filter((_, idx) => idx !== qIndex));
  };

  // Final Publish Handler
  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError('Please provide a module title.');
      setActiveStep(1);
      return;
    }

    if (slides.length === 0) {
      setFormError('Please add at least 1 presentation slide.');
      setActiveStep(2);
      return;
    }

    if (quizQuestions.length === 0) {
      setFormError('Please add at least 1 quiz question for CME credit accreditation.');
      setActiveStep(3);
      return;
    }

    // Convert slides to PresentationSlide model
    const convertedSlides: PresentationSlide[] = slides.map((s, idx) => {
      const bullets = s.contentBulletsText
        .split('\n')
        .map((b) => b.trim())
        .filter((b) => b.length > 0);

      const slideItem: PresentationSlide = {
        id: s.id,
        slideNumber: idx + 1,
        title: s.title.trim() || `Slide ${idx + 1}`,
        subtitle: s.subtitle.trim() || undefined,
        contentBullets: bullets.length > 0 ? bullets : ['Key clinical teaching point.'],
        speakerNotes: s.speakerNotes.trim() || 'Review the teaching objectives for this slide.',
        clinicalTakeaway: s.clinicalTakeaway.trim() || 'Ensure clinical correlation.',
        videoUrl: s.videoUrl.trim() || undefined,
      };

      if (s.hasImage && s.imageUrl) {
        slideItem.imageUrl = s.imageUrl;
        slideItem.imageDetails = {
          url: s.imageUrl,
          caption: s.imageCaption.trim() || s.title,
          modality: s.imageModality,
          annotations: s.annotations.length > 0 ? s.annotations : undefined,
        };
      }

      return slideItem;
    });

    // Convert quiz questions to QuizQuestion model
    const convertedQuiz: QuizQuestion[] = quizQuestions.map((q, idx) => ({
      id: q.id || `quiz-q-${idx + 1}`,
      vignette: q.vignette.trim(),
      options: [...q.options],
      correctAnswerIndex: q.correctAnswerIndex,
      rationale: q.rationale.trim() || 'Option A is the evidence-based recommendation.',
      referenceGuideline: q.referenceGuideline.trim() || undefined,
    }));

    const objectives = objectivesText
      .split('\n')
      .map((o) => o.trim())
      .filter((o) => o.length > 0);

    const newPres: Presentation = {
      id: `cme-user-${Date.now().toString(36)}`,
      title: title.trim(),
      titleFr: titleFr.trim() || undefined,
      specialty,
      cmeCredits: Number(cmeCredits) || 2.0,
      estimatedMinutes: Number(estimatedMinutes) || 45,
      facultyAuthor: facultyAuthor.trim() || 'Dr. Bonny',
      institution: institution.trim() || 'P.C.E.A. Tumutumu Hospital',
      summary: summary.trim() || title.trim(),
      learningObjectives:
        objectives.length > 0
          ? objectives
          : ['Understand diagnostic algorithms', 'Apply targeted management'],
      slides: convertedSlides,
      quiz: convertedQuiz,
      isFree,
      priceKes: isFree ? 0 : Number(priceKes) || 500,
      publishedDate: new Date().toISOString().split('T')[0],
      thumbnailUrl: thumbnailUrl.trim() || PRESET_COVERS[0].url,
      level,
      sourceFileType: 'manual',
    };

    onSavePresentation(newPres);
  };

  const curSlide = slides[activeSlideIndex];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in">
      {/* Top Banner */}
      <div className="p-5 sm:p-6 border-b border-slate-200 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/30 text-blue-200 border border-blue-400/40">
              CLINICAL CURRICULUM AUTHORING
            </span>
            <span className="text-xs text-slate-400">Accredited CME Module Builder</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white">
            {lang === 'fr' ? 'Créer & Publier une Présentation Médicale' : 'Post New Clinical CME Presentation'}
          </h3>
        </div>

        {/* Step Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-800/90 p-1 rounded-xl border border-slate-700">
          <button
            type="button"
            onClick={() => setActiveStep(1)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeStep === 1
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            1. Module Info
          </button>
          <button
            type="button"
            onClick={() => setActiveStep(2)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeStep === 2
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            2. Slides & Imaging ({slides.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveStep(3)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeStep === 3
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            3. CME Quiz ({quizQuestions.length})
          </button>
        </div>
      </div>

      {formError && (
        <div className="m-5 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{formError}</span>
        </div>
      )}

      {/* STEP 1: MODULE METADATA */}
      {activeStep === 1 && (
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Module Title (English) *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Bedside Point-of-Care Ultrasound in Trauma & Resuscitation"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Titre en Français (Optionnel)
              </label>
              <input
                type="text"
                placeholder="e.g. Échographie Clinique au Lit du Patient en Réanimation"
                value={titleFr}
                onChange={(e) => setTitleFr(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Specialty *
              </label>
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value as MedicalSpecialty)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
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
                Clinical Target Level
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as 'Core' | 'Advanced' | 'Specialist')}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="Core">Core (General Practitioners & Residents)</option>
                <option value="Advanced">Advanced (Hospitalists & Medical Officers)</option>
                <option value="Specialist">Specialist (Fellows & Consultants)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Faculty Author & Degrees
              </label>
              <input
                type="text"
                value={facultyAuthor}
                onChange={(e) => setFacultyAuthor(e.target.value)}
                placeholder="e.g. Dr. Bonny, MD, FCP"
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Academic Institution / Hospital
              </label>
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="e.g. Tumutumu Mission Hospital"
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Accredited CME Credits
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="10"
                  value={cmeCredits}
                  onChange={(e) => setCmeCredits(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs sm:text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Estimated Minutes
                </label>
                <input
                  type="number"
                  step="5"
                  min="10"
                  max="180"
                  value={estimatedMinutes}
                  onChange={(e) => setEstimatedMinutes(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Pricing */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-4">
              <div>
                <span className="block text-xs font-bold text-slate-800">
                  Access & Monetization
                </span>
                <span className="text-[11px] text-slate-500">
                  Choose free access or Safaricom M-Pesa unlock fee
                </span>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="radio"
                    checked={isFree}
                    onChange={() => setIsFree(true)}
                    className="text-blue-600"
                  />
                  <span>100% Free</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="radio"
                    checked={!isFree}
                    onChange={() => setIsFree(false)}
                    className="text-blue-600"
                  />
                  <span>M-Pesa</span>
                </label>
                {!isFree && (
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-mono text-slate-500">KES</span>
                    <input
                      type="number"
                      step="50"
                      min="100"
                      value={priceKes}
                      onChange={(e) => setPriceKes(parseInt(e.target.value, 10))}
                      className="w-20 px-2 py-1 rounded bg-white border border-slate-200 text-xs font-mono font-bold"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Clinical Summary / Educational Abstract
              </label>
              <textarea
                rows={2}
                placeholder="High-yield synopsis detailing clinical applicability and learning objectives..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Learning Objectives (One per line)
              </label>
              <textarea
                rows={3}
                value={objectivesText}
                onChange={(e) => setObjectivesText(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Thumbnail Cover Selector */}
            <div className="sm:col-span-2 space-y-2 pt-2 border-t border-slate-200">
              <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>Module Thumbnail Cover *</span>
                <span className="text-[11px] text-slate-500 font-normal">Select a curated medical cover or upload custom</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {PRESET_COVERS.map((cov, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setThumbnailUrl(cov.url)}
                    className={`relative rounded-xl overflow-hidden aspect-video border-2 transition-all group ${
                      thumbnailUrl === cov.url
                        ? 'border-blue-600 ring-2 ring-blue-500/30'
                        : 'border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    <img
                      src={cov.url}
                      alt={cov.label}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-slate-950/20 transition-colors flex items-end p-1.5">
                      <span className="text-[9px] text-white font-semibold leading-tight line-clamp-2">
                        {cov.label}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                <input
                  type="url"
                  placeholder="Or enter image URL: https://..."
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono"
                />
                <label className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer flex items-center justify-center gap-1.5 shrink-0">
                  <Upload className="w-3.5 h-3.5 text-blue-600" />
                  <span>Upload File</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => setActiveStep(2)}
              className="px-5 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
            >
              <span>Next: Build Slides & Imaging</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: SLIDES & IMAGING BUILDER */}
      {activeStep === 2 && (
        <div className="p-6 space-y-6">
          {/* Slide Deck Navigation Tabs */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2 border-b border-slate-200">
            <div className="flex items-center gap-1.5">
              {slides.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActiveSlideIndex(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                    activeSlideIndex === idx
                      ? 'bg-blue-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-white/20 text-center text-[10px] flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="max-w-[100px] truncate">{s.title || `Slide ${idx + 1}`}</span>
                  {s.hasImage && <ImageIcon className="w-3 h-3 text-emerald-400 shrink-0" />}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddSlide}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs flex items-center gap-1 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Slide</span>
            </button>
          </div>

          {/* Active Slide Form */}
          {curSlide && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column: Text & Content */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-900 font-mono">
                    Slide {activeSlideIndex + 1} of {slides.length}
                  </span>
                  {slides.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSlide(activeSlideIndex)}
                      className="text-xs text-red-600 hover:text-red-800 font-semibold flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove Slide</span>
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Slide Title *
                  </label>
                  <input
                    type="text"
                    value={curSlide.title}
                    onChange={(e) => updateActiveSlide({ title: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Slide Subtitle / Focus Area
                  </label>
                  <input
                    type="text"
                    value={curSlide.subtitle}
                    onChange={(e) => updateActiveSlide({ subtitle: e.target.value })}
                    className="w-full px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Clinical Bullet Points (One per line) *
                  </label>
                  <textarea
                    rows={4}
                    value={curSlide.contentBulletsText}
                    onChange={(e) => updateActiveSlide({ contentBulletsText: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-mono focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Faculty Speaker Notes
                    </label>
                    <textarea
                      rows={2}
                      value={curSlide.speakerNotes}
                      onChange={(e) => updateActiveSlide({ speakerNotes: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Clinical Key Takeaway
                    </label>
                    <textarea
                      rows={2}
                      value={curSlide.clinicalTakeaway}
                      onChange={(e) => updateActiveSlide({ clinicalTakeaway: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Video URL */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5 text-blue-600" />
                    <span>Embedded Clinical Video URL (Optional MP4 / YouTube)</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://commondatastorage.googleapis.com/.../sample.mp4"
                    value={curSlide.videoUrl}
                    onChange={(e) => updateActiveSlide({ videoUrl: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Right Column: Clinical Image & Hotspot Annotations */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="slide-has-image"
                      checked={curSlide.hasImage}
                      onChange={(e) => updateActiveSlide({ hasImage: e.target.checked })}
                      className="w-4 h-4 rounded text-blue-600"
                    />
                    <label
                      htmlFor="slide-has-image"
                      className="text-xs font-bold text-slate-900 cursor-pointer flex items-center gap-1.5"
                    >
                      <ImageIcon className="w-4 h-4 text-emerald-600" />
                      Attach Diagnostic Scan / Image Study to this Slide
                    </label>
                  </div>

                  {curSlide.hasImage && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                      Will Appear in Clinical Atlas
                    </span>
                  )}
                </div>

                {curSlide.hasImage ? (
                  <div className="space-y-3.5 pt-2 border-t border-slate-200">
                    {/* Modality Selector */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Imaging Modality *
                        </label>
                        <select
                          value={curSlide.imageModality}
                          onChange={(e) =>
                            updateActiveSlide({
                              imageModality: e.target.value as SlideImage['modality'],
                            })
                          }
                          className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Ultrasound">Ultrasound (eFAST / POCUS)</option>
                          <option value="X-Ray">X-Ray (Plain Radiography)</option>
                          <option value="CT Scan">CT Scan (Non-Contrast / Angio)</option>
                          <option value="MRI">MRI (Magnetic Resonance)</option>
                          <option value="Angiography">Coronary Angiography</option>
                          <option value="Dermoscopy">Dermoscopy</option>
                          <option value="ECG">ECG Rhythm Strip</option>
                          <option value="Histology">Histopathology</option>
                          <option value="Clinical Photo">Clinical Photography</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Upload or Pick Scan
                        </label>
                        <label className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer flex items-center justify-center gap-1.5">
                          <Upload className="w-3.5 h-3.5 text-blue-600" />
                          <span>Select Image File</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleSlideImageUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Presets row */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Quick Medical Presets
                      </span>
                      <div className="grid grid-cols-4 gap-1.5">
                        {PRESET_DIAGNOSTIC_IMAGES.map((img, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() =>
                              updateActiveSlide({
                                imageUrl: img.url,
                                imageModality: img.modality,
                                imageCaption: img.caption,
                              })
                            }
                            className={`p-1 rounded-lg border text-left text-[9px] truncate transition-all ${
                              curSlide.imageUrl === img.url
                                ? 'bg-blue-100 border-blue-400 text-blue-900 font-bold'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {img.modality}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Image URL & Caption */}
                    <div>
                      <input
                        type="url"
                        placeholder="Direct Image URL: https://..."
                        value={curSlide.imageUrl}
                        onChange={(e) => updateActiveSlide({ imageUrl: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 font-mono text-xs focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Diagnostic Caption / Anatomical Findings *
                      </label>
                      <textarea
                        rows={2}
                        placeholder="e.g. Free anechoic fluid identified in the hepatorenal recess (Morison pouch)..."
                        value={curSlide.imageCaption}
                        onChange={(e) => updateActiveSlide({ imageCaption: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Image Preview & Hotspot Annotations */}
                    {curSlide.imageUrl && (
                      <div className="space-y-3 pt-2 border-t border-slate-200">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <Crosshair className="w-3.5 h-3.5 text-blue-600" />
                            Hotspot Annotations ({curSlide.annotations.length})
                          </span>
                          <button
                            type="button"
                            onClick={handleAddAnnotationToSlide}
                            className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Hotspot Pin</span>
                          </button>
                        </div>

                        {/* Visual Image with Pins */}
                        <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-300">
                          <img
                            src={curSlide.imageUrl}
                            alt={curSlide.imageCaption}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-contain"
                          />
                          {curSlide.annotations.map((ann, aIdx) => (
                            <div
                              key={ann.id}
                              style={{
                                left: `${ann.xPercent}%`,
                                top: `${ann.yPercent}%`,
                                transform: 'translate(-50%, -50%)',
                              }}
                              className="absolute w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-lg border-2 border-white cursor-pointer hover:scale-125 transition-transform"
                              title={`${ann.label}: ${ann.description}`}
                            >
                              {aIdx + 1}
                            </div>
                          ))}
                        </div>

                        {/* Annotations List */}
                        {curSlide.annotations.map((ann, aIdx) => (
                          <div
                            key={ann.id}
                            className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-2 text-xs"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-amber-800 flex items-center gap-1">
                                <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black flex items-center justify-center">
                                  {aIdx + 1}
                                </span>
                                Hotspot Landmark #{aIdx + 1}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveAnnotation(aIdx)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[10px] text-slate-500">Label</label>
                                <input
                                  type="text"
                                  value={ann.label}
                                  onChange={(e) =>
                                    handleUpdateAnnotation(aIdx, 'label', e.target.value)
                                  }
                                  className="w-full px-2 py-1 rounded bg-slate-50 border border-slate-200 text-xs"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-1">
                                <div>
                                  <label className="block text-[10px] text-slate-500">X %</label>
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={ann.xPercent}
                                    onChange={(e) =>
                                      handleUpdateAnnotation(
                                        aIdx,
                                        'xPercent',
                                        parseInt(e.target.value, 10) || 50
                                      )
                                    }
                                    className="w-full px-2 py-1 rounded bg-slate-50 border border-slate-200 text-xs font-mono"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] text-slate-500">Y %</label>
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={ann.yPercent}
                                    onChange={(e) =>
                                      handleUpdateAnnotation(
                                        aIdx,
                                        'yPercent',
                                        parseInt(e.target.value, 10) || 50
                                      )
                                    }
                                    className="w-full px-2 py-1 rounded bg-slate-50 border border-slate-200 text-xs font-mono"
                                  />
                                </div>
                              </div>
                            </div>

                            <div>
                              <label className="block text-[10px] text-slate-500">Description</label>
                              <input
                                type="text"
                                value={ann.description}
                                onChange={(e) =>
                                  handleUpdateAnnotation(aIdx, 'description', e.target.value)
                                }
                                className="w-full px-2 py-1 rounded bg-slate-50 border border-slate-200 text-xs"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-400 space-y-2">
                    <ImageIcon className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="text-xs">
                      Check the box above to attach a high-resolution ultrasound, CT, MRI, or X-ray study to this slide.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setActiveStep(1)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
            >
              Back to Info
            </button>
            <button
              type="button"
              onClick={() => setActiveStep(3)}
              className="px-5 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
            >
              <span>Next: CME Accreditation Quiz</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: QUIZ BUILDER & PUBLISH */}
      {activeStep === 3 && (
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-base font-bold text-slate-900">
                Post-Module Evaluation Quiz ({quizQuestions.length} Questions)
              </h4>
              <p className="text-xs text-slate-500">
                Accredited Category 1 CME credit is awarded upon achieving ≥ 80% passing score.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddQuizQuestion}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Question</span>
            </button>
          </div>

          <div className="space-y-5">
            {quizQuestions.map((q, qIdx) => (
              <div
                key={q.id}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5 font-mono">
                    <Award className="w-3.5 h-3.5" />
                    Question {qIdx + 1} of {quizQuestions.length}
                  </span>
                  {quizQuestions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveQuizQuestion(qIdx)}
                      className="text-xs text-red-600 hover:text-red-800 font-semibold flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Clinical Vignette / Case Question *
                  </label>
                  <textarea
                    rows={2}
                    value={q.vignette}
                    onChange={(e) => {
                      const updated = quizQuestions.map((item, idx) =>
                        idx === qIdx ? { ...item, vignette: e.target.value } : item
                      );
                      setQuizQuestions(updated);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(['A', 'B', 'C', 'D'] as const).map((letter, optIdx) => (
                    <div key={letter}>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-0.5 flex items-center justify-between">
                        <span>Option {letter}</span>
                        {q.correctAnswerIndex === optIdx && (
                          <span className="text-emerald-600 font-bold">✓ Correct Answer</span>
                        )}
                      </label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="radio"
                          name={`correct-${qIdx}`}
                          checked={q.correctAnswerIndex === optIdx}
                          onChange={() => {
                            const updated = quizQuestions.map((item, idx) =>
                              idx === qIdx ? { ...item, correctAnswerIndex: optIdx } : item
                            );
                            setQuizQuestions(updated);
                          }}
                          className="w-4 h-4 text-emerald-600"
                        />
                        <input
                          type="text"
                          value={q.options[optIdx]}
                          onChange={(e) => {
                            const newOptions = [...q.options] as [string, string, string, string];
                            newOptions[optIdx] = e.target.value;
                            const updated = quizQuestions.map((item, idx) =>
                              idx === qIdx ? { ...item, options: newOptions } : item
                            );
                            setQuizQuestions(updated);
                          }}
                          className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Clinical Rationale / Explanation *
                    </label>
                    <input
                      type="text"
                      value={q.rationale}
                      onChange={(e) => {
                        const updated = quizQuestions.map((item, idx) =>
                          idx === qIdx ? { ...item, rationale: e.target.value } : item
                        );
                        setQuizQuestions(updated);
                      }}
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Guideline Citation / Reference
                    </label>
                    <input
                      type="text"
                      value={q.referenceGuideline}
                      onChange={(e) => {
                        const updated = quizQuestions.map((item, idx) =>
                          idx === qIdx ? { ...item, referenceGuideline: e.target.value } : item
                        );
                        setQuizQuestions(updated);
                      }}
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setActiveStep(2)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
            >
              Back to Slides
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePublish}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Publish Presentation Immediately</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
