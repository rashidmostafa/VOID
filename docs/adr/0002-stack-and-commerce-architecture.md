# ADR-0002 — Stack, repository shape, and building the commerce primitives

**Status:** Accepted
**Date:** 2026-09-06
**Affects:** everything
**Related:** SRS Appendix G.1–G.3, Appendix J (J-2), NFR-MAINT-8, DR-GEN-9, DR-GEN-10

---

## Context

Three decisions were taken at kickoff. The stack was settled by the Product Owner; the other two
were raised and answered before any code was written.

## Decision 1 — Stack

Next.js 15 (App Router) + TypeScript + Tailwind v4, Postgres + Drizzle, `next-intl`, TanStack Table,
React + Konva for the Studio canvas, provider-hosted payment fields.

Consistent with Appendix G.1, which recommends Next.js App Router with Tailwind *"configured
entirely from the token set"*, Postgres 16, and `next-intl` or `i18next` with ICU. Appendix G.1 names
Prisma **or** Drizzle; Drizzle is chosen because DR-GEN-10 makes every rate, threshold and policy
value applied to a transaction a stored column on that transaction, which is migration-heavy
relational work.

Two departures from Appendix G.1, recorded per NFR-MAINT-8:

- **Style Dictionary is not used.** G.1 suggests it "or equivalent". The token contract carries an
  explicit `cssVar` per semantic token plus scheme and locale selectors in `meta`, which Style
  Dictionary would have to be configured to reproduce rather than helped by. `packages/tokens`
  generates directly from the contract, in ~200 lines with no dependency.
- **ESLint, not oxlint, hosts the token-literal rule.** `_adherence.oxlintrc.json` was the starting
  shape, but oxlint has no stable custom-rule plugin API, and the rule must catch Tailwind arbitrary
  values (`w-[13px]`, `bg-[#fff]`, `duration-[700ms]`) — which is where literals actually enter a
  Tailwind v4 codebase and which no CSS-only check sees.

**`next/font` is not used and is banned by a lint rule** (`void/no-next-font`). It re-hosts and
fingerprints font files, moving them outside the token pipeline and making the ADR-0001 budget
unmeasurable. Fonts are declared by the generated `@font-face` block and preloaded explicitly.

## Decision 2 — Repository shape

Appendix G.2's layout: `apps/`, `packages/`, `db/`, `docs/`, `tests/`, `scripts/`.

The design system moves to **`design-system/`** and is excluded from build and lint. It is
read-only reference the product rebuilds *from*, per `HANDOFF.md`; putting it outside the linted
tree enforces "rebuild rather than copy" structurally rather than by discipline, and stops the
harness files — which load React and Babel from a CDN by design — from being reported as UI-INV-13
violations in code that never ships.

## Decision 3 — Build the commerce primitives; do not adopt a headless backend

**The question.** The cross-border requirements are specific enough that an off-the-shelf commerce
engine may fight us, but building tax, duty and settlement from scratch carries its own risk.

**The decision: build, on Postgres + Drizzle.** Buy the lookups, build the ledger.

An engine (Medusa v2, Vendure, Saleor; Shopify is disqualified — it will not onboard a
Bangladesh-registered merchant, and J-5 data residency is not negotiable inside it) supplies
catalogue and variants, cart mechanics, an inventory ledger, an order state machine, promotion
primitives and admin CRUD. Roughly 30–40% of the domain by volume, and the well-understood part.

It does not supply, and structurally resists, the part that distinguishes Void:

- **DR-GEN-10 is a data-ownership requirement, not a calculation one.** Every engine looks up a tax
  rate and stores a total. The SRS requires the rate, the threshold, the threshold's *effective
  date*, the rate source, the FX rate, its timestamp and the delivery-terms basis persisted on the
  line. `landed_cost_quote`, `export_record` and `proceeds_realisation` (Appendix H) get built
  either way — adopting means those live in our schema joined by id to an order living in someone
  else's, across their migration history. FR-XBRD-15's exports register has to reconcile that join
  for the AD bank.
- **DR-GEN-9 spans that boundary badly.** `market_code` and `seller_of_record` on every
  order-scoped record, never back-fillable — metafields on an order we do not own, where
  `seller_of_record` changes meaning entirely if J-2 resolves to Route B.
- **FR-MKTS-12–14's readiness gate sits above the engine's hot paths.** It must block catalogue
  publication, checkout payment-method selection and shipment creation. Enforcing it means wrapping
  or forking them.
- **Two ORMs.** Medusa ships MikroORM, Vendure TypeORM, Saleor Django. Adopting means two migration
  histories in one database, or abandoning the reason Drizzle was chosen.

**Cost.** The core an engine would have supplied — G.5 steps 4, 7, 8, 11, 12, 18 — is roughly 12–16
engineer-weeks, plus the tests-first suites DEL-2 demands. Adopting saves 8–10 of those and spends
4–6 back on integration: a net **4–6 weeks in year one**, against a permanent tax where every
cross-border feature is an extension-point negotiation and every engine upgrade is a regression risk
against records we are legally obliged to produce. The cross-border work (steps 13, 22–26, 32;
10–14 weeks) and Studio (34–37; 8–10 weeks) are unavoidable on either path.

**What we buy instead.** Payments through the PSO's hosted fields (SAQ-A intact); carrier rating and
labels through carrier APIs; duty rates through a provider behind the FR-TAX-7 interface with the
internal conservative table as default and fallback (FR-TAX-11); search behind an interface
(NFR-MAINT-10); sanctions screening from a provider (J-14).

**The condition that would reverse this.** If **J-2 resolves to Route B** — a merchant of record
becomes the legal seller for export transactions — then tax registration, invoicing and much of
§4.17 transfer to that provider, §4.17's surface on Void's side shrinks materially, and an engine
plus an MoR becomes defensible. J-2 is the Founder's with counsel and the AD bank; it is **not**
resolved here, and per the Build-Agent Protocol it must not be resolved by inference. This decision
should be revisited the day J-2 is answered.

## Decision 4 — Build order

The Product Owner's phase order is UI-first: components → storefront read → storefront write →
account → auth → admin → portals → Studio. Appendix G.5 and Build-Agent Protocol rule 3 require
market, identity, catalogue, inventory, pricing/tax and the landed-cost engine *before* checkout.

The conflict was raised rather than silently resolved. Both agree Studio comes last (DEL-3, RSK-5).
The narrow conflict is that the UI-first order builds checkout before `packages/trade`, the market
module and the tax engine exist — and UI-CHK-8/9 and FR-CHK-4/15/16 are about *true* itemised
numbers, with UI-INV-11 making honesty contractual. A landed-cost breakdown wired to fixtures is a
mock of the one screen where mocking is prohibited.

**Agreed resolution:** keep the Product Owner's order for the frontend, and land `packages/trade`,
the market module and the pricing/tax engine — tests first, per DEL-2 — before the storefront write
path.
