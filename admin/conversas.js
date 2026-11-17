/* Painel: conversas do assistente do site */
(function () {
  "use strict";
  var $ = function (s) { return document.querySelector(s); };
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function quando(iso) { if (!iso) return ""; var d = new Date(iso); return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", timeZone: "America/Sao_Paulo" }) + " " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" }); }
  function api(path) { return fetch(path, { credentials: "same-origin" }).then(function (r) { if (r.status === 401) throw new Error("401"); return r.json(); }); }
  function wa(t) { var n = String(t || "").replace(/\D/g, ""); if (n.length >= 10 && n.length <= 11 && String(t || "").trim().charAt(0) !== "+") n = "55" + n; return "https://wa.me/" + n; }
  var IDI = { pt: "Português", en: "Inglês", es: "Espanhol" };
  function carregar() {
    var q = $("#q").value.trim();
    $("#rows").innerHTML = '<p class="msg">Carregando…</p>';
    api("/api/admin/conversas" + (q ? "?q=" + encodeURIComponent(q) : "")).then(function (r) {
      if (!r.conversas.length) { $("#rows").innerHTML = '<p class="empty">Nenhuma conversa ainda.</p>'; return; }
      $("#rows").innerHTML = r.conversas.map(function (c) {
        return '<div class="cv" data-id="' + esc(c.id) + '"><div><b>' + esc(quando(c.atualizado_em)) + "</b><small>" + esc(IDI[c.idioma] || c.idioma || "") + "</small></div>" +
          "<div><b>" + esc(c.nome) + "</b><small>" + esc(c.pagina || "") + "</small></div><div>" + esc(c.telefone) + "</div><div>" + c.n_msgs + " msg</div><div>" +
          (c.cotou ? '<span class="tag c">Viu preço</span>' : "") + (c.humano ? '<span class="tag h">Pediu humano</span>' : "") + "</div></div>";
      }).join("");
    }).catch(function (e) { $("#rows").innerHTML = '<p class="msg">' + (e.message === "401" ? "Sem acesso." : "Erro ao carregar.") + "</p>"; });
  }
  function abrir(id) {
    api("/api/admin/conversas/" + encodeURIComponent(id)).then(function (r) {
      var c = r.conversa;
      $("#lista").hidden = true; var d = $("#detalhe"); d.hidden = false;
      d.innerHTML = '<p><button class="btn gh" id="voltar" type="button">← Voltar</button></p><div class="det"><h2>' + esc(c.nome) + '</h2><div class="kv"><span>WhatsApp</span><span>' + esc(c.telefone) +
        ' <a class="btn wa mini" style="padding:3px 10px;font-size:12px" target="_blank" rel="noopener" href="' + wa(c.telefone) + '">Abrir WhatsApp</a></span><span>Começou</span><span>' + esc(quando(c.criado_em)) +
        "</span><span>Última mensagem</span><span>" + esc(quando(c.atualizado_em)) + "</span><span>Página</span><span>" + esc(c.pagina || "") + "</span><span>Idioma</span><span>" + esc(IDI[c.idioma] || c.idioma || "") + '</span></div><h3>Conversa</h3><div class="chat">' +
        c.msgs.map(function (m) { return '<div class="b ' + (m.role === "user" ? "u" : "a") + '">' + esc(m.content || (m.cot ? "" : "…")) + (m.cot ? '<span class="q">Preços mostrados: ' + esc(m.cot) + "</span>" : "") + "</div>"; }).join("") + "</div></div>";
      $("#voltar").onclick = function () { d.hidden = true; $("#lista").hidden = false; };
      scrollTo(0, 0);
    });
  }
  $("#rows").onclick = function (e) { var r = e.target.closest("[data-id]"); if (r) abrir(r.dataset.id); };
  $("#recarregar").onclick = carregar;
  var t; $("#q").oninput = function () { clearTimeout(t); t = setTimeout(carregar, 300); };
  api("/api/admin/eu").then(function (r) { $("#who").textContent = r.email || ""; }).catch(function () {});
  carregar();
})();
