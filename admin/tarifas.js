/* Painel: tarifas dos parceiros (quanto cada motorista/empresa parceira cobra de nós, por rota) */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function api(path, body) {
    return fetch(path, body ? { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body), credentials: "same-origin" } : { credentials: "same-origin" })
      .then(function (r) { if (r.status === 401) throw new Error("401"); return r.json(); });
  }
  function brl(v) { return v == null || isNaN(v) ? "—" : "R$ " + Math.round(v).toLocaleString("pt-BR"); }
  function num(v, m) { return (m === "BRL" ? "R$ " : m === "USD" ? "US$ " : m === "PYG" ? "₲ " : "$ ") + Number(v).toLocaleString("pt-BR", { maximumFractionDigits: 2 }) + (m === "ARS" ? " ARS" : ""); }
  function quando(iso) { return iso ? new Date(iso).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" }) : ""; }
  var FLAG = { BR: "🇧🇷", AR: "🇦🇷", PY: "🇵🇾" }, PAIS = { BR: "Brasil", AR: "Argentina", PY: "Paraguai" };
  var D = { fornecedores: [], cambio: {} }, CAT = { servicos: [], categorias: {} };

  function emReais(valor, moeda) {
    var c = D.cambio || {};
    if (moeda === "BRL") return valor;
    if (moeda === "ARS") return c.ARS ? valor / c.ARS : null;
    if (moeda === "PYG") return c.PYG ? valor / c.PYG : null;
    if (moeda === "USD") return c.USD ? valor * c.USD : null;
    return null;
  }
  function nossoPreco(t) {
    if (!t.servico_id || !t.categoria) return null;
    var s = CAT.servicos.filter(function (x) { return x.id === t.servico_id; })[0];
    return s && s.precos ? s.precos[t.categoria] || null : null;
  }
  function nomeSvc(id) { var s = CAT.servicos.filter(function (x) { return x.id === id; })[0]; return s ? (s.nome.pt || s.id) : id; }
  function optsSvc(sel) {
    return '<option value="">— não ligar —</option>' + CAT.servicos.map(function (s) { return '<option value="' + esc(s.id) + '"' + (s.id === sel ? " selected" : "") + ">" + esc(s.nome.pt || s.id) + "</option>"; }).join("");
  }
  function optsCat(sel) {
    return '<option value="">—</option>' + Object.keys(CAT.categorias).map(function (k) { return '<option value="' + k + '"' + (k === sel ? " selected" : "") + ">" + esc(CAT.categorias[k].nome.pt) + "</option>"; }).join("");
  }

  function linha(t) {
    var r = emReais(t.valor, t.moeda), np = nossoPreco(t), mg = np != null && r != null ? np - r : null;
    return '<tr data-tid="' + t.id + '" data-txt="' + esc((t.rota + " " + (t.obs || "") + " " + (t.servico_id ? nomeSvc(t.servico_id) : "")).toLowerCase()) + '"><td><b>' + esc(t.rota) + "</b>" + (t.obs ? '<small class="svc" style="display:block">' + esc(t.obs) + "</small>" : "") +
      (t.servico_id ? '<small class="svc" style="display:block">Site: ' + esc(nomeSvc(t.servico_id)) + (t.categoria && CAT.categorias[t.categoria] ? " · " + esc(CAT.categorias[t.categoria].nome.pt) : "") + "</small>" : "") +
      '</td><td class="r">' + esc(num(t.valor, t.moeda)) + '</td><td class="r">' + (t.moeda === "BRL" ? "" : "≈ " + brl(r)) + '</td><td class="r">' + (np != null ? brl(np) : "—") +
      '</td><td class="r">' + (mg != null ? '<span class="mg ' + (mg >= 0 ? "pos" : "neg") + '">' + brl(mg) + (np ? " (" + Math.round(mg / np * 100) + "%)" : "") + "</span>" : "—") +
      '</td><td class="r"><button class="btn gh mini" data-ed-t="' + t.id + '" type="button">Editar</button> <button class="btn del mini" data-del-t="' + t.id + '" type="button">×</button></td></tr>';
  }
  function formTarifa(fid, t) {
    t = t || {};
    return '<form class="frm" data-ft="' + fid + '"' + (t.id ? ' data-id="' + t.id + '"' : "") + '><label style="flex:2;min-width:200px">Rota<input name="rota" required value="' + esc(t.rota || "") + '" placeholder="Ex.: Aeroporto IGR → hotel em Puerto Iguazú"></label>' +
      '<label>Valor<input name="valor" required inputmode="decimal" style="width:110px" value="' + (t.valor != null ? esc(t.valor) : "") + '"></label>' +
      '<label>Moeda<select name="moeda">' + ["BRL", "ARS", "USD", "PYG"].map(function (m) { return '<option' + (m === (t.moeda || "BRL") ? " selected" : "") + ">" + m + "</option>"; }).join("") + "</select></label>" +
      '<label style="flex:2;min-width:200px">Comparar com o serviço do site<select name="servico_id">' + optsSvc(t.servico_id) + '</select></label><label>Categoria<select name="categoria">' + optsCat(t.categoria) + "</select></label>" +
      '<label style="flex:1;min-width:140px">Observação<input name="obs" value="' + esc(t.obs || "") + '" placeholder="Ex.: carro de 4 lugares"></label>' +
      '<button class="btn mini" type="submit">' + (t.id ? "Salvar" : "+ Adicionar tarifa") + "</button>" + (t.id ? ' <button class="btn gh mini" data-cancel type="button">Cancelar</button>' : "") + "</form>";
  }
  function card(f) {
    var wa = String(f.telefone || "").replace(/\D/g, "");
    return '<section class="fn' + (f.ativo ? "" : " off") + '" data-fid="' + f.id + '" data-txt="' + esc((f.nome + " " + PAIS[f.pais] + " " + (f.notas || "")).toLowerCase()) + '"><div class="fn-h"><h2><span class="flag">' + (FLAG[f.pais] || "") + "</span>" + esc(f.nome) + (f.ativo ? "" : ' <small class="svc">(inativo)</small>') + '</h2><div class="ac">' +
      (wa ? '<a class="btn wa mini" target="_blank" rel="noopener" href="https://wa.me/' + wa + '">WhatsApp</a>' : "") + '<button class="btn gh mini" data-ed-f="' + f.id + '" type="button">Editar parceiro</button></div></div>' +
      '<div class="fn-i"><div><small>Veículos</small>' + esc(f.veiculos || "—") + "</div><div><small>Como pagar</small>" + esc(f.pagamento || "—") + "</div><div><small>Notas</small>" + esc(f.notas || "—") + "</div></div>" +
      '<div class="tw"><table><thead><tr><th>Rota</th><th class="r">Custo</th><th class="r">Em reais</th><th class="r">Nosso preço</th><th class="r">Margem</th><th></th></tr></thead><tbody>' +
      (f.tarifas.length ? f.tarifas.map(linha).join("") : '<tr><td colspan="6" class="svc">Nenhuma tarifa ainda.</td></tr>') + "</tbody></table></div>" + formTarifa(f.id) +
      '<details style="margin-top:10px"><summary class="svc" style="cursor:pointer">Colar tabela do WhatsApp (importar várias de uma vez)</summary><form class="frm" data-imp="' + f.id + '"><label style="flex:1 1 100%">Cole a mensagem com os preços (uma rota por linha)<textarea name="txt" rows="8" style="width:100%"></textarea></label><label>Moeda<select name="moeda"><option>ARS</option><option>BRL</option><option>USD</option><option>PYG</option></select></label><label style="flex:1;min-width:160px">Observação para todas<input name="obs" placeholder="Ex.: carro 5/6 lugares"></label><button class="btn mini" type="submit">Ver e importar</button><div class="imp-prev" style="flex:1 1 100%"></div></form></details>' + "</section>";
  }
  function render() {
    $("#out").innerHTML = D.fornecedores.length ? D.fornecedores.map(card).join("") : '<p class="empty">Nenhum parceiro cadastrado. Clique em "+ Novo parceiro".</p>';
    filtrar();
  }
  function filtrar() {
    var q = $("#q").value.trim().toLowerCase();
    [].forEach.call(document.querySelectorAll(".fn"), function (c) {
      var nomeOk = !q || c.dataset.txt.indexOf(q) >= 0, alguma = false;
      [].forEach.call(c.querySelectorAll("tr[data-tid]"), function (tr) { var ok = !q || nomeOk || tr.dataset.txt.indexOf(q) >= 0; tr.hidden = !ok; tr.classList.toggle("hl", !!q && tr.dataset.txt.indexOf(q) >= 0); if (ok) alguma = true; });
      c.hidden = !(nomeOk || alguma);
    });
  }
  function formFornecedor(f) {
    f = f || { pais: "AR", ativo: 1 };
    var box = $("#form-f"); box.hidden = false;
    box.innerHTML = '<form class="fn" id="ff"><h2 style="margin:0 0 8px;font-size:16px">' + (f.id ? "Editar parceiro" : "Novo parceiro") + '</h2><div class="frm" style="border:0;margin:0;padding:0">' +
      '<label style="flex:2;min-width:200px">Nome<input name="nome" required value="' + esc(f.nome || "") + '" placeholder="Ex.: Ariel Transfer Iguazú"></label>' +
      '<label>País<select name="pais">' + ["BR", "AR", "PY"].map(function (p) { return '<option value="' + p + '"' + (p === f.pais ? " selected" : "") + ">" + PAIS[p] + "</option>"; }).join("") + "</select></label>" +
      '<label>WhatsApp<input name="telefone" value="' + esc(f.telefone || "") + '" placeholder="+54 9 3757 …"></label>' +
      '<label style="flex:2;min-width:220px">Veículos<input name="veiculos" value="' + esc(f.veiculos || "") + '" placeholder="Ex.: 6 carros de 4 e 6 lugares"></label>' +
      '<label style="flex:2;min-width:220px">Como pagar<input name="pagamento" value="' + esc(f.pagamento || "") + '" placeholder="Ex.: Mercado Pago, transferência"></label>' +
      '<label style="flex:3;min-width:260px">Notas<input name="notas" value="' + esc(f.notas || "") + '" placeholder="Ex.: habilitação internacional, primeiro parceiro AR"></label>' +
      '<label>Ativo<select name="ativo"><option value="1"' + (f.ativo ? " selected" : "") + '>Sim</option><option value="0"' + (f.ativo ? "" : " selected") + ">Não</option></select></label></div>" +
      '<p style="margin:10px 0 0"><button class="btn" type="submit">Salvar</button> <button class="btn gh" type="button" id="ff-x">Cancelar</button>' + (f.id ? ' <button class="btn del" type="button" id="ff-del">Excluir parceiro</button>' : "") + "</p></form>";
    var fm = $("#ff");
    fm.onsubmit = function (e) {
      e.preventDefault();
      var b = { id: f.id, nome: fm.nome.value, pais: fm.pais.value, telefone: fm.telefone.value, veiculos: fm.veiculos.value, pagamento: fm.pagamento.value, notas: fm.notas.value, ativo: fm.ativo.value === "1" };
      api("/api/admin/tarifas/fornecedor", b).then(function (r) { if (!r.ok) return alertaErro(r); box.hidden = true; carregar(); });
    };
    $("#ff-x").onclick = function () { box.hidden = true; };
    if (f.id) $("#ff-del").onclick = function () { if (confirm("Excluir " + f.nome + " e todas as tarifas dele?")) api("/api/admin/tarifas/excluir", { tipo: "fornecedor", id: f.id }).then(function () { box.hidden = true; carregar(); }); };
    scrollTo(0, 0); fm.nome.focus();
  }
  function alertaErro(r) { alert({ nome: "Informe o nome.", rota: "Informe a rota.", valor: "Valor inválido.", fornecedor: "Parceiro não encontrado." }[r.erro] || "Erro: " + r.erro); }
  function acharT(id) { var t = null; D.fornecedores.forEach(function (f) { f.tarifas.forEach(function (x) { if (String(x.id) === String(id)) t = x; }); }); return t; }

  /* lê a tabela colada do WhatsApp: "Rota: $30.000 / SOLO IDA: $15.000" ou "Rota $30.000" */
  function valorDe(t) { var m = String(t).match(/\$?\s*([\d][\d.,]*)/); if (!m) return null; var v = m[1].replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", "."); v = parseFloat(v); return v > 0 ? v : null; }
  function lerTabela(txt) {
    var out = [];
    String(txt || "").split(/\n+/).forEach(function (l) {
      l = l.replace(/^[\s•⁠*\-·]+/, "").replace(/\*/g, "").trim(); if (!l || !/\d/.test(l) || !/[:$]/.test(l)) return;
      var partes = [], base = "";
      l.split("/").forEach(function (p) { if (partes.length && !/\d/.test(partes[partes.length - 1])) partes[partes.length - 1] += "/" + p; else partes.push(p.trim()); });
      partes.forEach(function (p, i) {
        var m = p.match(/^(.*?)(?::|\s(?=\$))\s*(.*)$/); var nome, resto;
        if (m) { nome = m[1].trim(); resto = m[2]; } else { nome = ""; resto = p; }
        var v = valorDe(resto); if (!v) return;
        if (i === 0) { base = nome; out.push({ rota: nome, valor: v }); }
        else out.push({ rota: base + " — " + nome.toLowerCase(), valor: v });
      });
    });
    return out.filter(function (x) { return x.rota && x.rota.trim().length >= 3 && !/^\s*—/.test(x.rota); });
  }
  $("#out").addEventListener("submit", function (e) {
    var fi = e.target.closest("form[data-imp]");
    if (fi) {
      e.preventDefault();
      var itens = lerTabela(fi.txt.value), prev = fi.querySelector(".imp-prev");
      if (!itens.length) { prev.innerHTML = '<p class="svc">Não encontrei preços. Use uma rota por linha, com o valor.</p>'; return; }
      if (!fi.dataset.ok) {
        prev.innerHTML = '<div class="tw" style="margin-top:8px"><table><tbody>' + itens.map(function (x) { return "<tr><td>" + esc(x.rota) + '</td><td class="r">' + esc(num(x.valor, fi.moeda.value)) + "</td></tr>"; }).join("") + '</tbody></table></div><p class="svc">' + itens.length + ' tarifas encontradas. Confira e clique de novo para importar.</p>';
        fi.dataset.ok = "1"; fi.querySelector("button[type=submit]").textContent = "Importar " + itens.length + " tarifas"; return;
      }
      var fid = fi.dataset.imp, moeda = fi.moeda.value, obs = fi.obs.value;
      itens.reduce(function (p, x) { return p.then(function () { return api("/api/admin/tarifas/tarifa", { fornecedor_id: fid, rota: x.rota, valor: x.valor, moeda: moeda, obs: obs }); }); }, Promise.resolve()).then(carregar);
      return;
    }
    var fm = e.target.closest("form[data-ft]"); if (!fm) return; e.preventDefault();
    var b = { id: fm.dataset.id, fornecedor_id: fm.dataset.ft, rota: fm.rota.value, valor: fm.valor.value, moeda: fm.moeda.value, servico_id: fm.servico_id.value, categoria: fm.categoria.value, obs: fm.obs.value };
    api("/api/admin/tarifas/tarifa", b).then(function (r) { if (!r.ok) return alertaErro(r); carregar(); });
  });
  $("#out").addEventListener("input", function (e) { var fi = e.target.closest("form[data-imp]"); if (fi && fi.dataset.ok) { delete fi.dataset.ok; fi.querySelector("button[type=submit]").textContent = "Ver e importar"; } });
  $("#out").addEventListener("click", function (e) {
    var b;
    if ((b = e.target.closest("[data-ed-f]"))) { formFornecedor(D.fornecedores.filter(function (f) { return String(f.id) === b.dataset.edF; })[0]); return; }
    if ((b = e.target.closest("[data-del-t]"))) { var t = acharT(b.dataset.delT); if (t && confirm("Excluir a tarifa " + t.rota + "?")) api("/api/admin/tarifas/excluir", { tipo: "tarifa", id: t.id }).then(carregar); return; }
    if ((b = e.target.closest("[data-ed-t]"))) { var t2 = acharT(b.dataset.edT), tr = b.closest("tr"); var td = document.createElement("tr"); td.innerHTML = '<td colspan="6">' + formTarifa(t2.fornecedor_id, t2) + "</td>"; tr.replaceWith(td); return; }
    if (e.target.closest("[data-cancel]")) { render(); }
  });
  $("#novo").onclick = function () { formFornecedor(); };
  $("#q").oninput = filtrar;
  $("#cb-salvar").onclick = function () {
    api("/api/admin/tarifas/cambio", { ARS: $("#cb-ars").value, USD: $("#cb-usd").value, PYG: $("#cb-pyg").value }).then(carregar);
  };
  function carregar() {
    return api("/api/admin/tarifas").then(function (r) {
      D = r; var c = r.cambio || {};
      $("#cb-ars").value = c.ARS || ""; $("#cb-usd").value = c.USD || ""; $("#cb-pyg").value = c.PYG || "";
      $("#cb-at").textContent = c.atualizado_em ? "Atualizado em " + quando(c.atualizado_em) : "Informe o câmbio para ver os custos em reais.";
      render();
    }).catch(function (e) { $("#out").innerHTML = '<p class="msg">' + (e.message === "401" ? "Sem acesso." : "Erro ao carregar.") + "</p>"; });
  }
  api("/api/admin/eu").then(function (r) { var w = $("#who"); if (w) w.textContent = r.email || ""; }).catch(function () {});
  fetch("/api/catalogo").then(function (r) { return r.json(); }).then(function (c) { CAT = c; }).catch(function () {}).then(carregar);
})();
