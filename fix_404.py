#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Cria páginas de redirecionamento para URLs com 404
"""
import os
from pathlib import Path

BASE = Path(os.path.expanduser("~/Documents/iguacu-site"))
SITE = "https://iguacuexecutivetransfer.com.br"

# URL 404 -> redireciona para URL correta
REDIRECIONAMENTOS = {
    "en/transfer-aeroport.html":        f"{SITE}/en/airport-transfer.html",
    "de/transfer-aeropuerto.html":      f"{SITE}/de/airport-transfer.html",
    "ar/chutes-iguacu-transfer.html":   f"{SITE}/ar/airport-transfer.html",
    "es/airport-transfer.html":         f"{SITE}/es/transfer-aeropuerto.html",
    "es/vip-taxi-foz-do-iguacu.html":   f"{SITE}/es/cataratas-iguazu-transfer.html",
    "ko/vip-taxi-foz-do-iguacu.html":   f"{SITE}/ko/airport-transfer.html",
    "ru/vip-taxi-foz-do-iguacu.html":   f"{SITE}/ru/airport-transfer.html",
    "en/cataratas-iguazu-transfer.html":f"{SITE}/en/iguazu-falls-transfer.html",
    "en/chutes-iguacu-transfer.html":   f"{SITE}/en/iguazu-falls-transfer.html",
    "fr/vip-taxi-foz-do-iguacu.html":   f"{SITE}/fr/transfer-aeroport.html",
    "fr/airport-transfer.html":         f"{SITE}/fr/transfer-aeroport.html",
    "de/vip-taxi-foz-do-iguacu.html":   f"{SITE}/de/airport-transfer.html",
    "es/iguazu-falls-transfer.html":    f"{SITE}/es/cataratas-iguazu-transfer.html",
    "ar/vip-taxi-foz-do-iguacu.html":   f"{SITE}/ar/airport-transfer.html",
    "de/iguazu-falls-transfer.html":    f"{SITE}/de/airport-transfer.html",
    "ar/iguazu-falls-transfer.html":    f"{SITE}/ar/airport-transfer.html",
    "de/cataratas-iguazu-transfer.html":f"{SITE}/de/airport-transfer.html",
    "ar/cataratas-iguazu-transfer.html":f"{SITE}/ar/airport-transfer.html",
    "pl/iguazu-falls-transfer.html":    f"{SITE}/pl/airport-transfer.html",
}

def redir_html(destino):
    return f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="0; url={destino}">
  <link rel="canonical" href="{destino}">
  <title>Redirecionando...</title>
</head>
<body>
  <script>window.location.replace("{destino}")</script>
  <p>Redirecionando... <a href="{destino}">clique aqui</a></p>
</body>
</html>"""

total = 0
for caminho, destino in REDIRECIONAMENTOS.items():
    arquivo = BASE / caminho
    arquivo.parent.mkdir(parents=True, exist_ok=True)
    with open(arquivo, "w", encoding="utf-8") as f:
        f.write(redir_html(destino))
    print(f"✅ {caminho} → {destino}")
    total += 1

print(f"\n🎉 {total} redirecionamentos criados!")
