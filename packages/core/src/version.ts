declare const __SURJECTION_VERSION__: string | undefined;

/** Version of this package, injected at build time. */
export const VERSION: string =
  typeof __SURJECTION_VERSION__ === "string" ? __SURJECTION_VERSION__ : "0.0.0";
