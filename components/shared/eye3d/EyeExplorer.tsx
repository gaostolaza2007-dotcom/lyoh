"use client";

import React, { useState, useMemo } from "react";
import { EyeViewer3D } from "./EyeViewer3D";
import { 
  EYE_STRUCTURES, 
  EYE_LAYER_GROUPS, 
  EyeStructureInfo, 
  EyeLayerGroupId 
} from "./eyeAnatomy";
import { EYE_ANATOMICAL_SOURCES } from "./eyeSources";
import { 
  Eye, 
  Scissors, 
  Layers, 
  RotateCcw, 
  Info, 
  ChevronRight, 
  ChevronDown, 
  Sparkles, 
  BookOpen, 
  Check, 
  ExternalLink,
  ShieldAlert,
  X
} from "lucide-react";

export interface EyeExplorerProps {
  context?: "oftalmologia" | "optometria";
  className?: string;
}

export const EyeExplorer: React.FC<EyeExplorerProps> = ({
  context = "oftalmologia",
  className = "",
}) => {
  // Estado de modo: 'full' | 'cut' | 'layers'
  const [mode, setMode] = useState<"full" | "cut" | "layers">("full");

  // Estructura actualmente seleccionada
  const [selectedStructureId, setSelectedStructureId] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState(0);

  // Visibilidad de marcadores flotantes
  const [showMarkers, setShowMarkers] = useState<boolean>(false);

  // Modo didáctico de espesores aumentados ×2 (desactivado por defecto según requerimiento)
  const [doubleThickness, setDoubleThickness] = useState<boolean>(false);

  // Visibilidad individual de capas (en modo 'layers')
  const [layersVisibility, setLayersVisibility] = useState<Record<string, boolean>>({
    cornea: true,
    esclera: true,
    iris: true,
    cuerpo_ciliar: true,
    zonula: true,
    coroides: true,
    retina: true,
    cristalino: true,
    camaras: true,
    vitreo: true,
    nervio_optico: true,
    _cutActive: false, // permite aplicar corte mientras se exploran capas
  });

  // Modal / desplegable de fuentes científicas
  const [showSources, setShowSources] = useState<boolean>(false);

  // Filtro de búsqueda rápida en la lista accesible
  const [searchFilter, setSearchFilter] = useState<string>("");

  // Estructura seleccionada detallada
  const selectedStructure = useMemo(
    () => EYE_STRUCTURES.find((s) => s.id === selectedStructureId) || null,
    [selectedStructureId]
  );

  // Manejo de cambio de modo
  const handleModeChange = (newMode: "full" | "cut" | "layers") => {
    setMode(newMode);
    setSelectedStructureId(null);
    setResetToken(n => n + 1);
    if (newMode === "full") {
      // En modo ojo completo, restablecemos todas las capas
      setLayersVisibility((prev) => ({
        ...prev,
        cornea: true,
        esclera: true,
        iris: true,
        cuerpo_ciliar: true,
        zonula: true,
        coroides: true,
        retina: true,
        cristalino: true,
        camaras: true,
        vitreo: true,
        nervio_optico: true,
        _cutActive: false,
      }));
    } else if (newMode === "layers") {
      setLayersVisibility(prev => ({ ...prev, _cutActive: true, vitreo: false }));
    } else if (newMode === "cut") {
      // En modo corte anatómico, ocultamos el vítreo para apreciar las paredes internas
      setLayersVisibility((prev) => ({
        ...prev,
        vitreo: false,
        _cutActive: true,
      }));
    }
  };

  // Restaurar visibilidad de todas las capas
  const handleRestoreLayers = () => {
    setLayersVisibility({
      cornea: true,
      esclera: true,
      iris: true,
      cuerpo_ciliar: true,
      zonula: true,
      coroides: true,
      retina: true,
      cristalino: true,
      camaras: true,
      vitreo: true,
      nervio_optico: true,
      _cutActive: mode !== "full",
    });
  };

  // Botón "Ver ojo completo"
  const handleViewFullEye = () => {
    setMode("full");
    setResetToken(n => n + 1);
    setSelectedStructureId(null);
    setLayersVisibility((prev) => ({
      ...prev,
      cornea: true,
      esclera: true,
      iris: true,
      cuerpo_ciliar: true,
      zonula: true,
      coroides: true,
      retina: true,
      cristalino: true,
      camaras: true,
      vitreo: true,
      nervio_optico: true,
      _cutActive: false,
    }));
  };

  // Alternar capa individual
  const toggleLayer = (key: string) => {
    setLayersVisibility((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Estructuras filtradas para la lista accesible
  const filteredStructures = useMemo(() => {
    if (!searchFilter.trim()) return EYE_STRUCTURES;
    const q = searchFilter.toLowerCase();
    return EYE_STRUCTURES.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.latinName && s.latinName.toLowerCase().includes(q)) ||
        s.categoryLabel.toLowerCase().includes(q)
    );
  }, [searchFilter]);

  return (
    <div id="eye-explorer-container" className={`space-y-6 ${className}`}>
      
      {/* Barra de Modos de Exploración Principal */}
      <div id="eye-exploration-modes" role="group" aria-label="Modo de exploración del ojo" className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/70 border border-white/10 backdrop-blur-xl">
        <div className="grid grid-cols-3 items-stretch gap-2 sm:flex sm:flex-wrap sm:items-center">
          {/* Modo 1: Ojo completo */}
          <button
            type="button"
            onClick={() => handleModeChange("full")}
            aria-pressed={mode === "full"}
            style={{ minHeight: 44 }}
            className={`flex min-w-0 flex-col items-center justify-center gap-1 px-2 py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all sm:flex-row sm:gap-2 sm:px-3.5 ${
              mode === "full"
                ? "bg-sky-500 text-white shadow-lg shadow-sky-500/25 ring-2 ring-sky-400/40"
                : "bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-750"
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Ojo Completo</span>
          </button>

          {/* Modo 2: Corte anatómico */}
          <button
            type="button"
            onClick={() => handleModeChange("cut")}
            aria-pressed={mode === "cut"}
            style={{ minHeight: 44 }}
            className={`flex min-w-0 flex-col items-center justify-center gap-1 px-2 py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all sm:flex-row sm:gap-2 sm:px-3.5 ${
              mode === "cut"
                ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 ring-2 ring-indigo-400/40"
                : "bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-750"
            }`}
          >
            <Scissors className="w-4 h-4" />
            <span>Corte Anatómico</span>
          </button>

          {/* Modo 3: Capas */}
          <button
            type="button"
            onClick={() => handleModeChange("layers")}
            aria-pressed={mode === "layers"}
            style={{ minHeight: 44 }}
            className={`flex min-w-0 flex-col items-center justify-center gap-1 px-2 py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all sm:flex-row sm:gap-2 sm:px-3.5 ${
              mode === "layers"
                ? "bg-purple-500 text-white shadow-lg shadow-purple-500/25 ring-2 ring-purple-400/40"
                : "bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-750"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Capas y Túnicas</span>
          </button>
        </div>

        {/* Acciones de recuperación y fuentes */}
        <div className="flex items-center space-x-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={handleViewFullEye}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors"
            title="Recuperar vista inicial del ojo completo"
          >
            <RotateCcw className="w-3.5 h-3.5 text-sky-400" />
            <span>Ver ojo completo</span>
          </button>

          <button
            type="button"
            onClick={() => setShowSources(!showSources)}
            aria-label="Fuentes anatómicas"
            aria-expanded={showSources}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden md:inline">Fuentes</span>
          </button>
        </div>
      </div>

      {/* Cartel descriptivo según el modo activo */}
      {mode === "cut" && (
        <div className="p-3 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200 flex items-start space-x-2.5">
          <Scissors className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Corte anatómico horizontal:</strong> Se retira la mitad superior para explorar las túnicas, el iris, el cristalino y su aparato suspensorio. Es un corte del modelo 3D, con colores de apoyo para estudiar sus estructuras.
          </p>
        </div>
      )}

      {mode === "layers" && (
        <div className="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-500/30 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-purple-200">
              <Layers className="w-4 h-4 text-purple-400" />
              <span>Visibilidad de capas anatómicas</span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label className="flex min-h-11 items-center gap-2 text-xs text-purple-200">
                <input type="checkbox" checked={layersVisibility._cutActive} onChange={() => { toggleLayer("_cutActive"); setResetToken(n => n + 1); }} />
                Mantener corte anatómico
              </label>
              {/* Interruptor didáctico opcional: Espesores aumentados x2 */}
              <label className="flex items-center space-x-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={doubleThickness}
                  onChange={(e) => setDoubleThickness(e.target.checked)}
                  className="rounded border-white/20 bg-slate-900 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-[11px] font-semibold text-purple-300">
                  Espesores ampliados ×2 (modo didáctico)
                </span>
              </label>

              <button
                type="button"
                onClick={handleRestoreLayers}
                className="text-xs text-slate-400 hover:text-white underline underline-offset-2"
              >
                Restaurar todo
              </button>
            </div>
          </div>

          {/* Interruptores rápidos de capas */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-xs">
            {[
              { key: "cornea", label: "Córnea" },
              { key: "esclera", label: "Esclera" },
              { key: "iris", label: "Iris" },
              { key: "cuerpo_ciliar", label: "Cuerpo ciliar" },
              { key: "zonula", label: "Zónula" },
              { key: "cristalino", label: "Cristalino" },
              { key: "coroides", label: "Coroides" },
              { key: "retina", label: "Retina" },
              { key: "camaras", label: "Cámaras" },
              { key: "vitreo", label: "Vítreo" },
            ].map(({ key, label }) => {
              const active = layersVisibility[key] ?? true;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleLayer(key)}
                  aria-pressed={active}
                  aria-label={`${active ? "Ocultar" : "Mostrar"} capa ${label}`}
                  style={{ minHeight: 44 }}
                  className={`px-2.5 py-1.5 rounded-xl border text-left font-medium transition-colors flex items-center justify-between ${
                    active
                      ? "bg-purple-900/30 border-purple-500/40 text-purple-200"
                      : "bg-slate-900/50 border-white/5 text-slate-500 line-through"
                  }`}
                >
                  <span className="truncate">{label}</span>
                  <span className={`w-2 h-2 rounded-full ${active ? "bg-purple-400" : "bg-slate-700"}`} />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Disposición principal: Visor 3D a la izquierda, Panel de Estructuras a la derecha */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Columna del Visor 3D (7 u 8 columnas en escritorio) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          <EyeViewer3D
            mode={mode}
            layersVisibility={layersVisibility}
            selectedStructureId={selectedStructureId}
            onSelectStructure={setSelectedStructureId}
            showMarkers={showMarkers}
            onToggleMarkers={() => setShowMarkers(!showMarkers)}
            doubleThickness={doubleThickness}
            resetToken={resetToken}
          />

          {/* Ficha compacta de la estructura seleccionada (debajo del visor en móvil/escritorio) */}
          {selectedStructure && (
            <div className="p-5 rounded-3xl bg-slate-900/80 border border-sky-500/30 backdrop-blur-xl shadow-xl space-y-3 animate-in fade-in duration-200">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-300">
                      {selectedStructure.categoryLabel}
                    </span>
                    {selectedStructure.isConventionalColor && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300">
                        Color didáctico convencional
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-white flex items-center space-x-2">
                    <span>{selectedStructure.name}</span>
                    {selectedStructure.latinName && (
                      <span className="text-xs font-normal italic text-slate-400">
                        ({selectedStructure.latinName})
                      </span>
                    )}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedStructureId(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                  title="Cerrar ficha de estructura"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-xs">
                {/* Ubicación */}
                <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/5 space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-sky-400 block">
                    Ubicación espacial
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    {selectedStructure.location}
                  </p>
                </div>

                {/* Función biológica y óptica */}
                <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/5 space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 block">
                    Función biológica / óptica
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    {selectedStructure.functionDesc}
                  </p>
                </div>

                {/* Relaciones anatómicas */}
                <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/5 space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400 block">
                    Relaciones vecinas
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    {selectedStructure.relations}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Columna de Selección Accesible de Estructuras (4 o 5 columnas en escritorio) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4">
          <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl space-y-4">
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Eye className="w-4 h-4 text-sky-400" />
                  <span>Estructuras Anatómicas</span>
                </h4>
                <p className="text-[11px] text-slate-400">
                  Selecciona una estructura para resaltarla y leer su función
                </p>
              </div>

              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/10">
                {EYE_STRUCTURES.length} elementos
              </span>
            </div>

            {/* Buscador rápido */}
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Buscar estructura (ej. mácula, cristalino)..."
              aria-label="Buscar estructura anatómica"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
            />

            {/* Lista agrupada de estructuras accesibles */}
            <div className="max-h-[380px] sm:max-h-[460px] overflow-y-auto space-y-1.5 pr-1 focus:outline-none">
              {filteredStructures.map((struct) => {
                const isSelected = struct.id === selectedStructureId;
                return (
                  <button
                    key={struct.id}
                    type="button"
                    onClick={() => setSelectedStructureId(struct.id)}
                    aria-pressed={isSelected}
                    className={`w-full text-left p-2.5 rounded-2xl border transition-all flex items-center justify-between group ${
                      isSelected
                        ? "bg-sky-500/20 border-sky-400/60 text-white shadow-sm ring-1 ring-sky-400/40"
                        : "bg-slate-950/40 border-white/5 text-slate-300 hover:bg-slate-800/60 hover:text-white"
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center space-x-1.5">
                        <span className={`w-2 h-2 rounded-full ${isSelected ? "bg-sky-400 ring-2 ring-sky-300/40" : "bg-slate-600"}`} />
                        <span className="text-xs font-semibold truncate">
                          {struct.name}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 block truncate pl-3.5">
                        {struct.categoryLabel}
                      </span>
                    </div>

                    <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-transform ${isSelected ? "text-sky-300 translate-x-0.5" : "text-slate-600 group-hover:text-slate-400"}`} />
                  </button>
                );
              })}
            </div>

          </div>
        </div>

      </div>

      {/* Sección Plegable de Fuentes Científicas y Parámetros Anatómicos */}
      {showSources && (
        <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-indigo-500/30 backdrop-blur-xl shadow-2xl space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center space-x-2 text-sm font-bold text-white">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span>Documentación Anatómica y Referencias Biométricas</span>
            </div>
            <button
              type="button"
              onClick={() => setShowSources(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
            Este modelo es una <strong>reconstrucción tridimensional educativa</strong> basada en parámetros ópticos y biométricos consolidados. Los valores anatómicos reales varían individualmente con la edad, la refracción y el estado fisiológico:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {EYE_ANATOMICAL_SOURCES.map((src) => (
              <div
                key={src.id}
                className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5 space-y-1.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-indigo-300">{src.citation}</span>
                  {src.url && (
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-sky-300 shrink-0 inline-flex items-center space-x-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <p className="text-slate-200 font-medium">{src.title}</p>
                <p className="text-[11px] text-slate-400 italic">{src.publication}</p>
                <p className="text-[11px] text-slate-300 pt-1 border-t border-white/5">
                  <strong>Relevancia en el modelo:</strong> {src.relevance}
                </p>
              </div>
            ))}
          </div>

          <div className="text-[11px] text-amber-300/80 bg-amber-500/10 border border-amber-500/20 px-3.5 py-2 rounded-xl flex items-center space-x-2">
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Aviso de rigor:</strong> Reconstrucción 3D educativa. Prototipo pendiente de validación clínica presencial especializada. No apto para diagnóstico ni planificación quirúrgica.
            </span>
          </div>
        </div>
      )}

    </div>
  );
};
