"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  BookOpen, 
  Layers, 
  Microscope, 
  GitCompare, 
  MapPin, 
  RotateCw, 
  GraduationCap,
  ArrowLeft,
  LayoutGrid
} from "lucide-react";

export const PARASITOLOGY_SECTIONS = [
  {
    id: "hub",
    title: "Portada",
    shortTitle: "Portada",
    href: "/agentes-infecciosos/parasitologia",
    icon: LayoutGrid,
  },
  {
    id: "atlas",
    title: "Atlas de parásitos",
    shortTitle: "Atlas",
    href: "/agentes-infecciosos/parasitologia/atlas",
    icon: BookOpen,
  },
  {
    id: "microscopia",
    title: "Atlas microscópico",
    shortTitle: "Microscopía",
    href: "/agentes-infecciosos/parasitologia/microscopia",
    icon: Microscope,
  },
  {
    id: "comparador",
    title: "Comparador de identificación",
    shortTitle: "Comparador",
    href: "/agentes-infecciosos/parasitologia/comparador",
    icon: GitCompare,
  },
  {
    id: "distribucion",
    title: "Distribución geográfica",
    shortTitle: "Distribución",
    href: "/agentes-infecciosos/parasitologia/distribucion",
    icon: MapPin,
  },
  {
    id: "ciclos",
    title: "Ciclos de vida",
    shortTitle: "Ciclos de vida",
    href: "/agentes-infecciosos/parasitologia/ciclos",
    icon: RotateCw,
  },
  {
    id: "casos",
    title: "Casos y ejercicios",
    shortTitle: "Casos y ejercicios",
    href: "/agentes-infecciosos/parasitologia/casos",
    icon: GraduationCap,
  },
];

export const ParasitologyNav: React.FC = () => {
  const pathname = usePathname();

  return (
    <div className="space-y-4 mb-6">
      {/* Navegación superior tipo breadcrumb */}
      <div className="flex items-center justify-between text-xs sm:text-sm text-slate-400">
        <Link
          href="/agentes-infecciosos"
          className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a Agentes Infecciosos</span>
        </Link>
        <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-700/40 text-cyan-300 text-xs font-semibold">
          Parasitología Médica
        </span>
      </div>

      {/* Barra de pestañas responsiva con scroll horizontal suave */}
      <div className="relative border-b border-slate-800/80 pb-2">
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1">
          {PARASITOLOGY_SECTIONS.map((sec) => {
            const Icon = sec.icon;
            const isActive =
              sec.id === "hub"
                ? pathname === sec.href
                : pathname === sec.href || pathname.startsWith(sec.href + "/");

            return (
              <Link
                key={sec.id}
                href={sec.href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 shrink-0 ${
                  isActive
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-950/50"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-cyan-400" : "text-slate-400"}`} />
                <span>{sec.title}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
