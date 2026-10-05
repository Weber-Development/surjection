import { createContext, type ReactNode, useCallback, useContext, useRef, useState } from "react";
import { VisuallyHidden } from "./VisuallyHidden";

type Politeness = "polite" | "assertive";
type Announce = (message: string, politeness?: Politeness) => void;

const AnnouncerContext = createContext<Announce | null>(null);

/**
 * Renders two live regions once per app. Screen readers only announce changes to live regions
 * that already exist in the DOM, so they must be mounted before the first message.
 */
export function AnnouncerProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Record<Politeness, string>>({
    polite: "",
    assertive: "",
  });
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const announce = useCallback<Announce>((message, politeness = "polite") => {
    // Clear first so repeating the same message is announced again.
    setMessages((m) => ({ ...m, [politeness]: "" }));
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMessages((m) => ({ ...m, [politeness]: message })), 50);
  }, []);

  return (
    <AnnouncerContext.Provider value={announce}>
      {children}
      <VisuallyHidden role="status" aria-live="polite" aria-atomic="true">
        {messages.polite}
      </VisuallyHidden>
      <VisuallyHidden role="alert" aria-live="assertive" aria-atomic="true">
        {messages.assertive}
      </VisuallyHidden>
    </AnnouncerContext.Provider>
  );
}

/** Announces a message to screen readers, e.g. "3 Ergebnisse gefunden" after filtering. */
export function useAnnounce(): Announce {
  const announce = useContext(AnnouncerContext);
  if (!announce) throw new Error("useAnnounce must be used inside <AnnouncerProvider>.");
  return announce;
}
