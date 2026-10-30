import React from "react";
import { CLINICAL_MODULES } from "@/lib/modules-config";
import { ComingSoonScreen } from "@/components/ui/ComingSoonScreen";

export const metadata = {
  title: "Bioquímica Médica | LYOH",
  description: "Módulo de Bioquímica Médica - LYOH",
};

export default function BioquimicaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Verificación del estado de disponibilidad centralizado
  if (!CLINICAL_MODULES.bioquimica.enabled) {
    return <ComingSoonScreen moduleId="bioquimica" />;
  }

  return <>{children}</>;
}
