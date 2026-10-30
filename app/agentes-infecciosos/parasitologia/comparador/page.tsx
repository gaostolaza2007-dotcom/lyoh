"use client";

import React, { useState } from "react";
import { MicroscopicComparator } from "@/components/modules/parasitologia/MicroscopicComparator";
import { SampleSimulator } from "@/components/modules/parasitologia/SampleSimulator";
import { ComparisonTable } from "@/components/modules/parasitologia/ComparisonTable";
import { GitCompare, Microscope, ArrowRightLeft, FlaskConical } from "lucide-react";

export default function ComparadorPage() {
  const [activeTab, setActiveTab] = useState<"simulator" | "microscopic" | "species">("simulator");
  const [externalCompId, setExternalCompId] = useState<string | null>(null);

  const handleOpenComparatorPair = (comparisonId: string) => {
    setExternalCompId(comparisonId);
    setActiveTab("microscopic");
  };

  return (
    <div className="space-y-4">
      {/* Encabezado compacto con selector de modo */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <GitCompare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white">
              Comparador Microscópico y Simulador de Muestras
            </h2>
            <p className="text-xs text-slate-400">
              Preparación configurable y exploración microscópica de referencia · Parasitología Médica
            </p>
          </div>
        </div>

        <div
          className="flex flex-col sm:flex-row flex-wrap gap-1.5 p-1 bg-slate-900/90 rounded-2xl border border-slate-800"
          role="tablist"
          aria-label="Modo del comparador de parasitología"
        >
          <button
            type="button"
            onClick={() => setActiveTab("simulator")}
            className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === "simulator"
                ? "bg-cyan-500/20 text-cyan-200 border border-cyan-500/50 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent"
            }`}
            aria-selected={activeTab === "simulator"}
            role="tab"
          >
            <FlaskConical className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Simulador de muestras</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("microscopic")}
            className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === "microscopic"
                ? "bg-cyan-500/20 text-cyan-200 border border-cyan-500/50 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent"
            }`}
            aria-selected={activeTab === "microscopic"}
            role="tab"
          >
            <Microscope className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Campo Microscópico (Muestras vs Artefactos)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("species")}
            className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === "species"
                ? "bg-emerald-500/20 text-emerald-200 border border-emerald-500/50 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent"
            }`}
            aria-selected={activeTab === "species"}
            role="tab"
          >
            <ArrowRightLeft className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Cuadro Diferencial entre Especies</span>
          </button>
        </div>
      </div>

      {/* Contenido según el modo activo (se mantienen montados el simulador y el comparador para conservar muestra, encuadre y observaciones al alternar) */}
      <div className={activeTab === "simulator" ? "block" : "hidden"}>
        <SampleSimulator onOpenComparisonTab={handleOpenComparatorPair} />
      </div>

      <div className={activeTab === "microscopic" ? "block" : "hidden"}>
        <MicroscopicComparator externalComparisonId={externalCompId} />
      </div>

      {activeTab === "species" && <ComparisonTable />}
    </div>
  );
}
