/* Painel: cadastros de parceiros (quem indica clientes e quem atende corridas) */
(function () {
  "use strict";
  var $ = function (s) { return document.querySelector(s); };
  var ST = { novo: "Novo", aprovado: "Aprovado", pausado: "Pausado", recusado: "Recusado" };
  var CAT = { hotel: "Hotel ou pousada", agencia: "Agência", guia: "Guia", empresa: "Empresa", outro: "Outro", taxi: "Táxi", particular: "Motorista particular", sete: "7 lugares", van: "Van" };
  var filtro = { status: "", tipo: "" };
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function brl(v) { return "R$ " + Number(v || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function quando(iso) { var d = new Date(iso); return d.toLocaleDateString("pt-BR") + " " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }); }
  function api(path, body) {
    return fetch(path, body ? { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body), credentials: "same-origin" } : { credentials: "same-origin" })
      .then(function (r) { if (r.status === 401) throw new Error("401"); return r.json(); });
  }
  function semAcesso() { $("#rows").innerHTML = '<p class="msg">Sem acesso. Entre com o e-mail autorizado.</p>'; }
  function badge(st) { return '<span class="st st-' + esc(st) + '">' + esc(ST[st] || st) + "</span>"; }
  function tel(t) { var n = String(t || "").replace(/\D/g, ""); return n.length <= 11 ? "55" + n : n; }
  function carregar() {
    var q = new URLSearchParams(); if (filtro.status) q.set("status", filtro.status); if (filtro.tipo) q.set("tipo", filtro.tipo);
    api("/api/admin/parceiros?" + q).then(function (r) {
      var cont = {}; r.contagem.forEach(function (c) { if (!filtro.tipo || c.tipo === filtro.tipo) cont[c.status] = (cont[c.status] || 0) + c.n; });
      var tot = Object.keys(cont).reduce(function (a, k) { return a + cont[k]; }, 0);
      $("#chips").innerHTML = ['<button class="chip' + (filtro.status ? "" : " on") + '" data-st="">Todos<i>' + tot + "</i></button>"].concat(Object.keys(ST).map(function (k) {
        return '<button class="chip' + (filtro.status === k ? " on" : "") + '" data-st="' + k + '">' + ST[k] + "<i>" + (cont[k] || 0) + "</i></button>";
      })).join("");
      $("#rows").innerHTML = r.parceiros.length ? r.parceiros.map(function (x) {
        return '<div class="rowp" data-cod="' + esc(x.codigo) + '"><div><b>' + esc(x.codigo) + '</b><br><small>' + esc(quando(x.criado_em)) + '</small></div><div><b>' + esc(x.empresa || x.responsavel) +
          '</b><div class="svc">' + esc(CAT[x.categoria] || x.categoria) + (x.cidade ? " · " + esc(x.cidade) : "") + "</div></div><div>" + (x.tipo === "indica" ? "Indica · " + String(x.comissao_pct || 0).replace(".", ",") + "%" : "Atende corridas") +
          "</div><div>" + (x.tipo === "indica" ? x.n_pedidos + " reservas" : "") + "</div><div>" + badge(x.status) + "</div></div>";
      }).join("") : '<p class="empty">Nenhum cadastro.</p>';
    }).catch(function (e) { if (e.message === "401") semAcesso(); else $("#rows").innerHTML = '<p class="msg">Erro ao carregar.</p>'; });
  }
  function abrir(cod) {
    api("/api/admin/parceiros/" + encodeURIComponent(cod)).then(function (r) {
      var p = r.parceiro, ind = p.tipo === "indica";
      $("#lista").hidden = true; $("#detalhe").hidden = false;
      var kv = [["Tipo", (ind ? "Indica clientes · " : "Atende corridas · ") + (CAT[p.categoria] || p.categoria)], ["Empresa", p.empresa], ["Responsável", p.responsavel], ["WhatsApp", p.telefone], ["E-mail", p.email],
        ["Cidade", p.cidade], ["CNPJ/Cadastur", p.documento], ["Veículo", p.veiculo], ["Autorização", p.autorizacao], ["Mensagem", p.mensagem], ["Cadastro", quando(p.criado_em)], ["Acesso", ind ? (p.tem_acesso ? "Link gerado em " + quando(p.chave_em) : "Sem link") : "—"]]
        .filter(function (x) { return x[1]; });
      var h = '<p><button class="btn gh" id="voltar" type="button">← Voltar</button></p><div class="det"><h2>' + esc(p.empresa || p.responsavel) + " " + badge(p.status) + "</h2><p class=\"svc\">" + esc(p.codigo) + "</p>" +
        '<div class="grid2"><div><h3>Dados</h3><div class="kv">' + kv.map(function (x) { return "<span>" + esc(x[0]) + "</span><span>" + esc(x[1]) + "</span>"; }).join("") + "</div>" +
        '<p style="margin-top:12px"><a class="btn wa" target="_blank" rel="noopener" href="https://wa.me/' + tel(p.telefone) + '">WhatsApp</a></p></div>' +
        "<div><h3>Situação</h3><p><select id=\"st\">" + Object.keys(ST).map(function (k) { return '<option value="' + k + '"' + (k === p.status ? " selected" : "") + ">" + ST[k] + "</option>"; }).join("") + "</select></p>" +
        (ind ? '<p><label>Comissão (%) <input id="pct" type="number" min="0" max="50" step="0.5" value="' + esc(p.comissao_pct || 0) + '" style="width:90px"></label></p>' : "") +
        '<p><input id="nota" placeholder="Anotação (opcional)" style="width:100%"></p><p><button class="btn" id="salvar" type="button">Salvar</button></p>' +
        (ind ? '<h3>Link de acesso</h3><p class="svc">Gere o link só depois de aprovar. Gerar um novo invalida o anterior.</p><p><button class="btn gh" id="gerar" type="button">' + (p.tem_acesso ? "Gerar novo link" : "Gerar link") + '</button></p><div id="linkbox"></div>' : "") +
        (p.notas ? '<h3>Anotações</h3><div class="ev" style="white-space:pre-wrap">' + esc(p.notas) + "</div>" : "") + "</div></div>" +
        (ind ? "<h3>Reservas do parceiro</h3>" + (r.pedidos.length ? r.pedidos.map(function (x) {
          return '<div class="item"><b><a href="/admin/#' + esc(x.codigo) + '" style="color:var(--gold)">' + esc(x.codigo) + "</a> · " + esc(x.nome) + "</b>" + brl(x.total) + " · comissão " + brl(x.status === "cancelada" ? 0 : x.total * (p.comissao_pct || 0) / 100) + " · " + esc(x.status) + "</div>";
        }).join("") : '<p class="svc">Nenhuma reserva ainda.</p>') : "") + "</div>";
      $("#detalhe").innerHTML = h;
      $("#voltar").onclick = function () { history.replaceState(null, "", location.pathname); fechar(); };
      $("#salvar").onclick = function () {
        var b = { status: $("#st").value, nota: $("#nota").value }; if ($("#pct")) b.comissao_pct = $("#pct").value;
        api("/api/admin/parceiros/" + p.codigo, b).then(function (x) { if (!x.ok) alert("Erro: " + x.erro); abrir(p.codigo); });
      };
      var g = $("#gerar"); if (g) g.onclick = function () {
        api("/api/admin/parceiros/" + p.codigo + "/acesso", {}).then(function (x) {
          if (!x.ok) { $("#linkbox").innerHTML = '<p class="msg">' + (x.erro === "aprove_primeiro" ? "Aprove e salve o parceiro antes de gerar o link." : "Erro: " + esc(x.erro)) + "</p>"; return; }
          var msg = "Olá, " + (p.responsavel || "") + "! Seu acesso de parceiro da Iguaçu Executive Transfer está liberado. Abra este link no celular ou computador que vai usar para reservar (não compartilhe):\n" + x.link;
          $("#linkbox").innerHTML = '<div class="link">' + esc(x.link) + '</div><p><a class="btn wa" target="_blank" rel="noopener" href="https://wa.me/' + tel(p.telefone) + "?text=" + encodeURIComponent(msg) + '">Enviar pelo WhatsApp</a></p><p class="svc">Este link aparece só agora. Se perder, gere outro.</p>';
        });
      };
    }).catch(function (e) { if (e.message === "401") semAcesso(); });
  }
  function fechar() { $("#detalhe").hidden = true; $("#lista").hidden = false; carregar(); }
  document.addEventListener("click", function (e) {
    var c = e.target.closest(".chip"); if (c) { filtro.status = c.dataset.st; carregar(); return; }
    var r = e.target.closest(".rowp"); if (r) { location.hash = r.dataset.cod; }
  });
  $("#tipo").onchange = function () { filtro.tipo = this.value; carregar(); };
  $("#recarregar").onclick = carregar;
  addEventListener("hashchange", function () { var h = location.hash.slice(1); if (h) abrir(h); else fechar(); });
  api("/api/admin/eu").then(function (r) { $("#who").textContent = r.email || ""; }).catch(function (e) { if (e.message === "401") semAcesso(); });
  if (location.hash.slice(1)) abrir(location.hash.slice(1)); else carregar();
})();
