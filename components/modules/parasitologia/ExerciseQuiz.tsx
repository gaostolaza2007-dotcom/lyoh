"use client";

import React, { useState } from "react";
import { PARASITOLOGY_EXERCISES } from "@/lib/data/parasitology/exercises-data";
import { ParasitologyExercise } from "@/lib/data/parasitology/types";
import { 
  GraduationCap, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Sparkles, 
  RotateCcw, 
  Award,
  ChevronRight,
  ChevronLeft
} from "lucide-react";

export const ExerciseQuiz: React.FC = () => {
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [showFeedback, setShowFeedback] = useState<Record<string, boolean>>({});

  const exercise = PARASITOLOGY_EXERCISES[currentIdx];
  const selectedOptionId = userAnswers[exercise.id];
  const isFeedbackVisible = showFeedback[exercise.id] || false;

  const handleSelectOption = (optionId: string) => {
    setUserAnswers((prev) => ({ ...prev, [exercise.id]: optionId }));
    setShowFeedback((prev) => ({ ...prev, [exercise.id]: true }));
  };

  const handleResetCurrent = () => {
    setUserAnswers((prev) => {
      const next = { ...prev };
      delete next[exercise.id];
      return next;
    });
    setShowFeedback((prev) => {
      const next = { ...prev };
      delete next[exercise.id];
      return next;
    });
  };

  // Conteo de respuestas correctas
  const totalExercises = PARASITOLOGY_EXERCISES.length;
  const answeredCount = Object.keys(userAnswers).length;
  const correctCount = PARASITOLOGY_EXERCISES.filter((ex) => {
    const selected = userAnswers[ex.id];
    if (!selected) return false;
    const opt = ex.options.find((o) => o.id === selected);
    return opt?.isCorrect || false;
  }).length;

  return (
    <div className="space-y-6">
      
      {/* Barra de progreso y puntaje formativo */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-slate-200">
            Autoevaluación Formativa de Parasitología
          </span>
          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[11px]">
            {answeredCount} de {totalExercises} completados
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400">Aciertos:</span>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
            {correctCount} / {totalExercises}
          </span>
        </div>
      </div>

      {/* Selector directo de ejercicios */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {PARASITOLOGY_EXERCISES.map((ex, idx) => {
          const isCurrent = idx === currentIdx;
          const isAnswered = !!userAnswers[ex.id];
          const isCorrect = isAnswered && ex.options.find((o) => o.id === userAnswers[ex.id])?.isCorrect;

          return (
            <button
              key={ex.id}
              onClick={() => setCurrentIdx(idx)}
              className={`flex-1 min-w-[120px] px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left flex items-center justify-between gap-1.5 ${
                isCurrent
                  ? "bg-cyan-500/25 text-cyan-200 border border-cyan-500/50 shadow-md shadow-cyan-950/40"
                  : "bg-slate-900/50 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800"
              }`}
            >
              <span className="truncate">Ej. {idx + 1}</span>
              {isAnswered && (
                isCorrect ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                )
              )}
            </button>
          );
        })}
      </div>

      {/* Tarjeta del ejercicio activo */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-6">
        
        {/* Cabecera del ejercicio */}
        <div className="space-y-2 pb-4 border-b border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/40 font-bold">
              {exercise.categoryLabel}
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-semibold">
              Dificultad: {exercise.difficulty}
            </span>
            {exercise.isSimulatedCase && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                Caso clínico simulado
              </span>
            )}
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-white pt-1">
            {exercise.title}
          </h3>

          {/* Contexto clínico si aplica */}
          {exercise.clinicalContext && (
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
              {exercise.clinicalContext}
            </div>
          )}

          {/* Pregunta */}
          <p className="text-sm sm:text-base text-slate-100 font-semibold leading-relaxed pt-1">
            {exercise.question}
          </p>
        </div>

        {/* Opciones de respuesta */}
        <div className="space-y-3">
          {exercise.options.map((opt) => {
            const isSelected = selectedOptionId === opt.id;
            let btnStyle = "bg-slate-800/40 text-slate-200 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700";

            if (isFeedbackVisible) {
              if (opt.isCorrect) {
                btnStyle = "bg-emerald-950/40 text-emerald-200 border-emerald-500/60 font-semibold";
              } else if (isSelected) {
                btnStyle = "bg-red-950/40 text-red-200 border-red-500/60";
              } else {
                btnStyle = "bg-slate-900/30 text-slate-500 border-slate-800/40 opacity-60";
              }
            } else if (isSelected) {
              btnStyle = "bg-cyan-500/20 text-cyan-200 border-cyan-500/50";
            }

            return (
              <div key={opt.id} className="space-y-2">
                <button
                  onClick={() => handleSelectOption(opt.id)}
                  disabled={isFeedbackVisible}
                  className={`w-full text-left p-4 rounded-2xl border text-xs sm:text-sm transition-all flex items-start gap-3 shadow-sm ${btnStyle}`}
                >
                  <div className="w-5 h-5 rounded-full border border-slate-600 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                    {opt.id.replace("opt-", "").toUpperCase().slice(0, 1)}
                  </div>
                  <div className="flex-1 leading-relaxed">{opt.text}</div>
                </button>

                {/* Explicación inmediata de cada opción tras responder */}
                {isFeedbackVisible && (isSelected || opt.isCorrect) && (
                  <div
                    className={`ml-8 p-3 rounded-xl text-xs leading-relaxed border ${
                      opt.isCorrect
                        ? "bg-emerald-950/30 text-emerald-200 border-emerald-800/40"
                        : "bg-red-950/30 text-red-200 border-red-800/40"
                    }`}
                  >
                    <strong className="block mb-0.5">
                      {opt.isCorrect ? "Fundamentación:" : "Por qué es incorrecta:"}
                    </strong>
                    {opt.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Panel de retroalimentación general y perla diagnóstica */}
        {isFeedbackVisible && (
          <div className="space-y-4 pt-4 border-t border-slate-800">
            
            <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-800/30 text-xs text-slate-300 space-y-1">
              <strong className="text-cyan-300 block font-semibold">Síntesis explicativa:</strong>
              <p className="leading-relaxed">{exercise.generalFeedback}</p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-200 space-y-1">
              <strong className="text-amber-300 block font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Perla diagnóstica esencial:</span>
              </strong>
              <p className="leading-relaxed">{exercise.diagnosticPearl}</p>
            </div>

            {exercise.clinicalWarning && (
              <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700 text-[11px] text-slate-400">
                <strong className="text-slate-300 block mb-0.5">Nota preventiva:</strong>
                {exercise.clinicalWarning}
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
              <span>Fuente: {exercise.source}</span>
              <button
                onClick={handleResetCurrent}
                className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reintentar este ejercicio</span>
              </button>
            </div>

          </div>
        )}

        {/* Navegación entre ejercicios */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
            disabled={currentIdx === 0}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              currentIdx === 0
                ? "text-slate-600 bg-slate-900 border border-slate-800 cursor-not-allowed"
                : "text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700"
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Anterior</span>
          </button>

          <span className="text-xs text-slate-500 font-mono">
            Ejercicio {currentIdx + 1} de {totalExercises}
          </span>

          <button
            onClick={() => setCurrentIdx(Math.min(totalExercises - 1, currentIdx + 1))}
            disabled={currentIdx === totalExercises - 1}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              currentIdx === totalExercises - 1
                ? "text-slate-600 bg-slate-900 border border-slate-800 cursor-not-allowed"
                : "text-cyan-200 bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500/50"
            }`}
          >
            <span>Siguiente</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};
