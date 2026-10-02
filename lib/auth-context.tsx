"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "./supabase/client";

// ===========================================================================
// DEFINICIONES DEL SISTEMA DE RANGOS
// ===========================================================================

export interface RankDefinition {
  level: number;
  name: string;
  minXp: number;
  maxXp: number;
  description: string;
}

export const HEALTH_RANKS: RankDefinition[] = [
  { level: 1, name: "Aspirante Clínico", minXp: 0, maxXp: 100, description: "Iniciación en las ciencias biomédicas y terminología de la salud." },
  { level: 2, name: "Estudiante de Ciencias Básicas", minXp: 100, maxXp: 250, description: "Comprensión fundamental de anatomía, bioquímica y morfología." },
  { level: 3, name: "Explorador Fisiológico", minXp: 250, maxXp: 450, description: "Análisis del funcionamiento sistémico, homeostático e histológico." },
  { level: 4, name: "Analista de la Salud", minXp: 450, maxXp: 700, description: "Integración de mecanismos patogénicos, agentes microbianos y respuestas corporales." },
  { level: 5, name: "Asistente Clínico", minXp: 700, maxXp: 1000, description: "Aplicación de conocimientos preclínicos en escenarios simulados." },
  { level: 6, name: "Interno en Rotación", minXp: 1000, maxXp: 1400, description: "Práctica activa y consolidación de competencias asistenciales." },
  { level: 7, name: "Profesional en Formación", minXp: 1400, maxXp: 1900, description: "Dominio avanzado de razonamiento diagnóstico y protocolos terapéuticos." },
  { level: 8, name: "Especialista Diagnóstico", minXp: 1900, maxXp: 2500, description: "Resolución de casos clínicos complejos y juicio crítico interdisciplinario." },
  { level: 9, name: "Maestro de la Salud", minXp: 2500, maxXp: 3200, description: "Excelencia asistencial, liderazgo en equipos y docencia médica." },
  { level: 10, name: "Erudito Clínico", minXp: 3200, maxXp: 5000, description: "Cumbre del saber biomédico y sabiduría clínica integral." },
];

// ===========================================================================
// TIPOS DE PERFIL DE USUARIO
// ===========================================================================

export interface UserProfile {
  id: string;
  participantCode?: string;
  email: string;
  name: string;
  nickname: string;
  avatar: string;
  university: string;
  universityShort: string;
  career: string;
  onboardingCompleted: boolean;
  role?: string;
  authProvider: string;
  level: string;
  rankLevel: number;
  xp: number;
  xpToNextLevel: number;
  streakDays: number;
  longestStreak: number;
  lastStudyDate: string | null;
  isLoggedIn: boolean;
  isDemo: boolean;
  unitProgress: {
    [key: string]: number; // e.g. "anatomia_flashcards": 0
  };
}

// ESTADO INICIAL ESTRICTAMENTE EN CERO Y LIMPIO PARA NUEVOS PARTICIPANTES
const ZERO_INITIAL_PROFILE: UserProfile = {
  id: "",
  participantCode: "",
  email: "",
  name: "",
  nickname: "",
  avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80",
  university: "",
  universityShort: "",
  career: "",
  onboardingCompleted: false,
  role: "student",
  authProvider: "session",
  level: "Aspirante Clínico",
  rankLevel: 1,
  xp: 0,
  xpToNextLevel: 100,
  streakDays: 0,
  longestStreak: 0,
  lastStudyDate: null,
  isLoggedIn: false,
  isDemo: false,
  unitProgress: {
    "anatomia_flashcards": 0,
    "anatomia_teoria": 0,
    "anatomia_visor-3d": 0,
    "bioquimica_metabolismo": 0,
    "histologia_tejidos": 0,
    "microbiologia_patogenos": 0,
  },
};

// ===========================================================================
// INTERFAZ DEL CONTEXTO DE AUTENTICACIÓN
// ===========================================================================

interface AuthContextType {
  user: UserProfile;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
  loginWithParticipantCode: (code: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  completeOnboarding: (data: {
    nickname: string;
    university: string;
    universityShort: string;
    career: string;
  }) => Promise<{ participantCode?: string }>;
  resetOnboarding: () => void;
  resetProgressToZero: () => void;
  recordStudySession: (moduleId: string, unitId: string, xpEarned?: number, unitScore?: number) => Promise<void>;
  recordQuizResult: (data: {
    moduleId: string;
    unitId: string;
    quizVersion?: string;
    totalQuestions: number;
    correctCount: number;
    incorrectTopics?: string[];
    answersSummary?: any;
    durationSeconds?: number;
  }) => Promise<{ attempt?: any; isDuplicate?: boolean }>;
  addXp: (amount: number) => void;
  updateUnitProgress: (moduleId: string, unitId: string, percentage: number) => void;
  isConfigured: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ===========================================================================
// PROVEEDOR DE AUTENTICACIÓN
// ===========================================================================

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile>(ZERO_INITIAL_PROFILE);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // ---------- Inicialización ----------
  useEffect(() => {
    async function initAuth() {
      try {
        // 1. Consultar sesión verificada en el servidor
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data?.user) {
            const serverUser: UserProfile = {
              ...ZERO_INITIAL_PROFILE,
              id: data.user.id,
              participantCode: data.user.participantCode || "",
              email: data.user.email || "",
              name: data.user.nickname || "Participante",
              nickname: data.user.nickname || "",
              university: data.user.university || "",
              universityShort: data.user.universityShort || "",
              career: data.user.career || "",
              role: data.user.role || "student",
              onboardingCompleted: Boolean(data.user.onboardingCompleted),
              xp: data.user.xp || 0,
              streakDays: data.user.streakDays || 0,
              longestStreak: data.user.longestStreak || 0,
              lastStudyDate: data.user.lastStudyDate || null,
              isLoggedIn: true,
              isDemo: false,
              unitProgress: {
                ...ZERO_INITIAL_PROFILE.unitProgress,
                ...(data.user.unitProgress || {}),
              },
            };
            const { levelName, rankLevel, nextTarget } = calculateLevel(serverUser.xp);
            serverUser.level = levelName;
            serverUser.rankLevel = rankLevel;
            serverUser.xpToNextLevel = nextTarget;

            setUser(serverUser);
            try {
              localStorage.setItem("medstudy_user_profile", JSON.stringify(serverUser));
            } catch {}
            setIsLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn("Could not check server session:", err);
      }

      // Si el servidor indica que no hay sesión activa:
      // Comprobar si hay un perfil guardado en localStorage que pertenezca a un participante ya registrado
      try {
        const saved = localStorage.getItem("medstudy_user_profile");
        if (saved) {
          const parsed = JSON.parse(saved);
          // Solo recuperar si ya tenía un código de participante o sesión verificada previa
          if (parsed && parsed.participantCode && parsed.onboardingCompleted) {
            setUser((prev) => ({
              ...prev,
              ...parsed,
              isLoggedIn: true,
            }));
            setIsLoading(false);
            return;
          }
        }
      } catch (e) {
        console.warn("Could not read profile from localStorage", e);
      }

      // Nuevo participante sin sesión verificada: iniciar con perfil completamente limpio
      setUser(ZERO_INITIAL_PROFILE);
      setIsLoading(false);
    }

    initAuth();

    // Si Supabase está configurado, escuchar sesiones reales
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          syncSupabaseUser(session.user);
        }
      });

      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          syncSupabaseUser(session.user);
        }
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    }
  }, []);

  // ---------- Utilidades internas ----------

  const saveProfile = useCallback((updated: UserProfile) => {
    setUser(updated);
    try {
      localStorage.setItem("medstudy_user_profile", JSON.stringify(updated));
    } catch (e) {
      console.warn("Could not save profile to localStorage", e);
    }
  }, []);

  const calculateLevel = (currentXp: number): { levelName: string; rankLevel: number; nextTarget: number } => {
    for (let i = HEALTH_RANKS.length - 1; i >= 0; i--) {
      const rank = HEALTH_RANKS[i];
      if (currentXp >= rank.minXp) {
        return {
          levelName: rank.name,
          rankLevel: rank.level,
          nextTarget: rank.maxXp,
        };
      }
    }
    return { levelName: HEALTH_RANKS[0].name, rankLevel: 1, nextTarget: HEALTH_RANKS[0].maxXp };
  };

  /**
   * Calcula la racha de días consecutivos localmente.
   * Se utiliza en modo demo (sin Supabase). En producción,
   * la función SQL `record_study_session` hace el cálculo servidor-side.
   */
  const calculateStreak = (lastStudyDate: string | null, currentStreak: number): number => {
    const today = new Date().toISOString().split("T")[0];

    if (!lastStudyDate) return 1; // Primera sesión de estudio
    if (lastStudyDate === today) return currentStreak; // Ya estudió hoy

    const last = new Date(lastStudyDate);
    const now = new Date(today);
    const diffMs = now.getTime() - last.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return currentStreak + 1; // Día consecutivo
    return 1; // Racha rota → reinicia en 1
  };

  // ---------- Sincronización con Supabase ----------

  const syncSupabaseUser = async (sbUser: any) => {
    if (!supabase) return;
    try {
      // Obtener el perfil completo usando la vista profile_summary
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", sbUser.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        return;
      }

      if (profile) {
        // Obtener progreso de todas las unidades
        const { data: progress } = await supabase
          .from("unit_progress")
          .select("module_id, unit_id, score")
          .eq("user_id", sbUser.id);

        const unitProgress: Record<string, number> = {
          "anatomia_flashcards": 0,
          "anatomia_teoria": 0,
          "anatomia_visor-3d": 0,
          "bioquimica_metabolismo": 0,
          "histologia_tejidos": 0,
          "microbiologia_patogenos": 0,
        };

        if (progress) {
          for (const p of progress) {
            unitProgress[`${p.module_id}_${p.unit_id}`] = p.score || 0;
          }
        }

        const { levelName, rankLevel, nextTarget } = calculateLevel(profile.xp || 0);
        const authProvider = profile.auth_provider || sbUser.app_metadata?.provider || "email";

        saveProfile({
          id: profile.id,
          email: profile.email || sbUser.email,
          name: profile.full_name || sbUser.user_metadata?.full_name || "Estudiante de Salud",
          nickname: profile.nickname || profile.full_name?.split(" ")[0] || "Estudiante",
          avatar: profile.avatar_url || sbUser.user_metadata?.avatar_url || ZERO_INITIAL_PROFILE.avatar,
          university: profile.university || "",
          universityShort: profile.university_short || "",
          career: profile.career || "",
          onboardingCompleted: Boolean(profile.onboarding_completed),
          authProvider,
          level: profile.level || levelName,
          rankLevel: profile.rank_level || rankLevel,
          xp: profile.xp || 0,
          xpToNextLevel: nextTarget,
          streakDays: profile.streak_days || 0,
          longestStreak: profile.longest_streak || 0,
          lastStudyDate: profile.last_study_date || null,
          isLoggedIn: true,
          isDemo: false,
          unitProgress,
        });
      }
    } catch (err) {
      console.error("Error syncing profile with Supabase:", err);
    }
  };

  // ===========================================================================
  // MÉTODOS DE AUTENTICACIÓN
  // ===========================================================================

  /** Inicio de sesión con Google OAuth */
  const signInWithGoogle = async () => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      if (error) {
        console.error("Error signing in with Google:", error.message);
      }
    } else {
      // Simulación local en modo demo
      const simulated: UserProfile = {
        ...ZERO_INITIAL_PROFILE,
        isLoggedIn: true,
        name: "Gabriel Mendoza",
        nickname: "Gabriel",
        authProvider: "google",
        onboardingCompleted: false,
      };
      saveProfile(simulated);
    }
  };

  /** Inicio de sesión con Correo/Contraseña */
  const signInWithEmail = async (email: string, password: string): Promise<{ error?: string }> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        console.error("Error signing in with email:", error.message);
        return { error: error.message };
      }
      return {};
    } else {
      // Simulación local en modo demo
      const simulated: UserProfile = {
        ...ZERO_INITIAL_PROFILE,
        email,
        isLoggedIn: true,
        name: email.split("@")[0],
        nickname: email.split("@")[0],
        authProvider: "email",
        onboardingCompleted: false,
      };
      saveProfile(simulated);
      return {};
    }
  };

  /** Registro con Correo/Contraseña (nuevo usuario) */
  const signUpWithEmail = async (email: string, password: string): Promise<{ error?: string }> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });
      if (error) {
        console.error("Error signing up:", error.message);
        return { error: error.message };
      }
      // El trigger handle_new_user() se activa automáticamente en Supabase
      // y crea el perfil con 0 XP, 0 racha, rango Aspirante Clínico
      return {};
    } else {
      // Simulación local
      const simulated: UserProfile = {
        ...ZERO_INITIAL_PROFILE,
        email,
        isLoggedIn: true,
        name: email.split("@")[0],
        nickname: email.split("@")[0],
        authProvider: "email",
        onboardingCompleted: false,
      };
      saveProfile(simulated);
      return {};
    }
  };

  /** Cerrar sesión */
  const signOut = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch {}
    }
    try {
      localStorage.removeItem("medstudy_user_profile");
    } catch {}
    setUser(ZERO_INITIAL_PROFILE);
  }, []);

  // ===========================================================================
  // ONBOARDING E IDENTIFICACIÓN DE PARTICIPANTES
  // ===========================================================================

  const completeOnboarding = useCallback(async (data: {
    nickname: string;
    university: string;
    universityShort: string;
    career: string;
  }): Promise<{ participantCode?: string }> => {
    try {
      const res = await fetch("/api/auth/register-participant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname: data.nickname,
          university: data.university,
          universityShort: data.universityShort,
          career: data.career,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json?.user) {
          const serverUser: UserProfile = {
            ...ZERO_INITIAL_PROFILE,
            id: json.user.id,
            participantCode: json.user.participantCode || "",
            email: json.user.email || "",
            name: json.user.nickname || "Participante",
            nickname: json.user.nickname || "",
            university: json.user.university || "",
            universityShort: json.user.universityShort || "",
            career: json.user.career || "",
            role: json.user.role || "student",
            onboardingCompleted: true,
            isLoggedIn: true,
            unitProgress: {
              ...ZERO_INITIAL_PROFILE.unitProgress,
              ...(json.user.unitProgress || {}),
            },
          };
          setUser(serverUser);
          try {
            localStorage.setItem("medstudy_user_profile", JSON.stringify(serverUser));
          } catch {}
          return { participantCode: json.user.participantCode };
        }
      }
    } catch (err) {
      console.error("Error registering on server:", err);
    }

    // Fallback local en caso de desconexión
    const fallbackCode = "MED-" + Math.random().toString(36).substring(2, 6).toUpperCase();
    const updated: UserProfile = {
      ...ZERO_INITIAL_PROFILE,
      id: "local-" + Date.now(),
      participantCode: fallbackCode,
      name: data.nickname || "Estudiante",
      nickname: data.nickname || "Estudiante",
      university: data.university,
      universityShort: data.universityShort,
      career: data.career,
      onboardingCompleted: true,
      isLoggedIn: true,
    };
    setUser(updated);
    try {
      localStorage.setItem("medstudy_user_profile", JSON.stringify(updated));
    } catch {}
    return { participantCode: fallbackCode };
  }, []);

  const loginWithParticipantCode = useCallback(async (code: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch("/api/auth/login-participant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantCode: code }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Código no encontrado" };
      }
      if (data?.user) {
        const serverUser: UserProfile = {
          ...ZERO_INITIAL_PROFILE,
          id: data.user.id,
          participantCode: data.user.participantCode || "",
          email: data.user.email || "",
          name: data.user.nickname || "Participante",
          nickname: data.user.nickname || "",
          university: data.user.university || "",
          universityShort: data.user.universityShort || "",
          career: data.user.career || "",
          role: data.user.role || "student",
          onboardingCompleted: Boolean(data.user.onboardingCompleted),
          xp: data.user.xp || 0,
          streakDays: data.user.streakDays || 0,
          longestStreak: data.user.longestStreak || 0,
          lastStudyDate: data.user.lastStudyDate || null,
          isLoggedIn: true,
          unitProgress: {
            ...ZERO_INITIAL_PROFILE.unitProgress,
            ...(data.user.unitProgress || {}),
          },
        };
        const { levelName, rankLevel, nextTarget } = calculateLevel(serverUser.xp);
        serverUser.level = levelName;
        serverUser.rankLevel = rankLevel;
        serverUser.xpToNextLevel = nextTarget;

        setUser(serverUser);
        try {
          localStorage.setItem("medstudy_user_profile", JSON.stringify(serverUser));
        } catch {}
        return { success: true };
      }
      return { success: false, error: "Datos de usuario inválidos" };
    } catch (err: any) {
      return { success: false, error: err.message || "Error de conexión" };
    }
  }, []);

  const resetOnboarding = useCallback(() => {
    setUser((prev) => {
      const updated = { ...prev, onboardingCompleted: false };
      try {
        localStorage.setItem("medstudy_user_profile", JSON.stringify(updated));
      } catch (e) {
        console.warn("Could not save profile to localStorage", e);
      }
      return updated;
    });
  }, []);

  // ===========================================================================
  // SISTEMA DE GAMIFICACIÓN
  // ===========================================================================

  /**
   * Registra una sesión de estudio completa.
   * En producción, llama a la función SQL record_study_session() que
   * calcula racha, suma XP y promueve de rango en el servidor.
   * En modo demo, realiza el mismo cálculo localmente.
   */
  const recordStudySession = useCallback(async (
    moduleId: string,
    unitId: string,
    xpEarned: number = 10,
    unitScore?: number
  ) => {
    if (isSupabaseConfigured && supabase && !user.isDemo) {
      // === Producción: llamar RPC del servidor ===
      try {
        const { data, error } = await supabase.rpc("record_study_session", {
          p_user_id: user.id,
          p_module_id: moduleId,
          p_unit_id: unitId,
          p_xp_earned: xpEarned,
          p_duration_seconds: 0,
          p_unit_score: unitScore ?? null,
        });

        if (error) {
          console.error("Error recording study session:", error);
          return;
        }

        if (data) {
          const result = data as any;
          const { levelName, rankLevel: rl, nextTarget } = calculateLevel(result.xp);
          setUser((prev) => {
            const updatedProgress = { ...prev.unitProgress };
            if (unitScore !== undefined) {
              const key = `${moduleId}_${unitId}`;
              updatedProgress[key] = Math.max(updatedProgress[key] || 0, unitScore);
            }

            const updated: UserProfile = {
              ...prev,
              xp: result.xp,
              streakDays: result.streak_days,
              longestStreak: result.longest_streak,
              lastStudyDate: result.study_date,
              level: result.rank_name || levelName,
              rankLevel: result.rank_level || rl,
              xpToNextLevel: nextTarget,
              unitProgress: updatedProgress,
            };
            try {
              localStorage.setItem("medstudy_user_profile", JSON.stringify(updated));
            } catch {}
            return updated;
          });
        }
      } catch (err) {
        console.error("Error in recordStudySession RPC:", err);
      }
    } else {
      // === Demo: cálculo local ===
      const today = new Date().toISOString().split("T")[0];
      setUser((prev) => {
        let base = prev;
        try {
          const stored = localStorage.getItem("medstudy_user_profile");
          if (stored) {
            const parsed = JSON.parse(stored);
            base = { ...prev, ...parsed };
          }
        } catch {}

        const newStreak = calculateStreak(base.lastStudyDate || prev.lastStudyDate, base.streakDays ?? prev.streakDays);
        const newXp = (base.xp ?? prev.xp) + xpEarned;
        const { levelName, rankLevel, nextTarget } = calculateLevel(newXp);
        const newLongest = Math.max(base.longestStreak ?? prev.longestStreak, newStreak);

        const updatedProgress = { ...(base.unitProgress || {}), ...(prev.unitProgress || {}) };
        if (unitScore !== undefined) {
          const key = `${moduleId}_${unitId}`;
          updatedProgress[key] = Math.max(updatedProgress[key] || 0, unitScore);
        }

        const updated: UserProfile = {
          ...base,
          ...prev,
          xp: newXp,
          streakDays: newStreak,
          longestStreak: newLongest,
          lastStudyDate: today,
          level: levelName,
          rankLevel,
          xpToNextLevel: nextTarget,
          unitProgress: updatedProgress,
          onboardingCompleted: base.onboardingCompleted || prev.onboardingCompleted,
        };
        try {
          localStorage.setItem("medstudy_user_profile", JSON.stringify(updated));
        } catch {}
        return updated;
      });
    }
  }, [user.isDemo, user.id]);

  /** Añadir XP directamente (versión simplificada sin sesión completa) */
  const addXp = useCallback((amount: number) => {
    setUser((prev) => {
      let base = prev;
      try {
        const stored = localStorage.getItem("medstudy_user_profile");
        if (stored) {
          const parsed = JSON.parse(stored);
          base = { ...prev, ...parsed };
        }
      } catch {}

      const newXp = (base.xp ?? prev.xp) + amount;
      const { levelName, rankLevel, nextTarget } = calculateLevel(newXp);
      const prevStreak = base.streakDays ?? prev.streakDays;
      const newStreak = prevStreak === 0 ? 1 : prevStreak;
      const updated: UserProfile = {
        ...base,
        ...prev,
        xp: newXp,
        level: levelName,
        rankLevel,
        xpToNextLevel: nextTarget,
        streakDays: newStreak,
        onboardingCompleted: base.onboardingCompleted || prev.onboardingCompleted,
      };
      try {
        localStorage.setItem("medstudy_user_profile", JSON.stringify(updated));
      } catch { /* ignore */ }
      return updated;
    });
  }, []);

  /** Actualizar progreso de una unidad específica (0-100%) */
  const updateUnitProgress = useCallback((moduleId: string, unitId: string, percentage: number) => {
    setUser((prev) => {
      let base = prev;
      try {
        const stored = localStorage.getItem("medstudy_user_profile");
        if (stored) {
          const parsed = JSON.parse(stored);
          base = { ...prev, ...parsed };
        }
      } catch {}

      const key = `${moduleId}_${unitId}`;
      const existing = (base.unitProgress && base.unitProgress[key]) || (prev.unitProgress && prev.unitProgress[key]) || 0;
      const updatedProgress = {
        ...(base.unitProgress || {}),
        ...(prev.unitProgress || {}),
        [key]: Math.max(existing, Math.min(100, percentage)),
      };
      const updated: UserProfile = {
        ...base,
        ...prev,
        unitProgress: updatedProgress,
        onboardingCompleted: base.onboardingCompleted || prev.onboardingCompleted,
      };
      try {
        localStorage.setItem("medstudy_user_profile", JSON.stringify(updated));
      } catch { /* ignore */ }

      // Sincronización transparente con el servidor si hay sesión activa
      if (prev.isLoggedIn && !prev.isDemo) {
        fetch("/api/progress/unit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ moduleId, unitId, score: percentage }),
        }).catch(() => {});
      }

      return updated;
    });
  }, []);

  /** Registrar resultado de cuestionario validado en el servidor */
  const recordQuizResult = useCallback(async (data: {
    moduleId: string;
    unitId: string;
    quizVersion?: string;
    totalQuestions: number;
    correctCount: number;
    incorrectTopics?: string[];
    answersSummary?: any;
    durationSeconds?: number;
  }) => {
    try {
      const res = await fetch("/api/progress/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moduleId: data.moduleId,
          unitId: data.unitId,
          quizVersion: data.quizVersion || "v1.0",
          totalQuestions: data.totalQuestions,
          correctCount: data.correctCount,
          incorrectTopics: data.incorrectTopics || [],
          answersSummary: data.answersSummary || {},
          durationSeconds: data.durationSeconds || 0,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.newXp !== undefined) {
          setUser((prev) => {
            const { levelName, rankLevel, nextTarget } = calculateLevel(json.newXp);
            const updated = {
              ...prev,
              xp: json.newXp,
              level: levelName,
              rankLevel,
              xpToNextLevel: nextTarget,
              unitProgress: {
                ...prev.unitProgress,
                ...(json.unitProgress || {}),
              },
            };
            try {
              localStorage.setItem("medstudy_user_profile", JSON.stringify(updated));
            } catch {}
            return updated;
          });
        }
        return { attempt: json.attempt, isDuplicate: json.isDuplicate };
      }
    } catch (err) {
      console.warn("Could not record quiz result on server:", err);
    }
    return {};
  }, []);

  /** Reiniciar todo el progreso a cero (útil para testing) */
  const resetProgressToZero = useCallback(() => {
    setUser((prev) => {
      const resetUser: UserProfile = {
        ...ZERO_INITIAL_PROFILE,
        nickname: prev.nickname,
        university: prev.university,
        universityShort: prev.universityShort,
        career: prev.career,
        onboardingCompleted: true,
        xp: 0,
        streakDays: 0,
        longestStreak: 0,
        lastStudyDate: null,
        level: "Aspirante Clínico",
        rankLevel: 1,
        xpToNextLevel: 100,
        unitProgress: {
          "anatomia_flashcards": 0,
          "anatomia_teoria": 0,
          "anatomia_visor-3d": 0,
          "bioquimica_metabolismo": 0,
          "histologia_tejidos": 0,
          "microbiologia_patogenos": 0,
        },
      };
      try {
        localStorage.setItem("medstudy_user_profile", JSON.stringify(resetUser));
      } catch {}
      return resetUser;
    });
  }, []);

  // ===========================================================================
  // PROVEEDOR
  // ===========================================================================

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        loginWithParticipantCode,
        signOut,
        completeOnboarding,
        resetOnboarding,
        resetProgressToZero,
        recordStudySession,
        recordQuizResult,
        addXp,
        updateUnitProgress,
        isConfigured: isSupabaseConfigured,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}