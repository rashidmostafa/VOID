import * as React from "react";

/* Field — label, hint, error and the ARIA wiring that connects them.
 *
 * The reference renders the hint and error as a loose <span> beside the control,
 * connected to nothing. That looks right and is not: a screen reader user
 * reaching the field is told neither that it is invalid nor why. FR-CHK-3
 * requires address fields to validate "with inline, specific error messages",
 * and FR-CHK-9 requires them rendered from the country address schema rather
 * than hard-coded — so this wiring is done once, here, and every field in
 * checkout inherits it rather than re-implementing it per country.
 *
 * Wired here, not per control:
 *   · label -> control via htmlFor/id
 *   · aria-describedby -> hint and/or error
 *   · aria-invalid when there is an error
 *   · aria-required, plus a visible required marker
 *   · role="alert" on the error so it is announced when it appears
 *
 * A Server Component, which is why an id is required rather than generated:
 * React's useId cannot run on the server. `name` is accepted in its place
 * because a field that submits must have one anyway.
 */

export type FieldIdentity =
  | { id: string; name?: string }
  | { id?: string; name: string };

export interface FieldChrome {
  label?: React.ReactNode;
  /** Helper text. Shown only when there is no error — an error replaces it. */
  hint?: React.ReactNode;
  /** Names the problem and the fix. "Enter a 4-digit postcode." */
  error?: React.ReactNode;
  required?: boolean;
  disabled?: boolean;
}

export interface FieldAria {
  id: string;
  "aria-describedby"?: string;
  "aria-invalid"?: true;
  "aria-required"?: true;
  disabled?: boolean;
}

export type FieldProps = FieldChrome &
  FieldIdentity & {
    children: (aria: FieldAria) => React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
  };

export function fieldIds(id: string) {
  return { hintId: `${id}-hint`, errorId: `${id}-error` };
}

export function Field({
  id,
  name,
  label,
  hint,
  error,
  required = false,
  disabled = false,
  children,
  className,
  style,
}: FieldProps) {
  const fieldId = (id ?? name) as string;
  const { hintId, errorId } = fieldIds(fieldId);

  // An error replaces the hint rather than stacking with it: two lines of
  // guidance under a field that has just failed is noise at the worst moment.
  const describedBy = error ? errorId : hint ? hintId : undefined;

  const aria: FieldAria = {
    id: fieldId,
    "aria-describedby": describedBy,
    ...(error ? { "aria-invalid": true as const } : null),
    ...(required ? { "aria-required": true as const } : null),
    disabled,
  };

  return (
    <div
      className={className}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-2)",
        // A grid or flex item defaults to min-width:auto, which honours the
        // intrinsic min-content width of an <input> (default size=20 characters).
        // Without this a field refuses to shrink and overflows a narrow column —
        // caught at 320 under the placeholder set, whose wider system font makes
        // the intrinsic width larger.
        minInlineSize: 0,
        opacity: disabled ? "var(--opacity-disabled)" : undefined,
        ...style,
      }}
    >
      {label ? (
        <label htmlFor={fieldId} style={{ font: "var(--type-label)", color: "var(--fg-primary)" }}>
          {label}
          {required ? (
            <>
              {" "}
              {/* The marker is decorative; aria-required carries the meaning. */}
              <span aria-hidden="true" style={{ color: "var(--error-text)" }}>
                *
              </span>
            </>
          ) : null}
        </label>
      ) : null}

      {children(aria)}

      {error ? (
        <p id={errorId} role="alert" style={{ font: "var(--type-ui-sm)", color: "var(--error-text)" }}>
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} style={{ font: "var(--type-ui-sm)", color: "var(--fg-secondary)" }}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
