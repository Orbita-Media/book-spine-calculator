"""Copy the shared files into extension/ and zip it for the Chrome Web Store."""
import shutil, zipfile
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
EXT = ROOT / "extension"
for name in ("app.js", "calc.js", "app.css", "data.js"):
    shutil.copy2(ROOT / "docs" / name, EXT / name)
out = ROOT / "dist" / "book-spine-calculator-extension.zip"
out.parent.mkdir(exist_ok=True)
with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
    for f in sorted(EXT.rglob("*")):
        if f.is_file():
            z.write(f, f.relative_to(EXT).as_posix())
print(out, out.stat().st_size)
