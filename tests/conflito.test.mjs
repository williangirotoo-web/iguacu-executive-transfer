// node --test tests/*.test.mjs  (pacote 2: conflito, sugestões e alertas)
import test from "node:test";
import assert from "node:assert/strict";
import { checarAtribuicao, sugerir, alertas, sobrepoe } from "../src/ops-regras.js";

const S = (id, ini, fim, extra = {}) => ({ id, inicio_utc: ini, fim_previsto_utc: fim, servico_nome: "Serviço " + id, pax: 2, malas: 0, cadeirinhas: 0, categoria: "exec", status: "atribuido", ...extra });
const m1 = { id: 1, nome: "Marcos", status: "ativo", idiomas: "pt", cnh_validade: "2030-01-01" };
const v1 = { id: 10, placa: "ABC1D23", modelo: "Corolla", lugares: 4, malas: 3, categoria: "exec", status: "ativo", motorista_padrao_id: 1 };
const v7 = { id: 11, placa: "BRA2E19", modelo: "Spin", lugares: 6, malas: 5, categoria: "sete", status: "ativo", motorista_padrao_id: null, dono: "iet" };

test("sobreposição conta 30 min de deslocamento", () => {
  const a = S(1, "2027-01-04T16:30:00.000Z", "2027-01-04T18:00:00.000Z");   // 13:30–15:00
  const b = S(2, "2027-01-04T18:20:00.000Z", "2027-01-04T19:50:00.000Z");   // 15:20 (precisa sair 14:50)
  const c = S(3, "2027-01-04T18:40:00.000Z", "2027-01-04T20:00:00.000Z");   // 15:40 (sai 15:10)
  assert.equal(sobrepoe(a, b), true);
  assert.equal(sobrepoe(a, c), false);
});
test("conflito de agenda e capacidade bloqueiam", () => {
  const novo = S(2, "2027-01-04T17:30:00.000Z", "2027-01-04T19:00:00.000Z", { pax: 6, status: "a_atribuir" });
  const outro = S(1, "2027-01-04T16:30:00.000Z", "2027-01-04T18:00:00.000Z", { motorista_id: 1, veiculo_id: 10 });
  const p = checarAtribuicao({ servico: novo, motorista: m1, veiculo: v1, outros: [outro], indisp: [] });
  assert.ok(p.some((x) => x.bloqueia && /já tem/.test(x.texto)));
  assert.ok(p.some((x) => x.bloqueia && /leva 4 pessoas/.test(x.texto)));
  assert.ok(p.some((x) => x.bloqueia && /ABC1D23 já está/.test(x.texto)));
});
test("folga, CNH vencida, cadeirinha em Comum e indisponibilidade", () => {
  const s = S(5, "2027-01-04T12:00:00.000Z", "2027-01-04T13:30:00.000Z", { cadeirinhas: 1 });
  const comum = { ...v1, categoria: "comum" };
  const p = checarAtribuicao({ servico: s, motorista: { ...m1, status: "folga", cnh_validade: "2026-12-31" }, veiculo: comum, outros: [], indisp: [{ motorista_id: 1, inicio: "2027-01-04T00:00:00Z", fim: "2027-01-05T00:00:00Z", motivo: "férias" }] });
  assert.ok(p.some((x) => /de folga/.test(x.texto)));
  assert.ok(p.some((x) => /CNH/.test(x.texto)));
  assert.ok(p.some((x) => /Cadeirinha/.test(x.texto)));
  assert.ok(p.some((x) => /férias/.test(x.texto)));
});
test("categoria diferente e malas são só aviso", () => {
  const s = S(6, "2027-01-04T12:00:00.000Z", "2027-01-04T13:30:00.000Z", { malas: 4, categoria: "comum" });
  const p = checarAtribuicao({ servico: s, motorista: m1, veiculo: v1, outros: [], indisp: [] });
  assert.ok(p.length >= 2 && p.every((x) => !x.bloqueia));
});
test("sugestões: livre e com carro primeiro", () => {
  const novo = S(9, "2027-01-04T17:00:00.000Z", "2027-01-04T22:00:00.000Z", { pax: 6, categoria: "sete", idioma: "es", status: "a_atribuir" });
  const ocupado = S(1, "2027-01-04T16:30:00.000Z", "2027-01-04T18:00:00.000Z", { motorista_id: 1 });
  const m2 = { id: 2, nome: "Diego", status: "ativo", idiomas: "pt,es" };
  const r = sugerir({ servico: novo, outros: [ocupado], indisp: [], motoristas: [m1, m2], veiculos: [v1, v7] });
  assert.equal(r[0].nome, "Diego");
  assert.equal(r[0].veiculo_id, 11);
  assert.ok(r[0].bons.some((b) => /ES/.test(b)));
});
test("alertas: sem motorista, conflito, saldo, documento", () => {
  const agora = Date.parse("2027-01-04T10:00:00.000Z");
  const servicos = [
    S(1, "2027-01-04T14:00:00.000Z", "2027-01-04T15:30:00.000Z", { status: "a_atribuir", cliente: "Ana" }),
    S(2, "2027-01-04T16:30:00.000Z", "2027-01-04T18:00:00.000Z", { motorista_id: 1, motorista_nome: "Marcos", cliente: "B" }),
    S(3, "2027-01-04T17:30:00.000Z", "2027-01-04T19:00:00.000Z", { motorista_id: 1, motorista_nome: "Marcos", cliente: "C" }),
  ];
  const a = alertas({ servicos, pedidosSaldo: [{ codigo: "IET-X", nome: "Ana", saldo: 650, modo_pagamento: "total", primeiro: "2027-01-05T08:00:00.000Z" }],
    motoristas: [{ ...m1, cnh_validade: "2027-01-20" }], veiculos: [] }, agora);
  const tipos = a.map((x) => x.tipo);
  assert.ok(tipos.includes("sem_executor") && tipos.includes("conflito") && tipos.includes("saldo") && tipos.includes("documento"));
  assert.equal(a[0].sev, "r");
});
