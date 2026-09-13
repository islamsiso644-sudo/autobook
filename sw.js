/* ============================================================
   AutoBook.ai — Service Worker
   تخزين مؤقت ذكي ليعمل التطبيق دون اتصال بالإنترنت
   ============================================================ */
"use strict";

const CACHE_NAME = "autobook-v1";
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./config.js",
  "./translations.js",
  "./agents.js",
  "./faq.js",
  "./app.js",
  "./manifest.webmanifest",
  "./assets/img/icon-192.png",
  "./assets/img/icon-512.png",
  "./assets/img/apple-touch-icon.png",
  "./assets/img/favicon.ico",
  "./assets/img/hero-visual.jpg"
];

/* ---------- التثبيت: تخزين الملفات الأساسية ---------- */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

/* ---------- التنشيط: تنظيف الإصدارات القديمة ---------- */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

/* ---------- الاستجابة: الكاش أولاً، ثم الشبكة ---------- */
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // تجاهل الطلبات غير GET والطلبات الخارجية (خطوط جوجل وغيرها)
  if (req.method !== "GET" || !req.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) {
        // أعد من الكاش، وحدّثه في الخلفية
        fetch(req)
          .then((res) => {
            if (res && res.ok) {
              caches.open(CACHE_NAME).then((c) => c.put(req, res.clone()));
            }
          })
          .catch(() => {});
        return cached;
      }
      // ليس مخزناً: اجلب من الشبكة وخزّن نجاحاً
      return fetch(req)
        .then((res) => {
          if (res && res.ok && res.type === "basic") {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match("./index.html"));
    })
  );
});
