/* App da Iguaçu Executive Transfer: o site funciona sempre pela internet (preços e reservas vêm do servidor).
   Sem conexão, mostra uma página com o telefone e o WhatsApp. Não guarda páginas nem dados de reserva. */
const CACHE = "iet-offline-v1";
const OFFLINE = "/offline.html";
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll([OFFLINE, "/img/app-192.png"])).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const r = e.request;
  if (r.mode !== "navigate" || r.method !== "GET") return;
  const p = new URL(r.url).pathname;
  if (p.startsWith("/admin") || p.startsWith("/api/") || p.startsWith("/cdn-cgi/")) return;
  e.respondWith(fetch(r).catch(() => caches.match(OFFLINE)));
});
