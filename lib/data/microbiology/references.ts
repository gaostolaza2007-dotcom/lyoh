import { MicrobeReference } from "./types";

export const MICROBIOLOGY_REFERENCES: Record<number, MicrobeReference> = {
  1: {
    id: 1,
    title: "NIH · Tratamiento antirretroviral inicial",
    links: [{ label: "Abrir fuente", url: "https://clinicalinfo.hiv.gov/es/node/11203" }],
  },
  2: {
    id: 2,
    title: "CDC · Pink Book y capítulos de enfermedades prevenibles por vacunación",
    links: [{ label: "Abrir fuente", url: "https://www.cdc.gov/pinkbook/hcp/table-of-contents/index.html" }],
  },
  3: {
    id: 3,
    title: "CDC · Tratamiento ambulatorio de COVID 19",
    links: [{ label: "Abrir fuente", url: "https://www.cdc.gov/covid/hcp/clinical-care/outpatient-treatment.html" }],
  },
  4: {
    id: 4,
    title: "CDC · Virus respiratorios",
    links: [{ label: "Abrir fuente", url: "https://www.cdc.gov/respiratory-viruses/about/index.html" }],
  },
  5: {
    id: 5,
    title: "CDC · Precauciones por infección y condición clínica",
    links: [{ label: "Abrir fuente", url: "https://www.cdc.gov/infection-control/hcp/isolation-precautions/appendix-a-type-duration.html" }],
  },
  6: {
    id: 6,
    title: "CDC · Sarampión",
    links: [{ label: "Abrir fuente", url: "https://www.cdc.gov/pinkbook/hcp/table-of-contents/chapter-13-measles.html" }],
  },
  7: {
    id: 7,
    title: "CDC · Varicela",
    links: [{ label: "Abrir fuente", url: "https://www.cdc.gov/pinkbook/hcp/table-of-contents/chapter-22-varicella.html" }],
  },
  8: {
    id: 8,
    title: "CDC · Guías de infecciones de transmisión sexual",
    links: [{ label: "Abrir fuente", url: "https://www.cdc.gov/std/treatment-guidelines/default.htm" }],
  },
  9: {
    id: 9,
    title: "NIH · Enfermedad por citomegalovirus",
    links: [{ label: "Abrir fuente", url: "https://clinicalinfo.hiv.gov/en/guidelines/hiv-clinical-guidelines-adult-and-adolescent-opportunistic-infections/cytomegalovirus" }],
  },
  10: {
    id: 10,
    title: "CDC · Hepatitis B",
    links: [{ label: "Abrir fuente", url: "https://www.cdc.gov/pinkbook/hcp/table-of-contents/chapter-10-hepatitis-b.html" }],
  },
  11: {
    id: 11,
    title: "CDC · Hepatitis virales y recursos clínicos",
    links: [{ label: "Abrir fuente", url: "https://www.cdc.gov/hepatitis/hcp/clinical-overview/index.html" }],
  },
  12: {
    id: 12,
    title: "CDC · Diarrea después de viajes",
    links: [{ label: "Abrir fuente", url: "https://www.cdc.gov/yellow-book/hcp/post-travel-evaluation/post-travel-diarrhea.html" }],
  },
  13: {
    id: 13,
    title: "CDC · Rabia",
    links: [{ label: "Abrir fuente", url: "https://www.cdc.gov/yellow-book/hcp/travel-associated-infections-diseases/rabies.html" }],
  },
  14: {
    id: 14,
    title: "CDC · Dengue",
    links: [{ label: "Abrir fuente", url: "https://www.cdc.gov/yellow-book/hcp/travel-associated-infections-diseases/dengue.html" }],
  },
  15: {
    id: 15,
    title: "CDC · Zika y chikungunya",
    links: [
      { label: "Abrir fuente 1", url: "https://www.cdc.gov/yellow-book/hcp/travel-associated-infections-diseases/zika.html" },
      { label: "Abrir fuente 2", url: "https://www.cdc.gov/yellow-book/hcp/travel-associated-infections-diseases/chikungunya.html" },
    ],
  },
  16: {
    id: 16,
    title: "CDC · Virus Andes y síndrome pulmonar por hantavirus",
    links: [
      { label: "Abrir fuente 1", url: "https://www.cdc.gov/hantavirus/about/andesvirus.html" },
      { label: "Abrir fuente 2", url: "https://www.cdc.gov/hantavirus/hcp/clinical-overview/hps.html" },
    ],
  },
  17: {
    id: 17,
    title: "OMS · Mpox",
    links: [{ label: "Abrir fuente", url: "https://www.who.int/news-room/fact-sheets/detail/mpox" }],
  },
  18: {
    id: 18,
    title: "IDSA y CDC · Infecciones cutáneas y bacterias prevenibles por vacunación",
    links: [
      { label: "Abrir fuente 1", url: "https://www.idsociety.org/practice-guideline/skin-and-soft-tissue-infections/" },
      { label: "Abrir fuente 2", url: "https://www.cdc.gov/pinkbook/hcp/table-of-contents/index.html" },
    ],
  },
  19: {
    id: 19,
    title: "IDSA · Guía de infecciones por bacilos Gram negativos resistentes",
    links: [{ label: "Abrir fuente", url: "https://www.idsociety.org/practice-guideline/amr-guidance/" }],
  },
  20: {
    id: 20,
    title: "CDC · Enteropatógenos y diarrea del viajero",
    links: [{ label: "Abrir fuente", url: "https://www.cdc.gov/yellow-book/hcp/post-travel-evaluation/post-travel-diarrhea.html" }],
  },
  21: {
    id: 21,
    title: "CDC · Fiebre tifoidea y paratifoidea",
    links: [{ label: "Abrir fuente", url: "https://www.cdc.gov/yellow-book/hcp/travel-associated-infections-diseases/typhoid-and-paratyphoid-fever.html" }],
  },
  22: {
    id: 22,
    title: "American College of Gastroenterology · Recomendaciones de tratamiento de Helicobacter pylori",
    links: [{ label: "Abrir fuente", url: "https://gi.org/journals-publications/ebgi/schoenfeld_sep2024/" }],
  },
  23: {
    id: 23,
    title: "CDC · Listeriosis, legionelosis y botulismo",
    links: [
      { label: "Abrir fuente 1", url: "https://www.cdc.gov/listeria/hcp/clinical-care/index.html" },
      { label: "Abrir fuente 2", url: "https://www.cdc.gov/legionella/hcp/clinical-guidance/index.html" },
      { label: "Abrir fuente 3", url: "https://www.cdc.gov/botulism/hcp/clinical-overview/index.html" },
    ],
  },
  24: {
    id: 24,
    title: "CDC · Tratamiento de tuberculosis susceptible",
    links: [{ label: "Abrir fuente", url: "https://www.cdc.gov/tb/hcp/treatment/tuberculosis-disease.html" }],
  },
  25: {
    id: 25,
    title: "SHEA e IDSA · Tratamiento de Clostridioides difficile",
    links: [{ label: "Abrir fuente", url: "https://www.idsociety.org/practice-guideline/clostridioides-difficile-2021-focused-update/" }],
  },
  26: {
    id: 26,
    title: "CDC · Leptospirosis",
    links: [{ label: "Abrir fuente", url: "https://www.cdc.gov/leptospirosis/hcp/clinical-overview/index.html" }],
  },
  27: {
    id: 27,
    title: "NIH · Criptococosis",
    links: [{ label: "Abrir fuente", url: "https://clinicalinfo.hiv.gov/en/guidelines/hiv-clinical-guidelines-adult-and-adolescent-opportunistic-infections/cryptococcosis" }],
  },
  28: {
    id: 28,
    title: "IDSA · Candidiasis",
    links: [{ label: "Abrir fuente", url: "https://www.idsociety.org/practice-guideline/candidiasis/" }],
  },
  29: {
    id: 29,
    title: "CDC · Control de Candida auris",
    links: [{ label: "Abrir fuente", url: "https://www.cdc.gov/candida-auris/hcp/infection-control/index.html" }],
  },
  30: {
    id: 30,
    title: "IDSA · Aspergilosis",
    links: [{ label: "Abrir fuente", url: "https://www.idsociety.org/practice-guideline/aspergillosis/" }],
  },
  31: {
    id: 31,
    title: "NIH · Neumonía por Pneumocystis",
    links: [{ label: "Abrir fuente", url: "https://clinicalinfo.hiv.gov/en/guidelines/hiv-clinical-guidelines-adult-and-adolescent-opportunistic-infections/pneumocystis" }],
  },
  32: {
    id: 32,
    title: "NIH e IDSA · Histoplasmosis y actualización de cuadros pulmonares leves",
    links: [
      { label: "Abrir fuente 1", url: "https://clinicalinfo.hiv.gov/en/guidelines/hiv-clinical-guidelines-adult-and-adolescent-opportunistic-infections/histoplasmosis" },
      { label: "Abrir fuente 2", url: "https://www.idsociety.org/practice-guideline/histoplasmosis-2025/" },
    ],
  },
  33: {
    id: 33,
    title: "Adelaide University · Micosis sistémicas por hongos dimórficos",
    links: [{ label: "Abrir fuente", url: "https://mycology.adelaide.edu.au/mycoses/dimorphic-systemic-mycoses" }],
  },
  34: {
    id: 34,
    title: "NIH · Talaromicosis",
    links: [{ label: "Abrir fuente", url: "https://clinicalinfo.hiv.gov/en/guidelines/hiv-clinical-guidelines-adult-and-adolescent-opportunistic-infections/talaromycosis" }],
  },
  35: {
    id: 35,
    title: "Adelaide University y CDC · Micosis subcutáneas y esporotricosis",
    links: [
      { label: "Abrir fuente 1", url: "https://mycology.adelaide.edu.au/mycoses/subcutaneous-mycoses" },
      { label: "Abrir fuente 2", url: "https://www.cdc.gov/sporotrichosis/hcp/clinical-overview/index.html" },
    ],
  },
  36: {
    id: 36,
    title: "ECMM y MSG ERC · Guía global de mucormicosis",
    links: [{ label: "Abrir fuente", url: "https://doi.org/10.1016/S1473-3099(19)30312-3" }],
  },
  37: {
    id: 37,
    title: "ECMM e ISHAM · Guía global de infecciones por mohos infrecuentes",
    links: [{ label: "Abrir fuente", url: "https://archive.lstmed.ac.uk/17032/1/RARE_MOULDS_FULL_ACCEPTED_VERSION_LID_21092020_2_.pdf" }],
  },
  38: {
    id: 38,
    title: "CDC Emerging Infectious Diseases · Infecciones emergentes por Trichosporon",
    links: [{ label: "Abrir fuente", url: "https://wwwnc.cdc.gov/eid/article/32/1/25-0504_article" }],
  },
  39: {
    id: 39,
    title: "Adelaide University · Micosis cutáneas y dermatofitos",
    links: [{ label: "Abrir fuente", url: "https://mycology.adelaide.edu.au/mycoses/cutaneous-mycoses" }],
  },
  40: {
    id: 40,
    title: "Adelaide University · Micosis superficiales",
    links: [{ label: "Abrir fuente", url: "https://mycology.adelaide.edu.au/mycoses/superficial-mycoses" }],
  },
  41: {
    id: 41,
    title: "CDC · Diagnóstico y tratamiento de malaria",
    links: [
      { label: "Abrir fuente 1", url: "https://www.cdc.gov/dpdx/malaria/index.html" },
      { label: "Abrir fuente 2", url: "https://www.cdc.gov/malaria/hcp/clinical-guidance/treatment-of-uncomplicated-malaria.html" },
    ],
  },
  42: {
    id: 42,
    title: "CDC · Atención de la infección por Giardia",
    links: [{ label: "Abrir fuente", url: "https://www.cdc.gov/giardia/hcp/clinical-care/index.html" }],
  },
  43: {
    id: 43,
    title: "CDC · Toxocariasis",
    links: [{ label: "Abrir fuente", url: "https://www.cdc.gov/toxocariasis/hcp/clinical-care/index.html" }],
  },
  44: {
    id: 44,
    title: "CDC · Protozoos intestinales y diarrea persistente",
    links: [{ label: "Abrir fuente", url: "https://www.cdc.gov/yellow-book/hcp/post-travel-evaluation/post-travel-diarrhea.html" }],
  },
  45: {
    id: 45,
    title: "NIH · Toxoplasmosis y cistoisosporiasis",
    links: [
      { label: "Abrir fuente 1", url: "https://clinicalinfo.hiv.gov/en/guidelines/hiv-clinical-guidelines-adult-and-adolescent-opportunistic-infections/toxoplasmosis" },
      { label: "Abrir fuente 2", url: "https://clinicalinfo.hiv.gov/en/guidelines/hiv-clinical-guidelines-adult-and-adolescent-opportunistic-infections/cystoisosporiasis" },
    ],
  },
  46: {
    id: 46,
    title: "CDC · Enfermedad de Chagas",
    links: [{ label: "Abrir fuente", url: "https://www.cdc.gov/chagas/hcp/clinical-care/index.html" }],
  },
  47: {
    id: 47,
    title: "CDC · Leishmaniasis",
    links: [{ label: "Abrir fuente", url: "https://www.cdc.gov/leishmaniasis/hcp/clinical-care/index.html" }],
  },
  48: {
    id: 48,
    title: "CDC · Babesiosis",
    links: [{ label: "Abrir fuente", url: "https://www.cdc.gov/babesiosis/hcp/clinical-care/index.html" }],
  },
  49: {
    id: 49,
    title: "CDC · Acanthamoeba y Naegleria",
    links: [
      { label: "Abrir fuente 1", url: "https://www.cdc.gov/acanthamoeba/hcp/clinical-care/index.html" },
      { label: "Abrir fuente 2", url: "https://www.cdc.gov/naegleria/hcp/clinical-care/index.html" },
    ],
  },
  50: {
    id: 50,
    title: "CDC · Helmintos transmitidos por el suelo",
    links: [{ label: "Abrir fuente", url: "https://www.cdc.gov/sth/hcp/clinical-care/index.html" }],
  },
  51: {
    id: 51,
    title: "CDC · Enterobiasis",
    links: [{ label: "Abrir fuente", url: "https://www.cdc.gov/pinworm/hcp/clinical-overview/index.html" }],
  },
  52: {
    id: 52,
    title: "CDC · Estrongiloidiasis",
    links: [{ label: "Abrir fuente", url: "https://www.cdc.gov/strongyloides/hcp/clinical-care/index.html" }],
  },
  53: {
    id: 53,
    title: "CDC · Teniasis y cisticercosis",
    links: [
      { label: "Abrir fuente 1", url: "https://www.cdc.gov/taeniasis/hcp/clinical-care/index.html" },
      { label: "Abrir fuente 2", url: "https://www.cdc.gov/dpdx/cysticercosis/index.html" },
    ],
  },
  54: {
    id: 54,
    title: "CDC · Equinococosis",
    links: [{ label: "Abrir fuente", url: "https://www.cdc.gov/echinococcosis/hcp/clinical-care/index.html" }],
  },
  55: {
    id: 55,
    title: "CDC · Himenolepiasis",
    links: [{ label: "Abrir fuente", url: "https://www.cdc.gov/hymenolepis/hcp/clinical-care/index.html" }],
  },
  56: {
    id: 56,
    title: "OMS · Trematodiasis de transmisión alimentaria",
    links: [{ label: "Abrir fuente", url: "https://www.who.int/news-room/fact-sheets/detail/foodborne-trematode-infections" }],
  },
  57: {
    id: 57,
    title: "CDC · Esquistosomiasis",
    links: [{ label: "Abrir fuente", url: "https://www.cdc.gov/schistosomiasis/hcp/treatment/index.html" }],
  },
  58: {
    id: 58,
    title: "CDC · Triquinelosis",
    links: [{ label: "Abrir fuente", url: "https://www.cdc.gov/trichinellosis/hcp/clinical-care/index.html" }],
  },
  59: {
    id: 59,
    title: "CDC · Anisakiasis",
    links: [{ label: "Abrir fuente", url: "https://www.cdc.gov/anisakiasis/hcp/clinical-care/index.html" }],
  },
  60: {
    id: 60,
    title: "CDC · Escabiosis",
    links: [{ label: "Abrir fuente", url: "https://www.cdc.gov/scabies/hcp/clinical-care/index.html" }],
  },
  61: {
    id: 61,
    title: "CDC · Pediculosis del cuero cabelludo",
    links: [{ label: "Abrir fuente", url: "https://www.cdc.gov/lice/hcp/clinical-care/index.html" }],
  },
};
