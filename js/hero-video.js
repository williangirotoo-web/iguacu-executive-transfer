/* Vídeo de fundo no topo da página (versão leve no celular; foto parada se o aparelho pede menos movimento ou economia de dados) */
(function () {
  "use strict";
  var v = document.querySelector("[data-hero-video]"); if (!v) return;
  var m = window.matchMedia && matchMedia("(max-width:760px)").matches;
  var rm = window.matchMedia && matchMedia("(prefers-reduced-motion:reduce)").matches;
  var sd = navigator.connection && navigator.connection.saveData;
  if (m) v.poster = v.dataset.posterM;
  if (rm || sd) { v.removeAttribute("autoplay"); return; }
  v.src = m ? v.dataset.srcM : v.dataset.srcD;
  v.addEventListener("playing", function () { v.classList.add("on"); });
  var p = v.play(); if (p && p.catch) p.catch(function () {});
})();
