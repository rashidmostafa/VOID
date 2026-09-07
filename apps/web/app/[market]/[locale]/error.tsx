"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@void/ui/core/Button";

/* The branded 500 (UI-GLOB-6).
 *
 * An error boundary must be a Client Component — React needs to catch the throw
 * and offer a reset. It cannot reuse the server-rendered ErrorSurface, so it
 * repeats its shape rather than importing it; the alternative is making the
 * whole surface client-side to share it, which would put the 404 on the client
 * for no benefit.
 *
 * UI-GLOB-2: the message is human and actionable, and `digest` is the reference
 * support can trace — never the stack, which would leak internals. */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations();

  useEffect(() => {
    // Observability (§8.6) belongs here once a reporter exists.
    console.error(error);
  }, [error]);

  return (
    <main
      style={{
        maxInlineSize: "var(--layout-max-editorial)",
        marginInline: "auto",
        paddingInline: "var(--space-6)",
        paddingBlock: "var(--space-16)",
      }}
    >
      <div style={{ maxInlineSize: "var(--measure-default)", display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
        <p
          style={{
            font: "var(--type-label)",
            fontSize: "var(--text-2xs)",
            textTransform: "uppercase",
            letterSpacing: "var(--tracking-widest)",
            color: "var(--fg-secondary)",
          }}
        >
          {t("common.brand")}
        </p>
        <h1 style={{ font: "var(--type-h1)" }}>{t("errors.serverError.title")}</h1>
        <p style={{ font: "var(--type-body)", color: "var(--fg-secondary)" }}>{t("errors.serverError.body")}</p>
        {error.digest ? (
          <p style={{ font: "var(--type-mono)", color: "var(--fg-secondary)" }}>{error.digest}</p>
        ) : null}
        <p>
          <Button variant="primary" onClick={reset}>
            {t("errors.serverError.action")}
          </Button>
        </p>
      </div>
    </main>
  );
}
