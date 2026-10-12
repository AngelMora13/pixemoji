import type { APIRoute } from "astro";
import { ROUTES } from "@/utils/constant";
import { SITE_URL, formatUrl } from "@/utils/seo";

export const GET: APIRoute = ({ site }) => {
  const base = site ? site.origin : SITE_URL;
  const today = new Date().toISOString().split("T")[0];

  const publicRoutes = Object.values(ROUTES).filter((route) => !route.noIndex);

  const xmlUrls = publicRoutes
    .map((route) => {
      const loc = formatUrl(route.path, base);
      return `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq || "monthly"}</changefreq>
    <priority>${route.priority !== undefined ? route.priority.toFixed(1) : "0.5"}</priority>
  </url>`;
    })
    .join("\n");

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlUrls}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
};
