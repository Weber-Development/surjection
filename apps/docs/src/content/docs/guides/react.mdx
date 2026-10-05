---
title: React building blocks
description: Small, unstyled components for patterns that are easy to get wrong.
---

```sh
pnpm add @sweberdev/surjection-react
```

## SkipLink

The first focusable element on the page. It lets keyboard users jump past the navigation (WCAG 2.4.1) and moves focus into the main content.

```tsx
import { SkipLink } from "@sweberdev/surjection-react";

<SkipLink targetId="main" className="skip-link">Zum Inhalt springen</SkipLink>
<Header />
<main id="main">…</main>
```

It stays hidden until it receives focus. Style the visible state through `className`.

## VisuallyHidden

Text for screen readers that is not shown on screen, e.g. for icon buttons:

```tsx
<button type="button">
  <CloseIcon aria-hidden="true" />
  <VisuallyHidden>Schliessen</VisuallyHidden>
</button>
```

## AnnouncerProvider and useAnnounce

Screen readers do not notice content that changes without a page load, such as "3 results" after filtering or "Added to cart". `useAnnounce` reads such messages out (WCAG 4.1.3).

```tsx
import { AnnouncerProvider, useAnnounce } from "@sweberdev/surjection-react";

function Filter() {
  const announce = useAnnounce();
  return <button type="button" onClick={() => announce("3 Ergebnisse gefunden")}>Filtern</button>;
}

<AnnouncerProvider>
  <Filter />
</AnnouncerProvider>
```

Use `announce(message, "assertive")` only for errors that need immediate attention.

## useReducedMotion

`true` when the user asked the system to reduce motion. Use it to turn off parallax, auto-playing carousels and large transitions.

```tsx
const reduce = useReducedMotion();
<motion.div animate={{ x: 100 }} transition={{ duration: reduce ? 0 : 0.4 }} />
```
