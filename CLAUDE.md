# Reglas de Desarrollo y Directrices para Claude / Agentes

Consulta obligatoriamente el documento completo de arquitectura: [DEVELOPMENT_GUIDELINES.md](./DEVELOPMENT_GUIDELINES.md).

## Principios de Desarrollo (Anti-God Files)

1. **Sin Archivos Dios:** Ningún componente `.vue` o archivo `.ts` debe superar las 250-300 líneas.
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

- **NO ejecutar builds (`npm run build` / `astro build`):** No compilar el proyecto para producción de manera automática. Confiar en el servidor de desarrollo (`astro dev`).
- **NO usar herramientas de navegador / browser subagent:** No intentar abrir el navegador con `open_browser_url` ni lanzar subagentes de navegador (`browser_subagent`). Las pruebas y validaciones visuales las realiza el usuario directamente en su navegador.

## Documentation

Full documentation: https://docs.astro.build
