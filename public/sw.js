// Service Worker for Adivinhe Já! PWA
const CACHE_VERSION = '1.0.1';
const CACHE_NAME = 'adivinhe-ja-v3-' + CACHE_VERSION;
const urlsToCache = [
  '/',
  '/index.html',
  '/icon.png',
  '/apple-touch-icon.png',
  '/apple-touch-icon-precomposed.png',
  '/safari-pinned-tab.svg',
  '/manifest.json',
  '/browserconfig.xml',
  '/index.css',
  '/js/main-*.js',
  '/css/main-*.css',
  '/fonts/*',
  '/images/*',
  '/sounds/*',
  '/icons/icon-16x16.png',
  '/icons/icon-32x32.png',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/apple-touch-icon-152x152.png',
  '/icons/apple-touch-icon-167x167.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png',
  '/icons/apple-splash-640x1136.png',
  '/icons/apple-splash-750x1334.png',
  '/icons/apple-splash-1242x2208.png',
  '/icons/apple-splash-1125x2436.png',
  '/icons/apple-splash-828x1792.png',
  '/icons/apple-splash-1242x2688.png',
  '/icons/apple-splash-1536x2048.png',
  '/icons/apple-splash-1668x2224.png',
  '/icons/apple-splash-1668x2388.png',
  '/icons/apple-splash-2048x2732.png'
];

// Força a atualização do Service Worker
self.addEventListener('install', event => {
  self.skipWaiting(); // Força a ativação imediata
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName.startsWith('adivinhe-ja-')) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker activated and controlling the page');
      return self.clients.claim(); // Toma controle de todas as páginas abertas
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        
        // Clone the request
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).then(
          response => {
            // Check if valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                // Don't cache API calls or external resources
                if (!event.request.url.includes('/api/') && 
                    event.request.url.startsWith(self.location.origin)) {
                  cache.put(event.request, responseToCache);
                }
              });
              
            return response;
          }
        );
      })
  );
});

// Handle push notifications
self.addEventListener('push', event => {
  const title = 'Adivinhe Já!';
  const options = {
    body: event.data.text() || 'Nova notificação do jogo!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png'
  };
  
  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
}); 