"use client";

import React, { useState } from "react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  Microscope, 
  ExternalLink, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Info, 
  ArrowRight,
  Eye, 
  EyeOff,
  Activity,
  Layers,
  Sparkles
} from "lucide-react";

type LabMethod = "frotis" | "gota_gruesa" | "pdr";

interface MethodInfo {
  id: LabMethod;
  name: string;
  badge: string;
  badgeColor: string;
  samplePreparation: string;
  mainUtility: string;
  limitations: string;
  antigenTargets?: string;
  differentialCriteria: string;
}

const METHODS_DATA: MethodInfo[] = [
  {
    id: "frotis",
    name: "Frotis Fino Sanguíneo (Giemsa)",
    badge: "Identificación de Especie y Parasitemia",
    badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    samplePreparation: "Monocapa de hematíes intactos fijada rápidamente con metanol absoluto y coloreada con solución Giemsa o Wright.",
    mainUtility: "Permite evaluar la morfología del eritrocito hospedador y las características del parásito intracelular: trofozoítos anulares finos, dobles puntos de cromatina, esquizontes y gametocitos. Permite calcular el porcentaje de parasitemia (% de hematíes infectados).",
    limitations: "Menor sensibilidad que la gota gruesa en parasitemias muy bajas (<100 parásitos/μL), requiriendo revisar al menos 200 a 300 campos antes de considerarse negativo.",
    differentialCriteria: "P. falciparum muestra anillos delicados (a menudo múltiples por hematíe) y gametocitos semilunares o arriñonados característicos, mientras que P. vivax presenta hematíes aumentados de tamaño con granulaciones de Schüffner."
  },
  {
    id: "gota_gruesa",
    name: "Gota Gruesa Deshemoglobinizada",
    badge: "Gold Standard de Tamizaje / Detección",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    samplePreparation: "Muestra de sangre depositada y desfibrinada en varios estratos celulares, secada al aire sin fijar con alcohol; al teñir con Giemsa acuoso los eritrocitos se lisan (deshemoglobinización).",
    mainUtility: "Concentra el inóculo celular entre 20 y 30 veces más que el frotis fino, permitiendo detectar densidades parasitarias extraordinariamente bajas (hasta 5-10 parásitos/μL de sangre).",
    limitations: "Al lisar los hematíes, se pierde la morfología celular del glóbulo rojo hospedero (tamaño, punteados), lo que dificulta o impide la diferenciación precisa de especie si solo hay anillos indiferenciados.",
    differentialCriteria: "Es la prueba de elección para confirmar o descartar rápidamente presencia de parásitos circulantes; una vez detectado positivo, se recurre al frotis fino para clasificar especie."
  },
  {
    id: "pdr",
    name: "Prueba de Diagnóstico Rápido (PDR / RDT)",
    badge: "Inmunocromatografía Antigénica",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    samplePreparation: "Tira reactiva de flujo lateral con anticuerpos monoclonales que se aplica con una gota de sangre capilar y tampón de lisis (resultado en 15-20 minutos).",
    mainUtility: "No requiere microscopio ni personal especializado en laboratorio. Detecta antígenos como HRP-2 (específica de P. falciparum) o pLDH / aldolasa (pan-malárica compartida o específica de P. vivax).",
    limitations: "No cuantifica el porcentaje de parasitemia. El antígeno HRP-2 puede persistir en el suero circulante entre 2 y 4 semanas tras el aclaramiento y curación clínica con antimaláricos, dando falsos positivos post-tratamiento.",
    antigenTargets: "HRP-2 (Histidine-Rich Protein 2) para P. falciparum; pLDH (Parasite Lactate Dehydrogenase) o aldolasa para especies no falciparum.",
    differentialCriteria: "Excelente para diagnóstico inicial urgente en áreas sin microscopía o de guardia hospitalaria rápida, pero debe confirmarse con microscopía para descartar parasitismo residual o evaluar respuesta terapéutica."
  }
];

export const VasMalariaBlood: React.FC = () => {
  const [selectedMethod, setSelectedMethod] = useState<LabMethod>("frotis");
  const [isRevealed, setIsRevealed] = useState(false);

  // Student Critical Thinking State
  const [qAnswer, setQAnswer] = useState<number | null>(null);
  const [hasEvaluated, setHasEvaluated] = useState(false);

  const activeMethodData = METHODS_DATA.find(m => m.id === selectedMethod)!;

  const handleReset = () => {
    setQAnswer(null);
    setHasEvaluated(false);
    setIsRevealed(false);
    setSelectedMethod("frotis");
  };

  return (
    <div className="space-y-6">
      
      {/* Encabezado Pedagógico */}
      <GlassCard className="p-6 border-amber-500/30 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-rose-950/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4 mb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono text-xs font-bold border border-rose-500/30">
                VAS-08 · Actividad interactiva
              </span>
              <span className="text-xs text-slate-400 font-mono">CAT-21 · Págs. 17-18, 25</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Microscope className="w-5 h-5 text-rose-400" />
              Malaria (<em>Plasmodium spp.</em>): Formas Sanguíneas y Diagnóstico
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/agentes-infecciosos/catalogo/P01"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs border border-rose-500/30 transition-colors"
            >
              <span>Ficha P. falciparum</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/agentes-infecciosos/parasitologia/comparador"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs border border-white/10 transition-colors"
            >
              <span>Comparador Parasitología</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed">
          <strong className="text-white">Objetivo conceptual:</strong> Relacionar el parasitismo eritrocitario por <em>Plasmodium</em> con las propiedades diagnósticas del frotis sanguíneo, la gota gruesa y las pruebas rápidas de antígeno (PDR), reconociendo qué aporta cada técnica y por qué los síntomas febriles cíclicos no permiten por sí solos identificar la especie.
        </p>
      </GlassCard>

      {/* Selector de Métodos de Diagnóstico de Laboratorio */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {METHODS_DATA.map((m) => {
            const isSelected = selectedMethod === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setSelectedMethod(m.id)}
                className={`p-3.5 rounded-2xl text-left border transition-all flex flex-col justify-between gap-1.5 min-h-[78px] ${
                  isSelected
                    ? "bg-slate-800/95 border-rose-400 ring-2 ring-rose-400/20 shadow-lg"
                    : "bg-slate-900/50 hover:bg-slate-900 border-white/5 text-slate-300"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-bold text-white">{m.name}</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${m.badgeColor}`}>
                    {m.id.toUpperCase()}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2">
                  {m.badge}
                </p>
              </button>
            );
          })}
        </div>

        {/* Detalle y Fundamento Metodológico */}
        <GlassCard className="p-5 border-white/10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400 font-bold">
                Fundamento Técnico y Capacidad Diagnóstica
              </span>
              <h3 className="text-base font-bold text-white">
                {activeMethodData.name}
              </h3>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold border w-fit ${activeMethodData.badgeColor}`}>
              {activeMethodData.badge}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-1.5">
              <span className="font-semibold text-slate-200 block">Preparación de la Muestra:</span>
              <p className="text-slate-300 leading-relaxed">{activeMethodData.samplePreparation}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-1.5">
              <span className="font-semibold text-slate-200 block">Utilidad Clínica Principal:</span>
              <p className="text-slate-300 leading-relaxed">{activeMethodData.mainUtility}</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 space-y-1">
            <span className="font-bold text-amber-300 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-amber-400" />
              Límites y Puntos Críticos de Interpretación:
            </span>
            <p className="leading-relaxed">{activeMethodData.limitations}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 text-xs text-slate-300 space-y-1">
            <span className="font-semibold text-cyan-300">Criterio Diferencial de Especies:</span>
            <p className="leading-relaxed">{activeMethodData.differentialCriteria}</p>
          </div>
        </GlassCard>
      </div>

      {/* Ejercicio de Juicio Conceptual */}
      <GlassCard className="p-6 border-white/10 space-y-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-rose-400" />
              Juicio Conceptual: Elección y Limitaciones de Pruebas en Malaria
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Razona qué información clínica y biológica aporta cada técnica diagnóstica.
            </p>
          </div>
          {qAnswer !== null && (
            <button
              onClick={handleReset}
              className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restablecer</span>
            </button>
          )}
        </div>

        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-200 block">
            Un paciente con malaria por <em>P. falciparum</em> tratada con artemisinina hace 10 días se encuentra asintomático. Se le realiza una PDR basada en HRP-2 que resulta positiva, pero la microscopía directa (frotis y gota gruesa) no muestra parásitos. ¿Cómo se explica científicamente este resultado?
          </label>
          <div className="space-y-2">
            {[
              { id: 0, text: "La microscopía falló porque en pacientes curados los parásitos se tornan transparentes e indetectables con Giemsa." },
              { id: 1, text: "El antígeno proteico HRP-2 de P. falciparum tiene una vida media prolongada y puede persistir circulando en plasma durante 2 a 4 semanas tras el aclaramiento y muerte completa de los trofozoítos, dando una prueba rápida positiva sin implicar falla terapéutica ni parásitos viables." },
              { id: 2, text: "Significa con certeza que el paciente sufrió una reinfección fulminante que aún no alcanza a ingresar a los glóbulos rojos." }
            ].map((opt) => {
              const isSelected = qAnswer === opt.id;
              const isCorrect = opt.id === 1;
              let itemClass = "bg-slate-900/60 border-white/5 hover:border-slate-600 text-slate-300";
              if (hasEvaluated) {
                if (isCorrect) itemClass = "bg-emerald-950/40 border-emerald-500/50 text-emerald-200";
                else if (isSelected) itemClass = "bg-rose-950/40 border-rose-500/50 text-rose-200";
              } else if (isSelected) {
                itemClass = "bg-rose-500/20 border-rose-400 text-white";
              }

              return (
                <button
                  key={opt.id}
                  onClick={() => !hasEvaluated && setQAnswer(opt.id)}
                  disabled={hasEvaluated}
                  className={`w-full p-3 rounded-xl border text-left text-xs transition-all flex items-start gap-2.5 ${itemClass}`}
                >
                  <span className="font-mono font-bold text-slate-400 shrink-0">[{String.fromCharCode(65 + opt.id)}]</span>
                  <span className="leading-relaxed">{opt.text}</span>
                  {hasEvaluated && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-auto" />}
                  {hasEvaluated && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-400 shrink-0 ml-auto" />}
                </button>
              );
            })}
          </div>
        </div>

        {!hasEvaluated ? (
          <div className="pt-2 flex justify-end">
            <button
              onClick={() => setHasEvaluated(true)}
              disabled={qAnswer === null}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
                qAnswer !== null
                  ? "bg-rose-400 hover:bg-rose-300 text-slate-950 shadow-md shadow-rose-950/40"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed"
              }`}
            >
              <span>Verificar Razonamiento Diagnóstico</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-900 border border-rose-500/30 space-y-2 animate-fade-in text-xs">
            <div className="flex items-center gap-2 text-rose-300 font-bold">
              <CheckCircle2 className="w-4 h-4 text-rose-400" />
              <span>Retroalimentación Biológica (CDC Malaria):</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              La proteína HRP-2 (Histidine-Rich Protein 2) es sintetizada profusamente por los trofozoítos de <em>Plasmodium falciparum</em> y se excreta al torrente sanguíneo. Debido a su lenta tasa de eliminación renal y fagocítica, el antígeno HRP-2 residual puede detectarse por tiras rápidas hasta un mes después de la curación parasitológica. Por esto, el seguimiento de la eficacia del tratamiento y la confirmación de curación en pacientes no debe hacerse con PDR basada en HRP-2, sino mediante microscopía óptica seriada (evaluando aclaramiento de la parasitemia) o pruebas moleculares/pLDH.
            </p>
          </div>
        )}
      </GlassCard>

    </div>
  );
};
