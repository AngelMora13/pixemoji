# Reglas de Desarrollo y Arquitectura: PixEmoji

Este documento establece las **reglas obligatorias de desarrollo** para el proyecto. El objetivo primordial es mantener una base de código **legible, desacoplada y mantenible**, priorizando la separación de responsabilidades y la reutilización por encima de la micro-optimización técnica.

---

## 1. Regla de Oro: Prohibidos los "Archivos Dios" (Anti-God Files)

- Ningún componente `.vue` o archivo `.ts` debe superar las **250 - 300 líneas**.
- Si un componente maneja al mismo tiempo: UI de herramientas, manipulación de lienzo, gestión de capas, atajos de teclado y exportación, **está violando la separación de responsabilidades** y debe fragmentarse.
- Se busca un código **fácil de leer y navegar**, donde cada pieza tenga un propósito concreto.

---

## 2. Los Tres Pilares de Organización

### Pilar A: Componentes con Responsabilidad Única y Reutilizables
La carpeta `src/components/` debe estructurarse por dominios y niveles de abstracción:

```text
src/components/
├── common/                  # Componentes reutilizables transversales
│   ├── ExportCard.vue       # Tarjeta de exportación (resolución, descarga y portapapeles)
│   ├── ColorPicker.vue      # Selector de color y paleta rápida
│   └── EmojiPickerModal.vue # Envoltorio del web component emoji-picker
│
├── canvas/                  # Componentes específicos del lienzo gráfico
│   ├── KonvaStage.vue       # Montaje del contenedor del lienzo y fondo ajedrez
│   └── CanvasToolbar.vue    # Barra de acción rápida contextual del objeto seleccionado
│
├── studio/                  # Herramientas modulares del editor de memes / stickers
│   ├── FormatSelector.vue   # Presets de redes sociales (1:1, 9:16, 4:5, 16:9, etc.)
│   ├── LayersPanel.vue      # Lista visual de capas con reordenamiento arriba/abajo
│   ├── TextTool.vue         # Formulario de texto, fuentes meme, color y contorno
│   ├── EmojiTool.vue        # Presets rápidos y disparador del buscador de emojis
│   ├── ImageTool.vue        # Carga de imágenes locales y por URL
│   └── BackgroundTool.vue   # Controles de transparencia y color de fondo
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
├── useKonvaStage.ts      # Inicialización del Stage, Layer, Transformer y redimensionamiento
├── useKonvaLayers.ts     # Lista de capas reactiva, inserción (emoji, texto, imagen) y orden (arriba/abajo)
├── useCanvasExport.ts    # Descarga PNG (1x/2x), copiado al portapapeles y ocultado del transformer
└── useSocialPresets.ts   # Catálogo de ratios de redes sociales (base 512px / HD 1024px)
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

## 3. Checklist para Nuevos Desarrollos

Antes de dar por completado un cambio o nueva funcionalidad, verifica:
- [ ] ¿El archivo tiene menos de 250 líneas?
- [ ] ¿La lógica de canvas está dentro de un composable en `src/composables/`?
- [ ] ¿Los controles o paneles tienen su propio archivo en `src/components/studio/` o `src/components/common/`?
- [ ] ¿El código es legible para otro desarrollador sin requerir explicaciones complejas?
