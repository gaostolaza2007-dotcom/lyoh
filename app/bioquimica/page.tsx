"use client";

import React, { useState, useRef, useEffect } from "react";
import confetti from "canvas-confetti";
import { BIOCHEMISTRY_ELEMENTS, PathwayElement } from "@/lib/medical-data";
import { useAuth } from "@/lib/auth-context";
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  FlaskConical, 
  BookOpen, 
  Sparkles, 
  CheckCircle2, 
  RotateCcw, 
  ChevronRight, 
  ChevronLeft, 
  Atom, 
  Zap, 
  Info,
  HelpCircle,
  GripHorizontal
} from "lucide-react";

interface Slot {
  index: number;
  label: string;
  stepName: string;
  energyType: "ATP Consumed" | "Committed Step" | "Net Yield";
  placedElement: PathwayElement | null;
}

export default function BioquimicaPage() {
  const { addXp, updateUnitProgress } = useAuth();
  
  // Lista de elementos en la paleta disponible
  const [palette, setPalette] = useState<PathwayElement[]>(BIOCHEMISTRY_ELEMENTS);
  
  // Ranuras del lienzo de glucólisis
  const [slots, setSlots] = useState<Slot[]>([
    { index: 0, label: "Sustrato Inicial", stepName: "Paso 0: Entrada de Hexosa", energyType: "ATP Consumed", placedElement: null },
    { index: 1, label: "Enzima Catalizadora", stepName: "Paso 1: Fosforilación Limitante", energyType: "ATP Consumed", placedElement: null },
    { index: 2, label: "Intermediario", stepName: "Paso 2: Encrucijada Metabólica", energyType: "ATP Consumed", placedElement: null },
    { index: 3, label: "Enzima Reguladora", stepName: "Paso 3: Válvula Alostérica", energyType: "Committed Step", placedElement: null },
    { index: 4, label: "Bisfosfato", stepName: "Paso 4: Escisión Aldólica", energyType: "Net Yield", placedElement: null },
    { index: 5, label: "Producto Final", stepName: "Paso 10: Salida Citosólica", energyType: "Net Yield", placedElement: null },
  ]);

  // Panel lateral colapsable para teoría
  const [isTheoryOpen, setIsTheoryOpen] = useState(true);

  // Elemento arrastrado activamente (tanto para mouse como touch)
  const [draggingItem, setDraggingItem] = useState<PathwayElement | null>(null);
  const [activeDropIndex, setActiveDropIndex] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("Arrastra los sustratos y enzimas hacia sus posiciones en la vía glucolítica.");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Dibujar flechas metabólicas en el Canvas 2D de fondo
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = (canvas.width = canvas.parentElement?.clientWidth || 600);
    const height = (canvas.height = canvas.parentElement?.clientHeight || 400);

    ctx.clearRect(0, 0, width, height);

    // Dibujar líneas de reacción de fondo con gradientes
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.strokeStyle = "rgba(168, 85, 247, 0.25)";

    ctx.beginPath();
    ctx.moveTo(40, height / 2);
    ctx.lineTo(width - 40, height / 2);
    ctx.stroke();

    ctx.setLineDash([]);
  }, [slots]);

  // Manejo de Drag and Drop Táctil y Ratón
  const handleDragStart = (elem: PathwayElement) => {
    setDraggingItem(elem);
  };

  const handleDropOnSlot = (slotIndex: number) => {
    if (!draggingItem) return;

    // Verificar si el elemento corresponde a este slot
    if (draggingItem.correctSlotIndex === slotIndex) {
      // Correcto
      setSlots((prev) =>
        prev.map((s) => (s.index === slotIndex ? { ...s, placedElement: draggingItem } : s))
      );
      setPalette((prev) => prev.filter((item) => item.id !== draggingItem.id));
      setStatusMessage(`¡Correcto! Has acoplado "${draggingItem.name}".`);
      addXp(20);

      // Comprobar si se completó la ruta
      const remaining = palette.filter((p) => p.id !== draggingItem.id);
      if (remaining.length === 0) {
        setStatusMessage("¡Felicidades! Has reconstruido con éxito la cascada glucolítica regulatoria.");
        addXp(60);
        updateUnitProgress("bioquimica", "metabolismo", 100);
        try {
          confetti({
            particleCount: 60,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#a855f7", "#ec4899", "#3b82f6"],
          });
        } catch {}
      }
    } else {
      setStatusMessage(`"${draggingItem.name}" no corresponde al paso seleccionado. Revisa su función enzimática.`);
    }

    setDraggingItem(null);
    setActiveDropIndex(null);
  };

  const handleReset = () => {
    setPalette(BIOCHEMISTRY_ELEMENTS);
    setSlots((prev) => prev.map((s) => ({ ...s, placedElement: null })));
    setStatusMessage("Lienzo reiniciado. Arrastra los elementos para reconstruir la vía.");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header del Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center space-x-2 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <FlaskConical className="w-4 h-4" />
            <span>Módulo 02</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Bioquímica: Glucólisis & Regulación Enzimática
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Construye la vía metabólica en el lienzo interactivo y domina los puntos de control alostérico.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleReset}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reiniciar</span>
          </button>
          <button
            onClick={() => setIsTheoryOpen(!isTheoryOpen)}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-xs font-semibold text-purple-200 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{isTheoryOpen ? "Ocultar Teoría" : "Ver Teoría"}</span>
          </button>
        </div>
      </div>

      {/* Contenedor Principal: Lienzo + Panel Colapsable */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Lienzo Interactivo (Canvas + Drop Zones) */}
        <div className={`${isTheoryOpen ? "lg:col-span-8" : "lg:col-span-12"} space-y-6 transition-all duration-300`}>
          
          {/* Barra de Estado del Proceso */}
          <div className="px-4 py-2.5 rounded-2xl glass-card border border-purple-500/20 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 text-slate-200">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>{statusMessage}</span>
            </div>
            <span className="text-purple-300 font-bold hidden sm:inline">
              Completado: {slots.filter((s) => s.placedElement !== null).length} / 6
            </span>
          </div>

          {/* Lienzo Visual donde se colocan los componentes */}
          <GlassCard className="relative p-6 rounded-3xl min-h-[380px] flex flex-col justify-between overflow-hidden border border-white/15">
            <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none w-full h-full" />

            <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {slots.map((slot) => {
                const isHovered = activeDropIndex === slot.index;
                const isFilled = slot.placedElement !== null;

                return (
                  <div
                    key={slot.index}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setActiveDropIndex(slot.index);
                    }}
                    onDragLeave={() => setActiveDropIndex(null)}
                    onDrop={() => handleDropOnSlot(slot.index)}
                    onClick={() => {
                      if (draggingItem) handleDropOnSlot(slot.index);
                    }}
                    className={`
                      min-h-[115px] p-3.5 rounded-2xl border-2 border-dashed
                      transition-all duration-200 flex flex-col justify-between
                      touch-manipulation cursor-pointer
                      ${isFilled 
                        ? "bg-purple-950/40 border-purple-500/60 shadow-lg shadow-purple-950/40" 
                        : isHovered 
                        ? "bg-purple-500/20 border-purple-400 scale-[1.02]" 
                        : "bg-slate-950/50 border-white/10 hover:border-white/20"}
                    `}
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>Paso {slot.index + 1}</span>
                      <span className="px-1.5 py-0.5 rounded bg-white/5 text-[9px] text-purple-300">
                        {slot.energyType}
                      </span>
                    </div>

                    {isFilled ? (
                      <div className="my-1 animate-in zoom-in-95 duration-150">
                        <span className="text-xs font-bold text-white block">
                          {slot.placedElement?.name}
                        </span>
                        <span className="text-[10px] text-emerald-400 font-mono block">
                          ΔG°' {slot.placedElement?.deltaG}
                        </span>
                      </div>
                    ) : (
                      <div className="my-2 text-center text-slate-500 text-xs">
                        <span className="block font-medium text-slate-400 text-[11px]">{slot.label}</span>
                        <span className="text-[10px] text-slate-500">
                          {draggingItem ? "Haz clic para acoplar" : "Ranura vacía"}
                        </span>
                      </div>
                    )}

                    <div className="text-[9px] text-slate-500 truncate">
                      {slot.stepName}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Hint de uso */}
            <div className="relative z-10 mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
              <span>Compatible con eventos táctiles en móviles y ratón en escritorio</span>
              <span className="text-purple-400 font-medium">Glucólisis Citosólica Humana</span>
            </div>
          </GlassCard>

          {/* Paleta de Elementos Estructurales Arrastrables */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
                <GripHorizontal className="w-4 h-4 text-purple-400" />
                <span>Paleta de Elementos Estructurales Disponibles</span>
              </h3>
              <span className="text-xs text-slate-400">{palette.length} restantes</span>
            </div>

            {palette.length === 0 ? (
              <div className="p-6 rounded-2xl glass-card border border-emerald-500/30 text-center text-emerald-300 text-xs font-medium">
                ¡Todos los componentes metabólicos han sido colocados en la ruta con éxito!
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {palette.map((elem) => {
                  const isSelected = draggingItem?.id === elem.id;

                  return (
                    <div
                      key={elem.id}
                      draggable
                      onDragStart={() => handleDragStart(elem)}
                      onClick={() => setDraggingItem(isSelected ? null : elem)}
                      className={`
                        p-3 rounded-2xl glass-card-interactive cursor-grab active:cursor-grabbing
                        border transition-all select-none touch-manipulation
                        ${isSelected 
                          ? "ring-2 ring-purple-400 bg-purple-900/40 border-purple-400 shadow-lg shadow-purple-950/60" 
                          : "border-white/10 hover:border-purple-400/40"}
                      `}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md ${
                          elem.category === "enzyme" 
                            ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" 
                            : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                        }`}>
                          {elem.category === "enzyme" ? "Enzima" : "Metabolito"}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{elem.formula}</span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-100 truncate">{elem.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {elem.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Panel Lateral Colapsable de Teoría Bioquímica */}
        {isTheoryOpen && (
          <aside className="lg:col-span-4 space-y-4 animate-in slide-in-from-right-4 duration-200">
            <GlassCard className="p-6 border border-white/15 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center space-x-2 text-purple-300 font-bold text-sm">
                  <BookOpen className="w-4 h-4" />
                  <span>Teoría de la Vía Glucolítica</span>
                </div>
                <button
                  onClick={() => setIsTheoryOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white lg:hidden"
                >
                  ✕
                </button>
              </div>

              {/* Punto de Control 1 */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                  1. Hexocinasa vs Glucocinasa
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  La <strong>Hexocinasa</strong> (tejidos periféricos) tiene baja Km (alta afinidad) y es inhibida por su propio producto (G6P). La <strong>Glucocinasa</strong> (hígado y células β del páncreas) tiene alta Km (baja afinidad), no es inhibida por G6P y responde a niveles altos de glucosa postprandial regulada por insulina.
                </p>
              </div>

              {/* Punto de Control 2 */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                  2. Fosfofructocinasa-1 (PFK-1): Enzima Marcapasos
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Es el paso limitante y comprometido más importante de la glucólisis.
                </p>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-white/10 text-[11px] space-y-1">
                  <div className="text-emerald-300 font-semibold">Activadores Alostéricos (+):</div>
                  <div className="text-slate-300">• Fructosa-2,6-bisfosfato (el más potente)</div>
                  <div className="text-slate-300">• AMP (indica baja energía)</div>
                  <div className="text-rose-300 font-semibold mt-2">Inhibidores Alostéricos (-):</div>
                  <div className="text-slate-300">• ATP (abundancia energética)</div>
                  <div className="text-slate-300">• Citrato (indica ciclo de Krebs saturado)</div>
                </div>
              </div>

              {/* Rendimiento Neto */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                  3. Rendimiento Energético Neto
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Por cada molécula de Glucosa procesada:
                </p>
                <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/20 text-xs font-mono text-purple-200">
                  1 Glucosa + 2 NAD+ + 2 ADP + 2 Pi ➔ 2 Piruvato + 2 NADH + 2 ATP + 2 H2O
                </div>
              </div>
            </GlassCard>
          </aside>
        )}

      </div>
    </div>
  );
}