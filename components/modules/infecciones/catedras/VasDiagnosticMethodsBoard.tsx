"use client";

import React, { useState } from "react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  ClipboardList, 
  ExternalLink, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Info, 
  ArrowRight,
  Eye,
  Microscope,
  FlaskConical,
  Dna,
  ShieldAlert,
  Heart,
  Activity
} from "lucide-react";

type MethodCategory = "imagen" | "microscopia" | "cultivo" | "antigeno" | "serologia" | "molecular";

interface MethodInfo {
  id: MethodCategory;
  name: string;
  badge: string;
  badgeColor: string;
  answersQuestion: string;
  evidenceProvided: string;
  limitations: string;
  clinicalExamples: string[];
}

const METHODS_CATALOG: MethodInfo[] = [
  {
    id: "imagen",
    name: "Estudios de Imagen (Ecocardiograma, TAC, Ecografía)",
    badge: "Evidencia Anatómica y Estructural",
    badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    answersQuestion: "¿Dónde se localiza el daño anatómico y qué repercusión mecánica o complicación existe?",
    evidenceProvided: "Visualiza directamente la presencia, tamaño y movilidad de vegetaciones valvulares (ecocardiograma transtorácico o transesofágico), abscesos perivalvulares, dehiscencia de prótesis o embolias metastásicas (TAC de bazo/cerebro).",
    limitations: "NO identifica el microorganismo causante ni su perfil de resistencia. Una imagen anatómica nunca sustituye al diagnóstico microbiológico.",
    clinicalExamples: [
      "Ecocardiograma transesofágico en endocarditis infecciosa (Criterio mayor de Duke)",
      "Ecografía abdominal para detectar abscesos hepáticos piogénicos o dilatación de vía biliar"
    ]
  },
  {
    id: "microscopia",
    name: "Microscopía Óptica Directa (Gram, Giemsa, Fresco)",
    badge: "Morfología Inmediata",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    answersQuestion: "¿Qué morfología celular, afinidad de tinción o parásito vivo se visualiza directamente?",
    evidenceProvided: "Aporta un resultado morfológico urgente en minutos: cocos grampositivos en racimos en hemocultivo, tripomastigotes móviles de T. cruzi en gota fresca (Chagas agudo), o trofozoítos anulares de Plasmodium en frotis fino.",
    limitations: "Requiere una densidad de microorganismos relativamente alta para ser detectable al ojo humano y no determina especie bacteriana ni susceptibilidad a antibióticos.",
    clinicalExamples: [
      "Tinción de Gram de frasco de hemocultivo positivo",
      "Frotis fino y gota gruesa con Giemsa en sospecha de malaria"
    ]
  },
  {
    id: "cultivo",
    name: "Cultivo Microbiológico (Hemocultivos y Medios)",
    badge: "Viabilidad y Susceptibilidad (Gold Standard)",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    answersQuestion: "¿El microorganismo está vivo, qué especie exacta es y a qué antimicrobianos es sensible?",
    evidenceProvided: "Aislamiento de colonias bacterianas o fúngicas vivas. Permite identificación definitiva por espectrometría de masas (MALDI-TOF) y determinación fenotípica de Concentración Inhibitoria Mínima (CIM) de antibióticos.",
    limitations: "Requiere tiempo de incubación (24-72 horas o más). Su rendimiento cae drásticamente si se administraron antibióticos antes de la toma de muestra.",
    clinicalExamples: [
      "Hemocultivos seriados en bacteriemia y endocarditis infecciosa",
      "Cultivo de líquido aspirado de absceso hepático"
    ]
  },
  {
    id: "antigeno",
    name: "Detección Rápida de Antígenos (PDR / ELISA Ag)",
    badge: "Proteínas del Patógeno",
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    answersQuestion: "¿Hay proteínas o toxinas solubles del germen en la muestra biológica?",
    evidenceProvided: "Detección rápida en 15-20 minutos mediante anticuerpos monoclonales específicos (inmunocromatografía) sin necesidad de infraestructura de cultivo compleja ni microscopista experto.",
    limitations: "No evalúa la viabilidad del germen ni su susceptibilidad a antibióticos. Ciertos antígenos (ej. HRP-2 de malaria) pueden persistir semanas tras la curación biológica.",
    clinicalExamples: [
      "Tira rápida de HRP-2 y pLDH para malaria",
      "Detección de toxinas de Shiga en heces mediante inmunoensayo"
    ]
  },
  {
    id: "serologia",
    name: "Serología de Anticuerpos (IgM / IgG)",
    badge: "Respuesta Inmune del Huésped",
    badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    answersQuestion: "¿Ha tenido el sistema inmunitario del huésped contacto activo o pasado con el agente?",
    evidenceProvided: "Cuantificación de anticuerpos IgM (infección reciente) o IgG (memoria/infección latente). Es el método diagnóstico fundamental en patologías donde el parásito no circula en sangre en cantidad detectable.",
    limitations: "No mide directamente la bacteria o parásito vivo. En fase aguda temprana suele ser negativa (ventana serológica) y no sirve para evaluar eficacia antibiótica inmediata.",
    clinicalExamples: [
      "Diagnóstico de Chagas crónico mediante al menos 2 técnicas IgG distintas concordantes",
      "Marcadores de Hepatitis B (Anti-HBc, Anti-HBs)"
    ]
  },
  {
    id: "molecular",
    name: "Biología Molecular (PCR / NAAT)",
    badge: "Material Genético (ADN / ARN)",
    badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    answersQuestion: "¿Hay secuencias genómicas específicas del patógeno presentes en la muestra?",
    evidenceProvided: "Amplificación enzimática de fragmentos de ADN o ARN con extraordinaria sensibilidad y especificidad, incluso con cargas mínimas de microorganismos viables o no viables.",
    limitations: "Mayor costo y requerimiento de equipamiento. Puede detectar fragmentos de ADN no viables tras tratamiento exitoso sin implicar infección activa.",
    clinicalExamples: [
      "Carga viral cuantitativa de ARN-VHC o ADN-VHB",
      "PCR en sangre en Chagas congénito o casos atípicos"
    ]
  }
];

export const VasDiagnosticMethodsBoard: React.FC = () => {
  const [selectedMethodId, setSelectedMethodId] = useState<MethodCategory>("imagen");

  // Student Critical Thinking State
  const [q1Answer, setQ1Answer] = useState<number | null>(null);
  const [q2Answer, setQ2Answer] = useState<number | null>(null);
  const [hasEvaluated, setHasEvaluated] = useState(false);

  const activeMethod = METHODS_CATALOG.find(m => m.id === selectedMethodId)!;

  const handleReset = () => {
    setQ1Answer(null);
    setQ2Answer(null);
    setHasEvaluated(false);
    setSelectedMethodId("imagen");
  };

  return (
    <div className="space-y-6">
      
      {/* Encabezado Pedagógico */}
      <GlassCard className="p-6 border-amber-500/30 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-cyan-950/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4 mb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-xs font-bold border border-cyan-500/30">
                VAS-12 · Actividad interactiva
              </span>
              <span className="text-xs text-slate-400 font-mono">CAT-21 · Págs. 24-25</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-cyan-400" />
              Qué Método de Estudio Aporta Cada Evidencia Clínica
            </h2>
          </div>

          <span className="text-xs text-slate-400 font-mono bg-slate-950 px-3 py-1.5 rounded-xl border border-white/5">
            Tablero Comparativo Conceptual
          </span>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed">
          <strong className="text-white">Objetivo conceptual:</strong> Comparar rigurosamente qué pregunta responde cada categoría diagnóstica (estudios de imagen, microscopía directa, cultivo, antígenos, anticuerpos y biología molecular), comprendiendo por qué las imágenes anatómicas no sustituyen a la identificación microbiológica y cómo se complementan entre sí.
        </p>
      </GlassCard>

      {/* Tablero de Métodos */}
      <div className="space-y-4">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1.5 mb-1">
            <ClipboardList className="w-3.5 h-3.5 text-cyan-400" />
            Explora las Tecnologías Diagnósticas:
          </span>
          <p className="text-xs text-slate-400">
            Selecciona un método para verificar qué evidencia aporta, cuál es su límite y en qué situaciones clínicas se indica.
          </p>
        </div>

        {/* Botones de Categorías */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {METHODS_CATALOG.map((m) => {
            const isSelected = selectedMethodId === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setSelectedMethodId(m.id)}
                className={`p-3 rounded-2xl text-left border transition-all flex flex-col justify-between gap-1.5 min-h-[74px] ${
                  isSelected
                    ? "bg-slate-800/95 border-cyan-400 ring-2 ring-cyan-400/20 shadow-lg"
                    : "bg-slate-900/50 hover:bg-slate-900 border-white/5 text-slate-300"
                }`}
              >
                <span className={`text-[8px] font-mono px-1.5 py-0.2 rounded-full border w-fit ${m.badgeColor}`}>
                  {m.id.toUpperCase()}
                </span>
                <span className="text-xs font-bold text-white leading-snug line-clamp-2">
                  {m.name.split(" (")[0]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Panel Detallado de la Tecnología Seleccionada */}
        <GlassCard className="p-5 border-white/10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                {activeMethod.badge}
              </span>
              <h3 className="text-base font-bold text-white">
                {activeMethod.name}
              </h3>
            </div>
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-200">
              <strong className="text-cyan-300">Pregunta central:</strong> {activeMethod.answersQuestion}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-1.5">
              <span className="font-semibold text-slate-200 block">Tipo de Evidencia Biológica que Aporta:</span>
              <p className="text-slate-300 leading-relaxed">{activeMethod.evidenceProvided}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 space-y-1.5">
              <span className="font-bold text-amber-300 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-amber-400" />
                Límites Epistemológicos (Qué NO permite afirmar):
              </span>
              <p className="leading-relaxed">{activeMethod.limitations}</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 text-xs text-slate-300 space-y-2">
            <span className="font-semibold text-cyan-300 block">Ejemplos Curriculares en Cátedras 20 y 21:</span>
            <ul className="space-y-1 text-slate-300">
              {activeMethod.clinicalExamples.map((ex, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span>{ex}</span>
                </li>
              ))}
            </ul>
          </div>
        </GlassCard>
      </div>

      {/* Ejercicio de Juicio Crítico */}
      <GlassCard className="p-6 border-white/10 space-y-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              Juicio Conceptual: Complementariedad de Métodos Diagnósticos
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Demuestra cómo articular métodos de estructura y métodos microbiológicos.
            </p>
          </div>
          {(q1Answer !== null || q2Answer !== null) && (
            <button
              onClick={handleReset}
              className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restablecer</span>
            </button>
          )}
        </div>

        {/* Pregunta 1 */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-200 block">
            Pregunta 1: Un ecocardiograma transesofágico visualiza claramente una masa vegetante móvil de 10 mm en la válvula mitral. ¿Por qué este hallazgo imagenológico NO es suficiente por sí solo para definir la antibioticoterapia dirigida?
          </label>
          <div className="space-y-2">
            {[
              { id: 0, text: "Porque el ecocardiograma aporta evidencia anatómica macroscópica de la lesión (vegetación), pero es incapaz de identificar la especie bacteriana o fúngica responsable ni determinar su sensibilidad antibiótica (CIM), lo cual requiere obligatoriamente hemocultivos." },
              { id: 1, text: "Porque la ecografía solo funciona en pacientes sin fiebre." },
              { id: 2, text: "Porque las masas valvulares en ecocardiograma siempre corresponden a trombos estériles y nunca a infecciones." }
            ].map((opt) => {
              const isSelected = q1Answer === opt.id;
              const isCorrect = opt.id === 0;
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
                  onClick={() => !hasEvaluated && setQ1Answer(opt.id)}
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

        {/* Pregunta 2 */}
        <div className="space-y-3 pt-2">
          <label className="text-xs font-semibold text-slate-200 block">
            Pregunta 2: ¿En qué escenario clínico es indispensable la serología de anticuerpos IgG en lugar de un frotis sanguíneo directo?
          </label>
          <div className="space-y-2">
            {[
              { id: 0, text: "En la fase crónica de la enfermedad de Chagas, donde los parásitos ya no circulan en cantidades microscópicamente detectables en sangre y el diagnóstico se fundamenta en demostrar anticuerpos IgG mediante dos técnicas reactivas concordantes." },
              { id: 1, text: "En la fase aguda de la malaria por P. falciparum grave." },
              { id: 2, text: "En el shock séptico por S. aureus para saber si el paciente tiene fiebre." }
            ].map((opt) => {
              const isSelected = q2Answer === opt.id;
              const isCorrect = opt.id === 0;
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
                  onClick={() => !hasEvaluated && setQ2Answer(opt.id)}
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

        {/* Botón de Comprobación */}
        {!hasEvaluated ? (
          <div className="pt-2 flex justify-end">
            <button
              onClick={() => setHasEvaluated(true)}
              disabled={q1Answer === null || q2Answer === null}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
                q1Answer !== null && q2Answer !== null
                  ? "bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-md shadow-cyan-950/40"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed"
              }`}
            >
              <span>Verificar Integración Diagnóstica</span>
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
              El diagnóstico médico es un ensamble epistémico complementario. Las imágenes (ecocardiograma, TAC) detectan la perturbación anatómica y las consecuencias mecánicas locales, pero no pueden leer el genoma ni cultivar las bacterias. Los cultivos aportan la cepa viable y el perfil de susceptibilidad antimicrobiana. Por su parte, la serología es insustituible cuando el agente se oculta en los tejidos intracelulares con parasitemia indetectable (como en la fase crónica de Chagas). Cada método responde a una pregunta clínica distinta e imprescindible.
            </p>
          </div>
        )}
      </GlassCard>

    </div>
  );
};
