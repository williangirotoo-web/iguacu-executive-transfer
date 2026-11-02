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

  // números que sobem contando (página Sobre)
  var cnt = $$("[data-cnt]");
  if (cnt.length && "IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var ioC = new IntersectionObserver(function (en) {
      en.forEach(function (x) {
        if (!x.isIntersecting) return; ioC.unobserve(x.target);
        var el = x.target, alvo = +el.getAttribute("data-cnt"), ini = alvo > 1000 ? alvo - 13 : 0, t0 = null;
        requestAnimationFrame(function passo(ts) {
          if (!t0) t0 = ts; var p = Math.min(1, (ts - t0) / 1300), e = 1 - Math.pow(1 - p, 3);
          el.textContent = String(Math.round(ini + (alvo - ini) * e));
          if (p < 1) requestAnimationFrame(passo);
        });
      });
    }, { threshold: .6 });
    cnt.forEach(function (el) { ioC.observe(el); });
  }

  // botão "Compartilhar este pacote": compartilha o endereço canônico da página (sem parâmetros)
  var shTxt = { pt: { t: "Mandar este pacote", wa: "WhatsApp", cp: "Copiar link", ok: "Link copiado" }, en: { t: "Send this package", wa: "WhatsApp", cp: "Copy link", ok: "Link copied" }, es: { t: "Enviar este paquete", wa: "WhatsApp", cp: "Copiar enlace", ok: "Enlace copiado" } }[lang] || null;
  if (!shTxt) shTxt = { t: "Mandar este pacote", wa: "WhatsApp", cp: "Copiar link", ok: "Link copiado" };
  $$("[data-share]").forEach(function (b) {
    b.addEventListener("click", function () {
      var c = document.querySelector('link[rel="canonical"]'), url = c ? c.href : location.origin + location.pathname;
      var txt = b.getAttribute("data-share-t") || document.title;
      if (typeof gtag === "function") gtag("event", "share", { method: navigator.share ? "nativo" : "caixa", item_id: location.pathname });
      if (navigator.share) { navigator.share({ title: document.title, text: txt, url: url }).catch(function () {}); return; }
      var old = document.querySelector(".a-sharebox"); if (old) old.remove();
      var box = document.createElement("div"); box.className = "a-sharebox"; box.setAttribute("role", "dialog");
      box.innerHTML = '<p></p><a class="a-btn a-wa" target="_blank" rel="noopener"></a><button type="button" class="a-btn a-ghost a-cp"></button><button type="button" class="a-x" aria-label="Fechar">×</button>';
      box.querySelector("p").textContent = shTxt.t;
      var w = box.querySelector("a"); w.textContent = shTxt.wa; w.href = "https://wa.me/?text=" + encodeURIComponent(txt + "\n" + url);
      var cp = box.querySelector(".a-cp"); cp.textContent = shTxt.cp;
      cp.addEventListener("click", function () {
        var ok = function () { cp.textContent = shTxt.ok; };
        if (navigator.clipboard) navigator.clipboard.writeText(url).then(ok, function () { prompt("", url); }); else prompt("", url);
      });
      box.querySelector(".a-x").addEventListener("click", function () { box.remove(); });
      document.body.appendChild(box);
    });
  });

  // conversões: clique no WhatsApp ou no telefone vira "generate_lead" no Google Analytics (igual às páginas antigas)
  if (!document.getElementById("iet-track")) document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a"); if (!a || typeof gtag !== "function") return;
    var h = a.getAttribute("href") || "", t = h.indexOf("wa.me") > -1 ? "whatsapp" : (h.indexOf("tel:") === 0 ? "telefone" : "");
    if (!t) return;
    gtag("event", "generate_lead", { method: t, page_path: location.pathname, link_text: (a.textContent || "").trim().slice(0, 60) });
    gtag("event", "clique_" + t, { page_path: location.pathname });
  });

  var bar = document.querySelector(".a-mbar");
  addEventListener("scroll", function () { if (bar) bar.classList.toggle("on", scrollY > innerHeight * 0.7); }, { passive: true });

  var els = $$(".rv");
  if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) { els.forEach(function (e) { e.classList.add("in"); }); return; }
  els.forEach(function (e) { var i = Array.prototype.indexOf.call(e.parentNode.children, e); e.style.setProperty("--d", Math.min(i, 6) * 60 + "ms"); });
  var io = new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); } }); }, { rootMargin: "0px 0px -50px 0px" });
  els.forEach(function (e) { io.observe(e); });
})();
