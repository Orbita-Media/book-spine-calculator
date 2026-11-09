# Chrome Web Store listing

Package: `python scripts/build_extension.py` → `dist/book-spine-calculator-extension.zip` (attached to GitHub release v1.0.1, the version submitted to the store).

## Store item
- **Name (from manifest, EN):** Book Spine Width Calculator & ISBN Barcode – ShelfPublisher
- **Name (DE):** Buchrücken-Rechner & ISBN-Barcode – ShelfPublisher
- **Category:** Tools
- **Language:** English (German via `_locales/de`)
- **Homepage:** https://orbita-media.github.io/book-spine-calculator/
- **Support URL:** https://github.com/Orbita-Media/book-spine-calculator/issues
- **Images:** `icons/icon128.png`, screenshots `store/screenshot-1-spine-<lang>-1280x800.png` and `store/screenshot-2-isbn-<lang>-1280x800.png` (EN for the default listing, DE for the German one; rendered from the real popup with `python scripts/store_screenshots.py`), small promo tile `store/promo-tile-440x280.png`

## Description (EN)
Work out the spine width and the full cover size of your paperback before you design the cover, and create the ISBN barcode for the back.

- Spine width from page count, trim size and paper, in millimetres and inches
- Full cover size with bleed: back cover, spine and front cover side by side
- Safe area, whether the spine can carry text, and where the barcode field goes
- ISBN-13 barcode (EAN-13) as a vector SVG, with an optional 5-digit price add-on; ISBN-10 is converted automatically

The figures are the print specifications ShelfPublisher uses to check every cover on upload, for international and European print on demand. Other printers can differ by fractions of a millimetre, so build the final cover on your printer's template.

No sign-in, no tracking, no network requests: everything is calculated inside the popup. Open source: https://github.com/Orbita-Media/book-spine-calculator

## Beschreibung (DE)
Rückenbreite und Umschlaggröße deines Taschenbuchs ausrechnen, bevor du den Umschlag gestaltest, und den ISBN-Barcode für die Rückseite erzeugen.

- Rückenbreite aus Seitenzahl, Format und Papier, in Millimetern und Zoll
- Umschlaggröße mit Beschnitt: Rückseite, Rücken und Vorderseite nebeneinander
- Sicherheitsabstand, ob Schrift auf den Rücken darf und wohin das Barcodefeld kommt
- ISBN-13-Barcode (EAN-13) als Vektorgrafik (SVG), mit optionalem fünfstelligem Preis-Zusatz; eine ISBN-10 wird automatisch umgerechnet

Die Werte sind die Druckvorgaben, mit denen ShelfPublisher jeden Umschlag beim Hochladen prüft, für den internationalen und den europäischen Druck auf Bestellung. Andere Druckereien können um Bruchteile eines Millimeters abweichen; den endgültigen Umschlag auf der Vorlage der eigenen Druckerei bauen.

Ohne Anmeldung, ohne Tracking, ohne Netzwerkzugriff: Alles wird im Popup berechnet. Quellcode: https://github.com/Orbita-Media/book-spine-calculator

## Privacy practices (developer dashboard)
- **Single purpose:** Calculate the spine width and cover size of a paperback and generate its ISBN barcode.
- **Permissions:** none requested (no host permissions, no content scripts, no storage).
- **Remote code:** no.
- **Data usage:** the extension does not collect or transmit any user data. All boxes "not collected".
- **Privacy policy URL:** https://shelfpublisher.com/legal/privacy

## Publisher
- Developer account: Orbita Media GmbH (Google account kontakt@orbita-media.de, publisher ID 89cecae7-b072-4478-a49e-38b6529ba849), trader declared and verified via the Google payments profile of Orbita Media GmbH
- Contact e-mail (public): kontakt@orbita-media.de
- Official URL: shelfpublisher.com (verified site)
- Item ID: cklbcmnmdbppgflochaigdpjpddencbl, store page after approval: https://chromewebstore.google.com/detail/cklbcmnmdbppgflochaigdpjpddencbl
- Submitted for review on 2026-11-09 with version 1.0.1, published automatically after approval
