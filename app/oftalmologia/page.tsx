"use client";

import React from "react";
import Link from "next/link";
import { 
  Eye, 
  Activity, 
  Wrench, 
  Scan, 
  Compass, 
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Clock,
  CheckCircle2,
  GraduationCap,
  Info,
  ShieldCheck
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

interface OftalmoCardData {
  id: string;
  title: string;
  subtitle: string;
  desc: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge: string;
  badgeType: "3d" | "pending";
  color: string;
  borderColor: string;
  iconColor: string;
  features: string[];
}

const OFTALMO_CARDS: OftalmoCardData[] = [
  {
    id: "sistema-visual",
    title: "1. Sistema visual",
    subtitle: "Morfología y arquitectura óptica del ojo",
    desc: "Espacio preparado para el estudio tridimensional del globo ocular, sus tres túnicas concéntricas, medios refringentes y anexos anatómicos.",
    href: "/oftalmologia/sistema-visual",
    icon: Eye,
    badge: "Prototipo 3D",
    badgeType: "3d",
    color: "from-sky-500/20 to-blue-500/10",
    borderColor: "border-sky-500/30",
    iconColor: "text-sky-400",
    features: [
      "Estructuras anatómicas por capas concéntricas",
      "Córnea, cristalino, iris, retina y nervio óptico",
      "Base modular reutilizable con Optometría",
      "Prototipo 3D interactivo con corte anatómico",
    ],
  },
  {
    id: "exploracion",
    title: "2. Exploración oftalmológica",
    subtitle: "Pruebas funcionales básicas y biométricas",
    desc: "Preparado para actividades formativas sobre agudeza visual, respuesta pupilar a la luz, motilidad ocular extrínseca y tonometría intraocular.",
    href: "/oftalmologia/exploracion",
    icon: Activity,
    badge: "En preparación",
    badgeType: "pending",
    color: "from-indigo-500/20 to-purple-500/10",
    borderColor: "border-indigo-500/30",
    iconColor: "text-indigo-400",
    features: [
      "Conceptos de agudeza visual de lejos y cerca",
      "Reflejos fotomotor directo y consensual",
      "Evaluación motora de pares craneales III, IV y VI",
      "Presión intraocular (PIO) y rango fisiológico",
    ],
  },
  {
    id: "instrumentos",
    title: "3. Instrumentos",
    subtitle: "Equipos clínicos esenciales de la consulta",
    desc: "Preparado para conocer los principios ópticos, partes fundamentales, indicaciones y manejo básico de los equipos oftalmológicos más representativos.",
    href: "/oftalmologia/instrumentos",
    icon: Wrench,
    badge: "En preparación",
    badgeType: "pending",
    color: "from-blue-500/20 to-cyan-500/10",
    borderColor: "border-blue-500/30",
    iconColor: "text-blue-400",
    features: [
      "Lámpara de hendidura (biomicroscopio ocular)",
      "Tonómetro de aplanación Goldmann y aire",
      "Oftalmoscopio directo e indirecto",
      "Propósito evaluativo y cuidados del instrumental",
    ],
  },
  {
    id: "imagenologia",
    title: "4. Imagenología ocular y retina",
    subtitle: "Fondo de ojo y tomografía de alta resolución",
    desc: "Preparado para el análisis guiado de imágenes de retinografía y tomografía de coherencia óptica (OCT) de retina, mácula y nervio óptico.",
    href: "/oftalmologia/imagenologia",
    icon: Scan,
    badge: "En preparación",
    badgeType: "pending",
    color: "from-teal-500/20 to-emerald-500/10",
    borderColor: "border-teal-500/30",
    iconColor: "text-teal-400",
    features: [
      "Lectura guiada de fondo de ojo y vasos retinianos",
      "OCT macular: corte transversal de capas retinianas",
      "OCT de papila: capa de fibras nerviosas (CFNR)",
      "Reconocimiento de patrones anatómicos normales",
    ],
  },
  {
    id: "campo-visual",
    title: "5. Campo visual",
    subtitle: "Campimetría y evaluación perimétrica",
    desc: "Preparado para explicar los conceptos fundamentales de perimetría computarizada, índices de fijación, sensibilidad foveal y lectura sistemática.",
    href: "/oftalmologia/campo-visual",
    icon: Compass,
    badge: "En preparación",
    badgeType: "pending",
    color: "from-amber-500/20 to-orange-500/10",
    borderColor: "border-amber-500/30",
    iconColor: "text-amber-400",
    features: [
      "La «isla de visión en un mar de ceguera»",
      "Índices de confiabilidad y pérdidas de fijación",
      "Escala en decibeles (dB) y escala de grises",
      "Aproximación a escotomas y defectos campimétricos",
    ],
  },
  {
    id: "alteraciones",
    title: "6. Alteraciones del sistema visual",
    subtitle: "Correlación integradora de hallazgos",
    desc: "Preparado para relacionar estructuras anatómicas, funciones visuales y hallazgos con los recursos de los otros cinco apartados del módulo.",
    href: "/oftalmologia/alteraciones",
    icon: AlertTriangle,
    badge: "En preparación",
    badgeType: "pending",
    color: "from-purple-500/20 to-pink-500/10",
    borderColor: "border-purple-500/30",
    iconColor: "text-purple-400",
    features: [
      "Marco integrador: de la estructura al síntoma",
      "Correlación entre hallazgos de imagen y función",
      "Vía óptica y patrones topográficos de lesión",
      "Conexión formativa futura con Optometría",
    ],
  },
];

export default function OftalmologiaHubPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Barra de navegación superior con retroceso al Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors group px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 w-fit min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
        >
          <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:-translate-x-1 transition-transform" />
          <span>Volver al Dashboard</span>
        </Link>

        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <Link href="/" className="hover:text-slate-300 transition-colors">Dashboard</Link>
          <span>/</span>
          <span className="text-sky-300 font-medium">Oftalmología</span>
          <span className="hidden sm:inline-block ml-2 px-2.5 py-0.5 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-300 text-[11px] font-semibold">
            Prototipo educativo
          </span>
        </div>
      </div>

      {/* Hero Banner de Oftalmología */}
      <section className="relative overflow-hidden rounded-3xl glass-panel p-6 sm:p-8 md:p-10 border border-white/15 shadow-2xl bg-gradient-to-r from-slate-950 via-slate-900/95 to-sky-950/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3.5 max-w-3xl">
            
            {/* Badges de contexto */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                <span>Prototipo educativo</span>
              </span>

              <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-medium">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                <span>Orientado a carreras de salud y Tecnología Médica</span>
              </span>

              <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400 text-xs">
                <span>6 Apartados en estructuración</span>
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight break-words">
              Oftalmología
            </h1>
            
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Explora el sistema visual y conoce los instrumentos, imágenes y exámenes de la especialidad. Diseñado para acercar a estudiantes a la exploración anatómica y clínica antes de su definición vocacional.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-400">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-300">
                <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Explorador 3D y contenidos interactivos en preparación</span>
              </span>
              <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>Módulo modular diferenciado de Optometría</span>
              </span>
            </div>
          </div>

          {/* Icono temático del módulo */}
          <div className="hidden lg:flex shrink-0 w-32 h-32 rounded-3xl bg-gradient-to-tr from-sky-600/20 to-blue-600/30 border border-sky-500/30 items-center justify-center text-sky-400 shadow-2xl">
            <Eye className="w-16 h-16 opacity-90 animate-pulse" />
          </div>
        </div>
      </section>

      {/* Título de la cuadrícula de apartados */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Apartados de la Especialidad
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Selecciona cualquiera de las seis áreas para conocer sus objetivos pedagógicos y su estado de preparación.
          </p>
        </div>
        <span className="text-xs text-sky-300 font-mono bg-sky-950/50 border border-sky-500/20 px-3 py-1 rounded-xl w-fit">
          6 Apartados organizados
        </span>
      </div>

      {/* Cuadrícula de las 6 tarjetas de apartado */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {OFTALMO_CARDS.map((card) => {
          const Icon = card.icon;

          return (
            <GlassCard
              key={card.id}
              className={`flex flex-col justify-between p-6 sm:p-7 rounded-3xl border transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl bg-gradient-to-b ${card.color} ${card.borderColor}`}
            >
              <div className="space-y-4">
                
                {/* Cabecera de la tarjeta: Icono y Badge de estado */}
                <div className="flex items-center justify-between gap-2">
                  <div className={`p-3 rounded-2xl bg-slate-950/70 border border-white/10 ${card.iconColor}`}>
                    <Icon className="w-6 h-6" />
                  </div>

                  {card.badgeType === "3d" ? (
                    <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-semibold text-right">
                      <Clock className="w-3 h-3 text-amber-400 shrink-0" />
                      <span>{card.badge}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-white/10 text-slate-300 text-[11px] font-semibold">
                      <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{card.badge}</span>
                    </span>
                  )}
                </div>

                {/* Título y subtítulo con break-words */}
                <div className="space-y-1">
                  <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight break-words">
                    {card.title}
                  </h3>
                  <p className="text-xs font-medium text-slate-300">
                    {card.subtitle}
                  </p>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {card.desc}
                </p>

                {/* Lista de características proyectadas */}
                <ul className="space-y-1.5 pt-3 border-t border-white/10 text-xs text-slate-300">
                  {card.features.map((feat, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <span className="text-sky-400 shrink-0 select-none mt-0.5">•</span>
                      <span className="leading-snug">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Botón de acceso al apartado */}
              <div className="pt-6 mt-4 border-t border-white/10">
                <Link
                  href={card.href}
                  className="w-full inline-flex items-center justify-center space-x-2 px-4 py-3 rounded-2xl font-bold text-xs transition-all active:scale-95 bg-white/10 hover:bg-white/15 text-white border border-white/15 shadow-black/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                >
                  <span>Conocer alcance del apartado</span>
                  <ArrowRight className="w-4 h-4 text-sky-400" />
                </Link>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Nota formativa al pie */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/60 border border-white/10 text-slate-300 text-xs space-y-2">
        <div className="flex items-center space-x-2 font-bold text-white">
          <Info className="w-4 h-4 text-sky-400 shrink-0" />
          <span>Aclaración formativa de alcance</span>
        </div>
        <p className="text-slate-400 leading-relaxed">
          La organización de este módulo es educativa y provisional, diseñada para facilitar la exploración vocacional y el estudio de conceptos fundamentales en Ciencias de la Salud y Tecnología Médica. No representa una distribución oficial ni restrictiva de competencias profesionales entre Oftalmología y Optometría.
        </p>
      </div>

    </div>
  );
}
