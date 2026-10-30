"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  ShieldAlert, 
  Activity, 
  AlertTriangle, 
  Heart, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Info, 
  BookOpen, 
  ExternalLink,
  Layers,
  Flame,
  ArrowRight
} from "lucide-react";

interface LayerDetail {
  id: "infeccion" | "sepsis" | "shock";
  title: string;
  badge: string;
  badgeColor: string;
  definition: string;
  physiopathology: string;
  clinicalHallmarks: string[];
  contrastNote: string;
}

const LAYERS_DATA: LayerDetail[] = [
  {
    id: "infeccion",
    title: "1. Infección Localizada",
    badge: "Foco primario",
    badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    definition: "Invasión y multiplicación de microorganismos en un tejido corporal con respuesta inflamatoria local proporcional.",
    physiopathology: "Las células fagocíticas y el endotelio local contienen el inóculo infeccioso en el sitio anatómico (ej. pulmón, tracto urinario, piel, tejido subcutáneo).",
    clinicalHallmarks: [
      "Síntomas cardinales locales: calor, rubor, tumor, dolor o disfunción localizada",
      "Respuesta fisiológica conservada; no hay disfunción de órganos a distancia",
      "Población leucocitaria reclutada activamente hacia el foco primario"
    ],
    contrastNote: "Una infección, aunque cause fiebre o dolor, NO constituye sepsis mientras no exista una respuesta desregulada que ocasione disfunción en órganos distantes."
  },
  {
    id: "sepsis",
    title: "2. Sepsis (Respuesta Desregulada)",
    badge: "Sepsis-3 Consenso",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    definition: "Disfunción orgánica potencialmente mortal causada por una respuesta desregulada del huésped a la infección (Consenso Sepsis-3 / CDC).",
    physiopathology: "Falla de contención local: citoquinas inflamatorias y mediadores endógenos provocan daño tisular difuso, alteración de la microcirculación y disfunción orgánica multiorgánica aguda.",
    clinicalHallmarks: [
      "Alteración en escala SOFA (≥2 puntos sobre el basal del paciente)",
      "Compromiso orgánico agudo: respiratorio (PaO2/FiO2), cardiovascular, hepático (bilirrubina), renal (creatinina/oliguria), coagulación (trombocitopenia) o neurológico (Glasgow)",
      "No requiere confirmación microbiológica inmediata para activar el protocolo de soporte"
    ],
    contrastNote: "Sepsis NO es sinónimo de bacteriemia ni de fiebre alta. Es el síndrome lesional biológico generado por la propia respuesta del huésped."
  },
  {
    id: "shock",
    title: "3. Shock Séptico Distributivo",
    badge: "Colapso Circulatorio y Celular",
    badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    definition: "Subconjunto de la sepsis en el que las anomalías circulatorias y del metabolismo celular son lo suficientemente profundas como para incrementar sustancialmente la mortalidad (mortalidad hospitalaria >40%).",
    physiopathology: "Vasodilatación arteriolar patológica, fuga capilar masiva, hipovolemia distributiva y depresión miocárdica que inducen hipoperfusión tisular refractaria y metabolismo anaerobio sistémico.",
    clinicalHallmarks: [
      "Hipotensión persistente que REQUIERE VASOPRESORES para mantener PAM ≥ 65 mmHg a pesar de fluidoterapia adecuada",
      "Lactato sérico > 2 mmol/L (18 mg/dL) persistente que denota hipoxia y disfunción metabólica a nivel celular",
      "Perfusión tisular crítica: piel moteada, oliguria severa, acidosis metabólica"
    ],
    contrastNote: "El shock séptico NO equivale a 'cualquier falla de órganos' ni a una hipotensión transitoria o síncope; exige colapso hemodinámico refractario a fluidos Y disfunción metabólica con hiperlactatemia."
  }
];

export const VasSepsisShock: React.FC = () => {
  const [activeLayer, setActiveLayer] = useState<"infeccion" | "sepsis" | "shock">("sepsis");
  
  // Interactive Decision State
  const [q1Answer, setQ1Answer] = useState<number | null>(null);
  const [q2Answer, setQ2Answer] = useState<number | null>(null);
  const [hasEvaluated, setHasEvaluated] = useState(false);

  const currentLayerData = LAYERS_DATA.find(l => l.id === activeLayer)!;

  const handleEvaluate = () => {
    setHasEvaluated(true);
  };

  const handleReset = () => {
    setQ1Answer(null);
    setQ2Answer(null);
    setHasEvaluated(false);
    setActiveLayer("infeccion");
  };

  return (
    <div className="space-y-6">
      
      {/* Encabezado y Guía Docente */}
      <GlassCard className="p-6 border-amber-500/30 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-amber-950/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4 mb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-xs font-bold border border-amber-500/30">
                VAS-03 · Actividad interactiva
              </span>
              <span className="text-xs text-slate-400 font-mono">CAT-21 · Pág. 8</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-rose-400" />
              Sepsis y Shock Séptico Distributivo
            </h2>
          </div>

          <a
            href="https://www.cdc.gov/sepsis/about/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-cyan-300 text-xs border border-cyan-500/30 transition-colors w-fit"
          >
            <span>CDC: Sepsis Definition</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed">
          <strong className="text-white">Objetivo conceptual:</strong> Distinguir con precisión científica una <strong className="text-blue-300">infección localizada</strong>, la <strong className="text-amber-300">sepsis</strong> (respuesta desregulada con disfunción orgánica aguda) y el <strong className="text-rose-300">shock séptico</strong> (colapso hemodinámico refractario a volumen con hiperlactatemia).
        </p>
      </GlassCard>

      {/* Capas Conceptuales Interactivas */}
      <GlassCard className="p-6 border-white/10 space-y-5">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
            <Layers className="w-4 h-4 text-amber-400" />
            1. Exploración de Capas Biológicas del Deterioro Sistémico
          </h3>
          <p className="text-xs text-slate-400">
            Selecciona cada nivel para examinar qué fenómenos fisiopatológicos y criterios clínicos lo diferencian de los demás.
          </p>
        </div>

        {/* Botones de Capas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {LAYERS_DATA.map((layer) => {
            const isSelected = activeLayer === layer.id;
            return (
              <button
                key={layer.id}
                onClick={() => setActiveLayer(layer.id)}
                className={`p-3.5 rounded-2xl text-left border transition-all flex flex-col justify-between gap-2 min-h-[82px] ${
                  isSelected
                    ? "bg-slate-800/95 border-amber-400 ring-2 ring-amber-400/20 shadow-lg"
                    : "bg-slate-900/50 hover:bg-slate-900 border-white/5 text-slate-300"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-bold text-white">{layer.title}</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${layer.badgeColor}`}>
                    {layer.badge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2">
                  {layer.definition}
                </p>
              </button>
            );
          })}
        </div>

        {/* Panel Detallado de la Capa Activa */}
        <div className="p-5 rounded-2xl bg-slate-950/70 border border-white/10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                Criterio Fisiopatológico y Clínico
              </span>
              <h4 className="text-base font-bold text-white">
                {currentLayerData.title}
              </h4>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold border w-fit ${currentLayerData.badgeColor}`}>
              {currentLayerData.badge}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-2">
              <span className="font-semibold text-slate-300 block">Mecanismo Patogénico:</span>
              <p className="text-slate-400 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-white/5">
                {currentLayerData.physiopathology}
              </p>
            </div>

            <div className="space-y-2">
              <span className="font-semibold text-slate-300 block">Hallazgos y Marcadores Clave:</span>
              <ul className="space-y-1.5 bg-slate-900/60 p-3 rounded-xl border border-white/5">
                {currentLayerData.clinicalHallmarks.map((h, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-slate-300">
                    <span className="text-amber-400 font-bold shrink-0">•</span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Nota de contraste docente */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="text-amber-300">Aclaración diferencial con respecto a CAT-21 pág. 8:</strong>
              <p>{currentLayerData.contrastNote}</p>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Ejercicio de Juicio Crítico / Decisión del Estudiante */}
      <GlassCard className="p-6 border-white/10 space-y-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-rose-400" />
              2. Juicio Conceptual: Criterios que Definen Sepsis y Shock Séptico
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Responde antes de verificar para contrastar tu razonamiento con las guías internacionales Sepsis-3 y CDC.
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

        {/* Pregunta 1: Sepsis vs Infección Localizada */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-200 block">
            Pregunta 1: ¿Cuál es el rasgo definitorio que transforma una infección en «sepsis» según el consenso Sepsis-3?
          </label>
          <div className="space-y-2">
            {[
              { id: 0, text: "La presencia de fiebre alta (>38.5 °C) acompañada de taquicardia y leucocitosis periférica aislada." },
              { id: 1, text: "La disfunción orgánica aguda potencialmente mortal secundaria a una respuesta desregulada del huésped frente a la infección." },
              { id: 2, text: "La confirmación microbiológica obligatoria de bacterias vivas en dos o más hemocultivos positivos." }
            ].map((opt) => {
              const isSelected = q1Answer === opt.id;
              const isCorrect = opt.id === 1;
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

        {/* Pregunta 2: Shock Séptico vs Falla de Órganos General */}
        <div className="space-y-3 pt-2">
          <label className="text-xs font-semibold text-slate-200 block">
            Pregunta 2: ¿Por qué el shock séptico NO equivale simplemente a «cualquier falla orgánica» o a una hipotensión común?
          </label>
          <div className="space-y-2">
            {[
              { id: 0, text: "Porque se define estrictamente por colapso cardiovascular y celular refractario: hipotensión que requiere vasopresores (PAM ≥ 65 mmHg) Y lactato > 2 mmol/L tras reposición con volumen." },
              { id: 1, text: "Porque el shock séptico solo puede diagnosticarse si existe falla hepática y renal simultáneas demostradas por ecografía." },
              { id: 2, text: "Porque cualquier paciente que experimente mareo o presión arterial sistólica transitoria menor a 100 mmHg ya cumple criterio de shock séptico." }
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
              onClick={handleEvaluate}
              disabled={q1Answer === null || q2Answer === null}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
                q1Answer !== null && q2Answer !== null
                  ? "bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md shadow-amber-950/40"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed"
              }`}
            >
              <span>Verificar Criterios y Explicación</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Retroalimentación Científica Completa */
          <div className="p-4 rounded-2xl bg-slate-900 border border-amber-500/30 space-y-3 animate-fade-in text-xs">
            <div className="flex items-center gap-2 text-amber-300 font-bold">
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              <span>Retroalimentación Formativa y Criterios Internacionales:</span>
            </div>

            <div className="space-y-2 text-slate-300 leading-relaxed">
              <p>
                • <strong>Infección frente a Sepsis:</strong> La respuesta inflamatoria con fiebre y leucocitosis (antes conocida como SIRS) puede responder a múltiples estímulos sin constituir sepsis. Lo que define a la <strong className="text-amber-300">sepsis (Sepsis-3)</strong> es la disfunción orgánica aguda cuantificable (ej. aumento en escala SOFA $\ge 2$), producida por la propia respuesta desregulada del huésped. Asimismo, hasta un 30-50% de las sepsis cursan con hemocultivos negativos, por lo que la confirmación bacteriológica no es condición indispensable para el diagnóstico sindrómico.
              </p>
              <p>
                • <strong>Shock Séptico como subconjunto crítico:</strong> El shock séptico es una emergencia hemodinámica y metabólica específica. No basta con hipotensión aislada ni cualquier disfunción aislada: requiere que, tras administrar volumen adecuado, persista necesidad de <strong className="text-rose-300">vasopresores para PAM &ge; 65 mmHg</strong> y un <strong className="text-rose-300">lactato &gt; 2 mmol/L</strong>, lo que refleja alteración celular profunda y dispara la mortalidad hospitalaria por encima del 40%.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-white/5 text-[11px] text-slate-400 font-mono">
              <strong>Límite docente:</strong> Esta unidad ilustra los fundamentos de fisiopatología sistémica. El manejo del shock séptico requiere monitorización intensiva hospitalaria y soporte hemodinámico especializado según guías Surviving Sepsis Campaign.
            </div>
          </div>
        )}
      </GlassCard>

    </div>
  );
};
