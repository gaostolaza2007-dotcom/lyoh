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
  ShieldCheck,
  Dna,
  Layers,
  FlaskConical,
  Eye,
  ArrowRight
} from "lucide-react";

type MarkerKey = "hbsAg" | "hbeAg" | "antiHbcIgm" | "antiHbcTotal" | "antiHbs" | "antiHbe" | "dnaVhb";

type ScenarioKey = "vacunacion" | "infeccion_resuelta" | "aguda" | "cronica" | "ventana";

interface ScenarioData {
  id: ScenarioKey;
  title: string;
  badge: string;
  description: string;
  markers: Record<MarkerKey, { status: "positivo" | "negativo" | "no_habitual"; valueDetail: string }>;
  diagnosticConclusion: string;
  pathophysiologicalRationale: string;
  examPearl: string;
}

const SCENARIOS: Record<ScenarioKey, ScenarioData> = {
  vacunacion: {
    id: "vacunacion",
    title: "Inmunidad por Vacunación",
    badge: "Patrón Vacunal Exitoso",
    description: "Persona inmunizada con la vacuna recombinante que nunca ha tenido infección natural.",
    markers: {
      hbsAg: { status: "negativo", valueDetail: "Negativo (no hay virus ni antígeno circulante)" },
      hbeAg: { status: "negativo", valueDetail: "Negativo" },
      antiHbcIgm: { status: "negativo", valueDetail: "Negativo" },
      antiHbcTotal: { status: "negativo", valueDetail: "NEGATIVO: La vacuna no contiene antígenos del core" },
      antiHbs: { status: "positivo", valueDetail: "POSITIVO (≥10 mUI/mL): Título neutralizante protector" },
      antiHbe: { status: "negativo", valueDetail: "Negativo" },
      dnaVhb: { status: "negativo", valueDetail: "Indetectable" }
    },
    diagnosticConclusion: "Inmune a VHB mediado por vacuna. No infectado.",
    pathophysiologicalRationale: "La vacuna contra hepatitis B contiene exclusivamente HBsAg recombinante producido en levaduras. Por ello, el sistema inmune monta respuesta de anticuerpos protectores Anti-HBs, pero nunca genera Anti-HBc porque jamás estuvo en contacto con el core del virión intacto.",
    examPearl: "Anti-HBs (+) aislado con Anti-HBc (-) es el sello indiscutible de vacunación exitosa."
  },
  infeccion_resuelta: {
    id: "infeccion_resuelta",
    title: "Infección Pasada Resuelta (Curada)",
    badge: "Inmunidad Natural Permanente",
    description: "Persona que cursó una hepatitis B en el pasado y logró el aclaramiento viral espontáneo.",
    markers: {
      hbsAg: { status: "negativo", valueDetail: "Negativo: Virus aclarado de la circulación" },
      hbeAg: { status: "negativo", valueDetail: "Negativo" },
      antiHbcIgm: { status: "negativo", valueDetail: "Negativo: La fase aguda quedó en el pasado" },
      antiHbcTotal: { status: "positivo", valueDetail: "POSITIVO (IgG): Memoria indeleble de infección natural" },
      antiHbs: { status: "positivo", valueDetail: "POSITIVO: Anticuerpo protector neutralizante" },
      antiHbe: { status: "positivo", valueDetail: "Habitualmente positivo (seroconversión previa)" },
      dnaVhb: { status: "negativo", valueDetail: "Indetectable en suero (<10–20 UI/mL)" }
    },
    diagnosticConclusion: "Infección pasada resuelta. Inmune contra reinfección.",
    pathophysiologicalRationale: "El hospedero se enfrentó al virión completo de VHB, generando Anti-HBc de por vida. Tras semanas o meses de replicación, el sistema inmune eliminó el HBsAg sérico y produjo Anti-HBs protector.",
    examPearl: "Anti-HBs (+) acompañado de Anti-HBc (+) demuestra infección natural curada (nunca simple vacuna)."
  },
  aguda: {
    id: "aguda",
    title: "Hepatitis B Aguda Típica",
    badge: "Infección Reciente en Curso (<6 meses)",
    description: "Paciente en fase sintomática prodrómica o ictérica con replicación activa.",
    markers: {
      hbsAg: { status: "positivo", valueDetail: "POSITIVO a títulos muy elevados" },
      hbeAg: { status: "positivo", valueDetail: "POSITIVO: Alta tasa de replicación e infectividad" },
      antiHbcIgm: { status: "positivo", valueDetail: "POSITIVO A TÍTULOS ALTOS: Marcador patognomónico de agudeza" },
      antiHbcTotal: { status: "positivo", valueDetail: "Positivo (IgM predominante)" },
      antiHbs: { status: "negativo", valueDetail: "Negativo: No hay anticuerpos libres protectores aún" },
      antiHbe: { status: "negativo", valueDetail: "Negativo" },
      dnaVhb: { status: "positivo", valueDetail: "POSITIVO: Carga viral masiva (>10^6 UI/mL)" }
    },
    diagnosticConclusion: "Infección aguda activa reciente por VHB.",
    pathophysiologicalRationale: "El virión invade activamente los hepatocitos; hay secreción masiva de HBsAg y HBeAg. La respuesta humoral primaria produce IgM Anti-HBc, el marcador de referencia para catalogar la infección como aguda.",
    examPearl: "IgM Anti-HBc (+) a títulos altos confirma agudeza en un paciente HBsAg (+)."
  },
  cronica: {
    id: "cronica",
    title: "Infección Crónica por VHB",
    badge: "Persistencia > 6 Meses",
    description: "Falla en el aclaramiento inmune con persistencia documentada de HBsAg.",
    markers: {
      hbsAg: { status: "positivo", valueDetail: "POSITIVO documentado por más de 6 meses" },
      hbeAg: { status: "positivo", valueDetail: "Positivo (fase replicativa) o Negativo (mutante precore)" },
      antiHbcIgm: { status: "negativo", valueDetail: "NEGATIVO (salvo reactivaciones agudas graves)" },
      antiHbcTotal: { status: "positivo", valueDetail: "POSITIVO a expensas de IgG anti-HBc" },
      antiHbs: { status: "negativo", valueDetail: "NEGATIVO: Ausencia de anticuerpos neutralizantes" },
      antiHbe: { status: "no_habitual", valueDetail: "Variable según el estado de seroconversión" },
      dnaVhb: { status: "positivo", valueDetail: "POSITIVO cuantificable (determina indicación de tratamiento)" }
    },
    diagnosticConclusion: "Infección crónica por VHB. Requiere estadificación y seguimiento oncológico.",
    pathophysiologicalRationale: "El hospedero no logró seroconvertir a Anti-HBs en el plazo de 6 meses. Los hepatocitos mantienen genoma viral integrado o episomal (ADNcc), generando daño hepático persistente, fibrosis y riesgo de hepatocarcinoma.",
    examPearl: "HBsAg (+) por más de 6 meses con IgM Anti-HBc (-) y Anti-HBc total (+) define cronicidad formal."
  },
  ventana: {
    id: "ventana",
    title: "Período de Ventana Serológica",
    badge: "Brecha Diagnóstica Crítica",
    description: "Intervalo temporal entre la desaparición del HBsAg y la detección de Anti-HBs libre.",
    markers: {
      hbsAg: { status: "negativo", valueDetail: "NEGATIVO: Ya cayó bajo el umbral de detección del ensayo" },
      hbeAg: { status: "negativo", valueDetail: "Negativo" },
      antiHbcIgm: { status: "positivo", valueDetail: "POSITIVO: ¡Único marcador serológico detectable en la brecha!" },
      antiHbcTotal: { status: "positivo", valueDetail: "Positivo" },
      antiHbs: { status: "negativo", valueDetail: "NEGATIVO: Los anticuerpos están complejados con HBsAg residual" },
      antiHbe: { status: "positivo", valueDetail: "Habitualmente positivo" },
      dnaVhb: { status: "no_habitual", valueDetail: "Bajo o intermitente por PCR ultrasensible" }
    },
    diagnosticConclusion: "Período de ventana en resolución de infección aguda reciente.",
    pathophysiologicalRationale: "El HBsAg ha sido aclarado por el sistema inmune, pero los anticuerpos Anti-HBs aún se encuentran formando inmunocomplejos circulantes solubles, impidiendo su medición libre. El único marcador que delata la infección aguda reciente es la IgM Anti-HBc.",
    examPearl: "En la ventana serológica, el ÚNICO marcador que diagnostica la infección aguda reciente es la IgM Anti-HBc."
  }
};

interface TestMetadata {
  id: MarkerKey;
  label: string;
  category: "antigeno" | "anticuerpo" | "adn";
  targetStructure: string;
  clinicalRole: string;
  schematicIcon: string;
}

const TESTS_CATALOG: Record<MarkerKey, TestMetadata> = {
  hbsAg: {
    id: "hbsAg",
    label: "HBsAg (Antígeno de Superficie)",
    category: "antigeno",
    targetStructure: "Proteína de la envoltura lipídica externa del virión",
    clinicalRole: "Primer marcador en aparecer en sangre. Indica presencia actual del virus (aguda o crónica).",
    schematicIcon: "Env"
  },
  hbeAg: {
    id: "hbeAg",
    label: "HBeAg (Antígeno 'e' soluble)",
    category: "antigeno",
    targetStructure: "Péptido secretado derivado de la región precore/core",
    clinicalRole: "Subrogado de replicación activa masiva y altísima transmisibilidad por fluidos.",
    schematicIcon: "Sec"
  },
  antiHbcIgm: {
    id: "antiHbcIgm",
    label: "IgM Anti-HBc (Anticuerpo Core IgM)",
    category: "anticuerpo",
    targetStructure: "Inmunoglobulina M dirigida contra la nucleocápside interna",
    clinicalRole: "Marcador de infección aguda reciente (<6 meses) o reactivación fulminante.",
    schematicIcon: "IgM"
  },
  antiHbcTotal: {
    id: "antiHbcTotal",
    label: "Anti-HBc Total (IgG + IgM)",
    category: "anticuerpo",
    targetStructure: "Anticuerpos totales contra la nucleocápside del virus",
    clinicalRole: "Cicatriz serológica indeleble. Indica que la persona tuvo contacto con el virus real.",
    schematicIcon: "IgG"
  },
  antiHbs: {
    id: "antiHbs",
    label: "Anti-HBs (Anticuerpo de Superficie)",
    category: "anticuerpo",
    targetStructure: "Anticuerpo neutralizante dirigido contra HBsAg",
    clinicalRole: "Indica inmunidad y protección (post-infección o post-vacunación si ≥10 mUI/mL).",
    schematicIcon: "Neut"
  },
  antiHbe: {
    id: "antiHbe",
    label: "Anti-HBe (Anticuerpo contra Ag e)",
    category: "anticuerpo",
    targetStructure: "Inmunoglobulina dirigida contra HBeAg",
    clinicalRole: "Seroconversión que sugiere disminución de la replicación activa viral.",
    schematicIcon: "Conv"
  },
  dnaVhb: {
    id: "dnaVhb",
    label: "ADN-VHB Cuantitativo (PCR)",
    category: "adn",
    targetStructure: "Genoma viral circular parcialmente bicatenario",
    clinicalRole: "Carga viral real en UI/mL. Guía el inicio y respuesta a terapia antiviral.",
    schematicIcon: "PCR"
  }
};

export const HepBMakers: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState<ScenarioKey>("vacunacion");
  const [inspectedTest, setInspectedTest] = useState<MarkerKey>("hbsAg");
  const [showDeepening, setShowDeepening] = useState<boolean>(false);
  const [comparisonTarget, setComparisonTarget] = useState<ScenarioKey | null>(null);

  const scenario = SCENARIOS[selectedScenario];
  const testInfo = TESTS_CATALOG[inspectedTest];
  const compareScenario = comparisonTarget ? SCENARIOS[comparisonTarget] : null;

  const handleReset = () => {
    setSelectedScenario("vacunacion");
    setInspectedTest("hbsAg");
    setComparisonTarget(null);
    setShowDeepening(false);
  };

  return (
    <GlassCard className="p-4 sm:p-7 rounded-3xl border border-amber-500/30 bg-slate-950/90 shadow-2xl space-y-6">
      
      {/* 1. Cabecera y Pregunta Didáctica */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[11px] font-bold border border-amber-500/30">
              HEP-06 · Gradilla de laboratorio serológico
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              CAT-20 · Pág. 13
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Panel de Marcadores Serológicos y Moleculares de Hepatitis B
          </h3>
          <p className="text-xs text-slate-300 max-w-2xl">
            <strong>Pregunta central:</strong> ¿Cómo distinguir con certeza una persona vacunada de una curada, una infección aguda de una crónica, o identificar el período de ventana?
          </p>
        </div>

        <button
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-white/10 transition-colors self-start shrink-0 min-h-[44px]"
          aria-label="Restablecer laboratorio de marcadores"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restablecer</span>
        </button>
      </div>

      {/* Selector de Escenarios Clínicos Canónicos de Cátedra */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
            1. Selecciona un perfil clínico para cargar en la gradilla de reactivos:
          </span>
          <span className="text-[11px] text-amber-300 font-mono hidden sm:inline">
            {scenario.badge}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {(["vacunacion", "infeccion_resuelta", "aguda", "cronica", "ventana"] as const).map((sKey) => {
            const isSelected = selectedScenario === sKey;
            const item = SCENARIOS[sKey];
            return (
              <button
                key={sKey}
                onClick={() => {
                  setSelectedScenario(sKey);
                  setComparisonTarget(null);
                }}
                aria-pressed={isSelected}
                className={`p-3 rounded-2xl text-left border transition-all min-h-[58px] flex flex-col justify-between ${
                  isSelected
                    ? "bg-amber-500/20 border-amber-400 text-white shadow-lg shadow-amber-950/40 ring-1 ring-amber-400/40"
                    : "bg-slate-900/60 hover:bg-slate-900 text-slate-300 border-white/5"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono uppercase ${isSelected ? "text-amber-300 font-bold" : "text-slate-400"}`}>
                    {sKey === "vacunacion" ? "Vacuna" : sKey === "infeccion_resuelta" ? "Curada" : sKey === "aguda" ? "Aguda" : sKey === "cronica" ? "Crónica" : "Ventana"}
                  </span>
                  {isSelected && <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />}
                </div>
                <span className="text-xs font-bold leading-tight mt-0.5">
                  {item.title}
                </span>
                <span className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                  {sKey === "ventana" ? "Brecha diagnóstica" : item.badge.split(" ")[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2 & 3. Gradilla Visual de Laboratorio (Antígenos, Anticuerpos y Genoma) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-white/10 space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs sm:text-sm font-bold text-white">
              Gradilla de Pruebas: {scenario.title}
            </h4>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            Toca cualquier reactivo para inspeccionar su estructura y significado biológico
          </span>
        </div>

        {/* 3 Bloques de la Gradilla */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          
          {/* BLOQUE A: ANTÍGENOS */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-red-500/20 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-400" />
                <span>Antígenos Virales</span>
              </span>
              <span className="text-[9px] font-mono text-slate-500">Virus Presente</span>
            </div>

            <div className="space-y-2">
              {(["hbsAg", "hbeAg"] as const).map((mKey) => {
                const mark = scenario.markers[mKey];
                const meta = TESTS_CATALOG[mKey];
                const isSelected = inspectedTest === mKey;
                const isPositive = mark.status === "positivo";
                return (
                  <button
                    key={mKey}
                    onClick={() => setInspectedTest(mKey)}
                    aria-pressed={isSelected}
                    className={`w-full p-2.5 rounded-xl border text-left transition-all min-h-[44px] flex items-center justify-between gap-2 ${
                      isSelected
                        ? "bg-red-500/20 border-red-400 ring-1 ring-red-400/40"
                        : "bg-slate-900/60 hover:bg-slate-900 border-white/5 text-slate-300"
                    }`}
                  >
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-white block">{meta.label.split(" (")[0]}</span>
                      <span className="text-[10px] text-slate-400">{meta.targetStructure.split(" ")[0]} {meta.targetStructure.split(" ")[1]}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        isPositive 
                          ? "bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse" 
                          : "bg-slate-800 text-slate-500"
                      }`}>
                        {isPositive ? "REACTIVO (+)" : "NO REACTIVO (-)"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* BLOQUE B: ANTICUERPOS */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-emerald-500/20 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Anticuerpos del Huésped</span>
              </span>
              <span className="text-[9px] font-mono text-slate-500">Respuesta Inmune</span>
            </div>

            <div className="space-y-2">
              {(["antiHbcIgm", "antiHbcTotal", "antiHbs", "antiHbe"] as const).map((mKey) => {
                const mark = scenario.markers[mKey];
                const meta = TESTS_CATALOG[mKey];
                const isSelected = inspectedTest === mKey;
                const isPositive = mark.status === "positivo";
                return (
                  <button
                    key={mKey}
                    onClick={() => setInspectedTest(mKey)}
                    aria-pressed={isSelected}
                    className={`w-full p-2.5 rounded-xl border text-left transition-all min-h-[44px] flex items-center justify-between gap-2 ${
                      isSelected
                        ? "bg-emerald-500/20 border-emerald-400 ring-1 ring-emerald-400/40"
                        : "bg-slate-900/60 hover:bg-slate-900 border-white/5 text-slate-300"
                    }`}
                  >
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-white block">{meta.label.split(" (")[0]}</span>
                      <span className="text-[10px] text-slate-400">{meta.targetStructure.split(" ")[0]} {meta.targetStructure.split(" ")[1]}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        isPositive 
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" 
                          : "bg-slate-800 text-slate-500"
                      }`}>
                        {isPositive ? "POSITIVO (+)" : "NEGATIVO (-)"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* BLOQUE C: GENOMA VIRAL (ADN) */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-sky-500/20 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-400" />
                <span>Genoma Viral (Biología Molecular)</span>
              </span>
              <span className="text-[9px] font-mono text-slate-500">Carga Viral</span>
            </div>

            <div className="space-y-2">
              {(["dnaVhb"] as const).map((mKey) => {
                const mark = scenario.markers[mKey];
                const meta = TESTS_CATALOG[mKey];
                const isSelected = inspectedTest === mKey;
                const isPositive = mark.status === "positivo";
                return (
                  <button
                    key={mKey}
                    onClick={() => setInspectedTest(mKey)}
                    aria-pressed={isSelected}
                    className={`w-full p-2.5 rounded-xl border text-left transition-all min-h-[44px] flex items-center justify-between gap-2 ${
                      isSelected
                        ? "bg-sky-500/20 border-sky-400 ring-1 ring-sky-400/40"
                        : "bg-slate-900/60 hover:bg-slate-900 border-white/5 text-slate-300"
                    }`}
                  >
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-white block">{meta.label.split(" (")[0]}</span>
                      <span className="text-[10px] text-slate-400">PCR Cuantitativa en tiempo real</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        isPositive 
                          ? "bg-sky-500/20 text-sky-300 border border-sky-500/40" 
                          : "bg-slate-800 text-slate-500"
                      }`}>
                        {isPositive ? "DETECTABLE (+)" : "INDETECTABLE"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 text-[11px] text-slate-300 space-y-1">
              <span className="font-bold text-sky-300 block">Esquema del Virión de Dane:</span>
              <p className="text-[10px] text-slate-400">
                HBsAg reviste la envoltura externa; HBcAg forma la cápside icosaédrica interna (no circula libre); HBeAg se secreta al plasma; y el ADN circular bicatenario reside en el núcleo.
              </p>
            </div>
          </div>

        </div>

        {/* Detalle del Marcador Seleccionado (Inspección focal) */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono text-amber-300 uppercase font-bold">
              Inspección de reactivo: {testInfo.label}
            </span>
            <p className="text-slate-200">
              <strong className="text-white">Estructura diana:</strong> {testInfo.targetStructure} · <strong className="text-white">Rol:</strong> {testInfo.clinicalRole}
            </p>
          </div>
          <span className="text-[11px] text-slate-400 font-mono shrink-0">
            En este paciente: <strong className="text-white">{scenario.markers[inspectedTest].valueDetail}</strong>
          </span>
        </div>

      </div>

      {/* 4. Interpretación Clínica y Base Fisiopatológica */}
      <div className="p-4 sm:p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-3">
        <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
          <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Diagnóstico Serológico Concluyente:</span>
          </h4>
          <span className="text-[11px] text-amber-300 font-bold font-mono">
            {scenario.diagnosticConclusion}
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          {scenario.pathophysiologicalRationale}
        </p>

        {/* Perla de Cátedra */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-white/5 text-xs text-amber-200 flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <strong className="text-white block">Perla de Certamen:</strong>
            <p className="text-[11px] text-slate-300">{scenario.examPearl}</p>
          </div>
        </div>
      </div>

      {/* 5. Comparar Patrones Clave */}
      <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5 space-y-2 text-xs">
        <span className="font-bold text-white text-[11px] block">
          Comparar este patrón con otro escenario del certamen:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {(["vacunacion", "infeccion_resuelta", "aguda", "cronica", "ventana"] as const).map((sTarget) => {
            if (sTarget === selectedScenario) return null;
            const scInfo = SCENARIOS[sTarget];
            return (
              <button
                key={sTarget}
                onClick={() => setComparisonTarget(comparisonTarget === sTarget ? null : sTarget)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all border min-h-[38px] ${
                  comparisonTarget === sTarget
                    ? "bg-amber-500 text-slate-950 border-amber-400"
                    : "bg-slate-900/80 text-slate-300 border-white/5 hover:text-white"
                }`}
              >
                vs {scInfo.title}
              </button>
            );
          })}
        </div>

        {compareScenario && (
          <div className="p-3 rounded-xl bg-slate-950/90 border border-amber-400/30 text-[11px] text-slate-300 space-y-2 mt-2">
            <strong className="text-amber-300 block">Diferencia Crítica de Laboratorio:</strong>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="p-2 rounded-lg bg-slate-900/80">
                <span className="font-bold text-white block">{scenario.title}:</span>
                <p>{scenario.examPearl}</p>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/80">
                <span className="font-bold text-white block">{compareScenario.title}:</span>
                <p>{compareScenario.examPearl}</p>
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
            <span>Profundizar: Umbral Protector Anti-HBs (≥10 mUI/mL) y Mutantes Precore HBeAg (-)</span>
          </span>
          {showDeepening ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showDeepening && (
          <div className="p-4 border-t border-white/5 bg-slate-950/60 space-y-3 text-xs text-slate-300">
            <div className="space-y-1">
              <strong className="text-amber-300">1. Umbral protector de Anti-HBs:</strong>
              <p className="text-[11px] leading-relaxed text-slate-400">
                Se considera que un título de <strong>Anti-HBs ≥ 10 mUI/mL</strong> medido tras 1 a 2 meses de la serie vacunal completa confiere inmunoprotección esterilizante a largo plazo. Incluso si con los años el título cae bajo 10 mUI/mL, la memoria inmunológica de linfocitos B y T protege contra hepatitis sintomática o crónica.
              </p>
            </div>
            <div className="space-y-1">
              <strong className="text-amber-300">2. Mutantes Precore (HBeAg negativo con replicación activa):</strong>
              <p className="text-[11px] leading-relaxed text-slate-400">
                Ciertas variantes genéticas de VHB presentan una mutación puntual en la región precore (ej. G1896A) que impide la síntesis del antígeno e soluble (HBeAg negativo), pero el virus se replica activamente con ADN-VHB elevado y transaminasas alteradas. Por eso, en hepatitis crónica la carga viral de ADN-VHB es obligatoria y no basta el HBeAg para descartar actividad.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="text-[10px] text-slate-500 font-mono text-center">
        * Representaciones moleculares, tubos de ensayo y gradillas esquemáticas con fines estrictamente didácticos.
      </div>

    </GlassCard>
  );
};
