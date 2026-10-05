import type { Locale } from "../types";
import type { ConformanceStatus } from "./types";

export interface StatementTexts {
  title: string;
  intro: (organisation: string, scope: string) => string;
  service: string;
  statusHeading: string;
  status: Record<ConformanceStatus, (standard: string) => string>;
  issuesHeading: string;
  reason: string;
  plannedFix: string;
  preparationHeading: string;
  prepared: (date: string) => string;
  reviewed: (date: string) => string;
  methodSelf: string;
  methodThirdParty: (auditor: string) => string;
  feedbackHeading: string;
  feedback: string;
  email: string;
  phone: string;
  postal: string;
  enforcementHeading: string;
  enforcement: string;
}

const de: StatementTexts = {
  title: "Erklärung zur Barrierefreiheit",
  intro: (org, scope) =>
    `${org} ist bemüht, ${scope} im Einklang mit den geltenden Anforderungen an die Barrierefreiheit zugänglich zu machen. Diese Erklärung gilt für ${scope}.`,
  service: "Beschreibung der Dienstleistung",
  statusHeading: "Stand der Vereinbarkeit mit den Anforderungen",
  status: {
    full: (std) => `Dieses Angebot ist mit ${std} vollständig vereinbar.`,
    partial: (std) =>
      `Dieses Angebot ist mit ${std} teilweise vereinbar. Die unten aufgeführten Inhalte sind nicht barrierefrei.`,
    none: (std) => `Dieses Angebot ist mit ${std} derzeit nicht vereinbar.`,
  },
  issuesHeading: "Nicht barrierefreie Inhalte",
  reason: "Begründung und Alternative",
  plannedFix: "Geplante Behebung",
  preparationHeading: "Erstellung dieser Erklärung",
  prepared: (d) => `Diese Erklärung wurde am ${d} erstellt.`,
  reviewed: (d) => `Sie wurde zuletzt am ${d} überprüft.`,
  methodSelf: "Die Bewertung beruht auf einer Selbstbewertung.",
  methodThirdParty: (a) => `Die Bewertung beruht auf einer Prüfung durch ${a}.`,
  feedbackHeading: "Feedback und Kontakt",
  feedback:
    "Sind Ihnen Mängel beim barrierefreien Zugang aufgefallen oder benötigen Sie Inhalte in einer zugänglichen Form? Dann wenden Sie sich bitte an uns:",
  email: "E-Mail",
  phone: "Telefon",
  postal: "Post",
  enforcementHeading: "Durchsetzungsverfahren",
  enforcement:
    "Wenn Sie mit unserer Antwort nicht zufrieden sind, können Sie sich an die zuständige Marktüberwachungsbehörde wenden:",
};

export const statementTexts: Record<Exclude<Locale, "de-CH">, StatementTexts> = {
  de,
  en: {
    title: "Accessibility statement",
    intro: (org, scope) =>
      `${org} is committed to making ${scope} accessible in line with the applicable accessibility requirements. This statement applies to ${scope}.`,
    service: "Description of the service",
    statusHeading: "Compliance status",
    status: {
      full: (std) => `This service is fully compliant with ${std}.`,
      partial: (std) =>
        `This service is partially compliant with ${std}. The content listed below is not accessible.`,
      none: (std) => `This service is currently not compliant with ${std}.`,
    },
    issuesHeading: "Non-accessible content",
    reason: "Reason and alternative",
    plannedFix: "Planned fix",
    preparationHeading: "Preparation of this statement",
    prepared: (d) => `This statement was prepared on ${d}.`,
    reviewed: (d) => `It was last reviewed on ${d}.`,
    methodSelf: "The assessment is based on a self-assessment.",
    methodThirdParty: (a) => `The assessment is based on an evaluation by ${a}.`,
    feedbackHeading: "Feedback and contact",
    feedback:
      "Have you noticed accessibility barriers, or do you need content in an accessible format? Please contact us:",
    email: "Email",
    phone: "Phone",
    postal: "Post",
    enforcementHeading: "Enforcement procedure",
    enforcement:
      "If you are not satisfied with our response, you can contact the responsible market surveillance authority:",
  },
  fr: {
    title: "Déclaration d'accessibilité",
    intro: (org, scope) =>
      `${org} s'engage à rendre ${scope} accessible conformément aux exigences d'accessibilité applicables. Cette déclaration s'applique à ${scope}.`,
    service: "Description du service",
    statusHeading: "État de conformité",
    status: {
      full: (std) => `Ce service est entièrement conforme à ${std}.`,
      partial: (std) =>
        `Ce service est partiellement conforme à ${std}. Les contenus énumérés ci-dessous ne sont pas accessibles.`,
      none: (std) => `Ce service n'est actuellement pas conforme à ${std}.`,
    },
    issuesHeading: "Contenus non accessibles",
    reason: "Justification et alternative",
    plannedFix: "Correction prévue",
    preparationHeading: "Établissement de cette déclaration",
    prepared: (d) => `Cette déclaration a été établie le ${d}.`,
    reviewed: (d) => `Elle a été révisée pour la dernière fois le ${d}.`,
    methodSelf: "L'évaluation repose sur une auto-évaluation.",
    methodThirdParty: (a) => `L'évaluation repose sur un audit réalisé par ${a}.`,
    feedbackHeading: "Retour d'information et contact",
    feedback:
      "Vous avez constaté un défaut d'accessibilité ou vous avez besoin d'un contenu sous une forme accessible ? Contactez-nous :",
    email: "E-mail",
    phone: "Téléphone",
    postal: "Courrier",
    enforcementHeading: "Procédure de recours",
    enforcement:
      "Si notre réponse ne vous satisfait pas, vous pouvez vous adresser à l'autorité de surveillance du marché compétente :",
  },
  it: {
    title: "Dichiarazione di accessibilità",
    intro: (org, scope) =>
      `${org} si impegna a rendere ${scope} accessibile in conformità ai requisiti di accessibilità applicabili. La presente dichiarazione si applica a ${scope}.`,
    service: "Descrizione del servizio",
    statusHeading: "Stato di conformità",
    status: {
      full: (std) => `Questo servizio è pienamente conforme a ${std}.`,
      partial: (std) =>
        `Questo servizio è parzialmente conforme a ${std}. I contenuti elencati di seguito non sono accessibili.`,
      none: (std) => `Questo servizio attualmente non è conforme a ${std}.`,
    },
    issuesHeading: "Contenuti non accessibili",
    reason: "Motivazione e alternativa",
    plannedFix: "Correzione prevista",
    preparationHeading: "Redazione della presente dichiarazione",
    prepared: (d) => `La presente dichiarazione è stata redatta il ${d}.`,
    reviewed: (d) => `È stata riesaminata l'ultima volta il ${d}.`,
    methodSelf: "La valutazione si basa su un'autovalutazione.",
    methodThirdParty: (a) => `La valutazione si basa su una verifica effettuata da ${a}.`,
    feedbackHeading: "Feedback e contatti",
    feedback:
      "Avete riscontrato barriere di accessibilità o avete bisogno di contenuti in un formato accessibile? Contattateci:",
    email: "E-mail",
    phone: "Telefono",
    postal: "Posta",
    enforcementHeading: "Procedura di attuazione",
    enforcement:
      "Se la nostra risposta non vi soddisfa, potete rivolgervi all'autorità di vigilanza del mercato competente:",
  },
};

/** Common enforcement bodies. Check that they still apply before publishing a statement. */
export const enforcementBodies = {
  /** Germany, BFSG: joint market surveillance body of the federal states, based in Magdeburg. */
  DE: {
    name: "Marktüberwachungsstelle der Länder für die Barrierefreiheit von Produkten und Dienstleistungen (MLBF)",
  },
  /** Austria, BaFG. */
  AT: { name: "Sozialministeriumservice" },
} as const;
