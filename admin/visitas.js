/* Painel: visitas do site (contador próprio, sem cookies) */
(function () {
  "use strict";
  var $ = function (s) { return document.querySelector(s); };
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function n(v) { return Number(v || 0).toLocaleString("pt-BR"); }
  function api(path) { return fetch(path, { credentials: "same-origin" }).then(function (r) { if (r.status === 401) throw new Error("401"); return r.json(); }); }
  function nomePag(p) { if (p === "/") return "Página inicial"; return p.replace(/\.html$/, "").replace(/^\//, ""); }
  function carregar(dias) {
    $("#out").innerHTML = '<p class="msg">Carregando…</p>';
    api("/api/admin/visitas?dias=" + dias).then(function (r) {
      var views = r.porDia.reduce(function (a, x) { return a + x.v; }, 0), unicos = r.visitantes.reduce(function (a, x) { return a + x.u; }, 0);
      var mapaV = {}; r.porDia.forEach(function (x) { mapaV[x.dia] = x.v; });
      var mapaU = {}; r.visitantes.forEach(function (x) { mapaU[x.dia] = x.u; });
      var diasL = [], d0 = new Date(r.desde + "T12:00:00Z");
      for (var i = 0; i < r.dias; i++) diasL.push(new Date(d0.getTime() + i * 864e5).toISOString().slice(0, 10));
      var max = Math.max.apply(null, diasL.map(function (d) { return mapaU[d] || 0; }).concat([1]));
      var fmt = function (d) { return d.slice(8, 10) + "/" + d.slice(5, 7); };
      var maxP = r.paginas.length ? r.paginas[0].v : 1, maxO = r.origens.length ? r.origens[0].n : 1;
      $("#out").innerHTML =
        '<div class="cards"><div class="card"><small>Visitantes</small><b>' + n(unicos) + '</b></div><div class="card"><small>Páginas vistas</small><b>' + n(views) +
        '</b></div><div class="card"><small>Conversas no assistente</small><b>' + n(r.conversas) + '</b></div><div class="card"><small>Pedidos de reserva</small><b>' + n(r.pedidos) + "</b></div></div>" +
        (r.dias > 1 ? '<div class="box" style="margin-bottom:16px"><h3>Visitantes por dia</h3><div class="graf">' + diasL.map(function (d) { var u = mapaU[d] || 0; return '<div title="' + fmt(d) + ": " + u + " visitantes, " + (mapaV[d] || 0) + ' páginas" style="height:' + Math.round(u / max * 100) + '%"></div>'; }).join("") +
          '</div><div class="eixo"><span>' + fmt(diasL[0]) + "</span><span>" + fmt(diasL[diasL.length - 1]) + "</span></div></div>" : "") +
        '<div class="cols"><div class="box"><h3>Páginas mais vistas</h3>' + (r.paginas.length ? r.paginas.map(function (p) {
          return '<div class="lin"><span><a style="color:var(--txt);text-decoration:none" href="' + esc(p.pagina) + '" target="_blank" rel="noopener">' + esc(nomePag(p.pagina)) + '</a><i style="width:' + Math.round(p.v / maxP * 100) + '%"></i></span><b>' + n(p.v) + "</b></div>";
        }).join("") : '<p class="svc">Sem visitas ainda.</p>') + '</div><div class="box"><h3>De onde vieram</h3>' + (r.origens.length ? r.origens.map(function (o) {
          return '<div class="lin"><span>' + esc(o.origem) + '<i style="width:' + Math.round(o.n / maxO * 100) + '%"></i></span><b>' + n(o.n) + "</b></div>";
        }).join("") : '<p class="svc">Sem dados ainda.</p>') + "</div></div>";
    }).catch(function (e) { $("#out").innerHTML = '<p class="msg">' + (e.message === "401" ? "Sem acesso." : "Erro ao carregar.") + "</p>"; });
  }
  $("#per").onclick = function (e) { var b = e.target.closest("[data-d]"); if (!b) return; [].forEach.call(document.querySelectorAll("#per .chip"), function (x) { x.classList.toggle("on", x === b); }); carregar(b.dataset.d); };
  api("/api/admin/eu").then(function (r) { $("#who").textContent = r.email || ""; }).catch(function () {});
  carregar(7);
})();
