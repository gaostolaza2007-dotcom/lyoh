"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  RotateCcw, 
  Eye, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Activity,
  Layers,
  Thermometer,
  Info
} from "lucide-react";

type PhaseId = "incubacion" | "prodromo" | "ictericia" | "convalecencia";
type HotspotId = "escleras" | "piel" | "higado" | "orina" | "heces" | "sistemico";

interface PhaseConfig {
  id: PhaseId;
  name: string;
  shortTitle: string;
  stageBadge: string;
  timeContext: string;
  summary: string;
  transaminases: string;
  bilirubin: string;
  hotspots: Record<HotspotId, {
    title: string;
    status: string;
    detail: string;
    severity: "normal" | "mild" | "high" | "severe";
  }>;
}

const PHASES_CONFIG: Record<PhaseId, PhaseConfig> = {
  incubacion: {
    id: "incubacion",
    name: "Período de Incubación",
    shortTitle: "Incubación",
    stageBadge: "Fase 1 · Replicación Silente",
    timeContext: "15 a 180 días (según el agente viral específico)",
    summary: "El virus penetra y replica en los hepatocitos. No hay síntomas ni signos físicos reconocibles en el examen.",
    transaminases: "Valores basales normales; inician ascenso leve solo al final del período.",
    bilirubin: "Bilirrubina total normal (<1.0 mg/dL).",
    hotspots: {
      escleras: {
        title: "Escleras y Conjuntivas",
        status: "Normales (blancas)",
        detail: "Sin depósito de bilirrubina. La concentración sérica no supera el umbral de detección clínica.",
        severity: "normal"
      },
      piel: {
        title: "Tegumentos y Piel",
        status: "Tono habitual sin tinción",
        detail: "Pigmentación cutánea completamente conservada, sin prurito.",
        severity: "normal"
      },
      higado: {
        title: "Hígado e Hipocondrio Derecho",
        status: "Borde hepático normal y no doloroso",
        detail: "No hay hepatomegalia. La cápsula de Glisson no está bajo tensión inflamatoria.",
        severity: "normal"
      },
      orina: {
        title: "Muestra de Orina",
        status: "Ámbar claro / amarillo normal",
        detail: "Urobilinógeno fisiológico, sin presencia de bilirrubina conjugada hidrosoluble.",
        severity: "normal"
      },
      heces: {
        title: "Muestra de Deposiciones",
        status: "Color marrón normal",
        detail: "Pigmentación normal por estercobilina sintetizada por microbiota a partir de bilis normal.",
        severity: "normal"
      },
      sistemico: {
        title: "Estado General",
        status: "Asintomático",
        detail: "El paciente desarrolla su vida cotidiana normal sin sospechar la infección activa.",
        severity: "normal"
      }
    }
  },
  prodromo: {
    id: "prodromo",
    name: "Fase Prodrómica (Preictérica)",
    shortTitle: "Prodrómica",
    stageBadge: "Fase 2 · Inicio de Lisis Hepatocelular",
    timeContext: "3 a 10 días previos a la aparición de ictericia",
    summary: "Comienza la respuesta inmune contra hepatocitos infectados. Síntomas inespecíficos gastrointestinales y astenia intensa.",
    transaminases: "Elevación exponencial y masiva (ALT > AST, alcanzando 500 a >2.000 U/L).",
    bilirubin: "Bilirrubina normal o alza sutil (<2.0 mg/dL), todavía sin manifestación escleral.",
    hotspots: {
      escleras: {
        title: "Escleras y Conjuntivas",
        status: "Sin ictericia evidente aún",
        detail: "Pueden tener leve brillo o inyección conjuntival inespecífica, pero sin tinción amarillenta francamente visible.",
        severity: "normal"
      },
      piel: {
        title: "Tegumentos y Piel",
        status: "Palidez leve por malestar",
        detail: "Piel sudorosa o febril, sin tinción ictérica ni lesiones primarias.",
        severity: "mild"
      },
      higado: {
        title: "Hígado e Hipocondrio Derecho",
        status: "Sensibilidad y molestia sorda",
        detail: "Comienza la tumefacción celular; el paciente relata pesadez en hipocondrio derecho exacerbada al inclinarse.",
        severity: "mild"
      },
      orina: {
        title: "Muestra de Orina",
        status: "Comienza a oscurecerse (pre-coluria)",
        detail: "La bilirrubina conjugada empieza a filtrarse por el glomérulo al final de esta fase, anticipando la ictericia.",
        severity: "mild"
      },
      heces: {
        title: "Muestra de Deposiciones",
        status: "Marrón o marrón claro",
        detail: "Aún llega flujo de bilis al duodeno; no se ha consolidado la colestasis intrahepática total.",
        severity: "normal"
      },
      sistemico: {
        title: "Estado General",
        status: "Astenia, anorexia y náuseas",
        detail: "Marcada aversión a comidas grasas y al tabaco; fatiga desproporcionada con febrícula.",
        severity: "high"
      }
    }
  },
  ictericia: {
    id: "ictericia",
    name: "Fase de Estado (Ictérica)",
    shortTitle: "Ictérica (Estado)",
    stageBadge: "Fase 3 · Colestasis y Acúmulo de Bilirrubina",
    timeContext: "1 a 4 semanas (curso clínico prototípico)",
    summary: "Máxima manifestación de la necrosis e inflamación canalicular. La colestasis intrahepática desvía la bilirrubina conjugada.",
    transaminases: "Pico máximo ya alcanzado; inician meseta o descenso gradual.",
    bilirubin: "Bilirrubina total elevada (>3.0 a 15 mg/dL) con claro predominio directo (conjugado).",
    hotspots: {
      escleras: {
        title: "Escleras y Conjuntivas",
        status: "Ictericia escleral franca (amarillo intenso)",
        detail: "La elastina de la esclera tiene alta afinidad por la bilirrubina, siendo el primer sitio corporal en teñirse cuando la bilirrubina sérica supera 2.5–3.0 mg/dL.",
        severity: "severe"
      },
      piel: {
        title: "Tegumentos y Piel",
        status: "Tinción amarillo-dorada generalizada y prurito",
        detail: "El depósito cutáneo de bilirrubina y el acúmulo de sales biliares en dermis provocan prurito rebelde, especialmente nocturno.",
        severity: "severe"
      },
      higado: {
        title: "Hígado e Hipocondrio Derecho",
        status: "Hepatomegalia palpable y dolorosa",
        detail: "El hígado desciende 2 a 3 cm bajo el reborde costal. La distensión de la cápsula de Glisson genera dolor exquisito a la palpación.",
        severity: "severe"
      },
      orina: {
        title: "Muestra de Orina",
        status: "Coluria marcada (color té o coca-cola)",
        detail: "La bilirrubina conjugada es hidrosoluble y se filtra por el glomérulo renal; al agitar la orina se produce espuma amarillenta característica.",
        severity: "severe"
      },
      heces: {
        title: "Muestra de Deposiciones",
        status: "Acolia o hipocolia (deposiciones color masilla / arcilla)",
        detail: "La colestasis canalicular impide que la bilis llegue a la luz del intestino; al no haber bilirrubina en el colon, no se genera estercobilina marrón.",
        severity: "severe"
      },
      sistemico: {
        title: "Estado General",
        status: "Mejoría paradójica del apetito",
        detail: "Frecuentemente, al aparecer la ictericia franca, disminuyen las náuseas y la fiebre prodrómica, persistiendo solo la astenia.",
        severity: "mild"
      }
    }
  },
  convalecencia: {
    id: "convalecencia",
    name: "Fase de Convalecencia (Resolución)",
    shortTitle: "Convalecencia",
    stageBadge: "Fase 4 · Regeneración y Seroconversión",
    timeContext: "2 a 12 semanas",
    summary: "El sistema inmune controla la replicación. Los hepatocitos proliferan y se restablece la arquitectura canalicular.",
    transaminases: "Descenso sostenido hacia la normalización total.",
    bilirubin: "Aclaramiento progresivo de la bilirrubina hasta valores basales.",
    hotspots: {
      escleras: {
        title: "Escleras y Conjuntivas",
        status: "Aclaramiento gradual (vuelven a blanco)",
        detail: "La ictericia escleral es el último signo clínico en desaparecer por la lenta liberación de la bilirrubina unida a la elastina.",
        severity: "mild"
      },
      piel: {
        title: "Tegumentos y Piel",
        status: "Tono normal recuperado",
        detail: "Cese del prurito cutáneo al normalizarse los niveles de sales biliares circulantes.",
        severity: "normal"
      },
      higado: {
        title: "Hígado e Hipocondrio Derecho",
        status: "Retorno a tamaño fisiológico",
        detail: "Desaparición del dolor; borde hepático liso, blando y atraumático.",
        severity: "normal"
      },
      orina: {
        title: "Muestra de Orina",
        status: "Color claro normal recuperado",
        detail: "Negativización de la bilirrubinuria; filtración glomerular limpia.",
        severity: "normal"
      },
      heces: {
        title: "Muestra de Deposiciones",
        status: "Color marrón fisiológico restaurado",
        detail: "Flujo biliar restablecido normalmente hacia el duodeno; síntesis plena de estercobilina.",
        severity: "normal"
      },
      sistemico: {
        title: "Estado General",
        status: "Recuperación de energía y peso",
        detail: "Astenia residual leve en algunos pacientes; desarrollo de anticuerpos protectores de memoria.",
        severity: "normal"
      }
    }
  }
};

export const HepAcutePhases: React.FC = () => {
  const [selectedPhase, setSelectedPhase] = useState<PhaseId>("ictericia");
  const [isAnicteric, setIsAnicteric] = useState<boolean>(false);
  const [activeHotspot, setActiveHotspot] = useState<HotspotId>("escleras");
  const [showDeepening, setShowDeepening] = useState<boolean>(false);
  const [comparisonTarget, setComparisonTarget] = useState<PhaseId | null>(null);

  const current = PHASES_CONFIG[selectedPhase];
  const comparePhase = comparisonTarget ? PHASES_CONFIG[comparisonTarget] : null;

  // Modificaciones dinámicas si se elige curso anictérico
  const getActiveSpot = (spotKey: HotspotId) => {
    const spot = current.hotspots[spotKey];
    if (isAnicteric && selectedPhase === "ictericia") {
      if (spotKey === "escleras") {
        return {
          title: "Escleras (Curso Anictérico)",
          status: "Sin ictericia visible",
          detail: "A pesar de la necrosis hepatocelular activa (transaminasas muy elevadas), la bilirrubina sérica no supera los 2.0 mg/dL, por lo que las escleras permanecen blancas.",
          severity: "mild" as const
        };
      }
      if (spotKey === "piel") {
        return {
          title: "Piel (Curso Anictérico)",
          status: "Coloración normal sin ictericia",
          detail: "No hay tinción amarillenta ni prurito marcado. La infección suele diagnosticarse solo por pesquisa serológica o enzimas alteradas en un control.",
          severity: "normal" as const
        };
      }
      if (spotKey === "orina") {
        return {
          title: "Orina (Curso Anictérico)",
          status: "Orina ámbar claro habitual",
          detail: "Al no haber hiperbilirrubinemia directa significativa, no se excreta bilirrubina conjugada por el riñón (sin coluria franca).",
          severity: "normal" as const
        };
      }
      if (spotKey === "heces") {
        return {
          title: "Deposiciones (Curso Anictérico)",
          status: "Color marrón normal",
          detail: "El flujo biliar no sufre interrupción canalicular completa; la estercobilina fecal se mantiene dentro de rangos normales.",
          severity: "normal" as const
        };
      }
    }
    return spot;
  };

  const activeSpotData = getActiveSpot(activeHotspot);

  const handleReset = () => {
    setSelectedPhase("ictericia");
    setIsAnicteric(false);
    setActiveHotspot("escleras");
    setShowDeepening(false);
    setComparisonTarget(null);
  };

  // Colores visuales dinámicos del cuerpo según fase y curso
  const isJaundicedVisually = selectedPhase === "ictericia" && !isAnicteric;
  const isResolvingVisually = selectedPhase === "convalecencia";

  const scleraFill = isJaundicedVisually ? "#fbbf24" : isResolvingVisually ? "#fef08a" : "#ffffff";
  const skinFill = isJaundicedVisually ? "#d97706" : isResolvingVisually ? "#fed7aa" : "#fdba74";
  const liverFill = selectedPhase === "ictericia" ? "#b91c1c" : selectedPhase === "prodromo" ? "#dc2626" : "#991b1b";
  const urineFill = (selectedPhase === "ictericia" && !isAnicteric) ? "#78350f" : selectedPhase === "prodromo" ? "#d97706" : "#facc15";
  const stoolFill = (selectedPhase === "ictericia" && !isAnicteric) ? "#e2e8f0" : "#78350f";

  return (
    <GlassCard className="p-4 sm:p-7 rounded-3xl border border-amber-500/30 bg-slate-950/90 shadow-2xl space-y-6">
      
      {/* 1. Cabecera y Objetivo Breve */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[11px] font-bold border border-amber-500/30">
              HEP-02 · Explorador visual corporal
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              CAT-20 · Pág. 4
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Evolución Clínica de la Hepatitis Aguda en el Paciente
          </h3>
          <p className="text-xs text-slate-300 max-w-2xl">
            <strong>Pregunta central:</strong> ¿Qué signos observables cambian a lo largo de la infección y por qué esta semiología es compartida por todos los virus hepatotrópicos?
          </p>
        </div>

        <button
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-white/10 transition-colors self-start shrink-0 min-h-[44px]"
          aria-label="Restablecer exploración corporal"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restablecer</span>
        </button>
      </div>

      {/* Selector de Curso de Presentación */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 text-xs">
        <div className="flex items-center gap-2.5">
          <Activity className="w-4 h-4 text-amber-400 shrink-0" />
          <div>
            <span className="font-bold text-white block">Forma de Presentación Clínica:</span>
            <span className="text-slate-400 text-[11px]">
              {isAnicteric 
                ? "Curso Anictérico: Frecuente en lactantes, niños y en hepatitis C aguda (daño hepático sin ictericia visible)."
                : "Curso Ictérico Clásico: Modelo docente con ictericia esclero-cutánea franca, coluria y acolia."}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0">
          <button
            onClick={() => setIsAnicteric(false)}
            aria-pressed={!isAnicteric}
            className={`flex-1 sm:flex-none px-3 py-2 rounded-xl text-xs font-bold transition-all min-h-[44px] flex items-center justify-center gap-1.5 ${
              !isAnicteric 
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-950/40" 
                : "bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-white/5"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Ictérico Típico</span>
          </button>
          <button
            onClick={() => setIsAnicteric(true)}
            aria-pressed={isAnicteric}
            className={`flex-1 sm:flex-none px-3 py-2 rounded-xl text-xs font-bold transition-all min-h-[44px] flex items-center justify-center gap-1.5 ${
              isAnicteric 
                ? "bg-purple-600 text-white shadow-md shadow-purple-950/40 border border-purple-400" 
                : "bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-white/5"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Anictérico (Subclínico)</span>
          </button>
        </div>
      </div>

      {/* Selector de Fases Clínicas */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
            1. Selecciona la fase temporal a explorar en el cuerpo del paciente:
          </span>
          <span className="text-[11px] text-amber-300 font-mono hidden sm:inline">
            {current.stageBadge}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(["incubacion", "prodromo", "ictericia", "convalecencia"] as const).map((phaseId) => {
            const isSelected = selectedPhase === phaseId;
            const p = PHASES_CONFIG[phaseId];
            return (
              <button
                key={phaseId}
                onClick={() => {
                  setSelectedPhase(phaseId);
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
                    {phaseId === "incubacion" ? "Fase 1" : phaseId === "prodromo" ? "Fase 2" : phaseId === "ictericia" ? "Fase 3" : "Fase 4"}
                  </span>
                  {isSelected && <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />}
                </div>
                <span className="text-xs font-bold leading-tight mt-0.5">
                  {p.shortTitle}
                </span>
                <span className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                  {p.timeContext.split(" (")[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2 & 3. Escena Visual Protagonista y Puntos de Acción */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Panel del Modelo Corporal SVG (7 columnas en desktop) */}
        <div className="lg:col-span-7 p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-white/10 space-y-3">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span>Vista Frontal Esquemática del Paciente</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Toca cada punto corporal para inspeccionar
            </span>
          </div>

          {/* SVG Corporal Interactivo */}
          <div className="relative flex justify-center items-center py-2 bg-gradient-to-b from-slate-950 via-slate-900/60 to-slate-950 rounded-xl border border-white/5 overflow-hidden">
            <svg
              viewBox="0 0 340 370"
              className="w-full max-w-[340px] h-auto select-none"
              role="img"
              aria-label="Silueta anatómica esquemática que cambia según la fase de hepatitis y curso"
            >
              <defs>
                <filter id="glow-amber" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <radialGradient id="liverGrad" cx="40%" cy="40%" r="60%">
                  <stop offset="0%" stopColor="#f87171" />
                  <stop offset="100%" stopColor={liverFill} />
                </radialGradient>
              </defs>

              {/* Silueta Corporal Central */}
              {/* Cabeza y cuello */}
              <ellipse cx="170" cy="55" rx="38" ry="44" fill={skinFill} stroke="#475569" strokeWidth="2" />
              <rect x="156" y="94" width="28" height="22" fill={skinFill} stroke="#475569" strokeWidth="1" />

              {/* Cabello esquemático */}
              <path d="M 132 50 C 132 20, 208 20, 208 50 C 195 32, 145 32, 132 50 Z" fill="#334155" />

              {/* Ojos y Escleras Reactivas */}
              <g 
                onClick={() => setActiveHotspot("escleras")}
                className="cursor-pointer group"
                tabIndex={0}
                role="button"
                aria-label="Inspeccionar escleras"
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setActiveHotspot("escleras"); }}
              >
                {/* Ojo Derecho del paciente (izquierda del visor) */}
                <ellipse cx="152" cy="54" rx="10" ry="6" fill={scleraFill} stroke="#1e293b" strokeWidth="1.5" />
                <circle cx="152" cy="54" r="3.5" fill="#1e293b" />
                {/* Ojo Izquierdo del paciente (derecha del visor) */}
                <ellipse cx="188" cy="54" rx="10" ry="6" fill={scleraFill} stroke="#1e293b" strokeWidth="1.5" />
                <circle cx="188" cy="54" r="3.5" fill="#1e293b" />

                {/* Hotspot Escleras */}
                <circle cx="170" cy="40" r="11" fill="none" stroke={activeHotspot === "escleras" ? "#f59e0b" : "#94a3b8"} strokeWidth="2" strokeDasharray="3 3" />
                <circle cx="170" cy="40" r="4" fill={activeHotspot === "escleras" ? "#f59e0b" : "#cbd5e1"} />
              </g>

              {/* Boca y Nariz sutiles */}
              <line x1="170" y1="56" x2="170" y2="64" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="162" y1="74" x2="178" y2="74" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />

              {/* Torso y Hombros */}
              <path
                d="M 156 112 L 105 130 C 85 137, 75 160, 80 185 L 90 250 C 92 260, 102 268, 114 268 L 226 268 C 238 268, 248 260, 250 250 L 260 185 C 265 160, 255 137, 235 130 L 184 112 Z"
                fill={skinFill}
                stroke="#475569"
                strokeWidth="2"
              />

              {/* Clavículas y Esternón esquemáticos */}
              <path d="M 120 135 Q 170 148 220 135" fill="none" stroke="#64748b" strokeWidth="1.5" opacity="0.6" />
              <line x1="170" y1="144" x2="170" y2="185" stroke="#64748b" strokeWidth="1.5" opacity="0.5" />

              {/* Reborde Costal */}
              <path d="M 125 195 Q 170 178 215 195" fill="none" stroke="#64748b" strokeWidth="1.5" strokeDasharray="2 2" opacity="0.7" />

              {/* Hígado en Hipocondrio Derecho (lado anatómico derecho = izquierda de la pantalla) */}
              <g 
                onClick={() => setActiveHotspot("higado")}
                className="cursor-pointer group"
                tabIndex={0}
                role="button"
                aria-label="Inspeccionar hígado en hipocondrio derecho"
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setActiveHotspot("higado"); }}
              >
                <path
                  d={selectedPhase === "ictericia" 
                    ? "M 116 172 C 145 168, 168 178, 172 195 C 172 216, 142 225, 112 218 C 102 205, 104 185, 116 172 Z"
                    : "M 122 176 C 145 174, 162 180, 166 193 C 166 208, 142 214, 118 210 C 110 200, 112 186, 122 176 Z"
                  }
                  fill="url(#liverGrad)"
                  stroke={activeHotspot === "higado" ? "#f59e0b" : "#ef4444"}
                  strokeWidth={activeHotspot === "higado" ? "3" : "1.5"}
                  className="transition-all duration-300"
                />
                {/* Hotspot Hígado */}
                <circle cx="140" cy="195" r="9" fill={activeHotspot === "higado" ? "#f59e0b" : "#ef4444"} opacity="0.9" />
                <text x="140" y="198" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">H</text>
              </g>

              {/* Tubos de Muestra: Orina y Deposiciones (Abajo) */}
              {/* Tubo de Orina */}
              <g 
                onClick={() => setActiveHotspot("orina")}
                className="cursor-pointer group"
                tabIndex={0}
                role="button"
                aria-label="Inspeccionar muestra de orina"
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setActiveHotspot("orina"); }}
              >
                {/* Tubo de ensayo */}
                <rect x="70" y="285" width="34" height="65" rx="8" fill="#0f172a" stroke={activeHotspot === "orina" ? "#f59e0b" : "#475569"} strokeWidth={activeHotspot === "orina" ? "2.5" : "1.5"} />
                {/* Líquido orina */}
                <path d={`M 72 315 L 72 342 C 72 347, 102 347, 102 342 L 102 315 Z`} fill={urineFill} opacity="0.85" />
                <line x1="70" y1="315" x2="104" y2="315" stroke="#f59e0b" strokeWidth="1" strokeDasharray="1 1" />
                <text x="87" y="362" fill="#94a3b8" fontSize="9" fontWeight="bold" textAnchor="middle">ORINA</text>
              </g>

              {/* Frasco de Deposiciones */}
              <g 
                onClick={() => setActiveHotspot("heces")}
                className="cursor-pointer group"
                tabIndex={0}
                role="button"
                aria-label="Inspeccionar muestra de heces"
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setActiveHotspot("heces"); }}
              >
                {/* Recipiente heces */}
                <rect x="236" y="285" width="44" height="65" rx="6" fill="#0f172a" stroke={activeHotspot === "heces" ? "#f59e0b" : "#475569"} strokeWidth={activeHotspot === "heces" ? "2.5" : "1.5"} />
                <rect x="240" y="280" width="36" height="7" rx="2" fill="#334155" />
                {/* Muestra interior */}
                <ellipse cx="258" cy="326" rx="15" ry="12" fill={stoolFill} />
                <text x="258" y="362" fill="#94a3b8" fontSize="9" fontWeight="bold" textAnchor="middle">HECES</text>
              </g>

              {/* Indicadores de Orientación */}
              <text x="50" y="160" fill="#64748b" fontSize="10" fontWeight="bold">LADO DERECHO</text>
              <text x="50" y="172" fill="#475569" fontSize="9">(del paciente)</text>
              <text x="230" y="160" fill="#64748b" fontSize="10" fontWeight="bold">LADO IZQUIERDO</text>
              <text x="230" y="172" fill="#475569" fontSize="9">(del paciente)</text>
            </svg>
          </div>

          {/* Accesos rápidos a los puntos anatómicos */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
            {(["escleras", "piel", "higado", "orina", "heces", "sistemico"] as const).map((sKey) => {
              const isSelected = activeHotspot === sKey;
              const sp = getActiveSpot(sKey);
              return (
                <button
                  key={sKey}
                  onClick={() => setActiveHotspot(sKey)}
                  aria-pressed={isSelected}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all min-h-[38px] flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-amber-500 text-slate-950 font-extrabold shadow-sm"
                      : "bg-slate-800 text-slate-300 hover:text-white border border-white/5"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    sp.severity === "severe" ? "bg-red-400" : sp.severity === "high" ? "bg-amber-400" : "bg-emerald-400"
                  }`} />
                  <span className="capitalize">{sKey}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Panel Lateral: 4. Explicación de lo Observado y Bioquímica (5 columnas en desktop) */}
        <div className="lg:col-span-5 space-y-3.5">
          
          {/* Tarjeta del Punto Activo */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/30 space-y-2.5 shadow-lg">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-[11px] font-mono uppercase text-amber-300 font-bold">
                Punto observado en el paciente:
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                activeSpotData.severity === "severe" 
                  ? "bg-red-500/20 text-red-300 border border-red-500/30"
                  : activeSpotData.severity === "high"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : activeSpotData.severity === "mild"
                  ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                  : "bg-slate-700/40 text-slate-300"
              }`}>
                {activeSpotData.severity}
              </span>
            </div>

            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span>{activeSpotData.title}</span>
            </h4>

            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-white/5 space-y-1">
              <span className="text-[11px] font-bold text-amber-300 block">Signo actual:</span>
              <p className="text-xs text-white font-medium">
                {activeSpotData.status}
              </p>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {activeSpotData.detail}
            </p>
          </div>

          {/* Estado de Transaminasas y Bilirrubina en esta fase */}
          <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-white/5 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Activity className="w-3.5 h-3.5 text-sky-400" />
              <strong className="text-white text-[11px] uppercase tracking-wide">Perfil de Laboratorio en esta Fase:</strong>
            </div>
            <div className="space-y-1 text-slate-300 text-[11px] pl-1">
              <p><strong className="text-sky-300">Transaminasas (ALT/AST):</strong> {current.transaminases}</p>
              <p><strong className="text-amber-300">Bilirrubina sérica:</strong> {isAnicteric && selectedPhase === "ictericia" ? "Aumento leve (<2.0 mg/dL), no alcanza umbral de tinción escleral." : current.bilirubin}</p>
            </div>
          </div>

          {/* 5. Comparar Fases */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2 text-xs">
            <span className="font-bold text-white text-[11px] block">
              Comparar con otra fase en esta misma persona:
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {(["prodromo", "ictericia", "convalecencia"] as const).map((pTarget) => {
                if (pTarget === selectedPhase) return null;
                const pInfo = PHASES_CONFIG[pTarget];
                return (
                  <button
                    key={pTarget}
                    onClick={() => setComparisonTarget(comparisonTarget === pTarget ? null : pTarget)}
                    className={`p-2 rounded-xl text-[10px] font-bold transition-all border ${
                      comparisonTarget === pTarget
                        ? "bg-amber-500 text-slate-950 border-amber-400"
                        : "bg-slate-900/80 text-slate-300 border-white/5 hover:text-white"
                    }`}
                  >
                    vs {pInfo.shortTitle}
                  </button>
                );
              })}
            </div>

            {comparePhase && (
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-amber-400/30 text-[11px] text-slate-300 space-y-1 mt-2">
                <strong className="text-amber-300 block">Diferencia con {comparePhase.name}:</strong>
                <p>
                  En <strong>{current.name}</strong>: {current.summary}
                </p>
                <p>
                  En <strong>{comparePhase.name}</strong>: {comparePhase.summary}
                </p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Razón científica de examen de cátedra */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 text-xs text-slate-300 space-y-1">
        <strong className="text-white flex items-center gap-1.5">
          <Info className="w-4 h-4 text-amber-400" />
          <span>Regla de Oro de Cátedra: La clínica no diferencia el agente etiológico</span>
        </strong>
        <p className="text-[11px] leading-relaxed">
          Un paciente ictérico por VHA, VHB o VHC presentará la misma tríada (ictericia escleral, coluria y acolia) porque todas corresponden al daño hepatocelular mediado por la respuesta inmune y la colestasis subsecuente. <strong>El diagnóstico etiológico depende indefectiblemente de marcadores serológicos y moleculares específicos.</strong>
        </p>
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
            <span>Profundizar: Fisiopatología Inmune y Diagnóstico Diferencial de Falla Fulminante</span>
          </span>
          {showDeepening ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showDeepening && (
          <div className="p-4 border-t border-white/5 bg-slate-950/60 space-y-3 text-xs text-slate-300">
            <div className="space-y-1">
              <strong className="text-amber-300">1. ¿Por qué el daño hepático es inmunomediado?</strong>
              <p className="text-[11px] leading-relaxed text-slate-400">
                La mayoría de los virus hepatotrópicos (VHA, VHB, VHC) no son directamente citopáticos en concentraciones habituales. La lesión del parénquima la provocan los linfocitos T citotóxicos (CD8+) del propio huésped al reconocer antígenos virales expuestos en las moléculas HLA clase I de la superficie del hepatocito.
              </p>
            </div>
            <div className="space-y-1">
              <strong className="text-amber-300">2. ¿Qué define la gravedad de una hepatitis aguda?</strong>
              <p className="text-[11px] leading-relaxed text-slate-400">
                La gravedad <strong>no</strong> se correlaciona con la cifra absoluta de transaminasas (ALT o AST pueden superar 3.000 U/L en formas benignas). La verdadera función de síntesis hepática y pronóstico se evalúa mediante el <strong>Tiempo de Protrombina (TP / INR)</strong> y la aparición de <strong>encefalopatía hepática</strong> (asterixis, confusión), que configuran el cuadro de Insuficiencia Hepática Fulminante.
              </p>
            </div>
          </div>
        )}
      </div>

    </GlassCard>
  );
};
