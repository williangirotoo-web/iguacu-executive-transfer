// node --test tests/*.test.mjs  (testes das regras de papel da plataforma; não tocam no banco real)
import test from "node:test";
import assert from "node:assert/strict";
import { papelDe, pode, permissoes } from "../src/acesso.js";

const banco = (linhas, quebra = false) => ({ prepare: () => ({ bind: (e) => ({ first: async () => { if (quebra) throw new Error("no such table: usuarios"); return linhas[e] || null; } }) }) });

test("sem tabela: quem está em ADMIN_EMAILS é Super Admin", async () => {
  const env = { DB: banco({}, true), ADMIN_EMAILS: "a@x.com, B@x.com" };
  assert.equal(await papelDe(env, "b@x.com"), "super_admin");
  assert.equal(await papelDe(env, "c@x.com"), null);
});
test("linha na tabela define o papel", async () => {
  const env = { DB: banco({ "a@x.com": { papel: "operacional", ativo: 1 } }), ADMIN_EMAILS: "a@x.com" };
  assert.equal(await papelDe(env, "A@x.com"), "operacional");
});
test("ativo = 0 bloqueia mesmo em ADMIN_EMAILS", async () => {
  const env = { DB: banco({ "a@x.com": { papel: "super_admin", ativo: 0 } }), ADMIN_EMAILS: "a@x.com" };
  assert.equal(await papelDe(env, "a@x.com"), null);
});
test("papel desconhecido na tabela não dá acesso", async () => {
  const env = { DB: banco({ "a@x.com": { papel: "dono", ativo: 1 } }) };
  assert.equal(await papelDe(env, "a@x.com"), null);
});
test("ambiente local de teste", async () => {
  assert.equal(await papelDe({ DB: banco({}, true), DEV_ADMIN: "1" }, "dev@local"), "super_admin");
  assert.equal(await papelDe({ DB: banco({}, true) }, "dev@local"), null);
});
test("operacional não vê valores nem financeiro", () => {
  assert.equal(pode("operacional", "ops.editar"), true);
  assert.equal(pode("operacional", "valores.ver"), false);
  assert.equal(pode("operacional", "financeiro.ver"), false);
  assert.equal(pode("supervisor", "reservas.editar"), false);
  assert.equal(pode("financeiro", "ops.editar"), false);
  assert.equal(pode("admin", "usuarios.gerir"), false);
  assert.equal(pode("super_admin", "usuarios.gerir"), true);
  assert.equal(pode("ninguem", "ops.ver"), false);
  assert.deepEqual(permissoes("x"), []);
});
