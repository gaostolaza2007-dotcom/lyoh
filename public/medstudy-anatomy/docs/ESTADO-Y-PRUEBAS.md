# Estado de la entrega y pruebas

Entrega local del 11 de octubre de 2026. **Demo funcional; variantes anatómicas parciales.** Cinco GLB reales, cinco fuentes Blender, configuración, procedimiento reproducible, licencias y capturas. No se publicó ni se modificó MedStudy.

## Regiones

| Región | Estado entregado | Límite |
|---|---|---|
| Piel | Disponible en ambas bases; selección y resaltado global | Superficie externa |
| Boca | Marcador, selección independiente, acercamiento y resaltado | Labios y abertura externa; sin cavidad oral ni mucosa separada |
| Nariz | Marcador, selección independiente, acercamiento y resaltado | Nariz externa; sin cavidades nasales internas |
| Intestino delgado | Duodeno, yeyuno e íleon; vista interna y resaltado | Referencia BodyParts3D; encaje corporal orientativo |
| Colon | Ascendente, transverso, descendente y sigmoide; vista interna | Estas cuatro porciones; no se declara entregado todo el intestino grueso |
| Vulva | Pendiente; entrada propia en la lista | Sin malla ni marcador ficticio |
| Vagina | Pendiente; entrada distinta de vulva | Sin canal vaginal modelado |
| Pene | Pendiente en la variante masculina | Falta la superficie externa completa |
| Glande | Malla real, ampliada y seleccionable | Detalle aislado; no se une al cuerpo ni completa el pene |

Las dos bases son reconocibles y continuas. Conservan las proporciones de sus recursos originales. Los mismos órganos de referencia se muestran en ambas: no son dos anatomías internas específicas por sexo. El ajuste de unidades, posición y proporciones fue inspeccionado visualmente; **no tiene validación médica**.

Los paneles muestran únicamente el nombre, alcance del recurso y **“Contenido de microbiota en preparación”**. No se inventaron fichas, microorganismos ni referencias médicas. Los marcadores señalan regiones de exploración.

## Archivos y rendimiento

| GLB | Bytes exactos | MB decimales | Mallas | Triángulos |
|---|---:|---:|---:|---:|
| `body-female.glb` | 1 560 108 | 1,560 | 3 | 86 856 |
| `body-male.glb` | 1 560 056 | 1,560 | 3 | 86 856 |
| `small-intestine.glb` | 307 304 | 0,307 | 3 | 16 058 |
| `colon.glb` | 1 125 364 | 1,125 | 4 | 62 304 |
| `glans-detail.glb` | 26 260 | 0,026 | 1 | 1 391 |

Total GLB: **4 579 092 bytes**. El inventario `../ARCHIVOS.json` registra el peso y SHA-256 de cada archivo de la entrega; `provenance.json` también fija las descargas de origen y la revisión de Z-Anatomy.

Sin texturas externas, Draco ni decodificadores adicionales. Bases evaluadas a nivel 1 de multirresolución; intestino de la distribución reducida oficial; renderizado bajo demanda y densidad de píxel limitada a 1,75. La base alternativa y las piezas internas/detalles se solicitan al necesitarlas y se conservan en caché durante la sesión. Esto está implementado y revisado en el código; **no se midieron FPS, memoria ni tiempos con red lenta o teléfonos de gama baja**.

## Pruebas ejecutadas

Entorno: Windows, Blender 5.2.1 LTS, Node.js 24.19.0, Three.js 0.180.0 y navegador Chromium integrado. Comprobación de escritorio a 1440 × 1000 y vista móvil a 390 × 844 píxeles. La vista móvil es un tamaño de navegador, no una prueba en dispositivo físico.

| Comprobación | Resultado observado |
|---|---|
| Khronos glTF Validator 2.0.0-dev.3.10 | Cinco GLB: **0 errores, 0 advertencias**, sin recursos externos ausentes. Informe: `gltf-validation.json`. |
| Reimportación de los cinco GLB en Blender | Nombres, materiales, coordenadas finitas, escala y orientación conservados. Cajas envolventes comparadas con tolerancia de 0,01 mm. Informe: `blender-reimport.json`. Esto verifica la exportación, no la precisión anatómica. |
| Ambas variantes | Cambio femenina/masculina operativo, con listas correspondientes y aviso de base parcial. |
| Selección por lista y marcadores | Piel, boca, nariz, intestino, colon y glande responden. Boca/nariz y colon/intestino se distinguen y resaltan por separado. |
| Estructuras pendientes | Vulva, vagina y pene muestran su panel independiente con estado pendiente y botón de centrado desactivado. |
| Cámaras y teclado | Frente, espalda, restablecimiento, selección mediante Enter, giro con flechas y zoom con `+` comprobados. Vistas ampliadas de rostro, intestino y glande inspeccionadas; cuerpo completo recuperable. |
| Escritorio y móvil | Panel lateral e inferior respectivamente. Se corrigió la superposición móvil del panel sobre el detalle; el rostro queda visible. Sin desbordamiento horizontal en la vista móvil comprobada. |
| Sin WebGL | Escenario controlado `tests/no-webgl.html`: mensaje visible; selección de colon y panel disponibles; centrado, giro frontal/posterior y zoom desactivados. |
| Archivo GLB no disponible | `tests/model-error.html` simula 404 de la base femenina. Mensaje visible, lista y panel operativos; cambio a masculina recupera el visor. |
| Movimiento reducido | `tests/reduced-motion.html` fuerza la preferencia solo en esa página; selección de boca y su vista final comprobadas. El código omite la interpolación. No se cambió la preferencia del sistema ni se hizo medición temporal cuadro a cuadro. |
| Conexión con tarjetas | `tests/embed.html`: botón de la página contenedora selecciona `colon`; recibe `colon · female · available` y el iframe muestra su región. |
| Errores del navegador | Sin errores ni advertencias observados en los recorridos normales consultados. Los escenarios de fallo generan los avisos esperados deliberadamente. |

La comprobación final de archivos y configuración consta en `static-checks.json`. Los scripts para repetir validación/reimportación se incluyen en `tests/` y se explican en `REPRODUCIR.md`.

## Lo que queda pendiente

- Conseguir e inspeccionar modelos específicos de vulva, canal vaginal y superficie externa completa del pene, con licencia y créditos verificables. Las colecciones femeninas consultadas de Z-Anatomy están vacías. No se fabricaron sustitutos.
- Revisión anatómica por una persona cualificada y ajuste de registro entre fuentes antes de describirlo como atlas validado.
- Compilar y probar el adaptador `integration/MedStudyAnatomy.tsx` dentro del Next.js real. El puente independiente sí se probó; el repositorio de MedStudy no se tocó.
- Pruebas en teléfonos físicos, gestos multitáctiles/pellizco, Safari, Firefox, lector de pantalla y hardware de menor capacidad. OrbitControls incorpora interacción táctil, pero no se presenta como probada en un teléfono real.
- Comprobación de pérdida y restauración de contexto WebGL durante una sesión; existe mensaje de pérdida de contexto, pero esa situación concreta no se forzó. No hay restauración automática prometida.

## Capturas reales

`../captures/` contiene las vistas de cuerpo completo, posterior, nariz, intestino, colon, glande aislado, boca móvil, fallos controlados y puente de integración. Son capturas del navegador usando estos GLB, no imágenes generadas que sustituyan un modelo. Para ver el movimiento y cambiar regiones, iniciar la demo siguiendo `../INICIAR.md`.
