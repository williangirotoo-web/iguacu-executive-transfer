/* Iguaçu Executive Transfer — Worker (API de reservas + site estático) */
import { CONFIG, CATEGORIAS, SERVICOS, CONSULTA, HORA_EXTRA, POR_HORA, POR_KM, DIARIA, datasEspeciais, malasRef } from "./precos.js";
import { normalizarItem, cotar, cotarTodas, valorAgora, servico, aplicarPrecos, PRECOS_PADRAO } from "./cotacao.js";
import { buscarLugares, resolverRota } from "./rota.js";
import { assistente } from "./assistente.js";
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
    // cupons de desconto (% sobre o valor dos serviços), criados no painel
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS cupons (
      codigo TEXT PRIMARY KEY, pct REAL NOT NULL, ativo INTEGER NOT NULL DEFAULT 1, inicio TEXT, fim TEXT,
      usos_max INTEGER, usos INTEGER NOT NULL DEFAULT 0, descricao TEXT, criado_em TEXT NOT NULL, autor TEXT)`),
    // assistente de IA: só conta mensagens por IP (para limitar abuso); não guarda a conversa
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS ia_uso (ip_hash TEXT NOT NULL, em TEXT NOT NULL)`),
    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_ia_uso ON ia_uso(ip_hash, em)`),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS conversas (id TEXT PRIMARY KEY, criado_em TEXT NOT NULL, atualizado_em TEXT NOT NULL,
      nome TEXT, telefone TEXT, idioma TEXT, pagina TEXT, n_msgs INTEGER DEFAULT 0, cotou INTEGER DEFAULT 0, humano INTEGER DEFAULT 0, msgs_json TEXT, ip_hash TEXT)`),
    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_conversas_at ON conversas(atualizado_em)`),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS fornecedores (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL, pais TEXT NOT NULL DEFAULT 'BR',
      telefone TEXT, veiculos TEXT, pagamento TEXT, notas TEXT, ativo INTEGER NOT NULL DEFAULT 1, criado_em TEXT NOT NULL, atualizado_em TEXT NOT NULL)`),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS fornecedor_tarifas (id INTEGER PRIMARY KEY AUTOINCREMENT, fornecedor_id INTEGER NOT NULL, rota TEXT NOT NULL,
      servico_id TEXT, categoria TEXT, valor REAL NOT NULL, moeda TEXT NOT NULL DEFAULT 'BRL', obs TEXT, atualizado_em TEXT NOT NULL)`),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS stories (id INTEGER PRIMARY KEY AUTOINCREMENT, titulo TEXT NOT NULL, tipo TEXT NOT NULL,
      midia TEXT NOT NULL, capa TEXT, link TEXT, cta TEXT, ordem INTEGER NOT NULL DEFAULT 0, ativo INTEGER NOT NULL DEFAULT 1, criado_em TEXT NOT NULL)`),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS config_admin (chave TEXT PRIMARY KEY, valor TEXT, atualizado_em TEXT)`),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS visitas_dia (dia TEXT NOT NULL, pagina TEXT NOT NULL, views INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (dia, pagina))`),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS visitantes_dia (dia TEXT NOT NULL, vhash TEXT NOT NULL, PRIMARY KEY (dia, vhash))`),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS origens_dia (dia TEXT NOT NULL, origem TEXT NOT NULL, n INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (dia, origem))`),
  ]);
  // coluna nova em tabela antiga: só cria se ainda não existir
  const cols = (await env.DB.prepare("PRAGMA table_info(pedidos)").all()).results.map((c) => c.name);
  if (!cols.includes("parceiro_id")) await env.DB.prepare("ALTER TABLE pedidos ADD COLUMN parceiro_id INTEGER").run();
  if (!cols.includes("comissao_paga_id")) await env.DB.prepare("ALTER TABLE pedidos ADD COLUMN comissao_paga_id INTEGER").run();
  if (!cols.includes("comissao_valor")) await env.DB.prepare("ALTER TABLE pedidos ADD COLUMN comissao_valor REAL").run();
  if (!cols.includes("cupom")) await env.DB.prepare("ALTER TABLE pedidos ADD COLUMN cupom TEXT").run();
  if (!cols.includes("desconto")) await env.DB.prepare("ALTER TABLE pedidos ADD COLUMN desconto REAL").run();
  const colsItens = (await env.DB.prepare("PRAGMA table_info(itens)").all()).results.map((c) => c.name);
  if (!colsItens.includes("obs")) await env.DB.prepare("ALTER TABLE itens ADD COLUMN obs TEXT").run();
  if (!cols.includes("taxa_pagamento")) await env.DB.prepare("ALTER TABLE pedidos ADD COLUMN taxa_pagamento REAL").run();
  if (!colsItens.includes("malas_bordo")) await env.DB.prepare("ALTER TABLE itens ADD COLUMN malas_bordo INTEGER").run();
  if (!colsItens.includes("mochilas")) await env.DB.prepare("ALTER TABLE itens ADD COLUMN mochilas INTEGER").run();
  // cupom de influenciador/parceiro: a reserva com esse cupom gera comissão para o parceiro
  const colsCup = (await env.DB.prepare("PRAGMA table_info(cupons)").all()).results.map((c) => c.name);
  if (!colsCup.includes("parceiro_id")) await env.DB.prepare("ALTER TABLE cupons ADD COLUMN parceiro_id INTEGER").run();
  schemaPronto = true;
}

/* ---------------- cupons ---------------- */
const hojeFoz = () => new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10);
async function buscarCupom(env, codigo) {
  const c = String(codigo || "").trim().toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 30);
  if (!c) return { ok: false, erro: "cupom_invalido" };
  await prepararBanco(env);
  const x = await env.DB.prepare("SELECT * FROM cupons WHERE codigo = ?").bind(c).first();
  if (!x || !x.ativo) return { ok: false, erro: "cupom_invalido" };
  const h = hojeFoz();
  if (x.inicio && h < x.inicio) return { ok: false, erro: "cupom_invalido" };
  if (x.fim && h > x.fim) return { ok: false, erro: "cupom_expirado" };
  if (x.usos_max != null && x.usos >= x.usos_max) return { ok: false, erro: "cupom_esgotado" };
  return { ok: true, codigo: x.codigo, pct: x.pct, parceiro_id: x.parceiro_id || null };
}
const comDesconto = (v, pct) => Math.round(v * (1 - pct / 100) * 100) / 100;

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
      cadeirinha: CONFIG.cadeirinha, pet: CONFIG.pet, sinalPct: CONFIG.sinalPct, paypalTaxaPct: CONFIG.paypalTaxaPct, pagamento: CONFIG.pagamento,
      pagamentoViagens: CONFIG.pagamentoViagens, horaExtra: HORA_EXTRA, porHora: { minimoHoras: POR_HORA.minimoHoras, maximoHoras: POR_HORA.maximoHoras, pacoteHoras: POR_HORA.pacoteHoras, pacoteMult: POR_HORA.pacoteMult },
      turnstileSiteKey: env.TURNSTILE_SITEKEY || "", pagamentoOnline: !!env.INFINITEPAY_HANDLE, paypal: temPayPal(env),
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
/* "4 malas grandes · 1 de bordo · 2 mochilas" (itens antigos só têm malas grandes) */
function bagagensTxt(it) {
  const p = [`${Number(it.malas) || 0} mala(s) grande(s)`];
  const b = Number(it.malas_bordo ?? it.malasBordo) || 0, m = Number(it.mochilas) || 0;
  if (b) p.push(`${b} de bordo`);
  if (m) p.push(`${m} mochila(s)/bolsa(s)`);
  return p.join(" · ");
}
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
    linhas.push(`   Passageiros: ${it.pax} · Bagagens: ${bagagensTxt(it)}` + (it.cadeirinhas ? ` · Cadeirinhas: ${it.cadeirinhas}` : "") + (it.pet ? " · Com pet" : ""));
    if (comLinks && c && it.malas > malasRef(it.categoria, it.pax)) linhas.push(`   ⚠ ATENÇÃO: ${it.malas} malas grandes, acima do que cabe com folga nesse carro com ${it.pax} passageiro(s) (${malasRef(it.categoria, it.pax)}). Verificar espaço antes da viagem.`);
    if (it.obs) linhas.push(`   Obs.: ${it.obs}`);
    if (it.horas_extras) linhas.push(`   Horas extras: ${it.horas_extras}`);
    if (it.km && comLinks) linhas.push(`   Distância (só para a equipe): ${it.km} km por trecho` + (it.km_fora ? " · com taxa de fronteira" : ""));
    if (servico(it.servico_id)?.tipo === "hora") linhas.push(`   Horas contratadas: ${it.horas}`);
    if (servico(it.servico_id)?.tipo === "diaria") linhas.push(`   Diárias: ${it.dias}`);
    if (it.data_especial) linhas.push(`   Data especial: +${CONFIG.feriadoAcrescimoPct}%`);
    linhas.push(`   Valor: ${brl(it.valor)} (${it.modo === "total" ? "100% na reserva" : CONFIG.sinalPct + "% de sinal"})`);
  });
  if (p.cupom) linhas.push("", `Cupom: ${p.cupom}`);
  if (p.taxa_pagamento && comLinks) linhas.push("", `Taxa do PayPal (${CONFIG.paypalTaxaPct}%): ${brl(p.taxa_pagamento)}`);
  linhas.push("", `Total: ${brl(p.total)}`, `A pagar na reserva: ${brl(p.valor_agora)}`, `Restante no dia: ${brl(p.total - p.valor_agora)}`);
  if (p.observacoes) linhas.push("", `Observações: ${p.observacoes}`);
  if (comLinks) {
    const tel = String(p.telefone).replace(/\D/g, "");
    linhas.push("", `Painel: ${origem}/admin/#${p.codigo}`);
    if (tel.length >= 10) linhas.push(`WhatsApp do cliente: https://wa.me/${tel.length <= 11 && !String(p.telefone || "").trim().startsWith("+") ? "55" + tel : tel}`);
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
  let cupom = null;
  if (body.cupom) {
    cupom = await buscarCupom(env, body.cupom);
    if (!cupom.ok) return erro(cupom.erro);
    for (const x of itens) {
      const antes = x.cot.valor, depois = comDesconto(antes, cupom.pct);
      x.cot = { ...x.cot, valor: depois, linhas: [...x.cot.linhas, { k: "cupom", cupom: cupom.codigo, pct: cupom.pct, valor: Math.round((depois - antes) * 100) / 100 }] };
    }
  }
  const parceiroChave = await parceiroDaChave(req, env);
  // indicação: cupom ligado a um parceiro (influenciador, guia...) que está aprovado
  const indicador = !parceiroChave && cupom && cupom.parceiro_id
    ? await env.DB.prepare("SELECT * FROM parceiros WHERE id = ? AND tipo = 'indica' AND status = 'aprovado'").bind(cupom.parceiro_id).first() : null;
  const parceiro = parceiroChave || indicador;
  const escolha = body.modoPagamento === "total" ? "total" : "sinal";
  const pag = valorAgora(itens, escolha);
  // pagamento na hora: o cliente escolhe no checkout (Pix/cartão brasileiro → InfinitePay; cartão internacional → PayPal).
  // Sem escolha (versão antiga da página), vale o idioma: português → InfinitePay, inglês/espanhol → PayPal.
  const provEscolhido = body.provedor === "paypal" && temPayPal(env) ? "paypal" : body.provedor === "infinitepay" && env.INFINITEPAY_HANDLE ? "infinitepay" : null;
  const provReserva = provEscolhido || (idioma === "pt" ? (env.INFINITEPAY_HANDLE ? "infinitepay" : null) : (temPayPal(env) ? "paypal" : null));
  // PayPal: a taxa (CONFIG.paypalTaxaPct) é somada ao valor pago na reserva e aparece no resumo
  const taxaPag = provReserva === "paypal" && !parceiroChave && pag.agora >= 1 ? Math.round(pag.agora * CONFIG.paypalTaxaPct) / 100 : 0;
  if (taxaPag) { pag.total = Math.round((pag.total + taxaPag) * 100) / 100; pag.agora = Math.round((pag.agora + taxaPag) * 100) / 100; }

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
        consentimento_em, total, valor_agora, modo_pagamento, ip_hash, origem, parceiro_id, cupom, desconto, taxa_pagamento) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
        .bind(codigo, token, now, now, "solicitacao", idioma, cliente.nome, cliente.email, cliente.telefone, cliente.pais || null,
          cliente.observacoes || null, now, pag.total, pag.agora, escolha, ipHash, new URL(req.url).hostname, parceiro ? parceiro.id : null,
          cupom ? cupom.codigo : null, cupom ? Math.round(itens.reduce((a, x) => a + x.cot.linhas.filter((l) => l.k === "cupom").reduce((b, l) => b - l.valor, 0), 0) * 100) / 100 : null, taxaPag || null).run();
      pedidoId = r.meta.last_row_id;
    } catch (e) { if (!String(e.message).includes("UNIQUE")) throw e; }
  }
  if (!pedidoId) return erro("falha_codigo", 500);

  const stmts = itens.map(({ it, cot, svc }, i) => env.DB.prepare(`INSERT INTO itens (pedido_id, ordem, servico_id, servico_nome, categoria, data, hora, inicio_utc,
    sentido, voo, origem, destino, pax, malas, cadeirinhas, pet, horas_extras, horas, dias, data_especial, valor, modo, valor_agora, linhas_json, obs, malas_bordo, mochilas)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(pedidoId, i + 1, it.servico, svc.nome.pt, it.categoria, it.data, it.hora, cot.inicio,
    svc.sentido ? it.sentido : null, it.voo || null, it.origem || null, it.destino || null, it.pax, it.malas, it.cadeirinhas, it.pet ? 1 : 0,
    it.horasExtras, svc.tipo === "hora" ? it.horas : null, svc.tipo === "diaria" ? it.dias : null, cot.dataEspecial ? 1 : 0,
    cot.valor, pag.detalhes[i].modo, pag.detalhes[i].due, JSON.stringify(cot.linhas), it.obs || null, it.malasBordo || 0, it.mochilas || 0));
  stmts.push(env.DB.prepare("INSERT INTO eventos (pedido_id, em, tipo, status_para, autor, texto) VALUES (?,?,?,?,?,?)")
    .bind(pedidoId, now, "criado", "solicitacao", parceiroChave ? "parceiro " + parceiro.codigo : "cliente",
      parceiroChave ? `Reserva feita pelo parceiro ${parceiro.empresa || parceiro.responsavel} (${parceiro.codigo})` : indicador ? `Pedido feito pelo site com o cupom ${cupom.codigo}, indicação de ${indicador.empresa || indicador.responsavel} (${indicador.codigo})` : "Pedido feito pelo site"));
  if (cupom) stmts.push(env.DB.prepare("UPDATE cupons SET usos = usos + 1 WHERE codigo = ?").bind(cupom.codigo));
  await env.DB.batch(stmts);

  const pedido = { codigo, ...cliente, total: pag.total, valor_agora: pag.agora, taxa_pagamento: taxaPag, cupom: cupom ? cupom.codigo + " (-" + cupom.pct + "%)" : null };
  const itensDb = itens.map(({ it, cot, svc }, i) => ({ servico_id: it.servico, servico_nome: svc.nome.pt, categoria: it.categoria, data: it.data, hora: it.hora,
    sentido: it.sentido, voo: it.voo, origem: it.origem, destino: it.destino, pax: it.pax, malas: it.malas, malas_bordo: it.malasBordo, mochilas: it.mochilas, cadeirinhas: it.cadeirinhas, pet: it.pet,
    horas_extras: it.horasExtras, horas: it.horas, dias: it.dias, data_especial: cot.dataEspecial, valor: cot.valor, modo: pag.detalhes[i].modo, obs: it.obs,
    km: cot.km || null, km_fora: it.rota ? !!it.rota.fora : false }));
  const origem = new URL(req.url).origin;
  const txtParc = indicador ? `Indicação (cupom ${cupom.codigo}): ${indicador.empresa || indicador.responsavel} (${indicador.codigo}) · comissão ${Number(indicador.comissao_pct) || 0}%\n\n` : parceiro ? `Reserva feita pelo parceiro: ${parceiro.empresa || parceiro.responsavel} (${parceiro.codigo}) · comissão ${Number(parceiro.comissao_pct) || 0}%\n\n` : "";
  const txtPag = provReserva && !parceiroChave && pag.agora >= 1 ? "Pagamento escolhido no site: " + (provReserva === "paypal" ? "PayPal / cartão internacional" : "InfinitePay (Pix / cartão brasileiro)") + "\n\n" : "";
  ctx.waitUntil(enviarAviso(env, `Nova reserva ${codigo} — ${cliente.nome} — ${brl(pag.total)}` + (parceiro ? ` — parceiro ${parceiro.codigo}` : ""), txtParc + txtPag + resumoTexto(pedido, itensDb, true, origem)));

  let pagamento = null;
  if (provReserva && !parceiroChave && pag.agora >= 1) {
    try {
      const r = await gerarLinkPagamento(env, { id: pedidoId, codigo, nome: cliente.nome, email: cliente.email, telefone: cliente.telefone, status: "solicitacao" },
        pag.agora < pag.total ? (idioma === "pt" ? "Sinal" : "Deposit") : (idioma === "pt" ? "Valor total" : "Total"), pag.agora, origem, "site", provReserva, idioma);
      if (r.url) pagamento = { url: r.url, valor: pag.agora };
    } catch (e) { console.error("link na reserva", e && e.message); }
  }
  const msgWa = (idioma === "en" ? "Hello! I just booked on the website." : idioma === "es" ? "¡Hola! Acabo de reservar en el sitio." : "Olá! Acabei de fazer uma reserva pelo site.") +
    "\n\n" + resumoTexto(pedido, itensDb, false);
  return json({ ok: true, codigo, token, total: pag.total, valorAgora: pag.agora, status: pagamento ? "pagamento_pendente" : "solicitacao", pagamento,
    whatsapp: "https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(msgWa) });
}

/* ---------------- pacote compartilhado (link curto com os itens do carrinho, sem dados pessoais) ---------------- */
const CAMPOS_PACOTE = ["servico", "categoria", "data", "hora", "sentido", "voo", "origem", "destino", "pax", "malas", "malasBordo", "mochilas", "cadeirinhas", "pet", "horasExtras", "horas", "dias", "idaVolta", "dataVolta", "horaVolta", "de", "para"];
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

/* ---------------- cliente troca a forma de pagamento ----------------
   Reserva feita pelo site que ficou sem pagamento (fechou a página, cartão estrangeiro recusado no InfinitePay...):
   o navegador que fez a reserva (código + token) pede um link novo, no InfinitePay ou no PayPal, do mesmo valor. */
async function pagarPedidoCliente(req, env, origem) {
  let b; try { b = await lerJson(req, 2000); } catch { return erro("json_invalido"); }
  const codigo = String(b.codigo || ""), token = String(b.token || "");
  if (!/^IET-[A-Z0-9]{6}$/.test(codigo) || !token) return erro("nao_encontrado", 404);
  const prov = b.provedor === "paypal" ? (temPayPal(env) ? "paypal" : null) : b.provedor === "infinitepay" ? (env.INFINITEPAY_HANDLE ? "infinitepay" : null) : null;
  if (!prov) return erro("sem_pagamento");
  const idioma = ["pt", "en", "es"].includes(b.idioma) ? b.idioma : "pt";
  await prepararBanco(env);
  const p = await env.DB.prepare("SELECT id, codigo, token, status, nome, email, telefone, total, valor_agora, taxa_pagamento FROM pedidos WHERE codigo = ?").bind(codigo).first();
  if (!p || p.token !== token) return erro("nao_encontrado", 404);
  const pgs = (await env.DB.prepare("SELECT status, autor FROM pagamentos WHERE pedido_id = ?").bind(p.id).all()).results;
  if (pgs.some((x) => x.status === "pago")) return erro("ja_pago");
  // só reservas que já tiveram pagamento online pelo site; pedidos tratados no painel seguem pelo WhatsApp
  if (!["solicitacao", "pagamento_pendente"].includes(p.status) || !pgs.some((x) => x.autor === "site")) return erro("status");
  if (pgs.length >= 8) return erro("muitas_tentativas", 429);
  // a taxa do PayPal só vale para quem paga pelo PayPal: recalcula ao trocar de forma de pagamento
  const taxaAnt = Number(p.taxa_pagamento) || 0, base = Math.round(((Number(p.valor_agora) || 0) - taxaAnt) * 100) / 100;
  if (base < 1) return erro("status");
  const taxaNova = prov === "paypal" ? Math.round(base * CONFIG.paypalTaxaPct) / 100 : 0;
  if (taxaNova !== taxaAnt) {
    p.total = Math.round((Number(p.total) - taxaAnt + taxaNova) * 100) / 100;
    await env.DB.prepare("UPDATE pedidos SET total = ?, valor_agora = ?, taxa_pagamento = ?, atualizado_em = ? WHERE id = ?").bind(p.total, base + taxaNova, taxaNova || null, agoraIso(), p.id).run();
  }
  const valor = Math.round((base + taxaNova) * 100) / 100;
  const desc = valor < Number(p.total) - 0.001 ? (idioma === "pt" ? "Sinal" : "Deposit") : (idioma === "pt" ? "Valor total" : "Total");
  let r; try { r = await gerarLinkPagamento(env, p, desc, valor, origem, "site", prov, idioma); } catch (e) { console.error("troca pagamento", e && e.message); r = {}; }
  if (!r || !r.url) return erro("pagamento_falhou", 502);
  return json({ ok: true, url: r.url });
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
const PARC_TIPOS = { indica: ["hotel", "agencia", "guia", "influenciador", "empresa", "outro"], atende: ["taxi", "particular", "sete", "van"] };
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
  const nomes = { hotel: "Hotel ou pousada", agencia: "Agência", guia: "Guia", influenciador: "Influenciador / criador de conteúdo", empresa: "Empresa", outro: "Outro", taxi: "Táxi", particular: "Motorista particular", sete: "7 lugares", van: "Van" };
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
  if (rota === "eu") {
    const cupons = (await env.DB.prepare("SELECT codigo, pct FROM cupons WHERE parceiro_id = ? AND ativo = 1 ORDER BY criado_em").bind(p.id).all()).results;
    return json({ ok: true, parceiro: { codigo: p.codigo, empresa: p.empresa, responsavel: p.responsavel, comissao_pct: p.comissao_pct }, cupons, site: new URL(req.url).origin });
  }
  if (rota === "pedidos") {
    const { results } = await env.DB.prepare(`SELECT p.codigo, p.status, p.criado_em, p.nome, p.total, p.comissao_valor, p.cupom,
      (SELECT pago_em FROM comissoes_pagas c WHERE c.id = p.comissao_paga_id) AS comissao_paga_em,
      (SELECT MIN(data || ' ' || hora) FROM itens i WHERE i.pedido_id = p.id) AS primeira,
      (SELECT group_concat(servico_nome, ' + ') FROM itens i WHERE i.pedido_id = p.id) AS servicos
      FROM pedidos p WHERE p.parceiro_id = ? ORDER BY p.criado_em DESC LIMIT 300`).bind(p.id).all();
    const pct = Number(p.comissao_pct) || 0;
    // reservas vindas do cupom (seguidores): o parceiro vê só o primeiro nome do cliente
    const pedidos = results.map((x) => ({ ...x, nome: x.cupom ? String(x.nome || "").split(" ")[0] + " (cupom " + x.cupom + ")" : x.nome, comissao: x.comissao_paga_em ? x.comissao_valor : x.status === "cancelada" ? 0 : Math.round(x.total * pct) / 100 }));
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
    sentido: c.sentido, origem: c.origem, destino: c.destino, obs_item: c.obs_item, pax: c.pax, malas: c.malas, malas_bordo: c.malas_bordo || 0, mochilas: c.mochilas || 0, cadeirinhas: c.cadeirinhas, pet: !!c.pet, horas: c.horas, dias: c.dias, horas_extras: c.horas_extras,
    ...(aceita ? { passageiro: c.nome, telefone: c.telefone, voo: c.voo, observacoes: c.observacoes } : {}),
  };
}
const SQL_CORRIDA = `SELECT c.*, p.codigo AS pedido_codigo, p.status AS pedido_status, p.nome, p.telefone, p.observacoes,
  i.servico_nome, i.categoria, i.data, i.hora, i.inicio_utc, i.sentido, i.voo, i.origem, i.destino, i.pax, i.malas, i.malas_bordo, i.mochilas, i.cadeirinhas, i.pet, i.horas, i.dias, i.horas_extras, i.obs AS obs_item
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

/* cadastro inicial do parceiro Ariel (Argentina), roda uma única vez */
async function seedAriel(env) {
  if (await env.DB.prepare("SELECT 1 FROM config_admin WHERE chave = 'seed_ariel_v1'").first()) return;
  const agora = agoraIso();
  await env.DB.prepare("INSERT INTO config_admin (chave, valor, atualizado_em) VALUES ('seed_ariel_v1', '1', ?)").bind(agora).run();
  if (await env.DB.prepare("SELECT 1 FROM fornecedores WHERE nome = 'Ariel Transfer Iguazú'").first()) return;
  if (!(await env.DB.prepare("SELECT 1 FROM config_admin WHERE chave = 'cambio'").first()))
    await env.DB.prepare("INSERT INTO config_admin (chave, valor, atualizado_em) VALUES ('cambio', ?, ?)").bind(JSON.stringify({ ARS: 300, USD: null, PYG: null }), agora).run();
  const r = await env.DB.prepare("INSERT INTO fornecedores (nome, pais, telefone, veiculos, pagamento, notas, ativo, criado_em, atualizado_em) VALUES (?,?,?,?,?,?,1,?,?)")
    .bind("Ariel Transfer Iguazú", "AR", "+54 9 3757 62-4576", "6 carros (4 e 5/6 lugares)", "Mercado Pago, CBU ou transferência (em pesos)", "Habilitação nacional e internacional · primeiro parceiro na Argentina", agora, agora).run();
  const fid = r.meta.last_row_id;
  const Q = "carro 4 lugares", S = "carro 5/6 lugares";
  const T = [
    ["Aeroporto IGR → hotel em Puerto Iguazú", 30000, Q, "igr-pi", "comum"], ["Hotel em Puerto Iguazú → Aeroporto IGR", 30000, Q, "igr-pi", "comum"],
    ["Hotel em Puerto Iguazú → Cataratas argentinas (ida e volta)", 60000, Q], ["Hotel em Puerto Iguazú → Aeroporto de Foz", 50000, Q, "igu-pi", "comum"],
    ["Hotel em Puerto Iguazú → Cataratas Brasil (ida e volta)", 95000, Q], ["Hotel em Puerto Iguazú → Ciudad del Este (ida e volta, espera até 5 h)", 150000, Q],
    ["Hotel em Puerto Iguazú → Minas de Wanda (ida e volta)", 105000, Q], ["Aeroporto IGR → Aeroporto de Foz", 75000, Q, "igu-igr", "comum"],
    ["Centro de Puerto Iguazú", 12000, S], ["Hito Tres Fronteras", 12000, S], ["Duty Free", 14000, S],
    ["Aeroporto IGR ⇄ hotel em Puerto Iguazú", 38000, S, "igr-pi", "sete"], ["Aeroporto IGR ⇄ hotel em Puerto Iguazú — madrugada", 45000, S],
    ["Hotel em Puerto Iguazú → Aeroporto de Foz", 55000, S, "igu-pi", "sete"], ["Hotel em Puerto Iguazú → Aeroporto de Foz — madrugada", 65000, S],
    ["Cataratas argentinas (ida e volta)", 90000, S], ["Cataratas argentinas — só ida", 45000, S],
    ["Lua Cheia nas Cataratas argentinas (ida e volta)", 100000, S], ["Lua Cheia nas Cataratas argentinas — só ida", 60000, S],
    ["Itaipu Panorâmica (ida e volta)", 110000, S], ["Cataratas Brasil (ida e volta)", 110000, S], ["Cataratas Brasil — só ida", 65000, S],
    ["Centro ou rodoviária de Foz (ida e volta)", 90000, S], ["Centro ou rodoviária de Foz — só ida", 55000, S, "foz-pi", "sete"],
    ["Ciudad del Este com 3 h de espera", 160000, S], ["Ciudad del Este — hora adicional de espera", 20000, S],
    ["Rafain (show/jantar em Foz)", 90000, S], ["Hotel Rafain (Foz)", 110000, S], ["Minas de Wanda (ida e volta)", 110000, S],
    ["Minas de Wanda + Ruínas de San Ignacio", 435000, S], ["Saltos do Moconá", 620000, S], ["Rodoviária de Ciudad del Este — só ida", 140000, S],
    ["Erva-mate em Andresito + Minas de Wanda", 390000, S], ["Blue Park (ida e volta)", 115000, S], ["Museu de Cera", 100000, S],
    ["Viagem a Posadas", 480000, S], ["Viagem a Eldorado (Misiones)", 240000, S]];
  await env.DB.batch(T.map(([rota, valor, obs, sid, cat]) => env.DB.prepare("INSERT INTO fornecedor_tarifas (fornecedor_id, rota, servico_id, categoria, valor, moeda, obs, atualizado_em) VALUES (?,?,?,?,?,'ARS',?,?)")
    .bind(fid, rota, sid || null, cat || null, valor, obs, agora)));
}

/* ---------------- conversas com o assistente (histórico para a equipe) ----------------
   O cliente informa nome e WhatsApp e concorda com o registro antes de conversar. Apagadas após 180 dias. */
async function salvarConversa(env, c, mensagens, r) {
  await prepararBanco(env);
  const lista = (Array.isArray(mensagens) ? mensagens : []).slice(-40).map((m) => ({ role: m && m.role === "assistant" ? "assistant" : "user", content: String((m && m.content) || "").slice(0, 600) }));
  if (r) {
    const resp = { role: "assistant", content: String(r.resposta || (r.ok ? "" : "(erro: " + (r.erro || "?") + ")")).slice(0, 1200) };
    if (r.cotacao && r.cotacao.categorias) {
      const ok = Object.entries(r.cotacao.categorias).filter(([, x]) => x && x.ok).map(([k, x]) => (x.nome || k) + " " + Math.round(x.valor));
      if (ok.length) resp.cot = ok.slice(0, 6).join(" · ");
    }
    lista.push(resp);
  }
  const agora = agoraIso();
  const cotou = r && r.cotacao ? 1 : 0, humano = r && r.humano ? 1 : 0;
  await env.DB.prepare(`INSERT INTO conversas (id, criado_em, atualizado_em, nome, telefone, idioma, pagina, n_msgs, cotou, humano, msgs_json, ip_hash)
    VALUES (?1, ?2, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)
    ON CONFLICT(id) DO UPDATE SET atualizado_em = ?2, nome = ?3, telefone = ?4, n_msgs = ?7, cotou = MAX(cotou, ?8), humano = MAX(humano, ?9), msgs_json = ?10`)
    .bind(c.id, agora, c.nome, c.telefone, c.idioma, c.pagina, lista.length, cotou, humano, JSON.stringify(lista), c.ipHash).run();
  if (Math.random() < 0.02) await env.DB.prepare("DELETE FROM conversas WHERE atualizado_em < ?").bind(new Date(Date.now() - 180 * 864e5).toISOString()).run();
}

/* ---------------- contador de visitas (sem cookies e sem guardar IP) ----------------
   Conta visualizações por página e dia. Visitante único = hash do IP + navegador + dia (não dá para reverter). */
const BOTS = /bot|crawl|spider|slurp|facebookexternalhit|preview|headless|lighthouse|pingdom|uptime|curl|wget|python|axios|node-fetch/i;
async function registrarVisita(req, env, ctx) {
  const ua = req.headers.get("user-agent") || "";
  if (!ua || BOTS.test(ua)) return new Response(null, { status: 204 });
  let b; try { b = await lerJson(req, 1000); } catch { return new Response(null, { status: 204 }); }
  let pg = String(b.p || "/").split("?")[0].split("#")[0].slice(0, 160);
  if (!/^\/[\w\-./%]*$/.test(pg) || /^\/(admin|api|motorista|parceiro)\b/.test(pg)) return new Response(null, { status: 204 });
  pg = pg.replace(/\/index\.html$/, "/");
  let origem = "direto";
  try {
    const h = new URL(String(b.r || "")).hostname.replace(/^www\./, "").toLowerCase();
    if (h && !h.endsWith("iguacuexecutivetransfer.com.br")) origem = /google\./.test(h) ? "google" : /bing\.|duckduckgo|yahoo/.test(h) ? "outras buscas" : /facebook|instagram|fb\.|l\.instagram/.test(h) ? "facebook/instagram" : /whatsapp|wa\.me/.test(h) ? "whatsapp" : h.slice(0, 60);
    else if (h) origem = "";
  } catch {}
  if (/[?&](gclid|gad_source)=/.test(String(b.u || ""))) origem = "google ads";
  const dia = hojeFoz();
  const ip = req.headers.get("cf-connecting-ip") || "";
  const vh = (await sha256(ip + "|" + ua + "|" + dia + (env.IP_SALT || "iet"))).slice(0, 20);
  ctx.waitUntil((async () => {
    await prepararBanco(env);
    const q = [
      env.DB.prepare("INSERT INTO visitas_dia (dia, pagina, views) VALUES (?, ?, 1) ON CONFLICT(dia, pagina) DO UPDATE SET views = views + 1").bind(dia, pg),
      env.DB.prepare("INSERT OR IGNORE INTO visitantes_dia (dia, vhash) VALUES (?, ?)").bind(dia, vh),
    ];
    if (origem) q.push(env.DB.prepare("INSERT INTO origens_dia (dia, origem, n) VALUES (?, ?, 1) ON CONFLICT(dia, origem) DO UPDATE SET n = n + 1").bind(dia, origem));
    await env.DB.batch(q);
    if (Math.random() < 0.01) await env.DB.prepare("DELETE FROM visitantes_dia WHERE dia < ?").bind(new Date(Date.now() - 400 * 864e5).toISOString().slice(0, 10)).run();
  })().catch((e) => console.error("visita", e && e.message)));
  return new Response(null, { status: 204 });
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
/* ---------------- PayPal (clientes do exterior) ----------------
   Pedido no PayPal com "intent CAPTURE": o dinheiro só sai quando o site captura, na volta do cliente.
   PAYPAL_CLIENT_ID e PAYPAL_SECRET ficam como segredos na Cloudflare (nunca no código). */
const PP_API = "https://api-m.paypal.com";
const temPayPal = (env) => !!(env.PAYPAL_CLIENT_ID && env.PAYPAL_SECRET) || env.PAYPAL_MOCK === "1";
async function ppToken(env) {
  const r = await fetch(PP_API + "/v1/oauth2/token", { method: "POST", signal: AbortSignal.timeout(12000),
    headers: { authorization: "Basic " + btoa(env.PAYPAL_CLIENT_ID + ":" + env.PAYPAL_SECRET), "content-type": "application/x-www-form-urlencoded" }, body: "grant_type=client_credentials" });
  const d = await r.json().catch(() => ({}));
  if (!d.access_token) throw new Error("paypal_token " + r.status);
  return d.access_token;
}
async function ppCriarPedido(env, order_nsu, desc, valor, retorno, cancelar, idioma) {
  if (env.PAYPAL_MOCK === "1") return { url: retorno + "&token=MOCK" + order_nsu.slice(-4), id: "MOCK" + order_nsu.slice(-4) };
  const tk = await ppToken(env);
  const r = await fetch(PP_API + "/v2/checkout/orders", { method: "POST", signal: AbortSignal.timeout(15000),
    headers: { authorization: "Bearer " + tk, "content-type": "application/json", "paypal-request-id": order_nsu },
    body: JSON.stringify({ intent: "CAPTURE",
      purchase_units: [{ reference_id: order_nsu, custom_id: order_nsu, description: desc.slice(0, 120), amount: { currency_code: "BRL", value: valor.toFixed(2) } }],
      payment_source: { paypal: { experience_context: { brand_name: "Iguaçu Executive Transfer", user_action: "PAY_NOW", shipping_preference: "NO_SHIPPING",
        locale: idioma === "es" ? "es-AR" : idioma === "en" ? "en-US" : "pt-BR", return_url: retorno, cancel_url: cancelar } } } }) });
  const d = await r.json().catch(() => ({}));
  const link = (d.links || []).find((l) => l.rel === "payer-action" || l.rel === "approve");
  if (!r.ok || !link) { console.error("paypal order", r.status, JSON.stringify(d).slice(0, 300)); return { erro: (d.details && d.details[0] && d.details[0].issue) || d.name || ("http_" + r.status) }; }
  return { url: link.href, id: d.id };
}
async function ppCapturar(env, id) {
  if (env.PAYPAL_MOCK === "1") return { ok: true, valor: null };
  const tk = await ppToken(env);
  const r = await fetch(PP_API + "/v2/checkout/orders/" + encodeURIComponent(id) + "/capture", { method: "POST", signal: AbortSignal.timeout(15000),
    headers: { authorization: "Bearer " + tk, "content-type": "application/json", "paypal-request-id": "cap-" + id } });
  const d = await r.json().catch(() => ({}));
  const cap = d.purchase_units && d.purchase_units[0] && d.purchase_units[0].payments && d.purchase_units[0].payments.captures && d.purchase_units[0].payments.captures[0];
  if (d.status === "COMPLETED" && cap && cap.status === "COMPLETED") return { ok: true, valor: Number(cap.amount && cap.amount.value) || null, captura: cap.id };
  if (d.name === "UNPROCESSABLE_ENTITY" && JSON.stringify(d).includes("ORDER_ALREADY_CAPTURED")) return { ok: true, valor: null, ja: true };
  console.error("paypal capture", r.status, JSON.stringify(d).slice(0, 300));
  return { ok: false };
}
async function capturarPayPal(env, b, origem) {
  const order_nsu = String(b.order_nsu || ""), token = String(b.token || "").slice(0, 40);
  if (!/^IET-[A-Z0-9]{6}-[A-Z0-9]{4}$/.test(order_nsu) || !/^[A-Z0-9]{4,40}$/.test(token)) return { ok: false, erro: "dados" };
  await prepararBanco(env);
  const pg = await env.DB.prepare("SELECT pg.*, p.codigo, p.status AS pedido_status, p.nome FROM pagamentos pg JOIN pedidos p ON p.id = pg.pedido_id WHERE pg.order_nsu = ? AND pg.provedor = 'paypal'").bind(order_nsu).first();
  if (!pg || pg.slug !== token) return { ok: false, erro: "nao_encontrado" };
  if (pg.status === "pago") return { ok: true, pago: true, codigo: pg.codigo, ja: true };
  const c = await ppCapturar(env, token);
  if (!c.ok) return { ok: true, pago: false, codigo: pg.codigo };
  const now = agoraIso(), valorPago = c.valor || pg.valor;
  const r = await env.DB.prepare("UPDATE pagamentos SET status = 'pago', pago_em = ?, valor_pago = ?, metodo = 'paypal', parcelas = 1, transaction_nsu = ? WHERE id = ? AND status != 'pago'").bind(now, valorPago, c.captura || null, pg.id).run();
  if (!r.meta || !r.meta.changes) return { ok: true, pago: true, codigo: pg.codigo, ja: true };
  const texto = "Pagamento recebido: " + brl(valorPago) + " por PayPal (" + (pg.descricao || "pagamento") + ")";
  const ops = [env.DB.prepare("INSERT INTO eventos (pedido_id, em, tipo, autor, texto) VALUES (?,?,?,?,?)").bind(pg.pedido_id, now, "pagamento", "PayPal", texto)];
  if (["solicitacao", "pagamento_pendente"].includes(pg.pedido_status)) {
    ops.push(env.DB.prepare("UPDATE pedidos SET status = 'aprovado', atualizado_em = ? WHERE id = ?").bind(now, pg.pedido_id));
    ops.push(env.DB.prepare("INSERT INTO eventos (pedido_id, em, tipo, status_de, status_para, autor, texto) VALUES (?,?,?,?,?,?,?)").bind(pg.pedido_id, now, "status", pg.pedido_status, "aprovado", "PayPal", null));
  }
  await env.DB.batch(ops);
  await enviarAviso(env, "Pagamento recebido " + pg.codigo + " · " + brl(valorPago) + " (PayPal)", texto + "\nCliente: " + pg.nome + "\n\nPainel: " + origem + "/admin/#" + pg.codigo);
  return { ok: true, pago: true, codigo: pg.codigo };
}

/* Cria o link no InfinitePay e registra no pedido (usado pelo painel e pela reserva com pagamento na hora) */
async function gerarLinkPagamento(env, ped, desc, valor, origem, autor, provedor = "infinitepay", idioma = "pt") {
  const tel = String(ped.telefone || "").replace(/\D/g, "");
  const order_nsu = ped.codigo + "-" + aleatorio(4);
  if (provedor === "paypal") {
    const lg = idioma === "pt" ? "" : "&lang=" + idioma;
    const pr = await ppCriarPedido(env, order_nsu, desc + " · " + ped.codigo + " · Iguaçu Executive Transfer", valor,
      origem + "/reservar/pago/?pedido=" + ped.codigo + "&pp=" + order_nsu + lg, origem + "/reservar/pago/?pedido=" + ped.codigo + "&cancelado=1" + lg, idioma);
    if (pr.erro) return pr;
    const now = agoraIso();
    await env.DB.batch([
      env.DB.prepare("INSERT INTO pagamentos (pedido_id, provedor, order_nsu, descricao, valor, url, status, criado_em, autor, slug) VALUES (?,?,?,?,?,?,?,?,?,?)").bind(ped.id, "paypal", order_nsu, desc, valor, pr.url, "aguardando", now, autor, pr.id),
      env.DB.prepare("INSERT INTO eventos (pedido_id, em, tipo, autor, texto) VALUES (?,?,?,?,?)").bind(ped.id, now, "pagamento", autor, "Link PayPal gerado: " + desc + " " + brl(valor)),
      ...(ped.status === "solicitacao" ? [env.DB.prepare("UPDATE pedidos SET status = 'pagamento_pendente', atualizado_em = ? WHERE id = ?").bind(now, ped.id),
        env.DB.prepare("INSERT INTO eventos (pedido_id, em, tipo, status_de, status_para, autor) VALUES (?,?,?,?,?,?)").bind(ped.id, now, "status", "solicitacao", "pagamento_pendente", autor)] : []),
    ]);
    return { url: pr.url };
  }
  const corpo = { handle: env.INFINITEPAY_HANDLE, order_nsu, redirect_url: origem + "/reservar/pago/?pedido=" + ped.codigo,
    webhook_url: origem + "/api/pagamentos/infinitepay",
    items: [{ description: (desc + " · reserva " + ped.codigo + " · Iguaçu Executive Transfer").slice(0, 120), price: Math.round(valor * 100), quantity: 1 }],
    customer: { name: ped.nome, email: ped.email, ...(tel.length >= 10 ? { phone_number: "+" + (tel.length <= 11 ? "55" : "") + tel } : {}) } };
  const r = await ipCriarLink(env, corpo);
  if (r.erro) return r;
  const now = agoraIso();
  await env.DB.batch([
    env.DB.prepare("INSERT INTO pagamentos (pedido_id, provedor, order_nsu, descricao, valor, url, status, criado_em, autor) VALUES (?,?,?,?,?,?,?,?,?)").bind(ped.id, "infinitepay", order_nsu, desc, valor, r.url, "aguardando", now, autor),
    env.DB.prepare("INSERT INTO eventos (pedido_id, em, tipo, autor, texto) VALUES (?,?,?,?,?)").bind(ped.id, now, "pagamento", autor, "Link de pagamento gerado: " + desc + " " + brl(valor)),
    ...(ped.status === "solicitacao" ? [env.DB.prepare("UPDATE pedidos SET status = 'pagamento_pendente', atualizado_em = ? WHERE id = ?").bind(now, ped.id),
      env.DB.prepare("INSERT INTO eventos (pedido_id, em, tipo, status_de, status_para, autor) VALUES (?,?,?,?,?,?)").bind(ped.id, now, "status", "solicitacao", "pagamento_pendente", autor)] : []),
  ]);
  return { url: r.url };
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
  if (partes[0] === "stories") return adminStories(req, env, partes);
  if (partes[0] === "tarifas") {
    const txt = (v, n = 200) => String(v == null ? "" : v).replace(/\s+/g, " ").trim().slice(0, n);
    if (req.method === "GET") {
      await seedAriel(env);
      const fs = (await env.DB.prepare("SELECT * FROM fornecedores ORDER BY ativo DESC, pais, nome").all()).results;
      const ts = (await env.DB.prepare("SELECT * FROM fornecedor_tarifas ORDER BY rota").all()).results;
      const cb = await env.DB.prepare("SELECT valor, atualizado_em FROM config_admin WHERE chave = 'cambio'").first();
      return json({ ok: true, fornecedores: fs.map((f) => ({ ...f, tarifas: ts.filter((t) => t.fornecedor_id === f.id) })), cambio: cb ? { ...JSON.parse(cb.valor || "{}"), atualizado_em: cb.atualizado_em } : {} });
    }
    let b; try { b = await lerJson(req, 6000); } catch { return erro("json_invalido"); }
    const agora = agoraIso();
    if (partes[1] === "fornecedor") {
      const nome = txt(b.nome, 80); if (nome.length < 2) return erro("nome");
      const pais = ["BR", "AR", "PY"].includes(b.pais) ? b.pais : "BR";
      const v = [nome, pais, txt(b.telefone, 30), txt(b.veiculos, 300), txt(b.pagamento, 300), txt(b.notas, 600), b.ativo === false || b.ativo === 0 ? 0 : 1];
      if (b.id) await env.DB.prepare("UPDATE fornecedores SET nome=?, pais=?, telefone=?, veiculos=?, pagamento=?, notas=?, ativo=?, atualizado_em=? WHERE id=?").bind(...v, agora, parseInt(b.id, 10)).run();
      else await env.DB.prepare("INSERT INTO fornecedores (nome, pais, telefone, veiculos, pagamento, notas, ativo, criado_em, atualizado_em) VALUES (?,?,?,?,?,?,?,?,?)").bind(...v, agora, agora).run();
      return json({ ok: true });
    }
    if (partes[1] === "tarifa") {
      const rota = txt(b.rota, 120); if (rota.length < 3) return erro("rota");
      const valor = Number(String(b.valor).replace(/\./g, "").replace(",", "."));
      if (!(valor > 0 && valor < 1e9)) return erro("valor");
      const moeda = ["BRL", "ARS", "USD", "PYG"].includes(b.moeda) ? b.moeda : "BRL";
      const sid = b.servico_id && servico(String(b.servico_id)) ? String(b.servico_id) : null;
      const cat = sid && CATEGORIAS[b.categoria] ? String(b.categoria) : null;
      const fid = parseInt(b.fornecedor_id, 10);
      if (!(await env.DB.prepare("SELECT id FROM fornecedores WHERE id = ?").bind(fid).first())) return erro("fornecedor");
      const v = [fid, rota, sid, cat, valor, moeda, txt(b.obs, 200), agora];
      if (b.id) await env.DB.prepare("UPDATE fornecedor_tarifas SET fornecedor_id=?, rota=?, servico_id=?, categoria=?, valor=?, moeda=?, obs=?, atualizado_em=? WHERE id=?").bind(...v, parseInt(b.id, 10)).run();
      else await env.DB.prepare("INSERT INTO fornecedor_tarifas (fornecedor_id, rota, servico_id, categoria, valor, moeda, obs, atualizado_em) VALUES (?,?,?,?,?,?,?,?)").bind(...v).run();
      return json({ ok: true });
    }
    if (partes[1] === "excluir") {
      const id = parseInt(b.id, 10);
      if (b.tipo === "tarifa") await env.DB.prepare("DELETE FROM fornecedor_tarifas WHERE id = ?").bind(id).run();
      else if (b.tipo === "fornecedor") await env.DB.batch([env.DB.prepare("DELETE FROM fornecedor_tarifas WHERE fornecedor_id = ?").bind(id), env.DB.prepare("DELETE FROM fornecedores WHERE id = ?").bind(id)]);
      else return erro("tipo");
      return json({ ok: true });
    }
    if (partes[1] === "cambio") {
      const num = (x) => { const n = Number(String(x || "").replace(",", ".")); return n > 0 && n < 1e7 ? n : null; };
      const val = { ARS: num(b.ARS), USD: num(b.USD), PYG: num(b.PYG) };
      await env.DB.prepare("INSERT INTO config_admin (chave, valor, atualizado_em) VALUES ('cambio', ?, ?) ON CONFLICT(chave) DO UPDATE SET valor = excluded.valor, atualizado_em = excluded.atualizado_em").bind(JSON.stringify(val), agora).run();
      return json({ ok: true });
    }
    return erro("rota", 404);
  }
  if (partes[0] === "conversas") {
    if (partes[1]) {
      const c = await env.DB.prepare("SELECT * FROM conversas WHERE id = ?").bind(partes[1]).first();
      if (!c) return erro("nao_encontrado", 404);
      return json({ ok: true, conversa: { ...c, msgs: JSON.parse(c.msgs_json || "[]"), msgs_json: undefined, ip_hash: undefined } });
    }
    const q = String(url.searchParams.get("q") || "").trim().slice(0, 60);
    const sql = "SELECT id, criado_em, atualizado_em, nome, telefone, idioma, pagina, n_msgs, cotou, humano FROM conversas" + (q ? " WHERE nome LIKE ?1 OR telefone LIKE ?1" : "") + " ORDER BY atualizado_em DESC LIMIT 200";
    const st = q ? env.DB.prepare(sql).bind("%" + q + "%") : env.DB.prepare(sql);
    return json({ ok: true, conversas: (await st.all()).results });
  }
  if (partes[0] === "visitas") {
    const dias = Math.min(365, Math.max(1, parseInt(url.searchParams.get("dias") || "7", 10) || 7));
    const desde = new Date(Date.parse(hojeFoz() + "T12:00:00Z") - (dias - 1) * 864e5).toISOString().slice(0, 10);
    const [pags, porDia, vis, orig] = await env.DB.batch([
      env.DB.prepare("SELECT pagina, SUM(views) v FROM visitas_dia WHERE dia >= ? GROUP BY pagina ORDER BY v DESC LIMIT 60").bind(desde),
      env.DB.prepare("SELECT dia, SUM(views) v FROM visitas_dia WHERE dia >= ? GROUP BY dia ORDER BY dia").bind(desde),
      env.DB.prepare("SELECT dia, COUNT(*) u FROM visitantes_dia WHERE dia >= ? GROUP BY dia ORDER BY dia").bind(desde),
      env.DB.prepare("SELECT origem, SUM(n) n FROM origens_dia WHERE dia >= ? GROUP BY origem ORDER BY n DESC LIMIT 15").bind(desde),
    ]);
    const conv = await env.DB.prepare("SELECT COUNT(*) n FROM conversas WHERE criado_em >= ?").bind(desde).first();
    const ped = await env.DB.prepare("SELECT COUNT(*) n FROM pedidos WHERE criado_em >= ? AND status != 'cancelada'").bind(desde).first();
    return json({ ok: true, desde, dias, paginas: pags.results, porDia: porDia.results, visitantes: vis.results, origens: orig.results, conversas: conv ? conv.n : 0, pedidos: ped ? ped.n : 0 });
  }
  if (partes[0] === "precos") return adminPrecos(req, env, user);
  if (partes[0] === "cupons") {
    if (req.method === "GET") return json({ ok: true, hoje: hojeFoz(),
      cupons: (await env.DB.prepare("SELECT c.*, pa.codigo AS pc, COALESCE(pa.empresa, pa.responsavel) AS pn FROM cupons c LEFT JOIN parceiros pa ON pa.id = c.parceiro_id ORDER BY c.criado_em DESC").all()).results,
      parceiros: (await env.DB.prepare("SELECT codigo, COALESCE(empresa, responsavel) AS nome, comissao_pct FROM parceiros WHERE tipo = 'indica' AND status = 'aprovado' ORDER BY nome").all()).results });
    let b; try { b = await lerJson(req, 2000); } catch { return erro("json_invalido"); }
    const cod = String(b.codigo || "").trim().toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 30);
    if (cod.length < 3) return erro("codigo");
    if (partes[1] === "ativo") {
      await env.DB.prepare("UPDATE cupons SET ativo = ? WHERE codigo = ?").bind(b.ativo ? 1 : 0, cod).run();
      return json({ ok: true });
    }
    const pct = Number(String(b.pct).replace(",", "."));
    if (!(pct > 0 && pct <= 50)) return erro("pct");
    const data = (v) => /^\d{4}-\d{2}-\d{2}$/.test(v || "") ? v : null;
    const max = b.usos_max === "" || b.usos_max == null ? null : parseInt(b.usos_max, 10);
    if (max != null && !(max >= 1)) return erro("usos");
    let parcId = null;
    if (b.parceiro) {
      const pa = await env.DB.prepare("SELECT id FROM parceiros WHERE codigo = ? AND tipo = 'indica'").bind(String(b.parceiro)).first();
      if (!pa) return erro("parceiro");
      parcId = pa.id;
    }
    try {
      await env.DB.prepare("INSERT INTO cupons (codigo, pct, ativo, inicio, fim, usos_max, descricao, criado_em, autor, parceiro_id) VALUES (?,?,?,?,?,?,?,?,?,?)")
        .bind(cod, pct, 1, data(b.inicio), data(b.fim), max, String(b.descricao || "").slice(0, 120) || null, agoraIso(), user.email, parcId).run();
    } catch (e) { return erro("ja_existe"); }
    return json({ ok: true });
  }
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
      return json({ ok: true, pedido: p, itens, eventos, parceiro: parc, corridas, pagamentos, pagamentoOnline: !!env.INFINITEPAY_HANDLE || temPayPal(env), infinitepay: !!env.INFINITEPAY_HANDLE, paypal: temPayPal(env) });
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
      if (!env.INFINITEPAY_HANDLE && !temPayPal(env)) return erro("sem_infinitepay");
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
      const prov = b.provedor === "paypal" ? "paypal" : "infinitepay";
      if (prov === "paypal" && !temPayPal(env)) return erro("sem_paypal");
      const r = await gerarLinkPagamento(env, p, desc, valor, url.origin, user.email, prov, ["en", "es"].includes(p.idioma) ? p.idioma : "pt");
      if (r.erro) return erro(prov, 502, { detalhe: r.erro });
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
  if (p === "/api/assistente" && m === "POST") {
    let b; try { b = await lerJson(req, 12000); } catch { return erro("json_invalido"); }
    await prepararBanco(env);
    const ip = req.headers.get("cf-connecting-ip") || "";
    const ipHash = ip ? await sha256(ip + (env.IP_SALT || "iet")) : "sem-ip";
    const desde = new Date(Date.now() - 3600e3).toISOString();
    const u = await env.DB.prepare("SELECT COUNT(*) n FROM ia_uso WHERE ip_hash = ? AND em > ?").bind(ipHash, desde).first();
    if (u && u.n >= 40) return erro("muitas_mensagens", 429);
    await env.DB.prepare("INSERT INTO ia_uso (ip_hash, em) VALUES (?, ?)").bind(ipHash, agoraIso()).run();
    if (Math.random() < 0.02) ctx.waitUntil(env.DB.prepare("DELETE FROM ia_uso WHERE em < ?").bind(new Date(Date.now() - 2 * 864e5).toISOString()).run());
    const cv = b.conversa || {};
    const cvId = String(cv.id || "").replace(/[^a-z0-9]/gi, "").slice(0, 24);
    const cvNome = String(cv.nome || "").replace(/\s+/g, " ").trim().slice(0, 80);
    const cvTel = String(cv.telefone || "").replace(/[^\d+]/g, "").slice(0, 20);
    if (cvId.length < 10 || cvNome.length < 2 || cvTel.replace(/\D/g, "").length < 8 || !cv.consentimento) return erro("contato", 400);
    try {
      const r = await assistente(env, { ...b, _preview: url.hostname.endsWith(".workers.dev") || url.hostname === "127.0.0.1" || url.hostname === "localhost" });
      ctx.waitUntil(salvarConversa(env, { id: cvId, nome: cvNome, telefone: cvTel, idioma: String(b.lang || "pt").slice(0, 2), pagina: String(b.pagina || "").slice(0, 160), ipHash }, b.mensagens, r).catch((e) => console.error("conversa", e && e.message)));
      return json(r, r.ok ? 200 : 400);
    }
    catch (e) { console.error("assistente", e && e.stack); return json({ ok: false, erro: "ia_indisponivel" }, 503); }
  }
  if (p === "/api/cupom" && m === "POST") {
    let b; try { b = await lerJson(req, 500); } catch { return erro("json_invalido"); }
    // limite de tentativas por IP (evita adivinhar cupons por força bruta)
    await prepararBanco(env);
    const ipc = req.headers.get("cf-connecting-ip") || "";
    const hc = "cupom:" + (ipc ? await sha256(ipc + (env.IP_SALT || "iet")) : "sem-ip");
    const uc = await env.DB.prepare("SELECT COUNT(*) n FROM ia_uso WHERE ip_hash = ? AND em > ?").bind(hc, new Date(Date.now() - 3600e3).toISOString()).first();
    if (uc && uc.n >= 20) return erro("muitas_tentativas", 429);
    await env.DB.prepare("INSERT INTO ia_uso (ip_hash, em) VALUES (?, ?)").bind(hc, agoraIso()).run();
    const r = await buscarCupom(env, b.codigo);
    return json(r, r.ok ? 200 : 400);
  }
  if (p === "/api/pagamentos/paypal/capturar" && m === "POST") {
    let b; try { b = await lerJson(req, 2000); } catch { return erro("json_invalido"); }
    const r = await capturarPayPal(env, b, url.origin);
    return json(r, r.ok ? 200 : 400);
  }
  if (p === "/api/pagamentos/conferir" && m === "POST") {
    let b; try { b = await lerJson(req, 4000); } catch { return erro("json_invalido"); }
    const r = await confirmarPagamento(env, b, url.origin);
    return json(r, r.ok ? 200 : 400);
  }
  if (p === "/api/pedidos/pagar" && m === "POST") return pagarPedidoCliente(req, env, url.origin);
  if (p === "/api/visita" && m === "POST") return registrarVisita(req, env, ctx);
  if (p === "/api/stories" && m === "GET") return listarStories(env);
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
  "suv-executivo-corolla-cross-preto", "frota-suv-executivo-corolla-cross", "sedan-executivo-corolla-preto-avenida", "motorista-executivo-corolla-cross-cinza", "feirinha-puerto-iguazu-vinhos-queijos-alfajores", "jantar-parrilla-puerto-iguazu-argentina", "cassino-puerto-iguazu-transfer-executivo", "duty-free-puerto-iguazu-compras", "jantar-romantico-puerto-iguazu", "transfer-carro-comum-prata-foz-do-iguacu", "transfer-carro-7-lugares-preto-foz-do-iguacu", "van-executiva-preta-transfer-foz-do-iguacu", "hito-tres-fronteras-por-do-sol-puerto-iguazu"]);
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
const APP_HEAD = '<link rel="manifest" href="/manifest.webmanifest"><meta name="theme-color" content="#0b0b0b"><link rel="apple-touch-icon" href="/img/app-180.png"><meta name="apple-mobile-web-app-title" content="IET Transfer"><script src="/js/app.js?v=5" defer></script><script src="/js/assistente.js?v=8" defer></script>';
/* Vídeos: o Safari (iPhone) só toca se o servidor responder a pedidos por partes (Range → 206). */
/* ---------------- stories da página inicial (mídia guardada no Workers KV "MIDIA") ---------------- */
async function servirMidia(req, env, url) {
  if (!env.MIDIA) return new Response("not found", { status: 404 });
  const chave = url.pathname.slice(3);
  if (!/^[a-z0-9]{20,40}\.(webp|jpg|png|mp4|webm|mov)$/.test(chave)) return new Response("not found", { status: 404 });
  const { value, metadata } = await env.MIDIA.getWithMetadata(chave, { type: "arrayBuffer", cacheTtl: 86400 });
  if (!value) return new Response("not found", { status: 404 });
  const h = new Headers({ "content-type": (metadata && metadata.mime) || "application/octet-stream", "cache-control": "public, max-age=31536000, immutable", "accept-ranges": "bytes" });
  const tam = value.byteLength, range = req.headers.get("range");
  if (!range) { h.set("content-length", String(tam)); return new Response(req.method === "HEAD" ? null : value, { status: 200, headers: h }); }
  const m = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
  let ini, fim;
  if (m && m[1] !== "") { ini = +m[1]; fim = m[2] !== "" ? Math.min(+m[2], tam - 1) : tam - 1; }
  else if (m && m[2] !== "") { ini = Math.max(0, tam - +m[2]); fim = tam - 1; }
  if (ini === undefined || ini > fim || ini >= tam) { h.set("content-range", "bytes */" + tam); return new Response(null, { status: 416, headers: h }); }
  h.set("content-range", `bytes ${ini}-${fim}/${tam}`); h.set("content-length", String(fim - ini + 1));
  return new Response(req.method === "HEAD" ? null : value.slice(ini, fim + 1), { status: 206, headers: h });
}
async function listarStories(env) {
  await prepararBanco(env);
  const r = (await env.DB.prepare("SELECT id, titulo, tipo, midia, capa, link, cta FROM stories WHERE ativo = 1 ORDER BY ordem, id DESC LIMIT 20").all()).results;
  return json({ ok: true, stories: env.MIDIA ? r : [] }, 200, { "cache-control": "public, max-age=60" });
}
async function adminStories(req, env, partes) {
  if (req.method === "GET" && !partes[1]) return json({ ok: true, armazenamento: !!env.MIDIA, stories: (await env.DB.prepare("SELECT * FROM stories ORDER BY ordem, id DESC").all()).results });
  if (partes[1] === "midia" && req.method === "PUT") {
    if (!env.MIDIA) return erro("sem_armazenamento", 503);
    const mime = String(req.headers.get("content-type") || "").split(";")[0].trim();
    const ext = { "image/webp": "webp", "image/jpeg": "jpg", "image/png": "png", "video/mp4": "mp4", "video/webm": "webm", "video/quicktime": "mov" }[mime];
    if (!ext) return erro("tipo_arquivo");
    const buf = await req.arrayBuffer();
    const max = mime.startsWith("video/") ? 24 * 1024 * 1024 : 5 * 1024 * 1024;
    if (!buf.byteLength || buf.byteLength > max) return erro("tamanho");
    const chave = aleatorio(24).toLowerCase() + "." + ext;
    await env.MIDIA.put(chave, buf, { metadata: { mime, tam: buf.byteLength } });
    return json({ ok: true, chave, url: "/m/" + chave });
  }
  let b; try { b = await lerJson(req, 4000); } catch { return erro("json_invalido"); }
  const txt = (v, n) => String(v == null ? "" : v).replace(/\s+/g, " ").trim().slice(0, n);
  const okChave = (c) => /^[a-z0-9]{20,40}\.(webp|jpg|png|mp4|webm|mov)$/.test(String(c || ""));
  const okLink = (l) => !l || /^(\/[^\s]*|https:\/\/[^\s]+)$/.test(l);
  if (partes[1] === "excluir") {
    const st = await env.DB.prepare("SELECT midia, capa FROM stories WHERE id = ?").bind(parseInt(b.id, 10)).first();
    if (st && env.MIDIA) { for (const c of [st.midia, st.capa]) if (c) await env.MIDIA.delete(c); }
    await env.DB.prepare("DELETE FROM stories WHERE id = ?").bind(parseInt(b.id, 10)).run();
    return json({ ok: true });
  }
  if (partes[1] === "ordem" && Array.isArray(b.ids)) {
    await env.DB.batch(b.ids.slice(0, 50).map((id, i) => env.DB.prepare("UPDATE stories SET ordem = ? WHERE id = ?").bind(i, parseInt(id, 10))));
    return json({ ok: true });
  }
  const titulo = txt(b.titulo, 24), link = txt(b.link, 300), cta = txt(b.cta, 30);
  if (titulo.length < 2) return erro("titulo");
  if (!okLink(link)) return erro("link");
  if (b.id) {
    await env.DB.prepare("UPDATE stories SET titulo = ?, link = ?, cta = ?, ativo = ? WHERE id = ?").bind(titulo, link || null, cta || null, b.ativo === false || b.ativo === 0 ? 0 : 1, parseInt(b.id, 10)).run();
    return json({ ok: true });
  }
  if (!okChave(b.midia) || (b.capa && !okChave(b.capa))) return erro("midia");
  const tipo = /\.(mp4|webm|mov)$/.test(b.midia) ? "video" : "imagem";
  await env.DB.prepare("INSERT INTO stories (titulo, tipo, midia, capa, link, cta, ordem, ativo, criado_em) VALUES (?,?,?,?,?,?,?,1,?)")
    .bind(titulo, tipo, b.midia, b.capa || null, link || null, cta || null, -Date.now() % 1e9, agoraIso()).run();
  return json({ ok: true });
}

async function videoParcial(req, env) {
  const base = await env.ASSETS.fetch(new Request(req.url, { method: "GET" }));
  const range = req.headers.get("range");
  if (!base.ok) return base;
  const h = new Headers(base.headers);
  h.set("accept-ranges", "bytes");
  h.set("cache-control", "public, max-age=604800");
  if (!range) return new Response(req.method === "HEAD" ? null : base.body, { status: 200, headers: h });
  const buf = await base.arrayBuffer(), tam = buf.byteLength;
  const m = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
  let ini, fim;
  if (m && m[1] !== "") { ini = +m[1]; fim = m[2] !== "" ? Math.min(+m[2], tam - 1) : tam - 1; }
  else if (m && m[2] !== "") { ini = Math.max(0, tam - +m[2]); fim = tam - 1; }
  if (ini === undefined || ini > fim || ini >= tam) { h.set("content-range", "bytes */" + tam); return new Response(null, { status: 416, headers: h }); }
  h.set("content-range", `bytes ${ini}-${fim}/${tam}`);
  h.set("content-length", String(fim - ini + 1));
  return new Response(req.method === "HEAD" ? null : buf.slice(ini, fim + 1), { status: 206, headers: h });
}

/* Vídeos de fundo no topo de algumas páginas (gerados com IA a partir do Corolla preto) */
const HERO_VIDEO = {
  "/reservar/": "reservas-foz", "/reservar/index.html": "reservas-foz",
  "/pt/transfer-itaipu-foz-do-iguacu.html": "itaipu-corolla", "/en/itaipu-dam-tour-transfer.html": "itaipu-corolla",
  "/pt/transfer-vip-foz-do-iguacu.html": "itaipu-corolla", "/pt/taxi-corporativo-foz-do-iguacu.html": "itaipu-corolla",
  "/passeios/passeio-marco-trifronteira.html": "marco-corolla", "/en/triple-frontier-landmark-tour.html": "marco-corolla",
  "/passeios/passeio-compras-ciudad-del-este.html": "ponte-corolla", "/en/ciudad-del-este-shopping-tour.html": "ponte-corolla",
  "/pt/taxi-para-fronteira-foz-do-iguacu.html": "ponte-corolla", "/passeios/passeio-3-paises-1-dia.html": "ponte-corolla", "/en/three-countries-one-day-tour.html": "ponte-corolla",
};
const HV_CSS = '<style>.hv{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:-2;opacity:0;transition:opacity 1.2s ease;pointer-events:none}.hv.on{opacity:1}.a-hero:has(.hv.on)::after{background:linear-gradient(90deg,rgba(8,9,10,.9) 0%,rgba(8,9,10,.6) 48%,rgba(8,9,10,.22) 100%),linear-gradient(180deg,rgba(8,9,10,.35) 0%,transparent 28%,transparent 62%,var(--bg))}.r-hero:has(.hv.on)::after{background:linear-gradient(180deg,rgba(8,9,10,.5) 0%,rgba(8,9,10,.58) 55%,var(--bg) 100%)}@media(max-width:760px){.a-hero:has(.hv.on)::after{background:linear-gradient(180deg,rgba(8,9,10,.45) 0%,rgba(8,9,10,.66) 45%,rgba(8,9,10,.9) 82%,var(--bg))}}@media(prefers-reduced-motion:reduce){.hv{transition:none}}</style><script src="/js/hero-video.js?v=1" defer></script>';
function heroVideo(k) {
  return `<video class="hv" data-hero-video muted loop playsinline autoplay preload="none" aria-hidden="true" tabindex="-1" poster="/img/${k}-poster.webp" data-src-d="/video/${k}-1280.mp4" data-src-m="/video/${k}-mobile.mp4" data-poster-m="/img/${k}-poster-m.webp"></video>`;
}

function comApp(res, url) {
  const p = url.pathname;
  if (!res.ok || !(res.headers.get("content-type") || "").includes("text/html")) return res;
  if (p.startsWith("/admin") || p.startsWith("/parceiro/") || p.startsWith("/motorista/") || p === "/offline.html") return res;
  const k = HERO_VIDEO[p];
  let rw = new HTMLRewriter().on("head", { element(el) { el.append(APP_HEAD + (k ? HV_CSS : ""), { html: true }); } });
  if (k) {
    let feito = false;
    rw = rw.on("section.a-hero, section.r-hero", { element(el) { if (!feito) { feito = true; el.prepend(heroVideo(k), { html: true }); } } });
  }
  return rw.transform(res);
}

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    let res;
    if (url.pathname.startsWith("/api/")) {
      try { await carregarPrecos(env); res = await api(req, env, ctx, url); }
      catch (e) { console.error("api", e && e.stack); res = erro("interno", 500); }
    } else {
      res = url.pathname.startsWith("/m/") ? await servirMidia(req, env, url) : url.pathname.startsWith("/video/") ? await videoParcial(req, env) : await env.ASSETS.fetch(req);
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
