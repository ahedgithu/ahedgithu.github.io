(function () {
  async function removeLegacyPwa() {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations
        .filter(function (registration) {
          return registration.scope === new URL('/', window.location.origin).href;
        })
        .map(function (registration) {
          return registration.unregister();
        }));
    }

    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames
        .filter(function (cacheName) {
          return cacheName.indexOf('med401-pwa-') === 0;
        })
        .map(function (cacheName) {
          return caches.delete(cacheName);
        }));
    }
  }

  window.addEventListener('load', function () {
    removeLegacyPwa().catch(function () {
      // Cache cleanup must never prevent the website from loading.
    });
  });
})();
