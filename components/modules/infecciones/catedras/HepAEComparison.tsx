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
  Droplets,
  Utensils,
  Users,
  AlertTriangle,
  ArrowRight,
  GitCompare,
  Layers
} from "lucide-react";

type ExposureId = "agua" | "mariscos" | "carne_cerdo" | "persona_persona" | "gestante";
type ViewMode = "exposicion" | "semejanzas" | "diferencias";

interface ExposureConfig {
  id: ExposureId;
  label: string;
  iconType: "water" | "food" | "meat" | "contact" | "pregnancy";
  shortName: string;
  reservoirText: string;
  vehicleText: string;
  vhaInvolvement: "primario" | "secundario" | "no_aplica";
  vheInvolvement: "primario" | "secundario" | "no_aplica";
  vhaDescription: string;
  vheDescription: string;
  diagnosticPearl: string;
  teachingWarning?: string;
}

const EXPOSURES: Record<ExposureId, ExposureConfig> = {
  agua: {
    id: "agua",
    label: "Agua de consumo no potable o residual",
    iconType: "water",
    shortName: "Agua contaminada",
    reservoirText: "Aguas servidas con materia fecal humana (VHA y VHE genotipos 1-2)",
    vehicleText: "Ingestión directa de agua sin tratamiento o hielo contaminado",
    vhaInvolvement: "primario",
    vheInvolvement: "primario",
    vhaDescription: "Mecanismo clásico de brotes comunitarios en áreas con infraestructura sanitaria deficiente.",
    vheDescription: "Causa principal de grandes epidemias hídricas en países en desarrollo (genotipos 1 y 2 de VHE).",
    diagnosticPearl: "Confirmación VHA: IgM anti-VHA en suero. Confirmación VHE: IgM anti-VHE o RT-PCR ARN-VHE."
  },
  mariscos: {
    id: "mariscos",
    label: "Mariscos bivalvos crudos o poco cocidos",
    iconType: "food",
    shortName: "Moluscos / Mariscos",
    reservoirText: "Aguas costeras contaminadas por descargas fecales humanas",
    vehicleText: "Moluscos filtradores (almejas, ostras, choritos) que concentran partículas virales",
    vhaInvolvement: "primario",
    vheInvolvement: "secundario",
    vhaDescription: "Fuente célebre de brotes alimentarios de VHA por bioacumulación en el tracto digestivo del bivalvo.",
    vheDescription: "Posible en zonas costeras contaminadas, pero mucho menos frecuente que la carne de mamíferos.",
    diagnosticPearl: "El marisco no es el reservorio biológico, sino un vehículo pasivo que filtra agua contaminada."
  },
  carne_cerdo: {
    id: "carne_cerdo",
    label: "Carne de cerdo, jabalí o ciervo cruda / mal cocida",
    iconType: "meat",
    shortName: "Carne porcina / Caza",
    reservoirText: "Cerdos domésticos y fauna silvestre (Zoonosis biológica)",
    vehicleText: "Ingestión de carne muscular, hígado porcino crudo o embutidos artesanales",
    vhaInvolvement: "no_aplica",
    vheInvolvement: "primario",
    vhaDescription: "NO es una zoonosis. El VHA infecta exclusivamente a seres humanos y ciertos primates no humanos.",
    vheDescription: "Mecanismo cardinal de la hepatitis E autóctona en países desarrollados y de ingresos medios (genotipos 3 y 4 de VHE).",
    diagnosticPearl: "Diferencia epidemiológica crucial: VHE puede adquirirse sin problemas de agua potable debido a su reservorio zoonótico porcino."
  },
  persona_persona: {
    id: "persona_persona",
    label: "Contacto fecal-oral directo persona a persona",
    iconType: "contact",
    shortName: "Contacto directo",
    reservoirText: "Tracto gastrointestinal humano con excreción viral masiva en heces",
    vehicleText: "Manos contaminadas, contacto estrecho intradomiciliario, salas cuna y jardines infantiles",
    vhaInvolvement: "primario",
    vheInvolvement: "secundario",
    vhaDescription: "Vía muy eficiente para VHA debido a la alta carga viral excretada antes del inicio de la ictericia.",
    vheDescription: "Menos frecuente en VHE; la transmisión secundaria intradomiciliaria es inusualmente baja comparada con VHA.",
    diagnosticPearl: "VHA se transmite fácilmente entre niños pequeños asintomáticos que luego contagian a adultos susceptibles en el hogar."
  },
  gestante: {
    id: "gestante",
    label: "Exposición en mujeres embarazadas (2° y 3° trimestre)",
    iconType: "pregnancy",
    shortName: "Mujer gestante",
    reservoirText: "Fuente fecal-oral hídrica por genotipos 1 y 2 de VHE",
    vehicleText: "Agua o alimentos contaminados ingeridos durante el embarazo avanzado",
    vhaInvolvement: "secundario",
    vheInvolvement: "primario",
    vhaDescription: "El VHA no presenta una letalidad desproporcionada en embarazadas; el pronóstico suele ser favorable.",
    vheDescription: "RIESGO VITAL EXTREMO: El VHE (genotipos 1 y 2) produce una letalidad de 20% a 25% por insuficiencia hepática fulminante y coagulopatía en el tercer trimestre.",
    diagnosticPearl: "Toda hepatitis aguda en una paciente gestante en zona endémica o con viaje reciente obliga a descartar VHE con urgencia.",
    teachingWarning: "Alerta de cátedra: La gravedad en gestantes es el sello epidemiológico de la Hepatitis E."
  }
};

export const HepAEComparison: React.FC = () => {
  const [selectedExposure, setSelectedExposure] = useState<ExposureId>("agua");
  const [viewMode, setViewMode] = useState<ViewMode>("exposicion");
  const [showDeepening, setShowDeepening] = useState<boolean>(false);
  const [activeInspectorNode, setActiveInspectorNode] = useState<"reservorio" | "vehiculo" | "patogenia" | "confirmacion">("vehiculo");

  const exp = EXPOSURES[selectedExposure];

  const handleReset = () => {
    setSelectedExposure("agua");
    setViewMode("exposicion");
    setActiveInspectorNode("vehiculo");
    setShowDeepening(false);
  };

  // Estado del diagrama según modo
  const isVHAHighlighted = viewMode === "semejanzas" || exp.vhaInvolvement !== "no_aplica";
  const isVHEHighlighted = viewMode === "semejanzas" || exp.vheInvolvement !== "no_aplica";
  const isMeatRoute = selectedExposure === "carne_cerdo";
  const isPregnancyRoute = selectedExposure === "gestante";

  return (
    <GlassCard className="p-4 sm:p-7 rounded-3xl border border-amber-500/30 bg-slate-950/90 shadow-2xl space-y-6">
      
      {/* 1. Cabecera y Pregunta Didáctica */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[11px] font-bold border border-amber-500/30">
              HEP-05 · Comparador visual interactivo
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              CAT-20 · Págs. 11, 12
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Vías de Transmisión y Diferencias entre Hepatitis A y Hepatitis E
          </h3>
          <p className="text-xs text-slate-300 max-w-2xl">
            <strong>Pregunta central:</strong> Ambos virus se transmiten por vía entérica, pero ¿por qué la hepatitis E puede ser una zoonosis de países desarrollados o una emergencia obstétrica letal?
          </p>
        </div>

        <button
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-white/10 transition-colors self-start shrink-0 min-h-[44px]"
          aria-label="Restablecer comparador"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restablecer</span>
        </button>
      </div>

      {/* Controles de Modo: Vía de Exposición vs Semejanzas vs Diferencias */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-slate-900/80 border border-white/10">
        <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
          <GitCompare className="w-4 h-4 text-amber-400" />
          <span>Modo de Análisis Didáctico:</span>
        </span>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setViewMode("exposicion")}
            aria-pressed={viewMode === "exposicion"}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-xl text-xs font-bold transition-all min-h-[44px] ${
              viewMode === "exposicion"
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-950/40"
                : "bg-slate-800 text-slate-300 hover:text-white"
            }`}
          >
            Explorar Vía
          </button>
          <button
            onClick={() => setViewMode("semejanzas")}
            aria-pressed={viewMode === "semejanzas"}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-xl text-xs font-bold transition-all min-h-[44px] ${
              viewMode === "semejanzas"
                ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950/40"
                : "bg-slate-800 text-slate-300 hover:text-white"
            }`}
          >
            Ver Semejanzas
          </button>
          <button
            onClick={() => setViewMode("diferencias")}
            aria-pressed={viewMode === "diferencias"}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-xl text-xs font-bold transition-all min-h-[44px] ${
              viewMode === "diferencias"
                ? "bg-rose-500 text-white shadow-md shadow-rose-950/40"
                : "bg-slate-800 text-slate-300 hover:text-white"
            }`}
          >
            Ver Diferencias Clave
          </button>
        </div>
      </div>

      {/* Selector de Escenarios de Exposición */}
      {viewMode === "exposicion" && (
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
            1. Selecciona la vía de exposición o contexto del paciente:
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {(["agua", "mariscos", "carne_cerdo", "persona_persona", "gestante"] as const).map((eId) => {
              const isSelected = selectedExposure === eId;
              const item = EXPOSURES[eId];
              return (
                <button
                  key={eId}
                  onClick={() => setSelectedExposure(eId)}
                  aria-pressed={isSelected}
                  className={`p-3 rounded-2xl text-left border transition-all min-h-[58px] flex flex-col justify-between ${
                    isSelected
                      ? "bg-amber-500/20 border-amber-400 text-white shadow-lg shadow-amber-950/40 ring-1 ring-amber-400/40"
                      : "bg-slate-900/60 hover:bg-slate-900 text-slate-300 border-white/5"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-mono uppercase ${isSelected ? "text-amber-300 font-bold" : "text-slate-400"}`}>
                      {item.shortName}
                    </span>
                    {eId === "carne_cerdo" && (
                      <span className="px-1 py-0.2 rounded bg-amber-400/20 text-amber-300 text-[9px] font-bold">Zoonosis</span>
                    )}
                    {eId === "gestante" && (
                      <span className="px-1 py-0.2 rounded bg-rose-500/20 text-rose-300 text-[9px] font-bold">20-25%</span>
                    )}
                  </div>
                  <span className="text-xs font-bold leading-tight mt-1 line-clamp-2">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 2 & 3. Escena Visual Protagonista de Transmisión */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-white/10 space-y-4">
        
        {/* Cabecera del diagrama */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <h4 className="text-xs sm:text-sm font-bold text-white">
              {viewMode === "semejanzas" 
                ? "Diagrama de Semejanzas Biológicas: VHA y VHE" 
                : viewMode === "diferencias"
                ? "Diagrama de Divergencias Epidemiológicas: VHA frente a VHE"
                : `Recorrido de Transmisión: ${exp.label}`}
            </h4>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            Toca los nodos del diagrama para inspeccionar detalles
          </span>
        </div>

        {/* Diagrama SVG de Transmisión y Circuito */}
        <div className="bg-slate-950/80 rounded-xl p-3 border border-white/5 flex justify-center overflow-x-auto">
          <svg
            viewBox="0 0 680 230"
            className="w-full max-w-[680px] h-auto select-none min-w-[500px]"
            role="img"
            aria-label="Diagrama interactivo de transmisión comparativa de hepatitis A y E"
          >
            <defs>
              <linearGradient id="flowGradVHA" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
              <linearGradient id="flowGradVHE" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
            </defs>

            {/* NODO 1: RESERVORIO */}
            <g
              onClick={() => setActiveInspectorNode("reservorio")}
              className="cursor-pointer group"
              tabIndex={0}
              role="button"
              aria-label="Inspeccionar reservorio"
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setActiveInspectorNode("reservorio"); }}
            >
              <rect
                x="20"
                y="35"
                width="150"
                height="150"
                rx="14"
                fill={activeInspectorNode === "reservorio" ? "#1e293b" : "#0f172a"}
                stroke={activeInspectorNode === "reservorio" ? "#f59e0b" : "#334155"}
                strokeWidth={activeInspectorNode === "reservorio" ? "2.5" : "1.5"}
              />
              <text x="95" y="60" fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="middle" letterSpacing="1">1. RESERVORIO</text>
              
              {/* Contenido dinámico del reservorio */}
              {isMeatRoute ? (
                <>
                  <rect x="40" y="80" width="110" height="34" rx="8" fill="#f59e0b" opacity="0.2" stroke="#f59e0b" strokeWidth="1" />
                  <text x="95" y="101" fill="#fef08a" fontSize="11" fontWeight="bold" textAnchor="middle">Cerdos / Jabalíes</text>
                  <text x="95" y="135" fill="#f87171" fontSize="9" textAnchor="middle">Exclusivo VHE (3 y 4)</text>
                  <text x="95" y="150" fill="#64748b" fontSize="9" textAnchor="middle">VHA NO tiene zoonosis</text>
                </>
              ) : (
                <>
                  <rect x="35" y="75" width="120" height="42" rx="8" fill="#10b981" opacity="0.15" stroke="#10b981" strokeWidth="1" />
                  <text x="95" y="94" fill="#a7f3d0" fontSize="11" fontWeight="bold" textAnchor="middle">Ser Humano</text>
                  <text x="95" y="108" fill="#6ee7b7" fontSize="9" textAnchor="middle">Excreción en heces</text>
                  <text x="95" y="142" fill="#94a3b8" fontSize="9" textAnchor="middle">VHA: Humano exclusivo</text>
                  <text x="95" y="156" fill="#94a3b8" fontSize="9" textAnchor="middle">VHE: Humano (Gen 1 y 2)</text>
                </>
              )}
            </g>

            {/* FLECHA 1 -> 2 */}
            <path d="M 175 110 L 255 110" stroke="#475569" strokeWidth="2.5" strokeDasharray="4 4" />
            <polygon points="255,105 265,110 255,115" fill="#64748b" />

            {/* NODO 2: VEHÍCULO / EXPOSICIÓN */}
            <g
              onClick={() => setActiveInspectorNode("vehiculo")}
              className="cursor-pointer group"
              tabIndex={0}
              role="button"
              aria-label="Inspeccionar vehículo"
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setActiveInspectorNode("vehiculo"); }}
            >
              <rect
                x="265"
                y="35"
                width="160"
                height="150"
                rx="14"
                fill={activeInspectorNode === "vehiculo" ? "#1e293b" : "#0f172a"}
                stroke={activeInspectorNode === "vehiculo" ? "#f59e0b" : "#334155"}
                strokeWidth={activeInspectorNode === "vehiculo" ? "2.5" : "1.5"}
              />
              <text x="345" y="60" fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="middle" letterSpacing="1">2. VEHÍCULO / VÍA</text>
              
              <rect x="280" y="75" width="130" height="50" rx="8" fill="#f59e0b" opacity="0.15" stroke="#f59e0b" strokeWidth="1" />
              <text x="345" y="95" fill="#fef08a" fontSize="11" fontWeight="bold" textAnchor="middle">
                {exp.shortName}
              </text>
              <text x="345" y="112" fill="#cbd5e1" fontSize="9" textAnchor="middle">
                Entrada Fecal-Oral
              </text>

              <text x="345" y="145" fill="#94a3b8" fontSize="9" textAnchor="middle">Resistente a pH gástrico</text>
              <text x="345" y="159" fill="#94a3b8" fontSize="9" textAnchor="middle">Virus desnudos sin envoltura</text>
            </g>

            {/* FLECHA 2 -> 3 */}
            <path d="M 430 110 L 495 110" stroke="#475569" strokeWidth="2.5" strokeDasharray="4 4" />
            <polygon points="495,105 505,110 495,115" fill="#64748b" />

            {/* NODO 3: HUÉSPED Y ÓRGANO DIANA */}
            <g
              onClick={() => setActiveInspectorNode("patogenia")}
              className="cursor-pointer group"
              tabIndex={0}
              role="button"
              aria-label="Inspeccionar patogenia"
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setActiveInspectorNode("patogenia"); }}
            >
              <rect
                x="505"
                y="35"
                width="155"
                height="150"
                rx="14"
                fill={activeInspectorNode === "patogenia" ? "#1e293b" : "#0f172a"}
                stroke={activeInspectorNode === "patogenia" ? "#f59e0b" : "#334155"}
                strokeWidth={activeInspectorNode === "patogenia" ? "2.5" : "1.5"}
              />
              <text x="582" y="60" fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="middle" letterSpacing="1">3. HUÉSPED Y RIESGO</text>

              {isPregnancyRoute ? (
                <>
                  <rect x="520" y="75" width="125" height="50" rx="8" fill="#f43f5e" opacity="0.25" stroke="#f43f5e" strokeWidth="1.5" />
                  <text x="582" y="95" fill="#fda4af" fontSize="11" fontWeight="bold" textAnchor="middle">Gestante 2°/3° trim.</text>
                  <text x="582" y="112" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">VHE: Letalidad 20-25%</text>
                  <text x="582" y="145" fill="#6ee7b7" fontSize="9" textAnchor="middle">VHA: Curso habitual</text>
                  <text x="582" y="159" fill="#fca5a5" fontSize="9" textAnchor="middle">Falla fulminante grave</text>
                </>
              ) : (
                <>
                  <rect x="520" y="75" width="125" height="42" rx="8" fill="#3b82f6" opacity="0.15" stroke="#3b82f6" strokeWidth="1" />
                  <text x="582" y="94" fill="#93c5fd" fontSize="11" fontWeight="bold" textAnchor="middle">Hepatocito</text>
                  <text x="582" y="108" fill="#bfdbfe" fontSize="9" textAnchor="middle">Necrosis inmunomediada</text>
                  <text x="582" y="142" fill="#a7f3d0" fontSize="9" textAnchor="middle">Sin cronicidad en inmuno-</text>
                  <text x="582" y="156" fill="#a7f3d0" fontSize="9" textAnchor="middle">competentes</text>
                </>
              )}
            </g>
          </svg>
        </div>

        {/* 4. Comparación de Impacto por Agente en esta Exposición */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          
          {/* Tarjeta VHA */}
          <div className={`p-4 rounded-2xl border transition-all ${
            exp.vhaInvolvement === "no_aplica"
              ? "bg-slate-950/40 border-slate-800 opacity-60"
              : "bg-slate-950/80 border-emerald-500/30"
          }`}>
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="font-bold text-emerald-400 text-xs sm:text-sm flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Virus Hepatitis A (VHA)</span>
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                exp.vhaInvolvement === "primario"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold"
                  : exp.vhaInvolvement === "secundario"
                  ? "bg-sky-500/20 text-sky-300"
                  : "bg-slate-800 text-slate-500"
              }`}>
                {exp.vhaInvolvement === "primario" ? "Vía principal" : exp.vhaInvolvement === "secundario" ? "Vía posible" : "No aplica"}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mt-2.5">
              {exp.vhaDescription}
            </p>

            <div className="pt-2 mt-2 border-t border-white/5 text-[11px] text-slate-400">
              <strong className="text-emerald-300">Blanco de confirmación: </strong>
              Detección sérica de <strong>IgM anti-VHA</strong>. Vacuna inactivada altamente efectiva disponible en el calendario nacional.
            </div>
          </div>

          {/* Tarjeta VHE */}
          <div className={`p-4 rounded-2xl border transition-all ${
            exp.vheInvolvement === "no_aplica"
              ? "bg-slate-950/40 border-slate-800 opacity-60"
              : isPregnancyRoute || isMeatRoute
              ? "bg-slate-950/90 border-amber-500/50 ring-1 ring-amber-400/30"
              : "bg-slate-950/80 border-amber-500/30"
          }`}>
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="font-bold text-amber-400 text-xs sm:text-sm flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>Virus Hepatitis E (VHE)</span>
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                exp.vheInvolvement === "primario"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold"
                  : exp.vheInvolvement === "secundario"
                  ? "bg-sky-500/20 text-sky-300"
                  : "bg-slate-800 text-slate-500"
              }`}>
                {exp.vheInvolvement === "primario" ? "Vía principal" : exp.vheInvolvement === "secundario" ? "Vía posible" : "No aplica"}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mt-2.5">
              {exp.vheDescription}
            </p>

            <div className="pt-2 mt-2 border-t border-white/5 text-[11px] text-slate-400">
              <strong className="text-amber-300">Blanco de confirmación: </strong>
              Detección de <strong>IgM anti-VHE</strong> o confirmación molecular por <strong>RT-PCR de ARN-VHE</strong>.
            </div>
          </div>

        </div>

        {/* Alerta de Cátedra destacada si corresponde */}
        {exp.teachingWarning && (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 flex items-start gap-2 text-xs text-rose-200">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <strong className="text-white block">{exp.teachingWarning}</strong>
              <p className="text-[11px] text-rose-300">
                La alta letalidad se atribuye a factores hormonales e inmunológicos propios de la gestación avanzada que favorecen una necrosis hepática masiva y coagulación intravascular diseminada.
              </p>
            </div>
          </div>
        )}

      </div>

      {/* 5. Comparación Didáctica Instantánea (Semejanzas vs Diferencias) */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-3">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          <span>Síntesis Comparativa de Alto Rendimiento para el Certamen:</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-emerald-500/20 space-y-1.5">
            <span className="font-bold text-emerald-300 block">Semejanzas Esenciales (Lo que comparten):</span>
            <ul className="space-y-1 text-slate-300 text-[11px]">
              <li>• Virus desnudos (sin envoltura lipídica), resistentes a pH ácido gástrico.</li>
              <li>• Transmisión primordial por ciclo fecal-oral (agua y alimentos).</li>
              <li>• En pacientes inmunocompetentes NO generan hepatitis crónica (evolución autolimitada).</li>
              <li>• La prevención se basa en saneamiento básico, agua potable y lavado de manos.</li>
            </ul>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-amber-500/20 space-y-1.5">
            <span className="font-bold text-amber-300 block">Diferencias Cruciales (Lo que pregunta la cátedra):</span>
            <ul className="space-y-1 text-slate-300 text-[11px]">
              <li>• <strong>Reservorio:</strong> VHA es exclusivamente humano; VHE (gen 3-4) es zoonosis porcina/jabalí.</li>
              <li>• <strong>Riesgo en gestantes:</strong> VHE presenta 20-25% de letalidad en 3° trimestre; VHA no.</li>
              <li>• <strong>Inmunodeprimidos:</strong> VHE puede cronificar en receptores de trasplante; VHA nunca cronifica.</li>
              <li>• <strong>Vacunación:</strong> VHA cuenta con vacuna universal incluida en PNI; VHE no tiene vacuna de uso generalizado en Chile.</li>
            </ul>
          </div>
        </div>
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
            <span>Profundizar: Genotipos 1 a 4 de VHE y Mecanismos de Cronificación</span>
          </span>
          {showDeepening ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showDeepening && (
          <div className="p-4 border-t border-white/5 bg-slate-950/60 space-y-3 text-xs text-slate-300">
            <div className="space-y-1">
              <strong className="text-amber-300">Genotipos 1 y 2 de VHE (Epidémicos humanos):</strong>
              <p className="text-[11px] leading-relaxed text-slate-400">
                Restringidos a humanos. Se propagan por vía hídrica en Asia, África y América Central en contextos de catástrofes o déficit de alcantarillado. Son los responsables directos de los brotes masivos y la altísima mortalidad obstétrica.
              </p>
            </div>
            <div className="space-y-1">
              <strong className="text-amber-300">Genotipos 3 y 4 de VHE (Zoonóticos esporádicos):</strong>
              <p className="text-[11px] leading-relaxed text-slate-400">
                Presentes en cerdos, jabalíes y ciervos a nivel global (incluyendo Europa, EE.UU. y Chile). Se transmiten por consumo de vísceras porcinas crudas (ej. salchichas de hígado). En pacientes bajo terapia inmunosupresora (trasplante de órganos, VIH avanzado), el genotipo 3 puede persistir más de 6 meses y evolucionar a cirrosis hepática acelerada.
              </p>
            </div>
          </div>
        )}
      </div>

    </GlassCard>
  );
};
