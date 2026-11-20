/* Plataforma de gestão — API interna /api/admin/ops/*.
   Nada aqui é usado pelo site ou pela venda. Toda rota exige login do Access E permissão do papel. */
import { papelDe, permissoes, pode } from "./acesso.js";
import { CONFIG, CATEGORIAS } from "./precos.js";
import { servico } from "./cotacao.js";
import { linkViagem } from "./viagem.js";
import { duracaoPadrao, fimPrevisto, statusInicial, PEDIDO_GERA_SERVICO, STATUS_FINAIS, STATUS_SERVICO, validarMotorista, validarVeiculo, checarAtribuicao, sugerir, alertas, fluxoServico, etapaPermitida, mostrarContato } from "./ops-regras.js";

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
  // corridas oferecidas pelo painel antigo a motoristas parceiros: o serviço acompanha a resposta
  const aceita = "FROM corridas c WHERE c.item_id = servicos.item_id AND c.status = 'aceita' ORDER BY c.id DESC LIMIT 1";
  stmts.push(env.DB.prepare(`UPDATE servicos SET parceiro_id = (SELECT c.parceiro_id ${aceita}), custo_previsto = COALESCE(custo_previsto, (SELECT c.repasse ${aceita})),
      status = 'atribuido', atualizado_em = ? WHERE status IN ('a_atribuir', 'oferecido') AND motorista_id IS NULL AND EXISTS (SELECT 1 ${aceita})`).bind(now));
  stmts.push(env.DB.prepare(`UPDATE servicos SET status = 'oferecido', atualizado_em = ? WHERE status = 'a_atribuir'
      AND EXISTS (SELECT 1 FROM corridas c WHERE c.item_id = servicos.item_id AND c.status = 'ofertada')`).bind(now));
  stmts.push(env.DB.prepare(`UPDATE servicos SET status = 'a_atribuir', atualizado_em = ? WHERE status = 'oferecido' AND motorista_id IS NULL AND parceiro_id IS NULL
      AND NOT EXISTS (SELECT 1 FROM corridas c WHERE c.item_id = servicos.item_id AND c.status IN ('ofertada', 'aceita'))`).bind(now));
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

const SQL_SERVICOS = `SELECT s.id, s.status, s.inicio_utc, s.fim_previsto_utc, s.motorista_id, s.veiculo_id, s.parceiro_id, s.custo_previsto, s.importado, s.obs_operacao,
      i.servico_id, i.servico_nome, i.categoria, i.data, i.hora, i.sentido, i.voo, i.origem, i.destino, i.pax, i.malas, i.malas_bordo, i.mochilas, i.cadeirinhas, i.valor, i.obs,
      p.codigo, p.nome AS cliente, p.telefone, p.idioma, p.status AS pedido_status,
      m.nome AS motorista_nome, v.placa, v.modelo AS veiculo_modelo, COALESCE(pa.empresa, pa.responsavel) AS parceiro_nome
    FROM servicos s JOIN itens i ON i.id = s.item_id JOIN pedidos p ON p.id = s.pedido_id
    LEFT JOIN motoristas m ON m.id = s.motorista_id LEFT JOIN veiculos v ON v.id = s.veiculo_id LEFT JOIN parceiros pa ON pa.id = s.parceiro_id`;
async function buscarServicos(env, iniIso, fimIso) {
  return (await env.DB.prepare(SQL_SERVICOS + " WHERE s.inicio_utc >= ? AND s.inicio_utc <= ? ORDER BY s.inicio_utc LIMIT 1500").bind(iniIso, fimIso).all()).results;
}
async function umServico(env, id) {
  return env.DB.prepare(SQL_SERVICOS + " WHERE s.id = ?").bind(id).first();
}
const semValores = (papel, lista) => pode(papel, "valores.ver") ? lista : lista.map(({ custo_previsto, valor, ...x }) => x);
const diaFoz = (ms) => new Date(ms - 3 * 3600e3).toISOString().slice(0, 10);
const inicioDia = (d) => Date.parse(d + "T00:00:00-03:00");

async function listarServicos(env, url, papel) {
  const de = /^\d{4}-\d{2}-\d{2}$/.test(url.searchParams.get("de") || "") ? url.searchParams.get("de") : diaFoz(Date.now());
  const ate = /^\d{4}-\d{2}-\d{2}$/.test(url.searchParams.get("ate") || "") ? url.searchParams.get("ate") : null;
  const ini = inicioDia(de);
  let fim = ate ? Date.parse(ate + "T23:59:59-03:00") : ini + 14 * 864e5;
  if (!(fim > ini)) return erro("periodo");
  if (fim - ini > 92 * 864e5) fim = ini + 92 * 864e5;
  await sincronizarServicos(env);
  const lista = await buscarServicos(env, new Date(ini).toISOString(), new Date(fim).toISOString());
  return json({ ok: true, de, ate: diaFoz(fim), lista: semValores(papel, lista) });
}

/* ---------------- pacote 2: tela Hoje, sugestões, atribuição e status ---------------- */
let eventosOk = false;
async function garantirEventos(env) {
  if (eventosOk) return;
  const cols = (await env.DB.prepare("PRAGMA table_info(eventos)").all()).results.map((c) => c.name);
  if (!cols.includes("servico_id")) await env.DB.prepare("ALTER TABLE eventos ADD COLUMN servico_id INTEGER").run();
  eventosOk = true;
}
async function registrar(env, s, autor, tipo, texto, de = null, para = null) {
  await garantirEventos(env);
  await env.DB.prepare("INSERT INTO eventos (pedido_id, em, tipo, status_de, status_para, autor, texto, servico_id) SELECT pedido_id, ?, ?, ?, ?, ?, ?, id FROM servicos WHERE id = ?")
    .bind(new Date().toISOString(), tipo, de, para, autor, texto, s.id).run();
}

async function telaHoje(env, papel) {
  await sincronizarServicos(env);
  const agora = Date.now(), hoje = diaFoz(agora), ini = inicioDia(hoje);
  const servs = await buscarServicos(env, new Date(ini - 864e5).toISOString(), new Date(ini + 8 * 864e5).toISOString());
  const { results: saldos } = await env.DB.prepare(`SELECT p.codigo, p.nome, p.total, p.modo_pagamento,
      p.total - COALESCE((SELECT SUM(COALESCE(valor_pago, valor)) FROM pagamentos g WHERE g.pedido_id = p.id AND g.status = 'pago'), 0) AS saldo,
      (SELECT MIN(inicio_utc) FROM itens i WHERE i.pedido_id = p.id AND i.inicio_utc >= ?) AS primeiro
    FROM pedidos p WHERE p.status IN ('aprovado','aguardando_confirmacao','confirmada')
      AND EXISTS (SELECT 1 FROM itens i WHERE i.pedido_id = p.id AND i.inicio_utc >= ? AND i.inicio_utc <= ?)`)
    .bind(new Date(agora - 3600e3).toISOString(), new Date(agora - 3600e3).toISOString(), new Date(agora + 2 * 864e5).toISOString()).all();
  const motoristas = (await env.DB.prepare("SELECT id, nome, status, cnh_validade FROM motoristas").all()).results;
  const veiculos = (await env.DB.prepare("SELECT id, placa, modelo, status, licenciamento_validade, seguro_validade FROM veiculos").all()).results;
  const al = alertas({ servicos: servs, pedidosSaldo: saldos.filter((x) => x.saldo > 0.009 && x.primeiro), motoristas, veiculos }, agora);
  const amanha = diaFoz(ini + 864e5 + 3600e3);
  const deAmanha = servs.filter((x) => diaFoz(Date.parse(x.inicio_utc)) === amanha && x.status !== "cancelado");
  const res = { ok: true, agora: new Date(agora).toISOString(), hoje, alertas: al,
    hojeLista: semValores(papel, servs.filter((x) => diaFoz(Date.parse(x.inicio_utc)) === hoje)),
    amanha: { dia: amanha, total: deAmanha.length, semExecutor: deAmanha.filter((x) => x.status === "a_atribuir" || x.status === "oferecido").length,
      primeiro: deAmanha.length ? deAmanha[0].hora : null, fronteira: deAmanha.filter((x) => { const v = servico(x.servico_id); return v && v.fronteira; }).length } };
  if (pode(papel, "valores.ver")) {
    const mes = hoje.slice(0, 7), iniMes = new Date(inicioDia(mes + "-01")).toISOString();
    const vend = await env.DB.prepare(`SELECT COALESCE(SUM(total),0) AS v, COALESCE(SUM(taxa_pagamento),0) AS t, COUNT(*) AS n FROM pedidos
      WHERE criado_em >= ? AND status IN ('aprovado','aguardando_confirmacao','confirmada','concluida')`).bind(iniMes).first();
    const rec = await env.DB.prepare("SELECT COALESCE(SUM(COALESCE(valor_pago, valor)),0) AS v FROM pagamentos WHERE status = 'pago' AND pago_em >= ?").bind(iniMes).first();
    const custo = await env.DB.prepare("SELECT COALESCE(SUM(custo_previsto),0) AS v, COUNT(*) AS n FROM servicos WHERE inicio_utc >= ? AND status <> 'cancelado' AND custo_previsto IS NOT NULL").bind(iniMes).first();
    const aRec = await env.DB.prepare(`SELECT COALESCE(SUM(p.total - COALESCE((SELECT SUM(COALESCE(valor_pago, valor)) FROM pagamentos g WHERE g.pedido_id = p.id AND g.status = 'pago'), 0)), 0) AS v
      FROM pedidos p WHERE p.status IN ('aprovado','aguardando_confirmacao','confirmada') AND EXISTS (SELECT 1 FROM itens i WHERE i.pedido_id = p.id AND i.inicio_utc >= ?)`).bind(new Date(agora).toISOString()).first();
    res.numeros = { mes, vendido: vend.v, pedidos: vend.n, recebido: rec.v, aReceber: aRec.v, custoTerceiros: custo.v, servicosTerceiros: custo.n, margem: Math.round((vend.v - custo.v - vend.t) * 100) / 100 };
  }
  return json(res);
}

async function contextoAtribuir(env, s) {
  const ini = new Date(Date.parse(s.inicio_utc) - 2 * 864e5).toISOString(), fim = new Date(Date.parse(s.fim_previsto_utc) + 2 * 864e5).toISOString();
  const outros = (await buscarServicos(env, ini, fim)).filter((o) => !STATUS_FINAIS.includes(o.status));
  const indisp = (await env.DB.prepare("SELECT * FROM indisponibilidades WHERE fim >= ? AND inicio <= ?").bind(ini, fim).all()).results;
  return { servico: s, outros, indisp };
}

async function sugestoes(env, id) {
  const s = await umServico(env, id);
  if (!s) return erro("nao_encontrado", 404);
  const ctx = await contextoAtribuir(env, s);
  const motoristas = (await env.DB.prepare("SELECT * FROM motoristas WHERE status <> 'inativo'").all()).results;
  const veiculos = (await env.DB.prepare("SELECT * FROM veiculos WHERE status <> 'inativo'").all()).results;
  const parceiros = (await env.DB.prepare("SELECT id, COALESCE(empresa, responsavel) AS nome, categoria FROM parceiros WHERE tipo = 'atende' AND status = 'aprovado' ORDER BY nome").all()).results;
  return json({ ok: true, servico: s, sugestoes: sugerir({ ...ctx, motoristas, veiculos }), veiculos: veiculos.map(({ id, placa, modelo, categoria, lugares, malas, motorista_padrao_id }) => ({ id, placa, modelo, categoria, lugares, malas, motorista_padrao_id })), parceiros });
}

async function atribuir(req, env, user, papel, id) {
  let b; try { b = await req.json(); } catch { return erro("json_invalido"); }
  const s = await umServico(env, id);
  if (!s) return erro("nao_encontrado", 404);
  if (STATUS_FINAIS.includes(s.status)) return erro("servico_encerrado", 409);
  const motoristaId = Number(b.motorista_id) > 0 ? Number(b.motorista_id) : null;
  const veiculoId = Number(b.veiculo_id) > 0 ? Number(b.veiculo_id) : null;
  const parceiroId = Number(b.parceiro_id) > 0 ? Number(b.parceiro_id) : null;
  const motivo = txt(b.motivo, 200);
  const m = motoristaId ? await env.DB.prepare("SELECT * FROM motoristas WHERE id = ?").bind(motoristaId).first() : null;
  const v = veiculoId ? await env.DB.prepare("SELECT * FROM veiculos WHERE id = ?").bind(veiculoId).first() : null;
  if (motoristaId && !m) return erro("motorista_invalido");
  if (veiculoId && !v) return erro("veiculo_invalido");
  if (parceiroId && !(await env.DB.prepare("SELECT 1 FROM parceiros WHERE id = ? AND tipo = 'atende'").bind(parceiroId).first())) return erro("parceiro_invalido");
  const problemas = checarAtribuicao({ ...(await contextoAtribuir(env, s)), motorista: m, veiculo: v });
  if (problemas.some((p) => p.bloqueia) && !b.forcar) return erro("conflito", 409, { problemas });
  if (b.forcar && motivo.length < 3) return erro("motivo", 400, { problemas });
  let custo = s.custo_previsto;
  if (pode(papel, "valores.ver") && b.custo !== undefined) { custo = dinheiro(b.custo); if (b.custo === "" || b.custo === null) custo = null; else if (!(custo >= 0)) return erro("custo"); }
  const vazio = !motoristaId && !veiculoId && !parceiroId;
  const status = vazio ? "a_atribuir" : ["a_atribuir", "oferecido"].includes(s.status) ? "atribuido" : s.status;
  await env.DB.prepare("UPDATE servicos SET motorista_id = ?, veiculo_id = ?, parceiro_id = ?, custo_previsto = ?, status = ?, atualizado_em = ? WHERE id = ?")
    .bind(motoristaId, veiculoId, parceiroId, custo, status, new Date().toISOString(), id).run();
  const quem = [m && m.nome, v && v.placa, parceiroId && "parceiro #" + parceiroId].filter(Boolean).join(" · ");
  await registrar(env, s, user.email, "atribuicao", vazio ? `Serviço ${s.servico_nome} (${s.data} ${s.hora}) ficou sem executor.` :
    `Serviço ${s.servico_nome} (${s.data} ${s.hora}) atribuído: ${quem}.` + (b.forcar ? ` Atribuído mesmo com aviso: ${problemas.map((p) => p.texto).join(" ")} Motivo: ${motivo}` : ""), s.status, status);
  return json({ ok: true, status, avisos: problemas });
}

const ETAPA_COLUNA = { confirmado: "confirmado_em", a_caminho: "a_caminho_em", no_local: "no_local_em", embarcado: "embarque_em", concluido: "concluido_em" };
async function mudarStatus(req, env, user, id) {
  let b; try { b = await req.json(); } catch { return erro("json_invalido"); }
  const s = await umServico(env, id);
  if (!s) return erro("nao_encontrado", 404);
  const novo = String(b.status || "");
  if (!STATUS_SERVICO.includes(novo) || novo === "a_atribuir" || novo === "atribuido") return erro("status");
  const motivo = txt(b.motivo, 200);
  if ((novo === "cancelado" || novo === "no_show") && motivo.length < 3) return erro("motivo");
  if (["confirmado", "a_caminho", "no_local", "embarcado", "no_atrativo", "na_aduana", "concluido"].includes(novo) && !s.motorista_id && !s.parceiro_id) return erro("sem_executor");
  const now = new Date().toISOString(), col = ETAPA_COLUNA[novo];
  await env.DB.prepare(`UPDATE servicos SET status = ?, atualizado_em = ?${col ? ", " + col + " = COALESCE(" + col + ", ?)" : ""} WHERE id = ?`)
    .bind(...[novo, now].concat(col ? [now] : []), id).run();
  await registrar(env, s, user.email, "status_servico", `Serviço ${s.servico_nome} (${s.data} ${s.hora}): ${s.status} → ${novo}${motivo ? ". " + motivo : ""}`, s.status, novo);
  return json({ ok: true, status: novo });
}

/* ---------------- pacote 3: portal do motorista próprio (/motorista/hoje.html) ----------------
   Acesso por link pessoal com chave (no banco fica só o hash). O motorista vê só os serviços dele,
   nunca valores do pedido, e o contato do cliente só perto do horário. */
async function sha256hex(t) { return [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(t)))].map((b) => b.toString(16).padStart(2, "0")).join(""); }

async function gerarAcesso(env, user, id, origem) {
  const m = await env.DB.prepare("SELECT id, nome, telefone FROM motoristas WHERE id = ?").bind(id).first();
  if (!m) return erro("nao_encontrado", 404);
  const chave = tokenHex(), now = new Date().toISOString();
  await env.DB.prepare("UPDATE motoristas SET chave_hash = ?, chave_em = ?, atualizado_em = ? WHERE id = ?").bind(await sha256hex("motorista:" + chave), now, now, id).run();
  return json({ ok: true, link: origem + "/motorista/hoje.html#k=" + chave, nome: m.nome, telefone: m.telefone });
}
async function revogarAcesso(env, id) {
  const r = await env.DB.prepare("UPDATE motoristas SET chave_hash = NULL, chave_em = NULL, atualizado_em = ? WHERE id = ?").bind(new Date().toISOString(), id).run();
  return r.meta.changes ? json({ ok: true }) : erro("nao_encontrado", 404);
}

function paraMotorista(s, agora) {
  const svc = servico(s.servico_id), contato = mostrarContato(s, agora);
  return {
    id: s.id, status: s.status, data: s.data, hora: s.hora, inicio_utc: s.inicio_utc, fim_previsto_utc: s.fim_previsto_utc,
    servico: s.servico_nome, sentido: s.sentido, voo: s.voo, origem: s.origem, destino: s.destino, pax: s.pax, malas: s.malas, malas_bordo: s.malas_bordo,
    mochilas: s.mochilas, cadeirinhas: s.cadeirinhas, obs: s.obs, idioma: s.idioma || "pt", codigo: s.codigo, placa: s.placa, veiculo: s.veiculo_modelo,
    cliente: contato ? s.cliente : String(s.cliente || "").split(" ")[0], telefone: contato ? s.telefone : null, contatoLiberado: contato,
    fronteira: !!(svc && svc.fronteira), fluxo: fluxoServico(svc, s), recebido_valor: s.recebido_valor, recebido_forma: s.recebido_forma,
  };
}

export async function portalMotorista(req, env, url, h = {}) {
  const chave = String(req.headers.get("x-motorista") || "");
  if (!/^[a-f0-9]{32}$/.test(chave)) return erro("nao_autorizado", 401);
  let m;
  try { m = await env.DB.prepare("SELECT id, nome, status, idiomas FROM motoristas WHERE chave_hash = ?").bind(await sha256hex("motorista:" + chave)).first(); }
  catch (e) { if (semTabela(e)) return erro("indisponivel", 503); throw e; }
  if (!m || m.status === "inativo") return erro("nao_autorizado", 401);
  const partes = url.pathname.replace(/^\/api\/condutor\/?/, "").split("/").filter(Boolean), agora = Date.now();
  if (req.method !== "GET") { const orig = req.headers.get("origin"); if (orig && orig !== url.origin) return erro("origem", 403); }

  if (partes[0] === "servicos" && partes.length === 1 && req.method === "GET") {
    await sincronizarServicos(env);
    const { results } = await env.DB.prepare(SQL_SERVICOS.replace("s.obs_operacao,", "s.obs_operacao, s.recebido_valor, s.recebido_forma,") +
      " WHERE s.motorista_id = ? AND s.inicio_utc >= ? AND s.inicio_utc <= ? AND s.status <> 'cancelado' ORDER BY s.inicio_utc LIMIT 300")
      .bind(m.id, new Date(agora - 7 * 864e5).toISOString(), new Date(agora + 21 * 864e5).toISOString()).all();
    return json({ ok: true, motorista: { nome: m.nome }, agora: new Date(agora).toISOString(), servicos: results.map((s) => paraMotorista(s, agora)) });
  }

  if (partes[0] === "servicos" && /^\d+$/.test(partes[1] || "") && partes[2] === "etapa" && req.method === "POST") {
    let b; try { b = await req.json(); } catch { return erro("json_invalido"); }
    const s = await env.DB.prepare(SQL_SERVICOS.replace("s.obs_operacao,", "s.obs_operacao, s.recebido_valor, s.recebido_forma,") + " WHERE s.id = ? AND s.motorista_id = ?").bind(+partes[1], m.id).first();
    if (!s) return erro("nao_encontrado", 404);
    if (STATUS_FINAIS.includes(s.status)) return erro("servico_encerrado", 409);
    const now = new Date(agora).toISOString(), nota = txt(b.texto, 300);
    // avisos que não mudam a etapa: atraso e ocorrência
    if (b.tipo === "atraso" || b.tipo === "ocorrencia") {
      if (nota.length < 2) return erro("texto");
      const rot = b.tipo === "atraso" ? "Atraso" : "Ocorrência";
      await registrar(env, s, "motorista " + m.nome, b.tipo, `${rot} informado por ${m.nome} em ${s.servico_nome} (${s.data} ${s.hora}): ${nota}`);
      if (h.enviarAviso) try { await h.enviarAviso(env, `${rot} · ${s.codigo} · ${m.nome}`, `${m.nome} informou ${rot.toLowerCase()} no serviço ${s.servico_nome}, ${s.data} às ${s.hora}, cliente ${s.cliente}.\n\n${nota}\n\nPainel: ${url.origin}/admin/hoje.html`); } catch (e) { console.error("aviso motorista", e && e.message); }
      return json({ ok: true });
    }
    if (b.tipo === "no_show") {
      if (Date.parse(s.inicio_utc) > agora) return erro("cedo");
      await env.DB.prepare("UPDATE servicos SET status = 'no_show', atualizado_em = ? WHERE id = ?").bind(now, s.id).run();
      await registrar(env, s, "motorista " + m.nome, "status_servico", `${m.nome} marcou que o cliente não apareceu em ${s.servico_nome} (${s.data} ${s.hora}).${nota ? " " + nota : ""}`, s.status, "no_show");
      if (h.enviarAviso) try { await h.enviarAviso(env, `Cliente não apareceu · ${s.codigo}`, `${m.nome} marcou "não apareceu" em ${s.servico_nome}, ${s.data} às ${s.hora}, cliente ${s.cliente}.${nota ? "\n\n" + nota : ""}\n\nPainel: ${url.origin}/admin/hoje.html`); } catch (e) { console.error("aviso motorista", e && e.message); }
      return json({ ok: true, status: "no_show" });
    }
    const fluxo = fluxoServico(servico(s.servico_id), s), nova = String(b.etapa || "");
    if (!etapaPermitida(fluxo, s.status, nova)) return erro("etapa", 409, { atual: s.status });
    let recebido = null, forma = null;
    if (nova === "concluido" && b.recebido) {
      recebido = dinheiro(b.recebido.valor); forma = ["dinheiro", "pix", "cartao", "nada"].includes(b.recebido.forma) ? b.recebido.forma : "nada";
      if (!(recebido >= 0) || recebido > 100000) return erro("valor");
      if (forma === "nada") recebido = 0;
    }
    const col = ETAPA_COLUNA[nova];
    await env.DB.prepare(`UPDATE servicos SET status = ?, atualizado_em = ?${col ? ", " + col + " = COALESCE(" + col + ", ?)" : ""}${nova === "concluido" ? ", recebido_valor = ?, recebido_forma = ?" : ""} WHERE id = ?`)
      .bind(...[nova, now].concat(col ? [now] : [], nova === "concluido" ? [recebido, forma] : [], [s.id])).run();
    const rot = (fluxo.find((e) => e[0] === nova) || [])[2] || nova;
    await registrar(env, s, "motorista " + m.nome, "status_servico", `${m.nome}: ${rot} · ${s.servico_nome} (${s.data} ${s.hora})` + (recebido ? `. Recebeu R$ ${recebido.toFixed(2).replace(".", ",")} (${forma}).` : ""), s.status, nova);
    if (recebido > 0 && h.enviarAviso) try { await h.enviarAviso(env, `Recebido no dia R$ ${recebido.toFixed(2).replace(".", ",")} · ${s.codigo}`, `${m.nome} concluiu ${s.servico_nome} (${s.data} ${s.hora}) e recebeu R$ ${recebido.toFixed(2).replace(".", ",")} em ${forma} do cliente ${s.cliente}.`); } catch (e) { console.error("aviso motorista", e && e.message); }
    return json({ ok: true, status: nova });
  }
  return erro("rota", 404);
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

  // link do "Minha viagem" para mandar ao cliente
  if (partes[0] === "pedidos" && /^IET-[A-Z0-9]{6}$/.test(partes[1] || "") && partes[2] === "link" && req.method === "GET") {
    if (!pode(papel, "ops.ver")) return erro("sem_permissao", 403);
    const l = await linkViagem(env, partes[1], url.origin);
    return l ? json({ ok: true, ...l }) : erro("nao_encontrado", 404);
  }

  // reserva manual (venda fechada no WhatsApp, telefone, indicação...)
  if (partes[0] === "pedidos" && partes.length === 1 && req.method === "POST") {
    if (!pode(papel, "reservas.editar")) return erro("sem_permissao", 403);
    return criarReservaManual(req, env, user, h);
  }

  try {
    if (partes[0] === "motoristas" && /^\d+$/.test(partes[1] || "") && partes[2] === "acesso") {
      if (!pode(papel, "cadastros.editar")) return erro("sem_permissao", 403);
      if (req.method === "POST") return await gerarAcesso(env, user, +partes[1], url.origin);
      if (req.method === "DELETE") return await revogarAcesso(env, +partes[1]);
    }
    if (partes[0] === "motoristas" || partes[0] === "veiculos") return await cadastro(req, env, user, papel, partes[0], partes);
    if (partes[0] === "servicos" && partes.length === 1 && req.method === "GET") {
      if (!pode(papel, "ops.ver")) return erro("sem_permissao", 403);
      return await listarServicos(env, url, papel);
    }
    if (partes[0] === "hoje" && req.method === "GET") {
      if (!pode(papel, "ops.ver")) return erro("sem_permissao", 403);
      return await telaHoje(env, papel);
    }
    if (partes[0] === "servicos" && partes.length === 3) {
      const id = parseInt(partes[1], 10);
      if (!(id > 0)) return erro("rota", 404);
      if (partes[2] === "sugestoes" && req.method === "GET") { if (!pode(papel, "ops.ver")) return erro("sem_permissao", 403); return await sugestoes(env, id); }
      if (partes[2] === "atribuir" && req.method === "POST") { if (!pode(papel, "ops.editar")) return erro("sem_permissao", 403); return await atribuir(req, env, user, papel, id); }
      if (partes[2] === "status" && req.method === "POST") { if (!pode(papel, "ops.editar")) return erro("sem_permissao", 403); return await mudarStatus(req, env, user, id); }
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
