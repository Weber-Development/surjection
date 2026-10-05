import "@sweber/surjection/vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AnnouncerProvider, SkipLink, useAnnounce, VisuallyHidden } from "../src";

afterEach(cleanup);

describe("SkipLink", () => {
  it("moves focus to the main content", () => {
    render(
      <>
        <SkipLink />
        <nav>Navigation</nav>
        <main id="main">Inhalt</main>
      </>,
    );
    fireEvent.click(screen.getByText("Zum Inhalt springen"));
    expect(document.activeElement?.id).toBe("main");
    expect(document.getElementById("main")?.getAttribute("tabindex")).toBe("-1");
  });

  it("is accessible", async () => {
    const { container } = render(<SkipLink targetId="content" />);
    await expect(container).toBeAccessible();
  });
});

describe("VisuallyHidden", () => {
  it("keeps text available to assistive technology", () => {
    render(
      <button type="button">
        <span aria-hidden="true">×</span>
        <VisuallyHidden>Schliessen</VisuallyHidden>
      </button>,
    );
    expect(screen.getByRole("button", { name: "Schliessen" })).toBeTruthy();
  });
});

describe("useAnnounce", () => {
  it("writes messages into the live region", () => {
    vi.useFakeTimers();
    function Filter() {
      const announce = useAnnounce();
      return (
        <button type="button" onClick={() => announce("3 Ergebnisse gefunden")}>
          Filtern
        </button>
      );
    }
    render(
      <AnnouncerProvider>
        <Filter />
      </AnnouncerProvider>,
    );
    fireEvent.click(screen.getByText("Filtern"));
    act(() => {
      vi.advanceTimersByTime(60);
    });
    expect(screen.getByRole("status").textContent).toBe("3 Ergebnisse gefunden");
    vi.useRealTimers();
  });
});
