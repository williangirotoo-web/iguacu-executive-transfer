#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Atualiza títulos de TODAS as páginas no modo vendedor
"""
import os, re
from pathlib import Path

BASE = Path(os.path.expanduser("~/Documents/iguacu-site"))
TEL_BR = "(45) 9 9916-4059"
TEL_INT = "+55 45 9 9916-4059"

# Títulos por pasta e slug
TITULOS = {
    # ── RAIZ ──
    "index.html": f"Táxi Executivo Foz do Iguaçu | {TEL_BR} | Transfer 24h Aeroporto e Cataratas",
    "orcamento.html": f"Orçamento Transfer Foz do Iguaçu | {TEL_BR} | Iguaçu Executive Transfer",

    # ── PAGES ──
    "pages/transfer-aeroporto.html": f"Transfer Aeroporto Foz do Iguaçu | {TEL_BR} | IGU 24 Horas",
    "pages/transfer-internacional.html": f"Transfer Internacional Foz do Iguaçu | {TEL_BR} | Argentina e Paraguai",
    "pages/passeios.html": f"Passeios Foz do Iguaçu | {TEL_BR} | Cataratas e Itaipu",
    "pages/sobre.html": f"Sobre Nós | Iguaçu Executive Transfer | {TEL_BR} | Foz do Iguaçu",

    # ── EN ──
    "en/index.html": f"Executive Transfer Foz do Iguaçu | WhatsApp {TEL_INT} | 24h Airport & Falls",
    "en/airport-transfer.html": f"Airport Transfer Foz do Iguaçu IGU | WhatsApp {TEL_INT} | 24h Service",
    "en/iguazu-falls-transfer.html": f"Iguazu Falls Transfer | WhatsApp {TEL_INT} | Private Tour Foz do Iguaçu",
    "en/vip-taxi-foz-do-iguacu.html": f"VIP Taxi Foz do Iguaçu | WhatsApp {TEL_INT} | Executive Car 24/7",

    # ── FR ──
    "fr/index.html": f"Transfer Exécutif Foz do Iguaçu | WhatsApp {TEL_INT} | Aéroport 24h",
    "fr/transfer-aeroport.html": f"Transfer Aéroport Foz do Iguaçu | WhatsApp {TEL_INT} | Service Premium",
    "fr/chutes-iguacu-transfer.html": f"Transfer Chutes d'Iguaçu | WhatsApp {TEL_INT} | Depuis Votre Hôtel",

    # ── ES ──
    "es/transfer-aeropuerto.html": f"Transfer Aeropuerto Foz do Iguaçu | WhatsApp {TEL_INT} | 24h IGU",
    "es/cataratas-iguazu-transfer.html": f"Transfer Cataratas Iguazú | WhatsApp {TEL_INT} | Servicio Privado",

    # ── DE ──
    "de/airport-transfer.html": f"Flughafentransfer Foz do Iguaçu | WhatsApp {TEL_INT} | 24h Premium",

    # ── IT ──
    "it/airport-transfer.html": f"Transfer Aeroporto Foz do Iguaçu | WhatsApp {TEL_INT} | Servizio 24h",

    # ── NL ──
    "nl/airport-transfer.html": f"Luchthavenstransfer Foz do Iguaçu | WhatsApp {TEL_INT} | 24h Service",

    # ── PL ──
    "pl/airport-transfer.html": f"Transfer Lotnisko Foz do Iguaçu | WhatsApp {TEL_INT} | Usługa 24h",

    # ── RU ──
    "ru/airport-transfer.html": f"Трансфер Аэропорт Фос-ду-Игуасу | WhatsApp {TEL_INT} | 24 часа",

    # ── AR ──
    "ar/airport-transfer.html": f"نقل مطار فوز دو إيغواسو | WhatsApp {TEL_INT} | خدمة 24 ساعة",

    # ── KO ──
    "ko/airport-transfer.html": f"포스두이과수 공항 픽업 | WhatsApp {TEL_INT} | 24시간 서비스",

    # ── PT ──
    "pt/taxi-corolla-foz-do-iguacu.html": f"Táxi Corolla 2026 Foz do Iguaçu | {TEL_BR} | Transfer Executivo",
    "pt/taxi-spin-foz-do-iguacu.html": f"Táxi Spin 7 Lugares Foz do Iguaçu | {TEL_BR} | Transfer Família",
    "pt/taxi-sw4-executivo-foz-do-iguacu.html": f"Táxi SW4 Executivo Foz do Iguaçu | {TEL_BR} | SUV Premium",
    "pt/taxi-haval-executivo-foz-do-iguacu.html": f"Táxi Haval Executivo Foz do Iguaçu | {TEL_BR} | SUV Moderno",
    "pt/carro-7-lugares-foz-do-iguacu.html": f"Carro 7 Lugares Foz do Iguaçu | {TEL_BR} | Transfer Família",
    "pt/taxi-para-idosos-foz-do-iguacu.html": f"Táxi para Idosos Foz do Iguaçu | {TEL_BR} | Transfer Acessível",
    "pt/taxi-para-cachorro-foz-do-iguacu.html": f"Táxi Pet Friendly Foz do Iguaçu | {TEL_BR} | Transfer com Cachorro",
    "pt/taxi-para-turistas-foz-do-iguacu.html": f"Táxi para Turistas Foz do Iguaçu | {TEL_BR} | City Tour e Cataratas",
    "pt/taxi-corporativo-foz-do-iguacu.html": f"Táxi Corporativo Foz do Iguaçu | {TEL_BR} | Nota Fiscal CNPJ",
    "pt/transfer-aeroporto-foz-do-iguacu.html": f"Transfer Aeroporto Foz do Iguaçu | {TEL_BR} | IGU 24 Horas",
    "pt/transfer-cataratas-foz-do-iguacu.html": f"Transfer Cataratas Foz do Iguaçu | {TEL_BR} | Saída do Hotel",
    "pt/transfer-itaipu-foz-do-iguacu.html": f"Transfer Itaipu Foz do Iguaçu | {TEL_BR} | Maior Hidrelétrica",
    "pt/transfer-vip-foz-do-iguacu.html": f"Transfer VIP Foz do Iguaçu | {TEL_BR} | Serviço de Luxo",
    "pt/taxi-para-fronteira-foz-do-iguacu.html": f"Táxi Fronteira Foz do Iguaçu | {TEL_BR} | Argentina e Paraguai",

    # ── AR-ES ──
    "ar-es/taxi-puerto-iguazu.html": f"Taxi Puerto Iguazú | WhatsApp {TEL_INT} | Transfer Ejecutivo 24h",
    "ar-es/transfer-puerto-iguazu-aeropuerto.html": f"Transfer Aeropuerto Puerto Iguazú IGU | WhatsApp {TEL_INT} | 24h",
    "ar-es/taxi-cataratas-iguazu-argentina.html": f"Taxi Cataratas Iguazú Argentina | WhatsApp {TEL_INT} | Tour Privado",
    "ar-es/transfer-misiones-foz-do-iguacu.html": f"Transfer Misiones Foz do Iguaçu | WhatsApp {TEL_INT} | Frontera Fácil",
    "ar-es/taxi-triple-frontera-iguazu.html": f"Taxi Triple Frontera Iguazú | WhatsApp {TEL_INT} | 3 Países 1 Día",
    "ar-es/remis-puerto-iguazu.html": f"Remis Puerto Iguazú | WhatsApp {TEL_INT} | Ejecutivo 24 Horas",
    "ar-es/taxi-nocturno-puerto-iguazu.html": f"Taxi Nocturno Puerto Iguazú | WhatsApp {TEL_INT} | Disponible 24h",
    "ar-es/transfer-sheraton-iguazu.html": f"Transfer Hotel Sheraton Iguazú | WhatsApp {TEL_INT} | Servicio Premium",
    "ar-es/taxi-para-garganta-del-diablo.html": f"Taxi Garganta del Diablo Iguazú | WhatsApp {TEL_INT} | Tour Privado",
    "ar-es/transfer-posadas-puerto-iguazu.html": f"Transfer Posadas Puerto Iguazú | WhatsApp {TEL_INT} | Ejecutivo",
    "ar-es/taxi-ejecutivo-misiones.html": f"Taxi Ejecutivo Misiones Argentina | WhatsApp {TEL_INT} | Premium 24h",
    "ar-es/transfer-empresas-puerto-iguazu.html": f"Transfer Empresas Puerto Iguazú | WhatsApp {TEL_INT} | Factura",
    "ar-es/taxi-familias-puerto-iguazu.html": f"Taxi Familias Puerto Iguazú | WhatsApp {TEL_INT} | 7 Lugares",
    "ar-es/excursion-cataratas-desde-puerto-iguazu.html": f"Excursión Cataratas desde Puerto Iguazú | WhatsApp {TEL_INT}",
    "ar-es/transfer-vip-puerto-iguazu.html": f"Transfer VIP Puerto Iguazú | WhatsApp {TEL_INT} | Lujo Premium",
    "ar-es/taxi-aeropuerto-iguazu-aeropuerto-cataratas.html": f"Taxi Aeropuerto Cataratas Iguazú | WhatsApp {TEL_INT} | 24h",
    "ar-es/transfer-hotel-iguazu-falls.html": f"Transfer Hotel Iguazú Falls | WhatsApp {TEL_INT} | Grand Hyatt",
    "ar-es/taxi-para-turistas-brasil-en-argentina.html": f"Taxi Turistas Brasileños Puerto Iguazú | WhatsApp {TEL_INT}",
    "ar-es/transfer-grupos-puerto-iguazu.html": f"Transfer Grupos Puerto Iguazú | WhatsApp {TEL_INT} | Van Ejecutiva",
    "ar-es/taxi-para-bodas-puerto-iguazu.html": f"Taxi Bodas Puerto Iguazú | WhatsApp {TEL_INT} | Eventos Premium",
    "ar-es/transfer-luna-de-miel-iguazu.html": f"Transfer Luna de Miel Iguazú | WhatsApp {TEL_INT} | Romántico",
    "ar-es/taxi-para-fotografos-iguazu.html": f"Taxi Fotógrafos Cataratas Iguazú | WhatsApp {TEL_INT} | Tour Privado",
    "ar-es/remis-ejecutivo-puerto-iguazu-aeropuerto.html": f"Remis Ejecutivo Aeropuerto Puerto Iguazú | WhatsApp {TEL_INT}",
    "ar-es/taxi-para-mochileros-iguazu.html": f"Transfer Económico Mochileros Iguazú | WhatsApp {TEL_INT}",
    "ar-es/transfer-hotel-saint-george-puerto-iguazu.html": f"Transfer Saint George Puerto Iguazú | WhatsApp {TEL_INT}",
    "ar-es/taxi-accesible-puerto-iguazu.html": f"Taxi Accesible Puerto Iguazú | WhatsApp {TEL_INT} | Movilidad",
    "ar-es/transfer-argentina-paraguay-iguazu.html": f"Transfer Argentina Paraguay Iguazú | WhatsApp {TEL_INT}",
    "ar-es/tour-privado-cataratas-iguazu.html": f"Tour Privado Cataratas Iguazú | WhatsApp {TEL_INT} | Ambos Lados",
    "ar-es/taxi-con-guia-bilingue-iguazu.html": f"Taxi Guía Bilingüe Iguazú | WhatsApp {TEL_INT} | ES/EN/PT",
    "ar-es/transfer-amanecer-cataratas-iguazu.html": f"Transfer Amanecer Cataratas Iguazú | WhatsApp {TEL_INT}",
    "ar-es/taxi-para-jubilados-puerto-iguazu.html": f"Taxi Jubilados Puerto Iguazú | WhatsApp {TEL_INT} | Accesible",
    "ar-es/transfer-hoteles-boutique-puerto-iguazu.html": f"Transfer Hoteles Boutique Puerto Iguazú | WhatsApp {TEL_INT}",
    "ar-es/taxi-para-kayak-iguazu.html": f"Taxi Aventura Kayak Iguazú | WhatsApp {TEL_INT} | Actividades",
    "ar-es/transfer-vuelo-privado-iguazu.html": f"Transfer Vuelo Privado Iguazú | WhatsApp {TEL_INT} | VIP",
    "ar-es/taxi-para-congreso-itaipu.html": f"Taxi Congreso Itaipu Foz do Iguaçu | WhatsApp {TEL_INT}",
    "ar-es/transfer-parque-aves-foz.html": f"Transfer Parque Aves Foz do Iguaçu | WhatsApp {TEL_INT}",
    "ar-es/taxi-safari-iguazu.html": f"Taxi Safari Naturaleza Iguazú | WhatsApp {TEL_INT} | Misiones",
    "ar-es/transfer-toda-la-noche-iguazu.html": f"Transfer Noche Itaipu Iluminada | WhatsApp {TEL_INT} | Iguazú",
    "ar-es/taxi-aeropuerto-iguazu-brasil.html": f"Taxi Aeropuerto Iguazú Brasil Argentina | WhatsApp {TEL_INT}",
    "ar-es/transfer-ejecutivo-reunion-negocios-iguazu.html": f"Transfer Ejecutivo Negocios Iguazú | WhatsApp {TEL_INT}",
    "ar-es/taxi-para-voluntarios-iguazu.html": f"Transfer Voluntarios ONGs Iguazú | WhatsApp {TEL_INT}",
    "ar-es/transfer-bicicletas-iguazu.html": f"Transfer Bicicletas Iguazú | WhatsApp {TEL_INT} | Misiones",
    "ar-es/taxi-mascota-iguazu.html": f"Taxi Mascota Pet Friendly Puerto Iguazú | WhatsApp {TEL_INT}",
    "ar-es/transfer-early-bird-cataratas.html": f"Transfer Primera Entrada Cataratas | WhatsApp {TEL_INT} | 8am",
    "ar-es/taxi-para-cruceristas-iguazu.html": f"Taxi Cruceristas Iguazú | WhatsApp {TEL_INT} | Excursión",
    "ar-es/transfer-selva-misionera.html": f"Transfer Selva Misionera Ecoturismo | WhatsApp {TEL_INT}",
    "ar-es/taxi-para-peliculas-iguazu.html": f"Taxi Producción Audiovisual Iguazú | WhatsApp {TEL_INT}",
    "ar-es/transfer-mochilero-economico-iguazu.html": f"Transfer Económico Puerto Iguazú Foz | WhatsApp {TEL_INT}",
    "ar-es/taxi-para-yoga-retiro-iguazu.html": f"Taxi Retiro Yoga Bienestar Iguazú | WhatsApp {TEL_INT}",
    "ar-es/transfer-comida-tipica-misiones.html": f"Transfer Gastronomía Misiones | WhatsApp {TEL_INT} | Tour",
    "ar-es/taxi-fotografia-nocturna-cataratas.html": f"Taxi Fotografía Nocturna Cataratas | WhatsApp {TEL_INT}",

    # ── AR-EN ──
    "ar-en/taxi-puerto-iguazu-argentina.html": f"Taxi Puerto Iguazú Argentina | WhatsApp {TEL_INT} | 24h Executive",
    "ar-en/iguazu-falls-transfer-argentina.html": f"Iguazu Falls Transfer Argentina | WhatsApp {TEL_INT} | Private Tour",
    "ar-en/airport-transfer-puerto-iguazu.html": f"Airport Transfer Puerto Iguazú IGU | WhatsApp {TEL_INT} | 24h",
    "ar-en/private-tour-iguazu-falls-both-sides.html": f"Private Tour Iguazu Falls Both Sides | WhatsApp {TEL_INT}",
    "ar-en/vip-transfer-iguazu-argentina.html": f"VIP Transfer Iguazu Argentina | WhatsApp {TEL_INT} | Luxury",

    # ── AR-PT ──
    "ar-pt/taxi-puerto-iguazu-argentina.html": f"Táxi Puerto Iguazú Argentina | {TEL_BR} | Transfer para Brasileiros",
    "ar-pt/transfer-cataratas-argentina-foz.html": f"Transfer Cataratas Argentina de Foz | {TEL_BR} | Lado Argentino",
    "ar-pt/transfer-aeroporto-foz-para-puerto-iguazu.html": f"Transfer Aeroporto IGU para Puerto Iguazú | {TEL_BR}",
    "ar-pt/tour-cataratas-dois-lados-brasileiro-argentino.html": f"Tour Cataratas Dois Lados | {TEL_BR} | Brasil e Argentina",
    "ar-pt/transfer-vip-puerto-iguazu-brasileiros.html": f"Transfer VIP Puerto Iguazú Brasileiros | {TEL_BR} | Luxo",
}

total = 0
erros = 0

for caminho, novo_titulo in TITULOS.items():
    arquivo = BASE / caminho
    if not arquivo.exists():
        print(f"⚠️  Não encontrado: {caminho}")
        erros += 1
        continue
    with open(arquivo, "r", encoding="utf-8") as f:
        content = f.read()
    novo = re.sub(r'<title>.*?</title>', f'<title>{novo_titulo}</title>', content, flags=re.DOTALL)
    if novo != content:
        with open(arquivo, "w", encoding="utf-8") as f:
            f.write(novo)
        print(f"✅ {caminho}")
        total += 1
    else:
        print(f"⚠️  Sem alteração: {caminho}")
        erros += 1

print(f"\n🎉 {total} títulos atualizados!")
if erros:
    print(f"⚠️  {erros} arquivos com problema")
