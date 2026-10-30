"use client";

import React from "react";
import { COURSE_SECTIONS_DATA } from "@/lib/data/infection-hub/course-topics-data";
import { SectionTopicsViewer } from "@/components/modules/infecciones/SectionTopicsViewer";

export default function MetabolismoCultivoPage() {
  const section = COURSE_SECTIONS_DATA["metabolismo_cultivo"];
  return <SectionTopicsViewer section={section} />;
}
