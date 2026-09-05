import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Award,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RotateCcw,
  BookOpen,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { Presentation, Language, QuizAttempt } from '../types';
import { getTranslation } from '../translations';

interface QuizModalProps {
  presentation: Presentation;
  lang: Language;
  onClose: () => void;
  onSaveQuizResult: (attempt: QuizAttempt) => void;
  onViewCertificate: () => void;
  existingAttempt?: QuizAttempt;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  presentation,
  lang,
  onClose,
  onSaveQuizResult,
  onViewCertificate,
  existingAttempt,
}) => {
  const t = getTranslation(lang);
  const questions = presentation.quiz;
  const totalQuestions = questions.length;

  const [selectedAnswers, setSelectedAnswers] = useState<number[]>(
    existingAttempt?.userAnswers || new Array(totalQuestions).fill(-1)
  );
  const [submitted, setSubmitted] = useState<boolean>(!!existingAttempt);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);

  const isAllAnswered = selectedAnswers.every((ans) => ans !== -1);

  const calculateScore = () => {
    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswerIndex) {
        correctCount++;
      }
    });
    return {
      scorePercent: Math.round((correctCount / totalQuestions) * 100),
      passed: (correctCount / totalQuestions) >= 0.7,
      correctCount,
    };
  };

  const handleOptionSelect = (qIdx: number, optIdx: number) => {
    if (submitted) return; // locked once submitted
    const newAnswers = [...selectedAnswers];
    newAnswers[qIdx] = optIdx;
    setSelectedAnswers(newAnswers);
  };

  const handleSubmit = () => {
    const { scorePercent, passed } = calculateScore();
    const attempt: QuizAttempt = {
      presentationId: presentation.id,
      score: scorePercent,
      totalQuestions,
      passed,
      attemptDate: new Date().toISOString().split('T')[0],
      userAnswers: selectedAnswers,
    };

    setSubmitted(true);
    onSaveQuizResult(attempt);

    if (passed) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // graceful fallback if canvas unavailable
      }
    }
  };

  const handleRetake = () => {
    setSelectedAnswers(new Array(totalQuestions).fill(-1));
    setSubmitted(false);
    setCurrentQuestionIndex(0);
  };

  const { scorePercent, passed } = calculateScore();
  const currentQ = questions[currentQuestionIndex];

  return (
    <div
      id="quiz-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div
        id="quiz-modal-card"
        className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden flex flex-col my-auto max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                {t.quizTitle}
              </h3>
              <p className="text-xs text-slate-500">
                {presentation.title} • {presentation.cmeCredits} {t.creditsLabel}
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
        <div className="p-5 overflow-y-auto space-y-6 flex-1 text-slate-700 text-sm">
          {/* Result Banner if submitted */}
          {submitted && (
            <div
              className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center gap-4 ${
                passed
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              <div className="flex items-center gap-3">
                {passed ? (
                  <CheckCircle2 className="w-9 h-9 text-emerald-600 shrink-0" />
                ) : (
                  <XCircle className="w-9 h-9 text-rose-600 shrink-0" />
                )}
                <div>
                  <h4 className="font-bold text-base">
                    {passed ? t.quizPassed : t.quizFailed}
                  </h4>
                  <p className="text-xs opacity-90">
                    {t.quizScore}: <span className="font-mono font-bold text-sm">{scorePercent}%</span> (
                    {t.passingScore})
                  </p>
                </div>
              </div>

              <div className="sm:ml-auto flex items-center gap-2 shrink-0">
                {passed ? (
                  <button
                    type="button"
                    onClick={onViewCertificate}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-transform active:scale-95 flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{t.generateCertificate}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleRetake}
                    className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{t.tryAgain}</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Question Nav Pills */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <span className="text-xs font-semibold text-slate-500 mr-1">
              {t.question}:
            </span>
            {questions.map((_, idx) => {
              const isSelected = selectedAnswers[idx] !== -1;
              const isCurrent = idx === currentQuestionIndex;
              let btnClass = 'bg-slate-100 text-slate-600 hover:bg-slate-200';

              if (submitted) {
                const isCorrect = selectedAnswers[idx] === questions[idx].correctAnswerIndex;
                btnClass = isCorrect
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-rose-100 text-rose-800 border border-rose-300';
              } else if (isCurrent) {
                btnClass = 'bg-blue-600 text-white font-bold ring-2 ring-blue-300';
              } else if (isSelected) {
                btnClass = 'bg-slate-200 text-slate-800 font-medium';
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all flex items-center justify-center ${btnClass}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Active Question Box */}
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 block mb-1">
                {t.question} {currentQuestionIndex + 1} {t.of} {totalQuestions}
              </span>
              <p className="text-sm sm:text-base font-medium text-slate-900 leading-relaxed">
                {currentQ.vignette}
              </p>
            </div>

            {/* Multiple Choice Options */}
            <div className="space-y-2.5">
              <span className="text-xs text-slate-500 font-medium block">
                {t.selectAnswer}
              </span>
              {currentQ.options.map((opt, optIdx) => {
                const isChosen = selectedAnswers[currentQuestionIndex] === optIdx;
                const isCorrectAnswer = optIdx === currentQ.correctAnswerIndex;

                let optStyle =
                  'bg-white hover:bg-slate-50 border-slate-200 text-slate-800';

                if (submitted) {
                  if (isCorrectAnswer) {
                    optStyle = 'bg-emerald-50 border-emerald-400 text-emerald-900';
                  } else if (isChosen && !isCorrectAnswer) {
                    optStyle = 'bg-rose-50 border-rose-300 text-rose-800 line-through opacity-80';
                  } else {
                    optStyle = 'bg-slate-50 border-slate-200 text-slate-400';
                  }
                } else if (isChosen) {
                  optStyle = 'bg-blue-50 border-blue-400 text-blue-900 shadow-xs';
                }

                return (
                  <button
                    key={optIdx}
                    type="button"
                    disabled={submitted}
                    onClick={() => handleOptionSelect(currentQuestionIndex, optIdx)}
                    className={`w-full text-left p-3 sm:p-3.5 rounded-xl border transition-all flex items-start gap-3 text-xs sm:text-sm ${optStyle}`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full text-[11px] font-bold shrink-0 flex items-center justify-center mt-0.5 border ${
                        submitted
                          ? isCorrectAnswer
                            ? 'bg-emerald-600 text-white border-emerald-500'
                            : isChosen
                            ? 'bg-rose-600 text-white border-rose-500'
                            : 'bg-slate-200 text-slate-500 border-slate-300'
                          : isChosen
                          ? 'bg-blue-600 text-white border-blue-500'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span className="flex-1 leading-snug">{opt}</span>
                    {submitted && isCorrectAnswer && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    )}
                    {submitted && isChosen && !isCorrectAnswer && (
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Submitted Feedback & Clinical Rationale */}
            {submitted && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 mt-4">
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 uppercase tracking-wider">
                  <BookOpen className="w-3.5 h-3.5" />
                  {t.clinicalRationale}
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {currentQ.rationale}
                </p>
                {currentQ.referenceGuideline && (
                  <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500 italic">
                    <span className="font-semibold text-slate-700 not-italic">
                      {t.referenceStandard}:{' '}
                    </span>
                    {currentQ.referenceGuideline}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {t.prevQuestion}
          </button>

          <div className="flex items-center gap-2">
            {!submitted ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!isAllAnswered}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm shadow-xs transition-all active:scale-95"
              >
                {t.submitQuiz}
              </button>
            ) : passed ? (
              <button
                type="button"
                onClick={onViewCertificate}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-xs flex items-center gap-1.5"
              >
                <Award className="w-4 h-4" />
                <span>{t.generateCertificate}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleRetake}
                className="px-4 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-semibold text-xs sm:text-sm flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t.tryAgain}</span>
              </button>
            )}

            {currentQuestionIndex < totalQuestions - 1 && (
              <button
                type="button"
                onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
              >
                {t.nextQuestion}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
