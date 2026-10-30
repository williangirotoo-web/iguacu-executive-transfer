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

/* ---------- reserva: se o OpenRouteService falhar, usa Photon (busca) e OSRM (rota), gratuitos e sem chave ---------- */
const UA = { "User-Agent": "IguacuExecutiveTransfer/1.0 (+https://iguacuexecutivetransfer.com.br)", Accept: "application/json" };
const ISO3 = { BR: "BRA", AR: "ARG", PY: "PRY" };
async function tentar(nome, fn) {
  try { const v = await fn(); if (v && v.ok) return v; return { ok: false, motivo: nome + ":" + (v && v.ors || "falha"), erro: v && v.erro }; }
  catch (e) { console.error(nome, e && e.message); return { ok: false, motivo: nome + ":" + (e && e.name === "TimeoutError" ? "tempo" : "falha") }; }
}

/* ---------- sugestões enquanto o cliente digita ---------- */
async function orsLugares(env, q, l) {
  if (!env.ORS_KEY) return { ok: false, ors: "sem_chave" };
  const u = new URL(ORS + "/geocode/autocomplete");
  u.searchParams.set("text", q);
  u.searchParams.set("boundary.country", "BR,AR,PY");
  u.searchParams.set("focus.point.lat", String(POR_KM.regiaoFoz.lat));
  u.searchParams.set("focus.point.lon", String(POR_KM.regiaoFoz.lon));
  u.searchParams.set("size", "6");
  u.searchParams.set("lang", l);
  const r = await fetch(u, { headers: { Authorization: env.ORS_KEY, Accept: "application/json" }, signal: AbortSignal.timeout(6000) });
  if (!r.ok) { console.error("ors autocomplete", r.status); return { ok: false, ors: r.status }; }
  const d = await r.json();
  const lugares = (d.features || []).map((f) => ({
    label: String(f.properties && f.properties.label || "").slice(0, 160),
    lat: f.geometry.coordinates[1], lon: f.geometry.coordinates[0], pais: f.properties && f.properties.country_a,
  })).filter((x) => x.label);
  return { ok: true, lugares };
}
function rotuloPhoton(p) {
  const partes = [p.name, p.street && p.housenumber ? p.street + " " + p.housenumber : p.street, p.city && p.city !== p.name ? p.city : null, p.state, p.country];
  return partes.filter(Boolean).filter((x, i, a) => a.indexOf(x) === i).join(", ").slice(0, 160);
}
async function photonLugares(q) {
  const u = new URL("https://photon.komoot.io/api/");
  u.searchParams.set("q", q); u.searchParams.set("limit", "12");
  u.searchParams.set("lat", String(POR_KM.regiaoFoz.lat)); u.searchParams.set("lon", String(POR_KM.regiaoFoz.lon));
  u.searchParams.set("bbox", "-74,-42,-34,-14");
  const r = await fetch(u, { headers: UA, signal: AbortSignal.timeout(6000) });
  if (!r.ok) return { ok: false, ors: "photon_" + r.status };
  const d = await r.json();
  const lugares = (d.features || []).filter((f) => f.properties && ISO3[f.properties.countrycode]).slice(0, 6).map((f) => ({
    label: rotuloPhoton(f.properties), lat: f.geometry.coordinates[1], lon: f.geometry.coordinates[0], pais: ISO3[f.properties.countrycode],
  })).filter((x) => x.label);
  return { ok: true, lugares };
}
export async function buscarLugares(env, q, lang) {
  q = String(q || "").trim().slice(0, 80);
  if (q.length < 3) return { ok: true, lugares: [] };
  if (env.ORS_MOCK === "1") return { ok: true, lugares: mockLugares(q) };
  const l = ["pt", "en", "es"].includes(lang) ? lang : "pt";
  return comCache("ac:" + l + ":" + norm(q), 86400 * 7, async () => {
    const a = await tentar("ors", () => orsLugares(env, q, l));
    if (a.ok && a.lugares.length) return a;
    const b = await tentar("photon", () => photonLugares(q));
    if (b.ok) return b;
    return a.ok ? a : { ok: false, erro: "calc_indisponivel", ors: [a.motivo, b.motivo].join(" ") };
  });
}

/* ---------- país de cada ponto ---------- */
async function orsPais(env, p) {
  if (!env.ORS_KEY) return { ok: false, ors: "sem_chave" };
  const u = new URL(ORS + "/geocode/reverse");
  u.searchParams.set("point.lat", String(p.lat)); u.searchParams.set("point.lon", String(p.lon)); u.searchParams.set("size", "1");
  const r = await fetch(u, { headers: { Authorization: env.ORS_KEY, Accept: "application/json" }, signal: AbortSignal.timeout(6000) });
  if (!r.ok) { console.error("ors reverse", r.status); return { ok: false, ors: r.status }; }
  const d = await r.json(), f = (d.features || [])[0];
  return f && f.properties.country_a ? { ok: true, pais: f.properties.country_a } : { ok: false, ors: "vazio" };
}
async function photonPais(p) {
  const u = new URL("https://photon.komoot.io/reverse");
  u.searchParams.set("lat", String(p.lat)); u.searchParams.set("lon", String(p.lon)); u.searchParams.set("limit", "1");
  const r = await fetch(u, { headers: UA, signal: AbortSignal.timeout(6000) });
  if (!r.ok) return { ok: false, ors: "photon_" + r.status };
  const d = await r.json(), f = (d.features || [])[0], cc = f && f.properties && f.properties.countrycode;
  return cc ? { ok: true, pais: ISO3[cc] || cc } : { ok: false, ors: "vazio" };
}
async function paisDe(env, p) {
  if (env.ORS_MOCK === "1") return { ok: true, pais: mockPais(p) };
  const k = "rv:" + p.lat.toFixed(3) + "," + p.lon.toFixed(3);
  return comCache(k, 86400 * 30, async () => {
    const a = await tentar("ors", () => orsPais(env, p));
    if (a.ok) return a;
    const b = await tentar("photon", () => photonPais(p));
    return b.ok ? b : { ok: false, ors: [a.motivo, b.motivo].join(" ") };
  });
}

/* ---------- distância por estrada ---------- */
async function orsRota(env, a, b) {
  if (!env.ORS_KEY) return { ok: false, ors: "sem_chave" };
  const r = await fetch(ORS + "/v2/directions/driving-car", {
    method: "POST",
    headers: { Authorization: env.ORS_KEY, "content-type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ coordinates: [[a.lon, a.lat], [b.lon, b.lat]], radiuses: [5000, 5000] }),
    signal: AbortSignal.timeout(8000),
  });
  if (!r.ok) { console.error("ors directions", r.status); return { ok: false, ors: r.status, erro: r.status === 404 ? "rota_sem_estrada" : undefined }; }
  const d = await r.json(), s = d.routes && d.routes[0] && d.routes[0].summary;
  if (!s) return { ok: false, erro: "rota_sem_estrada" };
  return { ok: true, km: Math.max(1, Math.ceil(s.distance / 1000)), min: Math.round(s.duration / 60) };
}
async function osrmRota(a, b) {
  const u = "https://router.project-osrm.org/route/v1/driving/" + a.lon + "," + a.lat + ";" + b.lon + "," + b.lat + "?overview=false";
  const r = await fetch(u, { headers: UA, signal: AbortSignal.timeout(8000) });
  if (!r.ok) return { ok: false, ors: "osrm_" + r.status };
  const d = await r.json(), rt = d.routes && d.routes[0];
  if (d.code === "NoRoute" || !rt) return { ok: false, erro: "rota_sem_estrada" };
  return { ok: true, km: Math.max(1, Math.ceil(rt.distance / 1000)), min: Math.round(rt.duration / 60) };
}
async function distanciaKm(env, a, b) {
  if (env.ORS_MOCK === "1") return { ok: true, km: Math.ceil(haversineKm(a, b) * 1.3), min: Math.round(haversineKm(a, b) * 1.3 / 80 * 60) };
  const k = "rt:" + [a.lat, a.lon, b.lat, b.lon].map((x) => x.toFixed(4)).join(",");
  return comCache(k, 86400 * 30, async () => {
    const x = await tentar("ors", () => orsRota(env, a, b));
    if (x.ok) return x;
    const y = await tentar("osrm", () => osrmRota(a, b));
    if (y.ok) return y;
    const semEstrada = x.erro === "rota_sem_estrada" || y.erro === "rota_sem_estrada";
    return { ok: false, erro: semEstrada ? "rota_sem_estrada" : "calc_indisponivel", ors: [x.motivo, y.motivo].join(" ") };
  });
}

/* Valida os dois pontos e devolve { ok, km, min, fora, paises } ou { ok:false, erro } */
export async function resolverRota(env, de, para) {
  if (!de || !para) return { ok: false, erro: "rota_falta" };
  if (!naRegiao(de) && !naRegiao(para)) return { ok: false, erro: "fora_regiao" };
  try {
    const [pa, pb, dist] = await Promise.all([paisDe(env, de), paisDe(env, para), distanciaKm(env, de, para)]);
    if (!pa.ok || !pb.ok) return { ok: false, erro: "calc_indisponivel", ors: (pa.ors || "") + " " + (pb.ors || "") };
    if (!POR_KM.paisesAceitos.includes(pa.pais) || !POR_KM.paisesAceitos.includes(pb.pais)) return { ok: false, erro: "pais_nao_atende" };
    if (!dist.ok) return dist;
    if (dist.km > POR_KM.maxKm) return { ok: false, erro: "km_max", max: POR_KM.maxKm, km: dist.km };
    if (dist.km < POR_KM.minKm) return { ok: false, erro: "km_min" };
    return { ok: true, km: dist.km, min: dist.min, fora: pa.pais !== "BRA" || pb.pais !== "BRA", paises: [pa.pais, pb.pais] };
  } catch (e) {
    console.error("rota", e && e.message);
    return { ok: false, erro: "calc_indisponivel", ors: e && e.name === "TimeoutError" ? "tempo" : "falha" };
  }
}
