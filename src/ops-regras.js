/* Plataforma de gestão — regras puras da operação (sem banco, fáceis de testar).
   Usadas pela sincronização de serviços e, no pacote 2, pela checagem de conflito. */
import { CATEGORIAS, DIARIA } from "./precos.js";

export const STATUS_SERVICO = ["a_atribuir", "oferecido", "atribuido", "confirmado", "a_caminho", "no_local", "embarcado",
  "no_atrativo", "na_aduana", "concluido", "no_show", "cancelado"];
export const STATUS_FINAIS = ["concluido", "no_show", "cancelado"];
// pedidos que geram serviço: pago ou confirmado (solicitação e aguardando pagamento ainda não)
export const PEDIDO_GERA_SERVICO = ["aprovado", "aguardando_confirmacao", "confirmada", "concluida"];

// tempo de ida de Foz até cada cidade, em minutos (mesma base das páginas de cidade)
const IDA_MIN = { medianeira: 48, cascavel: 110, toledo: 134, "marechal-rondon": 158, palotina: 183, guaira: 203, umuarama: 239,
  "campo-mourao": 241, "francisco-beltrao": 223, "pato-branco": 273, maringa: 316, londrina: 395, curitiba: 479, chapeco: 390,
  "sao-paulo": 773, posadas: 300, assuncao: 360, "buenos-aires": 1000, "salto-del-guaira": 240 };

/* Quanto tempo o serviço ocupa o motorista e o carro, em minutos, contando do horário de busca.
   É uma estimativa padrão; a tabela duracoes (editável) sobrepõe por serviço. */
export function duracaoPadrao(svc, item = {}) {
  if (!svc) return 120;
  const extras = Math.max(0, Number(item.horas_extras) || 0) * 60;
  switch (svc.tipo) {
    case "transfer": return svc.fronteira ? 150 : 90;
    case "passeio": return (svc.espera ? svc.espera * 60 + 60 : 180) + extras;
    case "hora": return Math.max(1, Number(item.horas) || 5) * 60;
    case "diaria": return Math.max(1, Number(item.dias) || 1) * DIARIA.horas * 60;
    case "viagem": { const ida = IDA_MIN[svc.id]; return ida ? Math.round(ida * 2 * 1.15 + 60) : 720; }
    default: return 180;
  }
}

export function fimPrevisto(inicioIso, minutos) {
  return new Date(Date.parse(inicioIso) + minutos * 60e3).toISOString();
}

/* Status do serviço quando ele nasce na sincronização. */
export function statusInicial(pedidoStatus, inicioIso, agora = Date.now(), corridaAceita = false) {
  if (pedidoStatus === "cancelada") return "cancelado";
  if (pedidoStatus === "concluida" || Date.parse(inicioIso) < agora - 6 * 3600e3) return "concluido";
  return corridaAceita ? "atribuido" : "a_atribuir";
}

const t = (v, n) => String(v == null ? "" : v).replace(/\s+/g, " ").trim().slice(0, n);
const data = (v) => { const s = t(v, 10); return s && /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : s ? undefined : null; };
const valor = (v) => { if (v === "" || v == null) return null; const n = Number(String(v).replace(/[R$\s]/g, "").replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", ".")); return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : undefined; };
const IDIOMAS = ["pt", "es", "en", "fr", "it", "de"];

export function normalizarPlaca(p) { return String(p || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8); }

/* Cadastro de motorista. Devolve { ok, dados } ou { erro }. Nunca guarda número de CNH ou CPF. */
export function validarMotorista(b) {
  b = b || {};
  const d = { nome: t(b.nome, 120), telefone: t(b.telefone, 40), email: t(b.email, 160).toLowerCase() || null, obs: t(b.obs, 500) || null };
  if (d.nome.length < 2) return { erro: "nome" };
  if (d.telefone.replace(/\D/g, "").length < 8) return { erro: "telefone" };
  if (d.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email)) return { erro: "email" };
  const idi = (Array.isArray(b.idiomas) ? b.idiomas : String(b.idiomas || "pt").split(",")).map((x) => t(x, 5).toLowerCase()).filter((x) => IDIOMAS.includes(x));
  d.idiomas = [...new Set(idi.length ? idi : ["pt"])].join(",");
  d.tipo = b.tipo === "parceiro" ? "parceiro" : "proprio";
  d.parceiro_id = d.tipo === "parceiro" && Number(b.parceiro_id) > 0 ? Number(b.parceiro_id) : null;
  d.status = ["ativo", "folga", "inativo"].includes(b.status) ? b.status : "ativo";
  d.pagamento_modelo = ["diaria", "servico", "ambos"].includes(b.pagamento_modelo) ? b.pagamento_modelo : "servico";
  d.cnh_validade = data(b.cnh_validade); if (d.cnh_validade === undefined) return { erro: "cnh_validade" };
  d.valor_diaria = valor(b.valor_diaria); if (d.valor_diaria === undefined) return { erro: "valor_diaria" };
  d.valor_servico = valor(b.valor_servico); if (d.valor_servico === undefined) return { erro: "valor_servico" };
  return { ok: true, dados: d };
}

export function validarVeiculo(b) {
  b = b || {};
  const placa = normalizarPlaca(b.placa);
  if (!/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(placa) && !/^[A-Z0-9]{5,8}$/.test(placa)) return { erro: "placa" };
  const d = { placa, marca: t(b.marca, 40) || null, modelo: t(b.modelo, 60), cor: t(b.cor, 30) || null, obs: t(b.obs, 500) || null };
  if (!d.modelo) return { erro: "modelo" };
  if (!CATEGORIAS[b.categoria]) return { erro: "categoria" };
  d.categoria = b.categoria;
  const ano = parseInt(b.ano, 10); d.ano = Number.isFinite(ano) && ano >= 1990 && ano <= 2100 ? ano : null;
  const lug = parseInt(b.lugares, 10); d.lugares = Number.isFinite(lug) && lug >= 1 && lug <= 60 ? lug : (CATEGORIAS[b.categoria].pax || 4);
  const ml = parseInt(b.malas, 10); d.malas = Number.isFinite(ml) && ml >= 0 && ml <= 40 ? ml : (CATEGORIAS[b.categoria].malas || 3);
  d.dono = ["iet", "parceiro", "alugado"].includes(b.dono) ? b.dono : "iet";
  d.parceiro_id = d.dono === "parceiro" && Number(b.parceiro_id) > 0 ? Number(b.parceiro_id) : null;
  d.motorista_padrao_id = Number(b.motorista_padrao_id) > 0 ? Number(b.motorista_padrao_id) : null;
  d.status = ["ativo", "oficina", "inativo"].includes(b.status) ? b.status : "ativo";
  d.licenciamento_validade = data(b.licenciamento_validade); if (d.licenciamento_validade === undefined) return { erro: "licenciamento_validade" };
  d.seguro_validade = data(b.seguro_validade); if (d.seguro_validade === undefined) return { erro: "seguro_validade" };
  return { ok: true, dados: d };
}

/* ---------------- pacote 2: conflito, compatibilidade e sugestões ----------------
   Tudo aqui é cálculo puro: recebe os dados já lidos do banco e devolve a resposta. */
export const DESLOCAMENTO_MIN = 30; // tempo para o motorista chegar ao ponto de busca, antes do horário

// período em que o serviço prende motorista e carro: do deslocamento até o fim previsto
export function ocupacao(s) {
  return { ini: Date.parse(s.inicio_utc) - DESLOCAMENTO_MIN * 60e3, fim: Date.parse(s.fim_previsto_utc) };
}
export function sobrepoe(a, b) { const x = ocupacao(a), y = ocupacao(b); return x.ini < y.fim && y.ini < x.fim; }

const hhmm = (iso) => new Date(Date.parse(iso) - 3 * 3600e3).toISOString().slice(11, 16);
const ddmm = (iso) => { const d = new Date(Date.parse(iso) - 3 * 3600e3).toISOString(); return d.slice(8, 10) + "/" + d.slice(5, 7); };

/* Confere se motorista e/ou veículo podem fazer o serviço.
   ctx = { servico, motorista, veiculo, outros (serviços ativos do mesmo período), indisp (indisponibilidades) }
   Devolve lista de problemas: { bloqueia, texto }. bloqueia = só passa com "atribuir mesmo assim" e motivo. */
export function checarAtribuicao(ctx) {
  const { servico: s, motorista: m, veiculo: v } = ctx, probs = [];
  const dataServ = s.inicio_utc.slice(0, 10);
  if (m) {
    if (m.status === "inativo") probs.push({ bloqueia: true, texto: `${m.nome} está inativo.` });
    if (m.status === "folga") probs.push({ bloqueia: true, texto: `${m.nome} está de folga.` });
    if (m.cnh_validade && m.cnh_validade < dataServ) probs.push({ bloqueia: true, texto: `A CNH de ${m.nome} vence antes do serviço (${m.cnh_validade.split("-").reverse().join("/")}).` });
    for (const o of ctx.outros || []) if (o.id !== s.id && o.motorista_id === m.id && sobrepoe(s, o))
      probs.push({ bloqueia: true, texto: `${m.nome} já tem ${o.servico_nome} às ${hhmm(o.inicio_utc)} de ${ddmm(o.inicio_utc)} (ocupado até ${hhmm(o.fim_previsto_utc)}).` });
    for (const i of ctx.indisp || []) if (i.motorista_id === m.id && Date.parse(i.inicio) < ocupacao(s).fim && ocupacao(s).ini < Date.parse(i.fim))
      probs.push({ bloqueia: true, texto: `${m.nome} está indisponível nesse horário${i.motivo ? " (" + i.motivo + ")" : ""}.` });
  }
  if (v) {
    if (v.status !== "ativo") probs.push({ bloqueia: true, texto: `O carro ${v.placa} está ${v.status === "oficina" ? "na oficina" : "inativo"}.` });
    if (v.lugares < s.pax) probs.push({ bloqueia: true, texto: `${v.modelo} leva ${v.lugares} pessoas e o grupo tem ${s.pax}.` });
    const malas = (s.malas || 0);
    if (malas > v.malas) probs.push({ bloqueia: false, texto: `${malas} malas grandes para um carro de ${v.malas}. Confira o espaço.` });
    if (s.cadeirinhas > 0 && v.categoria === "comum") probs.push({ bloqueia: true, texto: "Cadeirinha não é oferecida na categoria Comum." });
    if (v.categoria !== s.categoria) probs.push({ bloqueia: false, texto: `O cliente comprou ${s.categoria} e o carro é ${v.categoria}.` });
    if (v.licenciamento_validade && v.licenciamento_validade < dataServ) probs.push({ bloqueia: true, texto: `O licenciamento de ${v.placa} vence antes do serviço.` });
    if (v.seguro_validade && v.seguro_validade < dataServ) probs.push({ bloqueia: true, texto: `O seguro de ${v.placa} vence antes do serviço.` });
    for (const o of ctx.outros || []) if (o.id !== s.id && o.veiculo_id === v.id && sobrepoe(s, o))
      probs.push({ bloqueia: true, texto: `O carro ${v.placa} já está em ${o.servico_nome} às ${hhmm(o.inicio_utc)} de ${ddmm(o.inicio_utc)}.` });
    for (const i of ctx.indisp || []) if (i.veiculo_id === v.id && Date.parse(i.inicio) < ocupacao(s).fim && ocupacao(s).ini < Date.parse(i.fim))
      probs.push({ bloqueia: true, texto: `O carro ${v.placa} está indisponível nesse horário${i.motivo ? " (" + i.motivo + ")" : ""}.` });
  }
  return probs;
}

/* Ordena motoristas para um serviço: livre > carro compatível > fala o idioma > menos serviços no dia. */
export function sugerir(ctx) {
  const { servico: s, motoristas, veiculos } = ctx, dia = s.inicio_utc.slice(0, 10);
  return motoristas.filter((m) => m.status !== "inativo").map((m) => {
    const carros = veiculos.filter((v) => v.status === "ativo" && (v.motorista_padrao_id === m.id || (!v.motorista_padrao_id && v.dono === "iet")));
    const carro = carros.find((v) => v.motorista_padrao_id === m.id && v.lugares >= s.pax && !(s.cadeirinhas > 0 && v.categoria === "comum"))
      || carros.find((v) => v.lugares >= s.pax && v.categoria === s.categoria) || carros.find((v) => v.lugares >= s.pax) || null;
    const probs = checarAtribuicao({ ...ctx, motorista: m, veiculo: carro });
    const idiomaOk = !s.idioma || s.idioma === "pt" || String(m.idiomas || "").split(",").includes(s.idioma);
    const carga = (ctx.outros || []).filter((o) => o.motorista_id === m.id && o.inicio_utc.slice(0, 10) === dia).length;
    const pontos = (probs.some((p) => p.bloqueia) ? 0 : 1000) + (carro ? 100 : 0) + (idiomaOk ? 30 : 0) - carga * 5;
    const bons = [];
    if (!probs.some((p) => p.bloqueia)) bons.push("Livre no horário");
    if (carro) bons.push(`${carro.modelo} ${carro.placa} · ${carro.lugares} lugares`);
    if (idiomaOk && s.idioma && s.idioma !== "pt") bons.push(`Fala ${s.idioma.toUpperCase()}`);
    if (!idiomaOk) probs.push({ bloqueia: false, texto: `Não fala ${String(s.idioma).toUpperCase()}.` });
    bons.push(carga ? `${carga} serviço(s) no dia` : "Nenhum outro serviço no dia");
    return { motorista_id: m.id, nome: m.nome, veiculo_id: carro ? carro.id : null, pontos, bons, problemas: probs };
  }).sort((a, b) => b.pontos - a.pontos);
}

/* Alertas da tela Hoje. dados = { servicos (próximos 7 dias + hoje), pedidosSaldo, motoristas, veiculos }, agora em ms. */
export function alertas(dados, agora = Date.now()) {
  const out = [], H = 3600e3;
  const ativos = dados.servicos.filter((s) => !STATUS_FINAIS.includes(s.status));
  for (const s of ativos) {
    const falta = Date.parse(s.inicio_utc) - agora, quando = `${hhmm(s.inicio_utc)} de ${ddmm(s.inicio_utc)}`;
    if ((s.status === "a_atribuir" || s.status === "oferecido") && falta < 48 * H && falta > -H)
      out.push({ sev: falta < 12 * H ? "r" : "a", tipo: "sem_executor", servico_id: s.id, titulo: `${s.servico_nome}, ${quando}`, texto: `${s.status === "oferecido" ? "Oferecido, sem resposta" : "Sem motorista"} · ${s.cliente}, ${s.pax} pessoa(s)`, acao: "atribuir" });
    if (s.status === "atribuido" && falta < 12 * H && falta > 0)
      out.push({ sev: "a", tipo: "nao_confirmou", servico_id: s.id, titulo: `${s.motorista_nome || s.parceiro_nome || "Executor"} ainda não confirmou`, texto: `${s.servico_nome}, ${quando} · ${s.cliente}`, acao: "confirmar" });
    if (falta < -30 * 60e3 && ["atribuido", "confirmado"].includes(s.status) && falta > -24 * H)
      out.push({ sev: "a", tipo: "parado", servico_id: s.id, titulo: `Horário passou e o serviço não andou`, texto: `${s.servico_nome}, ${quando} · ${s.motorista_nome || s.parceiro_nome || "sem executor"}`, acao: "status" });
    if (falta > 0 && falta < 7 * 24 * H) {
      const svcCat = servico_temVoo(s);
      if (svcCat && s.sentido === "chegada" && !s.voo) out.push({ sev: "i", tipo: "sem_voo", servico_id: s.id, titulo: `Chegada sem número do voo, ${quando}`, texto: `${s.codigo} · ${s.cliente}`, acao: "whatsapp" });
      if (!s.origem && !s.destino) out.push({ sev: "i", tipo: "sem_endereco", servico_id: s.id, titulo: `Sem endereço de busca, ${quando}`, texto: `${s.codigo} · ${s.cliente}`, acao: "whatsapp" });
    }
  }
  // conflitos já gravados (atribuições forçadas ou mudança de horário depois de atribuir)
  const vistos = new Set();
  for (const a of ativos) for (const b of ativos) {
    if (a.id >= b.id) continue;
    const mesmo = (a.motorista_id && a.motorista_id === b.motorista_id) || (a.veiculo_id && a.veiculo_id === b.veiculo_id);
    if (mesmo && sobrepoe(a, b) && !vistos.has(a.id + "-" + b.id) && Date.parse(b.inicio_utc) > agora - H) {
      vistos.add(a.id + "-" + b.id);
      out.push({ sev: "r", tipo: "conflito", servico_id: b.id, titulo: `Conflito de agenda${a.motorista_nome ? " de " + a.motorista_nome : ""}`, texto: `${a.servico_nome} às ${hhmm(a.inicio_utc)} e ${b.servico_nome} às ${hhmm(b.inicio_utc)} de ${ddmm(b.inicio_utc)}`, acao: "atribuir" });
    }
  }
  for (const p of dados.pedidosSaldo || []) {
    const falta = Date.parse(p.primeiro) - agora;
    if (falta > -H && falta < 48 * H) out.push({ sev: p.modo_pagamento === "sinal" ? "i" : "a", tipo: "saldo", pedido: p.codigo, titulo: p.modo_pagamento === "sinal" ? `Receber R$ ${fmt(p.saldo)} no dia` : `Saldo de R$ ${fmt(p.saldo)} em aberto`, texto: `${p.codigo} · ${p.nome} · viagem ${hhmm(p.primeiro)} de ${ddmm(p.primeiro)}`, acao: "pedido" });
  }
  const em30 = new Date(agora + 30 * 864e5).toISOString().slice(0, 10), hoje = new Date(agora - 3 * H).toISOString().slice(0, 10);
  for (const m of dados.motoristas || []) if (m.status !== "inativo" && m.cnh_validade && m.cnh_validade <= em30)
    out.push({ sev: m.cnh_validade < hoje ? "r" : "i", tipo: "documento", titulo: `CNH de ${m.nome} ${m.cnh_validade < hoje ? "vencida" : "vence em " + m.cnh_validade.split("-").reverse().join("/")}`, texto: "Atualize no cadastro da equipe", acao: "equipe" });
  for (const v of dados.veiculos || []) if (v.status !== "inativo") for (const [k, nome] of [["licenciamento_validade", "Licenciamento"], ["seguro_validade", "Seguro"]])
    if (v[k] && v[k] <= em30) out.push({ sev: v[k] < hoje ? "r" : "i", tipo: "documento", titulo: `${nome} de ${v.placa} ${v[k] < hoje ? "vencido" : "vence em " + v[k].split("-").reverse().join("/")}`, texto: `${v.modelo}`, acao: "equipe" });
  const ordem = { r: 0, a: 1, i: 2 };
  return out.sort((a, b) => ordem[a.sev] - ordem[b.sev]);
}
const fmt = (v) => Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
function servico_temVoo(s) { return s.servico_id && /^(igu|igr)-/.test(s.servico_id); }
