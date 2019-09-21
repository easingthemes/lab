const cacheVersion = 1;
const currentCache = {
  offline: 'offline-cache' + cacheVersion
};
const offlineUrl = 'index-offline.html';
this.addEventListener('install', event => {
  event.waitUntil(caches.open(currentCache.offline).then(function (cache) {
    return cache.addAll(['./images/avatar.png', offlineUrl]);
  }));
});
this.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate' || event.request.method === 'GET' && event.request.headers.get('accept').includes('text/html')) {
    event.respondWith(fetch(event.request.url).catch(error => {
      // Return the offline page
      return caches.match(offlineUrl);
    }));
  } else {
    // Respond with everything else if we can
    event.respondWith(caches.match(event.request).then(function (response) {
      return response || fetch(event.request);
    }));
  }
});