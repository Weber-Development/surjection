import type { Locale as AxeLocale } from "axe-core";
import de from "axe-core/locales/de.json";
import fr from "axe-core/locales/fr.json";
import it from "axe-core/locales/it.json";
import type { Locale } from "./types";

/** axe-core translations for the supported locales; English is axe's built-in default. */
export function axeLocale(locale: Locale | undefined): AxeLocale | undefined {
  switch (locale) {
    case "de":
    case "de-CH":
      return de as unknown as AxeLocale;
    case "fr":
      return fr as unknown as AxeLocale;
    case "it":
      return it as unknown as AxeLocale;
    default:
      return undefined;
  }
}
