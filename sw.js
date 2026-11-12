const V = 'music-v1';
const ASSETS = ['./', 'index.html', 'manifest.json', 'icon-180.png', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== V).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Network first (so GitHub updates show up), cache fallback (so it opens offline)
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  e.respondWith(
    fetch(r).then(res => {
      if (res.ok && res.status === 200) {
        const copy = res.clone();
        caches.open(V).then(c => c.put(r, copy));
      }
      return res;
    }).catch(() => caches.match(r).then(m => m || caches.match('index.html')))
  );
});
