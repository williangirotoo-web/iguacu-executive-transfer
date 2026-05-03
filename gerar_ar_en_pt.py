#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Gerador páginas EN + PT sobre Puerto Iguazú / Misiones
Pastas: /ar-en/ e /ar-pt/
Canonical único por página, hreflang cruzado entre idiomas
"""

import os
from pathlib import Path

BASE = Path(os.path.expanduser("~/Documents/iguacu-site"))
WA_NUMBER = "5545999164059"
SITE_URL = "https://iguacuexecutivetransfer.com.br"

# ─── PÁGINAS INGLÊS (/ar-en/) ──────────────────────────────────
PAGINAS_EN = [
  {
    "slug": "taxi-puerto-iguazu-argentina",
    "h1": "Taxi in Puerto Iguazú Argentina — Executive Transfer Service",
    "title": "Taxi Puerto Iguazú Argentina | Executive Transfer | Iguaçu Executive Transfer",
    "meta": "Professional taxi service in Puerto Iguazú, Misiones, Argentina. Bilingual drivers, fixed price, 24/7. Transfer to Iguazu Falls, Foz do Iguaçu airport and hotels. Book on WhatsApp.",
    "keywords": ["taxi puerto iguazu argentina","transfer puerto iguazu english","taxi iguazu argentina","executive transfer puerto iguazu"],
    "hashtags": ["#TaxiPuertoIguazu","#PuertoIguazuArgentina","#IguazuFalls","#IguacuTransfer","#Misiones","#ArgentinaTaxi","#IguazuTransfer"],
    "secoes": [
      {"t":"Professional Taxi Service in Puerto Iguazú, Argentina","x":"Iguaçu Executive Transfer offers premium taxi and transfer services in Puerto Iguazú, Misiones, Argentina. Our bilingual drivers (Spanish, Portuguese and English) know the entire trinational region perfectly: Puerto Iguazú, Foz do Iguaçu and Ciudad del Este. Available 24 hours a day, 7 days a week with fixed pricing confirmed by WhatsApp before every trip."},
      {"t":"From Puerto Iguazú to Foz do Iguaçu — Cross-Border Transfer","x":"The border crossing between Puerto Iguazú, Argentina and Foz do Iguaçu, Brazil takes just 15-30 minutes via the Tancredo Neves International Bridge. Our drivers handle this crossing daily and know exactly how to minimize waiting times at both immigration posts. Fixed price, bilingual driver, stress-free border experience for international tourists."},
      {"t":"Taxi from Puerto Iguazú to Foz do Iguaçu Airport (IGU)","x":"The closest international airport to Puerto Iguazú is the Foz do Iguaçu International Airport (IGU) in Brazil, just 30km away. Iguaçu Executive Transfer offers direct transfers between Puerto Iguazú hotels and IGU airport with real-time flight tracking, driver waiting at no extra charge for delays, and fixed price agreed by WhatsApp before travel."},
      {"t":"Iguazu Falls — Both Sides, One Transfer Company","x":"Visit both sides of Iguazu Falls with a single trusted transfer company. Iguaçu Executive Transfer covers the Argentine side (Parque Nacional Iguazú) and the Brazilian side (Parque Nacional do Iguaçu) from any hotel in Puerto Iguazú or Foz do Iguaçu. Bilingual drivers, waiting time included, return transfer when you're ready."},
      {"t":"Hotels in Puerto Iguazú — We Know Every Address","x":"Our drivers know all hotels in Puerto Iguazú: Sheraton Iguazú Resort & Spa, Loi Suites Iguazú Hotel, Panoramic Hotel, Iguazú Grand Resort & Spa, Saint George Hotel and dozens of boutique posadas. From any hotel in Puerto Iguazú to the airport, falls or any destination — fixed price, professional service."},
      {"t":"Fixed Price, No Meters — Book by WhatsApp","x":"Unlike local taxis with meters and unpredictable fares, Iguaçu Executive Transfer provides fixed pricing confirmed before every trip. Send a WhatsApp message with your hotel, destination, date, time and number of passengers. Receive instant confirmation with a fixed price in ARS, BRL, USD or EUR. No surprises, no negotiations on arrival."},
    ],
    "faqs": [
      {"p":"How far is Puerto Iguazú from Foz do Iguaçu airport?","r":"Puerto Iguazú is approximately 30km from Foz do Iguaçu International Airport (IGU), taking 40-60 minutes including the border crossing at Tancredo Neves Bridge. Our drivers know the best times to cross with minimal waiting."},
      {"p":"Do your drivers speak English in Puerto Iguazú?","r":"Yes! All our drivers are bilingual and speak English, Spanish and Portuguese fluently. No language barriers for international tourists visiting Puerto Iguazú and the Iguazu Falls region."},
      {"p":"What documents do I need to cross from Puerto Iguazú to Brazil?","r":"Mercosur citizens (Argentina, Brazil, Uruguay, Paraguay) can cross with their national ID. Other nationalities require a valid passport. Our driver will guide you through every step of the border crossing."},
      {"p":"Does the taxi service operate at night in Puerto Iguazú?","r":"Yes, we operate 24 hours a day, 7 days a week including late nights and early mornings. A 20% surcharge applies between 10PM and 6AM. Book in advance via WhatsApp."},
      {"p":"Do you accept US dollars or euros in Puerto Iguazú?","r":"Yes! We accept Argentine Pesos (ARS), Brazilian Reais (BRL), US Dollars (USD) and Euros (EUR) in cash, plus credit cards and PIX digital payment."},
      {"p":"Can I book a taxi in Puerto Iguazú in advance?","r":"Absolutely! We recommend booking at least 2 hours in advance. For airport pickups, please share your flight number. Send a WhatsApp message anytime and receive instant confirmation with a fixed price."},
    ],
    "depoimentos": [
      {"nome":"James and Emily Watson","cidade":"London, UK","texto":"We used Iguaçu Executive Transfer for our entire stay in Puerto Iguazú. The driver was punctual, spoke excellent English and knew every detail about the falls, border crossing and local attractions. Absolutely the best taxi service in the Iguazu region!"},
      {"nome":"Michael O'Brien","cidade":"New York, USA","texto":"Arrived at Foz do Iguaçu airport late at night and needed transfer to my hotel in Puerto Iguazú. The driver was waiting with my name sign, helped with luggage and crossed the border effortlessly. Fixed price agreed beforehand — no surprises. Highly recommend!"},
      {"nome":"Sophie and Thomas Müller","cidade":"Berlin, Germany","texto":"Booked via WhatsApp from Germany before our trip. Driver was perfect — on time, bilingual, helped with border paperwork and gave us great tips about both sides of the falls. Best transfer experience in Argentina!"},
    ],
  },
  {
    "slug": "iguazu-falls-transfer-argentina",
    "h1": "Iguazu Falls Transfer Argentina — Private Tour from Your Hotel",
    "title": "Iguazu Falls Transfer Argentina | Private Tour | Iguaçu Executive Transfer",
    "meta": "Private transfer to Iguazu Falls Argentina from Puerto Iguazú hotels. Driver waits during visit, fixed price, bilingual. Also covers Brazilian side. Book on WhatsApp.",
    "keywords": ["iguazu falls transfer argentina","private transfer iguazu falls","taxi iguazu falls argentina","tour iguazu falls private"],
    "hashtags": ["#IguazuFallsTransfer","#IguazuFalls","#ArgentinaTransfer","#PuertoIguazu","#IguacuTransfer","#PrivateTour","#Misiones"],
    "secoes": [
      {"t":"Private Transfer to Iguazu Falls, Argentina — The UNESCO Wonder","x":"Iguazu Falls, declared a UNESCO World Heritage Site and one of the Seven Natural Wonders of the World, is best experienced with a private transfer. Iguaçu Executive Transfer provides door-to-door service from any hotel in Puerto Iguazú directly to the entrance of Parque Nacional Iguazú, with driver waiting throughout your visit and return transfer included."},
      {"t":"Argentine Side vs Brazilian Side — Which is Better?","x":"Both sides of Iguazu Falls offer completely different experiences. The Argentine side (Parque Nacional Iguazú) features closer waterfall encounters, jungle trails, the Devil's Throat (Garganta del Diablo) from above and the ecological train. The Brazilian side (Parque Nacional do Iguaçu) offers iconic panoramic views. Iguaçu Executive Transfer covers both sides from Puerto Iguazú or Foz do Iguaçu."},
      {"t":"Devil's Throat — The Crown Jewel of Argentine Iguazu","x":"The Garganta del Diablo (Devil's Throat) is the most spectacular viewpoint in the entire Iguazu Falls system. From the Argentine side, visitors walk along a raised walkway directly above this 80-meter-high, 700-meter-wide cascade. The roar, the spray and the sheer power of the water make it one of the most unforgettable natural experiences on Earth. Our transfer gets you there first thing in the morning."},
      {"t":"Best Time to Visit Iguazu Falls from Puerto Iguazú","x":"The best time to visit Iguazu Falls from Puerto Iguazú is early morning (park opens at 8am). Arrive before 9am to experience the falls with fewer crowds and better photographic light. Iguaçu Executive Transfer offers early morning pickups from any hotel in Puerto Iguazú to get you to the park entrance before the tour buses arrive."},
      {"t":"Both Sides in One Day — Argentine and Brazilian Falls","x":"Many visitors choose to see both sides of Iguazu Falls in a single day. Iguaçu Executive Transfer organizes the full day itinerary: Argentine side in the morning (4-5 hours) and Brazilian side in the afternoon (2-3 hours). Border crossing between the two parks is smooth with our experienced drivers. One fixed price for the complete experience."},
      {"t":"Book Your Iguazu Falls Transfer on WhatsApp","x":"Book your private transfer to Iguazu Falls Argentina via WhatsApp: send your hotel name in Puerto Iguazú, preferred departure time, number of passengers and whether you want to visit just the Argentine side or both sides. Receive instant confirmation with a fixed price. Payment in ARS, BRL, USD or EUR. Available 7 days a week including holidays."},
    ],
    "faqs": [
      {"p":"How long should I spend at Iguazu Falls Argentine side?","r":"Plan at least 4-5 hours for the Argentine side to comfortably visit the Upper Circuit, Lower Circuit and Devil's Throat. If you want to add the ecological train or additional trails, allow a full day. Our driver waits as long as you need."},
      {"p":"Do I need to buy tickets to Iguazu Falls in advance?","r":"We strongly recommend buying tickets online in advance at the official park website, especially during peak season (July, January, Easter). Our driver can advise on the ticket purchase process when you book."},
      {"p":"Can I see both sides of Iguazu Falls in one day?","r":"Yes! It's possible and many tourists do it. We recommend starting with the Argentine side (larger park) in the morning and the Brazilian side in the afternoon. Our drivers coordinate the entire day efficiently."},
      {"p":"What should I wear to Iguazu Falls Argentina?","r":"Wear comfortable waterproof shoes as walkways can be wet from spray. Light breathable clothing, sunscreen and insect repellent are recommended. A light waterproof jacket is useful near the Devil's Throat."},
      {"p":"Is the Iguazu Falls transfer available every day?","r":"Yes! The Argentine national park is open every day of the year and our transfer service operates 7 days a week including Argentine national holidays."},
      {"p":"What is the price of transfer from Puerto Iguazú to the falls?","r":"Prices vary by departure point and group size. Contact us on WhatsApp for an immediate fixed price quote. We accept ARS, BRL, USD and EUR."},
    ],
    "depoimentos": [
      {"nome":"Sarah and David Chen","cidade":"San Francisco, USA","texto":"The private transfer to Iguazu Falls was perfect. Our driver picked us up at our Puerto Iguazú hotel, gave us amazing tips about the best viewpoints and waited 5 hours while we explored. Worth every penny for the convenience and local knowledge!"},
      {"nome":"Charlotte Dupont","cidade":"Paris, France","texto":"Notre chauffeur était parfait — ponctuel, parlait français et connaissait chaque recoin du parc. Il nous a emmenés au bon endroit pour photographier la Garganta del Diablo au lever du soleil. Service impeccable depuis Puerto Iguazú!"},
      {"nome":"Alessandro Romano","cidade":"Rome, Italy","texto":"We visited both sides of Iguazu Falls in one day with Iguaçu Executive Transfer. The driver organized everything perfectly — Argentine side in the morning and Brazilian side in the afternoon. Crossing the border was easy and the driver helped with all formalities. Incredible service!"},
    ],
  },
  {
    "slug": "airport-transfer-puerto-iguazu",
    "h1": "Airport Transfer Puerto Iguazú — IGU Foz do Iguaçu Airport",
    "title": "Airport Transfer Puerto Iguazú | IGU Airport | Iguaçu Executive Transfer",
    "meta": "Airport transfer between Puerto Iguazú Argentina and Foz do Iguaçu Airport (IGU). Flight tracking, bilingual driver, fixed price. Available 24/7. Book on WhatsApp.",
    "keywords": ["airport transfer puerto iguazu","foz do iguacu airport puerto iguazu","IGU airport transfer argentina","taxi airport iguazu argentina"],
    "hashtags": ["#AirportTransfer","#PuertoIguazu","#IGUAirport","#FozDoIguacu","#IguacuTransfer","#ArgentinaAirport","#IguazuAirport"],
    "secoes": [
      {"t":"The Closest Airport to Puerto Iguazú is in Brazil","x":"Foz do Iguaçu International Airport (IGU) in Brazil is the main airport serving Puerto Iguazú, Misiones, Argentina. Located just 30km from Puerto Iguazú, IGU offers flights to São Paulo, Rio de Janeiro, Curitiba, Brasília and other major Brazilian cities. For international tourists arriving in Brazil and heading to Puerto Iguazú, Iguaçu Executive Transfer provides seamless cross-border transfers."},
      {"t":"Real-Time Flight Tracking — Your Driver Always Waits","x":"Flight delays happen. With Iguaçu Executive Transfer, your driver tracks your flight number in real time. If your flight arrives late at IGU, the driver automatically adjusts and waits at no extra charge. This is one of the biggest advantages of pre-booking your airport transfer from IGU to Puerto Iguazú — complete peace of mind regardless of delays."},
      {"t":"Border Crossing Guide — IGU Airport to Puerto Iguazú","x":"The route from IGU Airport to Puerto Iguazú covers: airport to Foz do Iguaçu center (15 min), Brazilian immigration exit stamp (5-10 min), crossing the Tancredo Neves Bridge, Argentine immigration entry stamp (5-10 min), arrival in Puerto Iguazú (10 min). Our drivers do this crossing every day and know how to minimize waiting times at each checkpoint."},
      {"t":"Night Arrivals — We Operate 24 Hours","x":"Budget airlines often arrive late at night or very early in the morning. Iguaçu Executive Transfer operates 24 hours a day, 7 days a week in Puerto Iguazú and Foz do Iguaçu. A 20% night surcharge applies between 10PM and 6AM. Book via WhatsApp before your flight with your arrival time and hotel name for guaranteed pickup."},
      {"t":"All Puerto Iguazú Hotels — We Know Every Route","x":"From IGU airport, we transfer guests directly to all Puerto Iguazú hotels: Sheraton Iguazú, Loi Suites, Panoramic Hotel, Iguazú Grand, Saint George and all boutique posadas and guesthouses. Our drivers know every entrance, the best approach routes and how to avoid border traffic at peak times."},
      {"t":"Pre-Book Your Airport Transfer via WhatsApp","x":"Book your IGU airport to Puerto Iguazú transfer via WhatsApp before you travel: send your flight number, arrival time, number of passengers, luggage quantity and hotel name in Puerto Iguazú. Receive instant confirmation with a fixed price in your preferred currency. No need to queue for taxis or negotiate prices after a long flight."},
    ],
    "faqs": [
      {"p":"How long does the transfer from IGU airport to Puerto Iguazú take?","r":"Approximately 40-60 minutes including the border crossing at Tancredo Neves Bridge. In low-traffic periods it can be faster. Our drivers know the best crossing times."},
      {"p":"My flight arrives at 2am — can I get a transfer to Puerto Iguazú?","r":"Yes! We operate 24 hours. A 20% night surcharge applies between 10PM and 6AM. Book in advance on WhatsApp to guarantee your transfer for any arrival time."},
      {"p":"Does the driver have a sign with my name at IGU airport?","r":"Yes! Your driver will be waiting at the arrivals exit with your name clearly displayed. You don't need to search — we find you."},
      {"p":"What currency should I have for the airport transfer?","r":"We accept ARS, BRL, USD and EUR in cash, plus credit cards and PIX. No need to exchange currency before arrival — pay in whatever you have."},
      {"p":"Can you do the return transfer from Puerto Iguazú to IGU airport?","r":"Absolutely! We handle transfers in both directions. Book your return trip at the same time as your arrival transfer for convenience."},
      {"p":"Do I need a Brazilian visa to transit through Foz do Iguaçu airport?","r":"Transit visa requirements depend on your nationality. Please check with the Brazilian consulate or embassy for your country's specific requirements before travel."},
    ],
    "depoimentos": [
      {"nome":"Rebecca and Mark Thompson","cidade":"Melbourne, Australia","texto":"We arrived at Foz do Iguaçu airport at 11pm after a long journey from Australia. Our driver was waiting with our names on a sign, helped with our bags and navigated the border crossing smoothly. We were at our Puerto Iguazú hotel by midnight. Excellent service!"},
      {"nome":"Hiroshi Tanaka","cidade":"Tokyo, Japan","texto":"My flight was delayed 2 hours but the driver waited without any issues. The border crossing was fast and the driver explained everything in English. Perfect transfer from IGU airport to Puerto Iguazú. I will use this service again next time!"},
      {"nome":"Jennifer and Paul Davies","cidade":"Toronto, Canada","texto":"Pre-booked via WhatsApp from Canada before our trip. The driver was punctual, professional and the border crossing was handled perfectly. Our luggage arrived safely and we were at the Sheraton Iguazú in under an hour. Highly recommended!"},
    ],
  },
  {
    "slug": "private-tour-iguazu-falls-both-sides",
    "h1": "Private Tour Iguazu Falls Both Sides — Argentina and Brazil",
    "title": "Private Tour Iguazu Falls Both Sides | Iguaçu Executive Transfer",
    "meta": "Private tour to both sides of Iguazu Falls — Argentine and Brazilian. One driver, one fixed price, two countries. From Puerto Iguazú or Foz do Iguaçu hotels. Book on WhatsApp.",
    "keywords": ["private tour iguazu falls both sides","iguazu falls tour argentina brazil","both sides iguazu falls transfer","private iguazu tour"],
    "hashtags": ["#IguazuFallsBothSides","#PrivateTour","#IguazuFalls","#ArgentinaBrazil","#IguacuTransfer","#BothSides","#IguazuTour"],
    "secoes": [
      {"t":"Both Sides of Iguazu Falls in One Day — The Complete Experience","x":"Visiting both the Argentine and Brazilian sides of Iguazu Falls in a single day is the ultimate Iguazu experience. Iguaçu Executive Transfer makes it seamless: one vehicle, one bilingual driver, two national parks in two countries. We handle the border crossing between Argentina and Brazil so you can focus entirely on experiencing one of the world's most spectacular natural wonders."},
      {"t":"Morning: Argentine Side — Jungle Trails and Devil's Throat","x":"Start your day at the Parque Nacional Iguazú (Argentine side) when it opens at 8am. With 4-5 hours you'll cover: the Lower Circuit (closest views of the falls), the Upper Circuit (elevated panoramas), and the unmissable Devil's Throat (Garganta del Diablo) — the most powerful cascade in the entire system. The ecological train connects the circuits and is included in the park entrance."},
      {"t":"Afternoon: Brazilian Side — Iconic Panoramic Views","x":"After lunch in Puerto Iguazú, cross to Foz do Iguaçu, Brazil for the afternoon visit to Parque Nacional do Iguaçu. The Brazilian side features a wide elevated walkway with the most iconic panoramic views of the entire falls system. The main walkway takes 2-3 hours and ends at the impressive waterfall platform where you get dramatically close to the cascades."},
      {"t":"Border Crossing Between the Two Parks — No Stress","x":"Our experienced drivers handle the Argentina-Brazil border crossing multiple times every day. We know exactly which lane to use, when immigration is least busy and how to minimize your waiting time between the two parks. You simply sit back, relax and let us manage the logistics of crossing between two countries."},
      {"t":"Photography Tips — Best Shots at Both Sides","x":"Our drivers know the best photography spots at both sides of Iguazu Falls. Argentine side: the Devil's Throat platform at sunrise for golden light and minimal crowds, the Lower Circuit for rainbow shots in the morning mist. Brazilian side: the main panoramic walkway for iconic full-falls shots, the final platform for dramatic close-up images. Ask your driver for current conditions."},
      {"t":"Book Both Sides Tour via WhatsApp","x":"Book your private both-sides Iguazu Falls tour via WhatsApp: send your hotel name (in Puerto Iguazú or Foz do Iguaçu), preferred start time, number of passengers and any special requirements. Receive instant confirmation with a fixed price covering both parks and the border crossing. Available every day of the week."},
    ],
    "faqs": [
      {"p":"Is it possible to visit both sides of Iguazu Falls in one day?","r":"Yes! It's one of our most popular transfers. We recommend starting at the Argentine side at 8am opening and visiting the Brazilian side in the afternoon. Allow 8-10 hours total for a relaxed experience."},
      {"p":"Which side of Iguazu Falls is better — Argentine or Brazilian?","r":"Both are spectacular and different. The Argentine side is larger with jungle trails and the Devil's Throat from above. The Brazilian side has the best panoramic views. Most visitors agree you need to see both for the complete experience."},
      {"p":"Do I need two separate entrance tickets?","r":"Yes, each park charges its own entrance fee. We recommend purchasing both online in advance. Our driver can advise on the official websites for each park."},
      {"p":"What passport/documents do I need for both sides?","r":"You need documents for both countries. Mercosur citizens can use national ID for both Argentina and Brazil. Other nationalities need a valid passport. Our driver guides you through every step."},
      {"p":"Can children visit both sides in one day?","r":"Yes, though it's a full day. Children generally enjoy the falls enormously — the spray, the sounds and the wildlife are magical for kids. The Argentine side has a train which children love. Our drivers are experienced with family groups."},
      {"p":"How much does the both-sides private tour cost?","r":"Prices vary by group size and departure hotel. Contact us via WhatsApp for an immediate personalized quote. All prices are fixed — no surprises."},
    ],
    "depoimentos": [
      {"nome":"The Johnson Family","cidade":"Chicago, USA","texto":"We did both sides of Iguazu Falls in one day with Iguaçu Executive Transfer. Four adults and two kids — the driver was amazing with the children and knew exactly how to organize the day. Morning Argentine side, afternoon Brazilian side, border crossing was smooth. Best day of our South America trip!"},
      {"nome":"Andreas and Petra Hoffmann","cidade":"Munich, Germany","texto":"Visiting both sides of Iguazu in one day was our dream and Iguaçu Executive Transfer made it reality. Excellent organization, bilingual driver, and the border crossing took only 20 minutes. We got incredible photos on both sides. Absolutely worth it!"},
      {"nome":"Yuki and Kenji Watanabe","cidade":"Osaka, Japan","texto":"We were worried about the logistics of crossing the border between Argentina and Brazil for the falls. Our driver made it completely stress-free. He knew exactly when to cross to avoid crowds. Both sides were breathtaking. Thank you for the perfect day!"},
    ],
  },
  {
    "slug": "vip-transfer-iguazu-argentina",
    "h1": "VIP Transfer Iguazu Argentina — Luxury Service for Discerning Travelers",
    "title": "VIP Transfer Iguazu Argentina | Luxury | Iguaçu Executive Transfer",
    "meta": "VIP luxury transfer service in Iguazu, Argentina. Premium vehicles, professional bilingual chauffeur, water and amenities on board. Puerto Iguazú and Foz do Iguaçu. Book on WhatsApp.",
    "keywords": ["vip transfer iguazu argentina","luxury taxi puerto iguazu","executive transfer iguazu","premium car service iguazu argentina"],
    "hashtags": ["#VIPTransfer","#IguazuArgentina","#LuxuryTransfer","#PuertoIguazu","#IguacuTransfer","#ExecutiveTransfer","#LuxuryIguazu"],
    "secoes": [
      {"t":"VIP Luxury Transfer in Iguazu — Five-Star Experience","x":"For travelers who demand the best, Iguaçu Executive Transfer offers VIP service in Puerto Iguazú, Misiones, Argentina: premium vehicles with leather seating, professional bilingual chauffeur with executive etiquette, complimentary mineral water, mints and amenities on board, and complete discretion throughout your transfer. The finest transportation experience in the Iguazu region."},
      {"t":"Premium Fleet — SW4, Haval and Executive Vehicles","x":"Our VIP fleet in the Iguazu region includes Toyota SW4 Diamond (7-seat SUV), Haval H6 (panoramic roof SUV) and executive sedans — all maintained to the highest standards with leather interiors, digital climate control, Wi-Fi, wireless chargers and complimentary refreshments. For those who want to arrive in style at the Sheraton Iguazú, Loi Suites or any luxury property."},
      {"t":"VIP Transfer for Honeymoon Couples in Iguazu","x":"Iguazu Falls is one of South America's most romantic destinations for honeymooners. Iguaçu Executive Transfer creates personalized VIP experiences for couples: floral decoration in the vehicle, chilled sparkling wine, romantic playlist and stops at exclusive viewpoints not on the tourist trail. Ask us about our honeymoon package for Puerto Iguazú."},
      {"t":"Corporate VIP — Executives and Delegations in Iguazu","x":"Senior executives, government delegations and corporate groups visiting Iguazu for meetings at Itaipu or regional events can count on Iguaçu Executive Transfer for discreet, professional VIP transportation. NDAs available on request. Drivers trained in executive etiquette and confidentiality. Invoice and corporate billing available."},
      {"t":"VIP Airport Transfer — IGU to Puerto Iguazú in Style","x":"Arrive at Foz do Iguaçu Airport (IGU) to find your VIP driver waiting with your name displayed, vehicle pre-cooled to your preferred temperature, mineral water ready and personalized welcome. The border crossing is handled smoothly and you arrive at your Puerto Iguazú hotel feeling relaxed and refreshed. That's the Iguaçu Executive Transfer VIP difference."},
      {"t":"Book Your VIP Transfer in Iguazu via WhatsApp","x":"Reserve your VIP transfer at least 4 hours in advance via WhatsApp: share your hotel, departure time, number of passengers and any special preferences. Our team personalizes every detail of your VIP experience in Puerto Iguazú and the Iguazu region. Available 24 hours. We accept ARS, BRL, USD and EUR."},
    ],
    "faqs": [
      {"p":"What makes your VIP transfer different in Iguazu?","r":"VIP service includes premium vehicles, executive-trained bilingual chauffeur, complimentary water and amenities, complete discretion, personalized service and optional extras like flowers or sparkling wine for special occasions."},
      {"p":"Do you offer VIP transfers for honeymoon couples in Iguazu?","r":"Yes! We create personalized romantic transfers with floral decoration, chilled sparkling wine and stops at exclusive viewpoints. Contact us via WhatsApp to customize your honeymoon experience."},
      {"p":"Can you provide invoices for corporate VIP transfers in Iguazu?","r":"Yes! We issue detailed invoices for corporate accounts. Contact us via WhatsApp with your company details for a corporate billing arrangement."},
      {"p":"Is the VIP vehicle available for full-day hire in Iguazu?","r":"Yes! Our VIP vehicles are available for full-day hire (8 hours) with driver at disposal. Perfect for exploring Puerto Iguazú, both sides of the falls and the triple frontier region."},
      {"p":"How far in advance should I book the VIP transfer?","r":"We recommend at least 4 hours for standard VIP transfers and 24 hours for special requests like floral decoration or sparkling wine. Peak season bookings (July, January) should be made well in advance."},
      {"p":"Do you offer VIP transfers from Buenos Aires to Iguazú?","r":"We specialize in ground transfers in the Iguazu region. For long-distance transfers from Buenos Aires, contact us via WhatsApp and we'll provide the best options for your journey."},
    ],
    "depoimentos": [
      {"nome":"Sir Robert and Lady Alexandra Montgomery","cidade":"London, UK","texto":"We requested VIP service for our anniversary trip to Iguazu. The vehicle was immaculate, the driver impeccably professional and the flowers in the car were a lovely touch. The border crossing between Argentina and Brazil was handled seamlessly. A truly five-star experience throughout."},
      {"nome":"CEO — International Mining Company","cidade":"Perth, Australia","texto":"I travel frequently to the Iguazu region for business. Iguaçu Executive Transfer is my only choice for VIP transfers between Puerto Iguazú and Foz do Iguaçu. Discreet, professional, always on time, and the driver knows the border crossing procedure perfectly. Invoices issued promptly."},
      {"nome":"Valentina and Marco Conti","cidade":"Milan, Italy","texto":"Our honeymoon transfer was beyond perfect — the car was decorated with white roses, there was champagne waiting for us and the driver took us to a secret viewpoint of the falls that no tourist knows. Iguaçu Executive Transfer created a magical memory for us. Grazie mille!"},
    ],
  },
]

# ─── PÁGINAS PORTUGUÊS (/ar-pt/) ───────────────────────────────
PAGINAS_PT = [
  {
    "slug": "taxi-puerto-iguazu-argentina",
    "h1": "Táxi em Puerto Iguazú Argentina — Transfer Executivo 24 Horas",
    "title": "Táxi Puerto Iguazú Argentina | Transfer Executivo | Iguaçu Executive Transfer",
    "meta": "Táxi executivo em Puerto Iguazú, Misiones, Argentina. Motorista bilíngue, preço fixo, 24 horas. Transfer para as Cataratas, aeroporto de Foz do Iguaçu e hotéis. Reserve pelo WhatsApp.",
    "keywords": ["taxi puerto iguazu argentina","transfer puerto iguazu em portugues","taxi argentina cataratas iguacu","transfer executivo puerto iguazu"],
    "hashtags": ["#TaxiPuertoIguazu","#PuertoIguazuArgentina","#CataratásDoIguaçu","#IguacuTransfer","#Misiones","#ArgentinaTaxi","#TransferIguazu"],
    "secoes": [
      {"t":"Táxi Executivo em Puerto Iguazú, Argentina — Para Brasileiros","x":"A Iguaçu Executive Transfer oferece serviço de táxi executivo em Puerto Iguazú, Misiones, Argentina, com atendimento em português para turistas brasileiros. Nossos motoristas falam português, espanhol e inglês e conhecem toda a região trinacional: Puerto Iguazú, Foz do Iguaçu e Ciudad del Este. Disponível 24 horas com preço fixo confirmado pelo WhatsApp."},
      {"t":"De Puerto Iguazú para Foz do Iguaçu — Transfer Sem Estresse","x":"A travessia entre Puerto Iguazú, Argentina, e Foz do Iguaçu, Brasil, é feita pela Ponte Internacional Tancredo Neves e leva apenas 30 a 60 minutos. A Iguaçu Executive Transfer realiza essa travessia diariamente com motoristas que conhecem todos os procedimentos de imigração, os melhores horários para cruzar e como minimizar o tempo de espera na fronteira."},
      {"t":"Táxi de Puerto Iguazú para o Aeroporto de Foz do Iguaçu (IGU)","x":"O aeroporto mais próximo de Puerto Iguazú é o Aeroporto Internacional de Foz do Iguaçu (IGU) no Brasil, a apenas 30 km. A Iguaçu Executive Transfer oferece transfer direto entre hotéis de Puerto Iguazú e o aeroporto IGU com rastreamento de voo em tempo real, motorista aguardando sem custo adicional em caso de atraso e preço fixo confirmado pelo WhatsApp."},
      {"t":"Cataratas do Iguaçu — Lado Argentino e Lado Brasileiro","x":"Turistas brasileiros em Puerto Iguazú podem visitar as Cataratas pelo lado argentino (Parque Nacional Iguazú — trilhas na selva, Garganta del Diablo) e pelo lado brasileiro (Parque Nacional do Iguaçu — vistas panorâmicas icônicas). A Iguaçu Executive Transfer cobre os dois lados com um único motorista bilíngue e preço fixo."},
      {"t":"Hotéis de Puerto Iguazú — Conhecemos Todos os Endereços","x":"Nossos motoristas conhecem todos os hotéis de Puerto Iguazú: Sheraton Iguazú Resort & Spa, Loi Suites Iguazú Hotel, Panoramic Hotel, Iguazú Grand Resort & Spa, Saint George Hotel e dezenas de pousadas boutique. De qualquer hotel de Puerto Iguazú para o aeroporto, as cataratas ou qualquer destino — preço fixo, serviço profissional."},
      {"t":"Preço Fixo, Sem Taxímetro — Reserve pelo WhatsApp","x":"Diferente dos táxis locais com taxímetro e preço imprevisível, a Iguaçu Executive Transfer trabalha com preço fixo confirmado antes da viagem. Envie mensagem no WhatsApp com hotel, destino, data, horário e número de passageiros. Confirmação imediata em português com preço fixo em ARS, BRL, USD ou EUR. Sem surpresas."},
    ],
    "faqs": [
      {"p":"Quanto tempo leva o táxi de Puerto Iguazú ao aeroporto de Foz do Iguaçu?","r":"Aproximadamente 40 a 60 minutos incluindo o cruzamento da fronteira pela Ponte Tancredo Neves. Em horários de menor movimento pode ser mais rápido. Nossos motoristas conhecem os melhores horários."},
      {"p":"Os motoristas falam português em Puerto Iguazú?","r":"Sim! Todos os nossos motoristas falam português, espanhol e inglês. Atendimento completo em português para turistas brasileiros em Puerto Iguazú e na Argentina."},
      {"p":"Quais documentos preciso para cruzar de Puerto Iguazú para o Brasil?","r":"Cidadãos brasileiros podem cruzar com RG válido. O motorista orienta sobre todos os procedimentos de imigração na fronteira Argentina-Brasil."},
      {"p":"O táxi funciona de madrugada em Puerto Iguazú?","r":"Sim, operamos 24 horas, 7 dias por semana, incluindo madrugada. Acréscimo de 20% entre 22h e 6h. Agende pelo WhatsApp com antecedência."},
      {"p":"Aceitam reais brasileiros em Puerto Iguazú?","r":"Sim! Aceitamos reais brasileiros (BRL), pesos argentinos (ARS), dólares (USD) e euros (EUR) em espécie, além de cartão de crédito e PIX."},
      {"p":"Posso reservar com antecedência no Brasil antes de viajar para Puerto Iguazú?","r":"Sim! Recomendamos reservar pelo WhatsApp antes mesmo de sair do Brasil. Informe data, horário, hotel em Puerto Iguazú e número de passageiros. Confirmação imediata em português."},
    ],
    "depoimentos": [
      {"nome":"Família Carvalho","cidade":"São Paulo — SP","texto":"Fomos a Puerto Iguazú pela primeira vez e contratamos a Iguaçu Executive Transfer para todos os translados. O motorista falava português perfeito, nos orientou em cada etapa da fronteira e conhecia tudo sobre as Cataratas. Serviço impecável para turistas brasileiros em Puerto Iguazú!"},
      {"nome":"Rodrigo e Camila Mendes","cidade":"Curitiba — PR","texto":"Viemos de Foz do Iguaçu para Puerto Iguazú para visitar o lado argentino das Cataratas. O motorista foi buscar a gente no hotel em Foz, cruzou a fronteira sem estresse e nos deixou no Sheraton Iguazú. Na volta foi igual. Preço fixo, sem surpresa. Recomendo demais!"},
      {"nome":"Grupo de Amigos","cidade":"Rio de Janeiro — RJ","texto":"Somos 6 amigos e viajamos para Puerto Iguazú. A Iguaçu Executive Transfer resolveu tudo: transfer do aeroporto IGU até o hotel argentino, passeio pelas Cataratas dos dois lados e cruzamento da fronteira. Motorista bilíngue nota 10!"},
    ],
  },
  {
    "slug": "transfer-cataratas-argentina-foz",
    "h1": "Transfer Cataratas Argentina para Brasileiros — De Foz do Iguaçu a Puerto Iguazú",
    "title": "Transfer Cataratas Argentina | De Foz do Iguaçu | Iguaçu Executive Transfer",
    "meta": "Transfer de Foz do Iguaçu para as Cataratas do lado argentino. Cruzamento da fronteira sem estresse, motorista bilíngue, preço fixo. Reserve pelo WhatsApp.",
    "keywords": ["transfer cataratas argentina foz do iguacu","taxi lado argentino cataratas","transfer foz iguacu puerto iguazu","cataratas argentina brasileiros"],
    "hashtags": ["#TransferCataratásArgentina","#FozDoIguacu","#PuertoIguazu","#CataratásArgentina","#IguacuTransfer","#LadoArgentino","#TuristasBrasileiros"],
    "secoes": [
      {"t":"De Foz do Iguaçu para as Cataratas Argentinas — Transfer Completo","x":"Turistas hospedados em Foz do Iguaçu que desejam visitar o lado argentino das Cataratas do Iguaçu contam com a Iguaçu Executive Transfer para o translado completo: hotel em Foz → fronteira Brasil-Argentina → Puerto Iguazú → Parque Nacional Iguazú. Motorista bilíngue orienta em cada etapa, aguarda durante toda a visita e retorna ao hotel em Foz do Iguaçu."},
      {"t":"Por que Visitar o Lado Argentino das Cataratas saindo de Foz?","x":"O Parque Nacional Iguazú (lado argentino) oferece uma experiência completamente diferente do lado brasileiro: trilhas na selva, contato mais próximo com as quedas, a emocionante Garganta del Diablo vista de cima e o trem ecológico. Para turistas em Foz do Iguaçu, cruzar para o lado argentino é uma experiência obrigatória — e a Iguaçu Executive Transfer torna esse cruzamento simples e confortável."},
      {"t":"A Fronteira Brasil-Argentina — Sem Complicação com a Iguaçu Executive","x":"Muitos turistas brasileiros têm receio de cruzar a fronteira para a Argentina. Com a Iguaçu Executive Transfer, o processo é simples: o motorista orienta onde parar para o carimbo brasileiro de saída, como funciona a imigração argentina e como retornar ao Brasil. Nossos motoristas fazem essa travessia diariamente e tornam o cruzamento tranquilo para qualquer turista."},
      {"t":"Garganta del Diablo — O Espetáculo que Só Existe no Lado Argentino","x":"A Garganta del Diablo é a queda d'água mais impressionante do sistema do Iguaçu e só pode ser vista de perto pelo lado argentino. Com 80 metros de altura e mais de 700 metros de largura, o rugido, a névoa e a potência da água são absolutamente inesquecíveis. A Iguaçu Executive Transfer leva turistas de Foz do Iguaçu diretamente a essa maravilha natural."},
      {"t":"Combo Cataratas dos Dois Lados — Um Dia, Dois Países","x":"O passeio mais completo para turistas em Foz do Iguaçu: manhã no lado argentino (Parque Nacional Iguazú — trilhas e Garganta del Diablo) e tarde no lado brasileiro (Parque Nacional do Iguaçu — vistas panorâmicas). A Iguaçu Executive Transfer organiza o roteiro completo com preço fixo, um único motorista para os dois países e cruzamento de fronteira incluído."},
      {"t":"Como Reservar o Transfer para as Cataratas Argentinas","x":"Reserve pelo WhatsApp: informe nome do hotel em Foz do Iguaçu, data, horário de saída desejado e número de passageiros. Confirme se deseja visitar só o lado argentino ou também o brasileiro. Lembre-se de ter RG ou passaporte válido para cruzar a fronteira. Confirmação imediata em português com preço fixo."},
    ],
    "faqs": [
      {"p":"Turistas brasileiros precisam de passaporte para ir ao lado argentino?","r":"Cidadãos brasileiros podem cruzar a fronteira com RG válido (não vencido). O motorista orienta sobre os documentos necessários antes do cruzamento."},
      {"p":"Quanto tempo leva de Foz do Iguaçu até as Cataratas argentinas?","r":"Aproximadamente 45 minutos a 1 hora incluindo o cruzamento da fronteira. Em horários de maior movimento pode levar um pouco mais. O motorista conhece os melhores horários para cruzar."},
      {"p":"O motorista espera durante a visita ao lado argentino?","r":"Sim! O tempo de espera durante toda a visita ao parque argentino está incluído no preço do transfer. Avise pelo WhatsApp quando estiver pronto para voltar."},
      {"p":"Precisa comprar ingresso do lado argentino com antecedência?","r":"Recomendamos comprar online no site oficial do Parque Nacional Iguazú, especialmente em temporada alta. O motorista pode orientar sobre como comprar durante o trajeto."},
      {"p":"Posso pagar em reais o transfer para as Cataratas argentinas?","r":"Sim! Aceitamos BRL, ARS, USD e EUR em espécie, além de cartão de crédito e PIX. Pagamento facilitado para turistas brasileiros."},
      {"p":"O combo dos dois lados das Cataratas vale a pena?","r":"Com certeza! Cada lado oferece experiência completamente diferente. A maioria dos turistas que visita apenas um lado se arrepende de não ter visto os dois. A Iguaçu Executive Transfer facilita o combo com preço fixo para o dia inteiro."},
    ],
    "depoimentos": [
      {"nome":"Beatriz e Lucas Santos","cidade":"Brasília — DF","texto":"Estávamos hospedados em Foz do Iguaçu e nunca tínhamos cruzado para o lado argentino. A Iguaçu Executive Transfer tornou tudo simples: motorista nos buscou no hotel, nos orientou na fronteira e levou às Cataratas argentinas. A Garganta del Diablo é simplesmente inesquecível. Voltaremos!"},
      {"nome":"Turma do Colégio — Excursão","cidade":"Londrina — PR","texto":"Viemos com 30 alunos em excursão para Foz do Iguaçu e contratamos transfer para o lado argentino. Coordenação perfeita, motoristas pacientes com os jovens e cruzamento da fronteira tranquilo. A Iguaçu Executive Transfer é referência em transfer escolar na região!"},
      {"nome":"Ana Paula e Marido","cidade":"Porto Alegre — RS","texto":"Nosso guia de Foz do Iguaçu recomendou a Iguaçu Executive Transfer para ir ao lado argentino. Melhor indicação! Motorista falava português, explicou tudo sobre a fronteira e conhecia as melhores trilhas do Parque Nacional Iguazú. Experiência perfeita!"},
    ],
  },
  {
    "slug": "transfer-aeroporto-foz-para-puerto-iguazu",
    "h1": "Transfer Aeroporto de Foz do Iguaçu para Puerto Iguazú Argentina",
    "title": "Transfer IGU para Puerto Iguazú | Argentina | Iguaçu Executive Transfer",
    "meta": "Transfer do Aeroporto de Foz do Iguaçu (IGU) para Puerto Iguazú, Argentina. Rastreamento de voo, motorista bilíngue, preço fixo. 24 horas. Reserve pelo WhatsApp.",
    "keywords": ["transfer aeroporto foz para puerto iguazu","IGU transfer argentina","taxi foz do iguacu para argentina","aeroporto iguacu argentina transfer"],
    "hashtags": ["#TransferAeroporto","#FozDoIguacu","#PuertoIguazu","#ArgentinaTransfer","#IguacuTransfer","#AeroportoIGU","#FozArgentina"],
    "secoes": [
      {"t":"Do Aeroporto de Foz do Iguaçu (IGU) para Puerto Iguazú, Argentina","x":"O Aeroporto Internacional de Foz do Iguaçu (IGU) é o principal ponto de chegada de turistas que visitam Puerto Iguazú, na Argentina. A Iguaçu Executive Transfer realiza transfer direto entre o aeroporto IGU e qualquer hotel de Puerto Iguazú, com rastreamento de voo, motorista aguardando sem custo adicional em caso de atraso e preço fixo em BRL ou ARS."},
      {"t":"Rastreamento de Voo — Seu Motorista Nunca Falta no IGU","x":"Atrasos de voo são comuns. Com a Iguaçu Executive Transfer, o motorista rastreia o número do seu voo em tempo real e ajusta automaticamente o horário de espera no aeroporto IGU. Se o voo atrasar 30, 60 ou 90 minutos, o motorista estará lá — sem custo adicional. Reserve com tranquilidade mesmo em voos com conexão."},
      {"t":"Cruzamento da Fronteira IGU → Puerto Iguazú Para Brasileiros","x":"A travessia entre o aeroporto IGU e Puerto Iguazú inclui: saída do aeroporto → carimbo de saída do Brasil na fronteira → cruzamento da Ponte Tancredo Neves → carimbo de entrada na Argentina → chegada a Puerto Iguazú. Nossos motoristas fazem essa rota diariamente e orientam brasileiros em cada etapa do cruzamento, tornando a chegada à Argentina simples e tranquila."},
      {"t":"Chegadas Noturnas no IGU — Transfer para Puerto Iguazú de Madrugada","x":"Voos noturnos e de madrugada são comuns para Foz do Iguaçu. A Iguaçu Executive Transfer opera 24 horas para transfer do aeroporto IGU para Puerto Iguazú em qualquer horário, incluindo chegadas após meia-noite. Acréscimo de 20% entre 22h e 6h. Reserve com antecedência pelo WhatsApp para garantir seu transfer noturno."},
      {"t":"Transfer IGU para Todos os Hotéis de Puerto Iguazú","x":"Do aeroporto IGU, levamos passageiros diretamente para todos os hotéis de Puerto Iguazú: Sheraton Iguazú Resort & Spa, Loi Suites Iguazú, Panoramic Hotel, Iguazú Grand Resort & Spa, Saint George Hotel e dezenas de pousadas e hostels. O motorista conhece cada endereço e o melhor acesso para cada propriedade em Puerto Iguazú."},
      {"t":"Reserve o Transfer IGU → Puerto Iguazú pelo WhatsApp","x":"Reserve antes de embarcar: envie número do voo, horário de chegada em Foz do Iguaçu, número de passageiros, quantidade de malas e nome do hotel em Puerto Iguazú. Confirmação imediata em português com preço fixo. Pagamento em BRL, ARS, USD ou EUR, cartão de crédito ou PIX. Disponível 24 horas."},
    ],
    "faqs": [
      {"p":"Quanto tempo leva do aeroporto IGU até Puerto Iguazú?","r":"Aproximadamente 40 a 60 minutos incluindo o cruzamento da fronteira. Em horários de menor movimento pode ser mais rápido. O motorista conhece os melhores horários para cruzar."},
      {"p":"Brasileiros precisam de visto para entrar na Argentina?","r":"Não! Brasileiros podem entrar na Argentina com RG ou passaporte válido, sem necessidade de visto. O motorista orienta sobre os documentos necessários na fronteira."},
      {"p":"O motorista espera se o voo atrasar no IGU?","r":"Sim! Rastreamos todos os voos em tempo real. Se houver atraso, o motorista aguarda sem custo adicional. Reserve com tranquilidade."},
      {"p":"Posso pagar em reais o transfer do IGU para Puerto Iguazú?","r":"Sim! Aceitamos BRL, ARS, USD e EUR em espécie, além de cartão de crédito e PIX. Facilidade total para turistas brasileiros."},
      {"p":"O transfer funciona para chegadas de madrugada no IGU?","r":"Sim! Operamos 24 horas. Acréscimo de 20% entre 22h e 6h. Reserve com antecedência pelo WhatsApp para garantir disponibilidade."},
      {"p":"Posso reservar transfer do IGU para Puerto Iguazú antes de sair do Brasil?","r":"Sim e recomendamos! Reserve pelo WhatsApp com antecedência, especialmente em temporada alta (julho, janeiro). Confirmação imediata em português."},
    ],
    "depoimentos": [
      {"nome":"Marcos e Renata Oliveira","cidade":"São Paulo — SP","texto":"Chegamos no IGU às 23h com as crianças cansadas. O motorista estava esperando com nossos nomes, ajudou com as malas e cruzou a fronteira rapidamente. Chegamos no hotel de Puerto Iguazú com as crianças dormindo. Perfeito!"},
      {"nome":"Executiva — Empresa de Consultoria","cidade":"Brasília — DF","texto":"Venho mensalmente a Puerto Iguazú a trabalho. Uso sempre a Iguaçu Executive Transfer para o transfer do IGU. Motorista pontual, nota fiscal emitida e cruzamento da fronteira sem estresse. O melhor transfer para brasileiros que vêm para a Argentina pelo IGU."},
      {"nome":"Casal em Viagem de Aniversário","cidade":"Florianópolis — SC","texto":"Chegamos no IGU e a Iguaçu Executive Transfer nos esperava. Motorista super simpático, falava português, explicou tudo sobre a Argentina e nos deixou no Sheraton Iguazú em menos de uma hora. Começo perfeito para nossa viagem de aniversário!"},
    ],
  },
  {
    "slug": "tour-cataratas-dois-lados-brasileiro-argentino",
    "h1": "Tour Cataratas Dois Lados — Brasileiro e Argentino em Um Dia",
    "title": "Tour Cataratas Dois Lados | Brasil e Argentina | Iguaçu Executive Transfer",
    "meta": "Tour privativo para os dois lados das Cataratas do Iguaçu — lado brasileiro e argentino — em um dia. Um motorista, preço fixo, dois países. Reserve pelo WhatsApp.",
    "keywords": ["tour cataratas dois lados","cataratas brasileiro argentino","transfer dois lados iguacu","tour ambos lados cataratas iguacu"],
    "hashtags": ["#TourCataratásDoisLados","#CataratásDoIguaçu","#LadoBrasileiro","#LadoArgentino","#IguacuTransfer","#DoisPaises","#CataratásIguacu"],
    "secoes": [
      {"t":"Os Dois Lados das Cataratas do Iguaçu em Um Dia","x":"Visitar os dois lados das Cataratas do Iguaçu — o lado brasileiro e o lado argentino — é a experiência mais completa que você pode ter na região. A Iguaçu Executive Transfer realiza o roteiro completo: um único veículo, um único motorista bilíngue, dois parques nacionais, dois países. Cruzamento da fronteira Brasil-Argentina incluído, com orientação completa do motorista em português."},
      {"t":"Manhã: Lado Argentino — Trilhas na Selva e Garganta del Diablo","x":"Comece pelo Parque Nacional Iguazú (lado argentino) cedo pela manhã, quando há menos turistas. Com 4 a 5 horas você visita o Circuito Inferior (vistas próximas das quedas), o Circuito Superior (vistas panorâmicas elevadas) e a imperdível Garganta del Diablo — a queda mais poderosa e impressionante do sistema do Iguaçu. O trem ecológico conecta os circuitos."},
      {"t":"Tarde: Lado Brasileiro — As Vistas Panorâmicas Icônicas","x":"Após o almoço em Puerto Iguazú, cruzamos de volta para o Brasil e visitamos o Parque Nacional do Iguaçu (lado brasileiro). A passarela principal oferece as vistas panorâmicas mais icônicas de todas as Cataratas do Iguaçu — a imagem clássica que aparece em todos os cartões-postais. A visita dura de 2 a 3 horas e termina na plataforma próxima às quedas."},
      {"t":"Cruzamento de Fronteira Entre os Dois Parques — Sem Estresse","x":"Nossos motoristas cruzam a fronteira Argentina-Brasil múltiplas vezes todos os dias. Conhecem os horários de menor movimento, as faixas corretas, os procedimentos de imigração e como minimizar o tempo de espera. Para o turista, o cruzamento é simples: siga as orientações do motorista, tenha o documento em mãos e aproveite a viagem."},
      {"t":"Dicas de Fotografia nos Dois Lados das Cataratas","x":"Lado argentino: a Garganta del Diablo de manhã cedo tem luz dourada e menor névoa. O Circuito Inferior tem arco-íris constantes pela manhã. Lado brasileiro: a passarela principal oferece a melhor foto panorâmica das Cataratas às 10h-11h. A plataforma final permite fotos dramáticas de perto. O motorista compartilha dicas atualizadas sobre condições e melhores ângulos."},
      {"t":"Reserve o Tour dos Dois Lados pelo WhatsApp","x":"Reserve pelo WhatsApp: informe nome do hotel (em Foz do Iguaçu ou Puerto Iguazú), data preferida, horário de saída e número de passageiros. Confirme se tem RG ou passaporte para o cruzamento da fronteira. Confirmação imediata em português com preço fixo para o dia completo. Disponível todos os dias da semana."},
    ],
    "faqs": [
      {"p":"Dá para visitar os dois lados das Cataratas no mesmo dia?","r":"Sim! É nosso roteiro mais popular. Recomendamos sair às 8h para aproveitar o lado argentino pela manhã e o lado brasileiro à tarde. Conte com 8 a 10 horas no total para um passeio tranquilo."},
      {"p":"Qual lado das Cataratas é melhor — argentino ou brasileiro?","r":"São experiências completamente diferentes e complementares! O lado argentino é maior, com trilhas e a Garganta del Diablo. O lado brasileiro tem as melhores vistas panorâmicas. A maioria dos turistas recomenda visitar os dois."},
      {"p":"Preciso comprar ingressos dos dois lados?","r":"Sim, cada parque cobra ingresso separado. Recomendamos comprar online com antecedência, especialmente em temporada alta. O motorista orienta sobre os sites oficiais."},
      {"p":"Documentos necessários para o tour dos dois lados?","r":"Brasileiros precisam de RG válido para entrar na Argentina. Para retornar ao Brasil, também o RG. O motorista orienta em cada etapa do cruzamento."},
      {"p":"Tem crianças no tour dos dois lados? É cansativo?","r":"É um dia longo mas muito recompensador. Crianças geralmente adoram as Cataratas — o spray, os sons e a fauna são mágicos. No lado argentino tem trem ecológico que as crianças adoram. Leve água, protetor solar e roupa confortável."},
      {"p":"Quanto custa o tour dos dois lados das Cataratas?","r":"O valor varia conforme o número de passageiros e hotel de saída. Consulte pelo WhatsApp para orçamento fixo personalizado. Aceitamos BRL, ARS, USD e EUR."},
    ],
    "depoimentos": [
      {"nome":"Família Mendonça","cidade":"Belo Horizonte — MG","texto":"Fizemos o tour dos dois lados das Cataratas com a Iguaçu Executive Transfer — foi o melhor dia de toda a nossa viagem! Lado argentino de manhã (a Garganta del Diablo nos deixou sem palavras) e lado brasileiro à tarde. Motorista explicando tudo em português, cruzamento de fronteira tranquilo. Nota 10!"},
      {"nome":"Grupo de Casais","cidade":"Porto Alegre — RS","texto":"Seis adultos no tour dos dois lados das Cataratas. Motorista organizou tudo perfeitamente: saída às 8h do hotel em Foz, lado argentino até o almoço, cruzamento tranquilo e lado brasileiro à tarde. Cada lado surpreende de forma diferente. Vale cada centavo!"},
      {"nome":"Professora em Viagem de Férias","cidade":"Recife — PE","texto":"Primeira vez nas Cataratas do Iguaçu e fiz o tour completo dos dois lados. O motorista da Iguaçu Executive Transfer foi incrível: paciente, conhecedor e sempre em português. A Garganta del Diablo no lado argentino é inesquecível. Recomendo para qualquer turista brasileiro!"},
    ],
  },
  {
    "slug": "transfer-vip-puerto-iguazu-brasileiros",
    "h1": "Transfer VIP Puerto Iguazú para Brasileiros — Luxo e Conforto",
    "title": "Transfer VIP Puerto Iguazú Brasileiros | Luxo | Iguaçu Executive Transfer",
    "meta": "Transfer VIP em Puerto Iguazú para turistas brasileiros. Veículo premium, motorista bilíngue em português, cortesias a bordo. Cataratas e aeroporto IGU. Reserve pelo WhatsApp.",
    "keywords": ["transfer vip puerto iguazu brasileiro","taxi luxo argentina brasileiro","transfer premium puerto iguazu","vip transfer iguazu para brasileiros"],
    "hashtags": ["#TransferVIP","#PuertoIguazuBrasileiro","#LuxoArgentina","#VIPBrasileiro","#IguacuTransfer","#TransferPremium","#IguazuVIP"],
    "secoes": [
      {"t":"Transfer VIP em Puerto Iguazú com Atendimento em Português","x":"A Iguaçu Executive Transfer oferece serviço VIP em Puerto Iguazú especialmente pensado para turistas brasileiros: motorista que fala português fluente, veículo premium impecável, água mineral, balas e amenidades a bordo, orientação completa sobre a Argentina e cruzamento de fronteira sem estresse. O transfer mais sofisticado disponível para brasileiros na região de Puerto Iguazú."},
      {"t":"Frota VIP na Região do Iguazú — SW4, Haval e Sedãs Executivos","x":"Nossa frota VIP inclui Toyota SW4 Diamond com 7 lugares em couro, Haval H6 com teto panorâmico e sedãs executivos — todos com ar-condicionado digital, Wi-Fi, carregadores wireless e água mineral de cortesia. Para turistas brasileiros que hospedam no Sheraton Iguazú ou Loi Suites e exigem um transfer à altura do hotel."},
      {"t":"Transfer VIP de Lua de Mel para Brasileiros em Puerto Iguazú","x":"Puerto Iguazú e as Cataratas do Iguaçu são um dos destinos de lua de mel mais românticos da América do Sul. Para casais brasileiros, a Iguaçu Executive Transfer cria experiências VIP personalizadas: decoração floral no veículo, espumante gelado, playlist romântica e paradas em mirantes exclusivos. Tudo em português, com a atenção que sua lua de mel merece."},
      {"t":"Transfer VIP Corporativo para Executivos Brasileiros em Puerto Iguazú","x":"Executivos brasileiros que viajam para Puerto Iguazú a negócios contam com a Iguaçu Executive Transfer para transfer VIP com nota fiscal para CNPJ, motorista discreto e profissional, cruzamento de fronteira ágil e total confiabilidade. Para reuniões em Puerto Iguazú, Itaipu ou qualquer ponto da região trinacional."},
      {"t":"Transfer VIP Aeroporto IGU → Puerto Iguazú para Brasileiros","x":"Desembarque no aeroporto IGU e encontre o motorista VIP da Iguaçu Executive Transfer aguardando com seu nome, veículo pré-refrigerado, água mineral gelada e saudação em português. O cruzamento da fronteira é realizado com eficiência e você chega ao seu hotel em Puerto Iguazú se sentindo recebido com toda a hospitalidade brasileira."},
      {"t":"Reserve o Transfer VIP pelo WhatsApp em Português","x":"Reserve o transfer VIP com pelo menos 4 horas de antecedência pelo WhatsApp: informe hotel, data, horário, número de passageiros e qualquer preferência especial. Nossa equipe atende em português e personaliza cada detalhe para a sua experiência VIP em Puerto Iguazú. Disponível 24 horas. Aceita BRL, ARS, USD e EUR."},
    ],
    "faqs": [
      {"p":"O atendimento VIP é em português para brasileiros em Puerto Iguazú?","r":"Sim! Todo o atendimento é em português: reserva pelo WhatsApp, comunicação durante o transfer e orientações sobre a Argentina. Motorista bilíngue português-espanhol-inglês."},
      {"p":"O transfer VIP inclui decoração para lua de mel em Puerto Iguazú?","r":"Sim! Oferecemos decoração floral, espumante gelado e paradas em mirantes especiais para casais em lua de mel. Informe ao reservar pelo WhatsApp."},
      {"p":"Emitem nota fiscal para CNPJ no transfer VIP de Puerto Iguazú?","r":"Sim! Emitimos NFC-e e nota de serviço para CNPJ. Informe o CNPJ ao reservar pelo WhatsApp para viagens corporativas."},
      {"p":"Posso pagar em reais pelo transfer VIP de Puerto Iguazú?","r":"Sim! Aceitamos BRL, ARS, USD e EUR em espécie, além de cartão de crédito e PIX. Facilidade total para turistas brasileiros."},
      {"p":"Com quanto tempo de antecedência devo reservar o VIP em Puerto Iguazú?","r":"Recomendamos pelo menos 4 horas de antecedência. Para pedidos especiais como decoração floral, reserve com 24 horas. Em alta temporada (julho, janeiro), reserve com mais antecedência."},
      {"p":"O transfer VIP cobre Puerto Iguazú e Foz do Iguaçu?","r":"Sim! Cobrimos toda a região trinacional: Puerto Iguazú (Argentina), Foz do Iguaçu (Brasil) e Ciudad del Este (Paraguai), com cruzamentos de fronteira incluídos."},
    ],
    "depoimentos": [
      {"nome":"Rafael e Isabela Ferreira","cidade":"São Paulo — SP","texto":"Contratamos o transfer VIP para nossa lua de mel em Puerto Iguazú. O carro tinha flores, espumante gelado e o motorista falava português. Nos levou a um mirante secreto das Cataratas que não está em nenhum guia turístico. Experiência inesquecível! A Iguaçu Executive Transfer superou todas as expectativas."},
      {"nome":"Diretor — Empresa de Logística","cidade":"Curitiba — PR","texto":"Venho mensalmente a Puerto Iguazú para reuniões. O transfer VIP da Iguaçu Executive Transfer é impecável: motorista discreto, carro executivo, nota fiscal para o CNPJ e cruzamento de fronteira sempre ágil. Único serviço VIP que uso na região."},
      {"nome":"Família Silva — Viagem Especial","cidade":"Rio de Janeiro — RJ","texto":"Viemos para as Cataratas em grande família — avós, pais e netos. Contratamos o VIP para os avós, que precisavam de mais conforto e atenção. O motorista foi extraordinário: paciente, em português, ajudou em cada detalhe. Os avós ficaram encantados. Recomendamos sem hesitar!"},
    ],
  },
]

# ─── TEMPLATE HTML ──────────────────────────────────────────────
def gerar_html(p, lang, pasta):
    wa_msgs = {
        "en": f"Hello! I found your website and I'd like to book: {p['h1']}. Can you give me more information?",
        "pt": f"Olá! Vi seu site e quero reservar: {p['h1']}. Pode me dar mais informações?",
    }
    wa_msg = wa_msgs[lang].replace(' ','%20')
    wa_url = f"https://wa.me/{WA_NUMBER}?text={wa_msg}"
    keywords_str = ", ".join(p["keywords"])
    tags_html = "".join(f'<span class="tag">{h}</span>' for h in p["hashtags"])

    labels = {
        "en": {"nav_cta":"Book on WhatsApp","badge_loc":"Puerto Iguazú · Misiones · Argentina · 24h","btn1":"Book on WhatsApp","btn2":"See all services →","sec1":"Why choose us","sec2":"What our clients say","sec3":"Frequently Asked Questions","cta_sub":"Puerto Iguazú · Misiones · Argentina · 24 hours · Fixed price","footer_txt":"IGUAÇU EXECUTIVE TRANSFER · PUERTO IGUAZÚ · FOZ DO IGUAÇU · TRIPLE FRONTIER · +55 {WA_NUMBER} · 24H"},
        "pt": {"nav_cta":"Reserve pelo WhatsApp","badge_loc":"Puerto Iguazú · Misiones · Argentina · 24h","btn1":"Reservar pelo WhatsApp","btn2":"Ver todos os serviços →","sec1":"Por que nos escolher","sec2":"O que dizem nossos clientes","sec3":"Perguntas frequentes","cta_sub":"Puerto Iguazú · Misiones · Argentina · 24 horas · Preço fixo","footer_txt":f"IGUAÇU EXECUTIVE TRANSFER · PUERTO IGUAZÚ · FOZ DO IGUAÇU · TRÍPLICE FRONTEIRA · +55 {WA_NUMBER} · 24H"},
    }
    L = labels[lang]
    html_lang = "en" if lang == "en" else "pt-BR"

    secoes_html = "".join(f"""
    <div class="card reveal">
      <div class="cn">0{i+1}</div>
      <h2 class="ct">{s['t']}</h2>
      <div class="gl"></div>
      <p class="cx">{s['x']}</p>
    </div>""" for i, s in enumerate(p["secoes"]))

    faqs_html = "".join(f"""
    <div class="fi">
      <button class="fb" onclick="tF(this)">
        <span class="fq">{f['p']}</span>
        <span class="fic">+</span>
      </button>
      <div class="fa"><p>{f['r']}</p></div>
    </div>""" for f in p["faqs"])

    deps_html = "".join(f"""
    <div class="dc reveal">
      <div class="dq">"</div>
      <p class="dt">{d['texto']}</p>
      <div class="dd"></div>
      <p class="dn">{d['nome']}</p>
      <p class="dci">{d['cidade']}</p>
      <div class="ds">★★★★★</div>
    </div>""" for d in p["depoimentos"])

    alt_en = f'<link rel="alternate" hreflang="en" href="{SITE_URL}/ar-en/{p["slug"]}.html">'
    alt_pt = f'<link rel="alternate" hreflang="pt-BR" href="{SITE_URL}/ar-pt/{p["slug"]}.html">'
    alt_es = f'<link rel="alternate" hreflang="es" href="{SITE_URL}/ar-es/taxi-puerto-iguazu.html">'
    self_canon = f'{SITE_URL}/{pasta}/{p["slug"]}.html'

    return f"""<!DOCTYPE html>
<html lang="{html_lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>{p['title']}</title>
  <meta name="description" content="{p['meta']}">
  <meta name="keywords" content="{keywords_str}">
  <meta name="robots" content="index,follow">
  <link rel="canonical" href="{self_canon}">
  {alt_en}
  {alt_pt}
  {alt_es}
  <meta property="og:title" content="{p['title']}">
  <meta property="og:description" content="{p['meta']}">
  <meta property="og:image" content="{SITE_URL}/og-orcamento.jpg">
  <meta property="og:url" content="{self_canon}">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="{html_lang.replace('-','_')}">
  <meta name="geo.region" content="AR-N">
  <meta name="geo.placename" content="Puerto Iguazú, Misiones, Argentina">
  <meta name="geo.position" content="-25.5986;-54.5783">
  <meta name="ICBM" content="-25.5986, -54.5783">
  <script type="application/ld+json">{{
    "@context":"https://schema.org",
    "@type":"TaxiService",
    "name":"Iguaçu Executive Transfer",
    "description":"{p['meta']}",
    "url":"{self_canon}",
    "telephone":"+55{WA_NUMBER}",
    "priceRange":"$$",
    "address":{{"@type":"PostalAddress","addressLocality":"Puerto Iguazú","addressRegion":"Misiones","addressCountry":"AR"}},
    "areaServed":[
      {{"@type":"City","name":"Puerto Iguazú"}},
      {{"@type":"City","name":"Foz do Iguaçu"}},
      {{"@type":"City","name":"Ciudad del Este"}}
    ],
    "openingHoursSpecification":{{"@type":"OpeningHoursSpecification","dayOfWeek":["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],"opens":"00:00","closes":"23:59"}},
    "availableLanguage":["Portuguese","English","Spanish"],
    "keywords":"{keywords_str}"
  }}</script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Montserrat:wght@300;400;500;600&display=swap" rel="stylesheet">
  <style>
    *,*::before,*::after{{box-sizing:border-box;margin:0;padding:0}}
    :root{{--g:#d4af37;--b:#0a0a0a;--b2:#111;--w:#f0ede8;--m:rgba(240,237,232,0.5);--wa:#25d366}}
    body{{background:var(--b);color:var(--w);font-family:'Montserrat',sans-serif;font-weight:300;-webkit-font-smoothing:antialiased;overflow-x:hidden}}
    .tl,.bl{{width:100%;height:1px;background:linear-gradient(90deg,transparent,var(--g),transparent)}}
    nav{{position:sticky;top:0;z-index:100;background:rgba(10,10,10,0.96);backdrop-filter:blur(20px);border-bottom:1px solid rgba(212,175,55,0.1);padding:14px 24px;display:flex;align-items:center;justify-content:space-between}}
    .nl{{display:flex;align-items:center;gap:12px;text-decoration:none}}
    .nc{{width:36px;height:36px;border-radius:50%;border:1px solid var(--g);display:flex;align-items:center;justify-content:center;font-family:'Cormorant Garamond',serif;font-size:0.8rem;color:var(--g);letter-spacing:2px}}
    .nb{{font-family:'Cormorant Garamond',serif;font-size:0.95rem;color:var(--w)}}
    .nw{{background:var(--wa);color:white;font-size:0.65rem;font-weight:600;letter-spacing:0.15em;text-transform:uppercase;padding:10px 20px;text-decoration:none;border-radius:1px;transition:all 0.3s}}
    .hero{{min-height:75vh;display:flex;align-items:center;background:linear-gradient(135deg,#0a0a0a 0%,#0a100d 40%,#0a0a0a 100%);position:relative;overflow:hidden;padding:100px 24px 60px}}
    .hero::before{{content:'';position:absolute;inset:0;background-image:linear-gradient(rgba(212,175,55,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(212,175,55,0.03) 1px,transparent 1px);background-size:60px 60px;pointer-events:none}}
    .hi{{max-width:820px;margin:0 auto;text-align:center}}
    .badge{{display:inline-flex;align-items:center;gap:8px;background:rgba(212,175,55,0.1);border:1px solid rgba(212,175,55,0.2);border-radius:20px;padding:6px 16px;font-size:0.6rem;font-weight:500;letter-spacing:0.2em;text-transform:uppercase;color:var(--g);margin-bottom:28px}}
    .dot{{width:6px;height:6px;border-radius:50%;background:var(--wa);animation:p 2s infinite}}
    @keyframes p{{0%,100%{{opacity:1}}50%{{opacity:0.4}}}}
    h1{{font-family:'Cormorant Garamond',serif;font-size:clamp(2rem,5vw,3.5rem);font-weight:600;line-height:1.1;color:var(--w);margin-bottom:20px}}
    h1 em{{font-style:italic;color:var(--g)}}
    .hd{{width:60px;height:2px;background:linear-gradient(90deg,var(--g),#1a3a2a);margin:20px auto}}
    .hdsc{{font-size:0.88rem;color:var(--m);line-height:1.8;max-width:580px;margin:0 auto 28px}}
    .hb{{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-bottom:32px}}
    .bwa{{display:inline-flex;align-items:center;gap:10px;background:var(--wa);color:white;text-decoration:none;font-size:0.72rem;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;padding:14px 28px;border-radius:1px;transition:all 0.3s}}
    .bwa:hover{{filter:brightness(1.1);transform:translateY(-2px)}}
    .bo{{display:inline-flex;align-items:center;gap:10px;background:transparent;color:var(--g);text-decoration:none;font-size:0.72rem;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;padding:14px 28px;border-radius:1px;border:1px solid rgba(212,175,55,0.4);transition:all 0.3s}}
    .bo:hover{{border-color:var(--g);background:rgba(212,175,55,0.06)}}
    .tags{{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}}
    .tag{{font-size:0.6rem;font-weight:500;color:rgba(212,175,55,0.6);background:rgba(212,175,55,0.06);border:1px solid rgba(212,175,55,0.12);padding:4px 10px;border-radius:20px}}
    section{{padding:80px 24px}}
    .inn{{max-width:1100px;margin:0 auto}}
    .sl{{display:flex;align-items:center;justify-content:center;gap:10px;font-size:0.58rem;font-weight:600;letter-spacing:0.25em;text-transform:uppercase;color:var(--g);margin-bottom:14px}}
    .sl::before,.sl::after{{content:'';width:24px;height:1px;background:var(--g);opacity:0.5}}
    .sh{{font-family:'Cormorant Garamond',serif;font-size:clamp(1.6rem,4vw,2.4rem);font-weight:600;text-align:center;color:var(--w);margin-bottom:40px;line-height:1.2}}
    .sh span{{color:var(--g)}}
    .cg{{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px}}
    .card{{background:#111;border:1px solid rgba(212,175,55,0.1);padding:28px;border-radius:2px;transition:all 0.4s;position:relative;overflow:hidden}}
    .card::before{{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,var(--g),transparent);opacity:0;transition:opacity 0.4s}}
    .card:hover{{border-color:rgba(212,175,55,0.3);transform:translateY(-4px);box-shadow:0 20px 60px rgba(0,0,0,0.5)}}
    .card:hover::before{{opacity:1}}
    .cn{{font-size:0.6rem;font-weight:700;letter-spacing:0.3em;text-transform:uppercase;color:rgba(212,175,55,0.35);margin-bottom:10px}}
    .ct{{font-family:'Cormorant Garamond',serif;font-size:1.05rem;font-weight:600;color:var(--w);margin-bottom:12px;line-height:1.3}}
    .gl{{width:28px;height:1.5px;background:linear-gradient(90deg,var(--g),#3d7a55);margin-bottom:12px}}
    .cx{{font-size:0.78rem;color:var(--m);line-height:1.8}}
    .dg{{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px}}
    .dc{{background:#111;border:1px solid rgba(212,175,55,0.1);padding:24px;border-radius:2px}}
    .dq{{font-family:'Cormorant Garamond',serif;font-size:3rem;line-height:1;color:rgba(212,175,55,0.2);margin-bottom:8px}}
    .dt{{font-size:0.78rem;color:var(--m);line-height:1.8;font-style:italic;margin-bottom:16px}}
    .dd{{height:1px;background:rgba(212,175,55,0.1);margin-bottom:12px}}
    .dn{{font-size:0.82rem;font-weight:500;color:var(--w)}}
    .dci{{font-size:0.65rem;color:rgba(37,211,102,0.8);margin-top:2px}}
    .ds{{color:var(--g);font-size:0.75rem;margin-top:8px}}
    .fl{{display:flex;flex-direction:column;gap:8px;max-width:720px;margin:0 auto}}
    .fi{{border:1px solid rgba(212,175,55,0.12);border-radius:2px;overflow:hidden}}
    .fb{{width:100%;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:18px 20px;background:rgba(17,17,17,0.8);border:none;cursor:pointer;text-align:left;transition:background 0.2s}}
    .fb:hover{{background:rgba(212,175,55,0.06)}}
    .fq{{font-size:0.82rem;font-weight:500;color:var(--w)}}
    .fic{{width:22px;height:22px;border-radius:50%;border:1px solid rgba(212,175,55,0.3);display:flex;align-items:center;justify-content:center;color:var(--g);font-size:1rem;flex-shrink:0;transition:transform 0.3s;line-height:1}}
    .fa{{display:none;padding:0 20px 18px;background:rgba(212,175,55,0.03)}}
    .fa.open{{display:block}}
    .fa p{{font-size:0.78rem;color:var(--m);line-height:1.8}}
    .ctas{{text-align:center;background:linear-gradient(135deg,#1a3a2a,#0d1f15);padding:80px 24px}}
    .cth{{font-family:'Cormorant Garamond',serif;font-size:clamp(1.8rem,4vw,2.8rem);font-weight:600;color:var(--w);margin-bottom:12px}}
    .cth em{{font-style:italic;color:var(--g)}}
    .cts{{font-size:0.7rem;letter-spacing:0.2em;text-transform:uppercase;color:var(--m);margin-bottom:28px}}
    .ctb{{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}}
    footer{{text-align:center;padding:24px;border-top:1px solid rgba(212,175,55,0.08)}}
    footer p{{font-size:0.6rem;letter-spacing:0.15em;color:rgba(212,175,55,0.3)}}
    .sh-seo{{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)}}
    .reveal{{opacity:0;transform:translateY(24px);transition:opacity 0.7s,transform 0.7s}}
    .reveal.visible{{opacity:1;transform:translateY(0)}}
    @media(max-width:600px){{.hb{{flex-direction:column;align-items:center}}.bwa,.bo{{width:100%;max-width:320px;justify-content:center}}}}
  </style>
</head>
<body>
<div class="tl"></div>
<nav>
  <a href="{SITE_URL}" class="nl">
    <div class="nc">IET</div>
    <span class="nb">Iguaçu Executive Transfer</span>
  </a>
  <a href="{wa_url}" target="_blank" class="nw">💬 {L['nav_cta']}</a>
</nav>

<section class="hero">
  <div class="hi">
    <div class="badge"><span class="dot"></span>{L['badge_loc']}</div>
    <h1>{p['h1']}</h1>
    <div class="hd"></div>
    <p class="hdsc">{p['meta']}</p>
    <div class="hb">
      <a href="{wa_url}" target="_blank" class="bwa">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
        {L['btn1']}
      </a>
      <a href="{SITE_URL}" class="bo">{L['btn2']}</a>
    </div>
    <div class="tags">{tags_html}</div>
  </div>
</section>

<section style="background:#111;padding:80px 24px">
  <div class="inn">
    <p class="sl">{L['sec1']}</p>
    <h2 class="sh">{p['h1'].split('—')[0].strip()} — <span>Iguazú</span></h2>
    <div class="cg">{secoes_html}</div>
  </div>
</section>

<section style="background:#0a0a0a;padding:80px 24px">
  <div class="inn">
    <p class="sl">{L['sec2']}</p>
    <h2 class="sh"><span>⭐</span> {L['sec2']}</h2>
    <div class="dg">{deps_html}</div>
  </div>
</section>

<section style="background:#111;padding:80px 24px">
  <div class="inn">
    <p class="sl">FAQ</p>
    <h2 class="sh">{L['sec3']}</h2>
    <div class="fl">{faqs_html}</div>
  </div>
</section>

<div class="ctas">
  <h2 class="cth">Iguaçu <em>Executive</em> Transfer</h2>
  <p class="cts">{L['cta_sub']}</p>
  <div class="ctb">
    <a href="{wa_url}" target="_blank" class="bwa">💬 {L['btn1']}</a>
    <a href="{SITE_URL}" class="bo">iguacuexecutivetransfer.com.br →</a>
  </div>
</div>

<footer>
  <p>{L['footer_txt']}</p>
</footer>
<div class="bl"></div>

<div class="sh-seo" aria-hidden="true">
  <p>{keywords_str}. {' '.join(p['hashtags'])}. Iguaçu Executive Transfer. Puerto Iguazú Misiones Argentina. Foz do Iguaçu Brasil.</p>
</div>

<script>
function tF(btn){{
  const a=btn.nextElementSibling,ic=btn.querySelector('.fic'),op=a.classList.contains('open');
  document.querySelectorAll('.fa').forEach(x=>x.classList.remove('open'));
  document.querySelectorAll('.fic').forEach(x=>{{x.textContent='+';x.style.transform='none';}});
  if(!op){{a.classList.add('open');ic.textContent='×';ic.style.transform='rotate(45deg)';}}
}}
new IntersectionObserver(es=>es.forEach(e=>{{
  if(e.isIntersecting){{e.target.classList.add('visible');}}
}}),{{threshold:0.1}}).observe(...document.querySelectorAll('.reveal'));
const obs=new IntersectionObserver(es=>es.forEach(e=>{{if(e.isIntersecting){{e.target.classList.add('visible');obs.unobserve(e.target);}}}}),{{threshold:0.1}});
document.querySelectorAll('.reveal').forEach(el=>obs.observe(el));
</script>
</body>
</html>"""

# ─── GERAR ──────────────────────────────────────────────────────
en_dir = BASE / "ar-en"
pt_dir = BASE / "ar-pt"
en_dir.mkdir(exist_ok=True)
pt_dir.mkdir(exist_ok=True)

total = 0
for p in PAGINAS_EN:
    html = gerar_html(p, "en", "ar-en")
    with open(en_dir / f"{p['slug']}.html", "w", encoding="utf-8") as f:
        f.write(html)
    print(f"✅ /ar-en/{p['slug']}.html")
    total += 1

for p in PAGINAS_PT:
    html = gerar_html(p, "pt", "ar-pt")
    with open(pt_dir / f"{p['slug']}.html", "w", encoding="utf-8") as f:
        f.write(html)
    print(f"✅ /ar-pt/{p['slug']}.html")
    total += 1

print(f"\n🎉 {total} páginas geradas!")
print(f"   /ar-en/ → {len(PAGINAS_EN)} páginas em inglês")
print(f"   /ar-pt/ → {len(PAGINAS_PT)} páginas em português")
