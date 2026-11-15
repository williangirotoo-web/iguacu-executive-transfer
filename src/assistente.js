/* Assistente de reservas (IA da Cloudflare, Workers AI).
   A IA só conversa e coleta os dados. O PREÇO é sempre calculado pelo motor do site (cotacao.js),
   nunca pela IA. Se faltar algo ou o caso for especial, ela encaminha para o WhatsApp. */
import { CONFIG, CATEGORIAS, SERVICOS } from "./precos.js";
import { normalizarItem, cotarTodas, servico } from "./cotacao.js";

const MODELO = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";
const LINGUAS = { pt: "português do Brasil", en: "English", es: "español" };

function hojeFoz() {
  const d = new Date(Date.now() - 3 * 3600e3);
  const dias = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
  return { iso: d.toISOString().slice(0, 10), hora: d.toISOString().slice(11, 16), dia: dias[d.getUTCDay()] };
}

function catalogoTexto() {
  const linhas = SERVICOS.filter((s) => !s.oculto && s.tipo !== "km").map((s) =>
    `- ${s.id}: ${s.nome.pt}${s.sentido ? " (pedir se é chegada ou saída do aeroporto)" : ""}${s.tipo === "hora" ? " (pedir quantas horas, mínimo 5)" : ""}${s.tipo === "diaria" ? " (pedir quantos dias)" : ""}`);
  const cats = Object.entries(CATEGORIAS).map(([k, c]) => `- ${k}: ${c.nome.pt}, até ${c.pax} passageiros; espaço padrão de ${c.malas} malas grandes e ${c.malasMao} de bordo`);
  return { servicos: linhas.join("\n"), categorias: cats.join("\n") };
}

function sistema(lang) {
  const h = hojeFoz(), c = catalogoTexto();
  return `Você é o assistente de reservas do site da Iguaçu Executive Transfer (transfer executivo e passeios em Foz do Iguaçu, com motorista, para Brasil, Argentina e Paraguai).
Responda SEMPRE em ${LINGUAS[lang]}, de forma curta, educada e profissional (no máximo 3 frases), sem emojis em excesso.
Hoje é ${h.dia}, ${h.iso}, ${h.hora} no horário de Foz do Iguaçu.

SEU TRABALHO: entender qual serviço o cliente quer e coletar, uma ou duas perguntas por vez:
1) serviço (escolha um id da lista abaixo), 2) data, 3) horário, 4) número de passageiros, 5) número de malas grandes e de malas de bordo/mão (as malas nunca impedem a reserva: se passar do espaço padrão, a equipe combina depois), 6) nome do hotel ou endereço do cliente (onde buscar ou onde deixar), 7) para aeroporto: se é chegada (aeroporto → hotel) ou saída (hotel → aeroporto); se o cliente quiser ida e volta do aeroporto, colete data e horário dos dois trechos.

REGRAS IMPORTANTES:
- NUNCA diga valores, preços, descontos ou números de dinheiro. O sistema do site calcula e mostra o preço sozinho logo abaixo da sua mensagem quando os dados estiverem completos. Quando estiverem completos, diga apenas algo como "Pronto, veja os valores abaixo".
- Não invente serviços, regras, horários, nomes de motoristas, carros ou promessas que não estejam aqui.
- Se o pedido não estiver na lista (outra cidade, evento, algo especial), ou o cliente pedir para falar com uma pessoa, marque humano=true e diga que a equipe responde pelo WhatsApp.
- Não fale de assuntos fora de transfer e turismo em Foz do Iguaçu. Não peça nome, telefone, e-mail ou documentos: isso é feito na reserva.
- Converta datas para AAAA-MM-DD (ex.: "sábado que vem", "dia 20") e horários para HH:MM (24 h). Se a data ficar ambígua, pergunte.

INFORMAÇÕES CORRETAS QUE VOCÊ PODE DAR:
- Preço é por carro (não por pessoa), fechado na hora da reserva, sem taxímetro.
- Reserva pelo site com antecedência mínima de ${CONFIG.antecedenciaHoras.comum} h no carro Comum e ${CONFIG.antecedenciaHoras.exec} h nos demais. Para prazo menor, WhatsApp.
- Cancelamento grátis até ${CONFIG.cancelamento.gratisAteHoras} h antes.
- No aeroporto, o motorista espera ${CONFIG.esperaAeroporto.gratisMin} minutos grátis após o pouso.
- Cadeirinha infantil disponível a partir do carro Executivo (não no Comum). Pet pequeno/médio aceito (no Comum, só consultando).
- Pagamento na própria reserva: Pix ou cartão em até ${CONFIG.parcelasMax}x; clientes do exterior podem pagar por PayPal.
- Todos os carros têm documentação para Argentina e Paraguai.

SERVIÇOS (use o id exato):
${c.servicos}

CATEGORIAS DE CARRO:
${c.categorias}

FORMATO: em TODA resposta, preencha os campos do JSON com TUDO o que o cliente já informou na conversa inteira (não só na última mensagem): servico (id), pax, malas, malasMao, local, trechos [{data AAAA-MM-DD, hora HH:MM, sentido chegada|saida}], horas, dias. Deixe vazio o que ainda não sabe.
Responda SOMENTE com JSON no formato pedido.`;
}

const ESQUEMA = {
  type: "object",
  properties: {
    resposta: { type: "string" },
    servico: { type: "string" },
    pax: { type: "integer" },
    malas: { type: "integer" },
    malasMao: { type: "integer" },
    local: { type: "string" },
    horas: { type: "integer" },
    dias: { type: "integer" },
    trechos: { type: "array", items: { type: "object", properties: { data: { type: "string" }, hora: { type: "string" }, sentido: { type: "string" } } } },
    humano: { type: "boolean" },
  },
  required: ["resposta"],
};

/* resposta falsa só para testes locais (AI_MOCK=1): nunca usada no site publicado */
function mock(msgs) {
  const t = msgs.map((m) => m.content).join(" ").toLowerCase();
  if (/falar com|humano|atendente/.test(t)) return { resposta: "Claro! Nossa equipe responde pelo WhatsApp.", humano: true };
  if (!/\d+ (pessoas|passageiros)/.test(t)) return { resposta: "Para quantas pessoas, com quantas malas, e qual a data e horário do voo?", servico: "igu-foz" };
  return { resposta: "Pronto, veja os valores abaixo.", servico: "igu-foz", pax: 3, malas: 2, local: "Hotel Mabu Thermas", trechos: [{ data: new Date(Date.now() + 5 * 864e5).toISOString().slice(0, 10), hora: "14:30", sentido: "chegada" }] };
}

function lerSaida(r) {
  let x = r && r.response !== undefined ? r.response : r;
  if (typeof x === "string") {
    const i = x.indexOf("{"), j = x.lastIndexOf("}");
    try { x = JSON.parse(i >= 0 && j > i ? x.slice(i, j + 1) : x); } catch { x = { resposta: x }; }
  }
  return x && typeof x === "object" ? x : { resposta: "" };
}

/* Normaliza o que a IA devolveu (ela às vezes troca formatos) */
const semAcento = (t) => String(t || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
function acharServico(v) {
  if (!v) return null;
  const x = servico(String(v).trim()) || servico(String(v).trim().toLowerCase());
  if (x) return x;
  const q = semAcento(v);
  return SERVICOS.find((s) => !s.oculto && s.tipo !== "km" && (semAcento(s.nome.pt).includes(q) || q.includes(semAcento(s.nome.pt)))) || null;
}
function data(v) {
  v = String(v || "").trim();
  let m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(v);
  if (m) return `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;
  m = /^(\d{1,2})[\/.-](\d{1,2})(?:[\/.-](\d{2,4}))?$/.exec(v);
  if (m) {
    const hoje = new Date(Date.now() - 3 * 3600e3);
    let ano = m[3] ? +m[3] : hoje.getUTCFullYear(); if (ano < 100) ano += 2000;
    let d = `${ano}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
    if (!m[3] && d < hoje.toISOString().slice(0, 10)) d = `${ano + 1}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
    return d;
  }
  return "";
}
function hora(v) {
  v = semAcento(v).replace(/\s/g, "");
  let m = /^(\d{1,2})(?:[:h](\d{2}))?h?(am|pm)?$/.exec(v);
  if (!m) return "";
  let h = +m[1]; const mi = m[2] ? +m[2] : 0;
  if (m[3] === "pm" && h < 12) h += 12; if (m[3] === "am" && h === 12) h = 0;
  return h < 24 && mi < 60 ? `${String(h).padStart(2, "0")}:${String(mi).padStart(2, "0")}` : "";
}
function sentido(v) {
  const t = semAcento(v);
  if (/sai|depart|salida|embarque|ida ao aero|para o aero|to the airport|al aeropuerto/.test(t)) return "saida";
  if (/cheg|arriv|llega|desembar|do aero|from the airport|del aeropuerto/.test(t)) return "chegada";
  return "";
}

/* Monta os itens e cota no motor do site. Se faltar algo, devolve { faltando: [...] }. */
function cotacaoDe(d, agora, lang) {
  const falta = [];
  const svc = acharServico(d.servico);
  if (!svc || svc.oculto || svc.tipo === "km") falta.push("servico");
  const pax = parseInt(d.pax, 10), malas = parseInt(d.malas, 10);
  if (!(pax >= 1)) falta.push("pax");
  if (!(malas >= 0)) falta.push("malas");
  if (svc && svc.tipo === "hora" && !(parseInt(d.horas, 10) >= 1)) falta.push("horas");
  let brutos = Array.isArray(d.trechos) ? d.trechos.slice(0, 2) : [];
  if (!brutos.length && (d.data || d.hora)) brutos = [{ data: d.data, hora: d.hora, sentido: d.sentido }];
  const trechos = brutos.map((t) => ({ data: data(t && t.data), hora: hora(t && t.hora), sentido: sentido((t && t.sentido) || d.sentido) }));
  if (!trechos.length || trechos.some((t) => !t.data)) falta.push("data");
  if (!trechos.length || trechos.some((t) => !t.hora)) falta.push("hora");
  if (svc && svc.sentido && trechos.some((t) => !t.sentido)) falta.push("sentido");
  const local = String(d.local || "").trim().slice(0, 160);
  if (local.length < 3) falta.push("local");
  if (falta.length) return { faltando: falta };
  const aero = /^igr/.test(svc.id) ? "Aeroporto de Puerto Iguazú (IGR)" : "Aeroporto de Foz do Iguaçu (IGU)";
  const itens = trechos.map((t) => normalizarItem({ servico: svc.id, data: t.data, hora: t.hora, sentido: t.sentido || "chegada", pax, malas, malasMao: parseInt(d.malasMao, 10) || 0, horas: d.horas, dias: d.dias,
    origem: svc.sentido ? (t.sentido === "saida" ? local : aero) : local, destino: svc.sentido ? (t.sentido === "saida" ? aero : local) : "" }));
  const cot = itens.map((it) => cotarTodas(it, agora));
  const cats = {};
  for (const cat of Object.keys(CATEGORIAS)) {
    const rs = cot.map((c) => c.ok && c.categorias[cat]);
    if (rs.every((r) => r && r.ok)) cats[cat] = { ok: true, valor: rs.reduce((a, r) => a + r.valor, 0), nome: CATEGORIAS[cat].nome[lang], pax: CATEGORIAS[cat].pax, malas: CATEGORIAS[cat].malas, malasMao: CATEGORIAS[cat].malasMao, acima: rs.some((r) => r.malasAcima) };
    else {
      const e = rs.find((r) => r && !r.ok);
      if (e) cats[cat] = { ok: false, erro: e.erro, horas: e.horas };
    }
  }
  return { itens, categorias: cats, servicoId: svc.id };
}

const PERGUNTA = {
  pt: { servico: "qual serviço ou trajeto você precisa", data: "a data", hora: "o horário", pax: "quantas pessoas", malas: "quantas malas grandes", local: "o nome do hotel ou o endereço", sentido: "se é chegada (aeroporto → hotel) ou saída (hotel → aeroporto)", horas: "quantas horas", ini: "Para calcular o preço, me diga ", e: " e " },
  en: { servico: "which service or route you need", data: "the date", hora: "the time", pax: "how many people", malas: "how many large bags", local: "the hotel name or address", sentido: "whether it is an arrival (airport → hotel) or departure (hotel → airport)", horas: "how many hours", ini: "To calculate the price, please tell me ", e: " and " },
  es: { servico: "qué servicio o trayecto necesita", data: "la fecha", hora: "el horario", pax: "cuántas personas", malas: "cuántas valijas grandes", local: "el nombre del hotel o la dirección", sentido: "si es llegada (aeropuerto → hotel) o salida (hotel → aeropuerto)", horas: "cuántas horas", ini: "Para calcular el precio, dígame ", e: " y " },
};
function perguntaFalta(falta, lang) {
  const P = PERGUNTA[lang], l = falta.map((k) => P[k]).filter(Boolean).slice(0, 3);
  if (!l.length) return "";
  return P.ini + (l.length > 1 ? l.slice(0, -1).join(", ") + P.e + l[l.length - 1] : l[0]) + ".";
}

export async function assistente(env, body, agora = Date.now()) {
  const lang = LINGUAS[body.lang] ? body.lang : "pt";
  const hist = (Array.isArray(body.mensagens) ? body.mensagens : []).slice(-12)
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .map((m) => ({ role: m.role, content: m.content.slice(0, 600) }));
  if (!hist.length || hist[hist.length - 1].role !== "user") return { ok: false, erro: "sem_mensagem" };

  let saida;
  if (env.AI_MOCK === "1") saida = mock(hist);
  else {
    if (!env.AI) return { ok: false, erro: "ia_indisponivel" };
    const r = await env.AI.run(MODELO, {
      messages: [{ role: "system", content: sistema(lang) }, ...hist],
      response_format: { type: "json_schema", json_schema: ESQUEMA },
      max_tokens: 400, temperature: 0.3,
    });
    saida = lerSaida(r);
  }
  // nunca deixar a IA mostrar valores: remove qualquer "R$ 123" / "$123" que escape
  let resposta = String(saida.resposta || "").replace(/(R\$|US\$|U\$S|\$|€)\s?\d[\d.,]*/g, "").slice(0, 700).trim();
  const out = { ok: true, resposta, humano: !!saida.humano };
  const cot = cotacaoDe(saida, agora, lang);
  if (cot.itens) {
    out.cotacao = { itens: cot.itens, categorias: cot.categorias };
    out.servicoNome = servico(cot.servicoId).nome[lang] || servico(cot.servicoId).nome.pt;
  } else if (!out.humano) {
    // a IA não pode dizer "veja os valores" se o sistema ainda não calculou: pergunta o que falta
    const promete = /abaixo|below|abajo|valores|prices|precios|pre[cç]o|price|precio/i.test(resposta);
    if (!resposta || promete) out.resposta = resposta = perguntaFalta(cot.faltando, lang) || resposta;
    console.log("assistente: faltando", JSON.stringify(cot.faltando), "campos", Object.keys(saida).join(","));
  }
  if (!out.resposta) out.resposta = out.cotacao ? "" : (lang === "en" ? "Sorry, could you rephrase that?" : lang === "es" ? "Disculpe, ¿puede repetirlo de otra forma?" : "Desculpe, pode explicar de outro jeito?");
  return out;
}
