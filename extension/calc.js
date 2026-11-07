/* Book spine width, cover size and ISBN barcode - calculation core.
 * Same arithmetic as the Shelf Publisher portal (app/services/formats.py),
 * checked against its own results in tests/calc.test.js.
 * No network access, no storage. */
(function (root) {
  "use strict";
  const MM_PER_IN = 25.4;

  function round2(x) {
    // Decimal ROUND_HALF_UP to 0.01 mm, as the portal does.
    return Math.round(x * 100 + 1e-7) / 100;
  }

  function evenPages(n) {
    n = Math.floor(n);
    return n % 2 === 0 ? n : n + 1;
  }

  function paperByCode(data, code) {
    return data.papers.find((p) => p.code === code);
  }

  function spineMm(data, pages, paperCode) {
    const paper = paperByCode(data, paperCode);
    const channel = data.channels[paper.channel];
    const even = evenPages(pages);
    const [lo, hi] = data.spineTableRange;
    let block;
    if (paper.table && even >= lo && even <= hi) {
      block = data.spineTable[String(even)] * MM_PER_IN;
    } else {
      block = even * paper.caliperMm;
    }
    return round2(block + channel.paperbackSpineExtraMm);
  }

  function coverLayout(data, fmt, pages, paperCode) {
    const paper = paperByCode(data, paperCode);
    const ch = data.channels[paper.channel];
    const spine = spineMm(data, pages, paperCode);
    const bleed = ch.coverBleedMm;
    const w = fmt.widthMm, h = fmt.heightMm;
    const even = evenPages(pages);
    const ss = data.spineSafety;
    return {
      pages: even,
      spineMm: spine,
      bleedMm: bleed,
      safetyMm: ch.safetyMm,
      trimWidthMm: w,
      trimHeightMm: h,
      coverWidthMm: w * 2 + spine + bleed * 2,
      coverHeightMm: h + bleed * 2,
      spineSafetyMm: spine >= ss.thresholdMm ? ss.wideMm : ss.narrowMm,
      spineTextAllowed: !(ch.spineTextMinPages && even < ch.spineTextMinPages),
      minPages: paper.minPages,
      maxPages: paper.maxPages,
      barcode: data.barcodeField,
    };
  }

  // ── ISBN ────────────────────────────────────────────────────────────────
  function digitsOnly(s) {
    return String(s || "").toUpperCase().replace(/[^0-9X]/g, "");
  }

  function isbn13Check(first12) {
    let sum = 0;
    for (let i = 0; i < 12; i++) sum += Number(first12[i]) * (i % 2 ? 3 : 1);
    return String((10 - (sum % 10)) % 10);
  }

  function isbn10Check(first9) {
    let sum = 0;
    for (let i = 0; i < 9; i++) sum += Number(first9[i]) * (10 - i);
    const c = (11 - (sum % 11)) % 11;
    return c === 10 ? "X" : String(c);
  }

  /** Returns {ok, isbn13, error, converted} for any ISBN-10/13 input. */
  function parseIsbn(input) {
    const d = digitsOnly(input);
    if (d.length === 10) {
      if (!/^\d{9}[\dX]$/.test(d)) return { ok: false, error: "format" };
      if (isbn10Check(d.slice(0, 9)) !== d[9]) {
        return { ok: false, error: "check10", expected: isbn10Check(d.slice(0, 9)) };
      }
      const twelve = "978" + d.slice(0, 9);
      return { ok: true, isbn13: twelve + isbn13Check(twelve), converted: true };
    }
    if (d.length === 13) {
      if (!/^\d{13}$/.test(d)) return { ok: false, error: "format" };
      if (!/^97[89]/.test(d)) return { ok: false, error: "prefix" };
      const c = isbn13Check(d.slice(0, 12));
      if (c !== d[12]) return { ok: false, error: "check13", expected: c };
      return { ok: true, isbn13: d, converted: false };
    }
    return { ok: false, error: d.length ? "length" : "empty" };
  }

  // ── EAN-13 and EAN-5 ────────────────────────────────────────────────────
  const L = ["0001101", "0011001", "0010011", "0111101", "0100011", "0110001", "0101111", "0111011", "0110111", "0001011"];
  const G = ["0100111", "0110011", "0011011", "0100001", "0011101", "0111001", "0000101", "0010001", "0001001", "0010111"];
  const R = ["1110010", "1100110", "1101100", "1000010", "1011100", "1001110", "1010000", "1000100", "1001000", "1110100"];
  const PARITY = ["LLLLLL", "LLGLGG", "LLGGLG", "LLGGGL", "LGLLGG", "LGGLLG", "LGGGLL", "LGLGLG", "LGLGGL", "LGGLGL"];
  const ADDON5_PARITY = ["GGLLL", "GLGLL", "GLLGL", "GLLLG", "LGGLL", "LLGGL", "LLLGG", "LGLGL", "LGLLG", "LLGLG"];

  /** Module string (1 = bar) of an EAN-13, 95 modules. */
  function ean13Modules(code) {
    const first = Number(code[0]);
    let m = "101";
    for (let i = 1; i <= 6; i++) m += (PARITY[first][i - 1] === "L" ? L : G)[Number(code[i])];
    m += "01010";
    for (let i = 7; i <= 12; i++) m += R[Number(code[i])];
    return m + "101";
  }

  function addon5Check(d) {
    return (3 * (+d[0] + +d[2] + +d[4]) + 9 * (+d[1] + +d[3])) % 10;
  }

  /** Module string of a 5-digit add-on (price code), 47 modules. */
  function addon5Modules(d) {
    const par = ADDON5_PARITY[addon5Check(d)];
    let m = "1011";
    for (let i = 0; i < 5; i++) {
      m += (par[i] === "L" ? L : G)[Number(d[i])];
      if (i < 4) m += "01";
    }
    return m;
  }

  /** Hyphens as typed by the user, if they spell the same digits; else plain. */
  function isbnLabel(input, isbn13) {
    const typed = String(input || "").trim().replace(/^ISBN[:\s-]*/i, "");
    if (typed.replace(/[^0-9]/g, "") === isbn13 && /^[0-9][0-9 -]+[0-9]$/.test(typed)) {
      return "ISBN " + typed.replace(/ /g, "-");
    }
    return "ISBN " + isbn13;
  }

  /** SVG of the ISBN barcode: ISBN line, bars, digits, optional add-on. */
  function barcodeSvg(isbn13, opts) {
    opts = opts || {};
    const x = 0.33;               // module width in mm (EAN nominal size, 100 %)
    const quietL = 11 * x, quietR = 7 * x;
    const barH = 22.85;           // nominal bar height in mm
    const guardExtra = 1.65;
    const textH = 2.75;
    const top = opts.label === false ? 0 : 4.2;
    const main = ean13Modules(isbn13);
    const addon = opts.addon && /^\d{5}$/.test(opts.addon) ? addon5Modules(opts.addon) : "";
    const gap = addon ? 9 * x : 0;
    const width = quietL + main.length * x + (addon ? gap + addon.length * x + 5 * x : quietR);
    const height = top + barH + guardExtra + textH + 1.2;
    const font = "font-family:'OCR-B','OCR B','Consolas','Menlo',monospace";
    const parts = [];
    parts.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${width.toFixed(2)}mm" height="${height.toFixed(2)}mm" viewBox="0 0 ${width.toFixed(3)} ${height.toFixed(3)}">`);
    parts.push(`<rect width="100%" height="100%" fill="#fff"/>`);
    if (top) {
      const label = opts.labelText || ("ISBN " + isbn13);
      parts.push(`<text x="${(quietL + 47.5 * x).toFixed(3)}" y="${(top - 1).toFixed(3)}" font-size="2.6" text-anchor="middle" style="${font}" fill="#000">${label}</text>`);
    }
    const guards = new Set([0, 1, 2, 45, 46, 47, 48, 49, 92, 93, 94]);
    let i = 0;
    while (i < main.length) {
      if (main[i] === "1") {
        let j = i;
        while (j < main.length && main[j] === "1" && guards.has(j) === guards.has(i)) j++;
        const h = guards.has(i) ? barH + guardExtra : barH;
        parts.push(`<rect x="${(quietL + i * x).toFixed(3)}" y="${top}" width="${((j - i) * x).toFixed(3)}" height="${h.toFixed(3)}" fill="#000"/>`);
        i = j;
      } else i++;
    }
    const ty = top + barH + guardExtra + textH - 0.4;
    parts.push(`<text x="${(quietL - 1.2 * x).toFixed(3)}" y="${ty.toFixed(3)}" font-size="${textH}" text-anchor="end" style="${font}" fill="#000">${isbn13[0]}</text>`);
    parts.push(`<text x="${(quietL + 24 * x).toFixed(3)}" y="${ty.toFixed(3)}" font-size="${textH}" text-anchor="middle" letter-spacing="0.62" style="${font}" fill="#000">${isbn13.slice(1, 7)}</text>`);
    parts.push(`<text x="${(quietL + 71 * x).toFixed(3)}" y="${ty.toFixed(3)}" font-size="${textH}" text-anchor="middle" letter-spacing="0.62" style="${font}" fill="#000">${isbn13.slice(7)}</text>`);
    if (addon) {
      const ax = quietL + main.length * x + gap;
      const ay = top + textH + 0.6;
      for (let k = 0; k < addon.length; k++) {
        if (addon[k] === "1") {
          let j = k;
          while (j < addon.length && addon[j] === "1") j++;
          parts.push(`<rect x="${(ax + k * x).toFixed(3)}" y="${ay.toFixed(3)}" width="${((j - k) * x).toFixed(3)}" height="${(barH + guardExtra - textH - 0.6).toFixed(3)}" fill="#000"/>`);
          k = j - 1;
        }
      }
      parts.push(`<text x="${(ax + addon.length * x / 2).toFixed(3)}" y="${(top + textH - 0.2).toFixed(3)}" font-size="${textH}" text-anchor="middle" letter-spacing="0.62" style="${font}" fill="#000">${opts.addon}</text>`);
    }
    parts.push("</svg>");
    return parts.join("");
  }

  const api = { spineMm, coverLayout, evenPages, parseIsbn, isbn13Check, isbn10Check, ean13Modules,
    addon5Modules, addon5Check, barcodeSvg, isbnLabel, MM_PER_IN };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.SpineCalc = api;
})(typeof self !== "undefined" ? self : this);
