"use client";

import React, { useState } from "react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  Network, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  ExternalLink, 
  Info, 
  ArrowRight,
  ShieldAlert,
  Layers,
  HeartPulse,
  Activity
} from "lucide-react";

interface AgentAssociation {
  agentId: string;
  name: string;
  group: "bacteria" | "hongo";
  morphology: string;
  catalogId?: string; // id en MICROBIOLOGY_DATA
  processes: ("bacteriemia" | "endocarditis" | "cateter")[];
  virulenceNotes: string;
  clinicalContext: string;
}

const AGENTS_LIST: AgentAssociation[] = [
  {
    agentId: "saureus",
    name: "Staphylococcus aureus",
    group: "bacteria",
    morphology: "Cocos grampositivos en racimos, catalasa +, coagulasa +",
    catalogId: "B03",
    processes: ["bacteriemia", "endocarditis", "cateter"],
    virulenceNotes: "Alta patogenicidad; adhesinas a fibronectina/colágeno, coagulasa, toxinas líticas y formación de biopelículas.",
    clinicalContext: "Causa endocarditis aguda grave en válvulas nativas o protésicas con destrucción tisular rápida, bacteriemia con embolias sépticas y sepsis por infección de catéter venoso central."
  },
  {
    agentId: "sepidermidis",
    name: "Staphylococcus epidermidis y coagulasa (-)",
    group: "bacteria",
    morphology: "Cocos grampositivos en racimos, catalasa +, coagulasa -",
    catalogId: "B04",
    processes: ["cateter", "endocarditis"],
    virulenceNotes: "Producción sobresaliente de matriz extracelular (slime/biofilm) que se adhiere fuertemente a polímeros y metales.",
    clinicalContext: "Agente principal de bacteriemias asociadas a catéteres intravasculares y endocarditis en prótesis valvulares tempranas o tardías."
  },
  {
    agentId: "viridans",
    name: "Streptococcus grupo viridans",
    group: "bacteria",
    morphology: "Cocos grampositivos en cadenas cortas, catalasa -, alfa-hemolíticos",
    catalogId: "B06",
    processes: ["bacteriemia", "endocarditis"],
    virulenceNotes: "Producción de dextranos a partir de sacarosa que favorecen la adherencia a agregados de fibrina y plaquetas en endotelio lesionado.",
    clinicalContext: "Habitante de la microbiota oral. Produce bacteriemias transitorias tras procedimientos dentales o masticación y coloniza vegetaciones preexistentes causando endocarditis subaguda."
  },
  {
    agentId: "enterococcus",
    name: "Enterococcus faecalis / E. faecium",
    group: "bacteria",
    morphology: "Cocos grampositivos en pares o cadenas cortas, catalasa -, tolerantes a bilis y NaCl",
    catalogId: "B08",
    processes: ["bacteriemia", "endocarditis", "cateter"],
    virulenceNotes: "Resistencia intrínseca a múltiples antibióticos y capacidad de persistir en biofilms hospitalarios.",
    clinicalContext: "Bacteriemias originadas frecuentemente en infecciones del tracto urinario o vía biliar/abdominal, provocando endocarditis subaguda en ancianos o pacientes instrumentados."
  },
  {
    agentId: "candida",
    name: "Candida albicans / Candida spp.",
    group: "hongo",
    morphology: "Levaduras ovoides con blastoconidias y capacidad de formar pseudohifas",
    catalogId: "H01",
    processes: ["cateter", "bacteriemia", "endocarditis"],
    virulenceNotes: "Formación de biofilms sobre silicona/plásticos, adhesinas de pared (familias ALS) y secreción de aspartil proteasas.",
    clinicalContext: "Candidemia asociada a nutrición parenteral, catéteres de larga duración, terapia antibiótica de amplio espectro o neutropenia; puede sembrar vegetaciones voluminosas."
  }
];

export const VasAgentsMatrix: React.FC = () => {
  const [selectedProcess, setSelectedProcess] = useState<"all" | "bacteriemia" | "endocarditis" | "cateter">("all");
  const [selectedAgentId, setSelectedAgentId] = useState<string>("saureus");

  // Interactive Student Decision
  const [qAnswer, setQAnswer] = useState<number | null>(null);
  const [hasEvaluated, setHasEvaluated] = useState(false);

  const activeAgent = AGENTS_LIST.find(a => a.agentId === selectedAgentId) || AGENTS_LIST[0];

  const filteredAgents = AGENTS_LIST.filter(a => {
    if (selectedProcess === "all") return true;
    return a.processes.includes(selectedProcess);
  });

  const handleReset = () => {
    setQAnswer(null);
    setHasEvaluated(false);
    setSelectedProcess("all");
    setSelectedAgentId("saureus");
  };

  return (
    <div className="space-y-6">
      
      {/* Encabezado Pedagógico */}
      <GlassCard className="p-6 border-amber-500/30 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-cyan-950/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4 mb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-xs font-bold border border-cyan-500/30">
                VAS-06 · Actividad interactiva
              </span>
              <span className="text-xs text-slate-400 font-mono">CAT-21 · Pág. 14</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Network className="w-5 h-5 text-cyan-400" />
              Agentes en Sangre, Endocardio y Catéteres
            </h2>
          </div>

          <span className="text-xs text-slate-400 font-mono bg-slate-950 px-3 py-1.5 rounded-xl border border-white/5">
            Matriz de Intersección Biológica
          </span>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed">
          <strong className="text-white">Objetivo conceptual:</strong> Reconocer que un mismo microorganismo puede vincularse a distintos procesos intravasculares (bacteriemia, endocarditis, biofilms en catéteres) sin que su sola presencia equivalga automáticamente a una entidad fija sin correlación clínica.
        </p>
      </GlassCard>

      {/* Filtros de Procesos Clínicos */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-cyan-400" />
          Filtrar agentes según proceso clínico implicado:
        </span>
        <div className="flex flex-wrap gap-2">
          {[
            { id: "all", label: "Todos los procesos" },
            { id: "bacteriemia", label: "Bacteriemia / Diseminación" },
            { id: "endocarditis", label: "Endocarditis Infecciosa" },
            { id: "cateter", label: "Dispositivos / Catéteres (Biofilm)" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedProcess(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                selectedProcess === tab.id
                  ? "bg-cyan-500/20 border-cyan-400 text-white shadow-md shadow-cyan-950/40"
                  : "bg-slate-900/60 hover:bg-slate-800 text-slate-400 border-white/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Matriz y Detalle de Agente */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Lista de Agentes Disponibles */}
        <div className="lg:col-span-5 space-y-2">
          <span className="text-xs font-semibold text-slate-300 block">
            Microorganismos citados ({filteredAgents.length}):
          </span>

          <div className="space-y-2">
            {filteredAgents.map((ag) => {
              const isSelected = selectedAgentId === ag.agentId;
              return (
                <button
                  key={ag.agentId}
                  onClick={() => setSelectedAgentId(ag.agentId)}
                  className={`w-full p-3.5 rounded-2xl border text-left transition-all flex flex-col gap-1.5 ${
                    isSelected
                      ? "bg-slate-800/95 border-cyan-400 shadow-lg shadow-cyan-950/30 ring-1 ring-cyan-400/30"
                      : "bg-slate-900/50 hover:bg-slate-900 border-white/5 text-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white italic">{ag.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                      {ag.group}
                    </span>
                  </div>

                  {/* Indicadores de procesos */}
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {ag.processes.map((pr) => (
                      <span
                        key={pr}
                        className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                          pr === "endocarditis"
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                            : pr === "cateter"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                        }`}
                      >
                        {pr}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Panel de Detalle del Agente Seleccionado */}
        <div className="lg:col-span-7">
          <GlassCard className="p-5 border-white/10 space-y-4 h-full flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                    Ficha de Integración
                  </span>
                  <h3 className="text-base font-bold text-white italic">
                    {activeAgent.name}
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {activeAgent.morphology}
                  </span>
                </div>

                {activeAgent.catalogId && (
                  <Link
                    href={`/agentes-infecciosos/catalogo/${activeAgent.catalogId}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs border border-cyan-500/30 transition-colors w-fit shrink-0"
                  >
                    <span>Ficha Microbiología</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
                  <span className="font-semibold text-slate-200 block">Factores de Virulencia y Adherencia:</span>
                  <p className="text-slate-300 leading-relaxed">{activeAgent.virulenceNotes}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
                  <span className="font-semibold text-slate-200 block">Comportamiento en Procesos Intravasculares:</span>
                  <p className="text-slate-300 leading-relaxed">{activeAgent.clinicalContext}</p>
                </div>
              </div>
            </div>

            {/* Alerta de Límite Epistemológico */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-white/5 text-[11px] text-slate-400 flex items-start gap-2.5 mt-3">
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <p>
                <strong>Principio metodológico:</strong> La lista de agentes de la cátedra ilustra asociaciones microbiológicas clásicas, no un orden de frecuencia epidemiológica absoluta. El aislamiento de una bacteria en sangre debe interpretarse en conjunto con el cuadro clínico, persistencia de hemocultivos y estudios de imagen.
              </p>
            </div>
          </GlassCard>
        </div>

      </div>

      {/* Ejercicio de Juicio Crítico */}
      <GlassCard className="p-6 border-white/10 space-y-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              Juicio Conceptual: Coincidencia de Agentes y Diagnóstico Clínico
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Reflexiona sobre el significado del aislamiento de un germen en diferentes procesos intravasculares.
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
            ¿Por qué el hallazgo de un agente como <em>Staphylococcus epidermidis</em> o <em>Staphylococcus aureus</em> en un hemocultivo requiere evaluar el origen y no define por sí solo una endocarditis?
          </label>
          <div className="space-y-2">
            {[
              { id: 0, text: "Porque un microorganismo virulento solo puede colonizar una superficie vascular a la vez en toda la vida del paciente." },
              { id: 1, text: "Porque los mismos agentes pueden ingresar transitoriamente por catéteres, heridas o procedimientos, y para confirmar endocarditis se exige demostrar compromiso valvular objetivo (ecocardiograma, criterios de Duke) además de hemocultivos persistentes." },
              { id: 2, text: "Porque las bacterias en sangre nunca pueden provocar daño endotelial si no se aíslan más de 10 especies simultáneamente." }
            ].map((opt) => {
              const isSelected = qAnswer === opt.id;
              const isCorrect = opt.id === 1;
              let itemClass = "bg-slate-900/60 border-white/5 hover:border-slate-600 text-slate-300";
              if (hasEvaluated) {
                if (isCorrect) itemClass = "bg-emerald-950/40 border-emerald-500/50 text-emerald-200";
                else if (isSelected) itemClass = "bg-rose-950/40 border-rose-500/50 text-rose-200";
              } else if (isSelected) {
                itemClass = "bg-cyan-500/20 border-cyan-400 text-white";
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
                  ? "bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-md shadow-cyan-950/40"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed"
              }`}
            >
              <span>Verificar Razonamiento</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-900 border border-cyan-500/30 space-y-2 animate-fade-in text-xs">
            <div className="flex items-center gap-2 text-cyan-300 font-bold">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>Retroalimentación Formativa:</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              La asociación biológica es un mapa de posibilidades fisiopatológicas. Un hemocultivo positivo demuestra bacteriemia, pero el origen primario puede ser un catéter venoso infectado (frecuente en <em>S. epidermidis</em>), un forúnculo cutáneo (frecuente en <em>S. aureus</em>), o una siembra endotelial profunda (endocarditis). Distinguir entre contaminación, infección asociada a dispositivo y endocarditis exige criterios diagnósticos combinados (Duke), estudio ecocardiográfico y evaluación de la persistencia de los cultivos.
            </p>
          </div>
        )}
      </GlassCard>

    </div>
  );
};
