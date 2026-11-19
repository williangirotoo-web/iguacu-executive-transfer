/* Painel: stories da página inicial (foto ou vídeo vertical, título e botão opcional) */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function api(path, body) {
    return fetch(path, body ? { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body), credentials: "same-origin" } : { credentials: "same-origin" })
      .then(function (r) { if (r.status === 401) throw new Error("401"); return r.json(); });
  }
  function enviarArquivo(blob, mime, onp) {
    return new Promise(function (ok, falha) {
      var x = new XMLHttpRequest(); x.open("PUT", "/api/admin/stories/midia"); x.setRequestHeader("content-type", mime); x.withCredentials = true;
      x.upload.onprogress = function (e) { if (e.lengthComputable && onp) onp(e.loaded / e.total); };
      x.onload = function () { try { var r = JSON.parse(x.responseText); r.ok ? ok(r) : falha(new Error(r.erro || "erro")); } catch (e) { falha(new Error("http_" + x.status)); } };
      x.onerror = function () { falha(new Error("rede")); }; x.send(blob);
    });
  }
  /* foto: reduz para no máximo 1080 x 1920 e converte para webp (fica leve no site) */
  function prepararImagem(file) {
    return new Promise(function (ok, falha) {
      var img = new Image(), u = URL.createObjectURL(file);
      img.onload = function () {
        var esc2 = Math.min(1, 1080 / img.width, 1920 / img.height), c = document.createElement("canvas");
        c.width = Math.round(img.width * esc2); c.height = Math.round(img.height * esc2);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(u);
        c.toBlob(function (b) { b ? ok(b) : falha(new Error("imagem")); }, "image/webp", 0.85);
      };
      img.onerror = function () { falha(new Error("imagem")); }; img.src = u;
    });
  }
  /* capa leve (300 x 300, recorte central) para a bolinha: evita baixar a foto inteira só para um círculo de 72 px */
  function miniatura(file) {
    return new Promise(function (ok) {
      var img = new Image(), u = URL.createObjectURL(file);
      img.onload = function () {
        var lado = Math.min(img.width, img.height), c = document.createElement("canvas"); c.width = c.height = 300;
        c.getContext("2d").drawImage(img, (img.width - lado) / 2, (img.height - lado) / 2, lado, lado, 0, 0, 300, 300); URL.revokeObjectURL(u);
        c.toBlob(function (b) { ok(b); }, "image/webp", 0.8);
      };
      img.onerror = function () { ok(null); }; img.src = u;
    });
  }
  /* vídeo: tira uma foto do segundo 1 para ser a capa da bolinha */
  function capaDoVideo(file) {
    return new Promise(function (ok) {
      var v = document.createElement("video"), u = URL.createObjectURL(file); v.muted = true; v.playsInline = true; v.preload = "auto"; v.src = u;
      v.addEventListener("loadeddata", function () { v.currentTime = Math.min(1, (v.duration || 2) / 2); });
      v.addEventListener("seeked", function () {
        var c = document.createElement("canvas"), k = Math.min(1, 540 / v.videoWidth); c.width = Math.round(v.videoWidth * k); c.height = Math.round(v.videoHeight * k);
        c.getContext("2d").drawImage(v, 0, 0, c.width, c.height); URL.revokeObjectURL(u);
        c.toBlob(function (b) { ok(b); }, "image/webp", 0.8);
      });
      v.onerror = function () { ok(null); };
      setTimeout(function () { ok(null); }, 8000);
    });
  }
  var arq = $("#arq");
  arq.onchange = function () {
    var f = arq.files[0], p = $("#prev"); p.innerHTML = ""; p.style.backgroundImage = "";
    if (!f) return;
    if (f.type.indexOf("video/") === 0) { var v = document.createElement("video"); v.src = URL.createObjectURL(f); v.muted = true; v.autoplay = true; v.loop = true; v.playsInline = true; v.style.cssText = "width:100%;height:100%;object-fit:cover;border-radius:10px"; p.appendChild(v); }
    else p.style.backgroundImage = "url('" + URL.createObjectURL(f) + "')";
    if (!$("#tit").value) $("#tit").value = f.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").slice(0, 24);
  };
  $("#up").onsubmit = function (e) {
    e.preventDefault();
    var f = arq.files[0]; if (!f) return;
    var video = f.type.indexOf("video/") === 0, st = $("#st"), bar = $("#bar"), i = $("#bar i"), btn = $("#env");
    if (video && f.size > 24 * 1024 * 1024) { st.textContent = "Vídeo maior que 24 MB. Exporte em 720p ou 1080p mais curto e tente de novo."; return; }
    btn.disabled = true; bar.hidden = false; i.style.width = "0"; st.textContent = video ? "Enviando vídeo…" : "Preparando imagem…";
    var capa = null;
    var passo = video
      ? capaDoVideo(f).then(function (c) { return c ? enviarArquivo(c, "image/webp").then(function (r) { capa = r.chave; }) : null; })
          .then(function () { return enviarArquivo(f, f.type || "video/mp4", function (p) { i.style.width = Math.round(p * 100) + "%"; }); })
      : miniatura(f).then(function (m) { return m ? enviarArquivo(m, "image/webp").then(function (r) { capa = r.chave; }).catch(function () {}) : null; })
          .then(function () { return prepararImagem(f); })
          .then(function (b) { st.textContent = "Enviando imagem…"; return enviarArquivo(b, "image/webp", function (p) { i.style.width = Math.round(p * 100) + "%"; }); });
    passo.then(function (r) {
      return api("/api/admin/stories/novo", { titulo: $("#tit").value, midia: r.chave, capa: capa, link: $("#lnk").value.trim(), cta: $("#cta").value.trim() });
    }).then(function (r) {
      if (!r.ok) throw new Error(r.erro);
      st.textContent = "Story publicado!"; $("#up").reset(); $("#prev").innerHTML = ""; $("#prev").style.backgroundImage = ""; carregar();
    }).catch(function (e) {
      st.textContent = { sem_armazenamento: "O armazenamento ainda não está ligado no Cloudflare.", tamanho: "Arquivo grande demais.", tipo_arquivo: "Formato não aceito. Use MP4, JPG, PNG ou WEBP.", titulo: "Informe um título.", link: "Link inválido. Use /pagina ou https://..." }[e.message] || "Erro ao enviar: " + e.message;
    }).then(function () { btn.disabled = false; bar.hidden = true; });
  };
  var LISTA = [];
  function carregar() {
    api("/api/admin/stories").then(function (r) {
      $("#aviso").hidden = !!r.armazenamento; LISTA = r.stories;
      $("#lista").innerHTML = LISTA.length ? LISTA.map(function (s, k) {
        var m = s.tipo === "video" ? '<video src="/m/' + esc(s.midia) + '"' + (s.capa ? ' poster="/m/' + esc(s.capa) + '"' : "") + ' muted playsinline preload="none" controls></video>' : '<img src="/m/' + esc(s.midia) + '" alt="">';
        return '<div class="sc' + (s.ativo ? "" : " off") + '" data-id="' + s.id + '"><div class="m">' + m + "<b>" + (s.tipo === "video" ? "Vídeo" : "Foto") + (s.ativo ? "" : " · oculto") + '</b></div><div class="f">' +
          '<input data-k="titulo" maxlength="24" value="' + esc(s.titulo) + '" placeholder="Título"><input data-k="link" value="' + esc(s.link || "") + '" placeholder="Link do botão (opcional)"><input data-k="cta" maxlength="30" value="' + esc(s.cta || "") + '" placeholder="Texto do botão">' +
          '<div class="bt"><button class="btn mini" data-a="salvar" type="button">Salvar</button><button class="btn gh mini" data-a="ativo" type="button">' + (s.ativo ? "Ocultar" : "Mostrar") + '</button>' +
          (k > 0 ? '<button class="btn gh mini" data-a="sobe" type="button">←</button>' : "") + (k < LISTA.length - 1 ? '<button class="btn gh mini" data-a="desce" type="button">→</button>' : "") +
          '<button class="btn del mini" data-a="excluir" type="button">Excluir</button></div></div></div>';
      }).join("") : '<p class="empty">Nenhum story ainda. Envie o primeiro acima.</p>';
    }).catch(function (e) { $("#lista").innerHTML = '<p class="msg">' + (e.message === "401" ? "Sem acesso." : "Erro ao carregar.") + "</p>"; });
  }
  $("#lista").addEventListener("click", function (e) {
    var b = e.target.closest("[data-a]"); if (!b) return;
    var c = b.closest("[data-id]"), id = +c.dataset.id, s = LISTA.filter(function (x) { return x.id === id; })[0], a = b.dataset.a;
    var val = function (k) { return c.querySelector('[data-k="' + k + '"]').value; };
    if (a === "salvar" || a === "ativo") {
      api("/api/admin/stories/editar", { id: id, titulo: val("titulo"), link: val("link").trim(), cta: val("cta").trim(), ativo: a === "ativo" ? !s.ativo : !!s.ativo })
        .then(function (r) { if (!r.ok) alert({ titulo: "Informe um título.", link: "Link inválido. Use /pagina ou https://..." }[r.erro] || "Erro: " + r.erro); carregar(); });
    } else if (a === "excluir") {
      if (confirm("Excluir este story? O arquivo também será apagado.")) api("/api/admin/stories/excluir", { id: id }).then(carregar);
    } else {
      var ids = LISTA.map(function (x) { return x.id; }), k = ids.indexOf(id), j = a === "sobe" ? k - 1 : k + 1;
      ids[k] = ids[j]; ids[j] = id; api("/api/admin/stories/ordem", { ids: ids }).then(carregar);
    }
  });
  api("/api/admin/eu").then(function (r) { var w = $("#who"); if (w) w.textContent = r.email || ""; }).catch(function () {});
  carregar();
})();
