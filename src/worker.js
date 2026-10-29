/* Iguaçu Executive Transfer — Worker (API de reservas + site estático) */
import { CONFIG, CATEGORIAS, SERVICOS, CONSULTA, HORA_EXTRA, POR_HORA, datasEspeciais } from "./precos.js";
import { normalizarItem, cotar, cotarTodas, valorAgora, servico } from "./cotacao.js";
import { EmailMessage } from "cloudflare:email";

export const STATUS = ["solicitacao", "pagamento_pendente", "aprovado", "aguardando_confirmacao", "confirmada", "concluida", "cancelada"];

/* ---------------- utilidades ---------------- */
const json = (obj, status = 200, extra = {}) => new Response(JSON.stringify(obj), {
  status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex", ...extra },
});
const erro = (codigo, status = 400, extra = {}) => json({ ok: false, erro: codigo, ...extra }, status);
const agoraIso = () => new Date().toISOString();
const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
async function sha256(s) { return hex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s))); }
function aleatorio(n, alfabeto = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789") {
  const b = crypto.getRandomValues(new Uint8Array(n)); let r = "";
  for (const x of b) r += alfabeto[x % alfabeto.length];
  return r;
}
const tokenHex = () => hex(crypto.getRandomValues(new Uint8Array(16)));
async function lerJson(req, max = 20000) {
  const t = await req.text();
  if (t.length > max) throw new Error("grande");
  return JSON.parse(t || "{}");
}
const L = (o, lang) => (o && (o[lang] || o.pt)) || "";

/* ---------------- banco (D1) ---------------- */
let schemaPronto = false;
async function prepararBanco(env) {
  if (schemaPronto) return;
  await env.DB.batch([
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS pedidos (
      id INTEGER PRIMARY KEY AUTOINCREMENT, codigo TEXT UNIQUE NOT NULL, token TEXT NOT NULL,
      criado_em TEXT NOT NULL, atualizado_em TEXT NOT NULL, status TEXT NOT NULL, idioma TEXT,
      nome TEXT NOT NULL, email TEXT NOT NULL, telefone TEXT NOT NULL, pais TEXT, observacoes TEXT,
      consentimento_em TEXT NOT NULL, total REAL NOT NULL, valor_agora REAL NOT NULL, modo_pagamento TEXT,
      ip_hash TEXT, origem TEXT)`),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS itens (
      id INTEGER PRIMARY KEY AUTOINCREMENT, pedido_id INTEGER NOT NULL REFERENCES pedidos(id),
      ordem INTEGER NOT NULL, servico_id TEXT NOT NULL, servico_nome TEXT NOT NULL, categoria TEXT NOT NULL,
      data TEXT NOT NULL, hora TEXT NOT NULL, inicio_utc TEXT NOT NULL, sentido TEXT, voo TEXT,
      origem TEXT, destino TEXT, pax INTEGER, malas INTEGER, cadeirinhas INTEGER, pet INTEGER,
      horas_extras INTEGER, horas INTEGER, dias INTEGER, data_especial INTEGER, valor REAL NOT NULL,
      modo TEXT, valor_agora REAL, linhas_json TEXT)`),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS eventos (
      id INTEGER PRIMARY KEY AUTOINCREMENT, pedido_id INTEGER NOT NULL REFERENCES pedidos(id),
      em TEXT NOT NULL, tipo TEXT NOT NULL, status_de TEXT, status_para TEXT, autor TEXT, texto TEXT)`),
    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_pedidos_status ON pedidos(status, criado_em)`),
    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_pedidos_ip ON pedidos(ip_hash, criado_em)`),
    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_itens_pedido ON itens(pedido_id)`),
    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_itens_inicio ON itens(inicio_utc)`),
  ]);
  schemaPronto = true;
}

/* ---------------- catálogo público ---------------- */
function catalogo(env) {
  const ano = new Date().getUTCFullYear();
  return {
    ok: true,
    config: {
      whatsapp: CONFIG.whatsapp, antecedenciaHoras: CONFIG.antecedenciaHoras, antecedenciaViagensHoras: CONFIG.antecedenciaViagensHoras,
      cancelamento: CONFIG.cancelamento, feriadoAcrescimoPct: CONFIG.feriadoAcrescimoPct, esperaAeroporto: CONFIG.esperaAeroporto,
      cadeirinha: CONFIG.cadeirinha, pet: CONFIG.pet, sinalPct: CONFIG.sinalPct, pagamento: CONFIG.pagamento,
      pagamentoViagens: CONFIG.pagamentoViagens, horaExtra: HORA_EXTRA, porHora: { minimoHoras: POR_HORA.minimoHoras, maximoHoras: POR_HORA.maximoHoras },
      turnstileSiteKey: env.TURNSTILE_SITEKEY || "", pagamentoOnline: false,
    },
    categorias: CATEGORIAS, servicos: SERVICOS, consulta: CONSULTA,
    datasEspeciais: [...datasEspeciais(ano), ...datasEspeciais(ano + 1)],
  };
}

/* ---------------- anti-spam ---------------- */
async function verificarTurnstile(env, token, ip) {
  if (!env.TURNSTILE_SECRET) return true; // ainda não configurado
  if (!token) return false;
  const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST", body: new URLSearchParams({ secret: env.TURNSTILE_SECRET, response: token, remoteip: ip || "" }),
  });
  const d = await r.json().catch(() => ({}));
  return !!d.success;
}

/* ---------------- e-mail de aviso ---------------- */
function b64(s) {
  const bytes = new TextEncoder().encode(s); let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin).replace(/.{76}/g, "$&\r\n");
}
async function enviarAviso(env, assunto, texto) {
  if (!env.AVISOS) return false;
  const de = env.EMAIL_REMETENTE || "reservas@iguacuexecutivetransfer.com.br";
  const para = env.EMAIL_AVISOS || CONFIG.emailAvisos;
  const hdr = (s) => `=?UTF-8?B?${b64(s).replace(/\r\n/g, "")}?=`;
  const raw = [
    `From: ${hdr("Reservas Iguaçu Executive Transfer")} <${de}>`,
    `To: ${para}`,
    `Subject: ${hdr(assunto)}`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${tokenHex()}@iguacuexecutivetransfer.com.br>`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    b64(texto),
  ].join("\r\n");
  try { await env.AVISOS.send(new EmailMessage(de, para, raw)); return true; }
  catch (e) { console.error("email", e && e.message); return false; }
}

const brl = (v) => "R$ " + Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const dataBr = (d) => d.split("-").reverse().join("/");
function resumoTexto(p, itens, comLinks, origem) {
  const linhas = [`Pedido ${p.codigo}`, `Cliente: ${p.nome}`, `WhatsApp/telefone: ${p.telefone}`, `E-mail: ${p.email}`];
  if (p.pais) linhas.push(`País: ${p.pais}`);
  linhas.push("");
  itens.forEach((it, i) => {
    const c = CATEGORIAS[it.categoria];
    linhas.push(`${i + 1}) ${it.servico_nome}`);
    linhas.push(`   Categoria: ${c ? c.nome.pt : it.categoria}`);
    linhas.push(`   Data: ${dataBr(it.data)} às ${it.hora}` + (it.sentido && servico(it.servico_id)?.sentido ? ` (${it.sentido === "saida" ? "saída: hotel → aeroporto" : "chegada: aeroporto → hotel"})` : ""));
    if (it.voo) linhas.push(`   Voo: ${it.voo}`);
    if (it.origem) linhas.push(`   Buscar em: ${it.origem}`);
    if (it.destino) linhas.push(`   Levar para: ${it.destino}`);
    linhas.push(`   Passageiros: ${it.pax} · Malas: ${it.malas}` + (it.cadeirinhas ? ` · Cadeirinhas: ${it.cadeirinhas}` : "") + (it.pet ? " · Com pet" : ""));
    if (it.horas_extras) linhas.push(`   Horas extras: ${it.horas_extras}`);
    if (servico(it.servico_id)?.tipo === "hora") linhas.push(`   Horas contratadas: ${it.horas}`);
    if (servico(it.servico_id)?.tipo === "diaria") linhas.push(`   Diárias: ${it.dias}`);
    if (it.data_especial) linhas.push(`   Data especial: +${CONFIG.feriadoAcrescimoPct}%`);
    linhas.push(`   Valor: ${brl(it.valor)} (${it.modo === "total" ? "100% na reserva" : CONFIG.sinalPct + "% de sinal"})`);
  });
  linhas.push("", `Total: ${brl(p.total)}`, `A pagar na reserva: ${brl(p.valor_agora)}`, `Restante no dia: ${brl(p.total - p.valor_agora)}`);
  if (p.observacoes) linhas.push("", `Observações: ${p.observacoes}`);
  if (comLinks) {
    const tel = String(p.telefone).replace(/\D/g, "");
    linhas.push("", `Painel: ${origem}/admin/#${p.codigo}`);
    if (tel.length >= 10) linhas.push(`WhatsApp do cliente: https://wa.me/${tel.length <= 11 ? "55" + tel : tel}`);
  }
  return linhas.join("\n");
}

/* ---------------- criar pedido ---------------- */
async function criarPedido(req, env, ctx) {
  let body;
  try { body = await lerJson(req); } catch { return erro("json_invalido"); }
  if (body.website) return json({ ok: true, codigo: "IET-OK" }); // honeypot: robô preencheu campo escondido
  const ip = req.headers.get("cf-connecting-ip") || "";
  if (!(await verificarTurnstile(env, body.turnstile, ip))) return erro("verificacao", 403);

  const c = body.cliente || {};
  const s = (v, n) => String(v == null ? "" : v).trim().slice(0, n);
  const cliente = { nome: s(c.nome, 120), email: s(c.email, 160).toLowerCase(), telefone: s(c.telefone, 40), pais: s(c.pais, 60), observacoes: s(c.observacoes, 1000) };
  if (cliente.nome.length < 3) return erro("nome");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(cliente.email)) return erro("email");
  if (cliente.telefone.replace(/\D/g, "").length < 8) return erro("telefone");
  if (body.consentimento !== true) return erro("consentimento");
  const idioma = ["pt", "en", "es"].includes(body.idioma) ? body.idioma : "pt";

  const brutos = Array.isArray(body.itens) ? body.itens.slice(0, 7) : [];
  if (!brutos.length) return erro("sem_itens");
  if (brutos.length > 6) return erro("itens_demais");
  const agora = Date.now();
  const itens = [];
  for (let i = 0; i < brutos.length; i++) {
    const it = normalizarItem(brutos[i]);
    const cot = cotar(it, agora);
    if (!cot.ok) return erro("item_invalido", 422, { item: i, motivo: cot.erro, detalhe: cot });
    if (!it.origem) return erro("item_invalido", 422, { item: i, motivo: "origem" });
    itens.push({ it, cot, svc: servico(it.servico) });
  }
  const escolha = body.modoPagamento === "total" ? "total" : "sinal";
  const pag = valorAgora(itens, escolha);

  await prepararBanco(env);
  const ipHash = ip ? await sha256(ip + (env.IP_SALT || "iet")) : null;
  if (ipHash) {
    const desde = new Date(agora - 15 * 60e3).toISOString();
    const r = await env.DB.prepare("SELECT COUNT(*) n FROM pedidos WHERE ip_hash = ? AND criado_em > ?").bind(ipHash, desde).first();
    if (r && r.n >= 5) return erro("muitas_tentativas", 429);
  }

  const now = agoraIso();
  const token = tokenHex();
  let codigo, pedidoId;
  for (let tent = 0; tent < 5 && !pedidoId; tent++) {
    codigo = "IET-" + aleatorio(6);
    try {
      const r = await env.DB.prepare(`INSERT INTO pedidos (codigo, token, criado_em, atualizado_em, status, idioma, nome, email, telefone, pais, observacoes,
        consentimento_em, total, valor_agora, modo_pagamento, ip_hash, origem) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
        .bind(codigo, token, now, now, "solicitacao", idioma, cliente.nome, cliente.email, cliente.telefone, cliente.pais || null,
          cliente.observacoes || null, now, pag.total, pag.agora, escolha, ipHash, new URL(req.url).hostname).run();
      pedidoId = r.meta.last_row_id;
    } catch (e) { if (!String(e.message).includes("UNIQUE")) throw e; }
  }
  if (!pedidoId) return erro("falha_codigo", 500);

  const stmts = itens.map(({ it, cot, svc }, i) => env.DB.prepare(`INSERT INTO itens (pedido_id, ordem, servico_id, servico_nome, categoria, data, hora, inicio_utc,
    sentido, voo, origem, destino, pax, malas, cadeirinhas, pet, horas_extras, horas, dias, data_especial, valor, modo, valor_agora, linhas_json)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(pedidoId, i + 1, it.servico, svc.nome.pt, it.categoria, it.data, it.hora, cot.inicio,
    svc.sentido ? it.sentido : null, it.voo || null, it.origem || null, it.destino || null, it.pax, it.malas, it.cadeirinhas, it.pet ? 1 : 0,
    it.horasExtras, svc.tipo === "hora" ? it.horas : null, svc.tipo === "diaria" ? it.dias : null, cot.dataEspecial ? 1 : 0,
    cot.valor, pag.detalhes[i].modo, pag.detalhes[i].due, JSON.stringify(cot.linhas)));
  stmts.push(env.DB.prepare("INSERT INTO eventos (pedido_id, em, tipo, status_para, autor, texto) VALUES (?,?,?,?,?,?)")
    .bind(pedidoId, now, "criado", "solicitacao", "cliente", "Pedido feito pelo site"));
  await env.DB.batch(stmts);

  const pedido = { codigo, ...cliente, total: pag.total, valor_agora: pag.agora };
  const itensDb = itens.map(({ it, cot, svc }, i) => ({ servico_id: it.servico, servico_nome: svc.nome.pt, categoria: it.categoria, data: it.data, hora: it.hora,
    sentido: it.sentido, voo: it.voo, origem: it.origem, destino: it.destino, pax: it.pax, malas: it.malas, cadeirinhas: it.cadeirinhas, pet: it.pet,
    horas_extras: it.horasExtras, horas: it.horas, dias: it.dias, data_especial: cot.dataEspecial, valor: cot.valor, modo: pag.detalhes[i].modo }));
  const origem = new URL(req.url).origin;
  ctx.waitUntil(enviarAviso(env, `Nova reserva ${codigo} — ${cliente.nome} — ${brl(pag.total)}`, resumoTexto(pedido, itensDb, true, origem)));

  const msgWa = (idioma === "en" ? "Hello! I just booked on the website." : idioma === "es" ? "¡Hola! Acabo de reservar en el sitio." : "Olá! Acabei de fazer uma reserva pelo site.") +
    "\n\n" + resumoTexto(pedido, itensDb, false);
  return json({ ok: true, codigo, token, total: pag.total, valorAgora: pag.agora, status: "solicitacao",
    whatsapp: "https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(msgWa) });
}

/* ---------------- consulta do cliente ---------------- */
async function verPedidoCliente(env, codigo, token) {
  await prepararBanco(env);
  const p = await env.DB.prepare("SELECT id, codigo, token, status, criado_em, nome, total, valor_agora, idioma FROM pedidos WHERE codigo = ?").bind(codigo).first();
  if (!p || !token || p.token !== token) return erro("nao_encontrado", 404);
  const { results } = await env.DB.prepare("SELECT servico_nome, categoria, data, hora, valor FROM itens WHERE pedido_id = ? ORDER BY ordem").bind(p.id).all();
  delete p.id; delete p.token;
  return json({ ok: true, pedido: p, itens: results });
}

/* ---------------- admin (protegido pelo Cloudflare Access) ---------------- */
const b64urlBytes = (s) => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4)), (c) => c.charCodeAt(0));
let certsCache = { at: 0, keys: [] };
async function verificarAccess(req, env) {
  if (env.DEV_ADMIN === "1") return { email: "dev@local" };
  const jwt = req.headers.get("cf-access-jwt-assertion");
  if (!jwt || !env.ACCESS_TEAM || !env.ACCESS_AUD) return null;
  try {
    const [h, p, sig] = jwt.split(".");
    const header = JSON.parse(new TextDecoder().decode(b64urlBytes(h)));
    const payload = JSON.parse(new TextDecoder().decode(b64urlBytes(p)));
    const iss = `https://${env.ACCESS_TEAM}.cloudflareaccess.com`;
    if (payload.iss !== iss) return null;
    const aud = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
    if (!aud.includes(env.ACCESS_AUD)) return null;
    if (!payload.exp || payload.exp * 1000 < Date.now()) return null;
    if (Date.now() - certsCache.at > 3600e3 || !certsCache.keys.some((k) => k.kid === header.kid)) {
      const r = await fetch(iss + "/cdn-cgi/access/certs");
      certsCache = { at: Date.now(), keys: (await r.json()).keys || [] };
    }
    const jwk = certsCache.keys.find((k) => k.kid === header.kid);
    if (!jwk) return null;
    const key = await crypto.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
    const valido = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, b64urlBytes(sig), new TextEncoder().encode(h + "." + p));
    if (!valido) return null;
    const email = String(payload.email || "").toLowerCase();
    const permitidos = String(env.ADMIN_EMAILS || "").toLowerCase().split(",").map((x) => x.trim()).filter(Boolean);
    if (permitidos.length && !permitidos.includes(email)) return null;
    return { email };
  } catch (e) { console.error("access", e && e.message); return null; }
}

async function admin(req, env, url) {
  const user = await verificarAccess(req, env);
  if (!user) return erro("nao_autorizado", 401);
  await prepararBanco(env);
  const partes = url.pathname.replace(/^\/api\/admin\/?/, "").split("/").filter(Boolean);

  if (partes[0] === "eu") return json({ ok: true, email: user.email });

  if (partes[0] === "pedidos" && partes.length === 1 && req.method === "GET") {
    const st = url.searchParams.get("status"), q = (url.searchParams.get("q") || "").trim();
    const per = url.searchParams.get("periodo") || "proximos";
    let where = [], args = [];
    if (st && STATUS.includes(st)) { where.push("p.status = ?"); args.push(st); }
    if (q) { where.push("(p.codigo LIKE ? OR p.nome LIKE ? OR p.email LIKE ? OR p.telefone LIKE ?)"); const l = "%" + q + "%"; args.push(l, l, l, l); }
    if (per === "proximos") { where.push("(SELECT MAX(inicio_utc) FROM itens i WHERE i.pedido_id = p.id) >= ?"); args.push(new Date(Date.now() - 12 * 3600e3).toISOString()); }
    const sql = `SELECT p.id, p.codigo, p.status, p.criado_em, p.nome, p.telefone, p.email, p.total, p.valor_agora, p.idioma,
      (SELECT MIN(inicio_utc) FROM itens i WHERE i.pedido_id = p.id) AS primeiro_inicio,
      (SELECT COUNT(*) FROM itens i WHERE i.pedido_id = p.id) AS n_itens,
      (SELECT group_concat(servico_nome, ' + ') FROM itens i WHERE i.pedido_id = p.id) AS servicos
      FROM pedidos p ${where.length ? "WHERE " + where.join(" AND ") : ""}
      ORDER BY ${per === "proximos" ? "primeiro_inicio ASC" : "p.criado_em DESC"} LIMIT 300`;
    const { results } = await env.DB.prepare(sql).bind(...args).all();
    const cont = await env.DB.prepare("SELECT status, COUNT(*) n FROM pedidos GROUP BY status").all();
    return json({ ok: true, pedidos: results, contagem: Object.fromEntries(cont.results.map((r) => [r.status, r.n])) });
  }

  if (partes[0] === "pedidos" && partes[1]) {
    const p = await env.DB.prepare("SELECT * FROM pedidos WHERE codigo = ?").bind(partes[1]).first();
    if (!p) return erro("nao_encontrado", 404);
    if (req.method === "GET" && partes.length === 2) {
      const itens = (await env.DB.prepare("SELECT * FROM itens WHERE pedido_id = ? ORDER BY ordem").bind(p.id).all()).results;
      const eventos = (await env.DB.prepare("SELECT * FROM eventos WHERE pedido_id = ? ORDER BY id").bind(p.id).all()).results;
      delete p.token; delete p.ip_hash;
      return json({ ok: true, pedido: p, itens, eventos });
    }
    if (req.method === "POST" && partes[2] === "status") {
      let b; try { b = await lerJson(req, 4000); } catch { return erro("json_invalido"); }
      if (!STATUS.includes(b.status)) return erro("status_invalido");
      const now = agoraIso();
      await env.DB.batch([
        env.DB.prepare("UPDATE pedidos SET status = ?, atualizado_em = ? WHERE id = ?").bind(b.status, now, p.id),
        env.DB.prepare("INSERT INTO eventos (pedido_id, em, tipo, status_de, status_para, autor, texto) VALUES (?,?,?,?,?,?,?)")
          .bind(p.id, now, "status", p.status, b.status, user.email, String(b.nota || "").slice(0, 1000) || null),
      ]);
      return json({ ok: true });
    }
    if (req.method === "POST" && partes[2] === "nota") {
      let b; try { b = await lerJson(req, 4000); } catch { return erro("json_invalido"); }
      const texto = String(b.texto || "").trim().slice(0, 1000);
      if (!texto) return erro("nota_vazia");
      await env.DB.prepare("INSERT INTO eventos (pedido_id, em, tipo, autor, texto) VALUES (?,?,?,?,?)").bind(p.id, agoraIso(), "nota", user.email, texto).run();
      return json({ ok: true });
    }
  }
  return erro("rota", 404);
}

/* ---------------- roteador ---------------- */
async function api(req, env, ctx, url) {
  const p = url.pathname, m = req.method;
  if (m === "POST") {
    // só aceita POST do próprio site (proteção contra envio de outros domínios)
    const orig = req.headers.get("origin");
    if (orig && orig !== url.origin) return erro("origem", 403);
  }
  if (p === "/api/catalogo" && m === "GET") return json(catalogo(env), 200, { "cache-control": "public, max-age=300" });
  if (p === "/api/cotacao" && m === "POST") {
    let b; try { b = await lerJson(req, 4000); } catch { return erro("json_invalido"); }
    const it = normalizarItem(b);
    return json(b.categoria ? cotar(it) : cotarTodas(it));
  }
  if (p === "/api/pedidos" && m === "POST") return criarPedido(req, env, ctx);
  const mm = p.match(/^\/api\/pedidos\/(IET-[A-Z0-9]{6})$/);
  if (mm && m === "GET") return verPedidoCliente(env, mm[1], url.searchParams.get("t"));
  if (p.startsWith("/api/admin")) return admin(req, env, url);
  return erro("rota", 404);
}

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    let res;
    if (url.pathname.startsWith("/api/")) {
      try { res = await api(req, env, ctx, url); }
      catch (e) { console.error("api", e && e.stack); res = erro("interno", 500); }
    } else {
      res = await env.ASSETS.fetch(req);
    }
    // endereços de teste (*.workers.dev) nunca entram no Google
    if (url.hostname.endsWith(".workers.dev")) {
      res = new Response(res.body, res);
      res.headers.set("x-robots-tag", "noindex, nofollow");
    }
    return res;
  },
};
