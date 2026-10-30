/* Iguaçu Executive Transfer — página de reservas.
   Os preços exibidos vêm da API. O valor final é SEMPRE recalculado no servidor ao enviar o pedido. */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var T = {
    pt: {
      eyebrow: "Reserva online · Preço fechado na hora",
      passos: ["Escolha o serviço", "Data, passageiros e categoria", "Envie e confirmamos no WhatsApp"],
      benef: [["Preço fechado", "Você vê o valor antes de reservar. Sem taxímetro e sem surpresa."], ["Motorista profissional", "Atendimento discreto, carro limpo e pontualidade combinada."], ["Cancelamento grátis", "Até {h} h antes da viagem, sem custo."], ["3 países", "Brasil, Argentina e Paraguai com travessia de fronteira."]],
      busca: "Buscar serviço, cidade ou passeio", ordem: "Ordenar", o_rec: "Recomendados", o_menor: "Menor preço", o_maior: "Maior preço", o_az: "Nome (A–Z)",
      paxF: "Pessoas", p_any: "Qualquer", p_4: "Até 4", p_6: "5 ou 6", p_7: "7 ou mais",
      nRes: "{n} serviços", nada: "Nenhum serviço encontrado com esses filtros.", limpar: "Limpar filtros",
      b_espera: "Espera {n} h", b_fronteira: "Fronteira", b_hora: "Por hora", b_dia: "Dia inteiro", b_ida: "Só ida", b_iv: "Ida e volta",
      calcTit: "Não achou seu trajeto?", calcDesc: "Em breve: calcule pelo endereço de saída e destino. Por enquanto, peça a cotação no WhatsApp.", calcBtn: "Cotar no WhatsApp",
      comoTit: "Como funciona", faqTit: "Perguntas frequentes",
      faq: [["Como pago a reserva?", "Depois que confirmamos a disponibilidade, enviamos o link de pagamento pelo WhatsApp: Pix, cartão em até 6x sem juros ou PayPal. Categoria Comum e 7 lugares pagam 100% na reserva; Executivo e SUV podem pagar 50% de sinal."], ["Com quanta antecedência posso reservar?", "Pelo site, a partir de 1 hora antes na categoria Comum e 5 horas antes nas demais. Para viagens a outras cidades, 5 horas."], ["E se meu voo atrasar?", "Informe o número do voo na reserva: acompanhamos o horário de chegada. A primeira hora de espera após o pouso é grátis."], ["Posso cancelar?", "Sim. O cancelamento é grátis até {h} horas antes. Depois disso, devolvemos {d}% do valor pago."], ["Que documento preciso para Argentina ou Paraguai?", "Brasileiros: RG original (com menos de 10 anos) ou passaporte. Estrangeiros: passaporte. Menores de idade precisam de documentação própria."], ["O preço é por pessoa?", "Não. Todos os valores são por veículo, para o grupo inteiro, dentro da capacidade da categoria."]],
      waAjuda: "Prefere falar com a gente?", waBtn: "Chamar no WhatsApp", seg: "Preço fechado calculado na hora · dados protegidos", cob: "Valores em reais (R$), por veículo.",
      h1: "Reserve seu transfer em Foz do Iguaçu", sub: "Escolha o trajeto e a categoria do veículo. Preço fechado, calculado na hora, sem taxímetro.",
      trust: ["Preço fechado", "Cancelamento grátis até {h} h antes", "Transfer 24h com agendamento", "Argentina e Paraguai"],
      g_todos: "Todos", g_aeroporto: "Aeroportos", g_passeios: "Cataratas e passeios", g_motorista: "Motorista à disposição", g_viagens: "Outras cidades",
      apartir: "a partir de", porveiculo: "por veículo", escolher: "Escolher", consulta: "Sob consulta", pedir: "Pedir cotação no WhatsApp",
      consTit: "Grupos e experiências", consDesc: "Atendimento personalizado pelo WhatsApp:",
      data: "Data", hora: "Horário", horaVoo: "Horário do voo", sentido: "Sentido", chegada: "Chegada (aeroporto → hotel)", saida: "Saída (hotel → aeroporto)",
      voo: "Número do voo", origem: "Buscar em (hotel ou endereço)", destino: "Levar para", destinoOpc: "Levar para (opcional)",
      pax: "Passageiros", malas: "Malas grandes", cadeirinhas: "Cadeirinhas infantis (R$ {v} cada)", pet: "Vou levar um pet",
      horasExtras: "Horas extras de espera", horas: "Quantas horas", dias: "Quantas diárias",
      categoria: "Categoria do veículo", ate: "até {n} passageiros", malasTxt: "{n} malas grandes", malasMao: " + {n} de mão",
      ref: "Ex.: {m}. Modelos de referência; a categoria é garantida, o modelo não.",
      inclui: "Espera incluída: {n} h", fronteira: "Leve documento original (RG ou passaporte) para cruzar a fronteira.",
      espAero: "1 hora de espera grátis após o pouso. Depois, R$ {v} por hora.",
      add: "Adicionar à reserva", cancelar: "Cancelar", calculando: "Calculando…",
      carrinho: "Sua reserva", vazio: "Nenhum serviço adicionado ainda.", total: "Total", remover: "Remover", continuar: "Continuar", verReserva: "Finalizar →",
      dados: "Seus dados", nome: "Nome completo", email: "E-mail", tel: "WhatsApp com DDD/código do país", pais: "País", obs: "Observações (opcional)",
      pagar: "Pagamento na reserva", pSinal: "Pagar {p}% de sinal na reserva e o restante ao motorista no dia",
      pTotal: "Pagar 100% na reserva", aPagar: "A pagar na reserva", restante: "Restante no dia",
      regraPag: "Categoria Comum e 7 lugares: 100% na reserva. Executivo Luxo e viagens para outras cidades: {p}% de sinal.",
      pagInfo: "Depois que confirmarmos a disponibilidade, enviamos o link de pagamento (Pix, cartão em até 6x sem juros ou PayPal) pelo WhatsApp.",
      aceito: "Li e aceito os <a href=\"/termos.html\" target=\"_blank\">Termos de Uso</a> e a <a href=\"/privacidade.html\" target=\"_blank\">Política de Privacidade</a>. Cancelamento grátis até {h} h antes; depois disso, devolvemos {d}%.",
      enviar: "Enviar pedido de reserva", enviando: "Enviando…",
      okTit: "Pedido recebido!", okTxt: "Código do pedido: {c}. Vamos confirmar a disponibilidade e enviar o link de pagamento pelo WhatsApp.",
      okWa: "Enviar o pedido no WhatsApp", okNovo: "Fazer outra reserva",
      especial: "Data especial (+{p}%)", lin_base: "Serviço", lin_hora_extra: "Horas extras ({q} × {u})", lin_cadeirinha: "Cadeirinhas ({q} × {u})",
      lin_horas: "{q} horas × {u}", lin_diarias: "{q} diárias × {u}", lin_data_especial: "Data especial (+{p}%)",
      e_antecedencia: "Para esta categoria, reserve com pelo menos {horas} h de antecedência.", e_lotacao: "Até {max} passageiros",
      e_malas: "Até {max} malas grandes", e_sob_consulta: "Sob consulta", e_cadeirinha_categoria: "Cadeirinha só do Executivo para cima",
      e_pet_consulta: "Pet: consulte pelo WhatsApp", e_data_hora: "Escolha data e horário", e_categoria_nao_atende: "Indisponível",
      e_horas: "De {min} a {max} horas", e_dias: "Até {max} diárias", e_horas_extras: "Até {max} horas extras", e_data_longe: "Data muito distante",
      e_campos: "Preencha os campos obrigatórios.", e_cat: "Escolha a categoria do veículo.", e_nome: "Informe seu nome completo.",
      e_email: "Informe um e-mail válido.", e_telefone: "Informe um WhatsApp válido.", e_consentimento: "É preciso aceitar os termos.",
      e_verificacao: "Não conseguimos confirmar que você não é um robô. Tente de novo.", e_muitas_tentativas: "Muitos pedidos em pouco tempo. Aguarde alguns minutos.",
      e_item_invalido: "Um dos serviços ficou inválido ({m}). Remova e adicione de novo.", e_rede: "Falha de conexão. Tente de novo.",
      e_generico: "Não foi possível enviar. Tente de novo ou fale no WhatsApp.",
    },
    en: {
      eyebrow: "Online booking · Fixed price, instantly",
      passos: ["Choose the service", "Date, passengers and vehicle", "Send it and we confirm on WhatsApp"],
      benef: [["Fixed price", "See the price before you book. No meter, no surprises."], ["Professional driver", "Discreet service, clean car and agreed punctuality."], ["Free cancellation", "Up to {h} h before the trip, at no cost."], ["3 countries", "Brazil, Argentina and Paraguay, border crossing included."]],
      busca: "Search service, city or tour", ordem: "Sort", o_rec: "Recommended", o_menor: "Lowest price", o_maior: "Highest price", o_az: "Name (A–Z)",
      paxF: "People", p_any: "Any", p_4: "Up to 4", p_6: "5 or 6", p_7: "7 or more",
      nRes: "{n} services", nada: "No services match these filters.", limpar: "Clear filters",
      b_espera: "{n} h waiting", b_fronteira: "Border", b_hora: "Hourly", b_dia: "Full day", b_ida: "One way", b_iv: "Round trip",
      calcTit: "Can't find your route?", calcDesc: "Coming soon: price by pick-up and drop-off address. For now, ask for a quote on WhatsApp.", calcBtn: "Quote on WhatsApp",
      comoTit: "How it works", faqTit: "FAQ",
      faq: [["How do I pay?", "Once we confirm availability, we send a payment link on WhatsApp: Pix, card or PayPal. Standard and 7-seater pay 100% at booking; Executive and SUV can pay a 50% deposit."], ["How far in advance can I book?", "Online, from 1 hour before (Standard) and 5 hours before (other vehicles). Trips to other cities: 5 hours."], ["What if my flight is delayed?", "Add your flight number: we follow the arrival time. The first hour of waiting after landing is free."], ["Can I cancel?", "Yes. Cancellation is free up to {h} hours before. After that, {d}% is refunded."], ["Which document do I need for Argentina or Paraguay?", "Foreign visitors: passport. Brazilians: original ID card (issued less than 10 years ago) or passport. Minors need their own documents."], ["Is the price per person?", "No. All prices are per vehicle, for the whole group, within the vehicle capacity."]],
      waAjuda: "Rather talk to us?", waBtn: "Chat on WhatsApp", seg: "Fixed price calculated instantly · data protected", cob: "Prices in Brazilian reais (R$), per vehicle.",
      h1: "Book your transfer in Foz do Iguaçu", sub: "Choose your route and vehicle. Fixed price calculated instantly, no meter.",
      trust: ["Fixed price", "Free cancellation up to {h} h before", "24h transfers with advance booking", "Argentina & Paraguay"],
      g_todos: "All", g_aeroporto: "Airports", g_passeios: "Falls & tours", g_motorista: "Driver at your disposal", g_viagens: "Other cities",
      apartir: "from", porveiculo: "per vehicle", escolher: "Select", consulta: "On request", pedir: "Request a quote on WhatsApp",
      consTit: "Groups & experiences", consDesc: "Personal service via WhatsApp:",
      data: "Date", hora: "Time", horaVoo: "Flight time", sentido: "Direction", chegada: "Arrival (airport → hotel)", saida: "Departure (hotel → airport)",
      voo: "Flight number", origem: "Pick-up (hotel or address)", destino: "Drop-off", destinoOpc: "Drop-off (optional)",
      pax: "Passengers", malas: "Large suitcases", cadeirinhas: "Child car seats (R$ {v} each)", pet: "I'm bringing a pet",
      horasExtras: "Extra waiting hours", horas: "How many hours", dias: "How many days",
      categoria: "Vehicle category", ate: "up to {n} passengers", malasTxt: "{n} large suitcases", malasMao: " + {n} carry-on",
      ref: "E.g. {m}. Reference models; the category is guaranteed, the model is not.",
      inclui: "Waiting included: {n} h", fronteira: "Bring your original passport or ID to cross the border.",
      espAero: "1 hour free waiting after landing. After that, R$ {v} per hour.",
      add: "Add to booking", cancelar: "Cancel", calculando: "Calculating…",
      carrinho: "Your booking", vazio: "No services added yet.", total: "Total", remover: "Remove", continuar: "Continue", verReserva: "Checkout →",
      dados: "Your details", nome: "Full name", email: "Email", tel: "WhatsApp with country code", pais: "Country", obs: "Notes (optional)",
      pagar: "Payment at booking", pSinal: "Pay a {p}% deposit at booking and the rest to the driver on the day",
      pTotal: "Pay 100% at booking", aPagar: "Due at booking", restante: "Due on the day",
      regraPag: "Standard and 7-seater: 100% at booking. Luxury and trips to other cities: {p}% deposit.",
      pagInfo: "Once we confirm availability, we'll send you a payment link (Pix, card or PayPal) on WhatsApp.",
      aceito: "I have read and accept the <a href=\"/termos.html\" target=\"_blank\">Terms</a> and the <a href=\"/privacidade.html\" target=\"_blank\">Privacy Policy</a>. Free cancellation up to {h} h before; after that, {d}% is refunded.",
      enviar: "Send booking request", enviando: "Sending…",
      okTit: "Request received!", okTxt: "Booking code: {c}. We'll confirm availability and send the payment link on WhatsApp.",
      okWa: "Send the booking on WhatsApp", okNovo: "Make another booking",
      especial: "Special date (+{p}%)", lin_base: "Service", lin_hora_extra: "Extra hours ({q} × {u})", lin_cadeirinha: "Car seats ({q} × {u})",
      lin_horas: "{q} hours × {u}", lin_diarias: "{q} days × {u}", lin_data_especial: "Special date (+{p}%)",
      e_antecedencia: "For this category, book at least {horas} h in advance.", e_lotacao: "Up to {max} passengers",
      e_malas: "Up to {max} large suitcases", e_sob_consulta: "On request", e_cadeirinha_categoria: "Car seats from Executive upwards",
      e_pet_consulta: "Pets: ask us on WhatsApp", e_data_hora: "Choose date and time", e_categoria_nao_atende: "Not available",
      e_horas: "{min} to {max} hours", e_dias: "Up to {max} days", e_horas_extras: "Up to {max} extra hours", e_data_longe: "Date too far ahead",
      e_campos: "Please fill in the required fields.", e_cat: "Please choose a vehicle category.", e_nome: "Please enter your full name.",
      e_email: "Please enter a valid email.", e_telefone: "Please enter a valid WhatsApp number.", e_consentimento: "Please accept the terms.",
      e_verificacao: "We couldn't verify you're not a robot. Please try again.", e_muitas_tentativas: "Too many requests. Please wait a few minutes.",
      e_item_invalido: "One of the services is no longer valid ({m}). Remove it and add it again.", e_rede: "Connection error. Please try again.",
      e_generico: "Could not send. Please try again or contact us on WhatsApp.",
    },
    es: {
      eyebrow: "Reserva online · Precio cerrado al instante",
      passos: ["Elija el servicio", "Fecha, pasajeros y vehículo", "Envíe y confirmamos por WhatsApp"],
      benef: [["Precio cerrado", "Ve el valor antes de reservar. Sin taxímetro ni sorpresas."], ["Chofer profesional", "Atención discreta, auto limpio y puntualidad acordada."], ["Cancelación gratis", "Hasta {h} h antes del viaje, sin costo."], ["3 países", "Brasil, Argentina y Paraguay con cruce de frontera."]],
      busca: "Buscar servicio, ciudad o paseo", ordem: "Ordenar", o_rec: "Recomendados", o_menor: "Menor precio", o_maior: "Mayor precio", o_az: "Nombre (A–Z)",
      paxF: "Personas", p_any: "Cualquiera", p_4: "Hasta 4", p_6: "5 o 6", p_7: "7 o más",
      nRes: "{n} servicios", nada: "Ningún servicio coincide con estos filtros.", limpar: "Limpiar filtros",
      b_espera: "Espera {n} h", b_fronteira: "Frontera", b_hora: "Por hora", b_dia: "Día completo", b_ida: "Solo ida", b_iv: "Ida y vuelta",
      calcTit: "¿No encontró su trayecto?", calcDesc: "Próximamente: precio por dirección de salida y destino. Por ahora, pida la cotización por WhatsApp.", calcBtn: "Cotizar por WhatsApp",
      comoTit: "Cómo funciona", faqTit: "Preguntas frecuentes",
      faq: [["¿Cómo pago?", "Cuando confirmamos la disponibilidad, enviamos el link de pago por WhatsApp: Pix, tarjeta o PayPal. Estándar y 7 plazas pagan el 100% al reservar; Ejecutivo y SUV pueden pagar una seña del 50%."], ["¿Con cuánta anticipación puedo reservar?", "Online, desde 1 hora antes (Estándar) y 5 horas antes (demás vehículos). Viajes a otras ciudades: 5 horas."], ["¿Y si mi vuelo se atrasa?", "Indique el número de vuelo: seguimos el horario de llegada. La primera hora de espera tras el aterrizaje es gratis."], ["¿Puedo cancelar?", "Sí. La cancelación es gratis hasta {h} horas antes. Después, devolvemos el {d}% del valor."], ["¿Qué documento necesito para Argentina o Paraguay?", "Argentinos: DNI físico vigente o pasaporte. Otros extranjeros: pasaporte. Los menores necesitan documentación propia."], ["¿El precio es por persona?", "No. Todos los valores son por vehículo, para todo el grupo, dentro de la capacidad del vehículo."]],
      waAjuda: "¿Prefiere hablar con nosotros?", waBtn: "Escribir por WhatsApp", seg: "Precio cerrado calculado al instante · datos protegidos", cob: "Valores en reales (R$), por vehículo.",
      h1: "Reserve su traslado en Foz do Iguaçu", sub: "Elija el trayecto y la categoría del vehículo. Precio cerrado al instante, sin taxímetro.",
      trust: ["Precio cerrado", "Cancelación gratis hasta {h} h antes", "Traslados 24 h con reserva", "Argentina y Paraguay"],
      g_todos: "Todos", g_aeroporto: "Aeropuertos", g_passeios: "Cataratas y paseos", g_motorista: "Chofer a disposición", g_viagens: "Otras ciudades",
      apartir: "desde", porveiculo: "por vehículo", escolher: "Elegir", consulta: "A consultar", pedir: "Pedir cotización por WhatsApp",
      consTit: "Grupos y experiencias", consDesc: "Atención personalizada por WhatsApp:",
      data: "Fecha", hora: "Horario", horaVoo: "Horario del vuelo", sentido: "Sentido", chegada: "Llegada (aeropuerto → hotel)", saida: "Salida (hotel → aeropuerto)",
      voo: "Número de vuelo", origem: "Buscar en (hotel o dirección)", destino: "Llevar a", destinoOpc: "Llevar a (opcional)",
      pax: "Pasajeros", malas: "Valijas grandes", cadeirinhas: "Sillas para niños (R$ {v} c/u)", pet: "Voy con mascota",
      horasExtras: "Horas extra de espera", horas: "Cuántas horas", dias: "Cuántos días",
      categoria: "Categoría del vehículo", ate: "hasta {n} pasajeros", malasTxt: "{n} valijas grandes", malasMao: " + {n} de mano",
      ref: "Ej.: {m}. Modelos de referencia; la categoría está garantizada, el modelo no.",
      inclui: "Espera incluida: {n} h", fronteira: "Lleve su documento original (DNI o pasaporte) para cruzar la frontera.",
      espAero: "1 hora de espera gratis tras el aterrizaje. Después, R$ {v} por hora.",
      add: "Agregar a la reserva", cancelar: "Cancelar", calculando: "Calculando…",
      carrinho: "Su reserva", vazio: "Todavía no agregó servicios.", total: "Total", remover: "Quitar", continuar: "Continuar", verReserva: "Finalizar →",
      dados: "Sus datos", nome: "Nombre completo", email: "Email", tel: "WhatsApp con código de país", pais: "País", obs: "Observaciones (opcional)",
      pagar: "Pago en la reserva", pSinal: "Pagar una seña del {p}% en la reserva y el resto al chofer el día del viaje",
      pTotal: "Pagar el 100% en la reserva", aPagar: "A pagar en la reserva", restante: "Resto el día del viaje",
      regraPag: "Estándar y 7 plazas: 100% en la reserva. Lujo y viajes a otras ciudades: seña del {p}%.",
      pagInfo: "Cuando confirmemos la disponibilidad, le enviamos el link de pago (Pix, tarjeta o PayPal) por WhatsApp.",
      aceito: "Leí y acepto los <a href=\"/termos.html\" target=\"_blank\">Términos</a> y la <a href=\"/privacidade.html\" target=\"_blank\">Política de Privacidad</a>. Cancelación gratis hasta {h} h antes; después, devolvemos el {d}%.",
      enviar: "Enviar pedido de reserva", enviando: "Enviando…",
      okTit: "¡Pedido recibido!", okTxt: "Código del pedido: {c}. Confirmaremos la disponibilidad y enviaremos el link de pago por WhatsApp.",
      okWa: "Enviar el pedido por WhatsApp", okNovo: "Hacer otra reserva",
      especial: "Fecha especial (+{p}%)", lin_base: "Servicio", lin_hora_extra: "Horas extra ({q} × {u})", lin_cadeirinha: "Sillas ({q} × {u})",
      lin_horas: "{q} horas × {u}", lin_diarias: "{q} días × {u}", lin_data_especial: "Fecha especial (+{p}%)",
      e_antecedencia: "Para esta categoría, reserve con al menos {horas} h de anticipación.", e_lotacao: "Hasta {max} pasajeros",
      e_malas: "Hasta {max} valijas grandes", e_sob_consulta: "A consultar", e_cadeirinha_categoria: "Sillas desde Ejecutivo",
      e_pet_consulta: "Mascotas: consulte por WhatsApp", e_data_hora: "Elija fecha y horario", e_categoria_nao_atende: "No disponible",
      e_horas: "De {min} a {max} horas", e_dias: "Hasta {max} días", e_horas_extras: "Hasta {max} horas extra", e_data_longe: "Fecha muy lejana",
      e_campos: "Complete los campos obligatorios.", e_cat: "Elija la categoría del vehículo.", e_nome: "Ingrese su nombre completo.",
      e_email: "Ingrese un email válido.", e_telefone: "Ingrese un WhatsApp válido.", e_consentimento: "Debe aceptar los términos.",
      e_verificacao: "No pudimos verificar que no es un robot. Intente de nuevo.", e_muitas_tentativas: "Demasiados pedidos. Espere unos minutos.",
      e_item_invalido: "Uno de los servicios ya no es válido ({m}). Quítelo y agréguelo de nuevo.", e_rede: "Error de conexión. Intente de nuevo.",
      e_generico: "No se pudo enviar. Intente de nuevo o escríbanos por WhatsApp.",
    },
  };

  /* ---------- estado ---------- */
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem("iet_" + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem("iet_" + k, JSON.stringify(v)); } catch (e) {} },
  };
  var qs = new URLSearchParams(location.search);
  var htmlLang = (document.documentElement.lang || "pt").slice(0, 2);
  var S = { lang: qs.get("lang") || store.get("lang", htmlLang), grupo: qs.get("g") || "todos", cart: store.get("cart2", []), q: "", sort: "rec", pax: "any" };
  if (!T[S.lang]) S.lang = "pt";
  var CAT = null; // catálogo vindo da API
  function t(k, v) {
    var s = T[S.lang][k]; if (s === undefined) s = T.pt[k]; if (s === undefined) return k;
    if (v) Object.keys(v).forEach(function (x) { s = String(s).split("{" + x + "}").join(v[x]); });
    return s;
  }
  function L(o) { return o ? (o[S.lang] || o.pt) : ""; }
  function svc(id) { return CAT.servicos.filter(function (s) { return s.id === id; })[0]; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function brl(v) { return "R$ " + Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function track(ev, p) { try { if (typeof gtag === "function") gtag("event", ev, p || {}); } catch (e) {} }
  function waLink(text) { return "https://wa.me/" + CAT.config.whatsapp + "?text=" + encodeURIComponent(text); }
  function api(path, body) {
    return fetch(path, body ? { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) } : {})
      .then(function (r) { return r.json(); });
  }
  function errTxt(r) {
    if (!r || !r.erro) return t("e_generico");
    var k = "e_" + r.erro; var s = T[S.lang][k] || T.pt[k];
    return s ? t(k, r) : t("e_generico");
  }

  /* ---------- textos fixos ---------- */
  var ICO = {
    preco: '<path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>',
    motorista: '<circle cx="12" cy="7" r="4"/><path d="M5.5 21a6.5 6.5 0 0113 0"/>',
    cancel: '<path d="M21 12a9 9 0 11-3-6.7L21 8"/><path d="M21 3v5h-5"/>',
    mundo: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 010 20 15 15 0 010-20"/>',
  };
  function ico(k) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICO[k] + "</svg>"; }
  function txt(sel, v) { var el = $(sel); if (el) el.textContent = v; }
  function renderStatic() {
    var cfg = CAT.config, h = cfg.cancelamento.gratisAteHoras, d = cfg.cancelamento.devolveDepoisPct;
    document.documentElement.lang = S.lang === "pt" ? "pt-BR" : S.lang;
    txt("#r-eyebrow", t("eyebrow")); txt("#r-h1", t("h1")); txt("#r-sub", t("sub"));
    $("#r-steps").innerHTML = t("passos").map(function (x, i) { return '<li><b>' + (i + 1) + "</b><span>" + esc(x) + "</span></li>"; }).join("");
    var ik = ["preco", "motorista", "cancel", "mundo"];
    $("#r-benef").innerHTML = t("benef").map(function (x, i) {
      return '<div class="r-bf reveal"><i>' + ico(ik[i]) + "</i><div><b>" + esc(x[0]) + "</b><span>" + esc(x[1].replace("{h}", h)) + "</span></div></div>";
    }).join("");
    $("#r-q").placeholder = t("busca"); txt("#r-sort-l", t("ordem")); txt("#r-pax-l", t("paxF"));
    $("#r-sort").innerHTML = ["rec", "menor", "maior", "az"].map(function (k) { return '<option value="' + k + '"' + (S.sort === k ? " selected" : "") + ">" + esc(t("o_" + k)) + "</option>"; }).join("");
    $("#r-pax").innerHTML = [["any", "p_any"], ["4", "p_4"], ["6", "p_6"], ["7", "p_7"]].map(function (k) { return '<option value="' + k[0] + '"' + (S.pax === k[0] ? " selected" : "") + ">" + esc(t(k[1])) + "</option>"; }).join("");
    txt("#r-como-t", t("comoTit")); txt("#r-faq-t", t("faqTit"));
    $("#r-como").innerHTML = t("passos").map(function (x, i) { return '<li class="reveal"><b>' + (i + 1) + "</b><span>" + esc(x) + "</span></li>"; }).join("");
    $("#r-faq").innerHTML = t("faq").map(function (x) {
      return '<details class="reveal"><summary>' + esc(x[0]) + "</summary><p>" + esc(x[1].replace("{h}", h).replace("{d}", d)) + "</p></details>";
    }).join("");
    txt("#r-wa-t", t("waAjuda")); txt("#r-seg", t("seg")); txt("#r-cob", t("cob")); var wb = $("#r-wa-b"); if (wb) { wb.textContent = t("waBtn"); wb.href = waLink(t("waAjuda")); }
    $$("[data-lang]").forEach(function (b) { b.classList.toggle("on", b.dataset.lang === S.lang); });
    observe();
  }

  /* ---------- lista ---------- */
  function paxMin() { return S.pax === "any" ? 1 : S.pax === "4" ? 1 : S.pax === "6" ? 5 : 7; }
  function minPrice(s, pmin) {
    pmin = pmin || 1;
    var v = Object.keys(s.precos).filter(function (k) { return s.precos[k] != null && CAT.categorias[k] && CAT.categorias[k].pax >= pmin; })
      .map(function (k) { return s.precos[k]; });
    if (!v.length) return null;
    var m = Math.min.apply(null, v);
    return s.tipo === "hora" ? m * CAT.config.porHora.minimoHoras : m;
  }
  function norm(x) { return String(x || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); }
  function badges(s) {
    var b = [];
    if (s.tipo === "transfer" || s.tipo === "viagem") b.push(t("b_ida"));
    if (s.tipo === "passeio") b.push(t("b_iv"));
    if (s.tipo === "hora") b.push(t("b_hora"));
    if (s.tipo === "diaria") b.push(t("b_dia"));
    if (s.espera) b.push(t("b_espera", { n: s.espera }));
    if (s.fronteira) b.push(t("b_fronteira"));
    return b.map(function (x) { return "<span>" + esc(x) + "</span>"; }).join("");
  }
  function filtered() {
    var q = norm(S.q), pm = paxMin();
    var list = CAT.servicos.filter(function (s) {
      if (S.grupo !== "todos" && s.grupo !== S.grupo) return false;
      if (q && norm(L(s.nome) + " " + L(s.desc)).indexOf(q) < 0) return false;
      if (S.pax !== "any" && minPrice(s, pm) == null) return false;
      return true;
    });
    if (S.sort !== "rec") {
      list = list.slice().sort(function (a, b) {
        if (S.sort === "az") return L(a.nome).localeCompare(L(b.nome));
        var pa = minPrice(a, pm), pb = minPrice(b, pm);
        if (pa == null) return 1; if (pb == null) return -1;
        return S.sort === "menor" ? pa - pb : pb - pa;
      });
    }
    return list;
  }
  function renderList() {
    var grupos = ["todos", "aeroporto", "passeios", "motorista", "viagens"];
    $("#r-chips").innerHTML = grupos.map(function (g) {
      var n = CAT.servicos.filter(function (s) { return g === "todos" || s.grupo === g; }).length;
      return '<button type="button" class="r-chip' + (S.grupo === g ? " on" : "") + '" data-g="' + g + '">' + esc(t("g_" + g)) + " <i>" + n + "</i></button>";
    }).join("");
    var list = filtered(), pm = paxMin();
    txt("#r-count", t("nRes", { n: list.length }));
    var html = list.map(function (s, i) {
      var mp = minPrice(s, pm);
      return '<article class="r-card reveal" style="--d:' + Math.min(i, 8) * 40 + 'ms"><div class="r-img"><img src="/img/' + s.foto + '-900.webp" alt="' + esc(L(s.nome)) + '" loading="lazy" width="900" height="506">' +
        '<div class="r-badges">' + badges(s) + "</div></div>" +
        '<div class="r-card-b"><span class="r-grp">' + esc(t("g_" + s.grupo)) + "</span><h3>" + esc(L(s.nome)) + "</h3><p>" + esc(L(s.desc)) + "</p>" +
        '<div class="r-card-f"><span><small>' + esc(t("apartir")) + "</small> <b>" + (mp == null ? esc(t("consulta")) : brl(mp)) + "</b> <small>" + esc(t("porveiculo")) + "</small></span>" +
        '<button type="button" class="r-btn" data-sel="' + s.id + '">' + esc(t("escolher")) + ' <span aria-hidden="true">→</span></button></div></div></article>';
    }).join("");
    if (!list.length) html = '<div class="r-none"><p>' + esc(t("nada")) + '</p><button type="button" class="r-btn r-ghost" id="r-clear">' + esc(t("limpar")) + "</button></div>";
    if (S.grupo === "todos" || S.grupo === "viagens") {
      html += '<article class="r-card r-card-calc reveal"><div class="r-card-b"><span class="r-grp">' + esc(t("g_viagens")) + "</span><h3>" + esc(t("calcTit")) + "</h3><p>" + esc(t("calcDesc")) + "</p>" +
        '<a class="r-btn r-btn-wa" target="_blank" rel="noopener" href="' + waLink(t("calcTit")) + '">' + esc(t("calcBtn")) + "</a></div></article>";
    }
    if (S.grupo === "todos") {
      html += '<article class="r-card r-card-cons reveal"><div class="r-card-b"><span class="r-grp">' + esc(t("consulta")) + "</span><h3>" + esc(t("consTit")) + "</h3><p>" + esc(t("consDesc")) + "</p><ul>" +
        CAT.consulta.map(function (c) { return "<li>" + esc(L(c.nome)) + "</li>"; }).join("") + "</ul>" +
        '<a class="r-btn r-btn-wa" target="_blank" rel="noopener" href="' + waLink(t("pedir") + ": " + CAT.consulta.map(function (c) { return L(c.nome); }).join(" / ")) + '">' + esc(t("pedir")) + "</a></div></article>";
    }
    $("#r-grid").innerHTML = html;
    observe();
  }
  var io = null;
  function observe() {
    var els = $$(".reveal:not(.in)");
    if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) { els.forEach(function (e) { e.classList.add("in"); }); return; }
    if (!io) io = new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); } }); }, { rootMargin: "0px 0px -40px 0px" });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ---------- modal ---------- */
  var cur = null, quotes = {}, qTimer = null, qSeq = 0;
  function openSvc(id) {
    var s = svc(id); if (!s) return;
    cur = { servico: id, categoria: null, pax: 2, malas: 2, cadeirinhas: 0, pet: false, horasExtras: 0, horas: CAT.config.porHora.minimoHoras, dias: 1, sentido: "chegada", data: "", hora: "", voo: "", origem: "", destino: "" };
    quotes = {};
    track("view_item", { item_id: id, item_name: s.nome.pt });
    renderModal(); var m = $("#r-modal"); if (m.showModal) m.showModal(); else m.setAttribute("open", "");
  }
  function field(l, input, cls) { return '<label class="r-f' + (cls ? " " + cls : "") + '"><span>' + esc(l) + "</span>" + input + "</label>"; }
  function num(n, v, mi, ma) { return '<input type="number" inputmode="numeric" name="' + n + '" value="' + v + '" min="' + mi + '" max="' + ma + '">'; }
  function hoje() { var d = new Date(Date.now() - 3 * 3600e3); return d.toISOString().slice(0, 10); } // horário de Foz (UTC-3)
  function renderModal() {
    var s = svc(cur.servico), m = $("#r-modal-b"), cfg = CAT.config;
    var f = '<button type="button" class="r-x" data-close aria-label="' + esc(t("cancelar")) + '">×</button><h3>' + esc(L(s.nome)) + "</h3><p class=\"r-sm\">" + esc(L(s.desc)) + "</p>";
    if (s.sentido) f += field(t("sentido"), '<select name="sentido"><option value="chegada">' + esc(t("chegada")) + '</option><option value="saida">' + esc(t("saida")) + "</option></select>");
    f += '<div class="r-row">' + field(t("data") + " *", '<input type="date" name="data" min="' + hoje() + '" required>') +
      field((s.voo ? t("horaVoo") : t("hora")) + " *", '<input type="time" name="hora" required>') + "</div>";
    if (s.voo) f += field(t("voo"), '<input name="voo" placeholder="G3 1234" maxlength="20">');
    f += '<div class="r-row">' + field(t("origem") + " *", '<input name="origem" required maxlength="160" autocomplete="street-address">') +
      field(s.tipo === "transfer" || s.tipo === "viagem" ? t("destino") : t("destinoOpc"), '<input name="destino" maxlength="160">') + "</div>";
    f += '<div class="r-row">' + field(t("pax"), num("pax", cur.pax, 1, 15)) + field(t("malas"), num("malas", cur.malas, 0, 15)) + "</div>";
    if (s.tipo === "hora") f += field(t("horas"), num("horas", cur.horas, cfg.porHora.minimoHoras, cfg.porHora.maximoHoras));
    if (s.tipo === "diaria") f += field(t("dias"), num("dias", cur.dias, 1, 15));
    if (s.espera || s.tipo === "diaria") f += field(t("horasExtras"), num("horasExtras", cur.horasExtras, 0, 8));
    f += '<div class="r-row">' + field(t("cadeirinhas", { v: cfg.cadeirinha.valor }), num("cadeirinhas", cur.cadeirinhas, 0, 3)) +
      '<label class="r-chk r-chk-in"><input type="checkbox" name="pet"> <span>' + esc(t("pet")) + "</span></label></div>";
    if (s.espera) f += '<p class="r-note">' + esc(t("inclui", { n: s.espera })) + "</p>";
    if (s.voo) f += '<p class="r-note">' + esc(t("espAero", { v: cfg.esperaAeroporto.valorHora })) + "</p>";
    if (s.fronteira) f += '<p class="r-note">' + esc(t("fronteira")) + "</p>";
    f += '<p class="r-lbl">' + esc(t("categoria")) + '</p><div class="r-cats" id="r-cats"></div>';
    f += '<p class="r-err" id="r-merr" role="alert"></p><div class="r-actions"><button type="button" class="r-btn r-ghost" data-close>' + esc(t("cancelar")) +
      '</button><button type="submit" class="r-btn">' + esc(t("add")) + "</button></div>";
    m.innerHTML = f;
    renderCats(); requestQuotes();
  }
  function catsHtml() {
    var s = svc(cur.servico), out = "";
    Object.keys(CAT.categorias).forEach(function (k) {
      if (!(k in s.precos)) return;
      var c = CAT.categorias[k], q = quotes[k];
      var info = "<b>" + esc(L(c.nome)) + "</b><span>" + esc(L(c.desc)) + "</span><span>" + esc(t("ate", { n: c.pax })) + " · " +
        esc(t("malasTxt", { n: c.malas }) + (c.malasMao ? t("malasMao", { n: c.malasMao }) : "")) + "</span>" +
        '<span class="r-ref">' + esc(t("ref", { m: c.ref })) + "</span>";
      if (s.precos[k] == null || (q && q.consulta)) {
        out += '<div class="r-cat r-cat-q">' + info + '<a target="_blank" rel="noopener" href="' + waLink(t("pedir") + ": " + L(s.nome) + " — " + L(c.nome)) + '">' + esc(t("consulta")) + " →</a></div>";
        return;
      }
      var ok = q && q.ok, price = !q ? t("calculando") : ok ? brl(q.valor) : errTxt(q);
      out += '<label class="r-cat' + (ok ? "" : " r-off") + (cur.categoria === k && ok ? " on" : "") + '"><input type="radio" name="categoria" value="' + k + '"' +
        (cur.categoria === k && ok ? " checked" : "") + (ok ? "" : " disabled") + ">" + info + '<em class="r-price' + (ok ? "" : " r-pmsg") + '">' + esc(price) +
        (ok && q.dataEspecial ? ' <small class="r-esp">' + esc(t("especial", { p: CAT.config.feriadoAcrescimoPct })) + "</small>" : "") + "</em></label>";
    });
    return out;
  }
  function renderCats() { var el = $("#r-cats"); if (el) el.innerHTML = catsHtml(); }
  function readModal() {
    var fm = $("#r-modal-b"), g = function (n) { var el = fm.querySelector('[name="' + n + '"]'); return el ? (el.type === "checkbox" ? el.checked : el.value) : undefined; };
    ["sentido", "data", "hora", "voo", "origem", "destino"].forEach(function (k) { var v = g(k); if (v !== undefined) cur[k] = String(v).trim(); });
    ["pax", "malas", "cadeirinhas", "horasExtras", "horas", "dias"].forEach(function (k) { var v = g(k); if (v !== undefined) cur[k] = Math.max(0, parseInt(v, 10) || 0); });
    if (cur.pax < 1) cur.pax = 1;
    cur.pet = !!g("pet");
    var r = fm.querySelector('[name="categoria"]:checked'); cur.categoria = r ? r.value : cur.categoria;
  }
  function requestQuotes() {
    clearTimeout(qTimer);
    qTimer = setTimeout(function () {
      if (!cur) return;
      var seq = ++qSeq, body = JSON.parse(JSON.stringify(cur)); delete body.categoria;
      if (!cur.data || !cur.hora) { quotes = {}; Object.keys(svc(cur.servico).precos).forEach(function (k) { quotes[k] = { ok: false, erro: "data_hora" }; }); renderCats(); return; }
      api("/api/cotacao", body).then(function (r) {
        if (seq !== qSeq || !cur) return;
        quotes = (r && r.categorias) || {};
        if (cur.categoria && !(quotes[cur.categoria] && quotes[cur.categoria].ok)) cur.categoria = null;
        renderCats();
      }).catch(function () { if (seq === qSeq) { $("#r-merr").textContent = t("e_rede"); } });
    }, 250);
  }
  function closeModal() { var m = $("#r-modal"); if (m.close) m.close(); else m.removeAttribute("open"); cur = null; }

  /* ---------- carrinho ---------- */
  function saveCart() { store.set("cart2", S.cart); renderCart(); }
  function fmtDate(d) { var p = String(d).split("-"); return p[2] + "/" + p[1] + "/" + p[0]; }
  function itemDesc(it) {
    var s = svc(it.servico), c = CAT.categorias[it.categoria], parts = [L(c.nome) + " · " + fmtDate(it.data) + " " + it.hora];
    if (s.sentido) parts.push(t(it.sentido));
    if (it.voo) parts.push(t("voo") + ": " + it.voo);
    parts.push(t("origem").replace(/ \(.*\)/, "") + ": " + it.origem);
    if (it.destino) parts.push(t("destino") + ": " + it.destino);
    parts.push(t("pax") + ": " + it.pax + " · " + t("malas") + ": " + it.malas);
    return parts;
  }
  function modosDe(it) { return (it.cot && it.cot.modos) || ["total"]; }
  function pagamento(escolha) {
    var tot = 0, agora = 0;
    S.cart.forEach(function (it) {
      var m = modosDe(it), modo = m.indexOf(escolha) > -1 ? escolha : m[0];
      tot += it.cot.valor; agora += modo === "total" ? it.cot.valor : Math.round(it.cot.valor * CAT.config.sinalPct / 100);
    });
    return { total: tot, agora: agora };
  }
  function renderCart() {
    $("#r-cart-tit").textContent = t("carrinho");
    var box = $("#r-cart-items");
    if (!S.cart.length) box.innerHTML = '<p class="r-empty">' + esc(t("vazio")) + "</p>";
    else box.innerHTML = S.cart.map(function (it, i) {
      var s = svc(it.servico); if (!s) return "";
      return '<div class="r-ci"><b>' + esc(L(s.nome)) + "</b><span>" + itemDesc(it).map(esc).join("<br>") + '</span><div class="r-ci-f"><em>' + brl(it.cot.valor) +
        '</em><button type="button" class="r-link" data-rm="' + i + '">' + esc(t("remover")) + "</button></div></div>";
    }).join("");
    var tot = S.cart.reduce(function (a, it) { return a + it.cot.valor; }, 0);
    $("#r-cart-tot").innerHTML = S.cart.length ? "<div><span>" + esc(t("total")) + "</span><b>" + brl(tot) + "</b></div>" : "";
    $("#r-go").disabled = !S.cart.length; $("#r-go").textContent = t("continuar");
    $("#r-bar-n").textContent = S.cart.length; $("#r-bar-v").textContent = S.cart.length ? brl(tot) : "";
    $("#r-bar").hidden = !S.cart.length; $("#r-bar-go").textContent = t("verReserva");
    if (!$("#r-checkout").hidden) updatePay();
  }

  /* ---------- checkout ---------- */
  var tsId = null;
  function renderCheckout() {
    var temEscolha = S.cart.some(function (it) { return modosDe(it).length > 1; });
    var cfg = CAT.config;
    var h = "<h2>" + esc(t("dados")) + '</h2><div class="r-row">' + field(t("nome") + " *", '<input name="nome" required autocomplete="name" maxlength="120">') +
      field(t("tel") + " *", '<input name="telefone" type="tel" required autocomplete="tel" maxlength="40" placeholder="+55 45 99999-9999">') + '</div><div class="r-row">' +
      field(t("email") + " *", '<input name="email" type="email" required autocomplete="email" maxlength="160">') + field(t("pais"), '<input name="pais" autocomplete="country-name" maxlength="60">') + "</div>" +
      field(t("obs"), '<textarea name="observacoes" rows="2" maxlength="1000"></textarea>') +
      '<input type="text" name="website" tabindex="-1" autocomplete="off" class="r-hp" aria-hidden="true">' +
      '<p class="r-lbl">' + esc(t("pagar")) + "</p>" +
      (temEscolha ? '<div class="r-opts">' + opt("modo", "sinal", t("pSinal", { p: cfg.sinalPct }), true) + opt("modo", "total", t("pTotal"), false) + "</div>" : "") +
      '<div class="r-paybox" id="r-paybox"></div><p class="r-sm">' + esc(t("regraPag", { p: cfg.sinalPct })) + "</p>" +
      '<p class="r-sm">' + esc(t("pagInfo")) + "</p>" +
      '<label class="r-chk"><input type="checkbox" name="consentimento" required> <span>' + t("aceito", { h: cfg.cancelamento.gratisAteHoras, d: cfg.cancelamento.devolveDepoisPct }) + "</span></label>" +
      (cfg.turnstileSiteKey ? '<div id="r-ts"></div>' : "") +
      '<p class="r-err" id="r-cerr" role="alert"></p><button type="submit" class="r-btn r-big" id="r-send">' + esc(t("enviar")) + '</button><div id="r-done"></div>';
    $("#r-checkout-f").innerHTML = h;
    updatePay();
    if (cfg.turnstileSiteKey) loadTurnstile();
  }
  function loadTurnstile() {
    function render() { try { tsId = window.turnstile.render("#r-ts", { sitekey: CAT.config.turnstileSiteKey, language: S.lang === "pt" ? "pt-br" : S.lang }); } catch (e) {} }
    if (window.turnstile) return render();
    var sc = document.createElement("script"); sc.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"; sc.async = true; sc.onload = render; document.head.appendChild(sc);
  }
  function opt(n, v, label, checked) {
    return '<label class="r-opt"><input type="radio" name="' + n + '" value="' + v + '"' + (checked ? " checked" : "") + "><span>" + esc(label) + "</span></label>";
  }
  function escolhaAtual() { var r = $('#r-checkout-f [name="modo"]:checked'); return r ? r.value : "sinal"; }
  function updatePay() {
    var box = $("#r-paybox"); if (!box) return;
    var p = pagamento(escolhaAtual());
    box.innerHTML = "<div><span>" + esc(t("total")) + "</span><b>" + brl(p.total) + "</b></div><div><span>" + esc(t("aPagar")) + "</span><b>" + brl(p.agora) + "</b></div>" +
      (p.total - p.agora > 0.001 ? '<div class="r-sm"><span>' + esc(t("restante")) + "</span><span>" + brl(p.total - p.agora) + "</span></div>" : "");
  }
  function submitCheckout(e) {
    e.preventDefault();
    var f = $("#r-checkout-f"), g = function (n) { var el = f.querySelector('[name="' + n + '"]'); return el ? (el.type === "checkbox" ? el.checked : el.value.trim()) : ""; };
    var err = $("#r-cerr");
    if (!g("nome") || !g("telefone") || !g("email")) { err.textContent = t("e_campos"); return; }
    if (!g("consentimento")) { err.textContent = t("e_consentimento"); return; }
    err.textContent = "";
    var btn = $("#r-send"); btn.disabled = true; btn.textContent = t("enviando");
    var body = {
      idioma: S.lang, consentimento: true, modoPagamento: escolhaAtual(), website: g("website"),
      turnstile: tsId != null && window.turnstile ? window.turnstile.getResponse(tsId) : "",
      cliente: { nome: g("nome"), email: g("email"), telefone: g("telefone"), pais: g("pais"), observacoes: g("observacoes") },
      itens: S.cart.map(function (it) { var x = JSON.parse(JSON.stringify(it)); delete x.cot; return x; }),
    };
    track("begin_checkout", { value: pagamento(body.modoPagamento).total, currency: "BRL" });
    api("/api/pedidos", body).then(function (r) {
      if (!r || !r.ok) {
        btn.disabled = false; btn.textContent = t("enviar");
        if (tsId != null && window.turnstile) try { window.turnstile.reset(tsId); } catch (x) {}
        err.textContent = r && r.erro === "item_invalido" ? t("e_item_invalido", { m: errTxt({ erro: r.motivo, horas: r.detalhe && r.detalhe.horas, max: r.detalhe && r.detalhe.max }) }) : errTxt(r);
        return;
      }
      track("generate_lead", { value: r.total, currency: "BRL", transaction_id: r.codigo });
      store.set("ultimoPedido", { codigo: r.codigo, token: r.token, em: Date.now() });
      S.cart = []; saveCart();
      btn.hidden = true;
      $("#r-done").innerHTML = '<div class="r-ok"><h3>' + esc(t("okTit")) + "</h3><p>" + esc(t("okTxt", { c: r.codigo })) + "</p>" +
        '<div class="r-actions r-center"><a class="r-btn r-btn-wa" target="_blank" rel="noopener" href="' + esc(r.whatsapp) + '">' + esc(t("okWa")) +
        '</a><button type="button" class="r-btn r-ghost" id="r-novo">' + esc(t("okNovo")) + "</button></div></div>";
      $("#r-done").scrollIntoView({ behavior: "smooth", block: "center" });
    }).catch(function () { btn.disabled = false; btn.textContent = t("enviar"); err.textContent = t("e_rede"); });
  }

  /* ---------- eventos ---------- */
  document.addEventListener("click", function (e) {
    var b = e.target.closest("button, a"); if (!b || !CAT) return;
    if (b.dataset.g) { S.grupo = b.dataset.g; renderList(); }
    else if (b.dataset.sel) openSvc(b.dataset.sel);
    else if (b.hasAttribute("data-close")) closeModal();
    else if (b.dataset.rm !== undefined) { S.cart.splice(+b.dataset.rm, 1); saveCart(); }
    else if (b.dataset.lang) { S.lang = b.dataset.lang; store.set("lang", S.lang); all(); }
    else if (b.id === "r-go" || b.id === "r-bar-go") { $("#r-checkout").hidden = false; renderCheckout(); $("#r-checkout").scrollIntoView({ behavior: "smooth" }); }
    else if (b.id === "r-novo") { $("#r-checkout").hidden = true; scrollTo({ top: 0, behavior: "smooth" }); }
    else if (b.id === "r-clear") { S.grupo = "todos"; S.q = ""; S.pax = "any"; S.sort = "rec"; $("#r-q").value = ""; renderStatic(); renderList(); }
  });
  var qT; $("#r-q").addEventListener("input", function () { var v = this.value; clearTimeout(qT); qT = setTimeout(function () { S.q = v; renderList(); }, 150); });
  $("#r-sort").addEventListener("change", function () { S.sort = this.value; renderList(); });
  $("#r-pax").addEventListener("change", function () { S.pax = this.value; renderList(); });
  $("#r-modal-b").addEventListener("change", function (e) {
    if (e.target.name === "categoria") {
      cur.categoria = e.target.value;
      $$("#r-cats .r-cat").forEach(function (l) { var i = l.querySelector("input"); l.classList.toggle("on", !!(i && i.checked)); });
      return;
    }
    readModal(); requestQuotes();
  });
  $("#r-modal-b").addEventListener("input", function (e) {
    if (["pax", "malas", "horas", "dias", "horasExtras", "cadeirinhas"].indexOf(e.target.name) > -1) { readModal(); requestQuotes(); }
  });
  $("#r-modal").addEventListener("close", function () { cur = null; });
  $("#r-modal-b").addEventListener("submit", function (e) {
    e.preventDefault(); readModal();
    var er = $("#r-merr");
    if (!cur.origem || !cur.data || !cur.hora) { er.textContent = t("e_campos"); return; }
    var q = cur.categoria && quotes[cur.categoria];
    if (!q || !q.ok) { er.textContent = t("e_cat"); return; }
    var item = JSON.parse(JSON.stringify(cur)); item.cot = { valor: q.valor, modos: q.modos };
    S.cart.push(item); saveCart(); closeModal();
    ["#r-cart", "#r-bar"].forEach(function (sel) { var el = $(sel); if (el) { el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump"); } });
    track("add_to_cart", { value: q.valor, currency: "BRL", items: [{ item_id: item.servico, item_variant: item.categoria }] });
    $("#r-cart").scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
  $("#r-checkout-f").addEventListener("submit", submitCheckout);
  $("#r-checkout-f").addEventListener("change", function (e) { if (e.target.name === "modo") updatePay(); });

  function all() { renderStatic(); renderList(); renderCart(); if (!$("#r-checkout").hidden) renderCheckout(); }

  api("/api/catalogo").then(function (c) {
    CAT = c; $("#r-grid").classList.remove("loading");
    S.cart = S.cart.filter(function (it) { return it && it.cot && svc(it.servico) && CAT.categorias[it.categoria]; });
    all(); track("view_item_list", { item_list_name: "reservas" });
    if (qs.get("s") && svc(qs.get("s"))) openSvc(qs.get("s"));
  }).catch(function () {
    $("#r-grid").classList.remove("loading"); $("#r-grid").innerHTML = '<p class="r-err">' + esc(T[S.lang].e_rede) + ' <a class="r-btn r-btn-wa" href="https://wa.me/5545991185798">WhatsApp</a></p>';
  });
})();
