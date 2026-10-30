"use client";

import React, { useState } from "react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  Flame, 
  ExternalLink, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Info, 
  ArrowRight,
  ShieldAlert,
  Zap,
  Activity,
  Layers
} from "lucide-react";

type PathwayMode = "convencional" | "superantigeno";

export const VasToxicShockSuperantigen: React.FC = () => {
  const [activeMode, setActiveMode] = useState<PathwayMode>("superantigeno");

  // Student Evaluation State
  const [q1Answer, setQ1Answer] = useState<number | null>(null);
  const [q2Answer, setQ2Answer] = useState<number | null>(null);
  const [hasEvaluated, setHasEvaluated] = useState(false);

  const handleReset = () => {
    setQ1Answer(null);
    setQ2Answer(null);
    setHasEvaluated(false);
    setActiveMode("convencional");
  };

  return (
    <div className="space-y-6">
      
      {/* Encabezado Pedagógico */}
      <GlassCard className="p-6 border-amber-500/30 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-rose-950/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4 mb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono text-xs font-bold border border-rose-500/30">
                VAS-09 · Actividad interactiva
              </span>
              <span className="text-xs text-slate-400 font-mono">CAT-21 · Pág. 20</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              Shock Tóxico y Superantígenos Bacterianos
            </h2>
          </div>

          <a
            href="https://www.cdc.gov/groupastrep/diseases-public/streptococcal-toxic-shock-syndrome.html"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs border border-white/10 transition-colors w-fit"
          >
            <span>CDC: STSS Guidelines</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed">
          <strong className="text-white">Objetivo conceptual:</strong> Distinguir la fisiopatología inmunológica del shock mediado por <strong className="text-amber-300">superantígenos bacterianos</strong> frente a la presentación antigénica convencional, y contrastar la toxina TSST-1 de <em>Staphylococcus aureus</em> con las exotoxinas pirogénicas de <em>Streptococcus pyogenes</em>.
        </p>
      </GlassCard>

      {/* Selector de Esquema Inmunológico Interactivo */}
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveMode("convencional")}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
              activeMode === "convencional"
                ? "bg-blue-500/20 border-blue-400 text-white shadow-md shadow-blue-950/40"
                : "bg-slate-900/60 hover:bg-slate-800 text-slate-400 border-white/5"
            }`}
          >
            1. Presentación Antigénica Convencional (Específica)
          </button>
          <button
            onClick={() => setActiveMode("superantigeno")}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              activeMode === "superantigeno"
                ? "bg-rose-500/20 border-rose-400 text-white shadow-md shadow-rose-950/40"
                : "bg-slate-900/60 hover:bg-slate-800 text-slate-400 border-white/5"
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>2. Activación por Superantígeno (Policlonal Masiva)</span>
          </button>
        </div>

        {/* Representación Visual Conceptual */}
        <GlassCard className="p-5 border-white/10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                Mecanismo Molecular Representado
              </span>
              <h3 className="text-base font-bold text-white">
                {activeMode === "convencional"
                  ? "Reconocimiento Peptídico Restringido al Surco CMH-II"
                  : "Puente Directo Externo: Superantígeno + Cadena Vβ del TCR"}
              </h3>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold border ${
              activeMode === "convencional"
                ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                : "bg-rose-500/20 text-rose-300 border-rose-500/30"
            }`}>
              {activeMode === "convencional" ? "Activación < 0.01% de Linfocitos T" : "Activación Masiva: Hasta 20% de Linfocitos T"}
            </span>
          </div>

          {/* Diagrama Esquemático SVG */}
          <div className="w-full bg-slate-950/80 rounded-2xl p-4 sm:p-6 border border-white/10 flex flex-col items-center justify-center">
            <svg viewBox="0 0 540 220" className="w-full max-w-[500px] h-auto select-none" aria-label="Diagrama de activación linfocitaria">
              {/* Célula Presentadora de Antígeno (CPA) */}
              <rect x="30" y="30" width="140" height="160" rx="20" fill="#1e293b" stroke="#475569" strokeWidth="2" />
              <text x="100" y="60" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="bold">Célula Presentadora</text>
              <text x="100" y="78" textAnchor="middle" fill="#64748b" fontSize="9">(Macrófago / DC)</text>

              {/* Complejo CMH-II */}
              <path d="M 170 85 L 220 85 L 220 100 L 170 100 Z" fill="#3b82f6" />
              <path d="M 170 120 L 220 120 L 220 135 L 170 135 Z" fill="#3b82f6" />
              <text x="195" y="76" textAnchor="middle" fill="#60a5fa" fontSize="9" fontWeight="bold">CMH-II</text>

              {/* Receptor de Linfocito T (TCR) */}
              <path d="M 320 85 L 370 85 L 370 100 L 320 100 Z" fill="#10b981" />
              <path d="M 320 120 L 370 120 L 370 135 L 320 135 Z" fill="#10b981" />
              <text x="345" y="76" textAnchor="middle" fill="#34d399" fontSize="9" fontWeight="bold">TCR (Vβ)</text>

              {/* Linfocito T */}
              <rect x="370" y="30" width="140" height="160" rx="20" fill="#1e293b" stroke="#475569" strokeWidth="2" />
              <text x="440" y="60" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="bold">Linfocito T</text>
              <text x="440" y="78" textAnchor="middle" fill="#64748b" fontSize="9">(CD4+ cooperador)</text>

              {activeMode === "convencional" ? (
                /* Modo Convencional: Péptido procesado en el centro del surco */
                <g>
                  {/* Hendidura con antígeno */}
                  <rect x="220" y="98" width="100" height="24" rx="4" fill="#f59e0b" stroke="#d97706" strokeWidth="1.5" />
                  <text x="270" y="114" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">Péptido antigénico</text>
                  <line x1="220" y1="110" x2="170" y2="110" stroke="#f59e0b" strokeDasharray="2 2" />
                  <line x1="320" y1="110" x2="370" y2="110" stroke="#f59e0b" strokeDasharray="2 2" />
                  <text x="270" y="150" textAnchor="middle" fill="#cbd5e1" fontSize="10">Procesado dentro del surco CMH-II</text>
                  <text x="270" y="165" textAnchor="middle" fill="#38bdf8" fontSize="9">Respuesta clonal controlada (~0.001%)</text>
                </g>
              ) : (
                /* Modo Superantígeno: Toxina une CMH y TCR por fuera */
                <g>
                  {/* Espacio del surco sin péptido específico relevante */}
                  <rect x="235" y="103" width="70" height="14" rx="2" fill="#334155" stroke="#475569" strokeDasharray="2 2" />
                  <text x="270" y="113" textAnchor="middle" fill="#64748b" fontSize="8">Surco no restrictivo</text>
                  
                  {/* Superantígeno haciendo puente externo */}
                  <circle cx="270" cy="65" r="22" fill="#f43f5e" stroke="#fb7185" strokeWidth="2" />
                  <text x="270" y="63" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">SUPER-</text>
                  <text x="270" y="73" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">ANTÍGENO</text>
                  
                  {/* Enlaces cruzados externos */}
                  <line x1="248" y1="65" x2="210" y2="85" stroke="#f43f5e" strokeWidth="3" />
                  <line x1="292" y1="65" x2="330" y2="85" stroke="#f43f5e" strokeWidth="3" />
                  <text x="270" y="150" textAnchor="middle" fill="#fca5a5" fontSize="10" fontWeight="bold">Unión externa directa e indiscriminada</text>
                  <text x="270" y="168" textAnchor="middle" fill="#f87171" fontSize="9" fontWeight="bold">Tormenta de citoquinas (IL-1, IL-2, TNF, IFN-γ)</text>
                </g>
              )}
            </svg>
          </div>

          {/* Fisiopatología Comparativa de Agentes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-900/70 border border-white/5 space-y-2">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="font-bold text-white italic">Staphylococcus aureus (TSST-1)</span>
                <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  Shock Tóxico Clásico
                </span>
              </div>
              <ul className="space-y-1.5 text-slate-300">
                <li>• Mediado por la <strong>TSST-1</strong> o enterotoxinas estafilocócicas liberadas localmente.</li>
                <li>• Foco colonizante (ej. uso prolongado de tampones, heridas quirúrgicas superficiales).</li>
                <li>• <strong>Hemocultivos a menudo NEGATIVOS:</strong> la clínica sistémica deriva de la toxina absorbida al plasma y no de una gran invasión bacteriana en sangre.</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/70 border border-white/5 space-y-2">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="font-bold text-white italic">Streptococcus pyogenes (SpeA, SpeC)</span>
                <span className="text-[10px] font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                  STSS Estreptocócico
                </span>
              </div>
              <ul className="space-y-1.5 text-slate-300">
                <li>• Mediado por <strong>exotoxinas pirogénicas estreptocócicas</strong> (SpeA, SpeC).</li>
                <li>• Asociado frecuentemente a infecciones invasivas graves de tejidos blandos (fascitis necrotizante).</li>
                <li>• <strong>Hemocultivos habitualmente POSITIVOS:</strong> bacteriemia concomitante y mayor tasa de letalidad global.</li>
              </ul>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Ejercicio de Juicio Crítico */}
      <GlassCard className="p-6 border-white/10 space-y-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-400" />
              Juicio Conceptual: Mecanismo de Toxina frente a Presencia de Bacterias
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Diferencia el efecto molecular de la toxina del aislamiento de bacterias viables en sangre.
            </p>
          </div>
          {(q1Answer !== null || q2Answer !== null) && (
            <button
              onClick={handleReset}
              className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restablecer</span>
            </button>
          )}
        </div>

        {/* Pregunta 1 */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-200 block">
            Pregunta 1: ¿Por qué un paciente con shock tóxico estafilocócico por TSST-1 puede presentar colapso hemodinámico grave y descamación cutánea teniendo hemocultivos repetidamente negativos?
          </label>
          <div className="space-y-2">
            {[
              { id: 0, text: "Porque la patología no depende de que la bacteria colonice masivamente la sangre, sino de la absorción sistémica de la exotoxina TSST-1 sintetizada en un foco mucoso o tisular localizado." },
              { id: 1, text: "Porque TSST-1 destruye los glóbulos blancos en los frascos de hemocultivo impidiendo el crecimiento in vitro." },
              { id: 2, text: "Porque el shock séptico y el shock tóxico solo ocurren cuando las bacterias mutan a virus." }
            ].map((opt) => {
              const isSelected = q1Answer === opt.id;
              const isCorrect = opt.id === 0;
              let itemClass = "bg-slate-900/60 border-white/5 hover:border-slate-600 text-slate-300";
              if (hasEvaluated) {
                if (isCorrect) itemClass = "bg-emerald-950/40 border-emerald-500/50 text-emerald-200";
                else if (isSelected) itemClass = "bg-rose-950/40 border-rose-500/50 text-rose-200";
              } else if (isSelected) {
                itemClass = "bg-amber-500/20 border-amber-400 text-white";
              }

              return (
                <button
                  key={opt.id}
                  onClick={() => !hasEvaluated && setQ1Answer(opt.id)}
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

        {/* Pregunta 2 */}
        <div className="space-y-3 pt-2">
          <label className="text-xs font-semibold text-slate-200 block">
            Pregunta 2: ¿Cuál es la diferencia inmunológica entre el antígeno convencional y un superantígeno?
          </label>
          <div className="space-y-2">
            {[
              { id: 0, text: "El antígeno convencional requiere procesamiento intracelular y encaje específico en el surco del CMH-II (activando &lt;0.01% de clones T), mientras que el superantígeno se une por fuera de la hendidura conectando directamente CMH-II con la región Vβ del TCR, activando policlonalmente hasta un 20% de los linfocitos T." },
              { id: 1, text: "El superantígeno se une exclusivamente a los eritrocitos anulando el transporte de oxígeno." },
              { id: 2, text: "El superantígeno impide la formación de cualquier tipo de citoquina en el sistema inmune." }
            ].map((opt) => {
              const isSelected = q2Answer === opt.id;
              const isCorrect = opt.id === 0;
              let itemClass = "bg-slate-900/60 border-white/5 hover:border-slate-600 text-slate-300";
              if (hasEvaluated) {
                if (isCorrect) itemClass = "bg-emerald-950/40 border-emerald-500/50 text-emerald-200";
                else if (isSelected) itemClass = "bg-rose-950/40 border-rose-500/50 text-rose-200";
              } else if (isSelected) {
                itemClass = "bg-amber-500/20 border-amber-400 text-white";
              }

              return (
                <button
                  key={opt.id}
                  onClick={() => !hasEvaluated && setQ2Answer(opt.id)}
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

        {/* Botón de Comprobación */}
        {!hasEvaluated ? (
          <div className="pt-2 flex justify-end">
            <button
              onClick={() => setHasEvaluated(true)}
              disabled={q1Answer === null || q2Answer === null}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
                q1Answer !== null && q2Answer !== null
                  ? "bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md shadow-amber-950/40"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed"
              }`}
            >
              <span>Verificar Mecanismo Inmunológico</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-900 border border-amber-500/30 space-y-2 animate-fade-in text-xs">
            <div className="flex items-center gap-2 text-amber-300 font-bold">
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              <span>Retroalimentación Biológica (CDC STSS):</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              El superantígeno subvierte el principio de especificidad del sistema inmune adaptativo. Al actuar como una «grapa» molecular externa entre el CMH-II de la CPA y cualquier TCR que porte una variante particular de cadena V$\beta$, no necesita ser procesado a péptido por la célula presentadora. Esta activación indiscriminada y simultánea de uno de cada cinco linfocitos T circulantes satura al organismo de mediadores inflamatorios (IL-1, IL-2, TNF-$\alpha$, IFN-$\gamma$), generando vasodilatación masiva, extravasación de plasma y shock con daño multiorgánico fulminante.
            </p>
          </div>
        )}
      </GlassCard>

    </div>
  );
};
