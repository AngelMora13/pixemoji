import type { APIRoute } from "astro";
import { SERVICE_NAME, SITE_URL } from "@/utils/constant";
import { formatUrl } from "@/utils/seo";

export const GET: APIRoute = ({ site }) => {
  const base = site ? site.origin : SITE_URL;

  const content = `# ${SERVICE_NAME}
> Suite gráfica web para exportar emojis a PNG transparente en alta fidelidad y editor visual para memes y stickers troquelados.

## Herramientas y Páginas Principales
- [Exportador de Emojis](${formatUrl("/", base)}): Renderiza y exporta cualquier emoji Unicode a formato PNG transparente con resoluciones desde 256px hasta 2048px (Ultra HD). Permite rotación, escala, centrado interactivo y copiado directo al portapapeles.
- [Meme & Sticker Studio](${formatUrl("/meme", base)}): Editor gráfico multi-capa impulsado por Konva.js para crear memes, stickers con borde troquelado blanco, resplandor neón, rotación, tipografía meme con contorno, fondos degradados y presets para redes sociales (1:1, 4:5, 9:16, 16:9).
- [Términos y Condiciones](${formatUrl("/terminos-condiciones", base)}): Condiciones legales de uso, licencias y derechos de autor.
- [Política de Privacidad](${formatUrl("/politicas-privacidad", base)}): Declaración de privacidad por diseño: procesamiento 100% en cliente (client-side) sin almacenamiento en servidores ni recolección de datos personales.

## Arquitectura y Tecnologías
- Framework: Astro (Static)
- UI y Render: Vue 3 + Konva.js (HTML5 2D Canvas)
- Estilos: Tailwind CSS v4 con variables de diseño personalizadas
- Privacidad: Procesamiento 100% local en el navegador del usuario (sin carga de archivos ni telemetría invasiva)
`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
};
