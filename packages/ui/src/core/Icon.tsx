import * as React from "react";
import { ICONS, type VoidIconName } from "@void/tokens/icons";

/* Icon — renders a glyph from Void's own self-hosted Lucide subset.
 *
 * A Server Component. The geometry is compiled into the build by
 * packages/tokens/src/generate-icons.mjs, so there is no sprite fetch, no
 * client JS, and no empty box on first paint. See that file for why the
 * reference implementation's runtime fetch and its two abandoned <use>
 * approaches all drop away in this stack.
 *
 * Accessibility (readme.md, Iconography):
 *   · `label` names the glyph and makes it an image
 *   · without `label` it is decorative and hidden from assistive tech, which is
 *     the correct default because icons never travel alone in navigation —
 *     they pair with a visible text label
 *   · an icon-only control must supply the name on the control, not the glyph;
 *     IconButton requires it
 *
 * The glyph is always currentColor. Never a chart hue, never two-tone, never
 * filled — the sprite carries geometry and this supplies stroke, width, linecap
 * and linejoin, which is what lets one set of paths serve every size and colour.
 */

/** The documented ramp. A numeric size would be a literal under UI-SRC-9. */
export type IconSize = "sm" | "md" | "lg" | "xl";

const SIZE_VAR: Record<IconSize, string> = {
  sm: "var(--icon-sm)",
  md: "var(--icon-md)",
  lg: "var(--icon-lg)",
  xl: "var(--icon-xl)",
};

export interface IconProps extends Omit<React.SVGAttributes<SVGSVGElement>, "children"> {
  name: VoidIconName;
  size?: IconSize;
  /** Accessible name. Omit for a decorative glyph sitting beside real text. */
  label?: string;
}

export function Icon({ name, size = "md", label, style, ...rest }: IconProps) {
  const nodes = ICONS[name];

  if (!nodes) {
    // Unreachable through the type system; this only fires if the sprite was
    // regenerated without the name. Reserve the box so layout does not shift.
    return (
      <svg
        aria-hidden="true"
        focusable="false"
        style={{ inlineSize: SIZE_VAR[size], blockSize: SIZE_VAR[size], flex: "none", ...style }}
        {...rest}
      />
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : "true"}
      focusable="false"
      style={{
        display: "block",
        inlineSize: SIZE_VAR[size],
        blockSize: SIZE_VAR[size],
        flex: "none",
        // stroke-width goes through CSS, not the presentation attribute: a
        // presentation attribute must be a plain number and does not resolve var().
        strokeWidth: "var(--stroke-icon)",
        ...style,
      }}
      {...rest}
    >
      {label ? <title>{label}</title> : null}
      {nodes.map(([Tag, attrs], i) => (
        <Tag key={i} {...attrs} />
      ))}
    </svg>
  );
}

export type { VoidIconName };
