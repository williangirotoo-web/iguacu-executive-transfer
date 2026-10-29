/* Motor de preços: calcula o valor de um serviço SEMPRE no servidor.
   Nunca confia em valor vindo do navegador. */
import { CONFIG, CATEGORIAS, SERVICOS, HORA_EXTRA, POR_HORA, datasEspeciais } from "./precos.js";

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
  };
}

function antecedencia(svc, cat) {
  return svc.tipo === "viagem" ? CONFIG.antecedenciaViagensHoras : CONFIG.antecedenciaHoras[cat];
}

export function modosPagamento(svc, cat) {
  const regra = svc.tipo === "viagem" ? CONFIG.pagamentoViagens : CONFIG.pagamento[cat];
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
    modos: modosPagamento(svc, cat), fronteira: !!svc.fronteira,
  };
}

/* Cota em todas as categorias (para a tela de escolha) */
export function cotarTodas(item, agora) {
  const svc = SVC[item.servico]; if (!svc) return { ok: false, erro: "servico_invalido" };
  const out = {};
  for (const cat of Object.keys(CATEGORIAS)) {
    if (!(cat in svc.precos)) continue;
    out[cat] = cotar({ ...item, categoria: cat }, agora);
  }
  return { ok: true, categorias: out };
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
