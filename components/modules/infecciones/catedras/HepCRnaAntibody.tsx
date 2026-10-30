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
  ExternalLink,
  ChevronRight,
  Dna,
  ShieldCheck,
  Activity
} from "lucide-react";

type VhcScenario = "negativo" | "curado_pasado" | "activo_cronico";

interface ScenarioInfo {
  id: VhcScenario;
  title: string;
  antiHCV: "reactivo" | "no_reactivo";
  hcvRna: "detectable" | "no_detectable";
  diagnosis: string;
  statusColor: string;
  clinicalAction: string;
  explanation: string;
}

const SCENARIOS: Record<VhcScenario, ScenarioInfo> = {
  negativo: {
    id: "negativo",
    title: "Escenario 1: Anti-VHC No Reactivo",
    antiHCV: "no_reactivo",
    hcvRna: "no_detectable",
    diagnosis: "Sin evidencia serológica de infección por VHC",
    statusColor: "bg-slate-800 text-slate-300 border-white/10",
    clinicalAction: "No se requieren estudios adicionales a menos que se sospeche una exposición percutánea aguda reciente (<6 meses) o un paciente en hemodiálisis/inmunosuprimido severo.",
    explanation: "El sistema inmune no presenta anticuerpos frente a las proteínas estructurales ni no estructurales del VHC."
  },
  curado_pasado: {
    id: "curado_pasado",
    title: "Escenario 2: Anti-VHC (+) y ARN-VHC (-)",
    antiHCV: "reactivo",
    hcvRna: "no_detectable",
    diagnosis: "Infección pasada resuelta espontáneamente o curada por antivirales",
    statusColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    clinicalAction: "No requiere tratamiento antiviral. No tiene hepatitis C activa. El paciente debe ser informado de que los anticuerpos seguirán positivos de por vida y NO protegen frente a reinfecciones futuras si se reexpone.",
    explanation: "Aproximadamente 15% a 25% de los pacientes aclaran la infección aguda de forma espontánea; además, >95% de los tratados con AAD logran curación virológica sostenida (RVS). En ambos casos, el Anti-VHC persiste como memoria inmunológica (cicatriz serológica) sin virus viable."
  },
  activo_cronico: {
    id: "activo_cronico",
    title: "Escenario 3: Anti-VHC (+) y ARN-VHC (+)",
    antiHCV: "reactivo",
    hcvRna: "detectable",
    diagnosis: "Infección actual activa por virus de la hepatitis C",
    statusColor: "bg-rose-500/20 text-rose-300 border-rose-500/40",
    clinicalAction: "Evaluación clínica inmediata del estadio de fibrosis hepática (elastografía / FibroScan o índices APRI/FIB-4) y prescripción de tratamiento antiviral de acción directa (AAD) pan-genotípico por 8 a 12 semanas.",
    explanation: "La presencia de ARN circulante demuestra replicación viral activa en el parénquima hepático. En ausencia de tratamiento, existe riesgo de progresión insidiosa a fibrosis avanzada o cirrosis."
  }
};

export const HepCRnaAntibody: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState<VhcScenario>("curado_pasado");
  const [studentChoice, setStudentChoice] = useState<string | null>(null);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);

  const scenario = SCENARIOS[selectedScenario];

  const handleReset = () => {
    setSelectedScenario("curado_pasado");
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
              HEP-08 · Actividad interactiva
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              CAT-20 · Pág. 15
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Hepatitis C: Algoritmo Diagnóstico (Anti-VHC y ARN-VHC)
          </h3>
          <p className="text-xs text-slate-300">
            <strong>Objetivo:</strong> Distinguir contacto previo de infección actual activa siguiendo las guías CDC y OMS, separando la cronicidad del daño fibrótico y corrigiendo la idea de cirrosis inevitable.
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

      {/* Selector de Escenarios del Algoritmo CDC */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
          Algoritmo oficial en 2 pasos (Serología + Biología Molecular):
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {(["negativo", "curado_pasado", "activo_cronico"] as const).map((scKey) => {
            const isSelected = selectedScenario === scKey;
            const sc = SCENARIOS[scKey];
            return (
              <button
                key={scKey}
                onClick={() => setSelectedScenario(scKey)}
                aria-pressed={isSelected}
                className={`p-3.5 rounded-2xl text-left border transition-all min-h-[64px] flex flex-col justify-between ${
                  isSelected
                    ? "bg-amber-500/20 border-amber-400 shadow-lg shadow-amber-950/40 ring-1 ring-amber-400/30"
                    : "bg-slate-900/60 hover:bg-slate-900 text-slate-300 border-white/5"
                }`}
              >
                <span className={`text-xs font-bold leading-tight ${isSelected ? "text-amber-300" : "text-white"}`}>
                  {sc.title}
                </span>
                <span className="text-[10px] text-slate-400 font-mono mt-1">
                  Anti-VHC: {sc.antiHCV === "reactivo" ? "(+)" : "(-)"} · ARN-VHC: {sc.hcvRna === "detectable" ? "(+)" : "(-)"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Visualización del Resultado de Laboratorio */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2">
          <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span>Resultado: {scenario.diagnosis}</span>
          </h4>
          <span className={`text-[11px] px-2.5 py-0.5 rounded-full border font-semibold w-fit ${scenario.statusColor}`}>
            {scenario.hcvRna === "detectable" ? "Infección Activa" : "Sin Replicación"}
          </span>
        </div>

        {/* Las dos pruebas del algoritmo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Prueba 1: Anti-VHC */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">Paso 1: Anti-VHC (Inmunoensayo)</span>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                scenario.antiHCV === "reactivo" 
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" 
                  : "bg-slate-800 text-slate-400"
              }`}>
                {scenario.antiHCV === "reactivo" ? "REACTIVO (+)" : "NO REACTIVO (-)"}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Detecta anticuerpos contra proteínas del VHC producidos por el huésped. Indica que el sistema inmune ha estado en contacto con el virus en algún momento de la vida, pero <strong>no discrimina entre infección curada e infección actual</strong>.
            </p>
          </div>

          {/* Prueba 2: ARN-VHC */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">Paso 2: ARN-VHC (RT-PCR Cuantitativa)</span>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                scenario.hcvRna === "detectable" 
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/40" 
                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
              }`}>
                {scenario.hcvRna === "detectable" ? "DETECTABLE (+)" : "NO DETECTABLE (-)"}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Detecta y cuantifica directamente las copias de ARN viral en plasma. Es el <strong>único examen confirmatorio de infección activa</strong> y requisito indispensable previo a iniciar tratamiento con antivirales directos.
            </p>
          </div>
        </div>

        {/* Conducta clínica y significado */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-white/5 space-y-1 text-xs">
          <strong className="text-white block">Conducta Clínica Guiada:</strong>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            {scenario.clinicalAction}
          </p>
          <div className="pt-2 border-t border-white/5 text-[10px] text-slate-400">
            <strong className="text-slate-300">Base biológica: </strong>
            {scenario.explanation}
          </div>
        </div>
      </div>

      {/* Pregunta de Razonamiento del Estudiante */}
      <div className="p-4 sm:p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-3">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <h4 className="text-xs sm:text-sm font-bold text-white">
            Desafío de Laboratorio y Decisión Clínica:
          </h4>
        </div>

        <p className="text-xs text-slate-200 leading-relaxed">
          Un donante voluntario de sangre resulta con <code className="px-1.5 py-0.5 rounded bg-slate-900 border border-white/10 text-amber-300 mx-1">Anti-VHC Reactivo (+)</code> en el tamizaje inicial. 
          <strong>¿Por qué este resultado serológico reactivo NO autoriza a iniciar de inmediato tratamiento antiviral ni a afirmar que el donante tiene hepatitis C activa?</strong>
        </p>

        {/* Opciones */}
        <div className="space-y-2 pt-1">
          {[
            {
              id: "opt-1",
              text: "Porque los anticuerpos solo prueban contacto biológico previo. Hasta un 25% de las personas aclaran el virus espontáneamente y permanecen con anticuerpos de por vida sin tener infección activa ni virus detectable."
            },
            {
              id: "opt-2",
              text: "Porque el Anti-VHC positivo siempre es un falso positivo técnico producido por el consumo de carbohidratos."
            },
            {
              id: "opt-3",
              text: "Porque el virus de la hepatitis C solo puede ser detectado mediante urocultivo seriado."
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
                <span>¡Criterio Riguroso! Algoritmo CDC / OMS Cumplido</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-rose-400 font-bold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Revisa el papel de los anticuerpos en VHC:</span>
              </div>
            )}

            <p className="text-slate-300 leading-relaxed text-[11px]">
              <strong>Fundamento Oficial CDC / OMS:</strong> El test de anticuerpos Anti-VHC tiene excelente sensibilidad como tamizaje, pero <strong>no mide virus activo</strong>. Si una persona tuvo hepatitis C hace 15 años y se curó espontáneamente, o si se trató con antivirales directos y logró erradicación total, su Anti-VHC seguirá marcando positivo para siempre. Por este motivo, las guías internacionales prohíben iniciar tratamiento o dar diagnóstico de hepatitis C activa sin la prueba confirmatoria obligatoria de <strong>ARN-VHC por RT-PCR</strong>.
            </p>

            <div className="p-3 rounded-lg bg-slate-900 border border-white/10 text-slate-300 text-[11px] flex items-center justify-between gap-2">
              <span className="text-slate-400">Pauta oficial CDC:</span>
              <a
                href="https://www.cdc.gov/hepatitis-c/hcp/diagnosis-testing/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-400 hover:text-sky-300 font-semibold inline-flex items-center gap-1"
              >
                <span>CDC: Recommended Testing Sequence for Hepatitis C</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}

      </div>

    </GlassCard>
  );
};
