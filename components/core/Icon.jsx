import React from "react";

/* Icon renders a glyph from Void's own self-hosted SVG sprite — no third-party
   origin, no icon CDN, no icon font (UI-INV-13 / NFR-SEC-20).

   The sprite is expected at assets/icons/void-icons.svg. Pages that sit at a
   different depth set the path once, before render:
     window.VOID_ICON_SPRITE = "../../assets/icons/void-icons.svg";

   BLOCKED: the sprite file is not in the project yet — see
   assets/icons/README.md. Until it lands, Icon reserves its box and renders
   nothing, so layout is stable and no request is made to anyone else's server. */

const SPRITE = () =>
  (typeof window !== "undefined" && window.VOID_ICON_SPRITE) || "assets/icons/void-icons.svg";

export function Icon({ name, size = 16, strokeWidth = 1.5, color = "currentColor", label, style, ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : "true"}
      focusable="false"
      style={{ display: "block", flex: "none", color, ...style }}
      {...rest}
    >
      {label ? <title>{label}</title> : null}
      <use href={`${SPRITE()}#${name}`} />
    </svg>
  );
}
