/**
 * Service worker del Himnario Unión Pentecostal.
 * Estrategia: red primero con respaldo en caché → las canciones ya visitadas
 * quedan disponibles sin conexión.
 */
const CACHE = "himnario-up-v1";
const PRECACHE = ["/", "/biblioteca", "/categorias", "/favoritos", "/manifest.json",
  "/logo-white.png", "/logo-navy.png", "/logo-gold.png",
  "/icons/icon-192x192.png", "/icons/icon-512x512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const { request } = e;
  if (request.method !== "GET" || !request.url.startsWith(self.location.origin)) return;

  // Estáticos: caché primero
  if (request.destination === "image" || request.destination === "font" || request.url.includes("/_next/static/")) {
    e.respondWith(
      caches.match(request).then(
        (hit) => hit ?? fetch(request).then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copy));
          return res;
        })
      )
    );
    return;
  }

  // Páginas y API de lectura: red primero, respaldo en caché
  e.respondWith(
    fetch(request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(request, copy));
        return res;
      })
      .catch(() => caches.match(request).then((hit) => hit ?? caches.match("/")))
  );
});
