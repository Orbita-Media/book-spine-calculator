"""Render the Chrome Web Store screenshots (1280x800) from the real extension popup.

Usage: python scripts/store_screenshots.py
Writes store/screenshot-<n>-<name>-<lang>-1280x800.png for EN and DE.
Needs: pip install playwright && playwright install chromium
"""
import base64
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
EXT = ROOT / "extension"
STORE = ROOT / "store"

SHOTS = {
    "en": [
        ("spine", "cover", "Spine width and full cover size",
         ["Spine from page count, trim size and paper", "Full cover with bleed, in inches or millimetres",
          "Safe area, spine text and barcode position"]),
        ("isbn", "isbn", "ISBN barcode for the back cover",
         ["ISBN-13 (EAN-13) as a vector SVG", "Optional 5-digit price add-on", "ISBN-10 converted automatically"]),
    ],
    "de": [
        ("spine", "cover", "Rückenbreite und Umschlaggröße",
         ["Rücken aus Seitenzahl, Format und Papier", "Umschlag mit Beschnitt, in Millimetern oder Zoll",
          "Sicherheitsabstand, Rückenschrift und Barcodefeld"]),
        ("isbn", "isbn", "ISBN-Barcode für die Rückseite",
         ["ISBN-13 (EAN-13) als Vektorgrafik (SVG)", "Optionaler fünfstelliger Preis-Zusatz",
          "ISBN-10 wird automatisch umgerechnet"]),
    ],
}

CANVAS = """<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{{font-family:Sora;src:url('{fonts}/sora-latin.woff2') format('woff2')}}
@font-face{{font-family:Sora;src:url('{fonts}/sora-latin-ext.woff2') format('woff2');unicode-range:U+0100-024F}}
@font-face{{font-family:Manrope;src:url('{fonts}/manrope-latin.woff2') format('woff2')}}
@font-face{{font-family:Manrope;src:url('{fonts}/manrope-latin-ext.woff2') format('woff2');unicode-range:U+0100-024F}}
html,body{{margin:0;width:1280px;height:800px;overflow:hidden}}
body{{background:linear-gradient(135deg,#071232 0%,#0d1f55 100%);display:flex;align-items:center;gap:64px;
padding:0 72px;box-sizing:border-box;font-family:Manrope,system-ui,sans-serif;color:#fff}}
.txt{{flex:1}}
.brand{{display:flex;align-items:center;gap:10px;font-family:Sora;font-weight:600;font-size:20px;color:#16C8F0;margin-bottom:28px}}
h1{{font-family:Sora;font-weight:700;font-size:44px;line-height:1.15;margin:0 0 28px}}
ul{{list-style:none;padding:0;margin:0}}
li{{font-size:21px;line-height:1.4;margin:0 0 14px;padding-left:30px;position:relative;color:#dfe7ff}}
li:before{{content:"";position:absolute;left:0;top:10px;width:12px;height:12px;border-radius:3px;background:#2A5BFF}}
.foot{{margin-top:34px;font-size:16px;color:#9fb0dd}}
.pop{{border-radius:14px;overflow:hidden;box-shadow:0 24px 60px rgba(0,0,0,.45);background:#fff;flex:none}}
.pop img{{display:block;width:420px;height:auto;max-height:720px;object-fit:contain;width:auto;max-width:420px}}
</style></head><body>
<div class="txt"><div class="brand"><img src="{icon}" width="30" height="30" alt="">ShelfPublisher</div>
<h1>{title}</h1><ul>{items}</ul><div class="foot">{foot}</div></div>
<div class="pop"><img src="data:image/png;base64,{popup}" alt=""></div>
</body></html>"""

FOOT = {"en": "No sign-in · no tracking · works offline", "de": "Ohne Anmeldung · ohne Tracking · funktioniert offline"}


def popup_png(browser, lang, tab):
    page = browser.new_page(viewport={"width": 420, "height": 900}, device_scale_factor=2, locale=lang)
    page.goto((EXT / "popup.html").as_uri())
    page.wait_for_selector("#calc .tabs")
    if tab == "isbn":
        page.locator("#calc .tabs button").nth(1).click()
        page.fill("#isbn", "978-3-98935-318-3")
        page.fill("#addon", "51999")
    page.evaluate("document.fonts.ready")
    page.wait_for_timeout(600)
    h = page.evaluate("Math.ceil(document.body.getBoundingClientRect().bottom)")
    page.set_viewport_size({"width": 420, "height": h})
    page.wait_for_timeout(300)
    h = page.evaluate("Math.ceil(document.body.getBoundingClientRect().bottom)")
    png = page.screenshot(clip={"x": 0, "y": 0, "width": 420, "height": h})
    page.close()
    return base64.b64encode(png).decode()


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        for lang, shots in SHOTS.items():
            for n, (name, tab, title, bullets) in enumerate(shots, 1):
                html = CANVAS.format(fonts=(EXT / "fonts").as_uri(), icon=(EXT / "icons" / "icon128.png").as_uri(),
                                     title=title, items="".join(f"<li>{b}</li>" for b in bullets),
                                     foot=FOOT[lang], popup=popup_png(browser, lang, tab))
                tmp = STORE / "_canvas.html"
                tmp.write_text(html, encoding="utf-8")
                page = browser.new_page(viewport={"width": 1280, "height": 800}, device_scale_factor=1)
                page.goto(tmp.as_uri())
                page.evaluate("document.fonts.ready")
                page.wait_for_timeout(400)
                out = STORE / f"screenshot-{n}-{name}-{lang}-1280x800.png"
                page.screenshot(path=str(out))
                page.close()
                tmp.unlink()
                print(out)
        browser.close()


if __name__ == "__main__":
    main()
