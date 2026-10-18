"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  ArrowLeft, 
  Eye, 
  Activity, 
  Wrench, 
  Scan, 
  Compass, 
  AlertTriangle,
  Sparkles
} from "lucide-react";

export interface OftalmoSectionNav {
  id: string;
  title: string;
  shortTitle: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge: string;
}

export const OFTALMOLOGIA_SECTIONS: OftalmoSectionNav[] = [
  {
    id: "sistema-visual",
    title: "1. Sistema visual",
    shortTitle: "Sistema visual",
    href: "/oftalmologia/sistema-visual",
    icon: Eye,
    badge: "Prototipo 3D",
  },
  {
    id: "exploracion",
    title: "2. Exploración oftalmológica",
    shortTitle: "Exploración",
    href: "/oftalmologia/exploracion",
    icon: Activity,
    badge: "En preparación",
  },
  {
    id: "instrumentos",
    title: "3. Instrumentos",
    shortTitle: "Instrumentos",
    href: "/oftalmologia/instrumentos",
    icon: Wrench,
    badge: "En preparación",
  },
  {
    id: "imagenologia",
    title: "4. Imagenología ocular y retina",
    shortTitle: "Imagenología",
    href: "/oftalmologia/imagenologia",
    icon: Scan,
    badge: "En preparación",
  },
  {
    id: "campo-visual",
    title: "5. Campo visual",
    shortTitle: "Campo visual",
    href: "/oftalmologia/campo-visual",
    icon: Compass,
    badge: "En preparación",
  },
  {
    id: "alteraciones",
    title: "6. Alteraciones del sistema visual",
    shortTitle: "Alteraciones",
    href: "/oftalmologia/alteraciones",
    icon: AlertTriangle,
    badge: "En preparación",
  },
];

export const OftalmologiaNav: React.FC = () => {
  const pathname = usePathname();

  // Encontrar el apartado actual según la ruta
  const currentSection = OFTALMOLOGIA_SECTIONS.find(
    (s) => pathname === s.href || pathname.startsWith(s.href + "/")
  );

  return (
    <div className="space-y-4 mb-6">
      {/* Barra superior de retorno y contexto */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <Link
          href="/oftalmologia"
          className="inline-flex items-center space-x-2 text-xs sm:text-sm font-semibold text-sky-400 hover:text-sky-300 transition-colors group px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 w-fit min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
          aria-label="Volver a la portada de Oftalmología"
        >
          <ArrowLeft className="w-4 h-4 text-sky-400 group-hover:-translate-x-1 transition-transform" />
          <span>Volver a Oftalmología</span>
        </Link>

        {/* Migas de pan responsivas con flex-wrap */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs text-slate-400">
          <Link href="/" className="hover:text-slate-300 transition-colors">
            Dashboard
          </Link>
          <span>/</span>
          <Link href="/oftalmologia" className="hover:text-slate-300 transition-colors">
            Oftalmología
          </Link>
          {currentSection && (
            <>
              <span>/</span>
              <span className="text-sky-300 font-medium truncate max-w-[200px] sm:max-w-none">
                {currentSection.shortTitle}
              </span>
            </>
          )}
          <span className="ml-2 inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-300 text-[11px] font-semibold">
            <Sparkles className="w-3 h-3 text-sky-400" />
            <span>Prototipo educativo</span>
          </span>
        </div>
      </div>

      {/* Selector interior compacto: 2 columnas en móvil, 3 en tablet, 6 en escritorio.
          Cero barras de desplazamiento horizontal para máxima usabilidad en celular. */}
      <nav aria-label="Navegación entre apartados de Oftalmología" className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
          <span>Apartados de la especialidad:</span>
          {currentSection && (
            <span className="text-sky-300/80 font-mono text-[10px]">
              {currentSection.badge}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {OFTALMOLOGIA_SECTIONS.map((sec) => {
            const Icon = sec.icon;
            const isActive = pathname === sec.href || pathname.startsWith(sec.href + "/");

            return (
              <Link
                key={sec.id}
                href={sec.href}
                className={`
                  min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400
                  ${
                    isActive
                      ? "bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-lg shadow-sky-950/40 border border-sky-400/40 scale-[1.01]"
                      : "bg-slate-900/60 hover:bg-white/10 text-slate-300 border border-white/5 hover:border-white/15"
                  }
                `}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-sky-400"}`} />
                <span className="truncate leading-tight">{sec.shortTitle}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
