"use client";

import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { GlassCard } from "@/components/ui/GlassCard";
import confetti from "canvas-confetti";
import { 
  GraduationCap, 
  User, 
  Building2, 
  Stethoscope, 
  Sparkles, 
  Search, 
  ChevronDown, 
  Check, 
  ArrowRight, 
  Activity,
  ShieldCheck,
  KeyRound,
  Copy,
  CheckCircle2
} from "lucide-react";

interface UniversityOption {
  name: string;
  short: string;
  popular?: boolean;
}

const CHILEAN_UNIVERSITIES: UniversityOption[] = [
  { name: "Universidad del Desarrollo", short: "UDD", popular: true },
  { name: "Universidad de Chile", short: "UCH", popular: true },
  { name: "Pontificia Universidad Católica de Chile", short: "PUC", popular: true },
  { name: "Universidad de Concepción", short: "UdeC", popular: true },
  { name: "Universidad Metropolitana de Ciencias de la Educación", short: "UMCE", popular: true },
  { name: "Universidad de Santiago de Chile", short: "USACH" },
  { name: "Universidad de Valparaíso", short: "UV" },
  { name: "Universidad de los Andes", short: "UANDES" },
  { name: "Universidad Andrés Bello", short: "UNAB" },
  { name: "Universidad Diego Portales", short: "UDP" },
  { name: "Universidad Austral de Chile", short: "UACh" },
  { name: "Universidad San Sebastián", short: "USS" },
  { name: "Universidad Mayor", short: "UMayor" },
  { name: "Universidad Católica del Norte", short: "UCN" },
  { name: "Universidad de Antofagasta", short: "UA" },
  { name: "Universidad de La Frontera", short: "UFRO" },
  { name: "Universidad Católica del Maule", short: "UCM" },
  { name: "Universidad de Talca", short: "UTALCA" },
  { name: "Universidad Finis Terrae", short: "UFT" },
  { name: "Universidad Bernardo O'Higgins", short: "UBO" },
  { name: "Universidad Central de Chile", short: "UCENTRAL" },
  { name: "Universidad de Tarapacá", short: "UTA" },
  { name: "Universidad de O'Higgins", short: "UOH" },
  { name: "Otra Universidad / Institución", short: "Salud" },
];

const CAREER_SUGGESTIONS = [
  "Tecnología Médica",
  "Medicina",
  "Enfermería",
  "Kinesiología",
  "Odontología",
  "Obstetricia y Puericultura",
  "Química y Farmacia",
  "Nutrición y Dietética",
];

export default function OnboardingPage() {
  const router = useRouter();
  const { 
    user, 
    completeOnboarding, 
    loginWithParticipantCode, 
    recoverableProfile, 
    recoverBrowserAccount, 
    dismissBrowserRecovery 
  } = useAuth();

  // Modo: registro nuevo participante vs reanudar con código existente
  const [mode, setMode] = useState<"register" | "resume">("register");

  // Campos limpios para nuevo participante (sin valores predeterminados)
  const [nickname, setNickname] = useState(user.onboardingCompleted ? user.nickname : "");
  const [selectedUni, setSelectedUni] = useState<UniversityOption | null>(
    user.onboardingCompleted && user.universityShort
      ? CHILEAN_UNIVERSITIES.find((u) => u.short === user.universityShort) || null
      : null
  );
  const [career, setCareer] = useState(user.onboardingCompleted ? user.career : "");
  const [acceptedTransparency, setAcceptedTransparency] = useState(false);

  const handleRecover = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await recoverBrowserAccount();
      if (res.success && res.newCode) {
        try {
          confetti({
            particleCount: 70,
            spread: 80,
            origin: { y: 0.6 },
            colors: ["#a855f7", "#3b82f6", "#22d3ee", "#10b981"],
          });
        } catch {}
        setAssignedCode(res.newCode);
      } else {
        setErrorMsg(res.error || "No fue posible registrar la recuperación en el servidor.");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Ocurrió un error inesperado al recuperar el expediente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reanudar con código
  const [inputCode, setInputCode] = useState("");

  // Estado de éxito tras registrarse
  const [assignedCode, setAssignedCode] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [uniSearchQuery, setUniSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown si se hace clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtrado de universidades según búsqueda
  const filteredUniversities = useMemo(() => {
    if (!uniSearchQuery.trim()) return CHILEAN_UNIVERSITIES;
    const q = uniSearchQuery.toLowerCase();
    return CHILEAN_UNIVERSITIES.filter(
      (u) => u.name.toLowerCase().includes(q) || u.short.toLowerCase().includes(q)
    );
  }, [uniSearchQuery]);

  const REG_TOKEN_KEY = "medstudy_pending_registration_token";

  const getRegistrationToken = useCallback((): string => {
    if (typeof window === "undefined") return "";
    try {
      let t = sessionStorage.getItem(REG_TOKEN_KEY);
      if (!t) {
        t = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
        sessionStorage.setItem(REG_TOKEN_KEY, t);
      }
      return t;
    } catch {
      return typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
    }
  }, []);

  const clearRegistrationToken = useCallback((): void => {
    if (typeof window === "undefined") return;
    try {
      sessionStorage.removeItem(REG_TOKEN_KEY);
    } catch {}
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!nickname.trim()) {
      setErrorMsg("Por favor, ingresa tu nombre o apodo.");
      return;
    }
    if (!selectedUni) {
      setErrorMsg("Por favor, selecciona tu universidad.");
      return;
    }
    if (!career.trim()) {
      setErrorMsg("Por favor, ingresa o selecciona tu carrera.");
      return;
    }
    if (!acceptedTransparency) {
      setErrorMsg("Debes confirmar que has leído el aviso de transparencia antes de comenzar.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const clientToken = getRegistrationToken();
      const result = await completeOnboarding({
        nickname: nickname.trim(),
        university: selectedUni.name,
        universityShort: selectedUni.short,
        career: career.trim(),
        clientRequestId: clientToken,
      });

      if (result?.participantCode) {
        clearRegistrationToken();
        try {
          confetti({
            particleCount: 70,
            spread: 80,
            origin: { y: 0.6 },
            colors: ["#a855f7", "#3b82f6", "#22d3ee", "#10b981"],
          });
        } catch {}
        setAssignedCode(result.participantCode);
      } else {
        setErrorMsg("El servidor no entregó un código de participante válido.");
      }
    } catch (err: any) {
      console.error("Error al registrar expediente:", err);
      // Mantiene todos los campos del formulario intactos para permitir reintentar
      setErrorMsg(err?.message || "Ocurrió un error al registrar tu expediente en el servidor. Intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResume = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) {
      setErrorMsg("Ingresa tu código de participante.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    const res = await loginWithParticipantCode(inputCode.trim());
    if (res.success) {
      router.push("/");
    } else {
      setIsSubmitting(false);
      setErrorMsg(res.error || "Código no encontrado. Verifica mayúsculas y guión.");
    }
  };

  const copyToClipboard = () => {
    if (!assignedCode) return;
    navigator.clipboard.writeText(assignedCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 py-8 animate-in fade-in zoom-in-95 duration-300">
      
      {/* Tarjeta Central Limpia con Glassmorphism */}
      <div className="w-full max-w-xl relative">
        
        {/* Glows decorativos */}
        <div className="absolute -top-16 -left-16 w-48 h-48 bg-purple-600/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-blue-600/25 rounded-full blur-3xl pointer-events-none" />

        <GlassCard className="relative z-10 p-6 sm:p-10 border border-white/20 shadow-2xl bg-gradient-to-b from-slate-900/90 via-slate-900/70 to-purple-950/40 rounded-3xl">
          
          {/* Logo y Encabezado */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 p-[1px] shadow-xl shadow-purple-500/20 mb-4">
              <div className="w-full h-full bg-slate-950 rounded-[23px] flex items-center justify-center">
                <Activity className="w-8 h-8 text-purple-400" />
              </div>
            </div>

            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-400/30 text-purple-300 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Registro de Participante</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              ¡Te damos la bienvenida a MedStudy!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-md mx-auto leading-relaxed">
              Configura tu expediente para la sesión de estudio clínico. Tus datos se guardarán de forma individual en el servidor.
            </p>

            {/* Alternador de Modo: Nuevo Participante vs Reanudar Código */}
            {!assignedCode && (
              <div className="flex items-center justify-center p-1 rounded-xl bg-slate-950/70 border border-white/10 mt-5 max-w-xs mx-auto text-xs">
                <button
                  type="button"
                  onClick={() => { setMode("register"); setErrorMsg(""); }}
                  className={`flex-1 py-1.5 px-3 rounded-lg font-medium transition-all ${
                    mode === "register"
                      ? "bg-purple-600 text-white shadow-md font-semibold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Nuevo Participante
                </button>
                <button
                  type="button"
                  onClick={() => { setMode("resume"); setErrorMsg(""); }}
                  className={`flex-1 py-1.5 px-3 rounded-lg font-medium transition-all ${
                    mode === "resume"
                      ? "bg-purple-600 text-white shadow-md font-semibold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Tengo un Código
                </button>
              </div>
            )}
          </div>

          {errorMsg && (
            <div className="mb-6 p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium text-center">
              {errorMsg}
            </div>
          )}

          {/* AVISO DE RECUPERACIÓN EXPLÍCITA DE PERFIL PREVIO DEL NAVEGADOR */}
          {recoverableProfile && !assignedCode && (
            <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs shadow-lg space-y-3">
              <div className="flex items-start space-x-2.5">
                <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-amber-300 text-xs sm:text-sm">
                    Expediente previo detectado en este navegador
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Se encontraron datos guardados localmente para <strong className="text-white">{recoverableProfile.nickname}</strong> ({recoverableProfile.universityShort || recoverableProfile.university})
                    {recoverableProfile.provisionalCode ? <> con código provisional <span className="font-mono text-amber-300">{recoverableProfile.provisionalCode}</span></> : null}.
                    {recoverableProfile.claimedXp > 0 ? <> Registra {recoverableProfile.claimedXp} XP autodeclarados.</> : null}
                  </p>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Al recuperar, el servidor creará una cuenta oficial de estudiante, le asignará un código verificado y registrará tu avance previo de navegación de forma no alterable ni confusa.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleRecover}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Generando cuenta oficial..." : "Crear cuenta oficial con estos datos"}
                </button>
                {recoverableProfile.provisionalCode && (
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => {
                      setMode("resume");
                      setInputCode(recoverableProfile.provisionalCode || "");
                      setErrorMsg("");
                    }}
                    className="px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/30 text-xs transition-all cursor-pointer"
                  >
                    Probar acceso con código previo
                  </button>
                )}
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={dismissBrowserRecovery}
                  className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs transition-all cursor-pointer"
                >
                  Descartar y registrar desde cero
                </button>
              </div>
            </div>
          )}

          {/* VISTA DE CONFIRMACIÓN CON CÓDIGO GENERADO */}
          {assignedCode ? (
            <div className="space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
              <div className="p-6 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-200 space-y-3">
                <div className="inline-flex p-3 rounded-full bg-emerald-500/20 text-emerald-400">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white">¡Expediente Registrado con Éxito!</h3>
                <p className="text-xs text-slate-300 max-w-sm mx-auto">
                  Se ha generado tu código individual de participante. Puedes guardarlo para reanudar tu sesión desde cualquier dispositivo:
                </p>
                
                <div className="flex items-center justify-center space-x-2 pt-2">
                  <div className="px-5 py-2.5 rounded-xl bg-slate-950 border border-emerald-400/40 text-emerald-300 font-mono text-xl font-bold tracking-widest">
                    {assignedCode}
                  </div>
                  <button
                    type="button"
                    onClick={copyToClipboard}
                    className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/10"
                    title="Copiar código"
                  >
                    {copiedCode ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => router.push("/")}
                className="w-full flex items-center justify-center space-x-2 py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-purple-900/40 transition-all cursor-pointer"
              >
                <span>Comenzar a estudiar</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : mode === "resume" ? (
            /* FORMULARIO PARA REANUDAR CON CÓDIGO EXISTENTE */
            <form onSubmit={handleResume} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                  <KeyRound className="w-3.5 h-3.5 text-purple-400" />
                  <span>Código de Participante <span className="text-rose-400">*</span></span>
                </label>
                <input
                  type="text"
                  required
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  placeholder="ej. MED-7B4K"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-950/70 border border-white/10 text-base font-mono tracking-wider text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all uppercase"
                />
                <p className="text-[11px] text-slate-400">
                  Ingresa el código que recibiste al registrarte en la prueba.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center space-x-2.5 py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-purple-900/40 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
              >
                <span>{isSubmitting ? "Verificando código..." : "Reanudar mi sesión"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* FORMULARIO LIMPIO DE NUEVO PARTICIPANTE */
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Campo 1: Nombre de usuario o Apodo */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                  <User className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Nombre o Apodo <span className="text-rose-400">*</span></span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="Escribe tu nombre o apodo"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-950/70 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Identificador para tu avance y resultados de estudio.
                </p>
              </div>

              {/* Campo 2: Menú Desplegable: Universidad */}
              <div className="space-y-2" ref={dropdownRef}>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                  <Building2 className="w-3.5 h-3.5 text-purple-400" />
                  <span>Universidad <span className="text-rose-400">*</span></span>
                </label>

                {/* Botón trigger del dropdown */}
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`w-full px-4 py-3 rounded-2xl bg-slate-950/70 border border-white/10 text-sm text-left flex items-center justify-between hover:border-white/20 focus:outline-none focus:border-purple-500 transition-all ${
                    !selectedUni ? "text-slate-400" : "text-white"
                  }`}
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    {selectedUni ? (
                      <>
                        <span className="px-2 py-0.5 rounded-lg bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30">
                          {selectedUni.short}
                        </span>
                        <span className="text-white truncate font-medium">{selectedUni.name}</span>
                      </>
                    ) : (
                      <span className="text-slate-500">Seleccionar universidad chilena...</span>
                    )}
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Menú desplegable flotante con buscador */}
                {isDropdownOpen && (
                  <div className="absolute left-0 right-0 mt-2 rounded-2xl glass-panel border border-white/20 shadow-2xl p-3 z-50 bg-slate-950/95 backdrop-blur-2xl max-h-72 flex flex-col animate-in fade-in zoom-in-95 duration-150">
                    <div className="relative mb-2 shrink-0">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        autoFocus
                        value={uniSearchQuery}
                        onChange={(e) => setUniSearchQuery(e.target.value)}
                        placeholder="Buscar universidad..."
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-400"
                      />
                    </div>

                    <div className="overflow-y-auto space-y-1 flex-1 pr-1 custom-scrollbar">
                      {filteredUniversities.length === 0 ? (
                        <div className="p-3 text-center text-xs text-slate-400">
                          No se encontró la universidad. Puedes seleccionarla escribiendo su sigla o elegir otra.
                        </div>
                      ) : (
                        filteredUniversities.map((uni) => {
                          const isSelected = selectedUni?.short === uni.short;
                          return (
                            <button
                              key={uni.short + uni.name}
                              type="button"
                              onClick={() => {
                                setSelectedUni(uni);
                                setIsDropdownOpen(false);
                                setUniSearchQuery("");
                              }}
                              className={`w-full px-3 py-2 rounded-xl text-xs flex items-center justify-between text-left transition-all ${
                                isSelected 
                                  ? "bg-purple-600/30 text-purple-200 border border-purple-500/40 font-semibold" 
                                  : "text-slate-300 hover:bg-white/10 hover:text-white"
                              }`}
                            >
                              <div className="flex items-center space-x-2 truncate">
                                <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-slate-300">
                                  {uni.short}
                                </span>
                                <span className="truncate">{uni.name}</span>
                              </div>
                              {isSelected && <Check className="w-4 h-4 text-purple-400 shrink-0" />}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

                {/* Chips rápidos (desmarcados inicialmente) */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {CHILEAN_UNIVERSITIES.filter((u) => u.popular).map((u) => (
                    <button
                      key={u.short}
                      type="button"
                      onClick={() => setSelectedUni(u)}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all ${
                        selectedUni?.short === u.short 
                          ? "bg-purple-600 text-white shadow-md shadow-purple-900/30 border border-purple-400/40" 
                          : "bg-slate-950/60 text-slate-400 hover:text-white border border-white/5 hover:border-white/15"
                      }`}
                    >
                      {u.short}
                    </button>
                  ))}
                </div>
              </div>

              {/* Campo 3: Carrera */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                  <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Carrera <span className="text-rose-400">*</span></span>
                </label>
                <input
                  type="text"
                  required
                  value={career}
                  onChange={(e) => setCareer(e.target.value)}
                  placeholder="Escribe o selecciona tu carrera"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-950/70 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                />

                {/* Chips de carreras (desmarcados inicialmente) */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {CAREER_SUGGESTIONS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCareer(c)}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-medium transition-all ${
                        career === c 
                          ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-semibold" 
                          : "bg-slate-950/40 text-slate-400 hover:text-white border border-white/5"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* AVISO ÉTICO DE TRANSPARENCIA */}
              <div className="p-4 rounded-2xl bg-slate-950/90 border border-indigo-500/30 space-y-3">
                <div className="flex items-start space-x-2.5 text-indigo-300 text-xs">
                  <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-bold uppercase tracking-wider block text-[11px] text-indigo-200">
                      Aviso de Transparencia de la Evaluación
                    </span>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Para evaluar la herramienta MedStudy, durante esta prueba se registrarán de forma segura tu avance, tiempos de estudio y respuestas a cuestionarios. Estos datos serán consultados exclusivamente por el responsable del proyecto con fines de análisis metodológico. No se solicita información personal sensible ni se mostrarán tus resultados a otros estudiantes.
                    </p>
                  </div>
                </div>

                <label className="flex items-center space-x-2.5 pt-1 text-xs text-slate-200 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={acceptedTransparency}
                    onChange={(e) => setAcceptedTransparency(e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 bg-slate-900 text-purple-600 focus:ring-purple-500 focus:ring-offset-0 cursor-pointer"
                  />
                  <span className="text-[11px] text-purple-200 font-medium">
                    He leído y acepto participar en la prueba de evaluación académica.
                  </span>
                </label>
              </div>

              {/* Botón Principal de Inicio */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center space-x-2.5 py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-purple-900/40 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
                >
                  <span>{isSubmitting ? "Registrando expediente en servidor..." : "Crear mi expediente y comenzar"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </form>
          )}

          {/* Footer Informativo */}
          <div className="mt-8 pt-4 border-t border-white/10 text-center text-[11px] text-slate-400 flex items-center justify-center space-x-1.5">
            <Stethoscope className="w-3.5 h-3.5 text-purple-400" />
            <span>MedStudy adapta los contenidos clínicos según tu plan universitario</span>
          </div>

        </GlassCard>
      </div>

    </div>
  );
}