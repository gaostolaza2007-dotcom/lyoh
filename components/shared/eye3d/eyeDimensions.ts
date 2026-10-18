/**
 * DIMENSIONES Y PARÁMETROS BIOMÉTRICOS DE REFERENCIA - OJO HUMANO ADULTO (OD)
 *
 * Referencias principales:
 * - Liou HL, Brennan NA (1997). Anatomically accurate, finite model eye for optical modeling. J Opt Soc Am A.
 * - Kolb H. Facts and Figures concerning the human retina. Webvision, University of Utah.
 * - StatPearls (NCBI Bookshelf): Anatomy, Head and Neck: Eye Cornea, Ciliary Body, Lens, Retina, Optic Nerve.
 *
 * Todas las unidades del modelo están en milímetros (1 unidad Three.js = 1 mm).
 * Sistema de coordenadas:
 *   +Z : Anterior (vértice corneal)
 *   -Z : Posterior (polo posterior / salida del nervio óptico)
 *   +Y : Superior
 *   -Y : Inferior
 *   +X : Nasal (Ojo derecho - OD; hacia la nariz, derecha de la pantalla en vista frontal)
 *   -X : Temporal (Ojo derecho - OD; hacia la sien, izquierda de la pantalla en vista frontal)
 */

export const EYE_DIMENSIONS = {
  // Longitud axial y radios esclerales
  axialLength: 23.95, // Liou & Brennan 1997 (~24 mm promedio)
  globeRadius: 12.0, // Radio esférico de la pared posterior (Liou & Brennan: 12.0 mm)
  scleraThicknessPosterior: 0.9, // 0.9 - 1.0 mm en polo posterior (StatPearls / ARVO)
  scleraThicknessEquator: 0.45, // 0.3 - 0.5 mm en el ecuador
  scleraThicknessLimbus: 0.55, // ~0.5 - 0.6 mm en limbo esclerocorneal

  // Córnea
  corneaRadiusAnt: 7.77, // Radio de curvatura cara anterior (Liou & Brennan 1997)
  corneaRadiusPost: 6.40, // Radio de curvatura cara posterior (Liou & Brennan 1997)
  corneaThicknessCenter: 0.52, // 520-550 µm central (StatPearls / Liou & Brennan: 0.50 mm)
  corneaThicknessPeriphery: 0.68, // Periferia más gruesa (~0.65 - 0.70 mm)
  corneaDiameterHorizontal: 11.7, // Diámetro corneal horizontal "white-to-white" (11.5 - 12.0 mm)
  corneaDiameterVertical: 10.6, // Diámetro vertical anatómico ligeramente menor

  // Cámara anterior y pupila
  anteriorChamberDepth: 3.16, // Profundidad desde endotelio corneal hasta cara anterior de cristalino (Liou & Brennan 1997)
  pupilDiameterDefault: 3.5, // Diámetro pupilar estándar fotópico/mesópico (~3.5 mm)
  pupilDecentrationNasal: 0.5, // Descentramiento fisiológico nasal según Liou & Brennan (0.5 mm)

  // Cristalino
  lensThickness: 4.0, // Espesor anteroposterior no acomodado (Liou & Brennan / StatPearls: 4.0 mm)
  lensDiameterEquatorial: 9.6, // Diámetro ecuatorial adulto (9.0 - 10.0 mm)
  lensRadiusAnt: 12.4, // Radio cara anterior (Liou & Brennan 1997: +12.4 mm)
  lensRadiusPost: 8.1, // Radio cara posterior más convexa (Liou & Brennan 1997: -8.1 mm)

  // Cuerpo ciliar y Zónula
  ciliaryBodyLength: 5.8, // Longitud anteroposterior total (~5.5 - 6.0 mm, StatPearls)
  ciliaryParsPlicataLength: 2.0, // Longitud de pars plicata con procesos ciliares (~2 mm)
  ciliaryParsPlanaLength: 3.8, // Longitud de pars plana hasta ora serrata (~3.8 - 4.0 mm)
  ciliaryProcessCount: 72, // 70 a 80 procesos ciliares radiales
  zonuleFiberBands: 120, // Haces de fibras zonulares (Zónula de Zinn)

  // Capas de la pared posterior (Espesores fisiológicos de referencia)
  choroidThickness: 0.25, // Coroides: ~0.20 - 0.25 mm en polo posterior
  retinaThicknessPosterior: 0.28, // Retina foveal rim / perimacular: ~0.25 - 0.30 mm (Webvision)
  retinaThicknessEquator: 0.16, // Adelgazamiento hacia ecuador: ~0.15 - 0.18 mm
  retinaThicknessOraSerrata: 0.09, // Ora serrata: ~0.08 - 0.10 mm (Webvision)

  // Topografía retiniana (Ojo Derecho OD)
  opticDiscDiameterHoriz: 1.86, // Diámetro horizontal disco óptico (Webvision Kolb: 1.86 mm)
  opticDiscDiameterVert: 1.75, // Diámetro vertical (Webvision Kolb: 1.75 mm)
  opticDiscOffsetNasal: 3.4, // Desplazamiento nasal desde polo posterior (~3.0 - 3.4 mm)
  opticDiscOffsetSuperior: 0.8, // Desplazamiento superior (~0.8 - 1.0 mm)
  opticCupRatio: 0.32, // Relación copa/disco fisiológica (~0.3)

  maculaDiameter: 3.0, // Diámetro área macular (Webvision / Polyak: ~3.0 mm)
  foveaDiameter: 1.5, // Diámetro fóvea central de borde a borde (Webvision: 1.5 mm)
  foveaOffsetTemporal: 1.1, // Fóvea ubicada temporalmente al polo posterior (~1.0 - 1.2 mm temporal, 4.0 mm temporal al disco)
  foveaOffsetInferior: 0.35, // Ligeramente inferior respecto al centro horizontal del disco

  // Nervio óptico retrobulbar
  opticNerveDiameterRetrobulbar: 3.6, // Diámetro retrobulbar con vainas durales (3.5 - 4.0 mm, StatPearls)
  opticNerveVisibleLength: 8.0, // Segmento inicial del trayecto intraorbitario representado
};
