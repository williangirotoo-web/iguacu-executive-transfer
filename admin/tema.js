/* Painel: botão de modo claro / escuro (fica salvo neste navegador) */
(function () {
  "use strict";
  var KEY = "iet_admin_tema", html = document.documentElement, tema = "escuro";
  try { tema = localStorage.getItem(KEY) || (window.matchMedia && matchMedia("(prefers-color-scheme: light)").matches ? "claro" : "escuro"); } catch (e) {}
  html.setAttribute("data-tema", tema);
  var css = "html[data-tema=claro]{--bg:#f5f3ee;--bg2:#ffffff;--bg3:#f2efe7;--line:rgba(140,110,20,.28);--txt:#1d1b16;--mut:rgba(29,27,22,.62);--gold:#8c6d0c;color-scheme:light}" +
    "html[data-tema=claro] body{background:var(--bg);color:var(--txt)}" +
    "html[data-tema=claro] input,html[data-tema=claro] select,html[data-tema=claro] textarea{background:#fff!important;color:var(--txt)!important;border-color:rgba(29,27,22,.22)!important}" +
    "html[data-tema=claro] .btn{color:#fff}html[data-tema=claro] .btn.gh,html[data-tema=claro] .btn.del{color:var(--txt)}html[data-tema=claro] .chip{color:var(--txt)}html[data-tema=claro] .chip.on{color:#fff}" +
    "html[data-tema=claro] td,html[data-tema=claro] th{border-bottom-color:rgba(29,27,22,.08)!important}html[data-tema=claro] .item{border-color:rgba(29,27,22,.12);background:var(--bg3)}" +
    "html[data-tema=claro] .chat .b.a{background:var(--bg3);border-color:rgba(29,27,22,.1)}html[data-tema=claro] .lin{border-bottom-color:rgba(29,27,22,.08)}" +
    "html[data-tema=claro] .link,html[data-tema=claro] .ev{background:transparent}html[data-tema=claro] header{box-shadow:0 1px 0 rgba(0,0,0,.04)}" +
    "html[data-tema=claro] .mg.pos{color:#1e7a34}html[data-tema=claro] .mg.neg{color:#b3261e}html[data-tema=claro] .tag{background:#e8eef0;color:#37474f}html[data-tema=claro] .tag.c{background:#dff0e1;color:#1e5e2a}html[data-tema=claro] .tag.h{background:#fff1c2;color:#6b5300}" +
    "html[data-tema=claro] .st-solicitacao,html[data-tema=claro] .st-novo{background:#fff1c2;color:#6b5300}html[data-tema=claro] .st-pagamento_pendente{background:#ffe8a3;color:#6b4f00}html[data-tema=claro] .st-aprovado{background:#d7f0f5;color:#0b5566}html[data-tema=claro] .st-aguardando_confirmacao{background:#eee0f5;color:#5e2d77}html[data-tema=claro] .st-confirmada{background:#dff0e1;color:#1e5e2a}html[data-tema=claro] .st-concluida,html[data-tema=claro] .st-pausado{background:#e8eef0;color:#37474f}html[data-tema=claro] .st-cancelada,html[data-tema=claro] .st-recusado{background:#fbe1df;color:#8c1d18}" +
    ".tema-bt{background:transparent;border:1px solid var(--line);color:var(--txt);border-radius:20px;padding:5px 12px;font:inherit;font-size:12px;cursor:pointer;margin-left:10px;white-space:nowrap}.tema-bt:hover{border-color:var(--gold)}";
  var st = document.createElement("style"); st.textContent = css; (document.head || html).appendChild(st);
  function rotulo() { return html.getAttribute("data-tema") === "claro" ? "🌙 Modo escuro" : "☀️ Modo dia"; }
  function botao() {
    var h = document.querySelector("header"); if (!h || h.querySelector(".tema-bt")) return;
    var b = document.createElement("button"); b.type = "button"; b.className = "tema-bt"; b.textContent = rotulo();
    b.onclick = function () {
      var novo = html.getAttribute("data-tema") === "claro" ? "escuro" : "claro";
      html.setAttribute("data-tema", novo); b.textContent = rotulo();
      try { localStorage.setItem(KEY, novo); } catch (e) {}
    };
    var who = h.querySelector("#who");
    if (who && who.parentNode === h) { var w = document.createElement("div"); w.style.cssText = "display:flex;align-items:center"; h.insertBefore(w, who); w.appendChild(who); w.appendChild(b); }
    else h.appendChild(b);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", botao); else botao();
})();
