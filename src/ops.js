/* Plataforma de gestão — API interna /api/admin/ops/*.
   Nada aqui é usado pelo site ou pela venda. Toda rota exige login do Access E permissão do papel. */
import { papelDe, permissoes, pode } from "./acesso.js";
import { CONFIG, CATEGORIAS } from "./precos.js";
import { servico } from "./cotacao.js";

const json = (obj, status = 200) => new Response(JSON.stringify(obj), {
  status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex" },
});
const erro = (codigo, status = 400, extra = {}) => json({ ok: false, erro: codigo, ...extra }, status);
const txt = (v, n = 160) => String(v == null ? "" : v).replace(/\s+/g, " ").trim().slice(0, n);
const inteiro = (v, min, max, pad) => { const n = parseInt(v, 10); return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : pad; };
const dinheiro = (v) => { const n = typeof v === "number" ? v : Number(String(v == null ? "" : v).replace(/[R$\s]/g, "").replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", ".")); return Number.isFinite(n) ? Math.round(n * 100) / 100 : NaN; };
function aleatorio(n, alfabeto = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789") {
  const b = crypto.getRandomValues(new Uint8Array(n)); let r = "";
  for (const x of b) r += alfabeto[x % alfabeto.length];
  return r;
}
const tokenHex = () => [...crypto.getRandomValues(new Uint8Array(16))].map((b) => b.toString(16).padStart(2, "0")).join("");

export const ORIGENS_MANUAIS = ["whatsapp", "telefone", "indicacao", "parceiro", "agencia", "outro"];
export const METODOS = ["pix", "cartao", "link_infinitepay", "paypal", "dinheiro", "transferencia"];
const STATUS_MANUAL = ["confirmada", "pagamento_pendente", "solicitacao"];

/* Valida o corpo da reserva manual. Função pura (sem banco), testada em tests/ops.test.mjs. */
export function validarReservaManual(b) {
  b = b || {};
  const c = b.cliente || {};
  const cliente = { nome: txt(c.nome, 120), telefone: txt(c.telefone, 40), email: txt(c.email, 160).toLowerCase(), pais: txt(c.pais, 60) };
  if (cliente.nome.length < 2) return { erro: "nome" };
  if (cliente.telefone.replace(/\D/g, "").length < 8) return { erro: "telefone" };
  if (cliente.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(cliente.email)) return { erro: "email" };
  const idioma = ["pt", "en", "es"].includes(b.idioma) ? b.idioma : "pt";
  const origem = ORIGENS_MANUAIS.includes(b.origem) ? b.origem : "whatsapp";
  const status = STATUS_MANUAL.includes(b.status) ? b.status : "confirmada";
  let codigo = null;
  if (b.codigo) { codigo = txt(b.codigo, 12).toUpperCase(); if (!/^IET-[A-Z0-9]{6}$/.test(codigo)) return { erro: "codigo" }; }
  const lista = Array.isArray(b.itens) ? b.itens : [];
  if (!lista.length || lista.length > 10) return { erro: "itens" };
  const itens = [];
  for (let i = 0; i < lista.length; i++) {
    const x = lista[i] || {};
    const svc = servico(txt(x.servico, 40));
    if (!svc || svc.tipo === "combo") return { erro: "servico", item: i };
    const categoria = txt(x.categoria, 10);
    if (!CATEGORIAS[categoria]) return { erro: "categoria", item: i };
    const data = txt(x.data, 10), hora = txt(x.hora, 5);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data) || !/^\d{2}:\d{2}$/.test(hora)) return { erro: "data_hora", item: i };
    const inicio = Date.parse(data + "T" + hora + ":00" + CONFIG.fuso);
    if (!Number.isFinite(inicio)) return { erro: "data_hora", item: i };
    const valor = dinheiro(x.valor);
    if (!(valor >= 0 && valor <= 100000)) return { erro: "valor", item: i };
    itens.push({
      servico_id: svc.id, servico_nome: svc.nome.pt, categoria, data, hora, inicio_utc: new Date(inicio).toISOString(),
      sentido: svc.sentido ? (x.sentido === "saida" ? "saida" : "chegada") : null,
      voo: txt(x.voo, 20) || null, origem: txt(x.origem) || null, destino: txt(x.destino) || null,
      pax: inteiro(x.pax, 1, 60, 1), malas: inteiro(x.malas, 0, 30, 0), malas_bordo: inteiro(x.malasBordo, 0, 30, 0), mochilas: inteiro(x.mochilas, 0, 30, 0),
      cadeirinhas: inteiro(x.cadeirinhas, 0, 6, 0), pet: x.pet ? 1 : 0, valor, obs: txt(x.obs, 300) || null,
    });
  }
  const total = Math.round(itens.reduce((a, x) => a + x.valor, 0) * 100) / 100;
  let pagamento = null;
  if (b.pagamento && dinheiro(b.pagamento.valor) > 0) {
    const pg = b.pagamento, valor = dinheiro(pg.valor);
    if (valor > total + 0.001) return { erro: "pagamento_maior_que_total" };
    const metodo = METODOS.includes(pg.metodo) ? pg.metodo : "pix";
    const data = txt(pg.data, 10);
    if (data && !/^\d{4}-\d{2}-\d{2}$/.test(data)) return { erro: "pagamento_data" };
    const recibo = txt(pg.recibo, 300);
    if (recibo && !/^https:\/\/[^\s]+$/.test(recibo)) return { erro: "pagamento_recibo" };
    pagamento = { valor, metodo, data: data || null, recibo: recibo || null, obs: txt(pg.obs, 200) || null };
  }
  return { ok: true, cliente, idioma, origem, status, codigo, itens, total, pagamento, observacoes: txt(b.observacoes, 1000) || null };
}

const NOME_METODO = { pix: "Pix", cartao: "Cartão", link_infinitepay: "Link InfinitePay", paypal: "PayPal", dinheiro: "Dinheiro", transferencia: "Transferência" };

async function criarReservaManual(req, env, user, h) {
  let b; try { b = await req.json(); } catch { return erro("json_invalido"); }
  const v = validarReservaManual(b);
  if (!v.ok) return erro(v.erro, 400, v.item !== undefined ? { item: v.item } : {});
  await h.prepararBanco(env);
  const now = new Date().toISOString();
  let codigo = v.codigo;
  if (codigo) {
    if (await env.DB.prepare("SELECT 1 FROM pedidos WHERE codigo = ?").bind(codigo).first()) return erro("codigo_em_uso", 409);
  } else {
    for (let t = 0; t < 5 && !codigo; t++) { const c = "IET-" + aleatorio(6); if (!(await env.DB.prepare("SELECT 1 FROM pedidos WHERE codigo = ?").bind(c).first())) codigo = c; }
    if (!codigo) return erro("falha_codigo", 500);
  }
  const token = tokenHex();
  const r = await env.DB.prepare(`INSERT INTO pedidos (codigo, token, criado_em, atualizado_em, status, idioma, nome, email, telefone, pais, observacoes,
    consentimento_em, total, valor_agora, modo_pagamento, ip_hash, origem) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    .bind(codigo, token, now, now, v.status, v.idioma, v.cliente.nome, v.cliente.email, v.cliente.telefone, v.cliente.pais || null, v.observacoes,
      now, v.total, v.total, "manual", null, "manual:" + v.origem).run();
  const pedidoId = r.meta && r.meta.last_row_id;
  if (!pedidoId) return erro("falha_gravar", 500);
  const stmts = v.itens.map((it, i) => env.DB.prepare(`INSERT INTO itens (pedido_id, ordem, servico_id, servico_nome, categoria, data, hora, inicio_utc,
    sentido, voo, origem, destino, pax, malas, cadeirinhas, pet, horas_extras, horas, dias, data_especial, valor, modo, valor_agora, linhas_json, obs, malas_bordo, mochilas)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(pedidoId, i + 1, it.servico_id, it.servico_nome, it.categoria, it.data, it.hora, it.inicio_utc,
    it.sentido, it.voo, it.origem, it.destino, it.pax, it.malas, it.cadeirinhas, it.pet, 0, null, null, 0, it.valor, "total", it.valor,
    JSON.stringify([{ k: "manual", valor: it.valor }]), it.obs, it.malas_bordo, it.mochilas));
  const origemTxt = { whatsapp: "WhatsApp", telefone: "telefone", indicacao: "indicação", parceiro: "parceiro", agencia: "agência", outro: "outro canal" }[v.origem];
  stmts.push(env.DB.prepare("INSERT INTO eventos (pedido_id, em, tipo, status_para, autor, texto) VALUES (?,?,?,?,?,?)")
    .bind(pedidoId, now, "criado", v.status, user.email, `Reserva manual registrada no painel (venda por ${origemTxt}).`));
  if (v.pagamento) {
    const pg = v.pagamento, pagoEm = pg.data ? pg.data + "T12:00:00.000Z" : now;
    stmts.push(env.DB.prepare(`INSERT INTO pagamentos (pedido_id, provedor, order_nsu, descricao, valor, url, status, criado_em, autor, pago_em, valor_pago, metodo, recibo_url)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(pedidoId, "manual", "MAN-" + codigo + "-" + aleatorio(4), "Pagamento registrado manualmente" + (pg.obs ? " · " + pg.obs : ""),
      pg.valor, null, "pago", now, user.email, pagoEm, pg.valor, pg.metodo, pg.recibo));
    stmts.push(env.DB.prepare("INSERT INTO eventos (pedido_id, em, tipo, autor, texto) VALUES (?,?,?,?,?)")
      .bind(pedidoId, now, "pagamento", user.email, `Pagamento de R$ ${pg.valor.toFixed(2).replace(".", ",")} registrado (${NOME_METODO[pg.metodo]}${pg.data ? ", em " + pg.data.split("-").reverse().join("/") : ""}).`));
  }
  await env.DB.batch(stmts);
  return json({ ok: true, codigo, total: v.total, pago: v.pagamento ? v.pagamento.valor : 0, status: v.status });
}

export async function ops(req, env, url, user, h = {}) {
  const papel = await papelDe(env, user && user.email);
  if (!papel) return erro("sem_permissao", 403);
  const partes = url.pathname.replace(/^\/api\/admin\/ops\/?/, "").split("/").filter(Boolean);

  // quem sou eu e o que posso fazer (as telas usam isto para montar o menu; o servidor confere de novo em cada rota)
  if (partes[0] === "eu" && req.method === "GET") {
    return json({ ok: true, email: user.email, papel, permissoes: permissoes(papel) });
  }

  // reserva manual (venda fechada no WhatsApp, telefone, indicação...)
  if (partes[0] === "pedidos" && partes.length === 1 && req.method === "POST") {
    if (!pode(papel, "reservas.editar")) return erro("sem_permissao", 403);
    return criarReservaManual(req, env, user, h);
  }

  return erro("rota", 404);
}
