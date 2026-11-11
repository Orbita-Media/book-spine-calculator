"""Render the Chrome Web Store images of both extensions from the real popups.

Usage: python scripts/build_extension.py && python scripts/store_assets.py
Writes
  store/screenshot-<n>-<name>-<lang>-1280x800.png        Book Spine Width Calculator & ISBN Barcode
  store/isbn/screenshot-<n>-<name>-<lang>-1280x800.png   ISBN Barcode Generator
  store/isbn/promo-tile-440x280.png, extension-isbn/icons/icon<16|32|48|128>.png (from extension-isbn/icon.svg)
Needs: pip install playwright && playwright install chromium
"""
import base64
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
FONTS = ROOT / "docs" / "fonts"

# Each shot: (file name, setup of the popup, title, bullets). Setup: "cover", or the ISBN and add-on to type in.
TARGETS = {
    "spine": {
        "ext": ROOT / "extension", "store": ROOT / "store", "icon_svg": None,
        "shots": {
            "en": [
                ("spine", "cover", "Spine width and full cover size",
                 ["Spine from page count, trim size and paper", "Full cover with bleed, in inches or millimetres",
                  "Safe area, spine text and barcode position"]),
                ("isbn", ("978-3-98935-318-3", "51999"), "ISBN barcode for the back cover",
                 ["ISBN-13 (EAN-13) as SVG or PNG", "Optional 5-digit price add-on", "ISBN-10 converted automatically"]),
            ],
            "de": [
                ("spine", "cover", "Rückenbreite und Umschlaggröße",
                 ["Rücken aus Seitenzahl, Format und Papier", "Umschlag mit Beschnitt, in Millimetern oder Zoll",
                  "Sicherheitsabstand, Rückenschrift und Barcodefeld"]),
                ("isbn", ("978-3-98935-318-3", "51999"), "ISBN-Barcode für die Rückseite",
                 ["ISBN-13 (EAN-13) als SVG oder PNG", "Optionaler fünfstelliger Preis-Zusatz",
                  "ISBN-10 wird automatisch umgerechnet"]),
            ],
        },
    },
    "isbn": {
        "ext": ROOT / "extension-isbn", "store": ROOT / "store" / "isbn", "icon_svg": ROOT / "extension-isbn" / "icon.svg",
        "tile": ("ISBN Barcode Generator", "EAN-13 · SVG & PNG"),
        "shots": {
            "en": [
                ("barcode", ("978-3-98935-318-3", "51999"), "ISBN barcode generator for your book",
                 ["EAN-13 barcode from any ISBN-13 or ISBN-10", "Optional 5-digit price add-on (EAN-5)",
                  "Download as vector SVG or as PNG at 1200 dpi"]),
                ("isbn10", ("0-306-40615-2", ""), "ISBN-10 converted and checked",
                 ["ISBN-10 turned into ISBN-13 automatically", "Check digit verified as you type",
                  "ISBN line above the bars on or off"]),
                ("check", ("978-3-98935-318-4", ""), "A wrong check digit shows at once",
                 ["Typos show up before the barcode goes to print", "The correct check digit is shown right away",
                  "Everything runs inside the popup, no sign-in"]),
            ],
            "de": [
                ("barcode", ("978-3-98935-318-3", "51999"), "ISBN-Barcode-Generator für dein Buch",
                 ["EAN-13-Barcode aus jeder ISBN-13 oder ISBN-10", "Optionaler fünfstelliger Preis-Zusatz (EAN-5)",
                  "Download als Vektorgrafik (SVG) oder als PNG mit 1200 dpi"]),
                ("isbn10", ("0-306-40615-2", ""), "ISBN-10 umgerechnet und geprüft",
                 ["ISBN-10 wird automatisch zur ISBN-13", "Prüfziffer wird beim Tippen kontrolliert",
                  "ISBN-Zeile über den Strichen ein- oder ausblenden"]),
                ("check", ("978-3-98935-318-4", ""), "Falsche Prüfziffer? Sofort sichtbar",
                 ["Tippfehler fallen auf, bevor der Barcode in den Druck geht", "Die richtige Prüfziffer steht gleich dabei",
                  "Alles läuft im Popup, ohne Anmeldung"]),
            ],
        },
    },
}

FONT_CSS = """@font-face{{font-family:Sora;src:url('{f}/sora-latin.woff2') format('woff2')}}
@font-face{{font-family:Sora;src:url('{f}/sora-latin-ext.woff2') format('woff2');unicode-range:U+0100-024F}}
@font-face{{font-family:Manrope;src:url('{f}/manrope-latin.woff2') format('woff2')}}
@font-face{{font-family:Manrope;src:url('{f}/manrope-latin-ext.woff2') format('woff2');unicode-range:U+0100-024F}}"""

CANVAS = """<!doctype html><html><head><meta charset="utf-8"><style>{fonts}
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
.pop img{{display:block;height:auto;max-height:750px;width:auto;max-width:420px;object-fit:contain}}
</style></head><body>
<div class="txt"><div class="brand"><img src="{icon}" width="30" height="30" alt="">ShelfPublisher</div>
<h1>{title}</h1><ul>{items}</ul><div class="foot">{foot}</div></div>
<div class="pop"><img src="data:image/png;base64,{popup}" alt=""></div>
</body></html>"""

TILE = """<!doctype html><html><head><meta charset="utf-8"><style>{fonts}
html,body{{margin:0;width:440px;height:280px;overflow:hidden}}
body{{background:#071232;display:flex;align-items:center;gap:30px;padding:0 34px;box-sizing:border-box;color:#fff}}
h1{{font-family:Sora;font-weight:800;font-size:29px;line-height:1.15;margin:0 0 12px}}
p{{font-family:Sora;font-weight:600;font-size:15px;color:#16C8F0;margin:0}}
</style></head><body><img src="{icon}" width="96" height="96" alt=""><div><h1>{title}</h1><p>{sub}</p></div></body></html>"""

FOOT = {"en": "No sign-in · no tracking · works offline", "de": "Ohne Anmeldung · ohne Tracking · funktioniert offline"}


def render_html(browser, html, path, size, tmp_dir):
    tmp = tmp_dir / "_canvas.html"
    tmp.write_text(html, encoding="utf-8")
    page = browser.new_page(viewport={"width": size[0], "height": size[1]}, device_scale_factor=1)
    page.goto(tmp.as_uri())
    page.evaluate("document.fonts.ready")
    page.wait_for_timeout(400)
    page.screenshot(path=str(path))
    page.close()
    tmp.unlink()
    print(path)


def icons(browser, svg_path, ext):
    svg = svg_path.read_text(encoding="utf-8")
    for px in (16, 32, 48, 128):
        page = browser.new_page(viewport={"width": px, "height": px}, device_scale_factor=1)
        page.set_content("<style>html,body{margin:0;background:transparent}</style>"
                         + svg.replace("<svg ", f'<svg width="{px}" height="{px}" ', 1))
        out = ext / "icons" / f"icon{px}.png"
        out.parent.mkdir(exist_ok=True)
        page.screenshot(path=str(out), omit_background=True)
        page.close()
        print(out)


def popup_png(browser, ext, lang, setup):
    page = browser.new_page(viewport={"width": 420, "height": 900}, device_scale_factor=2, locale=lang)
    page.goto((ext / "popup.html").as_uri())
    page.wait_for_selector("#calc .pane")
    if setup != "cover":
        if page.locator("#calc .tabs").count():
            page.locator("#calc .tabs button").nth(1).click()
        page.fill("#isbn", setup[0])
        if setup[1]:
            page.fill("#addon", setup[1])
        page.locator("#isbn").blur()
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
    fonts = FONT_CSS.format(f=FONTS.as_uri())
    with sync_playwright() as p:
        browser = p.chromium.launch()
        for t in TARGETS.values():
            ext, store = t["ext"], t["store"]
            store.mkdir(parents=True, exist_ok=True)
            if t["icon_svg"]:
                icons(browser, t["icon_svg"], ext)
            icon = (ext / "icons" / "icon128.png").as_uri()
            if t.get("tile"):
                render_html(browser, TILE.format(fonts=fonts, icon=icon, title=t["tile"][0], sub=t["tile"][1]),
                            store / "promo-tile-440x280.png", (440, 280), store)
            for lang, shots in t["shots"].items():
                for n, (name, setup, title, bullets) in enumerate(shots, 1):
                    html = CANVAS.format(fonts=fonts, icon=icon, title=title,
                                         items="".join(f"<li>{b}</li>" for b in bullets),
                                         foot=FOOT[lang], popup=popup_png(browser, ext, lang, setup))
                    render_html(browser, html, store / f"screenshot-{n}-{name}-{lang}-1280x800.png", (1280, 800), store)
        browser.close()


if __name__ == "__main__":
    main()
