/* Painel: edição dos preços por carro (o servidor valida e guarda; o site e a reserva leem do servidor) */
(function () {
  "use strict";
  var $ = function (s) { return document.querySelector(s); };
  var GRUPOS = { aeroporto: "Aeroporto", passeios: "Cataratas e passeios", motorista: "Motorista à disposição", viagens: "Viagens para outras cidades" };
  var ORDEM = ["comum", "exec", "suv", "sete", "luxo", "van"];
  var dados = null, mud = {};
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function num(v) { return v == null ? "" : String(v).replace(".", ","); }
  function brl(v) { return v == null ? "sob consulta" : "R$ " + Number(v).toLocaleString("pt-BR"); }
  function api(path, body) {
    return fetch(path, body ? { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body), credentials: "same-origin" } : { credentials: "same-origin" })
      .then(function (r) { if (r.status === 401) throw new Error("401"); return r.json(); });
  }
  function semAcesso() { $("#tab tbody").innerHTML = '<tr><td class="msg">Sem acesso. Entre com o e-mail autorizado.</td></tr>'; }
  /* aceita 1250 · 1.250 · 1250,50 · 1.250,50 · 1250.50 */
  function valorNum(t) {
    t = String(t).replace(/[R$\s]/g, "");
    if (t.indexOf(",") >= 0) return t.replace(/\./g, "").replace(",", ".");
    if (/^\d+\.\d{1,2}$/.test(t)) return t;
    return t.replace(/\./g, "");
  }
  function contar() {
    var n = Object.keys(mud).length;
    $("#salvar").disabled = !n; $("#info").textContent = n ? n + (n === 1 ? " alteração não salva" : " alterações não salvas") : "";
  }
  function desenhar() {
    var cats = ORDEM.filter(function (c) { return dados.categorias[c]; });
    var q = $("#busca").value.trim().toLowerCase(), gr = $("#grupo").value;
    $("#tab thead").innerHTML = "<tr><th>Serviço</th>" + cats.map(function (c) { return "<th>" + esc(dados.categorias[c]) + "</th>"; }).join("") + "</tr>";
    var h = "", ult = "";
    dados.servicos.forEach(function (s) {
      if (gr && s.grupo !== gr) return;
      if (q && (s.nome + " " + s.id).toLowerCase().indexOf(q) < 0) return;
      if (s.grupo !== ult) { ult = s.grupo; h += '<tr class="g"><td colspan="' + (cats.length + 1) + '">' + esc(GRUPOS[s.grupo] || s.grupo) + "</td></tr>"; }
      h += '<tr><td class="n">' + esc(s.nome) + "<small>" + esc(s.id) + (s.tipo === "hora" ? " · valor por hora" : s.tipo === "diaria" ? " · valor por dia" : "") + (s.oculto ? " · oculto no site" : "") + "</small></td>";
      cats.forEach(function (c) {
        if (!(c in s.padrao)) { h += '<td class="svc">—</td>'; return; }
        var k = s.id + "|" + c, ed = s.atual[c] !== s.padrao[c], v = k in mud ? mud[k] : num(s.atual[c]);
        h += '<td><input inputmode="decimal" data-k="' + esc(k) + '" value="' + esc(v) + '" placeholder="' + (s.padrao[c] == null ? "consulta" : "") + '" class="' + (ed ? "edt" : "") + (k in mud ? " mud" : "") + '"' +
          ' title="Padrão: ' + esc(brl(s.padrao[c])) + '">' + (ed ? '<span class="pad">padrão ' + esc(brl(s.padrao[c])) + "</span>" : "") + "</td>";
      });
      h += "</tr>";
    });
    $("#tab tbody").innerHTML = h || '<tr><td class="msg">Nada encontrado.</td></tr>';
  }
  function carregar() {
    api("/api/admin/precos").then(function (r) {
      dados = r; mud = {}; contar();
      var gs = []; r.servicos.forEach(function (s) { if (gs.indexOf(s.grupo) < 0) gs.push(s.grupo); });
      $("#grupo").innerHTML = '<option value="">Todos os grupos</option>' + gs.map(function (g) { return '<option value="' + esc(g) + '">' + esc(GRUPOS[g] || g) + "</option>"; }).join("");
      desenhar();
      var nomes = {}; r.servicos.forEach(function (s) { nomes[s.id] = s.nome; });
      $("#hist").innerHTML = r.hist.length ? r.hist.map(function (x) {
        return '<div class="ev"><b>' + esc(new Date(x.em).toLocaleString("pt-BR")) + "</b> · " + esc(x.autor || "") + " · " + esc(nomes[x.servico_id] || x.servico_id) + " (" + esc(r.categorias[x.categoria] || x.categoria) + "): " + esc(brl(x.de)) + " → " + esc(brl(x.para)) + "</div>";
      }).join("") : "Nenhuma alteração ainda.";
    }).catch(function (e) { if (e.message === "401") semAcesso(); else $("#tab tbody").innerHTML = '<tr><td class="msg">Erro ao carregar.</td></tr>'; });
  }
  document.addEventListener("input", function (e) {
    var k = e.target.dataset && e.target.dataset.k; if (!k) return;
    var p = k.split("|"), s = dados.servicos.filter(function (x) { return x.id === p[0]; })[0];
    if (e.target.value.trim() === num(s.atual[p[1]])) delete mud[k]; else mud[k] = e.target.value.trim();
    e.target.classList.toggle("mud", k in mud); contar();
  });
  $("#busca").oninput = desenhar; $("#grupo").onchange = desenhar;
  $("#salvar").onclick = function () {
    var lista = Object.keys(mud).map(function (k) { var p = k.split("|"); return { servico: p[0], categoria: p[1], valor: valorNum(mud[k]) }; });
    var ruim = lista.filter(function (x) { return x.valor !== "" && !(Number(x.valor) >= 1); });
    if (ruim.length) { alert("Valor inválido em " + ruim[0].servico + ". Use só números, por exemplo 350 ou 1250,50."); return; }
    if (!confirm("Salvar " + lista.length + (lista.length === 1 ? " alteração" : " alterações") + " de preço? Vale para novas cotações em até 1 minuto.")) return;
    this.disabled = true;
    api("/api/admin/precos", { mudancas: lista }).then(function (x) {
      if (!x.ok) { alert("Erro: " + x.erro + (x.servico ? " (" + x.servico + ")" : "")); contar(); return; }
      carregar();
    });
  };
  addEventListener("beforeunload", function (e) { if (Object.keys(mud).length) { e.preventDefault(); e.returnValue = ""; } });
  api("/api/admin/eu").then(function (r) { $("#who").textContent = r.email || ""; }).catch(function (e) { if (e.message === "401") semAcesso(); });
  carregar();
})();
