const CACHE_NAME = 'emprestimos-cache-v2';
const urlsToCache = [
  './',
  './index.html',
  './main.js',
  './style.css',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&display=swap'
];

// CORREÇÃO 1: Melhorando o evento de instalação
self.addEventListener('install', function(event) {
  console.log('Service Worker: Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Service Worker: Cache aberto, adicionando arquivos...');
        return cache.addAll(urlsToCache);
      })
      .then(function() {
        console.log('Service Worker: Todos os arquivos foram cached');
        return self.skipWaiting(); // Força a ativação imediata
      })
      .catch(function(error) {
        console.error('Service Worker: Erro ao fazer cache dos arquivos:', error);
      })
  );
});

// CORREÇÃO 2: Adicionando evento de ativação
self.addEventListener('activate', function(event) {
  console.log('Service Worker: Ativando...');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          // Remove caches antigos
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(function() {
      console.log('Service Worker: Ativado e pronto para uso');
      return self.clients.claim(); // Toma controle de todas as páginas
    })
  );
});

// CORREÇÃO 3: Melhorando a estratégia de fetch
self.addEventListener('fetch', function(event) {
  // Ignora requisições que não são GET
  if (event.request.method !== 'GET') {
    return;
  }

  // Ignora requisições para outros domínios (exceto fonts.googleapis.com)
  if (!event.request.url.startsWith(self.location.origin) && 
      !event.request.url.startsWith('https://fonts.googleapis.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(function(cachedResponse) {
        // Se encontrou no cache, retorna
        if (cachedResponse) {
          console.log('Service Worker: Servindo do cache:', event.request.url);
          return cachedResponse;
        }

        // Se não encontrou no cache, busca na rede
        console.log('Service Worker: Buscando na rede:', event.request.url);
        return fetch(event.request)
          .then(function(networkResponse) {
            // Verifica se a resposta é válida
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            // Clona a resposta para poder usar e cachear
            const responseToCache = networkResponse.clone();

            // Adiciona ao cache para próximas requisições
            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          })
          .catch(function(error) {
            console.error('Service Worker: Erro na requisição:', error);
            
            // Se for uma requisição para uma página HTML e falhou, retorna uma página offline
            if (event.request.destination === 'document') {
              return caches.match('./index.html');
            }
            
            throw error;
          });
      })
  );
});

// CORREÇÃO 4: Adicionando evento para sincronização em background
self.addEventListener('sync', function(event) {
  if (event.tag === 'background-sync') {
    console.log('Service Worker: Executando sincronização em background');
    event.waitUntil(
      // Aqui você pode adicionar lógica para sincronizar dados quando voltar online
      Promise.resolve()
    );
  }
});

// CORREÇÃO 5: Adicionando evento para notificações push (opcional)
self.addEventListener('push', function(event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: './icon-192.png',
      badge: './icon-192.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey
      }
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});
