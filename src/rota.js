/* Viagem sob medida — distância por estrada e país de cada ponto, para a viagem sob medida (preço por km).
   Usa o OpenRouteService (chave no segredo ORS_KEY). Tudo calculado no servidor.
   Em desenvolvimento local, ORS_MOCK=1 (.dev.vars) usa uma lista fixa de cidades. */
import { POR_KM } from "./precos.js";

const ORS = "https://api.openrouteservice.org";

function haversineKm(a, b) {
  const R = 6371, r = (x) => (x * Math.PI) / 180;
  const dLat = r(b.lat - a.lat), dLon = r(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
const naRegiao = (p) => haversineKm(p, POR_KM.regiaoFoz) <= POR_KM.regiaoFoz.raioKm;

/* ---------- cache (Cache API da Cloudflare + memória do processo) ---------- */
const mem = new Map();
async function comCache(chave, ttl, fn) {
  if (mem.has(chave)) return mem.get(chave);
  const url = "https://cache.iet.internal/" + encodeURIComponent(chave);
  const cache = typeof caches !== "undefined" ? caches.default : null;
  if (cache) {
    const hit = await cache.match(url);
    if (hit) { const v = await hit.json(); mem.set(chave, v); return v; }
  }
  const v = await fn();
  if (v && v.ok) {
    if (mem.size > 500) mem.clear();
    mem.set(chave, v);
    if (cache) await cache.put(url, new Response(JSON.stringify(v), { headers: { "cache-control": "public, max-age=" + ttl, "content-type": "application/json" } }));
  }
  return v;
}

/* ---------- lista fixa para testes locais ---------- */
const MOCK = [
  ["Foz do Iguaçu, PR, Brasil", -25.5163, -54.5854, "BRA"], ["Aeroporto Internacional de Foz do Iguaçu, PR, Brasil", -25.5976, -54.4877, "BRA"],
  ["Cascavel, PR, Brasil", -24.9555, -53.4552, "BRA"], ["Curitiba, PR, Brasil", -25.4284, -49.2733, "BRA"], ["Dourados, MS, Brasil", -22.2211, -54.8056, "BRA"],
  ["Florianópolis, SC, Brasil", -27.5954, -48.548, "BRA"], ["Porto Alegre, RS, Brasil", -30.0346, -51.2177, "BRA"], ["Rio de Janeiro, RJ, Brasil", -22.9068, -43.1729, "BRA"],
  ["Puerto Iguazú, Misiones, Argentina", -25.5991, -54.5736, "ARG"], ["Posadas, Misiones, Argentina", -27.3671, -55.8961, "ARG"],
  ["Encarnación, Itapúa, Paraguay", -27.3306, -55.8667, "PRY"], ["Ciudad del Este, Alto Paraná, Paraguay", -25.5097, -54.6111, "PRY"],
  ["Montevideo, Uruguay", -34.9011, -56.1645, "URY"],
];
const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
function mockLugares(q) {
  const n = norm(q);
  return MOCK.filter((m) => norm(m[0]).includes(n)).slice(0, 6).map(([label, lat, lon, pais]) => ({ label, lat, lon, pais }));
}
function mockPais(p) {
  let best = null, d = 1e9;
  for (const m of MOCK) { const x = haversineKm(p, { lat: m[1], lon: m[2] }); if (x < d) { d = x; best = m[3]; } }
  return best;
}

/* ---------- sugestões enquanto o cliente digita ---------- */
export async function buscarLugares(env, q, lang) {
  q = String(q || "").trim().slice(0, 80);
  if (q.length < 3) return { ok: true, lugares: [] };
  if (env.ORS_MOCK === "1") return { ok: true, lugares: mockLugares(q) };
  if (!env.ORS_KEY) return { ok: false, erro: "calc_indisponivel" };
  const l = ["pt", "en", "es"].includes(lang) ? lang : "pt";
  return comCache("ac:" + l + ":" + norm(q), 86400 * 7, async () => {
    const u = new URL(ORS + "/geocode/autocomplete");
    u.searchParams.set("text", q);
    u.searchParams.set("boundary.country", "BR,AR,PY");
    u.searchParams.set("focus.point.lat", String(POR_KM.regiaoFoz.lat));
    u.searchParams.set("focus.point.lon", String(POR_KM.regiaoFoz.lon));
    u.searchParams.set("size", "6");
    u.searchParams.set("lang", l);
    const r = await fetch(u, { headers: { Authorization: env.ORS_KEY, Accept: "application/json" }, signal: AbortSignal.timeout(8000) });
    if (!r.ok) { console.error("ors autocomplete", r.status, (await r.text()).slice(0, 200)); return { ok: false, erro: "calc_indisponivel" }; }
    const d = await r.json();
    const lugares = (d.features || []).map((f) => ({
      label: String(f.properties && f.properties.label || "").slice(0, 160),
      lat: f.geometry.coordinates[1], lon: f.geometry.coordinates[0], pais: f.properties && f.properties.country_a,
    })).filter((x) => x.label);
    return { ok: true, lugares };
  });
}

async function paisDe(env, p) {
  if (env.ORS_MOCK === "1") return mockPais(p);
  const k = "rv:" + p.lat.toFixed(3) + "," + p.lon.toFixed(3);
  const v = await comCache(k, 86400 * 30, async () => {
    const u = new URL(ORS + "/geocode/reverse");
    u.searchParams.set("point.lat", String(p.lat)); u.searchParams.set("point.lon", String(p.lon)); u.searchParams.set("size", "1");
    const r = await fetch(u, { headers: { Authorization: env.ORS_KEY, Accept: "application/json" }, signal: AbortSignal.timeout(8000) });
    if (!r.ok) { console.error("ors reverse", r.status, (await r.text()).slice(0, 200)); return { ok: false }; }
    const d = await r.json(), f = (d.features || [])[0];
    return f ? { ok: true, pais: f.properties.country_a } : { ok: false };
  });
  return v.ok ? v.pais : null;
}

async function distanciaKm(env, a, b) {
  if (env.ORS_MOCK === "1") return { ok: true, km: Math.ceil(haversineKm(a, b) * 1.3), min: Math.round(haversineKm(a, b) * 1.3 / 80 * 60) };
  const k = "rt:" + [a.lat, a.lon, b.lat, b.lon].map((x) => x.toFixed(4)).join(",");
  return comCache(k, 86400 * 30, async () => {
    const r = await fetch(ORS + "/v2/directions/driving-car", {
      method: "POST",
      headers: { Authorization: env.ORS_KEY, "content-type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ coordinates: [[a.lon, a.lat], [b.lon, b.lat]], radiuses: [5000, 5000] }),
      signal: AbortSignal.timeout(10000),
    });
    if (!r.ok) console.error("ors directions", r.status, (await r.clone().text()).slice(0, 200));
    if (!r.ok) return { ok: false, erro: r.status === 404 ? "rota_sem_estrada" : "calc_indisponivel" };
    const d = await r.json(), s = d.routes && d.routes[0] && d.routes[0].summary;
    if (!s) return { ok: false, erro: "rota_sem_estrada" };
    return { ok: true, km: Math.max(1, Math.ceil(s.distance / 1000)), min: Math.round(s.duration / 60) };
  });
}

/* Valida os dois pontos e devolve { ok, km, min, fora, paises } ou { ok:false, erro } */
export async function resolverRota(env, de, para) {
  if (!de || !para) return { ok: false, erro: "rota_falta" };
  if (env.ORS_MOCK !== "1" && !env.ORS_KEY) return { ok: false, erro: "calc_indisponivel" };
  if (!naRegiao(de) && !naRegiao(para)) return { ok: false, erro: "fora_regiao" };
  try {
    const [pa, pb, dist] = await Promise.all([paisDe(env, de), paisDe(env, para), distanciaKm(env, de, para)]);
    if (!pa || !pb) return { ok: false, erro: "calc_indisponivel" };
    if (!POR_KM.paisesAceitos.includes(pa) || !POR_KM.paisesAceitos.includes(pb)) return { ok: false, erro: "pais_nao_atende" };
    if (!dist.ok) return dist;
    if (dist.km > POR_KM.maxKm) return { ok: false, erro: "km_max", max: POR_KM.maxKm, km: dist.km };
    if (dist.km < POR_KM.minKm) return { ok: false, erro: "km_min" };
    return { ok: true, km: dist.km, min: dist.min, fora: pa !== "BRA" || pb !== "BRA", paises: [pa, pb] };
  } catch (e) {
    console.error("rota", e && e.message);
    return { ok: false, erro: "calc_indisponivel" };
  }
}
