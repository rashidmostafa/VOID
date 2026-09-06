import * as React from "react";

/* Switch — immediate on/off. No Save step.
 *
 * The important correction to the reference is RTL. The reference animates the
 * knob with `left`, which is physical: in an RTL locale the track mirrors but
 * the knob still slides toward the physical left, so "on" ends up on the wrong
 * side and the transition runs backwards. UI-INV-7 requires logical properties
 * precisely so an RTL locale needs no structural rewrite, and FR-I18N-12 keeps
 * RTL in scope regardless of whether an RTL locale has shipped (J-12).
 *
 * So the knob is positioned with `inset-inline-start` and moves to
 * `calc(100% - knob - inset)` when checked — correct in both directions, with no
 * second rule and no mirroring hack.
 *
 * The offset is set on the track by `peer-checked` and inherited by the knob:
 * Tailwind's peer variant reaches siblings, and the knob is a descendant of one.
 * Server Component — the visual state is entirely CSS.
 */

type SwitchSize = "sm" | "md";

const TRACK: Record<SwitchSize, { w: string; h: string; knob: string }> = {
  sm: { w: "var(--switch-track-w-sm)", h: "var(--switch-track-h-sm)", knob: "var(--switch-knob-sm)" },
  md: { w: "var(--switch-track-w-md)", h: "var(--switch-track-h-md)", knob: "var(--switch-knob-md)" },
};

export interface SwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label?: React.ReactNode;
  size?: SwitchSize;
  /** Pointer-only dense surfaces only. Pair with .void-touch-safe. */
  dense?: boolean;
}

export function Switch({
  label,
  size = "md",
  dense = false,
  disabled = false,
  className = "",
  style,
  ...rest
}: SwitchProps) {
  const t = TRACK[size];

  const track = [
    "relative flex-none rounded-full",
    "bg-border-strong",
    "transition-[background-color,box-shadow] duration-[var(--duration-fast)] ease-standard",
    "peer-checked:bg-action-primary-bg",
    "peer-checked:[--knob-start:calc(100%-var(--knob-size)-var(--switch-knob-inset))]",
    "peer-focus-visible:shadow-[var(--focus-ring)]",
    "peer-disabled:cursor-not-allowed",
  ].join(" ");

  return (
    <label
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--space-3)",
        minBlockSize: dense ? undefined : "var(--touch-target-min)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? "var(--opacity-disabled)" : undefined,
        ...style,
      }}
    >
      <input type="checkbox" role="switch" className="peer void-visually-hidden" disabled={disabled} {...rest} />
      <span
        aria-hidden="true"
        className={track}
        style={{
          inlineSize: t.w,
          blockSize: t.h,
          ["--knob-size" as string]: t.knob,
        }}
      >
        <span
          style={{
            position: "absolute",
            insetBlockStart: "var(--switch-knob-inset)",
            // Logical: correct in LTR and RTL without a second rule.
            insetInlineStart: "var(--knob-start, var(--switch-knob-inset))",
            inlineSize: "var(--knob-size)",
            blockSize: "var(--knob-size)",
            borderRadius: "var(--radius-full)",
            background: "var(--bg-canvas)",
            boxShadow: "var(--shadow-xs)",
            transition: "inset-inline-start var(--duration-fast) var(--motion-easing-standard)",
          }}
        />
      </span>
      {label ? <span style={{ font: "var(--type-ui)" }}>{label}</span> : null}
    </label>
  );
}
