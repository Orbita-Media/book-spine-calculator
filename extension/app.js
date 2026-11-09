/* Book spine width calculator – user interface (web page and Chrome popup). */
(function () {
  "use strict";
  const D = window.SPINE_DATA, C = window.SpineCalc;
  const root = document.getElementById("calc");
  if (!root) return;
  const lang = (root.dataset.lang || document.documentElement.lang || navigator.language || "en").slice(0, 2) === "de" ? "de" : "en";
  const compact = root.dataset.compact === "1";

  const T = {
    en: {
      tabCover: "Spine & cover", tabIsbn: "ISBN barcode",
      pages: "Page count", trim: "Trim size", paper: "Paper", unit: "Units",
      spine: "Spine width", cover: "Full cover with bleed", bleed: "Bleed", safe: "Safe area",
      safeVal: "{v} inside trim and folds", spineText: "Spine text",
      spineTextYes: "Possible, keep {v} clear left and right", spineTextNo: "Too thin: no text on the spine below {n} pages",
      barcode: "Barcode area", barcodeVal: "{w} × {h}, {s} from the spine, {b} from the bottom",
      even: "Printed as {n} pages (always an even number)", tooFew: "This paper needs at least {n} pages.",
      tooMany: "This paper takes at most {n} pages.", back: "Back", spineShort: "Spine", front: "Front",
      isbn: "ISBN", isbnPh: "978-3-98935-318-3", addon: "Price add-on (optional)", addonPh: "52495",
      line: "ISBN line above the bars", download: "Download SVG",
      okConv: "ISBN-10 converted to {v}", ok: "Valid ISBN-13",
      err: { empty: "Enter an ISBN-10 or ISBN-13.", length: "An ISBN has 10 or 13 digits.", format: "Only digits (and X at the end of an ISBN-10).",
        prefix: "An ISBN-13 starts with 978 or 979.", check13: "Check digit does not match – it should be {e}.", check10: "Check digit does not match – it should be {e}." },
      addonErr: "The add-on has exactly 5 digits.",
      groups: { international: "International print", europa: "European print" },
      cta: "Publishing your paperback? [ShelfPublisher](https://shelfpublisher.com/?utm_source=github&utm_medium=tool&utm_campaign=spine-calculator) checks spine, bleed and barcode on upload and lists your book in catalogs 50,000+ bookstores order from.",
    },
    de: {
      tabCover: "Buchrücken", tabIsbn: "ISBN-Barcode",
      pages: "Seitenzahl", trim: "Format", paper: "Papier", unit: "Einheit",
      spine: "Buchrücken", cover: "Umschlag mit Beschnitt", bleed: "Beschnitt", safe: "Sicherheitsabstand",
      safeVal: "{v} innerhalb von Schnitt und Falz", spineText: "Rückentext",
      spineTextYes: "Möglich, links und rechts {v} frei lassen", spineTextNo: "Zu dünn: unter {n} Seiten keine Schrift auf dem Rücken",
      barcode: "Barcodefeld", barcodeVal: "{w} × {h}, {s} vom Rücken, {b} vom unteren Rand",
      even: "Gedruckt als {n} Seiten (immer gerade Zahl)", tooFew: "Dieses Papier braucht mindestens {n} Seiten.",
      tooMany: "Dieses Papier trägt höchstens {n} Seiten.", back: "Rückseite", spineShort: "Rücken", front: "Vorderseite",
      isbn: "ISBN", isbnPh: "978-3-98935-318-3", addon: "Preis-Zusatz (optional)", addonPh: "52495",
      line: "ISBN-Zeile über den Strichen", download: "SVG herunterladen",
      okConv: "ISBN-10 umgerechnet in {v}", ok: "Gültige ISBN-13",
      err: { empty: "ISBN-10 oder ISBN-13 eingeben.", length: "Eine ISBN hat 10 oder 13 Ziffern.", format: "Nur Ziffern (und X am Ende einer ISBN-10).",
        prefix: "Eine ISBN-13 beginnt mit 978 oder 979.", check13: "Prüfziffer stimmt nicht – richtig wäre {e}.", check10: "Prüfziffer stimmt nicht – richtig wäre {e}." },
      addonErr: "Der Zusatz hat genau 5 Ziffern.",
      groups: { international: "Internationaler Druck", europa: "Europäischer Druck" },
      cta: "Du veröffentlichst dein Taschenbuch? [ShelfPublisher](https://shelfpublisher.com/de/?utm_source=github&utm_medium=tool&utm_campaign=spine-calculator) prüft Rücken, Beschnitt und Barcode beim Hochladen und listet dein Buch in den Katalogen, aus denen über 50.000 Buchhandlungen bestellen.",
    },
  }[lang];

  const state = { pages: 220, format: "6x9", paper: "international_white_50", unit: lang === "de" ? "mm" : "in",
    tab: "cover", isbn: "", addon: "", line: true };

  const el = (tag, attrs, ...kids) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (k === "class") n.className = v;
      else if (k.startsWith("on")) n.addEventListener(k.slice(2), v);
      else if (v !== false && v != null) n.setAttribute(k, v === true ? "" : v);
    }
    for (const k of kids.flat()) if (k != null) n.append(k.nodeType ? k : document.createTextNode(k));
    return n;
  };
  const fill = (s, o) => s.replace(/\{(\w+)\}/g, (_, k) => o[k]);
  const linkify = (s) => {
    const frag = document.createDocumentFragment();
    let last = 0;
    s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (m, label, url, i) => {
      frag.append(s.slice(last, i), el("a", { href: url, target: compact ? "_blank" : null, rel: compact ? "noopener" : null }, label));
      last = i + m.length;
    });
    frag.append(s.slice(last));
    return frag;
  };
  const num = (x, d) => lang === "de" ? x.toFixed(d).replace(".", ",") : x.toFixed(d);
  const mmDigits = (mm) => (Math.abs(mm * 100 - Math.round(mm * 100)) < 1e-6 ? 2 : 3);
  const len = (mm) => state.unit === "mm" ? `${num(mm + 1e-9, mmDigits(mm))} mm` : `${num(mm / 25.4 + 1e-9, 3)} in`;
  const both = (mm) => state.unit === "mm" ? `${num(mm, 2)} mm · ${num(mm / 25.4, 3)} in` : `${num(mm / 25.4, 3)} in · ${num(mm, 2)} mm`;
  const fmtLabel = (f) => f.label.replace(/ x /g, " × ");

  // ── Select building block (button + listbox) ───────────────────────────
  let openList = null;
  function closeList() {
    if (!openList) return;
    const { list, btn } = openList;
    list.classList.remove("open");
    btn.setAttribute("aria-expanded", "false");
    openList = null;
  }
  document.addEventListener("click", (e) => { if (openList && !openList.wrap.contains(e.target)) closeList(); });

  function selectField(id, label, groups, value, onChange) {
    const current = groups.flatMap((g) => g.options).find((o) => o.value === value) || groups[0].options[0];
    const btn = el("button", { type: "button", class: "sel-btn", id, "aria-haspopup": "listbox", "aria-expanded": "false" },
      el("span", { class: "sel-val" }, current.label), el("span", { class: "chev", "aria-hidden": "true" }));
    const list = el("div", { class: "sel-list", role: "listbox", "aria-labelledby": id + "-l", tabindex: "-1" });
    const opts = [];
    for (const g of groups) {
      if (g.label) list.append(el("div", { class: "sel-group", role: "presentation" }, g.label));
      for (const o of g.options) {
        const it = el("div", { class: "sel-opt" + (o.value === value ? " on" : ""), role: "option",
          "aria-selected": o.value === value ? "true" : "false", "data-v": o.value, tabindex: "-1",
          onclick: () => { closeList(); onChange(o.value); } }, o.label);
        opts.push(it);
        list.append(it);
      }
    }
    const wrap = el("div", { class: "sel" }, btn, list);
    const focusOpt = (i) => { const o = opts[Math.max(0, Math.min(opts.length - 1, i))]; o && o.focus(); };
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (openList && openList.list === list) return closeList();
      closeList();
      list.classList.add("open");
      btn.setAttribute("aria-expanded", "true");
      openList = { list, btn, wrap };
      focusOpt(opts.findIndex((o) => o.dataset.v === value));
    });
    list.addEventListener("keydown", (e) => {
      const i = opts.indexOf(document.activeElement);
      if (e.key === "ArrowDown") { e.preventDefault(); focusOpt(i + 1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); focusOpt(i - 1); }
      else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); document.activeElement.click(); btn.focus(); }
      else if (e.key === "Escape" || e.key === "Tab") { closeList(); btn.focus(); }
    });
    return el("div", { class: "field" }, el("label", { id: id + "-l", for: id }, label), wrap);
  }

  function segmented(label, options, value, onChange) {
    return el("div", { class: "field" }, el("span", { class: "lbl" }, label),
      el("div", { class: "seg", role: "radiogroup", "aria-label": label },
        options.map((o) => el("button", { type: "button", role: "radio", "aria-checked": o.value === value ? "true" : "false",
          class: o.value === value ? "on" : "", onclick: () => onChange(o.value) }, o.label))));
  }

  // ── Cover tab ───────────────────────────────────────────────────────────
  function formatGroups() {
    return ["international", "europa"].map((ch) => ({
      label: T.groups[ch],
      options: D.formats.filter((f) => f.papers[ch]).map((f) => ({ value: ch + "|" + f.code, label: fmtLabel(f) })),
    }));
  }
  function channelOf(paperCode) { return D.papers.find((p) => p.code === paperCode).channel; }

  function diagram(lay) {
    const W = lay.coverWidthMm, H = lay.coverHeightMm, b = lay.bleedMm, tw = lay.trimWidthMm, sp = lay.spineMm;
    const s = lay.safetyMm, bc = lay.barcode;
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.setAttribute("class", "diagram");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", `${T.back} | ${T.spineShort} | ${T.front}`);
    const r = (x, y, w, h, cls) => { const n = document.createElementNS(ns, "rect"); n.setAttribute("x", x); n.setAttribute("y", y);
      n.setAttribute("width", Math.max(w, 0)); n.setAttribute("height", Math.max(h, 0)); n.setAttribute("class", cls); svg.append(n); };
    const t = (x, y, txt, cls) => { const n = document.createElementNS(ns, "text"); n.setAttribute("x", x); n.setAttribute("y", y);
      n.setAttribute("class", cls); n.setAttribute("text-anchor", "middle"); n.textContent = txt; svg.append(n); };
    r(0, 0, W, H, "d-bleed");
    r(b, b, tw, H - 2 * b, "d-panel");
    r(b + tw, b, sp, H - 2 * b, "d-spine");
    r(b + tw + sp, b, tw, H - 2 * b, "d-panel");
    r(b + s, b + s, tw - 2 * s, H - 2 * b - 2 * s, "d-safe");
    r(b + tw + sp + s, b + s, tw - 2 * s, H - 2 * b - 2 * s, "d-safe");
    r(b + tw - bc.marginSpineMm - bc.widthMm, H - b - bc.marginBottomMm - bc.heightMm, bc.widthMm, bc.heightMm, "d-barcode");
    const fs = Math.max(H * 0.045, 6);
    t(b + tw / 2, b + H * 0.42, T.back, "d-label");
    t(b + tw + sp + tw / 2, b + H * 0.42, T.front, "d-label");
    [...svg.querySelectorAll(".d-label")].forEach((n) => n.setAttribute("font-size", fs));
    return svg;
  }

  function coverTab() {
    const ch = channelOf(state.paper);
    const fmt = D.formats.find((f) => f.code === state.format);
    const lay = C.coverLayout(D, fmt, state.pages, state.paper);
    const papers = fmt.papers[ch].map((code) => D.papers.find((p) => p.code === code));
    const pagesInput = el("input", { id: "pages", type: "number", inputmode: "numeric", min: "1", max: "1200", step: "1",
      value: String(state.pages) });
    pagesInput.addEventListener("input", () => {
      const v = parseInt(pagesInput.value, 10);
      if (v > 0 && v <= 2000) { state.pages = v; renderResults(); }
    });

    const inputs = el("div", { class: "inputs" },
      el("div", { class: "field" }, el("label", { for: "pages" }, T.pages), pagesInput),
      selectField("trim", T.trim, formatGroups(), ch + "|" + state.format, (v) => {
        const [c, code] = v.split("|");
        state.format = code;
        const f = D.formats.find((x) => x.code === code);
        if (channelOf(state.paper) !== c || !f.papers[c].includes(state.paper)) state.paper = f.papers[c][0];
        render();
      }),
      selectField("paper", T.paper, [{ options: papers.map((p) => ({ value: p.code, label: lang === "de" ? p.labelDe : p.label })) }],
        state.paper, (v) => { state.paper = v; render(); }),
      segmented(T.unit, [{ value: "mm", label: "mm" }, { value: "in", label: "inch" }], state.unit, (v) => { state.unit = v; render(); }));

    const results = el("div", { class: "results", id: "results", "aria-live": "polite" });
    function renderResults() {
      const L2 = C.coverLayout(D, fmt, state.pages, state.paper);
      const warn = [];
      if (L2.pages !== state.pages) warn.push(fill(T.even, { n: L2.pages }));
      if (L2.pages < L2.minPages) warn.push(fill(T.tooFew, { n: L2.minPages }));
      if (L2.pages > L2.maxPages) warn.push(fill(T.tooMany, { n: L2.maxPages }));
      const bc = L2.barcode;
      results.replaceChildren(...[
        el("div", { class: "hero" }, el("span", { class: "hero-l" }, T.spine), el("strong", { class: "hero-v" }, both(L2.spineMm))),
        el("dl", { class: "facts" },
          el("dt", null, T.cover), el("dd", null, `${len(L2.coverWidthMm)} × ${len(L2.coverHeightMm)}`),
          el("dt", null, T.bleed), el("dd", null, len(L2.bleedMm)),
          el("dt", null, T.safe), el("dd", null, fill(T.safeVal, { v: len(L2.safetyMm) })),
          el("dt", null, T.spineText), el("dd", null, L2.spineTextAllowed ? fill(T.spineTextYes, { v: len(L2.spineSafetyMm) })
            : fill(T.spineTextNo, { n: D.channels[channelOf(state.paper)].spineTextMinPages })),
          el("dt", null, T.barcode), el("dd", null, fill(T.barcodeVal, { w: len(bc.widthMm), h: len(bc.heightMm),
            s: len(bc.marginSpineMm), b: len(bc.marginBottomMm) }))),
        warn.length ? el("p", { class: "warn" }, warn.join(" ")) : null,
        el("figure", { class: "fig" }, diagram(L2),
          el("figcaption", null, el("span", null, T.back), el("span", null, T.spineShort), el("span", null, T.front)))].filter(Boolean));
    }
    renderResults();
    return el("div", { class: "pane" }, inputs, results);
  }

  // ── ISBN tab ────────────────────────────────────────────────────────────
  function isbnTab() {
    const out = el("div", { class: "bc-out", "aria-live": "polite" });
    const msg = el("p", { class: "msg" });
    const isbnIn = el("input", { id: "isbn", type: "text", inputmode: "numeric", autocomplete: "off", spellcheck: "false",
      placeholder: T.isbnPh, value: state.isbn });
    const addonIn = el("input", { id: "addon", type: "text", inputmode: "numeric", maxlength: "5", autocomplete: "off",
      placeholder: T.addonPh, value: state.addon });
    const dl = el("button", { type: "button", class: "btn", disabled: true }, T.download);
    let svgText = "", fileName = "isbn-barcode.svg";
    function update() {
      state.isbn = isbnIn.value; state.addon = addonIn.value.trim();
      const res = C.parseIsbn(state.isbn);
      const addonOk = !state.addon || /^\d{5}$/.test(state.addon);
      out.replaceChildren(); svgText = ""; dl.disabled = true;
      msg.className = "msg";
      if (!state.isbn.trim()) { msg.textContent = ""; return; }
      if (!res.ok) { msg.textContent = fill(T.err[res.error], { e: res.expected }); msg.className = "msg bad"; return; }
      if (!addonOk) { msg.textContent = T.addonErr; msg.className = "msg bad"; return; }
      msg.textContent = res.converted ? fill(T.okConv, { v: res.isbn13 }) : T.ok;
      msg.className = "msg good";
      svgText = C.barcodeSvg(res.isbn13, { addon: state.addon || null, label: state.line,
        labelText: C.isbnLabel(res.converted ? res.isbn13 : state.isbn, res.isbn13) });
      fileName = `isbn-${res.isbn13}${state.addon ? "-" + state.addon : ""}.svg`;
      const holder = el("div", { class: "bc-img" });
      const doc = new DOMParser().parseFromString(svgText, "image/svg+xml");
      holder.append(document.importNode(doc.documentElement, true));
      out.append(holder);
      dl.disabled = false;
    }
    dl.addEventListener("click", () => {
      if (!svgText) return;
      const url = URL.createObjectURL(new Blob([svgText], { type: "image/svg+xml" }));
      const a = el("a", { href: url, download: fileName });
      document.body.append(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
    isbnIn.addEventListener("input", update);
    addonIn.addEventListener("input", update);
    const sw = el("button", { type: "button", class: "switch", role: "switch", "aria-checked": state.line ? "true" : "false",
      onclick: () => { state.line = !state.line; sw.setAttribute("aria-checked", state.line ? "true" : "false"); update(); } },
      el("span", { class: "knob", "aria-hidden": "true" }), el("span", null, T.line));
    update();
    return el("div", { class: "pane" },
      el("div", { class: "inputs isbn-in" },
        el("div", { class: "field wide" }, el("label", { for: "isbn" }, T.isbn), isbnIn),
        el("div", { class: "field" }, el("label", { for: "addon" }, T.addon), addonIn),
        el("div", { class: "field sw" }, sw)),
      msg, out, el("div", { class: "actions" }, dl));
  }

  // ── Shell ───────────────────────────────────────────────────────────────
  function render() {
    closeList();
    const tabs = el("div", { class: "tabs", role: "tablist" },
      [["cover", T.tabCover], ["isbn", T.tabIsbn]].map(([k, l]) => el("button", { type: "button", role: "tab",
        "aria-selected": state.tab === k ? "true" : "false", class: state.tab === k ? "on" : "",
        onclick: () => { state.tab = k; render(); } }, l)));
    const body = state.tab === "cover" ? coverTab() : isbnTab();
    const cta = el("p", { class: "cta" }, linkify(T.cta));
    const swap = () => root.replaceChildren(tabs, body, cta);
    if (document.startViewTransition && root.childElementCount) document.startViewTransition(swap); else swap();
  }
  render();
})();
