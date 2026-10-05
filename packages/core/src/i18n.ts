import type { Impact, Locale } from "./types";

export interface ReportMessages {
  title: string;
  summary: string;
  page: string;
  testedAt: string;
  standard: string;
  noFindings: string;
  findings: string;
  needsReview: string;
  passedRules: string;
  elements: string;
  criteria: string;
  bestPractice: string;
  howToFix: string;
  impact: Record<Impact, string>;
  disclaimer: string;
}

const de: ReportMessages = {
  title: "Bericht zur Barrierefreiheit",
  summary: "Zusammenfassung",
  page: "Seite",
  testedAt: "Geprüft am",
  standard: "Prüfgrundlage",
  noFindings: "Keine automatisch erkennbaren Verstöße gefunden.",
  findings: "Gefundene Probleme",
  needsReview: "Manuell zu prüfen",
  passedRules: "Bestandene Regeln",
  elements: "Betroffene Elemente",
  criteria: "WCAG-Kriterien",
  bestPractice: "Empfehlung (kein WCAG-Kriterium)",
  howToFix: "Mehr dazu",
  impact: { critical: "Kritisch", serious: "Schwer", moderate: "Mittel", minor: "Gering" },
  disclaimer:
    "Automatisierte Tests erkennen nur einen Teil der möglichen Barrieren. Dieser Bericht ersetzt keine manuelle Prüfung und ist keine Bestätigung der Konformität mit WCAG, EN 301 549 oder dem BFSG.",
};

const messages: Record<Locale, ReportMessages> = {
  de,
  "de-CH": JSON.parse(localizeText(JSON.stringify(de), "de-CH")) as ReportMessages,
  en: {
    title: "Accessibility report",
    summary: "Summary",
    page: "Page",
    testedAt: "Tested on",
    standard: "Standard",
    noFindings: "No automatically detectable violations found.",
    findings: "Issues found",
    needsReview: "Needs manual review",
    passedRules: "Rules passed",
    elements: "Affected elements",
    criteria: "WCAG criteria",
    bestPractice: "Best practice (not a WCAG criterion)",
    howToFix: "Learn more",
    impact: { critical: "Critical", serious: "Serious", moderate: "Moderate", minor: "Minor" },
    disclaimer:
      "Automated tests detect only part of all possible barriers. This report does not replace a manual audit and does not confirm conformance with WCAG, EN 301 549 or the European Accessibility Act.",
  },
  fr: {
    title: "Rapport d'accessibilité",
    summary: "Résumé",
    page: "Page",
    testedAt: "Testé le",
    standard: "Référentiel",
    noFindings: "Aucune non-conformité détectable automatiquement.",
    findings: "Problèmes détectés",
    needsReview: "À vérifier manuellement",
    passedRules: "Règles réussies",
    elements: "Éléments concernés",
    criteria: "Critères WCAG",
    bestPractice: "Bonne pratique (hors critère WCAG)",
    howToFix: "En savoir plus",
    impact: { critical: "Critique", serious: "Grave", moderate: "Moyen", minor: "Mineur" },
    disclaimer:
      "Les tests automatisés ne détectent qu'une partie des obstacles possibles. Ce rapport ne remplace pas un audit manuel et ne confirme pas la conformité aux WCAG, à la norme EN 301 549 ou à l'Acte européen sur l'accessibilité.",
  },
  it: {
    title: "Rapporto sull'accessibilità",
    summary: "Riepilogo",
    page: "Pagina",
    testedAt: "Verificato il",
    standard: "Riferimento",
    noFindings: "Nessuna violazione rilevabile automaticamente.",
    findings: "Problemi rilevati",
    needsReview: "Da verificare manualmente",
    passedRules: "Regole superate",
    elements: "Elementi interessati",
    criteria: "Criteri WCAG",
    bestPractice: "Buona pratica (non è un criterio WCAG)",
    howToFix: "Approfondisci",
    impact: { critical: "Critico", serious: "Grave", moderate: "Medio", minor: "Lieve" },
    disclaimer:
      "I test automatici rilevano solo una parte delle possibili barriere. Questo rapporto non sostituisce una verifica manuale e non conferma la conformità alle WCAG, alla norma EN 301 549 o all'Atto europeo sull'accessibilità.",
  },
};

export function reportMessages(locale: Locale = "en"): ReportMessages {
  return messages[locale];
}

/** Swiss German uses "ss" instead of "ß". */
export function localizeText(text: string, locale: Locale): string {
  return locale === "de-CH" ? text.replaceAll("ß", "ss") : text;
}
