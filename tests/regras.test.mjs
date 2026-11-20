// node --test tests/*.test.mjs  (regras da operação: duração, status inicial, cadastros)
import test from "node:test";
import assert from "node:assert/strict";
import { duracaoPadrao, fimPrevisto, statusInicial, validarMotorista, validarVeiculo, normalizarPlaca } from "../src/ops-regras.js";
import { servico } from "../src/cotacao.js";

test("duração padrão por tipo de serviço", () => {
  assert.equal(duracaoPadrao(servico("igu-foz")), 90);
  assert.equal(duracaoPadrao(servico("igu-igr")), 150);          // cruza a fronteira
  assert.equal(duracaoPadrao(servico("ar-completo")), 660);      // 10 h de espera + 1 h
  assert.equal(duracaoPadrao(servico("por-hora"), { horas: 6 }), 360);
  assert.equal(duracaoPadrao(servico("diaria"), { dias: 2 }), 1200);
  assert.equal(duracaoPadrao(servico("cascavel")), Math.round(110 * 2 * 1.15 + 60));
  assert.equal(fimPrevisto("2027-01-04T08:00:00.000Z", 150), "2027-01-04T10:30:00.000Z");
});
test("status inicial do serviço", () => {
  const agora = Date.parse("2026-11-20T12:00:00Z");
  assert.equal(statusInicial("confirmada", "2027-01-04T08:00:00.000Z", agora), "a_atribuir");
  assert.equal(statusInicial("aprovado", "2027-01-04T08:00:00.000Z", agora, true), "atribuido");
  assert.equal(statusInicial("aprovado", "2026-10-01T08:00:00.000Z", agora), "concluido");
  assert.equal(statusInicial("concluida", "2027-01-04T08:00:00.000Z", agora), "concluido");
  assert.equal(statusInicial("cancelada", "2027-01-04T08:00:00.000Z", agora), "cancelado");
});
test("cadastro de motorista", () => {
  const ok = validarMotorista({ nome: "João Silva", telefone: "(45) 99999-0000", idiomas: ["pt", "es", "xx"], pagamento_modelo: "ambos", valor_diaria: "250,00", cnh_validade: "2028-05-10" });
  assert.equal(ok.ok, true);
  assert.equal(ok.dados.idiomas, "pt,es");
  assert.equal(ok.dados.valor_diaria, 250);
  assert.equal(ok.dados.tipo, "proprio");
  assert.equal(validarMotorista({ nome: "A", telefone: "45999990000" }).erro, "nome");
  assert.equal(validarMotorista({ nome: "Ana", telefone: "12" }).erro, "telefone");
  assert.equal(validarMotorista({ nome: "Ana", telefone: "45999990000", cnh_validade: "10/05/2028" }).erro, "cnh_validade");
});
test("cadastro de veículo", () => {
  assert.equal(normalizarPlaca("abc-1d23"), "ABC1D23");
  const ok = validarVeiculo({ placa: "abc-1d23", modelo: "Corolla Cross", categoria: "suv" });
  assert.equal(ok.ok, true);
  assert.ok(ok.dados.lugares >= 4);
  assert.equal(validarVeiculo({ placa: "x", modelo: "Spin", categoria: "sete" }).erro, "placa");
  assert.equal(validarVeiculo({ placa: "ABC1234", modelo: "Spin", categoria: "nao" }).erro, "categoria");
  assert.equal(validarVeiculo({ placa: "ABC1234", modelo: "", categoria: "sete" }).erro, "modelo");
});
