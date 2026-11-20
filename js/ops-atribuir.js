/* Plataforma IET — painel lateral de atribuição e status de um serviço (pacote 2).
   Uso: OPS.atribuir(servicoId, aoMudar). Depende de /js/ops-ui.js. */
(function () {
  "use strict";
  var O = window.OPS, esc = O.esc;
  var CATS = { comum: "Comum", exec: "Executivo", suv: "SUV", sete: "7 Lugares", luxo: "Luxo", van: "Van" };
  var ERR = { conflito: "Há conflito para essa escolha.", motivo: "Escreva o motivo (pelo menos 3 letras).", servico_encerrado: "Esse serviço já foi encerrado.", custo: "Valor de custo inválido.", status: "Situação inválida.", sem_executor: "Atribua um motorista ou parceiro antes de mudar a situação." };
  var perms = null;
  function permissoes() { return perms ? Promise.resolve(perms) : O.api("/api/admin/ops/eu").then(function (d) { perms = d.permissoes || []; return perms; }); }
  var data = function (s) { return s.data.split("-").reverse().join("/") + " às " + s.hora; };

  function abrir(id, aoMudar) {
    var d = O.painel('<div class="o-empty">Carregando…</div>', "Atribuir serviço");
    Promise.all([O.api("/api/admin/ops/servicos/" + id + "/sugestoes"), permissoes()]).then(function (r) {
      var x = r[0], verValor = r[1].indexOf("valores.ver") >= 0, editar = r[1].indexOf("ops.editar") >= 0;
      if (!x.ok) { d.innerHTML = '<p class="o-sub">' + esc(x.mensagem) + '</p>'; return; }
      var s = x.servico, tel = String(s.telefone || "").replace(/\D/g, "");
      var bag = [s.malas ? s.malas + " mala(s)" : "", s.malas_bordo ? s.malas_bordo + " de mão" : "", s.mochilas ? s.mochilas + " mochila(s)" : "", s.cadeirinhas ? s.cadeirinhas + " cadeirinha(s)" : ""].filter(Boolean).join(" · ") || "sem bagagem informada";
      var exec = s.motorista_nome ? esc(s.motorista_nome) + (s.placa ? " · " + esc(s.placa) : "") : s.parceiro_nome ? esc(s.parceiro_nome) + " (parceiro)" : "ninguém";
      var h = '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px"><div><h1>' + esc(s.servico_nome) + '</h1><p class="o-sub">' + data(s) + ' · ' + esc(s.codigo) + '</p></div><button class="o-x" type="button" data-o-fechar aria-label="Fechar">×</button></div>' +
        '<div class="o-kv"><span>Situação</span><span>' + O.pill(s.status) + '</span><span>Executor</span><b>' + exec + '</b><span>Cliente</span><span>' + esc(s.cliente) + ' · ' + esc((s.idioma || "pt").toUpperCase()) +
        (tel.length >= 10 ? ' · <a href="https://wa.me/' + (tel.length <= 11 ? "55" + tel : tel) + '" target="_blank" rel="noopener" style="color:var(--o-gold)">WhatsApp</a>' : "") + '</span>' +
        '<span>Grupo</span><span>' + s.pax + ' pessoa(s) · ' + esc(CATS[s.categoria] || s.categoria) + ' · ' + esc(bag) + '</span><span>Trajeto</span><span>' + esc(s.origem || "—") + ' → ' + esc(s.destino || "—") + '</span>' +
        (s.voo ? '<span>Voo</span><span>' + esc(s.voo) + '</span>' : '') + (s.obs ? '<span>Observação</span><span>' + esc(s.obs) + '</span>' : '') + '</div>';
      if (editar && ["concluido", "no_show", "cancelado"].indexOf(s.status) < 0) {
        h += '<h2 class="o-h2">Sugestões</h2>' + (x.sugestoes.length ? x.sugestoes.map(function (g, i) {
          var livre = !g.problemas.some(function (p) { return p.bloqueia; });
          return '<div class="o-card" style="padding:12px;margin-top:8px;' + (i === 0 && livre ? "border-color:var(--o-gold);background:var(--o-gold-soft)" : "") + '"><div style="display:flex;justify-content:space-between;gap:10px;align-items:center"><div><b>' + esc(g.nome) + '</b>' +
            '<div class="o-sub" style="font-size:.8rem">' + g.bons.map(function (b) { return "✓ " + esc(b); }).join("<br>") + (g.problemas.length ? "<br>" + g.problemas.map(function (p) { return '<span style="color:' + (p.bloqueia ? "var(--o-red)" : "var(--o-amber)") + '">' + (p.bloqueia ? "✕ " : "! ") + esc(p.texto) + "</span>"; }).join("<br>") : "") + '</div></div>' +
            '<button class="o-btn' + (i === 0 && livre ? " pri" : "") + '" type="button" data-sug="' + i + '">' + (livre ? "Atribuir" : "Ver aviso") + '</button></div></div>';
        }).join("") : '<p class="o-sub">Nenhum motorista cadastrado. Cadastre em Equipe e frota, ou escolha um parceiro abaixo.</p>');
        var optM = '<option value="">—</option>' + x.sugestoes.map(function (g) { return '<option value="' + g.motorista_id + '"' + (g.motorista_id === s.motorista_id ? " selected" : "") + '>' + esc(g.nome) + '</option>'; }).join("");
        var optV = '<option value="">—</option>' + x.veiculos.map(function (v) { return '<option value="' + v.id + '"' + (v.id === s.veiculo_id ? " selected" : "") + '>' + esc(v.placa + " · " + v.modelo + " · " + v.lugares + " lugares") + '</option>'; }).join("");
        var optP = '<option value="">—</option>' + x.parceiros.map(function (p) { return '<option value="' + p.id + '"' + (p.id === s.parceiro_id ? " selected" : "") + '>' + esc(p.nome) + '</option>'; }).join("");
        h += '<h2 class="o-h2">Escolher manualmente</h2><form id="atr" style="display:grid;gap:10px" novalidate><label class="o-field">Motorista<select name="motorista_id">' + optM + '</select></label><label class="o-field">Carro<select name="veiculo_id">' + optV + '</select></label>' +
          '<label class="o-field">Parceiro (quando não há motorista cadastrado dele)<select name="parceiro_id">' + optP + '</select></label>' +
          (verValor ? '<label class="o-field">Custo para a IET (repasse ou pagamento do motorista, R$)<input name="custo" inputmode="decimal" value="' + (s.custo_previsto != null ? String(s.custo_previsto).replace(".", ",") : "") + '"></label>' : '') +
          '<div id="atr-av" role="alert"></div><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="o-btn pri" type="submit">Salvar atribuição</button>' + (s.motorista_id || s.veiculo_id || s.parceiro_id ? '<button class="o-btn" type="button" data-limpar>Tirar executor</button>' : '') + '</div></form>';
        h += '<h2 class="o-h2">Situação</h2><div style="display:flex;gap:8px;flex-wrap:wrap">' +
          [["confirmado", "Confirmado pelo motorista"], ["concluido", "Concluído"], ["no_show", "Cliente não apareceu"], ["cancelado", "Cancelar serviço"]].filter(function (a) { return a[0] !== s.status; })
            .map(function (a) { return '<button class="o-btn' + (a[0] === "cancelado" || a[0] === "no_show" ? " perigo" : "") + '" type="button" data-st="' + a[0] + '">' + a[1] + '</button>'; }).join("") + '</div><div id="st-motivo"></div>';
      }
      h += '<h2 class="o-h2">Minha viagem do cliente</h2><div id="mv"><button class="o-btn" type="button" id="mv-gerar">Pegar link para enviar ao cliente</button></div>';
      h += '<p class="o-note">Pedido completo no <a href="/admin/" style="color:var(--o-gold)">painel de reservas</a>.</p>';
      d.innerHTML = h;
      var mvb = d.querySelector("#mv-gerar");
      if (mvb) mvb.onclick = function () {
        mvb.disabled = true;
        O.api("/api/admin/ops/pedidos/" + s.codigo + "/link").then(function (r) {
          if (!r.ok) { O.toast(r.mensagem); mvb.disabled = false; return; }
          var tel = String(r.telefone || "").replace(/\D/g, ""), pn = String(r.nome || "").split(" ")[0];
          var msg = { pt: "Olá, " + pn + "! Aqui está a sua viagem com a Iguaçu Executive Transfer: horários, motorista e pagamentos. Guarde este link: ", en: "Hello " + pn + "! Here is your trip with Iguaçu Executive Transfer: times, driver and payments. Keep this link: ", es: "¡Hola, " + pn + "! Aquí está su viaje con Iguaçu Executive Transfer: horarios, chofer y pagos. Guarde este enlace: " }[r.idioma] || "";
          d.querySelector("#mv").innerHTML = '<div class="o-field"><input readonly id="mv-link" value="' + esc(r.link) + '"></div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">' +
            (tel.length >= 10 ? '<a class="o-btn pri" target="_blank" rel="noopener" href="https://wa.me/' + (tel.length <= 11 ? "55" + tel : tel) + "?text=" + encodeURIComponent(msg + r.link) + '">Enviar no WhatsApp</a>' : "") +
            '<a class="o-btn" target="_blank" rel="noopener" href="' + esc(r.link) + '">Abrir</a></div>';
        });
      };
      var form = d.querySelector("#atr");
      function enviar(corpo) {
        var av = d.querySelector("#atr-av"); av.innerHTML = "";
        O.api("/api/admin/ops/servicos/" + id + "/atribuir", { method: "POST", body: corpo }).then(function (r) {
          if (r.ok) { O.fechar(); O.toast(r.status === "a_atribuir" ? "Serviço ficou sem executor" : "Atribuído"); if (aoMudar) aoMudar(); return; }
          if ((r.erro === "conflito" || r.erro === "motivo") && r.problemas) {
            av.innerHTML = '<div class="o-card" style="padding:12px;border-color:var(--o-red)"><b style="color:var(--o-red)">Atenção</b><ul style="margin:6px 0 10px;padding-left:18px">' + r.problemas.map(function (p) { return "<li>" + esc(p.texto) + "</li>"; }).join("") + '</ul>' +
              '<label class="o-field">Motivo para atribuir mesmo assim<input id="atr-motivo" maxlength="200"></label><button class="o-btn perigo" type="button" id="atr-forcar" style="margin-top:8px">Atribuir mesmo assim</button></div>';
            d.querySelector("#atr-forcar").onclick = function () { corpo.forcar = true; corpo.motivo = d.querySelector("#atr-motivo").value; enviar(corpo); };
            if (r.erro === "motivo") av.insertAdjacentHTML("afterbegin", '<p style="color:var(--o-red);margin:0 0 8px">' + ERR.motivo + '</p>');
            return;
          }
          av.innerHTML = '<p style="color:var(--o-red)">' + esc(ERR[r.erro] || r.mensagem) + '</p>';
        });
      }
      function corpoForm() { var c = {}; [].forEach.call(form.elements, function (e) { if (e.name) c[e.name] = e.value; }); return c; }
      if (form) {
        form.addEventListener("submit", function (e) { e.preventDefault(); enviar(corpoForm()); });
        var lp = d.querySelector("[data-limpar]"); if (lp) lp.onclick = function () { var c = { motorista_id: "", veiculo_id: "", parceiro_id: "" }; if (form.custo) c.custo = form.custo.value; enviar(c); };
      }
      d.addEventListener("click", function (e) {
        var b = e.target.closest("[data-sug]");
        if (b) { var g = x.sugestoes[+b.dataset.sug]; form.motorista_id.value = g.motorista_id; form.veiculo_id.value = g.veiculo_id || ""; form.parceiro_id.value = ""; enviar(corpoForm()); return; }
        var st = e.target.closest("[data-st]");
        if (st) {
          var novo = st.dataset.st, precisa = novo === "cancelado" || novo === "no_show", box = d.querySelector("#st-motivo");
          if (precisa && !box.querySelector("input")) {
            box.innerHTML = '<label class="o-field" style="margin-top:10px">Motivo<input id="st-m" maxlength="200"></label><button class="o-btn perigo" type="button" id="st-ok" style="margin-top:8px">Confirmar: ' + esc(st.textContent) + '</button>';
            box.querySelector("#st-ok").onclick = function () { mudar(novo, box.querySelector("#st-m").value); };
            return;
          }
          mudar(novo, "");
        }
      });
      function mudar(novo, motivo) {
        O.api("/api/admin/ops/servicos/" + id + "/status", { method: "POST", body: { status: novo, motivo: motivo } }).then(function (r) {
          if (!r.ok) { O.toast(ERR[r.erro] || r.mensagem); return; }
          O.fechar(); O.toast("Situação atualizada"); if (aoMudar) aoMudar();
        });
      }
    });
  }
  O.atribuir = abrir;
})();
