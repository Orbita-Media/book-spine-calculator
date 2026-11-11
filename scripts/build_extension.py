"""Build both Chrome extensions from the shared code and zip them for the Chrome Web Store.

  extension/       Book Spine Width Calculator & ISBN Barcode – ShelfPublisher
  extension-isbn/  ISBN Barcode Generator – ShelfPublisher (ISBN tab only, no spine data)

Shared sources: docs/ (calculator, styles, fonts) and shared/ (popup styles, brand marks of the popup footer).
Each extension folder keeps its own manifest, popup.html, _locales and icons; the rest is copied in here,
so every folder can also be loaded unpacked. Usage: python scripts/build_extension.py
"""
import json
import shutil
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOCS, SHARED, DIST = ROOT / "docs", ROOT / "shared", ROOT / "dist"

TARGETS = {
    "extension": {"zip": "book-spine-calculator-extension", "files": ("app.js", "calc.js", "app.css", "data.js")},
    "extension-isbn": {"zip": "isbn-barcode-generator-extension", "files": ("app.js", "calc.js", "app.css")},
}


def build(folder, spec):
    ext = ROOT / folder
    for name in spec["files"]:
        shutil.copy2(DOCS / name, ext / name)
    for sub, src in (("fonts", DOCS / "fonts"), ("brands", SHARED / "brands")):
        shutil.rmtree(ext / sub, ignore_errors=True)
        shutil.copytree(src, ext / sub)
    shutil.copy2(SHARED / "popup.css", ext / "popup.css")
    version = json.loads((ext / "manifest.json").read_text(encoding="utf-8"))["version"]
    out = DIST / f"{spec['zip']}-{version}.zip"
    DIST.mkdir(exist_ok=True)
    with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
        for f in sorted(ext.rglob("*")):
            if f.is_file() and f.name != "icon.svg":
                z.write(f, f.relative_to(ext).as_posix())
    print(out, out.stat().st_size)
    return out


if __name__ == "__main__":
    for folder, spec in TARGETS.items():
        build(folder, spec)
