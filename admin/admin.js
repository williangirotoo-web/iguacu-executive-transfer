/* Painel de reservas — acesso protegido pelo Cloudflare Access (login por e-mail) */
(function () {
  "use strict";
  var $ = function (s) { return document.querySelector(s); };
  var STATUS = {
    solicitacao: "Nova solicitação", pagamento_pendente: "Pagamento pendente", aprovado: "Pagamento aprovado",
    aguardando_confirmacao: "Aguardando confirmação", confirmada: "Confirmada", concluida: "Concluída", cancelada: "Cancelada",
  };
  var CATS = { comum: "Comum", exec: "Executivo", suv: "Executivo SUV", sete: "7 Lugares", luxo: "Executivo Luxo", van: "Van" };
  var filtro = { status: "", periodo: "proximos", q: "" };
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function brl(v) { return "R$ " + Number(v || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function quando(iso) {
    if (!iso) return "";
    var d = new Date(new Date(iso).getTime() - 3 * 3600e3); // horário de Foz
    return d.toISOString().slice(8, 10) + "/" + d.toISOString().slice(5, 7) + " " + d.toISOString().slice(11, 16);
  }
  function dataBr(d) { return String(d).split("-").reverse().join("/"); }
  function api(path, body) {
    return fetch(path, body ? { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body), credentials: "same-origin" } : { credentials: "same-origin" })
      .then(function (r) { if (r.status === 401) throw new Error("401"); return r.json(); });
  }
  function semAcesso() {
    document.querySelector("main").innerHTML = '<p class="msg">Acesso não autorizado. Entre com um e-mail liberado para o painel.</p>';
  }
  function badge(st) { return '<span class="st st-' + esc(st) + '">' + esc(STATUS[st] || st) + "</span>"; }

  function carregar() {
    var p = new URLSearchParams({ periodo: filtro.periodo }); if (filtro.status) p.set("status", filtro.status); if (filtro.q) p.set("q", filtro.q);
    $("#rows").innerHTML = '<p class="msg">Carregando…</p>';
    api("/api/admin/pedidos?" + p).then(function (r) {
      var cont = r.contagem || {}, tot = Object.keys(cont).reduce(function (a, k) { return a + cont[k]; }, 0);
      $("#chips").innerHTML = ['<button class="chip' + (filtro.status ? "" : " on") + '" data-st="">Todos<i>' + tot + "</i></button>"].concat(Object.keys(STATUS).map(function (k) {
        return '<button class="chip' + (filtro.status === k ? " on" : "") + '" data-st="' + k + '">' + esc(STATUS[k]) + "<i>" + (cont[k] || 0) + "</i></button>";
      })).join("");
      if (!r.pedidos.length) { $("#rows").innerHTML = '<p class="empty">Nenhum pedido aqui.</p>'; return; }
      $("#rows").innerHTML = r.pedidos.map(function (x) {
        return '<div class="row" data-cod="' + esc(x.codigo) + '"><div class="when"><b>' + esc(quando(x.primeiro_inicio)) + "</b><small>" + esc(x.codigo) + "</small></div>" +
          "<div><b>" + esc(x.nome) + '</b><div class="svc">' + (x.parceiro ? "Parceiro: " + esc(x.parceiro) + " · " : "") + esc(x.servicos) + "</div></div><div>" + esc(x.telefone) + "</div><div><b>" + brl(x.total) + "</b></div><div>" + badge(x.status) + "</div></div>";
      }).join("");
    }).catch(function (e) { if (e.message === "401") semAcesso(); else $("#rows").innerHTML = '<p class="msg">Erro ao carregar. Tente de novo.</p>'; });
  }

  function waCliente(p, texto) {
    var n = String(p.telefone || "").replace(/\D/g, "");
    if (n.length >= 10 && n.length <= 11) n = "55" + n;
    return "https://wa.me/" + n + (texto ? "?text=" + encodeURIComponent(texto) : "");
  }
  var CST = { ofertada: "Aguardando resposta", aceita: "Aceita", recusada: "Recusada", cancelada: "Retirada" };
  function tel55(t) { var n = String(t || "").replace(/\D/g, ""); return n.length >= 10 && n.length <= 11 ? "55" + n : n; }
  function blocoMotorista(it, corridas, mots, p) {
    var cs = corridas.filter(function (c) { return c.item_id === it.id; });
    var ativa = cs.filter(function (c) { return c.status === "ofertada" || c.status === "aceita"; })[0];
    var h = '<div class="mot"><b style="color:var(--gold)">Motorista parceiro</b>';
    h += cs.map(function (c) {
      return '<div class="ev">' + esc(c.nome) + " (" + esc(c.codigo) + ') · <span class="cst cst-' + esc(c.status) + '">' + esc(CST[c.status] || c.status) + "</span>" +
        (c.repasse != null ? " · repasse " + brl(c.repasse) : "") + (c.motivo ? " · " + esc(c.motivo) : "") +
        (c.status === "ofertada" || c.status === "aceita" ? ' <a class="btn wa mini" target="_blank" rel="noopener" href="https://wa.me/' + tel55(c.telefone) + '">WhatsApp</a> <button class="btn gh mini" data-cancelar="' + c.id + '" type="button">Retirar</button>' : "") + "</div>";
    }).join("");
    if (!ativa && p.status !== "cancelada") {
      var aptos = mots.filter(function (m) { return m.tem_acesso; });
      h += aptos.length ? '<div class="ofr"><select data-mot="' + it.id + '">' + aptos.map(function (m) { return '<option value="' + esc(m.codigo) + '">' + esc(m.nome) + " · " + esc(m.veiculo || m.categoria) + "</option>"; }).join("") +
        '</select> <input data-rep="' + it.id + '" inputmode="decimal" placeholder="Repasse R$ (opcional)" style="width:170px"> <input data-obs="' + it.id + '" placeholder="Recado para o motorista (opcional)" style="width:240px"> <button class="btn mini" data-ofertar="' + it.id + '" type="button">Oferecer corrida</button></div><div data-res="' + it.id + '"></div>'
        : '<p class="svc">' + (mots.length ? "Gere o link de acesso do motorista em Parceiros antes de oferecer corridas." : "Nenhum motorista parceiro aprovado ainda.") + "</p>";
    }
    return h + "</div>";
  }
  function abrir(cod) {
    Promise.all([api("/api/admin/pedidos/" + encodeURIComponent(cod)), api("/api/admin/motoristas").catch(function () { return { motoristas: [] }; })]).then(function (rr) {
      var r = rr[0], mots = rr[1].motoristas || [];
      if (!r.ok) { alertMsg("Pedido não encontrado."); return; }
      var p = r.pedido, h = "";
      h += '<p><button class="btn gh" id="voltar" type="button">← Voltar</button></p><div class="det">';
      h += "<h2>" + esc(p.codigo) + " · " + esc(p.nome) + "</h2><p>" + badge(p.status) + ' <small style="color:var(--mut)">feito em ' + esc(quando(p.criado_em)) + " · idioma " + esc(p.idioma) + "</small></p>";
      h += '<div class="grid2"><div><h3>Cliente</h3><div class="kv"><span>WhatsApp</span><span>' + esc(p.telefone) + "</span><span>E-mail</span><span>" + esc(p.email) + "</span>" +
        (p.pais ? "<span>País</span><span>" + esc(p.pais) + "</span>" : "") + (r.parceiro ? '<span>Parceiro</span><span><a style="color:var(--gold)" href="/admin/parceiros.html#' + esc(r.parceiro.codigo) + '">' + esc(r.parceiro.empresa || r.parceiro.responsavel) + "</a> · comissão " + String(r.parceiro.comissao_pct || 0).replace(".", ",") + "% = " + brl(p.total * (r.parceiro.comissao_pct || 0) / 100) + "</span>" : "") + (p.observacoes ? "<span>Observações</span><span>" + esc(p.observacoes) + "</span>" : "") + "</div>" +
        '<p style="margin-top:12px"><a class="btn wa" target="_blank" rel="noopener" href="' + esc(waCliente(p, "Olá, " + p.nome.split(" ")[0] + "! Aqui é da Iguaçu Executive Transfer, sobre o seu pedido " + p.codigo + ".")) + '">Falar no WhatsApp</a> ' +
        '<a class="btn gh" href="mailto:' + esc(p.email) + "?subject=" + encodeURIComponent("Seu pedido " + p.codigo + " — Iguaçu Executive Transfer") + '">E-mail</a></p></div>';
      h += '<div><h3>Valores</h3><p class="tot">Total <b>' + brl(p.total) + "</b></p><p>A pagar na reserva: <b>" + brl(p.valor_agora) + "</b><br>Restante no dia: <b>" + brl(p.total - p.valor_agora) + "</b></p>";
      h += '<h3>Mudar status</h3><p><select id="novoSt">' + Object.keys(STATUS).map(function (k) { return '<option value="' + k + '"' + (k === p.status ? " selected" : "") + ">" + esc(STATUS[k]) + "</option>"; }).join("") +
        '</select></p><p><input id="notaSt" placeholder="Observação (opcional)" style="width:100%"></p><p><button class="btn" id="salvarSt" type="button">Salvar status</button></p></div></div>';
      h += "<h3>Serviços</h3>" + r.itens.map(function (it) {
        return '<div class="item"><b>' + esc(it.servico_nome) + " — " + esc(CATS[it.categoria] || it.categoria) + '</b><div class="kv">' +
          "<span>Data e hora</span><span>" + esc(dataBr(it.data)) + " às " + esc(it.hora) + (it.sentido ? " (" + (it.sentido === "saida" ? "saída: hotel → aeroporto" : "chegada: aeroporto → hotel") + ")" : "") + "</span>" +
          (it.voo ? "<span>Voo</span><span>" + esc(it.voo) + "</span>" : "") + "<span>Buscar em</span><span>" + esc(it.origem) + "</span>" +
          (it.destino ? "<span>Levar para</span><span>" + esc(it.destino) + "</span>" : "") +
          "<span>Passageiros / malas</span><span>" + esc(it.pax) + " / " + esc(it.malas) + (it.cadeirinhas ? " · " + it.cadeirinhas + " cadeirinha(s)" : "") + (it.pet ? " · com pet" : "") + "</span>" +
          (it.horas_extras ? "<span>Horas extras</span><span>" + esc(it.horas_extras) + "</span>" : "") + (it.horas ? "<span>Horas</span><span>" + esc(it.horas) + "</span>" : "") +
          (it.dias ? "<span>Diárias</span><span>" + esc(it.dias) + "</span>" : "") + (it.data_especial ? "<span>Data especial</span><span>sim (+5%)</span>" : "") +
          "<span>Valor</span><span><b>" + brl(it.valor) + "</b> · " + (it.modo === "total" ? "100% na reserva" : "sinal: " + brl(it.valor_agora)) + "</span></div>" + blocoMotorista(it, r.corridas || [], mots, p) + "</div>";
      }).join("");
      h += '<h3>Histórico</h3>' + r.eventos.map(function (e) {
        return '<div class="ev"><b>' + esc(quando(e.em)) + "</b> · " + esc(e.autor || "") + " · " + (e.tipo === "status" ? esc(STATUS[e.status_de] || e.status_de) + " → " + esc(STATUS[e.status_para] || e.status_para) : esc(e.tipo === "criado" ? "Pedido criado" : e.tipo === "corrida" ? "Motorista" : "Nota")) +
          (e.texto ? "<br>" + esc(e.texto) : "") + "</div>";
      }).join("") + '<p><input id="nota" placeholder="Adicionar nota interna" style="width:70%"> <button class="btn gh" id="salvarNota" type="button">Adicionar</button></p></div>';
      $("#lista").hidden = true; var d = $("#detalhe"); d.hidden = false; d.innerHTML = h; scrollTo(0, 0);
      $("#voltar").onclick = function () { history.replaceState(null, "", location.pathname); fechar(); };
      $("#salvarSt").onclick = function () {
        this.disabled = true;
        api("/api/admin/pedidos/" + p.codigo + "/status", { status: $("#novoSt").value, nota: $("#notaSt").value }).then(function () { abrir(p.codigo); });
      };
      d.querySelectorAll("[data-ofertar]").forEach(function (b) {
        b.onclick = function () {
          var id = b.dataset.ofertar, q = function (a) { return d.querySelector("[" + a + '="' + id + '"]'); };
          var it = r.itens.filter(function (x) { return String(x.id) === id; })[0];
          b.disabled = true;
          api("/api/admin/pedidos/" + p.codigo + "/corrida", { item_id: +id, motorista: q("data-mot").value, repasse: q("data-rep").value.trim(), obs: q("data-obs").value }).then(function (x) {
            b.disabled = false;
            if (!x.ok) { q("data-res").innerHTML = '<p class="msg">' + esc({ ja_ofertada: "Este serviço já está com um motorista.", motorista_sem_link: "Esse motorista ainda não tem link de acesso.", repasse: "Valor de repasse inválido.", pedido_cancelado: "Pedido cancelado." }[x.erro] || "Erro: " + x.erro) + "</p>"; return; }
            var msg = "Olá, " + String(x.nome || "").split(" ")[0] + "! Tem uma corrida para você na Iguaçu Executive Transfer: " + it.servico_nome + ", dia " + dataBr(it.data) + " às " + it.hora + ". Veja os detalhes e aceite ou recuse por aqui:\n" + x.link;
            q("data-res").innerHTML = '<p><a class="btn wa" target="_blank" rel="noopener" href="https://wa.me/' + tel55(x.telefone) + "?text=" + encodeURIComponent(msg) + '">Avisar motorista no WhatsApp</a> <button class="btn gh" type="button" data-recarregar>Atualizar</button></p>';
            q("data-res").querySelector("[data-recarregar]").onclick = function () { abrir(p.codigo); };
          });
        };
      });
      d.querySelectorAll("[data-cancelar]").forEach(function (b) {
        b.onclick = function () {
          if (!confirm("Retirar esta corrida do motorista?")) return;
          api("/api/admin/corridas/" + b.dataset.cancelar + "/cancelar", {}).then(function (x) { if (x.ok && x.avisar) alert("O motorista já tinha aceitado. Avise ele pelo WhatsApp."); abrir(p.codigo); });
        };
      });
      $("#salvarNota").onclick = function () {
        var v = $("#nota").value.trim(); if (!v) return;
        api("/api/admin/pedidos/" + p.codigo + "/nota", { texto: v }).then(function () { abrir(p.codigo); });
      };
    }).catch(function (e) { if (e.message === "401") semAcesso(); });
  }
  function alertMsg(m) { $("#rows").insertAdjacentHTML("afterbegin", '<p class="msg">' + esc(m) + "</p>"); }
  function fechar() { $("#detalhe").hidden = true; $("#lista").hidden = false; carregar(); }

  document.addEventListener("click", function (e) {
    var c = e.target.closest("[data-st]"); if (c) { filtro.status = c.dataset.st; carregar(); return; }
    var r = e.target.closest(".row"); if (r) { location.hash = r.dataset.cod; }
  });
  $("#periodo").onchange = function () { filtro.periodo = this.value; carregar(); };
  var qt; $("#q").oninput = function () { clearTimeout(qt); var v = this.value; qt = setTimeout(function () { filtro.q = v.trim(); carregar(); }, 300); };
  $("#recarregar").onclick = carregar;
  addEventListener("hashchange", function () { var h = location.hash.slice(1); if (h) abrir(h); else fechar(); });

  api("/api/admin/eu").then(function (r) { $("#who").textContent = r.email || ""; }).catch(function (e) { if (e.message === "401") semAcesso(); });
  if (location.hash.length > 1) abrir(location.hash.slice(1)); else carregar();
})();
