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
  parcelasMax: 12,
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
// dia inteiro (diária): 10 horas e 200 km por dia; km excedente pelo valor por km da calculadora (POR_KM.valorKm); combustível, pedágio, estacionamento e alimentação do motorista inclusos (01/11/2026)
export const DIARIA = { horas: 10, km: 200 };
// pacote de 5 horas = 10× o valor da hora; depois disso, cada hora extra no valor da hora (aprovado em 01/11/2026)
export const POR_HORA = { valor: { comum: 100, exec: 125, suv: 140, sete: 150, luxo: 750, van: null }, pacoteHoras: 5, pacoteMult: 10, minimoHoras: 5, maximoHoras: 12 };

const P = (comum, exec, suv, sete, luxo, van = null) => ({ comum, exec, suv, sete, luxo, van });
const N = (pt, en, es) => ({ pt, en, es });

/* tipo: transfer (só ida) | passeio (ida e volta) | hora | diaria | viagem (outra cidade, só ida) */
export const SERVICOS = [
  // ---------- Aeroportos (só ida) ----------
  { id: "igu-foz", grupo: "aeroporto", tipo: "transfer", voo: true, sentido: true, foto: "transfer-aeroporto-suv-executivo-corolla-cross",
    nome: N("Aeroporto de Foz (IGU) ⇄ hotel em Foz", "Foz Airport (IGU) ⇄ hotel in Foz", "Aeropuerto de Foz (IGU) ⇄ hotel en Foz"),
    desc: N("Motorista com placa de identificação no desembarque. 1 hora de espera grátis após o pouso.", "Driver with a name sign at arrivals. 1 hour free waiting after landing.", "Chofer con cartel en arribos. 1 hora de espera gratis tras el aterrizaje."),
    precos: P(300, 1100, 1200, 400, 5000) },
  { id: "igu-pi", grupo: "aeroporto", tipo: "transfer", voo: true, sentido: true, fronteira: true, foto: "marco-das-tres-fronteiras",
    nome: N("Aeroporto de Foz (IGU) ⇄ hotel em Puerto Iguazú (AR)", "Foz Airport (IGU) ⇄ hotel in Puerto Iguazú (AR)", "Aeropuerto de Foz (IGU) ⇄ hotel en Puerto Iguazú (AR)"),
    desc: N("Direto ao seu hotel na Argentina, com travessia da fronteira.", "Straight to your hotel in Argentina, border crossing included.", "Directo a su hotel en Argentina, con cruce de frontera."),
    precos: P(400, 1150, 1300, 500, 5000) },
  { id: "igr-foz", grupo: "aeroporto", tipo: "transfer", voo: true, sentido: true, fronteira: true, foto: "cataratas-do-iguacu-arco-iris",
    nome: N("Aeroporto de Puerto Iguazú (IGR) ⇄ hotel em Foz", "Iguazú Airport (IGR) ⇄ hotel in Foz", "Aeropuerto de Iguazú (IGR) ⇄ hotel en Foz"),
    desc: N("Chegou pela Argentina? Levamos ao seu hotel no Brasil.", "Landing in Argentina? We take you to your hotel in Brazil.", "¿Llega por Argentina? Lo llevamos a su hotel en Brasil."),
    precos: P(400, 1150, 1300, 500, 5000) },
  { id: "igr-pi", grupo: "aeroporto", tipo: "transfer", voo: true, sentido: true, foto: "cataratas-do-iguacu-vista-do-rio",
    nome: N("Aeroporto de Puerto Iguazú (IGR) ⇄ hotel em Puerto Iguazú", "Iguazú Airport (IGR) ⇄ hotel in Puerto Iguazú", "Aeropuerto de Iguazú (IGR) ⇄ hotel en Puerto Iguazú"),
    desc: N("Transfer dentro de Puerto Iguazú, na Argentina.", "Transfer within Puerto Iguazú, Argentina.", "Traslado dentro de Puerto Iguazú, Argentina."),
    precos: P(500, 1200, 1300, 500, 5000) },
  { id: "igu-cde", grupo: "aeroporto", tipo: "transfer", voo: true, sentido: true, fronteira: true, foto: "foz-do-iguacu-cidade-rio-parana",
    nome: N("Aeroporto de Foz (IGU) ⇄ Ciudad del Este (PY)", "Foz Airport (IGU) ⇄ Ciudad del Este (PY)", "Aeropuerto de Foz (IGU) ⇄ Ciudad del Este (PY)"),
    desc: N("Travessia da Ponte da Amizade até o seu destino no Paraguai.", "Across the Friendship Bridge to your destination in Paraguay.", "Por el Puente de la Amistad hasta su destino en Paraguay."),
    precos: P(500, 1200, 1300, 500, 8000) },

  { id: "rod-foz", grupo: "aeroporto", tipo: "transfer", foto: "foz-do-iguacu-cidade-rio-parana",
    nome: N("Rodoviária de Foz ⇄ hotel em Foz", "Foz bus station ⇄ hotel in Foz", "Terminal de ómnibus de Foz ⇄ hotel en Foz"),
    desc: N("Busca na Rodoviária Internacional de Foz do Iguaçu, com o motorista esperando na chegada do ônibus.", "Pick-up at the Foz do Iguaçu International Bus Station, with the driver waiting when your bus arrives.", "Recogida en la Terminal Internacional de Foz do Iguaçu, con el chofer esperando la llegada del ómnibus."),
    precos: P(300, 1100, 1200, 400, 5000) },

  // ---------- Cataratas e passeios (ida e volta) ----------
  { id: "ar-iv", grupo: "passeios", tipo: "passeio", espera: 5, fronteira: true, foto: "cataratas-do-iguacu-vista-aerea",
    nome: N("Cataratas Argentinas — ida e volta", "Argentine Falls — round trip", "Cataratas Argentinas — ida y vuelta"),
    desc: N("O motorista espera até 5 horas durante a visita.", "Your driver waits up to 5 hours during the visit.", "El chofer espera hasta 5 horas durante la visita."),
    precos: P(1300, 1400, 1450, 1350, 7900) },
  { id: "ar-ida", grupo: "passeios", tipo: "transfer", fronteira: true, foto: "cataratas-do-iguacu-vista-do-rio",
    nome: N("Cataratas Argentinas — somente ida", "Argentine Falls — one way", "Cataratas Argentinas — solo ida"),
    desc: N("Do seu hotel em Foz até o parque ou um hotel em Puerto Iguazú.", "From your Foz hotel to the park or a Puerto Iguazú hotel.", "De su hotel en Foz al parque o a un hotel en Puerto Iguazú."),
    precos: P(425, 600, 700, 750, 3500) },
  { id: "foz-pi", grupo: "passeios", tipo: "transfer", fronteira: true, foto: "cataratas-do-iguacu-vista-aerea",
    nome: N("Hotel em Foz → hotel em Puerto Iguazú (AR) — só ida", "Foz hotel → Puerto Iguazú hotel (AR) — one way", "Hotel en Foz → hotel en Puerto Iguazú (AR) — solo ida"),
    desc: N("De um hotel ou endereço em Foz até o seu hotel em Puerto Iguazú, com o motorista cruzando a fronteira.", "From a hotel or address in Foz to your hotel in Puerto Iguazú, with the driver crossing the border.", "De un hotel o dirección en Foz a su hotel en Puerto Iguazú, con el chofer cruzando la frontera."),
    precos: P(500, 1150, 1300, 500, 5000) },
  { id: "foz-cde", grupo: "passeios", tipo: "transfer", fronteira: true, foto: "foz-do-iguacu-cidade-rio-parana",
    nome: N("Hotel em Foz → Ciudad del Este (PY) — só ida", "Foz hotel → Ciudad del Este (PY) — one way", "Hotel en Foz → Ciudad del Este (PY) — solo ida"),
    desc: N("De um hotel ou endereço em Foz até Ciudad del Este, pela Ponte da Amizade. Para ir e voltar com espera, veja Compras em Ciudad del Este.", "From a hotel or address in Foz to Ciudad del Este across the Friendship Bridge. For a round trip with waiting time, see Shopping in Ciudad del Este.", "De un hotel o dirección en Foz a Ciudad del Este por el Puente de la Amistad. Para ida y vuelta con espera, vea Compras en Ciudad del Este."),
    precos: P(500, 1200, 1300, 500, 8000) },
  { id: "pi-compras", grupo: "passeios", tipo: "passeio", espera: 5, fronteira: true, foto: "motorista-executivo-suv-preto",
    nome: N("Puerto Iguazú (AR): centro, compras e almoço — motorista à disposição", "Puerto Iguazú (AR): downtown, shopping and lunch — driver at your disposal", "Puerto Iguazú (AR): centro, compras y almuerzo — chofer a disposición"),
    desc: N("Saída do seu hotel em Foz, com o motorista à disposição por até 5 horas no centro de Puerto Iguazú, e volta ao hotel.", "From your Foz hotel, with the driver at your disposal for up to 5 hours in downtown Puerto Iguazú, and back to the hotel.", "Desde su hotel en Foz, con el chofer a disposición hasta 5 horas en el centro de Puerto Iguazú, y regreso al hotel."),
    precos: P(1400, 1550, 1800, 1900, 7500) },

  { id: "br-iv", grupo: "passeios", tipo: "passeio", foto: "passarela-garganta-do-diabo",
    nome: N("Cataratas Brasileiras + Parque das Aves — leva e busca", "Brazilian Falls + Bird Park — drop-off and pick-up", "Cataratas Brasileñas + Parque de las Aves — lleva y busca"),
    desc: N("Levamos e buscamos no horário combinado.", "Drop-off and pick-up at the agreed time.", "Lo llevamos y buscamos a la hora acordada."),
    precos: P(800, 1300, 1500, 1900, 7900) },
  { id: "br-espera", grupo: "passeios", tipo: "passeio", espera: 5, foto: "cataratas-do-iguacu-arco-iris",
    nome: N("Cataratas Brasileiras + Parque das Aves — motorista à disposição", "Brazilian Falls + Bird Park — driver at your disposal", "Cataratas Brasileñas + Parque de las Aves — chofer a disposición"),
    desc: N("Motorista à sua disposição por até 5 horas.", "Driver at your disposal for up to 5 hours.", "Chofer a su disposición hasta 5 horas."),
    precos: P(1300, 1400, 1600, 1900, 7900) },
  { id: "dois-lados", grupo: "passeios", tipo: "passeio", espera: 8, fronteira: true, foto: "cataratas-do-iguacu-vista-aerea",
    nome: N("Cataratas dos dois lados (Brasil e Argentina) no mesmo dia", "Both sides of the Falls (Brazil and Argentina) in one day", "Cataratas de los dos lados (Brasil y Argentina) en un día"),
    desc: N("Até 8 horas com o motorista à disposição.", "Up to 8 hours with the driver at your disposal.", "Hasta 8 horas con el chofer a disposición."),
    precos: P(1300, 1400, 1500, 1900, 7900) },
  { id: "itaipu", grupo: "passeios", tipo: "passeio", espera: 8, foto: "itaipu-binacional-vista-aerea",
    nome: N("Itaipu Binacional — ida e volta", "Itaipu Dam — round trip", "Itaipú Binacional — ida y vuelta"),
    desc: N("O motorista espera a sua visita, até 8 horas.", "Your driver waits during the visit, up to 8 hours.", "El chofer espera su visita, hasta 8 horas."),
    precos: P(1400, 1500, 1700, 1900, 7900) },
  { id: "marco", grupo: "passeios", tipo: "passeio", foto: "marco-das-tres-fronteiras",
    nome: N("Marco das Três Fronteiras — ida e volta", "Triple Frontier Landmark — round trip", "Hito de las Tres Fronteras — ida y vuelta"),
    desc: N("Ida e volta ao Marco das Três Fronteiras.", "Round trip to the Triple Frontier Landmark.", "Ida y vuelta al Hito de las Tres Fronteras."),
    precos: P(1500, 1600, 1700, 1700, 7900) },
  { id: "city-tour", grupo: "passeios", tipo: "passeio", espera: 8, foto: "templo-budista-foz-do-iguacu",
    nome: N("City tour em Foz do Iguaçu", "Foz do Iguaçu city tour", "City tour en Foz do Iguaçu"),
    desc: N("Templo Budista, Mesquita e outros pontos da cidade, até 8 horas.", "Buddhist Temple, Mosque and other city sights, up to 8 hours.", "Templo Budista, Mezquita y otros puntos, hasta 8 horas."),
    precos: P(1300, 1400, 1500, 1900, 7900) },
  { id: "tres-paises", grupo: "passeios", tipo: "passeio", espera: 8, fronteira: true, foto: "foz-do-iguacu-cidade-rio-parana",
    nome: N("3 países em 1 dia (Brasil, Paraguai e Argentina)", "3 countries in 1 day (Brazil, Paraguay and Argentina)", "3 países en 1 día (Brasil, Paraguay y Argentina)"),
    desc: N("Até 8 horas com o motorista à disposição.", "Up to 8 hours with the driver at your disposal.", "Hasta 8 horas con el chofer a disposición."),
    precos: P(2000, 2500, 2600, 2800, 9000) },
  { id: "cde", grupo: "passeios", tipo: "passeio", espera: 5, fronteira: true, foto: "foz-do-iguacu-cidade-rio-parana",
    nome: N("Compras em Ciudad del Este (PY) — ida e volta", "Shopping in Ciudad del Este (PY) — round trip", "Compras en Ciudad del Este (PY) — ida y vuelta"),
    desc: N("O motorista espera até 5 horas e ajuda com as sacolas.", "Your driver waits up to 5 hours and helps with your bags.", "El chofer espera hasta 5 horas y ayuda con las bolsas."),
    precos: P(1350, 1600, 2000, 2000, 12000) },
  { id: "jantar-pi", grupo: "passeios", tipo: "passeio", fronteira: true, foto: "motorista-executivo-suv-preto",
    nome: N("Jantar em Puerto Iguazú (AR) — ida e volta", "Dinner in Puerto Iguazú (AR) — round trip", "Cena en Puerto Iguazú (AR) — ida y vuelta"),
    desc: N("Levamos e buscamos no horário combinado.", "Drop-off and pick-up at the agreed time.", "Lo llevamos y buscamos a la hora acordada."),
    precos: P(1350, 1600, 1700, 1800, 9000) },
  { id: "noivas", grupo: "passeios", tipo: "passeio", espera: 5, foto: "motorista-executivo-suv-preto",
    nome: N("Transfer para noivas", "Bridal car", "Traslado para novias"),
    desc: N("Carro para a noiva, com motorista à disposição por até 5 horas.", "Bridal car with the driver at your disposal for up to 5 hours.", "Auto para la novia, con chofer a disposición hasta 5 horas."),
    precos: { exec: 1600, suv: 1800, luxo: 6500 } },

  // ---------- Motorista à disposição ----------
  { id: "por-hora", grupo: "motorista", tipo: "hora", fronteira: true, foto: "motorista-executivo-suv-preto",
    nome: N("Meio período com motorista (5 horas)", "Half day with driver (5 hours)", "Medio día con chofer (5 horas)"),
    desc: N("Motorista à sua disposição por até 5 horas; depois, cobrança por hora extra. Pode cruzar para Argentina e Paraguai.", "Driver at your disposal for up to 5 hours; extra hours charged after that. Border crossings to Argentina and Paraguay allowed.", "Chofer a su disposición hasta 5 horas; después, se cobra la hora extra. Puede cruzar a Argentina y Paraguay."),
    precos: POR_HORA.valor },
  { id: "diaria", grupo: "motorista", tipo: "diaria", fronteira: true, foto: "suv-executivo-corolla-cross-preto",
    nome: N("Dia inteiro com motorista (10 h, 200 km)", "Full day with driver (10 h, 200 km)", "Día completo con chofer (10 h, 200 km)"),
    desc: N("10 horas e 200 km por dia, com combustível, pedágio e estacionamento. Pode cruzar para Argentina e Paraguai.", "10 hours and 200 km per day, fuel, tolls and parking included. Border crossings allowed.", "10 horas y 200 km por día, con combustible, peajes y estacionamiento. Puede cruzar fronteras."),
    precos: P(1400, 1700, 1900, 2000, 9200, 5200) },
];

/* ---------- Viagens para outras cidades (só ida, pedágio incluso) ---------- */
const V = (id, pt, en, es, precos) => ({ id, grupo: "viagens", tipo: "viagem", foto: "suv-executivo-corolla-cross-preto",
  nome: N("Foz do Iguaçu → " + pt, "Foz do Iguaçu → " + en, "Foz do Iguaçu → " + es),
  desc: N("Viagem só de ida, com pedágio e despesas do motorista inclusos.", "One-way trip; tolls and driver expenses included.", "Viaje solo ida; peajes y gastos del chofer incluidos."),
  precos, ...(id === "posadas" || id === "assuncao" || id === "buenos-aires" || id === "salto-del-guaira" ? { fronteira: true } : {}) });

SERVICOS.push(
  V("medianeira", "Medianeira (PR)", "Medianeira (PR)", "Medianeira (PR)", P(1100, 1200, 1500, 1600, 12000)),
  V("cascavel", "Cascavel (PR)", "Cascavel (PR)", "Cascavel (PR)", P(1100, 1200, 1300, 1800, 12000)),
  V("toledo", "Toledo (PR)", "Toledo (PR)", "Toledo (PR)", P(1100, 1200, 1300, 1900, 12000)),
  V("marechal-rondon", "Marechal Cândido Rondon (PR)", "Marechal Cândido Rondon (PR)", "Marechal Cândido Rondon (PR)", P(1200, 1200, 1300, 2300, 12000)),
  V("palotina", "Palotina (PR)", "Palotina (PR)", "Palotina (PR)", P(1800, 1900, 2000, 2800, 12000)),
  V("guaira", "Guaíra (PR)", "Guaíra (PR)", "Guaíra (PR)", P(1800, 1900, 2000, 2800, 12000)),
  V("umuarama", "Umuarama (PR)", "Umuarama (PR)", "Umuarama (PR)", P(1200, 1250, 1400, 2500, 12000)),
  V("campo-mourao", "Campo Mourão (PR)", "Campo Mourão (PR)", "Campo Mourão (PR)", P(2200, 2350, 2500, 2700, 12000)),
  V("francisco-beltrao", "Francisco Beltrão (PR)", "Francisco Beltrão (PR)", "Francisco Beltrão (PR)", P(2000, 2100, 2300, 2500, 12000)),
  V("pato-branco", "Pato Branco (PR)", "Pato Branco (PR)", "Pato Branco (PR)", P(2500, 2700, 2800, 3500, 12000)),
  V("maringa", "Maringá (PR)", "Maringá (PR)", "Maringá (PR)", P(2700, 2800, 2900, 4000, 12000)),
  V("londrina", "Londrina (PR)", "Londrina (PR)", "Londrina (PR)", P(2900, 3100, 3200, 3400, 12000)),
  V("curitiba", "Curitiba (PR)", "Curitiba (PR)", "Curitiba (PR)", P(3500, 3600, 3800, 4900, 12000)),
  V("chapeco", "Chapecó (SC)", "Chapecó (SC)", "Chapecó (SC)", P(2800, 3000, 3200, 4700, 12000)),
  V("sao-paulo", "São Paulo (SP)", "São Paulo (SP)", "São Paulo (SP)", P(4700, 4800, 4900, 5000, 12000)),
  V("posadas", "Posadas (Argentina)", "Posadas (Argentina)", "Posadas (Argentina)", P(3000, 3500, 3900, 4500, 12000)),
  V("assuncao", "Assunção (Paraguai)", "Asunción (Paraguay)", "Asunción (Paraguay)", P(5700, 6000, 6500, 7000, 12000)),
  V("buenos-aires", "Buenos Aires (Argentina)", "Buenos Aires (Argentina)", "Buenos Aires (Argentina)", P(6500, 7000, 7500, 9000, 12000)),
  V("salto-del-guaira", "Salto del Guairá (Paraguai)", "Salto del Guairá (Paraguay)", "Salto del Guairá (Paraguay)", P(2100, 2300, 2600, 3500, 12000)),
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
  maxKm: 1000, minKm: 0, // trajeto curto paga o mínimo da categoria
  idaVoltaEsperaHoras: 5,
  fronteiraPorTrecho: 150,
  paisesAceitos: ["BRA", "ARG", "PRY"],
  regiaoFoz: { lat: -25.5163, lon: -54.5854, raioKm: 60 },
};
SERVICOS.push({ id: "km", grupo: "viagens", tipo: "km", oculto: true, foto: "suv-executivo-corolla-cross-preto",
  nome: N("Viagem sob medida", "Custom trip", "Viaje a medida"),
  desc: N("Digite a origem e o destino: o preço fechado aparece na hora.", "Enter pickup and destination: the fixed price shows up instantly.", "Ingrese origen y destino: el precio cerrado aparece al instante."),
  precos: { ...POR_KM.valorKm } });

/* Países envolvidos em cada serviço (filtro "Para onde você vai?" da página de reservas) */
const PAISES = {
  "igu-pi": ["br", "ar"], "igr-foz": ["ar", "br"], "igr-pi": ["ar"], "igu-cde": ["br", "py"],
  "ar-iv": ["ar"], "ar-ida": ["ar"], "dois-lados": ["br", "ar"], "tres-paises": ["br", "ar", "py"],
  "cde": ["py"], "jantar-pi": ["ar"], "foz-pi": ["br", "ar"], "foz-cde": ["br", "py"], "pi-compras": ["ar"], "por-hora": ["br", "ar", "py"], "diaria": ["br", "ar", "py"],
  "posadas": ["ar"], "buenos-aires": ["ar"], "assuncao": ["py"], "salto-del-guaira": ["py"], "km": ["br", "ar", "py"],
};
for (const s of SERVICOS) s.paises = PAISES[s.id] || ["br"];

/* Página de detalhes de cada serviço (só páginas canônicas e indexáveis; nunca criar página duplicada para o mesmo serviço) */
const PAGINAS = {"rod-foz": {"pt": "/pt/transfer-rodoviaria-foz-do-iguacu.html"}, "foz-cde": {"pt": "/passeios/passeio-compras-ciudad-del-este.html", "en": "/en/ciudad-del-este-shopping-tour.html"}, "foz-pi": {"pt": "/ar-pt/taxi-puerto-iguazu-argentina.html", "en": "/ar-en/taxi-puerto-iguazu-argentina.html", "es": "/ar-es/taxi-puerto-iguazu.html"}, "pi-compras": {"pt": "/ar-pt/taxi-puerto-iguazu-argentina.html", "en": "/ar-en/taxi-puerto-iguazu-argentina.html", "es": "/ar-es/taxi-puerto-iguazu.html"}, "igu-foz": {"pt": "/pt/transfer-aeroporto-foz-do-iguacu.html", "en": "/en/airport-transfer.html", "es": "/es/transfer-aeropuerto.html"}, "igu-pi": {"pt": "/ar-pt/transfer-aeroporto-foz-para-puerto-iguazu.html", "es": "/ar-es/transfer-puerto-iguazu-aeropuerto.html", "en": "/ar-en/airport-transfer-puerto-iguazu.html"}, "igr-foz": {"pt": "/argentina/transfer-aeroporto-puerto-iguazu-igr.html", "es": "/ar-es/taxi-aeropuerto-iguazu-aeropuerto-cataratas.html"}, "ar-iv": {"pt": "/ar-pt/transfer-cataratas-argentina-foz.html", "es": "/ar-es/taxi-cataratas-iguazu-argentina.html", "en": "/ar-en/iguazu-falls-transfer-argentina.html"}, "ar-ida": {"pt": "/ar-pt/transfer-cataratas-argentina-foz.html", "es": "/ar-es/taxi-cataratas-iguazu-argentina.html", "en": "/ar-en/iguazu-falls-transfer-argentina.html"}, "br-iv": {"pt": "/pt/transfer-cataratas-foz-do-iguacu.html", "en": "/en/iguazu-falls-transfer.html", "es": "/es/cataratas-iguazu-transfer.html"}, "br-espera": {"pt": "/pt/transfer-cataratas-foz-do-iguacu.html", "en": "/en/iguazu-falls-transfer.html", "es": "/es/cataratas-iguazu-transfer.html"}, "dois-lados": {"pt": "/ar-pt/tour-cataratas-dois-lados-brasileiro-argentino.html", "en": "/ar-en/private-tour-iguazu-falls-both-sides.html"}, "itaipu": {"pt": "/pt/transfer-itaipu-foz-do-iguacu.html", "en": "/en/itaipu-dam-tour-transfer.html"}, "marco": {"pt": "/passeios/passeio-marco-trifronteira.html", "en": "/en/triple-frontier-landmark-tour.html"}, "city-tour": {"pt": "/passeios/city-tour-foz-do-iguacu.html", "en": "/en/private-city-tour-foz-do-iguacu.html"}, "tres-paises": {"pt": "/passeios/passeio-3-paises-1-dia.html", "en": "/en/three-countries-one-day-tour.html"}, "cde": {"pt": "/passeios/passeio-compras-ciudad-del-este.html", "en": "/en/ciudad-del-este-shopping-tour.html"}, "noivas": {"pt": "/cms/motorista-casamento-foz-do-iguacu.html"}, "por-hora": {"pt": "/servicos/transfer-por-hora-foz-do-iguacu.html"}, "diaria": {"pt": "/servicos/transfer-diaria-motorista-foz.html"}, "posadas": {"pt": "/cms/transfer-foz-aeroporto-posadas.html"}, "assuncao": {"pt": "/argentina/transfer-foz-para-assuncao.html", "es": "/es/traslado-asuncion-foz-do-iguacu.html"}, "buenos-aires": {"pt": "/argentina/transfer-foz-para-buenos-aires.html"}, "medianeira": {"pt": "/cms/transfer-foz-medianeira.html"}, "cascavel": {"pt": "/cms/transfer-foz-cascavel.html"}, "toledo": {"pt": "/cms/transfer-foz-toledo.html"}, "marechal-rondon": {"pt": "/cms/transfer-foz-marechal-rondon.html"}, "palotina": {"pt": "/cms/transfer-foz-palotina.html"}, "guaira": {"pt": "/cms/transfer-foz-guaira.html"}, "umuarama": {"pt": "/cms/transfer-foz-umuarama.html"}, "campo-mourao": {"pt": "/cms/transfer-foz-campo-mourao.html"}, "francisco-beltrao": {"pt": "/cms/transfer-foz-francisco-beltrao.html"}, "pato-branco": {"pt": "/cms/transfer-foz-pato-branco.html"}, "maringa": {"pt": "/cms/transfer-foz-maringa.html"}, "londrina": {"pt": "/cms/transfer-foz-londrina.html"}, "curitiba": {"pt": "/cms/transfer-foz-curitiba.html"}, "sao-paulo": {"pt": "/cms/transfer-foz-sao-paulo.html"}, "chapeco": {"pt": "/cms/transfer-foz-chapeco-sc.html"}};
for (const s of SERVICOS) if (PAGINAS[s.id]) s.pagina = PAGINAS[s.id];

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
