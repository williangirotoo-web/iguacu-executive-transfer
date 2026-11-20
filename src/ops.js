/* Plataforma de gestão — API interna /api/admin/ops/* (Fase 0: só a base).
   Nada aqui é usado pelo site ou pela venda. Toda rota exige login do Access E permissão do papel. */
import { papelDe, permissoes } from "./acesso.js";

const json = (obj, status = 200) => new Response(JSON.stringify(obj), {
  status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex" },
});
const erro = (codigo, status = 400) => json({ ok: false, erro: codigo }, status);

export async function ops(req, env, url, user) {
  const papel = await papelDe(env, user && user.email);
  if (!papel) return erro("sem_permissao", 403);
  const partes = url.pathname.replace(/^\/api\/admin\/ops\/?/, "").split("/").filter(Boolean);

  // quem sou eu e o que posso fazer (as telas usam isto para montar o menu; o servidor confere de novo em cada rota)
  if (partes[0] === "eu" && req.method === "GET") {
    return json({ ok: true, email: user.email, papel, permissoes: permissoes(papel) });
  }

  // as rotas das próximas fases entram aqui, cada uma começando por: if (!pode(papel, "...")) return erro("sem_permissao", 403)
  // (importar pode de ./acesso.js)
  return erro("rota", 404);
}
