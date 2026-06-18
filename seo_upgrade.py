#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
SEO UPGRADE — iguacuexecutivetransfer.com.br
1. FAQPage Schema em todas as páginas com FAQ
2. Links internos contextuais
3. hreflang x-default na home
4. Sitemap no robots.txt
5. Auditoria completa de metadata
"""

import os, re, json
from pathlib import Path

BASE = Path(os.path.expanduser("~/Documents/iguacu-site"))
SITE = "https://iguacuexecutivetransfer.com.br"

# ─── LINKS INTERNOS POR IDIOMA ──────────────────────────────────
LINKS_PT = [
    (f"{SITE}/pt/transfer-aeroporto-foz-do-iguacu.html", "Transfer Aeroporto Foz do Iguaçu"),
    (f"{SITE}/pt/transfer-cataratas-foz-do-iguacu.html", "Transfer Cataratas do Iguaçu"),
    (f"{SITE}/pt/transfer-vip-foz-do-iguacu.html", "Transfer VIP Foz do Iguaçu"),
    (f"{SITE}/pt/taxi-corporativo-foz-do-iguacu.html", "Táxi Corporativo com NFC-e"),
    (f"{SITE}/pt/taxi-para-fronteira-foz-do-iguacu.html", "Transfer para Fronteira"),
    (f"{SITE}/pt/carro-7-lugares-foz-do-iguacu.html", "Carro 7 Lugares"),
]

LINKS_EN = [
    (f"{SITE}/en/airport-transfer.html", "Airport Transfer Foz do Iguaçu"),
    (f"{SITE}/en/iguazu-falls-transfer.html", "Iguazu Falls Transfer"),
    (f"{SITE}/en/vip-taxi-foz-do-iguacu.html", "VIP Taxi Foz do Iguaçu"),
    (f"{SITE}/ar-en/taxi-puerto-iguazu-argentina.html", "Taxi Puerto Iguazú"),
    (f"{SITE}/ar-en/airport-transfer-puerto-iguazu.html", "Airport Transfer Puerto Iguazú"),
]

LINKS_ES = [
    (f"{SITE}/ar-es/taxi-puerto-iguazu.html", "Taxi Puerto Iguazú"),
    (f"{SITE}/ar-es/transfer-puerto-iguazu-aeropuerto.html", "Transfer Aeropuerto"),
    (f"{SITE}/ar-es/taxi-cataratas-iguazu-argentina.html", "Taxi Cataratas Iguazú"),
    (f"{SITE}/ar-es/taxi-triple-frontera-iguazu.html", "Taxi Triple Frontera"),
    (f"{SITE}/es/transfer-aeropuerto.html", "Transfer Aeropuerto Foz do Iguaçu"),
]

LINKS_FR = [
    (f"{SITE}/fr/transfer-aeroport.html", "Transfer Aéroport Foz do Iguaçu"),
    (f"{SITE}/fr/chutes-iguacu-transfer.html", "Transfer Chutes d'Iguaçu"),
    (f"{SITE}/en/airport-transfer.html", "Airport Transfer"),
]

def gerar_nav_html(links, label="Serviços relacionados"):
    itens = "".join(f'<li><a href="{url}" style="color:#d4af37;text-decoration:none;">{texto}</a></li>' for url, texto in links)
    return f"""
<nav aria-label="{label}" style="background:#111;border:1px solid rgba(212,175,55,0.15);padding:20px 24px;margin:0;border-top:2px solid rgba(212,175,55,0.3);">
  <p style="font-size:0.65rem;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:rgba(212,175,55,0.6);margin-bottom:12px;">{label}</p>
  <ul style="list-style:none;display:flex;flex-wrap:wrap;gap:10px 20px;margin:0;padding:0;">
    {itens}
  </ul>
</nav>"""

def gerar_faq_schema(faqs):
    items = []
    for faq in faqs:
        items.append({
            "@type": "Question",
            "name": faq["p"],
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq["r"]
            }
        })
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": items
    }

def extrair_faqs(content):
    """Extrai perguntas e respostas do HTML"""
    faqs = []
    # Padrão: .faq-q e .faq-ans p
    perguntas = re.findall(r'class="faq-q[^"]*"[^>]*>([^<]+)<', content)
    respostas = re.findall(r'class="fa[^"]*"><p>([^<]+)<', content)
    # Tenta padrão alternativo
    if not perguntas:
        perguntas = re.findall(r'class="fq"[^>]*>([^<]+)<', content)
    if not respostas:
        respostas = re.findall(r'class="faq-ans[^"]*"><p>([^<]+)<', content)

    for i, p in enumerate(perguntas):
        r = respostas[i] if i < len(respostas) else ""
        if p.strip() and r.strip():
            faqs.append({"p": p.strip(), "r": r.strip()})
    return faqs

# ─── RELATÓRIO ──────────────────────────────────────────────────
stats = {
    "total": 0,
    "faq_schema_adicionado": 0,
    "faq_schema_ja_tinha": 0,
    "links_adicionados": 0,
    "sem_title": [],
    "sem_description": [],
    "sem_og_image": [],
    "sem_canonical": [],
    "com_canonical": 0,
    "com_og_image": 0,
    "com_title": 0,
    "com_description": 0,
}

PASTAS = [".", "pages", "en", "fr", "es", "de", "it", "nl", "pl", "ru", "ar", "ko",
          "pt", "ar-es", "ar-en", "ar-pt"]

for pasta_nome in PASTAS:
    pasta = BASE / pasta_nome if pasta_nome != "." else BASE
    if not pasta.exists():
        continue
    htmls = list(pasta.glob("*.html")) if pasta_nome == "." else list(pasta.glob("*.html"))
    for arquivo in htmls:
        # Pular scripts e arquivos de redirect simples
        if arquivo.name in ["fix_404.py", "gerar_pt_iet.py"]:
            continue

        content = arquivo.read_text(encoding="utf-8")
        original = content
        stats["total"] += 1

        # ── AUDITORIA METADATA ──
        if "<title>" in content and content.count("<title>") > 0:
            title_val = re.search(r'<title>(.+?)</title>', content)
            if title_val and len(title_val.group(1).strip()) > 5:
                stats["com_title"] += 1
            else:
                stats["sem_title"].append(str(arquivo.relative_to(BASE)))
        else:
            stats["sem_title"].append(str(arquivo.relative_to(BASE)))

        if 'name="description"' in content:
            stats["com_description"] += 1
        else:
            stats["sem_description"].append(str(arquivo.relative_to(BASE)))

        if 'og:image' in content:
            stats["com_og_image"] += 1
        else:
            stats["sem_og_image"].append(str(arquivo.relative_to(BASE)))

        if 'rel="canonical"' in content:
            stats["com_canonical"] += 1
        else:
            stats["sem_canonical"].append(str(arquivo.relative_to(BASE)))

        modificado = False

        # ── 1. FAQ SCHEMA ──
        faqs = extrair_faqs(content)
        if faqs and '"FAQPage"' not in content:
            schema = gerar_faq_schema(faqs)
            schema_tag = f'\n<script type="application/ld+json">\n{json.dumps(schema, ensure_ascii=False, indent=2)}\n</script>'
            content = content.replace("</head>", schema_tag + "\n</head>", 1)
            stats["faq_schema_adicionado"] += 1
            modificado = True
            print(f"  📋 FAQ schema: {arquivo.relative_to(BASE)}")
        elif '"FAQPage"' in content:
            stats["faq_schema_ja_tinha"] += 1

        # ── 2. LINKS INTERNOS ──
        if 'aria-label="' not in content or 'Serviços relacionados' not in content:
            rel_path = str(arquivo.relative_to(BASE))

            if rel_path.startswith("pt/") or rel_path.startswith("pages/"):
                nav = gerar_nav_html(LINKS_PT, "Serviços relacionados")
            elif rel_path.startswith("ar-en/") or rel_path.startswith("en/"):
                nav = gerar_nav_html(LINKS_EN, "Related services")
            elif rel_path.startswith("ar-es/") or rel_path.startswith("es/"):
                nav = gerar_nav_html(LINKS_ES, "Servicios relacionados")
            elif rel_path.startswith("fr/"):
                nav = gerar_nav_html(LINKS_FR, "Services associés")
            elif rel_path.startswith("ar-pt/"):
                nav = gerar_nav_html(LINKS_PT, "Serviços relacionados")
            else:
                nav = gerar_nav_html(LINKS_EN, "Related services")

            content = content.replace("</footer>", nav + "\n</footer>", 1)
            stats["links_adicionados"] += 1
            modificado = True

        # ── SALVAR ──
        if modificado:
            arquivo.write_text(content, encoding="utf-8")

print("\n✅ Páginas processadas")

# ── 3. HREFLANG X-DEFAULT NA HOME ──
home = BASE / "index.html"
if home.exists():
    content = home.read_text(encoding="utf-8")
    if 'hreflang="x-default"' not in content:
        xdefault = f'  <link rel="alternate" hreflang="x-default" href="{SITE}/">'
        content = content.replace("</head>", xdefault + "\n</head>", 1)
        home.write_text(content, encoding="utf-8")
        print("✅ hreflang x-default adicionado na home")
    else:
        print("ℹ️  hreflang x-default já existe na home")

# ── 4. SITEMAP NO ROBOTS.TXT ──
robots = BASE / "robots.txt"
if robots.exists():
    content = robots.read_text(encoding="utf-8")
    if "Sitemap:" not in content:
        content += f"\nSitemap: {SITE}/sitemap.xml\n"
        robots.write_text(content, encoding="utf-8")
        print("✅ Sitemap adicionado no robots.txt")
    else:
        print("ℹ️  Sitemap já existe no robots.txt")
else:
    robots.write_text(f"User-agent: *\nAllow: /\n\nSitemap: {SITE}/sitemap.xml\n")
    print("✅ robots.txt criado com sitemap")

# ── RELATÓRIO FINAL ──
print("\n" + "="*55)
print("📊 RELATÓRIO SEO — iguacuexecutivetransfer.com.br")
print("="*55)
print(f"\n📁 Total de páginas auditadas:     {stats['total']}")
print(f"\n📋 FAQ Schema:")
print(f"   Adicionado agora:              {stats['faq_schema_adicionado']}")
print(f"   Já possuíam:                   {stats['faq_schema_ja_tinha']}")
print(f"   Total com FAQ schema:          {stats['faq_schema_adicionado'] + stats['faq_schema_ja_tinha']}")
print(f"\n🔗 Links internos adicionados:     {stats['links_adicionados']}")
print(f"\n🏷️  Metadata:")
print(f"   Com <title>:                   {stats['com_title']}/{stats['total']}")
print(f"   Com meta description:          {stats['com_description']}/{stats['total']}")
print(f"   Com og:image:                  {stats['com_og_image']}/{stats['total']}")
print(f"   Com canonical:                 {stats['com_canonical']}/{stats['total']}")

if stats["sem_title"]:
    print(f"\n❌ Sem title ({len(stats['sem_title'])}):")
    for p in stats["sem_title"][:5]:
        print(f"   {p}")

if stats["sem_description"]:
    print(f"\n❌ Sem description ({len(stats['sem_description'])}):")
    for p in stats["sem_description"][:5]:
        print(f"   {p}")

if stats["sem_og_image"]:
    print(f"\n❌ Sem og:image ({len(stats['sem_og_image'])}):")
    for p in stats["sem_og_image"][:5]:
        print(f"   {p}")

if stats["sem_canonical"]:
    print(f"\n❌ Sem canonical ({len(stats['sem_canonical'])}):")
    for p in stats["sem_canonical"][:5]:
        print(f"   {p}")

print("\n" + "="*55)
print("✅ UPGRADE CONCLUÍDO!")
print("="*55)
