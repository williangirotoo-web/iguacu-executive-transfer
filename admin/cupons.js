/* Painel: cupons de desconto */
(function () {
  "use strict";
  var $ = function (s) { return document.querySelector(s); };
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function dbr(d) { return d ? d.split("-").reverse().join("/") : ""; }
  function api(path, body) {
    return fetch(path, body ? { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body), credentials: "same-origin" } : { credentials: "same-origin" })
      .then(function (r) { if (r.status === 401) throw new Error("401"); return r.json(); });
  }
  function situacao(c, hoje) {
    if (!c.ativo) return '<span class="off">Desativado</span>';
    if (c.fim && hoje > c.fim) return '<span class="off">Expirado</span>';
    if (c.inicio && hoje < c.inicio) return "Agendado";
    if (c.usos_max != null && c.usos >= c.usos_max) return '<span class="off">Esgotado</span>';
    return '<span class="ok">Ativo</span>';
  }
  function carregar() {
    api("/api/admin/cupons").then(function (r) {
      $("#tab tbody").innerHTML = r.cupons.length ? r.cupons.map(function (c) {
        var val = c.inicio || c.fim ? (c.inicio ? "de " + dbr(c.inicio) + " " : "") + (c.fim ? "até " + dbr(c.fim) : "") : "sem prazo";
        return "<tr><td><b>" + esc(c.codigo) + "</b>" + (c.descricao ? '<br><small class="svc">' + esc(c.descricao) + "</small>" : "") + "</td><td>" + String(c.pct).replace(".", ",") + "%</td><td>" + esc(val) +
          "</td><td>" + c.usos + (c.usos_max != null ? " / " + c.usos_max : "") + "</td><td>" + situacao(c, r.hoje) + '</td><td><button class="btn gh" type="button" data-cod="' + esc(c.codigo) + '" data-at="' + (c.ativo ? 0 : 1) + '">' + (c.ativo ? "Desativar" : "Reativar") + "</button></td></tr>";
      }).join("") : '<tr><td colspan="6" class="svc">Nenhum cupom ainda.</td></tr>';
    }).catch(function (e) { if (e.message === "401") $("#tab tbody").innerHTML = '<tr><td colspan="6">Sem acesso.</td></tr>'; });
  }
  $("#c-criar").onclick = function () {
    var b = { codigo: $("#c-cod").value, pct: $("#c-pct").value, inicio: $("#c-ini").value, fim: $("#c-fim").value, usos_max: $("#c-max").value.trim(), descricao: $("#c-desc").value };
    api("/api/admin/cupons", b).then(function (x) {
      if (!x.ok) { $("#c-msg").textContent = { codigo: "Código precisa ter pelo menos 3 letras ou números.", pct: "Desconto entre 1% e 50%.", usos: "Limite de usos inválido.", ja_existe: "Já existe um cupom com esse código." }[x.erro] || "Erro: " + x.erro; return; }
      $("#c-msg").textContent = "Cupom criado.";
      ["#c-cod", "#c-pct", "#c-ini", "#c-fim", "#c-max", "#c-desc"].forEach(function (s) { $(s).value = ""; });
      carregar();
    });
  };
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-cod]"); if (!b) return;
    api("/api/admin/cupons/ativo", { codigo: b.dataset.cod, ativo: b.dataset.at === "1" }).then(carregar);
  });
  api("/api/admin/eu").then(function (r) { $("#who").textContent = r.email || ""; }).catch(function () {});
  carregar();
})();
