// node --test tests/*.test.mjs  (regras da reserva manual; não toca no banco)
import test from "node:test";
import assert from "node:assert/strict";
import { validarReservaManual } from "../src/ops.js";

const base = () => ({ cliente: { nome: "Cliente Teste", telefone: "+55 45 99999-0000" }, origem: "whatsapp",
  itens: [{ servico: "igu-igr", categoria: "comum", data: "2027-01-04", hora: "05:00", sentido: "chegada", pax: 3, mochilas: 3, valor: "400,00" },
          { servico: "igu-igr", categoria: "comum", data: "2027-01-06", hora: "09:30", sentido: "saida", pax: 3, mochilas: 3, valor: "400" }],
  pagamento: { valor: "800,00", metodo: "link_infinitepay", data: "2026-11-17", recibo: "https://recibo.infinitepay.io/x" } });

test("reserva válida: total, horário em UTC e pagamento", () => {
  const v = validarReservaManual(base());
  assert.equal(v.ok, true);
  assert.equal(v.total, 800);
  assert.equal(v.itens[0].inicio_utc, "2027-01-04T08:00:00.000Z");
  assert.equal(v.itens[1].sentido, "saida");
  assert.equal(v.pagamento.valor, 800);
  assert.equal(v.status, "confirmada");
});
test("valores no formato brasileiro", () => {
  const b = base(); b.itens = [{ ...b.itens[0], valor: "1.150,50" }]; b.pagamento = null;
  assert.equal(validarReservaManual(b).total, 1150.5);
});
test("erros de preenchimento", () => {
  let b = base(); b.cliente.nome = ""; assert.equal(validarReservaManual(b).erro, "nome");
  b = base(); b.cliente.telefone = "12"; assert.equal(validarReservaManual(b).erro, "telefone");
  b = base(); b.codigo = "ABC"; assert.equal(validarReservaManual(b).erro, "codigo");
  b = base(); b.itens[1].servico = "nao-existe"; assert.deepEqual(validarReservaManual(b), { erro: "servico", item: 1 });
  b = base(); b.itens[0].categoria = "x"; assert.equal(validarReservaManual(b).erro, "categoria");
  b = base(); b.itens[0].data = "04/01/2027"; assert.equal(validarReservaManual(b).erro, "data_hora");
  b = base(); b.pagamento.valor = "900"; assert.equal(validarReservaManual(b).erro, "pagamento_maior_que_total");
  b = base(); b.pagamento.recibo = "javascript:alert(1)"; assert.equal(validarReservaManual(b).erro, "pagamento_recibo");
  b = base(); b.itens = []; assert.equal(validarReservaManual(b).erro, "itens");
  b = base(); b.itens[0].servico = "combo-pi"; assert.equal(validarReservaManual(b).erro, "servico");
});
test("código informado é aceito no formato certo", () => {
  const b = base(); b.codigo = "iet-ac0401";
  assert.equal(validarReservaManual(b).codigo, "IET-AC0401");
});
