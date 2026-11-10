const CACHE = "m4s-fluxo-flat-2";
const ASSETS = [
  "./",
  "./index.html",
  "./app.js",
  "./core.js",
  "./style.css",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
});
self.addEventListener("activate", (e) =>
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k.startsWith("m4s-fluxo-") && k !== CACHE)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  ),
);
self.addEventListener("fetch", (e) => {
  if (
    e.request.method !== "GET" ||
    new URL(e.request.url).origin !== location.origin
  )
    return;
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request)),
  );
});
