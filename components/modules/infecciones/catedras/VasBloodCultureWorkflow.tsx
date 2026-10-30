"use client";

import React, { useState } from "react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  FlaskConical, 
  ExternalLink, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Info, 
  ArrowRight,
  ShieldCheck,
  Activity,
  Layers,
  Sparkles,
  Clock,
  Microscope
} from "lucide-react";

interface WorkflowStep {
  id: number;
  phaseName: string;
  badge: string;
  badgeColor: string;
  questionAnswered: string;
  actions: string;
  criticalLimit: string;
}

const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    id: 1,
    phaseName: "1. Toma de Muestra Aséptica (Venopunción)",
    badge: "Fase Preanalítica",
    badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    questionAnswered: "¿Se tomó sangre en condiciones estériles antes de alterar la carga bacteriana con antibióticos?",
    actions: "Desinfección estricta de la piel del paciente con clorhexidina alcohólica o alcohol al 70% y punción venosa directa. Inoculación inmediata de sangre en botellas con caldo nutritivo (pares aerobio y anaerobio), evitando puncionar a través de catéteres ya colocados a menos que se sospeche infección específica del dispositivo.",
    criticalLimit: "Una técnica de asepsia deficiente arrastra comensales de la piel (Staphylococcus epidermidis, Cutibacterium acnes), generando falsos positivos por contaminación que confunden el diagnóstico."
  },
  {
    id: 2,
    phaseName: "2. Incubación Automatizada y Detección Continua",
    badge: "Fase Analítica: Alarma de Crecimiento",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    questionAnswered: "¿Hay proliferación microbiana activa en el frasco?",
    actions: "Los frascos se introducen en estufas automatizadas con agitación a 35-37 °C. Sensores colorimétricos o fluorescentes en la base de la botella miden en tiempo real la producción de CO2 derivado del metabolismo microbiano. Al sobrepasar un umbral, el equipo emite una alarma audible y visual («frasco positivo»).",
    criticalLimit: "¡Atención! La alarma de crecimiento SOLO responde si hay gérmenes viables multiplicándose. En este instante NO se conoce la especie ni si es sensible o resistente a los antibióticos."
  },
  {
    id: 3,
    phaseName: "3. Tinción de Gram Directa Urgente",
    badge: "Informe Preliminar Inmediato",
    badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    questionAnswered: "¿Qué morfología y afinidad tintorial tienen los microorganismos que crecieron?",
    actions: "El tecnólogo médico o microbiólogo extrae de inmediato una alícuota aséptica del caldo del frasco positivo, realiza un frotis y tiñe con Gram al microscopio óptico. Comunica telefónicamente el resultado crítico preliminar al médico tratante (ej. «Cocos grampositivos en racimos» o «Bacilos gramnegativos»).",
    criticalLimit: "Permite al clínico ajustar o desescalar precozmente la cobertura empírica mientras se espera la identificación definitiva de especie al día siguiente."
  },
  {
    id: 4,
    phaseName: "4. Subcultivo en Placas de Agar Sólido",
    badge: "Aislamiento de Colonias Puras",
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    questionAnswered: "¿Cómo se aíslan colonias puras para su caracterización bioquímica?",
    actions: "Se siembra el caldo en medios de cultivo sólidos diferenciales y enriquecidos (Agar Sangre de cordero, Agar Chocolate, Agar MacConkey). Se incuba 18-24 horas para obtener colonias aisladas homogéneas libres de componentes de la sangre del paciente.",
    criticalLimit: "Es un paso físico indispensable para realizar espectrometría de masas (MALDI-TOF) o paneles automatizados de identificación y susceptibilidad."
  },
  {
    id: 5,
    phaseName: "5. Identificación de Especie y Antibiograma (CIM)",
    badge: "Informe Definitivo Dirigido",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    questionAnswered: "¿Qué especie exacta es y a qué antimicrobianos es susceptible?",
    actions: "Identificación de especie definitiva mediante MALDI-TOF o pruebas bioquímicas. Realización de pruebas de susceptibilidad antimicrobiana para calcular la Concentración Inhibitoria Mínima (CIM) e identificar mecanismos de resistencia (SAMR, BLEE, carbapenemasas).",
    criticalLimit: "Es la base científica para el desescalamiento terapéutico hacia el antibiótico más eficaz, seguro y de menor espectro posible."
  }
];

export const VasBloodCultureWorkflow: React.FC = () => {
  const [selectedStepId, setSelectedStepId] = useState<number>(2);

  // Interactive Student Decision
  const [q1Answer, setQ1Answer] = useState<number | null>(null);
  const [q2Answer, setQ2Answer] = useState<number | null>(null);
  const [hasEvaluated, setHasEvaluated] = useState(false);

  const activeStep = WORKFLOW_STEPS.find(s => s.id === selectedStepId)!;

  const handleReset = () => {
    setQ1Answer(null);
    setQ2Answer(null);
    setHasEvaluated(false);
    setSelectedStepId(1);
  };

  return (
    <div className="space-y-6">
      
      {/* Encabezado Pedagógico */}
      <GlassCard className="p-6 border-amber-500/30 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-blue-950/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4 mb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono text-xs font-bold border border-blue-500/30">
                VAS-11 · Actividad interactiva
              </span>
              <span className="text-xs text-slate-400 font-mono">CAT-21 · Pág. 23</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-blue-400" />
              Hemocultivo: Etapas del Estudio Microbiológico
            </h2>
          </div>

          <Link
            href="/agentes-infecciosos/metabolismo-cultivo"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 text-xs border border-blue-500/30 transition-colors w-fit"
          >
            <span>Módulo Métodos y Cultivo</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed">
          <strong className="text-white">Objetivo conceptual:</strong> Comprender la secuencia ordenada del hemocultivo automatizado, distinguiendo con precisión la <strong className="text-amber-300">detección de proliferación microbiana</strong> de la <strong className="text-emerald-300">identificación de especie</strong> y la <strong className="text-cyan-300">evaluación de susceptibilidad (antibiograma)</strong>.
        </p>
      </GlassCard>

      {/* Navegación por Etapas del Proceso */}
      <div className="space-y-4">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1.5 mb-1">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            Línea de Tiempo del Procesamiento en Laboratorio:
          </span>
          <p className="text-xs text-slate-400">
            Haz clic en cada fase para analizar qué pregunta clínica responde y qué información aún no está disponible.
          </p>
        </div>

        {/* Botones de Pasos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          {WORKFLOW_STEPS.map((s) => {
            const isSelected = selectedStepId === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setSelectedStepId(s.id)}
                className={`p-3 rounded-2xl text-left border transition-all flex flex-col justify-between gap-1.5 min-h-[76px] ${
                  isSelected
                    ? "bg-slate-800/95 border-blue-400 ring-2 ring-blue-400/20 shadow-lg"
                    : "bg-slate-900/50 hover:bg-slate-900 border-white/5 text-slate-300"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-[10px] font-mono text-slate-400 font-bold">Etapa {s.id}</span>
                  <span className={`text-[8px] font-mono px-1.5 py-0.2 rounded-full border ${s.badgeColor}`}>
                    {s.badge.split(":")[0]}
                  </span>
                </div>
                <span className="text-xs font-bold text-white leading-snug line-clamp-2">
                  {s.phaseName.split(". ")[1]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Panel Detallado de la Etapa Seleccionada */}
        <GlassCard className="p-5 border-white/10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-blue-400 font-bold">
                {activeStep.badge}
              </span>
              <h3 className="text-base font-bold text-white">
                {activeStep.phaseName}
              </h3>
            </div>
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-200">
              <strong className="text-blue-300">Pregunta clínica que responde:</strong> {activeStep.questionAnswered}
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <span className="font-semibold text-slate-200 block">Procedimiento Técnico en el Laboratorio:</span>
            <p className="text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-white/5">
              {activeStep.actions}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-300 block mb-0.5">Límite e Interpretación Correcta:</strong>
              <p className="leading-relaxed">{activeStep.criticalLimit}</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Ejercicio de Juicio Crítico */}
      <GlassCard className="p-6 border-white/10 space-y-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" />
              Juicio Conceptual: Diferenciar Detección, Identificación y Contaminación
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Comprueba si reconoces el alcance real de cada etapa del hemocultivo.
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
            Pregunta 1: En la madrugada, la estufa automatizada detecta aumento de CO2 y marca «frasco positivo» a las 14 horas de incubación. ¿Qué información clínica concluyente entrega este aviso en ese momento exacto?
          </label>
          <div className="space-y-2">
            {[
              { id: 0, text: "Entrega la especie bacteriana exacta y la lista de antibióticos a los que es resistente." },
              { id: 1, text: "Demuestra únicamente que existe proliferación microbiana activa en el frasco; aún no se conoce la especie, morfología ni susceptibilidad, requiriéndose tinción de Gram inmediata y subcultivo en placas." },
              { id: 2, text: "Descarta definitivamente cualquier posibilidad de que la muestra haya sido contaminada en la toma de piel." }
            ].map((opt) => {
              const isSelected = q1Answer === opt.id;
              const isCorrect = opt.id === 1;
              let itemClass = "bg-slate-900/60 border-white/5 hover:border-slate-600 text-slate-300";
              if (hasEvaluated) {
                if (isCorrect) itemClass = "bg-emerald-950/40 border-emerald-500/50 text-emerald-200";
                else if (isSelected) itemClass = "bg-rose-950/40 border-rose-500/50 text-rose-200";
              } else if (isSelected) {
                itemClass = "bg-blue-500/20 border-blue-400 text-white";
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
            Pregunta 2: De 4 botellas de hemocultivo tomadas a un paciente sin catéter venoso central ni prótesis, solo 1 botella anaerobia positiviza a los 5 días con <em>Cutibacterium acnes</em>. ¿Cuál es el razonamiento microbiológico correcto?
          </label>
          <div className="space-y-2">
            {[
              { id: 0, text: "Representa con alta probabilidad una contaminación puntual por microbiota cutánea comensal durante la toma de muestra; debe contrastarse con el cuadro clínico y no asumirse como bacteriemia verdadera sin criterios objetivos." },
              { id: 1, text: "Confirma con certeza una endocarditis infecciosa fulminante que exige cirugía valvular urgente." },
              { id: 2, text: "Obliga a descartar los otros tres frascos porque el sistema automatizado falló en ellos." }
            ].map((opt) => {
              const isSelected = q2Answer === opt.id;
              const isCorrect = opt.id === 0;
              let itemClass = "bg-slate-900/60 border-white/5 hover:border-slate-600 text-slate-300";
              if (hasEvaluated) {
                if (isCorrect) itemClass = "bg-emerald-950/40 border-emerald-500/50 text-emerald-200";
                else if (isSelected) itemClass = "bg-rose-950/40 border-rose-500/50 text-rose-200";
              } else if (isSelected) {
                itemClass = "bg-blue-500/20 border-blue-400 text-white";
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
                  ? "bg-blue-400 hover:bg-blue-300 text-slate-950 shadow-md shadow-blue-950/40"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed"
              }`}
            >
              <span>Verificar Razonamiento Metodológico</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-900 border border-blue-500/30 space-y-2 animate-fade-in text-xs">
            <div className="flex items-center gap-2 text-blue-300 font-bold">
              <CheckCircle2 className="w-4 h-4 text-blue-400" />
              <span>Retroalimentación Formativa de Laboratorio:</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              El hemocultivo es un proceso escalonado de información creciente. La alarma del equipo sólo indica multiplicación microbiana. La tinción de Gram directa es el primer resultado morfológico urgente que orienta la terapia empírica. El aislamiento en placas sólidas permite identificar con exactitud el género y especie y determinar la Concentración Inhibitoria Mínima (CIM) de antibióticos. Cuando se aíslan bacterias de la flora cutánea en un único frasco de varios tomados, se debe sospechar contaminación accidental en la venopunción antes de instaurar tratamientos prolongados.
            </p>
          </div>
        )}
      </GlassCard>

    </div>
  );
};
