/* Stories da página inicial, no estilo do Instagram (conteúdo cadastrado no painel → Stories) */
(function () {
  "use strict";
  var box = document.getElementById("iet-stories");
  if (!box || !window.fetch) return;
  var VISTO = "iet_stories_vistos";
  function vistos() { try { return JSON.parse(localStorage.getItem(VISTO) || "[]"); } catch (e) { return []; } }
  function marcar(id) { try { var v = vistos(); if (v.indexOf(id) < 0) { v.push(id); localStorage.setItem(VISTO, JSON.stringify(v.slice(-60))); } } catch (e) {} }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  var css = ".ist-wrap{max-width:1200px;margin:0 auto;padding:22px 20px 6px}" +
    ".ist-row{display:flex;gap:18px;overflow-x:auto;scrollbar-width:none;padding:4px 2px 8px;scroll-snap-type:x proximity}.ist-row::-webkit-scrollbar{display:none}" +
    ".ist-b{all:unset;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:8px;width:86px;flex:none;scroll-snap-align:start}" +
    ".ist-r{width:78px;height:78px;border-radius:50%;padding:3px;background:conic-gradient(from 200deg,#f6e3a1,#d4af37,#9c7a2a,#f0d77b,#d4af37);transition:transform .2s}" +
    ".ist-b:hover .ist-r{transform:scale(1.05)}.ist-b.visto .ist-r{background:rgba(212,175,55,.28)}" +
    ".ist-r span{display:block;width:100%;height:100%;border-radius:50%;border:3px solid #0b0b0b;background:#151515 center/cover no-repeat}" +
    ".ist-b small{font:500 12px/1.2 Montserrat,system-ui,sans-serif;color:#e9e4da;max-width:86px;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
    ".ist-v{position:fixed;inset:0;z-index:20000;background:rgba(0,0,0,.94);display:flex;align-items:center;justify-content:center}" +
    ".ist-c{position:relative;width:min(100vw,calc(100vh*9/16));height:min(100vh,calc(100vw*16/9));max-height:100vh;background:#000;overflow:hidden;border-radius:14px}" +
    "@media(max-width:700px){.ist-c{width:100vw;height:100%;height:100dvh;border-radius:0}}" +
    ".ist-c img,.ist-c video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;background:#000}" +
    ".ist-bars{position:absolute;top:10px;left:10px;right:10px;display:flex;gap:4px;z-index:3}.ist-bars i{flex:1;height:3px;border-radius:2px;background:rgba(255,255,255,.35);overflow:hidden}.ist-bars i b{display:block;height:100%;width:0;background:#fff}" +
    ".ist-h{position:absolute;top:22px;left:12px;right:12px;display:flex;align-items:center;gap:10px;z-index:3;color:#fff;font:600 13px Montserrat,system-ui,sans-serif;text-shadow:0 1px 3px rgba(0,0,0,.6)}" +
    ".ist-h em{font-style:normal;width:32px;height:32px;border-radius:50%;display:grid;place-items:center;background:#0b0b0b;border:1px solid #d4af37;color:#d4af37;font:700 9px Georgia,serif;letter-spacing:.06em}" +
    ".ist-x,.ist-s{all:unset;cursor:pointer;margin-left:auto;width:36px;height:36px;display:grid;place-items:center;font-size:26px;color:#fff}.ist-s{margin-left:0;font-size:18px}" +
    ".ist-p,.ist-n{position:absolute;top:70px;bottom:90px;z-index:2;cursor:pointer}.ist-p{left:0;width:35%}.ist-n{right:0;width:65%}" +
    ".ist-cta{position:absolute;left:50%;bottom:26px;transform:translateX(-50%);z-index:3;text-decoration:none;background:linear-gradient(135deg,#f0d77b,#c9a84c 55%,#9c7a2a);color:#111;font:700 14px Montserrat,system-ui,sans-serif;letter-spacing:.04em;padding:13px 26px;border-radius:30px;box-shadow:0 10px 30px -8px rgba(0,0,0,.7);white-space:nowrap}" +
    ".ist-ar{position:absolute;top:50%;transform:translateY(-50%);all:unset;cursor:pointer;color:#fff;font-size:34px;width:48px;height:48px;display:grid;place-items:center;z-index:20001;opacity:.8}" +
    "@media(max-width:700px){.ist-ar{display:none}}";

  fetch("/api/stories").then(function (r) { return r.json(); }).then(function (r) {
    var S = (r && r.stories) || [];
    if (!S.length) return;
    var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
    var v = vistos();
    box.innerHTML = '<div class="ist-row" role="list">' + S.map(function (s, i) {
      var capa = s.capa || (s.tipo === "imagem" ? s.midia : "");
      return '<button type="button" class="ist-b' + (v.indexOf(s.id) >= 0 ? " visto" : "") + '" data-i="' + i + '" role="listitem" aria-label="Ver story: ' + esc(s.titulo) + '"><span class="ist-r"><span style="' + (capa ? "background-image:url('/m/" + esc(capa) + "')" : "") + '"></span></span><small>' + esc(s.titulo) + "</small></button>";
    }).join("") + "</div>";
    box.hidden = false;
    box.addEventListener("click", function (e) { var b = e.target.closest("[data-i]"); if (b) abrir(+b.dataset.i); });

    var ov, atual, timer, raf, ini, dur, som = true;
    function fechar() {
      clearTimeout(timer); cancelAnimationFrame(raf);
      if (ov) { var vd = ov.querySelector("video"); if (vd) vd.pause(); ov.remove(); ov = null; }
      document.documentElement.style.overflow = ""; document.removeEventListener("keydown", tecla);
    }
    function tecla(e) { if (e.key === "Escape") fechar(); else if (e.key === "ArrowRight") ir(atual + 1); else if (e.key === "ArrowLeft") ir(atual - 1); }
    function ir(i) { if (i < 0) i = 0; if (i >= S.length) return fechar(); mostrar(i); }
    function progresso() {
      var p = Math.min(1, (Date.now() - ini) / dur), b = ov && ov.querySelectorAll(".ist-bars i b")[atual];
      if (b) b.style.width = (p * 100) + "%";
      if (p < 1) raf = requestAnimationFrame(progresso);
    }
    function mostrar(i) {
      clearTimeout(timer); cancelAnimationFrame(raf); atual = i; var s = S[i];
      marcar(s.id); var bt = box.querySelector('[data-i="' + i + '"]'); if (bt) bt.classList.add("visto");
      var c = ov.querySelector(".ist-c"), old = c.querySelector("img,video"); if (old) { if (old.pause) old.pause(); old.remove(); }
      [].forEach.call(ov.querySelectorAll(".ist-bars i b"), function (b, k) { b.style.width = k < i ? "100%" : "0"; });
      ov.querySelector(".ist-h span").textContent = s.titulo;
      var cta = ov.querySelector(".ist-cta");
      if (s.link) { cta.hidden = false; cta.href = s.link; cta.textContent = s.cta || "Reservar agora"; } else cta.hidden = true;
      ov.querySelector(".ist-s").hidden = s.tipo !== "video";
      var m;
      if (s.tipo === "video") {
        m = document.createElement("video"); m.src = "/m/" + s.midia; m.playsInline = true; m.setAttribute("playsinline", ""); m.muted = !som; m.preload = "auto";
        if (s.capa) m.poster = "/m/" + s.capa;
        m.addEventListener("loadedmetadata", function () { dur = (m.duration && isFinite(m.duration) ? m.duration : 15) * 1000; ini = Date.now(); progresso(); timer = setTimeout(function () { ir(atual + 1); }, dur + 150); });
        m.addEventListener("ended", function () { ir(atual + 1); });
        c.insertBefore(m, c.firstChild);
        var pr = m.play(); if (pr && pr.catch) pr.catch(function () { m.muted = true; som = false; atualizaSom(); m.play().catch(function () {}); });
      } else {
        m = document.createElement("img"); m.src = "/m/" + s.midia; m.alt = s.titulo; c.insertBefore(m, c.firstChild);
        dur = 6000; ini = Date.now(); progresso(); timer = setTimeout(function () { ir(atual + 1); }, dur);
      }
      if (window.gtag) try { gtag("event", "story_view", { story: s.titulo }); } catch (e) {}
    }
    function atualizaSom() { var b = ov && ov.querySelector(".ist-s"); if (b) b.textContent = som ? "🔊" : "🔇"; }
    function abrir(i) {
      ov = document.createElement("div"); ov.className = "ist-v"; ov.setAttribute("role", "dialog"); ov.setAttribute("aria-label", "Stories");
      ov.innerHTML = '<button type="button" class="ist-ar" style="left:calc(50% - min(50vw,calc(50vh*9/16)) - 60px)" aria-label="Anterior">‹</button>' +
        '<div class="ist-c"><div class="ist-bars">' + S.map(function () { return "<i><b></b></i>"; }).join("") + '</div>' +
        '<div class="ist-h"><em>IET</em><span></span><button type="button" class="ist-s" aria-label="Som"></button><button type="button" class="ist-x" aria-label="Fechar">×</button></div>' +
        '<div class="ist-p"></div><div class="ist-n"></div><a class="ist-cta" hidden></a></div>' +
        '<button type="button" class="ist-ar" style="right:calc(50% - min(50vw,calc(50vh*9/16)) - 60px)" aria-label="Próximo">›</button>';
      document.body.appendChild(ov); document.documentElement.style.overflow = "hidden"; document.addEventListener("keydown", tecla);
      ov.querySelector(".ist-x").onclick = fechar;
      ov.querySelector(".ist-p").onclick = function () { ir(atual - 1); };
      ov.querySelector(".ist-n").onclick = function () { ir(atual + 1); };
      var ar = ov.querySelectorAll(".ist-ar"); ar[0].onclick = function () { ir(atual - 1); }; ar[1].onclick = function () { ir(atual + 1); };
      ov.querySelector(".ist-s").onclick = function () { som = !som; var vd = ov.querySelector("video"); if (vd) vd.muted = !som; atualizaSom(); };
      ov.addEventListener("click", function (e) { if (e.target === ov) fechar(); });
      ov.querySelector(".ist-cta").addEventListener("click", function () { if (window.gtag) try { gtag("event", "story_cta", { story: S[atual].titulo }); } catch (e) {} });
      atualizaSom(); mostrar(i);
    }
  }).catch(function () {});
})();
