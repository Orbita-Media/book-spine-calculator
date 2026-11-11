# Book Spine Width Calculator 2027 – cover size and ISBN barcode

**Live:** https://orbita-media.github.io/book-spine-calculator/ · Deutsch: https://orbita-media.github.io/book-spine-calculator/de/

A free calculator for self-publishers and small publishers:

- **Spine width** of a paperback from page count, trim size and paper (mm and inches)
- **Full cover size** with bleed: back cover + spine + front cover, ready to set up your cover file
- **Safe area, spine text rule and barcode field** on the back cover
- **ISBN-13 barcode** (EAN-13, optional 5-digit price add-on) as a vector SVG or a PNG at 1200 dpi; ISBN-10 is converted automatically

Nothing is sent anywhere: no cookies, no tracking, no network requests. The same code ships as two Chrome extensions (Manifest V3, popup only, no permissions):

- [`extension/`](extension/): **Book Spine Width Calculator & ISBN Barcode – ShelfPublisher** ([Chrome Web Store](https://chromewebstore.google.com/detail/cklbcmnmdbppgflochaigdpjpddencbl))
- [`extension-isbn/`](extension-isbn/): **ISBN Barcode Generator – ShelfPublisher**, the barcode on its own

Both popups end with two links, to ShelfPublisher (publishing and distribution) and Bookfairy (tools to write the book, design the cover, find the blurb), with UTM parameters; nothing is loaded until you click.

## Where the figures come from

The spine and cover figures are the print specifications of [ShelfPublisher](https://shelfpublisher.com/?utm_source=github&utm_medium=readme&utm_campaign=spine-calculator) for international and European print on demand – the same catalogue its portal uses to check every cover on upload (spine table page by page for white 50 lb paper, paper caliper otherwise, cover bleed and spine allowance per print route). `scripts/export_data.py` exports them, and `tests/calc.test.js` checks the calculator against 230 layouts computed by the portal itself.

| Book | Paper | Spine | Full cover with bleed |
|---|---|---|---|
| 6 × 9 in, 220 pages | White 50 lb, international | 11.80 mm · 0.465 in | 322.95 × 234.95 mm |
| 5 × 8 in, 300 pages | White 50 lb, international | 15.97 mm · 0.629 in | 276.32 × 209.55 mm |
| A5, 300 pages | White 90 gsm, European | 18.60 mm · 0.732 in | 324.60 × 220.00 mm |

Other printers can differ by fractions of a millimetre. Build the final cover on the template of the printer that prints your book.

## Formula

```
spine  = even page count × thickness per page (+ cover allowance of the print route)
width  = bleed + trim width + spine + trim width + bleed
height = bleed + trim height + bleed
```

## Run locally

```
python -m http.server --directory docs 8000     # web page
node tests/calc.test.js                         # tests
python scripts/build_extension.py               # both extensions -> dist/*-<version>.zip
python scripts/store_assets.py                   # store screenshots, ISBN icons and promo tile from the real popups
```

## Related

- [Publishing guides 2027](https://orbita-media.github.io/publishing-guides-2027/) – free presentations: how to get your book into bookstores, how to stop ebook piracy on Shopify, publishing a book as a creator
- [ShelfPublisher](https://shelfpublisher.com/get-your-book-into-bookstores?utm_source=github&utm_medium=readme&utm_campaign=spine-calculator) – your paperback under a publishing house imprint, listed in the catalogs 50,000+ bookstores order from

Made by ShelfPublisher, Orbita Media GmbH, Hamburg. Code: MIT licence. Fonts (Sora, Manrope): SIL Open Font License.
