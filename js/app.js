/* Instalar o site como app no celular (Android: botão; iPhone: instrução "Adicionar à Tela de Início") */
(function () {
  "use strict";
  /* link de indicação (?ref=CUPOM): guarda por 30 dias; o cupom é aplicado sozinho na reserva */
  try {
    var ref = new URLSearchParams(location.search).get("ref");
    if (ref && /^[A-Za-z0-9-]{3,30}$/.test(ref)) localStorage.setItem("iet_ref", JSON.stringify({ c: ref.toUpperCase(), ate: Date.now() + 30 * 864e5 }));
  } catch (e) {}
  if ("serviceWorker" in navigator) addEventListener("load", function () { navigator.serviceWorker.register("/sw.js").catch(function () {}); });
  var pedido = null;
  var instalado = (window.matchMedia && matchMedia("(display-mode: standalone)").matches) || navigator.standalone === true;
  var ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  function mostrar(sel) { document.querySelectorAll(sel).forEach(function (el) { el.hidden = false; }); }
  function pronto() {
    if (instalado) { mostrar("[data-app-ok]"); return; }
    if (ios) mostrar("[data-app-ios]"); else mostrar("[data-app-android]");
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", pronto); else pronto();
  addEventListener("beforeinstallprompt", function (e) { e.preventDefault(); pedido = e; mostrar("[data-instalar]"); });
  addEventListener("appinstalled", function () { pedido = null; document.querySelectorAll("[data-instalar]").forEach(function (b) { b.hidden = true; }); mostrar("[data-app-ok]"); });
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-instalar]");
    if (!b || !pedido) return;
    e.preventDefault(); pedido.prompt();
    pedido.userChoice.then(function () { pedido = null; b.hidden = true; });
  });
})();

/* Visitante de fora do Brasil numa página em português (ou com o tradutor automático ligado):
   barra discreta no topo com a versão no idioma dele. Fecha com o "×" e não volta mais. */
(function () {
  "use strict";
  function iniciar() {
    try {
      var h = document.documentElement;
      if ((h.lang || "").toLowerCase().indexOf("pt") !== 0 || /[?&]lang=/.test(location.search) || localStorage.getItem("iet_langbar")) return;
      var nl = ((navigator.languages && navigator.languages[0]) || navigator.language || "").toLowerCase(), base = nl.slice(0, 2);
      if (!base || base === "pt") return;
      var reservar = location.pathname.indexOf("/reservar/") === 0;
      if (reservar && /"(en|es)"/.test(localStorage.getItem("iet_lang") || "")) return;
      var NOMES = { en: "English", es: "Español", fr: "Français", de: "Deutsch", it: "Italiano", nl: "Nederlands", pl: "Polski", ru: "Русский", ja: "日本語", ko: "한국어", zh: "中文" };
      function alt(l) { var e = document.querySelector('link[rel="alternate"][hreflang^="' + l + '"]'); return e ? e.getAttribute("href") : null; }
      function linkReservar(l) { var u = new URL(location.href); u.searchParams.set("lang", l); return u.pathname + u.search; }
      var ops = [];
      if (reservar) { ops = [["en", linkReservar("en")], ["es", linkReservar("es")]]; if (base === "es") ops.reverse(); }
      else {
        var ls = [base, "en", "es"].filter(function (l, i, a) { return NOMES[l] && a.indexOf(l) === i; });
        ls.forEach(function (l) { var u = alt(l); if (u) ops.push([l, u]); });
      }
      if (!ops.length) return;
      var msg = base === "es" ? "Esta página está en portugués:" : base === "fr" ? "Cette page est en portugais :" : base === "it" ? "Questa pagina è in portoghese:" : base === "de" ? "Diese Seite ist auf Portugiesisch:" : "This page is in Portuguese:";
      var st = document.createElement("style");
      st.textContent = ".iet-lb{display:flex;align-items:center;justify-content:center;gap:8px;flex-wrap:wrap;padding:8px 40px 8px 12px;background:#141414;border-bottom:1px solid rgba(212,175,55,.35);color:#f0ede8;font:14px/1.3 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;position:fixed;top:0;left:0;right:0;z-index:10000}.iet-lb a{color:#000;background:#d4af37;border-radius:6px;padding:4px 11px;font-weight:700;text-decoration:none}@media(max-width:480px){.iet-lb{font-size:12.5px;gap:6px}.iet-lb a{padding:3px 9px}}.iet-lb button{position:absolute;right:8px;top:50%;transform:translateY(-50%);background:none;border:0;color:#f0ede8;font-size:22px;line-height:1;cursor:pointer;padding:4px 8px}";
      document.head.appendChild(st);
      var bar = document.createElement("div"); bar.className = "iet-lb notranslate"; bar.setAttribute("translate", "no"); bar.setAttribute("role", "region"); bar.setAttribute("aria-label", "Language");
      var sp = document.createElement("span"); sp.textContent = msg; bar.appendChild(sp);
      ops.forEach(function (o) { var a = document.createElement("a"); a.href = o[1]; a.hreflang = o[0]; a.textContent = NOMES[o[0]]; a.addEventListener("click", function () { try { localStorage.setItem("iet_langbar", "1"); } catch (e) {} }); bar.appendChild(a); });
      var x = document.createElement("button"); x.type = "button"; x.setAttribute("aria-label", "Close"); x.textContent = "×";
      bar.appendChild(x);
      document.body.insertBefore(bar, document.body.firstChild);
      /* a barra fica fixa no topo: empurra a página e o menu fixo para baixo enquanto estiver aberta */
      var fixos = [], padOrig = document.body.style.paddingTop;
      Array.prototype.forEach.call(document.querySelectorAll("body > *, header, .nav, nav"), function (el) {
        if (el === bar) return; var cs = getComputedStyle(el);
        if ((cs.position === "fixed" || cs.position === "sticky") && parseFloat(cs.top) < 5 && fixos.indexOf(el) < 0) fixos.push(el);
      });
      function ajustar() {
        if (!bar.isConnected) return;
        var hb = bar.offsetHeight;
        document.body.style.paddingTop = "calc(" + (padOrig || "0px") + " + " + hb + "px)";
        fixos.forEach(function (el) { el.style.top = hb + "px"; });
      }
      ajustar(); addEventListener("resize", ajustar);
      x.addEventListener("click", function () {
        bar.remove(); document.body.style.paddingTop = padOrig; fixos.forEach(function (el) { el.style.top = ""; });
        try { localStorage.setItem("iet_langbar", "1"); } catch (e) {}
      });
    } catch (e) {}
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar); else iniciar();
})();
