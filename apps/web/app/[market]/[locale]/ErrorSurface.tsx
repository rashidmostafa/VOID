import { getTranslations } from "next-intl/server";
import { marketPath } from "@void/market";
import { Button } from "@void/ui/core/Button";
import { Input } from "@void/ui/forms/Input";

/* The branded 404 and 500 — UI-GLOB-6.
 *
 * "A branded 404 page and a branded 500 page shall exist, both offering search
 *  and primary navigation."
 *
 * Both halves are load-bearing. An error page whose only exit is the browser's
 * back button is where a session ends; search and navigation are what make it a
 * recoverable moment instead. The search here is a real GET form to the listing,
 * so it works with no client JS — a decorative input that goes nowhere would
 * satisfy the letter of the requirement and none of its purpose.
 *
 * Voice (readme.md): errors name the object and state what did not happen. No
 * apology, no "oops", no illustration.
 */

export async function ErrorSurface({
  market,
  locale,
  title,
  body,
  diagnostic,
  action,
}: {
  market: string;
  locale: string;
  title: string;
  body: string;
  /** Request id or code, for support. Never a stack trace (UI-GLOB-2). */
  diagnostic?: string;
  action?: React.ReactNode;
}) {
  const t = await getTranslations();
  const listing = marketPath(market, locale, "/c/new-in");

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

        <h1 style={{ font: "var(--type-h1)" }}>{title}</h1>
        <p style={{ font: "var(--type-body)", color: "var(--fg-secondary)" }}>{body}</p>

        {/* UI-GLOB-2: a reference support can act on, never internal detail. */}
        {diagnostic ? (
          <p style={{ font: "var(--type-mono)", color: "var(--fg-secondary)" }}>{diagnostic}</p>
        ) : null}

        {/* Search: a real form, method GET, no JS required. */}
        <form action={listing} style={{ display: "flex", gap: "var(--space-3)", alignItems: "flex-end", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 var(--measure-tight)", minInlineSize: 0 }}>
            <Input name="q" label={t("errors.search")} placeholder={t("errors.searchPlaceholder")} />
          </div>
          <Button type="submit" variant="outline">
            {t("errors.search")}
          </Button>
        </form>

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          <p style={{ font: "var(--type-ui-sm)", color: "var(--fg-secondary)" }}>{t("errors.orBrowse")}</p>
          <nav aria-label={t("nav.primary")} style={{ display: "flex", gap: "var(--space-4)", flexWrap: "wrap" }}>
            <a href={listing} style={LINK}>{t("nav.newIn")}</a>
            <a href={marketPath(market, locale, "/bag")} style={LINK}>{t("nav.bag")}</a>
            <a href={marketPath(market, locale, "/account")} style={LINK}>{t("nav.account")}</a>
          </nav>
        </div>

        {action}
      </div>
    </main>
  );
}

const LINK = { font: "var(--type-ui)", color: "var(--fg-link)" };
