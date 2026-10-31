# Reglas de Desarrollo y Directrices para Claude / Agentes

Consulta obligatoriamente el documento completo de arquitectura: [DEVELOPMENT_GUIDELINES.md](./DEVELOPMENT_GUIDELINES.md).

## Principios de Desarrollo (Anti-God Files)

1. **Sin Archivos Dios (Pragmatismo):** Evitar archivos dios en la medida de lo posible. No obsesionarse con límites arbitrarios de líneas (un componente puede tener más de 500 líneas si contiene pura lógica propia, cohesiva y necesaria). Usar componentes y composables como herramientas útiles de modularidad y reutilización para mantener el código claro y mantenible, evitando sobre-abstracciones vacías o innecesarias.
2. **Modularidad y Separación:**
   - La lógica de Konva, estado de capas, exportación y presets debe vivir en **Composables** (`src/composables/`).
   - Los componentes de interfaz se agrupan en subcarpetas por responsabilidad (`src/components/canvas/`, `src/components/studio/`, `src/components/common/`).
   - Los archivos sueltos en `src/components/` solo deben ser vistas ensambladoras o elementos globales (`Navbar.astro`).
3. **Reutilización:** Si un bloque visual o lógica se usa en más de una vista (como el lienzo de Konva o la tarjeta de exportación), se encapsula y reutiliza.
4. **Legibilidad:** Priorizar claridad y responsabilidad única sobre micro-optimizaciones prematuras.

## Development

When starting the dev server, use background mode:

```bash
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Restricciones Obligatorias del Agente

- **PROHIBIDO exportar desde bloques Vue (`<script setup>` o `<script>`):** NUNCA usar `export const`, `export type`, `export interface` o `export function` dentro de componentes `.vue`. Si se necesita exportar un tipo, interfaz, constante o utilidad, DEBE crearse en un archivo `.ts` dedicado (`src/types/`, `src/utils/`, o composables) e importarse. Los exports en componentes `.vue` provocan errores de compilación con el compilador de Astro y Vue.
- **NO ejecutar builds (`npm run build` / `astro build`):** No compilar el proyecto para producción de manera automática. Confiar en el servidor de desarrollo (`astro dev`).
- **NO usar herramientas de navegador / browser subagent:** No intentar abrir el navegador con `open_browser_url` ni lanzar subagentes de navegador (`browser_subagent`). Las pruebas y validaciones visuales las realiza el usuario directamente en su navegador.

## Documentation

Full documentation: https://docs.astro.build
