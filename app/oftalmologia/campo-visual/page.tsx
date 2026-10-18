"use client";

import React from "react";
import { OftalmologiaNav } from "@/components/modules/oftalmologia/OftalmologiaNav";
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  Compass, 
  Clock, 
  Target, 
  Activity, 
  CheckCircle2, 
  Info,
  ShieldCheck,
  Disc
} from "lucide-react";

export default function CampoVisualPage() {
  const campimetrySections = [
    {
      title: "La «Isla de Visión en un Mar de Ceguera»",
      icon: Disc,
      color: "border-amber-500/30 text-amber-300 bg-amber-500/10",
      description:
        "Metáfora clásica de Traquair que describe el campo visual como una colina tridimensional cuya cúspide es la fóvea (máxima sensibilidad diferencial al contraste) y cuyas pendientes descienden hacia la periferia, interrumpidas por un pozo vertical a 15° temporales: la mancha ciega anatómica.",
      points: [
        "Límites normales monoculares: 60° superior, 70° inferior, 60° nasal y 100° temporal",
        "Sensibilidad umbral medida en decibeles (dB, escala logarítmica invertida)",
        "Mancha ciega fisiológica: proyección óptica del disco óptico desprovisto de fotorreceptores",
      ],
    },
    {
      title: "Índices de Confiabilidad del Examen",
      icon: Target,
      color: "border-orange-500/30 text-orange-300 bg-orange-500/10",
      description:
        "Criterios de calidad perimétrica indispensables para validar si un informe computarizado refleja la función real del paciente o artefactos por fatiga o inatención.",
      points: [
        "Pérdidas de Fijación: control por método de Heijl-Krakau (luz proyectada en la mancha ciega; ideal < 20%)",
        "Falsos Positivos: el paciente responde sin estímulo lumínico (indica «gatillo fácil»; ideal < 15%)",
        "Falsos Negativos: no responde a un estímulo más brillante donde antes sí vio (indica fatiga o desatención)",
        "Tiempo de prueba: pruebas excesivamente prolongadas generan sesgo de agotamiento sensorial",
      ],
    },
    {
      title: "Mapas Numéricos y Gráficos (Estrategia SITA)",
      icon: Activity,
      color: "border-sky-500/30 text-sky-300 bg-sky-500/10",
      description:
        "Transformación de los umbrales de sensibilidad en representaciones diagnósticas comparadas con bases de datos normativas ajustadas por edad.",
      points: [
        "Mapa de Valores Crudos (dB) y Escala de Tonos de Gris (visión general rápida)",
        "Desviación Total (Total Deviation): pérdida global respecto a la población de la misma edad",
        "Desviación del Patrón (Pattern Deviation): filtra cataratas o miosis para aislar defectos localizados",
        "Índices Globales: Desviación Media (MD) y Desviación Estándar del Patrón (PSD)",
      ],
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <OftalmologiaNav />

      {/* Encabezado del Apartado */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Compass className="w-6 h-6 text-amber-400" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight break-words">
            5. Campo Visual
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 max-w-4xl leading-relaxed">
          Fundamentos de la perimetría computarizada estándar (Humphrey / Octopus), análisis de la fijación, sensibilidad retiniana y lectura sistemática del informe perimétrico.
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
              En fases posteriores se integrará un visor formativo de informes campimétricos comentados paso a paso. No se incluyen simulaciones de campimetría clínica en esta entrega.
            </span>
          </div>
        </div>

        <span className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 font-semibold text-xs border border-amber-500/30 shrink-0 w-fit">
          Fase 01: Fundamentos Perimétricos
        </span>
      </div>

      {/* Cuadrícula de Conceptos Clave de Campimetría */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {campimetrySections.map((sec) => {
          const Icon = sec.icon;

          return (
            <GlassCard
              key={sec.title}
              className="p-6 rounded-3xl border border-white/10 bg-slate-900/60 shadow-xl space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-2.5 rounded-2xl border ${sec.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                    {sec.title}
                  </h2>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {sec.description}
                </p>

                <div className="space-y-1.5 pt-2 border-t border-white/5">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                    Aspectos evaluados:
                  </span>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {sec.points.map((p, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span className="leading-snug">{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                <span className="inline-flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Actividad formativa en preparación</span>
                </span>
                <span className="text-[11px] font-mono text-slate-500">Perimetría</span>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Resumen de lectura sistemática */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/50 border border-white/10 space-y-3 text-xs text-slate-300">
        <div className="flex items-center space-x-2 font-bold text-white text-sm">
          <Info className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Esquema de lectura sistemática del campo visual:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-slate-400">
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/5 space-y-1">
            <span className="font-bold text-sky-400 block text-xs">Paso 1: Paciente y Parámetros</span>
            <p className="text-[11px]">Edad, corrección refractiva para cerca y tamaño pupilar (≥ 3 mm).</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/5 space-y-1">
            <span className="font-bold text-indigo-400 block text-xs">Paso 2: Confiabilidad</span>
            <p className="text-[11px]">Pérdidas de fijación &lt; 20%, falsos positivos &lt; 15% y falsos negativos.</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/5 space-y-1">
            <span className="font-bold text-amber-400 block text-xs">Paso 3: Índices Globales</span>
            <p className="text-[11px]">Desviación Media (daño general) y PSD (daño focal localizado).</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/5 space-y-1">
            <span className="font-bold text-teal-400 block text-xs">Paso 4: Mapa de Desviación</span>
            <p className="text-[11px]">Correlación con la capa de fibras nerviosas y distribución anatómica.</p>
          </div>
        </div>
      </div>

    </div>
  );
}
