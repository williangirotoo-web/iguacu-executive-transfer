/* =====================================================================
   IGUAÇU EXECUTIVE TRANSFER — FONTE ÚNICA DE PREÇOS E REGRAS
   Valores em R$, POR VEÍCULO. null = "sob consulta" (vai para o WhatsApp).
   Categoria ausente no objeto de preços = "não faz".
   Tabela aprovada pelo Willian em 29/10/2026.
   Este arquivo roda SÓ no servidor (Worker). O navegador recebe uma cópia
   pela API /api/catalogo, mas o preço cobrado é sempre recalculado aqui.
   ===================================================================== */

export const CONFIG = {
  whatsapp: "5545991185798",
  emailAvisos: "atendimento@g7.taxi.br",
  fuso: "-03:00", // Foz do Iguaçu (sem horário de verão)

  // antecedência mínima para reservar pelo site (horas)
  antecedenciaHoras: { comum: 1, exec: 5, suv: 5, sete: 5, luxo: 5, van: 5 },
  antecedenciaViagensHoras: 5,
  maxDiasFuturo: 400,

  cancelamento: { gratisAteHoras: 48, devolveDepoisPct: 50, naoComparecimentoPct: 0 },
  feriadoAcrescimoPct: 5,
  esperaAeroporto: { gratisMin: 60, valorHora: 80 }, // cobrado à parte, se passar
  cadeirinha: { valor: 50, naoDisponivel: ["comum"] },
  pet: { consulta: ["comum"] }, // nas demais categorias, sem custo (caixa para pet médio/pequeno)

  // pagamento na reserva: "total" = 100%, "sinal" = 50%, "escolha" = cliente escolhe
  pagamento: { comum: "total", exec: "escolha", suv: "escolha", sete: "total", luxo: "sinal", van: "sinal" },
  pagamentoViagens: "sinal",
  sinalPct: 50,
  parcelasMax: 6,
};

export const CATEGORIAS = {
  comum: { pax: 4, malas: 3, malasMao: 0, nome: { pt: "Comum", en: "Standard", es: "Estándar" },
    desc: { pt: "Carro de passeio com ar-condicionado", en: "Air-conditioned car", es: "Auto con aire acondicionado" },
    ref: "Virtus, Yaris Sedan, Voyage" },
  exec: { pax: 4, malas: 3, malasMao: 1, nome: { pt: "Executivo", en: "Executive Sedan", es: "Ejecutivo Sedán" },
    desc: { pt: "Sedã médio, silencioso e confortável", en: "Quiet, comfortable mid-size sedan", es: "Sedán mediano, silencioso y cómodo" },
    ref: "Corolla, Jetta" },
  suv: { pax: 4, malas: 3, malasMao: 1, nome: { pt: "Executivo SUV", en: "Executive SUV", es: "SUV Ejecutivo" },
    desc: { pt: "SUV com mais espaço e posição alta", en: "More space, higher seating", es: "Más espacio y asiento alto" },
    ref: "Corolla Cross, HR-V, Haval H6, Tiggo 7" },
  sete: { pax: 6, malas: 3, malasMao: 0, nome: { pt: "7 Lugares", en: "7-Seater", es: "7 Plazas" },
    desc: { pt: "Até 6 passageiros + motorista", en: "Up to 6 passengers + driver", es: "Hasta 6 pasajeros + chofer" },
    ref: "Spin, Tiguan 7 lugares" },
  luxo: { pax: 4, malas: 4, malasMao: 0, nome: { pt: "Executivo Luxo", en: "Luxury", es: "Lujo" },
    desc: { pt: "SUV premium de alto padrão", en: "Premium full-size SUV", es: "SUV premium de alta gama" },
    ref: "SW4, Trailblazer, Commander" },
  van: { pax: 15, malas: 15, malasMao: 0, nome: { pt: "Van Executiva", en: "Executive Van", es: "Van Ejecutiva" },
    desc: { pt: "Grupos maiores, todos juntos", en: "Larger groups, all together", es: "Grupos grandes, todos juntos" },
    ref: "Sprinter, Master, Ducato" },
};

// hora extra (passeios com espera e diária)
export const HORA_EXTRA = { comum: 100, exec: 125, suv: 140, sete: 150, luxo: 750, van: null };
// motorista por hora (mínimo 8 h)
export const POR_HORA = { valor: { comum: 100, exec: 125, suv: 140, sete: 150, luxo: 750, van: null }, minimoHoras: 8, maximoHoras: 12 };

const P = (comum, exec, suv, sete, luxo, van = null) => ({ comum, exec, suv, sete, luxo, van });
const N = (pt, en, es) => ({ pt, en, es });

/* tipo: transfer (só ida) | passeio (ida e volta) | hora | diaria | viagem (outra cidade, só ida) */
export const SERVICOS = [
  // ---------- Aeroportos (só ida) ----------
  { id: "igu-foz", grupo: "aeroporto", tipo: "transfer", voo: true, sentido: true, foto: "transfer-aeroporto-suv-executivo-corolla-cross",
    nome: N("Aeroporto de Foz (IGU) ⇄ hotel em Foz", "Foz Airport (IGU) ⇄ hotel in Foz", "Aeropuerto de Foz (IGU) ⇄ hotel en Foz"),
    desc: N("Motorista com placa de identificação no desembarque. 1 hora de espera grátis após o pouso.", "Driver with a name sign at arrivals. 1 hour free waiting after landing.", "Chofer con cartel en arribos. 1 hora de espera gratis tras el aterrizaje."),
    precos: P(350, 1100, 1200, 400, 5000) },
  { id: "igu-pi", grupo: "aeroporto", tipo: "transfer", voo: true, sentido: true, fronteira: true, foto: "marco-das-tres-fronteiras",
    nome: N("Aeroporto de Foz (IGU) ⇄ hotel em Puerto Iguazú (AR)", "Foz Airport (IGU) ⇄ hotel in Puerto Iguazú (AR)", "Aeropuerto de Foz (IGU) ⇄ hotel en Puerto Iguazú (AR)"),
    desc: N("Direto ao seu hotel na Argentina, com travessia da fronteira.", "Straight to your hotel in Argentina, border crossing included.", "Directo a su hotel en Argentina, con cruce de frontera."),
    precos: P(500, 1150, 1300, 500, 5000) },
  { id: "igr-foz", grupo: "aeroporto", tipo: "transfer", voo: true, sentido: true, fronteira: true, foto: "cataratas-do-iguacu-arco-iris",
    nome: N("Aeroporto de Puerto Iguazú (IGR) ⇄ hotel em Foz", "Iguazú Airport (IGR) ⇄ hotel in Foz", "Aeropuerto de Iguazú (IGR) ⇄ hotel en Foz"),
    desc: N("Chegou pela Argentina? Levamos ao seu hotel no Brasil.", "Landing in Argentina? We take you to your hotel in Brazil.", "¿Llega por Argentina? Lo llevamos a su hotel en Brasil."),
    precos: P(500, 1150, 1300, 500, 5000) },
  { id: "igr-pi", grupo: "aeroporto", tipo: "transfer", voo: true, sentido: true, foto: "cataratas-do-iguacu-vista-do-rio",
    nome: N("Aeroporto de Puerto Iguazú (IGR) ⇄ hotel em Puerto Iguazú", "Iguazú Airport (IGR) ⇄ hotel in Puerto Iguazú", "Aeropuerto de Iguazú (IGR) ⇄ hotel en Puerto Iguazú"),
    desc: N("Transfer dentro de Puerto Iguazú, na Argentina.", "Transfer within Puerto Iguazú, Argentina.", "Traslado dentro de Puerto Iguazú, Argentina."),
    precos: P(500, 1200, 1300, 500, 5000) },
  { id: "igu-cde", grupo: "aeroporto", tipo: "transfer", voo: true, sentido: true, fronteira: true, foto: "foz-do-iguacu-cidade-rio-parana",
    nome: N("Aeroporto de Foz (IGU) ⇄ Ciudad del Este (PY)", "Foz Airport (IGU) ⇄ Ciudad del Este (PY)", "Aeropuerto de Foz (IGU) ⇄ Ciudad del Este (PY)"),
    desc: N("Travessia da Ponte da Amizade até o seu destino no Paraguai.", "Across the Friendship Bridge to your destination in Paraguay.", "Por el Puente de la Amistad hasta su destino en Paraguay."),
    precos: P(500, 1200, 1300, 500, 8000) },

  // ---------- Cataratas e passeios (ida e volta) ----------
  { id: "ar-iv", grupo: "passeios", tipo: "passeio", espera: 5, fronteira: true, foto: "cataratas-do-iguacu-vista-aerea",
    nome: N("Cataratas Argentinas — ida e volta", "Argentine Falls — round trip", "Cataratas Argentinas — ida y vuelta"),
    desc: N("O motorista espera até 5 horas durante a visita.", "Your driver waits up to 5 hours during the visit.", "El chofer espera hasta 5 horas durante la visita."),
    precos: P(1100, 1400, 1450, 1350, 7900) },
  { id: "ar-ida", grupo: "passeios", tipo: "transfer", fronteira: true, foto: "cataratas-do-iguacu-vista-do-rio",
    nome: N("Cataratas Argentinas — somente ida", "Argentine Falls — one way", "Cataratas Argentinas — solo ida"),
    desc: N("Do seu hotel em Foz até o parque ou um hotel em Puerto Iguazú.", "From your Foz hotel to the park or a Puerto Iguazú hotel.", "De su hotel en Foz al parque o a un hotel en Puerto Iguazú."),
    precos: P(425, 600, 700, 750, 3500) },
  { id: "br-iv", grupo: "passeios", tipo: "passeio", foto: "passarela-garganta-do-diabo",
    nome: N("Cataratas Brasileiras + Parque das Aves — leva e busca", "Brazilian Falls + Bird Park — drop-off and pick-up", "Cataratas Brasileñas + Parque de las Aves — lleva y busca"),
    desc: N("Levamos e buscamos no horário combinado.", "Drop-off and pick-up at the agreed time.", "Lo llevamos y buscamos a la hora acordada."),
    precos: P(350, 400, 450, 500, 7900) },
  { id: "br-espera", grupo: "passeios", tipo: "passeio", espera: 5, foto: "cataratas-do-iguacu-arco-iris",
    nome: N("Cataratas Brasileiras + Parque das Aves — motorista à disposição", "Brazilian Falls + Bird Park — driver at your disposal", "Cataratas Brasileñas + Parque de las Aves — chofer a disposición"),
    desc: N("Motorista à sua disposição por até 5 horas.", "Driver at your disposal for up to 5 hours.", "Chofer a su disposición hasta 5 horas."),
    precos: P(550, 750, 850, 900, 7900) },
  { id: "dois-lados", grupo: "passeios", tipo: "passeio", espera: 8, fronteira: true, foto: "cataratas-do-iguacu-vista-aerea",
    nome: N("Cataratas dos dois lados (Brasil e Argentina) no mesmo dia", "Both sides of the Falls (Brazil and Argentina) in one day", "Cataratas de los dos lados (Brasil y Argentina) en un día"),
    desc: N("Até 8 horas com o motorista à disposição.", "Up to 8 hours with the driver at your disposal.", "Hasta 8 horas con el chofer a disposición."),
    precos: P(1150, 1300, 1400, 1500, 7900) },
  { id: "itaipu", grupo: "passeios", tipo: "passeio", espera: 8, foto: "itaipu-binacional-vista-aerea",
    nome: N("Itaipu Binacional — ida e volta", "Itaipu Dam — round trip", "Itaipú Binacional — ida y vuelta"),
    desc: N("O motorista espera a sua visita, até 8 horas.", "Your driver waits during the visit, up to 8 hours.", "El chofer espera su visita, hasta 8 horas."),
    precos: P(1150, 1300, 1500, 1500, 7900) },
  { id: "marco", grupo: "passeios", tipo: "passeio", foto: "marco-das-tres-fronteiras",
    nome: N("Marco das Três Fronteiras — ida e volta", "Triple Frontier Landmark — round trip", "Hito de las Tres Fronteras — ida y vuelta"),
    desc: N("Ida e volta ao Marco das Três Fronteiras.", "Round trip to the Triple Frontier Landmark.", "Ida y vuelta al Hito de las Tres Fronteras."),
    precos: P(1200, 1300, 1500, 1500, 7900) },
  { id: "city-tour", grupo: "passeios", tipo: "passeio", espera: 8, foto: "templo-budista-foz-do-iguacu",
    nome: N("City tour em Foz do Iguaçu", "Foz do Iguaçu city tour", "City tour en Foz do Iguaçu"),
    desc: N("Templo Budista, Mesquita e outros pontos da cidade, até 8 horas.", "Buddhist Temple, Mosque and other city sights, up to 8 hours.", "Templo Budista, Mezquita y otros puntos, hasta 8 horas."),
    precos: P(1200, 1300, 1500, 1500, 7900) },
  { id: "tres-paises", grupo: "passeios", tipo: "passeio", espera: 8, fronteira: true, foto: "foz-do-iguacu-cidade-rio-parana",
    nome: N("3 países em 1 dia (Brasil, Paraguai e Argentina)", "3 countries in 1 day (Brazil, Paraguay and Argentina)", "3 países en 1 día (Brasil, Paraguay y Argentina)"),
    desc: N("Até 8 horas com o motorista à disposição.", "Up to 8 hours with the driver at your disposal.", "Hasta 8 horas con el chofer a disposición."),
    precos: P(2200, 2500, 2600, 2800, 9000) },
  { id: "cde", grupo: "passeios", tipo: "passeio", espera: 5, fronteira: true, foto: "foz-do-iguacu-cidade-rio-parana",
    nome: N("Compras em Ciudad del Este (PY) — ida e volta", "Shopping in Ciudad del Este (PY) — round trip", "Compras en Ciudad del Este (PY) — ida y vuelta"),
    desc: N("O motorista espera até 5 horas e ajuda com as sacolas.", "Your driver waits up to 5 hours and helps with your bags.", "El chofer espera hasta 5 horas y ayuda con las bolsas."),
    precos: P(1200, 1500, 1700, 1350, 12000) },
  { id: "jantar-pi", grupo: "passeios", tipo: "passeio", fronteira: true, foto: "motorista-executivo-suv-preto",
    nome: N("Jantar em Puerto Iguazú (AR) — ida e volta", "Dinner in Puerto Iguazú (AR) — round trip", "Cena en Puerto Iguazú (AR) — ida y vuelta"),
    desc: N("Levamos e buscamos no horário combinado.", "Drop-off and pick-up at the agreed time.", "Lo llevamos y buscamos a la hora acordada."),
    precos: P(1250, 1500, 1400, 1800, 9000) },
  { id: "noivas", grupo: "passeios", tipo: "passeio", espera: 5, foto: "motorista-executivo-suv-preto",
    nome: N("Transfer para noivas", "Bridal car", "Traslado para novias"),
    desc: N("Carro para a noiva, com motorista à disposição por até 5 horas.", "Bridal car with the driver at your disposal for up to 5 hours.", "Auto para la novia, con chofer a disposición hasta 5 horas."),
    precos: { exec: 1500, suv: 1600, luxo: 6500 } },

  // ---------- Motorista à disposição ----------
  { id: "por-hora", grupo: "motorista", tipo: "hora", fronteira: true, foto: "motorista-executivo-suv-preto",
    nome: N("Motorista por hora (mínimo 8 horas)", "Driver by the hour (8-hour minimum)", "Chofer por hora (mínimo 8 horas)"),
    desc: N("Motorista à sua disposição. Pode cruzar para Argentina e Paraguai.", "Driver at your disposal. Border crossings to Argentina and Paraguay allowed.", "Chofer a su disposición. Puede cruzar a Argentina y Paraguay."),
    precos: POR_HORA.valor },
  { id: "diaria", grupo: "motorista", tipo: "diaria", fronteira: true, foto: "suv-executivo-corolla-cross-preto",
    nome: N("Diária de motorista com carro (12 h, 200 km)", "Full day with driver (12 h, 200 km)", "Día completo con chofer (12 h, 200 km)"),
    desc: N("12 horas e 200 km por dia. Pode cruzar para Argentina e Paraguai.", "12 hours and 200 km per day. Border crossings allowed.", "12 horas y 200 km por día. Puede cruzar fronteras."),
    precos: P(1200, 1500, 1700, 1800, 9000, 5000) },
];

/* ---------- Viagens para outras cidades (só ida, pedágio incluso) ---------- */
const V = (id, pt, en, es, precos) => ({ id, grupo: "viagens", tipo: "viagem", foto: "suv-executivo-corolla-cross-preto",
  nome: N("Foz do Iguaçu → " + pt, "Foz do Iguaçu → " + en, "Foz do Iguaçu → " + es),
  desc: N("Viagem só de ida, com pedágio e despesas do motorista inclusos.", "One-way trip; tolls and driver expenses included.", "Viaje solo ida; peajes y gastos del chofer incluidos."),
  precos, ...(id === "posadas" || id === "assuncao" || id === "buenos-aires" || id === "salto-del-guaira" ? { fronteira: true } : {}) });

SERVICOS.push(
  V("medianeira", "Medianeira (PR)", "Medianeira (PR)", "Medianeira (PR)", P(650, 1200, 1500, 1600, null)),
  V("cascavel", "Cascavel (PR)", "Cascavel (PR)", "Cascavel (PR)", P(1000, 1200, 1300, 1600, null)),
  V("toledo", "Toledo (PR)", "Toledo (PR)", "Toledo (PR)", P(1000, 1200, 1300, 1500, null)),
  V("marechal-rondon", "Marechal Cândido Rondon (PR)", "Marechal Cândido Rondon (PR)", "Marechal Cândido Rondon (PR)", P(1100, 1200, 1300, 1500, null)),
  V("palotina", "Palotina (PR)", "Palotina (PR)", "Palotina (PR)", P(1400, 1500, 1600, 2000, null)),
  V("guaira", "Guaíra (PR)", "Guaíra (PR)", "Guaíra (PR)", P(2000, 2100, 2200, 2500, null)),
  V("umuarama", "Umuarama (PR)", "Umuarama (PR)", "Umuarama (PR)", P(1200, 1200, 1400, 2500, null)),
  V("campo-mourao", "Campo Mourão (PR)", "Campo Mourão (PR)", "Campo Mourão (PR)", P(1600, 1700, 1800, 2700, null)),
  V("francisco-beltrao", "Francisco Beltrão (PR)", "Francisco Beltrão (PR)", "Francisco Beltrão (PR)", P(1500, 1600, 1800, 2800, null)),
  V("pato-branco", "Pato Branco (PR)", "Pato Branco (PR)", "Pato Branco (PR)", P(1800, 2000, 2100, 2300, null)),
  V("maringa", "Maringá (PR)", "Maringá (PR)", "Maringá (PR)", P(2200, 2300, 2500, 2700, null)),
  V("londrina", "Londrina (PR)", "Londrina (PR)", "Londrina (PR)", P(3000, 3100, 3200, 3400, null)),
  V("curitiba", "Curitiba (PR)", "Curitiba (PR)", "Curitiba (PR)", P(4000, 4300, 4500, 4800, null)),
  V("chapeco", "Chapecó (SC)", "Chapecó (SC)", "Chapecó (SC)", P(3600, 3900, 4000, 4700, null)),
  V("sao-paulo", "São Paulo (SP)", "São Paulo (SP)", "São Paulo (SP)", P(4000, 4300, 4500, 5000, null)),
  V("posadas", "Posadas (Argentina)", "Posadas (Argentina)", "Posadas (Argentina)", P(2500, 3000, 3300, 3600, null)),
  V("assuncao", "Assunção (Paraguai)", "Asunción (Paraguay)", "Asunción (Paraguay)", P(5000, 6000, 6500, 7000, null)),
  V("buenos-aires", "Buenos Aires (Argentina)", "Buenos Aires (Argentina)", "Buenos Aires (Argentina)", P(6500, 7000, 7500, 9000, 12000)),
  V("salto-del-guaira", "Salto del Guairá (Paraguai)", "Salto del Guairá (Paraguay)", "Salto del Guairá (Paraguay)", P(2000, 2500, 2600, 3500, 5000)),
);

/* ---------- Viagem sob medida: preço por km (calculadora) ----------
   Aprovado pelo Willian: valor por km por categoria, com mínimo por viagem;
   km acima de 500 custam 20% a mais; máximo 1.000 km por trecho;
   ida e volta = 2 trechos (com até 5 h de espera no destino);
   destino na Argentina ou no Paraguai soma R$ 150 por trecho;
   sem cobrança de deslocamento (uma das pontas precisa estar na região de Foz). */
export const POR_KM = {
  valorKm: { comum: 7, exec: 8, suv: 8.5, sete: 9, luxo: 20, van: 12 },
  minimo: { comum: 350, exec: 1000, suv: 1000, sete: 1000, luxo: 4000, van: 1500 },
  acrescimoAcimaKm: 500, acrescimoPct: 20,
  maxKm: 1000, minKm: 5,
  idaVoltaEsperaHoras: 5,
  fronteiraPorTrecho: 150,
  paisesAceitos: ["BRA", "ARG", "PRY"],
  regiaoFoz: { lat: -25.5163, lon: -54.5854, raioKm: 60 },
};
SERVICOS.push({ id: "km", grupo: "viagens", tipo: "km", oculto: true, foto: "suv-executivo-corolla-cross-preto",
  nome: N("Viagem sob medida (preço por km)", "Custom trip (price per km)", "Viaje a medida (precio por km)"),
  desc: N("Digite a origem e o destino: calculamos a distância e o preço na hora.", "Enter pickup and destination: we calculate distance and price instantly.", "Ingrese origen y destino: calculamos la distancia y el precio al instante."),
  precos: { ...POR_KM.valorKm } });

/* Países envolvidos em cada serviço (filtro "Para onde você vai?" da página de reservas) */
const PAISES = {
  "igu-pi": ["br", "ar"], "igr-foz": ["ar", "br"], "igr-pi": ["ar"], "igu-cde": ["br", "py"],
  "ar-iv": ["ar"], "ar-ida": ["ar"], "dois-lados": ["br", "ar"], "tres-paises": ["br", "ar", "py"],
  "cde": ["py"], "jantar-pi": ["ar"], "por-hora": ["br", "ar", "py"], "diaria": ["br", "ar", "py"],
  "posadas": ["ar"], "buenos-aires": ["ar"], "assuncao": ["py"], "salto-del-guaira": ["py"], "km": ["br", "ar", "py"],
};
for (const s of SERVICOS) s.paises = PAISES[s.id] || ["br"];

/* Só pelo WhatsApp (sem preço no site) */
export const CONSULTA = [
  { id: "van", nome: N("Van executiva para grupos", "Executive van for groups", "Van ejecutiva para grupos") },
  { id: "helicoptero", nome: N("Helicóptero privativo", "Private helicopter", "Helicóptero privado") },
];

/* ---------- Datas especiais (+5%) ---------- */
function pascoa(ano) { // algoritmo de Meeus/Jones/Butcher
  const a = ano % 19, b = Math.floor(ano / 100), c = ano % 100, d = Math.floor(b / 4), e = b % 4,
    f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30,
    i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451),
    mes = Math.floor((h + l - 7 * m + 114) / 31), dia = ((h + l - 7 * m + 114) % 31) + 1;
  return Date.UTC(ano, mes - 1, dia);
}
const iso = (t) => new Date(t).toISOString().slice(0, 10);
const DIA = 864e5;
export function datasEspeciais(ano) {
  const fixas = ["01-01", "04-21", "05-01", "06-12", "09-07", "10-12", "11-02", "11-15", "11-20", "12-24", "12-25", "12-31"]
    .map((md) => ano + "-" + md);
  const p = pascoa(ano), moveis = [];
  for (let k = -50; k <= -47; k++) moveis.push(iso(p + k * DIA)); // Carnaval (sábado a terça)
  for (let k = -3; k <= 0; k++) moveis.push(iso(p + k * DIA));    // Semana Santa (quinta a domingo de Páscoa)
  return [...new Set([...fixas, ...moveis])].sort();
}
