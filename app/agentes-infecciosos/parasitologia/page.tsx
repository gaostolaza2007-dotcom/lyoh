"use client";

import React from "react";
import Link from "next/link";
import { 
  BookOpen, 
  Microscope, 
  GitCompare, 
  MapPin, 
  RotateCw, 
  GraduationCap, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

const SECTIONS_HUB = [
  {
    id: "atlas",
    title: "1. Atlas de parásitos",
    desc: "Catálogo con 35 especies clasificadas por grupo taxonómico (Cestodos, Nematodos, Trematodos, Protozoos y Ectoparásitos), localización y estado documental. Incluye modelos 3D interactivos integrados directamente en la ficha (disponible para Taenia solium).",
    href: "/agentes-infecciosos/parasitologia/atlas",
    icon: BookOpen,
    badge: "35 Especies · Modelos 3D integrados",
    color: "from-cyan-500/20 to-teal-500/10",
    border: "border-cyan-500/30",
    iconColor: "text-cyan-400",
  },
  {
    id: "microscopia",
    title: "2. Atlas microscópico",
    desc: "Preparaciones microscópicas de estadios diagnósticos con micrómetro ocular, técnica de tinción (Lugol, carmín, tinta china, H&E), procedencia oficial CDC DPDx y elementos morfológicos clave.",
    href: "/agentes-infecciosos/parasitologia/microscopia",
    icon: Microscope,
    badge: "Laboratorio Virtual",
    color: "from-blue-500/20 to-cyan-500/10",
    border: "border-blue-500/30",
    iconColor: "text-blue-400",
  },
  {
    id: "comparador",
    title: "3. Comparador de identificación",
    desc: "Análisis lado a lado (escritorio) y vertical (móvil) para resolver dudas diagnósticas críticas: Taenia solium vs Taenia saginata (7-13 vs 15-30 ramas uterinas), T. solium vs H. nana, y E. histolytica vs E. coli.",
    href: "/agentes-infecciosos/parasitologia/comparador",
    icon: GitCompare,
    badge: "Diferenciación Clínica",
    color: "from-emerald-500/20 to-teal-500/10",
    border: "border-emerald-500/30",
    iconColor: "text-emerald-400",
  },
  {
    id: "distribucion",
    title: "4. Distribución geográfica",
    desc: "Cartografía epidemiológica interactiva con foco inicial en Chile (La Araucanía, Maule, Región Metropolitana, Los Lagos) basada en datos de MINSAL, SAG e ISP, complementada con el panorama global de la OMS.",
    href: "/agentes-infecciosos/parasitologia/distribucion",
    icon: MapPin,
    badge: "Chile & Global · MINSAL/SAG",
    color: "from-amber-500/20 to-orange-500/10",
    border: "border-amber-500/30",
    iconColor: "text-amber-400",
  },
  {
    id: "ciclos",
    title: "5. Ciclos de vida",
    desc: "Diagrama interactivo secuencial por etapas biológicas con indicación de hospedador definitivo, intermediario y accidental. Enfatiza la regla de oro: carne infectada causa teniasis; huevos de heces causan cisticercosis.",
    href: "/agentes-infecciosos/parasitologia/ciclos",
    icon: RotateCw,
    badge: "Biología & Patogenia",
    color: "from-rose-500/20 to-pink-500/10",
    border: "border-rose-500/30",
    iconColor: "text-rose-400",
  },
  {
    id: "casos",
    title: "6. Casos y ejercicios",
    desc: "5 ejercicios educativos de autoevaluación: reconocimiento estructural, recuento de ramas uterinas, ordenamiento biológico, selección razonada de exámenes y caso clínico simulado con fundamentación inmediata.",
    href: "/agentes-infecciosos/parasitologia/casos",
    icon: GraduationCap,
    badge: "Autoevaluación Formativa",
    color: "from-indigo-500/20 to-purple-500/10",
    border: "border-indigo-500/30",
    iconColor: "text-indigo-400",
  },
];

export default function ParasitologiaHubPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Portada Hero */}
      <section className="relative overflow-hidden rounded-3xl p-6 sm:p-10 border border-slate-700/60 bg-gradient-to-br from-slate-900/90 via-indigo-950/40 to-slate-950 shadow-2xl">
        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Módulo Principal Especializado</span>
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold">
              Agentes Infecciosos · 6 Apartados
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Parasitología Médica
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Plataforma formativa orientada a la identificación morfológica, diagnóstico diferencial, correlación biopatológica y vigilancia epidemiológica de parásitos de impacto en salud pública.
          </p>

          {/* Estado de Documentación */}
          <div className="pt-2 flex flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-950/50 border border-emerald-800/40 text-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Disponible y documentado: Ficha maestra Taenia solium con modelo 3D integrado & 6 apartados</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-400">
              <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
              <span>34 Especies complementarias con catálogo clínico estructurado</span>
            </div>
          </div>
        </div>
      </section>

      {/* Grid con los 6 apartados */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-white">
            Apartados del Módulo
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            6 Secciones Especializadas
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {SECTIONS_HUB.map((sec) => {
            const Icon = sec.icon;
            return (
              <Link
                key={sec.id}
                href={sec.href}
                className={`group relative rounded-3xl p-6 border ${sec.border} bg-gradient-to-br ${sec.color} hover:border-cyan-400/60 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-2xl bg-slate-900/80 border border-slate-800 ${sec.iconColor}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-900/80 text-slate-300 border border-slate-700">
                      {sec.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {sec.title}
                  </h3>

                  <p className="text-xs text-slate-300/90 leading-relaxed">
                    {sec.desc}
                  </p>
                </div>

                <div className="pt-5 flex items-center justify-between text-xs font-semibold text-cyan-400 group-hover:text-cyan-300">
                  <span>Acceder al apartado</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Panel de Fuentes y Lineamientos Oficiales */}
      <section className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 text-xs text-slate-400 space-y-3">
        <div className="flex items-center gap-2 text-slate-200 font-bold text-sm">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span>Marco metodológico y fuentes primarias:</span>
        </div>
        <p className="leading-relaxed">
          Los contenidos de este módulo han sido diseñados y normalizados de acuerdo a los protocolos de identificación de la <strong>División de Enfermedades Parasitarias de los CDC (DPDx)</strong>, las directrices mundiales de la <strong>OMS / OPS</strong> para el control de cestodiasis, y la normativa técnica de vigilancia epidemiológica de zoonosis de <strong>MINSAL Chile</strong>, el <strong>Instituto de Salud Pública (ISP)</strong> y el <strong>Servicio Agrícola y Ganadero (SAG)</strong>.
        </p>
      </section>

    </div>
  );
}
