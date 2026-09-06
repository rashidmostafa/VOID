import * as React from "react";
import { Icon } from "../core/Icon";

/* ErrorState — the error-with-retry state of UI-GLOB-1.
 *
 * "Errors name the object and the fix." Not "Something went wrong."
 *
 * The shape enforces that as far as a type can:
 *   · `title` names the object and states what did NOT happen
 *   · `body` says what to do about it
 *   · `retry` is required — an error state without a way forward is a dead end,
 *     and UI-GLOB-1 asks for error-WITH-RETRY, not error
 *   · `diagnostic` carries the request id or code in mono for support, which is
 *     what turns "it broke" into a ticket someone can act on
 *
 * `retry` is a node rather than a callback so this stays a Server Component and
 * the caller decides whether the retry is a form action, a router refresh or a
 * client handler. A Server Component cannot hold an onClick.
 */

export interface ErrorStateProps {
  /** Names the object and what did not happen. "Your bag could not be loaded." */
  title: string;
  /** What to do about it. Specific, second person, imperative. */
  body: string;
  /** Request id or error code, for support. Rendered in mono. */
  diagnostic?: string;
  /** Required: UI-GLOB-1 asks for error-with-retry. */
  retry: React.ReactNode;
  /** A secondary route out, where one helps. */
  secondaryAction?: React.ReactNode;
  narrow?: boolean;
}

export function ErrorState({
  title,
  body,
  diagnostic,
  retry,
  secondaryAction,
  narrow = false,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-4)",
        paddingBlock: narrow ? "var(--space-10)" : "var(--space-16)",
        paddingInline: narrow ? "var(--space-5)" : "var(--space-10)",
        background: "var(--error-bg)",
        border: "var(--border-width-thin) solid var(--error-border)",
        borderRadius: "var(--radius-lg)",
      }}
    >
      <p
        style={{
          font: "var(--type-label)",
          textTransform: "uppercase",
          letterSpacing: "var(--tracking-widest)",
          color: "var(--error-text)",
          display: "flex",
          alignItems: "center",
          gap: "var(--space-2)",
        }}
      >
        {/* Decorative: the word beside it already says "Error". */}
        <Icon name="triangle-alert" size="sm" />
        Error
      </p>

      <p style={{ font: "var(--type-h3)", color: "var(--error-text)" }}>{title}</p>
      <p style={{ font: "var(--type-body)", color: "var(--fg-primary)", maxInlineSize: "var(--measure-default)" }}>{body}</p>

      {diagnostic ? (
        <p style={{ font: "var(--type-mono)", color: "var(--fg-secondary)" }}>{diagnostic}</p>
      ) : null}

      <div
        style={{
          display: "flex",
          gap: "var(--space-3)",
          flexWrap: "wrap",
          marginBlockStart: "var(--space-1)",
        }}
      >
        {retry}
        {secondaryAction}
      </div>
    </div>
  );
}
