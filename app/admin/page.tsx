"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  ShieldCheck, 
  Users, 
  CheckCircle2, 
  Activity, 
  Search, 
  FileText, 
  RotateCcw, 
  LogOut, 
  TrendingUp, 
  AlertCircle, 
  Calendar, 
  Award, 
  BookOpen, 
  Layers, 
  Clock, 
  Info,
  X,
  ChevronRight,
  Filter,
  Lock
} from "lucide-react";
import { isUnitEnabled, isModuleEnabled } from "@/lib/modules-config";

interface AdminParticipantSummary {
  id: string;
  participant_code: string;
  nickname: string;
  university: string;
  university_short: string;
  career: string;
  created_at: string;
  last_active_at: string;
  completed_units_count: number;
  total_units_count: number;
  completed_available_units_count: number;
  total_available_units_count: number;
  historical_completed_units_count: number;
  quiz_attempts_count: number;
  first_attempt_score: number | null;
  latest_attempt_score: number | null;
  top_mistake_topics: { topic: string; count: number }[];
}

interface GlobalStats {
  totalStudents: number;
  activeLast24h: number;
  totalQuizAttempts: number;
  averageQuizScore: number | null;
}

interface ParticipantDetail {
  user: {
    id: string;
    participant_code: string;
    nickname: string;
    university: string;
    university_short: string;
    career: string;
    xp: number;
    streak_days: number;
    created_at: string;
    last_active_at: string;
  };
  unitProgress: any[];
  quizAttempts: any[];
  activityLogs: any[];
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [participants, setParticipants] = useState<AdminParticipantSummary[]>([]);
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Detalle de participante seleccionado
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<ParticipantDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [moduleFilter, setModuleFilter] = useState<string>("all");

  const loadData = async () => {
    setIsLoading(true);
    setErrorMsg("");

    try {
      const [resPart, resStats] = await Promise.all([
        fetch("/api/admin/participants"),
        fetch("/api/admin/stats"),
      ]);

      if (resPart.status === 401 || resPart.status === 403) {
        router.push("/admin/login");
        return;
      }

      if (!resPart.ok) {
        setErrorMsg("Error al obtener los participantes.");
        setIsLoading(false);
        return;
      }

      const partData = await resPart.json();
      setParticipants(partData.participants || []);

      if (resStats.ok) {
        const statsData = await resStats.json();
        setStats(statsData.stats || null);
      }
    } catch {
      setErrorMsg("Error de conexión al cargar el panel.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenDetail = async (id: string) => {
    setSelectedParticipantId(id);
    setIsLoadingDetail(true);
    setModuleFilter("all");
    try {
      const res = await fetch(`/api/admin/participants/${id}`);
      if (res.ok) {
        const data = await res.json();
        setDetailData(data.detail || null);
      }
    } catch {
      console.error("Error al cargar detalle");
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return "Sin datos";
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("es-CL", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Sin datos";
    }
  };

  const formatRelativeTime = (isoString?: string | null) => {
    if (!isoString) return "Sin datos";
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins < 1) return "Hace un momento";
      if (diffMins < 60) return `Hace ${diffMins} min`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `Hace ${diffHours} h`;
      const diffDays = Math.floor(diffHours / 24);
      return `Hace ${diffDays} d`;
    } catch {
      return "Sin datos";
    }
  };

  // Filtrado de participantes
  const filteredParticipants = useMemo(() => {
    if (!searchQuery.trim()) return participants;
    const q = searchQuery.toLowerCase().trim();
    return participants.filter(
      (p) =>
        p.participant_code.toLowerCase().includes(q) ||
        p.nickname.toLowerCase().includes(q) ||
        p.university.toLowerCase().includes(q) ||
        p.career.toLowerCase().includes(q)
    );
  }, [participants, searchQuery]);

  // Filtrado en el modal de detalle por módulo
  const filteredQuizAttempts = useMemo(() => {
    if (!detailData?.quizAttempts) return [];
    if (moduleFilter === "all") return detailData.quizAttempts;
    return detailData.quizAttempts.filter((a) => a.module_id === moduleFilter);
  }, [detailData, moduleFilter]);

  const filteredUnitProgress = useMemo(() => {
    if (!detailData?.unitProgress) return [];
    if (moduleFilter === "all") return detailData.unitProgress;
    return detailData.unitProgress.filter((u) => u.module_id === moduleFilter);
  }, [detailData, moduleFilter]);

  const filteredActivityLogs = useMemo(() => {
    if (!detailData?.activityLogs) return [];
    if (moduleFilter === "all") return detailData.activityLogs;
    return detailData.activityLogs.filter((l) => l.module_id === moduleFilter);
  }, [detailData, moduleFilter]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8">
      {/* Contenedor Principal */}
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Encabezado Superior */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Panel de Control de la Evaluación Docente</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Seguimiento de Participantes en Prueba
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Supervisión de avance individual, intentos de cuestionarios y análisis de tópicos con mayor tasa de error.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={loadData}
              title="Actualizar datos"
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors flex items-center space-x-2 text-xs font-semibold"
            >
              <RotateCcw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Actualizar</span>
            </button>

            <button
              onClick={handleLogout}
              className="px-3.5 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Tarjetas de Métricas Globales */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <GlassCard className="p-5 border border-white/10">
            <div className="flex items-center justify-between text-indigo-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Participantes</span>
              <Users className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-white">
              {stats ? stats.totalStudents : "—"}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">Estudiantes registrados</span>
          </GlassCard>

          <GlassCard className="p-5 border border-white/10">
            <div className="flex items-center justify-between text-emerald-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Activos Recientes</span>
              <Activity className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-white">
              {stats ? stats.activeLast24h : "—"}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">En las últimas 24 horas</span>
          </GlassCard>

          <GlassCard className="p-5 border border-white/10">
            <div className="flex items-center justify-between text-purple-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Evaluaciones Realizadas</span>
              <FileText className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-white">
              {stats ? stats.totalQuizAttempts : "—"}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">Total de intentos registrados</span>
          </GlassCard>

          <GlassCard className="p-5 border border-white/10">
            <div className="flex items-center justify-between text-cyan-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Puntuación Media</span>
              <TrendingUp className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-white">
              {stats?.averageQuizScore !== null && stats?.averageQuizScore !== undefined
                ? `${stats.averageQuizScore}%`
                : "Sin datos"}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">Promedio en cuestionarios</span>
          </GlassCard>
        </div>

        {/* Nota Metodológica de Desempeño */}
        <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 flex items-start space-x-3 text-xs text-indigo-200">
          <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold text-white">Criterio de Evaluación Pedagógica:</span> El panel distingue de forma estricta entre lectura de contenidos, finalización y desempeño en pruebas. Un incremento en la puntuación entre el primer y último intento no debe interpretarse automáticamente como consolidación del aprendizaje, ya que puede estar mediado por la repetición inmediata del reactivo. Si un estudiante no ha completado una actividad, se indica explícitamente como <strong className="text-white">“Sin datos”</strong>.
          </div>
        </div>

        {/* Barra de Búsqueda */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por código (ej. MED-7B4K), nombre, universidad o carrera..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="text-xs text-slate-400">
            Mostrando <strong className="text-white">{filteredParticipants.length}</strong> participante(s)
          </div>
        </div>

        {/* TABLA PRINCIPAL DE PARTICIPANTES */}
        <GlassCard className="overflow-hidden border border-white/10 rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-white/10">
                <tr>
                  <th className="py-3.5 px-4">Código / Participante</th>
                  <th className="py-3.5 px-4">Universidad & Carrera</th>
                  <th className="py-3.5 px-4">Registro</th>
                  <th className="py-3.5 px-4">Última Actividad</th>
                  <th className="py-3.5 px-4">Lecciones Completadas</th>
                  <th className="py-3.5 px-4 text-center">Cuestionarios</th>
                  <th className="py-3.5 px-4">Desempeño (1er → Último)</th>
                  <th className="py-3.5 px-4">Temas con Más Errores</th>
                  <th className="py-3.5 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredParticipants.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-500">
                      {isLoading ? "Cargando participantes..." : "No se encontraron participantes registrados."}
                    </td>
                  </tr>
                ) : (
                  filteredParticipants.map((p) => {
                    const firstScore = p.first_attempt_score !== null ? `${p.first_attempt_score}%` : "Sin datos";
                    const latestScore = p.latest_attempt_score !== null ? `${p.latest_attempt_score}%` : "Sin datos";

                    return (
                      <tr key={p.id} className="hover:bg-white/5 transition-colors">
                        {/* Código y Apodo */}
                        <td className="py-3 px-4">
                          <div className="font-mono font-bold text-indigo-300 text-xs tracking-wide">
                            {p.participant_code}
                          </div>
                          <div className="text-white font-medium truncate max-w-[130px]">
                            {p.nickname}
                          </div>
                        </td>

                        {/* Universidad y Carrera */}
                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-200 block truncate max-w-[140px]">
                            {p.university_short} · {p.university}
                          </span>
                          <span className="text-slate-400 text-[11px] block truncate max-w-[140px]">
                            {p.career}
                          </span>
                        </td>

                        {/* Fecha de Registro */}
                        <td className="py-3 px-4 text-slate-300 whitespace-nowrap">
                          {formatDate(p.created_at)}
                        </td>

                        {/* Última Actividad */}
                        <td className="py-3 px-4 text-slate-300 whitespace-nowrap">
                          <div className="flex items-center space-x-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{formatRelativeTime(p.last_active_at)}</span>
                          </div>
                        </td>

                        {/* Lecciones Completadas */}
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-slate-900 rounded-full h-2 overflow-hidden border border-white/10">
                              <div
                                className="bg-indigo-500 h-full rounded-full"
                                style={{
                                  width: `${
                                    ((p.completed_available_units_count || 0) /
                                      (p.total_available_units_count || 1)) *
                                    100
                                  }%`,
                                }}
                              />
                            </div>
                            <span className="font-mono text-slate-200 text-[11px]">
                              {p.completed_available_units_count ?? p.completed_units_count}/{p.total_available_units_count ?? p.total_units_count}
                            </span>
                          </div>
                          {p.historical_completed_units_count > 0 && (
                            <div className="inline-flex items-center space-x-1 text-[10px] text-amber-400 font-medium mt-1">
                              <Lock className="w-2.5 h-2.5" />
                              <span>+{p.historical_completed_units_count} hist. en pausa</span>
                            </div>
                          )}
                        </td>

                        {/* Total Intentos de Cuestionarios */}
                        <td className="py-3 px-4 text-center">
                          <span className="inline-block px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30 text-xs">
                            {p.quiz_attempts_count} {p.quiz_attempts_count === 1 ? "intento" : "intentos"}
                          </span>
                        </td>

                        {/* 1er Intento vs Último */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          {p.first_attempt_score === null && p.latest_attempt_score === null ? (
                            <span className="text-slate-500 italic">Sin datos</span>
                          ) : (
                            <div className="flex items-center space-x-1.5 font-mono">
                              <span className="text-slate-300">{firstScore}</span>
                              <span className="text-slate-500">→</span>
                              <span className="font-bold text-emerald-400">{latestScore}</span>
                            </div>
                          )}
                        </td>

                        {/* Temas con Más Errores */}
                        <td className="py-3 px-4 max-w-[200px]">
                          {p.top_mistake_topics.length === 0 ? (
                            <span className="text-slate-500 italic">Sin errores registrados</span>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {p.top_mistake_topics.map((t) => (
                                <span
                                  key={t.topic}
                                  className="px-2 py-0.5 rounded bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[10px] font-medium truncate max-w-[160px]"
                                  title={`${t.topic}: ${t.count} fallos`}
                                >
                                  {t.topic} ({t.count})
                                </span>
                              ))}
                            </div>
                          )}
                        </td>

                        {/* Botón Ver Detalle */}
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleOpenDetail(p.id)}
                            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 font-semibold text-[11px] transition-colors"
                          >
                            <span>Detalle</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* MODAL / PANEL DE DETALLE DE PARTICIPANTE */}
        {selectedParticipantId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-white/20 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
              
              {/* Header del Modal */}
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-slate-950/70">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                    <UserCircle2Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h2 className="text-xl font-bold text-white">
                        {detailData?.user.nickname || "Cargando participante..."}
                      </h2>
                      {detailData?.user.participant_code && (
                        <span className="px-2.5 py-0.5 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-mono text-xs font-bold">
                          {detailData.user.participant_code}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {detailData?.user.university} · {detailData?.user.career}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => { setSelectedParticipantId(null); setDetailData(null); }}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Filtro por Módulo */}
              <div className="px-6 py-3 border-b border-white/10 bg-slate-950/40 flex items-center space-x-2 text-xs">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">Filtrar Módulo:</span>
                {["all", "anatomia", "bioquimica", "histologia", "microbiologia"].map((mod) => (
                  <button
                    key={mod}
                    onClick={() => setModuleFilter(mod)}
                    className={`px-2.5 py-1 rounded-lg transition-all capitalize ${
                      moduleFilter === mod
                        ? "bg-indigo-600 text-white font-bold shadow"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {mod === "all" ? "Todos" : mod}
                  </button>
                ))}
              </div>

              {/* Contenido del Modal con Scroll */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar text-xs">
                {isLoadingDetail ? (
                  <div className="py-12 text-center text-slate-400">Cargando expediente...</div>
                ) : !detailData ? (
                  <div className="py-12 text-center text-slate-400">No se pudo cargar el detalle.</div>
                ) : (
                  <>
                    {/* DIMENSIÓN 1: DESEMPEÑO EN EVALUACIONES (INTENTOS DE CUESTIONARIOS) */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 text-purple-400 font-bold uppercase tracking-wider text-[11px]">
                        <Award className="w-4 h-4" />
                        <span>Historial de Desempeño en Cuestionarios ({filteredQuizAttempts.length} intentos)</span>
                      </div>

                      {filteredQuizAttempts.length === 0 ? (
                        <div className="p-4 rounded-xl bg-slate-950/50 border border-white/5 text-slate-500 italic">
                          Sin cuestionarios realizados en este módulo.
                        </div>
                      ) : (
                        <div className="overflow-x-auto border border-white/10 rounded-xl">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase">
                              <tr>
                                <th className="py-2.5 px-3">Fecha y Hora</th>
                                <th className="py-2.5 px-3">Módulo / Unidad</th>
                                <th className="py-2.5 px-3">Versión</th>
                                <th className="py-2.5 px-3 text-center">Nº Intento</th>
                                <th className="py-2.5 px-3 text-center">Aciertos</th>
                                <th className="py-2.5 px-3 text-center">Puntaje Validado</th>
                                <th className="py-2.5 px-3">Temas con Errores</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {filteredQuizAttempts.map((a) => {
                                let incorrect: string[] = [];
                                try {
                                  incorrect = JSON.parse(a.incorrect_topics_json || "[]");
                                } catch {}

                                return (
                                  <tr key={a.id} className="hover:bg-white/5">
                                    <td className="py-2.5 px-3 text-slate-300 whitespace-nowrap">
                                      {formatDate(a.created_at)}
                                    </td>
                                    <td className="py-2.5 px-3 font-semibold text-slate-200 capitalize">
                                      {a.module_id} · {a.unit_id}
                                    </td>
                                    <td className="py-2.5 px-3 font-mono text-slate-400">
                                      {a.quiz_version}
                                    </td>
                                    <td className="py-2.5 px-3 text-center font-bold text-indigo-300">
                                      #{a.attempt_number}
                                    </td>
                                    <td className="py-2.5 px-3 text-center font-mono">
                                      {a.correct_count} / {a.total_questions}
                                    </td>
                                    <td className="py-2.5 px-3 text-center font-bold">
                                      <span className={a.score >= 70 ? "text-emerald-400" : "text-amber-400"}>
                                        {a.score}%
                                      </span>
                                    </td>
                                    <td className="py-2.5 px-3">
                                      {incorrect.length === 0 ? (
                                        <span className="text-emerald-400">Sin fallos</span>
                                      ) : (
                                        <div className="flex flex-wrap gap-1">
                                          {incorrect.map((t, idx) => (
                                            <span
                                              key={idx}
                                              className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 text-[10px]"
                                            >
                                              {t}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    {/* DIMENSIÓN 2: FINALIZACIÓN DE UNIDADES */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 text-emerald-400 font-bold uppercase tracking-wider text-[11px]">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Estado de Finalización de Unidades</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {filteredUnitProgress.map((u) => {
                          const isEnabled = isUnitEnabled(u.unit_id);
                          return (
                            <div
                              key={u.id}
                              className={`p-3 rounded-xl border flex items-center justify-between ${
                                isEnabled
                                  ? "bg-slate-950/60 border-white/10"
                                  : "bg-slate-950/30 border-white/5 opacity-80"
                              }`}
                            >
                              <div>
                                <div className="flex items-center space-x-1.5">
                                  <span className="font-semibold text-slate-200 capitalize">
                                    {u.module_id}: {u.unit_id}
                                  </span>
                                  {!isEnabled && (
                                    <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[9px] font-bold flex items-center space-x-1">
                                      <Lock className="w-2.5 h-2.5" />
                                      <span>Pausado (Histórico)</span>
                                    </span>
                                  )}
                                </div>
                                <span className="text-[11px] text-slate-400">
                                  Estado: <strong className={u.score >= 100 ? "text-emerald-400" : u.score > 0 ? "text-amber-400" : "text-slate-500"}>
                                    {u.score >= 100 ? "Completada (100%)" : u.score > 0 ? `En progreso (${u.score}%)` : "No iniciada"}
                                  </strong>
                                </span>
                              </div>
                              {u.completed_at && (
                                <span className="text-[10px] text-slate-400">
                                  {formatDate(u.completed_at)}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* DIMENSIÓN 3: LECTURA Y EXPLORACIÓN INTERACTIVA */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 text-cyan-400 font-bold uppercase tracking-wider text-[11px]">
                        <BookOpen className="w-4 h-4" />
                        <span>Actividad de Lectura y Exploración</span>
                      </div>

                      {filteredActivityLogs.length === 0 ? (
                        <div className="p-4 rounded-xl bg-slate-950/50 border border-white/5 text-slate-500 italic">
                          Sin registros de lectura o interacción en este módulo.
                        </div>
                      ) : (
                        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                          {filteredActivityLogs.map((log) => (
                            <div
                              key={log.id}
                              className="px-3 py-2 rounded-lg bg-slate-950/40 border border-white/5 flex items-center justify-between text-[11px]"
                            >
                              <div className="flex items-center space-x-2">
                                <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 font-semibold uppercase text-[9px]">
                                  {log.activity_type}
                                </span>
                                <span className="text-slate-300 capitalize">
                                  {log.module_id} · {log.unit_id}
                                </span>
                              </div>
                              <span className="text-slate-500">{formatDate(log.created_at)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function UserCircle2Icon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="10" r="3" />
      <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" />
    </svg>
  );
}
