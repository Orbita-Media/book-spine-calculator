# Chrome Web Store listing – ISBN Barcode Generator

Second extension from the same code (`extension-isbn/`, ISBN tab only, no spine data).
Package: `python scripts/build_extension.py` → `dist/isbn-barcode-generator-extension-<version>.zip` (attached to the GitHub release `isbn-v<version>`). Store images: `python scripts/store_assets.py`.

## Search terms (Chrome Web Store, measured 2026-11-11)
"isbn barcode generator" 0 results, "ISBN barcode" 9 (our spine calculator first, otherwise label, QR and seller tools), "ean-13 barcode" 10 and "barcode generator" 10 (general barcode generators), "isbn generator" 3 (citation tools), "ean 13 buch" and "isbn barcode erstellen" 0. No item had "ISBN Barcode Generator" in its name, so name, summary and first sentence carry it.

## Store item
- **Name (from manifest, EN):** ISBN Barcode Generator – ShelfPublisher
- **Name (DE):** ISBN-Barcode-Generator – ShelfPublisher
- **Summary (EN):** Create an ISBN barcode (EAN-13) for your book's back cover, with price add-on, as SVG or PNG. No sign-in, no data collected.
- **Summary (DE):** ISBN-Barcode (EAN-13) für die Buchrückseite erstellen, mit Preis-Zusatz, als SVG oder PNG. Ohne Anmeldung, keine Datenerhebung.
- **Category:** Tools
- **Language:** English (German via `_locales/de`)
- **Homepage:** https://orbita-media.github.io/book-spine-calculator/
- **Support URL:** https://github.com/Orbita-Media/book-spine-calculator/issues
- **Images:** `extension-isbn/icons/icon128.png` (from `extension-isbn/icon.svg`), screenshots `store/isbn/screenshot-1-barcode-<lang>-1280x800.png`, `screenshot-2-isbn10-<lang>-…`, `screenshot-3-check-<lang>-…` (EN for the default listing, DE for the German one), small promo tile `store/isbn/promo-tile-440x280.png`

## Description (EN)
ISBN Barcode Generator: create the EAN-13 barcode for the back cover of your book in seconds, right in your browser.

- Enter an ISBN-13 or an ISBN-10: the check digit is verified, and an ISBN-10 is converted to ISBN-13 automatically
- EAN-13 ISBN barcode at nominal size (100 %), with the readable ISBN line above the bars (can be switched off)
- Optional 5-digit price add-on (EAN-5), for example 51999 for $19.99 or 90000 for no price
- Download as a vector SVG for your cover file or as a PNG at 1200 dpi
- For paperbacks, hardcovers and every printed book, whichever printer you use

No sign-in, no tracking, no network requests: the barcode is generated inside the popup. Open source: https://github.com/Orbita-Media/book-spine-calculator

From ShelfPublisher, which checks spine, bleed and barcode on upload and lists your paperback in the catalogs 50,000+ bookstores order from. For the rest of your book, Bookfairy has the tools to write it, design the cover and find the blurb; with a free account every tool first shows you a free preview of your own book.

Also by us: Book Spine Width Calculator & ISBN Barcode – ShelfPublisher, for the spine width and the full cover size.

## Beschreibung (DE)
ISBN-Barcode-Generator: den EAN-13-Barcode für die Rückseite deines Buchs in Sekunden erstellen, direkt im Browser.

- ISBN-13 oder ISBN-10 eingeben: Die Prüfziffer wird kontrolliert, eine ISBN-10 automatisch in eine ISBN-13 umgerechnet
- EAN-13-Barcode für Bücher in Nenngröße (100 %), mit lesbarer ISBN-Zeile über den Strichen (abschaltbar)
- Optionaler fünfstelliger Preis-Zusatz (EAN-5), etwa 51999 für 19,99 US-Dollar oder 90000 ohne Preisangabe
- Download als Vektorgrafik (SVG) für die Umschlagdatei oder als PNG mit 1200 dpi
- Für Taschenbuch, Hardcover und jedes gedruckte Buch, bei jeder Druckerei

Ohne Anmeldung, ohne Tracking, ohne Netzwerkzugriff: Der Barcode entsteht im Popup. Quellcode: https://github.com/Orbita-Media/book-spine-calculator

Von ShelfPublisher: prüft Rücken, Beschnitt und Barcode beim Hochladen und listet dein Taschenbuch in den Katalogen, aus denen über 50.000 Buchhandlungen bestellen. Für den Rest deines Buchs hat Bookfairy die Werkzeuge: Buch schreiben, Cover gestalten, Klappentext finden; mit kostenlosem Konto zeigt dir jedes Werkzeug zuerst eine Gratis-Vorschau aus deinem eigenen Buch.

Ebenfalls von uns: Buchrücken-Rechner & ISBN-Barcode – ShelfPublisher, für Rückenbreite und Umschlaggröße.

## Privacy practices (developer dashboard)
- **Single purpose:** Generate the ISBN barcode (EAN-13 with optional EAN-5 price add-on) for the back cover of a book.
- **Permissions:** none requested (no host permissions, no content scripts, no storage). The two links at the bottom of the popup (ShelfPublisher, Bookfairy) only open a new tab when clicked; they carry UTM parameters (campaign `isbn-barcode`), nothing about the user.
- **Remote code:** no.
- **Data usage:** the extension does not collect or transmit any user data. All boxes "not collected".
- **Privacy policy URL:** https://shelfpublisher.com/legal/privacy

## Publisher
- Developer account: Orbita Media GmbH (publisher ID 89cecae7-b072-4478-a49e-38b6529ba849), see `store/LISTING.md`
- Official URL: shelfpublisher.com (verified site)
- Item ID: nfgjobkjiidgebfmjohbmaldliibkkdj (submitted for review 2026-11-11, version 1.0.0, status "Überprüfung ausstehend", auto-publish after approval)
