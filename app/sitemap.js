const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vendorsmarket.com.ng";

export default async function sitemap() {
  const staticRoutes = ["", "/about", "/terms", "/privacy", "/login", "/signup", "/homepage"].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date().toISOString()
  }));

  // TODO: replace with DB fetches
  const productRoutes = []; // e.g., [{ slug: "product-1", updated_at: "2025-12-01" }]
  const vendorRoutes = []; // e.g., [{ username: "vendor-a", updated_at: "2025-12-01" }]

  const dynamicProducts = productRoutes.map((p) => ({
    url: `${SITE_URL}/product/${p.slug}`,
    lastModified: p.updated_at || new Date().toISOString()
  }));

  const dynamicVendors = vendorRoutes.map((v) => ({
    url: `${SITE_URL}/profile/${v.username}`,
    lastModified: v.updated_at || new Date().toISOString()
  }));

  return [...staticRoutes, ...dynamicProducts, ...dynamicVendors];
}
