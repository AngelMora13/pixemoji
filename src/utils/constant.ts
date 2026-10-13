export const SERVICE_NAME = "PixEmoji";
export const DOMAIN_NAME = "pixemoji.com";
export const SITE_URL = `https://${DOMAIN_NAME}`;

export const TAGLINE_ES = "Exportador de Emojis a PNG Transparente & Meme Studio";
export const TAGLINE_EN = "Transparent PNG Emoji Exporter & Meme Studio";

export const DEFAULT_DESCRIPTION_ES =
  "Convierte cualquier emoji en imagen PNG transparente, ajusta su tamaño y calidad, o combina texto e imágenes para crear tus propios stickers y memes.";
export const DEFAULT_DESCRIPTION_EN =
  "Export any emoji to high-resolution transparent PNG (256px to 2048px) and craft die-cut stickers, memes, and graphic compositions.";

export const TERMS_LAST_UPDATED_ES = "9 de octubre de 2026";
export const TERMS_LAST_UPDATED_EN = "October 9, 2026";
export const PRIVACY_LAST_UPDATED_ES = "9 de octubre de 2026";
export const PRIVACY_LAST_UPDATED_EN = "October 9, 2026";

export const SUPPORT_EMAIL = `support@${DOMAIN_NAME}`;
export const NOTIFY_EMAIL = `notify@${DOMAIN_NAME}`;
export const NOTIFY_FROM = `${SERVICE_NAME} Notifications <${NOTIFY_EMAIL}>`;
export const SUPPORT_FROM = `${SERVICE_NAME} Support <${SUPPORT_EMAIL}>`;
export const REPLY_TO = SUPPORT_EMAIL;

export const GITHUB_URL = "https://github.com/AngelMora13/pixemoji";

export interface RouteMetadata {
  path: string;
  title: string;
  description: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: number;
  noIndex?: boolean;
}

export const ROUTES: Record<string, RouteMetadata> = {
  home: {
    path: "/",
    title: "PixEmoji — Exportador de Emojis",
    description:
      "Exporta cualquier emoji a imagen PNG en alta resolución (256px a 2048px) con fondo transparente y posicionamiento interactivo sobre lienzo.",
    changefreq: "weekly",
    priority: 1.0,
    noIndex: false,
  },
  meme: {
    path: "/meme",
    title: "Meme & Sticker Studio — PixEmoji",
    description:
      "Crea memes, stickers e imágenes personalizadas combinando emojis, textos tipográficos con contorno, fotos y fondos transparentes o degradados.",
    changefreq: "weekly",
    priority: 0.9,
    noIndex: false,
  },
  terms: {
    path: "/terminos-condiciones",
    title: "Términos y Condiciones de Uso — PixEmoji",
    description:
      "Términos y condiciones legales para el uso de PixEmoji y sus herramientas de edición y exportación gráfica.",
    changefreq: "monthly",
    priority: 0.3,
    noIndex: false,
  },
  privacy: {
    path: "/politicas-privacidad",
    title: "Política de Privacidad — PixEmoji",
    description:
      "Conoce cómo PixEmoji protege tu privacidad mediante procesamiento 100% local en tu navegador sin recopilar tus creaciones ni datos personales.",
    changefreq: "monthly",
    priority: 0.3,
    noIndex: false,
  },
  notFound: {
    path: "/404",
    title: "404 — Página no encontrada | PixEmoji",
    description: "La página que buscas no existe o ha sido movida.",
    noIndex: true,
  },
} as const;

export type RouteKey = keyof typeof ROUTES;

/**
 * Detecta el tipo de página según la ruta para seleccionar esquemas y metadatos SEO adecuados
 */
export function getPageType(path: string): RouteKey {
  const clean = path.replace(/\/+$/, "") || "/";
  if (clean === "/meme") return "meme";
  if (clean.includes("term")) return "terms";
  if (clean.includes("priva")) return "privacy";
  if (clean.includes("404")) return "notFound";
  return "home";
}