// Alennuslaskimen offline-tallennus.
// Kun laskinta päivitetään, vaihda VERSIO-numeroa, niin puhelimet hakevat uuden version.
const VERSIO = 'alennuslaskin-v2';
const TIEDOSTOT = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSIO).then((c) => c.addAll(TIEDOSTOT)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((avaimet) => Promise.all(avaimet.filter((a) => a !== VERSIO).map((a) => caches.delete(a))))
      .then(() => self.clients.claim())
  );
});

// Ensin verkosta (jolloin korjaukset tulevat heti), ilman verkkoa tallennetusta versiosta.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then((vastaus) => {
        const kopio = vastaus.clone();
        caches.open(VERSIO).then((c) => c.put(e.request, kopio));
        return vastaus;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then((v) => v || caches.match('./index.html')))
  );
});
