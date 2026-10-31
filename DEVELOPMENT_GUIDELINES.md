# Reglas de Desarrollo y Arquitectura: PixEmoji

Este documento establece las **reglas obligatorias de desarrollo** para el proyecto. El objetivo primordial es mantener una base de código **legible, desacoplada y mantenible**, priorizando la separación de responsabilidades y la reutilización por encima de la micro-optimización técnica.

---

## 1. Principio Fundamental: Evitar "Archivos Dios" con Pragmatismo (Anti-God Files)

- **Sin obsesión por límites arbitrarios de líneas:** No existe una cota rígida de 250 - 300 líneas; un componente o archivo puede superar las 500 líneas si alberga pura lógica propia, cohesiva y necesaria (incluso reutilizando).
- **Separación real de responsabilidades:** El objetivo es evitar que un único archivo acumule responsabilidades dispares (por ejemplo: manipular el lienzo Konva, gestionar el catálogo de capas, manejar atajos de teclado y controlar la exportación simultáneamente).
- **Abstracción con sentido y utilidad:** Utilizar componentes (`src/components/`) y composables (`src/composables/`) como recursos para fomentar la modularidad y la reutilización. Se deben evitar sobre-abstracciones vacías o innecesarias (no tiene sentido crear un composable trivial que retorne `{ some: true }` para luego hacer `const some = composable.some`).
- Se busca un código **fácil de leer, navegar y mantener**, donde cada pieza tenga un propósito concreto y justificado.

---

## 2. Los Tres Pilares de Organización

### Pilar A: Componentes con Responsabilidad Única y Reutilizables
La carpeta `src/components/` debe estructurarse por dominios y niveles de abstracción:

```text
src/components/
├── common/                  # Componentes reutilizables transversales
│   ├── SliderControl.vue         # Control deslizador de rango numérico con etiqueta y unidades
│   ├── TransformActionsGrid.vue  # Botonera 4x1 de orientación (reflejar, centrar, rotar)
│   ├── EffectPresetsGrid.vue     # Cuadrícula de presets de efectos rápidos de 1-clic
│   ├── CollapsibleSection.vue    # Tarjeta de propiedad con interruptor On/Off
│   ├── ExportActions.vue         # Botones unificados de descarga PNG y portapapeles
│   ├── BottomSheetModal.vue      # Drawer y hoja inferior táctil para dispositivos móviles
│   ├── ColorPalettePicker.vue    # Selector y paleta flotante de color con guardados
│   ├── ExportModal.vue           # Modal global de exportación PNG con resolución
│   ├── ImageFormatSelector.vue   # Selector unificado de formato de imagen (PNG, WEBP, JPEG)
│   ├── EmojiPickerModal.vue      # Envoltorio del web component emoji-picker
│   ├── EmojiControlsPanel.vue    # Panel de presets de emoji, resolución y alineación
│   ├── EmojiQuickSelector.vue    # Tarjeta unificada de preview y atajos rápidos FIFO para selección de emojis
│   └── CropModal.vue             # Modal interactivo reutilizable de recorte con controles tipo lienzo
│
├── canvas/                  # Componentes específicos del lienzo gráfico
│   ├── KonvaStage.vue       # Montaje del contenedor del lienzo y fondo ajedrez
│   ├── CanvasToolbar.vue    # Barra de acción rápida contextual del objeto seleccionado
│   └── CanvasViewport.vue   # Viewport central (resolución, undo/redo, canvas y zoom)
│
├── studio/                  # Herramientas modulares e inspectores del editor
│   ├── StudioHeader.vue          # Barra superior con selector de ratio y botón de exportar
│   ├── ToolsSidebarContent.vue   # Vista unificada del panel de herramientas y capas (Desktop y Mobile)
│   ├── StudioMobileDrawers.vue   # Drawers móviles inferiores y botones flotantes (FABs)
│   ├── CanvasBottomBar.vue       # Barra inferior de zoom y catálogo flotante de plantillas
│   ├── AddTool.vue               # Inserción rápida de texto, emoji o imagen
│   ├── LayersPanel.vue           # Lista visual de capas con reordenamiento arriba/abajo
│   ├── InspectorPanel.vue        # Panel lateral derecho unificado de propiedades
│   ├── TextInspector.vue         # Inspector de texto con TipTap, sombras y efectos 3D
│   ├── EmojiInspector.vue        # Inspector de emojis y atajos frecuentes
│   ├── ImageInspector.vue        # Inspector de imágenes, reemplazo y filtros
│   ├── CropControls.vue          # Control de recorte no destructivo de dimensiones (Crop)
│   ├── BackgroundTool.vue        # Controles de transparencia, color y degradado de fondo
│   ├── BackgroundPatternControls.vue # Controles avanzados de patrón de emojis (selector, tamaño, separación, distribución)
│   └── TemplatesTool.vue         # Catálogo de plantillas rápidas prediseñadas
│
├── Navbar.astro             # Barra de navegación global
├── EmojiExporterView.vue    # Vista ensambladora de la ruta Home (Exportador)
└── MemeStudioView.vue       # Vista ensambladora de la ruta /meme (Studio)
```

> **Regla de ubicación:**
> - Los archivos sueltos directamente en `src/components/` solo deben ser **vistas ensambladoras** (que unen los subcomponentes) o elementos estructurales globales (`Navbar.astro`).
> - Las piezas individuales van en sus subcarpetas correspondientes (`canvas/`, `studio/`, `common/`).

---

### Pilar B: Lógica de Negocio y Canvas en Composables (`src/composables/`)
La lógica imperativa de Konva.js, el estado reactivo y las operaciones no deben ensuciar el `<script setup>` de los componentes. Se extraen en composables reutilizables:

```text
src/composables/
├── useKonvaStage.ts          # Inicialización del Stage, Layer, Transformer y redimensionamiento
├── useKonvaLayers.ts         # Lista de capas reactiva, inserción (emoji, texto, imagen) y orden (arriba/abajo)
├── useKonvaEmojiFix.ts       # Corrección de cajas delimitadoras, centrado y sombras Skia en fuentes de emojis
├── useKonvaCrop.ts           # Lógica de recorte direccional por clipping en canvas para imágenes y emojis
├── useCropInteraction.ts     # Cálculo de métricas de glifos de emojis e interacción matemática de recorte
├── useCanvasExport.ts        # Descarga PNG (1x/2x), copiado al portapapeles y ocultado del transformer
├── useSocialPresets.ts       # Catálogo de ratios de redes sociales (base 512px / HD 1024px)
├── useCanvasStudioContext.ts # Contexto reactivo unificado (provide/inject) para toda la app
├── useEmojiPattern.ts        # Cálculo geométrico y distribución de patrones de emojis (ordenado, ladrillo, diagonal, disperso)
├── useGlobalEmojiPicker.ts   # Instancia singleton global y asíncrona del selector de emojis compartido
└── useStudioShortcuts.ts     # Atajos globales de teclado (Ctrl+Z, Ctrl+Y, Supr)
```

#### Responsabilidades de cada Composable:
1. **`useKonvaStage`**:
   - Monta el `Konva.Stage` y `Konva.Layer`.
   - Inicializa el `Konva.Transformer` con límites mínimos y colores de marca.
   - Expone `changeDimensions(w, h)` para adaptar el lienzo a los presets.
2. **`useKonvaLayers`**:
   - Mantiene la lista reactiva de capas (`layersList`).
   - Métodos: `addEmoji()`, `addText()`, `addImage()`.
   - Métodos de jerarquía: `bringToFront()`, `bringForward()`, `sendBackward()`, `sendToBack()`.
   - Métodos de manipulación: `duplicateSelected()`, `deleteSelected()`, `clearAll()`.
3. **`useCanvasExport`**:
   - Oculta temporalmente los transformadores de selección antes de la captura.
   - Genera el `toDataURL` aplicando el multiplicador de escala (`1x` o `2x`).
   - Descarga automática con nombre semántico o inyección binaria a `navigator.clipboard`.
4. **`useSocialPresets`**:
   - Centraliza los ratios oficiales (1:1, 4:5, 9:16, 16:9, 1.91:1).
   - Controla el preset activo y las dimensiones base vs. HD.

---

### Pilar C: Reutilización entre Rutas
- El componente `KonvaStage.vue` y el composable `useCanvasExport.ts` deben ser consumidos tanto por la ruta **Home** (`/`) como por la ruta **Studio** (`/meme`).
- Si una funcionalidad (como descargar una imagen o seleccionar un emoji) se repite, **no se duplica código**: se consume el composable o componente común correspondiente.

---

### Pilar D: Cero `export` en Componentes Vue (`.vue`)
- **Regla Estricta:** NUNCA utilizar `export const`, `export type`, `export interface` o `export function` dentro de bloques `<script setup>` o `<script>` en componentes `.vue`.
- **Causa:** Los exports en SFCs (`.vue`) generan errores de compilación con el compilador de Astro y Vite.
- **Solución Obligatoria:** Todo tipo, interfaz, constante, enum o función utilitaria que deba compartirse debe alojarse en un archivo TypeScript dedicado (`src/types/`, `src/utils/` o en `src/composables/`) e importarse desde allí.

---

## 3. Checklist para Nuevos Desarrollos

Antes de dar por completado un cambio o nueva funcionalidad, verifica:
- [ ] ¿El archivo mantiene responsabilidades claras y cohesivas sin convertirse en un archivo dios?
- [ ] ¿Se verificó que ningún componente `.vue` contenga exports (`export type`, `export const`, etc.)?
- [ ] ¿La lógica de canvas está dentro de un composable en `src/composables/`?
- [ ] ¿Los controles o paneles tienen su propio archivo en `src/components/studio/` o `src/components/common/`?
- [ ] ¿El código es legible para otro desarrollador sin requerir explicaciones complejas?
- [ ] ¿Se evitó ejecutar builds innecesarios (`npm run build`) o intentar usar subagentes de navegador?

