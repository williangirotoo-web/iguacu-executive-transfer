#!/usr/bin/env python3
# Script para remover preços das páginas geradas
import os
from pathlib import Path

BASE = Path(os.path.expanduser("~/Documents/iguacu-site"))
WA_NUMBER = "5545999164059"
SITE_URL = "https://iguacuexecutivetransfer.com.br"

# Botão WhatsApp por idioma
WA_LABELS = {
    "en": "Request Quote",
    "fr": "Demander un Devis",
    "es": "Solicitar Cotización",
    "de": "Angebot anfordern",
    "it": "Richiedi Preventivo",
    "nl": "Offerte aanvragen",
    "pl": "Zapytaj o wycenę",
    "ru": "Запросить цену",
    "ar": "طلب عرض سعر",
    "ko": "견적 요청",
}

CSS_ANTIGO = """.service-price{text-align:right;flex-shrink:0}
    .price-label{font-size:0.55rem;letter-spacing:0.15em;text-transform:uppercase;color:rgba(212,175,55,0.5);display:block;margin-bottom:2px}
    .price-value{font-family:'Cormorant Garamond',serif;font-size:1.2rem;font-weight:600;color:var(--gold);white-space:nowrap;display:block}
    .price-note{font-size:0.58rem;color:var(--muted);display:block}"""

CSS_NOVO = """.service-price{flex-shrink:0}
    .service-wa-btn{display:inline-flex;align-items:center;background:rgba(37,211,102,0.1);border:1px solid rgba(37,211,102,0.3);color:#25d366;font-size:0.6rem;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;padding:8px 14px;border-radius:1px;text-decoration:none;white-space:nowrap;transition:all 0.3s}
    .service-wa-btn:hover{background:rgba(37,211,102,0.2);border-color:#25d366}"""

total = 0
erros = 0

for lang_code, label in WA_LABELS.items():
    lang_dir = BASE / lang_code
    if not lang_dir.exists():
        continue
    
    wa_msg = f"Hello! I found your website and would like a quote for transfer services."
    wa_url = f"https://wa.me/{WA_NUMBER}?text={wa_msg.replace(' ', '%20')}"
    btn_html = f'<a href="{wa_url}" target="_blank" class="service-wa-btn">{label}</a>'
    
    for html_file in lang_dir.glob("*.html"):
        with open(html_file, "r", encoding="utf-8") as f:
            content = f.read()
        
        original = content
        
        # Remover divs de preço — procura padrão
        import re
        content = re.sub(
            r'<div class="service-price">\s*<span class="price-label">[^<]*</span>\s*<span class="price-value">[^<]*</span>\s*<span class="price-note">[^<]*</span>\s*</div>',
            f'<div class="service-price">{btn_html}</div>',
            content
        )
        
        # Atualizar CSS
        content = re.sub(
            r'\.service-price\{text-align:right;flex-shrink:0\}.*?\.price-note\{font-size:0\.58rem;color:var\(--muted\);display:block\}',
            CSS_NOVO,
            content,
            flags=re.DOTALL
        )
        
        if content != original:
            with open(html_file, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"✅ {lang_code}/{html_file.name}")
            total += 1
        else:
            print(f"⚠️  {lang_code}/{html_file.name} — sem alteração")
            erros += 1

print(f"\n✅ {total} arquivos atualizados")
if erros:
    print(f"⚠️  {erros} arquivos sem alteração (verificar manualmente)")
