"use client";

import React, { useState } from "react";
import { TAENIA_SOLIUM_LIFE_CYCLE } from "@/lib/data/parasitology/life-cycles-data";
import { LifeCycleStage } from "@/lib/data/parasitology/types";
import { 
  RotateCw, 
  ArrowRight, 
  ShieldAlert, 
  CheckCircle2, 
  MapPin, 
  User, 
  Sparkles, 
  Info,
  ChevronRight,
  ChevronLeft
} from "lucide-react";

export const LifeCycleDiagram: React.FC = () => {
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const cycle = TAENIA_SOLIUM_LIFE_CYCLE;
  const currentStage: LifeCycleStage = cycle.stages[currentStepIdx];

  const handleNext = () => {
    if (currentStepIdx < cycle.stages.length - 1) {
      setCurrentStepIdx(currentStepIdx + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx(currentStepIdx - 1);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Alerta de Criterio Clínico de Oro: Teniasis vs Cisticercosis */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-red-950/40 via-amber-950/30 to-slate-900 border border-red-500/30 shadow-xl flex items-start gap-3.5">
        <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <strong className="text-red-300 font-bold block uppercase tracking-wider text-[11px]">
            Regla Clínica Fundamental de Transmisión:
          </strong>
          <p className="text-slate-200 leading-relaxed font-medium">
            {cycle.differencesBetweenFormsNote}
          </p>
        </div>
      </div>

      {/* Stepper horizontal de fases */}
      <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar py-1">
          {cycle.stages.map((stg, idx) => {
            const isCurrent = idx === currentStepIdx;
            const isCompleted = idx < currentStepIdx;
            return (
              <button
                key={stg.stepNumber}
                onClick={() => setCurrentStepIdx(idx)}
                className={`flex-1 min-w-[130px] p-2.5 rounded-xl text-left transition-all relative ${
                  isCurrent
                    ? "bg-cyan-500/20 text-cyan-200 border border-cyan-500/50 shadow-sm"
                    : isCompleted
                    ? "bg-slate-800/60 text-slate-300 border border-slate-700/60"
                    : "bg-slate-900/40 text-slate-500 border border-slate-800/40 hover:bg-slate-800/40"
                }`}
              >
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <span>Fase {stg.stepNumber}</span>
                  {stg.isDiagnosticStage && (
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" title="Forma diagnóstica" />
                  )}
                  {stg.isInfectiveStage && (
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400" title="Forma infectante" />
                  )}
                </div>
                <div className="text-xs font-semibold truncate mt-0.5">
                  {stg.hostName.split("(")[0]}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tarjeta principal de la fase activa con navegación previa/siguiente */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-6">
        
        {/* Cabecera de la etapa */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/40 font-bold">
                Paso {currentStage.stepNumber} de {cycle.stages.length}
              </span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                currentStage.hostType.includes("Definitivo")
                  ? "bg-purple-950/60 text-purple-300 border-purple-800/40"
                  : "bg-amber-950/60 text-amber-300 border-amber-800/40"
              }`}>
                {currentStage.hostType}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white pt-2">
              {currentStage.title}
            </h3>
          </div>

          {/* Badges de Forma Infectante / Forma Diagnóstica */}
          <div className="flex flex-wrap gap-1.5">
            {currentStage.isInfectiveStage && (
              <span className="px-2.5 py-1 rounded-xl bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-semibold">
                Forma Infectante
              </span>
            )}
            {currentStage.isDiagnosticStage && (
              <span className="px-2.5 py-1 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold">
                Forma Diagnóstica
              </span>
            )}
          </div>
        </div>

        {/* Parámetros biológicos y topográficos de la fase */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-1">
            <span className="text-slate-400 block text-[11px] font-semibold uppercase tracking-wider">
              Hospedador involucrado:
            </span>
            <p className="font-bold text-slate-100 flex items-center gap-1.5 text-sm">
              <User className="w-4 h-4 text-cyan-400" />
              <span>{currentStage.hostName}</span>
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-1">
            <span className="text-slate-400 block text-[11px] font-semibold uppercase tracking-wider">
              Ubicación anatómica:
            </span>
            <p className="font-bold text-slate-100 flex items-center gap-1.5 text-sm">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>{currentStage.anatomicalLocation}</span>
            </p>
          </div>

        </div>

        {/* Transformación biológica */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Transformación biológica & Fisiopatología:
          </h4>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-800/20 p-4 rounded-2xl border border-slate-800">
            {currentStage.biologicalTransformation}
          </p>
        </div>

        {/* Vía de transmisión */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Vía de transmisión y propagación:
          </h4>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-800/20 p-4 rounded-2xl border border-slate-800">
            {currentStage.transmissionRoute}
          </p>
        </div>

        {/* Relevancia y significancia clínica */}
        <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-800/40 space-y-1.5">
          <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span>Significancia clínica y epidemiológica:</span>
          </span>
          <p className="text-xs text-cyan-100/90 leading-relaxed">
            {currentStage.clinicalSignificance}
          </p>
        </div>

        {/* Botones de navegación prev/next */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            onClick={handlePrev}
            disabled={currentStepIdx === 0}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              currentStepIdx === 0
                ? "text-slate-600 bg-slate-900 border border-slate-800 cursor-not-allowed"
                : "text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700"
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Fase anterior</span>
          </button>

          <span className="text-xs text-slate-500 font-mono">
            {currentStepIdx + 1} de {cycle.stages.length}
          </span>

          <button
            onClick={handleNext}
            disabled={currentStepIdx === cycle.stages.length - 1}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              currentStepIdx === cycle.stages.length - 1
                ? "text-slate-600 bg-slate-900 border border-slate-800 cursor-not-allowed"
                : "text-cyan-200 bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500/50"
            }`}
          >
            <span>Fase siguiente</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};
