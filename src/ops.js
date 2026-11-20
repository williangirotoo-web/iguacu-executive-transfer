/* Plataforma de gestão — API interna /api/admin/ops/*.
   Nada aqui é usado pelo site ou pela venda. Toda rota exige login do Access E permissão do papel. */
import { papelDe, permissoes, pode } from "./acesso.js";
import { CONFIG, CATEGORIAS } from "./precos.js";
import { servico } from "./cotacao.js";
import { duracaoPadrao, fimPrevisto, statusInicial, PEDIDO_GERA_SERVICO, STATUS_FINAIS, validarMotorista, validarVeiculo } from "./ops-regras.js";

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

/* ---------------- serviços: um registro operacional por trecho de pedido pago/confirmado ----------------
   Roda pelo agendamento (a cada 15 min) e antes de listar serviços. Não toca nas tabelas da venda:
   só lê pedidos/itens/corridas e escreve em servicos. Se as tabelas novas não existirem, não faz nada. */
const semTabela = (e) => /no such table|no such column/i.test(String(e && e.message));
export async function sincronizarServicos(env, agora = Date.now()) {
  const now = new Date(agora).toISOString();
  let dur = {};
  try { dur = Object.fromEntries((await env.DB.prepare("SELECT servico_id, minutos, folga_fronteira_min FROM duracoes").all()).results.map((d) => [d.servico_id, d])); }
  catch (e) { if (semTabela(e)) return { ok: false, motivo: "migracao_pendente" }; throw e; }
  const marcadores = PEDIDO_GERA_SERVICO.map(() => "?").join(",");
  const { results: novos } = await env.DB.prepare(`SELECT i.id AS item_id, i.pedido_id, i.servico_id, i.inicio_utc, i.horas, i.dias, i.horas_extras, p.status AS pedido_status,
      (SELECT c.parceiro_id FROM corridas c WHERE c.item_id = i.id AND c.status = 'aceita' ORDER BY c.id DESC LIMIT 1) AS parceiro_aceito,
      (SELECT c.repasse FROM corridas c WHERE c.item_id = i.id AND c.status = 'aceita' ORDER BY c.id DESC LIMIT 1) AS repasse
    FROM itens i JOIN pedidos p ON p.id = i.pedido_id
    WHERE p.status IN (${marcadores}) AND NOT EXISTS (SELECT 1 FROM servicos s WHERE s.item_id = i.id) LIMIT 400`).bind(...PEDIDO_GERA_SERVICO).all();
  const stmts = novos.map((r) => {
    const svc = servico(r.servico_id), d = dur[r.servico_id];
    const min = (d ? d.minutos : duracaoPadrao(svc, r)) + (d && svc && svc.fronteira ? d.folga_fronteira_min : 0);
    const st = statusInicial(r.pedido_status, r.inicio_utc, agora, !!r.parceiro_aceito);
    return env.DB.prepare(`INSERT OR IGNORE INTO servicos (item_id, pedido_id, inicio_utc, fim_previsto_utc, status, parceiro_id, custo_previsto, importado, criado_em, atualizado_em)
      VALUES (?,?,?,?,?,?,?,?,?,?)`).bind(r.item_id, r.pedido_id, r.inicio_utc, fimPrevisto(r.inicio_utc, min), st, r.parceiro_aceito || null, r.repasse || null,
      Date.parse(r.inicio_utc) < agora ? 1 : 0, now, now);
  });
  // pedido cancelado: serviços ainda abertos viram cancelados
  stmts.push(env.DB.prepare(`UPDATE servicos SET status = 'cancelado', atualizado_em = ? WHERE status NOT IN (${STATUS_FINAIS.map(() => "?").join(",")})
    AND pedido_id IN (SELECT id FROM pedidos WHERE status = 'cancelada')`).bind(now, ...STATUS_FINAIS));
  // data ou hora do trecho mudou no pedido: o serviço acompanha, mantendo a duração
  stmts.push(env.DB.prepare(`UPDATE servicos SET fim_previsto_utc = strftime('%Y-%m-%dT%H:%M:%fZ', (SELECT inicio_utc FROM itens WHERE itens.id = servicos.item_id),
      '+' || CAST(ROUND((julianday(fim_previsto_utc) - julianday(inicio_utc)) * 1440) AS INTEGER) || ' minutes'),
      inicio_utc = (SELECT inicio_utc FROM itens WHERE itens.id = servicos.item_id), atualizado_em = ?
    WHERE inicio_utc <> (SELECT inicio_utc FROM itens WHERE itens.id = servicos.item_id)`).bind(now));
  await env.DB.batch(stmts);
  return { ok: true, criados: novos.length };
}

const CAMPOS_MOT = ["nome", "telefone", "email", "idiomas", "tipo", "parceiro_id", "cnh_validade", "status", "pagamento_modelo", "valor_diaria", "valor_servico", "obs"];
const CAMPOS_VEI = ["placa", "marca", "modelo", "ano", "cor", "categoria", "lugares", "malas", "dono", "parceiro_id", "motorista_padrao_id", "licenciamento_validade", "seguro_validade", "status", "obs"];

async function cadastro(req, env, user, papel, tabela, partes) {
  const mot = tabela === "motoristas", campos = mot ? CAMPOS_MOT : CAMPOS_VEI, validar = mot ? validarMotorista : validarVeiculo;
  if (req.method === "GET" && partes.length === 1) {
    if (!pode(papel, "ops.ver")) return erro("sem_permissao", 403);
    const sql = mot
      ? `SELECT m.id, ${CAMPOS_MOT.map((c) => "m." + c).join(", ")}, m.criado_em, m.atualizado_em, (m.chave_hash IS NOT NULL) AS tem_acesso, pa.empresa AS parceiro_nome, pa.responsavel AS parceiro_resp,
          (SELECT COUNT(*) FROM servicos s WHERE s.motorista_id = m.id AND s.status = 'concluido') AS servicos_feitos FROM motoristas m LEFT JOIN parceiros pa ON pa.id = m.parceiro_id ORDER BY m.status = 'inativo', m.nome`
      : `SELECT v.id, ${CAMPOS_VEI.map((c) => "v." + c).join(", ")}, v.criado_em, v.atualizado_em, mo.nome AS motorista_padrao_nome, pa.empresa AS parceiro_nome, pa.responsavel AS parceiro_resp
          FROM veiculos v LEFT JOIN motoristas mo ON mo.id = v.motorista_padrao_id LEFT JOIN parceiros pa ON pa.id = v.parceiro_id ORDER BY v.status = 'inativo', v.categoria, v.modelo`;
    let lista = (await env.DB.prepare(sql).all()).results;
    if (mot && !pode(papel, "valores.ver")) lista = lista.map(({ valor_diaria, valor_servico, ...x }) => x);
    return json({ ok: true, lista });
  }
  if (!pode(papel, "cadastros.editar")) return erro("sem_permissao", 403);
  let b; try { b = await req.json(); } catch { return erro("json_invalido"); }
  const v = validar(b);
  if (!v.ok) return erro(v.erro, 400);
  const d = v.dados, now = new Date().toISOString();
  if (mot && !pode(papel, "valores.ver")) { delete d.valor_diaria; delete d.valor_servico; }
  const usar = campos.filter((c) => c in d);
  try {
    if (req.method === "POST" && partes.length === 1) {
      const r = await env.DB.prepare(`INSERT INTO ${tabela} (${usar.join(", ")}, criado_em, atualizado_em) VALUES (${usar.map(() => "?").join(",")},?,?)`)
        .bind(...usar.map((c) => d[c]), now, now).run();
      return json({ ok: true, id: r.meta.last_row_id });
    }
    const id = parseInt(partes[1], 10);
    if ((req.method === "PATCH" || req.method === "POST") && partes.length === 2 && id > 0) {
      const r = await env.DB.prepare(`UPDATE ${tabela} SET ${usar.map((c) => c + " = ?").join(", ")}, atualizado_em = ? WHERE id = ?`).bind(...usar.map((c) => d[c]), now, id).run();
      if (!r.meta.changes) return erro("nao_encontrado", 404);
      return json({ ok: true, id });
    }
  } catch (e) {
    if (/UNIQUE/i.test(String(e && e.message))) return erro("placa_em_uso", 409);
    throw e;
  }
  return erro("rota", 404);
}

async function listarServicos(env, url, papel) {
  const hoje = new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10);
  const de = /^\d{4}-\d{2}-\d{2}$/.test(url.searchParams.get("de") || "") ? url.searchParams.get("de") : hoje;
  const ate = /^\d{4}-\d{2}-\d{2}$/.test(url.searchParams.get("ate") || "") ? url.searchParams.get("ate") : null;
  const ini = Date.parse(de + "T00:00:00-03:00");
  let fim = ate ? Date.parse(ate + "T23:59:59-03:00") : ini + 14 * 864e5;
  if (!(fim > ini)) return erro("periodo");
  if (fim - ini > 92 * 864e5) fim = ini + 92 * 864e5;
  await sincronizarServicos(env);
  const { results } = await env.DB.prepare(`SELECT s.id, s.status, s.inicio_utc, s.fim_previsto_utc, s.motorista_id, s.veiculo_id, s.parceiro_id, s.custo_previsto, s.importado,
      i.servico_id, i.servico_nome, i.categoria, i.data, i.hora, i.sentido, i.voo, i.origem, i.destino, i.pax, i.malas, i.malas_bordo, i.mochilas, i.cadeirinhas, i.valor, i.obs,
      p.codigo, p.nome AS cliente, p.telefone, p.idioma, p.status AS pedido_status,
      m.nome AS motorista_nome, v.placa, v.modelo AS veiculo_modelo, pa.empresa AS parceiro_nome, pa.responsavel AS parceiro_resp
    FROM servicos s JOIN itens i ON i.id = s.item_id JOIN pedidos p ON p.id = s.pedido_id
    LEFT JOIN motoristas m ON m.id = s.motorista_id LEFT JOIN veiculos v ON v.id = s.veiculo_id LEFT JOIN parceiros pa ON pa.id = s.parceiro_id
    WHERE s.inicio_utc >= ? AND s.inicio_utc <= ? ORDER BY s.inicio_utc LIMIT 1000`).bind(new Date(ini).toISOString(), new Date(fim).toISOString()).all();
  const lista = pode(papel, "valores.ver") ? results : results.map(({ custo_previsto, valor, ...x }) => x);
  return json({ ok: true, de, ate: new Date(fim - 3 * 3600e3).toISOString().slice(0, 10), lista });
}

export async function ops(req, env, url, user, h = {}) {
  const papel = await papelDe(env, user && user.email);
  if (!papel) return erro("sem_permissao", 403);
  const partes = url.pathname.replace(/^\/api\/admin\/ops\/?/, "").split("/").filter(Boolean);
  // escrita só a partir do próprio painel (mesma origem)
  const orig = req.headers.get("origin");
  if (req.method !== "GET" && orig && orig !== url.origin) return erro("origem", 403);

  // quem sou eu e o que posso fazer (as telas usam isto para montar o menu; o servidor confere de novo em cada rota)
  if (partes[0] === "eu" && req.method === "GET") {
    return json({ ok: true, email: user.email, papel, permissoes: permissoes(papel) });
  }

  // reserva manual (venda fechada no WhatsApp, telefone, indicação...)
  if (partes[0] === "pedidos" && partes.length === 1 && req.method === "POST") {
    if (!pode(papel, "reservas.editar")) return erro("sem_permissao", 403);
    return criarReservaManual(req, env, user, h);
  }

  try {
    if (partes[0] === "motoristas" || partes[0] === "veiculos") return await cadastro(req, env, user, papel, partes[0], partes);
    if (partes[0] === "servicos" && partes.length === 1 && req.method === "GET") {
      if (!pode(papel, "ops.ver")) return erro("sem_permissao", 403);
      return await listarServicos(env, url, papel);
    }
    if (partes[0] === "parceiros-atende" && req.method === "GET") {
      const { results } = await env.DB.prepare("SELECT id, codigo, empresa, responsavel, categoria FROM parceiros WHERE tipo = 'atende' AND status = 'aprovado' ORDER BY responsavel").all();
      return json({ ok: true, lista: results });
    }
  } catch (e) {
    if (semTabela(e)) return erro("migracao_pendente", 503);
    throw e;
  }

  return erro("rota", 404);
}
