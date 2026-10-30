/* Home — interações leves (só index.html) */
(function () {
  "use strict";
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };

  // barra de progresso + barra fixa no celular + parallax suave do topo
  var prog = document.createElement("div"); prog.className = "h-prog"; document.body.appendChild(prog);
  var mbar = document.querySelector(".h-mbar"), heroBg = document.querySelector(".hero-bg");
  var ticking = false;
  function onScroll() {
    ticking = false;
    var y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
    prog.style.setProperty("--p", max > 0 ? (y / max).toFixed(4) : 0);
    if (mbar) mbar.classList.toggle("on", y > innerHeight * 0.6);
    if (heroBg && !reduce && y < innerHeight * 1.2) heroBg.style.translate = "0 " + (y * 0.25).toFixed(1) + "px";
  }
  addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  // o main.js atrasa cada card pela posição na página inteira (até ~1,5 s); aqui o atraso passa a ser só dentro do grupo
  $$(".scard, .dif-item, .dest-col, .passo, .faq-item, .stat-card").forEach(function (el) {
    var i = Array.prototype.indexOf.call(el.parentNode.children, el);
    el.style.transitionDelay = Math.min(i, 6) * 0.07 + "s";
    el.addEventListener("transitionend", function f(e) { if (e.propertyName === "opacity") { el.style.transitionDelay = "0s"; el.removeEventListener("transitionend", f); } });
  });

  // contador nos números do topo
  if (!reduce) $$(".stat-n").forEach(function (el) {
    var node = el.firstChild; if (!node || node.nodeType !== 3) return;
    var alvo = parseInt(node.nodeValue, 10); if (!alvo) return;
    var t0 = null; node.nodeValue = "0";
    setTimeout(function () {
      requestAnimationFrame(function step(ts) {
        if (!t0) t0 = ts; var p = Math.min(1, (ts - t0) / 1400), e = 1 - Math.pow(1 - p, 3);
        node.nodeValue = String(Math.round(alvo * e));
        if (p < 1) requestAnimationFrame(step);
      });
    }, 700);
  });

  // brilho que segue o mouse nos cards (só em telas com mouse)
  if (matchMedia("(hover: hover)").matches) {
    $$(".scard, .dest-col, .rsv-card").forEach(function (c) {
      c.classList.add("h-glow");
      c.addEventListener("pointermove", function (e) {
        var r = c.getBoundingClientRect();
        c.style.setProperty("--mx", (e.clientX - r.left) + "px"); c.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
    });
  }

  // entrada suave das seções que o main.js não anima
  var alvo = $$(".sec-header, .dif-left, .rsv-card, .galeria-foz a, .cta-inner > *, .rsv-cta");
  if (reduce || !("IntersectionObserver" in window)) return;
  alvo.forEach(function (el, i) {
    var irmaos = el.parentNode ? Array.prototype.indexOf.call(el.parentNode.children, el) : 0;
    el.style.setProperty("--d", Math.min(irmaos, 6) * 70 + "ms"); el.classList.add("h-rv");
  });
  var io = new IntersectionObserver(function (en) {
    en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("h-in"); io.unobserve(x.target); } });
  }, { rootMargin: "0px 0px -60px 0px" });
  alvo.forEach(function (el) { io.observe(el); });
})();
