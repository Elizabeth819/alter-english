/* ALTER Service Worker —— 让 PWA 可安装、可离线、弱网不白屏。
 * 仅在 http/https 下注册；直接双击 index.html（file://）时不会启用，也不影响使用。
 */
var CACHE = 'alter-shell-v6';
var ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './src/styles.css',
  './src/content.js',
  './src/catalog.js',
  './src/engine.js',
  './src/speech.js',
  './src/analytics.js',
  './src/qr.js',
  './src/app.js',
  './assets/icon.svg'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      // 逐个缓存：弱网下某一个文件失败，也不至于让整次安装失败。
      return Promise.all(ASSETS.map(function (url) {
        return cache.add(url).catch(function () { return null; });
      }));
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;
  var request = event.request;

  event.respondWith(
    caches.match(request).then(function (cached) {
      // 有缓存立即返回（离线可玩），同时后台更新一份。
      if (cached) {
        fetch(request).then(function (response) {
          if (response && response.ok) {
            caches.open(CACHE).then(function (cache) { cache.put(request, response.clone()); });
          }
        }).catch(function () { /* 离线时忽略 */ });
        return cached;
      }
      return fetch(request).then(function (response) {
        if (response && response.ok && response.type === 'basic') {
          var copy = response.clone();
          caches.open(CACHE).then(function (cache) { cache.put(request, copy); });
        }
        return response;
      }).catch(function () {
        // 页面导航失败时回到缓存的首页，避免白屏。
        if (request.mode === 'navigate') return caches.match('./index.html');
        return Response.error();
      });
    })
  );
});
