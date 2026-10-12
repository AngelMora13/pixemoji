import type { APIRoute } from "astro";
import { SITE_URL } from "@/utils/constant";

export const GET: APIRoute = ({ site }) => {
  const base = site ? site.origin : SITE_URL;

  const content = `User-agent: *
Allow: /
Disallow: /404

# Sitemaps y LLM
Sitemap: ${base}/sitemap.xml
`;

  return new Response(content.trim() + "\n", {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
};
