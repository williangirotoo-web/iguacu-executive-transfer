// node --test tests/*.test.mjs  (pacote 3: etapas do motorista)
import test from "node:test";
import assert from "node:assert/strict";
import { fluxoServico, etapaPermitida, mostrarContato } from "../src/ops-regras.js";
import { servico } from "../src/cotacao.js";
const ids = (f) => f.map((e) => e[0]);

test("etapas por tipo de serviço", () => {
  assert.deepEqual(ids(fluxoServico(servico("igu-foz"), { sentido: "chegada" })), ["confirmado", "no_local", "embarcado", "concluido"]);
  assert.deepEqual(ids(fluxoServico(servico("igu-foz"), { sentido: "saida" })), ["confirmado", "a_caminho", "no_local", "embarcado", "concluido"]);
  assert.deepEqual(ids(fluxoServico(servico("igu-igr"), { sentido: "saida" })), ["confirmado", "a_caminho", "no_local", "embarcado", "na_aduana", "concluido"]);
  assert.deepEqual(ids(fluxoServico(servico("ar-iv"), {})), ["confirmado", "a_caminho", "no_local", "embarcado", "na_aduana", "no_atrativo", "concluido"]);
  assert.deepEqual(ids(fluxoServico(servico("itaipu"), {})), ["confirmado", "a_caminho", "no_local", "embarcado", "no_atrativo", "concluido"]);
});
test("só avança, pode pular, nunca volta", () => {
  const f = fluxoServico(servico("igu-foz"), { sentido: "saida" });
  assert.equal(etapaPermitida(f, "atribuido", "confirmado"), true);
  assert.equal(etapaPermitida(f, "confirmado", "embarcado"), true);
  assert.equal(etapaPermitida(f, "embarcado", "a_caminho"), false);
  assert.equal(etapaPermitida(f, "embarcado", "embarcado"), false);
  assert.equal(etapaPermitida(f, "a_atribuir", "confirmado"), false);
  assert.equal(etapaPermitida(f, "embarcado", "na_aduana"), false); // não faz parte deste serviço
});
test("contato do cliente só perto do serviço", () => {
  const s = { inicio_utc: "2027-01-04T08:00:00.000Z", fim_previsto_utc: "2027-01-04T09:30:00.000Z" };
  assert.equal(mostrarContato(s, Date.parse("2027-01-02T08:00:00Z")), false);
  assert.equal(mostrarContato(s, Date.parse("2027-01-03T12:00:00Z")), true);
  assert.equal(mostrarContato(s, Date.parse("2027-01-06T12:00:00Z")), false);
});
