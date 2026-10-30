"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  Eye, 
  FlaskConical, 
  HelpCircle, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ShieldAlert,
  ChevronRight,
  Droplets,
  Stethoscope
} from "lucide-react";

type InspectionTarget = "escleras" | "orina" | "heces" | "laboratorio";

interface InspectionDetail {
  id: InspectionTarget;
  title: string;
  category: "signo_observable" | "parametro_laboratorio";
  visualCue: string;
  physiopathology: string;
  limitation: string;
}

const TARGETS_DATA: Record<InspectionTarget, InspectionDetail> = {
  escleras: {
    id: "escleras",
    title: "Piel y Escleras (Ictericia)",
    category: "signo_observable",
    visualCue: "Coloración amarillenta visible de las escleras oculares y el tegumento por alta afinidad de la elastina tisular por la bilirrubina.",
    physiopathology: "Se hace clínicamente detectable mediante inspección a la luz natural cuando la bilirrubina plasmática supera los 2.5 a 3.0 mg/dL.",
    limitation: "Es un signo físico visible. No permite saber si la bilirrubina acumulada es predominantemente conjugada o no conjugada, ni cuál es la causa etiológica."
  },
  orina: {
    id: "orina",
    title: "Orina (Coluria)",
    category: "signo_observable",
    visualCue: "Orina hipercrómica de color pardo oscuro, similar al té cargado o bebida cola, con espuma amarillenta al agitarse.",
    physiopathology: "Consecuencia directa de la filtración glomerular de bilirrubina conjugada (directa), la cual es hidrosoluble. La bilirrubina no conjugada (indirecta) circula unida a albúmina y no puede filtrarse en el glomérulo ni producir coluria.",
    limitation: "Es un signo observable por el paciente o clínico. Confirma la presencia de bilirrubina conjugada en orina, pero no identifica qué virus o patología generó la colestasis."
  },
  heces: {
    id: "heces",
    title: "Deposiciones (Acolia / Hipocolia)",
    category: "signo_observable",
    visualCue: "Heces decoloradas, blanquecinas o de color masilla/arcilla por ausencia del pigmento normal.",
    physiopathology: "Ocurre cuando la secreción de bilis al duodeno está interrumpida o severamente disminuida (colestasis). Sin bilirrubina en el lumen intestinal, la microbiota colónica no puede generar urobilinógenos ni estercobilina, responsable del color marrón fecal.",
    limitation: "Indica defecto en el flujo biliar (colestasis intrahepática o extrahepática obstructiva), pero es indistinguible entre una hepatitis viral, coledocolitiasis o masa compresiva biliar."
  },
  laboratorio: {
    id: "laboratorio",
    title: "Panel Bioquímico de Laboratorio",
    category: "parametro_laboratorio",
    visualCue: "Valores cuantitativos numéricos obtenidos mediante espectrofotometría automatizada en suero: ALT/GPT, AST/GOT, Bilirrubina Total y Fraccionada, Fosfatasa Alcalina (FA).",
    physiopathology: "ALT y AST reflejan necrosis y citólisis de hepatocitos. La bilirrubina directa y la FA reflejan el grado de colestasis e indemnidad del árbol canalicular.",
    limitation: "Aporta mediciones cuantitativas del patrón de daño (predominio hepatocelular citolítico vs. patrón colestásico), pero requiere serología o PCR para saber la causa etiológica específica."
  }
};

export const HepJaundiceLab: React.FC = () => {
  const [selectedTarget, setSelectedTarget] = useState<InspectionTarget>("escleras");
  const [studentChoice, setStudentChoice] = useState<string | null>(null);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);

  const currentDetail = TARGETS_DATA[selectedTarget];

  const handleReset = () => {
    setSelectedTarget("escleras");
    setStudentChoice(null);
    setIsRevealed(false);
  };

  return (
    <GlassCard className="p-5 sm:p-7 rounded-3xl border border-amber-500/30 bg-slate-950/80 shadow-2xl space-y-6">
      
      {/* Cabecera de la Unidad */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[11px] font-bold border border-amber-500/30">
              HEP-04 · Actividad interactiva
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              CAT-20 · Pág. 9
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Ictericia, Coluria, Acolia y Laboratorio Bioquímico
          </h3>
          <p className="text-xs text-slate-300">
            <strong>Objetivo:</strong> Distinguir manifestaciones observables por inspección clínica de los parámetros cuantitativos medidos en laboratorio, reconociendo la información que falta para diagnosticar la causa.
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

      {/* Selector de Elemento Clínico / Laboratorio */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
          Selecciona un hallazgo o parámetro para explorar su naturaleza:
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {(["escleras", "orina", "heces", "laboratorio"] as const).map((id) => {
            const isSelected = selectedTarget === id;
            const t = TARGETS_DATA[id];
            return (
              <button
                key={id}
                onClick={() => setSelectedTarget(id)}
                aria-pressed={isSelected}
                className={`p-3.5 rounded-2xl text-left border transition-all min-h-[64px] flex flex-col justify-between ${
                  isSelected
                    ? "bg-amber-500/20 border-amber-400 shadow-lg shadow-amber-950/40 ring-1 ring-amber-400/30"
                    : "bg-slate-900/60 hover:bg-slate-900 text-slate-300 border-white/5"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${
                    t.category === "signo_observable" ? "text-amber-300" : "text-cyan-300"
                  }`}>
                    {t.category === "signo_observable" ? "Signo Clínico" : "Laboratorio"}
                  </span>
                  {t.category === "signo_observable" ? (
                    <Stethoscope className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <FlaskConical className="w-3.5 h-3.5 text-cyan-400" />
                  )}
                </div>

                <span className={`text-xs font-bold leading-snug mt-1 ${isSelected ? "text-white" : "text-slate-300"}`}>
                  {t.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Exploración Fisiopatológica del Elemento Seleccionado */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2">
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${
              currentDetail.category === "signo_observable" ? "bg-amber-400" : "bg-cyan-400"
            }`} />
            <h4 className="text-sm sm:text-base font-bold text-white">
              {currentDetail.title}
            </h4>
          </div>

          <span className={`text-[11px] px-2.5 py-0.5 rounded-full border font-semibold w-fit ${
            currentDetail.category === "signo_observable"
              ? "bg-amber-500/15 border-amber-500/30 text-amber-300"
              : "bg-cyan-500/15 border-cyan-500/30 text-cyan-300"
          }`}>
            {currentDetail.category === "signo_observable" ? "Inspección Visual Directa" : "Cuantificación en Sangre"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
            <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px] block">
              Manifestación / Registro:
            </span>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              {currentDetail.visualCue}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
            <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px] block">
              Mecanismo Fisiopatológico:
            </span>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              {currentDetail.physiopathology}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
            <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px] block">
              Límite Diagnóstico:
            </span>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              {currentDetail.limitation}
            </p>
          </div>
        </div>
      </div>

      {/* Ejercicio de Discriminación Conceptual */}
      <div className="p-4 sm:p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-3">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <h4 className="text-xs sm:text-sm font-bold text-white">
            Decisión del Estudiante:
          </h4>
        </div>

        <p className="text-xs text-slate-200 leading-relaxed">
          Un médico constata ictericia marcada, coluria y acolia en el examen físico de un paciente. 
          <strong>¿Qué información fundamental falta para atribuir con certeza la causa a una hepatitis viral y no a otra patología?</strong>
        </p>

        {/* Opciones */}
        <div className="space-y-2 pt-1">
          {[
            {
              id: "choice-1",
              text: "Falta la serología específica de anticuerpos/antígenos o biología molecular, ya que la colestasis también puede ser causada por cálculos biliares, fármacos, tumores o hepatitis autoinmune."
            },
            {
              id: "choice-2",
              text: "No falta ninguna información: la presencia simultánea de ictericia, coluria y acolia es exclusiva y diagnóstica de hepatitis A."
            },
            {
              id: "choice-3",
              text: "Solo falta esperar una semana para ver si el paciente desarrolla diarrea bacteriana."
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
            {studentChoice ? "Respuesta seleccionada" : "Elige una opción"}
          </span>
        </div>

        {/* Retroalimentación */}
        {isRevealed && (
          <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-amber-500/40 space-y-2.5 animate-in fade-in duration-200 text-xs">
            {studentChoice === "choice-1" ? (
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>¡Criterio Clínico y Bioquímico Correcto!</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-rose-400 font-bold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Revisa la especificidad del cuadro:</span>
              </div>
            )}

            <p className="text-slate-300 leading-relaxed text-[11px]">
              <strong>Fundamento Docente:</strong> La tríada de ictericia, coluria y acolia define un <strong>síndrome colestásico</strong>. La colestasis puede ser intrahepática (como en hepatitis virales o inducida por medicamentos) o extrahepática mecánica (como un cálculo impactado en el colédoco o una neoplasia de la ampolla de Vater). Por lo tanto, los signos clínicos por sí solos jamás identifican el virus causal. Se requiere estudio serológico (IgM anti-VHA, HBsAg, IgM anti-HBc, anti-VHC) e imágenes (ecografía abdominal) para descartar obstrucción de la vía biliar.
            </p>

            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-200 text-[11px] flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong>Límite Científico:</strong> No deben formularse equivalencias arbitrarias entre la intensidad visual del color de la piel y cifras exactas de bilirrubina sérica, ya que el fototipo cutáneo y la iluminación ambiental introducen alta variabilidad subjetiva.
              </div>
            </div>
          </div>
        )}

      </div>

    </GlassCard>
  );
};
