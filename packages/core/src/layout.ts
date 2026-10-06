import type { Page } from "@playwright/test";
import type { Finding, FindingNode, Locale } from "./types";

/*
 * Layout check for what axe-core cannot see because it needs a changed viewport or style:
 * - reflow (WCAG 1.4.10): at 320 CSS pixels wide (400 % zoom) the page must not scroll sideways,
 * - text spacing (WCAG 1.4.12): with the spacing values of the criterion, text must not be cut off.
 */

export interface LayoutCheckOptions {
  /** Skip elements inside these selectors, e.g. third-party widgets. */
  exclude?: string[];
  locale?: Locale;
}

interface Texts {
  reflowHelp: string;
  reflowDescription: string;
  reflowSummary: string;
  spacingHelp: string;
  spacingDescription: string;
  spacingSummary: string;
}

const TEXTS: Record<"de" | "fr" | "it" | "en", Texts> = {
  en: {
    reflowHelp: "Content must reflow at 320 CSS pixels without sideways scrolling",
    reflowDescription:
      "Ensures that the page can be used at 400 % zoom without scrolling in two directions.",
    reflowSummary:
      "Reaches beyond the right edge at 320 px width. Let it wrap or scale (max-width: 100%, flexible columns).",
    spacingHelp: "Text must not be cut off when text spacing is increased",
    spacingDescription:
      "Ensures that users who increase line, letter, word and paragraph spacing lose no content.",
    spacingSummary:
      "Text is cut off with the increased spacing. Avoid fixed heights and overflow: hidden on text containers.",
  },
  de: {
    reflowHelp: "Inhalte müssen bei 320 CSS-Pixeln ohne seitliches Scrollen umbrechen",
    reflowDescription:
      "Stellt sicher, dass die Seite bei 400 % Zoom ohne Scrollen in zwei Richtungen nutzbar ist.",
    reflowSummary:
      "Ragt bei 320 px Breite über den rechten Rand. Umbrechen oder skalieren lassen (max-width: 100 %, flexible Spalten).",
    spacingHelp: "Text darf bei vergrösserten Textabständen nicht abgeschnitten werden",
    spacingDescription:
      "Stellt sicher, dass Nutzer, die Zeilen-, Buchstaben-, Wort- und Absatzabstand vergrössern, keine Inhalte verlieren.",
    spacingSummary:
      "Der Text wird mit den vergrösserten Abständen abgeschnitten. Feste Höhen und overflow: hidden bei Textbehältern vermeiden.",
  },
  fr: {
    reflowHelp: "Le contenu doit se réorganiser à 320 pixels CSS sans défilement horizontal",
    reflowDescription:
      "Vérifie que la page reste utilisable à 400 % de zoom sans défilement dans deux directions.",
    reflowSummary:
      "Dépasse le bord droit à 320 px de large. Laisser le contenu passer à la ligne ou s'adapter (max-width : 100 %, colonnes flexibles).",
    spacingHelp: "Le texte ne doit pas être coupé lorsque l'espacement du texte augmente",
    spacingDescription:
      "Vérifie que les utilisateurs qui augmentent l'espacement des lignes, lettres, mots et paragraphes ne perdent aucun contenu.",
    spacingSummary:
      "Le texte est coupé avec l'espacement augmenté. Éviter les hauteurs fixes et overflow: hidden sur les conteneurs de texte.",
  },
  it: {
    reflowHelp: "Il contenuto deve adattarsi a 320 pixel CSS senza scorrimento orizzontale",
    reflowDescription:
      "Verifica che la pagina sia utilizzabile con zoom al 400 % senza scorrere in due direzioni.",
    reflowSummary:
      "Supera il bordo destro a 320 px di larghezza. Lasciare andare a capo o ridimensionare (max-width: 100 %, colonne flessibili).",
    spacingHelp: "Il testo non deve essere tagliato quando la spaziatura del testo aumenta",
    spacingDescription:
      "Verifica che chi aumenta la spaziatura di righe, lettere, parole e paragrafi non perda contenuti.",
    spacingSummary:
      "Il testo viene tagliato con la spaziatura aumentata. Evitare altezze fisse e overflow: hidden nei contenitori di testo.",
  },
};

const DOCS = "https://packages.sweber.dev/surjection/docs/guides/layout";

interface Hit {
  target: string;
  html: string;
}

/** Runs in the page: elements that reach past the viewport width, outermost cause first. */
function overflowing(args: { width: number; exclude: string[] }): Hit[] {
  const path = (el: Element): string => {
    if (el.id && document.querySelectorAll(`#${CSS.escape(el.id)}`).length === 1)
      return `#${CSS.escape(el.id)}`;
    const parent = el.parentElement;
    const tag = el.tagName.toLowerCase();
    if (!parent || tag === "html") return tag;
    const same = [...parent.children].filter((c) => c.tagName === el.tagName);
    const part = same.length > 1 ? `${tag}:nth-of-type(${same.indexOf(el) + 1})` : tag;
    return parent.tagName === "BODY" ? `body > ${part}` : `${path(parent)} > ${part}`;
  };
  /** Content that scrolls inside its own box does not push the page sideways. */
  const insideScroller = (el: Element) => {
    for (let p = el.parentElement; p && p !== document.documentElement; p = p.parentElement) {
      const o = getComputedStyle(p);
      if (
        /(auto|scroll|hidden|clip)/.test(o.overflowX) &&
        p.getBoundingClientRect().right <= args.width + 1
      )
        return true;
    }
    return false;
  };
  const hits: { el: Element; area: number }[] = [];
  for (const el of document.body.querySelectorAll("*")) {
    if (args.exclude.some((s) => el.closest(s))) continue;
    const style = getComputedStyle(el);
    if (style.display === "none" || style.position === "fixed" || style.visibility === "hidden")
      continue;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0 || rect.right <= args.width + 1) continue;
    if (insideScroller(el)) continue;
    hits.push({ el, area: rect.width });
  }
  // Report the elements that cause it, not every child of an overflowing box.
  const elements = new Set(hits.map((h) => h.el));
  return hits
    .filter((h) => ![...elements].some((other) => other !== h.el && h.el.contains(other)))
    .slice(0, 10)
    .map((h) => ({ target: path(h.el), html: h.el.outerHTML.slice(0, 200) }));
}

/** Runs in the page: text containers that clip their content, as "path|clipped" per element. */
function clipped(exclude: string[]): Hit[] {
  const path = (el: Element): string => {
    if (el.id && document.querySelectorAll(`#${CSS.escape(el.id)}`).length === 1)
      return `#${CSS.escape(el.id)}`;
    const parent = el.parentElement;
    const tag = el.tagName.toLowerCase();
    if (!parent || tag === "html") return tag;
    const same = [...parent.children].filter((c) => c.tagName === el.tagName);
    const part = same.length > 1 ? `${tag}:nth-of-type(${same.indexOf(el) + 1})` : tag;
    return parent.tagName === "BODY" ? `body > ${part}` : `${path(parent)} > ${part}`;
  };
  const out: Hit[] = [];
  for (const el of document.body.querySelectorAll<HTMLElement>("*")) {
    if (exclude.some((s) => el.closest(s))) continue;
    const style = getComputedStyle(el);
    const clips = /(hidden|clip)/;
    const cutsY = clips.test(style.overflowY) && el.scrollHeight > el.clientHeight + 1;
    const cutsX = clips.test(style.overflowX) && el.scrollWidth > el.clientWidth + 1;
    if (!cutsX && !cutsY) continue;
    if (!(el.textContent ?? "").trim()) continue;
    out.push({ target: path(el), html: el.outerHTML.slice(0, 200) });
  }
  return out;
}

const SPACING_CSS = `
* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; }
p { margin-bottom: 2em !important; }
`;

/**
 * Checks reflow at 320 px and text spacing and returns findings in the same shape as
 * checkPage(). The page is changed during the check and restored afterwards.
 */
export async function checkLayout(
  page: Page,
  options: LayoutCheckOptions = {},
): Promise<Finding[]> {
  const t = TEXTS[options.locale === "de-CH" ? "de" : (options.locale ?? "en")];
  const exclude = options.exclude ?? [];
  const original = page.viewportSize();
  const findings: Finding[] = [];
  const nodes = (hits: Hit[], summary: string): FindingNode[] =>
    hits.map((h) => ({ target: h.target, html: h.html, summary }));

  try {
    // Reflow: 320 CSS pixels wide, the height of a 400 % zoomed 1280 x 1024 window.
    await page.setViewportSize({ width: 320, height: 256 });
    const reflow = await page.evaluate(overflowing, { width: 320, exclude });
    if (reflow.length > 0) {
      findings.push({
        rule: "surjection-reflow",
        impact: "serious",
        description: t.reflowDescription,
        help: t.reflowHelp,
        helpUrl: `${DOCS}#reflow`,
        criteria: [{ id: "1.4.10", level: "AA", en301549: "9.1.4.10" }],
        bestPractice: false,
        nodes: nodes(reflow, t.reflowSummary),
      });
    }
    if (original) await page.setViewportSize(original);

    // Text spacing: only elements that are cut off now but were not before count.
    const before = new Set((await page.evaluate(clipped, exclude)).map((h) => h.target));
    const style = await page.addStyleTag({ content: SPACING_CSS });
    const after = await page.evaluate(clipped, exclude);
    await style.evaluate((el) => (el as Element).remove());
    const cut = after.filter((h) => !before.has(h.target));
    if (cut.length > 0) {
      findings.push({
        rule: "surjection-text-spacing",
        impact: "serious",
        description: t.spacingDescription,
        help: t.spacingHelp,
        helpUrl: `${DOCS}#text-spacing`,
        criteria: [{ id: "1.4.12", level: "AA", en301549: "9.1.4.12" }],
        bestPractice: false,
        nodes: nodes(cut, t.spacingSummary),
      });
    }
  } finally {
    if (original) await page.setViewportSize(original);
  }
  return findings;
}
