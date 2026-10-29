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
          "<div><b>" + esc(x.nome) + '</b><div class="svc">' + esc(x.servicos) + "</div></div><div>" + esc(x.telefone) + "</div><div><b>" + brl(x.total) + "</b></div><div>" + badge(x.status) + "</div></div>";
      }).join("");
    }).catch(function (e) { if (e.message === "401") semAcesso(); else $("#rows").innerHTML = '<p class="msg">Erro ao carregar. Tente de novo.</p>'; });
  }

  function waCliente(p, texto) {
    var n = String(p.telefone || "").replace(/\D/g, "");
    if (n.length >= 10 && n.length <= 11) n = "55" + n;
    return "https://wa.me/" + n + (texto ? "?text=" + encodeURIComponent(texto) : "");
  }
  function abrir(cod) {
    api("/api/admin/pedidos/" + encodeURIComponent(cod)).then(function (r) {
      if (!r.ok) { alertMsg("Pedido não encontrado."); return; }
      var p = r.pedido, h = "";
      h += '<p><button class="btn gh" id="voltar" type="button">← Voltar</button></p><div class="det">';
      h += "<h2>" + esc(p.codigo) + " · " + esc(p.nome) + "</h2><p>" + badge(p.status) + ' <small style="color:var(--mut)">feito em ' + esc(quando(p.criado_em)) + " · idioma " + esc(p.idioma) + "</small></p>";
      h += '<div class="grid2"><div><h3>Cliente</h3><div class="kv"><span>WhatsApp</span><span>' + esc(p.telefone) + "</span><span>E-mail</span><span>" + esc(p.email) + "</span>" +
        (p.pais ? "<span>País</span><span>" + esc(p.pais) + "</span>" : "") + (p.observacoes ? "<span>Observações</span><span>" + esc(p.observacoes) + "</span>" : "") + "</div>" +
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
          "<span>Valor</span><span><b>" + brl(it.valor) + "</b> · " + (it.modo === "total" ? "100% na reserva" : "sinal: " + brl(it.valor_agora)) + "</span></div></div>";
      }).join("");
      h += '<h3>Histórico</h3>' + r.eventos.map(function (e) {
        return '<div class="ev"><b>' + esc(quando(e.em)) + "</b> · " + esc(e.autor || "") + " · " + (e.tipo === "status" ? esc(STATUS[e.status_de] || e.status_de) + " → " + esc(STATUS[e.status_para] || e.status_para) : esc(e.tipo === "criado" ? "Pedido criado" : "Nota")) +
          (e.texto ? "<br>" + esc(e.texto) : "") + "</div>";
      }).join("") + '<p><input id="nota" placeholder="Adicionar nota interna" style="width:70%"> <button class="btn gh" id="salvarNota" type="button">Adicionar</button></p></div>';
      $("#lista").hidden = true; var d = $("#detalhe"); d.hidden = false; d.innerHTML = h; scrollTo(0, 0);
      $("#voltar").onclick = function () { history.replaceState(null, "", location.pathname); fechar(); };
      $("#salvarSt").onclick = function () {
        this.disabled = true;
        api("/api/admin/pedidos/" + p.codigo + "/status", { status: $("#novoSt").value, nota: $("#notaSt").value }).then(function () { abrir(p.codigo); });
      };
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
