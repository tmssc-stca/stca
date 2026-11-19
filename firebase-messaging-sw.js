/* STCA 背景推送 Service Worker — 必須放在網站根目錄，與 index.html 同一層 */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

// 即使 Firebase 載入失敗，Service Worker 仍然可用來顯示本機通知
try {
  importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
  importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');
  firebase.initializeApp({
    apiKey: "AIzaSyANv8eSJqoNoRb8UsSST_pSw7w8vkXRVwI",
    authDomain: "stca-22e5a.firebaseapp.com",
    projectId: "stca-22e5a",
    storageBucket: "stca-22e5a.firebasestorage.app",
    messagingSenderId: "1076572938823",
    appId: "1:1076572938823:web:0d12f47ebc26010ef30762"
  });
  const messaging = firebase.messaging();
  // 伺服器只發 data 訊息，由這裡統一顯示（同 tag 會互相取代，不會重複）
  messaging.onBackgroundMessage((payload) => {
    const d = payload.data || {};
    self.registration.showNotification(d.title || 'STCA 班級交流空間', {
      body: d.body || '',
      tag: d.tag || ('stca-' + Date.now()),
      renotify: true,
      data: { url: d.url || self.registration.scope }
    });
  });
} catch (e) {
  console.warn('Firebase Messaging 未能啟用，只保留本機通知功能:', e);
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || self.registration.scope;
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) { if ('focus' in c) return c.focus(); }
      return self.clients.openWindow(url);
    })
  );
});
