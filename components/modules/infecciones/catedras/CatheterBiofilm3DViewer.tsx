"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import {
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Eye,
  EyeOff,
  Play,
  Pause,
  Hand,
  Scissors,
  Layers,
} from "lucide-react";

export type CatheterViewMode = "exterior" | "lumen" | "superficie";
export type BiofilmSurfaceState = "sin_colonizacion" | "adhesion" | "biofilm";
export type CatheterRouteMode = "ninguna" | "extraluminal" | "intraluminal" | "paso_sangre";

export interface CatheterStructureDef {
  id: string;
  name: string;
  shortName: string;
  layerGroup: "vaso" | "dispositivo" | "colonizacion" | "ruta";
  description: string;
  whatItShows: string;
  whatItDoesNotProve: string;
}

export const CATHETER_STRUCTURES: CatheterStructureDef[] = [
  {
    id: "pared_vascular",
    name: "Pared de la vena (endotelio y túnicas)",
    shortName: "Pared venosa",
    layerGroup: "vaso",
    description:
      "Conducto venoso recubierto internamente por endotelio. En condiciones fisiológicas el espacio intravascular es estéril; la entrada de un dispositivo atraviesa las barreras cutánea y vascular.",
    whatItShows:
      "Muestra el continente anatómico por donde circula la sangre venosa que rodea la porción intravascular del catéter.",
    whatItDoesNotProve:
      "Ver el catéter alojado dentro de la vena no implica por sí mismo flebitis infecciosa ni trombosis séptica.",
  },
  {
    id: "flujo_sanguineo",
    name: "Torrente sanguíneo (eritrocitos y leucocitos esquemáticos)",
    shortName: "Sangre venosa",
    layerGroup: "vaso",
    description:
      "Representación esquemática del flujo sanguíneo venoso con eritrocitos bicóncavos y leucocitos circulantes alrededor del dispositivo.",
    whatItShows:
      "Ilustra que la superficie externa y la punta distal del catéter están en contacto directo con la circulación sistémica.",
    whatItDoesNotProve:
      "La cercanía de la sangre al catéter colonizado no demuestra bacteriemia: esta requiere confirmación microbiológica mediante hemocultivos.",
  },
  {
    id: "conector_hub",
    name: "Conector proximal (hub) y tramo de entrada",
    shortName: "Conector (hub)",
    layerGroup: "dispositivo",
    description:
      "Extremo externo de conexión del catéter donde se acoplan líneas de infusión o jeringas, y segmento que atraviesa el sitio de inserción hacia el vaso.",
    whatItShows:
      "Identifica el punto de partida de las dos vías principales de colonización: manipulación del conector (vía intraluminal) o microbiota cutánea pericatéter (vía extraluminal).",
    whatItDoesNotProve:
      "La presencia del conector externo no indica contaminación salvo que fallaran las medidas de asepsia o desinfección del puerto.",
  },
  {
    id: "pared_cateter",
    name: "Pared polimérica del catéter venoso",
    shortName: "Pared del catéter",
    layerGroup: "dispositivo",
    description:
      "Estructura tubular sintética (poliuretano o silicona de uso médico). Al ser un material inerte, carece de defensas inmunológicas propias ni recambio celular.",
    whatItShows:
      "Delimita la superficie abiótica externa (en contacto con la sangre venosa) de la superficie interna del conducto.",
    whatItDoesNotProve:
      "El material sintético predispone a la adherencia proteica y microbiana, pero no todo catéter insertado se coloniza ni se infecta.",
  },
  {
    id: "lumen_cateter",
    name: "Lumen interno del catéter y punta distal",
    shortName: "Lumen interno",
    layerGroup: "dispositivo",
    description:
      "Canal hueco interior por donde se infunden fluidos o medicamentos y se obtienen muestras sanguíneas, abierto en su extremo distal hacia la luz venosa.",
    whatItShows:
      "En el corte longitudinal permite observar el interior del tubo, donde pueden alojarse microorganismos que ingresan desde el conector.",
    whatItDoesNotProve:
      "Un cultivo positivo tomado solo a través del lumen de un catéter colonizado puede reflejar arrastre del biofilm interno y no necesariamente bacteriemia sistémica real.",
  },
  {
    id: "pelicula_fibrina",
    name: "Película condicionante del huésped (fibrina y fibronectina)",
    shortName: "Vaina de fibrina",
    layerGroup: "colonizacion",
    description:
      "Recubrimiento de proteínas plasmáticas del propio huésped (fibrina, fibronectina, colágeno) que se deposita sobre el polímero tras el contacto con la sangre.",
    whatItShows:
      "Explica cómo las bacterias con adhesinas específicas (ej. MSCRAMMs en Staphylococcus aureus y S. epidermidis) se fijan al dispositivo.",
    whatItDoesNotProve:
      "La vaina de fibrina es una respuesta del huésped al cuerpo extraño; puede formarse en catéteres estériles sin que exista colonización bacteriana.",
  },
  {
    id: "adhesion_microbiana",
    name: "Microorganismos adheridos a la superficie (ampliados)",
    shortName: "Adhesión microbiana",
    layerGroup: "colonizacion",
    description:
      "Células bacterianas o fúngicas (representadas a escala microscópica ampliada) unidas inicialmente al polímero o a la película de fibrina en el exterior o en el lumen.",
    whatItShows:
      "Representa la etapa de anclaje celular en la que los microorganismos pasan de una forma libre (planctónica) a una forma sésil sobre el dispositivo.",
    whatItDoesNotProve:
      "En un modelo conceptual no permite identificar la especie; en clínica, los agentes frecuentes incluyen S. epidermidis, S. aureus, bacilos gramnegativos, Enterococcus y Candida.",
  },
  {
    id: "matriz_biofilm",
    name: "Matriz polimérica extracelular (EPS) del biofilm",
    shortName: "Biofilm (matriz EPS)",
    layerGroup: "colonizacion",
    description:
      "Comunidad estructurada de microcolonias envuelta en una matriz extracelular autoproducida de polisacáridos, proteínas y ADN extracelular (slime).",
    whatItShows:
      "Visualiza la barrera física y metabólica que dificulta la penetración de antimicrobianos y la fagocitosis por los neutrófilos del huésped.",
    whatItDoesNotProve:
      "Demuestra colonización consolidada del dispositivo, pero NO equivale automáticamente a sepsis ni a shock séptico.",
  },
  {
    id: "ruta_diseminacion",
    name: "Ruta representada de migración o paso a sangre",
    shortName: "Ruta seleccionada",
    layerGroup: "ruta",
    description:
      "Trayectoria esquemática que ilustra cómo los microorganismos pueden avanzar por la cara externa, por el lumen interno o desprenderse desde el biofilm hacia la sangre.",
    whatItShows:
      "Relaciona la puerta de entrada (piel o conector) con la superficie colonizada y la posibilidad de diseminación hematógena.",
    whatItDoesNotProve:
      "Es una ruta mecanística posible, no una predicción de probabilidad clínica ni un proceso inevitable en todo paciente.",
  },
];

export interface CatheterBiofilm3DViewerProps {
  viewMode: CatheterViewMode;
  surfaceState: BiofilmSurfaceState;
  routeMode: CatheterRouteMode;
  crossSection: boolean;
  onToggleCrossSection: () => void;
  showMarkers: boolean;
  onToggleMarkers: () => void;
  selectedStructureId: string | null;
  onSelectStructure: (id: string | null) => void;
  resetToken?: number;
}

type ProjectedMarker = {
  id: string;
  name: string;
  x: number;
  y: number;
  px: number;
  py: number;
};

interface SceneHandles {
  root: THREE.Group;
  meshesById: Map<string, THREE.Object3D[]>;
  markerAnchors: Map<string, THREE.Vector3>;
  clippingPlane: THREE.Plane;
  veinFullGroup: THREE.Group;
  veinCutGroup: THREE.Group;
  catheterFullShaft: THREE.Mesh;
  catheterCutRimGroup: THREE.Group;
  adhesionGroup: THREE.Group;
  biofilmGroup: THREE.Group;
  routeExtraluminalGroup: THREE.Group;
  routeIntraluminalGroup: THREE.Group;
  routeBloodGroup: THREE.Group;
  updateState: (
    viewMode: CatheterViewMode,
    surfaceState: BiofilmSurfaceState,
    routeMode: CatheterRouteMode,
    crossSection: boolean,
    selectedStructureId: string | null
  ) => void;
  dispose: () => void;
}

function buildCatheterBiofilmScene(): SceneHandles {
  const root = new THREE.Group();
  const meshesById = new Map<string, THREE.Object3D[]>();
  const markerAnchors = new Map<string, THREE.Vector3>();
  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];

  // Plane that slices the front half (z > 0.02) when crossSection is active
  const clippingPlane = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0.02);

  const registerMesh = (id: string, obj: THREE.Object3D) => {
    obj.userData.structureId = id;
    const list = meshesById.get(id) || [];
    list.push(obj);
    meshesById.set(id, list);
  };

  // =========================================================================
  // 1. PARED VASCULAR (Vena) - Full vs Longitudinal Cut
  // =========================================================================
  const veinFullGroup = new THREE.Group();
  const veinCutGroup = new THREE.Group();
  root.add(veinFullGroup);
  root.add(veinCutGroup);

  const veinOuterMat = new THREE.MeshPhysicalMaterial({
    color: 0x881d36,
    roughness: 0.45,
    metalness: 0.05,
    transparent: true,
    opacity: 0.34,
    transmission: 0.25,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const veinInnerMat = new THREE.MeshStandardMaterial({
    color: 0x9f2442,
    roughness: 0.55,
    metalness: 0.05,
    side: THREE.BackSide,
  });
  const veinCutWallMat = new THREE.MeshStandardMaterial({
    color: 0xbe3455,
    roughness: 0.42,
    metalness: 0.05,
    side: THREE.DoubleSide,
  });
  materials.push(veinOuterMat, veinInnerMat, veinCutWallMat);

  // Full translucent vein cylinder along X axis
  const veinFullGeo = new THREE.CylinderGeometry(3.1, 3.1, 18.5, 40, 1, true);
  veinFullGeo.rotateZ(Math.PI / 2);
  geometries.push(veinFullGeo);
  const veinFullMesh = new THREE.Mesh(veinFullGeo, veinOuterMat);
  registerMesh("pared_vascular", veinFullMesh);
  veinFullGroup.add(veinFullMesh);

  // Cut half-cylinder (back half z <= 0) for longitudinal section
  const veinHalfOuterGeo = new THREE.CylinderGeometry(
    3.1,
    3.1,
    18.5,
    40,
    1,
    true,
    Math.PI * 0.5,
    Math.PI
  );
  veinHalfOuterGeo.rotateZ(Math.PI / 2);
  const veinHalfInnerGeo = new THREE.CylinderGeometry(
    2.82,
    2.82,
    18.5,
    40,
    1,
    true,
    Math.PI * 0.5,
    Math.PI
  );
  veinHalfInnerGeo.rotateZ(Math.PI / 2);
  geometries.push(veinHalfOuterGeo, veinHalfInnerGeo);

  const veinHalfOuterMesh = new THREE.Mesh(veinHalfOuterGeo, veinCutWallMat);
  const veinHalfInnerMesh = new THREE.Mesh(veinHalfInnerGeo, veinInnerMat);
  registerMesh("pared_vascular", veinHalfOuterMesh);
  registerMesh("pared_vascular", veinHalfInnerMesh);
  veinCutGroup.add(veinHalfOuterMesh, veinHalfInnerMesh);

  // Longitudinal flat cut edges of the vein wall (top and bottom strips at z = 0)
  const stripGeo = new THREE.BoxGeometry(18.5, 0.28, 0.14);
  geometries.push(stripGeo);
  const topStrip = new THREE.Mesh(stripGeo, veinCutWallMat);
  topStrip.position.set(0, 2.96, 0);
  const botStrip = new THREE.Mesh(stripGeo, veinCutWallMat);
  botStrip.position.set(0, -2.96, 0);
  registerMesh("pared_vascular", topStrip);
  registerMesh("pared_vascular", botStrip);
  veinCutGroup.add(topStrip, botStrip);

  markerAnchors.set("pared_vascular", new THREE.Vector3(-1.5, -2.85, 0.2));

  // =========================================================================
  // 2. FLUJO SANGUÍNEO (Eritrocitos bicóncavos y leucocitos esquemáticos)
  // =========================================================================
  const bloodGroup = new THREE.Group();
  root.add(bloodGroup);

  const rbcMat = new THREE.MeshStandardMaterial({
    color: 0xdc2626,
    roughness: 0.38,
    metalness: 0.08,
  });
  const wbcMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.45,
    metalness: 0.05,
  });
  materials.push(rbcMat, wbcMat);

  // Create stylized biconcave red blood cell geometry
  const rbcGeo = new THREE.TorusGeometry(0.32, 0.15, 14, 24);
  const rbcCoreGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.1, 16);
  const wbcGeo = new THREE.IcosahedronGeometry(0.38, 2);
  geometries.push(rbcGeo, rbcCoreGeo, wbcGeo);

  const rbcPositions: [number, number, number, number, number][] = [
    [-5.8, -1.6, -1.1, 0.4, 0.8],
    [-3.4, -1.9, -0.8, 1.1, 0.3],
    [-1.2, -1.7, -1.3, 0.7, 1.2],
    [1.4, -2.0, -0.7, 0.2, 0.9],
    [3.8, -1.6, -1.2, 0.9, 0.4],
    [5.8, -1.4, -0.9, 1.3, 0.6],
    [6.8, 0.4, -1.1, 0.5, 1.1],
    [7.4, -0.6, -0.4, 0.8, 0.2],
    [-0.5, 1.9, -1.2, 1.0, 0.5],
    [2.9, 1.85, -1.1, 0.3, 1.0],
    [5.4, 1.75, -0.8, 0.6, 0.7],
  ];

  rbcPositions.forEach(([x, y, z, rx, ry]) => {
    const rbc = new THREE.Group();
    const ring = new THREE.Mesh(rbcGeo, rbcMat);
    const center = new THREE.Mesh(rbcCoreGeo, rbcMat);
    center.rotation.x = Math.PI / 2;
    rbc.add(ring, center);
    rbc.position.set(x, y, z);
    rbc.rotation.set(rx, ry, 0.3);
    registerMesh("flujo_sanguineo", ring);
    registerMesh("flujo_sanguineo", center);
    bloodGroup.add(rbc);
  });

  // Add 2 leukocytes
  const wbc1 = new THREE.Mesh(wbcGeo, wbcMat);
  wbc1.position.set(4.5, -1.65, -0.5);
  const wbc2 = new THREE.Mesh(wbcGeo, wbcMat);
  wbc2.position.set(-2.4, -1.8, -1.0);
  registerMesh("flujo_sanguineo", wbc1);
  registerMesh("flujo_sanguineo", wbc2);
  bloodGroup.add(wbc1, wbc2);

  markerAnchors.set("flujo_sanguineo", new THREE.Vector3(3.8, -1.6, -0.8));

  // =========================================================================
  // 3. CONECTOR PROXIMAL (HUB) Y ENTRADA DEL CATÉTER
  // =========================================================================
  const hubGroup = new THREE.Group();
  root.add(hubGroup);

  const hubBlueMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    roughness: 0.3,
    metalness: 0.15,
  });
  const hubWingMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    roughness: 0.35,
    metalness: 0.1,
  });
  const skinCollarMat = new THREE.MeshStandardMaterial({
    color: 0xd6a286,
    roughness: 0.65,
    metalness: 0.02,
    transparent: true,
    opacity: 0.78,
  });
  materials.push(hubBlueMat, hubWingMat, skinCollarMat);

  // Entry curve path from outside the vessel (x=-8.2, y=3.9) into the vessel axis (x=-4.2, y=0.15)
  const entryCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-8.4, 4.1, 0),
    new THREE.Vector3(-6.8, 2.7, 0),
    new THREE.Vector3(-5.3, 0.95, 0),
    new THREE.Vector3(-4.0, 0.15, 0),
  ]);
  const entryTubeGeo = new THREE.TubeGeometry(entryCurve, 28, 0.88, 24, false);
  geometries.push(entryTubeGeo);

  // Luer-lock proximal hub cylinder positioned at (-8.7, 4.35, 0) along entry tangent
  const hubCylGeo = new THREE.CylinderGeometry(1.18, 0.92, 1.8, 24);
  const hubPortGeo = new THREE.CylinderGeometry(0.85, 0.85, 0.7, 24);
  const skinRingGeo = new THREE.TorusGeometry(1.22, 0.25, 16, 32);
  geometries.push(hubCylGeo, hubPortGeo, skinRingGeo);

  const hubAssembly = new THREE.Group();
  const hubBody = new THREE.Mesh(hubCylGeo, hubBlueMat);
  const hubPort = new THREE.Mesh(hubPortGeo, hubWingMat);
  hubPort.position.y = 1.1;
  hubAssembly.add(hubBody, hubPort);
  hubAssembly.position.set(-8.65, 4.32, 0);
  hubAssembly.rotation.z = Math.PI * 0.31;

  // Skin entry cuff ring around (-6.6, 2.55, 0)
  const skinRing = new THREE.Mesh(skinRingGeo, skinCollarMat);
  skinRing.position.set(-6.55, 2.52, 0);
  skinRing.rotation.y = Math.PI / 2;
  skinRing.rotation.x = -Math.PI * 0.22;

  const entryTubeMesh = new THREE.Mesh(entryTubeGeo, hubWingMat);
  registerMesh("conector_hub", hubBody);
  registerMesh("conector_hub", hubPort);
  registerMesh("conector_hub", skinRing);
  registerMesh("conector_hub", entryTubeMesh);
  hubGroup.add(hubAssembly, skinRing, entryTubeMesh);

  markerAnchors.set("conector_hub", new THREE.Vector3(-7.6, 3.5, 0.5));

  // =========================================================================
  // 4. PARED DEL CATÉTER Y LUMEN INTERNO (Tramo Intravascular)
  // =========================================================================
  const catheterPolymerMat = new THREE.MeshPhysicalMaterial({
    color: 0xbae6fd,
    roughness: 0.25,
    metalness: 0.05,
    transparent: true,
    opacity: 0.86,
    clippingPlanes: [clippingPlane],
    clipShadows: true,
    side: THREE.DoubleSide,
  });

  const lumenInnerMat = new THREE.MeshStandardMaterial({
    color: 0x075985,
    roughness: 0.4,
    metalness: 0.1,
    side: THREE.BackSide,
  });

  const catheterCutRimMat = new THREE.MeshStandardMaterial({
    color: 0x7dd3fc,
    roughness: 0.3,
    metalness: 0.08,
  });
  materials.push(catheterPolymerMat, lumenInnerMat, catheterCutRimMat);

  // Outer shaft cylinder from x = -4.2 to x = 5.6 (length 9.8, centered at x = 0.7, y = 0.15)
  const shaftOuterGeo = new THREE.CylinderGeometry(0.92, 0.92, 9.8, 36, 1, true);
  shaftOuterGeo.rotateZ(Math.PI / 2);
  // Distal tapered tip from x = 5.6 to x = 6.7
  const tipOuterGeo = new THREE.CylinderGeometry(0.62, 0.92, 1.1, 32, 1, true);
  tipOuterGeo.rotateZ(-Math.PI / 2);
  geometries.push(shaftOuterGeo, tipOuterGeo);

  const catheterFullShaft = new THREE.Mesh(shaftOuterGeo, catheterPolymerMat);
  catheterFullShaft.position.set(0.7, 0.15, 0);
  const catheterTipMesh = new THREE.Mesh(tipOuterGeo, catheterPolymerMat);
  catheterTipMesh.position.set(6.15, 0.15, 0);
  registerMesh("pared_cateter", catheterFullShaft);
  registerMesh("pared_cateter", catheterTipMesh);
  root.add(catheterFullShaft, catheterTipMesh);

  // Inner lumen channel (back half always visible when sliced, or selectable in lumen view)
  const lumenBackGeo = new THREE.CylinderGeometry(
    0.64,
    0.64,
    10.8,
    36,
    1,
    true,
    Math.PI * 0.5,
    Math.PI
  );
  lumenBackGeo.rotateZ(Math.PI / 2);
  geometries.push(lumenBackGeo);

  const lumenMesh = new THREE.Mesh(lumenBackGeo, lumenInnerMat);
  lumenMesh.position.set(1.2, 0.15, 0);
  registerMesh("lumen_cateter", lumenMesh);
  root.add(lumenMesh);

  // Cut rim strips for the catheter wall when cross-section is active
  const catheterCutRimGroup = new THREE.Group();
  const cRimGeo = new THREE.BoxGeometry(10.8, 0.28, 0.08);
  geometries.push(cRimGeo);
  const cTopRim = new THREE.Mesh(cRimGeo, catheterCutRimMat);
  cTopRim.position.set(1.2, 0.15 + 0.78, 0);
  const cBotRim = new THREE.Mesh(cRimGeo, catheterCutRimMat);
  cBotRim.position.set(1.2, 0.15 - 0.78, 0);
  registerMesh("pared_cateter", cTopRim);
  registerMesh("pared_cateter", cBotRim);
  catheterCutRimGroup.add(cTopRim, cBotRim);
  root.add(catheterCutRimGroup);

  markerAnchors.set("pared_cateter", new THREE.Vector3(-2.1, 1.07, 0.15));
  markerAnchors.set("lumen_cateter", new THREE.Vector3(0.4, 0.15, -0.35));

  // =========================================================================
  // 5. PELÍCULA CONDICIONANTE DEL HUÉSPED (Fibrina / Fibronectina)
  // =========================================================================
  const fibrinGroup = new THREE.Group();
  root.add(fibrinGroup);

  const fibrinMat = new THREE.MeshStandardMaterial({
    color: 0xfde68a,
    roughness: 0.62,
    metalness: 0.04,
    transparent: true,
    opacity: 0.75,
    clippingPlanes: [clippingPlane],
    side: THREE.DoubleSide,
  });
  materials.push(fibrinMat);

  // Conditioning sleeve around x = 0.0 to x = 4.2 on the outer surface of the catheter
  const fibrinSleeveGeo = new THREE.CylinderGeometry(0.99, 0.99, 4.4, 32, 8, true);
  fibrinSleeveGeo.rotateZ(Math.PI / 2);
  // Subtle organic undulation on the fibrin sheath
  const posAttr = fibrinSleeveGeo.attributes.position;
  for (let i = 0; i < posAttr.count; i++) {
    const vx = posAttr.getX(i);
    const vy = posAttr.getY(i);
    const vz = posAttr.getZ(i);
    const angle = Math.atan2(vz, vy);
    const wave = 1 + 0.045 * Math.sin(vx * 3.2 + angle * 3);
    posAttr.setY(i, vy * wave);
    posAttr.setZ(i, vz * wave);
  }
  fibrinSleeveGeo.computeVertexNormals();
  geometries.push(fibrinSleeveGeo);

  const fibrinMesh = new THREE.Mesh(fibrinSleeveGeo, fibrinMat);
  fibrinMesh.position.set(2.1, 0.15, 0);
  registerMesh("pelicula_fibrina", fibrinMesh);
  fibrinGroup.add(fibrinMesh);

  // Fibrin strands inside the lumen as well
  const innerFibrinGeo = new THREE.CylinderGeometry(
    0.61,
    0.61,
    3.6,
    24,
    1,
    true,
    Math.PI * 0.55,
    Math.PI * 0.9
  );
  innerFibrinGeo.rotateZ(Math.PI / 2);
  geometries.push(innerFibrinGeo);
  const innerFibrinMesh = new THREE.Mesh(innerFibrinGeo, fibrinMat);
  innerFibrinMesh.position.set(2.3, 0.15, 0);
  registerMesh("pelicula_fibrina", innerFibrinMesh);
  fibrinGroup.add(innerFibrinMesh);

  markerAnchors.set("pelicula_fibrina", new THREE.Vector3(0.5, 1.14, 0.0));

  // =========================================================================
  // 6. ADHESIÓN MICROBIANA (Cocos y bacilos sésiles ampliados)
  // =========================================================================
  const adhesionGroup = new THREE.Group();
  root.add(adhesionGroup);

  const cocciMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0x78350f,
    emissiveIntensity: 0.25,
    roughness: 0.3,
    metalness: 0.1,
  });
  const bacilliMat = new THREE.MeshStandardMaterial({
    color: 0x34d399,
    emissive: 0x064e3b,
    emissiveIntensity: 0.25,
    roughness: 0.32,
    metalness: 0.08,
  });
  materials.push(cocciMat, bacilliMat);

  const coccusGeo = new THREE.SphereGeometry(0.13, 14, 14);
  const bacillusGeo = new THREE.CapsuleGeometry(0.09, 0.22, 8, 12);
  geometries.push(coccusGeo, bacillusGeo);

  // Outer surface microcolonies (positioned along top/back so they remain visible in cross-section too)
  const outerMicroPositions: [number, number, number, boolean][] = [
    [1.1, 1.16, -0.15, true],
    [1.28, 1.12, -0.32, true],
    [1.18, 1.05, -0.48, true],
    [1.9, 1.15, -0.22, true],
    [2.08, 1.13, -0.35, true],
    [2.22, 1.18, -0.1, true],
    [2.85, 1.14, -0.28, false],
    [3.1, 1.08, -0.45, false],
    [3.55, 1.16, -0.18, true],
    [3.72, 1.14, -0.34, true],
    [2.4, -0.88, -0.25, true],
    [2.6, -0.85, -0.42, false],
  ];

  // Inner lumen microcolonies (inside the catheter lumen channel y ~ 0.15 +/- 0.45, z < 0)
  const innerMicroPositions: [number, number, number, boolean][] = [
    [1.4, 0.48, -0.32, true],
    [1.56, 0.42, -0.42, true],
    [2.1, -0.22, -0.38, true],
    [2.28, -0.18, -0.44, true],
    [2.8, 0.45, -0.36, false],
    [3.25, -0.15, -0.42, true],
    [3.42, -0.22, -0.35, true],
    [3.95, 0.38, -0.4, false],
  ];

  [...outerMicroPositions, ...innerMicroPositions].forEach(([x, y, z, isCoccus], idx) => {
    const m = new THREE.Mesh(isCoccus ? coccusGeo : bacillusGeo, isCoccus ? cocciMat : bacilliMat);
    m.position.set(x, y, z);
    m.rotation.set(idx * 0.5, idx * 0.8, idx * 0.3);
    registerMesh("adhesion_microbiana", m);
    adhesionGroup.add(m);
  });

  markerAnchors.set("adhesion_microbiana", new THREE.Vector3(2.05, 1.24, -0.22));

  // =========================================================================
  // 7. MATRIZ POLIMÉRICA EXTRACELULAR (BIOFILM ESTABLECIDO - EPS)
  // =========================================================================
  const biofilmGroup = new THREE.Group();
  root.add(biofilmGroup);

  const epsMatrixMat = new THREE.MeshPhysicalMaterial({
    color: 0x10b981,
    emissive: 0x065f46,
    emissiveIntensity: 0.2,
    roughness: 0.22,
    metalness: 0.02,
    transparent: true,
    opacity: 0.62,
    transmission: 0.35,
    side: THREE.DoubleSide,
  });
  materials.push(epsMatrixMat);

  // Lobulated EPS hydrogel domes on outer surface and inner lumen
  const epsDomeGeo = new THREE.SphereGeometry(0.42, 20, 16);
  geometries.push(epsDomeGeo);

  const epsClusters: [number, number, number, number, number, number][] = [
    // Outer catheter biofilm domes
    [1.25, 1.08, -0.25, 1.4, 0.65, 1.1],
    [2.15, 1.12, -0.22, 1.8, 0.78, 1.25],
    [3.25, 1.09, -0.28, 1.6, 0.7, 1.15],
    [2.5, -0.82, -0.28, 1.5, 0.6, 1.1],
    // Inner lumen biofilm domes
    [1.55, 0.42, -0.35, 1.3, 0.55, 0.9],
    [2.35, -0.18, -0.36, 1.5, 0.58, 0.95],
    [3.35, 0.12, -0.38, 1.6, 0.65, 1.0],
  ];

  epsClusters.forEach(([x, y, z, sx, sy, sz]) => {
    const dome = new THREE.Mesh(epsDomeGeo, epsMatrixMat);
    dome.position.set(x, y, z);
    dome.scale.set(sx, sy, sz);
    registerMesh("matriz_biofilm", dome);
    biofilmGroup.add(dome);
  });

  // Extra dense microcolonies inside the mature biofilm
  const denseMicroPositions: [number, number, number][] = [
    [2.15, 1.32, -0.18],
    [2.32, 1.28, -0.26],
    [3.15, 1.26, -0.22],
    [3.35, 1.24, -0.3],
    [3.3, 0.18, -0.32],
    [3.48, 0.08, -0.35],
  ];
  denseMicroPositions.forEach(([x, y, z]) => {
    const c = new THREE.Mesh(coccusGeo, cocciMat);
    c.position.set(x, y, z);
    registerMesh("matriz_biofilm", c);
    biofilmGroup.add(c);
  });

  markerAnchors.set("matriz_biofilm", new THREE.Vector3(3.25, 1.35, -0.25));

  // =========================================================================
  // 8. RUTAS REPRESENTADAS (Extraluminal, Intraluminal, Paso a sangre)
  // =========================================================================
  const routeExtraluminalGroup = new THREE.Group();
  const routeIntraluminalGroup = new THREE.Group();
  const routeBloodGroup = new THREE.Group();
  root.add(routeExtraluminalGroup, routeIntraluminalGroup, routeBloodGroup);

  const routeArrowMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.55,
    roughness: 0.25,
  });
  const routeDispersalMat = new THREE.MeshStandardMaterial({
    color: 0xf43f5e,
    emissive: 0xbe123c,
    emissiveIntensity: 0.5,
    roughness: 0.25,
  });
  materials.push(routeArrowMat, routeDispersalMat);

  const coneGeo = new THREE.ConeGeometry(0.22, 0.52, 16);
  coneGeo.rotateZ(-Math.PI / 2);
  geometries.push(coneGeo);

  // Route 1: Extraluminal (along outer surface from skin entry x=-6.2 to x=1.0)
  const extraPoints: [number, number, number, number][] = [
    [-6.0, 2.85, 0.2, -0.65],
    [-4.6, 1.65, 0.2, -0.52],
    [-3.1, 1.18, 0.15, -0.05],
    [-1.4, 1.18, 0.15, 0],
    [0.2, 1.18, 0.15, 0],
  ];
  extraPoints.forEach(([x, y, z, rz]) => {
    const cone = new THREE.Mesh(coneGeo, routeArrowMat);
    cone.position.set(x, y, z);
    cone.rotation.z = rz;
    registerMesh("ruta_diseminacion", cone);
    routeExtraluminalGroup.add(cone);
  });

  // Route 2: Intraluminal (inside the hub and lumen from x=-7.5 to x=4.5)
  const intraPoints: [number, number, number, number][] = [
    [-7.2, 3.1, 0, -0.65],
    [-5.4, 1.1, 0, -0.55],
    [-3.4, 0.15, -0.1, 0],
    [-1.2, 0.15, -0.1, 0],
    [1.0, 0.15, -0.1, 0],
  ];
  intraPoints.forEach(([x, y, z, rz]) => {
    const cone = new THREE.Mesh(coneGeo, routeArrowMat);
    cone.position.set(x, y, z);
    cone.rotation.z = rz;
    registerMesh("ruta_diseminacion", cone);
    routeIntraluminalGroup.add(cone);
  });

  // Route 3: Planktonic detachment into bloodstream at distal tip (x=4.8 to x=7.8)
  const bloodRoutePoints: [number, number, number, number][] = [
    [4.6, 0.95, 0, -0.15],
    [5.8, 0.55, 0, -0.1],
    [7.0, 0.15, 0, 0],
  ];
  bloodRoutePoints.forEach(([x, y, z, rz]) => {
    const cone = new THREE.Mesh(coneGeo, routeDispersalMat);
    cone.position.set(x, y, z);
    cone.rotation.z = rz;
    registerMesh("ruta_diseminacion", cone);
    routeBloodGroup.add(cone);
  });
  // Detached planktonic cocci near distal tip only when route === "paso_sangre"
  const detachedCoords: [number, number, number][] = [
    [5.3, 1.35, -0.2],
    [6.4, 0.85, -0.3],
    [7.2, -0.25, -0.2],
    [7.7, 0.45, -0.1],
  ];
  detachedCoords.forEach(([x, y, z]) => {
    const p = new THREE.Mesh(coccusGeo, routeDispersalMat);
    p.position.set(x, y, z);
    registerMesh("ruta_diseminacion", p);
    routeBloodGroup.add(p);
  });

  markerAnchors.set("ruta_diseminacion", new THREE.Vector3(-1.4, 1.18, 0.15));

  // =========================================================================
  // STATE UPDATE CONTROLLER
  // =========================================================================
  const updateState = (
    viewMode: CatheterViewMode,
    surfaceState: BiofilmSurfaceState,
    routeMode: CatheterRouteMode,
    crossSection: boolean,
    selectedStructureId: string | null
  ) => {
    const isCut = crossSection || viewMode === "lumen";

    // Vein full vs longitudinal cut
    veinFullGroup.visible = !isCut;
    veinCutGroup.visible = isCut;

    // Catheter clipping plane active when cut is active
    catheterPolymerMat.clippingPlanes = isCut ? [clippingPlane] : [];
    fibrinMat.clippingPlanes = isCut ? [clippingPlane] : [];
    catheterCutRimGroup.visible = isCut;

    // Surface colonization states
    adhesionGroup.visible = surfaceState === "adhesion" || surfaceState === "biofilm";
    biofilmGroup.visible = surfaceState === "biofilm";

    // Route visibility
    routeExtraluminalGroup.visible = routeMode === "extraluminal";
    routeIntraluminalGroup.visible = routeMode === "intraluminal";
    routeBloodGroup.visible = routeMode === "paso_sangre";

    // Update dynamic anchor for route_diseminacion depending on active route
    if (routeMode === "extraluminal") {
      markerAnchors.set("ruta_diseminacion", new THREE.Vector3(-3.1, 1.18, 0.15));
    } else if (routeMode === "intraluminal") {
      markerAnchors.set("ruta_diseminacion", new THREE.Vector3(-1.2, 0.15, -0.1));
    } else if (routeMode === "paso_sangre") {
      markerAnchors.set("ruta_diseminacion", new THREE.Vector3(6.4, 0.85, -0.3));
    }

    // Highlight selected structure with subtle emissive boost
    meshesById.forEach((objs, id) => {
      const isSelected = id === selectedStructureId;
      objs.forEach((obj) => {
        if (!(obj instanceof THREE.Mesh)) return;
        const mat = obj.material;
        if (
          mat instanceof THREE.MeshStandardMaterial ||
          mat instanceof THREE.MeshPhysicalMaterial
        ) {
          if (id === "adhesion_microbiana" || id === "matriz_biofilm" || id === "ruta_diseminacion") {
            mat.emissiveIntensity = isSelected ? 0.75 : 0.28;
          } else {
            mat.emissive.setHex(isSelected ? 0x0ea5e9 : 0x000000);
            mat.emissiveIntensity = isSelected ? 0.35 : 0;
          }
        }
      });
    });
  };

  const dispose = () => {
    geometries.forEach((g) => g.dispose());
    materials.forEach((m) => m.dispose());
  };

  return {
    root,
    meshesById,
    markerAnchors,
    clippingPlane,
    veinFullGroup,
    veinCutGroup,
    catheterFullShaft,
    catheterCutRimGroup,
    adhesionGroup,
    biofilmGroup,
    routeExtraluminalGroup,
    routeIntraluminalGroup,
    routeBloodGroup,
    updateState,
    dispose,
  };
}

export const CatheterBiofilm3DViewer: React.FC<CatheterBiofilm3DViewerProps> = (props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const liveProps = useRef(props);
  liveProps.current = props;

  const runtimeRef = useRef<{
    sceneHandles: SceneHandles;
    camera: THREE.PerspectiveCamera;
    controls: OrbitControls;
    applyCameraForView: (view: CatheterViewMode) => void;
    dirty: boolean;
  } | null>(null);

  const [markers, setMarkers] = useState<ProjectedMarker[]>([]);
  const [autoRotate, setAutoRotate] = useState(false);
  const [touchMode, setTouchMode] = useState(false);
  const [touchActive, setTouchActive] = useState(false);
  const [ready, setReady] = useState(false);
  const [webglError, setWebglError] = useState<string | null>(null);

  useEffect(() => {
    const host = containerRef.current;
    if (!host) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      setWebglError(
        "El navegador no pudo iniciar WebGL. Puedes usar todos los selectores, marcadores en lista y descripciones equivalentes debajo del visor."
      );
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setClearColor(0x000000, 0);
    renderer.localClippingEnabled = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.2, 200);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTex = pmrem.fromScene(roomEnv, 0.03);
    scene.environment = envTex.texture;
    scene.environmentIntensity = 0.42;
    roomEnv.dispose();
    pmrem.dispose();

    scene.add(new THREE.HemisphereLight(0xf8fafc, 0x1e293b, 1.25));
    const keyLight = new THREE.DirectionalLight(0xfff7ed, 2.4);
    keyLight.position.set(8, 16, 22);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xe0f2fe, 1.1);
    fillLight.position.set(-14, -6, 16);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x93c5fd, 1.2);
    rimLight.position.set(0, 12, -18);
    scene.add(rimLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = 4.5;
    controls.maxDistance = 36;
    controls.autoRotateSpeed = 0.55;

    const sceneHandles = buildCatheterBiofilmScene();
    scene.add(sceneHandles.root);

    let width = host.clientWidth || 640;
    let height = host.clientHeight || 420;
    let disposed = false;
    let frameId = 0;
    let renderDirty = true;

    const applyCameraForView = (view: CatheterViewMode) => {
      const aspect = Math.max(0.55, Math.min(1.2, width / Math.max(1, height)));
      if (view === "exterior") {
        controls.target.set(-0.6, 0.3, 0);
        camera.position.set(-1.2, 3.2, 17.5 / aspect);
      } else if (view === "lumen") {
        controls.target.set(0.4, 0.2, 0);
        camera.position.set(0.4, 1.3, 14.2 / aspect);
      } else {
        // "superficie" zoomed macro onto the conditioning film + biofilm region
        controls.target.set(2.3, 0.45, -0.1);
        camera.position.set(2.5, 1.45, 7.2 / aspect);
      }
      controls.update();
      renderDirty = true;
      if (runtimeRef.current) runtimeRef.current.dirty = true;
    };

    runtimeRef.current = {
      sceneHandles,
      camera,
      controls,
      applyCameraForView,
      dirty: true,
    };

    const media = window.matchMedia("(pointer: coarse), (max-width: 639px)");
    const updateTouchPolicy = () => {
      controls.enabled = !media.matches;
      renderer.domElement.style.touchAction = media.matches ? "pan-y" : "none";
      setTouchMode(media.matches);
      setTouchActive(false);
    };
    media.addEventListener("change", updateTouchPolicy);
    updateTouchPolicy();

    const handleResize = () => {
      width = host.clientWidth;
      height = host.clientHeight;
      if (!width || !height) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderDirty = true;
      if (runtimeRef.current) runtimeRef.current.dirty = true;
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(host);
    handleResize();
    applyCameraForView(liveProps.current.viewMode);

    // Raycasting for clicking 3D structures
    const raycaster = new THREE.Raycaster();
    let pointerDownPos = { x: 0, y: 0 };
    const onPointerDown = (e: PointerEvent) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
    };
    const onPointerUp = (e: PointerEvent) => {
      if (!controls.enabled || Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y) > 6) {
        return;
      }
      const rect = renderer.domElement.getBoundingClientRect();
      const ndc = new THREE.Vector2(
        ((e.clientX - rect.left) / width) * 2 - 1,
        -((e.clientY - rect.top) / height) * 2 + 1
      );
      raycaster.setFromCamera(ndc, camera);
      const visibleMeshes: THREE.Object3D[] = [];
      sceneHandles.root.traverseVisible((obj) => {
        if (obj instanceof THREE.Mesh && obj.userData.structureId) {
          visibleMeshes.push(obj);
        }
      });
      const hits = raycaster.intersectObjects(visibleMeshes, false);
      const hit = hits.find((h) => h.object.userData.structureId);
      if (hit) {
        liveProps.current.onSelectStructure(hit.object.userData.structureId);
      }
    };

    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointerup", onPointerUp);

    const onControlsChange = () => {
      renderDirty = true;
      if (runtimeRef.current) runtimeRef.current.dirty = true;
    };
    controls.addEventListener("change", onControlsChange);

    let lastMarkerTime = 0;
    const projectMarkers = () => {
      const current = liveProps.current;
      if (!current.showMarkers) {
        setMarkers([]);
        return;
      }

      const activeIds: string[] = [
        "pared_vascular",
        "flujo_sanguineo",
        "conector_hub",
        "pared_cateter",
        "lumen_cateter",
        "pelicula_fibrina",
      ];
      if (current.surfaceState === "adhesion" || current.surfaceState === "biofilm") {
        activeIds.push("adhesion_microbiana");
      }
      if (current.surfaceState === "biofilm") {
        activeIds.push("matriz_biofilm");
      }
      if (current.routeMode !== "ninguna") {
        activeIds.push("ruta_diseminacion");
      }

      const topGroupIds = new Set([
        "conector_hub",
        "pared_cateter",
        "pelicula_fibrina",
        "adhesion_microbiana",
        "matriz_biofilm",
      ]);

      const rawAnchors: {
        id: string;
        name: string;
        px: number;
        py: number;
        isTop: boolean;
      }[] = [];

      for (const id of activeIds) {
        const def = CATHETER_STRUCTURES.find((s) => s.id === id);
        const anchor = sceneHandles.markerAnchors.get(id);
        if (!def || !anchor) continue;

        const projected = anchor.clone().project(camera);
        if (projected.z > 1 || projected.z < -1) continue;

        const px = ((projected.x + 1) * width) / 2;
        const py = ((1 - projected.y) * height) / 2;
        if (px < 8 || px > width - 8 || py < 10 || py > height - 10) continue;

        rawAnchors.push({
          id,
          name: def.shortName,
          px,
          py,
          isTop: topGroupIds.has(id),
        });
      }

      const nextMarkers: ProjectedMarker[] = [];
      const isCompact = width < 440;
      const minXMargin = isCompact ? 54 : 68;
      const minDX = isCompact ? 108 : 126;
      const minDY = 30;

      const placeBand = (items: typeof rawAnchors, band: "top" | "bottom") => {
        const sorted = [...items].sort((a, b) => a.px - b.px);
        const count = sorted.length;
        sorted.forEach((item, idx) => {
          // Spread horizontally across canvas while staying close to natural px
          const slotX =
            count > 1
              ? minXMargin + (idx / (count - 1)) * (width - minXMargin * 2)
              : item.px;
          const blendedX = THREE.MathUtils.clamp(
            item.px * 0.45 + slotX * 0.55,
            minXMargin,
            width - minXMargin
          );

          const rowOffset = isCompact ? (idx % 2) * 30 : (idx % 2) * 26;
          let y =
            band === "top"
              ? 24 + rowOffset
              : height - 24 - rowOffset;
          let x = blendedX;

          let tries = 0;
          while (
            nextMarkers.some(
              (m) => Math.abs(m.x - x) < minDX && Math.abs(m.y - y) < minDY
            ) &&
            tries < 8
          ) {
            tries++;
            const step = Math.ceil(tries / 2) * minDY;
            y =
              band === "top"
                ? THREE.MathUtils.clamp(24 + step, 22, height * 0.36)
                : THREE.MathUtils.clamp(height - 24 - step, height * 0.64, height - 22);
          }

          nextMarkers.push({
            id: item.id,
            name: item.name,
            x,
            y,
            px: item.px,
            py: item.py,
          });
        });
      };

      placeBand(
        rawAnchors.filter((a) => a.isTop),
        "top"
      );
      placeBand(
        rawAnchors.filter((a) => !a.isTop),
        "bottom"
      );
      setMarkers(nextMarkers);
    };

    sceneHandles.updateState(
      liveProps.current.viewMode,
      liveProps.current.surfaceState,
      liveProps.current.routeMode,
      liveProps.current.crossSection,
      liveProps.current.selectedStructureId
    );

    const animate = (time: number) => {
      if (disposed) return;
      controls.update();
      if (runtimeRef.current?.dirty) {
        renderDirty = true;
      }
      if (runtimeRef.current?.dirty && time - lastMarkerTime > 80) {
        projectMarkers();
        runtimeRef.current.dirty = false;
        lastMarkerTime = time;
      }
      if (renderDirty) {
        renderer.render(scene, camera);
        renderDirty = false;
      }
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    setReady(true);

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      media.removeEventListener("change", updateTouchPolicy);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      controls.removeEventListener("change", onControlsChange);
      controls.dispose();
      sceneHandles.dispose();
      envTex.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      runtimeRef.current = null;
    };
  }, []);

  // Update 3D scene when props change without resetting camera unless viewMode or resetToken changed
  useEffect(() => {
    const r = runtimeRef.current;
    if (!r) return;
    r.sceneHandles.updateState(
      props.viewMode,
      props.surfaceState,
      props.routeMode,
      props.crossSection,
      props.selectedStructureId
    );
    r.dirty = true;
  }, [
    props.viewMode,
    props.surfaceState,
    props.routeMode,
    props.crossSection,
    props.selectedStructureId,
  ]);

  // Reframe camera when viewMode or resetToken changes
  useEffect(() => {
    const r = runtimeRef.current;
    if (!r) return;
    r.applyCameraForView(props.viewMode);
  }, [props.viewMode, props.resetToken]);

  useEffect(() => {
    const r = runtimeRef.current;
    if (!r) return;
    r.dirty = true;
    if (!props.showMarkers) setMarkers([]);
  }, [props.showMarkers]);

  useEffect(() => {
    const r = runtimeRef.current;
    if (!r) return;
    r.controls.autoRotate = autoRotate;
    r.dirty = true;
  }, [autoRotate]);

  const handleZoom = (factor: number) => {
    const r = runtimeRef.current;
    if (!r) return;
    const delta = r.camera.position.clone().sub(r.controls.target);
    delta.setLength(
      THREE.MathUtils.clamp(delta.length() * factor, r.controls.minDistance, r.controls.maxDistance)
    );
    r.camera.position.copy(r.controls.target).add(delta);
    r.controls.update();
    r.dirty = true;
  };

  const toggleTouch = () => {
    const next = !touchActive;
    setTouchActive(next);
    if (runtimeRef.current) {
      runtimeRef.current.controls.enabled = next;
    }
    const canvas = containerRef.current?.querySelector("canvas");
    if (canvas) {
      canvas.style.touchAction = next ? "none" : "pan-y";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const r = runtimeRef.current;
    if (!r) return;
    if (["+", "=", "-", "r", "R", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
      e.preventDefault();
    }
    if (e.key === "+" || e.key === "=") handleZoom(0.86);
    else if (e.key === "-") handleZoom(1.16);
    else if (e.key === "r" || e.key === "R") r.applyCameraForView(props.viewMode);
    else if (e.key.startsWith("Arrow")) {
      const axis =
        e.key === "ArrowLeft" || e.key === "ArrowRight"
          ? new THREE.Vector3(0, 1, 0)
          : new THREE.Vector3(1, 0, 0).applyQuaternion(r.camera.quaternion);
      const sign = e.key === "ArrowLeft" || e.key === "ArrowUp" ? 1 : -1;
      r.camera.position
        .sub(r.controls.target)
        .applyAxisAngle(axis, sign * 0.12)
        .add(r.controls.target);
      r.controls.update();
      r.dirty = true;
    }
  };

  const controlBtnClass =
    "inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-slate-900/80 px-3 text-xs font-medium text-slate-200 hover:bg-slate-800 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400 transition-colors";

  return (
    <div className="min-w-0 overflow-hidden rounded-3xl border border-white/10 bg-[#0b101b] shadow-2xl">
      {/* Barra superior esencial del visor */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-3 py-2.5 sm:px-4">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-300">
            Visor 3D · Catéter venoso intravascular
          </span>
          <span className="hidden sm:inline-block rounded-full bg-slate-900 px-2.5 py-0.5 text-[10px] font-mono text-slate-400 border border-white/5">
            Proporciones microscópicas ampliadas
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={props.onToggleMarkers}
            aria-pressed={props.showMarkers}
            aria-label={props.showMarkers ? "Ocultar marcadores" : "Mostrar marcadores"}
            className={`${controlBtnClass} ${
              props.showMarkers ? "!border-cyan-400/50 !bg-cyan-500/20 !text-cyan-100" : ""
            }`}
          >
            {props.showMarkers ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{props.showMarkers ? "Ocultar marcadores" : "Mostrar marcadores"}</span>
          </button>

          <button
            type="button"
            onClick={() => setAutoRotate(!autoRotate)}
            aria-pressed={autoRotate}
            aria-label={autoRotate ? "Pausar rotación automática" : "Activar rotación suave"}
            title="Rotación suave"
            className={controlBtnClass}
          >
            {autoRotate ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={() => runtimeRef.current?.applyCameraForView(props.viewMode)}
            aria-label="Restablecer vista de cámara"
            title="Restablecer vista"
            className={controlBtnClass}
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Restablecer vista</span>
          </button>
        </div>
      </div>

      {/* Área del modelo 3D */}
      <div className="relative bg-[radial-gradient(ellipse_at_50%_45%,#1e293b_0%,#0f172a_55%,#090d16_100%)]">
        <div
          ref={containerRef}
          tabIndex={0}
          role="region"
          aria-label="Escena 3D de catéter venoso dentro de un vaso sanguíneo. Usa las flechas del teclado para rotar, más y menos para acercar o alejar, y R para restablecer la vista."
          onKeyDown={handleKeyDown}
          className="h-[340px] w-full cursor-grab select-none outline-none active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-400 sm:h-[430px]"
        />

        {!ready && !webglError && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs text-slate-400">
            Preparando modelo 3D del catéter y vaso sanguíneo…
          </div>
        )}

        {webglError && (
          <div
            role="alert"
            className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/95 p-6 text-center text-xs text-slate-300 space-y-2"
          >
            <Layers className="w-6 h-6 text-cyan-400" />
            <p className="max-w-md leading-relaxed">{webglError}</p>
          </div>
        )}

        {/* Marcadores compactos seleccionables proyectados */}
        {props.showMarkers && !webglError && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
              {markers.map((m) => (
                <g key={m.id}>
                  <line
                    x1={m.px}
                    y1={m.py}
                    x2={m.x}
                    y2={m.y}
                    stroke="#38bdf8"
                    strokeWidth="1.2"
                    opacity="0.65"
                  />
                  <circle cx={m.px} cy={m.py} r="3.2" fill="#7dd3fc" />
                </g>
              ))}
            </svg>

            {markers.map((m) => {
              const isSelected = props.selectedStructureId === m.id;
              return (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => props.onSelectStructure(m.id)}
                  aria-label={`Seleccionar estructura: ${m.name}`}
                  aria-pressed={isSelected}
                  style={{
                    left: m.x,
                    top: m.y,
                    transform: "translate(-50%, -50%)",
                  }}
                  className={`pointer-events-auto absolute min-h-[28px] whitespace-nowrap rounded-lg border px-2 py-0.5 text-[10px] font-semibold shadow-lg backdrop-blur-md transition-all ${
                    isSelected
                      ? "border-cyan-300 bg-cyan-950/95 text-cyan-100 ring-1 ring-cyan-400/50 z-10"
                      : "border-white/15 bg-slate-950/88 text-slate-200 hover:border-cyan-400/40"
                  }`}
                >
                  {m.name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Barra inferior de zoom y control táctil seguro en móvil */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 px-3 py-2.5 sm:px-4">
        <div className="text-[11px] text-slate-400">
          <span>
            Nota de escala: las microcolonias, la película de fibrina y la matriz del biofilm están{" "}
            <strong className="text-slate-200">ampliadas fuera de escala anatómica</strong> para hacerlas visibles.
          </span>
        </div>

        <div className="flex items-center gap-1.5 ml-auto">
          {touchMode && (
            <button
              type="button"
              onClick={toggleTouch}
              aria-pressed={touchActive}
              className={`${controlBtnClass} ${
                touchActive ? "!border-emerald-400/50 !bg-emerald-500/20 !text-emerald-100" : ""
              }`}
            >
              <Hand className="w-4 h-4" />
              <span>{touchActive ? "Giro táctil activo" : "Activar giro táctil"}</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => handleZoom(0.84)}
            aria-label="Acercar modelo"
            title="Acercar"
            className={controlBtnClass}
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleZoom(1.18)}
            aria-label="Alejar modelo"
            title="Alejar"
            className={controlBtnClass}
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
