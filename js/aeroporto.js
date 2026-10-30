/* Página do aeroporto: preços atualizados da API, entrada suave e barra fixa no celular */
(function () {
  "use strict";
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  var brl = function (v) { return "R$ " + Number(v).toLocaleString("pt-BR", { maximumFractionDigits: 0 }); };

  // os preços no HTML servem para o Google; aqui eles são conferidos com a tabela atual do sistema
  // e ganham, embaixo, o valor aproximado em dólar e euro (cotação do dia; a cobrança é em reais)
  var txtFx = { pt: "Dólar e euro aproximados, pela cotação do dia. A cobrança é em reais.", en: "US dollar and euro amounts are approximate, at today's rate. Payment is in Brazilian reais.", es: "Dólar y euro aproximados, a la cotización del día. El cobro es en reales." };
  var lang = (document.documentElement.lang || "pt").slice(0, 2);
  function json(u) { return fetch(u).then(function (r) { return r.json(); }); }
  if (window.fetch) Promise.all([json("/api/catalogo").catch(function () { return null; }), json("/api/cambio").catch(function () { return null; })]).then(function (res) {
    var c = res[0], fx = res[1] && res[1].ok ? res[1] : null;
    var s = {}; if (c && c.servicos) c.servicos.forEach(function (x) { s[x.id] = x.precos; });
    $$("[data-p]").forEach(function (el) {
      var k = el.getAttribute("data-p").split(":"), v = s[k[0]] && s[k[0]][k[1]];
      if (v) el.textContent = brl(v);
    });
    $$("[data-pmin]").forEach(function (el) {
      var p = s[el.getAttribute("data-pmin")]; if (!p) return;
      var v = Object.keys(p).map(function (k) { return p[k]; }).filter(function (x) { return x != null; });
      if (v.length) el.textContent = brl(Math.min.apply(null, v));
    });
    if (!fx) return;
    var n = function (v) { return Math.round(v).toLocaleString("en-US"); };
    $$("[data-p], [data-pmin], [data-brl]").forEach(function (el) {
      var reais = parseInt(String(el.textContent).replace(/\D/g, ""), 10); if (!reais) return;
      var nx = el.nextElementSibling; if (nx && nx.classList.contains("a-fx")) nx.remove();
      var sm = document.createElement("small"); sm.className = "a-fx";
      sm.textContent = "≈ US$ " + n(reais * fx.usd) + " · € " + n(reais * fx.eur);
      el.insertAdjacentElement("afterend", sm);
    });
    var nota = document.querySelector("#precos .a-note");
    if (nota && !document.querySelector(".a-fx-nota")) { var p2 = document.createElement("p"); p2.className = "a-note a-fx-nota"; p2.textContent = txtFx[lang] || txtFx.pt; nota.insertAdjacentElement("afterend", p2); }
  });

  var bar = document.querySelector(".a-mbar");
  addEventListener("scroll", function () { if (bar) bar.classList.toggle("on", scrollY > innerHeight * 0.7); }, { passive: true });

  var els = $$(".rv");
  if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) { els.forEach(function (e) { e.classList.add("in"); }); return; }
  els.forEach(function (e) { var i = Array.prototype.indexOf.call(e.parentNode.children, e); e.style.setProperty("--d", Math.min(i, 6) * 60 + "ms"); });
  var io = new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); } }); }, { rootMargin: "0px 0px -50px 0px" });
  els.forEach(function (e) { io.observe(e); });
})();
