import React, { useState } from 'react';
import {
  Image as ImageIcon,
  Plus,
  Upload,
  Crosshair,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileImage,
  BookOpen,
} from 'lucide-react';
import {
  Presentation,
  Language,
  SlideImage,
  SlideImageAnnotation,
  PresentationSlide,
} from '../types';

interface AttachImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  presentations: Presentation[];
  targetPresentationId?: string;
  onSaveUpdatedPresentation: (updatedPresentation: Presentation) => void;
  lang: Language;
}

const PRESET_SCANS = [
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
  {
    title: 'Dermoscopy - Dysplastic Melanocytic Lesion',
    modality: 'Dermoscopy' as const,
    url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80',
    caption: 'Polarized dermoscopy displaying atypical pigment network and regression structures.',
  },
  {
    title: 'Obstetric Ultrasound - Transverse Abdominal Diameter',
    modality: 'Ultrasound' as const,
    url: 'https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&w=1200&q=80',
    caption: 'Fetal biometry cross-section at level of stomach bubble and umbilical vein.',
  },
];

export const AttachImageModal: React.FC<AttachImageModalProps> = ({
  isOpen,
  onClose,
  presentations,
  targetPresentationId,
  onSaveUpdatedPresentation,
  lang,
}) => {
  const [selectedPresId, setSelectedPresId] = useState<string>(() => {
    return targetPresentationId || (presentations.length > 0 ? presentations[0].id : '');
  });

  const selectedPres = presentations.find((p) => p.id === selectedPresId) || presentations[0];

  // Target slide mode: 'existing' or 'new'
  const [mode, setMode] = useState<'new-slide' | 'existing-slide'>('new-slide');
  const [selectedSlideId, setSelectedSlideId] = useState<string>('');

  // Image Fields
  const [imageUrl, setImageUrl] = useState<string>(PRESET_SCANS[0].url);
  const [modality, setModality] = useState<SlideImage['modality']>('Ultrasound');
  const [caption, setCaption] = useState<string>(PRESET_SCANS[0].caption);
  const [slideTitle, setSlideTitle] = useState<string>('Clinical Imaging Correlation & Diagnostic Scan');
  const [slideTakeaway, setSlideTakeaway] = useState<string>('Diagnostic imaging confirms acute pathology.');
  const [annotations, setAnnotations] = useState<SlideImageAnnotation[]>([
    {
      id: 'ann-1',
      xPercent: 50,
      yPercent: 50,
      label: 'Diagnostic Finding',
      description: 'Key anatomical landmark or pathological change.',
    },
  ]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddAnnotation = () => {
    setAnnotations((prev) => [
      ...prev,
      {
        id: `ann-${Date.now()}`,
        xPercent: 50,
        yPercent: 50,
        label: 'Anatomical Marker',
        description: 'Specific clinical feature on scan.',
      },
    ]);
  };

  const handleRemoveAnnotation = (index: number) => {
    setAnnotations((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleUpdateAnnotation = (
    index: number,
    field: keyof SlideImageAnnotation,
    val: string | number
  ) => {
    setAnnotations((prev) =>
      prev.map((ann, idx) => (idx === index ? { ...ann, [field]: val } : ann))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedPres) {
      setErrorMessage('Please select a target presentation.');
      return;
    }

    if (!imageUrl.trim()) {
      setErrorMessage('Please provide an image URL or upload an image file.');
      return;
    }

    const imageDetails: SlideImage = {
      url: imageUrl.trim(),
      modality,
      caption: caption.trim() || 'Clinical diagnostic scan',
      annotations: annotations.length > 0 ? annotations : undefined,
    };

    let updatedSlides = [...selectedPres.slides];

    if (mode === 'new-slide') {
      const newSlide: PresentationSlide = {
        id: `slide-img-${Date.now()}`,
        slideNumber: updatedSlides.length + 1,
        title: slideTitle.trim() || 'Diagnostic Imaging Study',
        subtitle: `${modality} Evaluation & Findings`,
        contentBullets: [
          `Modality: ${modality}`,
          caption.trim(),
          'Correlate bedside sonography / imaging with patient clinical trajectory.',
        ],
        speakerNotes: 'Discuss key diagnostic features and common clinical pitfalls.',
        clinicalTakeaway: slideTakeaway.trim() || 'Ensure prompt diagnostic confirmation.',
        imageUrl: imageUrl.trim(),
        imageDetails,
      };
      updatedSlides.push(newSlide);
    } else {
      // update existing slide
      const slideToUpdate = updatedSlides.find((s) => s.id === selectedSlideId) || updatedSlides[0];
      if (slideToUpdate) {
        updatedSlides = updatedSlides.map((s) =>
          s.id === slideToUpdate.id
            ? {
                ...s,
                imageUrl: imageUrl.trim(),
                imageDetails,
              }
            : s
        );
      }
    }

    const updatedPres: Presentation = {
      ...selectedPres,
      slides: updatedSlides,
    };

    onSaveUpdatedPresentation(updatedPres);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full overflow-hidden transition-all my-8">
        <div className="bg-emerald-600 h-1.5 w-full" />

        <div className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
                <FileImage className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  {lang === 'fr' ? 'Ajouter une Imagerie Clinique' : 'Attach Clinical Diagnostic Image'}
                </h3>
                <p className="text-xs text-slate-500">
                  {lang === 'fr'
                    ? 'Ajoutez des clichés échographiques, radiographiques ou tomodensitométriques qui apparaîtront aussi dans l’Atlas.'
                    : 'Upload high-resolution imaging studies that will also integrate into the Clinical Imaging Atlas.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              ✕
            </button>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Target Presentation */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Presentation Module *
              </label>
              <select
                value={selectedPres?.id}
                onChange={(e) => setSelectedPresId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-blue-500"
              >
                {presentations.map((p) => (
                  <option key={p.id} value={p.id}>
                    [{p.specialty}] {p.title} ({p.slides.length} slides)
                  </option>
                ))}
              </select>
            </div>

            {/* Mode selection */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setMode('new-slide')}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                  mode === 'new-slide' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Append as New Slide
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('existing-slide');
                  if (selectedPres?.slides.length > 0 && !selectedSlideId) {
                    setSelectedSlideId(selectedPres.slides[0].id);
                  }
                }}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                  mode === 'existing-slide' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Attach to Existing Slide
              </button>
            </div>

            {mode === 'existing-slide' && selectedPres && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Existing Slide to Attach Image
                </label>
                <select
                  value={selectedSlideId || selectedPres.slides[0]?.id}
                  onChange={(e) => setSelectedSlideId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs"
                >
                  {selectedPres.slides.map((s) => (
                    <option key={s.id} value={s.id}>
                      Slide {s.slideNumber}: {s.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {mode === 'new-slide' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    New Slide Title
                  </label>
                  <input
                    type="text"
                    value={slideTitle}
                    onChange={(e) => setSlideTitle(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Key Clinical Takeaway
                  </label>
                  <input
                    type="text"
                    value={slideTakeaway}
                    onChange={(e) => setSlideTakeaway(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs"
                  />
                </div>
              </div>
            )}

            {/* Modality & Image File */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Imaging Modality *
                </label>
                <select
                  value={modality}
                  onChange={(e) => setModality(e.target.value as SlideImage['modality'])}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Ultrasound">Ultrasound (eFAST / POCUS)</option>
                  <option value="X-Ray">X-Ray (Radiograph)</option>
                  <option value="CT Scan">CT Scan</option>
                  <option value="MRI">MRI</option>
                  <option value="Angiography">Coronary Angiography</option>
                  <option value="Dermoscopy">Dermoscopy</option>
                  <option value="ECG">ECG Rhythm Strip</option>
                  <option value="Histology">Histopathology</option>
                  <option value="Clinical Photo">Clinical Photo</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Upload Image File
                </label>
                <label className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer flex items-center justify-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-blue-600" />
                  <span>Choose Local File</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Or Select Curated Diagnostic Presets
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {PRESET_SCANS.map((scan, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setImageUrl(scan.url);
                      setModality(scan.modality);
                      setCaption(scan.caption);
                    }}
                    className={`p-1.5 rounded-lg border text-left text-[10px] truncate transition-all ${
                      imageUrl === scan.url
                        ? 'bg-emerald-100 border-emerald-400 text-emerald-900 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {scan.modality}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Direct Image URL
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Diagnostic Findings & Caption *
              </label>
              <textarea
                rows={2}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Visual Preview & Hotspots */}
            {imageUrl && (
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Crosshair className="w-3.5 h-3.5 text-blue-600" />
                    Hotspot Annotations ({annotations.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleAddAnnotation}
                    className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Pin</span>
                  </button>
                </div>

                <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-300">
                  <img
                    src={imageUrl}
                    alt={caption}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain"
                  />
                  {annotations.map((ann, idx) => (
                    <div
                      key={ann.id}
                      style={{
                        left: `${ann.xPercent}%`,
                        top: `${ann.yPercent}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                      className="absolute w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] flex items-center justify-center shadow border border-white"
                    >
                      {idx + 1}
                    </div>
                  ))}
                </div>

                {annotations.map((ann, idx) => (
                  <div
                    key={ann.id}
                    className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2 text-xs"
                  >
                    <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px] flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      placeholder="Landmark label"
                      value={ann.label}
                      onChange={(e) => handleUpdateAnnotation(idx, 'label', e.target.value)}
                      className="flex-1 px-2 py-1 rounded bg-white border border-slate-200 text-xs"
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={ann.xPercent}
                      onChange={(e) =>
                        handleUpdateAnnotation(idx, 'xPercent', parseInt(e.target.value, 10) || 50)
                      }
                      className="w-14 px-2 py-1 rounded bg-white border border-slate-200 text-xs font-mono"
                      title="X %"
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={ann.yPercent}
                      onChange={(e) =>
                        handleUpdateAnnotation(idx, 'yPercent', parseInt(e.target.value, 10) || 50)
                      }
                      className="w-14 px-2 py-1 rounded bg-white border border-slate-200 text-xs font-mono"
                      title="Y %"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveAnnotation(idx)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Diagnostic Image</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
