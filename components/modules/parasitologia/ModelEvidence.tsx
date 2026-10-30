type ModelEvidenceProps = { species: string };

export function ModelEvidence({ species }: ModelEvidenceProps) {
  const key = species.toLowerCase();
  const reference = key.includes("plasmodium") ? ["Malaria", "malaria"]
    : key.includes("giardia") ? ["Giardiasis", "giardiasis"]
    : key.includes("echinococcus") ? ["Echinococcosis", "echinococcosis"]
    : key.includes("sarcoptes") ? ["Scabies", "scabies"]
    : key.includes("pediculus") ? ["Pediculosis", "pediculosis"] : ["Taeniasis", "taeniasis"];
  return <details className="mt-4 rounded-xl border border-slate-700/60 bg-slate-950/50 px-4 py-3 text-xs leading-relaxed text-slate-400">
    <summary className="min-h-6 cursor-pointer font-semibold text-slate-300">Referencias y alcance del modelo</summary>
    <p className="mt-3">Reconstrucción educativa basada en rasgos descritos e imágenes de referencia. Las transparencias, los colores y los cortes facilitan la exploración; no son una fotografía microscópica ni una reconstrucción volumétrica de una muestra real. La posición de los órganos internos es orientativa y no cuenta con validación de un especialista.</p>
    {key.includes("taenia") && <p className="mt-2">El adulto muestra un estróbilo abreviado: se redujo el número de proglótides y se amplió el escólex para explorarlo. La vista completa no conserva una escala uniforme. Los huevos de Taenia no permiten distinguir estas especies por su morfología.</p>}
    {key.includes("echinococcus") && <p className="mt-2">El quiste corresponde al hospedador intermediario; el adulto vive en el hospedador definitivo. Las capas y los contenidos se amplían para distinguirlos y no representan sus espesores relativos reales.</p>}
    <a className="mt-3 inline-block min-h-9 text-cyan-300 underline underline-offset-4" href={"https://www.cdc.gov/dpdx/"+reference[1]+"/index.html"} target="_blank" rel="noopener noreferrer">CDC DPDx · {reference[0]} ↗</a>
    {key.includes("giardia") && <a className="ml-4 inline-block min-h-9 text-cyan-300 underline underline-offset-4" href="https://pmc.ncbi.nlm.nih.gov/articles/PMC4521607/" target="_blank" rel="noopener noreferrer">Estudio de cuerpos basales de Giardia ↗</a>}
    {key.includes("giardia") && <a className="ml-4 inline-block min-h-9 text-cyan-300 underline underline-offset-4" href="https://pmc.ncbi.nlm.nih.gov/articles/PMC4764415/" target="_blank" rel="noopener noreferrer">Arquitectura del disco ventral · Brown et al., 2016 ↗</a>}
  </details>;
}
