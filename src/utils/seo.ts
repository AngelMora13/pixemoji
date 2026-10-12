import {
  SERVICE_NAME,
  DOMAIN_NAME,
  SITE_URL,
  SUPPORT_EMAIL,
  ROUTES,
  getPageType,
} from "./constant";

export { SITE_URL };

export interface SEOProps {
  title: string;
  description: string;
  lang?: "es" | "en" | string;
  canonicalUrl?: string;
  ogImage?: string;
  ogImageAlt?: string;
  ogType?: "website" | "article";
  noIndex?: boolean;
  noFollow?: boolean;
  dateModified?: string;
  schema?: Record<string, any> | Record<string, any>[];
}

/**
 * Normaliza una URL base eliminando barras finales
 */
export function getBaseUrl(siteUrl: string = SITE_URL): string {
  return siteUrl.replace(/\/+$/, "");
}

/**
 * Normaliza una ruta y genera la URL canónica absoluta:
 * - Para la raíz ("" o "/"): devuelve "https://dominio/" (con barra final)
 * - Para subrutas ("/meme", "/terms", etc.): devuelve "https://dominio/ruta" (sin barra final)
 */
export function formatUrl(pathname: string, siteUrl: string = SITE_URL): string {
  const base = getBaseUrl(siteUrl);
  const cleanPath = pathname.replace(/\/+$/, "");
  if (!cleanPath || cleanPath === "") {
    return `${base}/`;
  }
  return `${base}${cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`}`;
}

/**
 * Normaliza una ruta y genera la URL canónica absoluta
 */
export function getCanonicalUrl(pathname: string, siteUrl: string = SITE_URL): string {
  return formatUrl(pathname, siteUrl);
}

/**
 * Obtiene las URLs alternativas de idioma (hreflang) para una ruta dada.
 */
export function getAlternateUrls(pathname: string, siteUrl: string = SITE_URL) {
  const cleanPath = pathname.replace(/\/+$/, "") || "/";
  const canonical = formatUrl(cleanPath, siteUrl);

  return [
    { lang: "es", href: canonical },
    { lang: "x-default", href: canonical },
  ];
}

/**
 * Genera el Schema.org JSON-LD para la página de inicio (Exportador de Emojis)
 */
export function getHomeSchema(
  lang: string = "es",
  description: string,
  siteUrl: string = SITE_URL
) {
  const isEs = lang === "es";
  const base = getBaseUrl(siteUrl);
  const rootUrl = `${base}/`;
  const pageTitle = isEs
    ? `${SERVICE_NAME} — Exportador de Emojis a PNG Transparente`
    : `${SERVICE_NAME} — Transparent PNG Emoji Exporter`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${base}/#organization`,
        name: SERVICE_NAME,
        url: rootUrl,
        logo: {
          "@type": "ImageObject",
          "@id": `${base}/#logo`,
          url: `${base}/favicon.svg`,
          caption: SERVICE_NAME,
        },
        contactPoint: [
          {
            "@type": "ContactPoint",
            email: SUPPORT_EMAIL,
            contactType: "customer support",
            availableLanguage: ["Spanish", "English"],
          },
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${base}/#website`,
        url: rootUrl,
        name: SERVICE_NAME,
        description: description,
        inLanguage: ["es-ES", "en-US"],
        publisher: {
          "@id": `${base}/#organization`,
        },
      },
      {
        "@type": "WebPage",
        "@id": `${rootUrl}#webpage`,
        url: rootUrl,
        name: pageTitle,
        description: description,
        inLanguage: isEs ? "es-ES" : "en-US",
        isPartOf: {
          "@id": `${base}/#website`,
        },
        about: {
          "@id": `${base}/#software`,
        },
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${base}/#software`,
        name: `${SERVICE_NAME} Emoji Exporter`,
        url: rootUrl,
        applicationCategory: "MultimediaApplication",
        operatingSystem: "All (Web Browser)",
        description: description,
        inLanguage: isEs ? "es-ES" : "en-US",
        publisher: {
          "@id": `${base}/#organization`,
        },
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
        },
        featureList: isEs
          ? "Exportación de emojis a PNG transparente de 256px a 2048px, selector Unicode completo, lienzo interactivo y copiado directo al portapapeles"
          : "Transparent PNG emoji export from 256px to 2048px, complete Unicode selector, interactive canvas, and one-click clipboard copy",
      },
    ],
  };
}

/**
 * Genera el Schema.org JSON-LD para Meme & Sticker Studio
 */
export function getStudioSchema(
  lang: string = "es",
  description: string,
  siteUrl: string = SITE_URL
) {
  const isEs = lang === "es";
  const base = getBaseUrl(siteUrl);
  const studioUrl = `${base}/meme`;
  const pageTitle = isEs
    ? `Meme & Sticker Studio — ${SERVICE_NAME}`
    : `Meme & Sticker Studio — ${SERVICE_NAME}`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${studioUrl}#webpage`,
        url: studioUrl,
        name: pageTitle,
        description: description,
        inLanguage: isEs ? "es-ES" : "en-US",
        isPartOf: {
          "@type": "WebSite",
          "@id": `${base}/#website`,
          url: `${base}/`,
          name: SERVICE_NAME,
        },
        about: {
          "@id": `${studioUrl}#studio-software`,
        },
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${studioUrl}#studio-software`,
        name: `${SERVICE_NAME} Meme & Sticker Studio`,
        url: studioUrl,
        applicationCategory: "DesignApplication",
        operatingSystem: "All (Web Browser)",
        description: description,
        inLanguage: isEs ? "es-ES" : "en-US",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
        },
        featureList: isEs
          ? "Editor gráfico multicapa con Konva.js, efecto troquelado de sticker con borde y sombra, resplandor neón, rotación, textos estilo meme y presets de redes sociales"
          : "Multi-layer graphic editor with Konva.js, die-cut sticker effect with border and shadow, neon glow, rotation, meme typography, and social media presets",
      },
    ],
  };
}

/**
 * Genera el Schema.org JSON-LD para páginas legales (Términos / Privacidad)
 */
export function getLegalSchema({
  title,
  description,
  lang = "es",
  pathname,
  dateModified,
  siteUrl = SITE_URL,
}: {
  title: string;
  description: string;
  lang?: string;
  pathname: string;
  dateModified?: string;
  siteUrl?: string;
}) {
  const isEs = lang === "es";
  const base = getBaseUrl(siteUrl);
  const rootUrl = `${base}/`;
  const canonicalUrl = formatUrl(pathname, siteUrl);
  const pageType = getPageType(pathname);
  const isTerms = pageType === "terms";

  const legalTopic = isTerms
    ? isEs
      ? "Términos y Condiciones de Uso del Servicio"
      : "Terms and Conditions of Service"
    : isEs
      ? "Política de Privacidad y Protección de Datos"
      : "Privacy Policy and Data Protection";

  const homeTitle = isEs ? "Inicio" : "Home";

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: title,
        description: description,
        inLanguage: isEs ? "es-ES" : "en-US",
        dateModified: dateModified || "2026-10-09",
        isPartOf: {
          "@type": "WebSite",
          "@id": `${base}/#website`,
          url: rootUrl,
          name: SERVICE_NAME,
        },
        about: {
          "@type": "Thing",
          name: legalTopic,
        },
        publisher: {
          "@type": "Organization",
          "@id": `${base}/#organization`,
          name: SERVICE_NAME,
          url: rootUrl,
          logo: {
            "@type": "ImageObject",
            "@id": `${base}/#logo`,
            url: `${base}/favicon.svg`,
          },
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${canonicalUrl}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: homeTitle,
            item: rootUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: title,
            item: canonicalUrl,
          },
        ],
      },
    ],
  };
}

/**
 * Obtiene el Schema adecuado según la ruta
 */
export function getAutoSchema({
  pathname,
  title,
  description,
  lang = "es",
  dateModified,
  siteUrl = SITE_URL,
}: {
  pathname: string;
  title: string;
  description: string;
  lang?: string;
  dateModified?: string;
  siteUrl?: string;
}) {
  const pageType = getPageType(pathname);

  if (pageType === "home") {
    return getHomeSchema(lang, description, siteUrl);
  }
  if (pageType === "meme") {
    return getStudioSchema(lang, description, siteUrl);
  }
  if (pageType === "terms" || pageType === "privacy") {
    return getLegalSchema({
      title,
      description,
      lang,
      pathname,
      dateModified,
      siteUrl,
    });
  }

  // Schema básico para 404 u otras
  const base = getBaseUrl(siteUrl);
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description: description,
    url: formatUrl(pathname, siteUrl),
    isPartOf: {
      "@type": "WebSite",
      url: `${base}/`,
      name: SERVICE_NAME,
    },
  };
}
