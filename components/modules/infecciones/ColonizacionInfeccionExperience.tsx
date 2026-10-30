"use client";

import React, { useState } from "react";
import Link from "next/link";
import { resolveAgentLink } from "@/lib/data/infection-hub/agents-link-registry";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  BookOpen,
  ChevronDown,
  ExternalLink,
  Layers,
  Activity,
  Bug,
  GraduationCap,
  Eye,
  ArrowRight
} from "lucide-react";

export type ConceptKey = "colonizacion" | "infeccion" | "enfermedad";
export type SchemaElementKey = "microorganismos" | "barrera" | "defensas" | "manifestaciones";

interface ConceptData {
  key: ConceptKey;
  label: string;
  badge: string;
  colorScheme: {
    accent: string;
    border: string;
    bg: string;
    text: string;
    glow: string;
  };
  briefDefinition: string;
  distinctiveCriteria: string[];
  commonMisconceptionClarification: string;
  schemaState: {
    statusTag: string;
    microbeCount: number;
    microbeDescription: string;
    barrierStatus: string;
    hostDefenseStatus: string;
    damageDescription: string;
  };
}

const CONCEPTS_DATA: Record<ConceptKey, ConceptData> = {
  colonizacion: {
    key: "colonizacion",
    label: "Colonización",
    badge: "Presencia sin enfermedad",
    colorScheme: {
      accent: "#10b981", // emerald
      border: "border-emerald-500/40",
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
      glow: "shadow-emerald-950/40"
    },
    briefDefinition:
      "Presencia establecida y posible multiplicación de microorganismos sobre una superficie corporal o mucosa, sin invasión lesiva ni enfermedad clínica atribuible a dicha presencia.",
    distinctiveCriteria: [
      "Sitio anatómico: Ocurre en superficies en contacto con el exterior (piel sana, orofaringe, colon, uretra distal o fosas nasales).",
      "Respuesta tisular: El microorganismo reside sin generar respuesta inflamatoria destructiva ni daño en la arquitectura del tejido.",
      "Función biológica: Puede formar parte de la microbiota comensal habitual o corresponder a una portación asintomática de un patógeno potencial."
    ],
    commonMisconceptionClarification:
      "No equiparar colonización con una relación necesariamente beneficiosa o mutualista. Un individuo puede estar colonizado por bacterias con alto potencial patógeno (como Staphylococcus aureus en narinas o Streptococcus agalactiae en canal vaginal) sin presentar daño ni síntomas. Tampoco es una etapa obligatoria previa para todos los patógenos.",
    schemaState: {
      statusTag: "Microbiota comensal o portación superficial",
      microbeCount: 6,
      microbeDescription: "Microorganismos confinados a la capa externa o estrato córneo/moco.",
      barrierStatus: "Barrera epitelial intacta y uniones intercelulares selladas.",
      hostDefenseStatus: "Inmunidad innata en estado basal de tolerancia y vigilancia.",
      damageDescription: "Ausencia de daño tisular y sin inflamación lesiva."
    }
  },
  infeccion: {
    key: "infeccion",
    label: "Infección",
    badge: "Establecimiento biológico activo",
    colorScheme: {
      accent: "#f59e0b", // amber
      border: "border-amber-500/40",
      bg: "bg-amber-500/10",
      text: "text-amber-400",
      glow: "shadow-amber-950/40"
    },
    briefDefinition:
      "Entrada, establecimiento y multiplicación de un agente infeccioso en los tejidos o células del hospedero, desencadenando una interacción biológica con respuesta de sus defensas. Puede ser completamente asintomática.",
    distinctiveCriteria: [
      "Interacción activa: Hay adherencia, superación de barreras primarias o internalización celular que activa mediadores celulares o humorales del hospedero.",
      "No requiere síntomas: Una infección puede cursar de forma subclínica o latente (ej. reactivación controlada, seroconversión asintomática) donde el paciente no percibe malestar.",
      "Invasión variable: No exige invasión profunda ni diseminación sistémica; puede limitarse a células del epitelio mucoso."
    ],
    commonMisconceptionClarification:
      "Estar infectado no es lo mismo que estar clínicamente enfermo. La presencia de replicación microbiana y activación inmunológica controlada a menudo no produce fiebre ni síntomas (como ocurre en la gran mayoría de las infecciones virales respiratorias o en la primoinfección por Mycobacterium tuberculosis).",
    schemaState: {
      statusTag: "Interacción activa · Frecuentemente asintomática",
      microbeCount: 8,
      microbeDescription: "Microorganismos interactuando con células del epitelio o ingresando al tejido.",
      barrierStatus: "Barrera comprometida o con transporte celular del patógeno.",
      hostDefenseStatus: "Reclutamiento de fagocitos (leucocitos/macrófagos) y respuesta inmune local.",
      damageDescription: "Sin daño clínico manifiesto si la respuesta inmune local contiene el proceso."
    }
  },
  enfermedad: {
    key: "enfermedad",
    label: "Enfermedad infecciosa",
    badge: "Manifestaciones clínicas y daño",
    colorScheme: {
      accent: "#ef4444", // red/rose
      border: "border-rose-500/40",
      bg: "bg-rose-500/10",
      text: "text-rose-400",
      glow: "shadow-rose-950/40"
    },
    briefDefinition:
      "Aparición de signos objetivos y síntomas subjetivos atribuibles al daño celular, toxicidad o inflamación desregulada provocada por una infección en el hospedero.",
    distinctiveCriteria: [
      "Manifestaciones clínicas evidentes: Presencia de signos medibles (fiebre, eritema, taquicardia, exudado) y síntomas referidos (dolor, astenia, náuseas).",
      "Disfunción orgánica o tisular: Hay pérdida de integridad estructural producto de toxinas microbianas, invasión citolítica o por la propia respuesta inflamatoria (inmunopatogénesis).",
      "Correlación diagnóstica: Requiere que el hallazgo del microorganismo sea concordante con el cuadro clínico que padece la persona."
    ],
    commonMisconceptionClarification:
      "En muchas enfermedades infecciosas, el daño y los síntomas no son producidos directamente por el número de microbios, sino por la magnitud de la respuesta inflamatoria del propio hospedero. Además, la enfermedad no es el desenlace inevitable de una infección: muchas infecciones se resuelven antes de provocar manifestaciones.",
    schemaState: {
      statusTag: "Daño tisular + Signos y síntomas evidentes",
      microbeCount: 11,
      microbeDescription: "Microorganismos proliferando y liberando toxinas, enzimas o causando lisis celular.",
      barrierStatus: "Disrupción epitelial evidente con pérdida de continuidad.",
      hostDefenseStatus: "Respuesta inflamatoria intensa (vasodilatación, edema, neutrófilos, citocinas).",
      damageDescription: "Signos clínicos manifiestos: inflamación, calor, dolor, exudado o disfunción."
    }
  }
};

interface SchemaElementExplanation {
  title: string;
  whatItRepresents: string;
  roleInConcept: string;
  whatCanVary: string;
}

export const ColonizacionInfeccionExperience: React.FC = () => {
  const [selectedConcept, setSelectedConcept] = useState<ConceptKey>("colonizacion");
  const [selectedElement, setSelectedElement] = useState<SchemaElementKey>("microorganismos");
  const [showComparison, setShowComparison] = useState(false);
  const [showSources, setShowSources] = useState(false);

  const concept = CONCEPTS_DATA[selectedConcept];

  // Explicación de los elementos según el concepto activo
  const getElementExplanation = (elementKey: SchemaElementKey): SchemaElementExplanation => {
    switch (elementKey) {
      case "microorganismos":
        return {
          title: "Microorganismos (Agente)",
          whatItRepresents:
            selectedConcept === "colonizacion"
              ? "Población microbiana que reside sobre la superficie epitelial sin invadir ni liberar toxinas destructivas."
              : selectedConcept === "infeccion"
              ? "Microorganismos que han logrado adherirse fuertemente e interactuar con el hospedero, iniciando su multiplicación activa."
              : "Población microbiana que prolifera de forma no controlada, liberando exoenzimas, toxinas o desencadenando citotoxicidad.",
          roleInConcept:
            selectedConcept === "colonizacion"
              ? "Ocupa nichos ecológicos y compite por nutrientes sin generar daño."
              : selectedConcept === "infeccion"
              ? "Activa la señalización celular y despierta mecanismos de defensa locales."
              : "Efector directo del daño mediante toxinas y blanco de una respuesta inflamatoria agresiva.",
          whatCanVary:
            "Varía según el patógeno (bacterias comensales vs patógenos estrictos), la dosis infectiva recibida y factores de adherencia como fimbrias y adhesinas (PDF 1, págs. 15-16)."
        };

      case "barrera":
        return {
          title: "Superficie o Barrera Corporal",
          whatItRepresents:
            selectedConcept === "colonizacion"
              ? "Capa epitelial continua (piel o mucosa) con queratina, moco y uniones intercelulares intactas que impiden el paso microbiano."
              : selectedConcept === "infeccion"
              ? "Epitelio bajo desafío biológico, donde algunas uniones pueden ser permeadas o células epiteliales pueden ser colonizadas intracelularmente."
              : "Disrupción mecánica o inflamatoria de la barrera epitelial con ulceración, desprendimiento celular o pérdida de continuidad.",
          roleInConcept:
            selectedConcept === "colonizacion"
              ? "Provee el soporte físico y moco para la permanencia de la microbiota sin permitir su paso a tejidos estériles."
              : selectedConcept === "infeccion"
              ? "Punto de contacto y señalización para la translocación o invasión focal."
              : "Origen de las manifestaciones locales (eritema, exudado purulento, solución de continuidad).",
          whatCanVary:
            "Varía según el tipo de tejido (estrato córneo queratinizado de la piel vs monocapa mucosa respiratoria o digestiva) y la presencia de traumatismos previos."
        };

      case "defensas":
        return {
          title: "Hospedero y Defensas Inmunes",
          whatItRepresents:
            selectedConcept === "colonizacion"
              ? "Sistema inmune innato de vigilancia basal; reconoce péptidos microbianos sin desencadenar cascadas inflamatorias lesivas."
              : selectedConcept === "infeccion"
              ? "Activación inmune activa: llegada de neutrófilos, fagocitos mononucleares y secreción de quimiocinas para contener al agente."
              : "Respuesta inflamatoria masiva con reclutamiento leucocitario extenso, vasodilatación capilar y producción de citocinas pirógenas.",
          roleInConcept:
            selectedConcept === "colonizacion"
              ? "Mantener la tolerancia inmune fisiológica hacia la microbiota comensal."
              : selectedConcept === "infeccion"
              ? "Contener y eliminar al microorganismo; si tiene éxito, la persona nunca llega a experimentar síntomas."
              : "Doble filo: protege al hospedero pero la inmunopatogénesis causa gran parte del dolor, edema y necrosis tisular.",
          whatCanVary:
            "Varía drásticamente según la edad, estado nutricional, comorbilidades (ej. diabetes descompensada) o inmunosupresión farmacológica (PDF 1, pág. 17)."
        };

      case "manifestaciones":
        return {
          title: "Manifestaciones Clínicas o Daño",
          whatItRepresents:
            selectedConcept === "colonizacion"
              ? "Estado asintomático con función fisiológica normal del tejido; no existe queja clínica ni alteración analítica."
              : selectedConcept === "infeccion"
              ? "Estado subclínico: puede haber seroconversión analítica detectable en laboratorio, pero el paciente se siente completamente sano."
              : "Signos clínicos medibles (fiebre > 38°C, taquicardia, calor, enrojecimiento) y síntomas referidos (dolor, fatiga, disfunción).",
          roleInConcept:
            selectedConcept === "colonizacion"
              ? "Indicador de estabilidad ecológica."
              : selectedConcept === "infeccion"
              ? "Prueba de que la infección puede pasar desapercibida si no se busca con exámenes específicos."
              : "Criterio médico determinante para el diagnóstico de enfermedad infecciosa y la necesidad de conducta terapéutica.",
          whatCanVary:
            "Varía según el umbral del paciente, la localización del órgano afectado y la rapidez con la que se instala el tratamiento."
        };
    }
  };

  const activeElementData = getElementExplanation(selectedElement);

  // Enlaces de cátedra verificados
  const saureusRes = resolveAgentLink("B03"); // Staphylococcus aureus (B03)
  const spneumoRes = resolveAgentLink("B01"); // Streptococcus pneumoniae (B01)
  const calbicansRes = resolveAgentLink("H03"); // Candida albicans (H03)

  return (
    <div className="space-y-6 pt-2 pb-4">
      
      {/* 1. Introducción Breve */}
      <div className="p-4 sm:p-5 rounded-2xl glass-panel border border-cyan-500/20 bg-gradient-to-r from-slate-950 via-slate-900/90 to-cyan-950/20 space-y-2">
        <div className="flex items-center space-x-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
          <HelpCircle className="w-4 h-4 shrink-0 text-cyan-400" />
          <span>Pregunta Formativa Fundamental</span>
        </div>

        <h3 className="text-base sm:text-xl font-extrabold text-white tracking-tight">
          «Encontrar un microorganismo, ¿significa estar enfermo?»
        </h3>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
          Encontrar un microorganismo en una muestra biológica no equivale necesariamente a padecer una enfermedad infecciosa ni a requerir antimicrobianos. La relación entre hospedero y microorganismo abarca distintos estados biológicos: la colonización comensal o portación habitual, la infección subclínica asintomática y la enfermedad manifiesta con daño funcional.
        </p>

        <div className="pt-2 flex items-center gap-2 text-[11px] text-slate-400 border-t border-white/5">
          <BookOpen className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>Fuente: Cátedra Agentes Infecciosos UDD (PDF 1, págs. 14-16) · TM. Felipe Córdova Lagos.</span>
        </div>
      </div>

      {/* 2. Selector de los Tres Conceptos (Botones con accesibilidad y área táctil >= 44px) */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Selecciona un concepto para explorar:</span>
          </span>

          {/* Botón para alternar la vista comparativa */}
          <button
            type="button"
            onClick={() => setShowComparison((prev) => !prev)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 min-h-[44px] ${
              showComparison
                ? "bg-purple-600 text-white border border-purple-400 shadow-md shadow-purple-950/40"
                : "bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-white/10"
            }`}
            aria-pressed={showComparison}
          >
            <Activity className="w-3.5 h-3.5 text-purple-300" />
            <span>{showComparison ? "Ocultar comparación" : "Comparar los tres conceptos"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5" role="tablist" aria-label="Conceptos microbiológicos">
          {(["colonizacion", "infeccion", "enfermedad"] as ConceptKey[]).map((cKey) => {
            const item = CONCEPTS_DATA[cKey];
            const isSelected = selectedConcept === cKey && !showComparison;

            return (
              <button
                key={cKey}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => {
                  setSelectedConcept(cKey);
                  setShowComparison(false);
                }}
                className={`
                  p-3.5 rounded-2xl text-left transition-all min-h-[44px] flex items-center justify-between gap-3
                  ${isSelected
                    ? "bg-slate-800/90 text-white border-2 " + item.colorScheme.border + " shadow-lg " + item.colorScheme.glow + " ring-2 ring-white/10 font-bold"
                    : "bg-slate-900/60 text-slate-300 hover:text-white hover:bg-slate-850 border border-white/10"}
                `}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: item.colorScheme.accent }}
                      aria-hidden="true"
                    />
                    <span className="text-sm font-bold truncate">{item.label}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5 truncate">
                    {item.badge}
                  </span>
                </div>

                <div 
                  className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center shrink-0"
                  style={{ borderColor: isSelected ? item.colorScheme.accent : undefined }}
                >
                  {isSelected && (
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.colorScheme.accent }} />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Panel Principal Unificado del Concepto Seleccionado */}
      {!showComparison && (
        <div className="p-4 sm:p-6 rounded-3xl glass-panel border border-white/10 bg-slate-950/80 shadow-xl space-y-6 animate-in fade-in duration-200">
          
          {/* Cabecera del concepto activo */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div 
                className="w-3.5 h-3.5 rounded-full shadow-md shrink-0" 
                style={{ backgroundColor: concept.colorScheme.accent }}
              />
              <h4 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                {concept.label}
              </h4>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 font-medium" style={{ color: concept.colorScheme.accent }}>
                {concept.badge}
              </span>
            </div>

            <span className="text-[11px] text-slate-400 font-mono">
              Espectro de interacción biológica
            </span>
          </div>

          {/* Definición y Criterios */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Definición Breve */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Definición Breve:
              </span>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                {concept.briefDefinition}
              </p>
            </div>

            {/* Criterios Distintivos */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Criterios que permiten distinguirlo:
              </span>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {concept.distinctiveCriteria.map((crit, idx) => (
                  <li key={idx} className="flex items-start gap-2 leading-relaxed">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-cyan-400" />
                    <span>{crit}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Aclaración de Confusión Frecuente */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-1.5 text-xs">
            <div className="flex items-center space-x-1.5 font-bold text-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Aclaración Clave (Evita confusiones frecuentes):</span>
            </div>
            <p className="text-slate-300 leading-relaxed pl-5 text-[11px] sm:text-xs">
              {concept.commonMisconceptionClarification}
            </p>
          </div>

          {/* 4. Esquema Educativo 2D Simplificado (SVG Interactivo) */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Esquema educativo simplificado</span>
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Toca o selecciona con teclado los componentes del esquema para inspeccionar su rol.
                </p>
              </div>

              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 text-slate-400 border border-white/10 font-mono">
                {concept.schemaState.statusTag}
              </span>
            </div>

            {/* Contenedor del Diagrama SVG */}
            <div className="relative rounded-2xl bg-slate-950 border border-white/10 p-3 sm:p-4 overflow-hidden shadow-inner">
              
              <svg
                viewBox="0 0 600 240"
                className="w-full h-auto max-h-[260px] select-none"
                role="img"
                aria-label={`Esquema educativo simplificado de ${concept.label}`}
              >
                <defs>
                  {/* Gradientes y patrones para capas */}
                  <linearGradient id="bgLumen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0f172a" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#1e293b" stopOpacity="0.4" />
                  </linearGradient>

                  <linearGradient id="epitheliumGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#334155" />
                    <stop offset="100%" stopColor="#1e293b" />
                  </linearGradient>

                  <linearGradient id="laminaPropriaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1e1b4b" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="#0f172a" stopOpacity="0.9" />
                  </linearGradient>
                </defs>

                {/* ZONA 1: Exterior / Superficie (Luz) */}
                <rect x="0" y="0" width="600" height="90" fill="url(#bgLumen)" rx="8" />
                <text x="15" y="22" fill="#94a3b8" fontSize="10" fontWeight="bold" letterSpacing="0.5">
                  SUPERFICIE CORPORAL / LUZ
                </text>

                {/* Microorganismos (Grupo interactivo) */}
                <g
                  role="button"
                  tabIndex={0}
                  aria-pressed={selectedElement === "microorganismos"}
                  onClick={() => setSelectedElement("microorganismos")}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setSelectedElement("microorganismos");
                      e.preventDefault();
                    }
                  }}
                  className="cursor-pointer focus:outline-none"
                >
                  <rect
                    x="8"
                    y="28"
                    width="584"
                    height="58"
                    rx="6"
                    fill={selectedElement === "microorganismos" ? "rgba(56, 189, 248, 0.12)" : "transparent"}
                    stroke={selectedElement === "microorganismos" ? "#38bdf8" : "transparent"}
                    strokeWidth="1.5"
                    strokeDasharray="4 2"
                  />

                  {/* Representación de bacterias según el concepto */}
                  {selectedConcept === "colonizacion" && (
                    <g>
                      {/* Cocos agrupados en racimos superficiales (ej. S. aureus comensal) */}
                      {[60, 90, 120, 200, 230, 260, 360, 390, 480, 510].map((cx, i) => (
                        <circle
                          key={i}
                          cx={cx}
                          cy={55 + ((i % 3) * 6)}
                          r="6.5"
                          fill="#f59e0b"
                          stroke="#d97706"
                          strokeWidth="1.5"
                        />
                      ))}
                      <text x="290" y="75" textAnchor="middle" fill="#cbd5e1" fontSize="11" fontWeight="600">
                        Microorganismos en capa superficial (sin invasión)
                      </text>
                    </g>
                  )}

                  {selectedConcept === "infeccion" && (
                    <g>
                      {/* Cocos interactuando con células y adhiriéndose */}
                      {[50, 80, 110, 180, 210, 250, 320, 360, 420, 470, 520].map((cx, i) => (
                        <circle
                          key={i}
                          cx={cx}
                          cy={62 + (i % 2 === 0 ? 8 : -4)}
                          r="6.5"
                          fill="#f59e0b"
                          stroke="#ea580c"
                          strokeWidth="1.5"
                        />
                      ))}
                      <text x="290" y="52" textAnchor="middle" fill="#fde047" fontSize="11" fontWeight="600">
                        Adhesión e interacción celular activa (puede ser asintomática)
                      </text>
                    </g>
                  )}

                  {selectedConcept === "enfermedad" && (
                    <g>
                      {/* Cocos proliferando e ingresando a través de la brecha tisular */}
                      {[40, 70, 100, 140, 200, 240, 270, 310, 340, 400, 450, 510].map((cx, i) => (
                        <circle
                          key={i}
                          cx={cx}
                          cy={cx > 220 && cx < 360 ? 85 + (i * 3) : 58}
                          r="7"
                          fill="#ef4444"
                          stroke="#b91c1c"
                          strokeWidth="1.5"
                        />
                      ))}
                      <text x="290" y="44" textAnchor="middle" fill="#f87171" fontSize="11" fontWeight="700">
                        Proliferación invasiva y secreción de toxinas/exoenzimas
                      </text>
                    </g>
                  )}
                </g>

                {/* ZONA 2: Barrera Epitelial (Grupo interactivo) */}
                <g
                  role="button"
                  tabIndex={0}
                  aria-pressed={selectedElement === "barrera"}
                  onClick={() => setSelectedElement("barrera")}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setSelectedElement("barrera");
                      e.preventDefault();
                    }
                  }}
                  className="cursor-pointer focus:outline-none"
                >
                  <rect
                    x="8"
                    y="92"
                    width="584"
                    height="56"
                    rx="6"
                    fill={selectedElement === "barrera" ? "rgba(168, 85, 247, 0.15)" : "url(#epitheliumGrad)"}
                    stroke={selectedElement === "barrera" ? "#c084fc" : "#475569"}
                    strokeWidth={selectedElement === "barrera" ? "2" : "1"}
                  />

                  {/* Células epiteliales dibujadas en bloques */}
                  {Array.from({ length: 12 }).map((_, idx) => {
                    const x = 12 + idx * 48;
                    const isDamagedZone = selectedConcept === "enfermedad" && (idx === 5 || idx === 6);

                    return (
                      <g key={idx}>
                        <rect
                          x={x}
                          y="96"
                          width="44"
                          height="48"
                          rx="4"
                          fill={isDamagedZone ? "#450a0a" : "#1e293b"}
                          stroke={isDamagedZone ? "#ef4444" : "#475569"}
                          strokeWidth="1"
                        />
                        {/* Núcleo celular */}
                        <circle
                          cx={x + 22}
                          cy="120"
                          r={isDamagedZone ? "3" : "5"}
                          fill={isDamagedZone ? "#991b1b" : "#64748b"}
                        />
                      </g>
                    );
                  })}

                  <text x="300" y="140" textAnchor="middle" fill="#cbd5e1" fontSize="10" fontWeight="600">
                    BARRERA EPITELIAL {selectedConcept === "enfermedad" ? "(Disrupción y lesión celular)" : "(Uniones íntegras)"}
                  </text>
                </g>

                {/* ZONA 3: Tejido Subepitelial y Hospedero (Defensas) */}
                <g
                  role="button"
                  tabIndex={0}
                  aria-pressed={selectedElement === "defensas"}
                  onClick={() => setSelectedElement("defensas")}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setSelectedElement("defensas");
                      e.preventDefault();
                    }
                  }}
                  className="cursor-pointer focus:outline-none"
                >
                  <rect
                    x="8"
                    y="152"
                    width="584"
                    height="78"
                    rx="6"
                    fill={selectedElement === "defensas" ? "rgba(16, 185, 129, 0.15)" : "url(#laminaPropriaGrad)"}
                    stroke={selectedElement === "defensas" ? "#34d399" : "#334155"}
                    strokeWidth={selectedElement === "defensas" ? "2" : "1"}
                  />

                  <text x="15" y="168" fill="#94a3b8" fontSize="10" fontWeight="bold">
                    TEJIDO SUBEPITELIAL / DEFENSAS DEL HOSPEDERO
                  </text>

                  {/* Leucocitos / Fagocitos */}
                  {selectedConcept === "colonizacion" && (
                    <g>
                      <circle cx="150" cy="195" r="9" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />
                      <circle cx="450" cy="195" r="9" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />
                      <text x="300" y="200" textAnchor="middle" fill="#94a3b8" fontSize="10">
                        Vigilancia inmune basal · Sin inflamación perjudicial
                      </text>
                    </g>
                  )}

                  {selectedConcept === "infeccion" && (
                    <g>
                      {/* Fagocitos respondiendo focalmente */}
                      <circle cx="120" cy="195" r="10" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />
                      <circle cx="280" cy="185" r="11" fill="#0369a1" stroke="#38bdf8" strokeWidth="2" />
                      <circle cx="330" cy="190" r="10" fill="#0369a1" stroke="#38bdf8" strokeWidth="1.5" />
                      <circle cx="480" cy="195" r="10" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />
                      <text x="300" y="218" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="600">
                        Reclutamiento de fagocitos y respuesta inmune local (asintomática)
                      </text>
                    </g>
                  )}

                  {selectedConcept === "enfermedad" && (
                    <g>
                      {/* Inflamación intensa con daño tisular */}
                      {[100, 180, 240, 280, 320, 360, 420, 500].map((cx, i) => (
                        <circle
                          key={i}
                          cx={cx}
                          cy={188 + ((i % 2) * 8)}
                          r="10"
                          fill="#b91c1c"
                          stroke="#f87171"
                          strokeWidth="1.5"
                        />
                      ))}
                      <text x="300" y="222" textAnchor="middle" fill="#f87171" fontSize="10" fontWeight="700">
                        Infiltrado inflamatorio masivo, edema y daño celular (inmunopatogénesis)
                      </text>
                    </g>
                  )}
                </g>
              </svg>

              {/* Botones de acceso táctil a los 4 elementos del esquema */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-white/5">
                {[
                  { key: "microorganismos" as SchemaElementKey, label: "Microorganismos" },
                  { key: "barrera" as SchemaElementKey, label: "Barrera epitelial" },
                  { key: "defensas" as SchemaElementKey, label: "Defensas inmunes" },
                  { key: "manifestaciones" as SchemaElementKey, label: "Manifestaciones / Daño" }
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setSelectedElement(item.key)}
                    className={`
                      px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all min-h-[44px] text-center
                      ${selectedElement === item.key
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                        : "bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-white/5"}
                    `}
                    aria-pressed={selectedElement === item.key}
                  >
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>

            </div>

            {/* Panel explicativo del elemento seleccionado en el esquema */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-cyan-500/30 space-y-2">
              <div className="flex items-center justify-between pb-1.5 border-b border-white/5">
                <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Elemento seleccionado: {activeElementData.title}</span>
                </span>
                <span className="text-[10px] text-slate-400 uppercase font-mono">
                  Contexto: {concept.label}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                    1. Qué representa:
                  </span>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {activeElementData.whatItRepresents}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                    2. Qué papel cumple:
                  </span>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {activeElementData.roleInConcept}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                    3. Qué puede variar:
                  </span>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {activeElementData.whatCanVary}
                  </p>
                </div>
              </div>

              {/* Ejemplo de cátedra identificado con sus límites */}
              <div className="mt-2 pt-2 border-t border-white/5 text-[11px] text-slate-400">
                <strong className="text-slate-200">Ejemplo de cátedra (PDF 1, pág. 15):</strong>{" "}
                <em>Staphylococcus aureus</em> en el vestíbulo nasal constituye <strong>colonización habitual</strong> en un ~30% de la población. Si penetra la dermis por una microlesión, genera una <strong>infección focal</strong> que puede ser contenida por neutrófilos o progresar a <strong>enfermedad infecciosa</strong> (forúnculo o celulitis con dolor, calor y pus).
              </div>
            </div>

          </div>

        </div>
      )}

      {/* 5. Comparar los Tres Conceptos (Vista comparativa sin tablas con scroll) */}
      {showComparison && (
        <div className="p-4 sm:p-6 rounded-3xl glass-panel border border-purple-500/30 bg-slate-950/85 shadow-xl space-y-4 animate-in fade-in duration-200">
          
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" />
              <h4 className="text-base sm:text-lg font-bold text-white">
                Comparativa Conceptual Directa
              </h4>
            </div>

            <button
              type="button"
              onClick={() => setShowComparison(false)}
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              Volver a vista interactiva
            </button>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Esta comparación resume los tres estados. <strong>Recuerda que no representan etapas obligatorias ni una evolución inevitable</strong>: la colonización no necesariamente progresa a infección, y una infección no necesariamente produce enfermedad.
          </p>

          {/* Bloques apilados legibles en celular y escritorio */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            
            {/* Bloque 1: Colonización */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-emerald-500/30 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <h5 className="font-bold text-sm text-emerald-300">Colonización</h5>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Qué describe:</span>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                  Presencia y multiplicación sobre epitelios o mucosas sin invasión ni daño tisular.
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Relación con síntomas:</span>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                  <strong>Totalmente asintomática.</strong> No existe queja clínica ni signos inflamatorios destructivos.
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-rose-300 block">Qué NO permite concluir su detección:</span>
                <p className="text-xs text-rose-200/90 mt-0.5 leading-relaxed">
                  No permite concluir que el paciente esté enfermo ni que requiera antibióticos. Aislar un germen en piel u orofaringe suele ser colonización.
                </p>
              </div>
            </div>

            {/* Bloque 2: Infección */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-amber-500/30 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <h5 className="font-bold text-sm text-amber-300">Infección</h5>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Qué describe:</span>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                  Establecimiento y replicación en tejidos o células con interacción biológica y activación inmunitaria.
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Relación con síntomas:</span>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                  <strong>Variable: con frecuencia asintomática</strong> (infección subclínica o latente).
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-rose-300 block">Qué NO permite concluir su detección:</span>
                <p className="text-xs text-rose-200/90 mt-0.5 leading-relaxed">
                  No permite concluir por sí sola que haya daño clínico o enfermedad manifiesta en ese momento.
                </p>
              </div>
            </div>

            {/* Bloque 3: Enfermedad Infecciosa */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-rose-500/30 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                <h5 className="font-bold text-sm text-rose-300">Enfermedad infecciosa</h5>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Qué describe:</span>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                  Manifestaciones clínicas (signos y síntomas) producidas por daño tisular o inflamación desregulada.
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Relación con síntomas:</span>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                  <strong>Siempre sintomática o con signos patológicos medibles</strong> (fiebre, dolor, eritema, secreción).
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-rose-300 block">Qué NO permite concluir su detección:</span>
                <p className="text-xs text-rose-200/90 mt-0.5 leading-relaxed">
                  El hallazgo microbiológico aislado no diagnostica enfermedad si no se correlaciona con el cuadro clínico del paciente.
                </p>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 6. Desplegable «Profundizar y fuentes» */}
      <div className="rounded-2xl border border-white/10 bg-slate-950/60 overflow-hidden">
        <button
          type="button"
          onClick={() => setShowSources((prev) => !prev)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors min-h-[44px]"
          aria-expanded={showSources}
        >
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span className="text-xs sm:text-sm font-bold text-slate-200">
              Profundizar y fuentes documentales de cátedra
            </span>
          </div>

          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${showSources ? "rotate-180" : ""}`} />
        </button>

        {showSources && (
          <div className="p-4 sm:p-5 border-t border-white/10 space-y-4 bg-slate-950/80 animate-in fade-in duration-200 text-xs">
            
            {/* Explicación ampliada */}
            <div className="space-y-1.5">
              <span className="font-bold text-slate-200 block text-xs uppercase tracking-wider">
                Implicancia médica para estudiantes de salud:
              </span>
              <p className="text-slate-300 text-[11px] sm:text-xs leading-relaxed">
                Uno de los errores más frecuentes en la práctica clínica es indicar antibióticos ante el mero aislamiento de un microorganismo en un cultivo de hisopado faríngeo, cutáneo o de orina en un paciente asintomático (bacteriuria asintomática o colonización comensal). Comprender que la <strong>colonización no requiere erradicación rutinaria</strong> protege al microbioma y previene la selección de cepas multirresistentes.
              </p>
            </div>

            {/* Ejemplos de agentes enlazados a fichas existentes */}
            <div className="space-y-2 pt-2 border-t border-white/5">
              <span className="font-bold text-slate-200 block text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Bug className="w-3.5 h-3.5 text-purple-400" />
                <span>Ejemplos de microorganismos con espectro colonización-infección:</span>
              </span>

              <div className="flex flex-wrap gap-2">
                {saureusRes.status === "exact_card" && saureusRes.href && (
                  <Link
                    href={saureusRes.href}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 hover:border-cyan-400 text-xs text-slate-200 hover:text-white transition-colors min-h-[36px]"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span className="font-semibold italic">Staphylococcus aureus</span>
                    <span className="text-[10px] text-cyan-400 font-mono">(B03)</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </Link>
                )}

                {spneumoRes.status === "exact_card" && spneumoRes.href && (
                  <Link
                    href={spneumoRes.href}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 hover:border-cyan-400 text-xs text-slate-200 hover:text-white transition-colors min-h-[36px]"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span className="font-semibold italic">Streptococcus pneumoniae</span>
                    <span className="text-[10px] text-cyan-400 font-mono">(B01)</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </Link>
                )}

                {calbicansRes.status === "exact_card" && calbicansRes.href && (
                  <Link
                    href={calbicansRes.href}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 hover:border-cyan-400 text-xs text-slate-200 hover:text-white transition-colors min-h-[36px]"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span className="font-semibold italic">Candida albicans</span>
                    <span className="text-[10px] text-cyan-400 font-mono">(H01)</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </Link>
                )}
              </div>
            </div>

            {/* Documentos y páginas cotejadas */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-white/5 space-y-1.5">
              <span className="font-bold text-slate-300 block text-[11px] uppercase tracking-wider">
                Fuentes documentales consultadas y respaldadas:
              </span>
              <ul className="space-y-1 text-[11px] text-slate-400">
                <li className="flex items-start gap-1.5">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span>
                    <strong>Documento 1:</strong> «Interacción humano-patógeno I: Bacterias y virus», diapositivas 14, 15, 16, 17 y 18. Docente TM. Felipe Córdova Lagos, Tecnología Médica, Facultad de Medicina CAS-UDD.
                  </span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span>
                    <strong>Documento 2:</strong> «Interacción humano-patógeno II: Hongos y parásitos», diapositivas 4, 5 y 7 (*Candida albicans* comensal vs patógeno oportunista).
                  </span>
                </li>
              </ul>
              <p className="text-[10px] text-slate-500 pt-1">
                Material protegido para uso exclusivo del curso institucional. No se suministran archivos para descarga externa.
              </p>
            </div>

          </div>
        )}
      </div>

    </div>
  );
};
