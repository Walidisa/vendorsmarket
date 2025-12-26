// Bump this version on each deployment to bust old caches.
const CACHE_NAME = "vm-static-v79";
const APP_SHELL = [
  "/offline.html",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/icons/icon-maskable-512x512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
          return null;
        })
      )
    )
  );
  self.clients.claim();
});

// Allow clients to trigger an immediate activation.
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
  if (event.data && event.data.type === "REFRESH_CACHE") {
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
          return null;
        })
      )
    );
  }
});

const isSameOriginGet = (request) => {
  if (request.method !== "GET") return false;
  const url = new URL(request.url);
  return url.origin === self.location.origin;
};

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (!isSameOriginGet(request)) return;

  const url = new URL(request.url);
  const isApi = url.pathname.startsWith("/api");
  const isManifest = url.pathname === "/manifest.webmanifest";

  // Always bypass cache for write operations or API mutations.
  if (request.method !== "GET") return;
  // Never cache API calls; let them hit the network so auth/session stays fresh.
  if (isApi) return;

  if (isManifest) {
    // Always fetch manifest fresh so theme_color updates are picked up.
    event.respondWith(fetch(request));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const network = await fetch(request);
          return network;
        } catch (err) {
          const cache = await caches.open(CACHE_NAME);
          const offline = await cache.match("/offline.html");
          if (offline) return offline;
          throw err;
        }
      })()
    );
    return;
  }

  // Static assets and images: cache-first, then network fallback.
  if (!isApi) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(request);
        if (cached) return cached;
        try {
          const network = await fetch(request);
          if (network && network.status === 200 && network.type === "basic") {
            cache.put(request, network.clone());
          }
          return network;
        } catch (err) {
          // Try offline page for navigation handled above; here just fail.
          return cached || Promise.reject(err);
        }
      })()
    );
  }
});
