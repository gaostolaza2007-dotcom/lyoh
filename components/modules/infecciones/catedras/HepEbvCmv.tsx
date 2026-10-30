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
  ExternalLink,
  Microscope,
  Stethoscope
} from "lucide-react";

type VirusComparison = "transmision" | "clinica" | "laboratorio_diferencial";

export const HepEbvCmv: React.FC = () => {
  const [selectedAspect, setSelectedAspect] = useState<VirusComparison>("laboratorio_diferencial");
  const [studentChoice, setStudentChoice] = useState<string | null>(null);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);

  const handleReset = () => {
    setSelectedAspect("laboratorio_diferencial");
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
              HEP-09 · Actividad interactiva
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              CAT-20 · Pág. 16
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            VEB y CMV: Afectación Hepática por Otros Virus
          </h3>
          <p className="text-xs text-slate-300">
            <strong>Objetivo:</strong> Reconocer que la hepatitis aguda no se restringe a los virus hepatotrópicos clásicos (A–E) y diferenciar la mononucleosis por VEB del cuadro por CMV mediante pruebas de laboratorio.
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

      {/* Selector de Aspectos de Comparación */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
          Compara el comportamiento biológico de ambos herpesvirus:
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {[
            { id: "transmision" as const, title: "1. Vías de Transmisión", subtitle: "Saliva vs Múltiples fluidos" },
            { id: "clinica" as const, title: "2. Síndrome Clínico y Compromiso Hepático", subtitle: "Mononucleosis y transaminasas" },
            { id: "laboratorio_diferencial" as const, title: "3. Laboratorio Diferencial", subtitle: "Anticuerpos heterófilos y PCR" },
          ].map((item) => {
            const isSelected = selectedAspect === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSelectedAspect(item.id)}
                aria-pressed={isSelected}
                className={`p-3.5 rounded-2xl text-left border transition-all min-h-[64px] flex flex-col justify-between ${
                  isSelected
                    ? "bg-amber-500/20 border-amber-400 shadow-lg shadow-amber-950/40 ring-1 ring-amber-400/30"
                    : "bg-slate-900/60 hover:bg-slate-900 text-slate-300 border-white/5"
                }`}
              >
                <span className={`text-xs font-bold leading-tight ${isSelected ? "text-amber-300" : "text-white"}`}>
                  {item.title}
                </span>
                <span className="text-[10px] text-slate-400 font-mono mt-1">
                  {item.subtitle}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detalle Comparativo */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-white/10 space-y-4">
        {selectedAspect === "transmision" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-950/80 border border-sky-500/30 space-y-1.5">
              <span className="font-bold text-sky-300 text-sm">Virus de Epstein-Barr (VEB / HHV-4)</span>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                Transmisión predominantemente por <strong>contacto íntimo con saliva</strong> infectada ("enfermedad del beso") entre adolescentes y adultos jóvenes. Infecta inicialmente las células epiteliales de la orofaringe y luego establece latencia en los linfocitos B de memoria.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/80 border border-purple-500/30 space-y-1.5">
              <span className="font-bold text-purple-300 text-sm">Citomegalovirus (CMV / HHV-5)</span>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                Transmisión ubicua y diversa: saliva, orina (muy abundante en niños pequeños de guarderías), leche materna, vía sexual, transfusión sanguínea y trasplantes. Transmisión vertical transplacentaria congénita de alta gravedad.
              </p>
            </div>
          </div>
        )}

        {selectedAspect === "clinica" && (
          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/5 space-y-2">
              <span className="font-bold text-white block">Manifestaciones Clínicas y Patrón Hepático:</span>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                Ambos virus causan un <strong>síndrome mononucleósico</strong> con fiebre prolongada, astenia, linfadenopatías cervicales y esplenomegalia. En el <strong>80% a 90% de los casos de mononucleosis infecciosa</strong> existe una <strong>hepatitis reactiva anictérica</strong> con elevación moderada de transaminasas (ALT/AST típicamente 2 a 5 veces el límite superior normal) y hepatomegalia levemente dolorosa. La ictericia es infrecuente (&lt;5-10%).
              </p>
              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-200 text-[11px]">
                💡 La faringitis exudativa intensa con amígdalas cubiertas de placas pultáceas es muy típica de VEB, mientras que el CMV suele cursar con faringitis mínima o ausente ("síndrome mononucleósico tifoideo").
              </div>
            </div>
          </div>
        )}

        {selectedAspect === "laboratorio_diferencial" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-950/80 border border-sky-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sky-300 text-sm">Laboratorio de VEB</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/30">Heterófilo (+)</span>
              </div>
              <ul className="space-y-1.5 text-[11px] text-slate-300">
                <li className="flex items-start gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                  <span><strong>Hemograma:</strong> Leucocitosis con linfocitosis absoluta (&gt;50%) y <strong>&gt;10% de linfocitos atípicos</strong> (células de Downey).</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                  <span><strong>Anticuerpos heterófilos (Monospot / Paul-Bunnell):</strong> POSITIVOS en &gt;85% de adolescentes y adultos.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                  <span><strong>Serología específica:</strong> IgM anti-VCA (+) e IgG anti-EBNA (-) confirman primoinfección aguda.</span>
                </li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-purple-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-purple-300 text-sm">Laboratorio de CMV</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30">Heterófilo (-)</span>
              </div>
              <ul className="space-y-1.5 text-[11px] text-slate-300">
                <li className="flex items-start gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                  <span><strong>Anticuerpos heterófilos:</strong> Estrictamente NEGATIVOS (causa principal de mononucleosis heterófilo-negativa).</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                  <span><strong>Serología específica:</strong> Detección de IgM anti-CMV más test de avidez de IgG para discriminar primoinfección reciente.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                  <span><strong>Carga viral:</strong> ADN-CMV cuantificado por PCR en sangre (esencial en trasplantados e inmunodeprimidos).</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Pregunta del Estudiante */}
      <div className="p-4 sm:p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-3">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <h4 className="text-xs sm:text-sm font-bold text-white">
            Pregunta de Integración de Diagnóstico Diferencial:
          </h4>
        </div>

        <p className="text-xs text-slate-200 leading-relaxed">
          Un joven de 20 años consulta por fiebre de 10 días, astenia, linfadenopatías cervicales y transaminasas moderadamente elevadas (ALT 180 U/L, AST 160 U/L). La prueba de anticuerpos heterófilos (Monospot) resulta NEGATIVA. 
          <strong>¿Qué conclusión diagnóstica y conducta de laboratorio es la más adecuada?</strong>
        </p>

        {/* Opciones */}
        <div className="space-y-2 pt-1">
          {[
            {
              id: "opt-1",
              text: "La negatividad de anticuerpos heterófilos descarta la mayoría de mononucleosis por VEB y orienta a Citomegalovirus (CMV) como primera causa alternativa, por lo que se debe solicitar IgM anti-CMV y serología específica anti-VCA."
            },
            {
              id: "opt-2",
              text: "Un Monospot negativo descarta toda infección viral y confirma inmediatamente hepatitis por consumo de alcohol."
            },
            {
              id: "opt-3",
              text: "El paciente tiene hepatitis fulminante por virus A y debe ingresar a trasplante hepático de urgencia."
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
                <span>¡Criterio Clínico y Virológico Impecable!</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-rose-400 font-bold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Revisa la conducta ante mononucleosis heterófilo-negativa:</span>
              </div>
            )}

            <p className="text-slate-300 leading-relaxed text-[11px]">
              <strong>Fundamento Docente:</strong> Ante un síndrome mononucleósico con transaminasas alteradas y prueba de anticuerpos heterófilos negativa, el <strong>Citomegalovirus (CMV) es la etiología principal a investigar</strong> (produce el 50% al 70% de las mononucleosis heterófilo-negativas en inmunocompetentes). No obstante, en un 10% de adultos con VEB el Monospot puede ser falsamente negativo al inicio, por lo que se deben solicitar en paralelo <strong>IgM anti-VCA para VEB</strong> e <strong>IgM anti-CMV</strong>.
            </p>

            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-200 text-[11px] flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong>Límite Científico:</strong> Las alteraciones hepáticas de VEB y CMV suelen ser autolimitadas en inmunocompetentes y no progresan a hepatitis crónica o cirrosis, a diferencia de VHB y VHC.
              </div>
            </div>
          </div>
        )}

      </div>

    </GlassCard>
  );
};
