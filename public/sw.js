// Service Worker para cache offline e otimização de performance
const CACHE_NAME = 'adivinhe-ja-v1';
const STATIC_CACHE_NAME = 'adivinhe-ja-static-v1';
const DYNAMIC_CACHE_NAME = 'adivinhe-ja-dynamic-v1';

// Cache das fontes externas e assets críticos
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  // Tailwind CSS será incluído no bundle
  // Assets de ícones serão adicionados dinamicamente
];

// URLs que devem ser buscadas da rede primeiro
const NETWORK_FIRST_URLS = [
  '/api/',
  'https://ldujhtwxnbwqbchhchcf.supabase.co/',
  'https://generativelanguage.googleapis.com/',
];

// Tamanho máximo do cache dinâmico
const CACHE_SIZE_LIMIT = 50;

// Install Event - Instala o service worker e faz cache dos assets estáticos
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static assets:', error);
      })
  );
  
  // Força a ativação imediata do novo service worker
  self.skipWaiting();
});

// Activate Event - Limpa caches antigos
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then((keyList) => {
        return Promise.all(
          keyList.map((key) => {
            if (key !== STATIC_CACHE_NAME && key !== DYNAMIC_CACHE_NAME) {
              console.log('[SW] Removing old cache:', key);
              return caches.delete(key);
            }
          })
        );
      })
      .then(() => {
        // Assume controle de todas as abas
        return self.clients.claim();
      })
  );
});

// Fetch Event - Intercepta requisições e implementa estratégias de cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const { url, method } = request;

  // Só intercepta requisições GET
  if (method !== 'GET') {
    return;
  }

  // Skip requisições para extensões do browser
  if (url.includes('extension') || url.includes('chrome-extension')) {
    return;
  }

  event.respondWith(handleFetch(request));
});

// Função principal para lidar com requisições
async function handleFetch(request) {
  const { url } = request;

  try {
    // Para APIs externas: Network First
    if (isNetworkFirstUrl(url)) {
      return await networkFirst(request);
    }

    // Para assets estáticos: Cache First
    if (isStaticAsset(url)) {
      return await cacheFirst(request);
    }

    // Para outros recursos: Stale While Revalidate
    return await staleWhileRevalidate(request);

  } catch (error) {
    console.error('[SW] Fetch handler error:', error);
    return await handleFallback(request);
  }
}

// Network First Strategy - Tenta rede primeiro, fallback para cache
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Se a resposta é válida, atualiza o cache
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
      await limitCacheSize(DYNAMIC_CACHE_NAME, CACHE_SIZE_LIMIT);
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// Cache First Strategy - Tenta cache primeiro, fallback para rede
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache first failed for:', request.url, error);
    throw error;
  }
}

// Stale While Revalidate Strategy - Serve do cache e atualiza em background
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  // Fetch em background para atualizar o cache
  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
        limitCacheSize(DYNAMIC_CACHE_NAME, CACHE_SIZE_LIMIT);
      }
      return networkResponse;
    })
    .catch((error) => {
      console.log('[SW] Background fetch failed:', request.url, error);
    });

  // Retorna do cache se disponível, senão espera a rede
  return cachedResponse || fetchPromise;
}

// Fallback para quando tudo falha
async function handleFallback(request) {
  // Para navegação, retorna a página principal se estiver em cache
  if (request.mode === 'navigate') {
    const cachedResponse = await caches.match('/');
    if (cachedResponse) {
      return cachedResponse;
    }
  }
  
  // Para outros recursos, retorna uma resposta de erro customizada
  return new Response(
    JSON.stringify({ 
      error: 'Recurso não disponível offline',
      url: request.url 
    }),
    {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

// Verifica se a URL deve usar Network First
function isNetworkFirstUrl(url) {
  return NETWORK_FIRST_URLS.some(pattern => url.includes(pattern));
}

// Verifica se é um asset estático
function isStaticAsset(url) {
  return url.includes('.js') || 
         url.includes('.css') || 
         url.includes('.png') || 
         url.includes('.jpg') || 
         url.includes('.jpeg') || 
         url.includes('.svg') || 
         url.includes('.ico') ||
         url.includes('.woff') ||
         url.includes('.woff2');
}

// Limita o tamanho do cache removendo os itens mais antigos
async function limitCacheSize(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  if (keys.length > maxItems) {
    const itemsToDelete = keys.slice(0, keys.length - maxItems);
    await Promise.all(
      itemsToDelete.map(request => cache.delete(request))
    );
    console.log(`[SW] Cleaned cache ${cacheName}, removed ${itemsToDelete.length} items`);
  }
}

// Listener para mensagens do cliente (para funcionalidades futuras)
self.addEventListener('message', (event) => {
  const { data } = event;
  
  if (data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(DYNAMIC_CACHE_NAME)
        .then(cache => cache.addAll(data.urls))
        .then(() => event.ports[0].postMessage({ success: true }))
        .catch(error => event.ports[0].postMessage({ success: false, error }))
    );
  }
});

// Background Sync para quando a conexão for restabelecida
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Aqui você pode implementar lógica para sincronizar dados
      // quando a conexão for restabelecida
      console.log('[SW] Performing background sync')
    );
  }
});

// Push notifications (para funcionalidades futuras)
self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event);
  
  if (event.data) {
    const data = event.data.json();
    
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        data: data.data
      })
    );
  }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});

console.log('[SW] Service Worker loaded successfully');
