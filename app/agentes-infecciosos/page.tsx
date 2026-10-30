"use client";

import React, { useState } from "react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useAuth } from "@/lib/auth-context";
import { WEEKLY_SOURCES_REGISTRY } from "@/lib/data/infection-hub/weekly-sources-registry";
import { 
  Bug, 
  Dna, 
  Sparkles, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Layers, 
  BookOpen, 
  Microscope,
  Info,
  Pill,
  HeartPulse,
  Activity,
  Calendar,
  ExternalLink,
  GraduationCap
} from "lucide-react";

export default function AgentesInfecciososHubPage() {
  const { user } = useAuth();
  const microProgress = user.unitProgress["microbiologia_patogenos"] || 0;
  const [sourcesModalOpen, setSourcesModalOpen] = useState(false);

  // Los 4 Apartados Principales del Módulo
  const mainSections = [
    {
      id: "fundamentos",
      number: "1",
      title: "Fundamentos de la infección",
      subtitle: "Patogenia, virulencia, toxinas y cadena de transmisión",
      desc: "Bases biológicas de la interacción huésped-patógeno: diferenciación entre colonización e infección, factores de virulencia, cápsulas, exotoxinas A-B vs endotoxina LPS y shock séptico.",
      href: "/agentes-infecciosos/fundamentos",
      icon: Dna,
      badge: "3 Temas Formativos",
      color: "from-sky-500/15 via-slate-900 to-slate-950",
      borderColor: "border-sky-500/30 hover:border-sky-400/60",
      iconColor: "text-sky-400 bg-sky-500/10 border-sky-500/20",
      buttonText: "Explorar fundamentos",
    },
    {
      id: "metabolismo_cultivo",
      number: "2",
      title: "Metabolismo, crecimiento y cultivo",
      subtitle: "Fisiología bacteriana, curva cinética y diagnóstico fenotípico",
      desc: "Bioenergética y requerimientos de oxígeno (aerobios, anaerobios, microaerófilos), fases de la curva de crecimiento en cultivo cerrado, y fundamentos de medios selectivos y diferenciales.",
      href: "/agentes-infecciosos/metabolismo-cultivo",
      icon: Microscope,
      badge: "3 Temas Formativos",
      color: "from-purple-500/15 via-slate-900 to-slate-950",
      borderColor: "border-purple-500/30 hover:border-purple-400/60",
      iconColor: "text-purple-400 bg-purple-500/10 border-purple-500/20",
      buttonText: "Explorar metabolismo y cultivo",
    },
    {
      id: "control_antimicrobianos",
      number: "3",
      title: "Control y antimicrobianos",
      subtitle: "Esterilización, familias farmacológicas y resistencia",
      desc: "Métodos físicos y químicos de bioseguridad según niveles de Spaulding, mecanismos de acción de familias antimicrobianas por diana celular y bases moleculares de la resistencia (BLEE, SAMR, carbapenemasas).",
      href: "/agentes-infecciosos/control-antimicrobianos",
      icon: Pill,
      badge: "3 Temas Formativos",
      color: "from-amber-500/15 via-slate-900 to-slate-950",
      borderColor: "border-amber-500/30 hover:border-amber-400/60",
      iconColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
      buttonText: "Explorar control y fármacos",
    },
    {
      id: "cuerpo_humano",
      number: "4",
      title: "Microorganismos y cuerpo humano",
      subtitle: "Microbioma residente y patología infecciosa por sistemas",
      desc: "Centro topográfico unificado: explora con el visor 3D o la lista accesible las 13 regiones de microbiota comensal (97 registros, 42 taxones únicos) y consulta los síndromes clínicos, muestras y métodos diagnósticos por sistema.",
      href: "/agentes-infecciosos/cuerpo-humano",
      icon: Sparkles,
      badge: "Visor 3D · 13 Regiones · 7 Sistemas",
      color: "from-emerald-500/20 via-slate-900 to-slate-950",
      borderColor: "border-emerald-500/40 hover:border-emerald-400/70",
      iconColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      buttonText: "Explorar cuerpo humano",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300 pb-16">
      
      {/* 1. Barra de navegación superior con retroceso al Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/5">
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors group px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 w-fit"
        >
          <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:-translate-x-1 transition-transform" />
          <span>Volver al Dashboard</span>
        </Link>

        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <Link href="/" className="hover:text-slate-300">Dashboard</Link>
          <span>/</span>
          <span className="text-cyan-400 font-medium">Agentes Infecciosos</span>
        </div>
      </div>

      {/* 2. Hero Banner de Agentes Infecciosos */}
      <section className="relative overflow-hidden rounded-3xl glass-panel p-6 sm:p-8 border border-white/15 shadow-2xl bg-gradient-to-r from-slate-950 via-slate-900/90 to-cyan-950/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
              <Bug className="w-3.5 h-3.5 text-cyan-400" />
              <span>Módulo Clínico Principal</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Agentes Infecciosos
            </h1>
            
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Módulo integral organizado en <strong>cuatro apartados curriculares principales</strong> con acceso unificado al catálogo de patógenos y parasitología especializada. Diseñado para incorporar contenidos de forma continua cada semana.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-300">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-white/5 border border-white/10">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>4 Apartados Estructurados</span>
              </span>
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-white/5 border border-white/10">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>140 Fichas en Catálogo Común</span>
              </span>
              <button
                onClick={() => setSourcesModalOpen(true)}
                className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 font-semibold transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                <span>Índice por Clase / Documentos ({WEEKLY_SOURCES_REGISTRY.length} Fuentes)</span>
              </button>
            </div>
          </div>

          {/* Resumen de Progreso de la Unidad */}
          <div className="md:w-72 shrink-0 p-5 rounded-2xl bg-slate-950/70 border border-white/10 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Progreso del Catálogo</span>
              <span className="text-sm font-bold text-cyan-400">{microProgress}%</span>
            </div>
            <ProgressBar value={microProgress} color="cyan" showPercent={false} />
            <p className="text-[11px] text-slate-400 leading-tight">
              Calculado según las fichas clínicas estudiadas en el catálogo común de 140 microorganismos.
            </p>
          </div>
        </div>
      </section>

      {/* Acceso Directo Destacado: Preparación para el Certamen 3 */}
      <section
        aria-labelledby="titulo-certamen-3"
        className="space-y-4 pt-1"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold w-fit">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Preparación de exámenes · Semestre en curso</span>
            </div>
            <h2
              id="titulo-certamen-3"
              className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2"
            >
              <span>Preparación para el Certamen 3</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Repasa infecciones hepáticas e intravasculares con actividades guiadas y modelos disponibles.
            </p>
          </div>

          <span className="text-[11px] text-slate-400 bg-white/5 border border-white/10 px-3 py-1 rounded-full self-start sm:self-center">
            Cátedras 20 y 21 incorporadas
          </span>
        </div>

        {/* Dos accesos claramente diferenciados */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {/* Acceso 1: Infecciones Hepáticas */}
          <GlassCard className="flex flex-col justify-between p-5 sm:p-6 rounded-3xl border border-amber-500/30 bg-gradient-to-b from-amber-500/15 via-slate-900 to-slate-950 shadow-xl hover:border-amber-400/60 transition-all">
            <div className="space-y-3.5">
              <div className="flex items-center justify-between gap-2">
                <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300">
                  <BookOpen className="w-5 h-5" />
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-200 font-semibold">
                  Hígado y vías biliares
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  Infecciones hepáticas
                </h3>
                <p className="text-xs font-medium text-amber-300/90">
                  Cátedra 20 · Patología viral, ictericia y diagnóstico de laboratorio
                </p>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Ejercita sobre las fases de la hepatitis aguda, criterios de cronicidad y fibrosis, interpretación de marcadores serológicos de VHB y VHC, comparación VHA vs. VHE, ictericia y patología biliar.
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-white/10">
              <Link
                href="/agentes-infecciosos/certamen-3?tema=hepatobiliar"
                className="w-full inline-flex min-h-[48px] items-center justify-center space-x-2 px-4 py-3 rounded-2xl font-bold text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-100 border border-amber-400/40 hover:border-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 transition-all shadow-md active:scale-[0.99]"
              >
                <span>Abrir infecciones hepáticas</span>
                <ArrowRight className="w-4 h-4 text-amber-300" />
              </Link>
            </div>
          </GlassCard>

          {/* Acceso 2: Infecciones Intravasculares */}
          <GlassCard className="flex flex-col justify-between p-5 sm:p-6 rounded-3xl border border-rose-500/30 bg-gradient-to-b from-rose-500/15 via-slate-900 to-slate-950 shadow-xl hover:border-rose-400/60 transition-all">
            <div className="space-y-3.5">
              <div className="flex items-center justify-between gap-2">
                <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300">
                  <HeartPulse className="w-5 h-5" />
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-200 font-semibold">
                  Sangre y sistema cardiovascular
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  Infecciones intravasculares
                </h3>
                <p className="text-xs font-medium text-rose-300/90">
                  Cátedra 21 · Sepsis, shock séptico, hemocultivo y modelo 3D de biofilm
                </p>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Explora diseminación hemática, fisiopatología de sepsis y shock distributivo, modelo 3D interactivo de catéteres y biofilm, shock tóxico por superantígenos, fases de Chagas, malaria y metodología de hemocultivos.
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-white/10">
              <Link
                href="/agentes-infecciosos/certamen-3?tema=cardiovascular"
                className="w-full inline-flex min-h-[48px] items-center justify-center space-x-2 px-4 py-3 rounded-2xl font-bold text-xs bg-rose-500/20 hover:bg-rose-500/30 text-rose-100 border border-rose-400/40 hover:border-rose-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 transition-all shadow-md active:scale-[0.99]"
              >
                <span>Abrir infecciones intravasculares</span>
                <ArrowRight className="w-4 h-4 text-rose-300" />
              </Link>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* 3. Título de Sección: Los 4 Apartados Principales */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              <span>Apartados Principales del Módulo</span>
            </h2>
            <p className="text-xs text-slate-400">
              Estructura curricular progresiva: desde los fundamentos moleculares hasta la patología por sistemas corporales.
            </p>
          </div>
        </div>

        {/* Cuadrícula de 4 Tarjetas Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {mainSections.map((sec) => {
            const Icon = sec.icon;

            return (
              <GlassCard
                key={sec.id}
                className={`flex flex-col justify-between p-6 rounded-3xl border transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl bg-gradient-to-b ${sec.color} ${sec.borderColor}`}
              >
                <div className="space-y-4">
                  
                  {/* Cabecera de la tarjeta */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-3 rounded-2xl border ${sec.iconColor}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-white/10 text-slate-300">
                        Apartado {sec.number}
                      </span>
                    </div>

                    <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 font-semibold">
                      {sec.badge}
                    </span>
                  </div>

                  {/* Título y subtítulo */}
                  <div className="space-y-1">
                    <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                      {sec.title}
                    </h3>
                    <p className="text-xs font-medium text-slate-300">
                      {sec.subtitle}
                    </p>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {sec.desc}
                  </p>
                </div>

                {/* Botón de acceso directo */}
                <div className="pt-5 mt-4 border-t border-white/10">
                  <Link
                    href={sec.href}
                    className="w-full inline-flex items-center justify-center space-x-2 px-4 py-3 rounded-2xl font-bold text-xs bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all shadow-md active:scale-95"
                  >
                    <span>{sec.buttonText}</span>
                    <ArrowRight className="w-4 h-4 text-slate-300" />
                  </Link>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>

      {/* 4. Sección de Consulta Permanente: Catálogos y Parasitología */}
      <div className="space-y-4 pt-4 border-t border-white/10">
        <div className="space-y-0.5">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Bug className="w-5 h-5 text-purple-400" />
            <span>Catálogo Común y Especialidades de Consulta</span>
          </h2>
          <p className="text-xs text-slate-400">
            Fichas clínicas taxonómicas y herramientas interactivas especializadas disponibles en todo momento como fuente única de agentes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Tarjeta 1: Catálogo de Microbiología (140 Fichas) */}
          <GlassCard className="p-6 rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-cyan-500/10 via-slate-900 to-slate-950 flex flex-col justify-between space-y-4 hover:border-cyan-400/50 transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                  <Bug className="w-5 h-5" />
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-bold">
                  Catálogo Oficial · 140 Fichas
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Catálogo de Microbiología Clínica
                </h3>
                <p className="text-xs text-cyan-300 font-medium">
                  Bacterias, virus, hongos y parásitos con fichas taxonómicas completas
                </p>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Fuente común de información de todos los agentes. Incluye tinciones Gram, factores de virulencia, manifestaciones clínicas, antibiogramas de primera línea y perlas de examen.
              </p>

              <div className="pt-2 border-t border-white/10 text-xs text-slate-400 flex items-center gap-3">
                <span>• Búsqueda por alias y fármacos</span>
                <span>• Filtros taxonómicos</span>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <Link
                href="/agentes-infecciosos/microbiologia"
                className="w-full inline-flex items-center justify-center space-x-2 px-4 py-3 rounded-2xl font-bold text-xs bg-cyan-600 hover:bg-cyan-500 text-white transition-all shadow-lg shadow-cyan-950/60 active:scale-95"
              >
                <span>Entrar al Catálogo (140 Fichas)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </GlassCard>

          {/* Tarjeta 2: Parasitología Médica (6 Apartados) */}
          <GlassCard className="p-6 rounded-3xl border border-purple-500/30 bg-gradient-to-b from-purple-500/10 via-slate-900 to-slate-950 flex flex-col justify-between space-y-4 hover:border-purple-400/50 transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                  <Dna className="w-5 h-5" />
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 font-bold">
                  Módulo Especializado · 6 Apartados
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Parasitología Médica
                </h3>
                <p className="text-xs text-purple-300 font-medium">
                  Modelos 3D, microscopía virtual, ciclos biológicos y mapas
                </p>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Módulo avanzado con atlas de 35 especies, visores 3D de alta fidelidad con controles de corte y zoom, comparador diferencial de especies semejantes y mapas geográficos de Chile (16 regiones) y el mundo (179 países).
              </p>

              <div className="pt-2 border-t border-white/10 text-xs text-slate-400 flex items-center gap-3">
                <span>• Modelos 3D de parásitos</span>
                <span>• Mapas BCN y OMS</span>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <Link
                href="/agentes-infecciosos/parasitologia"
                className="w-full inline-flex items-center justify-center space-x-2 px-4 py-3 rounded-2xl font-bold text-xs bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-lg shadow-purple-950/60 active:scale-95"
              >
                <span>Entrar a Parasitología</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </GlassCard>

        </div>
      </div>

      {/* 5. Modal de Índice Secundario por Clase / Documentos */}
      {sourcesModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSourcesModalOpen(false);
          }}
        >
          <GlassCard className="max-w-3xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-7 rounded-3xl border border-white/15 bg-slate-950/95 space-y-5 shadow-2xl text-slate-200">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-3">
              <div className="space-y-1">
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>Índice Secundario de Fuentes Semanales</span>
                </span>
                <h3 className="text-xl font-bold text-white">
                  Documentos y Clases Teóricas Registradas ({WEEKLY_SOURCES_REGISTRY.length} Fuentes)
                </h3>
              </div>

              <button
                onClick={() => setSourcesModalOpen(false)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                aria-label="Cerrar índice"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Índice oficial de los 19 documentos PDF de cátedra (Facultad de Medicina CAS-UDD), con títulos, autores y número de páginas reales verificados:
            </p>

            <div className="space-y-3">
              {WEEKLY_SOURCES_REGISTRY.map((src) => (
                <div
                  key={src.id}
                  className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs">{src.code}</span>
                      {src.author && <span className="text-[11px] text-slate-400">· {src.author}</span>}
                    </div>
                    <span className="text-[10px] text-cyan-300 font-mono px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40">{src.totalPages} páginas</span>
                  </div>
                  <h4 className="font-semibold text-cyan-300 text-xs">{src.title}</h4>
                  <p className="text-[11px] font-mono text-slate-400 break-all">{src.fileName}</p>
                  <p className="text-slate-300 text-[11px]">{src.primarySubject}</p>
                  
                  <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[10px] text-slate-400">
                    <span className="font-bold text-slate-500">Secciones asignadas:</span>
                    {src.assignedSections.map((sec, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 font-medium">
                        {sec === "fundamentos" ? "Fundamentos" : sec === "metabolismo_cultivo" ? "Metabolismo" : sec === "control_antimicrobianos" ? "Control" : "Cuerpo Humano"}
                      </span>
                    ))}
                  </div>
                  <div className="text-[10px] text-slate-500 pt-1">
                    Fecha de cátedra: {src.deliveryDate}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-white/10">
              <button
                onClick={() => setSourcesModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition-colors"
              >
                Cerrar
              </button>
            </div>
          </GlassCard>
        </div>
      )}

    </div>
  );
}
