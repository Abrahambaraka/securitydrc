self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open("qs-cache").then((cache) => {
      // We are not caching /offline page as it does not exist yet.
      return cache.addAll(["/"]);
    })
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => {
      return res || fetch(e.request);
    })
  );
});
