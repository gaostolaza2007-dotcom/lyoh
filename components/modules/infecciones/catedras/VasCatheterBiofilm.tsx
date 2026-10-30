"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  CatheterBiofilm3DViewer,
  CatheterViewMode,
  BiofilmSurfaceState,
  CatheterRouteMode,
  CATHETER_STRUCTURES,
} from "./CatheterBiofilm3DViewer";
import {
  Layers,
  Eye,
  EyeOff,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Info,
  ArrowRight,
  ExternalLink,
  Scissors,
  ShieldAlert,
  Activity,
  Sparkles,
  BookOpen,
  Compass,
} from "lucide-react";

const VIEW_OPTIONS: {
  id: CatheterViewMode;
  label: string;
  shortDesc: string;
}[] = [
  {
    id: "exterior",
    label: "Vista exterior",
    shortDesc: "Tramo de entrada, pared venosa y cara externa del catéter en el vaso.",
  },
  {
    id: "lumen",
    label: "Vista del lumen",
    shortDesc: "Corte longitudinal que expone el canal interno, el conector y la punta distal.",
  },
  {
    id: "superficie",
    label: "Vista de superficie",
    shortDesc: "Acercamiento a la interfaz polímero-fibrina, adhesión celular y matriz del biofilm.",
  },
];

const SURFACE_STATE_OPTIONS: {
  id: BiofilmSurfaceState;
  label: string;
  badge: string;
  summary: string;
  whatHappens: string;
  clinicalLimit: string;
}[] = [
  {
    id: "sin_colonizacion",
    label: "1. Superficie sin colonización",
    badge: "Polímero + película del huésped",
    summary:
      "El catéter dentro de la vena se recubre de proteínas plasmáticas del huésped (fibrina y fibronectina), sin microorganismos adheridos.",
    whatHappens:
      "Tras el contacto con la sangre, se deposita una película condicionante proteica sobre el poliuretano o silicona. El lumen y la superficie externa permanecen libres de bacterias o levaduras.",
    clinicalLimit:
      "La formación de una vaina de fibrina es una respuesta fisiológica del huésped ante el material sintético y no implica infección.",
  },
  {
    id: "adhesion",
    label: "2. Adhesión inicial en superficie",
    badge: "Anclaje microbiano sésil",
    summary:
      "Microorganismos alcanzan la cara externa o el lumen y se fijan al polímero o a las proteínas del huésped.",
    whatHappens:
      "Interacciones físico-químicas iniciales seguidas de unión específica mediante adhesinas microbianas (como MSCRAMMs en estafilococos) que reconocen fibronectina, fibrinógeno o colágeno sobre el catéter.",
    clinicalLimit:
      "Es un estado potencialmente reversible o local; la presencia de células adheridas en el dispositivo no demuestra por sí sola paso persistente a la sangre.",
  },
  {
    id: "biofilm",
    label: "3. Biofilm establecido",
    badge: "Microcolonias + matriz EPS",
    summary:
      "Los microorganismos proliferan formando microcolonias envueltas en una matriz polimérica extracelular (slime) autoproducida.",
    whatHappens:
      "La comunidad sésil secreta polisacáridos (ej. PIA en S. epidermidis), proteínas y ADN extracelular. Esta arquitectura tridimensional protege a los microorganismos de los neutrófilos y reduce la eficacia local de los antimicrobianos.",
    clinicalLimit:
      "Un biofilm establecido define colonización del dispositivo, pero NO equivale automáticamente a bacteriemia ni a sepsis. Sólo si se desprenden células al torrente sanguíneo y superan la depuración del huésped puede originarse una infección sanguínea.",
  },
];

const ROUTE_OPTIONS: {
  id: CatheterRouteMode;
  label: string;
  description: string;
}[] = [
  {
    id: "ninguna",
    label: "Sin ruta superpuesta",
    description:
      "Observación limpia de las estructuras del vaso, el catéter y el estado de superficie seleccionado.",
  },
  {
    id: "extraluminal",
    label: "Ruta extraluminal (piel → exterior)",
    description:
      "Microorganismos de la piel en el sitio de inserción migran por capilaridad a lo largo de la superficie externa del catéter hacia el interior de la vena.",
  },
  {
    id: "intraluminal",
    label: "Ruta intraluminal (conector → lumen)",
    description:
      "Microorganismos ingresan a través del conector proximal (hub) durante su manipulación o, con menor frecuencia, por una infusión contaminada, colonizando el canal interno.",
  },
  {
    id: "paso_sangre",
    label: "Posible desprendimiento a sangre",
    description:
      "Representa la posibilidad de que células planctónicas o fragmentos del biofilm se desprendan desde el extremo del catéter hacia la circulación venosa.",
  },
];

const RELATED_AGENTS = [
  { id: "B04", name: "Staphylococcus epidermidis", note: "Producción destacada de matriz polisacárida (slime) sobre polímeros" },
  { id: "B03", name: "Staphylococcus aureus", note: "Adhesinas de unión a fibronectina y fibrinógeno (MSCRAMMs)" },
  { id: "B08", name: "Enterococcus faecalis", note: "Persistencia en dispositivos intravasculares" },
  { id: "B11", name: "Klebsiella pneumoniae", note: "Bacilo gramnegativo asociado a infecciones hospitalarias" },
  { id: "H01", name: "Candida albicans", note: "Formación de biopelículas fúngicas con levaduras y pseudohifas" },
];

export const VasCatheterBiofilm: React.FC = () => {
  const [viewMode, setViewMode] = useState<CatheterViewMode>("exterior");
  const [surfaceState, setSurfaceState] = useState<BiofilmSurfaceState>("biofilm");
  const [routeMode, setRouteMode] = useState<CatheterRouteMode>("ninguna");
  const [crossSection, setCrossSection] = useState<boolean>(false);
  const [showMarkers, setShowMarkers] = useState<boolean>(true);
  const [selectedStructureId, setSelectedStructureId] = useState<string | null>("matriz_biofilm");
  const [resetToken, setResetToken] = useState<number>(0);

  // Student decision state (Observar -> Explorar -> Decidir -> Explicación -> Reintentar)
  const [q1Answer, setQ1Answer] = useState<number | null>(null);
  const [q2Answer, setQ2Answer] = useState<number | null>(null);
  const [q3Answer, setQ3Answer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);

  const handleSelectView = (nextView: CatheterViewMode) => {
    setViewMode(nextView);
    if (nextView === "lumen") {
      setCrossSection(true);
      setSelectedStructureId("lumen_cateter");
    } else if (nextView === "superficie") {
      setSelectedStructureId(
        surfaceState === "biofilm"
          ? "matriz_biofilm"
          : surfaceState === "adhesion"
          ? "adhesion_microbiana"
          : "pelicula_fibrina"
      );
    }
  };

  const handleSelectSurfaceState = (nextState: BiofilmSurfaceState) => {
    setSurfaceState(nextState);
    if (nextState === "sin_colonizacion") {
      setSelectedStructureId("pelicula_fibrina");
    } else if (nextState === "adhesion") {
      setSelectedStructureId("adhesion_microbiana");
    } else {
      setSelectedStructureId("matriz_biofilm");
    }
  };

  const handleSelectRoute = (nextRoute: CatheterRouteMode) => {
    setRouteMode(nextRoute);
    if (nextRoute === "intraluminal") {
      setCrossSection(true);
      setSelectedStructureId("ruta_diseminacion");
    } else if (nextRoute !== "ninguna") {
      setSelectedStructureId("ruta_diseminacion");
    }
  };

  const handleFullReset = () => {
    setViewMode("exterior");
    setSurfaceState("sin_colonizacion");
    setRouteMode("ninguna");
    setCrossSection(false);
    setShowMarkers(true);
    setSelectedStructureId("pared_cateter");
    setQ1Answer(null);
    setQ2Answer(null);
    setQ3Answer(null);
    setShowExplanation(false);
    setResetToken((prev) => prev + 1);
  };

  const activeSurfaceInfo = useMemo(
    () => SURFACE_STATE_OPTIONS.find((s) => s.id === surfaceState) || SURFACE_STATE_OPTIONS[0],
    [surfaceState]
  );

  const activeRouteInfo = useMemo(
    () => ROUTE_OPTIONS.find((r) => r.id === routeMode) || ROUTE_OPTIONS[0],
    [routeMode]
  );

  const activeStructure = useMemo(
    () =>
      CATHETER_STRUCTURES.find((s) => s.id === selectedStructureId) ||
      CATHETER_STRUCTURES.find((s) => s.id === "pared_cateter")!,
    [selectedStructureId]
  );

  // Dynamic equivalent text description of the 3D scene for accessibility & clarity
  const sceneEquivalentText = useMemo(() => {
    const viewDesc =
      viewMode === "exterior"
        ? "Vista general del segmento venoso y del catéter ingresando al vaso."
        : viewMode === "lumen"
        ? "Vista en corte longitudinal que muestra abierto el interior de la vena y el canal interno (lumen) del catéter."
        : "Vista acercada sobre la superficie del catéter y su interfaz con las proteínas del huésped y la sangre.";

    const cutDesc =
      crossSection || viewMode === "lumen"
        ? "El corte longitudinal está activo, dejando expuesto el lumen interno del catéter."
        : "El vaso y el catéter se muestran en su contorno tubular completo.";

    const stateDesc =
      surfaceState === "sin_colonizacion"
        ? "La superficie del polímero presenta únicamente la película condicionante de fibrina del huésped, sin microorganismos adheridos."
        : surfaceState === "adhesion"
        ? "Se observan microorganismos ampliados adheridos de forma sésil sobre la película de fibrina en la cara externa y en el lumen."
        : "Se observa un biofilm maduro con microcolonias densas recubiertas por una matriz polimérica extracelular (EPS) translúcida tanto en la superficie externa como en el lumen.";

    const routeDesc =
      routeMode === "ninguna"
        ? "No hay ninguna ruta de migración superpuesta."
        : routeMode === "extraluminal"
        ? "Se resalta la ruta extraluminal: avance desde la entrada en la piel por la cara externa del catéter."
        : routeMode === "intraluminal"
        ? "Se resalta la ruta intraluminal: ingreso desde el conector proximal (hub) a lo largo del canal interno del catéter."
        : "Se resalta el posible desprendimiento de microorganismos desde el biofilm en la punta del catéter hacia el flujo sanguíneo venoso.";

    return `${viewDesc} ${cutDesc} ${stateDesc} ${routeDesc}`;
  }, [viewMode, crossSection, surfaceState, routeMode]);

  return (
    <div className="space-y-6">
      {/* 1. CONCEPTO BREVE Y OBJETIVO */}
      <GlassCard className="p-5 sm:p-6 border-cyan-500/30 bg-gradient-to-br from-slate-900/95 via-slate-900/70 to-cyan-950/25">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4 mb-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-xs font-bold border border-cyan-500/30">
                VAS-05 · Modelo 3D interactivo
              </span>
              <span className="text-xs text-slate-400 font-mono">CAT-21 · Págs. 11–13</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400 shrink-0" />
              <span>Catéteres Vasculares y Formación de Biofilm</span>
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/agentes-infecciosos/fundamentos"
              className="inline-flex min-h-[40px] items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-cyan-300 text-xs border border-cyan-500/30 transition-colors"
            >
              <span>Fundamentos: colonización e infección</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <p className="text-sm text-slate-200 leading-relaxed">
          <strong className="text-white">Objetivo de aprendizaje:</strong> Al terminar esta actividad, podrás ubicar en el modelo 3D el <strong className="text-cyan-300">exterior</strong>, el <strong className="text-cyan-300">lumen</strong> y la <strong className="text-cyan-300">superficie</strong> de un catéter venoso; distinguir entre <strong className="text-amber-300">colonización por biofilm</strong> y una <strong className="text-rose-300">infección sanguínea demostrada</strong>; explicar las rutas de ingreso posibles; y diferenciar un acceso intravascular directo de un catéter de peritoneodiálisis.
        </p>

        <p className="mt-2.5 text-xs text-slate-400">
          <strong className="text-slate-300">Instrucción:</strong> Explora primero las vistas, el corte longitudinal, los estados de superficie y las rutas en el visor. Luego responde las preguntas conceptuales antes de revelar la explicación completa.
        </p>
      </GlassCard>

      {/* 2. CONTROLES EXTERNOS DEL MODELO (Vistas, Corte, Estado de Superficie y Rutas) */}
      <GlassCard className="p-5 sm:p-6 border-white/10 space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Selector de Vista + Botón de Corte Longitudinal */}
          <div className="lg:col-span-6 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                <span>1. Vista de cámara y sección</span>
              </span>

              <button
                type="button"
                onClick={() => setCrossSection((prev) => !prev)}
                aria-pressed={crossSection || viewMode === "lumen"}
                className={`inline-flex min-h-[40px] items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  crossSection || viewMode === "lumen"
                    ? "bg-amber-500/20 border-amber-400 text-amber-200"
                    : "bg-slate-900 hover:bg-slate-800 border-white/10 text-slate-300"
                }`}
              >
                <Scissors className="w-3.5 h-3.5" />
                <span>
                  {crossSection || viewMode === "lumen"
                    ? "Corte longitudinal: Activo"
                    : "Activar corte longitudinal"}
                </span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {VIEW_OPTIONS.map((v) => {
                const isSelected = viewMode === v.id;
                return (
                  <button
                    type="button"
                    key={v.id}
                    onClick={() => handleSelectView(v.id)}
                    aria-pressed={isSelected}
                    className={`min-h-[68px] p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? "bg-cyan-500/20 border-cyan-400 text-white shadow-md shadow-cyan-950/40"
                        : "bg-slate-900/60 hover:bg-slate-900 border-white/5 text-slate-300"
                    }`}
                  >
                    <span className="text-xs font-bold">{v.label}</span>
                    <span className="text-[11px] text-slate-400 leading-snug mt-1">
                      {v.shortDesc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selector de Estado Educativo de la Superficie */}
          <div className="lg:col-span-6 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>2. Estado educativo de la superficie</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Mecanismo conceptual (no cronológico)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {SURFACE_STATE_OPTIONS.map((st) => {
                const isSelected = surfaceState === st.id;
                return (
                  <button
                    type="button"
                    key={st.id}
                    onClick={() => handleSelectSurfaceState(st.id)}
                    aria-pressed={isSelected}
                    className={`min-h-[68px] p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? "bg-emerald-500/20 border-emerald-400 text-white shadow-md shadow-emerald-950/40"
                        : "bg-slate-900/60 hover:bg-slate-900 border-white/5 text-slate-300"
                    }`}
                  >
                    <span className="text-xs font-bold">{st.label}</span>
                    <span className="text-[10px] font-mono text-emerald-300/90 mt-1">
                      {st.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selector de Ruta Representada */}
        <div className="space-y-2 pt-2 border-t border-white/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              3. Explorar ruta representada (posibilidad biológica):
            </span>
            <span className="text-[11px] text-slate-400">
              Selecciona una vía para observar el trayecto posible sin atribuirle frecuencia obligatoria.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {ROUTE_OPTIONS.map((rt) => {
              const isSelected = routeMode === rt.id;
              return (
                <button
                  type="button"
                  key={rt.id}
                  onClick={() => handleSelectRoute(rt.id)}
                  aria-pressed={isSelected}
                  className={`min-h-[54px] p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between gap-2 ${
                    isSelected
                      ? "bg-amber-500/20 border-amber-400 text-white font-semibold"
                      : "bg-slate-900/50 hover:bg-slate-900 border-white/5 text-slate-300"
                  }`}
                >
                  <span>{rt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. VISOR 3D Y PANEL EXTERNO DE EXPLICACIÓN DE ESTRUCTURAS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start pt-1">
          {/* Columna del Visor 3D */}
          <div className="lg:col-span-7 space-y-3">
            <CatheterBiofilm3DViewer
              viewMode={viewMode}
              surfaceState={surfaceState}
              routeMode={routeMode}
              crossSection={crossSection}
              onToggleCrossSection={() => setCrossSection((prev) => !prev)}
              showMarkers={showMarkers}
              onToggleMarkers={() => setShowMarkers((prev) => !prev)}
              selectedStructureId={selectedStructureId}
              onSelectStructure={(id) => setSelectedStructureId(id)}
              resetToken={resetToken}
            />

            {/* Descripción textual equivalente en vivo (Accesibilidad / Teclado / Sin WebGL) */}
            <div
              aria-live="polite"
              className="p-3.5 rounded-2xl bg-slate-950/90 border border-white/10 text-xs text-slate-300 space-y-1.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-cyan-300 uppercase tracking-wider text-[10px] font-mono">
                  Descripción equivalente de la escena actual
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {activeSurfaceInfo.label}
                </span>
              </div>
              <p className="leading-relaxed text-slate-200">{sceneEquivalentText}</p>
              <p className="text-[11px] text-slate-400 pt-1 border-t border-white/5">
                <strong className="text-slate-300">Detalle del estado:</strong>{" "}
                {activeSurfaceInfo.whatHappens}{" "}
                <strong className="text-amber-300">Límite:</strong>{" "}
                {activeSurfaceInfo.clinicalLimit}
              </p>
              {routeMode !== "ninguna" && (
                <p className="text-[11px] text-amber-200/90 pt-1">
                  <strong className="text-amber-300">Ruta activa:</strong>{" "}
                  {activeRouteInfo.description}
                </p>
              )}
            </div>
          </div>

          {/* Columna del Panel Externo de Estructuras */}
          <div className="lg:col-span-5 space-y-3">
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 space-y-3">
              <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2.5">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold block">
                    Estructura seleccionada en el modelo
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    {activeStructure.name}
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-white/5 text-slate-300 font-mono text-[10px] border border-white/10 shrink-0">
                  {activeStructure.shortName}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {activeStructure.description}
              </p>

              <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/25 text-xs space-y-1">
                <span className="font-bold text-cyan-300 block">
                  ¿Qué permite observar esta estructura?
                </span>
                <p className="text-slate-200 leading-relaxed">{activeStructure.whatItShows}</p>
              </div>

              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/25 text-xs space-y-1">
                <span className="font-bold text-amber-300 block">
                  ¿Qué NO permite concluir por sí sola?
                </span>
                <p className="text-slate-200 leading-relaxed">
                  {activeStructure.whatItDoesNotProve}
                </p>
              </div>

              {/* Lista accesible por teclado y táctil de todas las estructuras */}
              <div className="pt-2 border-t border-white/10 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 block">
                  Seleccionar estructura desde la lista (teclado o pantalla táctil):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {CATHETER_STRUCTURES.map((st) => {
                    const isSelected = activeStructure.id === st.id;
                    return (
                      <button
                        type="button"
                        key={st.id}
                        onClick={() => setSelectedStructureId(st.id)}
                        aria-pressed={isSelected}
                        className={`min-h-[40px] px-2.5 py-1.5 rounded-xl border text-left text-[11px] font-medium transition-all flex items-center justify-between gap-1.5 ${
                          isSelected
                            ? "bg-cyan-500/25 border-cyan-400 text-white"
                            : "bg-slate-950/70 hover:bg-slate-800 border-white/5 text-slate-300"
                        }`}
                      >
                        <span className="truncate">{st.shortName}</span>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Fichas canónicas de agentes relacionados con catéteres (CAT-21 p. 14) */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 space-y-2.5">
              <span className="text-xs font-bold text-white block">
                Agentes asociados a colonización e IAC (fichas canónicas):
              </span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                El modelo 3D representa microcolonias a nivel conceptual; la identificación de especie requiere cultivo microbiológico. Consulta las fichas existentes:
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {RELATED_AGENTS.map((ag) => (
                  <Link
                    key={ag.id}
                    href={`/agentes-infecciosos/catalogo/${ag.id}`}
                    title={ag.note}
                    className="inline-flex min-h-[36px] items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-200 text-[11px] border border-cyan-500/25 transition-colors"
                  >
                    <span className="italic">{ag.name}</span>
                    <ExternalLink className="w-3 h-3 text-cyan-400" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* 4. DISTINCIÓN CIENTÍFICA: ACCESO INTRAVASCULAR VS. PERITONEODIÁLISIS (CAT-21 pág. 12) */}
      <GlassCard className="p-5 sm:p-6 border-white/10 space-y-4">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <h3 className="text-sm font-bold text-white">
            Distinción Anatómica Esencial: Catéter Intravascular frente a Catéter de Peritoneodiálisis (CAT-21 · Pág. 12)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-cyan-500/25 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-cyan-300 text-xs sm:text-sm">
                Catéter Venoso Central (CVC) y Catéter de Hemodiálisis
              </span>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-200 font-mono text-[10px] border border-cyan-500/30">
                Acceso intravascular directo
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Su extremo distal se ubica directamente dentro del lumen de un gran vaso venoso (ej. vena cava superior) o la aurícula derecha. Permiten infundir tratamientos, obtener muestras o extraer y retornar sangre hacia el filtro de hemodiálisis.
            </p>
            <p className="text-slate-400 text-[11px]">
              <strong className="text-slate-200">Riesgo microbiológico directo:</strong> La colonización de su superficie o lumen está en contacto directo con la corriente sanguínea y puede dar origen a una bacteriemia o fungemia asociada a catéter.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/70 border border-amber-500/25 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-amber-300 text-xs sm:text-sm">
                Catéter de Peritoneodiálisis
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-200 font-mono text-[10px] border border-amber-500/30">
                Cavidad peritoneal (NO intravascular)
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Atraviesa la pared abdominal para alojarse en la <strong>cavidad peritoneal</strong>, no dentro de un vaso sanguíneo. Utiliza la membrana peritoneal ricamente vascularizada como filtro natural de intercambio con el líquido de diálisis infundido.
            </p>
            <p className="text-slate-400 text-[11px]">
              <strong className="text-slate-200">Distinción clave:</strong> Aunque cumple la función de depurar solutos de la sangre a través del peritoneo, <strong>no es un acceso intravascular directo</strong>; su complicación infecciosa primaria es la peritonitis asociada al catéter peritoneal.
            </p>
          </div>
        </div>
      </GlassCard>

      {/* 5. DECIDIR ANTES DE REVELAR -> FEEDBACK -> REINTENTAR */}
      <GlassCard className="p-5 sm:p-6 border-white/10 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Comprobación Conceptual: Observar, Decidir y Explicar</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Responde las tres preguntas a partir de lo explorado en el modelo antes de revelar la explicación completa.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {showExplanation && (
              <button
                type="button"
                onClick={() => setShowExplanation(false)}
                className="inline-flex min-h-[40px] items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-white/10 transition-colors"
              >
                <EyeOff className="w-3.5 h-3.5" />
                <span>Ocultar explicación</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleFullReset}
              className="inline-flex min-h-[40px] items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono border border-white/10 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reiniciar actividad</span>
            </button>
          </div>
        </div>

        {/* Pregunta 1 */}
        <div className="space-y-2.5">
          <p className="text-xs font-semibold text-slate-200">
            1. Si activas la vista del lumen (corte longitudinal) y observas microcolonias adheridas en el canal interno del catéter, ¿qué puerta de entrada explica principalmente esa localización?
          </p>
          <div className="space-y-2">
            {[
              {
                id: 0,
                text: "El ingreso de microorganismos a través del conector proximal (hub) durante su manipulación o por el líquido infundido, avanzando por el conducto interno.",
              },
              {
                id: 1,
                text: "La producción espontánea de bacterias por parte de las células endoteliales sanas de la pared venosa.",
              },
              {
                id: 2,
                text: "El paso directo de líquido desde la cavidad peritoneal hacia el interior del polímero sin atravesar conexiones.",
              },
            ].map((opt) => {
              const isSelected = q1Answer === opt.id;
              const isCorrect = opt.id === 0;
              let btnStyle =
                "bg-slate-900/60 border-white/5 hover:border-slate-600 text-slate-300";
              if (showExplanation) {
                if (isCorrect)
                  btnStyle = "bg-emerald-950/40 border-emerald-500/50 text-emerald-200";
                else if (isSelected)
                  btnStyle = "bg-rose-950/40 border-rose-500/50 text-rose-200";
              } else if (isSelected) {
                btnStyle = "bg-cyan-500/20 border-cyan-400 text-white";
              }

              return (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => !showExplanation && setQ1Answer(opt.id)}
                  disabled={showExplanation}
                  className={`w-full min-h-[44px] p-3 rounded-xl border text-left text-xs transition-all flex items-start gap-2.5 ${btnStyle}`}
                >
                  <span className="font-mono font-bold text-slate-400 shrink-0">
                    [{String.fromCharCode(65 + opt.id)}]
                  </span>
                  <span className="leading-relaxed">{opt.text}</span>
                  {showExplanation && isCorrect && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-auto" />
                  )}
                  {showExplanation && isSelected && !isCorrect && (
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0 ml-auto" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Pregunta 2 */}
        <div className="space-y-2.5 pt-2">
          <p className="text-xs font-semibold text-slate-200">
            2. Al observar el estado «Biofilm establecido» sobre el catéter en el visor, ¿qué límite de interpretación debe mantenerse respecto al paciente?
          </p>
          <div className="space-y-2">
            {[
              {
                id: 0,
                text: "Que la presencia de biofilm sobre el dispositivo equivale siempre a shock séptico inmediato sin necesidad de exámenes.",
              },
              {
                id: 1,
                text: "Que el biofilm representa colonización de la superficie del dispositivo con matriz extracelular, pero no demuestra por sí solo bacteriemia ni sepsis, las cuales requieren confirmación mediante hemocultivos y evaluación clínica.",
              },
              {
                id: 2,
                text: "Que las bacterias dentro del biofilm ya no están vivas y por lo tanto nunca pueden pasar al torrente sanguíneo.",
              },
            ].map((opt) => {
              const isSelected = q2Answer === opt.id;
              const isCorrect = opt.id === 1;
              let btnStyle =
                "bg-slate-900/60 border-white/5 hover:border-slate-600 text-slate-300";
              if (showExplanation) {
                if (isCorrect)
                  btnStyle = "bg-emerald-950/40 border-emerald-500/50 text-emerald-200";
                else if (isSelected)
                  btnStyle = "bg-rose-950/40 border-rose-500/50 text-rose-200";
              } else if (isSelected) {
                btnStyle = "bg-cyan-500/20 border-cyan-400 text-white";
              }

              return (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => !showExplanation && setQ2Answer(opt.id)}
                  disabled={showExplanation}
                  className={`w-full min-h-[44px] p-3 rounded-xl border text-left text-xs transition-all flex items-start gap-2.5 ${btnStyle}`}
                >
                  <span className="font-mono font-bold text-slate-400 shrink-0">
                    [{String.fromCharCode(65 + opt.id)}]
                  </span>
                  <span className="leading-relaxed">{opt.text}</span>
                  {showExplanation && isCorrect && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-auto" />
                  )}
                  {showExplanation && isSelected && !isCorrect && (
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0 ml-auto" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Pregunta 3 */}
        <div className="space-y-2.5 pt-2">
          <p className="text-xs font-semibold text-slate-200">
            3. En relación con los dispositivos médicos revisados en la cátedra, ¿cuál es la diferencia anatómica fundamental entre un catéter de hemodiálisis y un catéter de peritoneodiálisis?
          </p>
          <div className="space-y-2">
            {[
              {
                id: 0,
                text: "Ambos se insertan directamente en la aurícula derecha del corazón, variando únicamente el grosor del tubo.",
              },
              {
                id: 1,
                text: "El catéter de hemodiálisis es un acceso intravascular directo alojado en el sistema venoso central, mientras que el catéter de peritoneodiálisis se aloja en la cavidad peritoneal y no dentro de un vaso sanguíneo.",
              },
              {
                id: 2,
                text: "El catéter de peritoneodiálisis no puede formar biofilm en su superficie porque el peritoneo disuelve los polímeros.",
              },
            ].map((opt) => {
              const isSelected = q3Answer === opt.id;
              const isCorrect = opt.id === 1;
              let btnStyle =
                "bg-slate-900/60 border-white/5 hover:border-slate-600 text-slate-300";
              if (showExplanation) {
                if (isCorrect)
                  btnStyle = "bg-emerald-950/40 border-emerald-500/50 text-emerald-200";
                else if (isSelected)
                  btnStyle = "bg-rose-950/40 border-rose-500/50 text-rose-200";
              } else if (isSelected) {
                btnStyle = "bg-cyan-500/20 border-cyan-400 text-white";
              }

              return (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => !showExplanation && setQ3Answer(opt.id)}
                  disabled={showExplanation}
                  className={`w-full min-h-[44px] p-3 rounded-xl border text-left text-xs transition-all flex items-start gap-2.5 ${btnStyle}`}
                >
                  <span className="font-mono font-bold text-slate-400 shrink-0">
                    [{String.fromCharCode(65 + opt.id)}]
                  </span>
                  <span className="leading-relaxed">{opt.text}</span>
                  {showExplanation && isCorrect && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-auto" />
                  )}
                  {showExplanation && isSelected && !isCorrect && (
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0 ml-auto" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Botón para revelar explicación */}
        {!showExplanation ? (
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => setShowExplanation(true)}
              disabled={q1Answer === null || q2Answer === null || q3Answer === null}
              className={`min-h-[44px] px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
                q1Answer !== null && q2Answer !== null && q3Answer !== null
                  ? "bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-md shadow-cyan-950/40"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed"
              }`}
            >
              <span>Revelar explicación y criterios</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-cyan-500/30 space-y-3 text-xs">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-cyan-300 font-bold">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                <span>Explicación de criterios y límites de interpretación:</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setQ1Answer(null);
                  setQ2Answer(null);
                  setQ3Answer(null);
                  setShowExplanation(false);
                }}
                className="text-[11px] font-mono text-amber-300 hover:underline"
              >
                Reintentar preguntas
              </button>
            </div>

            <div className="space-y-2 text-slate-200 leading-relaxed">
              <p>
                • <strong>Rutas extraluminal e intraluminal:</strong> Los microorganismos de la piel en el sitio de entrada suelen migrar por la <em>superficie externa</em> del catéter (ruta extraluminal), mientras que la contaminación del conector (<em>hub</em>) durante su manipulación o de los líquidos de infusión coloniza el <em>canal interno o lumen</em> (ruta intraluminal). Además, un catéter puede colonizarse de forma secundaria por vía hematógena desde un foco distante.
              </p>
              <p>
                • <strong>Colonización del dispositivo frente a infección sanguínea:</strong> La adhesión microbiana y el desarrollo de una matriz polimérica extracelular (biofilm) en el catéter constituyen <strong>colonización del dispositivo</strong>. Aunque el biofilm protege a los microorganismos de los antimicrobianos y de los leucocitos, <strong>no equivale automáticamente a bacteriemia ni a sepsis</strong>. Para confirmar una infección del torrente sanguíneo asociada a catéter se requiere demostrar microorganismos en la sangre mediante hemocultivos (incluyendo sangre periférica) junto con el cuadro clínico correspondiente.
              </p>
              <p>
                • <strong>Acceso vascular frente a peritoneodiálisis:</strong> Tanto el catéter venoso central (CVC) como el catéter de hemodiálisis ingresan directamente al sistema venoso central. En cambio, el catéter de peritoneodiálisis comunica con la cavidad peritoneal; no es un acceso intravascular directo.
              </p>
            </div>
          </div>
        )}
      </GlassCard>

      {/* 6. TRAZABILIDAD DE FUENTES Y LÍMITES DEL MODELO */}
      <GlassCard className="p-4 sm:p-5 border-white/10 bg-slate-950/80 space-y-2.5 text-[11px] text-slate-400">
        <div className="flex items-center gap-2 text-slate-200 font-bold text-xs">
          <BookOpen className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>Fuentes documentales y alcance de la representación 3D</span>
        </div>
        <ul className="space-y-1.5 leading-relaxed">
          <li>
            • <strong>Fuente docente primaria:</strong> Cátedra 21 — <em>Infecciones intravasculares</em> (TM. Felipe Córdova Lagos, Tecnología Médica CAS-UDD), páginas PDF 11–13 (CVC, catéter de hemodiálisis frente a peritoneodiálisis, infecciones asociadas a catéter y formación de biofilm) y página 14 (agentes etiológicos asociados).
          </li>
          <li>
            • <strong>Fuentes oficiales de contraste para patogenia de biofilm y rutas:</strong>{" "}
            <a
              href="https://www.cdc.gov/infection-control/hcp/intravascular-catheter-related-infection/index.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-300 hover:underline inline-flex items-center gap-1"
            >
              <span>CDC / HICPAC — Guidelines for the Prevention of Intravascular Catheter-Related Infections</span>
              <ExternalLink className="w-3 h-3" />
            </a>{" "}
            e IDSA Clinical Practice Guidelines for Intravascular Catheter-Related Infection (distinción entre colonización del catéter e infección del torrente sanguíneo).
          </li>
          <li>
            • <strong>Simplificaciones y límites:</strong> Reconstrucción 3D procedimental con fines exclusivamente educativos. El tamaño de las células bacterianas, los eritrocitos, la vaina de fibrina y el espesor de la matriz polimérica están ampliados respecto al diámetro del catéter para permitir su visualización conjunta. No representa tiempos clínicos de evolución, ni enseña técnicas de inserción o protocolos terapéuticos.
          </li>
        </ul>
      </GlassCard>
    </div>
  );
};
