const CACHE_NAME = 'app-pro-v4';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/style.css', // Ajoute tes vrais fichiers ici
  '/app.js'
];

// 1. Installation : On met en cache les fichiers de base
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// 2. Activation : Nettoyage automatique des vieux caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      })
    ))
  );
});

// 3. Le Coeur du système : Stale-While-Revalidate
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // EXCLUSION : Ne pas mettre en cache Supabase en mode fichier
  // Le temps réel (Realtime) de Supabase utilise des WebSockets ou SSE, 
  // le Service Worker ne doit pas y toucher.
  if (url.hostname.includes('supabase.co')) return;

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        
        // On lance la requête réseau quoi qu'il arrive
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          // Si la réponse est valide, on met à jour le cache en secret
          if (networkResponse.ok) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => {
          // Optionnel : Gestion d'erreur réseau silencieuse
        });

        // STRATÉGIE : On renvoie la réponse cachée IMMEDIATEMENT. 
        // Si elle n'existe pas, on renvoie la promesse du réseau.
        return cachedResponse || fetchPromise;
      });
    })
  );
});
