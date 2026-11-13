/* Iguaçu Executive Transfer — Worker (API de reservas + site estático) */
import { CONFIG, CATEGORIAS, SERVICOS, CONSULTA, HORA_EXTRA, POR_HORA, POR_KM, DIARIA, datasEspeciais } from "./precos.js";
import { normalizarItem, cotar, cotarTodas, valorAgora, servico, aplicarPrecos, PRECOS_PADRAO } from "./cotacao.js";
import { buscarLugares, resolverRota } from "./rota.js";
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
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS pacotes (
      codigo TEXT PRIMARY KEY, criado_em TEXT NOT NULL, itens_json TEXT NOT NULL, ip_hash TEXT, idioma TEXT, aberturas INTEGER DEFAULT 0)`),
    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_pacotes_ip ON pacotes(ip_hash, criado_em)`),
    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_pedidos_status ON pedidos(status, criado_em)`),
    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_pedidos_ip ON pedidos(ip_hash, criado_em)`),
    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_itens_pedido ON itens(pedido_id)`),
    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_itens_inicio ON itens(inicio_utc)`),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS parceiros (
      id INTEGER PRIMARY KEY AUTOINCREMENT, codigo TEXT UNIQUE NOT NULL, criado_em TEXT NOT NULL, atualizado_em TEXT NOT NULL,
      tipo TEXT NOT NULL, status TEXT NOT NULL, categoria TEXT, empresa TEXT, responsavel TEXT NOT NULL, email TEXT NOT NULL,
      telefone TEXT NOT NULL, cidade TEXT, documento TEXT, veiculo TEXT, autorizacao TEXT, mensagem TEXT,
      comissao_pct REAL DEFAULT 0, chave_hash TEXT, chave_em TEXT, consentimento_em TEXT NOT NULL, ip_hash TEXT, origem TEXT, notas TEXT)`),
    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_parceiros_status ON parceiros(tipo, status, criado_em)`),
    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_parceiros_chave ON parceiros(chave_hash)`),
    // preços trocados pelo painel (o padrão continua no precos.js; apagar a linha volta ao padrão)
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS precos_editados (
      servico_id TEXT NOT NULL, categoria TEXT NOT NULL, valor REAL NOT NULL, atualizado_em TEXT NOT NULL, autor TEXT,
      PRIMARY KEY (servico_id, categoria))`),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS precos_hist (
      id INTEGER PRIMARY KEY AUTOINCREMENT, em TEXT NOT NULL, autor TEXT, servico_id TEXT NOT NULL, categoria TEXT NOT NULL, de REAL, para REAL)`),
    // pagamentos de comissão a parceiros que indicam clientes
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS comissoes_pagas (
      id INTEGER PRIMARY KEY AUTOINCREMENT, ref TEXT UNIQUE NOT NULL, parceiro_id INTEGER NOT NULL REFERENCES parceiros(id), mes TEXT NOT NULL,
      valor REAL NOT NULL, n_pedidos INTEGER NOT NULL, pct REAL, pago_em TEXT NOT NULL, autor TEXT, obs TEXT)`),
    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_comissoes_parc ON comissoes_pagas(parceiro_id, mes)`),
    // corridas oferecidas a motoristas parceiros (um item de um pedido, um motorista por vez)
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS corridas (
      id INTEGER PRIMARY KEY AUTOINCREMENT, pedido_id INTEGER NOT NULL REFERENCES pedidos(id), item_id INTEGER NOT NULL REFERENCES itens(id),
      parceiro_id INTEGER NOT NULL REFERENCES parceiros(id), status TEXT NOT NULL, repasse REAL, obs TEXT,
      criado_em TEXT NOT NULL, respondido_em TEXT, autor TEXT, motivo TEXT)`),
    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_corridas_parc ON corridas(parceiro_id, status)`),
    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_corridas_item ON corridas(item_id)`),
    // links de pagamento online (InfinitePay): um pedido pode ter vários (sinal, restante...)
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS pagamentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT, pedido_id INTEGER NOT NULL REFERENCES pedidos(id), provedor TEXT NOT NULL, order_nsu TEXT UNIQUE NOT NULL,
      descricao TEXT, valor REAL NOT NULL, url TEXT, status TEXT NOT NULL, criado_em TEXT NOT NULL, autor TEXT,
      pago_em TEXT, valor_pago REAL, metodo TEXT, parcelas INTEGER, slug TEXT, transaction_nsu TEXT, recibo_url TEXT)`),
    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_pagamentos_pedido ON pagamentos(pedido_id)`),
  ]);
  // coluna nova em tabela antiga: só cria se ainda não existir
  const cols = (await env.DB.prepare("PRAGMA table_info(pedidos)").all()).results.map((c) => c.name);
  if (!cols.includes("parceiro_id")) await env.DB.prepare("ALTER TABLE pedidos ADD COLUMN parceiro_id INTEGER").run();
  if (!cols.includes("comissao_paga_id")) await env.DB.prepare("ALTER TABLE pedidos ADD COLUMN comissao_paga_id INTEGER").run();
  if (!cols.includes("comissao_valor")) await env.DB.prepare("ALTER TABLE pedidos ADD COLUMN comissao_valor REAL").run();
  schemaPronto = true;
}

/* ---------------- preços editados no painel ----------------
   Lidos do banco a cada 30 s (por instância) e aplicados por cima do precos.js. Cotação, reserva e catálogo usam o mesmo valor. */
let precosLidosEm = 0;
async function carregarPrecos(env, forcar = false) {
  if (!forcar && Date.now() - precosLidosEm < 30e3) return;
  try {
    await prepararBanco(env);
    const { results } = await env.DB.prepare("SELECT servico_id, categoria, valor FROM precos_editados").all();
    const m = {};
    for (const r of results) (m[r.servico_id] ||= {})[r.categoria] = r.valor;
    aplicarPrecos(m);
    precosLidosEm = Date.now();
  } catch (e) { console.error("precos", e && e.message); }
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
      pagamentoViagens: CONFIG.pagamentoViagens, horaExtra: HORA_EXTRA, porHora: { minimoHoras: POR_HORA.minimoHoras, maximoHoras: POR_HORA.maximoHoras, pacoteHoras: POR_HORA.pacoteHoras, pacoteMult: POR_HORA.pacoteMult },
      turnstileSiteKey: env.TURNSTILE_SITEKEY || "", pagamentoOnline: false,
      porKm: { ...POR_KM, ativo: true }, diaria: DIARIA,
    },
    categorias: CATEGORIAS, servicos: SERVICOS, consulta: CONSULTA,
    datasEspeciais: [...datasEspeciais(ano), ...datasEspeciais(ano + 1)],
  };
}

/* ---------------- anti-spam ---------------- */
async function verificarTurnstile(env, token, ip) {
  if (!env.TURNSTILE_SECRET) {
    // sem a chave secreta: só libera se o site também estiver sem a chave pública (ex.: versão de teste)
    if (env.TURNSTILE_SITEKEY) { console.error("TURNSTILE_SECRET ausente: pedido recusado"); return false; }
    return true;
  }
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
    if (it.km && comLinks) linhas.push(`   Distância (só para a equipe): ${it.km} km por trecho` + (it.km_fora ? " · com taxa de fronteira" : ""));
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

/* Viagem sob medida: a distância e o país vêm SEMPRE do servidor */
async function prepararKm(env, it) {
  const svc = servico(it.servico);
  if (!svc || svc.tipo !== "km") return;
  it.rota = await resolverRota(env, it.de, it.para);
  if (it.de) it.origem = it.de.label || it.origem;
  const dm = (d) => (d || "").split("-").reverse().slice(0, 2).join("/");
  if (it.para) it.destino = (it.para.label || it.destino) + (it.idaVolta ? ` (ida e volta · volta ${dm(it.dataVolta)} às ${it.horaVolta})` : "");
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
    await prepararKm(env, it);
    const cot = cotar(it, agora);
    if (!cot.ok) return erro("item_invalido", 422, { item: i, motivo: cot.erro, detalhe: cot });
    if (!it.origem) return erro("item_invalido", 422, { item: i, motivo: "origem" });
    itens.push({ it, cot, svc: servico(it.servico) });
  }
  const parceiro = await parceiroDaChave(req, env);
  const escolha = body.modoPagamento === "total" ? "total" : "sinal";
  const pag = valorAgora(itens, escolha);

  await prepararBanco(env);
  const ipHash = ip ? await sha256(ip + (env.IP_SALT || "iet")) : null;
  if (ipHash) {
    const desde = new Date(agora - 15 * 60e3).toISOString();
    const r = await env.DB.prepare("SELECT COUNT(*) n FROM pedidos WHERE ip_hash = ? AND criado_em > ?").bind(ipHash, desde).first();
    if (r && r.n >= (parceiro ? 30 : 5)) return erro("muitas_tentativas", 429);
  }

  const now = agoraIso();
  const token = tokenHex();
  let codigo, pedidoId;
  for (let tent = 0; tent < 5 && !pedidoId; tent++) {
    codigo = "IET-" + aleatorio(6);
    try {
      const r = await env.DB.prepare(`INSERT INTO pedidos (codigo, token, criado_em, atualizado_em, status, idioma, nome, email, telefone, pais, observacoes,
        consentimento_em, total, valor_agora, modo_pagamento, ip_hash, origem, parceiro_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
        .bind(codigo, token, now, now, "solicitacao", idioma, cliente.nome, cliente.email, cliente.telefone, cliente.pais || null,
          cliente.observacoes || null, now, pag.total, pag.agora, escolha, ipHash, new URL(req.url).hostname, parceiro ? parceiro.id : null).run();
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
    .bind(pedidoId, now, "criado", "solicitacao", parceiro ? "parceiro " + parceiro.codigo : "cliente", parceiro ? `Reserva feita pelo parceiro ${parceiro.empresa || parceiro.responsavel} (${parceiro.codigo})` : "Pedido feito pelo site"));
  await env.DB.batch(stmts);

  const pedido = { codigo, ...cliente, total: pag.total, valor_agora: pag.agora };
  const itensDb = itens.map(({ it, cot, svc }, i) => ({ servico_id: it.servico, servico_nome: svc.nome.pt, categoria: it.categoria, data: it.data, hora: it.hora,
    sentido: it.sentido, voo: it.voo, origem: it.origem, destino: it.destino, pax: it.pax, malas: it.malas, cadeirinhas: it.cadeirinhas, pet: it.pet,
    horas_extras: it.horasExtras, horas: it.horas, dias: it.dias, data_especial: cot.dataEspecial, valor: cot.valor, modo: pag.detalhes[i].modo,
    km: cot.km || null, km_fora: it.rota ? !!it.rota.fora : false }));
  const origem = new URL(req.url).origin;
  const txtParc = parceiro ? `Reserva feita pelo parceiro: ${parceiro.empresa || parceiro.responsavel} (${parceiro.codigo}) · comissão ${Number(parceiro.comissao_pct) || 0}%\n\n` : "";
  ctx.waitUntil(enviarAviso(env, `Nova reserva ${codigo} — ${cliente.nome} — ${brl(pag.total)}` + (parceiro ? ` — parceiro ${parceiro.codigo}` : ""), txtParc + resumoTexto(pedido, itensDb, true, origem)));

  const msgWa = (idioma === "en" ? "Hello! I just booked on the website." : idioma === "es" ? "¡Hola! Acabo de reservar en el sitio." : "Olá! Acabei de fazer uma reserva pelo site.") +
    "\n\n" + resumoTexto(pedido, itensDb, false);
  return json({ ok: true, codigo, token, total: pag.total, valorAgora: pag.agora, status: "solicitacao",
    whatsapp: "https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(msgWa) });
}

/* ---------------- pacote compartilhado (link curto com os itens do carrinho, sem dados pessoais) ---------------- */
const CAMPOS_PACOTE = ["servico", "categoria", "data", "hora", "sentido", "voo", "origem", "destino", "pax", "malas", "cadeirinhas", "pet", "horasExtras", "horas", "dias", "idaVolta", "dataVolta", "horaVolta", "de", "para"];
async function criarPacote(req, env) {
  let body;
  try { body = await lerJson(req, 12000); } catch { return erro("json_invalido"); }
  const brutos = Array.isArray(body.itens) ? body.itens : [];
  if (!brutos.length || brutos.length > 6) return erro("sem_itens");
  const itens = [];
  for (const b of brutos) {
    const it = normalizarItem(b || {});
    if (!servico(it.servico)) return erro("item_invalido");
    const x = {};
    for (const k of CAMPOS_PACOTE) { const v = it[k]; if (v !== "" && v !== null && v !== undefined && v !== false) x[k] = v; }
    itens.push(x);
  }
  await prepararBanco(env);
  const ip = req.headers.get("cf-connecting-ip") || "";
  const ipHash = ip ? await sha256(ip + (env.IP_SALT || "iet")) : null;
  const agora = Date.now();
  if (ipHash) {
    const r = await env.DB.prepare("SELECT COUNT(*) n FROM pacotes WHERE ip_hash = ? AND criado_em > ?").bind(ipHash, new Date(agora - 3600e3).toISOString()).first();
    if (r && r.n >= 30) return erro("muitas_tentativas", 429);
  }
  const idioma = ["pt", "en", "es"].includes(body.idioma) ? body.idioma : "pt";
  for (let t = 0; t < 5; t++) {
    const codigo = aleatorio(7);
    try {
      await env.DB.prepare("INSERT INTO pacotes (codigo, criado_em, itens_json, ip_hash, idioma) VALUES (?,?,?,?,?)").bind(codigo, agoraIso(), JSON.stringify(itens), ipHash, idioma).run();
      return json({ ok: true, codigo, url: new URL(req.url).origin + "/reservar/?pacote=" + codigo });
    } catch (e) { if (!String(e.message).includes("UNIQUE")) throw e; }
  }
  return erro("falha_codigo", 500);
}
async function verPacote(env, codigo) {
  await prepararBanco(env);
  const p = await env.DB.prepare("SELECT itens_json, criado_em, idioma FROM pacotes WHERE codigo = ?").bind(codigo).first();
  if (!p) return erro("nao_encontrado", 404);
  if (Date.parse(p.criado_em) < Date.now() - 120 * 864e5) return erro("expirado", 410);
  await env.DB.prepare("UPDATE pacotes SET aberturas = aberturas + 1 WHERE codigo = ?").bind(codigo).run();
  return json({ ok: true, itens: JSON.parse(p.itens_json), idioma: p.idioma, criado_em: p.criado_em });
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

/* ---------------- parceiros ----------------
   tipo "indica": hotéis, agências, guias e empresas que reservam em nome do cliente e recebem comissão (%).
   tipo "atende": táxis, motoristas particulares, 7 lugares e vans que atendem quando a frota lota.
   O parceiro aprovado recebe um link de acesso pessoal (gerado no painel); no banco fica só o hash da chave. */
const PARC_TIPOS = { indica: ["hotel", "agencia", "guia", "empresa", "outro"], atende: ["taxi", "particular", "sete", "van"] };
const PARC_STATUS = ["novo", "aprovado", "pausado", "recusado"];
async function cadastrarParceiro(req, env, ctx) {
  let b; try { b = await lerJson(req, 8000); } catch { return erro("json_invalido"); }
  if (b.website) return json({ ok: true, codigo: "P-OK" });
  const ip = req.headers.get("cf-connecting-ip") || "";
  if (!(await verificarTurnstile(env, b.turnstile, ip))) return erro("verificacao", 403);
  const s = (v, n) => String(v == null ? "" : v).trim().slice(0, n);
  const tipo = b.tipo === "atende" ? "atende" : b.tipo === "indica" ? "indica" : "";
  if (!tipo) return erro("tipo");
  const d = { categoria: s(b.categoria, 20), empresa: s(b.empresa, 120), responsavel: s(b.responsavel, 120), email: s(b.email, 160).toLowerCase(),
    telefone: s(b.telefone, 40), cidade: s(b.cidade, 80), documento: s(b.documento, 40), veiculo: s(b.veiculo, 120), autorizacao: s(b.autorizacao, 20), mensagem: s(b.mensagem, 1000) };
  if (!PARC_TIPOS[tipo].includes(d.categoria)) return erro("categoria");
  if (d.responsavel.length < 3) return erro("nome");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)) return erro("email");
  if (d.telefone.replace(/\D/g, "").length < 8) return erro("telefone");
  if (tipo === "indica" && d.empresa.length < 2) return erro("empresa");
  if (tipo === "atende" && d.veiculo.length < 2) return erro("veiculo");
  if (b.consentimento !== true) return erro("consentimento");
  await prepararBanco(env);
  const ipHash = ip ? await sha256(ip + (env.IP_SALT || "iet")) : null;
  if (ipHash) {
    const r = await env.DB.prepare("SELECT COUNT(*) n FROM parceiros WHERE ip_hash = ? AND criado_em > ?").bind(ipHash, new Date(Date.now() - 3600e3).toISOString()).first();
    if (r && r.n >= 5) return erro("muitas_tentativas", 429);
  }
  const now = agoraIso();
  let codigo;
  for (let t = 0; t < 5 && !codigo; t++) {
    const c = "P-" + aleatorio(5);
    try {
      await env.DB.prepare(`INSERT INTO parceiros (codigo, criado_em, atualizado_em, tipo, status, categoria, empresa, responsavel, email, telefone, cidade, documento, veiculo, autorizacao, mensagem, consentimento_em, ip_hash, origem)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(c, now, now, tipo, "novo", d.categoria, d.empresa || null, d.responsavel, d.email, d.telefone, d.cidade || null,
        d.documento || null, d.veiculo || null, d.autorizacao || null, d.mensagem || null, now, ipHash, new URL(req.url).hostname).run();
      codigo = c;
    } catch (e) { if (!String(e.message).includes("UNIQUE")) throw e; }
  }
  if (!codigo) return erro("falha_codigo", 500);
  const nomes = { hotel: "Hotel ou pousada", agencia: "Agência", guia: "Guia", empresa: "Empresa", outro: "Outro", taxi: "Táxi", particular: "Motorista particular", sete: "7 lugares", van: "Van" };
  const linhas = [`Cadastro ${codigo} — ${tipo === "indica" ? "parceiro que indica clientes" : "parceiro que atende corridas"}`, `Tipo: ${nomes[d.categoria]}`,
    d.empresa ? `Empresa: ${d.empresa}` : "", `Responsável: ${d.responsavel}`, `WhatsApp: ${d.telefone}`, `E-mail: ${d.email}`, d.cidade ? `Cidade: ${d.cidade}` : "",
    d.documento ? `CNPJ/Cadastur: ${d.documento}` : "", d.veiculo ? `Veículo: ${d.veiculo}` : "", d.autorizacao ? `Autorização para transporte: ${d.autorizacao}` : "",
    d.mensagem ? `\nMensagem: ${d.mensagem}` : "", "", `Painel: ${new URL(req.url).origin}/admin/parceiros.html#${codigo}`].filter((x) => x !== "");
  ctx.waitUntil(enviarAviso(env, `Novo parceiro ${codigo} — ${d.empresa || d.responsavel}`, linhas.join("\n")));
  return json({ ok: true, codigo });
}
async function parceiroDaChave(req, env, tipo = "indica") {
  const chave = (req.headers.get("x-parceiro") || "").trim();
  if (!/^[a-f0-9]{32}$/.test(chave)) return null;
  await prepararBanco(env);
  const p = await env.DB.prepare("SELECT * FROM parceiros WHERE chave_hash = ?").bind(await sha256("parceiro:" + chave)).first();
  return p && p.status === "aprovado" && p.tipo === tipo ? p : null;
}
async function areaParceiro(req, env, url) {
  const p = await parceiroDaChave(req, env);
  if (!p) return erro("nao_autorizado", 401);
  const rota = url.pathname.replace(/^\/api\/parceiro\/?/, "");
  if (rota === "eu") return json({ ok: true, parceiro: { codigo: p.codigo, empresa: p.empresa, responsavel: p.responsavel, comissao_pct: p.comissao_pct } });
  if (rota === "pedidos") {
    const { results } = await env.DB.prepare(`SELECT p.codigo, p.status, p.criado_em, p.nome, p.total, p.comissao_valor,
      (SELECT pago_em FROM comissoes_pagas c WHERE c.id = p.comissao_paga_id) AS comissao_paga_em,
      (SELECT MIN(data || ' ' || hora) FROM itens i WHERE i.pedido_id = p.id) AS primeira,
      (SELECT group_concat(servico_nome, ' + ') FROM itens i WHERE i.pedido_id = p.id) AS servicos
      FROM pedidos p WHERE p.parceiro_id = ? ORDER BY p.criado_em DESC LIMIT 300`).bind(p.id).all();
    const pct = Number(p.comissao_pct) || 0;
    const pedidos = results.map((x) => ({ ...x, comissao: x.comissao_paga_em ? x.comissao_valor : x.status === "cancelada" ? 0 : Math.round(x.total * pct) / 100 }));
    const pagamentos = (await env.DB.prepare("SELECT mes, valor, n_pedidos, pago_em FROM comissoes_pagas WHERE parceiro_id = ? ORDER BY pago_em DESC LIMIT 60").bind(p.id).all()).results;
    return json({ ok: true, comissao_pct: pct, pedidos, pagamentos });
  }
  return erro("rota", 404);
}

/* ---------------- área do motorista parceiro (tipo "atende") ----------------
   O motorista vê só as corridas oferecidas a ele. Nome, telefone do passageiro e voo aparecem depois que ele aceita. */
const CORRIDA_ST = ["ofertada", "aceita", "recusada", "cancelada"];
function corridaParaMotorista(c) {
  const aceita = c.status === "aceita";
  return {
    id: c.id, status: c.status, repasse: c.repasse, obs: c.obs, criado_em: c.criado_em, respondido_em: c.respondido_em,
    pedido: c.pedido_codigo, pedido_status: c.pedido_status, servico: c.servico_nome, categoria: c.categoria, data: c.data, hora: c.hora, inicio: c.inicio_utc,
    sentido: c.sentido, origem: c.origem, destino: c.destino, pax: c.pax, malas: c.malas, cadeirinhas: c.cadeirinhas, pet: !!c.pet, horas: c.horas, dias: c.dias, horas_extras: c.horas_extras,
    ...(aceita ? { passageiro: c.nome, telefone: c.telefone, voo: c.voo, observacoes: c.observacoes } : {}),
  };
}
const SQL_CORRIDA = `SELECT c.*, p.codigo AS pedido_codigo, p.status AS pedido_status, p.nome, p.telefone, p.observacoes,
  i.servico_nome, i.categoria, i.data, i.hora, i.inicio_utc, i.sentido, i.voo, i.origem, i.destino, i.pax, i.malas, i.cadeirinhas, i.pet, i.horas, i.dias, i.horas_extras
  FROM corridas c JOIN pedidos p ON p.id = c.pedido_id JOIN itens i ON i.id = c.item_id`;
async function areaMotorista(req, env, url) {
  const mot = await parceiroDaChave(req, env, "atende");
  if (!mot) return erro("nao_autorizado", 401);
  const partes = url.pathname.replace(/^\/api\/motorista\/?/, "").split("/").filter(Boolean);
  if (partes[0] === "eu" && req.method === "GET") return json({ ok: true, motorista: { codigo: mot.codigo, nome: mot.empresa || mot.responsavel, responsavel: mot.responsavel, veiculo: mot.veiculo } });
  if (partes[0] === "corridas" && partes.length === 1 && req.method === "GET") {
    const { results } = await env.DB.prepare(SQL_CORRIDA + " WHERE c.parceiro_id = ? AND c.status != 'cancelada' ORDER BY i.inicio_utc DESC LIMIT 200").bind(mot.id).all();
    return json({ ok: true, corridas: results.map(corridaParaMotorista) });
  }
  if (partes[0] === "corridas" && /^\d+$/.test(partes[1] || "") && req.method === "POST") {
    let b; try { b = await lerJson(req, 2000); } catch { return erro("json_invalido"); }
    const c = await env.DB.prepare(SQL_CORRIDA + " WHERE c.id = ? AND c.parceiro_id = ?").bind(+partes[1], mot.id).first();
    if (!c) return erro("nao_encontrado", 404);
    if (c.status !== "ofertada") return erro("ja_respondida");
    if (c.pedido_status === "cancelada") return erro("pedido_cancelado");
    if (Date.parse(c.inicio_utc) < Date.now()) return erro("passou");
    const acao = b.acao === "aceitar" ? "aceita" : b.acao === "recusar" ? "recusada" : "";
    if (!acao) return erro("acao");
    const motivo = String(b.motivo || "").trim().slice(0, 300) || null, now = agoraIso();
    const r = await env.DB.prepare("UPDATE corridas SET status = ?, respondido_em = ?, motivo = ? WHERE id = ? AND status = 'ofertada'").bind(acao, now, motivo, c.id).run();
    if (!r.meta || !r.meta.changes) return erro("ja_respondida");
    const quem = (mot.empresa || mot.responsavel) + " (" + mot.codigo + ")";
    const texto = (acao === "aceita" ? "Motorista aceitou: " : "Motorista recusou: ") + quem + " · " + c.servico_nome + " " + c.data + " " + c.hora + (motivo ? " · " + motivo : "");
    await env.DB.prepare("INSERT INTO eventos (pedido_id, em, tipo, autor, texto) VALUES (?,?,?,?,?)").bind(c.pedido_id, now, "corrida", "motorista " + mot.codigo, texto).run();
    try { await enviarAviso(env, (acao === "aceita" ? "Corrida ACEITA " : "Corrida RECUSADA ") + c.pedido_codigo, texto + "\n\nPainel: " + url.origin + "/admin/#" + c.pedido_codigo); } catch (e) { console.error("aviso corrida", e && e.message); }
    const nova = await env.DB.prepare(SQL_CORRIDA + " WHERE c.id = ?").bind(c.id).first();
    return json({ ok: true, corrida: corridaParaMotorista(nova) });
  }
  return erro("rota", 404);
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

/* ---------------- pagamento online (InfinitePay Checkout) ----------------
   O painel gera o link com o valor certo; o cliente paga por Pix ou cartão na página do InfinitePay.
   A confirmação NUNCA confia só no aviso recebido: sempre conferimos no /payment_check do InfinitePay. */
const IP_API = "https://api.checkout.infinitepay.io";
async function ipCriarLink(env, corpo) {
  if (env.INFINITEPAY_MOCK === "1") return { url: corpo.redirect_url + "&mock=1&order_nsu=" + encodeURIComponent(corpo.order_nsu) + "&slug=mock-" + corpo.order_nsu + "&transaction_nsu=tx-" + corpo.order_nsu + "&capture_method=pix" };
  const r = await fetch(IP_API + "/links", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(corpo), signal: AbortSignal.timeout(12000) });
  const t = await r.text(); let d = {}; try { d = JSON.parse(t); } catch {}
  if (!r.ok || !d.url) { console.error("infinitepay links", r.status, t.slice(0, 300)); return { erro: d.error || d.message || ("http_" + r.status) }; }
  return { url: d.url };
}
async function ipConferir(env, x) {
  if (env.INFINITEPAY_MOCK === "1") return { success: true, paid: true, amount: 0, paid_amount: null, installments: 1, capture_method: x.capture_method || "pix" };
  const r = await fetch(IP_API + "/payment_check", { method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ handle: env.INFINITEPAY_HANDLE, order_nsu: x.order_nsu, transaction_nsu: x.transaction_nsu, slug: x.slug }), signal: AbortSignal.timeout(12000) });
  try { return await r.json(); } catch { return { success: false }; }
}
/* Confere e, se pago, marca o pagamento e o pedido. Usado pelo aviso do InfinitePay e pela página de retorno do cliente. */
async function confirmarPagamento(env, x, origem) {
  const s = (v, n = 120) => String(v == null ? "" : v).trim().slice(0, n);
  const dados = { order_nsu: s(x.order_nsu), transaction_nsu: s(x.transaction_nsu), slug: s(x.slug), capture_method: s(x.capture_method, 20) };
  if (!/^IET-[A-Z0-9]{6}-[A-Z0-9]{4}$/.test(dados.order_nsu) || !dados.slug || !dados.transaction_nsu) return { ok: false, erro: "dados" };
  await prepararBanco(env);
  const pg = await env.DB.prepare("SELECT pg.*, p.codigo, p.status AS pedido_status, p.nome FROM pagamentos pg JOIN pedidos p ON p.id = pg.pedido_id WHERE pg.order_nsu = ?").bind(dados.order_nsu).first();
  if (!pg) return { ok: false, erro: "nao_encontrado" };
  if (pg.status === "pago") return { ok: true, pago: true, codigo: pg.codigo, ja: true };
  const c = await ipConferir(env, dados);
  if (!c || !c.success || !c.paid) return { ok: true, pago: false, codigo: pg.codigo };
  const valorPago = c.paid_amount != null ? c.paid_amount / 100 : pg.valor, now = agoraIso();
  const r = await env.DB.prepare("UPDATE pagamentos SET status = 'pago', pago_em = ?, valor_pago = ?, metodo = ?, parcelas = ?, slug = ?, transaction_nsu = ?, recibo_url = ? WHERE id = ? AND status != 'pago'")
    .bind(now, valorPago, s(c.capture_method || dados.capture_method, 20), c.installments || 1, dados.slug, dados.transaction_nsu, s(x.receipt_url, 300) || null, pg.id).run();
  if (!r.meta || !r.meta.changes) return { ok: true, pago: true, codigo: pg.codigo, ja: true };
  const metodo = (c.capture_method || dados.capture_method) === "pix" ? "Pix" : "cartão" + (c.installments > 1 ? " em " + c.installments + "x" : "");
  const texto = "Pagamento recebido: " + brl(valorPago) + " por " + metodo + " (" + (pg.descricao || "pagamento") + ")";
  const ops = [env.DB.prepare("INSERT INTO eventos (pedido_id, em, tipo, autor, texto) VALUES (?,?,?,?,?)").bind(pg.pedido_id, now, "pagamento", "InfinitePay", texto)];
  if (["solicitacao", "pagamento_pendente"].includes(pg.pedido_status)) {
    ops.push(env.DB.prepare("UPDATE pedidos SET status = 'aprovado', atualizado_em = ? WHERE id = ?").bind(now, pg.pedido_id));
    ops.push(env.DB.prepare("INSERT INTO eventos (pedido_id, em, tipo, status_de, status_para, autor, texto) VALUES (?,?,?,?,?,?,?)").bind(pg.pedido_id, now, "status", pg.pedido_status, "aprovado", "InfinitePay", null));
  }
  await env.DB.batch(ops);
  await enviarAviso(env, "Pagamento recebido " + pg.codigo + " · " + brl(valorPago), texto + "\nCliente: " + pg.nome + "\n\nPainel: " + origem + "/admin/#" + pg.codigo);
  return { ok: true, pago: true, codigo: pg.codigo };
}
async function avisoInfinitePay(req, env, ctx, url) {
  let b; try { b = await lerJson(req, 20000); } catch { return erro("json_invalido"); }
  // responde rápido (o InfinitePay espera ~1 s) e confere em segundo plano
  ctx.waitUntil(confirmarPagamento(env, b, url.origin).catch((e) => console.error("ip aviso", e && e.message)));
  return json({ ok: true });
}

/* Preços: lista de serviços com o padrão e o valor atual; salvar troca um ou vários valores de uma vez */
async function adminPrecos(req, env, user) {
  if (req.method === "GET") {
    const editados = (await env.DB.prepare("SELECT servico_id, categoria, valor, atualizado_em, autor FROM precos_editados").all()).results;
    const hist = (await env.DB.prepare("SELECT em, autor, servico_id, categoria, de, para FROM precos_hist ORDER BY id DESC LIMIT 60").all()).results;
    const servicos = SERVICOS.filter((s) => s.tipo !== "km").map((s) => ({ id: s.id, nome: s.nome && s.nome.pt, grupo: s.grupo, tipo: s.tipo, oculto: !!s.oculto, padrao: PRECOS_PADRAO[s.id], atual: s.precos }));
    return json({ ok: true, categorias: Object.fromEntries(Object.entries(CATEGORIAS).map(([k, v]) => [k, (v.nome && v.nome.pt) || k])), servicos, editados, hist });
  }
  if (req.method !== "POST") return erro("rota", 404);
  let b; try { b = await lerJson(req, 40000); } catch { return erro("json_invalido"); }
  const lista = Array.isArray(b.mudancas) ? b.mudancas.slice(0, 400) : [];
  if (!lista.length) return erro("nada_mudou");
  const atuais = Object.fromEntries((await env.DB.prepare("SELECT servico_id, categoria, valor FROM precos_editados").all()).results.map((r) => [r.servico_id + "|" + r.categoria, r.valor]));
  const ops = [], now = agoraIso();
  for (const x of lista) {
    const sid = String(x.servico || ""), cat = String(x.categoria || ""), pad = PRECOS_PADRAO[sid];
    if (!pad || !(cat in pad)) return erro("servico_invalido", 400, { servico: sid, categoria: cat });
    const antes = atuais[sid + "|" + cat] ?? pad[cat];
    const voltar = x.valor === "" || x.valor == null || x.padrao === true;
    const v = voltar ? null : Math.round(Number(String(x.valor).replace(",", ".")) * 100) / 100;
    if (!voltar && !(v >= 1 && v <= 200000)) return erro("valor_invalido", 400, { servico: sid, categoria: cat });
    const depois = voltar ? pad[cat] : v;
    if (depois === antes) continue;
    if (voltar || v === pad[cat]) ops.push(env.DB.prepare("DELETE FROM precos_editados WHERE servico_id = ? AND categoria = ?").bind(sid, cat));
    else ops.push(env.DB.prepare(`INSERT INTO precos_editados (servico_id, categoria, valor, atualizado_em, autor) VALUES (?,?,?,?,?)
      ON CONFLICT(servico_id, categoria) DO UPDATE SET valor = excluded.valor, atualizado_em = excluded.atualizado_em, autor = excluded.autor`).bind(sid, cat, v, now, user.email));
    ops.push(env.DB.prepare("INSERT INTO precos_hist (em, autor, servico_id, categoria, de, para) VALUES (?,?,?,?,?,?)").bind(now, user.email, sid, cat, antes, depois));
  }
  if (!ops.length) return json({ ok: true, alterados: 0 });
  await env.DB.batch(ops);
  await carregarPrecos(env, true);
  return json({ ok: true, alterados: ops.length / 2 });
}

/* Comissões: o mês conta pela data da viagem. Entram só reservas "concluídas" (realizadas).
   Marcar como pago guarda o valor de cada reserva naquele momento; desfazer apaga o pagamento. */
const mesValido = (m) => /^\d{4}-(0[1-9]|1[0-2])$/.test(m || "");
const comissaoDe = (total, pct) => Math.round(total * pct) / 100;
async function adminComissoes(req, env, url, user, partes) {
  if (req.method === "GET" && partes.length === 1) {
    const mes = mesValido(url.searchParams.get("mes")) ? url.searchParams.get("mes") : new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 7);
    const { results } = await env.DB.prepare(`SELECT * FROM (SELECT p.codigo, p.status, p.nome, p.total, p.comissao_valor, p.comissao_paga_id, pa.codigo AS pc,
      (SELECT MIN(data) FROM itens i WHERE i.pedido_id = p.id) AS data
      FROM pedidos p JOIN parceiros pa ON pa.id = p.parceiro_id WHERE p.status != 'cancelada') WHERE substr(data, 1, 7) = ? ORDER BY data`).bind(mes).all();
    const pags = (await env.DB.prepare(`SELECT c.id, c.mes, c.valor, c.n_pedidos, c.pct, c.pago_em, c.autor, c.obs, pa.codigo AS pc FROM comissoes_pagas c JOIN parceiros pa ON pa.id = c.parceiro_id WHERE c.mes = ? ORDER BY c.id`).bind(mes).all()).results;
    const parcs = (await env.DB.prepare("SELECT codigo, COALESCE(empresa, responsavel) AS nome, responsavel, telefone, comissao_pct, status FROM parceiros WHERE tipo = 'indica'").all()).results;
    const por = {};
    for (const pa of parcs) por[pa.codigo] = { ...pa, pedidos: [], pagamentos: [], a_pagar: 0, n_a_pagar: 0, pago: 0, previsto: 0, n_previstos: 0 };
    for (const x of results) {
      const g = por[x.pc]; if (!g) continue;
      const pago = !!x.comissao_paga_id, conc = x.status === "concluida";
      const com = pago ? x.comissao_valor : comissaoDe(x.total, Number(g.comissao_pct) || 0);
      g.pedidos.push({ codigo: x.codigo, status: x.status, nome: x.nome, total: x.total, data: x.data, comissao: com, paga: pago });
      if (pago) g.pago += com; else if (conc) { g.a_pagar += com; g.n_a_pagar++; } else { g.previsto += com; g.n_previstos++; }
    }
    for (const c of pags) if (por[c.pc]) por[c.pc].pagamentos.push(c);
    const lista = Object.values(por).filter((g) => g.pedidos.length || g.pagamentos.length).map((g) => ({ ...g, a_pagar: Math.round(g.a_pagar * 100) / 100, pago: Math.round(g.pago * 100) / 100, previsto: Math.round(g.previsto * 100) / 100 }));
    const soma = (k) => Math.round(lista.reduce((a, g) => a + g[k], 0) * 100) / 100;
    return json({ ok: true, mes, parceiros: lista, totais: { a_pagar: soma("a_pagar"), pago: soma("pago"), previsto: soma("previsto") } });
  }
  if (req.method !== "POST") return erro("rota", 404);
  let b; try { b = await lerJson(req, 2000); } catch { return erro("json_invalido"); }
  if (partes[1] === "pagar") {
    if (!mesValido(b.mes)) return erro("mes");
    const pa = await env.DB.prepare("SELECT * FROM parceiros WHERE codigo = ? AND tipo = 'indica'").bind(String(b.parceiro || "")).first();
    if (!pa) return erro("nao_encontrado", 404);
    const pct = Number(pa.comissao_pct) || 0;
    const { results } = await env.DB.prepare(`SELECT * FROM (SELECT p.id, p.total, (SELECT MIN(data) FROM itens i WHERE i.pedido_id = p.id) AS data FROM pedidos p
      WHERE p.parceiro_id = ? AND p.status = 'concluida' AND p.comissao_paga_id IS NULL) WHERE substr(data, 1, 7) = ?`).bind(pa.id, b.mes).all();
    if (!results.length) return erro("nada_a_pagar");
    const ref = tokenHex(), now = agoraIso();
    const valor = Math.round(results.reduce((a, x) => a + comissaoDe(x.total, pct), 0) * 100) / 100;
    const obs = String(b.obs || "").trim().slice(0, 300) || null;
    const ops = [env.DB.prepare("INSERT INTO comissoes_pagas (ref, parceiro_id, mes, valor, n_pedidos, pct, pago_em, autor, obs) VALUES (?,?,?,?,?,?,?,?,?)").bind(ref, pa.id, b.mes, valor, results.length, pct, now, user.email, obs)];
    for (const x of results) ops.push(env.DB.prepare("UPDATE pedidos SET comissao_paga_id = (SELECT id FROM comissoes_pagas WHERE ref = ?), comissao_valor = ? WHERE id = ? AND comissao_paga_id IS NULL").bind(ref, comissaoDe(x.total, pct), x.id));
    await env.DB.batch(ops);
    return json({ ok: true, valor, n_pedidos: results.length });
  }
  if (partes[1] === "desfazer") {
    const c = await env.DB.prepare("SELECT id FROM comissoes_pagas WHERE id = ?").bind(+b.id || 0).first();
    if (!c) return erro("nao_encontrado", 404);
    await env.DB.batch([
      env.DB.prepare("UPDATE pedidos SET comissao_paga_id = NULL, comissao_valor = NULL WHERE comissao_paga_id = ?").bind(c.id),
      env.DB.prepare("DELETE FROM comissoes_pagas WHERE id = ?").bind(c.id),
    ]);
    return json({ ok: true });
  }
  return erro("rota", 404);
}

async function admin(req, env, url) {
  const user = await verificarAccess(req, env);
  if (!user) return erro("nao_autorizado", 401);
  await prepararBanco(env);
  const partes = url.pathname.replace(/^\/api\/admin\/?/, "").split("/").filter(Boolean);

  if (partes[0] === "eu") return json({ ok: true, email: user.email });
  if (partes[0] === "precos") return adminPrecos(req, env, user);
  if (partes[0] === "comissoes") return adminComissoes(req, env, url, user, partes);
  if (partes[0] === "motoristas" && req.method === "GET") {
    const { results } = await env.DB.prepare(`SELECT codigo, COALESCE(empresa, responsavel) AS nome, responsavel, categoria, veiculo, telefone, cidade, (chave_hash IS NOT NULL) AS tem_acesso,
      (SELECT COUNT(*) FROM corridas c WHERE c.parceiro_id = parceiros.id AND c.status = 'aceita') AS aceitas
      FROM parceiros WHERE tipo = 'atende' AND status = 'aprovado' ORDER BY nome`).all();
    return json({ ok: true, motoristas: results });
  }
  if (partes[0] === "corridas" && /^\d+$/.test(partes[1] || "") && partes[2] === "cancelar" && req.method === "POST") {
    const c = await env.DB.prepare("SELECT c.*, pa.codigo AS pc FROM corridas c JOIN parceiros pa ON pa.id = c.parceiro_id WHERE c.id = ?").bind(+partes[1]).first();
    if (!c) return erro("nao_encontrado", 404);
    if (c.status === "cancelada" || c.status === "recusada") return erro("ja_encerrada");
    const now = agoraIso();
    await env.DB.batch([
      env.DB.prepare("UPDATE corridas SET status = 'cancelada', respondido_em = COALESCE(respondido_em, ?) WHERE id = ?").bind(now, c.id),
      env.DB.prepare("INSERT INTO eventos (pedido_id, em, tipo, autor, texto) VALUES (?,?,?,?,?)").bind(c.pedido_id, now, "corrida", user.email, "Corrida retirada do motorista " + c.pc + (c.status === "aceita" ? " (já tinha aceitado: avise o motorista)" : "")),
    ]);
    return json({ ok: true, avisar: c.status === "aceita" });
  }

  if (partes[0] === "parceiros") {
    if (partes.length === 1 && req.method === "GET") {
      const tipo = url.searchParams.get("tipo"), st = url.searchParams.get("status");
      const where = [], args = [];
      if (tipo === "indica" || tipo === "atende") { where.push("tipo = ?"); args.push(tipo); }
      if (PARC_STATUS.includes(st)) { where.push("status = ?"); args.push(st); }
      const { results } = await env.DB.prepare(`SELECT id, codigo, criado_em, tipo, status, categoria, empresa, responsavel, telefone, cidade, comissao_pct,
        (chave_hash IS NOT NULL) AS tem_acesso, (SELECT COUNT(*) FROM pedidos WHERE parceiro_id = parceiros.id) AS n_pedidos
        FROM parceiros ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY criado_em DESC LIMIT 500`).bind(...args).all();
      const cont = (await env.DB.prepare("SELECT tipo, status, COUNT(*) n FROM parceiros GROUP BY tipo, status").all()).results;
      return json({ ok: true, parceiros: results, contagem: cont });
    }
    const p = partes[1] && await env.DB.prepare("SELECT * FROM parceiros WHERE codigo = ?").bind(partes[1]).first();
    if (!p) return erro("nao_encontrado", 404);
    if (req.method === "GET" && partes.length === 2) {
      const { results } = await env.DB.prepare(`SELECT codigo, status, criado_em, nome, total, comissao_valor, (comissao_paga_id IS NOT NULL) AS comissao_paga FROM pedidos WHERE parceiro_id = ? ORDER BY criado_em DESC LIMIT 300`).bind(p.id).all();
      const corridas = (await env.DB.prepare(SQL_CORRIDA + " WHERE c.parceiro_id = ? ORDER BY c.criado_em DESC LIMIT 200").bind(p.id).all()).results
        .map((c) => ({ id: c.id, status: c.status, repasse: c.repasse, pedido: c.pedido_codigo, servico: c.servico_nome, data: c.data, hora: c.hora, motivo: c.motivo }));
      const tem_acesso = !!p.chave_hash; delete p.chave_hash; delete p.ip_hash;
      return json({ ok: true, parceiro: { ...p, tem_acesso }, pedidos: results, corridas });
    }
    if (req.method === "POST" && partes.length === 2) {
      let b; try { b = await lerJson(req, 4000); } catch { return erro("json_invalido"); }
      const status = PARC_STATUS.includes(b.status) ? b.status : p.status;
      let pct = b.comissao_pct == null || b.comissao_pct === "" ? p.comissao_pct : Number(b.comissao_pct);
      if (!(pct >= 0 && pct <= 50)) return erro("comissao");
      const nota = String(b.nota || "").trim().slice(0, 500);
      const notas = nota ? ((p.notas ? p.notas + "\n" : "") + new Date().toISOString().slice(0, 10) + " " + user.email + ": " + nota).slice(-6000) : p.notas;
      await env.DB.prepare("UPDATE parceiros SET status = ?, comissao_pct = ?, notas = ?, atualizado_em = ? WHERE id = ?").bind(status, pct, notas, agoraIso(), p.id).run();
      return json({ ok: true });
    }
    if (req.method === "POST" && partes[2] === "acesso") {
      if (p.status !== "aprovado") return erro("aprove_primeiro");
      const chave = tokenHex();
      await env.DB.prepare("UPDATE parceiros SET chave_hash = ?, chave_em = ?, atualizado_em = ? WHERE id = ?").bind(await sha256("parceiro:" + chave), agoraIso(), agoraIso(), p.id).run();
      return json({ ok: true, link: url.origin + (p.tipo === "atende" ? "/motorista/#chave=" : "/parceiro/#chave=") + chave });
    }
    return erro("rota", 404);
  }

  if (partes[0] === "pedidos" && partes.length === 1 && req.method === "GET") {
    const st = url.searchParams.get("status"), q = (url.searchParams.get("q") || "").trim();
    const per = url.searchParams.get("periodo") || "proximos";
    let where = [], args = [];
    if (st && STATUS.includes(st)) { where.push("p.status = ?"); args.push(st); }
    if (q) { where.push("(p.codigo LIKE ? OR p.nome LIKE ? OR p.email LIKE ? OR p.telefone LIKE ?)"); const l = "%" + q + "%"; args.push(l, l, l, l); }
    if (per === "proximos") { where.push("(SELECT MAX(inicio_utc) FROM itens i WHERE i.pedido_id = p.id) >= ?"); args.push(new Date(Date.now() - 12 * 3600e3).toISOString()); }
    const sql = `SELECT p.id, p.codigo, p.status, p.criado_em, p.nome, p.telefone, p.email, p.total, p.valor_agora, p.idioma,
      (SELECT COALESCE(empresa, responsavel) FROM parceiros pa WHERE pa.id = p.parceiro_id) AS parceiro,
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
      const parc = p.parceiro_id ? await env.DB.prepare("SELECT codigo, empresa, responsavel, comissao_pct FROM parceiros WHERE id = ?").bind(p.parceiro_id).first() : null;
      const corridas = (await env.DB.prepare(`SELECT c.id, c.item_id, c.status, c.repasse, c.obs, c.motivo, c.criado_em, c.respondido_em, pa.codigo, COALESCE(pa.empresa, pa.responsavel) AS nome, pa.telefone
        FROM corridas c JOIN parceiros pa ON pa.id = c.parceiro_id WHERE c.pedido_id = ? ORDER BY c.id`).bind(p.id).all()).results;
      delete p.token; delete p.ip_hash;
      const pagamentos = (await env.DB.prepare("SELECT id, provedor, descricao, valor, url, status, criado_em, pago_em, valor_pago, metodo, parcelas, recibo_url FROM pagamentos WHERE pedido_id = ? ORDER BY id").bind(p.id).all()).results;
      return json({ ok: true, pedido: p, itens, eventos, parceiro: parc, corridas, pagamentos, pagamentoOnline: !!env.INFINITEPAY_HANDLE });
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
    if (req.method === "POST" && partes[2] === "pagamento") {
      if (!env.INFINITEPAY_HANDLE) return erro("sem_infinitepay");
      if (p.status === "cancelada") return erro("pedido_cancelado");
      let b; try { b = await lerJson(req, 2000); } catch { return erro("json_invalido"); }
      const pagos = (await env.DB.prepare("SELECT COALESCE(SUM(valor), 0) AS v FROM pagamentos WHERE pedido_id = ? AND status = 'pago'").bind(p.id).first()).v;
      const restante = Math.round((p.total - pagos) * 100) / 100;
      const tipos = { sinal: ["Sinal", p.valor_agora], total: ["Valor total", p.total], restante: ["Valor restante", restante] };
      let desc, valor;
      if (tipos[b.tipo]) [desc, valor] = tipos[b.tipo];
      else { desc = "Pagamento"; valor = Number(String(b.valor || "").replace(/\./g, "").replace(",", ".")); }
      valor = Math.round(valor * 100) / 100;
      if (!(valor >= 1 && valor <= restante + 0.001)) return erro("valor", 400, { restante });
      const order_nsu = p.codigo + "-" + aleatorio(4);
      const corpo = { handle: env.INFINITEPAY_HANDLE, order_nsu, redirect_url: url.origin + "/reservar/pago/?pedido=" + p.codigo,
        webhook_url: url.origin + "/api/pagamentos/infinitepay",
        items: [{ description: (desc + " · reserva " + p.codigo + " · Iguaçu Executive Transfer").slice(0, 120), price: Math.round(valor * 100), quantity: 1 }],
        customer: { name: p.nome, email: p.email, ...(String(p.telefone).replace(/\D/g, "").length >= 10 ? { phone_number: "+" + (String(p.telefone).replace(/\D/g, "").length <= 11 ? "55" : "") + String(p.telefone).replace(/\D/g, "") } : {}) } };
      const r = await ipCriarLink(env, corpo);
      if (r.erro) return erro("infinitepay", 502, { detalhe: r.erro });
      const now = agoraIso();
      await env.DB.batch([
        env.DB.prepare("INSERT INTO pagamentos (pedido_id, provedor, order_nsu, descricao, valor, url, status, criado_em, autor) VALUES (?,?,?,?,?,?,?,?,?)").bind(p.id, "infinitepay", order_nsu, desc, valor, r.url, "aguardando", now, user.email),
        env.DB.prepare("INSERT INTO eventos (pedido_id, em, tipo, autor, texto) VALUES (?,?,?,?,?)").bind(p.id, now, "pagamento", user.email, "Link de pagamento gerado: " + desc + " " + brl(valor)),
        ...(p.status === "solicitacao" ? [env.DB.prepare("UPDATE pedidos SET status = 'pagamento_pendente', atualizado_em = ? WHERE id = ?").bind(now, p.id),
          env.DB.prepare("INSERT INTO eventos (pedido_id, em, tipo, status_de, status_para, autor) VALUES (?,?,?,?,?,?)").bind(p.id, now, "status", "solicitacao", "pagamento_pendente", user.email)] : []),
      ]);
      return json({ ok: true, url: r.url, valor, descricao: desc });
    }
    if (req.method === "POST" && partes[2] === "corrida") {
      let b; try { b = await lerJson(req, 4000); } catch { return erro("json_invalido"); }
      if (p.status === "cancelada") return erro("pedido_cancelado");
      const item = await env.DB.prepare("SELECT * FROM itens WHERE id = ? AND pedido_id = ?").bind(+b.item_id || 0, p.id).first();
      if (!item) return erro("item_invalido");
      const mot = await env.DB.prepare("SELECT * FROM parceiros WHERE codigo = ?").bind(String(b.motorista || "")).first();
      if (!mot || mot.tipo !== "atende" || mot.status !== "aprovado") return erro("motorista_invalido");
      if (!mot.chave_hash) return erro("motorista_sem_link");
      const ativa = await env.DB.prepare("SELECT id FROM corridas WHERE item_id = ? AND status IN ('ofertada','aceita')").bind(item.id).first();
      if (ativa) return erro("ja_ofertada");
      let repasse = b.repasse === "" || b.repasse == null ? null : Number(String(b.repasse).replace(",", "."));
      if (repasse != null && !(repasse >= 0 && repasse <= 100000)) return erro("repasse");
      const obs = String(b.obs || "").trim().slice(0, 300) || null, now = agoraIso();
      await env.DB.batch([
        env.DB.prepare("INSERT INTO corridas (pedido_id, item_id, parceiro_id, status, repasse, obs, criado_em, autor) VALUES (?,?,?,?,?,?,?,?)").bind(p.id, item.id, mot.id, "ofertada", repasse, obs, now, user.email),
        env.DB.prepare("INSERT INTO eventos (pedido_id, em, tipo, autor, texto) VALUES (?,?,?,?,?)").bind(p.id, now, "corrida", user.email,
          "Corrida oferecida a " + (mot.empresa || mot.responsavel) + " (" + mot.codigo + "): " + item.servico_nome + " " + item.data + " " + item.hora + (repasse != null ? " · repasse R$ " + repasse.toLocaleString("pt-BR") : "")),
      ]);
      return json({ ok: true, link: url.origin + "/motorista/", telefone: mot.telefone, nome: mot.responsavel });
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

/* ---------------- câmbio (só para mostrar valor aproximado em dólar e euro; a cobrança é em reais) ---------------- */
async function cotacaoCambio(env) {
  if (env.ORS_MOCK === "1") return { ok: true, usd: 0.18, eur: 0.16, data: "teste" };
  const url = "https://cache.iet.internal/cambio-brl";
  const cache = typeof caches !== "undefined" ? caches.default : null;
  if (cache) { const hit = await cache.match(url); if (hit) return hit.json(); }
  const fontes = [
    async () => { const r = await fetch("https://api.frankfurter.dev/v1/latest?base=BRL&symbols=USD,EUR", { signal: AbortSignal.timeout(5000) }); const d = await r.json(); return { usd: d.rates.USD, eur: d.rates.EUR, data: d.date }; },
    async () => { const r = await fetch("https://open.er-api.com/v6/latest/BRL", { signal: AbortSignal.timeout(5000) }); const d = await r.json(); return { usd: d.rates.USD, eur: d.rates.EUR, data: (d.time_last_update_utc || "").slice(5, 16) }; },
  ];
  for (const f of fontes) {
    try {
      const v = await f();
      if (v.usd > 0 && v.eur > 0) {
        const out = { ok: true, usd: v.usd, eur: v.eur, data: v.data };
        if (cache) await cache.put(url, new Response(JSON.stringify(out), { headers: { "content-type": "application/json", "cache-control": "public, max-age=21600" } }));
        return out;
      }
    } catch (e) { console.error("cambio", e && e.message); }
  }
  return { ok: false, erro: "cambio_indisponivel" };
}

/* ---------------- roteador ---------------- */
async function api(req, env, ctx, url) {
  const p = url.pathname, m = req.method;
  if (m === "POST") {
    // só aceita POST do próprio site (proteção contra envio de outros domínios)
    const orig = req.headers.get("origin");
    if (orig && orig !== url.origin) return erro("origem", 403);
  }
  if (p === "/api/catalogo" && m === "GET") return json(catalogo(env), 200, { "cache-control": "public, max-age=60" });
  if (p === "/api/cotacao" && m === "POST") {
    let b; try { b = await lerJson(req, 4000); } catch { return erro("json_invalido"); }
    const it = normalizarItem(b);
    await prepararKm(env, it);
    return json(b.categoria ? cotar(it) : cotarTodas(it));
  }
  if (p === "/api/cambio" && m === "GET") {
    const r = await cotacaoCambio(env);
    return json(r, r.ok ? 200 : 503, r.ok ? { "cache-control": "public, max-age=3600" } : {});
  }
  if (p === "/api/lugares" && m === "GET") {
    let r; try { r = await buscarLugares(env, url.searchParams.get("q"), url.searchParams.get("lang")); } catch (e) { console.error("lugares", e && e.message); r = { ok: false, erro: "calc_indisponivel", ors: e && e.name === "TimeoutError" ? "tempo" : "falha" }; }
    return json(r, r.ok ? 200 : 503, r.ok ? { "cache-control": "public, max-age=3600" } : {});
  }
  if (p === "/api/pedidos" && m === "POST") return criarPedido(req, env, ctx);
  if (p === "/api/parceiros" && m === "POST") return cadastrarParceiro(req, env, ctx);
  if (p.startsWith("/api/parceiro/") && m === "GET") return areaParceiro(req, env, url);
  if (p.startsWith("/api/motorista/")) return areaMotorista(req, env, url);
  if (p === "/api/pagamentos/infinitepay" && m === "POST") return avisoInfinitePay(req, env, ctx, url);
  if (p === "/api/pagamentos/conferir" && m === "POST") {
    let b; try { b = await lerJson(req, 4000); } catch { return erro("json_invalido"); }
    const r = await confirmarPagamento(env, b, url.origin);
    return json(r, r.ok ? 200 : 400);
  }
  if (p === "/api/pacotes" && m === "POST") return criarPacote(req, env);
  const mp = p.match(/^\/api\/pacotes\/([A-Z0-9]{7})$/);
  if (mp && m === "GET") return verPacote(env, mp[1]);
  const mm = p.match(/^\/api\/pedidos\/(IET-[A-Z0-9]{6})$/);
  if (mm && m === "GET") return verPedidoCliente(env, mm[1], url.searchParams.get("t"));
  if (p.startsWith("/api/admin")) return admin(req, env, url);
  return erro("rota", 404);
}

/* Prévia do link (WhatsApp, Facebook etc.): /reservar/?s=SERVICO mostra a foto, o nome e o preço "a partir de" do serviço */
const OG_FOTOS = new Set(["transfer-aeroporto-suv-executivo-corolla-cross", "marco-das-tres-fronteiras", "cataratas-do-iguacu-arco-iris", "cataratas-do-iguacu-vista-do-rio",
  "foz-do-iguacu-cidade-rio-parana", "cataratas-do-iguacu-vista-aerea", "passarela-garganta-do-diabo", "itaipu-binacional-vista-aerea", "templo-budista-foz-do-iguacu",
  "suv-executivo-corolla-cross-preto", "frota-suv-executivo-corolla-cross", "sedan-executivo-corolla-preto-avenida", "motorista-executivo-corolla-cross-cinza"]);
const OG_TXT = {
  pt: { de: "a partir de", carro: "por carro, preço fechado na reserva", pacote: "Pacote de viagem em Foz do Iguaçu", pacoteD: "Abra o link para ver o pacote montado para você, com o preço fechado de cada serviço." },
  en: { de: "from", carro: "per vehicle, fixed price when you book", pacote: "Your Foz do Iguaçu trip package", pacoteD: "Open the link to see the package prepared for you, with a fixed price for each service." },
  es: { de: "desde", carro: "por vehículo, precio cerrado al reservar", pacote: "Paquete de viaje en Foz do Iguaçu", pacoteD: "Abra el enlace para ver el paquete armado para usted, con precio cerrado de cada servicio." },
};
function previaReserva(res, url) {
  const lang = ["en", "es"].includes(url.searchParams.get("lang")) ? url.searchParams.get("lang") : "pt";
  const tx = OG_TXT[lang], id = url.searchParams.get("s"), pac = url.searchParams.get("pacote");
  let titulo, desc, foto;
  const s = id && SERVICOS.find((x) => x.id === id && !x.oculto);
  if (s) {
    const precos = Object.values(s.precos || {}).filter((v) => v != null);
    let min = precos.length ? Math.min(...precos) : 0;
    if (s.tipo === "hora") min = min * POR_HORA.pacoteMult;
    const nome = (s.nome && (s.nome[lang] || s.nome.pt)) || "";
    titulo = min ? nome + " · " + tx.de + " R$ " + min.toLocaleString("pt-BR") : nome;
    desc = ((s.desc && (s.desc[lang] || s.desc.pt)) || "") + " " + (min ? tx.de.charAt(0).toUpperCase() + tx.de.slice(1) + " R$ " + min.toLocaleString("pt-BR") + " " + tx.carro + "." : "");
    foto = OG_FOTOS.has(s.foto) ? s.foto : "suv-executivo-corolla-cross-preto";
  } else if (pac && /^[A-Z0-9]{7}$/.test(pac)) {
    titulo = tx.pacote; desc = tx.pacoteD; foto = "cataratas-do-iguacu-vista-aerea";
  } else return res;
  const img = "https://iguacuexecutivetransfer.com.br/img/og-" + foto + ".jpg";
  const set = (v) => ({ element(el) { el.setAttribute("content", v); } });
  return new HTMLRewriter()
    .on('meta[property="og:title"]', set(titulo))
    .on('meta[property="og:description"]', set(desc.trim()))
    .on('meta[property="og:image"]', set(img))
    .on('meta[property="og:url"]', set(url.origin + url.pathname + url.search))
    .transform(res);
}

/* App instalável: manifesto, ícone e script de instalação em todas as páginas públicas (não no painel nem nas áreas de parceiro e motorista) */
const APP_HEAD = '<link rel="manifest" href="/manifest.webmanifest"><meta name="theme-color" content="#0b0b0b"><link rel="apple-touch-icon" href="/img/app-180.png"><meta name="apple-mobile-web-app-title" content="IET Transfer"><script src="/js/app.js?v=1" defer></script>';
function comApp(res, url) {
  const p = url.pathname;
  if (!res.ok || !(res.headers.get("content-type") || "").includes("text/html")) return res;
  if (p.startsWith("/admin") || p.startsWith("/parceiro/") || p.startsWith("/motorista/") || p === "/offline.html") return res;
  return new HTMLRewriter().on("head", { element(el) { el.append(APP_HEAD, { html: true }); } }).transform(res);
}

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    let res;
    if (url.pathname.startsWith("/api/")) {
      try { await carregarPrecos(env); res = await api(req, env, ctx, url); }
      catch (e) { console.error("api", e && e.stack); res = erro("interno", 500); }
    } else {
      res = await env.ASSETS.fetch(req);
      if ((url.pathname === "/reservar/" || url.pathname === "/reservar/index.html") && req.method === "GET" && res.ok) { await carregarPrecos(env); res = previaReserva(res, url); }
      if (req.method === "GET") res = comApp(res, url);
    }
    // endereços de teste (*.workers.dev) nunca entram no Google
    if (url.hostname.endsWith(".workers.dev")) {
      res = new Response(res.body, res);
      res.headers.set("x-robots-tag", "noindex, nofollow");
    }
    return res;
  },
};
