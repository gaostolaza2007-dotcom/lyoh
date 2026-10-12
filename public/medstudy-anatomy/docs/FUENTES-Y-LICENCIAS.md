# Fuentes, créditos y licencias

Preparado para MedStudy. Verificación de recursos: 10–11 de octubre de 2026. No se compraron recursos, aceptaron acuerdos ni publicaron archivos en servicios externos.

## Archivos incorporados

| Archivo | Obra y autor | Licencia aplicada |
|---|---|---|
| `body-female.glb`, `body-male.glb` y sus fuentes `.blend` | **Body Female - Realistic / Body Male - Realistic**, Dan Ulrich; distribución Blender Studio y comunidad, Human Base Meshes 1.4.1 | CC0 1.0 |
| `small-intestine.glb` y su fuente `.blend` | **BodyParts3D**, © The Database Center for Life Science (DBCLS); proyecto original de Kousaku Okubo | CC BY 4.0 según la licencia actual del archivo oficial |
| `colon.glb`, `glans-detail.glb` y sus fuentes `.blend` | **Z-Anatomy**, Gauthier Kervyn; derivado de **BodyParts3D**, © DBCLS / Kousaku Okubo | Derivados compartidos bajo CC BY-SA 4.0; se conserva el crédito histórico CC BY-SA 2.1 Japón de BodyParts3D |
| `vendor/three/` | Three.js, sus autores y colaboradores, versión 0.180.0 | MIT; texto incluido en `vendor/three/LICENSE` |

### Blender Human Base Meshes

- [Página oficial y licencia del paquete específico](https://www.blender.org/download/demo-files/).
- [ZIP exacto 1.4.1](https://download.blender.org/demo/asset-bundles/human-base-meshes/human-base-meshes-bundle-v1.4.1.zip).
- [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/).
- La licencia y autor se comprobaron **también dentro del `.blend`**, en los metadatos de las dos colecciones seleccionadas: autor `Dan Ulrich`, licencia `CC0`.
- Se usaron únicamente `GEO-body_female_realistic`, `GEO-body_male_realistic` y sus ojos respectivos. Incluyen cuerpos externos continuos con rostro, boca y nariz superficiales. No incluyen órganos digestivos, canal vaginal ni genitales externos suficientemente definidos para las regiones solicitadas.
- Cambios: evaluación de multirresolución a nivel 1, centrado horizontal a partir de los ojos, apoyo aproximado de los pies en cero, material neutro, supresión de texturas/UV en GLB, nombres descriptivos y exportación glTF con Y hacia arriba.
- El paquete contiene un bloque de texto residual llamado `License` referido al **Rain Rig**. No se incorporó ese rig. El README del paquete y los metadatos específicos de las dos colecciones usadas indican CC0. No se extrapoló la licencia de otras descargas de la misma página.

### BodyParts3D: intestino delgado

- [Descarga oficial](https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html).
- [Condiciones oficiales actuales](https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html), actualizadas el **27 de febrero de 2025**: CC Attribution 4.0 International.
- [ZIP de la distribución 4.0, árbol PART-OF, reducción 99 %](https://dbarchive.biosciencedbc.jp/data/bodyparts3d/LATEST/partof_BP3D_4.0_obj_99.zip).
- [Tabla de elementos](https://dbarchive.biosciencedbc.jp/data/bodyparts3d/LATEST/partof_element_parts.txt).
- [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
- Atribución requerida conservada: **“BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International”.**
- Se comprobaron las tablas y los encabezados individuales de `FJ2573.obj` a `FJ2628.obj`: duodeno, segmentos de yeyuno, segmentos de íleon y unión ileocecal. La unión ileocecal se mantiene en el grupo del íleon, tal como aparece dentro del conjunto oficial de intestino delgado. La tabla incluye también esa pieza al consultar ciego; no se asumió una segmentación histológica exclusiva.
- Los **encabezados históricos de los OBJ** aún dicen CC BY-SA 2.1 Japón. Se conservan en los originales incluidos en `sources/bodyparts3d/`; la aplicación de CC BY 4.0 se basa en el aviso actual del distribuidor oficial, no en eliminar o cambiar esos encabezados.
- Cambios: milímetros a metros; traslación rígida de Blender `(0, +0.100, +0.066)` metros; agrupación por duodeno/yeyuno/íleon; normales suaves; material de identificación; GLB. No se deformaron asas ni se generaron sustitutos geométricos.

### Z-Anatomy: selección limitada

- [Repositorio y créditos completos](https://github.com/Z-Anatomy/Models-of-human-anatomy).
- [Revisión fijada](https://github.com/Z-Anatomy/Models-of-human-anatomy/tree/9de5d6912a1b0df9cab739d57f00e036b0496ddc).
- [ZIP de esa revisión](https://raw.githubusercontent.com/Z-Anatomy/Models-of-human-anatomy/9de5d6912a1b0df9cab739d57f00e036b0496ddc/Z-Anatomy.zip).
- [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) y [aviso histórico CC BY-SA 2.1 Japón](https://creativecommons.org/licenses/by-sa/2.1/jp/).
- Créditos conservados: **“Z-Anatomy — The libre 3D atlas of anatomy — CC BY-SA 4.0”**; **“BodyParts3D — The Database Center for Life Science — CC BY-SA 2.1 Japan”**. Diseño, modificaciones 3D y organización anatómica: Gauthier Kervyn. El código del atlas y sus textos médicos no se incorporaron.
- Objetos utilizados: `Ascending colon`, `Transverse colon`, `Descending colon`, `Sigmoid colon`, `Glans penis`.
- Cambios: extracción de esos cinco objetos, evaluación de modificadores geométricos existentes, recálculo de normales, material neutro/de identificación, nombres estables y exportación GLB. Se conservan las formas y coordenadas fuente. El glande se muestra **aislado**, sin injertarlo sobre la base masculina.
- El atlas incluye créditos de terceros con condiciones diferentes: **Inner Ear / University of Dundee, CC BY-NC-SA 4.0**; **Kidney / Lissie Cowley, CC BY-NC 4.0**; **Cranial Nerves and Foramina / Dundee CAHID, CC BY 4.0**; y material cerebral de University of Washington. **Ninguna de esas piezas se incorporó**. No se declaró toda la colección apta para uso comercial.
- No hay una matriz de autoría por cada cara de las mallas seleccionadas. La procedencia registrada se fundamenta en los nombres de objeto, el bloque de licencia interno y los créditos que publica el atlas; no constituye una auditoría independiente de titularidad.

## Recursos considerados y no utilizados

**MakeHuman / MakeHuman Community.** Se revisaron [la licencia de los activos principales](https://github.com/makehumancommunity/makehuman/blob/master/LICENSE.ASSETS.md), [la aclaración oficial](https://static.makehumancommunity.org/makehuman/faq/are_makehuman_files_free.html) y [el catálogo de paquetes](https://static.makehumancommunity.org/assets/assetpacks.html). Los activos principales se indican como CC0; el catálogo distingue paquetes CC0 y CC BY. No se descargaron ni exportaron personajes de MakeHuman en este trabajo: no se da por verificada la existencia de vulva, vagina o pene externo en un personaje concreto. Se prefirió el cuerpo ya inspeccionado de Blender para mantener una base coherente.

**Z-Anatomy: anatomía genital femenina.** Las colecciones `Vulva'` y `Vagina'` del archivo descargado están vacías. Tener definiciones de esos términos dentro del atlas no prueba que existan mallas. Se dejaron pendientes. Los cuerpos eréctiles se inspeccionaron, pero no se distribuyen ni se usan como sustituto de la superficie externa del pene.

## Uso comercial y redistribución

CC0, CC BY 4.0 y CC BY-SA 4.0 permiten uso comercial cumpliendo sus condiciones. Mantener créditos y enlaces, indicar las modificaciones y conservar CC BY-SA 4.0 para los derivados de Z-Anatomy. La separación de archivos conserva su procedencia; no autoriza a cambiar la licencia del modelo al integrarlo en MedStudy. No se incluye contenido NC ni recursos de pago.

Los GLB no llevan cifrado ni restricciones adicionales de copia. El código de integración no cambia la licencia de los modelos. Las capturas donde aparecen piezas de Z-Anatomy mantienen esos créditos y se distribuyen bajo CC BY-SA 4.0.

Los hashes SHA-256, pesos, revisión de Z-Anatomy y metadatos específicos constan en `provenance.json` y `gltf-validation.json`. Conservar este documento junto con los modelos y mostrar los créditos desde la plataforma final.
