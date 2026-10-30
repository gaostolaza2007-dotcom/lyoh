"use client";

import React, { useState } from "react";
import { 
  Eye, 
  Sun, 
  Power, 
  RotateCcw, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  ArrowRight, 
  ExternalLink, 
  ShieldAlert, 
  Sparkles,
  Share2
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

type StimulusState = "none" | "od" | "oi";

export const PupillaryReflexSimulator: React.FC = () => {
  const [stimulus, setStimulus] = useState<StimulusState>("none");
  const [showExplanation, setShowExplanation] = useState<boolean>(false);

  // Radio basal (reposo en luz ambiental difusa): 26px
  // Radio en miosis (constricción fisiológica): 13px
  const isConstricted = stimulus !== "none";
  const pupilRadius = isConstricted ? 13 : 26;

  // Manejadores de control
  const handleStimulateOD = () => setStimulus("od");
  const handleStimulateOI = () => setStimulus("oi");
  const handleTurnOff = () => setStimulus("none");
  const handleReset = () => {
    setStimulus("none");
    setShowExplanation(false);
  };

  // Texto para lector de pantalla
  const getScreenReaderStatus = () => {
    if (stimulus === "none") {
      return "Linterna apagada. Ambas pupilas se encuentran en estado basal de reposo, simétricas e isocóricas.";
    }
    if (stimulus === "od") {
      return "Estímulo luminoso activo sobre el ojo derecho del paciente. Ambas pupilas están contraídas de forma simultánea. El ojo derecho presenta respuesta directa y el ojo izquierdo presenta respuesta consensual.";
    }
    return "Estímulo luminoso activo sobre el ojo izquierdo del paciente. Ambas pupilas están contraídas de forma simultánea. El ojo izquierdo presenta respuesta directa y el ojo derecho presenta respuesta consensual.";
  };

  return (
    <section 
      id="simulador-reflejos"
      aria-labelledby="titulo-simulador-reflejos"
      className="space-y-6 scroll-mt-20"
    >
      {/* Tarjeta principal del simulador */}
      <GlassCard className="p-4 sm:p-6 md:p-8 rounded-3xl border border-sky-500/20 bg-slate-900/80 shadow-2xl space-y-6">
        
        {/* Encabezado y orientación del paciente */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <Eye className="w-5 h-5" />
              </span>
              <h2 id="titulo-simulador-reflejos" className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Simulador de Reflejos Pupilares Normales
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Explora la respuesta fotomotora normal (directa y consensual) ante la iluminación focal unilateral.
            </p>
          </div>

          {/* Insignia de perspectiva clínica obligatoria */}
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-sky-950/70 border border-sky-400/30 text-sky-200 text-xs font-semibold shrink-0">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
            <span>Vista frontal del paciente</span>
          </div>
        </div>

        {/* Instrucción breve de inicio */}
        <div className="flex items-start sm:items-center space-x-2.5 p-3 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 text-xs sm:text-sm text-indigo-200">
          <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5 sm:mt-0" />
          <p className="leading-snug">
            <strong>Instrucción:</strong> Ilumina un ojo y observa qué ocurre en ambas pupilas.
          </p>
        </div>

        {/* Visor gráfico interactivo (SVG responsivo) */}
        <div className="rounded-2xl border border-white/10 bg-slate-950/90 p-3 sm:p-5 shadow-inner">
          
          {/* Etiquetas superiores de lado y respuesta activa */}
          <div className="grid grid-cols-2 gap-3 pb-4 text-center">
            
            {/* Columna Ojo Derecho (OD) - a la izquierda de la pantalla */}
            <div className="p-2.5 rounded-xl bg-slate-900/70 border border-white/5 space-y-1.5">
              <div className="flex items-center justify-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-400" />
                <h3 className="text-xs sm:text-sm font-bold text-white">
                  Ojo derecho (OD)
                </h3>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400">
                Lado derecho del paciente (tu izquierda)
              </p>

              {/* Insignia de respuesta para OD */}
              <div className="pt-1">
                {stimulus === "none" && (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-[11px] font-medium border border-slate-700">
                    <span>Estado basal (reposo)</span>
                  </span>
                )}
                {stimulus === "od" && (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 text-[11px] font-bold border border-amber-500/40 ring-1 ring-amber-400/30">
                    <Sun className="w-3 h-3 text-amber-400 shrink-0" />
                    <span>Respuesta DIRECTA</span>
                  </span>
                )}
                {stimulus === "oi" && (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 text-[11px] font-bold border border-indigo-500/40 ring-1 ring-indigo-400/30">
                    <Share2 className="w-3 h-3 text-indigo-400 shrink-0" />
                    <span>Respuesta CONSENSUAL</span>
                  </span>
                )}
              </div>
            </div>

            {/* Columna Ojo Izquierdo (OI) - a la derecha de la pantalla */}
            <div className="p-2.5 rounded-xl bg-slate-900/70 border border-white/5 space-y-1.5">
              <div className="flex items-center justify-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-400" />
                <h3 className="text-xs sm:text-sm font-bold text-white">
                  Ojo izquierdo (OI)
                </h3>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400">
                Lado izquierdo del paciente (tu derecha)
              </p>

              {/* Insignia de respuesta para OI */}
              <div className="pt-1">
                {stimulus === "none" && (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-[11px] font-medium border border-slate-700">
                    <span>Estado basal (reposo)</span>
                  </span>
                )}
                {stimulus === "oi" && (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 text-[11px] font-bold border border-amber-500/40 ring-1 ring-amber-400/30">
                    <Sun className="w-3 h-3 text-amber-400 shrink-0" />
                    <span>Respuesta DIRECTA</span>
                  </span>
                )}
                {stimulus === "od" && (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 text-[11px] font-bold border border-indigo-500/40 ring-1 ring-indigo-400/30">
                    <Share2 className="w-3 h-3 text-indigo-400 shrink-0" />
                    <span>Respuesta CONSENSUAL</span>
                  </span>
                )}
              </div>
            </div>

          </div>

          {/* Lienzo SVG unificado: ambos ojos visibles simultáneamente sin desborde */}
          <div className="relative w-full aspect-[680/260] max-h-[300px] mx-auto select-none overflow-hidden rounded-xl bg-gradient-to-b from-slate-950 via-slate-900/90 to-slate-950 border border-white/5">
            <svg
              viewBox="0 0 680 260"
              className="w-full h-full"
              role="img"
              aria-label="Representación anatómica de ambos ojos vistos de frente"
            >
              <defs>
                {/* Degradado de esclerótica (blanco de los ojos con sombreado sutil) */}
                <radialGradient id="scleraGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="70%" stopColor="#f1f5f9" />
                  <stop offset="100%" stopColor="#cbd5e1" />
                </radialGradient>

                {/* Degradado del iris (estroma fisiológico azul-verdoso avellana) */}
                <radialGradient id="irisGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#0284c7" />
                  <stop offset="45%" stopColor="#0369a1" />
                  <stop offset="85%" stopColor="#0f172a" />
                  <stop offset="100%" stopColor="#090d16" />
                </radialGradient>

                {/* Haz de luz de la linterna OD */}
                <linearGradient id="beamOD" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#fef08a" stopOpacity="0.8" />
                  <stop offset="35%" stopColor="#fef08a" stopOpacity="0.45" />
                  <stop offset="85%" stopColor="#fde047" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#fde047" stopOpacity="0" />
                </linearGradient>

                {/* Haz de luz de la linterna OI */}
                <linearGradient id="beamOI" x1="100%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#fef08a" stopOpacity="0.8" />
                  <stop offset="35%" stopColor="#fef08a" stopOpacity="0.45" />
                  <stop offset="85%" stopColor="#fde047" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#fde047" stopOpacity="0" />
                </linearGradient>

                {/* Resplandor focal corneal (spotlight) */}
                <radialGradient id="spotlightGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#fef08a" stopOpacity="0.65" />
                  <stop offset="50%" stopColor="#fde047" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#fde047" stopOpacity="0" />
                </radialGradient>

                {/* Filtro de sombra suave para párpados */}
                <filter id="eyelidShadow" x="-10%" y="-10%" width="120%" height="120%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.5" />
                </filter>
              </defs>

              {/* Guía central del plano sagital medio (puente nasal) */}
              <g opacity="0.35">
                <line x1="340" y1="30" x2="340" y2="230" stroke="#64748b" strokeWidth="1" strokeDasharray="3 3" />
                <path d="M 335 110 Q 340 125 335 140" fill="none" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
              </g>

              {/* ======================================================== */}
              {/* OJO DERECHO (OD) - CENTRADO EN (x=195, y=125)            */}
              {/* ======================================================== */}
              <g id="eye-od">
                {/* Esclerótica y hendidura palpebral OD */}
                {/* Canthus temporal: (90, 125); Canthus nasal: (300, 125) */}
                <path
                  d="M 90 125 C 125 65, 265 65, 300 125 C 265 185, 125 185, 90 125 Z"
                  fill="url(#scleraGrad)"
                  stroke="#334155"
                  strokeWidth="2"
                  filter="url(#eyelidShadow)"
                />

                {/* Carúncula lagrimal nasal OD */}
                <ellipse cx="292" cy="125" rx="5" ry="4" fill="#f43f5e" opacity="0.45" />

                {/* Vena epiescleral temporal sutil */}
                <path
                  d="M 105 125 Q 120 122 135 127"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="0.75"
                  opacity="0.2"
                />

                {/* Iris OD (concéntrico en x=195, y=125, radio 52) */}
                <circle
                  cx="195"
                  cy="125"
                  r="52"
                  fill="url(#irisGrad)"
                  stroke="#0f172a"
                  strokeWidth="2.5"
                />

                {/* Fibras radiales y colarete del iris OD */}
                <g opacity="0.25" stroke="#bae6fd" strokeWidth="0.75">
                  <line x1="195" y1="75" x2="195" y2="100" />
                  <line x1="195" y1="150" x2="195" y2="175" />
                  <line x1="145" y1="125" x2="170" y2="125" />
                  <line x1="220" y1="125" x2="245" y2="125" />
                  <line x1="160" y1="90" x2="178" y2="108" />
                  <line x1="230" y1="160" x2="212" y2="142" />
                  <line x1="160" y1="160" x2="178" y2="142" />
                  <line x1="230" y1="90" x2="212" y2="108" />
                </g>

                {/* Anillo del colarete del iris */}
                <circle
                  cx="195"
                  cy="125"
                  r="33"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                  opacity="0.3"
                />

                {/* Pupila OD - Se contrae con transición suave */}
                <circle
                  cx="195"
                  cy="125"
                  r={pupilRadius}
                  fill="#020617"
                  stroke="#0f172a"
                  strokeWidth="1"
                  className="transition-[r] duration-[280ms] ease-out motion-reduce:transition-none"
                  style={{
                    transformOrigin: "195px 125px",
                  }}
                />

                {/* Reflejos corneales de Purkinje (especulares) */}
                {/* Reflejo basal constante */}
                <circle cx="184" cy="114" r="3.5" fill="#ffffff" opacity="0.85" />
                <circle cx="189" cy="119" r="1.5" fill="#ffffff" opacity="0.65" />

                {/* Reflejo adicional por linterna si OD está iluminado */}
                {stimulus === "od" && (
                  <circle cx="165" cy="132" r="2.5" fill="#ffffff" opacity="0.95" />
                )}

                {/* Contorno de párpados y pestañas superiores OD */}
                <path
                  d="M 85 125 C 120 60, 270 60, 305 125"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <path
                  d="M 88 126 C 125 188, 265 188, 302 126"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </g>

              {/* ======================================================== */}
              {/* OJO IZQUIERDO (OI) - CENTRADO EN (x=485, y=125)          */}
              {/* ======================================================== */}
              <g id="eye-oi">
                {/* Esclerótica y hendidura palpebral OI */}
                {/* Canthus nasal: (380, 125); Canthus temporal: (590, 125) */}
                <path
                  d="M 380 125 C 415 65, 555 65, 590 125 C 555 185, 415 185, 380 125 Z"
                  fill="url(#scleraGrad)"
                  stroke="#334155"
                  strokeWidth="2"
                  filter="url(#eyelidShadow)"
                />

                {/* Carúncula lagrimal nasal OI */}
                <ellipse cx="388" cy="125" rx="5" ry="4" fill="#f43f5e" opacity="0.45" />

                {/* Vena epiescleral temporal sutil */}
                <path
                  d="M 575 125 Q 560 122 545 127"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="0.75"
                  opacity="0.2"
                />

                {/* Iris OI (concéntrico en x=485, y=125, radio 52) */}
                <circle
                  cx="485"
                  cy="125"
                  r="52"
                  fill="url(#irisGrad)"
                  stroke="#0f172a"
                  strokeWidth="2.5"
                />

                {/* Fibras radiales y colarete del iris OI */}
                <g opacity="0.25" stroke="#bae6fd" strokeWidth="0.75">
                  <line x1="485" y1="75" x2="485" y2="100" />
                  <line x1="485" y1="150" x2="485" y2="175" />
                  <line x1="435" y1="125" x2="460" y2="125" />
                  <line x1="510" y1="125" x2="535" y2="125" />
                  <line x1="450" y1="90" x2="468" y2="108" />
                  <line x1="520" y1="160" x2="502" y2="142" />
                  <line x1="450" y1="160" x2="468" y2="142" />
                  <line x1="520" y1="90" x2="502" y2="108" />
                </g>

                {/* Anillo del colarete del iris */}
                <circle
                  cx="485"
                  cy="125"
                  r="33"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                  opacity="0.3"
                />

                {/* Pupila OI - Se contrae con transición suave */}
                <circle
                  cx="485"
                  cy="125"
                  r={pupilRadius}
                  fill="#020617"
                  stroke="#0f172a"
                  strokeWidth="1"
                  className="transition-[r] duration-[280ms] ease-out motion-reduce:transition-none"
                  style={{
                    transformOrigin: "485px 125px",
                  }}
                />

                {/* Reflejos corneales de Purkinje (especulares) */}
                {/* Reflejo basal constante */}
                <circle cx="474" cy="114" r="3.5" fill="#ffffff" opacity="0.85" />
                <circle cx="479" cy="119" r="1.5" fill="#ffffff" opacity="0.65" />

                {/* Reflejo adicional por linterna si OI está iluminado */}
                {stimulus === "oi" && (
                  <circle cx="515" cy="132" r="2.5" fill="#ffffff" opacity="0.95" />
                )}

                {/* Contorno de párpados y pestañas superiores OI */}
                <path
                  d="M 375 125 C 410 60, 560 60, 595 125"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <path
                  d="M 378 126 C 415 188, 555 188, 592 126"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </g>

              {/* ======================================================== */}
              {/* LINTERNA Y HAZ DE LUZ: OJO DERECHO (OD)                  */}
              {/* ======================================================== */}
              {stimulus === "od" && (
                <g id="flashlight-od" className="animate-in fade-in duration-200">
                  {/* Resplandor suave sobre limbo corneal temporal OD */}
                  <circle cx="165" cy="132" r="38" fill="url(#spotlightGlow)" />

                  {/* Haz cónico de luz desde la linterna hacia la córnea temporal de OD */}
                  <polygon
                    points="55,185 145,105 185,155 70,205"
                    fill="url(#beamOD)"
                  />

                  {/* Cuerpo metálico de la linterna de exploración */}
                  <g transform="translate(25, 175) rotate(-35)">
                    {/* Mango cilíndrico */}
                    <rect x="0" y="0" width="16" height="58" rx="3" fill="#475569" stroke="#94a3b8" strokeWidth="1" />
                    {/* Anillos de agarre antideslizante */}
                    <line x1="0" y1="20" x2="16" y2="20" stroke="#1e293b" strokeWidth="1.5" />
                    <line x1="0" y1="28" x2="16" y2="28" stroke="#1e293b" strokeWidth="1.5" />
                    <line x1="0" y1="36" x2="16" y2="36" stroke="#1e293b" strokeWidth="1.5" />
                    {/* Cabezal de la linterna */}
                    <path d="M -3 0 L 19 0 L 16 -12 L 0 -12 Z" fill="#64748b" stroke="#cbd5e1" strokeWidth="1" />
                    {/* Lente frontal iluminada (LED cálido) */}
                    <ellipse cx="8" cy="-12" rx="8" ry="2.5" fill="#fef08a" />
                  </g>
                </g>
              )}

              {/* ======================================================== */}
              {/* LINTERNA Y HAZ DE LUZ: OJO IZQUIERDO (OI)                 */}
              {/* ======================================================== */}
              {stimulus === "oi" && (
                <g id="flashlight-oi" className="animate-in fade-in duration-200">
                  {/* Resplandor suave sobre limbo corneal temporal OI */}
                  <circle cx="515" cy="132" r="38" fill="url(#spotlightGlow)" />

                  {/* Haz cónico de luz desde la linterna hacia la córnea temporal de OI */}
                  <polygon
                    points="625,185 535,105 495,155 610,205"
                    fill="url(#beamOI)"
                  />

                  {/* Cuerpo metálico de la linterna de exploración */}
                  <g transform="translate(655, 175) rotate(35)">
                    {/* Mango cilíndrico */}
                    <rect x="-16" y="0" width="16" height="58" rx="3" fill="#475569" stroke="#94a3b8" strokeWidth="1" />
                    {/* Anillos de agarre antideslizante */}
                    <line x1="-16" y1="20" x2="0" y2="20" stroke="#1e293b" strokeWidth="1.5" />
                    <line x1="-16" y1="28" x2="0" y2="28" stroke="#1e293b" strokeWidth="1.5" />
                    <line x1="-16" y1="36" x2="0" y2="36" stroke="#1e293b" strokeWidth="1.5" />
                    {/* Cabezal de la linterna */}
                    <path d="M 3 0 L -19 0 L -16 -12 L 0 -12 Z" fill="#64748b" stroke="#cbd5e1" strokeWidth="1" />
                    {/* Lente frontal iluminada (LED cálido) */}
                    <ellipse cx="-8" cy="-12" rx="8" ry="2.5" fill="#fef08a" />
                  </g>
                </g>
              )}
            </svg>
          </div>

          {/* Resumen dinámico del estado actual para visualización inmediata */}
          <div className="mt-3 p-2.5 rounded-xl bg-slate-900/60 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center space-x-2 text-slate-300">
              <span className="font-semibold text-slate-400">Estado observado:</span>
              <span className="text-white font-medium">
                {stimulus === "none" && "Pupilas en reposo isocóricas (sin iluminación focal)"}
                {stimulus === "od" && "Luz focal en Ojo Derecho (OD) → Miosis bilateral simultánea"}
                {stimulus === "oi" && "Luz focal en Ojo Izquierdo (OI) → Miosis bilateral simultánea"}
              </span>
            </div>

            <span className="text-[11px] font-mono text-slate-400">
              {isConstricted ? "Contracción pupilar coordinada" : "Diámetro pupilar basal"}
            </span>
          </div>

        </div>

        {/* Panel de Controles Principales Accesibles (Touch Target >= 44x44px) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Controles de estimulación luminosa:</span>
            <span className="text-[11px] text-slate-500 font-mono">Referidos al paciente</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {/* Botón Iluminar OD */}
            <button
              type="button"
              onClick={handleStimulateOD}
              aria-pressed={stimulus === "od"}
              className={`
                min-h-[44px] px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all
                focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950
                ${
                  stimulus === "od"
                    ? "bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-950/50 scale-[1.02]"
                    : "bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-white/10 hover:border-amber-400/40"
                }
              `}
            >
              <Sun className={`w-4 h-4 ${stimulus === "od" ? "text-slate-950" : "text-amber-400"}`} />
              <span>Iluminar ojo derecho (OD)</span>
            </button>

            {/* Botón Iluminar OI */}
            <button
              type="button"
              onClick={handleStimulateOI}
              aria-pressed={stimulus === "oi"}
              className={`
                min-h-[44px] px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all
                focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950
                ${
                  stimulus === "oi"
                    ? "bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-950/50 scale-[1.02]"
                    : "bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-white/10 hover:border-amber-400/40"
                }
              `}
            >
              <Sun className={`w-4 h-4 ${stimulus === "oi" ? "text-slate-950" : "text-amber-400"}`} />
              <span>Iluminar ojo izquierdo (OI)</span>
            </button>

            {/* Botón Apagar Linterna */}
            <button
              type="button"
              onClick={handleTurnOff}
              disabled={stimulus === "none"}
              aria-pressed={stimulus === "none"}
              className={`
                min-h-[44px] px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all
                focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950
                ${
                  stimulus === "none"
                    ? "opacity-50 cursor-not-allowed bg-slate-900 text-slate-500 border border-white/5"
                    : "bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-white/10 hover:border-sky-400/40"
                }
              `}
            >
              <Power className="w-4 h-4 text-sky-400" />
              <span>Apagar linterna</span>
            </button>

            {/* Botón Restablecer */}
            <button
              type="button"
              onClick={handleReset}
              className="min-h-[44px] px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center space-x-2 bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-white/10 hover:border-white/20 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              <RotateCcw className="w-4 h-4 text-slate-400" />
              <span>Restablecer</span>
            </button>
          </div>
        </div>

        {/* Región de anuncio accesible para lectores de pantalla */}
        <div 
          role="status" 
          aria-live="polite" 
          aria-atomic="true" 
          className="sr-only"
        >
          {getScreenReaderStatus()}
        </div>

        {/* Sección de Revelación Progresiva: Mostrar Explicación */}
        <div className="pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={() => setShowExplanation(!showExplanation)}
            aria-expanded={showExplanation}
            aria-controls="panel-explicacion-reflejos"
            className="w-full min-h-[44px] px-4 py-3 rounded-2xl bg-indigo-950/30 hover:bg-indigo-950/50 border border-indigo-500/30 hover:border-indigo-500/50 text-indigo-200 flex items-center justify-between text-xs sm:text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          >
            <div className="flex items-center space-x-2.5">
              <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>
                {showExplanation ? "Ocultar explicación fisiológica" : "Mostrar explicación fisiológica del arco reflejo"}
              </span>
            </div>
            {showExplanation ? (
              <ChevronUp className="w-4 h-4 text-indigo-400 shrink-0" />
            ) : (
              <ChevronDown className="w-4 h-4 text-indigo-400 shrink-0" />
            )}
          </button>

          {/* Contenido explicativo desplegable */}
          {showExplanation && (
            <div 
              id="panel-explicacion-reflejos"
              className="mt-4 p-4 sm:p-6 rounded-2xl bg-slate-950/80 border border-indigo-500/20 space-y-5 animate-in fade-in slide-in-from-top-2 duration-200"
            >
              {/* Conceptos directos según el estímulo actual */}
              <div className="space-y-3">
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  <span>Diferencia entre Respuesta Directa y Consensual</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm">
                  {/* Tarjeta Directa */}
                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-amber-500/30 space-y-1.5">
                    <div className="flex items-center space-x-2 text-amber-300 font-bold">
                      <Sun className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Reflejo fotomotor directo (ipsilateral)</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed text-xs">
                      Es la contracción (miosis) de la pupila del <strong>mismo ojo</strong> que está recibiendo el haz de luz. Al iluminar directamente la retina, el estímulo activa el brazo aferente y eferente hacia ese mismo iris.
                    </p>
                  </div>

                  {/* Tarjeta Consensual */}
                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-indigo-500/30 space-y-1.5">
                    <div className="flex items-center space-x-2 text-indigo-300 font-bold">
                      <Share2 className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>Reflejo consensual o indirecto (contralateral)</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed text-xs">
                      Es la contracción simultánea de la pupila del <strong>ojo contralateral</strong> (el ojo que no está siendo iluminado directamente). Ocurre porque la señal se distribuye bilateralmente en el mesencéfalo.
                    </p>
                  </div>
                </div>
              </div>

              {/* Recorrido neuroanatómico del arco reflejo */}
              <div className="space-y-3 pt-3 border-t border-white/10">
                <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider text-slate-300">
                  Fundamento neuroanatómico del arco reflejo pupilar:
                </h4>

                <ol className="space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-start space-x-2.5">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 font-mono text-[11px] font-bold shrink-0 mt-0.5">
                      1
                    </span>
                    <div className="leading-relaxed">
                      <strong className="text-white">Brazo aferente (sensorial):</strong> La luz estimula las células ganglionares fotosensibles de la retina. El potencial de acción viaja por el <strong>Nervio Óptico (II par craneal)</strong> hacia el quiasma óptico.
                    </div>
                  </li>

                  <li className="flex items-start space-x-2.5">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 font-mono text-[11px] font-bold shrink-0 mt-0.5">
                      2
                    </span>
                    <div className="leading-relaxed">
                      <strong className="text-white">Decusación y núcleo pretectal:</strong> En el quiasma óptico, las fibras de la hemirretina nasal (~53%) cruzan al lado opuesto, mientras las temporales continúan homolateralmente por los tractos ópticos hasta el <strong>núcleo pretectal olivar</strong> en el mesencéfalo superior (sin hacer sinapsis en el cuerpo geniculado lateral).
                    </div>
                  </li>

                  <li className="flex items-start space-x-2.5">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 font-mono text-[11px] font-bold shrink-0 mt-0.5">
                      3
                    </span>
                    <div className="leading-relaxed">
                      <strong className="text-white">Proyección bilateral (interneuronas mesencefálicas):</strong> Cada núcleo pretectal envía axones tanto al <strong>núcleo de Edinger-Westphal ipsilateral</strong> como al contralateral a través de la comisura posterior. Esta <em>doble decusación</em> (quiasma + comisura posterior) garantiza que un estímulo luminoso en un solo ojo excite simultáneamente ambos núcleos de Edinger-Westphal.
                    </div>
                  </li>

                  <li className="flex items-start space-x-2.5">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 font-mono text-[11px] font-bold shrink-0 mt-0.5">
                      4
                    </span>
                    <div className="leading-relaxed">
                      <strong className="text-white">Brazo eferente (motor parasimpático):</strong> Las fibras preganglionares parasimpáticas emergen con el <strong>Nervio Oculomotor (III par craneal)</strong> y hacen sinapsis en el <strong>ganglio ciliar</strong> de cada órbita.
                    </div>
                  </li>

                  <li className="flex items-start space-x-2.5">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 font-mono text-[11px] font-bold shrink-0 mt-0.5">
                      5
                    </span>
                    <div className="leading-relaxed">
                      <strong className="text-white">Efector final:</strong> Las fibras postganglionares viajan por los nervios ciliares cortos para inervar el <strong>músculo esfínter de la pupila</strong>, provocando la constricción concéntrica (miosis) de ambas pupilas de forma simétrica.
                    </div>
                  </li>
                </ol>
              </div>

              {/* Nota sobre el estado basal */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/10 text-xs text-slate-300 space-y-1">
                <span className="font-semibold text-white block">
                  Estado basal de reposo (linterna apagada):
                </span>
                <p className="leading-relaxed text-slate-400">
                  En ausencia de un foco luminoso directo, ambas pupilas conservan un diámetro simétrico (isocoria fisiológica) gobernado por el equilibrio tónico constante entre la inervación parasimpática constrictora (núcleo de Edinger-Westphal) y la inervación simpática dilatadora (músculo dilatador del iris).
                </p>
              </div>

              {/* Referencias bibliográficas verificadas */}
              <div className="pt-3 border-t border-white/10 space-y-1.5 text-xs text-slate-400">
                <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px] block">
                  Referencias académicas consultadas:
                </span>
                <ul className="space-y-1">
                  <li>
                    <a
                      href="https://eyewiki.aao.org/Reflexes_and_the_Eye"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 text-sky-400 hover:text-sky-300 hover:underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      <span>American Academy of Ophthalmology (AAO) EyeWiki: Reflexes and the Eye</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://nba.uth.tmc.edu/neuroscience/s3/chapter07.html"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 text-sky-400 hover:text-sky-300 hover:underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      <span>Neuroscience Online, McGovern Medical School at UTHealth Houston: Visual Pathways and Pupillary Reflexes (Chapter 7)</span>
                    </a>
                  </li>
                </ul>
              </div>

              {/* Nota de límites didácticos */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200/90 text-[11px] flex items-start space-x-2">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Representación didáctica orientativa:</strong> Los diámetros y velocidades de transición de esta actividad son ilustraciones con fines formativos. No corresponden a mediciones clínicas biométricas calibradas en milímetros ni a latencias de reflejo cuantificadas en milisegundos.
                </p>
              </div>

            </div>
          )}
        </div>

      </GlassCard>
    </section>
  );
};