import { type AnchorHTMLAttributes, type FocusEvent, useState } from "react";
import { visuallyHiddenStyle } from "./VisuallyHidden";

export interface SkipLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Id of the main content element. Default: "main". */
  targetId?: string;
}

/**
 * First focusable element on the page; jumps keyboard users past the navigation (WCAG 2.4.1).
 * Hidden until focused. Style it via className; visible styles apply while focused.
 */
export function SkipLink({
  targetId = "main",
  children = "Zum Inhalt springen",
  style,
  onFocus,
  onBlur,
  onClick,
  ...props
}: SkipLinkProps) {
  const [focused, setFocused] = useState(false);
  return (
    <a
      href={`#${targetId}`}
      {...props}
      style={focused ? style : { ...visuallyHiddenStyle, ...style }}
      onFocus={(event: FocusEvent<HTMLAnchorElement>) => {
        setFocused(true);
        onFocus?.(event);
      }}
      onBlur={(event: FocusEvent<HTMLAnchorElement>) => {
        setFocused(false);
        onBlur?.(event);
      }}
      onClick={(event) => {
        onClick?.(event);
        const target = document.getElementById(targetId);
        if (!target || event.defaultPrevented) return;
        // Move focus too, so the next Tab continues inside the main content.
        if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
        target.focus();
      }}
    >
      {children}
    </a>
  );
}
