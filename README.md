# PixEmoji Studio ✨🎨

Suite gráfica web construida con **Astro**, **Vue 3**, **Konva.js** y **Tailwind CSS v4** para exportar emojis en alta fidelidad y diseñar composiciones gráficas, stickers troquelados, memes multicapa y fondos de tendencia listos para redes sociales.

## Arquitectura Modular (Anti-God Files)

El proyecto sigue un estricto patrón de desarrollo desacoplado donde los componentes se mantienen enfocados, legibles y pequeños (<250 líneas) y la lógica de negocio vive en composables reutilizables. Consulta [DEVELOPMENT_GUIDELINES.md](./DEVELOPMENT_GUIDELINES.md) para más detalles.

```text
pixemoji/
├── src/
│   ├── composables/                 # Lógica de negocio y Canvas desacoplada
│   │   ├── useKonvaStage.ts         # Montaje del Stage, Layer, Transformer, modos de fondo y degradados
│   │   ├── useKonvaLayers.ts        # Inserción de nodos, orden de capas, patrón de emojis y clonación
│   │   ├── useKonvaEffects.ts       # Efecto sticker troquelado, resplandor neón, rotación, flip y centrado
│   │   ├── useKonvaTemplates.ts     # Biblioteca de plantillas 1-clic (Meme, Versus, Sticker, Wallpaper)
│   │   ├── useHistoryUndo.ts        # Pila de historial Deshacer / Rehacer (Ctrl+Z / Ctrl+Y)
│   │   ├── useCanvasExport.ts       # Ocultado de controles, descarga PNG 1x/2x y portapapeles
│   │   └── useSocialPresets.ts      # Catálogo de ratios para redes sociales (base 512px / HD 1024px)
│   │
│   ├── components/
│   │   ├── canvas/                  # Componentes reutilizables del lienzo
│   │   │   ├── KonvaStage.vue       # Contenedor del lienzo con fondo de ajedrez
│   │   │   └── CanvasToolbar.vue    # Barra de acción rápida (Sticker, Glow, Flip, Bloqueo, Duplicar, Borrar)
│   │   │
│   │   ├── common/                  # Componentes transversales
│   │   │   ├── ExportCard.vue       # Tarjeta de selección de resolución y botones de exportación
│   │   │   └── EmojiPickerModal.vue # Envoltorio reactivo del web component emoji-picker
│   │   │
│   │   ├── studio/                  # Herramientas modulares del editor
│   │   │   ├── TemplatesTool.vue    # Plantillas de 1-clic (Meme, Versus, Sticker Showcase, Wallpaper)
│   │   │   ├── FormatSelector.vue   # Presets de redes sociales (1:1, 4:5, 9:16, 16:9, etc.)
│   │   │   ├── TextTool.vue         # Formulario de textos meme, fuentes y contornos
│   │   │   ├── EmojiTool.vue        # Presets rápidos y toggle del buscador de emojis
│   │   │   ├── EffectsTool.vue      # Efecto sticker troquelado, paleta glow neón, flip y centrado
│   │   │   ├── ImageTool.vue        # Carga de fotos locales y URLs
│   │   │   ├── BackgroundTool.vue   # Transparencia, colores sólidos, 9 degradados y patrones de emojis
│   │   │   └── LayersPanel.vue      # Gestión de capas con bloqueo (Lock), duplicación y reordenamiento
│   │   │
│   │   ├── EmojiExporterView.vue    # Vista ensambladora de la ruta Home
│   │   ├── MemeStudioView.vue       # Vista ensambladora de la ruta Meme Studio
│   │   ├── Navbar.astro             # Barra de navegación global
│   │   └── icons.ts                 # Catálogo de emojis predeterminados
│   │
│   ├── pages/
│   │   ├── index.astro              # Ruta / (Exportador Emoji)
│   │   └── meme.astro               # Ruta /meme (Meme Studio)
│   └── styles/
│       └── global.css               # Estilos base, fuentes meme y scrollbars
├── astro.config.mjs
└── package.json
```

## Rutas y Funcionalidades

### 1. Ruta Principal: Exportador de Emojis (`/`)
- 🎯 **Lienzo interactivo de 250 &times; 250 px**: Posiciona, rota y escala el emoji libremente.
- 🔍 **Selector Unicode completo**: Categorías, búsqueda y catálogo rápido.
- 📐 **Herramientas de alineación**: Centrado automático, ajuste y reseteo.
- 📏 **Resoluciones optimizadas**: `256px` (Sticker), `512px` (HD Slack), `1024px` (Feed/Avatar), `2048px` (Ultra HD).
- ⚡ **Descarga transparente y portapapeles**: PNG con canal alfa 100% transparente o copiado directo al portapapeles (`navigator.clipboard.write`).

### 2. Ruta Pro: Meme & Sticker Studio (`/meme`)
- 📐 **Presets de Redes Sociales (Base 512px & HD 1024px)**:
  - 🟦 **1:1 Cuadrado** (`512x512` &rarr; `1024x1024` HD): Instagram Feed, Facebook Post, Avatares.
  - 📱 **4:5 Retrato Feed** (`512x640` &rarr; `1024x1280` HD): Máxima superficie en feed de Instagram.
  - 🎬 **9:16 Vertical Stories** (`512x910` &rarr; `1024x1820` HD): Stories, Reels, TikTok.
  - 🖥️ **16:9 Panorámico** (`512x288` &rarr; `1024x576` HD): YouTube, X/Twitter Landscape.
  - 🔗 **1.91:1 Banner / Link** (`512x268` &rarr; `1200x628` HD): Open Graph y banners.
  - 💬 **1:1 Sticker Compacto** (`384x384` &rarr; `512x512`): Stickers de WhatsApp, Discord y Telegram.
- ✨ **Modificadores Visuales (Efectos)**:
  - **Efecto Sticker / Troquelado:** Borde blanco grueso configurable (`4px` a `24px`) con sombra suave (*drop shadow*) para dar aspecto de pegatina física de vinilo.
  - **Resplandor Neón (Glow):** Paleta rápida (Rosa Neón, Cyan Cyber, Oro Solar, Verde Matrix, Sombra Suave) con ajuste de desenfoque.
  - **Orientación & Reflejo:** Giro horizontal (`Flip H`), vertical (`Flip V`), rotación de 90° y centrado automático con 1 clic.
- 📚 **Gestión Avanzada de Capas**:
  - **Bloqueo (Lock 🔒):** Congela cualquier capa (fondos, imágenes, textos) para que no se muevan por accidente mientras arrastras emojis.
  - **Duplicación rápida:** Clona cualquier elemento seleccionado en 1 clic.
  - **Reordenamiento visual:** Sube o baja capas visualmente o llévalas directo al frente/fondo.
- 🎨 **Fondos Creativos**:
  - **Fondo Transparente:** PNG sin fondo con cuadrícula de ajedrez visible.
  - **9 Degradados de Tendencia:** Instagram Sunset, Pastel Peach, Cyberpunk Cyan, Ultra Violet, Fresh Mint, Cotton Candy, Ocean Drive, Warm Flame, Midnight Carbon.
  - **Patrón de Emojis (Wallpaper):** Llena el fondo en cuadrícula con tu emoji favorito en marca de agua suave.
- 📋 **Biblioteca de Plantillas Rápidas (1-Clic)**:
  - **Meme Clásico:** Texto superior de impacto, emoji central gigante de reacción y remate.
  - **Versus (VS):** Dos emojis enfrentados (uno reflejado horizontalmente) con insignia "VS" central.
  - **Sticker Showcase:** Fondo oscuro con emoji troquelado en blanco y resplandor neón.
  - **Wallpaper Stories:** Formato vertical 9:16 con patrón repetido y sticker destacado.
- ⌨️ **Atajos de Teclado y UX**:
  - `Supr` o `Backspace`: Elimina el elemento seleccionado.
  - `Ctrl + Z` / `Cmd + Z`: Deshacer.
  - `Ctrl + Y` / `Ctrl + Shift + Z`: Rehacer.
  - Botones visuales de Deshacer/Rehacer en la barra superior del editor.
  - Botón **"Copiar al portapapeles"** con feedback instantáneo.

## Desarrollo Local

```bash
# Iniciar servidor de desarrollo
pnpm dev
```
