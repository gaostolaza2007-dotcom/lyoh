"use client";

import React from "react";
import { OftalmologiaNav } from "@/components/modules/oftalmologia/OftalmologiaNav";
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  AlertTriangle, 
  Clock, 
  Layers, 
  Eye, 
  Compass, 
  Scan, 
  CheckCircle2, 
  Info,
  GitBranch,
  ShieldCheck
} from "lucide-react";

export default function AlteracionesPage() {
  const integrationAxes = [
    {
      axis: "Vía Óptica y Defectos Campimétricos",
      icon: GitBranch,
      color: "border-purple-500/30 text-purple-300 bg-purple-500/10",
      description:
        "Correlación directa entre la ubicación topográfica de una lesión en la vía visual anterior o retroquiasmática y el patrón geométrico del defecto campimétrico resultante.",
      examples: [
        "Nervio Óptico prequiasmático → Escotoma central o ceguera monocular ipsilateral",
        "Quiasma Óptico (compresión hipofisaria) → Hemianopsia bitemporal heterónima",
        "Tracto Óptico / Cintilla → Hemianopsia homónima contralateral incongruente",
        "Radiaciones Ópticas temporales (asa de Meyer) → Cuadrantanopsia homónima superior («pie in the sky»)",
        "Corteza Visual Occipital (isquemia ACP) → Hemianopsia homónima con respeto macular",
      ],
    },
    {
      axis: "Polo Anterior y Glaucoma",
      icon: Eye,
      color: "border-teal-500/30 text-teal-300 bg-teal-500/10",
      description:
        "Integración entre la hidrodinámica del humor acuoso, la medición con tonómetro de Goldmann, la visualización del ángulo en lámpara de hendidura y el daño estructural en OCT.",
      examples: [
        "Lámpara de hendidura: profundidad de cámara (Van Herick) y gonioscopía",
        "Tonometría de Goldmann: cifras sostenidas de PIO > 21 mmHg",
        "OCT de papila: pérdida progresiva del espesor de la CFNR (TSNIT)",
        "Campo visual: escotoma de Bjerrum / arqueado y escalón nasal de Ronne",
      ],
    },
    {
      axis: "Retinopatía y Maculopatía",
      icon: Scan,
      color: "border-sky-500/30 text-sky-300 bg-sky-500/10",
      description:
        "Asociación entre la vascularización retiniana, los hallazgos en fondo de ojo con oftalmoscopio, los biomarcadores tomográficos en OCT y el impacto funcional en la visión central.",
      examples: [
        "Fondo de ojo: microaneurismas, exudados duros algodonosos y hemorragias en llama",
        "OCT macular: quistes intrarretinianos hiporreflectivos y grosor foveal central aumentado",
        "Agudeza visual: pérdida de la visión fina y metamorfopsias con cartilla de Amsler",
        "Monitoreo de respuesta terapéutica a fármacos antiangiogénicos (anti-VEGF)",
      ],
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <OftalmologiaNav />

      {/* Encabezado del Apartado */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-6 h-6 text-purple-400" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight break-words">
            6. Alteraciones del Sistema Visual
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 max-w-4xl leading-relaxed">
          Marco integrador diseñado para conectar las estructuras anatómicas, las pruebas funcionales, el instrumental clínico y los hallazgos de imagenología desarrollados en los cinco apartados previos.
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
              Este espacio articulará las correlaciones clínicas cuando los apartados individuales cuenten con sus modelos e imágenes activas. No se incluyen casos clínicos ni preguntas evaluativas en esta tanda.
            </span>
          </div>
        </div>

        <span className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 font-semibold text-xs border border-amber-500/30 shrink-0 w-fit">
          Fase 01: Matriz de Correlación
        </span>
      </div>

      {/* Ejes de Integración Clínica */}
      <div className="space-y-6">
        {integrationAxes.map((axis) => {
          const Icon = axis.icon;

          return (
            <GlassCard
              key={axis.axis}
              className="p-6 sm:p-7 rounded-3xl border border-white/10 bg-slate-900/60 shadow-xl space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-2xl border ${axis.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-xl font-bold text-white tracking-tight">
                      {axis.axis}
                    </h2>
                    <p className="text-xs text-slate-400">
                      Integración transversal de competencias formativas
                    </p>
                  </div>
                </div>

                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-xs w-fit">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Mapeo en preparación</span>
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {axis.description}
              </p>

              <div className="p-4 rounded-2xl bg-slate-950/50 border border-white/5 space-y-2">
                <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wider block">
                  Correlaciones anatomo-funcionales proyectadas:
                </span>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {axis.examples.map((ex, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                      <span className="leading-snug">{ex}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Nota sobre exclusión de casos clínicos y desarrollo futuro */}
      <div className="p-4 rounded-3xl bg-slate-900/40 border border-white/10 text-xs text-slate-400 space-y-1.5">
        <div className="flex items-center space-x-2 font-bold text-slate-300">
          <Info className="w-4 h-4 text-sky-400 shrink-0" />
          <span>Delimitación técnica de esta etapa:</span>
        </div>
        <p className="leading-relaxed text-[11px] sm:text-xs">
          Esta tanda no incluye motor de casos clínicos, bancos de preguntas simuladas ni integraciones de IA. La estructura queda lista para que en el futuro se puedan vincular casos con variables dinámicas de forma limpia y desacoplada de la base anatómica.
        </p>
      </div>

    </div>
  );
}
