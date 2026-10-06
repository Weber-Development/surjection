import type { Page } from "@playwright/test";
import type { Finding, FindingNode, Locale } from "./types";

/*
 * Keyboard check: presses Tab through the page like a keyboard user and reports
 * - focus traps (WCAG 2.1.2): focus cycles inside part of the page and never reaches the rest,
 * - missing focus indicators (WCAG 2.4.7): an element looks the same with and without focus.
 * axe-core cannot test either, because both need real key presses.
 */

export interface KeyboardCheckOptions {
  /** Maximum Tab presses. Default: number of focusable elements + 10, at most 300. */
  maxSteps?: number;
  /** Skip elements inside these selectors, e.g. third-party widgets. */
  exclude?: string[];
  locale?: Locale;
}

interface Texts {
  trapHelp: string;
  trapDescription: string;
  trapSummary: string;
  focusHelp: string;
  focusDescription: string;
  focusSummary: string;
  orderHelp: string;
  orderDescription: string;
  orderSummary: string;
}

const TEXTS: Record<"de" | "fr" | "it" | "en", Texts> = {
  en: {
    trapHelp: "Keyboard focus must not be trapped",
    trapDescription:
      "Ensures that keyboard users can move focus away from every part of the page with Tab.",
    trapSummary:
      "Focus cycles here and never reaches the rest of the page. Let Tab or Escape leave this area.",
    focusHelp: "Focused elements must show a visible focus indicator",
    focusDescription: "Ensures that keyboard users can see which element has focus.",
    focusSummary:
      "Looks the same with and without focus. Add a :focus-visible style, e.g. an outline.",
    orderHelp: "Focus order must follow the visual order",
    orderDescription:
      "Ensures that Tab moves through the page in a sequence that matches what users see.",
    orderSummary:
      "Focus jumps up the page to here from the previous element. Check the DOM order, CSS order and positive tabindex values.",
  },
  de: {
    trapHelp: "Der Tastaturfokus darf nicht gefangen sein",
    trapDescription:
      "Stellt sicher, dass Tastaturnutzer jeden Bereich der Seite mit Tab wieder verlassen können.",
    trapSummary:
      "Der Fokus kreist hier und erreicht den Rest der Seite nie. Tab oder Escape müssen den Bereich verlassen können.",
    focusHelp: "Fokussierte Elemente müssen einen sichtbaren Fokusindikator haben",
    focusDescription: "Stellt sicher, dass Tastaturnutzer sehen, welches Element den Fokus hat.",
    focusSummary:
      "Sieht mit und ohne Fokus gleich aus. Ergänze einen :focus-visible-Stil, z. B. eine Umrandung.",
    orderHelp: "Die Fokusreihenfolge muss der sichtbaren Reihenfolge folgen",
    orderDescription:
      "Stellt sicher, dass Tab die Seite in einer Reihenfolge durchläuft, die dem Sichtbaren entspricht.",
    orderSummary:
      "Der Fokus springt vom vorigen Element hierher weiter nach oben. DOM-Reihenfolge, CSS-order und positive tabindex-Werte prüfen.",
  },
  fr: {
    trapHelp: "Le focus clavier ne doit pas être piégé",
    trapDescription:
      "Vérifie que les utilisateurs du clavier peuvent quitter chaque partie de la page avec Tab.",
    trapSummary:
      "Le focus tourne ici et n'atteint jamais le reste de la page. Tab ou Échap doivent permettre de quitter cette zone.",
    focusHelp: "Les éléments focalisés doivent avoir un indicateur de focus visible",
    focusDescription: "Vérifie que les utilisateurs du clavier voient quel élément a le focus.",
    focusSummary:
      "Identique avec et sans focus. Ajoutez un style :focus-visible, par exemple un contour.",
    orderHelp: "L'ordre du focus doit suivre l'ordre visuel",
    orderDescription:
      "Vérifie que Tab parcourt la page dans un ordre qui correspond à ce que voient les utilisateurs.",
    orderSummary:
      "Le focus remonte dans la page jusqu'ici depuis l'élément précédent. Vérifier l'ordre du DOM, l'order CSS et les tabindex positifs.",
  },
  it: {
    trapHelp: "Il focus della tastiera non deve restare intrappolato",
    trapDescription:
      "Verifica che chi usa la tastiera possa lasciare ogni parte della pagina con Tab.",
    trapSummary:
      "Il focus gira qui e non raggiunge mai il resto della pagina. Tab o Esc devono permettere di uscire.",
    focusHelp: "Gli elementi con focus devono avere un indicatore di focus visibile",
    focusDescription: "Verifica che chi usa la tastiera veda quale elemento ha il focus.",
    focusSummary:
      "Appare uguale con e senza focus. Aggiungere uno stile :focus-visible, ad esempio un contorno.",
    orderHelp: "L'ordine del focus deve seguire l'ordine visivo",
    orderDescription:
      "Verifica che Tab percorra la pagina in una sequenza corrispondente a ciò che gli utenti vedono.",
    orderSummary:
      "Il focus risale nella pagina fino a qui dall'elemento precedente. Controllare l'ordine del DOM, l'order CSS e i tabindex positivi.",
  },
};

/** Pixels the focus may move up the page before it counts as a jump. */
const JUMP_BACK = 200;

const DOCS = "https://packages.sweber.dev/surjection/docs/guides/keyboard";

interface Snapshot {
  /** Index of the focused element in the list of focusable elements, -1 for an element not in the list, -2 for none (body). */
  index: number;
  style: string;
}

interface Collected {
  total: number;
  targets: string[];
  html: string[];
  unfocused: string[];
  /** Page position of each element, and whether it sits in a fixed or sticky layer. */
  tops: number[];
  layered: boolean[];
}

/** Runs in the page. Collects visible, focusable elements and their look without focus. */
function collect(exclude: string[]): Collected {
  const selector =
    'a[href], area[href], button, input:not([type="hidden"]), select, textarea, summary, iframe, [tabindex], [contenteditable=""], [contenteditable="true"]';
  const visible = (el: Element) => {
    const rect = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    return (
      rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && style.display !== "none"
    );
  };
  const elements = [...document.querySelectorAll<HTMLElement>(selector)].filter(
    (el) =>
      el.tabIndex >= 0 &&
      !(el as HTMLButtonElement).disabled &&
      !el.closest("[inert]") &&
      visible(el) &&
      !exclude.some((s) => el.closest(s)),
  );
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
  const look = (el: Element) => {
    const s = getComputedStyle(el);
    return [
      s.outlineStyle === "none" ? "none" : `${s.outlineStyle} ${s.outlineWidth} ${s.outlineColor}`,
      s.boxShadow,
      s.borderColor,
      s.borderWidth,
      s.backgroundColor,
      s.color,
      s.textDecorationLine,
    ].join("|");
  };
  (document.activeElement as HTMLElement | null)?.blur?.();
  // biome-ignore lint/suspicious/noExplicitAny: kept on window for the following steps.
  (window as any).__surjectionFocusable = elements;
  return {
    total: elements.length,
    targets: elements.map(path),
    html: elements.map((el) => el.outerHTML.slice(0, 200)),
    unfocused: elements.map(look),
    tops: elements.map((el) => Math.round(el.getBoundingClientRect().top + window.scrollY)),
    layered: elements.map((el) => {
      for (let p: Element | null = el; p; p = p.parentElement) {
        const position = getComputedStyle(p).position;
        if (position === "fixed" || position === "sticky") return true;
      }
      return false;
    }),
  };
}

/** Runs in the page. Where focus is now and how the element looks. */
function snapshot(): Snapshot {
  // biome-ignore lint/suspicious/noExplicitAny: set by collect().
  const elements = (window as any).__surjectionFocusable as Element[];
  let active = document.activeElement;
  while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement;
  if (!active || active === document.body || active === document.documentElement)
    return { index: -2, style: "" };
  const index = elements.indexOf(active);
  if (index < 0) return { index: -1, style: "" };
  const s = getComputedStyle(active);
  return {
    index,
    style: [
      s.outlineStyle === "none" ? "none" : `${s.outlineStyle} ${s.outlineWidth} ${s.outlineColor}`,
      s.boxShadow,
      s.borderColor,
      s.borderWidth,
      s.backgroundColor,
      s.color,
      s.textDecorationLine,
    ].join("|"),
  };
}

/** Finds the shortest repeating tail of the sequence, e.g. [.., 4, 5, 6, 4, 5, 6] → [4, 5, 6]. */
export function repeatingCycle(sequence: number[]): number[] | undefined {
  for (let size = 1; size * 3 <= sequence.length; size++) {
    const tail = sequence.slice(-size * 3);
    const cycle = tail.slice(0, size);
    if (tail.every((v, i) => v === cycle[i % size]) && new Set(cycle).size === size) return cycle;
  }
  return undefined;
}

/**
 * Tabs through the page and returns findings for focus traps and missing focus indicators,
 * in the same shape as checkPage(), so they work with baseline, reports and --fail-on.
 */
export async function checkKeyboard(
  page: Page,
  options: KeyboardCheckOptions = {},
): Promise<Finding[]> {
  const t = TEXTS[options.locale === "de-CH" ? "de" : (options.locale ?? "en")];
  const info = await page.evaluate(collect, options.exclude ?? []);
  if (info.total === 0) return [];

  const maxSteps = options.maxSteps ?? Math.min(info.total + 10, 300);
  const sequence: number[] = [];
  const focused = new Map<number, string>();
  for (let step = 0; step < maxSteps; step++) {
    await page.keyboard.press("Tab");
    const snap = await page.evaluate(snapshot);
    sequence.push(snap.index);
    if (snap.index >= 0 && !focused.has(snap.index)) focused.set(snap.index, snap.style);
    // A natural wrap leaves the page (focus on body or the browser UI): the order is complete.
    if (snap.index === -2 && focused.size > 0) break;
  }

  const findings: Finding[] = [];
  const node = (i: number, summary: string): FindingNode => ({
    target: info.targets[i] as string,
    html: info.html[i] as string,
    summary,
  });

  const cycle = repeatingCycle(sequence);
  if (cycle?.every((i) => i >= 0) && focused.size < info.total) {
    findings.push({
      rule: "surjection-focus-trap",
      impact: "critical",
      description: t.trapDescription,
      help: t.trapHelp,
      helpUrl: `${DOCS}#focus-trap`,
      criteria: [{ id: "2.1.2", level: "A", en301549: "9.2.1.2" }],
      bestPractice: false,
      nodes: [...cycle].sort((a, b) => a - b).map((i) => node(i, t.trapSummary)),
    });
  }

  // Focus order: following Tab, the next element must not sit far above the previous one.
  const order = [...focused.keys()];
  const jumps: number[] = [];
  for (let n = 1; n < order.length; n++) {
    const previous = order[n - 1] as number;
    const current = order[n] as number;
    if (info.layered[previous] || info.layered[current]) continue;
    if ((info.tops[current] as number) < (info.tops[previous] as number) - JUMP_BACK)
      jumps.push(current);
  }
  if (jumps.length > 0) {
    findings.push({
      rule: "surjection-focus-order",
      impact: "moderate",
      description: t.orderDescription,
      help: t.orderHelp,
      helpUrl: `${DOCS}#focus-order`,
      criteria: [{ id: "2.4.3", level: "A", en301549: "9.2.4.3" }],
      bestPractice: false,
      nodes: jumps.slice(0, 10).map((i) => node(i, t.orderSummary)),
    });
  }

  const invisible = [...focused]
    .filter(([i, style]) => style === info.unfocused[i])
    .map(([i]) => i);
  if (invisible.length > 0) {
    findings.push({
      rule: "surjection-focus-visible",
      impact: "serious",
      description: t.focusDescription,
      help: t.focusHelp,
      helpUrl: `${DOCS}#focus-visible`,
      criteria: [{ id: "2.4.7", level: "AA", en301549: "9.2.4.7" }],
      bestPractice: false,
      nodes: invisible.sort((a, b) => a - b).map((i) => node(i, t.focusSummary)),
    });
  }
  return findings;
}
