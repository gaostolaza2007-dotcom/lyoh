"use client";

import React, { useState } from "react";
import { MICROSCOPY_ENTRIES } from "@/lib/data/parasitology/microscopy-data";
import { MicroscopyEntry } from "@/lib/data/parasitology/types";
import { 
  Microscope, 
  ZoomIn, 
  ShieldCheck, 
  FileText, 
  Layers, 
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Sliders
} from "lucide-react";

export const MicroscopyViewer: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string>(MICROSCOPY_ENTRIES[0].id);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showReticle, setShowReticle] = useState<boolean>(true);
  const [activeFeatureIdx, setActiveFeatureIdx] = useState<number | null>(null);

  const currentEntry: MicroscopyEntry =
    MICROSCOPY_ENTRIES.find((e: MicroscopyEntry) => e.id === selectedId) || MICROSCOPY_ENTRIES[0];

  const handleZoomToggle = () => {
    setZoomLevel((prev) => (prev === 1 ? 1.5 : prev === 1.5 ? 2.2 : 1));
  };

  return (
    <div className="space-y-6">
      {/* Selector de láminas / preparaciones */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-900/80 rounded-2xl border border-slate-800">
        {MICROSCOPY_ENTRIES.map((entry: MicroscopyEntry) => {
          const isSelected = entry.id === selectedId;
          return (
            <button
              key={entry.id}
              onClick={() => {
                setSelectedId(entry.id);
                setZoomLevel(1);
                setActiveFeatureIdx(null);
              }}
              className={`flex-1 min-w-[150px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all text-left ${
                isSelected
                  ? "bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent"
              }`}
            >
              <div className="font-bold truncate">{entry.stageName}</div>
              <div className="text-[11px] font-normal text-slate-400 italic truncate">
                {entry.speciesName}
              </div>
            </button>
          );
        })}
      </div>

      {/* Visor de microscopio virtual y panel de metadatos */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Campo del microscopio virtual */}
        <div className="lg:col-span-7 space-y-3">
          <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-black aspect-square max-h-[500px] w-full flex items-center justify-center shadow-2xl">
            
            {/* Círculo del campo visual del ocular */}
            <div
              className="relative w-[92%] h-[92%] rounded-full overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-black border-4 border-slate-800/80 flex items-center justify-center cursor-crosshair shadow-inner"
              onClick={handleZoomToggle}
            >
              {/* Retícula del micrómetro ocular */}
              {showReticle && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30">
                  <div className="w-full h-[1px] bg-cyan-400" />
                  <div className="h-full w-[1px] bg-cyan-400 absolute" />
                  <div className="w-48 h-48 rounded-full border border-cyan-400 absolute" />
                  <div className="w-24 h-24 rounded-full border border-cyan-400 absolute" />
                </div>
              )}

              {/* Renderizado de la preparación microscópica según ID */}
              <div
                className="transition-transform duration-300 ease-out flex items-center justify-center"
                style={{ transform: `scale(${zoomLevel})` }}
              >
                {/* Visualización esquemática de alta fidelidad según la muestra */}
                {currentEntry.id === "mic-ts-egg" && (
                  <div className="relative w-44 h-44 rounded-full bg-gradient-to-br from-amber-700 via-amber-800 to-amber-950 border-[10px] border-amber-900 shadow-2xl flex items-center justify-center">
                    {/* Estriaciones radiales del embrióforo */}
                    <div className="absolute inset-1 rounded-full border-4 border-dashed border-amber-500/70 opacity-80 animate-pulse" />
                    {/* Oncosfera central */}
                    <div className="w-24 h-24 rounded-full bg-amber-100/90 shadow-inner flex items-center justify-center relative">
                      {/* 6 ganchos quitinosos refractiles en pares */}
                      <div className="w-2 h-7 bg-amber-900 rounded rotate-12 absolute left-6 top-6" />
                      <div className="w-2 h-7 bg-amber-900 rounded -rotate-12 absolute left-6 bottom-6" />
                      <div className="w-2 h-7 bg-amber-900 rounded absolute left-11" />
                      <div className="w-2 h-7 bg-amber-900 rounded absolute right-11" />
                      <div className="w-2 h-7 bg-amber-900 rounded -rotate-12 absolute right-6 top-6" />
                      <div className="w-2 h-7 bg-amber-900 rounded rotate-12 absolute right-6 bottom-6" />
                    </div>
                  </div>
                )}

                {currentEntry.id === "mic-ts-proglottid" && (
                  <div className="w-40 h-56 rounded-2xl bg-slate-200 border-4 border-slate-400 p-3 shadow-2xl flex flex-col items-center justify-center relative overflow-hidden">
                    {/* Tallo uterino medial con tinta china */}
                    <div className="w-2 h-44 bg-slate-900 rounded-full" />
                    {/* 9 ramas primarias por lado (7 a 13) */}
                    {[...Array(9)].map((_, i) => (
                      <React.Fragment key={i}>
                        <div
                          className="h-1 bg-slate-900 rounded-full absolute"
                          style={{
                            top: `${18 + i * 9}%`,
                            left: "14%",
                            width: "35%",
                            transform: `rotate(${i % 2 === 0 ? -12 : -5}deg)`,
                          }}
                        />
                        <div
                          className="h-1 bg-slate-900 rounded-full absolute"
                          style={{
                            top: `${18 + i * 9}%`,
                            right: "14%",
                            width: "35%",
                            transform: `rotate(${i % 2 === 0 ? 12 : 5}deg)`,
                          }}
                        />
                      </React.Fragment>
                    ))}
                    {/* Poro genital lateral */}
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-5 bg-slate-900 rounded-l-full" />
                  </div>
                )}

                {currentEntry.id === "mic-ts-scolex" && (
                  <div className="relative w-48 h-56 flex flex-col items-center justify-center">
                    {/* Rostelo saliente */}
                    <div className="w-20 h-14 bg-amber-600 rounded-t-full border-2 border-amber-800 flex items-center justify-center relative z-10">
                      {/* Doble corona de ganchos */}
                      <div className="absolute -bottom-1 flex gap-1">
                        {[...Array(10)].map((_, i) => (
                          <div key={i} className="w-1.5 h-3 bg-red-600 rounded-full" />
                        ))}
                      </div>
                    </div>
                    {/* Cabeza del escólex */}
                    <div className="w-40 h-36 bg-slate-300 rounded-2xl border-4 border-slate-400 -mt-2 flex items-center justify-around px-2 relative">
                      {/* Ventosas */}
                      <div className="w-12 h-12 rounded-full border-4 border-cyan-800 bg-cyan-950 flex items-center justify-center" />
                      <div className="w-12 h-12 rounded-full border-4 border-cyan-800 bg-cyan-950 flex items-center justify-center" />
                    </div>
                    {/* Cuello proliferativo */}
                    <div className="w-24 h-12 bg-slate-400 rounded-b-xl border-x-4 border-b-4 border-slate-500" />
                  </div>
                )}

                {currentEntry.id === "mic-ts-cysticercus" && (
                  <div className="relative w-52 h-44 rounded-full bg-sky-900/40 border-4 border-sky-400/60 p-4 shadow-2xl flex items-center justify-center backdrop-blur-sm">
                    {/* Pared vesicular */}
                    <div className="absolute inset-2 rounded-full border border-sky-200/40" />
                    {/* Escólex invaginado */}
                    <div className="w-20 h-20 rounded-full bg-amber-100 border-2 border-amber-300 shadow-lg flex items-center justify-center relative translate-x-4">
                      <div className="w-6 h-6 rounded-full border-2 border-red-500 bg-red-900/50" />
                      <div className="absolute text-[8px] font-bold text-slate-800 -bottom-4">
                        Escólex
                      </div>
                    </div>
                  </div>
                )}

                {currentEntry.id === "mic-tsa-proglottid" && (
                  <div className="w-36 h-64 rounded-2xl bg-slate-200 border-4 border-slate-400 p-3 shadow-2xl flex flex-col items-center justify-center relative overflow-hidden">
                    {/* Tallo uterino medial */}
                    <div className="w-1.5 h-52 bg-slate-900 rounded-full" />
                    {/* 22 ramas primarias delgadas profusas (> 15) */}
                    {[...Array(20)].map((_, i) => (
                      <React.Fragment key={i}>
                        <div
                          className="h-0.5 bg-slate-900 rounded-full absolute"
                          style={{
                            top: `${10 + i * 4.2}%`,
                            left: "10%",
                            width: "38%",
                          }}
                        />
                        <div
                          className="h-0.5 bg-slate-900 rounded-full absolute"
                          style={{
                            top: `${10 + i * 4.2}%`,
                            right: "10%",
                            width: "38%",
                          }}
                        />
                      </React.Fragment>
                    ))}
                    {/* Poro genital lateral */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-5 bg-slate-900 rounded-r-full" />
                  </div>
                )}

                {currentEntry.id === "mic-hn-egg" && (
                  <div className="relative w-44 h-40 rounded-full bg-slate-200/90 border-2 border-slate-400 shadow-2xl flex items-center justify-center">
                    {/* Espacio hialino con filamentos polares */}
                    <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-slate-500 flex items-center justify-center relative">
                      {/* Filamentos polares que emergen de los extremos */}
                      <div className="absolute -top-3 w-8 h-2 border-t-2 border-slate-700 rounded-full" />
                      <div className="absolute -bottom-3 w-8 h-2 border-b-2 border-slate-700 rounded-full" />
                      {/* Oncosfera con 6 ganchos */}
                      <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-300 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-amber-900">6 ganchos</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Barra de escala en la esquina inferior */}
              <div className="absolute bottom-6 right-8 bg-black/80 backdrop-blur-md px-3 py-1 rounded-md border border-white/20 text-[10px] font-mono text-cyan-300 pointer-events-none">
                Escala: {currentEntry.approximateSize} · {currentEntry.magnification || "400x"}
              </div>

              {/* Indicador de zoom */}
              <div className="absolute top-6 left-8 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/20 text-[10px] font-mono text-white pointer-events-none">
                Zoom ocular: {zoomLevel}x (Toca para alternar)
              </div>
            </div>
          </div>

          {/* Controles de visor */}
          <div className="flex items-center justify-between text-xs px-2 text-slate-400">
            <span>Haz clic sobre el círculo para cambiar el aumento (1x / 1.5x / 2.2x).</span>
            <button
              onClick={() => setShowReticle(!showReticle)}
              className="text-cyan-400 hover:text-cyan-300 font-medium"
            >
              {showReticle ? "Ocultar micrómetro" : "Mostrar micrómetro"}
            </button>
          </div>
        </div>

        {/* Panel lateral con características diagnósticas, técnica y procedencia */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Tarjeta de identificación diagnóstica */}
          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
            
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/40 font-semibold">
                  {currentEntry.imageType === "ilustracion_cientifica"
                    ? "Ilustración científica estandarizada"
                    : "Microfotografía referencial de catálogo"}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {currentEntry.magnification}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white pt-1">{currentEntry.stageName}</h3>
              <p className="text-xs font-medium text-cyan-400 italic">{currentEntry.speciesName}</p>
            </div>

            {/* Parámetros técnicos de laboratorio */}
            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <span className="text-slate-400 block text-[11px]">Tipo de muestra:</span>
                <span className="font-semibold text-slate-200">{currentEntry.sampleType}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <span className="text-slate-400 block text-[11px]">Tinción / Técnica:</span>
                <span className="font-semibold text-slate-200">{currentEntry.stainTechnique}</span>
              </div>
            </div>

            {/* Elementos identificables con click interactivo */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Estructuras clave identificables:
              </h4>
              <div className="space-y-1.5">
                {currentEntry.identifiableFeatures.map((feat: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setActiveFeatureIdx(activeFeatureIdx === idx ? null : idx)}
                    className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-start gap-2 ${
                      activeFeatureIdx === idx
                        ? "bg-cyan-500/20 text-cyan-100 border border-cyan-500/40 font-semibold"
                        : "bg-slate-800/40 text-slate-300 border border-slate-800 hover:bg-slate-800/80"
                    }`}
                  >
                    <CheckCircle2
                      className={`w-4 h-4 shrink-0 mt-0.5 ${
                        activeFeatureIdx === idx ? "text-cyan-400" : "text-slate-500"
                      }`}
                    />
                    <span className="leading-relaxed">{feat}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Relevancia diagnóstica */}
            <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-800/30 space-y-1">
              <span className="text-xs font-bold text-cyan-300 block">
                Criterio diagnóstico esencial:
              </span>
              <p className="text-xs text-cyan-100/90 leading-relaxed">
                {currentEntry.diagnosticRelevance}
              </p>
            </div>

            {/* Procedencia oficial y licencia */}
            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center justify-between">
                <span>Procedencia: <strong>{currentEntry.provenance}</strong></span>
                <span className="text-emerald-400 font-medium">{currentEntry.license}</span>
              </div>
              <p className="text-slate-500">{currentEntry.attribution}</p>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
