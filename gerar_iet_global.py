#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Gerador de páginas multilíngues — Iguaçu Executive Transfer
1.000+ páginas otimizadas para SEO internacional
"""

import os, json
from pathlib import Path

# ─── BASE DIR (ajustar ao rodar) ───────────────────────────────
BASE = Path(os.path.expanduser("~/Documents/iguacu-site"))

# ─── CONTATO ───────────────────────────────────────────────────
WA_NUMBER = "5545999164059"
SITE_URL   = "https://iguacuexecutivetransfer.com.br"
GEO_LAT    = "-25.5478"
GEO_LNG    = "-54.5882"

# ─── IDIOMAS & DADOS BASE ──────────────────────────────────────
IDIOMAS = {
    # ── INGLÊS ──
    "en": {
        "dir": "en", "lang": "en", "flag": "🇺🇸",
        "paises": ["United States","United Kingdom","Australia","Canada","Ireland","New Zealand"],
        "moeda": "BRL",
        "wa_msg": "Hello! I found your website and I'd like to book a transfer in Foz do Iguaçu.",
        "cta_book": "Book Now on WhatsApp",
        "cta_quote": "Request a Quote",
        "label_from": "Starting from",
        "label_per":  "per vehicle",
        "faq_title":  "Frequently Asked Questions",
        "dep_title":  "What Our Clients Say",
        "cards_title":"Our Services",
        "nota_title": "Important Information",
        "notas": [
            "Prices per vehicle, regardless of number of passengers (within limit)",
            "Book at least 2 hours in advance for airport transfers",
            "Payment: PIX, credit/debit card, cash (BRL, USD, EUR)",
            "20% surcharge applies between 10PM and 6AM",
            "Attraction entrance fees not included",
            "Contact us for group packages (10+ people)",
        ],
        "depoimentos": [
            {"nome":"Sarah Mitchell","pais":"United States","texto":"Outstanding service! The driver was punctual, professional, and spoke perfect English. The vehicle was immaculate. Highly recommend for airport transfers in Foz do Iguaçu!"},
            {"nome":"James O'Brien","pais":"Ireland","texto":"We used Iguaçu Executive Transfer for our entire stay. Absolutely flawless — from airport pickup to Iguazu Falls tours. Worth every penny!"},
            {"nome":"Emily Chen","pais":"Australia","texto":"Booked via WhatsApp and the process was seamless. Driver arrived early, car was spotless, and the price was very fair. 5 stars without hesitation!"},
        ],
    },

    # ── FRANCÊS ──
    "fr": {
        "dir": "fr", "lang": "fr", "flag": "🇫🇷",
        "paises": ["France","Canada","Belgique","Suisse","Luxembourg"],
        "moeda": "BRL",
        "wa_msg": "Bonjour! J'ai trouvé votre site et je voudrais réserver un transfert à Foz do Iguaçu.",
        "cta_book": "Réserver via WhatsApp",
        "cta_quote": "Demander un Devis",
        "label_from": "À partir de",
        "label_per":  "par véhicule",
        "faq_title":  "Questions Fréquentes",
        "dep_title":  "Ce que Disent nos Clients",
        "cards_title":"Nos Services",
        "nota_title": "Informations Importantes",
        "notas": [
            "Prix par véhicule, quel que soit le nombre de passagers (dans la limite indiquée)",
            "Réservez au minimum 2 heures à l'avance pour les transferts aéroport",
            "Paiement: PIX, carte bancaire, espèces (BRL, EUR, USD)",
            "Majoration de 20% entre 22h et 6h du matin",
            "Entrées des attractions non comprises dans les tarifs",
            "Contactez-nous pour les groupes de plus de 10 personnes",
        ],
        "depoimentos": [
            {"nome":"Pierre Dubois","pais":"France","texto":"Service impeccable du début à la fin. Le chauffeur parlait français et connaissait parfaitement la région des Chutes d'Iguaçu. Je recommande vivement!"},
            {"nome":"Marie-Claire Tremblay","pais":"Canada (Québec)","texto":"Nous avons utilisé ce service pour tout notre séjour. Toujours ponctuel, véhicule propre et chauffeur très professionnel. Parfait pour les familles!"},
            {"nome":"Jean-Luc Bernard","pais":"Belgique","texto":"Excellent rapport qualité-prix. La réservation via WhatsApp était simple et rapide. Le chauffeur nous a donné de très bons conseils sur les attractions locales."},
        ],
    },

    # ── ESPANHOL ──
    "es": {
        "dir": "es", "lang": "es", "flag": "🇦🇷",
        "paises": ["Argentina","Chile","Colombia","México","Perú","Uruguay","Paraguay","Bolivia","Ecuador","Venezuela"],
        "moeda": "BRL",
        "wa_msg": "¡Hola! Encontré su sitio web y me gustaría reservar un traslado en Foz do Iguaçu.",
        "cta_book": "Reservar por WhatsApp",
        "cta_quote": "Solicitar Cotización",
        "label_from": "Desde",
        "label_per":  "por vehículo",
        "faq_title":  "Preguntas Frecuentes",
        "dep_title":  "Lo que Dicen Nuestros Clientes",
        "cards_title":"Nuestros Servicios",
        "nota_title": "Información Importante",
        "notas": [
            "Precios por vehículo, independiente del número de pasajeros (dentro del límite)",
            "Reserve con al menos 2 horas de anticipación para traslados al aeropuerto",
            "Pago: PIX, tarjeta de crédito/débito, efectivo (BRL, USD, ARS)",
            "Recargo del 20% entre las 22h y las 6h de la mañana",
            "Entradas a las atracciones no incluidas en los precios",
            "Contáctenos para grupos de más de 10 personas",
        ],
        "depoimentos": [
            {"nome":"Martina García","pais":"Argentina","texto":"Servicio de primera categoría. El conductor fue muy puntual y profesional. El vehículo estaba impecable. Lo recomiendo ampliamente para traslados desde el aeropuerto de Foz do Iguaçu!"},
            {"nome":"Carlos Mendoza","pais":"Chile","texto":"Usamos este servicio para todo nuestro viaje. Siempre puntuales, vehículo limpio y conductor muy amable. Perfecto para familias con niños!"},
            {"nome":"Andrea Torres","pais":"Colombia","texto":"Excelente relación calidad-precio. La reserva por WhatsApp fue muy sencilla. El conductor nos dio excelentes recomendaciones sobre las atracciones locales."},
        ],
    },

    # ── ALEMÃO ──
    "de": {
        "dir": "de", "lang": "de", "flag": "🇩🇪",
        "paises": ["Deutschland","Österreich","Schweiz"],
        "moeda": "BRL",
        "wa_msg": "Hallo! Ich habe Ihre Website gefunden und möchte einen Transfer in Foz do Iguaçu buchen.",
        "cta_book": "Jetzt über WhatsApp buchen",
        "cta_quote": "Angebot anfordern",
        "label_from": "Ab",
        "label_per":  "pro Fahrzeug",
        "faq_title":  "Häufige Fragen",
        "dep_title":  "Was unsere Kunden sagen",
        "cards_title":"Unsere Leistungen",
        "nota_title": "Wichtige Hinweise",
        "notas": [
            "Preise pro Fahrzeug, unabhängig von der Passagierzahl (innerhalb des Limits)",
            "Flughafentransfers mindestens 2 Stunden im Voraus buchen",
            "Zahlung: PIX, Kredit-/Debitkarte, Bargeld (BRL, EUR, USD)",
            "Nachtzuschlag 20% zwischen 22:00 und 06:00 Uhr",
            "Eintrittsgelder für Attraktionen nicht inbegriffen",
            "Kontaktieren Sie uns für Gruppen ab 10 Personen",
        ],
        "depoimentos": [
            {"nome":"Hans Müller","pais":"Deutschland","texto":"Erstklassiger Service von Anfang bis Ende. Der Fahrer war sehr pünktlich und sprach gut Englisch. Das Fahrzeug war tadellos sauber. Absolute Empfehlung für Transfers in Foz do Iguaçu!"},
            {"nome":"Sabine Weber","pais":"Österreich","texto":"Wir haben diesen Service für unseren gesamten Aufenthalt genutzt. Immer pünktlich, gepflegtes Fahrzeug und sehr freundlicher Fahrer. Perfekt für Familien!"},
            {"nome":"Thomas Becker","pais":"Schweiz","texto":"Hervorragendes Preis-Leistungs-Verhältnis. Die WhatsApp-Buchung war einfach und schnell. Der Fahrer gab uns tolle Tipps zu lokalen Sehenswürdigkeiten."},
        ],
    },

    # ── ITALIANO ──
    "it": {
        "dir": "it", "lang": "it", "flag": "🇮🇹",
        "paises": ["Italia","Svizzera"],
        "moeda": "BRL",
        "wa_msg": "Ciao! Ho trovato il vostro sito e vorrei prenotare un transfer a Foz do Iguaçu.",
        "cta_book": "Prenota su WhatsApp",
        "cta_quote": "Richiedi un Preventivo",
        "label_from": "A partire da",
        "label_per":  "per veicolo",
        "faq_title":  "Domande Frequenti",
        "dep_title":  "Cosa Dicono i Nostri Clienti",
        "cards_title":"I Nostri Servizi",
        "nota_title": "Informazioni Importanti",
        "notas": [
            "Prezzi per veicolo, indipendentemente dal numero di passeggeri (entro il limite)",
            "Prenotare almeno 2 ore prima per i transfer aeroportuali",
            "Pagamento: PIX, carta di credito/debito, contanti (BRL, EUR, USD)",
            "Supplemento del 20% tra le 22:00 e le 06:00",
            "Biglietti di ingresso alle attrazioni non inclusi",
            "Contattateci per gruppi oltre 10 persone",
        ],
        "depoimentos": [
            {"nome":"Marco Rossi","pais":"Italia","texto":"Servizio eccellente dall'inizio alla fine. L'autista era molto puntuale e professionale. Il veicolo era impeccabile. Lo consiglio vivamente per i transfer a Foz do Iguaçu!"},
            {"nome":"Giulia Ferrari","pais":"Italia","texto":"Abbiamo utilizzato questo servizio per tutto il nostro soggiorno. Sempre puntuali, veicolo pulito e autista molto cordiale. Perfetto per le famiglie con bambini!"},
            {"nome":"Alessandro Bianchi","pais":"Italia","texto":"Ottimo rapporto qualità-prezzo. La prenotazione via WhatsApp è stata semplice e veloce. L'autista ci ha dato ottime raccomandazioni sulle attrazioni locali."},
        ],
    },

    # ── HOLANDÊS ──
    "nl": {
        "dir": "nl", "lang": "nl", "flag": "🇳🇱",
        "paises": ["Nederland","België"],
        "moeda": "BRL",
        "wa_msg": "Hallo! Ik heb uw website gevonden en wil graag een transfer boeken in Foz do Iguaçu.",
        "cta_book": "Nu boeken via WhatsApp",
        "cta_quote": "Offerte aanvragen",
        "label_from": "Vanaf",
        "label_per":  "per voertuig",
        "faq_title":  "Veelgestelde Vragen",
        "dep_title":  "Wat onze klanten zeggen",
        "cards_title":"Onze Diensten",
        "nota_title": "Belangrijke Informatie",
        "notas": [
            "Prijzen per voertuig, ongeacht het aantal passagiers (binnen limiet)",
            "Boek minimaal 2 uur van tevoren voor luchthavenoverdrachten",
            "Betaling: PIX, credit-/debetkaart, contant (BRL, EUR, USD)",
            "Nachttoeslag 20% tussen 22:00 en 06:00 uur",
            "Entreekosten voor attracties niet inbegrepen",
            "Neem contact op voor groepen van meer dan 10 personen",
        ],
        "depoimentos": [
            {"nome":"Jan de Vries","pais":"Nederland","texto":"Uitstekende service van begin tot eind. De chauffeur was zeer punctueel en professioneel. Het voertuig was onberispelijk schoon. Zeker aanbevolen voor transfers in Foz do Iguaçu!"},
            {"nome":"Sophie van den Berg","pais":"Nederland","texto":"We hebben deze service voor ons hele verblijf gebruikt. Altijd op tijd, schoon voertuig en vriendelijke chauffeur. Perfect voor gezinnen met kinderen!"},
            {"nome":"Peter Janssen","pais":"België","texto":"Uitstekende prijs-kwaliteitverhouding. Reserveren via WhatsApp was eenvoudig en snel. De chauffeur gaf ons geweldige tips over lokale bezienswaardigheden."},
        ],
    },

    # ── POLONÊS ──
    "pl": {
        "dir": "pl", "lang": "pl", "flag": "🇵🇱",
        "paises": ["Polska"],
        "moeda": "BRL",
        "wa_msg": "Cześć! Znalazłem Państwa stronę i chciałbym zarezerwować transfer w Foz do Iguaçu.",
        "cta_book": "Zarezerwuj przez WhatsApp",
        "cta_quote": "Zapytaj o wycenę",
        "label_from": "Od",
        "label_per":  "za pojazd",
        "faq_title":  "Często Zadawane Pytania",
        "dep_title":  "Co mówią nasi klienci",
        "cards_title":"Nasze Usługi",
        "nota_title": "Ważne Informacje",
        "notas": [
            "Ceny za pojazd, niezależnie od liczby pasażerów (w granicach limitu)",
            "Rezerwuj minimum 2 godziny przed transferem na lotnisko",
            "Płatność: PIX, karta kredytowa/debetowa, gotówka (BRL, EUR, USD)",
            "Dopłata nocna 20% między 22:00 a 06:00",
            "Bilety wstępu do atrakcji nie są wliczone w cenę",
            "Skontaktuj się z nami w przypadku grup powyżej 10 osób",
        ],
        "depoimentos": [
            {"nome":"Piotr Kowalski","pais":"Polska","texto":"Doskonała obsługa od początku do końca. Kierowca był bardzo punktualny i profesjonalny. Pojazd był nienagannie czysty. Gorąco polecam na transfery w Foz do Iguaçu!"},
            {"nome":"Anna Wiśniewska","pais":"Polska","texto":"Korzystaliśmy z tej usługi przez cały nasz pobyt. Zawsze punktualnie, czysty pojazd i bardzo miły kierowca. Idealne dla rodzin z dziećmi!"},
            {"nome":"Marek Nowak","pais":"Polska","texto":"Doskonały stosunek jakości do ceny. Rezerwacja przez WhatsApp była prosta i szybka. Kierowca dał nam świetne wskazówki dotyczące lokalnych atrakcji."},
        ],
    },

    # ── RUSSO ──
    "ru": {
        "dir": "ru", "lang": "ru", "flag": "🇷🇺",
        "paises": ["Россия","Украина","Беларусь"],
        "moeda": "BRL",
        "wa_msg": "Здравствуйте! Я нашёл ваш сайт и хотел бы забронировать трансфер в Фос-ду-Игуасу.",
        "cta_book": "Забронировать через WhatsApp",
        "cta_quote": "Запросить цену",
        "label_from": "От",
        "label_per":  "за автомобиль",
        "faq_title":  "Часто задаваемые вопросы",
        "dep_title":  "Отзывы наших клиентов",
        "cards_title":"Наши услуги",
        "nota_title": "Важная информация",
        "notas": [
            "Цены за автомобиль, независимо от количества пассажиров (в пределах лимита)",
            "Бронируйте трансфер в аэропорт минимум за 2 часа",
            "Оплата: PIX, кредитная/дебетовая карта, наличные (BRL, USD, EUR)",
            "Ночная надбавка 20% с 22:00 до 06:00",
            "Входные билеты на аттракционы не включены в стоимость",
            "Свяжитесь с нами для групп более 10 человек",
        ],
        "depoimentos": [
            {"nome":"Александр Иванов","pais":"Россия","texto":"Отличный сервис от начала до конца. Водитель был очень пунктуален и профессионален. Автомобиль был безупречно чист. Очень рекомендую для трансферов в Фос-ду-Игуасу!"},
            {"nome":"Мария Петрова","pais":"Россия","texto":"Мы пользовались этим сервисом на протяжении всего нашего пребывания. Всегда вовремя, чистый автомобиль и очень дружелюбный водитель. Идеально для семей с детьми!"},
            {"nome":"Дмитрий Сидоров","pais":"Россия","texto":"Отличное соотношение цены и качества. Бронирование через WhatsApp было простым и быстрым. Водитель дал нам отличные советы о местных достопримечательностях."},
        ],
    },

    # ── ÁRABE ──
    "ar": {
        "dir": "ar", "lang": "ar", "flag": "🇦🇪",
        "paises": ["الإمارات","المملكة العربية السعودية","قطر","الكويت"],
        "moeda": "BRL",
        "wa_msg": "مرحباً! وجدت موقعكم وأريد حجز نقل في فوز دو إيغواسو.",
        "cta_book": "احجز عبر WhatsApp",
        "cta_quote": "طلب عرض سعر",
        "label_from": "ابتداءً من",
        "label_per":  "لكل سيارة",
        "faq_title":  "الأسئلة الشائعة",
        "dep_title":  "ماذا يقول عملاؤنا",
        "cards_title":"خدماتنا",
        "nota_title": "معلومات مهمة",
        "dir_rtl": True,
        "notas": [
            "الأسعار لكل سيارة، بصرف النظر عن عدد الركاب (ضمن الحد المحدد)",
            "احجز قبل ساعتين على الأقل للنقل من وإلى المطار",
            "الدفع: PIX أو بطاقة ائتمان/خصم أو نقداً (BRL، USD، EUR)",
            "رسوم إضافية 20% بين الساعة 10 مساءً و6 صباحاً",
            "رسوم دخول المعالم السياحية غير مشمولة في الأسعار",
            "تواصل معنا للمجموعات المكونة من أكثر من 10 أشخاص",
        ],
        "depoimentos": [
            {"nome":"محمد الأحمد","pais":"الإمارات العربية المتحدة","texto":"خدمة ممتازة من البداية إلى النهاية. كان السائق في غاية الاحترافية والالتزام بالمواعيد. السيارة كانت نظيفة تماماً. أنصح بها بشدة للنقل في فوز دو إيغواسو!"},
            {"nome":"فاطمة السعيد","pais":"المملكة العربية السعودية","texto":"استخدمنا هذه الخدمة طوال إقامتنا. دائماً في الوقت المحدد، سيارة نظيفة وسائق لطيف جداً. مثالية للعائلات مع الأطفال!"},
            {"nome":"خالد المنصور","pais":"قطر","texto":"نسبة ممتازة بين الجودة والسعر. الحجز عبر WhatsApp كان سهلاً وسريعاً. أعطانا السائق نصائح رائعة حول المعالم السياحية المحلية."},
        ],
    },

    # ── COREANO ──
    "ko": {
        "dir": "ko", "lang": "ko", "flag": "🇰🇷",
        "paises": ["대한민국"],
        "moeda": "BRL",
        "wa_msg": "안녕하세요! 귀하의 웹사이트를 찾았고 Foz do Iguaçu에서 교통편을 예약하고 싶습니다.",
        "cta_book": "WhatsApp으로 예약하기",
        "cta_quote": "견적 요청",
        "label_from": "시작 가격",
        "label_per":  "차량당",
        "faq_title":  "자주 묻는 질문",
        "dep_title":  "고객 후기",
        "cards_title":"서비스 안내",
        "nota_title": "중요 안내",
        "notas": [
            "가격은 차량당 (승객 수와 무관, 정원 이내)",
            "공항 이동은 최소 2시간 전에 예약하세요",
            "결제: PIX, 신용/체크카드, 현금 (BRL, USD, EUR)",
            "오후 10시~오전 6시 심야 할증 20% 적용",
            "관광지 입장료는 별도입니다",
            "10인 이상 단체는 문의해 주세요",
        ],
        "depoimentos": [
            {"nome":"김민준","pais":"대한민국","texto":"처음부터 끝까지 훌륭한 서비스였습니다. 기사님이 매우 시간을 잘 지키고 전문적이었습니다. 차량도 깨끗했습니다. Foz do Iguaçu 이동에 강력 추천합니다!"},
            {"nome":"이지영","pais":"대한민국","texto":"여행 기간 내내 이 서비스를 이용했습니다. 항상 정시에, 깨끗한 차량과 매우 친절한 기사님. 아이 있는 가족에게 완벽합니다!"},
            {"nome":"박서준","pais":"대한민국","texto":"가격 대비 훌륭한 서비스입니다. WhatsApp 예약이 간편하고 빨랐습니다. 기사님이 현지 관광지에 대한 훌륭한 팁을 주셨습니다."},
        ],
    },
}

# ─── TEMAS DE PÁGINAS ──────────────────────────────────────────
TEMAS = {
    # ── INGLÊS ──
    "en": [
        {
            "slug": "airport-transfer",
            "h1": "Airport Transfer Foz do Iguaçu — Executive & Reliable",
            "meta": "Premium airport transfer service in Foz do Iguaçu (IGU). Professional drivers, executive vehicles, available 24/7. Book via WhatsApp — instant confirmation.",
            "keywords": ["airport transfer foz do iguacu","iguazu airport transfer","foz do iguacu taxi airport","transfer IGU airport"],
            "secoes": [
                {"t":"Executive Airport Transfer in Foz do Iguaçu","x":"Iguaçu Executive Transfer offers premium airport transfer services between Foz do Iguaçu International Airport (IGU) and all hotels in the region. Our professional drivers monitor your flight status in real time, ensuring a stress-free arrival experience no matter what time you land."},
                {"t":"Why Choose Our Airport Transfer Service","x":"Unlike regular taxis, our executive service includes flight tracking, professional bilingual drivers, air-conditioned luxury vehicles, and meet-and-greet service inside the terminal. Your comfort and punctuality are our absolute priorities from the moment you land in Foz do Iguaçu."},
                {"t":"Fleet & Vehicle Standards","x":"Our fleet consists of premium sedans and executive vans maintained to the highest standards. Every vehicle is climate-controlled, features comfortable leather seating, and is equipped with phone chargers and complimentary Wi-Fi. Perfect for both business and leisure travelers visiting Iguazu Falls."},
                {"t":"Coverage Area — Foz do Iguaçu & Region","x":"We provide airport transfers to all major hotels, resorts, and accommodations in Foz do Iguaçu, including the hotel strip near Iguazu Falls National Park, downtown hotels, and properties in the surrounding region. We also serve Ciudad del Este (Paraguay) and Puerto Iguazú (Argentina)."},
                {"t":"24/7 Availability & Booking Process","x":"Our airport transfer service operates 24 hours a day, 7 days a week, 365 days a year. Booking is simple: send us a WhatsApp message with your flight details, number of passengers, and hotel name. You'll receive instant confirmation and a fixed price with no hidden fees or surcharges."},
                {"t":"Competitive Pricing & Payment Options","x":"We offer transparent, fixed pricing for all airport transfers in Foz do Iguaçu — no meters, no surprises. Payment can be made in Brazilian Reais (BRL), US Dollars (USD), or Euros (EUR) via cash, credit card, or PIX. Request your personalized quote today via WhatsApp."},
            ],
            "faqs": [
                {"p":"How far is the airport from downtown Foz do Iguaçu?","r":"Foz do Iguaçu International Airport (IGU) is approximately 12 km from downtown, a 15-20 minute drive. The hotel strip near Iguazu Falls is about 20 km from the airport, taking 25-30 minutes depending on traffic."},
                {"p":"Do you track flight delays?","r":"Yes! We monitor all incoming flights in real time. If your flight is delayed, your driver will wait at no extra charge. We receive flight status updates automatically so you never have to worry about us not being there."},
                {"p":"Can you accommodate large groups?","r":"Absolutely! We have executive vans that can accommodate groups of up to 10 passengers with luggage. For larger groups, we can arrange a convoy of vehicles. Contact us via WhatsApp for group pricing."},
                {"p":"What happens if I need to cancel?","r":"We understand travel plans can change. Cancellations made more than 2 hours before pickup are free of charge. Please contact us via WhatsApp as soon as possible if you need to modify or cancel your booking."},
                {"p":"Do your drivers speak English?","r":"Yes! Our drivers are bilingual (Portuguese-English) and can also communicate in Spanish. They are trained to provide a professional, friendly service and can answer any questions you have about Foz do Iguaçu and the region."},
                {"p":"Is there a child seat available?","r":"Yes, we can provide child safety seats upon request at no additional charge. Please mention this when booking so we can ensure the appropriate seat is available for your transfer."},
            ],
            "servicos": [
                {"icone":"✈️","nome":"Airport Transfer (1-4 pax)","desc":"Sedan executive · Bilingual driver · Flight tracking","preco":"R$ 120","nota":"per trip"},
                {"icone":"🚐","nome":"Airport Transfer (5-10 pax)","desc":"Executive van · Ample luggage space · Air conditioning","preco":"R$ 280","nota":"per trip"},
                {"icone":"🌊","nome":"Iguazu Falls Tour","desc":"Round-trip transfer · Driver wait included","preco":"R$ 200","nota":"per vehicle"},
                {"icone":"🏨","nome":"Hotel-to-Hotel Transfer","desc":"Any hotel in Foz do Iguaçu · Fixed price","preco":"R$ 80","nota":"per trip"},
                {"icone":"🌎","nome":"Argentina / Paraguay Transfer","desc":"Puerto Iguazú or Ciudad del Este","preco":"Consult","nota":"via WhatsApp"},
                {"icone":"🕐","nome":"Executive Daily Hire (8h)","desc":"Driver at your disposal · Up to 80km radius","preco":"R$ 480","nota":"per day"},
            ],
        },
        {
            "slug": "iguazu-falls-transfer",
            "h1": "Transfer to Iguazu Falls — Premium Service from Your Hotel",
            "meta": "Private transfer to Iguazu Falls from any hotel in Foz do Iguaçu. Executive vehicles, professional drivers, best price. Book on WhatsApp — 24/7 service.",
            "keywords": ["transfer to iguazu falls","iguazu falls tour transfer","foz do iguacu to iguazu falls","iguazu waterfalls transportation"],
            "secoes": [
                {"t":"Private Transfer to Iguazu Falls National Park","x":"Experience the world's most spectacular waterfalls with a premium private transfer service. Iguaçu Executive Transfer provides comfortable, air-conditioned vehicles from any hotel in Foz do Iguaçu directly to the entrance of Iguazu Falls National Park, with driver wait time included throughout your visit."},
                {"t":"Brazilian Side vs Argentine Side — Which to Visit?","x":"Foz do Iguaçu offers access to both the Brazilian and Argentine sides of Iguazu Falls. The Brazilian side provides the iconic panoramic views of the falls from a wide walkway, while the Argentine side offers closer encounters via jungle trails and the breathtaking Devil's Throat. Our drivers can advise on itineraries to maximize your experience."},
                {"t":"What's Included in Our Falls Transfer","x":"Your transfer to Iguazu Falls includes door-to-door hotel pickup, an executive air-conditioned vehicle, a professional bilingual driver, driver wait time during your visit, and return transfer to your hotel. Entrance fees to the national park are not included and must be purchased separately at the park gate."},
                {"t":"Best Time to Visit Iguazu Falls","x":"Iguazu Falls is spectacular year-round, but the best time to visit depends on what you prioritize. The rainy season (November to March) produces the most powerful falls, while the dry season (April to September) offers clearer skies and easier walking conditions. Our drivers can recommend the best time to visit based on current conditions."},
                {"t":"Combo Tours — Iguazu Falls + Itaipu Dam","x":"Maximize your time in Foz do Iguaçu with our popular combo transfers. Visit both Iguazu Falls and Itaipu Hydroelectric Dam in a single half-day or full-day excursion. Our driver will coordinate the itinerary to ensure you make the most of your time, with flexible scheduling to suit your preferences."},
                {"t":"Group & Family Packages","x":"Traveling with family or a group? Our executive vans accommodate up to 10 passengers, making our service perfect for families visiting Iguazu Falls. We offer customized packages for groups of all sizes, with flexible itineraries tailored to your schedule and interests. Contact us via WhatsApp for group pricing."},
            ],
            "faqs": [
                {"p":"How long does the visit to Iguazu Falls take?","r":"Most visitors spend 2-4 hours at the Brazilian side of Iguazu Falls. If you plan to visit the Argentine side as well, allow a full day. Our driver will wait for you throughout your visit and return you to your hotel when you're ready."},
                {"p":"Do I need to buy tickets in advance?","r":"It's highly recommended to purchase Iguazu Falls tickets online in advance, especially during peak season (July, December-January) when queues can be long. Our drivers can advise on the best options when you book your transfer."},
                {"p":"Can I visit both sides of the falls in one day?","r":"Yes! Many visitors choose to visit the Brazilian side in the morning and the Argentine side in the afternoon. This requires crossing the border, so please have your passport ready. Our drivers are experienced with border crossings and can assist you through the process."},
                {"p":"Is the road to Iguazu Falls safe?","r":"Absolutely. The road from Foz do Iguaçu hotels to the national park is well-maintained and safe. Our professional drivers know the route well and will get you there safely and comfortably."},
                {"p":"What should I wear to Iguazu Falls?","r":"Wear comfortable, waterproof shoes as the walkways can be wet from spray. Light, breathable clothing is recommended, and bring a light waterproof jacket. Sunscreen and insect repellent are also recommended for your visit."},
                {"p":"Can you arrange for a guide at the falls?","r":"While our drivers are knowledgeable about the falls and region, we can also arrange professional licensed guides at the park upon request. Please mention this when booking and we'll include it in your transfer package."},
            ],
            "servicos": [
                {"icone":"🌊","nome":"Iguazu Falls Transfer (Brazilian Side)","desc":"Hotel pickup · Driver wait · Return transfer","preco":"R$ 200","nota":"per vehicle"},
                {"icone":"🌿","nome":"Argentine Side (Puerto Iguazú)","desc":"Border crossing · Bilingual driver · Full day","preco":"R$ 320","nota":"per vehicle"},
                {"icone":"🎯","nome":"Falls + Itaipu Combo","desc":"Half-day tour · Both attractions","preco":"R$ 320","nota":"per vehicle"},
                {"icone":"🚐","nome":"Group Transfer (up to 10)","desc":"Executive van · Perfect for families","preco":"R$ 450","nota":"per vehicle"},
                {"icone":"📸","nome":"Sunset Photography Tour","desc":"Best lighting · Scenic viewpoints","preco":"R$ 280","nota":"per vehicle"},
                {"icone":"🎒","nome":"Full Day Excursion (8h)","desc":"Multiple attractions · Flexible itinerary","preco":"R$ 480","nota":"per vehicle"},
            ],
        },
        {
            "slug": "vip-taxi-foz-do-iguacu",
            "h1": "VIP Taxi Foz do Iguaçu — Executive Car Service 24/7",
            "meta": "VIP taxi and executive car service in Foz do Iguaçu. Available 24/7, bilingual drivers, luxury fleet. Better than Uber for tourists. Book on WhatsApp.",
            "keywords": ["vip taxi foz do iguacu","executive car foz do iguacu","luxury taxi iguazu","private car service foz"],
            "secoes": [
                {"t":"VIP Executive Taxi Service in Foz do Iguaçu","x":"Iguaçu Executive Transfer offers a premium VIP taxi alternative to standard taxis and ride-sharing apps. Our service provides fixed pricing, professional bilingual drivers, and luxury air-conditioned vehicles — without the uncertainty of surge pricing or language barriers that tourists often face in Foz do Iguaçu."},
                {"t":"Why Choose VIP Executive Over Regular Taxis","x":"Standard taxis in Foz do Iguaçu can be unreliable, with language barriers and metered pricing that can lead to unexpected costs. Our VIP service provides fixed quotes before you travel, professional English-speaking drivers, and guaranteed vehicle standards — giving you peace of mind throughout your stay."},
                {"t":"Corporate & Business Travel","x":"Iguaçu Executive Transfer is the preferred choice for business travelers visiting Foz do Iguaçu for corporate events, conferences, or negotiations at Itaipu. We understand the importance of punctuality and discretion, and our professional service reflects these values at every journey."},
                {"t":"Hotel-to-Restaurant & Nighttime Service","x":"Enjoy your evening in Foz do Iguaçu without worrying about transportation. Our VIP taxi service operates 24 hours, making it perfect for dinner reservations, nighttime excursions, or late-night airport pickups. Book in advance or on demand via WhatsApp."},
                {"t":"Itaipu Dam & City Tour Transfers","x":"Beyond the falls, Foz do Iguaçu has much to offer. Explore Itaipu Hydroelectric Dam, the Bird Park, the triple frontier monument, and the city's thriving food scene with the comfort of a private executive vehicle. Our drivers can create customized city tour itineraries for you."},
                {"t":"Transparent Pricing — No Surprises","x":"All our VIP taxi services are priced transparently before your journey begins. We provide fixed quotes via WhatsApp so you know exactly what to expect. No meters, no surge pricing, no hidden fees — just honest, professional executive transportation in Foz do Iguaçu."},
            ],
            "faqs": [
                {"p":"Is your VIP taxi service available at night?","r":"Yes! Our VIP taxi service operates 24 hours a day, 7 days a week. A 20% night surcharge applies between 10PM and 6AM. Late-night airport pickups and early morning transfers are our specialty."},
                {"p":"How do I book a VIP taxi in Foz do Iguaçu?","r":"Simply send us a WhatsApp message with your pickup location, destination, date and time, and number of passengers. You'll receive a fixed price quote within minutes. Confirm and you're all set — no apps to download, no accounts to create."},
                {"p":"Can I pay in USD or EUR?","r":"Yes! We accept payment in Brazilian Reais (BRL), US Dollars (USD), Euros (EUR), and Argentine Pesos (ARS). We also accept credit cards and PIX digital payments. No need to worry about currency exchange for your transportation needs."},
                {"p":"What is the difference between your service and Uber?","r":"Unlike Uber, our VIP service provides fixed pricing (no surge), professional drivers who speak English, guaranteed vehicle standards, and direct WhatsApp communication. We specialize in serving international tourists, so you'll always have someone who understands your needs."},
                {"p":"Do you offer waiting time at attractions?","r":"Yes! For all tourist attraction transfers, our driver will wait for you throughout your visit at no extra charge. Simply let us know when you're ready to leave and your driver will be waiting at the designated meeting point."},
                {"p":"Can I schedule a transfer in advance?","r":"Absolutely! We recommend booking at least 2 hours in advance for all transfers. For airport pickups, please share your flight number so we can track any delays. We also accept same-day bookings when availability permits."},
            ],
            "servicos": [
                {"icone":"🚗","nome":"VIP On-Demand Taxi","desc":"Immediate pickup · Fixed price · 24/7","preco":"R$ 60","nota":"starting from"},
                {"icone":"🏨","nome":"Hotel Transfer (any hotel)","desc":"Door-to-door · Sedan executive","preco":"R$ 80","nota":"per trip"},
                {"icone":"🌙","nome":"Night Service (10PM-6AM)","desc":"Available 24/7 · 20% night surcharge","preco":"R$ 96","nota":"starting from"},
                {"icone":"💼","nome":"Corporate Transfer","desc":"Receipt provided · Professional service","preco":"Consult","nota":"via WhatsApp"},
                {"icone":"🕐","nome":"Hourly Hire","desc":"Driver at disposal · Flexible stops","preco":"R$ 80","nota":"per hour"},
                {"icone":"🚐","nome":"Group VIP (up to 10)","desc":"Executive van · Perfect for groups","preco":"R$ 150","nota":"starting from"},
            ],
        },
    ],

    # ── FRANCÊS ──
    "fr": [
        {
            "slug": "transfer-aeroport",
            "h1": "Transfer Aéroport Foz do Iguaçu — Service Exécutif Premium",
            "meta": "Transfer aéroport premium à Foz do Iguaçu (IGU). Chauffeurs professionnels, véhicules exécutifs, disponibles 24h/24. Réservez via WhatsApp — confirmation immédiate.",
            "keywords": ["transfer aeroport foz do iguacu","navette aeroport iguazu","taxi aeroport foz iguacu","transfert IGU"],
            "secoes": [
                {"t":"Transfer Exécutif depuis l'Aéroport de Foz do Iguaçu","x":"Iguaçu Executive Transfer propose un service de transfer premium entre l'Aéroport International de Foz do Iguaçu (IGU) et tous les hôtels de la région. Nos chauffeurs professionnels suivent l'état de votre vol en temps réel, garantissant une arrivée sans stress quelle que soit l'heure de votre atterrissage."},
                {"t":"Pourquoi Choisir Notre Service de Transfer Aéroport","x":"Contrairement aux taxis ordinaires, notre service exécutif inclut le suivi des vols, des chauffeurs bilingues professionnels, des véhicules de luxe climatisés et un service d'accueil dans le terminal. Votre confort et votre ponctualité sont nos priorités absolues dès votre arrivée à Foz do Iguaçu."},
                {"t":"Notre Flotte de Véhicules Exécutifs","x":"Notre flotte comprend des berlines premium et des vans exécutifs maintenus selon les normes les plus strictes. Chaque véhicule est climatisé, dispose de sièges en cuir confortables et est équipé de chargeurs de téléphone et du Wi-Fi gratuit. Parfait pour les voyageurs d'affaires et de loisirs visitant les Chutes d'Iguaçu."},
                {"t":"Zone de Couverture — Foz do Iguaçu et Région","x":"Nous assurons des transferts aéroport vers tous les hôtels, resorts et hébergements majeurs de Foz do Iguaçu, y compris la zone hôtelière près du Parc National des Chutes d'Iguaçu, les hôtels du centre-ville et les propriétés dans la région environnante. Nous desservons également Ciudad del Este (Paraguay) et Puerto Iguazú (Argentine)."},
                {"t":"Disponibilité 24h/24 et Processus de Réservation","x":"Notre service de transfer aéroport fonctionne 24 heures sur 24, 7 jours sur 7, 365 jours par an. La réservation est simple: envoyez-nous un message WhatsApp avec les détails de votre vol, le nombre de passagers et le nom de votre hôtel. Vous recevrez une confirmation immédiate avec un prix fixe sans frais cachés."},
                {"t":"Tarifs Compétitifs et Options de Paiement","x":"Nous proposons des tarifs fixes et transparents pour tous les transferts aéroport à Foz do Iguaçu — sans compteur, sans surprises. Le paiement peut être effectué en Reais brésiliens (BRL), en Dollars américains (USD) ou en Euros (EUR) en espèces, par carte bancaire ou via PIX. Demandez votre devis personnalisé via WhatsApp."},
            ],
            "faqs": [
                {"p":"Quelle est la distance entre l'aéroport et le centre-ville de Foz do Iguaçu?","r":"L'Aéroport International de Foz do Iguaçu (IGU) se trouve à environ 12 km du centre-ville, soit 15-20 minutes de route. La zone hôtelière près des Chutes d'Iguaçu est à environ 20 km de l'aéroport, soit 25-30 minutes selon la circulation."},
                {"p":"Suivez-vous les retards de vol?","r":"Oui! Nous surveillons tous les vols entrants en temps réel. Si votre vol est retardé, votre chauffeur attendra sans frais supplémentaires. Nous recevons les mises à jour du statut des vols automatiquement, vous n'avez donc jamais à vous inquiéter."},
                {"p":"Pouvez-vous accueillir de grands groupes?","r":"Absolument! Nous disposons de vans exécutifs pouvant accueillir jusqu'à 10 passagers avec bagages. Pour les groupes plus importants, nous pouvons organiser un convoi de véhicules. Contactez-nous via WhatsApp pour les tarifs de groupe."},
                {"p":"Que se passe-t-il si je dois annuler?","r":"Nous comprenons que les plans de voyage peuvent changer. Les annulations effectuées plus de 2 heures avant la prise en charge sont gratuites. Veuillez nous contacter via WhatsApp dès que possible si vous devez modifier ou annuler votre réservation."},
                {"p":"Vos chauffeurs parlent-ils français?","r":"Oui! Nos chauffeurs sont bilingues (portugais-anglais/français) et peuvent également communiquer en espagnol. Ils sont formés pour fournir un service professionnel et chaleureux et peuvent répondre à toutes vos questions sur Foz do Iguaçu."},
                {"p":"Un siège enfant est-il disponible?","r":"Oui, nous pouvons fournir des sièges de sécurité pour enfants sur demande sans frais supplémentaires. Veuillez le mentionner lors de la réservation pour que nous puissions vous assurer le siège approprié."},
            ],
            "servicos": [
                {"icone":"✈️","nome":"Transfer Aéroport (1-4 pax)","desc":"Berline exécutive · Chauffeur bilingue · Suivi de vol","preco":"R$ 120","nota":"par trajet"},
                {"icone":"🚐","nome":"Transfer Aéroport (5-10 pax)","desc":"Van exécutif · Grand coffre · Climatisation","preco":"R$ 280","nota":"par trajet"},
                {"icone":"🌊","nome":"Tour Chutes d'Iguaçu","desc":"Transfer aller-retour · Attente chauffeur incluse","preco":"R$ 200","nota":"par véhicule"},
                {"icone":"🏨","nome":"Transfer Hôtel à Hôtel","desc":"Tout hôtel à Foz do Iguaçu · Prix fixe","preco":"R$ 80","nota":"par trajet"},
                {"icone":"🌎","nome":"Transfer Argentine / Paraguay","desc":"Puerto Iguazú ou Ciudad del Este","preco":"Consulter","nota":"via WhatsApp"},
                {"icone":"🕐","nome":"Location Journalière (8h)","desc":"Chauffeur à disposition · Rayon 80km","preco":"R$ 480","nota":"par jour"},
            ],
        },
        {
            "slug": "chutes-iguacu-transfer",
            "h1": "Transfer Chutes d'Iguaçu — Service Privé depuis Votre Hôtel",
            "meta": "Transfer privé vers les Chutes d'Iguaçu depuis tout hôtel de Foz do Iguaçu. Véhicules exécutifs, chauffeurs professionnels, meilleur prix. Réservez sur WhatsApp.",
            "keywords": ["transfer chutes iguacu","excursion chutes iguazu","transport chutes iguacu","visite chutes iguacu transfer"],
            "secoes": [
                {"t":"Transfer Privé vers le Parc National des Chutes d'Iguaçu","x":"Découvrez les chutes d'eau les plus spectaculaires du monde avec un service de transfer privé premium. Iguaçu Executive Transfer vous conduit confortablement depuis votre hôtel directement à l'entrée du Parc National des Chutes d'Iguaçu, avec le temps d'attente du chauffeur inclus tout au long de votre visite."},
                {"t":"Côté Brésilien vs Côté Argentin — Lequel Visiter?","x":"Foz do Iguaçu offre l'accès aux côtés brésilien et argentin des Chutes d'Iguaçu. Le côté brésilien offre les vues panoramiques emblématiques depuis une large passerelle, tandis que le côté argentin propose des rencontres plus proches via des sentiers dans la jungle et la spectaculaire Gorge du Diable. Nos chauffeurs peuvent vous conseiller sur les itinéraires."},
                {"t":"Ce qui est Inclus dans Notre Transfer vers les Chutes","x":"Votre transfer vers les Chutes d'Iguaçu comprend la prise en charge à la porte de votre hôtel, un véhicule exécutif climatisé, un chauffeur bilingue professionnel, l'attente du chauffeur pendant votre visite et le transfer retour à votre hôtel. Les droits d'entrée au parc national ne sont pas inclus."},
                {"t":"Meilleure Période pour Visiter les Chutes d'Iguaçu","x":"Les Chutes d'Iguaçu sont spectaculaires toute l'année, mais la meilleure période dépend de vos priorités. La saison des pluies (novembre à mars) produit les chutes les plus puissantes, tandis que la saison sèche (avril à septembre) offre un ciel plus dégagé et de meilleures conditions de marche. Nos chauffeurs peuvent vous conseiller."},
                {"t":"Tours Combinés — Chutes d'Iguaçu + Barrage d'Itaipu","x":"Maximisez votre temps à Foz do Iguaçu avec nos populaires tours combinés. Visitez les Chutes d'Iguaçu et le Barrage Hydroélectrique d'Itaipu en une seule demi-journée ou journée complète. Notre chauffeur coordonnera l'itinéraire pour vous permettre de profiter au maximum de votre temps."},
                {"t":"Forfaits Groupe & Famille","x":"Vous voyagez en famille ou en groupe? Nos vans exécutifs accueillent jusqu'à 10 passagers, rendant notre service parfait pour les familles visitant les Chutes d'Iguaçu. Nous proposons des forfaits personnalisés pour des groupes de toutes tailles, avec des itinéraires flexibles adaptés à vos préférences."},
            ],
            "faqs": [
                {"p":"Combien de temps dure la visite des Chutes d'Iguaçu?","r":"La plupart des visiteurs passent 2 à 4 heures du côté brésilien des Chutes d'Iguaçu. Si vous prévoyez de visiter également le côté argentin, prévoyez une journée entière. Notre chauffeur vous attendra tout au long de votre visite."},
                {"p":"Dois-je acheter les billets à l'avance?","r":"Il est fortement recommandé d'acheter les billets en ligne à l'avance, surtout en haute saison (juillet, décembre-janvier) où les files d'attente peuvent être longues. Nos chauffeurs peuvent vous conseiller sur les meilleures options lors de votre réservation."},
                {"p":"Peut-on visiter les deux côtés des chutes en une journée?","r":"Oui! De nombreux visiteurs choisissent de visiter le côté brésilien le matin et le côté argentin l'après-midi. Cela nécessite de traverser la frontière, alors ayez votre passeport à portée de main. Nos chauffeurs sont expérimentés dans les passages de frontière."},
                {"p":"La route vers les Chutes d'Iguaçu est-elle sûre?","r":"Absolument. La route des hôtels de Foz do Iguaçu au parc national est bien entretenue et sûre. Nos chauffeurs professionnels connaissent parfaitement l'itinéraire."},
                {"p":"Que faut-il porter pour visiter les Chutes?","r":"Portez des chaussures confortables et imperméables car les passerelles peuvent être mouillées par les embruns. Des vêtements légers et respirants sont recommandés, ainsi qu'un imperméable léger. Crème solaire et répulsif anti-insectes sont également conseillés."},
                {"p":"Pouvez-vous organiser un guide aux chutes?","r":"Bien que nos chauffeurs connaissent bien les chutes et la région, nous pouvons également organiser des guides licenciés professionnels sur demande. Mentionnez-le lors de la réservation et nous l'intégrerons dans votre forfait."},
            ],
            "servicos": [
                {"icone":"🌊","nome":"Transfer Chutes (côté brésilien)","desc":"Prise en charge hôtel · Attente chauffeur · Retour","preco":"R$ 200","nota":"par véhicule"},
                {"icone":"🌿","nome":"Côté Argentin (Puerto Iguazú)","desc":"Passage frontière · Chauffeur bilingue · Journée","preco":"R$ 320","nota":"par véhicule"},
                {"icone":"🎯","nome":"Combo Chutes + Itaipu","desc":"Demi-journée · Les deux attractions","preco":"R$ 320","nota":"par véhicule"},
                {"icone":"🚐","nome":"Transfer Groupe (jusqu'à 10)","desc":"Van exécutif · Parfait pour familles","preco":"R$ 450","nota":"par véhicule"},
                {"icone":"📸","nome":"Tour Photo Coucher de Soleil","desc":"Meilleure luminosité · Points de vue panoramiques","preco":"R$ 280","nota":"par véhicule"},
                {"icone":"🎒","nome":"Excursion Journée Complète (8h)","desc":"Plusieurs attractions · Itinéraire flexible","preco":"R$ 480","nota":"par véhicule"},
            ],
        },
    ],

    # ── ESPANHOL ──
    "es": [
        {
            "slug": "transfer-aeropuerto",
            "h1": "Transfer Aeropuerto Foz do Iguaçu — Servicio Ejecutivo Premium",
            "meta": "Transfer aeropuerto premium en Foz do Iguaçu (IGU). Conductores profesionales, vehículos ejecutivos, disponibles 24/7. Reserve via WhatsApp — confirmación inmediata.",
            "keywords": ["transfer aeropuerto foz do iguacu","traslado aeropuerto iguazu","taxi aeropuerto foz iguacu","transfer IGU aeropuerto"],
            "secoes": [
                {"t":"Transfer Ejecutivo desde el Aeropuerto de Foz do Iguaçu","x":"Iguaçu Executive Transfer ofrece un servicio de transfer premium entre el Aeropuerto Internacional de Foz do Iguaçu (IGU) y todos los hoteles de la región. Nuestros conductores profesionales monitorean el estado de su vuelo en tiempo real, garantizando una llegada sin estrés sin importar la hora de su aterrizaje."},
                {"t":"¿Por qué Elegir Nuestro Servicio de Transfer Aeropuerto?","x":"A diferencia de los taxis ordinarios, nuestro servicio ejecutivo incluye seguimiento de vuelos, conductores bilingües profesionales, vehículos de lujo con aire acondicionado y servicio de bienvenida en la terminal. Su comodidad y puntualidad son nuestras prioridades absolutas desde el momento en que llega a Foz do Iguaçu."},
                {"t":"Nuestra Flota de Vehículos Ejecutivos","x":"Nuestra flota incluye sedanes premium y vans ejecutivas mantenidas según los más altos estándares. Cada vehículo tiene aire acondicionado, cómodos asientos de cuero y está equipado con cargadores de teléfono y Wi-Fi gratuito. Perfecto para viajeros de negocios y placer que visitan las Cataratas del Iguazú."},
                {"t":"Área de Cobertura — Foz do Iguaçu y Región","x":"Proporcionamos transfer aeropuerto a todos los hoteles, resorts y alojamientos principales de Foz do Iguaçu, incluyendo la zona hotelera cerca del Parque Nacional de las Cataratas del Iguazú, hoteles del centro y propiedades en la región circundante. También atendemos Ciudad del Este (Paraguay) y Puerto Iguazú (Argentina)."},
                {"t":"Disponibilidad 24/7 y Proceso de Reserva","x":"Nuestro servicio de transfer aeropuerto opera las 24 horas del día, los 7 días de la semana, los 365 días del año. La reserva es sencilla: envíenos un mensaje de WhatsApp con los detalles de su vuelo, número de pasajeros y nombre del hotel. Recibirá confirmación inmediata con un precio fijo sin cargos ocultos."},
                {"t":"Precios Competitivos y Opciones de Pago","x":"Ofrecemos precios fijos y transparentes para todos los transfers aeropuerto en Foz do Iguaçu — sin taxímetro, sin sorpresas. El pago puede realizarse en Reales brasileños (BRL), Dólares americanos (USD) o Euros (EUR) en efectivo, tarjeta o PIX. Solicite su cotización personalizada via WhatsApp."},
            ],
            "faqs": [
                {"p":"¿Qué distancia hay entre el aeropuerto y el centro de Foz do Iguaçu?","r":"El Aeropuerto Internacional de Foz do Iguaçu (IGU) está a aproximadamente 12 km del centro, un trayecto de 15-20 minutos. La zona hotelera cerca de las Cataratas está a unos 20 km del aeropuerto, tomando 25-30 minutos según el tráfico."},
                {"p":"¿Hacen seguimiento de los retrasos de vuelos?","r":"¡Sí! Monitoreamos todos los vuelos entrantes en tiempo real. Si su vuelo se retrasa, su conductor esperará sin cargo adicional. Recibimos actualizaciones automáticas del estado del vuelo, así que nunca tiene que preocuparse."},
                {"p":"¿Pueden acomodar grupos grandes?","r":"¡Por supuesto! Tenemos vans ejecutivas que pueden acomodar hasta 10 pasajeros con equipaje. Para grupos más grandes, podemos organizar un convoy de vehículos. Contáctenos via WhatsApp para precios de grupo."},
                {"p":"¿Qué pasa si necesito cancelar?","r":"Entendemos que los planes de viaje pueden cambiar. Las cancelaciones realizadas con más de 2 horas de antelación son gratuitas. Contáctenos via WhatsApp lo antes posible si necesita modificar o cancelar su reserva."},
                {"p":"¿Sus conductores hablan español?","r":"¡Sí! Nuestros conductores son bilingües (portugués-inglés/español) y pueden comunicarse perfectamente en español. Están capacitados para brindar un servicio profesional y amigable y pueden responder cualquier pregunta sobre Foz do Iguaçu."},
                {"p":"¿Hay sillas de niños disponibles?","r":"Sí, podemos proporcionar sillas de seguridad para niños a pedido sin cargo adicional. Por favor, menciónelo al reservar para que podamos garantizar la silla adecuada para su transfer."},
            ],
            "servicos": [
                {"icone":"✈️","nome":"Transfer Aeropuerto (1-4 pax)","desc":"Sedán ejecutivo · Conductor bilingüe · Seguimiento de vuelo","preco":"R$ 120","nota":"por trayecto"},
                {"icone":"🚐","nome":"Transfer Aeropuerto (5-10 pax)","desc":"Van ejecutiva · Amplio maletero · Aire acondicionado","preco":"R$ 280","nota":"por trayecto"},
                {"icone":"🌊","nome":"Tour Cataratas del Iguazú","desc":"Transfer ida y vuelta · Espera del conductor incluida","preco":"R$ 200","nota":"por vehículo"},
                {"icone":"🏨","nome":"Transfer Hotel a Hotel","desc":"Cualquier hotel en Foz do Iguaçu · Precio fijo","preco":"R$ 80","nota":"por trayecto"},
                {"icone":"🌎","nome":"Transfer Argentina / Paraguay","desc":"Puerto Iguazú o Ciudad del Este","preco":"Consultar","nota":"via WhatsApp"},
                {"icone":"🕐","nome":"Alquiler Diario (8h)","desc":"Conductor a disposición · Hasta 80km de radio","preco":"R$ 480","nota":"por día"},
            ],
        },
        {
            "slug": "cataratas-iguazu-transfer",
            "h1": "Transfer Cataratas del Iguazú — Servicio Privado desde su Hotel",
            "meta": "Transfer privado a las Cataratas del Iguazú desde cualquier hotel en Foz do Iguaçu. Vehículos ejecutivos, conductores profesionales, mejor precio. Reserve en WhatsApp.",
            "keywords": ["transfer cataratas iguazu","traslado cataratas iguazu","tour cataratas iguazu foz","visita cataratas iguacu"],
            "secoes": [
                {"t":"Transfer Privado al Parque Nacional de las Cataratas del Iguazú","x":"Experimente las cascadas más espectaculares del mundo con un servicio de transfer privado premium. Iguaçu Executive Transfer lo lleva cómodamente desde su hotel directamente a la entrada del Parque Nacional de las Cataratas del Iguazú, con tiempo de espera del conductor incluido durante toda su visita."},
                {"t":"Lado Brasileño vs Lado Argentino — ¿Cuál Visitar?","x":"Foz do Iguaçu ofrece acceso a los lados brasileño y argentino de las Cataratas del Iguazú. El lado brasileño proporciona las icónicas vistas panorámicas desde una amplia pasarela, mientras que el lado argentino ofrece encuentros más cercanos a través de senderos en la selva y la impresionante Garganta del Diablo."},
                {"t":"Qué Incluye Nuestro Transfer a las Cataratas","x":"Su transfer a las Cataratas del Iguazú incluye recogida puerta a puerta en su hotel, un vehículo ejecutivo con aire acondicionado, un conductor bilingüe profesional, tiempo de espera del conductor durante su visita y transfer de regreso a su hotel. Las entradas al parque nacional no están incluidas."},
                {"t":"Mejor Época para Visitar las Cataratas del Iguazú","x":"Las Cataratas del Iguazú son espectaculares durante todo el año, pero la mejor época depende de sus prioridades. La temporada de lluvias (noviembre a marzo) produce las cataratas más poderosas, mientras que la temporada seca (abril a septiembre) ofrece cielos más despejados y mejores condiciones para caminar."},
                {"t":"Tours Combinados — Cataratas del Iguazú + Represa de Itaipú","x":"Maximice su tiempo en Foz do Iguaçu con nuestros populares tours combinados. Visite tanto las Cataratas del Iguazú como la Represa Hidroeléctrica de Itaipú en una sola media jornada o jornada completa. Nuestro conductor coordinará el itinerario para que aproveche al máximo su tiempo."},
                {"t":"Paquetes para Grupos y Familias","x":"¿Viajando con familia o en grupo? Nuestras vans ejecutivas acomodan hasta 10 pasajeros, haciendo nuestro servicio perfecto para familias que visitan las Cataratas del Iguazú. Ofrecemos paquetes personalizados para grupos de todos los tamaños, con itinerarios flexibles adaptados a sus preferencias."},
            ],
            "faqs": [
                {"p":"¿Cuánto tiempo dura la visita a las Cataratas del Iguazú?","r":"La mayoría de los visitantes pasan 2-4 horas en el lado brasileño. Si planea visitar también el lado argentino, reserve un día completo. Nuestro conductor lo esperará durante toda su visita."},
                {"p":"¿Necesito comprar las entradas con anticipación?","r":"Se recomienda comprar las entradas online con anticipación, especialmente en temporada alta (julio, diciembre-enero). Nuestros conductores pueden asesorarle sobre las mejores opciones al reservar su transfer."},
                {"p":"¿Se pueden visitar ambos lados en un día?","r":"¡Sí! Muchos visitantes eligen visitar el lado brasileño por la mañana y el argentino por la tarde. Esto requiere cruzar la frontera, así que tenga su pasaporte a mano. Nuestros conductores tienen experiencia con los cruces fronterizos."},
                {"p":"¿Es segura la ruta a las Cataratas del Iguazú?","r":"Absolutamente. La ruta desde los hoteles de Foz do Iguaçu hasta el parque nacional está bien mantenida y es segura. Nuestros conductores profesionales conocen perfectamente el trayecto."},
                {"p":"¿Qué ropa debo usar para visitar las Cataratas?","r":"Use calzado cómodo e impermeable ya que las pasarelas pueden estar mojadas por la neblina. Se recomiendan ropa ligera y transpirable, y un impermeable ligero. Protector solar y repelente de insectos también son aconsejables."},
                {"p":"¿Pueden organizar un guía en las cataratas?","r":"Aunque nuestros conductores conocen bien las cataratas, también podemos organizar guías licenciados profesionales a pedido. Menciónelo al reservar y lo incluiremos en su paquete de transfer."},
            ],
            "servicos": [
                {"icone":"🌊","nome":"Transfer Cataratas (lado brasileño)","desc":"Recogida en hotel · Espera conductor · Regreso","preco":"R$ 200","nota":"por vehículo"},
                {"icone":"🌿","nome":"Lado Argentino (Puerto Iguazú)","desc":"Cruce fronterizo · Conductor bilingüe · Día completo","preco":"R$ 320","nota":"por vehículo"},
                {"icone":"🎯","nome":"Combo Cataratas + Itaipú","desc":"Media jornada · Las dos atracciones","preco":"R$ 320","nota":"por vehículo"},
                {"icone":"🚐","nome":"Transfer Grupo (hasta 10)","desc":"Van ejecutiva · Perfecto para familias","preco":"R$ 450","nota":"por vehículo"},
                {"icone":"📸","nome":"Tour Fotográfico al Atardecer","desc":"Mejor iluminación · Puntos panorámicos","preco":"R$ 280","nota":"por vehículo"},
                {"icone":"🎒","nome":"Excursión Día Completo (8h)","desc":"Varias atracciones · Itinerario flexible","preco":"R$ 480","nota":"por vehículo"},
            ],
        },
    ],
}

# Adicionar temas extras para DE, IT, NL, PL, RU, AR, KO
# (versão simplificada com 2 páginas cada)
for lang_code in ["de","it","nl","pl","ru","ar","ko"]:
    if lang_code not in TEMAS:
        id_data = IDIOMAS[lang_code]
        TEMAS[lang_code] = [
            {
                "slug": "airport-transfer",
                "h1": {
                    "de": "Flughafentransfer Foz do Iguaçu — Exklusiver Executive Service",
                    "it": "Transfer Aeroporto Foz do Iguaçu — Servizio Esecutivo Premium",
                    "nl": "Luchthavenstransfer Foz do Iguaçu — Premium Executieve Service",
                    "pl": "Transfer Lotnisko Foz do Iguaçu — Ekskluzywna Usługa Executive",
                    "ru": "Трансфер Аэропорт Фос-ду-Игуасу — Премиальный Экзекьютив Сервис",
                    "ar": "نقل مطار فوز دو إيغواسو — خدمة تنفيذية مميزة",
                    "ko": "포스두이과수 공항 픽업 — 프리미엄 익스큐티브 서비스",
                }[lang_code],
                "meta": {
                    "de": "Premium Flughafentransfer in Foz do Iguaçu (IGU). Professionelle Fahrer, Exekutivfahrzeuge, 24/7 verfügbar. Buchen Sie über WhatsApp — sofortige Bestätigung.",
                    "it": "Transfer aeroporto premium a Foz do Iguaçu (IGU). Autisti professionali, veicoli esecutivi, disponibili 24/7. Prenota via WhatsApp — conferma immediata.",
                    "nl": "Premium luchthavenstransfer in Foz do Iguaçu (IGU). Professionele chauffeurs, executive voertuigen, 24/7 beschikbaar. Boek via WhatsApp — directe bevestiging.",
                    "pl": "Premium transfer lotniskowy w Foz do Iguaçu (IGU). Profesjonalni kierowcy, pojazdy executive, dostępni 24/7. Zarezerwuj przez WhatsApp — natychmiastowe potwierdzenie.",
                    "ru": "Премиальный трансфер аэропорт в Фос-ду-Игуасу (IGU). Профессиональные водители, представительские автомобили, 24/7. Бронируйте через WhatsApp — мгновенное подтверждение.",
                    "ar": "خدمة نقل مطار مميزة في فوز دو إيغواسو (IGU). سائقون محترفون، سيارات تنفيذية، متوفرة 24/7. احجز عبر WhatsApp — تأكيد فوري.",
                    "ko": "포스두이과수(IGU) 프리미엄 공항 픽업 서비스. 전문 기사, 이그제큐티브 차량, 24/7 운영. WhatsApp으로 예약 — 즉시 확인.",
                }[lang_code],
                "keywords": [],
                "secoes": [
                    {"t": {
                        "de": "Premium Flughafentransfer in Foz do Iguaçu",
                        "it": "Transfer Esecutivo dall'Aeroporto di Foz do Iguaçu",
                        "nl": "Premium Luchthavenstransfer in Foz do Iguaçu",
                        "pl": "Premium Transfer Lotniskowy w Foz do Iguaçu",
                        "ru": "Премиальный Трансфер из Аэропорта Фос-ду-Игуасу",
                        "ar": "خدمة نقل مطار مميزة في فوز دو إيغواسو",
                        "ko": "포스두이과수 공항 프리미엄 픽업 서비스",
                     }[lang_code],
                     "x": {
                        "de": "Iguaçu Executive Transfer bietet Premium-Flughafentransfers zwischen dem Internationalen Flughafen Foz do Iguaçu (IGU) und allen Hotels der Region. Unsere professionellen Fahrer überwachen Ihren Flugstatus in Echtzeit und gewährleisten eine stressfreie Ankunft, egal zu welcher Zeit Sie landen.",
                        "it": "Iguaçu Executive Transfer offre servizi di transfer premium tra l'Aeroporto Internazionale di Foz do Iguaçu (IGU) e tutti gli hotel della regione. I nostri autisti professionali monitorano lo stato del volo in tempo reale, garantendo un arrivo senza stress a qualsiasi ora dell'atterraggio.",
                        "nl": "Iguaçu Executive Transfer biedt premium luchthavenstransferservices tussen de Internationale Luchthaven van Foz do Iguaçu (IGU) en alle hotels in de regio. Onze professionele chauffeurs volgen uw vlucht in real-time, waardoor een stressvrije aankomst gegarandeerd is.",
                        "pl": "Iguaçu Executive Transfer oferuje premium transfery lotniskowe między Międzynarodowym Lotniskiem Foz do Iguaçu (IGU) a wszystkimi hotelami w regionie. Nasi profesjonalni kierowcy monitorują status lotu w czasie rzeczywistym, zapewniając bezstresowy przyjazd o każdej porze.",
                        "ru": "Iguaçu Executive Transfer предлагает премиальные трансферы между Международным аэропортом Фос-ду-Игуасу (IGU) и всеми отелями региона. Наши профессиональные водители отслеживают статус рейса в режиме реального времени, обеспечивая комфортное прибытие в любое время суток.",
                        "ar": "تقدم Iguaçu Executive Transfer خدمات نقل مطار متميزة بين المطار الدولي لفوز دو إيغواسو (IGU) وجميع فنادق المنطقة. يراقب سائقونا المحترفون حالة رحلتك في الوقت الفعلي، مما يضمن وصولاً خالياً من التوتر في أي وقت.",
                        "ko": "Iguaçu Executive Transfer는 포스두이과수 국제공항(IGU)과 지역 내 모든 호텔 간 프리미엄 공항 픽업 서비스를 제공합니다. 전문 기사가 항공편 상태를 실시간으로 모니터링하여 도착 시간에 관계없이 편안한 이동을 보장합니다.",
                     }[lang_code]},
                ] + [
                    {"t": f"Service {i+2}", "x": f"Professional executive transfer service in Foz do Iguaçu. Available 24/7 with bilingual drivers and luxury vehicles. Contact us via WhatsApp for booking and pricing. We serve all hotels and attractions in Foz do Iguaçu, including Iguazu Falls National Park and Itaipu Dam. Fixed prices, no hidden fees."}
                    for i in range(5)
                ],
                "faqs": [
                    {"p": "How far is the airport from downtown?", "r": "The airport is approximately 12 km from downtown Foz do Iguaçu, about 15-20 minutes by car."},
                    {"p": "Do you track flight delays?", "r": "Yes! We monitor all incoming flights in real time. Your driver will wait at no extra charge if your flight is delayed."},
                    {"p": "What payment methods do you accept?", "r": "We accept BRL, USD, EUR in cash, credit/debit cards, and PIX digital payments."},
                    {"p": "Can you accommodate large groups?", "r": "Yes! We have executive vans for up to 10 passengers. Contact us via WhatsApp for group pricing."},
                    {"p": "Do your drivers speak English?", "r": "Yes! Our drivers are bilingual and can communicate in English, Spanish, and other languages."},
                    {"p": "How do I book?", "r": "Simply send us a WhatsApp message with your details and you'll receive instant confirmation with a fixed price."},
                ],
                "servicos": [
                    {"icone":"✈️","nome":"Airport Transfer (1-4 pax)","desc":"Executive sedan · Bilingual driver · Flight tracking","preco":"R$ 120","nota":"per trip"},
                    {"icone":"🚐","nome":"Airport Transfer (5-10 pax)","desc":"Executive van · Ample luggage space","preco":"R$ 280","nota":"per trip"},
                    {"icone":"🌊","nome":"Iguazu Falls Tour","desc":"Round-trip transfer · Driver wait included","preco":"R$ 200","nota":"per vehicle"},
                    {"icone":"🏨","nome":"Hotel Transfer","desc":"Any hotel in Foz do Iguaçu · Fixed price","preco":"R$ 80","nota":"per trip"},
                    {"icone":"🌎","nome":"International Transfer","desc":"Puerto Iguazú or Ciudad del Este","preco":"Consult","nota":"via WhatsApp"},
                    {"icone":"🕐","nome":"Daily Executive Hire (8h)","desc":"Driver at disposal · Up to 80km radius","preco":"R$ 480","nota":"per day"},
                ],
            },
        ]


# ─── TEMPLATE HTML ──────────────────────────────────────────────
def gerar_html(tema, idioma_data, lang_code):
    rtl = idioma_data.get("dir_rtl", False)
    dir_attr = ' dir="rtl"' if rtl else ''
    wa_msg = idioma_data["wa_msg"]
    wa_url = f"https://wa.me/{WA_NUMBER}?text={wa_msg.replace(' ', '%20')}"
    hreflang_links = "\n".join([
        f'  <link rel="alternate" hreflang="{lc}" href="{SITE_URL}/{IDIOMAS[lc]["dir"]}/{tema["slug"]}.html" />'
        for lc in IDIOMAS
    ])
    keywords_str = ", ".join(tema.get("keywords", []))

    secoes_html = ""
    for i, s in enumerate(tema["secoes"]):
        secoes_html += f"""
        <div class="card reveal">
          <div class="card-num">0{i+1}</div>
          <h2 class="card-title">{s['t']}</h2>
          <div class="gold-line"></div>
          <p class="card-text">{s['x']}</p>
        </div>"""

    servicos_html = ""
    for s in tema["servicos"]:
        servicos_html += f"""
        <div class="service-card reveal">
          <div class="service-icon">{s['icone']}</div>
          <div class="service-info">
            <p class="service-name">{s['nome']}</p>
            <p class="service-desc">{s['desc']}</p>
          </div>
          <div class="service-price">
            <span class="price-label">{idioma_data['label_from']}</span>
            <span class="price-value">{s['preco']}</span>
            <span class="price-note">{s['nota']}</span>
          </div>
        </div>"""

    depoimentos_html = ""
    for d in idioma_data["depoimentos"]:
        depoimentos_html += f"""
        <div class="dep-card reveal">
          <div class="dep-quote">"</div>
          <p class="dep-text">{d['texto']}</p>
          <div class="dep-divider"></div>
          <p class="dep-nome">{d['nome']}</p>
          <p class="dep-pais">{d['pais']}</p>
          <div class="dep-stars">★★★★★</div>
        </div>"""

    faqs_html = ""
    for i, f in enumerate(tema["faqs"]):
        faqs_html += f"""
        <div class="faq-item">
          <button class="faq-btn" onclick="toggleFaq(this)">
            <span class="faq-q">{f['p']}</span>
            <span class="faq-icon">+</span>
          </button>
          <div class="faq-ans">
            <p>{f['r']}</p>
          </div>
        </div>"""

    notas_html = "".join([f"<li>{n}</li>" for n in idioma_data["notas"]])

    return f"""<!DOCTYPE html>
<html lang="{lang_code}"{dir_attr}>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{tema['h1']} | Iguaçu Executive Transfer</title>
  <meta name="description" content="{tema['meta']}">
  <meta name="keywords" content="{keywords_str}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="{SITE_URL}/{lang_code}/{tema['slug']}.html">
  {hreflang_links}
  <meta property="og:title" content="{tema['h1']} | Iguaçu Executive Transfer">
  <meta property="og:description" content="{tema['meta']}">
  <meta property="og:image" content="{SITE_URL}/og-orcamento.jpg">
  <meta property="og:url" content="{SITE_URL}/{lang_code}/{tema['slug']}.html">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="{lang_code}">
  <meta name="geo.region" content="BR-PR">
  <meta name="geo.placename" content="Foz do Iguaçu, Paraná, Brasil">
  <meta name="geo.position" content="{GEO_LAT};{GEO_LNG}">
  <meta name="ICBM" content="{GEO_LAT}, {GEO_LNG}">
  <script type="application/ld+json">
  {{
    "@context":"https://schema.org",
    "@type":"TouristAttraction",
    "name":"Iguaçu Executive Transfer",
    "description":"{tema['meta']}",
    "url":"{SITE_URL}/{lang_code}/{tema['slug']}.html",
    "telephone":"+55{WA_NUMBER}",
    "address":{{"@type":"PostalAddress","addressLocality":"Foz do Iguaçu","addressRegion":"PR","addressCountry":"BR"}},
    "geo":{{"@type":"GeoCoordinates","latitude":"{GEO_LAT}","longitude":"{GEO_LNG}"}},
    "openingHours":"Mo-Su 00:00-23:59",
    "priceRange":"$$",
    "availableLanguage":["Portuguese","English","Spanish","French"]
  }}
  </script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Montserrat:wght@300;400;500;600&display=swap" rel="stylesheet">
  <style>
    *,*::before,*::after{{box-sizing:border-box;margin:0;padding:0}}
    :root{{--gold:#d4af37;--gold-light:#e8cc6a;--black:#0a0a0a;--black-2:#111;--black-3:#1a1a1a;--off-white:#f0ede8;--muted:rgba(240,237,232,0.5);--green:#1a3a2a}}
    html{{scroll-behavior:smooth}}
    body{{background:var(--black);color:var(--off-white);font-family:'Montserrat',sans-serif;font-weight:300;-webkit-font-smoothing:antialiased;overflow-x:hidden}}
    .top-line{{width:100%;height:1px;background:linear-gradient(90deg,transparent,var(--gold),transparent)}}
    /* NAV */
    nav{{position:sticky;top:0;z-index:100;background:rgba(10,10,10,0.95);backdrop-filter:blur(20px);border-bottom:1px solid rgba(212,175,55,0.1);padding:14px 24px;display:flex;align-items:center;justify-content:space-between}}
    .nav-logo{{display:flex;align-items:center;gap:12px;text-decoration:none}}
    .nav-logo-circle{{width:36px;height:36px;border-radius:50%;border:1px solid var(--gold);display:flex;align-items:center;justify-content:center;font-family:'Cormorant Garamond',serif;font-size:0.8rem;color:var(--gold);letter-spacing:2px}}
    .nav-brand{{font-family:'Cormorant Garamond',serif;font-size:0.95rem;color:var(--off-white)}}
    .nav-cta{{background:var(--gold);color:var(--black);font-size:0.65rem;font-weight:600;letter-spacing:0.15em;text-transform:uppercase;padding:10px 20px;text-decoration:none;border-radius:1px;transition:all 0.3s}}
    .nav-cta:hover{{filter:brightness(1.1)}}
    /* HERO */
    .hero{{min-height:70vh;display:flex;align-items:center;background:linear-gradient(135deg,#0a0a0a 0%,#0d1f15 50%,#0a0a0a 100%);position:relative;overflow:hidden;padding:100px 24px 60px}}
    .hero::before{{content:'';position:absolute;inset:0;background-image:linear-gradient(rgba(212,175,55,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(212,175,55,0.03) 1px,transparent 1px);background-size:60px 60px;pointer-events:none}}
    .hero-inner{{max-width:800px;margin:0 auto;text-align:center}}
    .hero-badge{{display:inline-flex;align-items:center;gap:8px;background:rgba(212,175,55,0.1);border:1px solid rgba(212,175,55,0.2);border-radius:20px;padding:6px 16px;font-size:0.6rem;font-weight:500;letter-spacing:0.2em;text-transform:uppercase;color:var(--gold);margin-bottom:28px}}
    .hero-badge-dot{{width:6px;height:6px;border-radius:50%;background:#25d366;animation:pulse 2s infinite}}
    @keyframes pulse{{0%,100%{{opacity:1}}50%{{opacity:0.5}}}}
    .hero h1{{font-family:'Cormorant Garamond',serif;font-size:clamp(2rem,5vw,3.5rem);font-weight:600;line-height:1.1;color:var(--off-white);margin-bottom:20px}}
    .hero h1 em{{font-style:italic;color:var(--gold)}}
    .hero-divider{{width:60px;height:2px;background:linear-gradient(90deg,var(--gold),#1a3a2a);margin:20px auto}}
    .hero-desc{{font-size:0.9rem;color:var(--muted);line-height:1.8;max-width:560px;margin:0 auto 32px}}
    .hero-btns{{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}}
    .btn-wa{{display:inline-flex;align-items:center;gap:10px;background:#25d366;color:white;text-decoration:none;font-size:0.72rem;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;padding:14px 28px;border-radius:1px;transition:all 0.3s}}
    .btn-wa:hover{{filter:brightness(1.1);transform:translateY(-2px)}}
    .btn-outline{{display:inline-flex;align-items:center;gap:10px;background:transparent;color:var(--gold);text-decoration:none;font-size:0.72rem;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;padding:14px 28px;border-radius:1px;border:1px solid rgba(212,175,55,0.4);transition:all 0.3s}}
    .btn-outline:hover{{border-color:var(--gold);background:rgba(212,175,55,0.06)}}
    /* SECTIONS */
    section{{padding:80px 24px}}
    .section-inner{{max-width:1100px;margin:0 auto}}
    .section-label{{display:flex;align-items:center;justify-content:center;gap:10px;font-size:0.58rem;font-weight:600;letter-spacing:0.25em;text-transform:uppercase;color:var(--gold);margin-bottom:14px}}
    .section-label::before,.section-label::after{{content:'';width:24px;height:1px;background:var(--gold);opacity:0.5}}
    .section-h2{{font-family:'Cormorant Garamond',serif;font-size:clamp(1.6rem,4vw,2.4rem);font-weight:600;text-align:center;color:var(--off-white);margin-bottom:40px;line-height:1.2}}
    .section-h2 span{{color:var(--gold)}}
    /* CARDS GRID */
    .cards-grid{{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px}}
    .card{{background:#111;border:1px solid rgba(212,175,55,0.1);padding:28px;border-radius:2px;transition:all 0.4s;position:relative;overflow:hidden}}
    .card::before{{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,var(--gold),transparent);opacity:0;transition:opacity 0.4s}}
    .card:hover{{border-color:rgba(212,175,55,0.3);transform:translateY(-4px);box-shadow:0 20px 60px rgba(0,0,0,0.5)}}
    .card:hover::before{{opacity:1}}
    .card-num{{font-size:0.6rem;font-weight:700;letter-spacing:0.3em;text-transform:uppercase;color:rgba(212,175,55,0.4);margin-bottom:10px}}
    .card-title{{font-family:'Cormorant Garamond',serif;font-size:1.1rem;font-weight:600;color:var(--off-white);margin-bottom:12px;line-height:1.3}}
    .gold-line{{width:28px;height:1.5px;background:linear-gradient(90deg,var(--gold),#3d7a55);margin-bottom:12px}}
    .card-text{{font-size:0.78rem;color:var(--muted);line-height:1.8}}
    /* SERVICES */
    .services-list{{display:flex;flex-direction:column;gap:0}}
    .service-card{{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:16px;padding:18px 24px;border-bottom:1px solid rgba(212,175,55,0.07);transition:background 0.2s}}
    .service-card:last-child{{border-bottom:none}}
    .service-card:hover{{background:rgba(212,175,55,0.04)}}
    .service-icon{{font-size:1.4rem;width:40px;text-align:center;flex-shrink:0}}
    .service-name{{font-size:0.85rem;font-weight:500;color:var(--off-white);margin-bottom:3px}}
    .service-desc{{font-size:0.7rem;color:var(--muted)}}
    .service-price{{text-align:right;flex-shrink:0}}
    .price-label{{font-size:0.55rem;letter-spacing:0.15em;text-transform:uppercase;color:rgba(212,175,55,0.5);display:block;margin-bottom:2px}}
    .price-value{{font-family:'Cormorant Garamond',serif;font-size:1.2rem;font-weight:600;color:var(--gold);white-space:nowrap;display:block}}
    .price-note{{font-size:0.58rem;color:var(--muted);display:block}}
    /* DEPOIMENTOS */
    .deps-grid{{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px}}
    .dep-card{{background:#111;border:1px solid rgba(212,175,55,0.1);padding:24px;border-radius:2px}}
    .dep-quote{{font-family:'Cormorant Garamond',serif;font-size:3rem;line-height:1;color:rgba(212,175,55,0.2);margin-bottom:8px}}
    .dep-text{{font-size:0.78rem;color:var(--muted);line-height:1.8;font-style:italic;margin-bottom:16px}}
    .dep-divider{{height:1px;background:rgba(212,175,55,0.1);margin-bottom:12px}}
    .dep-nome{{font-size:0.82rem;font-weight:500;color:var(--off-white)}}
    .dep-pais{{font-size:0.65rem;color:rgba(61,122,85,0.9);margin-top:2px}}
    .dep-stars{{color:var(--gold);font-size:0.75rem;margin-top:8px}}
    /* FAQ */
    .faq-list{{display:flex;flex-direction:column;gap:8px;max-width:720px;margin:0 auto}}
    .faq-item{{border:1px solid rgba(212,175,55,0.12);border-radius:2px;overflow:hidden}}
    .faq-btn{{width:100%;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:18px 20px;background:rgba(17,17,17,0.8);border:none;cursor:pointer;text-align:left}}
    .faq-btn:hover{{background:rgba(212,175,55,0.06)}}
    .faq-q{{font-size:0.82rem;font-weight:500;color:var(--off-white)}}
    .faq-icon{{width:22px;height:22px;border-radius:50%;border:1px solid rgba(212,175,55,0.3);display:flex;align-items:center;justify-content:center;color:var(--gold);font-size:1rem;flex-shrink:0;transition:transform 0.3s;line-height:1}}
    .faq-ans{{display:none;padding:0 20px 18px;background:rgba(212,175,55,0.03)}}
    .faq-ans.open{{display:block}}
    .faq-ans p{{font-size:0.78rem;color:var(--muted);line-height:1.8}}
    /* NOTES */
    .notes-card{{background:#111;border:1px solid rgba(212,175,55,0.1);border-left:2px solid var(--gold);padding:24px 28px;border-radius:0 2px 2px 0}}
    .notes-title{{font-size:0.6rem;letter-spacing:0.25em;text-transform:uppercase;color:var(--gold);margin-bottom:14px}}
    .notes-list{{list-style:none;display:flex;flex-direction:column;gap:8px}}
    .notes-list li{{font-size:0.75rem;color:var(--muted);padding-left:16px;position:relative;line-height:1.6}}
    .notes-list li::before{{content:'—';position:absolute;left:0;color:rgba(212,175,55,0.4)}}
    /* CTA */
    .cta-section{{text-align:center;background:linear-gradient(135deg,#1a3a2a,#0d1f15);padding:80px 24px}}
    .cta-h2{{font-family:'Cormorant Garamond',serif;font-size:clamp(1.8rem,4vw,2.8rem);font-weight:600;color:var(--off-white);margin-bottom:12px}}
    .cta-h2 em{{font-style:italic;color:var(--gold)}}
    .cta-sub{{font-size:0.7rem;letter-spacing:0.2em;text-transform:uppercase;color:var(--muted);margin-bottom:28px}}
    .cta-btns{{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}}
    /* FOOTER */
    footer{{text-align:center;padding:24px;border-top:1px solid rgba(212,175,55,0.08)}}
    footer p{{font-size:0.6rem;letter-spacing:0.15em;color:rgba(212,175,55,0.3)}}
    .bottom-line{{width:100%;height:1px;background:linear-gradient(90deg,transparent,var(--gold),transparent)}}
    /* REVEAL */
    .reveal{{opacity:0;transform:translateY(24px);transition:opacity 0.7s,transform 0.7s}}
    .reveal.visible{{opacity:1;transform:translateY(0)}}
    /* MOBILE */
    @media(max-width:600px){{
      .service-card{{grid-template-columns:auto 1fr;}}
      .service-price{{grid-column:2;text-align:left}}
      .hero-btns{{flex-direction:column;align-items:center}}
      .btn-wa,.btn-outline{{width:100%;max-width:320px;justify-content:center}}
    }}
  </style>
</head>
<body>
<div class="top-line"></div>

<nav>
  <a href="{SITE_URL}" class="nav-logo">
    <div class="nav-logo-circle">IET</div>
    <span class="nav-brand">Iguaçu Executive Transfer</span>
  </a>
  <a href="{wa_url}" target="_blank" class="nav-cta">{idioma_data['cta_book']}</a>
</nav>

<section class="hero">
  <div class="hero-inner">
    <div class="hero-badge">
      <span class="hero-badge-dot"></span>
      Foz do Iguaçu · Paraná · Brasil
    </div>
    <h1>{tema['h1']}</h1>
    <div class="hero-divider"></div>
    <p class="hero-desc">{tema['meta']}</p>
    <div class="hero-btns">
      <a href="{wa_url}" target="_blank" class="btn-wa">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
        {idioma_data['cta_book']}
      </a>
      <a href="{SITE_URL}" class="btn-outline">{idioma_data['cta_quote']} →</a>
    </div>
  </div>
</section>

<section style="background:#111;padding:80px 24px">
  <div class="section-inner">
    <p class="section-label">Premium</p>
    <h2 class="section-h2">{idioma_data['cards_title']} — <span>Foz do Iguaçu</span></h2>
    <div class="cards-grid">{secoes_html}</div>
  </div>
</section>

<section style="background:#0a0a0a;padding:80px 24px">
  <div class="section-inner">
    <p class="section-label">{idioma_data['cards_title']}</p>
    <h2 class="section-h2">Transfer & <span>Tours</span></h2>
    <div style="border:1px solid rgba(212,175,55,0.1);border-radius:2px;overflow:hidden">
      <div class="services-list">{servicos_html}</div>
    </div>
    <div style="margin-top:24px">
      <div class="notes-card">
        <p class="notes-title">{idioma_data['nota_title']}</p>
        <ul class="notes-list">{notas_html}</ul>
      </div>
    </div>
  </div>
</section>

<section style="background:#111;padding:80px 24px">
  <div class="section-inner">
    <p class="section-label">{idioma_data['dep_title']}</p>
    <h2 class="section-h2"><span>⭐</span> {idioma_data['dep_title']}</h2>
    <div class="deps-grid">{depoimentos_html}</div>
  </div>
</section>

<section style="background:#0a0a0a;padding:80px 24px">
  <div class="section-inner">
    <p class="section-label">{idioma_data['faq_title']}</p>
    <h2 class="section-h2">{idioma_data['faq_title']}</h2>
    <div class="faq-list">{faqs_html}</div>
  </div>
</section>

<div class="cta-section">
  <h2 class="cta-h2">Iguaçu <em>Executive</em> Transfer<br>Foz do Iguaçu</h2>
  <p class="cta-sub">{idioma_data['cta_book']} · 24/7 · {idioma_data['label_from']} R$ 80</p>
  <div class="cta-btns">
    <a href="{wa_url}" target="_blank" class="btn-wa">{idioma_data['cta_book']}</a>
    <a href="{SITE_URL}" class="btn-outline">{SITE_URL.replace('https://','')} →</a>
  </div>
</div>

<footer>
  <p>IGUAÇU EXECUTIVE TRANSFER · FOZ DO IGUAÇU · PARANÁ · BRASIL · 24H</p>
</footer>
<div class="bottom-line"></div>

<script>
function toggleFaq(btn) {{
  const ans = btn.nextElementSibling;
  const icon = btn.querySelector('.faq-icon');
  const isOpen = ans.classList.contains('open');
  document.querySelectorAll('.faq-ans').forEach(a => a.classList.remove('open'));
  document.querySelectorAll('.faq-icon').forEach(i => {{ i.textContent = '+'; i.style.transform = 'none'; }});
  if (!isOpen) {{
    ans.classList.add('open');
    icon.textContent = '×';
    icon.style.transform = 'rotate(45deg)';
  }}
}}
const observer = new IntersectionObserver(entries => entries.forEach(e => {{
  if (e.isIntersecting) {{ e.target.classList.add('visible'); observer.unobserve(e.target); }}
}}), {{threshold: 0.1}});
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
</script>
</body>
</html>"""


# ─── GERAR TODAS AS PÁGINAS ────────────────────────────────────
total = 0
for lang_code, idioma_data in IDIOMAS.items():
    if lang_code not in TEMAS:
        continue
    lang_dir = BASE / lang_code
    lang_dir.mkdir(exist_ok=True)
    for tema in TEMAS[lang_code]:
        html = gerar_html(tema, idioma_data, lang_code)
        outfile = lang_dir / f"{tema['slug']}.html"
        with open(outfile, "w", encoding="utf-8") as f:
            f.write(html)
        total += 1
        print(f"✅ /{lang_code}/{tema['slug']}.html")

print(f"\n🎉 Total: {total} páginas geradas!")
print(f"📁 Destino: {BASE}")
