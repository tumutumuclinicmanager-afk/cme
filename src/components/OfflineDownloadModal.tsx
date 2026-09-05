import React, { useState } from 'react';
import {
  X,
  Download,
  FileCheck,
  HardDrive,
  CheckCircle,
  Share2,
  FileCode,
  FileText,
} from 'lucide-react';
import { Presentation, Language } from '../types';
import { getTranslation } from '../translations';
import { savePresentationOffline } from '../utils/offlineSync';

interface OfflineDownloadModalProps {
  presentation: Presentation;
  lang: Language;
  onClose: () => void;
  onMarkOfflineCached: (id: string) => void;
}

export const OfflineDownloadModal: React.FC<OfflineDownloadModalProps> = ({
  presentation,
  lang,
  onClose,
  onMarkOfflineCached,
}) => {
  const t = getTranslation(lang);
  const [downloadedFormat, setDownloadedFormat] = useState<string | null>(null);

  // Generate a complete standalone single-file HTML document for the clinical presentation
  const handleDownloadStandaloneHtml = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${presentation.title} - Offline CME Module</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; background: #0f172a; color: #f8fafc; margin: 0; padding: 24px; }
    .container { max-width: 900px; margin: 0 auto; background: #1e293b; padding: 32px; border-radius: 16px; border: 1px solid #334155; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 700; background: #0d9488; color: #fff; margin-bottom: 12px; }
    h1 { margin-top: 0; color: #f1f5f9; font-size: 26px; }
    .faculty { color: #94a3b8; font-size: 14px; margin-bottom: 24px; border-bottom: 1px solid #334155; padding-bottom: 16px; }
    .slide-card { background: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
    .slide-title { font-size: 18px; color: #2dd4bf; margin-top: 0; }
    .bullets { margin-left: 20px; color: #e2e8f0; }
    .takeaway { background: rgba(245, 158, 11, 0.1); border-left: 4px solid #f59e0b; padding: 12px; border-radius: 6px; margin: 16px 0; color: #fde68a; font-size: 14px; }
    .notes { background: #1e293b; padding: 12px; border-radius: 6px; font-size: 13px; color: #cbd5e1; border: 1px solid #475569; }
    .quiz-section { background: #092e28; border: 1px solid #14b8a6; padding: 24px; border-radius: 12px; margin-top: 32px; }
    .q-box { background: #0f172a; padding: 16px; border-radius: 8px; margin-bottom: 16px; }
    .footer { text-align: center; font-size: 12px; color: #64748b; margin-top: 32px; }
    img { max-width: 100%; height: auto; border-radius: 8px; margin-top: 12px; border: 1px solid #334155; }
  </style>
</head>
<body>
  <div class="container">
    <span class="badge">${presentation.specialty} • ${presentation.cmeCredits} CME Credits</span>
    <h1>${presentation.title}</h1>
    <div class="faculty">Faculty: <strong>${presentation.facultyAuthor}</strong> — ${presentation.institution}</div>
    <p><em>${presentation.summary}</em></p>

    <h2>Clinical Presentation Slides</h2>
    ${presentation.slides
      .map(
        (s) => `
      <div class="slide-card">
        <h3 class="slide-title">Slide ${s.slideNumber}: ${s.title}</h3>
        ${s.subtitle ? `<p style="color: #94a3b8; font-size: 14px;">${s.subtitle}</p>` : ''}
        <ul class="bullets">
          ${s.contentBullets.map((b) => `<li>${b}</li>`).join('')}
        </ul>
        ${s.imageUrl ? `<img src="${s.imageUrl}" alt="${s.title}" />` : ''}
        ${
          s.clinicalTakeaway
            ? `<div class="takeaway"><strong>Clinical Takeaway:</strong> ${s.clinicalTakeaway}</div>`
            : ''
        }
        <div class="notes"><strong>Clinical Notes & Rationale:</strong> ${s.speakerNotes}</div>
      </div>
    `
      )
      .join('')}

    <div class="quiz-section">
      <h2 style="color: #5eead4; margin-top:0;">Offline Self-Evaluation Quiz</h2>
      ${presentation.quiz
        .map(
          (q, i) => `
        <div class="q-box">
          <p><strong>Question ${i + 1}:</strong> ${q.vignette}</p>
          <ol type="A">
            ${q.options.map((opt) => `<li>${opt}</li>`).join('')}
          </ol>
          <details style="margin-top: 12px; cursor: pointer; color: #2dd4bf;">
            <summary><strong>Reveal Correct Answer & Clinical Evidence</strong></summary>
            <div style="background: #1e293b; padding: 12px; border-radius: 6px; margin-top: 8px; color: #e2e8f0; font-size: 13px;">
              <p><strong>Correct Answer:</strong> Option ${String.fromCharCode(65 + q.correctAnswerIndex)}: ${q.options[q.correctAnswerIndex]}</p>
              <p><strong>Rationale:</strong> ${q.rationale}</p>
              ${q.referenceGuideline ? `<p style="color: #94a3b8; font-size: 11px;"><em>${q.referenceGuideline}</em></p>` : ''}
            </div>
          </details>
        </div>
      `
        )
        .join('')}
    </div>

    <div class="footer">
      Continuous Medical Education Platform • Downloaded for Offline Medical Study on ${new Date().toLocaleDateString()}
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${presentation.id}-offline-cme.html`;
    a.click();
    URL.revokeObjectURL(url);

    setDownloadedFormat('html');
    savePresentationOffline(presentation);
    onMarkOfflineCached(presentation.id);
  };

  const handleDownloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(presentation, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `${presentation.id}-cme-module.json`;
    a.click();
    setDownloadedFormat('json');
    savePresentationOffline(presentation);
    onMarkOfflineCached(presentation.id);
  };

  return (
    <div
      id="offline-download-modal"
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-xl overflow-hidden flex flex-col my-auto text-slate-800">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                {t.offlineDownloadTitle}
              </h3>
              <p className="text-[11px] text-slate-500">{presentation.specialty}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs sm:text-sm">
          <p className="text-slate-600 leading-relaxed">{t.offlineDesc}</p>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
            <h4 className="font-semibold text-slate-900">{presentation.title}</h4>
            <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
              <span>{presentation.slides.length} {t.slidesCount}</span>
              <span>•</span>
              <span>{presentation.quiz.length} {t.questionsCount}</span>
              <span>•</span>
              <span>{presentation.cmeCredits} {t.creditsLabel}</span>
            </div>
          </div>

          <div className="space-y-2.5 pt-2">
            <button
              type="button"
              onClick={handleDownloadStandaloneHtml}
              className="w-full p-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center justify-between shadow-xs transition-all active:scale-98"
            >
              <div className="flex items-center gap-2.5">
                <FileCode className="w-4 h-4" />
                <div className="text-left">
                  <span>{t.downloadHtmlDeck}</span>
                  <span className="block text-[10px] font-normal opacity-90">
                    Standalone offline web viewer (zero internet required)
                  </span>
                </div>
              </div>
              <Download className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleDownloadJson}
              className="w-full p-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm border border-slate-200 flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-blue-600" />
                <div className="text-left">
                  <span>{t.downloadJsonSummary}</span>
                  <span className="block text-[10px] font-normal text-slate-500">
                    Structured clinical dataset & quiz rationale
                  </span>
                </div>
              </div>
              <Download className="w-4 h-4" />
            </button>
          </div>

          {downloadedFormat && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{t.offlinePackageReady}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
