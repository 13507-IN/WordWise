/**
 * LinguaCamp Service Worker
 * Provides offline resilience, asset caching, and mobile PWA installation capabilities.
 */

const CACHE_NAME = "linguacamp-pwa-v1";

const PRECACHE_ASSETS = [
  "/",
  "/favicon.svg",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png",
  "/manifest.json",
];

// Install: Cache essential shell assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        return self.skipWaiting();
      })
      .catch((err) => {
        console.warn("[PWA SW] Precache failed:", err);
      }),
  );
});

// Activate: Clean up old cache versions & claim clients
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((name) => {
            if (name !== CACHE_NAME) {
              return caches.delete(name);
            }
          }),
        );
      })
      .then(() => {
        return self.clients.claim();
      }),
  );
});

// Fetch: Network-first for pages and APIs, Cache-first for static assets
self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Only handle GET requests from the same origin or CDN assets
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Skip chrome-extension, internal schemes, and auth endpoints
  if (url.protocol !== "http:" && url.protocol !== "https:") return;
  if (url.pathname.startsWith("/api/auth")) return;

  // Static Assets (fonts, images, icons): Cache-first
  const isStatic =
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/images/") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".woff2");

  if (isStatic) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        });
      }),
    );
    return;
  }

  // Dynamic Pages & APIs: Network-first with Cache fallback
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        // Cache successful page visits
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          !url.pathname.startsWith("/api/")
        ) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return networkResponse;
      })
      .catch(async () => {
        // Fallback to cache if network fails
        const cached = await caches.match(request);
        if (cached) return cached;

        // If offline and requesting an HTML page, return root cached page
        if (request.headers.get("accept")?.includes("text/html")) {
          return caches.match("/");
        }

        return new Response("Offline", { status: 503, statusText: "Service Unavailable" });
      }),
  );
});
