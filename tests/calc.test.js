// node tests/calc.test.js – compares the calculator with results computed by
// the Shelf Publisher portal itself (tests/vectors.json, scripts/export_data.py).
const assert = require("assert");
const DATA = require("../docs/data.js");
const C = require("../docs/calc.js");
const vectors = require("./vectors.json");

let n = 0;
for (const v of vectors) {
  const fmt = DATA.formats.find((f) => f.code === v.format);
  const lay = C.coverLayout(DATA, fmt, v.pages, v.paper);
  const tag = `${v.format}/${v.paper}/${v.pages}`;
  assert.strictEqual(lay.spineMm, v.spineMm, `spine ${tag}`);
  assert.ok(Math.abs(lay.coverWidthMm - v.coverWidthMm) < 1e-6, `width ${tag}: ${lay.coverWidthMm} vs ${v.coverWidthMm}`);
  assert.ok(Math.abs(lay.coverHeightMm - v.coverHeightMm) < 1e-6, `height ${tag}`);
  assert.strictEqual(lay.spineTextAllowed, v.spineTextAllowed, `spine text ${tag}`);
  assert.ok(Math.abs(lay.spineSafetyMm - v.spineSafetyMm) < 1e-9, `spine safety ${tag}`);
  n++;
}

// Printer's own template: 6 x 9 in, 220 pages, white 50 lb.
assert.strictEqual(C.evenPages(221), 222);

// ISBN checks (examples from the ISBN Users' Manual and well-known books).
assert.deepStrictEqual(C.parseIsbn("978-0-306-40615-7"), { ok: true, isbn13: "9780306406157", converted: false });
assert.strictEqual(C.parseIsbn("0-306-40615-2").isbn13, "9780306406157");
assert.strictEqual(C.parseIsbn("978-0-306-40615-8").error, "check13");
assert.strictEqual(C.parseIsbn("080442957X").isbn13, "9780804429573");
assert.strictEqual(C.parseIsbn("12345").error, "length");
assert.strictEqual(C.parseIsbn("4006381333931").error, "prefix");

// EAN-13 structure: 95 modules, guards in place.
const m = C.ean13Modules("9780306406157");
assert.strictEqual(m.length, 95);
assert.ok(m.startsWith("101") && m.endsWith("101") && m.slice(45, 50) === "01010");
// EAN-5 add-on 52495 (US price $24.95): check digit (3*(5+4+5)+9*(2+9))%10 = 1.
assert.strictEqual(C.addon5Check("52495"), 1);
assert.strictEqual(C.addon5Modules("52495").length, 47);
assert.strictEqual(C.isbnLabel("978-3-98935-318-3", "9783989353183"), "ISBN 978-3-98935-318-3");
assert.strictEqual(C.isbnLabel("9783989353183", "9783989353183"), "ISBN 9783989353183");

console.log(`ok: ${n} layouts equal to the portal, ISBN and barcode checks passed`);
