/* Portal do cliente "Minha viagem" — /viagem/?p=IET-XXXXXX#t=TOKEN
   O link usa o mesmo token secreto do pedido (o que o site já gera na reserva). Sem senha, sem cadastro.
   Mostra o roteiro, o motorista na véspera, pagamentos e dicas. Não altera nada da venda. */
import { servico } from "./cotacao.js";
import { CATEGORIAS } from "./precos.js";

const json = (obj, status = 200) => new Response(JSON.stringify(obj), {
  status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex" },
});
const erro = (codigo, status = 400) => json({ ok: false, erro: codigo }, status);
const L = (o, lang) => (o && (o[lang] || o.pt)) || "";

const DICAS = {
  argentina: { pt: "Para a Argentina, leve RG emitido há menos de 10 anos ou passaporte (o de cada pessoa, inclusive crianças).", en: "For Argentina, bring your passport (each traveler, children included).", es: "Para Argentina, lleve su documento de identidad o pasaporte (cada persona, también los niños)." },
  paraguai: { pt: "No Paraguai, leve RG ou passaporte. Na volta pela Ponte da Amizade, a cota de compras é de US$ 500 por pessoa.", en: "For Paraguay, bring your passport. Coming back to Brazil by the Friendship Bridge, the shopping allowance is US$ 500 per person.", es: "Para Paraguay, lleve documento o pasaporte. Al volver a Brasil por el Puente de la Amistad, la cuota de compras es de US$ 500 por persona." },
  aduana: { pt: "Em dezembro e janeiro a fronteira pode ter fila: o motorista já sai com folga.", en: "In December and January the border can be busy: your driver leaves with extra time.", es: "En diciembre y enero la frontera puede tener fila: el chofer sale con tiempo extra." },
  cataratas: { pt: "Leve uma capa de chuva leve e calçado confortável: na passarela da Garganta do Diabo você vai se molhar.", en: "Bring a light raincoat and comfortable shoes: you will get wet on the Devil's Throat walkway.", es: "Lleve un piloto liviano y calzado cómodo: en la pasarela de la Garganta del Diablo se va a mojar." },
  chegada: { pt: "O motorista espera no desembarque com uma placa com o seu nome. A primeira hora de espera após o pouso é grátis.", en: "Your driver waits at arrivals with a sign with your name. The first hour of waiting after landing is free.", es: "El chofer lo espera en arribos con un cartel con su nombre. La primera hora de espera tras el aterrizaje es gratis." },
  ingressos: { pt: "Os ingressos dos atrativos não estão incluídos.", en: "Attraction tickets are not included.", es: "Las entradas a los atractivos no están incluidas." },
};

function dicasDo(svc, item) {
  const d = [], id = svc ? svc.id : "", nome = svc ? L(svc.nome, "pt").toLowerCase() : "";
  const ar = svc && svc.fronteira && !/cde|paraguai|compras-ciudad|assuncao|salto/.test(id + nome);
  const py = /cde|ciudad del este|paraguai|assun|salto/.test(id + " " + nome);
  if (svc && svc.voo && item.sentido === "chegada") d.push("chegada");
  if (ar) d.push("argentina");
  if (py) d.push("paraguai");
  if (svc && svc.fronteira) d.push("aduana");
  if (/cataratas|ar-iv|br-iv|br-espera|dois-lados|ar-completo|tres-paises/.test(id + " " + nome)) d.push("cataratas");
  if (svc && svc.tipo === "passeio") d.push("ingressos");
  return d;
}

// situação que o cliente entende (sem detalhes internos da escala)
function situacaoCliente(st, pedidoStatus) {
  if (pedidoStatus === "cancelada" || st === "cancelado") return "cancelado";
  if (st === "concluido") return "concluido";
  if (st === "no_show") return "nao_realizado";
  if (["embarcado", "na_aduana", "no_atrativo"].includes(st)) return "andamento";
  if (st === "no_local") return "chegou";
  if (st === "a_caminho") return "a_caminho";
  if (st === "confirmado") return "motorista_confirmado";
  if (["solicitacao", "pagamento_pendente"].includes(pedidoStatus)) return "aguardando";
  return "confirmado";
}

async function pedidoDoToken(env, codigo, token) {
  if (!/^IET-[A-Z0-9]{6}$/.test(codigo) || !/^[a-f0-9]{16,64}$/.test(token)) return null;
  const p = await env.DB.prepare("SELECT * FROM pedidos WHERE codigo = ?").bind(codigo).first();
  return p && p.token === token ? p : null;
}

export async function viagemApi(req, env, url, h = {}) {
  const partes = url.pathname.replace(/^\/api\/viagem\/?/, "").split("/").filter(Boolean);
  const codigo = String(partes[0] || "").toUpperCase(), token = String(req.headers.get("x-token") || "");
  const p = await pedidoDoToken(env, codigo, token);
  if (!p) return erro("nao_encontrado", 404);
  const agora = Date.now(), lang = ["pt", "en", "es"].includes(url.searchParams.get("lang")) ? url.searchParams.get("lang") : (p.idioma || "pt");

  if (partes.length === 1 && req.method === "GET") {
    let servs = [];
    try {
      servs = (await env.DB.prepare(`SELECT s.item_id, s.status, s.inicio_utc, s.fim_previsto_utc, m.nome AS motorista, v.modelo, v.marca, v.cor, v.placa
        FROM servicos s LEFT JOIN motoristas m ON m.id = s.motorista_id LEFT JOIN veiculos v ON v.id = s.veiculo_id WHERE s.pedido_id = ?`).bind(p.id).all()).results;
    } catch (e) { /* plataforma ainda sem tabelas: mostra só o pedido */ }
    const porItem = Object.fromEntries(servs.map((s) => [s.item_id, s]));
    const { results: itens } = await env.DB.prepare("SELECT * FROM itens WHERE pedido_id = ? ORDER BY inicio_utc, ordem").bind(p.id).all();
    const { results: pgs } = await env.DB.prepare("SELECT valor, valor_pago, status, pago_em, metodo, recibo_url, provedor FROM pagamentos WHERE pedido_id = ? AND status = 'pago' ORDER BY pago_em").bind(p.id).all();
    const pago = Math.round(pgs.reduce((a, g) => a + (Number(g.valor_pago) || Number(g.valor) || 0), 0) * 100) / 100;
    const lista = itens.map((it) => {
      const svc = servico(it.servico_id), s = porItem[it.id], falta = Date.parse(it.inicio_utc) - agora;
      const mostrarMotorista = s && s.motorista && falta < 36 * 3600e3 && !["concluido", "cancelado", "no_show"].includes(s.status);
      const cat = CATEGORIAS[it.categoria];
      return {
        data: it.data, hora: it.hora, inicio_utc: it.inicio_utc, servico: svc ? L(svc.nome, lang) : it.servico_nome, descricao: svc ? L(svc.desc, lang) : "",
        sentido: svc && svc.sentido ? it.sentido : null, fixo: svc && svc.fixo ? L(svc.fixo, lang) : null, origem: it.origem, destino: it.destino, voo: it.voo,
        pax: it.pax, malas: it.malas, mochilas: it.mochilas, malas_bordo: it.malas_bordo, cadeirinhas: it.cadeirinhas,
        categoria: cat ? L(cat.nome, lang) : it.categoria, beneficios: cat && cat.benef ? cat.benef.map((b) => L(b, lang)) : [],
        situacao: situacaoCliente(s ? s.status : "", p.status), dicas: dicasDo(svc, it).map((k) => L(DICAS[k], lang)),
        motorista: mostrarMotorista ? { nome: String(s.motorista).split(" ")[0], carro: [s.marca, s.modelo, s.cor].filter(Boolean).join(" "), placa: s.placa } : null,
        motoristaEmBreve: !!(s && !mostrarMotorista && falta > 0 && !["cancelado"].includes(s.status)),
      };
    });
    const saldo = Math.max(0, Math.round((Number(p.total) - pago) * 100) / 100);
    return json({
      ok: true, lang, pedido: { codigo: p.codigo, nome: p.nome, status: p.status, total: p.total, pago, saldo, modo: p.modo_pagamento, idioma: p.idioma || "pt" },
      itens: lista, pagamentos: pgs.map((g) => ({ valor: Number(g.valor_pago) || Number(g.valor), pago_em: g.pago_em, metodo: g.metodo, recibo: g.recibo_url })),
      podePagar: saldo >= 1 && ["aprovado", "aguardando_confirmacao", "confirmada"].includes(p.status) && !!env.INFINITEPAY_HANDLE && lang === "pt",
    });
  }

  // cliente manda uma informação (voo, hotel, horário) — vira aviso para a central, não muda o pedido sozinho
  if (partes[1] === "info" && req.method === "POST") {
    let b; try { b = await req.json(); } catch { return erro("json_invalido"); }
    const texto = String(b.texto || "").replace(/\s+/g, " ").trim().slice(0, 500);
    if (texto.length < 3) return erro("texto");
    const n = await env.DB.prepare("SELECT COUNT(*) AS n FROM eventos WHERE pedido_id = ? AND tipo = 'cliente_info' AND em > ?").bind(p.id, new Date(agora - 864e5).toISOString()).first();
    if (n && n.n >= 10) return erro("muitas_tentativas", 429);
    await env.DB.prepare("INSERT INTO eventos (pedido_id, em, tipo, autor, texto) VALUES (?,?,?,?,?)").bind(p.id, new Date(agora).toISOString(), "cliente_info", "cliente", "Mensagem do cliente pelo Minha viagem: " + texto).run();
    if (h.enviarAviso) try { await h.enviarAviso(env, `Cliente enviou informação · ${p.codigo} · ${p.nome}`, `${p.nome} (${p.telefone}) escreveu pelo Minha viagem:\n\n${texto}\n\nAtualize o pedido no painel se precisar: ${url.origin}/admin/`); } catch (e) { console.error("aviso viagem", e && e.message); }
    return json({ ok: true });
  }

  // pagar o saldo pelo InfinitePay (Pix ou cartão brasileiro)
  if (partes[1] === "pagar" && req.method === "POST") {
    if (!h.gerarLinkPagamento || !env.INFINITEPAY_HANDLE) return erro("sem_pagamento");
    if (!["aprovado", "aguardando_confirmacao", "confirmada"].includes(p.status)) return erro("status");
    const pgs = (await env.DB.prepare("SELECT status, valor, valor_pago, criado_em FROM pagamentos WHERE pedido_id = ?").bind(p.id).all()).results;
    if (pgs.filter((g) => Date.parse(g.criado_em) > agora - 864e5).length >= 6) return erro("muitas_tentativas", 429);
    const pago = pgs.filter((g) => g.status === "pago").reduce((a, g) => a + (Number(g.valor_pago) || Number(g.valor) || 0), 0);
    const saldo = Math.round((Number(p.total) - pago) * 100) / 100;
    if (saldo < 1) return erro("ja_pago");
    let r; try { r = await h.gerarLinkPagamento(env, p, "Valor restante", saldo, url.origin, "cliente", "infinitepay", "pt"); } catch (e) { console.error("viagem pagar", e && e.message); r = {}; }
    if (!r || !r.url) return erro("pagamento_falhou", 502);
    return json({ ok: true, url: r.url });
  }
  return erro("rota", 404);
}

/* link do Minha viagem para o painel enviar ao cliente */
export async function linkViagem(env, codigo, origem) {
  const p = await env.DB.prepare("SELECT codigo, token, nome, telefone, idioma FROM pedidos WHERE codigo = ?").bind(codigo).first();
  if (!p) return null;
  return { link: `${origem}/viagem/?p=${p.codigo}#t=${p.token}`, nome: p.nome, telefone: p.telefone, idioma: p.idioma || "pt" };
}
