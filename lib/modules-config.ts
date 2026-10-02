/**
 * CONFIGURACIÓN CENTRALIZADA DE MÓDULOS CLÍNICOS - MEDSTUDY
 *
 * Permite habilitar o deshabilitar temporalmente cualquier módulo clínico
 * y centraliza el inventario exhaustivo de unidades del sistema.
 */

export interface UnitDefinition {
  id: string;
  name: string;
  shortLabel: string;
  type: "flashcards" | "theory" | "3d" | "interactive" | "catalog";
}

export interface ModuleDefinition {
  id: string;
  name: string;
  shortName: string;
  href: string;
  description: string;
  color: string;
  glow: "blue" | "purple" | "cyan";
  enabled: boolean;
  comingSoonMessage?: string;
  units: UnitDefinition[];
}

export const CLINICAL_MODULES: Record<string, ModuleDefinition> = {
  anatomia: {
    id: "anatomia",
    name: "Anatomía Humana",
    shortName: "Anatomía",
    href: "/anatomia",
    description: "Flashcards con validación inmediata, teoría de alto rendimiento y visor 3D interactivo Three.js.",
    color: "from-blue-600 to-indigo-600",
    glow: "blue",
    enabled: true,
    units: [
      { id: "anatomia_flashcards", name: "Anatomía: Flashcards Clínicas", shortLabel: "Flashcards", type: "flashcards" },
      { id: "anatomia_teoria", name: "Anatomía: Teoría & Plexo Braquial", shortLabel: "Teoría", type: "theory" },
      { id: "anatomia_visor-3d", name: "Anatomía: Visor 3D Cardíaco Three.js", shortLabel: "Visor 3D", type: "3d" },
    ],
  },
  bioquimica: {
    id: "bioquimica",
    name: "Bioquímica Médica",
    shortName: "Bioquímica",
    href: "/bioquimica",
    description: "Lienzo interactivo de rutas metabólicas con arrastre de sustratos/enzimas y panel de regulación.",
    color: "from-purple-600 to-pink-600",
    glow: "purple",
    enabled: false, // <-- DESHABILITADO TEMPORALMENTE ("Próximamente")
    comingSoonMessage: "Este módulo estará disponible próximamente",
    units: [
      { id: "bioquimica_metabolismo", name: "Bioquímica: Glucólisis & Regulación", shortLabel: "Glucólisis & Regulación", type: "interactive" },
    ],
  },
  histologia: {
    id: "histologia",
    name: "Histología Tisular",
    shortName: "Histología",
    href: "/histologia",
    description: "Microscopio virtual con marcadores interactivos sobre cortes histológicos reales y modales diagnósticos.",
    color: "from-pink-600 to-rose-600",
    glow: "purple",
    enabled: false, // <-- DESHABILITADO TEMPORALMENTE ("Próximamente")
    comingSoonMessage: "Este módulo estará disponible próximamente",
    units: [
      { id: "histologia_tejidos", name: "Histología: Microscopía Glomerular", shortLabel: "Microscopía Glomerular", type: "interactive" },
    ],
  },
  microbiologia: {
    id: "microbiologia",
    name: "Microbiología Clínica",
    shortName: "Microbiología",
    href: "/microbiologia",
    description: "Catálogo exhaustivo de 140 fichas filtradas por Bacterias, Virus, Hongos y Parásitos con referencias.",
    color: "from-cyan-600 to-teal-600",
    glow: "cyan",
    enabled: true,
    units: [
      { id: "microbiologia_patogenos", name: "Microbiología: Catálogo Infeccioso", shortLabel: "Catálogo de 140 Fichas", type: "catalog" },
    ],
  },
};

/**
 * MAPA AUTORITATIVO DE UNIDADES -> MÓDULO CORRESPONDIENTE
 * Usado por el servidor para verificar a qué módulo pertenece cada unidad
 * sin confiar únicamente en los datos enviados por el navegador.
 */
export const UNIT_TO_MODULE_MAP: Record<string, string> = {
  // Identificadores canónicos prefijados
  anatomia_flashcards: "anatomia",
  anatomia_teoria: "anatomia",
  "anatomia_visor-3d": "anatomia",
  bioquimica_metabolismo: "bioquimica",
  histologia_tejidos: "histologia",
  microbiologia_patogenos: "microbiologia",
  // Identificadores cortos
  flashcards: "anatomia",
  teoria: "anatomia",
  "visor-3d": "anatomia",
  metabolismo: "bioquimica",
  tejidos: "histologia",
  patogenos: "microbiologia",
};

// ============================================================================
// FUNCIONES UTILITARIAS DINÁMICAS (Cálculos automáticos sin valores fijos)
// ============================================================================

export function getAllModules(): ModuleDefinition[] {
  return Object.values(CLINICAL_MODULES);
}

export function getEnabledModules(): ModuleDefinition[] {
  return Object.values(CLINICAL_MODULES).filter((m) => m.enabled);
}

export function getDisabledModules(): ModuleDefinition[] {
  return Object.values(CLINICAL_MODULES).filter((m) => !m.enabled);
}

export function isModuleEnabled(moduleId: string): boolean {
  const mod = CLINICAL_MODULES[moduleId.toLowerCase()];
  return Boolean(mod?.enabled);
}

export function getModuleForUnit(unitId: string): ModuleDefinition | null {
  const modId = UNIT_TO_MODULE_MAP[unitId];
  if (!modId) return null;
  return CLINICAL_MODULES[modId] || null;
}

export function isUnitEnabled(unitId: string): boolean {
  const mod = getModuleForUnit(unitId);
  return Boolean(mod?.enabled);
}

export function getAllUnitDefinitions(): UnitDefinition[] {
  return Object.values(CLINICAL_MODULES).flatMap((m) => m.units);
}

export function getEnabledUnitDefinitions(): UnitDefinition[] {
  return Object.values(CLINICAL_MODULES)
    .filter((m) => m.enabled)
    .flatMap((m) => m.units);
}

export function getDisabledUnitDefinitions(): UnitDefinition[] {
  return Object.values(CLINICAL_MODULES)
    .filter((m) => !m.enabled)
    .flatMap((m) => m.units);
}

export function getEnabledUnitIds(): string[] {
  return getEnabledUnitDefinitions().map((u) => u.id);
}

export function getAllUnitIds(): string[] {
  return getAllUnitDefinitions().map((u) => u.id);
}

/** Totales dinámicos calculados directamente desde la configuración */
export function getTotalsConfig() {
  const allMods = getAllModules();
  const enabledMods = getEnabledModules();
  const allUnits = getAllUnitDefinitions();
  const enabledUnits = getEnabledUnitDefinitions();

  return {
    totalModulesCount: allMods.length,
    enabledModulesCount: enabledMods.length,
    disabledModulesCount: allMods.length - enabledMods.length,
    totalUnitsCount: allUnits.length,
    enabledUnitsCount: enabledUnits.length,
    disabledUnitsCount: allUnits.length - enabledUnits.length,
  };
}

/**
 * Comprueba si una ruta o subruta pertenece a un módulo deshabilitado.
 * Ej: /bioquimica, /bioquimica/ruta2, /histologia/demo
 */
export function isRouteDisabled(pathname: string): { disabled: boolean; module: ModuleDefinition | null } {
  const normalized = pathname.toLowerCase();
  for (const mod of Object.values(CLINICAL_MODULES)) {
    if (!mod.enabled) {
      if (normalized === mod.href || normalized.startsWith(`${mod.href}/`)) {
        return { disabled: true, module: mod };
      }
    }
  }
  return { disabled: false, module: null };
}
