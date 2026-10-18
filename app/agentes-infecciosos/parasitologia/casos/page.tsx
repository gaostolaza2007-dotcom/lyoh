"use client";

import React from "react";
import { ExerciseQuiz } from "@/components/modules/parasitologia/ExerciseQuiz";
import { GraduationCap } from "lucide-react";

export default function CasosPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-indigo-400" />
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Casos Clínicos & Ejercicios Interactivos
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-4xl">
          Ejercicios pedagógicos interactivos con retroalimentación inmediata: reconocimiento de estructuras anatómicas, comparación morfológica diagnóstica, secuenciación del ciclo de vida, selección razonada de métodos complementarios y resolución de casos clínicos simulados.
        </p>
      </div>

      <ExerciseQuiz />
    </div>
  );
}
