"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  GitBranch, 
  HelpCircle, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ExternalLink,
  ShieldAlert,
  ChevronRight,
  Activity,
  Layers
} from "lucide-react";

type OutcomeId = "resolucion" | "persistencia" | "fibrosis" | "cirrosis" | "carcinoma";

interface OutcomeData {
  id: OutcomeId;
  title: string;
  badge: string;
  badgeColor: string;
  definition: string;
  mechanism: string;
  clinicalReality: string;
}

const OUTCOMES: Record<OutcomeId, OutcomeData> = {
  resolucion: {
    id: "resolucion",
    title: "Aclaramiento y Resolución",
    badge: "Eliminación Viral",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    definition: "Control de la replicación y eliminación efectiva del agente gracias a una respuesta inmune celular y humoral coordinada.",
    mechanism: "Linfocitos T CD4+ y CD8+ policlonales específicos erradican los hepatocitos infectados y producen citocinas antivirales (IFN-gamma, TNF-alfa).",
    clinicalReality: "Ocurre en >90% de los adultos sanos infectados por VHB. En VHC se estima en aproximadamente un 15% a 25% de los casos agudos (OMS)."
  },
  persistencia: {
    id: "persistencia",
    title: "Infección Crónica Persistente",
    badge: "Portador Crónico",
    badgeColor: "bg-sky-500/20 text-sky-300 border-sky-500/30",
    definition: "Detección continua de material genético viral o antígenos de superficie durante más de 6 meses tras el contacto inicial.",
    mechanism: "Agotamiento funcional de linfocitos T, mutaciones de escape viral o integración del genoma (VHB) impiden la erradicación completa.",
    clinicalReality: "El paciente puede cursar totalmente asintomático por décadas, con niveles variables de transaminasas, sin que esto signifique necesariamente un daño fibrótico severo inmediato."
  },
  fibrosis: {
    id: "fibrosis",
    title: "Hepatitis Crónica Activa y Fibrosis Progresiva",
    badge: "Remodelación Tisular",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    definition: "Inflamación necroinflamatoria continuada con acumulación excesiva de matriz extracelular (colágeno) en el parénquima hepático.",
    mechanism: "Los hepatocitos lesionados y las células de Kupffer liberan TGF-beta, activando las células estrelladas de Ito, que se transforman en miofibroblastos productores de colágeno.",
    clinicalReality: "Proceso reversible en sus fases tempranas si se elimina la causa etiológica (por ejemplo, con antivirales de acción directa en VHC)."
  },
  cirrosis: {
    id: "cirrosis",
    title: "Cirrosis Hepática Descompensada",
    badge: "Distorsión Arquitectónica",
    badgeColor: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    definition: "Estadío avanzado irreversible caracterizado por desestructuración difusa del parénquima, nódulos regenerativos y puentes fibróticos extensos.",
    mechanism: "La pérdida de las fenestraciones sinusoidales y la formación de shunts vasculares intrahepáticos aumentan la resistencia al flujo portal.",
    clinicalReality: "Desarrolla hipertensión portal, várices esofágicas sangrantes, ascitis e insuficiencia hepática. No es un desenlace obligatorio para todo paciente infectado."
  },
  carcinoma: {
    id: "carcinoma",
    title: "Carcinoma Hepatocelular (CHC)",
    badge: "Neoplasia Maligna",
    badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    definition: "Tumor maligno primario originado en los hepatocitos como consecuencia de inestabilidad genómica, mutagénesis y proliferación clonal.",
    mechanism: "En VHC se desarrolla casi exclusivamente sobre un hígado previamente cirrótico. En VHB, la proteína HBx y la integración del ADN viral pueden inducir oncogénesis incluso sin cirrosis previa.",
    clinicalReality: "Exige tamizaje semestral con ecografía hepática y alfafetoproteína (AFP) en todos los pacientes con cirrosis o infección crónica activa de riesgo."
  }
};

export const HepChronicFibrosis: React.FC = () => {
  const [selectedOutcome, setSelectedOutcome] = useState<OutcomeId>("persistencia");
  const [studentAnswer, setStudentAnswer] = useState<string | null>(null);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);

  const currentData = OUTCOMES[selectedOutcome];

  const handleReset = () => {
    setSelectedOutcome("persistencia");
    setStudentAnswer(null);
    setIsRevealed(false);
  };

  return (
    <GlassCard className="p-5 sm:p-7 rounded-3xl border border-amber-500/30 bg-slate-950/80 shadow-2xl space-y-6">
      
      {/* Cabecera de la Unidad */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[11px] font-bold border border-amber-500/30">
              HEP-03 · Actividad interactiva
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              CAT-20 · Págs. 5, 6, 7, 8, 15
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Infección Crónica, Fibrosis, Cirrosis y Carcinoma
          </h3>
          <p className="text-xs text-slate-300">
            <strong>Objetivo:</strong> Distinguir persistencia de infección, cirrosis y carcinoma como conceptos patológicos diferentes, contrastando la afirmación docente de la pág. 15 con evidencia de la OMS.
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

      {/* Árbol Interactivo de Desenlaces (No lineal) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Ramas de Evolución Natural Posibles:
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Modelo no determinista</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {(["resolucion", "persistencia", "fibrosis", "cirrosis", "carcinoma"] as const).map((id) => {
            const isSelected = selectedOutcome === id;
            const o = OUTCOMES[id];
            return (
              <button
                key={id}
                onClick={() => setSelectedOutcome(id)}
                aria-pressed={isSelected}
                className={`p-3 rounded-2xl text-left border transition-all min-h-[70px] flex flex-col justify-between ${
                  isSelected
                    ? "bg-amber-500/20 border-amber-400/60 shadow-lg shadow-amber-950/40 ring-1 ring-amber-400/30"
                    : "bg-slate-900/60 hover:bg-slate-900 text-slate-300 border-white/5"
                }`}
              >
                <div className="flex items-center justify-between gap-1 w-full">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? "text-amber-300" : "text-slate-400"}`}>
                    {o.badge}
                  </span>
                  {isSelected && <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />}
                </div>
                <span className={`text-xs font-bold leading-snug mt-1 ${isSelected ? "text-white" : "text-slate-300"}`}>
                  {o.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detalle Conceptual de la Rama Seleccionada */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-white/10 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2">
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-amber-400 shrink-0" />
            <h4 className="text-sm sm:text-base font-bold text-white">
              {currentData.title}
            </h4>
          </div>
          <span className={`text-[11px] px-2.5 py-0.5 rounded-full border ${currentData.badgeColor} font-semibold w-fit`}>
            {currentData.badge}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
            <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px] block">
              Definición y Alcance:
            </span>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              {currentData.definition}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
            <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px] block">
              Mecanismo Celular:
            </span>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              {currentData.mechanism}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
            <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px] block">
              Realidad Epidemiológica (OMS):
            </span>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              {currentData.clinicalReality}
            </p>
          </div>
        </div>
      </div>

      {/* Decisión y Ejercicio Crítico del Estudiante */}
      <div className="p-4 sm:p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-3">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <h4 className="text-xs sm:text-sm font-bold text-white">
            Evaluación Crítica de Afirmaciones de Cátedra:
          </h4>
        </div>

        <p className="text-xs text-slate-200 leading-relaxed">
          En la página 15 de la Cátedra 20 se señala textualmente que la infección por VHC <em>«se vuelve crónica y termina en cirrosis»</em>. 
          <strong>¿Es científicamente riguroso afirmar que toda infección crónica por VHC termina obligatoriamente en cirrosis?</strong>
        </p>

        {/* Opciones */}
        <div className="space-y-2 pt-1">
          {[
            {
              id: "resp-1",
              text: "No. La cirrosis es una complicación posible que se desarrolla en un 15% a 30% de los pacientes crónicos a lo largo de 20 a 30 años, influida por factores como consumo de alcohol, edad y coinfecciones."
            },
            {
              id: "resp-2",
              text: "Sí. Todo paciente con anticuerpos reactivos contra VHC desarrolla cirrosis descompensada de manera inevitable antes de 5 años."
            },
            {
              id: "resp-3",
              text: "No, porque el virus de la hepatitis C solo infecta las células de la sangre y no afecta al tejido hepático."
            }
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => {
                setStudentAnswer(opt.id);
                setIsRevealed(false);
              }}
              className={`w-full text-left p-3 rounded-xl border text-xs transition-all min-h-[44px] flex items-center justify-between gap-3 ${
                studentAnswer === opt.id
                  ? "bg-amber-500/20 border-amber-400 text-white font-semibold"
                  : "bg-slate-900/60 hover:bg-slate-900 border-white/5 text-slate-300"
              }`}
            >
              <span>{opt.text}</span>
              <span className={`w-4 h-4 rounded-full border shrink-0 flex items-center justify-center ${
                studentAnswer === opt.id ? "border-amber-400 bg-amber-400" : "border-slate-600"
              }`}>
                {studentAnswer === opt.id && <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
              </span>
            </button>
          ))}
        </div>

        {/* Botón Comprobar */}
        <div className="pt-2 flex items-center justify-between">
          <button
            onClick={() => setIsRevealed(true)}
            disabled={!studentAnswer}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all min-h-[44px] flex items-center gap-2 ${
              studentAnswer
                ? "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-950/40"
                : "bg-slate-800 text-slate-500 cursor-not-allowed"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Comprobar y Revelar Criterio</span>
          </button>
          <span className="text-[11px] text-slate-400 font-mono">
            {studentAnswer ? "Opción marcada" : "Selecciona una respuesta"}
          </span>
        </div>

        {/* Retroalimentación */}
        {isRevealed && (
          <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-amber-500/40 space-y-2.5 animate-in fade-in duration-200 text-xs">
            {studentAnswer === "resp-1" ? (
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>¡Exacto! Distinción Científica Clave</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-rose-400 font-bold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Respuesta imprecisa:</span>
              </div>
            )}

            <p className="text-slate-300 leading-relaxed text-[11px]">
              <strong>Criterio de Contraste con la OMS:</strong> La OMS establece explícitamente que entre el 15% y el 30% de las personas infectadas crónicamente por el virus de la hepatitis C contraerán cirrosis a lo largo de un período de 20 a 30 años. Muchos pacientes permanecen con fibrosis leve o estable y nunca progresan a cirrosis en su expectativa de vida, especialmente con el acceso actual a terapias antivirales directas curativas (AAD). Equiparar cronicidad con cirrosis inevitable es un error conceptual que genera alarma infundada en el paciente.
            </p>

            <div className="p-3 rounded-lg bg-slate-900 border border-white/10 text-slate-300 text-[11px] flex items-center justify-between gap-2">
              <span className="text-slate-400">Fuente oficial de contraste:</span>
              <a
                href="https://www.who.int/news-room/fact-sheets/detail/hepatitis-c"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-400 hover:text-sky-300 font-semibold inline-flex items-center gap-1"
              >
                <span>OMS: Ficha técnica Hepatitis C</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}

      </div>

    </GlassCard>
  );
};
