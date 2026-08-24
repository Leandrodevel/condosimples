const CACHE_NAME = 'condominio-pwa-v1';
const assets = [
  'http://192.168.1.100:8080/',
  './app.js',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/lucide@latest'
];

// Instalação do Service Worker e salvamento em cache
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(assets);
    })
  );
});

// Intercepta requisições para servir o conteúdo offline
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cachedResponse => {
      return cachedResponse || fetch(e.request);
    })
  );
});

self.addEventListener('install', (event) => {
  self.skipWaiting(); // Força o novo Service Worker a assumir o controle imediatamente
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});
