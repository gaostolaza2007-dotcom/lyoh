"use client";

import React from "react";
import { OftalmologiaNav } from "@/components/modules/oftalmologia/OftalmologiaNav";
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  Activity, 
  Clock, 
  Target, 
  Eye, 
  Compass, 
  Gauge, 
  CheckCircle2, 
  Info,
  ShieldAlert
} from "lucide-react";

export default function ExploracionOftalmologicaPage() {
  const explorationAreas = [
    {
      title: "Agudeza Visual (Lejana y Cercana)",
      icon: Target,
      color: "border-sky-500/30 text-sky-300 bg-sky-500/10",
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
      title: "Respuesta y Reflejos Pupilares",
      icon: Eye,
      color: "border-indigo-500/30 text-indigo-300 bg-indigo-500/10",
      description:
        "Evaluación de la integridad del arco reflejo pupilar aferente (Nervio Óptico - II par) y eferente parasimpático (Nervio Oculomotor - III par) para pesquisar alteraciones neuro-oftalmológicas precoces.",
      topics: [
        "Reflejo fotomotor directo (miosis ipsilateral)",
        "Reflejo consensual o indirecto (miosis contralateral)",
        "Test de la linterna oscilante (Swinging flashlight test)",
        "Defecto pupilar aferente relativo (DPAR / Pupila de Marcus Gunn)",
      ],
    },
    {
      title: "Motilidad Ocular Extrínseca",
      icon: Compass,
      color: "border-purple-500/30 text-purple-300 bg-purple-500/10",
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
      title: "Presión Intraocular y Tonometría",
      icon: Gauge,
      color: "border-teal-500/30 text-teal-300 bg-teal-500/10",
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
    <div className="space-y-6 animate-in fade-in duration-200">
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
          Fundamentos de los cuatro pilares de la evaluación clínica inicial del paciente oftalmológico. Este apartado preparará actividades formativas guiadas para comprender la metodología del examen ocular antes de la práctica en campos clínicos.
        </p>
      </div>

      {/* Banner de Estado Honesto */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <Clock className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <span className="font-bold text-xs sm:text-sm text-amber-300 block">
              Apartado en Preparación
            </span>
            <span className="text-xs text-slate-300">
              Las actividades formativas interactivas de simulación visual se integrarán en futuras tandas. No se incluyen pruebas que simulen diagnósticos clínicos reales.
            </span>
          </div>
        </div>

        <span className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 font-semibold text-xs border border-amber-500/30 shrink-0 w-fit">
          Fase 01: Estructura & Alcance
        </span>
      </div>

      {/* Cuadrícula de las 4 áreas de exploración preparadas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {explorationAreas.map((area) => {
          const Icon = area.icon;

          return (
            <GlassCard
              key={area.title}
              className="p-6 rounded-3xl border border-white/10 bg-slate-900/60 shadow-xl space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-2.5 rounded-2xl border ${area.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                    {area.title}
                  </h2>
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

              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                <span className="inline-flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Contenido interactivo en preparación</span>
                </span>
                <span className="text-[11px] font-mono text-slate-500">Módulo formativo</span>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Nota preventiva */}
      <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/10 text-xs text-slate-400 flex items-start space-x-2.5">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed text-[11px] sm:text-xs">
          <strong>Propósito estrictamente educativo:</strong> Las descripciones y futuras actividades buscan el entendimiento metodológico de las pruebas oftalmológicas. No reemplazan la formación presencial en laboratorios de simulación ni constituyen un dispositivo de medición óptica o médica.
        </p>
      </div>

    </div>
  );
}
