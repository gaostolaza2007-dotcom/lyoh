"use client";

import React, { useState, useRef } from "react";
import { HISTOLOGY_SLIDES, HistologyPin } from "@/lib/medical-data";
import { GlassCard } from "@/components/ui/GlassCard";
import { useAuth } from "@/lib/auth-context";
import { 
  Microscope, 
  MapPin, 
  X, 
  Sparkles, 
  ZoomIn, 
  Eye, 
  Info, 
  BookOpen, 
  CheckCircle2, 
  AlertTriangle,
  PlusCircle,
  RotateCcw
} from "lucide-react";

export default function HistologiaPage() {
  const { addXp, updateUnitProgress } = useAuth();
  const slide = HISTOLOGY_SLIDES[0];

  // Pines existentes más pines que el usuario crea haciendo clic
  const [pins, setPins] = useState<HistologyPin[]>(slide.pins);
  const [activeModalPin, setActiveModalPin] = useState<HistologyPin | null>(null);
  const [discoveredPinIds, setDiscoveredPinIds] = useState<string[]>([]);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [mode, setMode] = useState<"explore" | "addPin">("explore");

  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Manejador de clics/toques en la imagen histológica
  const handleImageClick = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();

    let clientX = 0;
    let clientY = 0;

    if ("touches" in e) {
      if (e.touches.length === 0) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const xPercent = Math.round(((clientX - rect.left) / rect.width) * 100);
    const yPercent = Math.round(((clientY - rect.top) / rect.height) * 100);

    // Si está en modo agregar pin o si hace clic libre
    if (mode === "addPin") {
      const newPin: HistologyPin = {
        id: `user-pin-${Date.now()}`,
        xPercent,
        yPercent,
        label: `Marcador Clínico (${xPercent}%, ${yPercent}%)`,
        structure: "Punto de Interés Tisular",
        tissueType: "Tejido Renal",
        staining: "Hematoxilina & Eosina",
        description: `Marcador ubicado en las coordenadas relativas del corte histológico a (${xPercent}%, ${yPercent}%). Utilizado para análisis citológico comparativo.`,
        clinicalSignificance: "Permite correlacionar la densidad celular y el grado de atipia citológica.",
        histologicalHallmark: "Presencia de núcleos basófilos y estroma eosinófilo circundante."
      };

      setPins((prev) => [...prev, newPin]);
      setActiveModalPin(newPin);
      addXp(15);
      setMode("explore");
    }
  };

  const handlePinClick = (e: React.MouseEvent, pin: HistologyPin) => {
    e.stopPropagation();
    setActiveModalPin(pin);

    if (!discoveredPinIds.includes(pin.id)) {
      setDiscoveredPinIds((prev) => [...prev, pin.id]);
      addXp(25);
      updateUnitProgress("histologia", "tejidos", Math.min(100, (discoveredPinIds.length + 1) * 35));
    }
  };

  const handleDeleteUserPin = (pinId: string) => {
    setPins((prev) => prev.filter((p) => p.id !== pinId));
    setActiveModalPin(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header del Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center space-x-2 text-pink-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Microscope className="w-4 h-4" />
            <span>Módulo 03</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Histología: Microscopía Virtual Tisular
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Haz clic en los marcadores interactivos para inspeccionar criterios histológicos, o toca cualquier zona para añadir un nuevo pin.
          </p>
        </div>

        {/* Controles de Vista */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setMode(mode === "addPin" ? "explore" : "addPin")}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
              mode === "addPin"
                ? "bg-pink-600 border-pink-400 text-white shadow-lg shadow-pink-900/40 animate-pulse"
                : "bg-white/5 border-white/10 text-slate-300 hover:text-white"
            }`}
          >
            <PlusCircle className="w-4 h-4 text-pink-400" />
            <span>{mode === "addPin" ? "Toca la imagen para marcar" : "+ Agregar Marcador"}</span>
          </button>

          <button
            onClick={() => setZoomLevel((z) => (z === 1 ? 1.4 : z === 1.4 ? 1.8 : 1))}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 hover:text-white transition-colors"
          >
            <ZoomIn className="w-4 h-4 text-purple-400" />
            <span>Zoom {zoomLevel}x</span>
          </button>
        </div>
      </div>

      {/* Contenedor del Microscopio Virtual */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Visor de Micrografía (3 Columnas) */}
        <div className="lg:col-span-3 space-y-3">
          <GlassCard className="relative w-full rounded-3xl overflow-hidden border border-white/15 shadow-2xl bg-slate-950">
            
            {/* Barra de información del corte */}
            <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
              <div className="pointer-events-auto bg-slate-950/80 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-white/10 text-xs">
                <span className="font-bold text-white block">{slide.title}</span>
                <span className="text-[10px] text-pink-300">{slide.staining}</span>
              </div>

              <div className="pointer-events-auto flex items-center space-x-1 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/10 text-xs text-purple-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-bold">{discoveredPinIds.length} / {pins.length}</span>
                <span className="text-[10px] text-slate-400 hidden sm:inline">Pines Explorados</span>
              </div>
            </div>

            {/* Lienzo de Imagen con Soporte Táctil y Puntero */}
            <div
              ref={imageContainerRef}
              onClick={handleImageClick}
              className={`
                relative w-full h-[400px] sm:h-[500px] overflow-hidden select-none touch-manipulation
                ${mode === "addPin" ? "cursor-crosshair" : "cursor-default"}
              `}
            >
              {/* Imagen del corte histológico */}
              <div
                className="w-full h-full transition-transform duration-300 ease-out origin-center"
                style={{ transform: `scale(${zoomLevel})` }}
              >
                <img
                  src={slide.imageUrl}
                  alt={slide.title}
                  className="w-full h-full object-cover pointer-events-none opacity-90 contrast-125 saturate-110"
                />

                {/* Filtro de color de tinción de contraste */}
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-950/40 via-transparent to-pink-950/30 pointer-events-none" />

                {/* Marcadores / Pines Interactivos */}
                {pins.map((pin) => {
                  const isDiscovered = discoveredPinIds.includes(pin.id);
                  const isUserPin = pin.id.startsWith("user-pin");

                  return (
                    <button
                      key={pin.id}
                      onClick={(e) => handlePinClick(e, pin)}
                      style={{
                        left: `${pin.xPercent}%`,
                        top: `${pin.yPercent}%`,
                      }}
                      className={`
                        absolute -translate-x-1/2 -translate-y-1/2 z-10
                        group flex items-center justify-center p-2 rounded-full
                        transition-all duration-200 active:scale-90 touch-target
                        ${isDiscovered 
                          ? "bg-purple-600/90 text-white shadow-[0_0_15px_rgba(168,85,247,0.8)] ring-4 ring-purple-400/30" 
                          : isUserPin 
                          ? "bg-pink-600/90 text-white shadow-[0_0_15px_rgba(236,72,153,0.8)] ring-4 ring-pink-400/30"
                          : "bg-amber-500/90 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.8)] animate-bounce"}
                      `}
                    >
                      <MapPin className="w-5 h-5 fill-current" />
                      
                      {/* Tooltip en hover */}
                      <span className="absolute bottom-full mb-2 hidden group-hover:block whitespace-nowrap bg-slate-950/90 backdrop-blur-md px-2.5 py-1 rounded-xl text-[10px] font-bold text-white border border-white/10 shadow-lg">
                        {pin.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Hint inferior */}
            <div className="p-3 bg-slate-950/80 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
              <span>{mode === "addPin" ? "🎯 Haz clic o toca en cualquier punto para crear un pin de estudio" : "💡 Toca cualquier pin marcado para ver el análisis tisular"}</span>
              <span className="text-pink-400 font-semibold">Corteza Renal H&E</span>
            </div>
          </GlassCard>
        </div>

        {/* Lista de Estructuras del Corte (1 Columna) */}
        <GlassCard className="p-5 border border-white/15 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2 pb-2 border-b border-white/10">
              <Eye className="w-4 h-4 text-pink-400" />
              <span>Estructuras Identificadas</span>
            </h3>

            <div className="space-y-2">
              {pins.map((pin, i) => {
                const isDiscovered = discoveredPinIds.includes(pin.id);
                return (
                  <button
                    key={pin.id}
                    onClick={() => setActiveModalPin(pin)}
                    className={`
                      w-full p-3 rounded-2xl border text-left transition-all flex items-start space-x-2.5
                      ${isDiscovered 
                        ? "bg-purple-950/30 border-purple-500/40 text-slate-200" 
                        : "bg-slate-950/40 border-white/10 text-slate-400 hover:text-white"}
                    `}
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      isDiscovered ? "bg-purple-500/20 text-purple-300" : "bg-white/5 text-slate-500"
                    }`}>
                      {isDiscovered ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <span>{i + 1}</span>}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-bold block truncate">{pin.label}</span>
                      <span className="text-[10px] text-slate-400 block truncate">{pin.tissueType}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-pink-950/20 border border-pink-500/20 text-[11px] text-pink-200">
            <strong>Tinción H&E:</strong> La Hematoxilina (básica) tiñe los ácidos nucleicos de azul/morado, mientras que la Eosina (ácida) tiñe las proteínas citosólicas de rosado.
          </div>
        </GlassCard>

      </div>

      {/* Modal Superpuesto Explicativo Inmediato con Glassmorphism */}
      {activeModalPin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-lg glass-panel rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl relative animate-in zoom-in-95 duration-200">
            
            {/* Botón de cierre */}
            <button
              onClick={() => setActiveModalPin(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Encabezado del Pin */}
            <div className="flex items-center space-x-2 text-xs font-bold text-pink-400 uppercase tracking-wider mb-2">
              <Microscope className="w-4 h-4" />
              <span>Análisis Histopatológico • {activeModalPin.staining}</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">
              {activeModalPin.label}
            </h3>
            <p className="text-xs text-purple-300 font-medium mb-4">
              {activeModalPin.structure} ({activeModalPin.tissueType})
            </p>

            {/* Contenido descriptivo */}
            <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
              <p className="p-3 rounded-2xl bg-slate-950/60 border border-white/5">
                {activeModalPin.description}
              </p>

              <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 space-y-1">
                <span className="text-xs font-bold text-purple-300 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Criterio Histológico Clave:</span>
                </span>
                <p className="text-xs text-slate-300">
                  {activeModalPin.histologicalHallmark}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 space-y-1">
                <span className="text-xs font-bold text-rose-300 flex items-center space-x-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Relevancia Diagnóstica & Patológica:</span>
                </span>
                <p className="text-xs text-slate-300">
                  {activeModalPin.clinicalSignificance}
                </p>
              </div>
            </div>

            {/* Footer del Modal */}
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
              {activeModalPin.id.startsWith("user-pin") ? (
                <button
                  onClick={() => handleDeleteUserPin(activeModalPin.id)}
                  className="px-3 py-1.5 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 border border-rose-500/20"
                >
                  Eliminar este pin
                </button>
              ) : (
                <span className="text-[11px] text-emerald-400 font-semibold flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Estructura Verificada (+25 XP)</span>
                </span>
              )}

              <button
                onClick={() => setActiveModalPin(null)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-bold shadow-lg shadow-purple-900/30 transition-all active:scale-95"
              >
                Entendido
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}