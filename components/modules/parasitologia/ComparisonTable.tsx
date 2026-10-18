"use client";

import React, { useState } from "react";
import { COMPARISON_ENTRIES } from "@/lib/data/parasitology/comparisons-data";
import { ComparisonEntry } from "@/lib/data/parasitology/types";
import { 
  GitCompare, 
  AlertTriangle, 
  CheckCircle2, 
  BookOpen, 
  Sparkles,
  ArrowRightLeft,
  ChevronRight
} from "lucide-react";

export const ComparisonTable: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string>(COMPARISON_ENTRIES[0].id);

  const currentPair =
    COMPARISON_ENTRIES.find((c) => c.id === selectedId) || COMPARISON_ENTRIES[0];

  return (
    <div className="space-y-6">
      {/* Selector de pares comparativos */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-900/80 rounded-2xl border border-slate-800">
        {COMPARISON_ENTRIES.map((entry) => {
          const isSelected = entry.id === selectedId;
          return (
            <button
              key={entry.id}
              onClick={() => setSelectedId(entry.id)}
              className={`flex-1 min-w-[200px] px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all text-left ${
                isSelected
                  ? "bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent"
              }`}
            >
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
                <span className="font-bold truncate">{entry.formA.speciesName} vs {entry.formB.speciesName}</span>
              </div>
              <div className="text-[11px] font-normal text-slate-400 truncate mt-0.5">
                {entry.formA.stage}
              </div>
            </button>
          );
        })}
      </div>

      {/* Escenario clínico disparador de la necesidad comparativa */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs space-y-1.5">
        <span className="text-cyan-400 font-bold uppercase tracking-wider text-[11px] block">
          Escenario de sospecha diagnóstica:
        </span>
        <p className="text-slate-300 leading-relaxed">{currentPair.clinicalScenario}</p>
      </div>

      {/* Cuadro comparativo lado a lado (desktop) y apilado (móvil) */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 overflow-hidden shadow-2xl">
        
        {/* Cabecera de los dos miembros del par */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800 bg-slate-950/80 border-b border-slate-800">
          
          {/* Forma A */}
          <div className="p-4 sm:p-5 space-y-1">
            <span className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider">
              {currentPair.formA.group}
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-white italic">
              {currentPair.formA.speciesName}
            </h3>
            <p className="text-xs text-slate-400 font-medium">{currentPair.formA.stage}</p>
          </div>

          {/* Forma B */}
          <div className="p-4 sm:p-5 space-y-1 bg-slate-900/40">
            <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
              {currentPair.formB.group}
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-white italic">
              {currentPair.formB.speciesName}
            </h3>
            <p className="text-xs text-slate-400 font-medium">{currentPair.formB.stage}</p>
          </div>
        </div>

        {/* Filas de características lado a lado */}
        <div className="divide-y divide-slate-800/80 text-xs sm:text-sm">
          
          {/* 1. Tamaño y forma */}
          <div className="p-4 sm:p-5 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <h4 className="font-bold text-slate-200">1. Dimensiones, longitud y forma general</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-slate-300 leading-relaxed">
                {currentPair.features.sizeAndShape.a}
              </div>
              <div className="p-3 rounded-xl bg-slate-800/20 border border-slate-800 text-slate-300 leading-relaxed">
                {currentPair.features.sizeAndShape.b}
              </div>
            </div>
          </div>

          {/* 2. Pared, tegumento y motilidad */}
          <div className="p-4 sm:p-5 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <h4 className="font-bold text-slate-200">2. Pared, tegumento, cubierta y motilidad</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-slate-300 leading-relaxed">
                {currentPair.features.wallAndCovering.a}
              </div>
              <div className="p-3 rounded-xl bg-slate-800/20 border border-slate-800 text-slate-300 leading-relaxed">
                {currentPair.features.wallAndCovering.b}
              </div>
            </div>
          </div>

          {/* 3. Contenido interno */}
          <div className="p-4 sm:p-5 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <h4 className="font-bold text-slate-200">3. Estructuras internas y órganos reproductores</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-slate-300 leading-relaxed">
                {currentPair.features.internalContent.a}
              </div>
              <div className="p-3 rounded-xl bg-slate-800/20 border border-slate-800 text-slate-300 leading-relaxed">
                {currentPair.features.internalContent.b}
              </div>
            </div>
          </div>

          {/* 4. Estructuras patognomónicas definitivas */}
          <div className="p-4 sm:p-5 space-y-2 bg-cyan-950/15">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <h4 className="font-bold text-amber-200">4. Estructura patognomónica determinante</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/40 text-cyan-100 leading-relaxed font-medium">
                {currentPair.features.distinctiveStructures.a}
              </div>
              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/40 text-amber-100 leading-relaxed font-medium">
                {currentPair.features.distinctiveStructures.b}
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Similitudes engañosas y trampa diagnóstica frecuente */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Similitudes */}
        <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Similitudes que pueden confundir al clínico:</span>
          </h4>
          <ul className="space-y-1.5 text-xs text-slate-400">
            {currentPair.similarities.map((sim, i) => (
              <li key={i} className="flex items-start gap-2">
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                <span>{sim}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Trampa diagnóstica */}
        <div className="p-5 rounded-3xl bg-red-950/20 border border-red-900/40 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-red-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span>Trampas diagnósticas críticas:</span>
          </h4>
          <ul className="space-y-1.5 text-xs text-red-100/90 leading-relaxed">
            {currentPair.pitfalls.map((pf, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-red-400 font-bold">•</span>
                <span>{pf}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* Diferencias críticas y perla diagnóstica */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-cyan-500/10 border border-amber-500/25 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <strong className="text-amber-300 block font-bold">Diferencias críticas determinantes:</strong>
          <p className="text-slate-200 leading-relaxed">
            {currentPair.criticalDifferences.join(" · ")}
          </p>
        </div>
      </div>

    </div>
  );
};
