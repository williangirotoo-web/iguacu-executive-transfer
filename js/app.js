/* Instalar o site como app no celular (Android: botão; iPhone: instrução "Adicionar à Tela de Início") */
(function () {
  "use strict";
  /* link de indicação (?ref=CUPOM): guarda por 30 dias; o cupom é aplicado sozinho na reserva */
  try {
    var ref = new URLSearchParams(location.search).get("ref");
    if (ref && /^[A-Za-z0-9-]{3,30}$/.test(ref)) localStorage.setItem("iet_ref", JSON.stringify({ c: ref.toUpperCase(), ate: Date.now() + 30 * 864e5 }));
  } catch (e) {}
  /* contador de visitas do próprio site (sem cookies; mostra no painel em Visitas) */
  try {
    if (!/^\/(admin|motorista|parceiro)\b/.test(location.pathname) && navigator.sendBeacon && !navigator.webdriver) {
      navigator.sendBeacon("/api/visita", new Blob([JSON.stringify({ p: location.pathname, r: document.referrer, u: location.search })], { type: "text/plain" }));
    }
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
      /* primeira visita de estrangeiro: janela de boas-vindas com os idiomas (robôs de busca não veem) */
      var bot = navigator.webdriver || /bot|crawl|spider|slurp|lighthouse|headless|google|bing|yandex|baidu|duckduck/i.test(navigator.userAgent || "");
      var visto = false; try { visto = !!localStorage.getItem("iet_lang_vista"); } catch (e) {}
      if (!bot && !visto) { boasVindas(base, ops, reservar, alt, NOMES); return; }
      var msg = base === "es" ? "Esta página está en portugués:" : base === "fr" ? "Cette page est en portugais :" : base === "it" ? "Questa pagina è in portoghese:" : base === "de" ? "Diese Seite ist auf Portugiesisch:" : "This page is in Portuguese:";
      var st = document.createElement("style");
      st.textContent = ".iet-lb{display:flex;align-items:center;justify-content:center;gap:8px;flex-wrap:wrap;padding:8px 40px 8px 12px;background:#141414;border-bottom:1px solid rgba(212,175,55,.35);color:#f0ede8;font:14px/1.3 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;position:fixed;top:0;left:0;right:0;z-index:10000}.iet-lb a{color:#000;background:#d4af37;border-radius:6px;padding:4px 11px;font-weight:700;text-decoration:none}.iet-lb a{min-height:32px;display:inline-flex;align-items:center}@media(max-width:480px){.iet-lb{font-size:12.5px;gap:6px}.iet-lb a{padding:4px 10px}}.iet-lb button{position:absolute;right:4px;top:50%;transform:translateY(-50%);background:none;border:0;color:#f0ede8;font-size:22px;line-height:1;cursor:pointer;padding:10px 12px;min-width:44px;min-height:44px}";
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
  var BV = {
    en: ["Welcome!", "This page is in Portuguese. Choose your language:"], es: ["¡Bienvenido!", "Esta página está en portugués. Elija su idioma:"],
    fr: ["Bienvenue !", "Cette page est en portugais. Choisissez votre langue :"], de: ["Willkommen!", "Diese Seite ist auf Portugiesisch. Wählen Sie Ihre Sprache:"],
    it: ["Benvenuto!", "Questa pagina è in portoghese. Scegli la tua lingua:"], nl: ["Welkom!", "Deze pagina is in het Portugees. Kies uw taal:"],
    pl: ["Witamy!", "Ta strona jest po portugalsku. Wybierz język:"], ru: ["Добро пожаловать!", "Эта страница на португальском. Выберите язык:"],
    ko: ["환영합니다!", "이 페이지는 포르투갈어로 되어 있습니다. 언어를 선택하세요:"], ja: ["ようこそ！", "このページはポルトガル語です。言語を選んでください："],
    zh: ["欢迎！", "此页面为葡萄牙语。请选择您的语言："]
  };
  var BANDEIRA = { en: "🇬🇧", es: "🇪🇸", fr: "🇫🇷", de: "🇩🇪", it: "🇮🇹", nl: "🇳🇱", pl: "🇵🇱", ru: "🇷🇺", ja: "🇯🇵", ko: "🇰🇷", zh: "🇨🇳", pt: "🇧🇷" };
  function boasVindas(base, ops, reservar, alt, NOMES) {
    var t = BV[base] || BV.en;
    function marcar(l) { try { localStorage.setItem("iet_lang_vista", "1"); if (l) localStorage.setItem("iet_idioma", l); if (l === "pt") localStorage.setItem("iet_langbar", "1"); } catch (e) {} }
    // idiomas: o do visitante (se a página tiver), inglês e espanhol; a página inicial do idioma serve de reserva
    var HOME = { en: "/en/index.html", es: "/es/index.html", fr: "/fr/index.html", ja: "/ja/index.html", zh: "/zh/index.html" };
    var lista = ops.slice();
    if (!reservar && base !== "en" && base !== "es" && !lista.some(function (o) { return o[0] === base; }) && HOME[base]) lista.unshift([base, HOME[base]]);
    ["en", "es"].forEach(function (l) { if (!lista.some(function (o) { return o[0] === l; })) lista.push([l, reservar ? location.pathname + "?lang=" + l : (alt(l) || HOME[l])]); });
    var st = document.createElement("style");
    st.textContent = ".iet-bv{position:fixed;inset:0;z-index:10001;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(0,0,0,.62);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);animation:ietbv .25s ease}" +
      "@keyframes ietbv{from{opacity:0}to{opacity:1}}" +
      ".iet-bv-c{position:relative;width:100%;max-width:400px;background:#111214;border:1px solid rgba(212,175,55,.45);border-radius:18px;padding:28px 22px 20px;color:#f2efe9;font:15px/1.45 Montserrat,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;text-align:center;box-shadow:0 30px 80px -20px rgba(0,0,0,.8)}" +
      ".iet-bv-c b.t{display:block;font:600 24px/1.2 'Cormorant Garamond',Georgia,serif;color:#f0d77b;margin:0 0 6px}" +
      ".iet-bv-c p{margin:0 0 18px;color:rgba(242,239,233,.75);font-size:14px}" +
      ".iet-bv-l{display:flex;flex-direction:column;gap:10px}" +
      ".iet-bv-l a{display:flex;align-items:center;justify-content:center;gap:10px;min-height:48px;border-radius:12px;background:#d4af37;color:#111;font-weight:700;text-decoration:none;font-size:15px}" +
      ".iet-bv-l a+a{background:transparent;color:#f2efe9;border:1px solid rgba(242,239,233,.22)}" +
      ".iet-bv-l a span{font-size:20px;line-height:1}" +
      ".iet-bv-pt{display:inline-block;margin-top:14px;background:none;border:0;color:rgba(242,239,233,.6);font:inherit;font-size:13px;text-decoration:underline;cursor:pointer}" +
      ".iet-bv-x{position:absolute;top:8px;right:10px;width:36px;height:36px;border:0;background:none;color:rgba(242,239,233,.6);font-size:24px;cursor:pointer}";
    document.head.appendChild(st);
    var bg = document.createElement("div"); bg.className = "iet-bv notranslate"; bg.setAttribute("translate", "no");
    var c = document.createElement("div"); c.className = "iet-bv-c"; c.setAttribute("role", "dialog"); c.setAttribute("aria-modal", "true"); c.setAttribute("aria-label", "Language");
    var tt = document.createElement("b"); tt.className = "t"; tt.textContent = t[0];
    var pp = document.createElement("p"); pp.textContent = t[1];
    var l = document.createElement("div"); l.className = "iet-bv-l";
    lista.slice(0, 4).forEach(function (o) {
      if (!o[1]) return;
      var a = document.createElement("a"); a.href = o[1]; a.hreflang = o[0];
      var f = document.createElement("span"); f.textContent = BANDEIRA[o[0]] || "🌐"; a.appendChild(f); a.appendChild(document.createTextNode(NOMES[o[0]]));
      a.addEventListener("click", function () { marcar(o[0]); });
      l.appendChild(a);
    });
    var pt = document.createElement("button"); pt.type = "button"; pt.className = "iet-bv-pt"; pt.textContent = BANDEIRA.pt + " Continuar em português";
    var x = document.createElement("button"); x.type = "button"; x.className = "iet-bv-x"; x.setAttribute("aria-label", "Close"); x.textContent = "×";
    function fechar(l2) { marcar(l2); bg.remove(); document.removeEventListener("keydown", esc); }
    function esc(e) { if (e.key === "Escape") fechar(); }
    pt.addEventListener("click", function () { fechar("pt"); });
    x.addEventListener("click", function () { fechar(); });
    bg.addEventListener("click", function (e) { if (e.target === bg) fechar(); });
    document.addEventListener("keydown", esc);
    c.appendChild(x); c.appendChild(tt); c.appendChild(pp); c.appendChild(l); c.appendChild(pt); bg.appendChild(c);
    document.body.appendChild(bg);
    var p1 = l.querySelector("a"); if (p1) try { p1.focus({ preventScroll: true }); } catch (e) {}
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar); else iniciar();
})();
