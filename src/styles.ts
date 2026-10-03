import type { CSSProperties } from "react";

// Tailwind classes only exist in the host's CSS if the host itself uses
// them, so plugin UI is styled inline.
export const cardStyle: CSSProperties = {
    margin: "0.75rem",
    padding: "0.75rem",
    borderRadius: "0.5rem",
    border: "1px solid rgb(59 130 246 / 0.35)",
    background: "rgb(59 130 246 / 0.08)",
    fontSize: "0.875rem",
    lineHeight: 1.4,
};

export const headingStyle: CSSProperties = {
    fontWeight: 600,
    color: "rgb(59 130 246)",
};

export const buttonStyle: CSSProperties = {
    marginTop: "0.5rem",
    padding: "0.375rem 0.75rem",
    borderRadius: "0.375rem",
    border: "1px solid currentColor",
    background: "transparent",
    color: "inherit",
    cursor: "pointer",
};
