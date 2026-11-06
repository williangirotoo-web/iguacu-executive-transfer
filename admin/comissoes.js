/* Painel: fechamento mensal de comissões dos parceiros que indicam clientes */
(function () {
  "use strict";
  var $ = function (s) { return document.querySelector(s); };
  var ST = { solicitacao: "Recebida", pagamento_pendente: "Pagamento pendente", aprovado: "Pagamento aprovado", aguardando_confirmacao: "Aguardando confirmação", confirmada: "Confirmada", concluida: "Concluída", cancelada: "Cancelada" };
  var MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function brl(v) { return "R$ " + Number(v || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function dataBr(d) { return String(d || "").split("-").reverse().join("/"); }
  function quando(iso) { var d = new Date(iso); return d.toLocaleDateString("pt-BR"); }
  function nomeMes(m) { var p = m.split("-"); return MESES[+p[1] - 1] + " de " + p[0]; }
  function tel(t) { var n = String(t || "").replace(/\D/g, ""); return n.length <= 11 ? "55" + n : n; }
  function api(path, body) {
    return fetch(path, body ? { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body), credentials: "same-origin" } : { credentials: "same-origin" })
      .then(function (r) { if (r.status === 401) throw new Error("401"); return r.json(); });
  }
  function semAcesso() { $("#rows").innerHTML = '<p class="msg">Sem acesso. Entre com o e-mail autorizado.</p>'; }
  function mudarMes(n) {
    var p = $("#mes").value.split("-"), d = new Date(Date.UTC(+p[0], +p[1] - 1 + n, 1));
    $("#mes").value = d.toISOString().slice(0, 7); carregar();
  }
  var dados = null;
  function carregar() {
    var mes = $("#mes").value;
    $("#rows").innerHTML = '<p class="msg">Carregando…</p>';
    api("/api/admin/comissoes?mes=" + encodeURIComponent(mes)).then(function (r) {
      dados = r; $("#mes").value = r.mes;
      $("#t-a").textContent = brl(r.totais.a_pagar); $("#t-p").textContent = brl(r.totais.pago); $("#t-f").textContent = brl(r.totais.previsto);
      if (!r.parceiros.length) { $("#rows").innerHTML = '<p class="empty">Nenhuma reserva de parceiro com viagem em ' + esc(nomeMes(r.mes)) + ".</p>"; return; }
      $("#rows").innerHTML = r.parceiros.map(function (g) {
        var h = '<div class="pc"><div class="top"><div><h2>' + esc(g.nome) + '</h2><span class="svc">' + esc(g.codigo) + " · comissão " + String(g.comissao_pct || 0).replace(".", ",") + "%</span></div>";
        h += "<div>" + (g.n_a_pagar ? '<button class="btn" data-pagar="' + esc(g.codigo) + '" type="button">Marcar ' + brl(g.a_pagar) + " como pago</button>" : "") + "</div></div>";
        h += '<div class="vals"><span>A pagar: <b>' + brl(g.a_pagar) + "</b> (" + g.n_a_pagar + ")</span><span>Pago: <b>" + brl(g.pago) + "</b></span><span>Previsto: <b>" + brl(g.previsto) + "</b> (" + g.n_previstos + ")</span></div>";
        if (g.n_a_pagar) h += '<p><input data-obs="' + esc(g.codigo) + '" placeholder="Anotação do pagamento (ex.: Pix em 05/12)" style="width:100%;max-width:420px"></p>';
        h += g.pagamentos.map(function (c) {
          var msg = "Olá, " + String(g.responsavel || "").split(" ")[0] + "! Fizemos o pagamento da sua comissão de " + nomeMes(c.mes) + ": " + brl(c.valor) + " (" + c.n_pedidos + (c.n_pedidos === 1 ? " corrida" : " corridas") + "). Obrigado pela parceria!";
          return '<div class="ev"><span class="ok">Pago ' + brl(c.valor) + "</span> em " + esc(quando(c.pago_em)) + " · " + c.n_pedidos + " reserva(s) · " + esc(c.autor || "") + (c.obs ? " · " + esc(c.obs) : "") +
            ' <a class="btn wa" style="padding:3px 10px;font-size:12px" target="_blank" rel="noopener" href="https://wa.me/' + tel(g.telefone) + "?text=" + encodeURIComponent(msg) + '">Avisar</a> <button class="btn gh" style="padding:3px 10px;font-size:12px" data-desfazer="' + c.id + '" type="button">Desfazer</button></div>';
        }).join("");
        h += '<div class="tw"><table><thead><tr><th>Reserva</th><th>Viagem</th><th>Passageiro</th><th>Valor</th><th>Comissão</th><th>Situação</th></tr></thead><tbody>' + g.pedidos.map(function (x) {
          var sit = x.paga ? '<span class="ok">Paga</span>' : x.status === "concluida" ? '<span class="pend">A pagar</span>' : esc(ST[x.status] || x.status);
          return '<tr><td><a style="color:var(--gold)" href="/admin/#' + esc(x.codigo) + '">' + esc(x.codigo) + "</a></td><td>" + esc(dataBr(x.data)) + "</td><td>" + esc(x.nome) + "</td><td>" + brl(x.total) + "</td><td>" + brl(x.comissao) + "</td><td>" + sit + "</td></tr>";
        }).join("") + "</tbody></table></div></div>";
        return h;
      }).join("");
    }).catch(function (e) { if (e.message === "401") semAcesso(); else $("#rows").innerHTML = '<p class="msg">Erro ao carregar.</p>'; });
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-pagar]");
    if (b) {
      var cod = b.dataset.pagar, g = dados.parceiros.filter(function (x) { return x.codigo === cod; })[0];
      if (!confirm("Confirmar que você pagou " + brl(g.a_pagar) + " de comissão para " + g.nome + " (" + nomeMes(dados.mes) + ")?")) return;
      var o = document.querySelector('[data-obs="' + cod + '"]');
      b.disabled = true;
      api("/api/admin/comissoes/pagar", { parceiro: cod, mes: dados.mes, obs: o ? o.value : "" }).then(function (x) {
        if (!x.ok) alert(x.erro === "nada_a_pagar" ? "Não há reservas concluídas a pagar neste mês." : "Erro: " + x.erro);
        carregar();
      });
      return;
    }
    var d = e.target.closest("[data-desfazer]");
    if (d) {
      if (!confirm("Desfazer este pagamento? As reservas voltam para 'a pagar'.")) return;
      api("/api/admin/comissoes/desfazer", { id: +d.dataset.desfazer }).then(carregar);
    }
  });
  $("#ant").onclick = function () { mudarMes(-1); };
  $("#prox").onclick = function () { mudarMes(1); };
  $("#mes").onchange = carregar;
  $("#mes").value = new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 7);
  api("/api/admin/eu").then(function (r) { $("#who").textContent = r.email || ""; }).catch(function (e) { if (e.message === "401") semAcesso(); });
  carregar();
})();
