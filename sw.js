const CACHE = "lifepath-v1";

self.addEventListener("install", (e) => {
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(self.clients.claim());
});

// Strategia semplice: prova la rete, se non c'è prova la cache.
self.addEventListener("fetch", (e) => {
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const resClone = res.clone();
        caches.open(CACHE).then((cache) => cache.put(e.request, resClone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
