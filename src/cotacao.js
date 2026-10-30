/* Motor de preços: calcula o valor de um serviço SEMPRE no servidor.
   Nunca confia em valor vindo do navegador. */
import { CONFIG, CATEGORIAS, SERVICOS, HORA_EXTRA, POR_HORA, POR_KM, datasEspeciais } from "./precos.js";

const SVC = Object.fromEntries(SERVICOS.map((s) => [s.id, s]));
const centavos = (v) => Math.round(v * 100) / 100;
const int = (v, d = 0) => { const n = parseInt(v, 10); return Number.isFinite(n) ? n : d; };
const especiais = new Map(); // cache por ano
function ehDataEspecial(data) {
  const ano = +data.slice(0, 4);
  if (!especiais.has(ano)) especiais.set(ano, new Set(datasEspeciais(ano)));
  return especiais.get(ano).has(data);
}

export function servico(id) { return SVC[id] || null; }

/* Ponto escolhido no mapa: só latitude, longitude e nome. A distância é sempre calculada no servidor. */
function lugar(v) {
  if (!v || typeof v !== "object") return null;
  const lat = Number(v.lat), lon = Number(v.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;
  return { lat: Math.round(lat * 1e5) / 1e5, lon: Math.round(lon * 1e5) / 1e5, label: String(v.label == null ? "" : v.label).trim().slice(0, 160) };
}

/* Preço de UM trecho por km (sem fronteira): km acima do limite custam X% a mais; nunca abaixo do mínimo */
export function precoTrechoKm(km, cat) {
  const v = POR_KM.valorKm[cat], min = POR_KM.minimo[cat];
  if (v == null) return null;
  const lim = POR_KM.acrescimoAcimaKm;
  const bruto = Math.min(km, lim) * v + Math.max(0, km - lim) * v * (1 + POR_KM.acrescimoPct / 100);
  return Math.max(min, Math.round(bruto));
}

/* Normaliza o que veio do navegador: só campos conhecidos, tipos certos, tamanhos limitados */
export function normalizarItem(x) {
  const s = (v, n = 160) => String(v == null ? "" : v).trim().slice(0, n);
  return {
    servico: s(x.servico, 40), categoria: s(x.categoria, 10),
    data: s(x.data, 10), hora: s(x.hora, 5), sentido: x.sentido === "saida" ? "saida" : "chegada",
    voo: s(x.voo, 20), origem: s(x.origem), destino: s(x.destino),
    pax: Math.max(1, int(x.pax, 1)), malas: Math.max(0, int(x.malas, 0)),
    cadeirinhas: Math.max(0, int(x.cadeirinhas, 0)), pet: !!x.pet,
    horasExtras: Math.max(0, int(x.horasExtras, 0)), horas: int(x.horas, POR_HORA.minimoHoras),
    dias: Math.max(1, int(x.dias, 1)),
    idaVolta: !!x.idaVolta, de: lugar(x.de), para: lugar(x.para),
  };
}

function antecedencia(svc, cat) {
  return svc.tipo === "viagem" || svc.tipo === "km" ? CONFIG.antecedenciaViagensHoras : CONFIG.antecedenciaHoras[cat];
}

export function modosPagamento(svc, cat) {
  const regra = svc.tipo === "viagem" || svc.tipo === "km" ? CONFIG.pagamentoViagens : CONFIG.pagamento[cat];
  return regra === "escolha" ? ["sinal", "total"] : [regra];
}

/* Cota UM item em UMA categoria. Retorna { ok, valor, linhas, ... } ou { ok:false, erro, consulta? } */
export function cotar(item, agora = Date.now()) {
  const svc = SVC[item.servico];
  if (!svc) return { ok: false, erro: "servico_invalido" };
  const cat = item.categoria, C = CATEGORIAS[cat];
  if (!C) return { ok: false, erro: "categoria_invalida" };
  if (!(cat in svc.precos)) return { ok: false, erro: "categoria_nao_atende" };
  if (svc.precos[cat] == null) return { ok: false, erro: "sob_consulta", consulta: true };
  if (item.pax > C.pax) return { ok: false, erro: "lotacao", max: C.pax };
  if (item.malas > C.malas) return { ok: false, erro: "malas", max: C.malas };

  // data e horário (horário de Foz do Iguaçu)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(item.data) || !/^\d{2}:\d{2}$/.test(item.hora)) return { ok: false, erro: "data_hora" };
  const inicio = Date.parse(item.data + "T" + item.hora + ":00" + CONFIG.fuso);
  if (!Number.isFinite(inicio)) return { ok: false, erro: "data_hora" };
  const minH = antecedencia(svc, cat);
  if (inicio < agora + minH * 3600e3) return { ok: false, erro: "antecedencia", horas: minH };
  if (inicio > agora + CONFIG.maxDiasFuturo * 864e5) return { ok: false, erro: "data_longe" };

  const linhas = [];
  let base;
  if (svc.tipo === "hora") {
    const h = item.horas;
    if (h < POR_HORA.minimoHoras || h > POR_HORA.maximoHoras) return { ok: false, erro: "horas", min: POR_HORA.minimoHoras, max: POR_HORA.maximoHoras };
    base = svc.precos[cat] * h;
    linhas.push({ k: "horas", qtd: h, unit: svc.precos[cat], valor: base });
  } else if (svc.tipo === "diaria") {
    if (item.dias > 15) return { ok: false, erro: "dias", max: 15 };
    base = svc.precos[cat] * item.dias;
    linhas.push({ k: "diarias", qtd: item.dias, unit: svc.precos[cat], valor: base });
  } else if (svc.tipo === "km") {
    // item.rota é preenchida SÓ pelo servidor (worker.js → resolverRota), nunca pelo navegador
    const r = item.rota;
    if (!r || !r.ok) return { ok: false, erro: (r && r.erro) || "rota_falta" };
    const trecho = precoTrechoKm(r.km, cat);
    const n = item.idaVolta ? 2 : 1;
    base = trecho * n;
    linhas.push({ k: "km", qtd: r.km, trechos: n, unit: POR_KM.valorKm[cat], minimo: trecho === POR_KM.minimo[cat], valor: base });
    if (r.fora) linhas.push({ k: "fronteira", qtd: n, unit: POR_KM.fronteiraPorTrecho, valor: POR_KM.fronteiraPorTrecho * n });
  } else {
    base = svc.precos[cat];
    linhas.push({ k: "base", valor: base });
  }

  // horas extras de espera (passeios com espera e diária)
  if (item.horasExtras > 0) {
    if (!(svc.espera || svc.tipo === "diaria")) return { ok: false, erro: "sem_hora_extra" };
    if (item.horasExtras > 8) return { ok: false, erro: "horas_extras", max: 8 };
    const he = HORA_EXTRA[cat];
    if (he == null) return { ok: false, erro: "sob_consulta", consulta: true };
    linhas.push({ k: "hora_extra", qtd: item.horasExtras, unit: he, valor: he * item.horasExtras });
  }

  // cadeirinha
  if (item.cadeirinhas > 0) {
    if (CONFIG.cadeirinha.naoDisponivel.includes(cat)) return { ok: false, erro: "cadeirinha_categoria" };
    if (item.cadeirinhas > 3) return { ok: false, erro: "cadeirinhas", max: 3 };
    linhas.push({ k: "cadeirinha", qtd: item.cadeirinhas, unit: CONFIG.cadeirinha.valor, valor: CONFIG.cadeirinha.valor * item.cadeirinhas });
  }
  // pet
  if (item.pet && CONFIG.pet.consulta.includes(cat)) return { ok: false, erro: "pet_consulta", consulta: true };

  let subtotal = linhas.reduce((a, l) => a + l.valor, 0);
  const especial = ehDataEspecial(item.data);
  if (especial) {
    const acr = Math.round(subtotal * CONFIG.feriadoAcrescimoPct / 100); // arredonda para reais inteiros
    linhas.push({ k: "data_especial", pct: CONFIG.feriadoAcrescimoPct, valor: acr });
    subtotal += acr;
  }
  const valor = centavos(subtotal);
  return {
    ok: true, valor, linhas, dataEspecial: especial, inicio: new Date(inicio).toISOString(),
    modos: modosPagamento(svc, cat), fronteira: svc.tipo === "km" ? !!item.rota.fora : !!svc.fronteira,
    ...(svc.tipo === "km" ? { km: item.rota.km, idaVolta: item.idaVolta } : {}),
  };
}

/* Cota em todas as categorias (para a tela de escolha) */
export function cotarTodas(item, agora) {
  const svc = SVC[item.servico]; if (!svc) return { ok: false, erro: "servico_invalido" };
  const out = {};
  if (svc.tipo === "km" && !(item.rota && item.rota.ok)) return { ok: false, erro: (item.rota && item.rota.erro) || "rota_falta", rota: item.rota || null };
  for (const cat of Object.keys(CATEGORIAS)) {
    if (!(cat in svc.precos)) continue;
    out[cat] = cotar({ ...item, categoria: cat }, agora);
  }
  return { ok: true, categorias: out, ...(svc.tipo === "km" ? { rota: item.rota } : {}) };
}

/* Quanto pagar agora: por item, conforme a regra da categoria e a escolha do cliente */
export function valorAgora(itens, escolha) {
  let total = 0, agora = 0;
  const detalhes = itens.map((it) => {
    const modos = it.cot.modos;
    const modo = modos.includes(escolha) ? escolha : modos[0];
    const due = modo === "total" ? it.cot.valor : Math.round(it.cot.valor * CONFIG.sinalPct / 100);
    total += it.cot.valor; agora += due;
    return { modo, due };
  });
  return { total: centavos(total), agora: centavos(agora), detalhes };
}
