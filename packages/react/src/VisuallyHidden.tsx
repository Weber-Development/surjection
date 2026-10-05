import type { CSSProperties, HTMLAttributes } from "react";

/** Hides content visually while keeping it available to screen readers. */
export const visuallyHiddenStyle: CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
};

export function VisuallyHidden({ style, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span {...props} style={{ ...visuallyHiddenStyle, ...style }} />;
}
