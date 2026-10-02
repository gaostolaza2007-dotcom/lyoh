"use client";

import React, { useState } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { ANATOMY_FLASHCARDS, Flashcard } from "@/lib/medical-data";
import { useAuth } from "@/lib/auth-context";
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Sparkles, 
  RotateCcw, 
  ArrowRight, 
  HelpCircle,
  Lightbulb,
  Award,
  Layers
} from "lucide-react";

export default function AnatomiaFlashcardsPage() {
  const { addXp, updateUnitProgress, recordQuizResult } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [missedTopics, setMissedTopics] = useState<string[]>([]);
  const [answersSummary, setAnswersSummary] = useState<Record<string, boolean>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [savedAttempt, setSavedAttempt] = useState<any>(null);

  const card: Flashcard = ANATOMY_FLASHCARDS[currentIndex];

  const handleSelectOption = (optionId: string, isCorrect: boolean) => {
    if (isAnswered) return;
    setSelectedOptionId(optionId);
    setIsAnswered(true);

    const newScore = isCorrect ? score + 1 : score;
    const newMissed = !isCorrect ? [...missedTopics, card.system || card.subheading] : missedTopics;
    const newSummary = { ...answersSummary, [card.id]: isCorrect };

    if (isCorrect) {
      setScore(newScore);
      addXp(25);
      updateUnitProgress("anatomia", "flashcards", Math.round(((currentIndex + 1) / ANATOMY_FLASHCARDS.length) * 100));

      // Disparo sutil de confeti médico
      try {
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.7 },
          colors: ["#a855f7", "#3b82f6", "#22d3ee", "#10b981"],
        });
      } catch {}
    } else {
      setMissedTopics(newMissed);
    }
    setAnswersSummary(newSummary);

    // Si es la última tarjeta del mazo, enviar resultado consolidado al servidor
    if (currentIndex === ANATOMY_FLASHCARDS.length - 1) {
      setIsCompleted(true);
      recordQuizResult({
        moduleId: "anatomia",
        unitId: "flashcards",
        quizVersion: "v1.0",
        totalQuestions: ANATOMY_FLASHCARDS.length,
        correctCount: newScore,
        incorrectTopics: newMissed,
        answersSummary: newSummary,
      }).then((res) => {
        if (res?.attempt) setSavedAttempt(res.attempt);
      });
    }
  };

  const handleNext = () => {
    if (currentIndex < ANATOMY_FLASHCARDS.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOptionId(null);
      setIsAnswered(false);
    } else {
      // Reiniciar para nuevo intento
      setCurrentIndex(0);
      setSelectedOptionId(null);
      setIsAnswered(false);
      setScore(0);
      setMissedTopics([]);
      setAnswersSummary({});
      setIsCompleted(false);
    }
  };

  const selectedOption = card.options.find((o) => o.id === selectedOptionId);
  const isCorrect = selectedOption?.isCorrect ?? false;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Navegación superior */}
      <div className="flex items-center justify-between">
        <Link
          href="/anatomia"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a Anatomía</span>
        </Link>

        <div className="flex items-center space-x-3 text-xs font-medium">
          <span className="text-slate-400">
            Tarjeta {currentIndex + 1} de {ANATOMY_FLASHCARDS.length}
          </span>
          <span className="px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
            Aciertos: {score}
          </span>
        </div>
      </div>

      {/* Tarjeta Principal de Flashcard */}
      <GlassCard className="p-6 sm:p-8 relative overflow-hidden border border-white/15">
        
        {/* Encabezado de la pregunta */}
        <div className="mb-6">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
            {card.subheading}
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white mt-1 leading-snug">
            {card.question}
          </h2>
        </div>

        {/* Zona Visual del Diagrama Anatómico */}
        <div className="relative w-full h-52 sm:h-64 rounded-2xl overflow-hidden mb-6 bg-slate-950/80 border border-white/10 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/10 via-transparent to-blue-900/10" />
          
          {/* Ilustración Vectorial Anatómica Interactiva según tema */}
          {card.diagramType === "brachial" && (
            <svg viewBox="0 0 400 200" className="w-full h-full max-h-48 text-indigo-400">
              <defs>
                <linearGradient id="boneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#94a3b8" />
                  <stop offset="100%" stopColor="#475569" />
                </linearGradient>
                <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              {/* Húmero proximal esquemático */}
              <path d="M 120 40 C 130 20, 170 20, 180 40 C 185 55, 170 70, 150 85 L 150 180 L 140 180 L 140 85 C 120 70, 105 55, 120 40 Z" fill="url(#boneGrad)" opacity="0.85" />
              {/* Cuello anatómico vs quirúrgico */}
              <line x1="105" y1="90" x2="185" y2="90" stroke="#f43f5e" strokeWidth="2.5" strokeDasharray="4" filter="url(#glowFilter)" />
              <text x="195" y="94" fill="#f43f5e" fontSize="11" fontWeight="bold">Zona de Fractura Frecuente (Cuello Quirúrgico)</text>
              {/* Nervio axilar rodeando */}
              <path d="M 115 82 C 145 98, 160 98, 175 82" fill="none" stroke="#fbbf24" strokeWidth="3.5" filter="url(#glowFilter)" />
              <circle cx="115" cy="82" r="4" fill="#fbbf24" />
              <circle cx="175" cy="82" r="4" fill="#fbbf24" />
              <text x="70" y="145" fill="#38bdf8" fontSize="11">Arteria circunfleja y Nervio axilar</text>
            </svg>
          )}

          {card.diagramType === "heart" && (
            <svg viewBox="0 0 400 200" className="w-full h-full max-h-48">
              <path d="M 200 170 C 150 130, 120 90, 140 60 C 160 30, 190 50, 200 70 C 210 50, 240 30, 260 60 C 280 90, 250 130, 200 170 Z" fill="#991b1b" opacity="0.75" />
              {/* Arteria coronaria izquierda y descendente anterior */}
              <path d="M 195 70 Q 200 95 190 120 T 198 160" fill="none" stroke="#ef4444" strokeWidth="4" />
              <path d="M 195 70 Q 225 80 240 100" fill="none" stroke="#f87171" strokeWidth="3" />
              <text x="60" y="110" fill="#fca5a5" fontSize="11" fontWeight="bold">Arteria Descendente Anterior (LAD)</text>
              <line x1="165" y1="110" x2="192" y2="115" stroke="#fca5a5" strokeWidth="1.5" />
            </svg>
          )}

          {card.diagramType === "skull" && (
            <svg viewBox="0 0 400 200" className="w-full h-full max-h-48">
              <ellipse cx="200" cy="100" rx="110" ry="70" fill="#334155" opacity="0.6" stroke="#64748b" strokeWidth="2" />
              {/* Foramen Ovale, Rotundum, Spinosum */}
              <circle cx="175" cy="85" r="5" fill="#38bdf8" />
              <text x="100" y="88" fill="#38bdf8" fontSize="10">F. Rotundum (V2)</text>
              <ellipse cx="185" cy="115" rx="7" ry="4" fill="#fbbf24" />
              <text x="80" y="125" fill="#fbbf24" fontSize="11" fontWeight="bold">F. OVAL (V3)</text>
              <circle cx="195" cy="135" r="3.5" fill="#f43f5e" />
              <text x="210" y="140" fill="#f43f5e" fontSize="10">F. Spinosum (A. Meníngea)</text>
            </svg>
          )}

          <span className="absolute bottom-2 right-3 text-[10px] text-slate-500 font-mono">
            {card.system}
          </span>
        </div>

        {/* 4 Botones de Selección */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {card.options.map((option, idx) => {
            const isSelected = selectedOptionId === option.id;
            let btnClass = "bg-slate-900/60 border-white/10 text-slate-200 hover:bg-white/10 hover:border-purple-500/30";

            if (isAnswered) {
              if (option.isCorrect) {
                btnClass = "bg-emerald-950/70 border-emerald-500 text-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.3)]";
              } else if (isSelected && !option.isCorrect) {
                btnClass = "bg-rose-950/70 border-rose-500 text-rose-100 shadow-[0_0_15px_rgba(244,63,94,0.3)] animate-shake";
              } else {
                btnClass = "opacity-50 bg-slate-950/40 border-white/5 text-slate-400";
              }
            }

            return (
              <button
                key={option.id}
                onClick={() => handleSelectOption(option.id, option.isCorrect)}
                disabled={isAnswered}
                className={`
                  p-4 rounded-2xl border text-left font-medium text-xs sm:text-sm
                  transition-all duration-200 flex items-start space-x-3
                  touch-manipulation ${btnClass}
                `}
              >
                <span className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="flex-1">{option.text}</span>
                {isAnswered && option.isCorrect && (
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                )}
                {isAnswered && isSelected && !option.isCorrect && (
                  <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Panel de Retroalimentación Inmediata al Responder */}
        {isAnswered && (
          <div className={`p-5 rounded-2xl border mb-6 animate-in slide-in-from-top-2 duration-200 ${
            isCorrect 
              ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200" 
              : "bg-rose-950/40 border-rose-500/40 text-rose-200"
          }`}>
            <div className="flex items-center space-x-2 font-bold text-sm mb-2">
              {isCorrect ? (
                <>
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span className="text-emerald-300">¡Respuesta Correcta! (+25 XP)</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-rose-400" />
                  <span className="text-rose-300">Incorrecto - Revisión Clínica</span>
                </>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {card.explanation}
            </p>

            <div className="mt-3 pt-3 border-t border-white/10 flex items-start space-x-2 text-xs text-amber-300">
              <Lightbulb className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
              <span><strong>Perla de Examen:</strong> {card.highYieldPearl}</span>
            </div>
          </div>
        )}

        {/* Botón de Siguiente Tarjeta */}
        {isAnswered && (
          <div className="flex justify-end">
            <button
              onClick={handleNext}
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-900/30 active:scale-95 transition-all"
            >
              <span>{currentIndex < ANATOMY_FLASHCARDS.length - 1 ? "Siguiente Pregunta" : "Reiniciar Mazo"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </GlassCard>
    </div>
  );
}