/* Instalar o site como app no celular (Android: botão; iPhone: instrução "Adicionar à Tela de Início") */
(function () {
  "use strict";
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
