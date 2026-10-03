"use client";

import React from "react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  Sparkles, 
  ArrowLeft, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  Heart, 
  Layers, 
  Info,
  CheckCircle2,
  BookOpen
} from "lucide-react";

export default function MicrobiotaDelCuerpoPage() {
  const zones = [
    {
      id: "piel",
      name: "Piel (Tegumento Cutáneo)",
      location: "Epidermis, glándulas sebáceas y folículos pilosos",
      description: "La barrera cutánea presenta tres microambientes ecológicos definidos: zonas sebáceas ricas en lípidos (rostro y tórax), zonas húmedas con mayor temperatura (pliegues y axilas) y zonas secas expuestas (extremidades).",
      futureContent: [
        "Comunidades bacterianas comensales: Cutibacterium acnes, Staphylococcus epidermidis y corinebacterias",
        "Comunidades fúngicas cutáneas: levaduras lipofílicas del género Malassezia",
        "Función protectora: producción de péptidos antimicrobianos y competencia por ácidos grasos libres",
      ],
      color: "from-amber-500/15 to-orange-500/10",
      borderColor: "border-amber-500/25",
      badgeColor: "bg-amber-500/15 border-amber-500/30 text-amber-300",
    },
    {
      id: "boca",
      name: "Boca y Cavidad Oral",
      location: "Mucosa yugal, dorso lingual, surco gingival y esmalte",
      description: "Ecosistema oral altamente heterogéneo y dinámico con fluctuaciones constantes de pH, flujo salival, tensiones de oxígeno y superficies sólidas no descamativas (dientes) que favorecen biopelículas organizadas.",
      futureContent: [
        "Comunidades bacterianas: estreptococos del grupo viridans (S. mitis, S. salivarius, S. oralis) y anaerobios del surco gingival",
        "Componente fúngico oral: presencia comensal controlada de Candida albicans en equilibrio con la flora bacteriana",
        "Función protectora: antagonismo microbiano salival y modulación de la respuesta inflamatoria mucosal",
      ],
      color: "from-rose-500/15 to-pink-500/10",
      borderColor: "border-rose-500/25",
      badgeColor: "bg-rose-500/15 border-rose-500/30 text-rose-300",
    },
    {
      id: "intestino",
      name: "Intestino (Tracto Gastrointestinal)",
      location: "Duodeno, yeyuno, íleon y colon distal",
      description: "El mayor reservorio microbiano del organismo humano, caracterizado por un gradiente de acidez y oxígeno que culmina en una estricta anaerobiosis y altísima densidad celular en la luz cólica.",
      futureContent: [
        "Filos bacterianos predominantes: Bacteroidetes, Firmicutes, Actinobacteria y Proteobacteria",
        "Hongos comensales (micobioma entérico): especies de Saccharomyces y Candida en bajas densidades",
        "Funciones fisiológicas críticas: fermentación de fibra dietética a ácidos grasos de cadena corta (AGCC: butirato, acetato, propionato), síntesis de vitaminas K y B, y maduración del tejido linfoide asociado a mucosas (GALT)",
      ],
      color: "from-emerald-500/15 to-teal-500/10",
      borderColor: "border-emerald-500/25",
      badgeColor: "bg-emerald-500/15 border-emerald-500/30 text-emerald-300",
    },
    {
      id: "vagina",
      name: "Vagina (Tracto Genital Femenino)",
      location: "Mucosa vaginal y cuello uterino externo",
      description: "Nicho anatómico dependiente del estado hormonal del hospedero, donde la acción estrogénica sobre el epitelio estratificado estimula la síntesis de glucógeno intracelular.",
      futureContent: [
        "Comunidades bacterianas dominantes: Lactobacillus crispatus, L. gasseri, L. jensenii y L. iners",
        "Equilibrio fúngico comensal: colonización fisiológica de levaduras sin respuesta inflamatoria",
        "Función fisiológica: fermentación de glucógeno a ácido láctico, manteniendo un pH ácido protector (≤ 4.5) y producción de peróxido de hidrógeno que inhibe patógenos oportunistas",
      ],
      color: "from-cyan-500/15 to-blue-500/10",
      borderColor: "border-cyan-500/25",
      badgeColor: "bg-cyan-500/15 border-cyan-500/30 text-cyan-300",
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
          <span className="text-emerald-400 font-medium">Microbiota del cuerpo</span>
        </div>
      </div>

      {/* Encabezado del Módulo */}
      <div className="space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Módulo en Preparación</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Microbiota del Cuerpo Humano
        </h1>

        <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
          Exploración de las comunidades comensales y mutualistas que colonizan los distintos nichos anatómicos corporales, sus funciones fisiológicas de barrera y su rol en la homeostasis biológica.
        </p>
      </div>

      {/* Aclaración Clínica Fundamental (Obligatoria) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-amber-500/20 via-amber-500/15 to-transparent border border-amber-500/40 text-xs text-amber-200 shadow-xl space-y-2">
        <div className="flex items-center space-x-2 font-extrabold text-amber-300 text-sm tracking-tight">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <span>Aclaración Clínica Fundamental</span>
        </div>

        <p className="text-sm sm:text-base font-bold text-white bg-slate-950/40 px-3.5 py-2 rounded-xl border border-amber-500/30 w-fit">
          &ldquo;La presencia de microorganismos no implica necesariamente infección.&rdquo;
        </p>

        <p className="text-slate-300 text-xs leading-relaxed max-w-3xl pt-1">
          La colonización bacteriana y fúngica en piel, mucosas y tracto digestivo forma parte inseparable de la biología humana sana. Cumple funciones vitales de exclusión competitiva frente a patógenos invasores, maduración inmunológica y metabolismo de nutrientes. El estado de infección sobreviene únicamente cuando se quiebra la homeostasis ecológica (disbiosis) o se vulneran las barreras epiteliales mecánicas.
        </p>
      </div>

      {/* Propuesta Visual de Zonas Corporales */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            <span>Zonas Anatómicas en Preparación</span>
          </h2>
          <span className="text-xs text-slate-400">
            Propuesta de navegación por nichos biológicos
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {zones.map((zone) => (
            <GlassCard
              key={zone.id}
              className={`p-6 sm:p-7 rounded-3xl border space-y-4 bg-gradient-to-b ${zone.color} ${zone.borderColor}`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${zone.badgeColor}`}>
                  {zone.name}
                </span>

                <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-semibold">
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span>En preparación</span>
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 block">
                  Localización anatómica: {zone.location}
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {zone.description}
                </p>
              </div>

              <div className="space-y-2 pt-3 border-t border-white/10 text-xs">
                <span className="font-semibold text-slate-400 text-[11px] block uppercase tracking-wider">
                  Contenido microbiológico proyectado:
                </span>
                <ul className="space-y-2 text-slate-300">
                  {zone.futureContent.map((item, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-slate-500 shrink-0 select-none mt-0.5">•</span>
                      <span className="leading-snug">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                <span>Estado de catálogo:</span>
                <span className="font-semibold text-slate-400 italic">En desarrollo con fuentes validadas</span>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Nota de rigor científico */}
      <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/10 flex items-center space-x-3 text-xs text-slate-400">
        <Info className="w-4 h-4 text-cyan-400 shrink-0" />
        <span>
          En esta etapa, MedStudy prioriza la fidelidad científica. Los catálogos por nicho y visualizaciones anatómicas se integrarán gradualmente conforme se revisen sus fuentes bibliográficas sin incorporar datos simulados.
        </span>
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
