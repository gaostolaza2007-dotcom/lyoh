"use client";

import React from "react";
import Link from "next/link";
import { OftalmologiaNav } from "@/components/modules/oftalmologia/OftalmologiaNav";
import { GlassCard } from "@/components/ui/GlassCard";
import { PupillaryReflexSimulator } from "@/components/modules/oftalmologia/PupillaryReflexSimulator";
import { 
  Activity, 
  Clock, 
  Target, 
  Eye, 
  Compass, 
  Gauge, 
  CheckCircle2, 
  ShieldAlert,
  Sparkles,
  ArrowUpRight
} from "lucide-react";

export default function ExploracionOftalmologicaPage() {
  const explorationAreas = [
    {
      id: "agudeza-visual",
      title: "Agudeza Visual (Lejana y Cercana)",
      icon: Target,
      color: "border-sky-500/30 text-sky-300 bg-sky-500/10",
      isAvailable: false,
      description:
        "Fundamentos de la resolución espacial retiniana mediante cartillas estándar (Snellen, LogMAR, Jaeger), agujero estenopeico para discriminar causa refractiva versus patológica, y registro sistemático monocular.",
      topics: [
        "Distancia calibrada de evaluación (6 metros / 20 pies)",
        "Notación fraccionaria (20/20) y decimal (1.0)",
        "Agujero estenopeico (pinhole) y discriminación de vicios de refracción",
        "Visión de cuenta dedos, movimiento de manos y percepción luminosa",
      ],
    },
    {
      id: "reflejos-pupilares",
      title: "Respuesta y Reflejos Pupilares",
      icon: Eye,
      color: "border-indigo-500/30 text-indigo-300 bg-indigo-500/10",
      isAvailable: true,
      description:
        "Evaluación de la integridad del arco reflejo pupilar aferente (Nervio Óptico - II par) y eferente parasimpático (Nervio Oculomotor - III par) para pesquisar alteraciones neuro-oftalmológicas precoces.",
      topics: [
        "Reflejo fotomotor directo (miosis ipsilateral)",
        "Reflejo consensual o indirecto (miosis contralateral)",
        "Integridad del quiasma y decusación mesencefálica bilateral",
        "Identificación clínica frente a la vista frontal del paciente",
      ],
    },
    {
      id: "motilidad-ocular",
      title: "Motilidad Ocular Extrínseca",
      icon: Compass,
      color: "border-purple-500/30 text-purple-300 bg-purple-500/10",
      isAvailable: false,
      description:
        "Examen dinámico de las nueve posiciones diagnósticas de la mirada para valorar el funcionamiento coordinado de los seis músculos extraoculares y sus tres pares craneales inervadores.",
      topics: [
        "Versiones (movimientos binoculares conjugados) y ducciones",
        "Acción aislada de rectos superior, inferior, medial y lateral",
        "Acción combinada de oblicuos superior (IV par) e inferior",
        "Detección inicial de estrabismo, forias y diplopía",
      ],
    },
    {
      id: "presion-intraocular",
      title: "Presión Intraocular y Tonometría",
      icon: Gauge,
      color: "border-teal-500/30 text-teal-300 bg-teal-500/10",
      isAvailable: false,
      description:
        "Principios hidrodinámicos del humor acuoso, equilibrio entre producción ciliar y drenaje trabecular, y medición biométrica de la presión intraocular (PIO) como factor de riesgo en glaucoma.",
      topics: [
        "Rango fisiológico poblacional (10 a 21 mmHg)",
        "Principio de aplanación de Imbert-Fick",
        "Influencia del grosor corneal central (paquimetría)",
        "Fluctuación nictameral de la presión intraocular",
      ],
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <OftalmologiaNav />

      {/* Encabezado del Apartado */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Activity className="w-6 h-6 text-indigo-400" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight break-words">
            2. Exploración Oftalmológica
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 max-w-4xl leading-relaxed">
          Fundamentos de los cuatro pilares de la evaluación clínica inicial del paciente oftalmológico. Explora la primera actividad interactiva sobre reflejos pupilares normales y conoce los objetivos metodológicos de cada área.
        </p>
      </div>

      {/* Banner de Estado Honesto */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-950/60 via-slate-900 to-indigo-950/50 border border-sky-500/30 text-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
            <Sparkles className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-xs sm:text-sm text-white block">
                Actividad interactiva disponible: Reflejos pupilares
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold border border-emerald-500/40">
                1 de 4 activa
              </span>
            </div>
            <span className="text-xs text-slate-300 block mt-0.5">
              Puedes probar a continuación la simulación de respuesta fotomotora directa y consensual. Las 3 áreas restantes continúan en preparación pedagógica.
            </span>
          </div>
        </div>

        <span className="px-3 py-1.5 rounded-xl bg-sky-500/20 text-sky-300 font-semibold text-xs border border-sky-500/30 shrink-0 w-fit">
          Fase 02: Simulación Funcional
        </span>
      </div>

      {/* ACTIVIDAD INTERACTIVA 1: Reflejos pupilares normales */}
      <PupillaryReflexSimulator />

      {/* Separador de las 4 áreas de exploración */}
      <div className="space-y-4 pt-4 border-t border-white/10">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Pilares de la Exploración Ocular
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Estructura curricular de las cuatro pruebas fundamentales del examen funcional.
          </p>
        </div>

        {/* Cuadrícula de las 4 áreas de exploración */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {explorationAreas.map((area) => {
            const Icon = area.icon;

            return (
              <GlassCard
                key={area.title}
                className={`p-6 rounded-3xl border bg-slate-900/60 shadow-xl space-y-4 flex flex-col justify-between transition-all ${
                  area.isAvailable 
                    ? "border-emerald-500/40 ring-1 ring-emerald-500/20" 
                    : "border-white/10"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2.5 rounded-2xl border ${area.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                        {area.title}
                      </h3>
                    </div>

                    {area.isAvailable && (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/30 shrink-0">
                        <Sparkles className="w-3 h-3 text-emerald-400" />
                        <span>Disponible</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {area.description}
                  </p>

                  <div className="space-y-1.5 pt-2 border-t border-white/5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Puntos de aprendizaje previstos:
                    </span>
                    <ul className="space-y-1 text-xs text-slate-300">
                      {area.topics.map((top, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                          <span className="leading-snug">{top}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                  {area.isAvailable ? (
                    <>
                      <a
                        href="#simulador-reflejos"
                        className="inline-flex items-center space-x-1.5 text-emerald-400 hover:text-emerald-300 font-semibold transition-colors focus:outline-none focus-visible:underline"
                      >
                        <span>Explorar reflejos pupilares</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                      <span className="text-[11px] font-mono text-emerald-400/80">Simulador activo</span>
                    </>
                  ) : (
                    <>
                      <span className="inline-flex items-center space-x-1.5 text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>Contenido interactivo en preparación</span>
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">Módulo formativo</span>
                    </>
                  )}
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>

      {/* Nota preventiva */}
      <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/10 text-xs text-slate-400 flex items-start space-x-2.5">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed text-[11px] sm:text-xs">
          <strong>Propósito estrictamente educativo:</strong> Las descripciones y simulaciones buscan el entendimiento cualitativo y metodológico de los arcos reflejos y pruebas oftalmológicas. No reemplazan la formación presencial en laboratorios de simulación ni constituyen un dispositivo de medición óptica o médica.
        </p>
      </div>

    </div>
  );
}