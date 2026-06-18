#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Fix metadata faltante — description, og:image, canonical
"""
import os, re
from pathlib import Path

BASE = Path(os.path.expanduser("~/Documents/iguacu-site"))
SITE = "https://iguacuexecutivetransfer.com.br"
OG_IMAGE = f"{SITE}/og-orcamento.jpg"

total_fixed = 0

for pasta in BASE.rglob("*.html"):
    rel = str(pasta.relative_to(BASE))

    # Pular scripts Python renomeados e redirects simples
    content = pasta.read_text(encoding="utf-8")
    if "<html" not in content:
        continue

    original = content
    url_canonical = f"{SITE}/{rel}"

    # Extrair title para gerar description e og automaticamente
    title_match = re.search(r'<title>(.+?)</title>', content)
    title = title_match.group(1).strip() if title_match else "Iguaçu Executive Transfer"

    # ── CANONICAL ──
    if 'rel="canonical"' not in content:
        canonical_tag = f'  <link rel="canonical" href="{url_canonical}">'
        content = content.replace("</head>", canonical_tag + "\n</head>", 1)
        print(f"  🔗 canonical: {rel}")

    # ── META DESCRIPTION ──
    if 'name="description"' not in content:
        # Gera description a partir do title
        desc = title.replace(" | Iguaçu Executive Transfer", "").replace(" | WhatsApp +55 45 9 9916-4059", "").strip()
        if len(desc) < 50:
            desc = f"{desc} — Serviço executivo em Foz do Iguaçu. Motorista profissional, preço fixo, 24 horas. Reserve pelo WhatsApp (45) 9 9916-4059."
        else:
            desc = f"{desc}. Motorista profissional, preço fixo, disponível 24 horas. Reserve pelo WhatsApp."
        desc = desc[:155]
        meta_desc = f'  <meta name="description" content="{desc}">'
        content = content.replace("</head>", meta_desc + "\n</head>", 1)
        print(f"  📝 description: {rel}")

    # ── OG:IMAGE ──
    if 'og:image' not in content:
        og_tags = f'''  <meta property="og:image" content="{OG_IMAGE}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">'''
        content = content.replace("</head>", og_tags + "\n</head>", 1)
        print(f"  🖼️  og:image: {rel}")

    # ── OG:URL (se não tiver) ──
    if 'og:url' not in content:
        og_url = f'  <meta property="og:url" content="{url_canonical}">'
        content = content.replace("</head>", og_url + "\n</head>", 1)

    if content != original:
        pasta.write_text(content, encoding="utf-8")
        total_fixed += 1

print(f"\n🎉 {total_fixed} páginas corrigidas!")

# ── VERIFICAÇÃO FINAL ──
sem_desc = sem_og = sem_can = 0
total = 0
for pasta in BASE.rglob("*.html"):
    content = pasta.read_text(encoding="utf-8")
    if "<html" not in content:
        continue
    total += 1
    if 'name="description"' not in content: sem_desc += 1
    if 'og:image' not in content: sem_og += 1
    if 'rel="canonical"' not in content: sem_can += 1

print(f"\n📊 VERIFICAÇÃO FINAL:")
print(f"   Total páginas:      {total}")
print(f"   Sem description:    {sem_desc}")
print(f"   Sem og:image:       {sem_og}")
print(f"   Sem canonical:      {sem_can}")
if sem_desc == 0 and sem_og == 0 and sem_can == 0:
    print("\n✅ METADATA 100% COMPLETO EM TODAS AS PÁGINAS!")
