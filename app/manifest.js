export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function manifest() {
  return {
    id: "/?pwa=white",
    name: "Vendors Market",
    short_name: "vendorsMarket",
    description: "Browse and buy from local vendors in one simple marketplace.",
    start_url: "/?pwa=white",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png"
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png"
      },
      {
        src: "/icons/icon-maskable-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable"
      }
    ]
  };
}
