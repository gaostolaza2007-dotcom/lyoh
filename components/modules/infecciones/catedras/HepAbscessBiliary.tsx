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
  ChevronRight,
  Crosshair,
  Layers,
  Activity
} from "lucide-react";

type AnatomicalFocus = "absceso_parenquima" | "colangitis_vias";

interface FocusInfo {
  id: AnatomicalFocus;
  title: string;
  anatomicalSite: string;
  typicalClinicalPicture: string;
  microbiologyEtiology: string;
  diagnosticGoldenRule: string;
}

const FOCI_DATA: Record<AnatomicalFocus, FocusInfo> = {
  absceso_parenquima: {
    id: "absceso_parenquima",
    title: "1. Absceso Hepático Piógeno (Parénquima)",
    anatomicalSite: "Parénquima hepático profundo (más frecuente en lóbulo derecho, único o múltiple).",
    typicalClinicalPicture: "Fiebre en agujas con escalofríos intensos, dolor sordo continuo en hipocondrio derecho que se exacerba con la puñopercusión hepática, astenia, diaforesis nocturna y pérdida de peso. La ictericia suele ser tardía o ausente a menos que comprima la vía biliar.",
    microbiologyEtiology: "Etiología habitualmente POLIMICROBIANA: bacilos Gram negativos entéricos (Escherichia coli, Klebsiella pneumoniae), estreptococos del grupo Streptococcus anginosus / milleri y anaerobios obligados (Bacteroides fragilis). En áreas endémicas debe diferenciarse del absceso amebiano por Entamoeba histolytica.",
    diagnosticGoldenRule: "La imagen ecográfica o tomográfica confirma la cavidad con pus, pero NO dice qué bacteria es. Se requiere aspiración percutánea con aguja para tinción de Gram y cultivo anaerobio/aerobio, junto a hemocultivos seriados."
  },
  colangitis_vias: {
    id: "colangitis_vias",
    title: "2. Colangitis Aguda Supurada (Árbol Biliar)",
    anatomicalSite: "Lumen de los conductos biliares intra y extrahepáticos (colédoco, conductos hepáticos).",
    typicalClinicalPicture: "Infección bacteriana ascendente precipitada por obstrucción biliar (coledocolitiasis en 80%, estenosis benignas o tumores). Tríada clásica de Charcot: Fiebre alta intermitente + Ictericia clínica + Dolor en hipocondrio derecho. Si progresa a shock y compromiso de conciencia se denomina Pentada de Reynolds.",
    microbiologyEtiology: "Bacterias de origen duodenal entérico que ascienden por estasis biliar retrógrada: Escherichia coli (25-50%), Klebsiella pneumoniae, Enterococcus faecalis y Pseudomonas aeruginosa en pacientes instrumentados.",
    diagnosticGoldenRule: "Emergencia médica que exige descompresión biliar urgente (por CPRE o drenaje percutáneo) y hemocultivos periféricos previos al inicio de antibióticos de amplio espectro."
  }
};

export const HepAbscessBiliary: React.FC = () => {
  const [selectedFocus, setSelectedFocus] = useState<AnatomicalFocus>("absceso_parenquima");
  const [studentChoice, setStudentChoice] = useState<string | null>(null);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);

  const currentFocus = FOCI_DATA[selectedFocus];

  const handleReset = () => {
    setSelectedFocus("absceso_parenquima");
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
              HEP-13 · Actividad interactiva
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              CAT-20 · Pág. 24
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Abscesos Hepáticos e Infección Biliar Bacteriana
          </h3>
          <p className="text-xs text-slate-300">
            <strong>Objetivo:</strong> Distinguir la localización anatómica precisa (parénquima vs. vía biliar canalicular) y comprender que la morfología imagenológica no reemplaza la identificación etiológica en microbiología.
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

      {/* Selector de Localización Anatómica */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
          Selecciona el territorio anatómico del proceso infeccioso:
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(["absceso_parenquima", "colangitis_vias"] as const).map((fKey) => {
            const isSelected = selectedFocus === fKey;
            const f = FOCI_DATA[fKey];
            return (
              <button
                key={fKey}
                onClick={() => setSelectedFocus(fKey)}
                aria-pressed={isSelected}
                className={`p-3.5 rounded-2xl text-left border transition-all min-h-[64px] flex flex-col justify-between ${
                  isSelected
                    ? "bg-amber-500/20 border-amber-400 shadow-lg shadow-amber-950/40 ring-1 ring-amber-400/30"
                    : "bg-slate-900/60 hover:bg-slate-900 text-slate-300 border-white/5"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? "text-amber-300" : "text-slate-400"}`}>
                    Territorio {fKey === "absceso_parenquima" ? "Parenquimatoso" : "Ductal Biliar"}
                  </span>
                  <Crosshair className={`w-4 h-4 ${isSelected ? "text-amber-400" : "text-slate-500"}`} />
                </div>
                <span className={`text-xs sm:text-sm font-bold leading-tight mt-1 ${isSelected ? "text-white" : "text-slate-200"}`}>
                  {f.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detalle Clínico y Fisiopatológico */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2">
          <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span>{currentFocus.title}</span>
          </h4>
          <span className="text-[11px] text-amber-300 font-mono">
            {currentFocus.anatomicalSite}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/5 space-y-1.5">
            <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px] block">
              Cuadro Clínico Distintivo:
            </span>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              {currentFocus.typicalClinicalPicture}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/5 space-y-1.5">
            <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px] block">
              Microbiología Típica y Vía de Entrada:
            </span>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              {currentFocus.microbiologyEtiology}
            </p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/70 border border-white/5 text-xs text-slate-300">
          <strong className="text-amber-400">Regla de oro de diagnóstico: </strong>
          {currentFocus.diagnosticGoldenRule}
        </div>
      </div>

      {/* Ejercicio del Estudiante */}
      <div className="p-4 sm:p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-3">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <h4 className="text-xs sm:text-sm font-bold text-white">
            Pregunta de Integración Anatómico-Microbiológica:
          </h4>
        </div>

        <p className="text-xs text-slate-200 leading-relaxed">
          Una tomografía abdominal revela una masa hipodensa de 6 cm con reborde captante en el lóbulo hepático derecho en un paciente con fiebre alta en agujas. 
          <strong>¿Por qué esta imagen radiológica por sí sola NO permite atribuir el cuadro a una especie bacteriana determinada ni descartar una causa amebiana?</strong>
        </p>

        {/* Opciones */}
        <div className="space-y-2 pt-1">
          {[
            {
              id: "opt-1",
              text: "Porque la tomografía define con precisión la localización anatómica y la cavitación tisular, pero las colecciones parenquimatosas por E. coli, Klebsiella pneumoniae o Entamoeba histolytica tienen una apariencia imagenológica superponible, requiriendo punción diagnóstica, cultivo y serología."
            },
            {
              id: "opt-2",
              text: "Porque las bacterias son visibles a simple vista en la pantalla del tomógrafo computarizado."
            },
            {
              id: "opt-3",
              text: "Porque todos los abscesos del lóbulo derecho son causados exclusivamente por virus respiratorios."
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
                <span>¡Criterio Clínico y Diagnóstico Exacto!</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-rose-400 font-bold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Revisa el papel de las imágenes frente al laboratorio microbiológico:</span>
              </div>
            )}

            <p className="text-slate-300 leading-relaxed text-[11px]">
              <strong>Fundamento Docente:</strong> Las técnicas de imagen (ecografía, TAC, resonancia) son insustituibles para confirmar la presencia, tamaño, número y resecabilidad/drenaje de un absceso hepático o la dilatación de la vía biliar en colangitis. Sin embargo, <strong>la imagen no es una técnica microbiológica de especie</strong>. La etiología puede ser bacteriana piógena (frecuentemente polimicrobiana con enterobacterias y anaerobios) o parasitaria (absceso amebiano por E. histolytica). La identificación exige punción-aspiración del pus para tinción de Gram, cultivo y serología amebiana.
            </p>

            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-200 text-[11px] flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong>Límite Científico:</strong> Colecistitis (inflamación de la vesícula biliar), colangitis (infección del árbol de conductos biliares) y absceso hepático (colección purulenta en el parénquima) son tres entidades anatómicas y clínicas distintas que no deben ser tratadas como sinónimos.
              </div>
            </div>
          </div>
        )}

      </div>

    </GlassCard>
  );
};
