/* Botões flutuantes: WhatsApp + assistente de reservas com IA.
   A IA só conversa; o preço mostrado vem do motor do site (/api/assistente → cotacao.js). */
(function () {
  "use strict";
  if (window.__ietAssist) return; window.__ietAssist = 1;
  var WA = "5545991185798";
  var L = (document.documentElement.lang || "pt").slice(0, 2); if (L !== "en" && L !== "es") L = "pt";
  var T = {
    pt: { abrir: "Tire suas dúvidas", tit: "Assistente de reservas", sub: "Responde na hora · preço do site", ola: "Olá! Sou o assistente da Iguaçu Executive Transfer. Me conte para onde você quer ir, a data e quantas pessoas — eu mostro o preço na hora.",
      chips: ["Aeroporto → hotel", "Cataratas", "Compras no Paraguai", "Argentina"], ph: "Escreva sua mensagem…", env: "Enviar", wa: "Falar no WhatsApp", waTxt: "Olá! Vim pelo site e gostaria de um orçamento.", res: "Reservar", porCarro: "por carro · preço fechado", ate: "até {p} pessoas e {m} malas",
      erro: "Não consegui responder agora. Pode tentar de novo ou chamar no WhatsApp.", limite: "Muitas mensagens seguidas. Fale com a gente no WhatsApp.", nenhum: "Para esses dados não consigo reservar pelo site. Fale com a equipe no WhatsApp.", antec: "Esta data precisa de pelo menos {h} h de antecedência para reservar pelo site. Para antes disso, chame no WhatsApp.",
      aviso: "Assistente com IA. Os valores são calculados pelo sistema do site.", limpar: "Nova conversa", fechar: "Fechar", gerando: "Abrindo a reserva…" },
    en: { abrir: "Ask us", tit: "Booking assistant", sub: "Instant answers · site prices", ola: "Hi! I'm the Iguaçu Executive Transfer assistant. Tell me where you want to go, the date and how many people — I'll show the price right away.",
      chips: ["Airport → hotel", "Iguazu Falls", "Shopping in Paraguay", "Argentina"], ph: "Type your message…", env: "Send", wa: "Chat on WhatsApp", waTxt: "Hello! I found you on the website and would like a quote.", res: "Book", porCarro: "per vehicle · fixed price", ate: "up to {p} people and {m} bags",
      erro: "I couldn't answer right now. Please try again or message us on WhatsApp.", limite: "Too many messages. Please message us on WhatsApp.", nenhum: "I can't book this online with these details. Please message our team on WhatsApp.", antec: "This needs at least {h} h notice to book online. For sooner, message us on WhatsApp.",
      aviso: "AI assistant. Prices are calculated by the website's system.", limpar: "New chat", fechar: "Close", gerando: "Opening your booking…" },
    es: { abrir: "Consúltenos", tit: "Asistente de reservas", sub: "Respuesta inmediata · precio del sitio", ola: "¡Hola! Soy el asistente de Iguaçu Executive Transfer. Dígame adónde quiere ir, la fecha y cuántas personas — le muestro el precio al instante.",
      chips: ["Aeropuerto → hotel", "Cataratas", "Compras en Paraguay", "Argentina"], ph: "Escriba su mensaje…", env: "Enviar", wa: "Hablar por WhatsApp", waTxt: "¡Hola! Los encontré en el sitio y quisiera un presupuesto.", res: "Reservar", porCarro: "por vehículo · precio cerrado", ate: "hasta {p} personas y {m} maletas",
      erro: "No pude responder ahora. Intente de nuevo o escríbanos por WhatsApp.", limite: "Demasiados mensajes. Escríbanos por WhatsApp.", nenhum: "Con estos datos no puedo reservar por el sitio. Escriba a nuestro equipo por WhatsApp.", antec: "Esta fecha necesita al menos {h} h de anticipación para reservar por el sitio. Para antes, escríbanos por WhatsApp.",
      aviso: "Asistente con IA. Los valores los calcula el sistema del sitio.", limpar: "Nueva conversación", fechar: "Cerrar", gerando: "Abriendo la reserva…" }
  }[L];
  function f(s, o) { return s.replace(/\{(\w+)\}/g, function (_, k) { return o[k]; }); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function brl(v) { return "R$ " + Number(v).toLocaleString("pt-BR", { maximumFractionDigits: 2 }); }
  var KEY = "iet_chat_" + L, msgs = [];
  try { msgs = JSON.parse(sessionStorage.getItem(KEY) || "[]"); } catch (e) { msgs = []; }
  function salvar() { try { sessionStorage.setItem(KEY, JSON.stringify(msgs.slice(-30))); } catch (e) {} }
  function waLink(txt) { return "https://wa.me/" + WA + "?text=" + encodeURIComponent(txt || T.waTxt); }
  function resumoWa() {
    var u = msgs.filter(function (m) { return m.role === "user"; }).map(function (m) { return "- " + m.content; }).slice(-6).join("\n");
    return u ? T.waTxt + "\n\n" + u : T.waTxt;
  }

  var ICO_WA = '<svg viewBox="0 0 24 24" width="26" height="26" fill="#fff" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.4.1-.2 0-.3 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.9 11.9 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7.5-.1 1.5-.6 1.7-1.2s.2-1.1.2-1.2-.2-.2-.5-.3z"/></svg>';
  var ICO_IA = '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l1.8 4.6L18 9.4l-4.2 1.8L12 16l-1.8-4.8L6 9.4l4.2-1.8z"/><path d="M19 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/></svg>';
  var css = ".ia-fab{position:fixed;right:28px;bottom:28px;z-index:990;display:flex;flex-direction:column;align-items:flex-end;gap:12px;font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif}" +
    ".ia-fab a,.ia-fab button{all:unset;box-sizing:border-box;cursor:pointer;display:flex;align-items:center;justify-content:center;border-radius:30px;box-shadow:0 10px 30px -8px rgba(0,0,0,.6);transition:transform .2s}" +
    ".ia-fab a:hover,.ia-fab button:hover{transform:translateY(-2px)}" +
    ".ia-fab .ia-b-wa{width:56px;height:56px;background:#25d366}" +
    ".ia-fab .ia-b-ia{height:56px;padding:0 20px 0 16px;gap:9px;background:linear-gradient(135deg,#f0d77b,#c9a84c 55%,#9c7a2a);color:#111;font-weight:700;font-size:14px;letter-spacing:.01em;position:relative}" +
    ".ia-fab .ia-b-ia::after{content:'';position:absolute;inset:-4px;border-radius:34px;border:1px solid rgba(212,179,90,.55);animation:iaPulse 2.6s ease-out infinite}" +
    "@keyframes iaPulse{0%{opacity:.9;transform:scale(1)}100%{opacity:0;transform:scale(1.18)}}" +
    ".ia-box{position:fixed;right:28px;bottom:28px;z-index:1200;width:380px;max-width:calc(100vw - 32px);height:min(600px,calc(100vh - 56px));display:flex;flex-direction:column;background:#0e0f11;border:1px solid rgba(201,168,76,.35);border-radius:18px;box-shadow:0 30px 80px -20px #000;color:#eee;font:14px/1.45 system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;overflow:hidden;opacity:0;transform:translateY(16px) scale(.98);pointer-events:none;transition:opacity .25s,transform .25s}" +
    ".ia-box.on{opacity:1;transform:none;pointer-events:auto}" +
    ".ia-hd{display:flex;align-items:center;gap:10px;padding:14px 14px 12px 16px;border-bottom:1px solid rgba(255,255,255,.07);background:linear-gradient(180deg,rgba(201,168,76,.12),transparent)}" +
    ".ia-hd i{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:rgba(201,168,76,.16);color:#d4b35a;font-style:normal}" +
    ".ia-hd b{display:block;font-size:14.5px;color:#fff}.ia-hd small{display:block;color:#9a9a9a;font-size:11.5px}" +
    ".ia-hd .ia-x{all:unset;cursor:pointer;margin-left:auto;width:32px;height:32px;border-radius:50%;display:grid;place-items:center;color:#aaa;font-size:20px}.ia-hd .ia-x:hover{background:rgba(255,255,255,.07);color:#fff}" +
    ".ia-hd .ia-novo{all:unset;cursor:pointer;color:#9a9a9a;font-size:11.5px;padding:4px 8px;border-radius:8px}.ia-hd .ia-novo:hover{color:#fff;background:rgba(255,255,255,.06)}" +
    ".ia-msgs{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px;overscroll-behavior:contain}" +
    ".ia-m{max-width:86%;padding:10px 13px;border-radius:14px;white-space:pre-wrap;word-wrap:break-word}" +
    ".ia-m.bot{background:#1a1b1e;border:1px solid rgba(255,255,255,.06);border-bottom-left-radius:4px}" +
    ".ia-m.eu{align-self:flex-end;background:#c9a84c;color:#111;border-bottom-right-radius:4px}" +
    ".ia-chips{display:flex;flex-wrap:wrap;gap:6px}.ia-chips button{all:unset;cursor:pointer;border:1px solid rgba(201,168,76,.45);color:#e6cf86;border-radius:20px;padding:6px 12px;font-size:12.5px}.ia-chips button:hover{background:rgba(201,168,76,.12)}" +
    ".ia-cot{display:flex;flex-direction:column;gap:7px;width:100%}" +
    ".ia-cot .c{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid rgba(201,168,76,.28);border-radius:12px;background:#141518}" +
    ".ia-cot .c div{flex:1;min-width:0}.ia-cot .c b{display:block;color:#fff;font-size:13.5px}.ia-cot .c small{color:#8f8f8f;font-size:11.5px}" +
    ".ia-cot .c strong{color:#d4b35a;font-size:15px;white-space:nowrap}" +
    ".ia-cot .c button{all:unset;cursor:pointer;background:#c9a84c;color:#111;font-weight:700;font-size:12px;padding:7px 11px;border-radius:9px}.ia-cot .c button:hover{background:#e0c066}" +
    ".ia-cot p{margin:0;color:#8f8f8f;font-size:11.5px}" +
    ".ia-wa{all:unset;cursor:pointer;display:inline-flex;align-items:center;gap:7px;background:#25d366;color:#fff;font-weight:600;font-size:13px;padding:8px 13px;border-radius:10px;align-self:flex-start}" +
    ".ia-wa svg{width:17px;height:17px}" +
    ".ia-dots{display:inline-flex;gap:4px}.ia-dots span{width:6px;height:6px;border-radius:50%;background:#888;animation:iaDot 1s infinite}.ia-dots span:nth-child(2){animation-delay:.15s}.ia-dots span:nth-child(3){animation-delay:.3s}" +
    "@keyframes iaDot{0%,80%,100%{opacity:.3}40%{opacity:1}}" +
    ".ia-ft{border-top:1px solid rgba(255,255,255,.07);padding:10px 12px 8px}" +
    ".ia-in{display:flex;gap:8px;align-items:flex-end}" +
    ".ia-in textarea{flex:1;resize:none;max-height:110px;min-height:40px;background:#17181b;border:1px solid rgba(255,255,255,.1);border-radius:12px;color:#eee;font:inherit;font-size:16px;padding:9px 12px;outline:none}" +
    ".ia-in textarea:focus{border-color:rgba(201,168,76,.6)}" +
    ".ia-in button{all:unset;cursor:pointer;width:40px;height:40px;border-radius:12px;background:#c9a84c;color:#111;display:grid;place-items:center}.ia-in button:disabled{opacity:.5;cursor:default}" +
    ".ia-av{display:flex;justify-content:space-between;gap:8px;margin-top:6px;font-size:10.5px;color:#777}.ia-av a{color:#25d366;text-decoration:none;white-space:nowrap}" +
    "@media(max-width:760px){.ia-fab{right:14px;bottom:86px}.ia-fab.sem-barra{bottom:18px}.ia-fab .ia-b-ia{height:50px;padding:0 16px 0 13px;font-size:13px}.ia-fab .ia-b-wa{width:50px;height:50px}.ia-fab.tem-barra .ia-b-wa{display:none}" +
    ".ia-box{right:0;bottom:0;width:100vw;max-width:none;height:100%;height:100dvh;border-radius:0;border:0}}" +
    ".ia-fab.compacto .ia-b-ia span{display:none}.ia-fab.compacto .ia-b-ia{width:56px;padding:0}" +
    "@media(prefers-reduced-motion:reduce){.ia-fab .ia-b-ia::after{animation:none}.ia-box{transition:none}}";

  function montar() {
    var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
    var temBarra = !!document.querySelector(".h-mbar,.a-mbar");
    var fab = document.createElement("div"); fab.className = "ia-fab " + (temBarra ? "tem-barra" : "sem-barra");
    if (/^\/reservar\//.test(location.pathname)) fab.className += " compacto";
    fab.innerHTML = '<button type="button" class="ia-b-ia" aria-haspopup="dialog">' + ICO_IA + "<span>" + esc(T.abrir) + "</span></button>" +
      "";
    // o WhatsApp flutuante foi retirado a pedido; os botões de WhatsApp da página continuam
    document.body.appendChild(fab);
    var box = document.createElement("div"); box.className = "ia-box"; box.setAttribute("role", "dialog"); box.setAttribute("aria-label", T.tit);
    box.innerHTML = '<div class="ia-hd"><i>' + ICO_IA + "</i><div><b>" + esc(T.tit) + "</b><small>" + esc(T.sub) + '</small></div><button type="button" class="ia-novo">' + esc(T.limpar) + '</button><button type="button" class="ia-x" aria-label="' + esc(T.fechar) + '">×</button></div>' +
      '<div class="ia-msgs" aria-live="polite"></div>' +
      '<div class="ia-ft"><form class="ia-in"><textarea rows="1" maxlength="500" placeholder="' + esc(T.ph) + '"></textarea><button type="submit" aria-label="' + esc(T.env) + '"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button></form>' +
      '<div class="ia-av"><span>' + esc(T.aviso) + '</span><a target="_blank" rel="noopener" class="ia-wa-l" href="#">' + esc(T.wa) + "</a></div></div>";
    document.body.appendChild(box);
    var lista = box.querySelector(".ia-msgs"), ta = box.querySelector("textarea"), form = box.querySelector("form"), btnEnv = form.querySelector("button");
    box.querySelector(".ia-wa-l").onclick = function () { this.href = waLink(resumoWa()); };

    function rolar() { lista.scrollTop = lista.scrollHeight; }
    function bolha(cls, html) { var d = document.createElement("div"); d.className = "ia-m " + cls; d.innerHTML = html; lista.appendChild(d); rolar(); return d; }
    function btnWa() { var a = document.createElement("a"); a.className = "ia-wa"; a.target = "_blank"; a.rel = "noopener"; a.href = waLink(resumoWa()); a.innerHTML = ICO_WA + esc(T.wa); lista.appendChild(a); rolar(); }
    function cotacao(c) {
      var ok = Object.keys(c.categorias).map(function (k) { var x = c.categorias[k]; x.k = k; return x; }).filter(function (x) { return x.ok; }).sort(function (a, b) { return a.valor - b.valor; });
      if (!ok.length) {
        var ant = Object.keys(c.categorias).map(function (k) { return c.categorias[k]; }).filter(function (x) { return x.erro === "antecedencia"; })[0];
        bolha("bot", esc(ant ? f(T.antec, { h: ant.horas }) : T.nenhum)); btnWa(); return;
      }
      var d = document.createElement("div"); d.className = "ia-cot";
      d.innerHTML = ok.slice(0, 4).map(function (x) {
        return '<div class="c"><div><b>' + esc(x.nome) + "</b><small>" + esc(f(T.ate, { p: x.pax, m: x.malas })) + "</small></div><strong>" + brl(x.valor) + '</strong><button type="button" data-cat="' + esc(x.k) + '">' + esc(T.res) + "</button></div>";
      }).join("") + "<p>" + esc(T.porCarro) + "</p>";
      d.addEventListener("click", function (e) {
        var b = e.target.closest("[data-cat]"); if (!b) return;
        b.disabled = true; b.textContent = "…";
        var itens = c.itens.map(function (it) { var o = {}; for (var k in it) if (it[k] !== null && it[k] !== "" && it[k] !== false) o[k] = it[k]; o.categoria = b.dataset.cat; return o; });
        fetch("/api/pacotes", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ itens: itens, idioma: L }) })
          .then(function (r) { return r.json(); }).then(function (r) { if (r && r.ok) location.href = "/reservar/?pacote=" + encodeURIComponent(r.codigo) + (L !== "pt" ? "&lang=" + L : ""); else throw 0; })
          .catch(function () { b.disabled = false; b.textContent = T.res; bolha("bot", esc(T.erro)); btnWa(); });
      });
      lista.appendChild(d); rolar();
    }
    function render() {
      lista.innerHTML = "";
      bolha("bot", esc(T.ola));
      if (!msgs.length) {
        var ch = document.createElement("div"); ch.className = "ia-chips";
        ch.innerHTML = T.chips.map(function (c) { return '<button type="button">' + esc(c) + "</button>"; }).join("");
        ch.onclick = function (e) { var b = e.target.closest("button"); if (b) enviar(b.textContent); };
        lista.appendChild(ch);
      }
      msgs.forEach(function (m) {
        if (m.role === "user") bolha("eu", esc(m.content));
        else { if (m.content) bolha("bot", esc(m.content)); if (m.cot) cotacao(m.cot); if (m.humano) btnWa(); }
      });
    }
    var ocupado = false;
    function enviar(txt) {
      txt = String(txt || "").trim(); if (!txt || ocupado) return;
      ocupado = true; btnEnv.disabled = true;
      var ch = lista.querySelector(".ia-chips"); if (ch) ch.remove();
      msgs.push({ role: "user", content: txt.slice(0, 500) }); salvar();
      bolha("eu", esc(txt));
      var dig = bolha("bot", '<span class="ia-dots"><span></span><span></span><span></span></span>');
      var envio = msgs.map(function (m) { return { role: m.role, content: m.content || (m.cot ? "(valores mostrados)" : "") }; });
      fetch("/api/assistente", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ mensagens: envio, lang: L }) })
        .then(function (r) { return r.json().then(function (j) { j._s = r.status; return j; }); })
        .then(function (r) {
          dig.remove();
          if (!r.ok) { bolha("bot", esc(r._s === 429 ? T.limite : T.erro)); btnWa(); return; }
          var m = { role: "assistant", content: r.resposta || "", humano: !!r.humano };
          if (r.cotacao) m.cot = r.cotacao;
          msgs.push(m); salvar();
          if (m.content) bolha("bot", esc(m.content));
          if (m.cot) cotacao(m.cot);
          if (m.humano) btnWa();
          if (window.gtag) try { gtag("event", "assistente_msg", { cotacao: !!m.cot }); } catch (e) {}
        })
        .catch(function () { dig.remove(); bolha("bot", esc(T.erro)); btnWa(); })
        .then(function () { ocupado = false; btnEnv.disabled = false; });
    }
    form.onsubmit = function (e) { e.preventDefault(); var v = ta.value; ta.value = ""; ta.style.height = ""; enviar(v); };
    ta.addEventListener("keydown", function (e) { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); form.requestSubmit ? form.requestSubmit() : form.onsubmit(e); } });
    ta.addEventListener("input", function () { ta.style.height = "auto"; ta.style.height = Math.min(ta.scrollHeight, 110) + "px"; });
    function abrir() { render(); box.classList.add("on"); fab.style.visibility = "hidden"; if (matchMedia("(min-width:761px)").matches) ta.focus(); }
    function fechar() { box.classList.remove("on"); fab.style.visibility = ""; }
    fab.querySelector(".ia-b-ia").onclick = abrir;
    box.querySelector(".ia-x").onclick = fechar;
    box.querySelector(".ia-novo").onclick = function () { msgs = []; salvar(); render(); };
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && box.classList.contains("on")) fechar(); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", montar); else montar();
})();
