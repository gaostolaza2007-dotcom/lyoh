"use client";

import React from "react";
import { COURSE_SECTIONS_DATA } from "@/lib/data/infection-hub/course-topics-data";
import { SectionTopicsViewer } from "@/components/modules/infecciones/SectionTopicsViewer";

export default function FundamentosPage() {
  const section = COURSE_SECTIONS_DATA["fundamentos"];
  return <SectionTopicsViewer section={section} />;
}
