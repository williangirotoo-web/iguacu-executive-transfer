/* Assistente de reservas do site (IA da Cloudflare, Workers AI).

   Como funciona (de propósito, a IA NÃO comanda a conversa):
   1) A cada mensagem, um leitor de regras (sem IA) tira da frase do cliente: serviço, data, horário,
      pessoas, malas, hotel e chegada/saída. Ex.: "18 dezembro 20h, 3 pessoas, hotel Wish".
   2) A IA ajuda a entender frases difíceis e responde dúvidas (cancelamento, cadeirinha, pagamento...).
   3) O que já foi dito fica guardado no "estado" da conversa (o navegador devolve a cada mensagem).
   4) Quem decide a próxima pergunta é o código, nunca a IA: pergunta só o que falta, de forma clara.
   5) Com tudo preenchido, o PREÇO vem do motor do site (cotacao.js). A IA nunca escreve valores. */
import { CONFIG, CATEGORIAS, SERVICOS } from "./precos.js";
import { normalizarItem, cotarTodas, servico } from "./cotacao.js";

const MODELO = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";
const LINGUAS = { pt: "português do Brasil", en: "English", es: "español" };
const VISIVEIS = SERVICOS.filter((s) => !s.oculto && s.tipo !== "km");

/* ---------------- utilidades de texto e data ---------------- */
const sa = (t) => String(t || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const p2 = (n) => String(n).padStart(2, "0");
function agoraFoz(agora) { return new Date(agora - 3 * 3600e3); } // Foz = UTC-3
function isoDia(d) { return d.toISOString().slice(0, 10); }
function somaDias(d, n) { return new Date(d.getTime() + n * 864e5); }
const NUM = { um: 1, uma: 1, one: 1, uno: 1, dois: 2, duas: 2, two: 2, dos: 2, tres: 3, three: 3, quatro: 4, four: 4, cuatro: 4, cinco: 5, five: 5, seis: 6, six: 6, sete: 7, seven: 7, siete: 7, oito: 8, eight: 8, ocho: 8, nove: 9, nine: 9, nueve: 9, dez: 10, ten: 10, diez: 10 };
const NUMRE = "(\\d{1,2}|" + Object.keys(NUM).join("|") + ")";
const num = (v) => (/^\d+$/.test(v) ? +v : NUM[v]);
const MES = { jan: 1, janeiro: 1, january: 1, enero: 1, ene: 1, fev: 2, fevereiro: 2, feb: 2, february: 2, febrero: 2, mar: 3, marco: 3, march: 3, marzo: 3, abr: 4, abril: 4, apr: 4, april: 4, mai: 5, maio: 5, may: 5, mayo: 5, jun: 6, junho: 6, june: 6, junio: 6, jul: 7, julho: 7, july: 7, julio: 7, ago: 8, agosto: 8, aug: 8, august: 8, set: 9, setembro: 9, sep: 9, sept: 9, september: 9, septiembre: 9, out: 10, outubro: 10, oct: 10, october: 10, octubre: 10, nov: 11, novembro: 11, november: 11, noviembre: 11, dez: 12, dezembro: 12, dec: 12, december: 12, dic: 12, diciembre: 12 };
const SEMANA = [["domingo", "sunday"], ["segunda", "monday", "lunes"], ["terca", "tuesday", "martes"], ["quarta", "wednesday", "miercoles"], ["quinta", "thursday", "jueves"], ["sexta", "friday", "viernes"], ["sabado", "saturday"]];

function montaData(dia, mes, ano, hoje) {
  if (!(dia >= 1 && dia <= 31 && mes >= 1 && mes <= 12)) return "";
  let a = ano ? (ano < 100 ? 2000 + ano : ano) : hoje.getUTCFullYear();
  let d = `${a}-${p2(mes)}-${p2(dia)}`;
  if (!ano && d < isoDia(hoje)) d = `${a + 1}-${p2(mes)}-${p2(dia)}`;
  return d;
}
/* data em qualquer formato comum → AAAA-MM-DD ("" se não achar) */
function lerData(txt, agora) {
  const t = " " + sa(txt).replace(/[,]/g, " ") + " ", hoje = agoraFoz(agora);
  let m;
  if (/\bdepois de amanh|pasado manana|day after tomorrow/.test(t)) return isoDia(somaDias(hoje, 2));
  if (/\b(amanha|tomorrow)\b/.test(t) || (/\bmanana\b/.test(t) && !/\b(la|da|de|por la) manana\b/.test(t))) return isoDia(somaDias(hoje, 1));
  if (/\b(hoje|today|hoy)\b/.test(t)) return isoDia(hoje);
  if ((m = /\b(\d{4})-(\d{1,2})-(\d{1,2})\b/.exec(t))) return montaData(+m[3], +m[2], +m[1], hoje);
  if ((m = /\b(\d{1,2})[\/.](\d{1,2})(?:[\/.](\d{2,4}))?\b/.exec(t))) return montaData(+m[1], +m[2], m[3] ? +m[3] : 0, hoje);
  if ((m = /\b(\d{1,2})(?:o|º|st|nd|rd|th)?\s+(?:de\s+)?([a-z]{3,10})(?:\s+(?:de\s+)?(\d{4}))?\b/.exec(t)) && MES[m[2]]) return montaData(+m[1], MES[m[2]], m[3] ? +m[3] : 0, hoje);
  if ((m = /\b([a-z]{3,10})\s+(\d{1,2})(?:st|nd|rd|th)?(?:\s+(\d{4}))?\b/.exec(t)) && MES[m[1]]) return montaData(+m[2], MES[m[1]], m[3] ? +m[3] : 0, hoje);
  if ((m = /\bdia (\d{1,2})\b/.exec(t))) {
    let d = montaData(+m[1], hoje.getUTCMonth() + 1, hoje.getUTCFullYear(), hoje);
    if (d && d < isoDia(hoje)) { const n = new Date(Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth() + 1, 1)); d = montaData(+m[1], n.getUTCMonth() + 1, n.getUTCFullYear(), hoje); }
    return d;
  }
  for (let i = 0; i < 7; i++) {
    if (SEMANA[i].some((w) => new RegExp("\\b" + w).test(t))) {
      let diff = (i - hoje.getUTCDay() + 7) % 7; if (diff === 0) diff = 7;
      return isoDia(somaDias(hoje, diff));
    }
  }
  return "";
}
/* horário → HH:MM ("" se não achar). Não confunde com datas ("18/12") nem com quantidades ("3 pessoas"). */
function lerHora(txt) {
  const t = " " + sa(txt) + " ";
  let m, h = null, mi = 0;
  if (/\b(meio[- ]dia|noon|mediodia)\b/.test(t)) return "12:00";
  if (/\b(meia[- ]noite|midnight|medianoche)\b/.test(t)) return "00:00";
  if ((m = /\b(\d{1,2}):(\d{2})\s*(am|pm|h)?\b/.exec(t))) { h = +m[1]; mi = +m[2]; if (m[3] === "pm" && h < 12) h += 12; if (m[3] === "am" && h === 12) h = 0; }
  else if ((m = /\b(\d{1,2})h(\d{2})?\b/.exec(t))) { h = +m[1]; mi = m[2] ? +m[2] : 0; }
  else if ((m = /\b(\d{1,2})\s+(?:da|de la|in the|a la)\s+(?:manha|manana|morning|tarde|afternoon|noite|noche|evening|night)\b/.exec(t))) h = +m[1];
  else if ((m = /\b(\d{1,2})\s*(am|pm)\b/.exec(t))) { h = +m[1]; if (m[2] === "pm" && h < 12) h += 12; if (m[2] === "am" && h === 12) h = 0; }
  else if ((m = /\b(?:as|a las|at)\s+(\d{1,2})(?:\s+horas?)?\b(?!\s*(?:pessoas|malas|people|bags|personas|maletas|valijas|dias|de\s+[a-z]))/.exec(t))) h = +m[1];
  else if ((m = /\b(\d{1,2})\s+horas\b/.exec(t)) && !/\b(por|durante|for|de)\s+\d{1,2}\s+horas/.test(t)) h = +m[1];
  if (h === null) return "";
  if (/\b(da|de la|a la|in the) (tarde|afternoon|noite|noche|evening|night)\b/.test(t) && h < 12) h += 12;
  return h < 24 && mi < 60 ? `${p2(h)}:${p2(mi)}` : "";
}
function lerSentido(txt) {
  const t = sa(txt);
  if (/\b(do aeroporto (para|pro|ao|ate) o? ?hotel|del aeropuerto al hotel|from the airport to (the|my) hotel)\b/.test(t)) return "chegada";
  if (/\b(do hotel (para|pro|ao|ate) o? ?aeroporto|del hotel al aeropuerto|from (the|my) hotel to the airport)\b/.test(t)) return "saida";
  if (/\b(cheg\w*|desembarc\w*|pouso|pousa\w*|arriv\w*|land\w*|lleg\w*|aterriz\w*)\b/.test(t)) return "chegada";
  if (/\b(volta|voltar|embarque|embarco|meu voo sai|o voo sai|ir para o aeroporto|levar ao aeroporto|levar para o aeroporto|depart\w*|leave|leaving|flight leaves|to the airport|salgo|salida|regreso|al aeropuerto)\b/.test(t)) return "saida";
  return "";
}
function lerPax(txt) {
  const t = " " + sa(txt) + " ";
  let m;
  if (/\b(so eu|sozinh[oa]|eu sozinh|just me|only me|solo yo|1 adulto)\b/.test(t)) return 1;
  if (/\b(eu e minha (esposa|mulher|namorada|mae|filha)|eu e meu (marido|namorado|pai|filho)|um casal|casal|my (wife|husband|partner) and i|a couple|mi (esposa|esposo|pareja) y yo|una pareja)\b/.test(t) && !/\b\d+\s*(pessoas|people|personas)/.test(t)) return 2;
  const c = new RegExp("\\b" + NUMRE + "\\s*(?:criancas?|child(?:ren)?|kids?|ninos?|ninas?|chicos?|bebes?|babies|baby)\\b").exec(t);
  const adultos = new RegExp("\\b" + NUMRE + "\\s*(?:adult[oa]s?|adults?)\\b").exec(t);
  if (adultos) return num(adultos[1]) + (c ? num(c[1]) : 0);
  if ((m = new RegExp("\\b(?:somos|seremos|we are|somos un grupo de|grupo de)\\s+" + NUMRE + "\\b").exec(t))) return num(m[1]);
  if ((m = new RegExp("\\b" + NUMRE + "\\s*(?:pessoas?|passageir[oa]s?|pax|people|persons?|passengers?|personas?|pasajer[oa]s?)\\b").exec(t))) return num(m[1]);
  return null;
}
function lerMalas(txt) {
  const t = " " + sa(txt) + " ";
  let m;
  if (/\b(sem malas?|sem bagagem|nenhuma mala|no (luggage|bags|suitcases)|sin (maletas|valijas|equipaje)|so (mochila|bolsa|mala de mao)|apenas (mochila|bolsa))\b/.test(t)) return 0;
  if ((m = new RegExp("\\b" + NUMRE + "\\s*(?:malas?(?: grandes?)?|bagagens?|suitcases?|bags?|luggage|maletas?|valijas?)\\b").exec(t))) return num(m[1]);
  if (/\b(uma mala|a suitcase|one bag|una maleta|una valija)\b/.test(t)) return 1;
  return null;
}
function lerLocal(txt) {
  const orig = String(txt || "");
  const m = /\b((?:hotel|pousada|hostel|resort|apart[- ]?hotel|airbnb|condom[ií]nio|casa)\s+[^,.;!?\n]{2,45}|(?:rua|avenida|av\.|alameda|travessa|calle|street)\s+[^;!?\n]{3,70})/i.exec(orig);
  if (!m) return "";
  const nome = sa(m[1]).split(/\s+/).slice(1);
  const GEN = /^(e|and|y|em|in|en|para|pra|pro|do|da|de|the|my|meu|minha|mi|o|a|no|na|back|ida|volta|vuelta|que|onde|where|donde|perto|near|cerca|ou|or)$/;
  if (!nome.length || GEN.test(nome[0])) return "";
  return m[1].replace(/\s+(e|and|y|com|with|con|para|to|a|as|às|dia|no dia|em|pra)\s.*$/i, "").replace(/\s+\d{1,2}([:h]\d{0,2})?\s*$/, "").trim().slice(0, 120);
}
/* serviço pelo texto do cliente (regras simples; a IA ajuda nos casos difíceis) */
function lerServico(txt, atual) {
  const t = " " + sa(txt) + " ";
  const tem = (re) => re.test(t);
  const aero = tem(/\b(aeroporto|airport|aeropuerto|igu|igr)\b/);
  const pi = tem(/\bpuerto iguazu\b/), cde = tem(/\b(ciudad del este|cde|paraguai|paraguay)\b/), arg = tem(/\b(argentin\w*|lado argentino)\b/);
  const soIda = tem(/\b(so ida|somente ida|apenas ida|one way|solo ida)\b/);
  // viagem para outra cidade (nome depois de "→" no catálogo)
  const viagens = VISIVEIS.filter((s) => s.grupo === "viagens").sort((a, b) => b.nome.pt.length - a.nome.pt.length);
  for (const s of viagens) {
    const cidade = sa(s.nome.pt.split("→")[1] || "").replace(/\(.*\)/, "").trim();
    if (cidade && cidade.length > 3 && t.includes(" " + cidade)) return s.id;
  }
  if (aero) {
    if (tem(/\b(igr|aeropuerto de puerto iguazu|aeroporto de puerto iguazu|aeroporto argentino)\b/)) return pi || tem(/hotel (em|en|in) puerto/) ? "igr-pi" : "igr-foz";
    if (cde) return "igu-cde";
    if (pi || (arg && !tem(/\b(cataratas|falls|parque)\b/))) return "igu-pi";
    if (!tem(/\b(cataratas|falls|itaipu|marco)\b/)) return "igu-foz";
  }
  if (tem(/\b(rodoviaria|bus station|terminal de onibus|terminal de omnibus)\b/)) return "rod-foz";
  if (cde && !tem(/\b(cataratas|falls)\b/)) return soIda || tem(/hotel (em|en|in) (ciudad|cde)/) ? "foz-cde" : "cde";
  if (tem(/\b(dois lados|ambos os lados|ambos lados|both sides|los dos lados)\b/)) return "dois-lados";
  if (tem(/\b(3 paises|tres paises|three countries)\b/)) return "tres-paises";
  if (tem(/\b(cataratas|iguazu falls|iguacu falls|falls|garganta)\b/)) {
    if (arg || tem(/\b(garganta del diablo|parque iguazu|lado argentino)\b/)) return soIda ? "ar-ida" : "ar-iv";
    return tem(/\b(esper\w*|a disposicao|wait\w*)\b/) ? "br-espera" : "br-iv";
  }
  if (tem(/\bparque das aves|bird park\b/)) return "br-iv";
  if (tem(/\bitaipu\b/)) return "itaipu";
  if (tem(/\bmarco\b|tres fronteiras|three borders|triple frontera/)) return "marco";
  if (tem(/\bcity ?tour\b/)) return "city-tour";
  if (tem(/\b(noiva|casamento|wedding|boda|novia)\b/)) return "noivas";
  if (tem(/\b(dia inteiro|o dia todo|diaria|full day|all day|dia completo|todo el dia)\b/)) return "diaria";
  if (tem(/\b(motorista|driver|chofer)\b.*\b(\d{1,2}|algumas|some|unas)\s*(horas|hours)\b|\bpor \d{1,2} horas\b|\bfor \d{1,2} hours\b/)) return "por-hora";
  if (tem(/\b(meio periodo|half day|medio dia|por hora|a disposicao por)\b/)) return "por-hora";
  // pacotes de Puerto Iguazú (feirinha, cassino, duty free, pôr do sol no Hito)
  const piPac = pi || tem(/\b(feirinha|cassino|casino|duty ?free|hito)\b/);
  if (piPac && tem(/\b(cassino|casino)\b/)) return "pi-cassino";
  if (piPac && tem(/\bduty ?free\b/)) return "pi-dutyfree";
  if (piPac && tem(/\bfeirinha\b/) && tem(/\b(jantar|dinner|cena)\b/)) return "pi-noite";
  if (piPac && tem(/\bhito\b/)) return tem(/\b(jantar|dinner|cena)\b/) ? "pi-hito-jantar" : "pi-hito-feirinha";
  if (piPac && tem(/\bfeirinha\b/)) return "pi-feirinha";
  if (pi && tem(/\b(jantar|dinner|cena)\b/)) return "jantar-pi";
  if (pi && tem(/\b(compras|shopping|centro)\b/)) return "pi-compras";
  if (pi && tem(/\bhotel\b/)) return "foz-pi";
  if (cde) return soIda || tem(/hotel (em|en|in) (ciudad|cde)/) ? "foz-cde" : "cde";
  return atual || "";
}

/* ---------------- texto para a IA ---------------- */
function sistema(lang, estado, agora) {
  const h = agoraFoz(agora), dias = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
  const lista = VISIVEIS.map((s) => `- ${s.id}: ${s.nome.pt}`).join("\n");
  return `Você ajuda o assistente de reservas da Iguaçu Executive Transfer (transfer executivo e passeios com motorista em Foz do Iguaçu, Brasil, Argentina e Paraguai).
Hoje é ${dias[h.getUTCDay()]}, ${isoDia(h)}, ${h.toISOString().slice(11, 16)} (horário de Foz do Iguaçu).
Dados já anotados nesta conversa: ${JSON.stringify(estado)}

Leia a ÚLTIMA mensagem do cliente (use as anteriores só como contexto) e devolva JSON com:
- servico: id da lista abaixo, se o cliente indicou o serviço/trajeto (senão "").
- pax, malas: números, se o cliente disse. local: hotel ou endereço do cliente, se disse.
- trechos: [{data "AAAA-MM-DD", hora "HH:MM", sentido "chegada"|"saida"|""}]. Ida e volta do aeroporto = 2 trechos.
- duvida: "" ou, SE o cliente fez uma pergunta que NÃO seja sobre preço/valor (o sistema mostra o preço sozinho) (ex.: cancelamento, cadeirinha, pagamento, quanto tempo leva, documentos), a resposta curta (1 ou 2 frases) em ${LINGUAS[lang]}, usando SÓ as informações abaixo. Nunca escreva preços nem valores. Nunca escreva ids.
- humano: true só se o pedido não existe na lista (outra cidade fora da lista, evento especial, grupo grande com várias vans), se pedir para falar com uma pessoa, ou se o assunto não for transfer/turismo.

INFORMAÇÕES CORRETAS:
- Preço por carro (não por pessoa), fechado na reserva, sem taxímetro; o site mostra os valores sozinho.
- Antecedência mínima pelo site: ${CONFIG.antecedenciaHoras.comum} h no carro Comum e ${CONFIG.antecedenciaHoras.exec} h nos demais; para menos que isso, WhatsApp.
- Cancelamento grátis até ${CONFIG.cancelamento.gratisAteHoras} h antes.
- Aeroporto: o motorista espera ${CONFIG.esperaAeroporto.gratisMin} minutos grátis após o pouso, com placa com o nome do cliente.
- Cadeirinha infantil a partir do carro Executivo (não no Comum). Pet pequeno/médio aceito (no Comum, sob consulta).
- Pagamento na reserva: Pix ou cartão em até ${CONFIG.parcelasMax}x; clientes do exterior podem pagar por PayPal.
- Os carros têm documentação para Argentina e Paraguai; o motorista atravessa a fronteira com o cliente. Ingressos dos atrativos são pagos à parte.

SERVIÇOS:
${lista}
Dicas: aeroporto↔hotel em Foz = igu-foz; Cataratas argentinas = ar-iv; Cataratas brasileiras = br-iv; compras no Paraguai = cde; viagem a outra cidade = id da cidade.

Responda SOMENTE o JSON.`;
}
const ESQUEMA = {
  type: "object",
  properties: {
    servico: { type: "string" }, pax: { type: "integer" }, malas: { type: "integer" }, local: { type: "string" },
    horas: { type: "integer" }, dias: { type: "integer" },
    trechos: { type: "array", items: { type: "object", properties: { data: { type: "string" }, hora: { type: "string" }, sentido: { type: "string" } } } },
    duvida: { type: "string" }, humano: { type: "boolean" },
  },
};
function lerSaida(r) {
  let x = r && r.response !== undefined ? r.response : r;
  if (typeof x === "string") {
    const i = x.indexOf("{"), j = x.lastIndexOf("}");
    try { x = JSON.parse(i >= 0 && j > i ? x.slice(i, j + 1) : x); } catch { x = {}; }
  }
  return x && typeof x === "object" ? x : {};
}
/* respostas de teste local (AI_MOCK=1): nunca usadas no site publicado */
function mock(ultima) {
  if (/falar com|humano|atendente/i.test(ultima)) return { humano: true };
  if (/cancel/i.test(ultima)) return { duvida: "O cancelamento é grátis até 48 h antes." };
  return {};
}

/* ---------------- estado da conversa ---------------- */
function limparEstado(e) {
  e = e && typeof e === "object" ? e : {};
  const svc = servico(String(e.servico || ""));
  const n = (v, max) => (Number.isInteger(v) && v >= 0 && v <= max ? v : undefined);
  const tr = (Array.isArray(e.trechos) ? e.trechos : []).slice(0, 2).map((t) => ({
    data: /^\d{4}-\d{2}-\d{2}$/.test(t && t.data) ? t.data : "", hora: /^\d{2}:\d{2}$/.test(t && t.hora) ? t.hora : "",
    sentido: t && (t.sentido === "chegada" || t.sentido === "saida") ? t.sentido : "",
  }));
  return { servico: svc && !svc.oculto ? svc.id : "", pax: n(e.pax, 60), malas: n(e.malas, 60), horas: n(e.horas, 12), dias: n(e.dias, 15), local: String(e.local || "").slice(0, 160), trechos: tr };
}
/* aplica o que veio da IA (só preenche o que ainda está vazio) e depois o que as regras leram (prevalece) */
function aplicar(est, ia, regras) {
  const e = JSON.parse(JSON.stringify(est));
  const vazio = (v) => v === undefined || v === null || v === "";
  const svcIa = ia.servico && servico(String(ia.servico).trim());
  // a IA só escolhe o serviço se o cliente falou de algum lugar ou passeio nesta mensagem
  const tx = sa(regras.texto || "");
  const falouLugar = /\b(aeroport\w*|airport|aeropuerto|hotel|cataratas|falls|argentin\w*|paragua\w*|ciudad|itaipu|marco|parque|rodoviaria|terminal|passeio|tour|paseo|cidade|city|viagem|trip|viaje|compras|shopping|centro|puerto|foz|motorista|driver|chofer|transfer|traslado|taxi)\b/.test(tx);
  if (vazio(e.servico) && falouLugar && svcIa && !svcIa.oculto && svcIa.tipo !== "km") e.servico = svcIa.id;
  // a IA só preenche números se o cliente escreveu algum número/quantidade nesta mensagem (evita "0 malas" inventado)
  const temNum = /\d|\b(um|uma|dois|duas|tres|quatro|cinco|seis|one|two|three|four|five|six|dos|cuatro|nenhuma)\b|\b(sem|sin|no) (malas?|bagagem|luggage|bags|maletas|valijas|equipaje)\b/.test(sa(regras.texto || ""));
  // e cada número só se o cliente falou daquele assunto (evita "0 malas" inventado)
  const assunto = { pax: /\b(pesso\w*|pax|people|person\w*|passag\w*|passeng\w*|adult\w*|pasaj\w*|somos|casal|couple|pareja|crianc\w*|child\w*|kids?|ninos?)\b/, malas: /\b(mala\w*|bag\w*|bagag\w*|luggage|suitcase\w*|maleta\w*|valija\w*|equipaje)\b/, horas: /\b(hora|horas|hours?|hs)\b/, dias: /\b(dia|dias|days?|diaria\w*)\b/ };
  for (const k of ["pax", "malas", "horas", "dias"]) { const v = parseInt(ia[k], 10); if (temNum && assunto[k].test(tx) && vazio(e[k]) && Number.isFinite(v) && v >= (k === "pax" ? 1 : 0)) e[k] = v; }
  if (!e.local && typeof ia.local === "string" && ia.local.trim().length >= 3) e.local = ia.local.trim().slice(0, 120);
  if (Array.isArray(ia.trechos)) ia.trechos.slice(0, 2).forEach((t, i) => {
    if (!t) return; e.trechos[i] = e.trechos[i] || { data: "", hora: "", sentido: "" };
    const d = lerData(t.data || "", regras.agora) || (/^\d{4}-\d{2}-\d{2}$/.test(t.data) ? t.data : ""), h = lerHora(t.hora || "") || (/^\d{2}:\d{2}$/.test(t.hora) ? t.hora : "");
    if (!e.trechos[i].data && d) e.trechos[i].data = d;
    if (!e.trechos[i].hora && h) e.trechos[i].hora = h;
    if (!e.trechos[i].sentido && (t.sentido === "chegada" || t.sentido === "saida")) e.trechos[i].sentido = t.sentido;
  });
  // regras (última mensagem) prevalecem: o cliente pode corrigir ("na verdade somos 4")
  if (regras.servico) e.servico = regras.servico;
  if (regras.pax) e.pax = regras.pax;
  const sv = servico(e.servico);
  if (regras.horas && sv && sv.tipo === "hora") e.horas = regras.horas;
  if (regras.dias && sv && sv.tipo === "diaria") e.dias = regras.dias;
  if (regras.malas !== null) e.malas = regras.malas;
  if (regras.local) e.local = regras.local;
  if (regras.data || regras.hora || regras.sentido) {
    // preenche o primeiro trecho incompleto; se todos completos, corrige o primeiro
    let i = e.trechos.findIndex((t) => !t.data || !t.hora || (!t.sentido && servico(e.servico) && servico(e.servico).sentido));
    if (i < 0) i = 0;
    e.trechos[i] = e.trechos[i] || { data: "", hora: "", sentido: "" };
    if (regras.data) e.trechos[i].data = regras.data;
    if (regras.hora) e.trechos[i].hora = regras.hora;
    if (regras.sentido) e.trechos[i].sentido = regras.sentido;
  }
  if (!e.trechos.length) e.trechos = [];
  return limparEstado(e);
}
function faltando(e) {
  const f = [], svc = servico(e.servico);
  if (!svc) return ["servico"];
  const t0 = e.trechos[0] || {};
  if (!e.trechos.length || e.trechos.some((t) => !t.data)) f.push("data");
  if (!e.trechos.length || e.trechos.some((t) => !t.hora)) f.push("hora");
  if (svc.sentido && (!e.trechos.length || e.trechos.some((t) => !t.sentido))) f.push("sentido");
  if (!(e.pax >= 1)) f.push("pax");
  if (!(e.malas >= 0)) f.push("malas");
  if (svc.tipo === "hora" && !(e.horas >= 1)) f.push("horas");
  if (svc.tipo === "diaria" && !(e.dias >= 1)) f.push("dias");
  if (!e.local || e.local.length < 3) f.push(svc.sentido && t0.sentido === "chegada" ? "localDestino" : "local");
  return f;
}

/* ---------------- textos fixos (o código escreve as perguntas) ---------------- */
const TX = {
  pt: {
    servico: "Para onde você vai? Por exemplo: aeroporto → hotel, Cataratas (lado brasileiro ou argentino), compras no Paraguai, Itaipu ou viagem para outra cidade.",
    data: "Qual a data?", hora: "Qual o horário?", dataHora: "Qual a data e o horário?", sentido: "É chegada (do aeroporto para o hotel) ou saída (do hotel para o aeroporto)?", volta: "E a volta: qual a data e o horário para irmos do hotel ao aeroporto?",
    pax: "Quantas pessoas?", malas: "Quantas malas grandes?", paxMalas: "Quantas pessoas e quantas malas grandes?",
    local: "Qual o hotel ou endereço onde buscamos você?", localDestino: "Qual o hotel ou endereço de destino?", horas: "Por quantas horas (mínimo 5)?", dias: "Quantos dias?",
    anotei: "Anotei", pessoas: "pessoa(s)", malasTxt: "mala(s)", as: "às", pronto: "Pronto! Veja os valores abaixo e toque em Reservar no carro que preferir.",
    humano: "Isso nossa equipe resolve direto com você pelo WhatsApp.", fora: "Posso ajudar com transfer e passeios em Foz do Iguaçu. Para outros assuntos, fale com a equipe pelo WhatsApp.",
    ola: "Olá! ",
  },
  en: {
    servico: "Where would you like to go? For example: airport → hotel, Iguazu Falls (Brazilian or Argentine side), shopping in Paraguay, Itaipu or a trip to another city.",
    data: "What is the date?", hora: "What time?", dataHora: "What date and time?", sentido: "Is it an arrival (airport to hotel) or a departure (hotel to airport)?", volta: "And the return: what date and time should we take you from the hotel to the airport?",
    pax: "How many people?", malas: "How many large suitcases?", paxMalas: "How many people and how many large suitcases?",
    local: "Which hotel or address should we pick you up from?", localDestino: "Which hotel or address are you going to?", horas: "For how many hours (minimum 5)?", dias: "How many days?",
    anotei: "Noted", pessoas: "person(s)", malasTxt: "bag(s)", as: "at", pronto: "Done! See the prices below and tap Book on the vehicle you prefer.",
    humano: "Our team will sort this out with you on WhatsApp.", fora: "I can help with transfers and tours in Foz do Iguaçu. For anything else, please message our team on WhatsApp.",
    ola: "Hi! ",
  },
  es: {
    servico: "¿Adónde quiere ir? Por ejemplo: aeropuerto → hotel, Cataratas (lado brasileño o argentino), compras en Paraguay, Itaipú o viaje a otra ciudad.",
    data: "¿Qué fecha?", hora: "¿A qué hora?", dataHora: "¿Qué fecha y hora?", sentido: "¿Es llegada (del aeropuerto al hotel) o salida (del hotel al aeropuerto)?", volta: "Y la vuelta: ¿qué fecha y hora lo llevamos del hotel al aeropuerto?",
    pax: "¿Cuántas personas?", malas: "¿Cuántas valijas grandes?", paxMalas: "¿Cuántas personas y cuántas valijas grandes?",
    local: "¿En qué hotel o dirección lo buscamos?", localDestino: "¿A qué hotel o dirección va?", horas: "¿Por cuántas horas (mínimo 5)?", dias: "¿Cuántos días?",
    anotei: "Anoté", pessoas: "persona(s)", malasTxt: "valija(s)", as: "a las", pronto: "¡Listo! Vea los valores abajo y toque Reservar en el vehículo que prefiera.",
    humano: "Eso nuestro equipo lo resuelve con usted por WhatsApp.", fora: "Puedo ayudar con traslados y paseos en Foz do Iguaçu. Para otros temas, escriba a nuestro equipo por WhatsApp.",
    ola: "¡Hola! ",
  },
};
function proximaPergunta(f, T, e) {
  const q = [];
  if (f.includes("servico")) return T.servico;
  const t0 = (e && e.trechos[0]) || {}, t1 = e && e.trechos[1];
  if (t1 && t0.data && t0.hora && (!t1.data || !t1.hora)) { q.push(T.volta); f = f.filter((k) => k !== "data" && k !== "hora"); }
  if (f.includes("data") && f.includes("hora")) q.push(T.dataHora); else if (f.includes("data")) q.push(T.data); else if (f.includes("hora")) q.push(T.hora);
  if (f.includes("sentido")) q.push(T.sentido);
  if (q.length < 2) { if (f.includes("pax") && f.includes("malas")) q.push(T.paxMalas); else if (f.includes("pax")) q.push(T.pax); else if (f.includes("malas")) q.push(T.malas); }
  if (q.length < 2 && f.includes("horas")) q.push(T.horas);
  if (q.length < 2 && f.includes("dias")) q.push(T.dias);
  if (q.length < 2 && (f.includes("local") || f.includes("localDestino"))) q.push(f.includes("localDestino") ? T.localDestino : T.local);
  return q.join(" ");
}
function dataBr(d, lang) { const [a, m, dd] = d.split("-"); return lang === "en" ? `${m}/${dd}` : `${dd}/${m}`; }
function resumo(e, lang, T) {
  const svc = servico(e.servico); if (!svc) return "";
  const p = [svc.nome[lang] || svc.nome.pt];
  e.trechos.forEach((t) => { if (t.data || t.hora) p.push([t.data ? dataBr(t.data, lang) : "", t.hora ? T.as + " " + t.hora : ""].join(" ").trim()); });
  if (e.pax >= 1) p.push(e.pax + " " + T.pessoas);
  if (e.malas >= 0) p.push(e.malas + " " + T.malasTxt);
  if (e.local) p.push(e.local);
  return T.anotei + ": " + p.join(" · ") + ".";
}

/* ---------------- cotação no motor do site ---------------- */
function cotar(e, agora, lang) {
  const svc = servico(e.servico);
  const aero = /^igr/.test(svc.id) ? "Aeroporto de Puerto Iguazú (IGR)" : "Aeroporto de Foz do Iguaçu (IGU)";
  const itens = e.trechos.map((t) => normalizarItem({
    servico: svc.id, data: t.data, hora: t.hora, sentido: t.sentido || "chegada", pax: e.pax, malas: e.malas, horas: e.horas, dias: e.dias,
    origem: svc.sentido ? (t.sentido === "saida" ? e.local : aero) : e.local, destino: svc.sentido ? (t.sentido === "saida" ? aero : e.local) : "",
  }));
  const cot = itens.map((it) => cotarTodas(it, agora));
  const cats = {};
  for (const cat of Object.keys(CATEGORIAS)) {
    const rs = cot.map((c) => c.ok && c.categorias[cat]);
    if (rs.every((r) => r && r.ok)) cats[cat] = { ok: true, valor: rs.reduce((a, r) => a + r.valor, 0), nome: CATEGORIAS[cat].nome[lang], pax: CATEGORIAS[cat].pax, malas: CATEGORIAS[cat].malas };
    else { const x = rs.find((r) => r && !r.ok); if (x) cats[cat] = { ok: false, erro: x.erro, horas: x.horas, max: x.max }; }
  }
  return { itens, categorias: cats };
}

/* ---------------- entrada principal ---------------- */
export async function assistente(env, body, agora = Date.now()) {
  const lang = LINGUAS[body.lang] ? body.lang : "pt", T = TX[lang];
  const hist = (Array.isArray(body.mensagens) ? body.mensagens : []).slice(-10)
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim())
    .map((m) => ({ role: m.role, content: m.content.slice(0, 600) }));
  if (!hist.length || hist[hist.length - 1].role !== "user") return { ok: false, erro: "sem_mensagem" };
  const ultima = hist[hist.length - 1].content;
  const antes = limparEstado(body.estado);

  // 1) regras sobre a última mensagem
  const tq = sa(ultima), mh = /\b(\d{1,2})\s*(horas|hours|hs)\b/.exec(tq), md = /\b(\d{1,2})\s*(dias|days|diarias)\b/.exec(tq);
  const localLido = lerLocal(ultima);
  const semLocal = localLido ? ultima.replace(localLido, " ") : ultima;
  const regras = { texto: ultima, agora, horas: mh ? +mh[1] : null, dias: md ? +md[1] : null, servico: lerServico(semLocal, ""), pax: lerPax(ultima), malas: lerMalas(ultima), local: localLido, data: lerData(ultima, agora), hora: lerHora(ultima), sentido: lerSentido(ultima) };
  // resposta só com um número ("2"): vale para o primeiro dado numérico que estava faltando
  const soNum = /^\s*(\d{1,2})\s*[.!]?\s*$/.exec(ultima);
  if (soNum && servico(antes.servico)) {
    const fa = faltando(antes), n = +soNum[1];
    if (fa.includes("pax") && n >= 1) regras.pax = n; else if (fa.includes("malas")) regras.malas = n; else if (fa.includes("horas")) regras.horas = n; else if (fa.includes("dias")) regras.dias = n;
  }
  // ida e volta do aeroporto: dois trechos
  if (/\b(ida e volta|round trip|ida y vuelta|e volto|and back|y vuelta)\b/.test(sa(ultima)) && servico(regras.servico || antes.servico) && servico(regras.servico || antes.servico).sentido && antes.trechos.length < 2) {
    antes.trechos = [antes.trechos[0] || { data: "", hora: "", sentido: "chegada" }, { data: "", hora: "", sentido: "saida" }];
    if (!antes.trechos[0].sentido) antes.trechos[0].sentido = "chegada";
  }

  // 2) IA (entende frases difíceis e responde dúvidas). Se falhar, o assistente segue só com as regras.
  let ia = {};
  try {
    if (env.AI_MOCK === "1") ia = mock(ultima);
    else if (env.AI) {
      const modelo = body._preview && typeof body.modelo === "string" && /^@cf\/[\w./-]+$/.test(body.modelo) ? body.modelo : MODELO;
      const r = await env.AI.run(modelo, {
        messages: [{ role: "system", content: sistema(lang, antes, agora) }, ...hist],
        response_format: { type: "json_schema", json_schema: ESQUEMA }, max_tokens: 350, temperature: 0.1,
      });
      ia = lerSaida(r);
    }
  } catch (e) { console.error("assistente IA", e && e.message); }

  const estado = aplicar(antes, ia, regras);
  const out = { ok: true, estado };
  if (body.debug === true && body._preview) out._debug = { ia, regras };

  // dúvida respondida pela IA (sem valores, sem ids)
  let duvida = String(ia.duvida || "").replace(/(R\$|US\$|U\$S|\$|€)\s?\d[\d.,]*/g, "").trim();
  for (const sv of SERVICOS) if (duvida.includes(sv.id)) duvida = duvida.split(sv.id).join(sv.nome[lang] || sv.nome.pt);
  if (duvida.length < 8 || /^\{/.test(duvida)) duvida = "";
  if (/\b(valor|valores|pre[cç]o|price|precio|acesse|acessar|nosso site|website|sitio web|whats\s?app)\b/i.test(duvida)) duvida = "";
  if (duvida.length > 400) duvida = duvida.slice(0, 400).replace(/\s\S*$/, "") + "…";

  const f = faltando(estado);
  const nada = !regras.servico && !regras.pax && regras.malas === null && !regras.local && !regras.data && !regras.hora && !regras.sentido;
  const mudou = JSON.stringify(estado) !== JSON.stringify(antes);

  const pedePessoa = /\b(atendente|falar com (alguem|uma pessoa|voces|o dono)|humano|human|agent|real person|persona real|hablar con)\b/.test(sa(ultima));
  if (pedePessoa || (ia.humano === true && nada && !mudou && !duvida)) {
    out.humano = true;
    const viagem = /\b(ir|vou|viagem|viajar|transfer|traslado|levar|buscar|trip|ride|go to|viaje|llevar|evento|festa|grupo|van|onibus)\b/.test(sa(ultima));
    out.resposta = estado.servico || pedePessoa || viagem ? T.humano : T.fora;
    return out;
  }
  if (!f.length) {
    const c = cotar(estado, agora, lang);
    out.cotacao = c;
    out.resposta = (duvida ? duvida + "\n" : "") + resumo(estado, lang, T) + "\n" + T.pronto;
    return out;
  }
  const saudacao = hist.filter((m) => m.role === "user").length === 1 && /^(oi|ola|olá|bom dia|boa tarde|boa noite|hi|hello|hola|buenas|buen dia)\b/i.test(ultima.trim()) ? T.ola : "";
  const partes = [];
  if (duvida) partes.push(duvida);
  if (estado.servico && mudou) partes.push(resumo(estado, lang, T));
  else if (!estado.servico && mudou && estado.trechos[0] && estado.trechos[0].data) partes.push(T.anotei + ": " + dataBr(estado.trechos[0].data, lang) + (estado.trechos[0].hora ? " " + T.as + " " + estado.trechos[0].hora : "") + ".");
  partes.push(proximaPergunta(f, T, estado));
  out.resposta = saudacao + partes.join("\n");
  return out;
}

/* exportado só para testes */
export const _t = { lerData, lerHora, lerPax, lerMalas, lerLocal, lerServico, lerSentido };
