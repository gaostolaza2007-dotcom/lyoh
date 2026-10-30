"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  HelpCircle, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ShieldAlert, 
  ChevronRight,
  Layers,
  ShieldCheck,
  Zap,
  Activity
} from "lucide-react";

type LayerMode = "core_vhd" | "envelope_vhb" | "completo" | "coinfeccion_sobreinfeccion";

export const HepDDependence: React.FC = () => {
  const [layerMode, setLayerMode] = useState<LayerMode>("completo");
  const [studentChoice, setStudentChoice] = useState<string | null>(null);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);

  const handleReset = () => {
    setLayerMode("completo");
    setStudentChoice(null);
    setIsRevealed(false);
  };

  return (
    <GlassCard className="p-5 sm:p-7 rounded-3xl border border-amber-500/30 bg-slate-950/80 shadow-2xl space-y-6">
      
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[11px] font-bold border border-amber-500/30">
              HEP-07 · Actividad interactiva
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              CAT-20 · Pág. 14
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Hepatitis D: Dependencia Molecular de la Envoltura del VHB
          </h3>
          <p className="text-xs text-slate-300">
            <strong>Objetivo:</strong> Comprender la naturaleza defectuosa del virus delta (VHD), su parasitismo molecular sobre el antígeno HBsAg del VHB y la distinción entre coinfección y sobreinfección.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-white/10 transition-colors self-start shrink-0 min-h-[36px]"
          title="Restablecer actividad"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restablecer</span>
        </button>
      </div>

      {/* Selector de Capas Estructurales */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
          Capas Estructurales y Relación Biológica:
        </span>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { id: "core_vhd" as const, title: "1. Núcleo VHD Aislado", subtitle: "ARNmc- circular + HDAg" },
            { id: "envelope_vhb" as const, title: "2. Envoltura Prestada (VHB)", subtitle: "Lípidos + HBsAg" },
            { id: "completo" as const, title: "3. Virión Delta Ensamblado", subtitle: "Partícula infectiva completa" },
            { id: "coinfeccion_sobreinfeccion" as const, title: "4. Coinfección vs Sobreinfección", subtitle: "Patrones clínicos" },
          ].map((c) => {
            const isSelected = layerMode === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setLayerMode(c.id)}
                aria-pressed={isSelected}
                className={`p-3 rounded-2xl text-left border transition-all min-h-[64px] flex flex-col justify-between ${
                  isSelected
                    ? "bg-amber-500/20 border-amber-400 shadow-lg shadow-amber-950/40 ring-1 ring-amber-400/30"
                    : "bg-slate-900/60 hover:bg-slate-900 text-slate-300 border-white/5"
                }`}
              >
                <span className={`text-xs font-bold leading-tight ${isSelected ? "text-amber-300" : "text-white"}`}>
                  {c.title}
                </span>
                <span className="text-[10px] text-slate-400 font-mono mt-1">
                  {c.subtitle}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Visualización Esquemática de la Partícula */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-white/10 space-y-4">
        {layerMode === "core_vhd" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="font-bold text-white text-sm">Núcleo Ribonucleoproteico Delta (Incompleto)</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Incapaz de infectar por sí solo
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              El genoma del VHD es un <strong>ARN circular monocatenario negativo</strong> diminuto (~1.700 nucleótidos, el más pequeño de los virus animales), estrechamente asociado al <strong>antígeno delta (HDAg)</strong>. Este complejo puede replicarse en el núcleo del hepatocito usando la ARN polimerasa II celular, pero <strong>carece por completo de genes para sintetizar su propia cubierta de envoltura</strong>. Sin envoltura, no puede brotar de la célula ni unirse a receptores de nuevos hepatocitos.
            </p>
          </div>
        )}

        {layerMode === "envelope_vhb" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="font-bold text-white text-sm">Envoltura de Hepatitis B (HBsAg)</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                Componente aportado por VHB
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Durante la infección por el virus de la hepatitis B, los hepatocitos sintetizan y secretan un inmenso exceso de proteínas de superficie (HBsAg: proteínas S, M y L) integradas en vesículas lipídicas. El VHD "parasita" esta maquinaria celular: aprovecha las moléculas de HBsAg para recubrir su propio núcleo delta y constituir una envoltura funcional.
            </p>
          </div>
        )}

        {layerMode === "completo" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="font-bold text-white text-sm">Virión Infeccioso Ensamblado de VHD (Partícula Híbrida)</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Virus Satélite Defectuoso
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              La partícula madura (~36 nm) tiene en su interior el ARN delta y el HDAg, pero externamente está <strong>completamente cubierta por HBsAg de hepatitis B</strong>. Esto le permite reconocer el receptor hepático NTCP y entrar a nuevos hepatocitos. Por lo tanto, <strong>la infección por VHD solo puede persistir y propagarse si hay HBsAg circulante disponible</strong>.
            </p>
          </div>
        )}

        {layerMode === "coinfeccion_sobreinfeccion" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="font-bold text-white text-sm">Coinfección vs. Sobreinfección (Distinción Clínica)</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Pronóstico Diferencial
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 space-y-1.5">
                <strong className="text-amber-300 block">A. Coinfección Simultánea (VHB + VHD)</strong>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  Transmisión simultánea de ambos virus al mismo tiempo en una persona previamente sana. Cuadro agudo que puede ser bifásico y grave, pero al aclararse el VHB (&gt;90% en adultos), el VHD desaparece conjuntamente al perder el HBsAg. Cronificación &lt;5%.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 space-y-1.5">
                <strong className="text-rose-300 block">B. Sobreinfección (VHD sobre Portador VHB)</strong>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  Inoculación de VHD en un individuo que ya tenía hepatitis B crónica con HBsAg continuo. El VHD encuentra HBsAg abundante inmediato, causando hepatitis fulminante aguda en ~5% y cronificación masiva (&gt;80%), acelerando el avance a cirrosis en pocos años.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Ejercicio del Estudiante */}
      <div className="p-4 sm:p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-3">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <h4 className="text-xs sm:text-sm font-bold text-white">
            Razonamiento Inmunológico y Preventivo:
          </h4>
        </div>

        <p className="text-xs text-slate-200 leading-relaxed">
          La vacuna actual contra la hepatitis B se formula únicamente con la proteína recombinante HBsAg y no contiene ningún componente del virus delta. 
          <strong>¿Por qué esta vacuna protege con total eficacia contra la hepatitis D en individuos no infectados?</strong>
        </p>

        {/* Opciones */}
        <div className="space-y-2 pt-1">
          {[
            {
              id: "opt-1",
              text: "Porque al generar anticuerpos Anti-HBs neutralizantes se bloquea la entrada del virión delta (cuya envoltura es HBsAg) y se impide la infección por VHB, privando al VHD de la envoltura imprescindible para su propagación."
            },
            {
              id: "opt-2",
              text: "Porque el genoma de la hepatitis D y el de la hepatitis B son idénticos en su secuencia de nucleótidos."
            },
            {
              id: "opt-3",
              text: "Porque la vacuna de hepatitis B induce la destrucción directa de los ribosomas celulares."
            }
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => {
                setStudentChoice(opt.id);
                setIsRevealed(false);
              }}
              className={`w-full text-left p-3 rounded-xl border text-xs transition-all min-h-[44px] flex items-center justify-between gap-3 ${
                studentChoice === opt.id
                  ? "bg-amber-500/20 border-amber-400 text-white font-semibold"
                  : "bg-slate-900/60 hover:bg-slate-900 border-white/5 text-slate-300"
              }`}
            >
              <span>{opt.text}</span>
              <span className={`w-4 h-4 rounded-full border shrink-0 flex items-center justify-center ${
                studentChoice === opt.id ? "border-amber-400 bg-amber-400" : "border-slate-600"
              }`}>
                {studentChoice === opt.id && <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
              </span>
            </button>
          ))}
        </div>

        {/* Botón Comprobar */}
        <div className="pt-2 flex items-center justify-between">
          <button
            onClick={() => setIsRevealed(true)}
            disabled={!studentChoice}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all min-h-[44px] flex items-center gap-2 ${
              studentChoice
                ? "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-950/40"
                : "bg-slate-800 text-slate-500 cursor-not-allowed"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Comprobar y Revelar Criterio</span>
          </button>
          <span className="text-[11px] text-slate-400 font-mono">
            {studentChoice ? "Listo para comprobar" : "Elige una opción"}
          </span>
        </div>

        {/* Retroalimentación */}
        {isRevealed && (
          <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-amber-500/40 space-y-2.5 animate-in fade-in duration-200 text-xs">
            {studentChoice === "opt-1" ? (
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>¡Criterio Biológico Exacto!</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-rose-400 font-bold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Revisa la estructura de la cubierta del virión:</span>
              </div>
            )}

            <p className="text-slate-300 leading-relaxed text-[11px]">
              <strong>Principio Docente:</strong> VHD es el ejemplo paradigmático de <strong>virus satélite dependiente</strong>. Al no codificar proteínas de envoltura, la cubierta externa de todo virión de VHD infeccioso está constituida por el antígeno de superficie de hepatitis B (HBsAg). La vacuna contra VHB genera títulos elevados de anticuerpos neutralizantes Anti-HBs que neutralizan directamente la envoltura del VHD e impiden el establecimiento del VHB en el huésped.
            </p>

            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-200 text-[11px] flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong>Límite Científico:</strong> Si una persona ya es portadora crónica de VHB (HBsAg positivo), la vacuna anti-VHB ya no es efectiva para generar Anti-HBs, por lo que este paciente continúa en riesgo de sobreinfección severa por VHD si se expone a sangre contaminada.
              </div>
            </div>
          </div>
        )}

      </div>

    </GlassCard>
  );
};
