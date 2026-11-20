/* Plataforma de gestão IET — utilidades de interface (Fase 0). Sem dependências.
   Uso: <script src="/js/ops-ui.js"></script> e depois OPS.api("/api/admin/ops/eu"). */
(function () {
  "use strict";
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };

  // Status do serviço (Fase 1) e do pedido: texto e cor sempre iguais em todas as telas.
  var STATUS = {
    a_atribuir: ["A atribuir", "o-red"], oferecido: ["Oferecido", "o-amber"], atribuido: ["Atribuído", "o-amber"],
    confirmado: ["Confirmado", "o-blue"], a_caminho: ["A caminho", "o-blue"], no_local: ["No local", "o-blue"],
    embarcado: ["Embarcado", "o-blue"], no_atrativo: ["No atrativo", "o-blue"], na_aduana: ["Na aduana", "o-blue"],
    concluido: ["Concluído", "o-green"], no_show: ["Não apareceu", "o-red"], cancelado: ["Cancelado", "o-wait"], conflito: ["Conflito", "o-red"],
    solicitacao: ["Solicitação", "o-wait"], pagamento_pendente: ["Aguardando pagamento", "o-amber"], aprovado: ["Pago", "o-blue"],
    aguardando_confirmacao: ["Aguardando confirmação", "o-amber"], confirmada: ["Confirmada", "o-blue"], concluida: ["Concluída", "o-green"], cancelada: ["Cancelada", "o-wait"]
  };
  function pill(st) { var x = STATUS[st] || [st, "o-wait"]; return '<span class="o-pill ' + x[1] + '">' + esc(x[0]) + "</span>"; }

  function toast(texto) {
    var d = document.createElement("div"); d.className = "o-toast"; d.setAttribute("role", "status"); d.textContent = texto;
    document.body.appendChild(d); setTimeout(function () { d.remove(); }, 2600);
  }

  var camada = null;
  function fechar() { if (camada) { camada.remove(); camada = null; } }
  function painel(html, rotulo) {
    fechar();
    camada = document.createElement("div");
    camada.innerHTML = '<div class="o-scrim" data-o-fechar></div><aside class="o-drawer" role="dialog" aria-modal="true" aria-label="' + esc(rotulo || "Detalhes") + '">' + html + "</aside>";
    document.body.appendChild(camada);
    var foco = camada.querySelector("button, a, input, select, textarea"); if (foco) foco.focus();
    return camada.querySelector(".o-drawer");
  }
  document.addEventListener("click", function (e) { if (e.target.closest("[data-o-fechar]")) fechar(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") fechar(); });

  // Chamada à API: devolve o JSON; erros viram mensagem legível.
  function api(caminho, opcoes) {
    opcoes = opcoes || {};
    var init = { method: opcoes.method || "GET", headers: {}, credentials: "same-origin" };
    if (opcoes.body !== undefined) { init.headers["content-type"] = "application/json"; init.body = JSON.stringify(opcoes.body); }
    return fetch(caminho, init).then(function (r) {
      return r.json().catch(function () { return { ok: false, erro: "resposta_invalida" }; }).then(function (d) {
        if (r.status === 401) d.mensagem = "Sua sessão expirou. Recarregue a página para entrar de novo.";
        else if (r.status === 403) d.mensagem = "Seu acesso não permite esta ação.";
        else if (!r.ok || d.ok === false) d.mensagem = d.mensagem || "Não deu certo (" + (d.erro || r.status) + "). Tente de novo.";
        d.http = r.status; return d;
      });
    }, function () { return { ok: false, erro: "rede", mensagem: "Sem conexão. Confira a internet e tente de novo.", http: 0 }; });
  }

  var brl = function (v) { return "R$ " + Number(v || 0).toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 2 }); };

  window.OPS = { esc: esc, pill: pill, STATUS: STATUS, toast: toast, painel: painel, fechar: fechar, api: api, brl: brl };
})();
