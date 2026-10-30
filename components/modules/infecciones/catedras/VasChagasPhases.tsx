"use client";

import React, { useState } from "react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  Bug, 
  ExternalLink, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Info, 
  ArrowRight,
  ShieldCheck,
  Activity,
  Heart,
  Eye,
  Microscope,
  FileText
} from "lucide-react";

type ChagasPhase = "transmision" | "aguda" | "cronica";

interface PhaseDetail {
  id: ChagasPhase;
  title: string;
  badge: string;
  badgeColor: string;
  summary: string;
  biology: string;
  labStrategy: {
    recommended: string[];
    ineffectiveOrLimited: string[];
    rationale: string;
  };
  keyTakeaway: string;
}

const PHASES_INFO: PhaseDetail[] = [
  {
    id: "transmision",
    title: "1. Mecanismo de Transmisión Vectorial",
    badge: "Vector y Puerta de Entrada",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    summary: "Diferenciación biológica fundamental: el parásito NO se inocula directamente con la picadura.",
    biology: "La vinchuca (Triatoma infestans) defeca cerca de la picadura mientras ingiere sangre. Las deyecciones contienen tripomastigotes metacíclicos infectantes. El prurito induce al huésped a rascarse, introduciendo pasivamente las heces en la microherida o a través de mucosas intactas (ej. conjuntiva, originando el signo de Romaña).",
    labStrategy: {
      recommended: [
        "Identificación entomológica del vector capturado (vigilancia)",
        "Otras vías de contagio: vertical/congénita, transfusional/trasplante y digestiva (ingesta de alimentos contaminados con triatominos triturados)"
      ],
      ineffectiveOrLimited: [
        "Buscar parásitos en sangre inmediatamente tras la picadura (requiere periodo de incubación tisular antes de la parasitemia patente)"
      ],
      rationale: "Comprender la entrada por deyecciones y microlesión explica por qué la higiene y el control del vector domiciliario interrumpen la transmisión primaria."
    },
    keyTakeaway: "A diferencia de la malaria (inoculación directa por saliva de Anopheles), en Chagas la infección es por contaminación de la herida con heces del triatomino."
  },
  {
    id: "aguda",
    title: "2. Fase Aguda (Parasitemia Elevada)",
    badge: "Detección Directa",
    badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    summary: "Multiplicación activa en células y presencia masiva de tripomastigotes móviles en sangre periférica.",
    biology: "Tripomastigotes sanguíneos invaden histiocitos y miocitos donde se transforman en amastigotes intracelulares. Puede cursar asintomática (la mayoría) o con fiebre, adenopatías, hepatoesplenomegalia y ocasionalmente miocarditis aguda grave.",
    labStrategy: {
      recommended: [
        "Examen parasitológico directo al microscopio: gota fresca (parásitos móviles con flagelo libre)",
        "Frotis sanguíneo teñido con Giemsa o gota gruesa",
        "Métodos de concentración: micrométodo con capilares de microhematocrito o técnica de Strout (ideal en recién nacidos / transmisión congénita)",
        "PCR para ADN de Trypanosoma cruzi en sangre periférica"
      ],
      ineffectiveOrLimited: [
        "Serología IgG convencional: suele ser NEGATIVA o de títulos muy bajos durante las primeras 4-8 semanas, por lo que no descarta fase aguda"
      ],
      rationale: "Dado el alto volumen de tripomastigotes circulantes, la visualización microscópica directa o la concentración física de sangre son rápidas y concluyentes."
    },
    keyTakeaway: "En la fase aguda, el diagnóstico es PARASITOLÓGICO DIRECTO (ver el parásito vivo o teñido en sangre)."
  },
  {
    id: "cronica",
    title: "3. Fase Crónica (Parasitemia Mínima o Nula)",
    badge: "Detección Indirecta / Serológica",
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    summary: "Persistencia tisular crónica con parásitos intracelulares escasos y respuesta inmunitaria humoral consolidada.",
    biology: "Puede mantenerse en forma indeterminada (sin daño orgánico detectable por años o décadas) o evolucionar en un 20-30% a formas viscerales: miocardiopatía dilatada chagásica (arritmias, insuficiencia cardíaca, bloqueo de rama derecha) y megavísceras digestivas (megaesófago, megacolon).",
    labStrategy: {
      recommended: [
        "Serología de anticuerpos IgG anti-T. cruzi mediante AL MENOS DOS TÉCNICAS DISTINTAS (ej. ELISA + IFI o HAI) con resultados concordantes positivos (estándar CDC / OMS)",
        "En caso de discrepancia serológica: realizar una tercera técnica dirimente (ej. Western Blot)"
      ],
      ineffectiveOrLimited: [
        "Frotis directo, gota fresca o gota gruesa: tienen una sensibilidad casi nula (<5%) debido a la bajísima carga de parásitos en sangre circulante",
        "Una única prueba serológica rápida aislada sin confirmación"
      ],
      rationale: "La parasitemia es intermitente y minúscula, por lo que la demostración de anticuerpos específicos de memoria refleja la infección latente activa."
    },
    keyTakeaway: "En la fase crónica, el diagnóstico es SEROLÓGICO (demostrar anticuerpos IgG específicos concordantes en 2 pruebas)."
  }
];

export const VasChagasPhases: React.FC = () => {
  const [activePhase, setActivePhase] = useState<ChagasPhase>("aguda");

  // Interactive Student Decision
  const [q1Answer, setQ1Answer] = useState<number | null>(null);
  const [q2Answer, setQ2Answer] = useState<number | null>(null);
  const [hasEvaluated, setHasEvaluated] = useState(false);

  const phaseData = PHASES_INFO.find(p => p.id === activePhase)!;

  const handleReset = () => {
    setQ1Answer(null);
    setQ2Answer(null);
    setHasEvaluated(false);
    setActivePhase("transmision");
  };

  return (
    <div className="space-y-6">
      
      {/* Encabezado Docente */}
      <GlassCard className="p-6 border-amber-500/30 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-purple-950/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4 mb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono text-xs font-bold border border-purple-500/30">
                VAS-07 · Actividad interactiva
              </span>
              <span className="text-xs text-slate-400 font-mono">CAT-21 · Págs. 15-16, 25</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Bug className="w-5 h-5 text-purple-400" />
              Enfermedad de Chagas (<em>Trypanosoma cruzi</em>)
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/agentes-infecciosos/catalogo/P03"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-xs border border-purple-500/30 transition-colors"
            >
              <span>Ficha T. cruzi</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <a
              href="https://www.cdc.gov/parasites/chagas/index.html"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-white/10 transition-colors"
            >
              <span>CDC Chagas</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed">
          <strong className="text-white">Objetivo conceptual:</strong> Relacionar la fase evolutiva de la infección por <em>Trypanosoma cruzi</em> con la estrategia diagnóstica microbiológica adecuada, y comprender la diferencia biológica entre inoculación salival y contaminación por deyecciones vectoriales.
        </p>
      </GlassCard>

      {/* Selector de Fases y Transmisión */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PHASES_INFO.map((p) => {
            const isSelected = activePhase === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setActivePhase(p.id)}
                className={`p-3.5 rounded-2xl text-left border transition-all flex flex-col justify-between gap-1.5 min-h-[78px] ${
                  isSelected
                    ? "bg-slate-800/95 border-purple-400 ring-2 ring-purple-400/20 shadow-lg"
                    : "bg-slate-900/50 hover:bg-slate-900 border-white/5 text-slate-300"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-bold text-white">{p.title}</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${p.badgeColor}`}>
                    {p.badge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2">
                  {p.summary}
                </p>
              </button>
            );
          })}
        </div>

        {/* Panel Detallado de la Fase Seleccionada */}
        <GlassCard className="p-5 border-white/10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 font-bold">
                Fisiopatología y Laboratorio
              </span>
              <h3 className="text-base font-bold text-white">
                {phaseData.title}
              </h3>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold border w-fit ${phaseData.badgeColor}`}>
              {phaseData.badge}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <span className="font-semibold text-slate-200 block">Comportamiento Biológico en el Huésped:</span>
            <p className="text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-white/5">
              {phaseData.biology}
            </p>
          </div>

          {/* Comparación de Laboratorio */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-2">
              <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Métodos Diagnósticos Indicados:
              </span>
              <ul className="space-y-1.5 text-slate-300">
                {phaseData.labStrategy.recommended.map((m, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/20 space-y-2">
              <span className="font-bold text-rose-300 flex items-center gap-1.5">
                <XCircle className="w-4 h-4 text-rose-400" />
                Métodos No Útiles o Limitados en esta Fase:
              </span>
              <ul className="space-y-1.5 text-slate-300">
                {phaseData.labStrategy.ineffectiveOrLimited.map((m, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold">•</span>
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-purple-500/20 text-xs text-purple-200/90 flex items-center gap-2">
            <Info className="w-4 h-4 text-purple-400 shrink-0" />
            <span><strong>Regla de oro:</strong> {phaseData.keyTakeaway}</span>
          </div>
        </GlassCard>
      </div>

      {/* Ejercicio de Juicio Crítico */}
      <GlassCard className="p-6 border-white/10 space-y-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" />
              Juicio Conceptual: Razonamiento de Fase y Diagnóstico en Chagas
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Evalúa los límites de las técnicas antes de revisar la fundamentación científica.
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
            Pregunta 1: ¿Por qué una gota fresca o un frotis sanguíneo son muy útiles en fase aguda pero inútiles para descartar la fase crónica?
          </label>
          <div className="space-y-2">
            {[
              { id: 0, text: "Porque en fase crónica el parásito pierde su flagelo en sangre y se disuelve en el plasma." },
              { id: 1, text: "Porque en fase crónica la parasitemia es intermitente y extraordinariamente baja, por lo que la probabilidad de encontrar tripomastigotes en una gota de sangre al microscopio es mínima, requiriéndose serología IgG demostrativa de contacto previo persistente." },
              { id: 2, text: "Porque en fase crónica la sangre no puede teñirse con Giemsa debido al cambio de pH sérico." }
            ].map((opt) => {
              const isSelected = q1Answer === opt.id;
              const isCorrect = opt.id === 1;
              let itemClass = "bg-slate-900/60 border-white/5 hover:border-slate-600 text-slate-300";
              if (hasEvaluated) {
                if (isCorrect) itemClass = "bg-emerald-950/40 border-emerald-500/50 text-emerald-200";
                else if (isSelected) itemClass = "bg-rose-950/40 border-rose-500/50 text-rose-200";
              } else if (isSelected) {
                itemClass = "bg-purple-500/20 border-purple-400 text-white";
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
            Pregunta 2: ¿Cómo se produce la transmisión vectorial de <em>T. cruzi</em> al ser humano y en qué se diferencia de la malaria?
          </label>
          <div className="space-y-2">
            {[
              { id: 0, text: "El parásito se transmite por deyecciones infectadas del triatomino que penetran por rascado en la piel o mucosas; NO se inocula por la saliva con la picadura como ocurre en Anopheles con Plasmodium." },
              { id: 1, text: "El triatomino inocula directamente los amastigotes mediante su aparato bucal perforador en los vasos sanguíneos." },
              { id: 2, text: "La transmisión vectorial solo ocurre si la persona inhala los huevos del insecto presentes en el polvo." }
            ].map((opt) => {
              const isSelected = q2Answer === opt.id;
              const isCorrect = opt.id === 0;
              let itemClass = "bg-slate-900/60 border-white/5 hover:border-slate-600 text-slate-300";
              if (hasEvaluated) {
                if (isCorrect) itemClass = "bg-emerald-950/40 border-emerald-500/50 text-emerald-200";
                else if (isSelected) itemClass = "bg-rose-950/40 border-rose-500/50 text-rose-200";
              } else if (isSelected) {
                itemClass = "bg-purple-500/20 border-purple-400 text-white";
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
                  ? "bg-purple-400 hover:bg-purple-300 text-slate-950 shadow-md shadow-purple-950/40"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed"
              }`}
            >
              <span>Verificar Criterios y Diagnóstico</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-900 border border-purple-500/30 space-y-3 animate-fade-in text-xs">
            <div className="flex items-center gap-2 text-purple-300 font-bold">
              <CheckCircle2 className="w-4 h-4 text-purple-400" />
              <span>Fundamentación Docente y Epidemiológica:</span>
            </div>
            <div className="space-y-2 text-slate-300 leading-relaxed">
              <p>
                • <strong>Dinámica parasitaria vs diagnóstico:</strong> La elección del examen responde directamente a la carga parasitaria. En fase aguda, los tripomastigotes pululan en el torrente sanguíneo, haciendo que la microscopía directa (gota fresca o Strout) sea altamente sensible. En cambio, en la fase crónica la parasitemia cae a niveles indetectables microscópicamente; por ello, la presencia de anticuerpos IgG específicos mediante al menos dos pruebas serológicas concordantes (ELISA, IFI, HAI) es el estándar internacional para confirmar infección crónica activa.
              </p>
              <p>
                • <strong>Contexto chileno actual (OPS/OMS):</strong> Chile fue certificado en 1999 como libre de transmisión vectorial intradomiciliaria de <em>Triatoma infestans</em>. Por tanto, el mapa histórico del PPT docente no representa la epidemiología vectorial activa en viviendas urbanas hoy, donde la vigilancia se focaliza en el tamizaje prenatal para evitar transmisión vertical/congénita, control de bancos de sangre y vigilancia de focos silvestres.
              </p>
            </div>
          </div>
        )}
      </GlassCard>

    </div>
  );
};
