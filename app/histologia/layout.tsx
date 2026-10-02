import React from "react";
import { CLINICAL_MODULES } from "@/lib/modules-config";
import { ComingSoonScreen } from "@/components/ui/ComingSoonScreen";

export const metadata = {
  title: "Histología Tisular | MedStudy",
  description: "Módulo de Histología Tisular - MedStudy",
};

export default function HistologiaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Verificación del estado de disponibilidad centralizado
  if (!CLINICAL_MODULES.histologia.enabled) {
    return <ComingSoonScreen moduleId="histologia" />;
  }

  return <>{children}</>;
}
