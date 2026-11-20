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
