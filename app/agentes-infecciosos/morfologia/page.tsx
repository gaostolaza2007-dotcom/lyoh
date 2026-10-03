"use client";

import React from "react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  Dna, 
  ArrowLeft, 
  Clock, 
  Info, 
  Sparkles, 
  Layers, 
  ShieldAlert,
  Microscope,
  CheckCircle2
} from "lucide-react";

export default function MorfologiaPage() {
  const morphologyGroups = [
    {
      id: "bacterias",
      taxon: "Bacterias",
      tagline: "Ultraestructura y formas celulares fundamentales",
      purpose: "Reconocer patrones espaciales y arquitectura de cubierta bacteriana para correlación diagnóstica y terapéutica.",
      topics: [
        "Morfologías principales: cocos, bacilos, cocobacilos, espirilos y espiroquetas",
        "Agrupaciones clásicas: racimos (estafilococos), cadenas (estreptococos), diplococos",
        "Estructura de pared: peptidoglicano en Gram positivas vs membrana externa y LPS en Gram negativas",
        "Paredes especiales: ácidos micólicos en micobacterias ácido-alcohol resistentes (BAAR)",
      ],
      color: "from-blue-500/15 to-indigo-500/10",
      borderColor: "border-blue-500/25",
      badgeColor: "bg-blue-500/15 border-blue-500/30 text-blue-300",
    },
    {
      id: "hongos",
      taxon: "Hongos",
      tagline: "Organización levaduriforme, filamentosa y dimórfica",
      purpose: "Diferenciar entre hongos levaduriformes y mohos filamentosos según sus estructuras somáticas y reproductivas.",
      topics: [
        "Levaduras unicelulares: gemación, blastoconidios y formación de pseudohifas",
        "Mohos filamentosos: hifas septadas vs cenocíticas (aseptadas), pigmentación hialina y dematiácea",
        "Estructuras reproductivas: conidióforos, esporangios, artroconidios y clamidoconidios",
        "Dimorfismo térmico: transición fenotípica entre fase ambiental (25°C) y parasitaria (37°C)",
      ],
      color: "from-purple-500/15 to-pink-500/10",
      borderColor: "border-purple-500/25",
      badgeColor: "bg-purple-500/15 border-purple-500/30 text-purple-300",
    },
    {
      id: "virus",
      taxon: "Virus",
      tagline: "Simetría de cápsides, envoltura y escala macromolecular",
      purpose: "Comparar los principios de empaquetamiento genómico, arquitectura de cápside y estabilidad físico-química de viriones.",
      topics: [
        "Simetría icosaédrica (poliedro regular) y helicoidal (ensamblaje cilíndrico de capsómeros)",
        "Arquitectura compleja característica de poxvirus y ciertos fagos",
        "Virus desnudos (estabilidad en superficies ambientales) vs virus envueltos (sensibilidad a detergentes)",
        "Escala relativa de tamaño macromolecular (20 nm a 400 nm) comparada con células procariotas",
      ],
      color: "from-amber-500/15 to-rose-500/10",
      borderColor: "border-amber-500/25",
      badgeColor: "bg-amber-500/15 border-amber-500/30 text-amber-300",
    },
    {
      id: "parasitos",
      taxon: "Parásitos",
      tagline: "Morfología de protozoos unicelulares y helmintos pluricelulares",
      purpose: "Identificar estadios diagnósticos microscópicos requeridos para el análisis parasitológico en muestras biológicas.",
      topics: [
        "Protozoos: diferenciación entre trofozoítos móviles (forma vegetativa) y quistes / ooquistes (resistencia)",
        "Organelos locomotores: flagelos, pseudópodos y cilios",
        "Nematodos: morfología cilíndrica de adultos y huevos característicos (con opérculo, mamelones o espículas)",
        "Platelmintos: estróbilos segmentados y escólex con ganchos/ventosas en cestodos; forma foliácea en trematodos",
      ],
      color: "from-emerald-500/15 to-teal-500/10",
      borderColor: "border-emerald-500/25",
      badgeColor: "bg-emerald-500/15 border-emerald-500/30 text-emerald-300",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Navegación de retorno */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/5">
        <Link
          href="/agentes-infecciosos"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors group px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 w-fit"
        >
          <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:-translate-x-1 transition-transform" />
          <span>Volver a Agentes Infecciosos</span>
        </Link>

        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <Link href="/" className="hover:text-slate-300">Dashboard</Link>
          <span>/</span>
          <Link href="/agentes-infecciosos" className="hover:text-slate-300">Agentes Infecciosos</Link>
          <span>/</span>
          <span className="text-purple-400 font-medium">Morfología</span>
        </div>
      </div>

      {/* Encabezado del Módulo */}
      <div className="space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold">
          <Dna className="w-3.5 h-3.5 text-purple-400" />
          <span>Módulo en Preparación</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Morfología de Agentes Infecciosos
        </h1>

        <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
          Reconocimiento y comparación de la arquitectura estructural y morfología diagnóstica de los cuatro grandes grupos biológicos: bacterias, hongos, virus y parásitos.
        </p>
      </div>

      {/* Banner Informativo y Transparente */}
      <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start space-x-3 text-xs text-amber-200">
        <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-amber-300">Estado de la sección: En preparación curricular</p>
          <p className="text-slate-300 leading-relaxed">
            Esta pantalla presenta la estructura académica y los contenidos temáticos proyectados para el análisis ultraestructural. No se han iniciado actividades ni cuestionarios simulados para evitar alterar las metas de evaluación del estudiante.
          </p>
        </div>
      </div>

      {/* Cuadrícula de las 4 Tarjetas: Bacterias, Hongos, Virus y Parásitos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {morphologyGroups.map((group) => (
          <GlassCard
            key={group.id}
            className={`p-6 sm:p-7 rounded-3xl border space-y-4 bg-gradient-to-b ${group.color} ${group.borderColor}`}
          >
            {/* Cabecera de la tarjeta */}
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${group.badgeColor}`}>
                {group.taxon}
              </span>

              <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-semibold">
                <Clock className="w-3 h-3 text-amber-400" />
                <span>En preparación</span>
              </span>
            </div>

            {/* Título y propósito */}
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white tracking-tight">
                {group.tagline}
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                {group.purpose}
              </p>
            </div>

            {/* Puntos de contenido proyectado */}
            <div className="space-y-2 pt-3 border-t border-white/10 text-xs">
              <span className="font-semibold text-slate-400 text-[11px] block uppercase tracking-wider">
                Ejes temáticos formativos:
              </span>
              <ul className="space-y-2 text-slate-300">
                {group.topics.map((t, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-slate-500 shrink-0 select-none mt-0.5">•</span>
                    <span className="leading-snug">{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Estado de actividad no disponible */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
              <span>Actividad evaluativa:</span>
              <span className="font-semibold text-slate-400 italic">No disponible por el momento</span>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Botón de retorno al final */}
      <div className="flex justify-center pt-4">
        <Link
          href="/agentes-infecciosos"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 border border-white/15 text-xs font-bold transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-slate-400" />
          <span>Volver a la vista principal de Agentes Infecciosos</span>
        </Link>
      </div>

    </div>
  );
}
