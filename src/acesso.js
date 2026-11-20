/* Plataforma de gestão — papéis e permissões da equipe interna (Fase 0).
   O login continua sendo do Cloudflare Access (verificarAccess no worker.js).
   Aqui só decidimos O QUE cada pessoa pode fazer, sempre no servidor. */

export const PAPEIS = ["super_admin", "admin", "operacional", "financeiro", "supervisor"];

// Permissões usadas pelos módulos das próximas fases.
// valores.ver = enxergar custo, repasse e margem (o operacional não vê).
const P = {
  super_admin: ["ops.ver", "ops.editar", "reservas.editar", "valores.ver", "financeiro.ver", "financeiro.editar", "cadastros.editar", "usuarios.gerir", "config.gerir"],
  admin: ["ops.ver", "ops.editar", "reservas.editar", "valores.ver", "financeiro.ver", "financeiro.editar", "cadastros.editar"],
  operacional: ["ops.ver", "ops.editar", "reservas.editar", "cadastros.editar"],
  financeiro: ["ops.ver", "valores.ver", "financeiro.ver", "financeiro.editar"],
  supervisor: ["ops.ver", "ops.editar"],
};

export function permissoes(papel) { return P[papel] ? P[papel].slice() : []; }
export function pode(papel, permissao) { return !!P[papel] && P[papel].includes(permissao); }

function listaAdmins(env) {
  return String(env.ADMIN_EMAILS || "").toLowerCase().split(",").map((x) => x.trim()).filter(Boolean);
}

/* Papel de quem entrou pelo Access.
   1) Linha na tabela usuarios: vale o papel dela (ativo = 0 bloqueia, mesmo estando em ADMIN_EMAILS).
   2) Sem linha (ou tabela ainda não criada): quem está em ADMIN_EMAILS é Super Admin, como hoje.
   3) Ambiente local de teste (DEV_ADMIN=1): Super Admin. */
export async function papelDe(env, email) {
  const e = String(email || "").toLowerCase().trim();
  if (!e) return null;
  try {
    const r = await env.DB.prepare("SELECT papel, ativo FROM usuarios WHERE email = ?").bind(e).first();
    if (r) return r.ativo && PAPEIS.includes(r.papel) ? r.papel : null;
  } catch (err) {
    // tabela ainda não existe (migração não aplicada): segue a regra antiga
  }
  if (env.DEV_ADMIN === "1" && e === "dev@local") return "super_admin";
  return listaAdmins(env).includes(e) ? "super_admin" : null;
}
