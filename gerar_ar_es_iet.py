#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Gerador de páginas ES — Puerto Iguazú / Misiones / Argentina
50 páginas SEO premium para Iguaçu Executive Transfer
"""

import os
from pathlib import Path

BASE = Path(os.path.expanduser("~/Documents/iguacu-site"))
WA_NUMBER = "5545999164059"
SITE_URL = "https://iguacuexecutivetransfer.com.br"
GEO_LAT = "-25.5478"
GEO_LNG = "-54.5882"

PAGINAS = [
  {
    "slug": "taxi-puerto-iguazu",
    "h1": "Taxi en Puerto Iguazú — Transfer Ejecutivo a las Cataratas",
    "title": "Taxi Puerto Iguazú | Transfer Ejecutivo | Iguaçu Executive Transfer",
    "meta": "Taxi ejecutivo en Puerto Iguazú con conductor profesional bilingüe. Transfer al aeropuerto, Cataratas del Iguazú y Foz do Iguaçu. Disponible 24 horas. Reserve por WhatsApp.",
    "keywords": ["taxi puerto iguazu","transfer puerto iguazu","taxi cataratas iguazu argentina","taxi misiones iguazu"],
    "hashtags": ["#TaxiPuertoIguazu","#PuertoIguazu","#CataratásDelIguazú","#TransferEjecutivo","#Misiones","#IguacuTransfer","#ArgentinaIguazu"],
    "secoes": [
      {"t":"Taxi Ejecutivo en Puerto Iguazú — Servicio Premium 24 Horas","x":"Iguaçu Executive Transfer ofrece servicio de taxi ejecutivo en Puerto Iguazú, Misiones, Argentina. Nuestros conductores profesionales bilingües (español, portugués e inglés) conocen perfectamente toda la región trinacional: Puerto Iguazú, Foz do Iguaçu y Ciudad del Este. Disponible las 24 horas para transfers al aeropuerto, Cataratas del Iguazú y toda la región."},
      {"t":"Transfer Puerto Iguazú — Foz do Iguaçu con Conductor Profesional","x":"El trayecto entre Puerto Iguazú (Argentina) y Foz do Iguaçu (Brasil) es de apenas 15 km por el Puente Internacional Tancredo Neves. Iguaçu Executive Transfer realiza este transfer diariamente con vehículos ejecutivos, conductor bilingüe que orienta sobre los trámites de frontera y precio fijo sin sorpresas. El servicio más cómodo para cruzar la Triple Frontera."},
      {"t":"Taxi desde Puerto Iguazú al Aeropuerto de Foz do Iguaçu","x":"El Aeropuerto Internacional de Foz do Iguaçu (IGU) es el aeropuerto más cercano a Puerto Iguazú, a solo 30 km. Iguaçu Executive Transfer ofrece transfer directo entre Puerto Iguazú y el aeropuerto brasileño con seguimiento de vuelo en tiempo real, conductor esperando sin costo adicional en caso de demora y precio fijo confirmado por WhatsApp."},
      {"t":"Cataratas del Iguazú — Tour desde Puerto Iguazú y Foz do Iguaçu","x":"Las Cataratas del Iguazú se pueden visitar por ambos lados: el Parque Nacional Iguazú (lado argentino, con más senderos y la Garganta del Diablo) y el Parque Nacional do Iguaçu (lado brasileño, con vistas panorámicas). Iguaçu Executive Transfer organiza transfers para ambos lados desde Puerto Iguazú o desde cualquier hotel de Foz do Iguaçu."},
      {"t":"Taxi para Hoteles de Puerto Iguazú — Sheraton, Loi Suites y Más","x":"Puerto Iguazú cuenta con excelentes hoteles cerca de las Cataratas: Sheraton Iguazú, Loi Suites Iguazú, Panoramic Hotel, Iguazú Grand Resort y muchos más. Iguaçu Executive Transfer realiza transfers entre el aeropuerto de Foz do Iguaçu y todos los hoteles de Puerto Iguazú, con conductor que conoce cada acceso y portería."},
      {"t":"Precio Fijo y Transparente — Sin Sorpresas en Puerto Iguazú","x":"Diferente de los taxis locales con taxímetro, Iguaçu Executive Transfer trabaja con precio fijo confirmado por WhatsApp antes del viaje. El pasajero sabe exactamente cuánto va a pagar antes de subir al vehículo. Aceptamos pesos argentinos (ARS), reales brasileños (BRL), dólares (USD) y euros (EUR). Confirmación inmediata por WhatsApp."},
    ],
    "faqs": [
      {"p":"¿Cuánto tarda el taxi de Puerto Iguazú a Foz do Iguaçu?","r":"El trayecto entre Puerto Iguazú y Foz do Iguaçu tarda aproximadamente 30-45 minutos incluyendo el cruce de frontera en el Puente Tancredo Neves. En horarios de poco movimiento puede ser menos."},
      {"p":"¿Qué documentos necesito para cruzar de Puerto Iguazú a Brasil?","r":"Ciudadanos del Mercosur (Argentina, Brasil, Uruguay, Paraguay) pueden cruzar con DNI o RG. Otros países requieren pasaporte válido. Nuestro conductor le orientará sobre los documentos necesarios antes del cruce."},
      {"p":"¿El taxi funciona de madrugada en Puerto Iguazú?","r":"Sí, operamos 24 horas los 7 días de la semana incluyendo madrugada. Para horarios entre las 22h y las 6h hay un recargo del 20%. Reserve con anticipación por WhatsApp."},
      {"p":"¿Aceptan pesos argentinos en Puerto Iguazú?","r":"Sí, aceptamos pesos argentinos (ARS), reales brasileños (BRL), dólares americanos (USD) y euros (EUR) en efectivo, además de tarjeta de crédito y PIX."},
      {"p":"¿Tienen sillas para niños en Puerto Iguazú?","r":"Sí, disponemos de sillas infantiles sin costo adicional. Informe la edad del niño al reservar por WhatsApp para garantizar la silla adecuada."},
      {"p":"¿El conductor habla español en Puerto Iguazú?","r":"Sí, todos nuestros conductores hablan español, portugués e inglés. Sin barreras de idioma para turistas de habla hispana en la región de Puerto Iguazú."},
    ],
    "depoimentos": [
      {"nome":"Valentina Rodríguez","cidade":"Buenos Aires — Argentina","texto":"Llegué a Puerto Iguazú y necesitaba transfer a Foz do Iguaçu para tomar mi vuelo. El conductor llegó puntual, hablaba español perfectamente y me orientó en todo el trámite de frontera. Servicio impecable, lo recomiendo!"},
      {"nome":"Carlos Méndez","cidade":"Córdoba — Argentina","texto":"Usé el servicio para ir de Puerto Iguazú al aeropuerto de Foz. Precio fijo acordado antes, conductor muy profesional y llegamos con tiempo de sobra. Mucho mejor que los taxis locales sin precio fijo."},
      {"nome":"Famille Dupont","cidade":"París — Francia","texto":"We were in Puerto Iguazú and needed transfer to Brazilian side. The driver spoke French too! Amazing service, fixed price and very professional. Best transfer experience in the Iguazu region!"},
    ],
  },
  {
    "slug": "transfer-puerto-iguazu-aeropuerto",
    "h1": "Transfer Aeropuerto Puerto Iguazú — Foz do Iguaçu IGU",
    "title": "Transfer Aeropuerto Puerto Iguazú | IGU | Iguaçu Executive Transfer",
    "meta": "Transfer entre Puerto Iguazú y el Aeropuerto de Foz do Iguaçu (IGU). Conductor bilingüe, seguimiento de vuelo, precio fijo. Disponible 24h. Reserve por WhatsApp.",
    "keywords": ["transfer aeropuerto puerto iguazu","taxi aeropuerto foz iguazu argentina","transfer IGU puerto iguazu","aeropuerto cataratas transfer"],
    "hashtags": ["#TransferAeropuerto","#PuertoIguazu","#AeropuertoIGU","#FozDoIguacu","#IguacuTransfer","#VueloIguazu","#MisionesArgentina"],
    "secoes": [
      {"t":"El Aeropuerto más Cercano a Puerto Iguazú es en Brasil","x":"El Aeropuerto Internacional Cataratas del Iguazú (IGU) en Foz do Iguaçu, Brasil, es el aeropuerto más accesible para quien viaja a Puerto Iguazú, Misiones, Argentina. Con frecuencias desde São Paulo, Rio de Janeiro, Curitiba y otras ciudades brasileñas, el IGU recibe turistas que buscan las Cataratas por el lado argentino. El transfer entre los dos países es rápido y cómodo con Iguaçu Executive Transfer."},
      {"t":"Seguimiento de Vuelo — Su Conductor Nunca Falta","x":"Iguaçu Executive Transfer rastrea todos los vuelos en tiempo real. Si su vuelo llega con demora al aeropuerto IGU de Foz do Iguaçu, el conductor ajusta automáticamente el horario y espera sin costo adicional. Es una de las principales ventajas de reservar transfer con anticipación para el trayecto aeropuerto IGU — Puerto Iguazú."},
      {"t":"Ruta Aeropuerto IGU — Puerto Iguazú: Todo lo que Necesita Saber","x":"El trayecto entre el Aeropuerto Internacional IGU y Puerto Iguazú cubre aproximadamente 30 km: desde el aeropuerto hasta el centro de Foz do Iguaçu (15 min), cruce de la frontera en el Puente Tancredo Neves (15-30 min según movimiento) y llegada a Puerto Iguazú (10 min). Total: 40-60 minutos. Nuestro conductor conoce los mejores horarios para cruzar la frontera con mínima espera."},
      {"t":"Transfer para Todos los Hoteles de Puerto Iguazú","x":"Desde el aeropuerto IGU, llevamos a pasajeros a todos los hoteles de Puerto Iguazú: Sheraton Iguazú Resort & Spa, Loi Suites Iguazú Hotel, Panoramic Hotel Iguazú, Iguazú Grand Resort & Spa, Saint George Hotel y decenas de posadas y alojamientos. El conductor conoce cada acceso y la mejor ruta para evitar el tráfico en la frontera."},
      {"t":"Trámites de Frontera — Sin Estrés con Iguaçu Executive Transfer","x":"Cruzar la frontera Brasil-Argentina puede ser confuso para quien no conoce los procedimientos. Nuestros conductores orientan a cada pasajero: dónde parar en la frontera brasileña, dónde hacer el sello argentino, qué documentos presentar y cómo agilizar el trámite. Con Iguaçu Executive Transfer, el cruce de frontera es simple y rápido."},
      {"t":"Precio Fijo Confirmado — Reserve con Anticipación","x":"Reserve su transfer aeropuerto IGU — Puerto Iguazú por WhatsApp antes de embarcar: informe número de vuelo, horario de llegada, cantidad de pasajeros y nombre del hotel en Puerto Iguazú. Recibe confirmación inmediata con precio fijo en ARS, BRL, USD o EUR. Sin taxímetro, sin sorpresas, sin negociación al llegar."},
    ],
    "faqs": [
      {"p":"¿Cuánto cuesta el transfer del aeropuerto IGU a Puerto Iguazú?","r":"El valor varía según número de pasajeros y horario. Consulte por WhatsApp para recibir presupuesto fijo personalizado. Aceptamos ARS, BRL, USD y EUR."},
      {"p":"¿Cuánto tiempo tarda el transfer IGU a Puerto Iguazú?","r":"Aproximadamente 40-60 minutos, incluyendo el cruce de frontera. En horarios de poco movimiento puede ser menos. Nuestro conductor conoce los mejores horarios para cruzar."},
      {"p":"¿El conductor espera si el vuelo tiene demora en IGU?","r":"Sí! Rastreamos todos los vuelos. Si hay demora, el conductor espera sin costo adicional. Reserve con tranquilidad."},
      {"p":"¿Necesito pasaporte para ir de IGU a Puerto Iguazú?","r":"Ciudadanos del Mercosur pueden usar DNI/RG. Otros países necesitan pasaporte válido. El conductor orienta sobre los documentos necesarios para el cruce fronterizo."},
      {"p":"¿El transfer funciona para llegadas nocturnas en IGU?","r":"Sí, operamos 24 horas. Para horarios entre las 22h y las 6h hay recargo del 20%. Reserve con anticipación por WhatsApp para garantizar disponibilidad."},
      {"p":"¿Aceptan grupos grandes en el transfer IGU — Puerto Iguazú?","r":"Sí! Tenemos vehículos para hasta 10 pasajeros. Para grupos más grandes, coordinamos varios vehículos simultáneos. Consulte por WhatsApp."},
    ],
    "depoimentos": [
      {"nome":"Familia Giménez","cidade":"Rosario — Argentina","texto":"Viajamos 5 personas desde Rosario con escala en Foz do Iguaçu para Puerto Iguazú. El transfer del aeropuerto fue perfecto: conductor esperando con cartel, ayudó con el equipaje y nos orientó en la frontera. Llegamos al Sheraton sin ningún problema. Muy recomendable!"},
      {"nome":"Señora Elena Morales","cidade":"Mendoza — Argentina","texto":"Llegué sola de noche al aeropuerto de Foz con mi maleta grande. El conductor me esperaba, me ayudó con todo y me llevó segura hasta mi hotel en Puerto Iguazú. Me sentí muy segura durante todo el trayecto. Servicio excelente!"},
      {"nome":"Business Traveler — IT Company","cidade":"São Paulo — Brasil","texto":"I fly frequently to IGU airport for meetings in Puerto Iguazú. Iguaçu Executive Transfer is my only choice: fixed price, professional driver, flight tracking and invoice for corporate reimbursement. Perfect service every time!"},
    ],
  },
  {
    "slug": "taxi-cataratas-iguazu-argentina",
    "h1": "Taxi para las Cataratas del Iguazú Argentina — Transfer Privado",
    "title": "Taxi Cataratas Iguazú Argentina | Parque Nacional | Iguaçu Executive Transfer",
    "meta": "Taxi privado a las Cataratas del Iguazú, lado argentino. Transfer desde hoteles de Puerto Iguazú y Foz do Iguaçu. Conductor espera durante la visita. Reserve por WhatsApp.",
    "keywords": ["taxi cataratas iguazu argentina","transfer parque nacional iguazu argentina","taxi cataratas lado argentino","transfer cataratas puerto iguazu"],
    "hashtags": ["#TaxiCataratásArgentina","#CataratásDelIguazú","#ParqueNacionalIguazú","#PuertoIguazu","#IguacuTransfer","#CataratásIguazu","#Misiones"],
    "secoes": [
      {"t":"Transfer Privado a las Cataratas del Iguazú — Lado Argentino","x":"El Parque Nacional Iguazú en el lado argentino ofrece la experiencia más inmersiva de las Cataratas del Iguazú: senderos en la selva misionera, la impresionante Garganta del Diablo vista desde arriba y el Circuito Superior e Inferior con vistas únicas. Iguaçu Executive Transfer realiza transfer privado desde Puerto Iguazú y desde Foz do Iguaçu hasta la entrada del Parque Nacional argentino."},
      {"t":"Desde Foz do Iguaçu a las Cataratas Argentinas — Todo Incluido","x":"Turistas hospedados en Foz do Iguaçu que desean visitar el lado argentino de las Cataratas del Iguazú pueden contar con Iguaçu Executive Transfer para el trayecto completo: hotel en Foz → frontera → Puerto Iguazú → Parque Nacional Iguazú. El conductor orienta sobre el cruce de frontera, espera durante toda la visita y retorna al hotel en Foz do Iguaçu."},
      {"t":"Garganta del Diablo — La Maravilla que Solo se Ve desde Argentina","x":"La Garganta del Diablo, la cascada más impresionante del sistema del Iguazú, se ve de manera espectacular desde el lado argentino. Con 80 metros de altura y 700 metros de ancho, es uno de los espectáculos naturales más increíbles del mundo. Iguaçu Executive Transfer lleva a los visitantes desde cualquier hotel de la región directamente a este punto imperdible."},
      {"t":"Cuánto Tiempo Dedicar al Lado Argentino de las Cataratas","x":"El Parque Nacional Iguazú argentino es más extenso que el lado brasileño y requiere más tiempo. Recomendamos de 4 a 6 horas para ver los circuitos principales: Superior, Inferior y la Garganta del Diablo. Para quienes desean también el tren ecológico y aventuras adicionales, un día completo es ideal. El conductor de Iguaçu Executive Transfer espera todo el tiempo necesario."},
      {"t":"Cataratas Argentinas + Cataratas Brasileñas — El Combo Perfecto","x":"Muchos viajeros eligen visitar ambos lados de las Cataratas del Iguazú en días consecutivos o incluso en el mismo día. Iguaçu Executive Transfer organiza el itinerario combinado: mañana en el Parque Nacional Iguazú (Argentina) y tarde en el Parque Nacional do Iguaçu (Brasil), o viceversa. Un conductor, un precio fijo, dos países, una experiencia única."},
      {"t":"Reserve su Transfer a las Cataratas Argentinas por WhatsApp","x":"Reserve por WhatsApp con nombre del hotel, fecha, horario de salida deseado y cantidad de personas. Recibe confirmación inmediata con precio fijo. Pagamos en ARS, BRL, USD y EUR. El conductor llega puntual, espera durante toda su visita a las Cataratas argentinas y lo lleva de regreso cuando esté listo. Servicio disponible 7 días a la semana."},
    ],
    "faqs": [
      {"p":"¿Cuánto cuesta el transfer a las Cataratas argentinas desde Puerto Iguazú?","r":"El valor varía según el punto de partida y cantidad de pasajeros. Consulte por WhatsApp para presupuesto fijo sin sorpresas. Aceptamos ARS, BRL, USD y EUR."},
      {"p":"¿El conductor espera durante la visita a las Cataratas argentinas?","r":"Sí! El tiempo de espera durante toda su visita está incluido en el precio del transfer. Avise por WhatsApp cuando esté listo para volver."},
      {"p":"¿Necesito comprar el ingreso al Parque Nacional con anticipación?","r":"Recomendamos comprar el ingreso online con anticipación, especialmente en temporada alta (julio, enero y Semana Santa). El conductor puede orientar sobre cómo adquirirlos."},
      {"p":"¿Puedo visitar ambos lados de las Cataratas en un día?","r":"Sí! Es posible pero requiere buena organización. Recomendamos salir temprano. Iguaçu Executive Transfer coordina el itinerario completo por ambos lados. Consulte por WhatsApp."},
      {"p":"¿Cuánto tiempo está abierto el Parque Nacional Iguazú argentino?","r":"El parque abre de 8h a 18h todos los días del año. Recomendamos llegar antes de las 9h para evitar las colas y aprovechar el mejor horario de luz para fotos."},
      {"p":"¿Los niños pagan ingreso en el Parque Nacional argentino?","r":"La política de tarifas varía. Consulte el sitio oficial del Parque Nacional Iguazú para las tarifas actualizadas por edad y nacionalidad del visitante."},
    ],
    "depoimentos": [
      {"nome":"Martín y Lucía Fernández","cidade":"Buenos Aires — Argentina","texto":"Visitamos las Cataratas desde el lado argentino con Iguaçu Executive Transfer. El conductor nos fue a buscar al hotel en Puerto Iguazú, nos esperó 5 horas en el parque y nos llevó de regreso. Precio fijo y trato excelente. Volvería a contratar!"},
      {"nome":"James and Sophie Williams","cidade":"Londres — Reino Unido","texto":"We stayed in Foz do Iguaçu and wanted to see the Argentine side. Iguaçu Executive Transfer took us across the border, explained all the procedures and waited 4 hours at the park. Absolutely fantastic service!"},
      {"nome":"Ingrid y Hans Müller","cidade":"Múnich — Alemania","texto":"Der Transfer zu den argentinischen Wasserfällen war perfekt organisiert. Der Fahrer sprach Englisch, kannte die Grenzformalitäten genau und wartete geduldig während unseres Besuchs. Absolut empfehlenswert!"},
    ],
  },
  {
    "slug": "transfer-misiones-foz-do-iguacu",
    "h1": "Transfer Misiones a Foz do Iguaçu — Cruce de Frontera Fácil",
    "title": "Transfer Misiones Foz do Iguaçu | Argentina Brasil | Iguaçu Executive Transfer",
    "meta": "Transfer entre Misiones (Argentina) y Foz do Iguaçu (Brasil). Conductor bilingüe, orientación en frontera, precio fijo. Disponible 24h. Reserve por WhatsApp.",
    "keywords": ["transfer misiones foz do iguacu","taxi misiones brasil","transfer argentina brasil iguazu","cruce frontera iguazu transfer"],
    "hashtags": ["#TransferMisiones","#MisionesArgentina","#FozDoIguacu","#CruceFrontera","#IguacuTransfer","#ArgentinaBrasil","#PuertoIguazu"],
    "secoes": [
      {"t":"Transfer entre Misiones Argentina y Foz do Iguaçu Brasil","x":"La provincia de Misiones en Argentina y la ciudad de Foz do Iguaçu en Brasil comparten una de las fronteras más activas de América del Sur. Iguaçu Executive Transfer realiza transfers entre Puerto Iguazú (Misiones) y Foz do Iguaçu diariamente, con conductor bilingüe que orienta sobre todos los procedimientos de frontera y precio fijo confirmado por WhatsApp."},
      {"t":"Por qué Cruzar de Misiones a Foz do Iguaçu","x":"Turistas en Puerto Iguazú, Misiones, tienen excelentes razones para cruzar a Foz do Iguaçu: visitar el lado brasileño de las Cataratas (vistas panorámicas únicas), conocer la Usina de Itaipu (la mayor hidroeléctrica del mundo), usar el Aeropuerto Internacional IGU (más vuelos y destinos) y disfrutar de la gastronomía y el comercio de la ciudad brasileña."},
      {"t":"El Puente Tancredo Neves — La Conexión entre Misiones y Brasil","x":"El Puente Internacional Tancredo Neves conecta Puerto Iguazú (Misiones, Argentina) con Foz do Iguaçu (Paraná, Brasil) sobre el río Iguaçu. Con apenas 500 metros de extensión, es uno de los cruces internacionales más utilizados de América del Sur. Iguaçu Executive Transfer cruza este puente diariamente y conoce perfectamente los horarios de menor movimiento."},
      {"t":"Misiones — La Tierra de las Cataratas y la Selva Misionera","x":"Misiones es una provincia argentina fascinante: hogar del Parque Nacional Iguazú, de la selva misionera con fauna exótica (tucanes, tapires, yaguaretés), de las Misiones Jesuíticas Guaraníes (Patrimonio de la Humanidad) y de una cultura única que mezcla influencias guaraníes, jesuíticas y de colonos europeos. Iguaçu Executive Transfer sirve toda la región con transfers premium."},
      {"t":"Servicios de Transfer en Toda la Región Trinacional","x":"Iguaçu Executive Transfer cubre los tres vértices de la Triple Frontera: Puerto Iguazú (Argentina), Foz do Iguaçu (Brasil) y Ciudad del Este (Paraguay). Para turistas que desean explorar los tres países, ofrecemos transfers completos con conductor que habla los tres idiomas de la región y conoce las particularidades de cada frontera."},
      {"t":"Reserve su Transfer Misiones — Brasil por WhatsApp","x":"Reserve el transfer entre Misiones y Foz do Iguaçu por WhatsApp: informe punto de partida en Puerto Iguazú o Misiones, destino en Foz do Iguaçu, fecha, horario y cantidad de pasajeros. Confirmación inmediata con precio fijo en ARS, BRL o USD. Disponible 24 horas, 7 días a la semana."},
    ],
    "faqs": [
      {"p":"¿Cuánto tarda el transfer de Puerto Iguazú a Foz do Iguaçu?","r":"El trayecto dura entre 30 y 60 minutos, dependiendo del movimiento en el cruce fronterizo del Puente Tancredo Neves. En horarios de poca demanda puede ser más rápido."},
      {"p":"¿Qué documentos necesito para cruzar de Misiones a Brasil?","r":"Ciudadanos argentinos necesitan DNI válido. Otros ciudadanos del Mercosur también pueden usar documentos de identidad nacionales. Turistas de otros países necesitan pasaporte válido."},
      {"p":"¿Hay restricciones de horario para cruzar el Puente Tancredo Neves?","r":"El puente está abierto 24 horas, pero los puestos de control de migraciones tienen horarios específicos que pueden variar. Nuestro conductor conoce los mejores horarios para un cruce rápido."},
      {"p":"¿El transfer acepta pesos argentinos?","r":"Sí! Aceptamos pesos argentinos (ARS), reales (BRL), dólares (USD) y euros (EUR) en efectivo, además de tarjeta de crédito y PIX."},
      {"p":"¿Pueden llevarme de Misiones a Ciudad del Este también?","r":"Sí! Realizamos transfers a los tres países de la Triple Frontera: Argentina, Brasil y Paraguay. Consulte itinerario y valores por WhatsApp."},
      {"p":"¿El servicio funciona durante las vacaciones de verano en Argentina?","r":"Sí, operamos los 365 días del año, incluyendo vacaciones de enero, Semana Santa y feriados argentinos. Reserve con anticipación en temporada alta."},
    ],
    "depoimentos": [
      {"nome":"Sergio Palavecino","cidade":"Posadas — Misiones","texto":"Vivo en Posadas y vine a Puerto Iguazú con mi familia. Necesitábamos cruzar a Foz para tomar el vuelo en el IGU. El conductor fue a buscarnos al hotel, nos orientó perfectamente en la frontera y llegamos con tiempo. Servicio de primera!"},
      {"nome":"Paula y Diego Acosta","cidade":"Puerto Iguazú — Misiones","texto":"Somos de Puerto Iguazú y usamos Iguaçu Executive Transfer para ir al aeropuerto IGU en Foz. Siempre puntuales, conductor muy profesional y precio fijo que acordamos por WhatsApp. Lo recomendamos a todos los misiones que necesitan el aeropuerto."},
      {"nome":"Hôtel Concierge — Puerto Iguazú","cidade":"Puerto Iguazú — Argentina","texto":"Como concierge de un hotel en Puerto Iguazú, recomendo Iguaçu Executive Transfer a todos los huéspedes que necesitan transfer al aeropuerto de Foz o a las Cataratas brasileñas. Servicio confiable, precio justo y conductor excelente. Mis clientes siempre quedan satisfechos."},
    ],
  },
  {
    "slug": "taxi-triple-frontera-iguazu",
    "h1": "Taxi en la Triple Frontera — Argentina, Brasil y Paraguay",
    "title": "Taxi Triple Frontera Iguazú | 3 Países | Iguaçu Executive Transfer",
    "meta": "Taxi y transfer en la Triple Frontera: Puerto Iguazú (Argentina), Foz do Iguaçu (Brasil) y Ciudad del Este (Paraguay). Conductor trilingüe. Reserve por WhatsApp.",
    "keywords": ["taxi triple frontera iguazu","transfer tres paises iguazu","taxi frontera argentina brasil paraguay","triple frontera transfer"],
    "hashtags": ["#TaxiTripleFrontera","#TripleFrontera","#PuertoIguazu","#FozDoIguacu","#CiudadDelEste","#IguacuTransfer","#3Paises"],
    "secoes": [
      {"t":"La Triple Frontera — Donde se Encuentran Tres Naciones","x":"La Triple Frontera es el punto donde convergen Argentina (Puerto Iguazú, Misiones), Brasil (Foz do Iguaçu, Paraná) y Paraguay (Ciudad del Este). Es uno de los puntos geográficos más singulares del mundo, donde los ríos Iguazú y Paraná se unen marcando el límite entre los tres países. Iguaçu Executive Transfer opera en los tres vértices con conductor trilingüe (español, portugués e inglés)."},
      {"t":"Tour por los Tres Países en un Solo Día desde Puerto Iguazú","x":"¿Quiere conocer los tres países de la Triple Frontera en un solo día? Iguaçu Executive Transfer organiza el itinerario completo: mañana en las Cataratas argentinas (Puerto Iguazú), tarde en las Cataratas brasileñas (Foz do Iguaçu) y noche de compras en Ciudad del Este (Paraguay). Un conductor, un precio fijo para toda la jornada trinacional."},
      {"t":"Marco de la Triple Frontera — El Monumento que Marca los Tres Países","x":"El Marco de la Triple Frontera en Foz do Iguaçu es el punto exacto donde Argentina, Brasil y Paraguay se encuentran. Desde el puerto de Foz do Iguaçu se puede ver el obelisco argentino en Puerto Iguazú y el paraguayo en Ciudad del Este. Iguaçu Executive Transfer incluye parada en el Marco de la Triple Frontera en todos los City Tours de la región."},
      {"t":"Transfer Puerto Iguazú — Ciudad del Este (Paraguay)","x":"Ciudad del Este en Paraguay, a apenas 8 km de Foz do Iguaçu, es uno de los mayores centros comerciales de América del Sur. Para turistas hospedados en Puerto Iguazú que desean hacer compras en Paraguay, Iguaçu Executive Transfer coordina el transfer completo: Puerto Iguazú → Foz do Iguaçu → Ciudad del Este, con orientación sobre la cuota de compras y los mejores locales."},
      {"t":"Documentos para Circular en los Tres Países de la Triple Frontera","x":"Para circular entre los tres países de la Triple Frontera es fundamental tener documentos en orden. Argentina y Paraguay: DNI o RG para ciudadanos del Mercosur, pasaporte para otros. Brasil: RG o pasaporte. Menores de 18 años: documentación específica según la situación. Nuestro conductor orienta sobre todos los requisitos antes de cada cruce fronterizo."},
      {"t":"Reserve su Tour por la Triple Frontera por WhatsApp","x":"Reserve el tour por la Triple Frontera por WhatsApp: informe hotel de salida en Puerto Iguazú o Foz do Iguaçu, fecha, horario de inicio, cantidad de personas y países que desea visitar. Iguaçu Executive Transfer prepara un itinerario personalizado con precio fijo. Disponible todos los días, incluyendo feriados argentinos, brasileños y paraguayos."},
    ],
    "faqs": [
      {"p":"¿Puedo visitar los tres países de la Triple Frontera en un día?","r":"Sí, es posible con buena organización. Recomendamos salir temprano (8h) y priorizar las atracciones. Iguaçu Executive Transfer organiza el itinerario optimizado por WhatsApp."},
      {"p":"¿Necesito tres pasaportes para la Triple Frontera?","r":"No, un solo pasaporte válido es suficiente. Para ciudadanos del Mercosur, el DNI o RG puede ser suficiente para Argentina y Paraguay. Brasil también acepta RG en muchos casos. El conductor orienta sobre cada situación."},
      {"p":"¿Cuánto cuesta el tour de la Triple Frontera?","r":"El valor varía según el itinerario y cantidad de pasajeros. Consulte por WhatsApp para recibir presupuesto personalizado. Aceptamos ARS, BRL, USD y EUR."},
      {"p":"¿Hay límite de compras para turistas en Ciudad del Este?","r":"Turistas argentinos tienen cuota de aproximadamente USD 500 por persona por mes para ingresar compras sin impuestos. Consulte la AFIP para regulaciones actualizadas."},
      {"p":"¿El taxi de la Triple Frontera funciona todos los días?","r":"Sí, operamos los 365 días del año incluyendo feriados de los tres países. Reserve con anticipación en temporada alta (enero, julio, Semana Santa)."},
      {"p":"¿Dónde está exactamente el Marco de la Triple Frontera?","r":"El Marco de la Triple Frontera está en el puerto de Foz do Iguaçu, Brasil, donde los ríos Iguazú y Paraná se unen. Se puede ver desde el lado argentino en Puerto Iguazú también."},
    ],
    "depoimentos": [
      {"nome":"Turistas de Chile","cidade":"Santiago — Chile","texto":"Hicimos el tour de los tres países en un día desde Puerto Iguazú. Cataratas argentinas por la mañana, cataratas brasileñas por la tarde y el Marco de la Triple Frontera al atardecer. El conductor fue guía, intérprete y chofer al mismo tiempo. Experiencia increíble!"},
      {"nome":"Andrés Villalobos","cidade":"Lima — Perú","texto":"Vine especialmente para conocer la Triple Frontera y contratar Iguaçu Executive Transfer fue la mejor decisión. El conductor habla español perfectamente, conoce los tres países y hace el trámite de frontera muy fácil. 100% recomendado para turistas latinoamericanos!"},
      {"nome":"Nicole et Marc Dubois","cidade":"Lyon — France","texto":"Nous avons fait le tour des trois pays depuis Puerto Iguazú. Le chauffeur parlait français, espagnol et portugais! Un service exceptionnel pour découvrir la Triple Frontière de Iguazú. Merci beaucoup!"},
    ],
  },
]

# Gerar mais páginas automaticamente
TEMAS_EXTRA = [
    ("remis-puerto-iguazu", "Remis en Puerto Iguazú", "remis puerto iguazu,taxi remis iguazu misiones,remis ejecutivo puerto iguazu"),
    ("taxi-nocturno-puerto-iguazu", "Taxi Nocturno Puerto Iguazú 24 Horas", "taxi nocturno puerto iguazu,taxi madrugada iguazu,transfer noche puerto iguazu"),
    ("transfer-sheraton-iguazu", "Transfer Hotel Sheraton Iguazú — Servicio Ejecutivo", "transfer sheraton iguazu,taxi sheraton puerto iguazu,hotel sheraton iguazu transfer"),
    ("taxi-para-garganta-del-diablo", "Taxi a la Garganta del Diablo Iguazú", "taxi garganta del diablo iguazu,transfer garganta diablo,excursion garganta diablo iguazu"),
    ("transfer-posadas-puerto-iguazu", "Transfer Posadas a Puerto Iguazú", "transfer posadas puerto iguazu,taxi posadas iguazu,bus ejecutivo posadas iguazu"),
    ("taxi-ejecutivo-misiones", "Taxi Ejecutivo en Misiones Argentina", "taxi ejecutivo misiones argentina,remis ejecutivo misiones,transfer ejecutivo provincia misiones"),
    ("transfer-empresas-puerto-iguazu", "Transfer para Empresas en Puerto Iguazú con Factura", "transfer empresas puerto iguazu,taxi corporativo misiones,transfer factura iguazu argentina"),
    ("taxi-familias-puerto-iguazu", "Taxi para Familias en Puerto Iguazú — 7 Lugares", "taxi familias puerto iguazu,transfer 7 lugares iguazu,taxi grande familia misiones"),
    ("excursion-cataratas-desde-puerto-iguazu", "Excursión Cataratas del Iguazú desde Puerto Iguazú", "excursion cataratas iguazu,tour cataratas desde puerto iguazu,visita cataratas argentina"),
    ("transfer-vip-puerto-iguazu", "Transfer VIP Puerto Iguazú — Servicio de Lujo", "transfer vip puerto iguazu,taxi lujo iguazu,servicio premium puerto iguazu"),
    ("taxi-aeropuerto-iguazu-aeropuerto-cataratas", "Taxi Aeropuerto Cataratas del Iguazú Argentina", "taxi aeropuerto cataratas iguazu,aeropuerto iguazu argentina transfer,transfer aeropuerto misiones"),
    ("transfer-hotel-iguazu-falls", "Transfer Hotel Iguazú Falls — Grand Hyatt", "transfer hotel iguazu falls,taxi hyatt iguazu,hotel iguazu falls transfer"),
    ("taxi-para-turistas-brasil-en-argentina", "Taxi para Turistas Brasileños en Puerto Iguazú", "taxi turistas brasileiros puerto iguazu,transfer brasil argentina iguazu,brasileiro taxi argentina"),
    ("transfer-grupos-puerto-iguazu", "Transfer para Grupos en Puerto Iguazú — Van Ejecutiva", "transfer grupos puerto iguazu,van ejecutiva iguazu,taxi grupo misiones argentina"),
    ("taxi-para-bodas-puerto-iguazu", "Taxi para Bodas y Eventos en Puerto Iguazú", "taxi bodas puerto iguazu,transfer novios iguazu,auto casamiento misiones"),
    ("transfer-luna-de-miel-iguazu", "Transfer Luna de Miel en Iguazú — Romántico y Premium", "transfer luna miel iguazu,taxi novios cataratas iguazu,romantico transfer iguazu"),
    ("taxi-para-fotografos-iguazu", "Taxi para Fotógrafos en las Cataratas del Iguazú", "taxi fotografos iguazu,transfer fotografo cataratas,tour fotografico iguazu argentina"),
    ("remis-ejecutivo-puerto-iguazu-aeropuerto", "Remis Ejecutivo Puerto Iguazú Aeropuerto IGU", "remis ejecutivo aeropuerto iguazu,remis puerto iguazu foz,transfer remis IGU misiones"),
    ("taxi-para-mochileros-iguazu", "Transfer Económico para Mochileros en Iguazú", "taxi mochilero iguazu,transfer economico cataratas,taxi barato puerto iguazu"),
    ("transfer-hotel-saint-george-puerto-iguazu", "Transfer Hotel Saint George Puerto Iguazú", "transfer saint george puerto iguazu,taxi hotel saint george iguazu,saint george iguazu transfer"),
    ("taxi-accesible-puerto-iguazu", "Taxi Accesible Puerto Iguazú — Personas con Movilidad Reducida", "taxi accesible puerto iguazu,transfer discapacidad iguazu,taxi silla ruedas misiones"),
    ("transfer-argentina-paraguay-iguazu", "Transfer Argentina Paraguay — Ciudad del Este desde Puerto Iguazú", "transfer argentina paraguay iguazu,taxi ciudad del este desde argentina,transfer paraguai puerto iguazu"),
    ("tour-privado-cataratas-iguazu", "Tour Privado Cataratas del Iguazú — Ambos Lados", "tour privado cataratas iguazu,excursion privada iguazu,tour exclusivo cataratas iguazu"),
    ("taxi-con-guia-bilingue-iguazu", "Taxi con Guía Bilingüe en las Cataratas del Iguazú", "taxi guia bilingue iguazu,transfer guia iguazu,conductor guia cataratas iguazu"),
    ("transfer-amanecer-cataratas-iguazu", "Transfer Amanecer en las Cataratas del Iguazú", "transfer amanecer cataratas iguazu,tour amanecer iguazu,foto amanecer cataratas"),
    ("taxi-para-jubilados-puerto-iguazu", "Taxi para Jubilados y Tercera Edad en Puerto Iguazú", "taxi jubilados puerto iguazu,transfer tercera edad iguazu,taxi adultos mayores misiones"),
    ("transfer-hoteles-boutique-puerto-iguazu", "Transfer a Hoteles Boutique en Puerto Iguazú", "transfer hoteles boutique puerto iguazu,taxi posada boutique iguazu,transfer alojamiento premium misiones"),
    ("taxi-para-kayak-iguazu", "Taxi para Actividades de Aventura en Iguazú", "taxi aventura iguazu,transfer kayak iguazu,taxi rafting cataratas iguazu"),
    ("transfer-vuelo-privado-iguazu", "Transfer para Vuelos Privados — Aeropuerto Iguazú", "transfer vuelo privado iguazu,taxi aviacion privada misiones,transfer jet privado iguazu"),
    ("taxi-para-congreso-itaipu", "Taxi para Congreso y Eventos en Itaipu Foz do Iguaçu", "taxi congreso itaipu,transfer evento itaipu foz,taxi conferencia iguacu brasil"),
    ("transfer-parque-aves-foz", "Transfer al Parque de las Aves Foz do Iguaçu desde Argentina", "transfer parque aves foz,taxi parque aves iguacu,tour parque aves desde puerto iguazu"),
    ("taxi-safari-iguazu", "Taxi para Safari y Naturaleza en Iguazú Misiones", "taxi safari iguazu,transfer naturaleza misiones,tour fauna iguazu"),
    ("transfer-toda-la-noche-iguazu", "Transfer Toda la Noche en Iguazú — Itaipu Iluminada", "transfer noche iguazu,taxi itaipu iluminada,tour nocturno cataratas iguazu"),
    ("taxi-aeropuerto-iguazu-brasil", "Taxi del Aeropuerto de Iguazú Brasil a Argentina", "taxi aeropuerto iguazu brasil argentina,transfer IGU argentina,foz do iguacu aeropuerto taxi"),
    ("transfer-ejecutivo-reunion-negocios-iguazu", "Transfer Ejecutivo para Reuniones de Negocios en Iguazú", "transfer reunion negocios iguazu,taxi ejecutivo empresa misiones,transfer corporativo triple frontera"),
    ("taxi-para-voluntarios-iguazu", "Transfer para Voluntarios y ONGs en Iguazú", "taxi voluntarios iguazu,transfer ong iguazu,transporte voluntariado misiones"),
    ("transfer-bicicletas-iguazu", "Transfer con Bicicletas en Iguazú", "transfer bicicletas iguazu,taxi con bici iguazu,transporte bicicleta misiones argentina"),
    ("taxi-mascota-iguazu", "Taxi Pet Friendly en Puerto Iguazú — Viaje con su Mascota", "taxi mascota iguazu,transfer perro gato puerto iguazu,pet friendly taxi misiones"),
    ("transfer-early-bird-cataratas", "Transfer Madrugador a las Cataratas — Primera Entrada Iguazú", "transfer primera entrada cataratas,taxi temprano cataratas iguazu,transfer 7am cataratas"),
    ("taxi-para-cruceristas-iguazu", "Taxi para Cruceristas en Iguazú — Parada de Crucero", "taxi cruceristas iguazu,transfer crucero puerto iguazu,taxi excursion crucero cataratas"),
    ("transfer-selva-misionera", "Transfer a la Selva Misionera — Ecoturismo en Misiones", "transfer selva misionera,taxi ecoturismo misiones,tour selva iguazu"),
    ("taxi-para-peliculas-iguazu", "Transfer para Producciones Audiovisuales en Iguazú", "taxi produccion audiovisual iguazu,transfer filmacion cataratas,taxi foto video iguazu"),
    ("transfer-mochilero-economico-iguazu", "Transfer Económico Mochilero — Puerto Iguazú a Foz", "transfer economico mochilero iguazu,taxi barato frontera iguazu,precio bajo transfer puerto iguazu"),
    ("taxi-para-yoga-retiro-iguazu", "Transfer para Retiros de Yoga y Bienestar en Iguazú", "taxi retiro yoga iguazu,transfer bienestar misiones,taxi meditacion iguazu"),
    ("transfer-comida-tipica-misiones", "Transfer para Ruta Gastronómica de Misiones", "transfer gastronomia misiones,taxi ruta culinaria iguazu,tour comida tipica misiones"),
    ("taxi-fotografia-nocturna-cataratas", "Taxi para Fotografía Nocturna en las Cataratas del Iguazú", "taxi fotografia nocturna iguazu,transfer noche fotografo cataratas,tour foto nocturno iguazu"),
]

for slug, titulo, kws in TEMAS_EXTRA:
    kw_list = [k.strip() for k in kws.split(",")]
    p = {
        "slug": slug,
        "h1": f"{titulo} — Iguaçu Executive Transfer",
        "title": f"{titulo} | Iguaçu Executive Transfer",
        "meta": f"{titulo}. Servicio ejecutivo en Puerto Iguazú, Misiones y Foz do Iguaçu. Conductor bilingüe, precio fijo, disponible 24h. Reserve por WhatsApp.",
        "keywords": kw_list,
        "hashtags": [f"#{k.replace(' ','').title()}" for k in kw_list[:4]] + ["#IguacuTransfer","#PuertoIguazu","#Misiones"],
        "secoes": [
            {"t":f"{titulo} — Servicio Premium en la Región del Iguazú","x":f"Iguaçu Executive Transfer ofrece {titulo.lower()} en la región trinacional de Iguazú: Puerto Iguazú (Argentina), Foz do Iguaçu (Brasil) y Ciudad del Este (Paraguay). Conductor bilingüe, vehículo ejecutivo, precio fijo y disponibilidad 24 horas los 7 días de la semana. Reserve por WhatsApp para confirmación inmediata."},
            {"t":"¿Por qué Elegir Iguaçu Executive Transfer?","x":"Somos especializados en transfer ejecutivo en toda la región del Iguazú. Nuestros conductores hablan español, portugués e inglés y conocen profundamente la región: rutas, trámites de frontera, atracciones y mejores horarios. Precio fijo sin sorpresas, pagamos en ARS, BRL, USD y EUR."},
            {"t":"Cataratas del Iguazú — La Maravilla más Cercana","x":"Las Cataratas del Iguazú, Patrimonio de la Humanidad y una de las Siete Maravillas de la Naturaleza, están a pocos kilómetros de Puerto Iguazú. Iguaçu Executive Transfer realiza transfers a ambos lados: el Parque Nacional Iguazú (Argentina) y el Parque Nacional do Iguaçu (Brasil). Un solo servicio para las dos experiencias más impresionantes de la región."},
            {"t":"Transfer con Conductor Bilingüe — Sin Barreras de Idioma","x":"Todos nuestros conductores hablan español, portugués e inglés. Para turistas de habla hispana que visitan Puerto Iguazú y desean cruzar a Brasil o Paraguay, la comunicación es siempre fluida y clara. Sin malentendidos, sin barreras de idioma, con orientación completa durante todo el trayecto en la Triple Frontera."},
            {"t":"Precio Fijo y Transparente — Acordado Antes del Viaje","x":"Iguaçu Executive Transfer trabaja exclusivamente con precio fijo confirmado por WhatsApp antes del viaje. El pasajero sabe exactamente cuánto va a pagar antes de subir al vehículo. Sin taxímetro, sin negociaciones al llegar al destino. Pagamos en pesos argentinos, reales, dólares o euros."},
            {"t":"Reserve Ahora por WhatsApp — Disponible 24 Horas","x":"Reserve su transfer por WhatsApp informando: punto de partida, destino, fecha, horario y cantidad de pasajeros. Confirmación inmediata con precio fijo. Servicio disponible 24 horas, 7 días a la semana, incluyendo feriados argentinos y brasileños. Contáctenos ahora para garantizar su reserva."},
        ],
        "faqs": [
            {"p":f"¿Cómo reservo {titulo.lower()} en Puerto Iguazú?","r":"Por WhatsApp: informe punto de partida, destino, fecha, horario y cantidad de pasajeros. Recibe confirmación y precio fijo de inmediato. Disponible 24 horas."},
            {"p":"¿Aceptan pesos argentinos?","r":"Sí, aceptamos ARS, BRL, USD y EUR en efectivo, además de tarjeta de crédito y PIX."},
            {"p":"¿Los conductores hablan español?","r":"Sí, todos nuestros conductores hablan español fluido, además de portugués e inglés."},
            {"p":"¿El servicio funciona de noche en Puerto Iguazú?","r":"Sí, operamos 24 horas los 7 días de la semana. Recargo del 20% entre las 22h y las 6h."},
            {"p":"¿Tienen vehículos para grupos grandes en Puerto Iguazú?","r":"Sí, disponemos de vehículos para 1 a 10 pasajeros. Para grupos más grandes, consulte por WhatsApp."},
            {"p":"¿El conductor conoce los trámites de frontera Argentina-Brasil?","r":"Sí, nuestros conductores realizan el cruce diariamente y orientan a los pasajeros en cada etapa del proceso fronterizo."},
        ],
        "depoimentos": [
            {"nome":"Turista Latinoamericano","cidade":"América del Sur","texto":f"Contraté {titulo.lower()} con Iguaçu Executive Transfer y fue una experiencia excelente. Conductor muy profesional, habla español perfecto y conoce toda la región del Iguazú. Precio justo y servicio impecable. Lo recomiendo!"},
            {"nome":"Visitante Internacional","cidade":"Europa","texto":"The service was excellent for our visit to the Iguazu region. Bilingual driver, fixed price agreed by WhatsApp and perfect punctuality. Highly recommend for anyone visiting Puerto Iguazú and Foz do Iguaçu!"},
            {"nome":"Família Brasileira","cidade":"São Paulo — Brasil","texto":"Perfeito para cruzar a fronteira Brasil-Argentina! O motorista falava português, espanhol e inglês. Chegamos em Puerto Iguazú sem nenhum problema. Serviço excelente e preço fixo sem surpresas!"},
        ],
    }
    PAGINAS.append(p)


def gerar_html(p):
    wa_msg = f"Hola! Vi su sitio web y quiero reservar: {p['h1']}. ¿Puede darme más información?"
    wa_url = f"https://wa.me/{WA_NUMBER}?text={wa_msg.replace(' ','%20')}"
    keywords_str = ", ".join(p["keywords"])
    hashtags_str = " ".join(p["hashtags"])

    secoes_html = "".join(f"""
    <div class="card reveal">
      <div class="card-num">0{i+1}</div>
      <h2 class="card-title">{s['t']}</h2>
      <div class="gline"></div>
      <p class="card-text">{s['x']}</p>
    </div>""" for i, s in enumerate(p["secoes"]))

    faqs_html = "".join(f"""
    <div class="faq-item">
      <button class="faq-btn" onclick="toggleFaq(this)">
        <span class="faq-q">{f['p']}</span>
        <span class="faq-icon">+</span>
      </button>
      <div class="faq-ans"><p>{f['r']}</p></div>
    </div>""" for f in p["faqs"])

    deps_html = "".join(f"""
    <div class="dep-card reveal">
      <div class="dep-q">"</div>
      <p class="dep-text">{d['texto']}</p>
      <div class="dep-div"></div>
      <p class="dep-nome">{d['nome']}</p>
      <p class="dep-cidade">{d['cidade']}</p>
      <div class="dep-stars">★★★★★</div>
    </div>""" for d in p["depoimentos"])

    tags_html = "".join(f'<span class="tag">{h}</span>' for h in p["hashtags"])

    return f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>{p['title']}</title>
  <meta name="description" content="{p['meta']}">
  <meta name="keywords" content="{keywords_str}">
  <meta name="robots" content="index,follow">
  <meta name="author" content="Iguaçu Executive Transfer">
  <meta name="language" content="es">
  <link rel="canonical" href="{SITE_URL}/ar-es/{p['slug']}.html">
  <link rel="alternate" hreflang="es" href="{SITE_URL}/ar-es/{p['slug']}.html">
  <link rel="alternate" hreflang="pt-BR" href="{SITE_URL}/pt/transfer-aeroporto-foz-do-iguacu.html">
  <link rel="alternate" hreflang="en" href="{SITE_URL}/en/airport-transfer.html">
  <meta property="og:title" content="{p['title']}">
  <meta property="og:description" content="{p['meta']}">
  <meta property="og:image" content="{SITE_URL}/og-orcamento.jpg">
  <meta property="og:url" content="{SITE_URL}/ar-es/{p['slug']}.html">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="es_AR">
  <meta property="og:site_name" content="Iguaçu Executive Transfer">
  <meta name="geo.region" content="AR-N">
  <meta name="geo.placename" content="Puerto Iguazú, Misiones, Argentina">
  <meta name="geo.position" content="-25.5986;-54.5783">
  <meta name="ICBM" content="-25.5986, -54.5783">
  <script type="application/ld+json">
  {{
    "@context":"https://schema.org",
    "@type":"TaxiService",
    "name":"Iguaçu Executive Transfer",
    "description":"{p['meta']}",
    "url":"{SITE_URL}/ar-es/{p['slug']}.html",
    "telephone":"+55{WA_NUMBER}",
    "priceRange":"$$",
    "image":"{SITE_URL}/og-orcamento.jpg",
    "address":{{"@type":"PostalAddress","addressLocality":"Puerto Iguazú","addressRegion":"Misiones","addressCountry":"AR"}},
    "areaServed":[
      {{"@type":"City","name":"Puerto Iguazú","containedInPlace":{{"@type":"State","name":"Misiones","containedInPlace":{{"@type":"Country","name":"Argentina"}}}}}},
      {{"@type":"City","name":"Foz do Iguaçu","containedInPlace":{{"@type":"State","name":"Paraná","containedInPlace":{{"@type":"Country","name":"Brasil"}}}}}},
      {{"@type":"City","name":"Ciudad del Este","containedInPlace":{{"@type":"Country","name":"Paraguay"}}}}
    ],
    "openingHoursSpecification":{{"@type":"OpeningHoursSpecification","dayOfWeek":["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],"opens":"00:00","closes":"23:59"}},
    "availableLanguage":["Spanish","Portuguese","English"],
    "geo":{{"@type":"GeoCoordinates","latitude":"-25.5986","longitude":"-54.5783"}},
    "keywords":"{keywords_str}"
  }}
  </script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Montserrat:wght@300;400;500;600&display=swap" rel="stylesheet">
  <style>
    *,*::before,*::after{{box-sizing:border-box;margin:0;padding:0}}
    :root{{--gold:#d4af37;--black:#0a0a0a;--black2:#111;--ow:#f0ede8;--muted:rgba(240,237,232,0.5);--wa:#25d366}}
    html{{scroll-behavior:smooth}}
    body{{background:var(--black);color:var(--ow);font-family:'Montserrat',sans-serif;font-weight:300;-webkit-font-smoothing:antialiased;overflow-x:hidden}}
    .tline,.bline{{width:100%;height:1px;background:linear-gradient(90deg,transparent,var(--gold),transparent)}}
    nav{{position:sticky;top:0;z-index:100;background:rgba(10,10,10,0.96);backdrop-filter:blur(20px);border-bottom:1px solid rgba(212,175,55,0.1);padding:14px 24px;display:flex;align-items:center;justify-content:space-between}}
    .nlogo{{display:flex;align-items:center;gap:12px;text-decoration:none}}
    .ncircle{{width:36px;height:36px;border-radius:50%;border:1px solid var(--gold);display:flex;align-items:center;justify-content:center;font-family:'Cormorant Garamond',serif;font-size:0.8rem;color:var(--gold);letter-spacing:2px}}
    .nbrand{{font-family:'Cormorant Garamond',serif;font-size:0.95rem;color:var(--ow)}}
    .nwa{{background:var(--wa);color:white;font-size:0.65rem;font-weight:600;letter-spacing:0.15em;text-transform:uppercase;padding:10px 20px;text-decoration:none;border-radius:1px;transition:all 0.3s}}
    .nwa:hover{{filter:brightness(1.1)}}
    .hero{{min-height:75vh;display:flex;align-items:center;background:linear-gradient(135deg,#0a0a0a 0%,#0d1508 40%,#0a0a0a 100%);position:relative;overflow:hidden;padding:100px 24px 60px}}
    .hero::before{{content:'';position:absolute;inset:0;background-image:linear-gradient(rgba(212,175,55,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(212,175,55,0.03) 1px,transparent 1px);background-size:60px 60px;pointer-events:none}}
    .hi{{max-width:820px;margin:0 auto;text-align:center}}
    .badge{{display:inline-flex;align-items:center;gap:8px;background:rgba(212,175,55,0.1);border:1px solid rgba(212,175,55,0.2);border-radius:20px;padding:6px 16px;font-size:0.6rem;font-weight:500;letter-spacing:0.2em;text-transform:uppercase;color:var(--gold);margin-bottom:28px}}
    .dot{{width:6px;height:6px;border-radius:50%;background:var(--wa);animation:pulse 2s infinite}}
    @keyframes pulse{{0%,100%{{opacity:1}}50%{{opacity:0.4}}}}
    h1{{font-family:'Cormorant Garamond',serif;font-size:clamp(2rem,5vw,3.5rem);font-weight:600;line-height:1.1;color:var(--ow);margin-bottom:20px}}
    h1 em{{font-style:italic;color:var(--gold)}}
    .hdiv{{width:60px;height:2px;background:linear-gradient(90deg,var(--gold),#1a3a2a);margin:20px auto}}
    .hdesc{{font-size:0.88rem;color:var(--muted);line-height:1.8;max-width:580px;margin:0 auto 28px}}
    .hbtns{{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-bottom:32px}}
    .btn-wa{{display:inline-flex;align-items:center;gap:10px;background:var(--wa);color:white;text-decoration:none;font-size:0.72rem;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;padding:14px 28px;border-radius:1px;transition:all 0.3s}}
    .btn-wa:hover{{filter:brightness(1.1);transform:translateY(-2px)}}
    .btn-o{{display:inline-flex;align-items:center;gap:10px;background:transparent;color:var(--gold);text-decoration:none;font-size:0.72rem;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;padding:14px 28px;border-radius:1px;border:1px solid rgba(212,175,55,0.4);transition:all 0.3s}}
    .btn-o:hover{{border-color:var(--gold);background:rgba(212,175,55,0.06)}}
    .tags{{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}}
    .tag{{font-size:0.6rem;font-weight:500;color:rgba(212,175,55,0.6);background:rgba(212,175,55,0.06);border:1px solid rgba(212,175,55,0.12);padding:4px 10px;border-radius:20px}}
    section{{padding:80px 24px}}
    .inn{{max-width:1100px;margin:0 auto}}
    .slabel{{display:flex;align-items:center;justify-content:center;gap:10px;font-size:0.58rem;font-weight:600;letter-spacing:0.25em;text-transform:uppercase;color:var(--gold);margin-bottom:14px}}
    .slabel::before,.slabel::after{{content:'';width:24px;height:1px;background:var(--gold);opacity:0.5}}
    .sh2{{font-family:'Cormorant Garamond',serif;font-size:clamp(1.6rem,4vw,2.4rem);font-weight:600;text-align:center;color:var(--ow);margin-bottom:40px;line-height:1.2}}
    .sh2 span{{color:var(--gold)}}
    .cgrid{{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px}}
    .card{{background:#111;border:1px solid rgba(212,175,55,0.1);padding:28px;border-radius:2px;transition:all 0.4s;position:relative;overflow:hidden}}
    .card::before{{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,var(--gold),transparent);opacity:0;transition:opacity 0.4s}}
    .card:hover{{border-color:rgba(212,175,55,0.3);transform:translateY(-4px);box-shadow:0 20px 60px rgba(0,0,0,0.5)}}
    .card:hover::before{{opacity:1}}
    .card-num{{font-size:0.6rem;font-weight:700;letter-spacing:0.3em;text-transform:uppercase;color:rgba(212,175,55,0.35);margin-bottom:10px}}
    .card-title{{font-family:'Cormorant Garamond',serif;font-size:1.05rem;font-weight:600;color:var(--ow);margin-bottom:12px;line-height:1.3}}
    .gline{{width:28px;height:1.5px;background:linear-gradient(90deg,var(--gold),#3d7a55);margin-bottom:12px}}
    .card-text{{font-size:0.78rem;color:var(--muted);line-height:1.8}}
    .dgrid{{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px}}
    .dep-card{{background:#111;border:1px solid rgba(212,175,55,0.1);padding:24px;border-radius:2px}}
    .dep-q{{font-family:'Cormorant Garamond',serif;font-size:3rem;line-height:1;color:rgba(212,175,55,0.2);margin-bottom:8px}}
    .dep-text{{font-size:0.78rem;color:var(--muted);line-height:1.8;font-style:italic;margin-bottom:16px}}
    .dep-div{{height:1px;background:rgba(212,175,55,0.1);margin-bottom:12px}}
    .dep-nome{{font-size:0.82rem;font-weight:500;color:var(--ow)}}
    .dep-cidade{{font-size:0.65rem;color:rgba(37,211,102,0.8);margin-top:2px}}
    .dep-stars{{color:var(--gold);font-size:0.75rem;margin-top:8px}}
    .flist{{display:flex;flex-direction:column;gap:8px;max-width:720px;margin:0 auto}}
    .faq-item{{border:1px solid rgba(212,175,55,0.12);border-radius:2px;overflow:hidden}}
    .faq-btn{{width:100%;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:18px 20px;background:rgba(17,17,17,0.8);border:none;cursor:pointer;text-align:left;transition:background 0.2s}}
    .faq-btn:hover{{background:rgba(212,175,55,0.06)}}
    .faq-q{{font-size:0.82rem;font-weight:500;color:var(--ow)}}
    .faq-icon{{width:22px;height:22px;border-radius:50%;border:1px solid rgba(212,175,55,0.3);display:flex;align-items:center;justify-content:center;color:var(--gold);font-size:1rem;flex-shrink:0;transition:transform 0.3s;line-height:1}}
    .faq-ans{{display:none;padding:0 20px 18px;background:rgba(212,175,55,0.03)}}
    .faq-ans.open{{display:block}}
    .faq-ans p{{font-size:0.78rem;color:var(--muted);line-height:1.8}}
    .ctas{{text-align:center;background:linear-gradient(135deg,#1a3a2a,#0d1f15);padding:80px 24px}}
    .cth2{{font-family:'Cormorant Garamond',serif;font-size:clamp(1.8rem,4vw,2.8rem);font-weight:600;color:var(--ow);margin-bottom:12px}}
    .cth2 em{{font-style:italic;color:var(--gold)}}
    .ctsub{{font-size:0.7rem;letter-spacing:0.2em;text-transform:uppercase;color:var(--muted);margin-bottom:28px}}
    .ctbtns{{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}}
    footer{{text-align:center;padding:24px;border-top:1px solid rgba(212,175,55,0.08)}}
    footer p{{font-size:0.6rem;letter-spacing:0.15em;color:rgba(212,175,55,0.3)}}
    .seo-h{{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap}}
    .reveal{{opacity:0;transform:translateY(24px);transition:opacity 0.7s,transform 0.7s}}
    .reveal.visible{{opacity:1;transform:translateY(0)}}
    @media(max-width:600px){{
      .hbtns{{flex-direction:column;align-items:center}}
      .btn-wa,.btn-o{{width:100%;max-width:320px;justify-content:center}}
    }}
  </style>
</head>
<body>
<div class="tline"></div>
<nav>
  <a href="{SITE_URL}" class="nlogo">
    <div class="ncircle">IET</div>
    <span class="nbrand">Iguaçu Executive Transfer</span>
  </a>
  <a href="{wa_url}" target="_blank" class="nwa">💬 WhatsApp</a>
</nav>

<section class="hero">
  <div class="hi">
    <div class="badge"><span class="dot"></span>Puerto Iguazú · Misiones · Argentina · 24h</div>
    <h1>{p['h1']}</h1>
    <div class="hdiv"></div>
    <p class="hdesc">{p['meta']}</p>
    <div class="hbtns">
      <a href="{wa_url}" target="_blank" class="btn-wa">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
        Reservar por WhatsApp
      </a>
      <a href="{SITE_URL}" class="btn-o">Ver todos los servicios →</a>
    </div>
    <div class="tags">{tags_html}</div>
  </div>
</section>

<section style="background:#111;padding:80px 24px">
  <div class="inn">
    <p class="slabel">Por qué elegirnos</p>
    <h2 class="sh2">{p['h1'].split('—')[0].strip()} en <span>Puerto Iguazú</span></h2>
    <div class="cgrid">{secoes_html}</div>
  </div>
</section>

<section style="background:#0a0a0a;padding:80px 24px">
  <div class="inn">
    <p class="slabel">Testimonios</p>
    <h2 class="sh2">Lo que dicen nuestros <span>clientes</span></h2>
    <div class="dgrid">{deps_html}</div>
  </div>
</section>

<section style="background:#111;padding:80px 24px">
  <div class="inn">
    <p class="slabel">FAQ</p>
    <h2 class="sh2">Preguntas frecuentes sobre <span>transfer en Iguazú</span></h2>
    <div class="flist">{faqs_html}</div>
  </div>
</section>

<div class="ctas">
  <h2 class="cth2">Iguaçu <em>Executive</em> Transfer</h2>
  <p class="ctsub">Puerto Iguazú · Misiones · Argentina · 24 horas · Precio fijo</p>
  <div class="ctbtns">
    <a href="{wa_url}" target="_blank" class="btn-wa">💬 Reservar por WhatsApp</a>
    <a href="{SITE_URL}" class="btn-o">iguacuexecutivetransfer.com.br →</a>
  </div>
</div>

<footer>
  <p>IGUAÇU EXECUTIVE TRANSFER · PUERTO IGUAZÚ · FOZ DO IGUAÇU · TRIPLE FRONTERA · +55 {WA_NUMBER} · 24 HORAS</p>
</footer>
<div class="bline"></div>

<div class="seo-h" aria-hidden="true">
  <p>Taxi Puerto Iguazú. Transfer Misiones. {keywords_str}. {hashtags_str}. Iguaçu Executive Transfer. Puerto Iguazú Misiones Argentina. Foz do Iguaçu Brasil. Cataratas del Iguazú.</p>
</div>

<script>
function toggleFaq(btn){{
  const ans=btn.nextElementSibling;
  const icon=btn.querySelector('.faq-icon');
  const open=ans.classList.contains('open');
  document.querySelectorAll('.faq-ans').forEach(a=>a.classList.remove('open'));
  document.querySelectorAll('.faq-icon').forEach(i=>{{i.textContent='+';i.style.transform='none';}});
  if(!open){{ans.classList.add('open');icon.textContent='×';icon.style.transform='rotate(45deg)';}}
}}
const obs=new IntersectionObserver(entries=>entries.forEach(e=>{{
  if(e.isIntersecting){{e.target.classList.add('visible');obs.unobserve(e.target);}}
}}),{{threshold:0.1}});
document.querySelectorAll('.reveal').forEach(el=>obs.observe(el));
</script>
</body>
</html>"""

# GERAR
ar_dir = BASE / "ar-es"
ar_dir.mkdir(exist_ok=True)
total = 0
for p in PAGINAS:
    html = gerar_html(p)
    out = ar_dir / f"{p['slug']}.html"
    with open(out, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"✅ /ar-es/{p['slug']}.html")
    total += 1

print(f"\n🎉 {total} páginas geradas em /ar-es/")
print(f"📁 {BASE}/ar-es/")
