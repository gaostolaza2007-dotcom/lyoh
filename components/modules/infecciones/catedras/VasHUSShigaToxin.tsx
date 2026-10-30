"use client";

import React, { useState } from "react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  Activity, 
  ExternalLink, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Info, 
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  GitBranch,
  Layers,
  Heart
} from "lucide-react";

interface CascadeStep {
  id: "intestino" | "translocacion" | "microangiopatia" | "triada";
  stepNumber: string;
  organ: string;
  title: string;
  badge: string;
  badgeColor: string;
  biology: string;
  clinicalSigns: string[];
  keyDistinction: string;
}

const CASCADE_STEPS: CascadeStep[] = [
  {
    id: "intestino",
    stepNumber: "Paso 1",
    organ: "Tracto Gastrointestinal (Colon)",
    title: "Infección y Colitis por STEC",
    badge: "Foco Mucoso Primario",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    biology: "Ingesta de alimentos o agua contaminada con Escherichia coli productora de toxina Shiga (STEC, serotipos O157:H7 y no-O157 como O26, O111, O104). Las bacterias colonizan el epitelio intestinal mediante intimina y pedestal actínico, liberando toxinas Shiga (Stx1 y/o Stx2). En un 85-90% de los pacientes, la infección se autolimita como diarrea acuosa o sanguinolenta (colitis enterohemorrágica) sin progresar a daño sistémico.",
    clinicalSigns: [
      "Dolor abdominal cólico intenso",
      "Diarrea acuosa inicial que frecuentemente progresa a francamente sanguinolenta (disentería)",
      "Generalmente afebril o con fiebre baja/moderada (a diferencia de otras shigelosis invasivas)"
    ],
    keyDistinction: "No toda diarrea por E. coli ni toda cepa de E. coli produce toxina Shiga; solo aquellas con genes stx lisogénicos tienen potencial patógeno de generar SHU."
  },
  {
    id: "translocacion",
    stepNumber: "Paso 2",
    organ: "Torrente Sanguíneo",
    title: "Translocación y Tránsito de Toxina Shiga",
    badge: "Diseminación por Sangre",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    biology: "En un 5-15% de los pacientes (frecuentemente niños preescolares), las moléculas de Stx atraviesan la barrera mucosa dañada y acceden a la microcirculación mesentérica. La toxina NO necesita bacteriemia masiva: viaja unida a receptores globotriaosilceramida (Gb3) o adsorbida a neutrófilos circulantes hacia los lechos vasculares distantes.",
    clinicalSigns: [
      "Periodo de latencia habitual entre 5 y 10 días tras el inicio de la diarrea",
      "La diarrea puede haber disminuido o cesado en el momento en que se manifiestan los signos sistémicos",
      "Hemocultivos habitualmente negativos para E. coli (enfermedad mediada por toxina circulante)"
    ],
    keyDistinction: "El daño sistémico está mediado por la toxina libre o transportada, no por una multiplicación invasiva de la bacteria en la sangre."
  },
  {
    id: "microangiopatia",
    stepNumber: "Paso 3",
    organ: "Endotelio Capilar Renal y Sistémico",
    title: "Microangiopatía Trombótica Renal",
    badge: "Lesión Celular / Receptor Gb3",
    badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    biology: "El endotelio de los glomérulos renales expresa una densidad excepcionalmente alta del receptor glucolípido Gb3. La toxina Shiga se internaliza por endocitosis retrógrada hacia el ribosoma; su subunidad catalítica A inactiva el ARNr 28S, bloqueando la síntesis proteica y causando apoptosis endotelial. Esto provoca hinchazón celular, desprendimiento de la membrana basal y exposición de colágeno subendotelial.",
    clinicalSigns: [
      "Activación de cascada de coagulación y agregación plaquetaria local",
      "Formación de microtrombos de fibrina y plaquetas en la luz de los capilares glomerulares",
      "Oclusión parcial o total de la microcirculación renal"
    ],
    keyDistinction: "La distribución tisular del receptor Gb3 determina por qué el riñón y el sistema nervioso central son los órganos diana predominantes."
  },
  {
    id: "triada",
    stepNumber: "Paso 4",
    organ: "Cuadro Sistémico",
    title: "Tríada Clásica del SHU",
    badge: "Manifestación Clínica del Síndrome",
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    biology: "Consecuencia directa de los microtrombos en la microcirculación: 1) Los eritrocitos se fragmentan mecánicamente al chocar contra las mallas de fibrina produciendo esquistocitos (anemia hemolítica microangiopática con Coombs negativo). 2) Las plaquetas se consumen masivamente en los microtrombos capilares (trombocitopenia de consumo). 3) La isquemia glomerular induce insuficiencia renal aguda.",
    clinicalSigns: [
      "1. Anemia hemolítica microangiopática: palidez marcada, ictericia flavínica, LDH elevada, esquistocitos en frotis",
      "2. Trombocitopenia: petequias, equimosis o hematomas (generalmente sin sangrado espontáneo masivo)",
      "3. Injuria renal aguda: oliguria o anuria, hematuria, uremia y elevación de creatinina sérica"
    ],
    keyDistinction: "El SHU típico es secundario a Stx (diarrea previa +); debe distinguirse de los SHU atípicos no mediados por toxina Shiga (anomalías de la vía alterna del complemento)."
  }
];

export const VasHUSShigaToxin: React.FC = () => {
  const [activeStepId, setActiveStepId] = useState<"intestino" | "translocacion" | "microangiopatia" | "triada">("microangiopatia");

  // Student Critical Thinking State
  const [qAnswer, setQAnswer] = useState<number | null>(null);
  const [hasEvaluated, setHasEvaluated] = useState(false);

  const activeStep = CASCADE_STEPS.find(s => s.id === activeStepId)!;

  const handleReset = () => {
    setQAnswer(null);
    setHasEvaluated(false);
    setActiveStepId("intestino");
  };

  return (
    <div className="space-y-6">
      
      {/* Encabezado Pedagógico */}
      <GlassCard className="p-6 border-amber-500/30 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-rose-950/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4 mb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono text-xs font-bold border border-rose-500/30">
                VAS-10 · Actividad interactiva
              </span>
              <span className="text-xs text-slate-400 font-mono">CAT-21 · Pág. 21</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              Síndrome Hemolítico Urémico (SHU) y Toxina Shiga (STEC)
            </h2>
          </div>

          <Link
            href="/agentes-infecciosos/catalogo/B10"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs border border-rose-500/30 transition-colors w-fit"
          >
            <span>Ficha Escherichia coli</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed">
          <strong className="text-white">Objetivo conceptual:</strong> Relacionar la infección intestinal primaria por cepas de <em>E. coli</em> productoras de toxina Shiga (STEC) con su complicación microvascular sistémica (SHU: anemia hemolítica microangiopática, trombocitopenia e insuficiencia renal aguda), reconociendo que no toda infección entérica culmina en daño sistémico.
        </p>
      </GlassCard>

      {/* Cascada Intestino - Sangre - Riñón */}
      <div className="space-y-4">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1.5 mb-1">
            <GitBranch className="w-3.5 h-3.5 text-rose-400" />
            Cascada Fisiopatológica: Del Intestino a la Microcirculación Renal
          </span>
          <p className="text-xs text-slate-400">
            Selecciona cada etapa para explorar la transición entre la infección colónica local y la tríada del SHU.
          </p>
        </div>

        {/* Pasos en Botones */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {CASCADE_STEPS.map((s) => {
            const isSelected = activeStepId === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setActiveStepId(s.id)}
                className={`p-3 rounded-2xl text-left border transition-all flex flex-col justify-between gap-2 min-h-[82px] ${
                  isSelected
                    ? "bg-slate-800/95 border-rose-400 ring-2 ring-rose-400/20 shadow-lg"
                    : "bg-slate-900/50 hover:bg-slate-900 border-white/5 text-slate-300"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-[10px] font-mono text-slate-400 font-bold">{s.stepNumber}</span>
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full border ${s.badgeColor}`}>
                    {s.organ}
                  </span>
                </div>
                <span className="text-xs font-bold text-white leading-snug">
                  {s.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* Panel Detallado del Paso Activo */}
        <GlassCard className="p-5 border-white/10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400 font-bold">
                {activeStep.stepNumber} · {activeStep.organ}
              </span>
              <h3 className="text-base font-bold text-white">
                {activeStep.title}
              </h3>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold border w-fit ${activeStep.badgeColor}`}>
              {activeStep.badge}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <span className="font-semibold text-slate-200 block">Mecanismo Fisiopatológico:</span>
            <p className="text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-white/5">
              {activeStep.biology}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-900/70 border border-white/5 space-y-2">
              <span className="font-semibold text-rose-300 block">Manifestaciones o Rasgos Clínicos:</span>
              <ul className="space-y-1.5 text-slate-300">
                {activeStep.clinicalSigns.map((sign, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold">•</span>
                    <span>{sign}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200/90 space-y-2">
              <span className="font-bold text-amber-300 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-amber-400" />
                Principio Diferencial Clave:
              </span>
              <p className="leading-relaxed">{activeStep.keyDistinction}</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Ejercicio de Juicio Crítico */}
      <GlassCard className="p-6 border-white/10 space-y-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-rose-400" />
              Juicio Conceptual: Patogénesis de la Toxina Shiga y Alcance Clínico
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Evalúa la relación causal entre el germen entérico y la tríada hematológica/renal.
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
            ¿Por qué en un niño con SHU típico posterior a diarrea sanguinolenta por STEC se observan esquistocitos en sangre periférica junto con creatinina sérica elevada?
          </label>
          <div className="space-y-2">
            {[
              { id: 0, text: "Porque la bacteria prolifera masivamente destruyendo por fagocitosis directa cada glóbulo rojo en el hígado." },
              { id: 1, text: "Porque la toxina Shiga lesiona el endotelio glomerular (rico en receptor Gb3), generando microtrombos capilares de fibrina y plaquetas que fragmentan mecánicamente a los eritrocitos al circular (esquistocitos) y provocan isquemia renal aguda con oligoanuria." },
              { id: 2, text: "Porque todo paciente que sufre diarrea aguda presenta anemia hemolítica microangiopática de manera fisiológica obligatoria." }
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
              <span>Verificar Razonamiento Fisiopatológico</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-900 border border-rose-500/30 space-y-2 animate-fade-in text-xs">
            <div className="flex items-center gap-2 text-rose-300 font-bold">
              <CheckCircle2 className="w-4 h-4 text-rose-400" />
              <span>Retroalimentación Formativa:</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              La tríada clásica del SHU (anemia hemolítica microangiopática con esquistocitos, trombocitopenia de consumo e insuficiencia renal aguda) es la consecuencia directa de una <strong>microangiopatía trombótica</strong> gatillada por toxina Shiga. Al unirse al receptor Gb3 endotelial en los capilares glomerulares y bloquear la síntesis de proteínas, Stx provoca muerte endotelial y depósito de microtrombos de fibrina. Los glóbulos rojos son literalmente «rebanados» mecánicamente al atravesar estos capilares estenosados por trombos, dando origen a los esquistocitos, mientras las plaquetas caen al quedar atrapadas en la malla trombótica.
            </p>
          </div>
        )}
      </GlassCard>

    </div>
  );
};
