import React, { useState, useEffect } from 'react';
import {
  X,
  Phone,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  Smartphone,
  ArrowRight,
} from 'lucide-react';
import { Presentation, Language, MPesaPayment } from '../types';
import { getTranslation } from '../translations';

interface MPesaModalProps {
  presentation: Presentation;
  lang: Language;
  onClose: () => void;
  onPaymentSuccess: (payment: MPesaPayment) => void;
}

export const MPesaModal: React.FC<MPesaModalProps> = ({
  presentation,
  lang,
  onClose,
  onPaymentSuccess,
}) => {
  const t = getTranslation(lang);
  const [phoneNumber, setPhoneNumber] = useState<string>('0722100200');
  const [step, setStep] = useState<'INPUT' | 'PROCESSING' | 'PIN_WAITING' | 'SUCCESS'>('INPUT');
  const [countdown, setCountdown] = useState<number>(10);
  const [receiptCode, setReceiptCode] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'PIN_WAITING') {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            // Simulate completion
            const generatedCode = 'QHM' + Math.floor(100000 + Math.random() * 900000);
            setReceiptCode(generatedCode);
            setStep('SUCCESS');

            const payment: MPesaPayment = {
              id: 'mpesa-' + Date.now(),
              transactionCode: generatedCode,
              presentationId: presentation.id,
              presentationTitle: presentation.title,
              phoneNumber: phoneNumber,
              amountKes: presentation.priceKes,
              status: 'COMPLETED',
              timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
              merchantRequestId: 'MR-' + Math.floor(10000 + Math.random() * 90000),
            };
            onPaymentSuccess(payment);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, phoneNumber, presentation, onPaymentSuccess]);

  const handleInitiateSTK = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Normalize phone number
    const cleanPhone = phoneNumber.replace(/\s+/g, '');
    if (!cleanPhone || cleanPhone.length < 9) {
      setErrorMessage(
        lang === 'fr'
          ? 'Veuillez saisir un numéro de téléphone valide (ex: 0722123456)'
          : 'Please enter a valid Safaricom phone number (e.g. 0722123456)'
      );
      return;
    }

    setStep('PROCESSING');
    setTimeout(() => {
      setStep('PIN_WAITING');
      setCountdown(8);
    }, 1200);
  };

  const handleSimulateInstantPin = () => {
    const generatedCode = 'QHM' + Math.floor(100000 + Math.random() * 900000);
    setReceiptCode(generatedCode);
    setStep('SUCCESS');

    const payment: MPesaPayment = {
      id: 'mpesa-' + Date.now(),
      transactionCode: generatedCode,
      presentationId: presentation.id,
      presentationTitle: presentation.title,
      phoneNumber: phoneNumber,
      amountKes: presentation.priceKes,
      status: 'COMPLETED',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      merchantRequestId: 'MR-' + Math.floor(10000 + Math.random() * 90000),
    };
    onPaymentSuccess(payment);
  };

  return (
    <div
      id="mpesa-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-xl overflow-hidden flex flex-col my-auto text-slate-800">
        {/* Header with Safaricom M-Pesa Theme */}
        <div className="px-5 py-4 border-b border-slate-200 bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black shadow-xs">
              <span className="text-xs tracking-tighter font-mono">M-PESA</span>
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                {t.mpesaTitle}
              </h3>
              <p className="text-[11px] text-emerald-600 font-medium">
                Daraja STK Push 2.0 • Secure Gateway
              </p>
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

        {/* Content Body */}
        <div className="p-5 space-y-5">
          {/* Module summary */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="min-w-0 pr-3">
              <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">
                {presentation.specialty} • {presentation.cmeCredits} {t.creditsLabel}
              </span>
              <h4 className="font-semibold text-xs sm:text-sm text-slate-900 truncate">
                {presentation.title}
              </h4>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs text-slate-500 block">{t.amountToPay}</span>
              <span className="text-base sm:text-lg font-bold font-mono text-emerald-600">
                KES {presentation.priceKes}
              </span>
            </div>
          </div>

          {/* STEP 1: Phone Input */}
          {step === 'INPUT' && (
            <form onSubmit={handleInitiateSTK} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t.phoneLabel}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="07XXXXXXXX or 2547XXXXXXXX"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">{t.phoneHelp}</p>
              </div>

              {errorMessage && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-xs transition-transform active:scale-98 flex items-center justify-center gap-2"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>{t.sendStkPush}</span>
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Processing STK Push */}
          {step === 'PROCESSING' && (
            <div className="py-6 text-center space-y-3">
              <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mx-auto" />
              <p className="font-semibold text-sm text-slate-800">
                {lang === 'fr'
                  ? 'Connexion à l’API Safaricom Daraja...'
                  : 'Contacting Safaricom Daraja Gateway...'}
              </p>
              <p className="text-xs text-slate-500">
                {lang === 'fr'
                  ? 'Génération de la requête STK Push chiffrée'
                  : 'Generating encrypted STK Push payload'}
              </p>
            </div>
          )}

          {/* STEP 3: Waiting for PIN on User's Handset */}
          {step === 'PIN_WAITING' && (
            <div className="py-4 space-y-4 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600 animate-pulse">
                <Smartphone className="w-8 h-8" />
              </div>

              <div>
                <h4 className="font-bold text-sm text-slate-900 mb-1">
                  {t.stkPushSent}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
                  {t.enterPinPrompt}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono text-slate-700 space-y-1 max-w-xs mx-auto">
                <div className="flex justify-between">
                  <span className="text-slate-500">Prompt sent to:</span>
                  <span className="font-bold text-slate-900">{phoneNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Paybill:</span>
                  <span className="font-bold text-emerald-600">890300 (CME Portal)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Amount:</span>
                  <span className="font-bold text-slate-900">KES {presentation.priceKes}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                <span>
                  {t.waitingConfirmation} ({countdown}s)
                </span>
              </div>

              {/* Simulation accelerator button */}
              <button
                type="button"
                onClick={handleSimulateInstantPin}
                className="text-[11px] text-emerald-600 hover:text-emerald-700 underline font-medium"
              >
                {lang === 'fr'
                  ? '⚡ Simuler la saisie immédiate du code PIN M-Pesa'
                  : '⚡ Simulate instant M-Pesa PIN approval'}
              </button>
            </div>
          )}

          {/* STEP 4: Success & Unlocked */}
          {step === 'SUCCESS' && (
            <div className="py-4 space-y-4 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h4 className="font-bold text-base text-slate-900 mb-0.5">
                  {t.paymentSuccess}
                </h4>
                <p className="text-xs text-slate-600">
                  {lang === 'fr'
                    ? 'Accès illimité à ce module et à l’évaluation débloqué avec succès.'
                    : 'Unlimited clinical access to this module and CME evaluation unlocked.'}
                </p>
              </div>

              {/* Receipt details */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-700 space-y-1.5 text-left">
                <div className="flex justify-between">
                  <span className="text-slate-500">{t.receiptNumber}:</span>
                  <span className="font-bold text-emerald-600">{receiptCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{t.amountToPay}:</span>
                  <span className="text-slate-800">KES {presentation.priceKes}.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{t.transactionTime}:</span>
                  <span className="text-slate-800">
                    {new Date().toLocaleTimeString()}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <span>{t.startLearningNow}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
