"use client";

import React from "react";
import { OftalmologiaNav } from "@/components/modules/oftalmologia/OftalmologiaNav";
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  Wrench, 
  Clock, 
  Search, 
  Gauge, 
  Eye, 
  CheckCircle2, 
  ShieldCheck,
  Cpu
} from "lucide-react";

export default function InstrumentosPage() {
  const instruments = [
    {
      name: "Lámpara de Hendidura (Biomicroscopio Ocular)",
      subtitle: "Inspección biomicroscópica de polo anterior y posterior",
      icon: Search,
      color: "border-blue-500/30 text-blue-300 bg-blue-500/10",
      description:
        "Sistema óptico binocular de magnificación acoplado a una fuente de luz con hendidura regulable en anchura, altura y ángulo de incidencia. Permite realizar cortes ópticos transparentes en córnea y cristalino con técnicas de iluminación directa, difusa, retroiluminación y dispersión escleral.",
      parts: [
        "Sistema de observación binocular y oculares ajustables",
        "Torre de iluminación móvil con selector de hendidura y filtros (azul cobalto, aneritra)",
        "Plataforma de desplazamiento y palanca joystick con control de elevación",
        "Mentonera, barra frontal de apoyo y punto de fijación del paciente",
      ],
      clinicalRole:
        "Evaluación de superficie ocular, integridad epitelial con fluoresceína, celularidad en cámara anterior (Tyndall), profundidad de cámara anterior (técnica de Van Herick) y cataratas.",
    },
    {
      name: "Tonómetro de Aplanación (Goldmann y Aire)",
      subtitle: "Medición biométrica de la presión intraocular (PIO)",
      icon: Gauge,
      color: "border-sky-500/30 text-sky-300 bg-sky-500/10",
      description:
        "Instrumento montado en la lámpara de hendidura que mide la fuerza necesaria para aplanar una superficie corneal constante de 3.06 mm de diámetro. Utiliza un prisma biprismático que desdobla el menisco de fluoresceína en dos semicírculos luminosos.",
      parts: [
        "Prisma de aplanación desdoblador esterilizable",
        "Brazo de soporte móvil calibrado",
        "Tambor graduado en gramos de fuerza (multiplicados por 10 = mmHg)",
        "Filtro azul cobalto de la lámpara de hendidura para fluorescencia",
      ],
      clinicalRole:
        "Gold standard clínico en la determinación de la PIO. Diagnóstico, estratificación de riesgo y seguimiento terapéutico en pacientes con sospecha de glaucoma o hipertensión ocular.",
    },
    {
      name: "Oftalmoscopio (Directo e Indirecto)",
      subtitle: "Examen del polo posterior y fondo ocular",
      icon: Eye,
      color: "border-indigo-500/30 text-indigo-300 bg-indigo-500/10",
      description:
        "Dispositivo óptico para observar la retina, papila óptica, vasos retinianos y coroides. El oftalmoscopio directo ofrece una imagen recta y muy magnificada (~15x) con campo estrecho, mientras que el indirecto (binocular con lente condensadora de 20D) brinda visión estereoscópica panorámica de la retina periférica.",
      parts: [
        "Cabezal óptico con disco de lentes Rekoss (corrección dióptrica)",
        "Selector de apertura (haz grande, pequeño, hendidura, filtro verde libre de rojo)",
        "Fuente luminosa halógena o LED con reóstato de intensidad",
        "Lente condensadora asférica (+20D a +28D) para oftalmoscopía indirecta",
      ],
      clinicalRole:
        "Pesquisa de retinopatía diabética, retinopatía hipertensiva, edema de papila (hipertensión endocraneana), desprendimiento de retina y degeneración macular.",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <OftalmologiaNav />

      {/* Encabezado del Apartado */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Wrench className="w-6 h-6 text-blue-400" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight break-words">
            3. Instrumentos
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 max-w-4xl leading-relaxed">
          Estudio de los principios ópticos, partes fundamentales, indicaciones y manejo de los equipos clínicos más utilizados en la consulta oftalmológica y en las unidades de Tecnología Médica.
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
              En próximas fases se incorporarán diagramas desglosados e interactivos de cada instrumento. Sin simuladores mecánicos activos en esta etapa inicial.
            </span>
          </div>
        </div>

        <span className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 font-semibold text-xs border border-amber-500/30 shrink-0 w-fit">
          Fase 01: Inventario Clínico
        </span>
      </div>

      {/* Tarjetas de los 3 Instrumentos Fundamentales */}
      <div className="space-y-6">
        {instruments.map((inst) => {
          const Icon = inst.icon;

          return (
            <GlassCard
              key={inst.name}
              className="p-6 sm:p-7 rounded-3xl border border-white/10 bg-slate-900/60 shadow-xl space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-2xl border ${inst.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-xl font-bold text-white tracking-tight">
                      {inst.name}
                    </h2>
                    <p className="text-xs text-slate-400">
                      {inst.subtitle}
                    </p>
                  </div>
                </div>

                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-xs w-fit">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Esquema en preparación</span>
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {inst.description}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* Partes Principales */}
                <div className="p-4 rounded-2xl bg-slate-950/50 border border-white/5 space-y-2">
                  <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider block">
                    Partes Fundamentales del Equipo:
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {inst.parts.map((p, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                        <span className="leading-snug">{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Qué evalúa y Utilidad Clínica */}
                <div className="p-4 rounded-2xl bg-slate-950/50 border border-white/5 space-y-2 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider block mb-2">
                      Qué evalúa y Rol en la Consulta:
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {inst.clinicalRole}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/5 text-[11px] text-slate-400 flex items-center space-x-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>Instrumental estándar en unidades oftalmológicas.</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>

    </div>
  );
}
