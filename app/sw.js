// BridgeLog offline support: keeps a copy of the app itself so it opens without internet.
// It never touches student data, which lives only in this browser's storage.
const CACHE = "bridgelog-app-v2";
const FILES = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png",
  "./fonts/Lexend-Light.woff", "./fonts/Lexend-Regular.woff", "./fonts/Lexend-Medium.woff", "./fonts/Lexend-SemiBold.woff"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
// Serve from the saved copy right away, and refresh it in the background so updates arrive on the next open.
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(async c => {
    const u = new URL(e.request.url); u.search = "";   // one saved copy per file, whatever link opened it
    const hit = await c.match(u.href);
    const net = fetch(e.request, {cache: "no-cache"}).then(r => { if (r.ok) c.put(u.href, r.clone()); return r; }).catch(() => hit);
    return hit || net;
  }));
});
