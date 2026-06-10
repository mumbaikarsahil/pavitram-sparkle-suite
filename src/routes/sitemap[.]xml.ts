import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = "";
const STATIC = [
  "/", "/collections", "/stores", "/cart", "/wishlist", "/account", "/auth", "/search",
  "/category/rings", "/category/earrings", "/category/necklaces-pendants",
  "/category/bracelets-bangles", "/category/mangalsutras", "/category/solitaires",
  "/category/silver-jewellery", "/category/gifting",
  "/policy/privacy-policy", "/policy/terms", "/policy/shipping-policy",
  "/policy/returns-policy", "/policy/cancellation-policy", "/policy/cookie-policy",
  "/policy/grievance-policy", "/policy/contact", "/policy/about", "/policy/faqs",
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const urls = STATIC.map((p) => `  <url><loc>${BASE_URL}${p}</loc><changefreq>weekly</changefreq></url>`).join("\n");
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
        return new Response(xml, { headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" } });
      },
    },
  },
});
