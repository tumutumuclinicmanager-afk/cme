import React, { useRef } from 'react';
import { X, Printer, ShieldCheck, Award, CheckCircle2 } from 'lucide-react';
import { Presentation, Language, UserProfile } from '../types';
import { getTranslation } from '../translations';

interface CertificateModalProps {
  presentation: Presentation;
  profile: UserProfile;
  lang: Language;
  certificateId: string;
  issuedDate: string;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  presentation,
  profile,
  lang,
  certificateId,
  issuedDate,
  onClose,
}) => {
  const t = getTranslation(lang);
  const certificateRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      id="certificate-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl shadow-xl overflow-hidden flex flex-col my-auto max-h-[95vh]">
        {/* Modal Toolbar */}
        <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/50 shrink-0 text-slate-800">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-600" />
            <span className="font-bold text-sm sm:text-base text-slate-900">
              {lang === 'fr' ? 'Attestation de Formation Médicale Continue' : 'Accredited CME Certificate'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>{t.downloadPdf}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Document Canvas (Printable) */}
        <div className="p-4 sm:p-8 overflow-y-auto bg-slate-100 flex justify-center">
          <div
            ref={certificateRef}
            className="w-full max-w-2xl bg-white text-slate-900 rounded-xl p-6 sm:p-10 shadow-lg border-8 border-double border-blue-900/30 relative overflow-hidden font-serif"
          >
            {/* Corner Decorative Accents */}
            <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-blue-800" />
            <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-blue-800" />
            <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-blue-800" />
            <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-blue-800" />

            {/* Header / Crest */}
            <div className="text-center space-y-2 mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-50 border-2 border-blue-700 text-blue-700 mx-auto mb-1">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-wide uppercase text-blue-950 font-serif">
                {t.certificateHeader}
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-600 max-w-md mx-auto font-sans leading-tight">
                {t.accreditedBy}
              </p>
            </div>

            {/* Certificate Body */}
            <div className="text-center space-y-4 my-6 font-sans">
              <p className="text-xs uppercase tracking-widest text-slate-500 font-medium">
                {t.thisCertifies}
              </p>

              <div className="py-2 border-b-2 border-slate-300 max-w-md mx-auto">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif">
                  {profile.name}
                </h2>
                <p className="text-xs text-slate-600 font-sans mt-0.5">
                  {profile.title} • Reg. {profile.medicalLicenseNumber}
                </p>
                <p className="text-[11px] text-slate-500">{profile.hospitalAffiliation}</p>
              </div>

              <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed">
                {t.hasCompleted}:
              </p>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 max-w-lg mx-auto">
                <h3 className="text-base sm:text-lg font-bold text-blue-950 font-serif">
                  {presentation.title}
                </h3>
                <span className="inline-block mt-1 text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-md font-sans">
                  {presentation.specialty}
                </span>
              </div>

              <div className="flex items-center justify-center gap-6 pt-2">
                <div className="text-center">
                  <span className="block text-2xl font-bold text-blue-700 font-serif">
                    {presentation.cmeCredits.toFixed(1)}
                  </span>
                  <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                    {t.cmeCreditsAwarded}
                  </span>
                </div>
                <div className="h-8 w-[1px] bg-slate-300" />
                <div className="text-center">
                  <span className="block text-sm font-bold text-slate-800 font-mono mt-1">
                    {issuedDate}
                  </span>
                  <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                    {t.dateAwarded}
                  </span>
                </div>
              </div>
            </div>

            {/* Signatures and Verification seal */}
            <div className="mt-8 pt-6 border-t border-slate-200 grid grid-cols-2 gap-4 text-center font-sans text-xs">
              <div>
                <div className="h-9 flex items-end justify-center mb-1">
                  <span className="font-serif italic text-base text-slate-800">
                    {presentation.facultyAuthor.split(',')[0]}
                  </span>
                </div>
                <div className="border-t border-slate-400 w-36 mx-auto pt-1">
                  <p className="font-semibold text-slate-800 text-[11px]">Faculty Specialist</p>
                  <p className="text-[10px] text-slate-500 truncate">{presentation.institution}</p>
                </div>
              </div>

              <div>
                <div className="h-9 flex items-end justify-center mb-1">
                  <span className="font-serif italic text-base text-blue-800">
                    Dr. A. Ochieng, MD
                  </span>
                </div>
                <div className="border-t border-slate-400 w-36 mx-auto pt-1">
                  <p className="font-semibold text-slate-800 text-[11px]">CME Council Director</p>
                  <p className="text-[10px] text-slate-500">Board Accreditation</p>
                </div>
              </div>
            </div>

            {/* Verification Footer with Security Hash */}
            <div className="mt-6 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-[10px] text-slate-500 font-mono">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-blue-600" />
                Verified CME Credential
              </span>
              <span>
                {t.verificationCode}: <span className="font-bold text-slate-700">{certificateId}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
