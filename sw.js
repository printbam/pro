const CACHE_NAME = 'app-pro-v4';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/ui.css',
  '/js/app.js'
];

// 1. Installation : On met en cache les fichiers de base
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // On utilise une boucle pour éviter que tout plante si un fichier manque
      for (const asset of STATIC_ASSETS) {
        try {
          await cache.add(asset);
        } catch (err) {
          console.warn(`Fichier ignoré au cache: ${asset}`);
        }
      }
    })
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
  return self.clients.claim();
});

// 3. Le Coeur : Stratégie Stale-While-Revalidate + Filtres de sécurité
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // --- FILTRE 1 : Uniquement les requêtes GET ---
  // Cela corrige l'erreur "HEAD is unsupported" et les problèmes avec les POST
  if (event.request.method !== 'GET') return;

  // --- FILTRE 2 : Ignorer Supabase et les appels d'Auth ---
  if (url.hostname.includes('supabase.co') || url.pathname.includes('/auth/')) return;

  // --- FILTRE 3 : Ignorer les extensions chrome ou protocoles bizarres ---
  if (!url.protocol.startsWith('http')) return;

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        
        // On lance la requête réseau en arrière-plan
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          // On ne met en cache que les réponses valides
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => {
          // Si le réseau échoue et qu'on n'a rien en cache, on peut gérer ici
          console.log("Mode hors-ligne actif pour:", url.pathname);
        });

        // On renvoie le cache s'il existe, sinon on attend le réseau
        return cachedResponse || fetchPromise;
      });
    })
  );
});
