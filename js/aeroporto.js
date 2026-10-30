/* Página do aeroporto: preços atualizados da API, entrada suave e barra fixa no celular */
(function () {
  "use strict";
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  var brl = function (v) { return "R$ " + Number(v).toLocaleString("pt-BR", { maximumFractionDigits: 0 }); };

  // os preços no HTML servem para o Google; aqui eles são conferidos com a tabela atual do sistema
  if (window.fetch) fetch("/api/catalogo").then(function (r) { return r.json(); }).then(function (c) {
    var s = {}; c.servicos.forEach(function (x) { s[x.id] = x.precos; });
    $$("[data-p]").forEach(function (el) {
      var k = el.getAttribute("data-p").split(":"), v = s[k[0]] && s[k[0]][k[1]];
      if (v) el.textContent = brl(v);
    });
    $$("[data-pmin]").forEach(function (el) {
      var p = s[el.getAttribute("data-pmin")]; if (!p) return;
      var v = Object.keys(p).map(function (k) { return p[k]; }).filter(function (x) { return x != null; });
      if (v.length) el.textContent = brl(Math.min.apply(null, v));
    });
  }).catch(function () {});

  var bar = document.querySelector(".a-mbar");
  addEventListener("scroll", function () { if (bar) bar.classList.toggle("on", scrollY > innerHeight * 0.7); }, { passive: true });

  var els = $$(".rv");
  if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) { els.forEach(function (e) { e.classList.add("in"); }); return; }
  els.forEach(function (e) { var i = Array.prototype.indexOf.call(e.parentNode.children, e); e.style.setProperty("--d", Math.min(i, 6) * 60 + "ms"); });
  var io = new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); } }); }, { rootMargin: "0px 0px -50px 0px" });
  els.forEach(function (e) { io.observe(e); });
})();
