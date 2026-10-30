"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  RotateCcw, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Info,
  Activity,
  HeartPulse,
  Layers,
  ShieldAlert,
  GitCompare
} from "lucide-react";

type AgentTypeKey = "bacteriemia" | "fungemia" | "viremia" | "parasitemia";
type HostResponseKey = "transitoria" | "alerta_sistemica" | "sepsis_disfuncion";

interface AgentMetadata {
  id: AgentTypeKey;
  term: string;
  category: string;
  morphologyLabel: string;
  morphologyDescription: string;
  representativeSpecies: string[];
  diagnosticMethod: string;
}

const AGENTS_METADATA: Record<AgentTypeKey, AgentMetadata> = {
  bacteriemia: {
    id: "bacteriemia",
    term: "Bacteriemia",
    category: "Bacterias",
    morphologyLabel: "Cocos en racimos / Cadenas y Bacilos Gram negativos",
    morphologyDescription: "Células procariotas de 0.5 a 3.0 µm circulando libres en plasma o fagocitadas por neutrófilos.",
    representativeSpecies: ["Staphylococcus aureus", "Streptococcus pneumoniae", "Escherichia coli", "Klebsiella pneumoniae"],
    diagnosticMethod: "Frascos de hemocultivos pareados (aerobio y anaerobio) con lectura automatizada."
  },
  fungemia: {
    id: "fungemia",
    term: "Fungemia (Candidemia)",
    category: "Hongos",
    morphologyLabel: "Levaduras ovoides brotantes y Pseudohifas",
    morphologyDescription: "Células eucariotas de 3 a 7 µm con gemación visible y formación de pseudofilamentos.",
    representativeSpecies: ["Candida albicans", "Candida parapsilosis (catéteres)", "Cryptococcus neoformans"],
    diagnosticMethod: "Frascos de hemocultivo para hongos (lisis-centrifugación o botellas estándar prolongadas)."
  },
  viremia: {
    id: "viremia",
    term: "Viremia",
    category: "Virus",
    morphologyLabel: "Partículas virales ultraestructurales libres o asociadas a leucocitos",
    morphologyDescription: "Viriones de 20 a 200 nm, no observables al microscopio óptico estándar (visibles solo por microscopía electrónica).",
    representativeSpecies: ["Virus de la Hepatitis B (VHB)", "Virus Dengue", "VIH", "Citomegalovirus (CMV)"],
    diagnosticMethod: "Detección molecular cuantitativa de genoma (PCR / RT-PCR) o antígenos circulantes (ej. HBsAg, Ag NS1)."
  },
  parasitemia: {
    id: "parasitemia",
    term: "Parasitemia",
    category: "Parásitos",
    morphologyLabel: "Trofozoítos anulares intraeritrocitarios y Tripomastigotes flagelados",
    morphologyDescription: "Formas parasitarias complejas que parasitan hematíes (Plasmodium) o nadan activamente en plasma con membrana ondulante (Trypanosoma).",
    representativeSpecies: ["Plasmodium falciparum (Malaria)", "Trypanosoma cruzi (Chagas agudo)", "Babesia microti"],
    diagnosticMethod: "Gota gruesa y frotis sanguíneo teñido con Giemsa, o PCR en sangre periférica."
  }
};

interface HostResponseMetadata {
  id: HostResponseKey;
  title: string;
  badge: string;
  severityColor: "emerald" | "amber" | "rose";
  clinicalState: string;
  vitalSigns: string;
  pathophysiologicalConcept: string;
  sofaScore: string;
}

const HOST_RESPONSES: Record<HostResponseKey, HostResponseMetadata> = {
  transitoria: {
    id: "transitoria",
    title: "Presencia Aislada / Transitoria",
    badge: "Sin Disfunción Orgánica",
    severityColor: "emerald",
    clinicalState: "Paso breve de microorganismos al torrente sanguíneo (ej. cepillado dental, masticación, defecación, procedimiento ambulatorio menor).",
    vitalSigns: "Estables y normales: Presión arterial normal, frecuencia cardíaca normal, afebril.",
    pathophysiologicalConcept: "El sistema retículo-endotelial (macrófagos del hígado de von Kupffer y macrófagos del bazo) depura y fagocita activamente a los invasores en cuestión de 15 a 30 minutos sin montar una respuesta inflamatoria sistémica perjudicial.",
    sofaScore: "SOFA = 0 puntos (sin daño orgánico)"
  },
  alerta_sistemica: {
    id: "alerta_sistemica",
    title: "Respuesta Inflamatoria Sistémica",
    badge: "Alerta / Infección con Signos Generales",
    severityColor: "amber",
    clinicalState: "El microorganismo prolifera desde un foco (ej. pielonefritis, neumonía) activando citoquinas proinflamatorias (IL-1, IL-6, TNF-alfa).",
    vitalSigns: "Alterados por respuesta adaptativa: Fiebre (>38°C) o hipotermia, taquicardia (>90 lpm), taquipnea, pero con presión arterial y perfusión mantenidas.",
    pathophysiologicalConcept: "Respuesta inmunitaria activa coordinada. El huésped destina recursos a combatir el patógeno en el tejido, pero los órganos vitales conservan su homeostasis funcional y microcirculación.",
    sofaScore: "SOFA basal (0 a 1 punto sin disfunción de novo)"
  },
  sepsis_disfuncion: {
    id: "sepsis_disfuncion",
    title: "Sepsis (Disfunción Orgánica Desregulada)",
    badge: "Consenso Sepsis-3 · Riesgo Vital Crítico",
    severityColor: "rose",
    clinicalState: "Disfunción orgánica potencialmente mortal causada por una respuesta desregulada del hospedero a la infección.",
    vitalSigns: "Compromiso hemodinámico y/o respiratorio: Hipotensión, hipoxemia (PaO2/FiO2 baja), oliguria aguda (<0.5 mL/kg/h), confusión/Glasgow alterado, trombocitopenia o coagulopatía.",
    pathophysiologicalConcept: "La lesión tisular no es provocada solo por el germen, sino por la inflamación desbordada, disfunción endotelial, fuga capilar y microtrombosis difusa provocada por la respuesta inmune alterada del paciente.",
    sofaScore: "Aumento de SOFA ≥ 2 puntos atribuible a la infección"
  }
};

export const VasBloodTermsSepsis: React.FC = () => {
  const [selectedAgent, setSelectedAgent] = useState<AgentTypeKey>("bacteriemia");
  const [selectedHostResponse, setSelectedHostResponse] = useState<HostResponseKey>("transitoria");
  const [showDeepening, setShowDeepening] = useState<boolean>(false);
  const [comparisonTarget, setComparisonTarget] = useState<HostResponseKey | null>(null);

  const agent = AGENTS_METADATA[selectedAgent];
  const host = HOST_RESPONSES[selectedHostResponse];
  const compareHost = comparisonTarget ? HOST_RESPONSES[comparisonTarget] : null;

  const handleReset = () => {
    setSelectedAgent("bacteriemia");
    setSelectedHostResponse("transitoria");
    setComparisonTarget(null);
    setShowDeepening(false);
  };

  return (
    <GlassCard className="p-4 sm:p-7 rounded-3xl border border-red-500/30 bg-slate-950/90 shadow-2xl space-y-6">
      
      {/* 1. Cabecera y Pregunta Didáctica */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 font-mono text-[11px] font-bold border border-red-500/30">
              VAS-01 · Muestra vascular y respuesta sistémica
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              CAT-21 · Págs. 3, 4, 6, 8
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Microorganismos en Torrente Sanguíneo frente a Respuesta del Huésped
          </h3>
          <p className="text-xs text-slate-300 max-w-2xl">
            <strong>Pregunta central:</strong> ¿Por qué tener microbios en sangre no equivale a sepsis, y por qué la sepsis depende de la disfunción orgánica del huésped y no únicamente de la especie aislada?
          </p>
        </div>

        <button
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-white/10 transition-colors self-start shrink-0 min-h-[44px]"
          aria-label="Restablecer actividad de sangre y sepsis"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restablecer</span>
        </button>
      </div>

      {/* Regla de Oro de Cátedra Anti-Concepciones Erróneas */}
      <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 flex items-start gap-3 text-xs text-slate-300">
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <strong className="text-white block">Concepto Crítico de Cátedra:</strong>
          <p className="text-[11px] leading-relaxed text-slate-300">
            <strong>Bacteriemia</strong> es un hallazgo microbiológico (aislamiento de bacterias viables en hemocultivo). <strong>Sepsis</strong> es un síndrome clínico de disfunción orgánica del huésped mediado por una respuesta inflamatoria desregulada. <em>Bacteriemia ≠ Sepsis</em>; cambiar el germen no causa sepsis de forma automática ni inevitable.
          </p>
        </div>
      </div>

      {/* 2 & 3. Dos Paneles Vinculados: Muestra Vascular + Estado del Huésped */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* PANEL IZQUIERDO: CAMPO MICROSCÓPICO VASCULAR (6 cols) */}
        <div className="lg:col-span-6 p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-white/10 space-y-3.5">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <span>Dimensión 1: Agente en el Torrente Sanguíneo</span>
            </span>
            <span className="text-[10px] font-mono text-red-300">
              {agent.category}
            </span>
          </div>

          {/* Selector de Agentes */}
          <div className="grid grid-cols-2 gap-2">
            {(["bacteriemia", "fungemia", "viremia", "parasitemia"] as const).map((aKey) => {
              const isSelected = selectedAgent === aKey;
              const a = AGENTS_METADATA[aKey];
              return (
                <button
                  key={aKey}
                  onClick={() => setSelectedAgent(aKey)}
                  aria-pressed={isSelected}
                  className={`p-2.5 rounded-xl text-left border transition-all min-h-[50px] flex flex-col justify-between ${
                    isSelected
                      ? "bg-red-500/20 border-red-400 text-white shadow-md shadow-red-950/40 ring-1 ring-red-400/40"
                      : "bg-slate-950/60 hover:bg-slate-950 text-slate-300 border-white/5"
                  }`}
                >
                  <span className={`text-xs font-bold leading-tight ${isSelected ? "text-red-300" : "text-white"}`}>
                    {a.term}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {a.category}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Representación SVG del Vaso Sanguíneo y Morfotipos */}
          <div className="relative bg-slate-950 rounded-xl p-2 border border-red-500/20 flex flex-col items-center justify-center overflow-hidden">
            <span className="text-[10px] font-mono text-slate-400 mb-1">
              Esquema Microscópico Vascular: {agent.morphologyLabel}
            </span>

            <svg
              viewBox="0 0 320 180"
              className="w-full max-w-[320px] h-auto select-none"
              role="img"
              aria-label={`Muestra de sangre mostrando morfotipos de ${agent.term}`}
            >
              <defs>
                <linearGradient id="vesselGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#450a0a" />
                  <stop offset="50%" stopColor="#1e1b4b" />
                  <stop offset="100%" stopColor="#450a0a" />
                </linearGradient>
              </defs>

              {/* Paredes del capilar sanguíneo */}
              <rect x="0" y="0" width="320" height="180" fill="url(#vesselGrad)" />
              <line x1="0" y1="12" x2="320" y2="12" stroke="#ef4444" strokeWidth="3" opacity="0.4" />
              <line x1="0" y1="168" x2="320" y2="168" stroke="#ef4444" strokeWidth="3" opacity="0.4" />

              {/* Células sanguíneas basales (Eritrocitos) */}
              <ellipse cx="50" cy="50" rx="14" ry="10" fill="#991b1b" stroke="#dc2626" strokeWidth="1.5" />
              <ellipse cx="140" cy="40" rx="15" ry="11" fill="#991b1b" stroke="#dc2626" strokeWidth="1.5" />
              <ellipse cx="260" cy="60" rx="13" ry="9" fill="#991b1b" stroke="#dc2626" strokeWidth="1.5" />
              <ellipse cx="80" cy="130" rx="15" ry="10" fill="#991b1b" stroke="#dc2626" strokeWidth="1.5" />
              <ellipse cx="200" cy="140" rx="14" ry="10" fill="#991b1b" stroke="#dc2626" strokeWidth="1.5" />
              <ellipse cx="280" cy="135" rx="13" ry="9" fill="#991b1b" stroke="#dc2626" strokeWidth="1.5" />

              {/* Neutrófilo circulante */}
              <circle cx="160" cy="110" r="16" fill="#1e293b" stroke="#94a3b8" strokeWidth="1.5" />
              <path d="M 152 104 Q 160 108 156 116 Q 166 114 168 106" fill="none" stroke="#64748b" strokeWidth="3" />

              {/* Morfotipos específicos reactivos */}
              {selectedAgent === "bacteriemia" && (
                <g>
                  {/* Cocos Gram positivos en racimo */}
                  <circle cx="105" cy="75" r="4.5" fill="#818cf8" stroke="#4338ca" strokeWidth="1" />
                  <circle cx="112" cy="73" r="4.5" fill="#818cf8" stroke="#4338ca" strokeWidth="1" />
                  <circle cx="108" cy="81" r="4.5" fill="#818cf8" stroke="#4338ca" strokeWidth="1" />
                  <circle cx="116" cy="79" r="4.5" fill="#818cf8" stroke="#4338ca" strokeWidth="1" />
                  {/* Bacilos Gram negativos */}
                  <rect x="200" cy="65" width="18" height="6" rx="3" fill="#f87171" stroke="#b91c1c" strokeWidth="1" />
                  <rect x="215" cy="85" width="16" height="6" rx="3" fill="#f87171" stroke="#b91c1c" strokeWidth="1" transform="rotate(25 215 85)" />
                </g>
              )}

              {selectedAgent === "fungemia" && (
                <g>
                  {/* Levaduras ovales y pseudohifas de Candida */}
                  <ellipse cx="110" cy="80" rx="10" ry="7" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
                  <ellipse cx="122" cy="77" rx="6" ry="4" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
                  {/* Pseudohifa alargada */}
                  <path d="M 195 85 Q 220 75 235 90" fill="none" stroke="#fbbf24" strokeWidth="4" strokeLinecap="round" />
                  <ellipse cx="238" cy="92" rx="7" ry="5" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
                </g>
              )}

              {selectedAgent === "viremia" && (
                <g>
                  {/* Partículas virales ultraestructurales dispersas */}
                  {[
                    [100, 75], [115, 95], [190, 75], [210, 95], [150, 60], [175, 70]
                  ].map(([vx, vy], i) => (
                    <g key={i}>
                      <circle cx={vx} cy={vy} r="3" fill="#38bdf8" stroke="#0284c7" strokeWidth="1" />
                      <line x1={vx - 4} y1={vy} x2={vx + 4} y2={vy} stroke="#38bdf8" strokeWidth="0.8" />
                      <line x1={vx} y1={vy - 4} x2={vx} y2={vy + 4} stroke="#38bdf8" strokeWidth="0.8" />
                    </g>
                  ))}
                  <text x="160" y="30" fill="#38bdf8" fontSize="9" textAnchor="middle" fontStyle="italic">Viriones en plasma (nano-escala)</text>
                </g>
              )}

              {selectedAgent === "parasitemia" && (
                <g>
                  {/* Glóbulo rojo parasitado con trofozoíto anular (Plasmodium) */}
                  <circle cx="140" cy="40" r="4" fill="none" stroke="#38bdf8" strokeWidth="1.5" />
                  <circle cx="142" cy="38" r="1.5" fill="#ef4444" />
                  {/* Tripomastigote extracelular flagelado (Trypanosoma) */}
                  <path d="M 85 95 C 100 80, 110 110, 125 90" fill="none" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="125" y1="90" x2="135" y2="85" stroke="#a855f7" strokeWidth="1" strokeDasharray="1 1" />
                  <circle cx="90" cy="93" r="2" fill="#e9d5ff" />
                </g>
              )}
            </svg>
          </div>

          <div className="space-y-1.5 text-xs">
            <p className="text-slate-300 text-[11px]">
              <strong className="text-white">Morfología observada:</strong> {agent.morphologyDescription}
            </p>
            <p className="text-slate-400 text-[11px]">
              <strong className="text-slate-300">Especies representativas:</strong> {agent.representativeSpecies.join(", ")}.
            </p>
            <p className="text-slate-400 text-[11px]">
              <strong className="text-slate-300">Método de detección:</strong> {agent.diagnosticMethod}
            </p>
          </div>
        </div>

        {/* PANEL DERECHO: ESTADO DEL HUÉSPED Y DISFUNCIÓN (6 cols) */}
        <div className="lg:col-span-6 p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-white/10 space-y-3.5">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span>Dimensión 2: Grado de Respuesta del Huésped</span>
            </span>
            <span className="text-[10px] font-mono text-amber-300">
              Evaluación Clínica
            </span>
          </div>

          {/* Selector de Respuesta del Huésped */}
          <div className="space-y-2">
            {(["transitoria", "alerta_sistemica", "sepsis_disfuncion"] as const).map((hKey) => {
              const isSelected = selectedHostResponse === hKey;
              const h = HOST_RESPONSES[hKey];
              return (
                <button
                  key={hKey}
                  onClick={() => {
                    setSelectedHostResponse(hKey);
                    setComparisonTarget(null);
                  }}
                  aria-pressed={isSelected}
                  className={`w-full p-2.5 rounded-xl border text-left transition-all min-h-[50px] flex items-center justify-between gap-2 ${
                    isSelected
                      ? hKey === "sepsis_disfuncion"
                        ? "bg-rose-500/20 border-rose-400 text-white ring-1 ring-rose-400/40"
                        : hKey === "alerta_sistemica"
                        ? "bg-amber-500/20 border-amber-400 text-white ring-1 ring-amber-400/40"
                        : "bg-emerald-500/20 border-emerald-400 text-white ring-1 ring-emerald-400/40"
                      : "bg-slate-950/60 hover:bg-slate-950 text-slate-300 border-white/5"
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold block">{h.title}</span>
                    <span className="text-[10px] text-slate-400">{h.sofaScore}</span>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    hKey === "sepsis_disfuncion"
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                      : hKey === "alerta_sistemica"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  }`}>
                    {h.badge.split(" · ")[0]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Estado Fisiopatológico de la Respuesta Seleccionada */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-white/5 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <strong className="text-white text-xs">{host.title}</strong>
              <span className="text-[10px] font-mono text-slate-400">{host.sofaScore}</span>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed">
              {host.clinicalState}
            </p>

            <div className="pt-2 border-t border-white/5 space-y-1 text-[11px]">
              <p><strong className="text-slate-300">Signos vitales:</strong> {host.vitalSigns}</p>
              <p><strong className="text-amber-300">Mecanismo fisiopatológico:</strong> {host.pathophysiologicalConcept}</p>
            </div>
          </div>

        </div>

      </div>

      {/* 4. Síntesis Cruzada Dinámica: Microorganismo + Respuesta del Huésped */}
      <div className="p-4 sm:p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-2.5">
        <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
          <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-amber-400" />
            <span>Escenario Combinado: {agent.term} + {host.title}</span>
          </h4>
          <span className="text-[11px] font-mono text-amber-300 font-bold">
            Juicio Clínico de Cátedra
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          {selectedHostResponse === "transitoria" && (
            <>
              El hallazgo de <strong>{agent.term}</strong> en este estado no constituye una emergencia sistémica por sí misma. En un hospedero inmunocompetente, los macrófagos tisulares aclaran la carga en minutos. El riesgo principal radica en pacientes con prótesis endovasculares o cardiopatías valvulares donde una bacteriemia transitoria puede originar endocarditis infecciosa.
            </>
          )}
          {selectedHostResponse === "alerta_sistemica" && (
            <>
              La presencia de <strong>{agent.term}</strong> con signos de respuesta sistémica refleja una infección activa con diseminación o foco de alta carga. Se requiere toma inmediata de hemocultivos pareados previo al inicio de antimicrobianos dirigidos para evitar progresión a falla orgánica.
            </>
          )}
          {selectedHostResponse === "sepsis_disfuncion" && (
            <>
              Estamos ante un cuadro de <strong>Sepsis</strong> con <strong>{agent.term}</strong> confirmada o sospechada. La urgencia médica vital proviene de la <em>disfunción orgánica desregulada</em> (hipoperfusión, hipotensión refractaria, hipoxemia), requiriendo soporte intensivo, reanimación hídrica y terapia antimicrobiana parenteral en la primera hora (Golden Hour).
            </>
          )}
        </p>
      </div>

      {/* 5. Comparar Estados del Huésped */}
      <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5 space-y-2 text-xs">
        <span className="font-bold text-white text-[11px] block">
          Comparar este grado de respuesta del huésped con otro estado:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {(["transitoria", "alerta_sistemica", "sepsis_disfuncion"] as const).map((hTarget) => {
            if (hTarget === selectedHostResponse) return null;
            const hInfo = HOST_RESPONSES[hTarget];
            return (
              <button
                key={hTarget}
                onClick={() => setComparisonTarget(comparisonTarget === hTarget ? null : hTarget)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all border min-h-[38px] ${
                  comparisonTarget === hTarget
                    ? "bg-amber-500 text-slate-950 border-amber-400"
                    : "bg-slate-900/80 text-slate-300 border-white/5 hover:text-white"
                }`}
              >
                vs {hInfo.title}
              </button>
            );
          })}
        </div>

        {compareHost && (
          <div className="p-3 rounded-xl bg-slate-950/90 border border-amber-400/30 text-[11px] text-slate-300 space-y-2 mt-2">
            <strong className="text-amber-300 block">Diferencia Fisiopatológica Fundamental:</strong>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="p-2 rounded-lg bg-slate-900/80">
                <span className="font-bold text-white block">{host.title}:</span>
                <p>{host.pathophysiologicalConcept}</p>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/80">
                <span className="font-bold text-white block">{compareHost.title}:</span>
                <p>{compareHost.pathophysiologicalConcept}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sección Plegable: «Profundizar» */}
      <div className="border border-white/10 rounded-2xl bg-slate-900/40 overflow-hidden">
        <button
          onClick={() => setShowDeepening(!showDeepening)}
          aria-expanded={showDeepening}
          className="w-full p-3.5 flex items-center justify-between text-left text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800/40 transition-colors min-h-[44px]"
        >
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Profundizar: Consenso Sepsis-3 (2016) y Reglas de Extracción de Hemocultivos</span>
          </span>
          {showDeepening ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showDeepening && (
          <div className="p-4 border-t border-white/5 bg-slate-950/60 space-y-3 text-xs text-slate-300">
            <div className="space-y-1">
              <strong className="text-amber-300">1. ¿Por qué se abandonó el término "septicemia" y el criterio SIRS estricto?</strong>
              <p className="text-[11px] leading-relaxed text-slate-400">
                El consenso internacional Sepsis-3 eliminó el término confuso "septicemia" y determinó que el SIRS (temperatura, frecuencia cardíaca, leucocitos) es una respuesta inflamatoria adaptativa que no siempre implica disfunción orgánica ni riesgo vital inminente. La <strong>Sepsis</strong> actual exige <em>disfunción orgánica cuantificable (SOFA ≥ 2 puntos)</em>.
              </p>
            </div>
            <div className="space-y-1">
              <strong className="text-amber-300">2. Reglas canónicas para toma de hemocultivos:</strong>
              <p className="text-[11px] leading-relaxed text-slate-400">
                Deben extraerse al menos 2 pares de frascos (aerobio y anaerobio) de diferentes punciones venosas periféricas, con asepsia rigurosa (clorhexidina o alcohol al 70%), asegurando un volumen de 8 a 10 mL de sangre por botella en adultos, <strong>antes</strong> de iniciar la terapia antibiótica.
              </p>
            </div>
          </div>
        )}
      </div>

    </GlassCard>
  );
};
