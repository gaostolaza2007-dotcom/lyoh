"use client";

import React from "react";
import { OftalmologiaNav } from "@/components/modules/oftalmologia/OftalmologiaNav";
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  Scan, 
  Clock, 
  Eye, 
  Layers, 
  CheckCircle2, 
  Info,
  ShieldCheck,
  FileSpreadsheet
} from "lucide-react";

export default function ImagenologiaPage() {
  const modalities = [
    {
      title: "Retinografía y Examen del Fondo de Ojo",
      subtitle: "Registro fotográfico en color y libre de rojo de la retina",
      icon: Eye,
      color: "border-teal-500/30 text-teal-300 bg-teal-500/10",
      description:
        "Técnica diagnóstica digital que captura imágenes panorámicas o focales de la retina posterior. Permite documentar objetivamente el aspecto de la papila óptica, el trayecto vascular y la morfología macular para teleoftalmología y seguimiento longitudinal de patologías crónicas.",
      keyStructures: [
        "Papila / Disco Óptico: bordes netos, coloración rosada y excavación fisiológica (< 0.5)",
        "Árbol Vascular Retiniano: emergencia central, relación arteria/vena 2:3, cruces arteriovenosos",
        "Área Macular: depresión foveal avascular (ZAF), brillo foveolar fisiológico",
        "Retina Periférica: homogeneidad del epitelio pigmentario y ausencia de desgarros",
      ],
      clinicalUtility:
        "Pesquisa de retinopatía diabética (microaneurismas, exudados, hemorragias), retinopatía hipertensiva, oclusiones venosas y nevus coroideos.",
    },
    {
      title: "Tomografía de Coherencia Óptica (OCT)",
      subtitle: "Biopsia óptica no invasiva in vivo de alta resolución",
      icon: Layers,
      color: "border-sky-500/30 text-sky-300 bg-sky-500/10",
      description:
        "Técnica de interferometría de baja coherencia que genera cortes histológicos virtuales bidimensionales y tridimensionales de la retina con resolución micrométrica (1 a 5 micrómetros). Analiza con precisión submilimétrica el perfil foveal, la interfase vitreorretiniana y el espesor de la capa de fibras nerviosas.",
      keyStructures: [
        "OCT Macular: depresión foveal, capas intrarretinianas, línea elipsoide de fotorreceptores y EPR",
        "OCT de Nervio Óptico (CFNR): espesor de la capa de fibras nerviosas por cuadrantes (TSNIT)",
        "OCT de Segmento Anterior: ángulo iridocorneal, grosor corneal y bóveda del cristalino",
        "Angio-OCT (OCTA): microvascularización capilar retiniana superficial y profunda sin contraste",
      ],
      clinicalUtility:
        "Monitoreo de edema macular diabético, degeneración macular asociada a la edad (DMAE), agujeros maculares, membranas epirretinianas y progresión del daño glaucomatoso.",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <OftalmologiaNav />

      {/* Encabezado del Apartado */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Scan className="w-6 h-6 text-teal-400" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight break-words">
            4. Imagenología Ocular y Retina
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 max-w-4xl leading-relaxed">
          Estudio de las modalidades de adquisición y lectura sistemática de imágenes diagnósticas en oftalmología: retinografía digital y tomografía de coherencia óptica (OCT).
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
              En la siguiente etapa se incluirá un visor de imágenes con marcadores anatómicos comentados de procedencia documentada. Sin imágenes improvisadas en esta entrega.
            </span>
          </div>
        </div>

        <span className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 font-semibold text-xs border border-amber-500/30 shrink-0 w-fit">
          Fase 01: Marco Diagnóstico
        </span>
      </div>

      {/* Tarjetas de las 2 Modalidades de Imagenología */}
      <div className="space-y-6">
        {modalities.map((mod) => {
          const Icon = mod.icon;

          return (
            <GlassCard
              key={mod.title}
              className="p-6 sm:p-7 rounded-3xl border border-white/10 bg-slate-900/60 shadow-xl space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-2xl border ${mod.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-xl font-bold text-white tracking-tight">
                      {mod.title}
                    </h2>
                    <p className="text-xs text-slate-400">
                      {mod.subtitle}
                    </p>
                  </div>
                </div>

                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-xs w-fit">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Atlas de imágenes en preparación</span>
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {mod.description}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* Estructuras Clave Identificables */}
                <div className="p-4 rounded-2xl bg-slate-950/50 border border-white/5 space-y-2">
                  <span className="text-[11px] font-bold text-teal-400 uppercase tracking-wider block">
                    Estructuras Clave de Observación Guiada:
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {mod.keyStructures.map((s, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                        <span className="leading-snug">{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Utilidad Clínica */}
                <div className="p-4 rounded-2xl bg-slate-950/50 border border-white/5 space-y-2 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider block mb-2">
                      Aplicación en la Práctica Médica y Tecnológica:
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {mod.clinicalUtility}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/5 text-[11px] text-slate-400 flex items-center space-x-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <span>Protocolos de imagen validados en oftalmología diagnóstica.</span>
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
