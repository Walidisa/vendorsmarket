const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vendorsmarket.com.ng";
const HOST = (() => {
  try {
    return new URL(SITE_URL).host;
  } catch (_) {
    return "vendorsmarket.com.ng";
  }
})();

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/dashboard", "/api"]
      }
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: HOST
  };
}
