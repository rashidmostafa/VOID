import { Button } from "@void/ui/core/Button";
import { Icon } from "@void/ui/core/Icon";
import { AsyncSurface, type AsyncState } from "@void/ui/state/AsyncSurface";
import { Skeleton, SkeletonMedia, SkeletonText } from "@void/ui/state/Skeleton";
import { IconButton } from "@void/ui/core/IconButton";
import { Card, CardHeader } from "@void/ui/core/Card";
import { Badge } from "@void/ui/core/Badge";
import { Tag } from "@void/ui/core/Tag";
import { Toast, ToastRegion } from "@void/ui/feedback/Toast";
import { Tooltip } from "@void/ui/feedback/Tooltip";
import { DialogDemo } from "./DialogDemo";
import { TabsDemo } from "./TabsDemo";
import { TabLinks } from "@void/ui/navigation/TabLinks";
import { SideNav } from "@void/ui/navigation/SideNav";
import { Input } from "@void/ui/forms/Input";
import { Select } from "@void/ui/forms/Select";
import { Checkbox } from "@void/ui/forms/Checkbox";
import { Radio } from "@void/ui/forms/Radio";
import { Switch } from "@void/ui/forms/Switch";
import { ProductCard } from "@void/ui/commerce/ProductCard";
import { CostBreakdown } from "@void/ui/commerce/CostBreakdown";
import { marketByCode, money } from "@void/market";
import { ICON_NAMES } from "@void/tokens/icons";

/* The preview surface UI-SRC-8 asks for.
 *
 * Every component in the library, in every state, on one page. The theme-swap
 * gate renders THIS — not a mock of it — under each token set at 320 and 1440,
 * light and dark, en and bn. So a component that only works under one theme,
 * clips at 320, or throws in one scheme fails CI the moment it is added here,
 * without anyone writing a test for it.
 *
 * Adding a component to the library means adding it to this page. That is the
 * whole contract; there is no separate test to remember.
 *
 * This is a review surface, not a product screen — but unlike the design
 * system's harness it carries no toolbar and no prop switching. The axes are
 * driven from outside by the gate, which is what keeps this page free of
 * review scaffolding that must not ship (HANDOFF: "do not port the toolbar").
 */

export const metadata = { title: "Void — component preview" };

const eyebrow = {
  font: "var(--type-label)",
  textTransform: "uppercase" as const,
  letterSpacing: "var(--tracking-widest)",
  color: "var(--fg-secondary)",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-4)",
        paddingBlock: "var(--space-8)",
        borderBlockStart: "var(--border-width-thin) solid var(--border-default)",
      }}
    >
      <h2 style={eyebrow}>{title}</h2>
      {children}
    </section>
  );
}

const row = {
  display: "flex",
  gap: "var(--space-3)",
  flexWrap: "wrap" as const,
  alignItems: "center",
};

/* Three fixed states so the page renders all four branches at once rather than
   needing interaction the gate cannot perform. */
const READY: AsyncState<string[]> = { status: "ready", data: ["Autumn handloom", "Jamdani shirt"] };
const LOADING: AsyncState<string[]> = { status: "loading" };
const EMPTY: AsyncState<string[]> = { status: "empty" };
const ERRORED: AsyncState<string[]> = { status: "error", diagnostic: "req_8f21c4 · CATALOGUE_UNAVAILABLE" };

function ProductSkeleton() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "var(--space-4)" }}>
      {[0, 1].map((i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          <SkeletonMedia />
          <Skeleton width="70%" />
          <Skeleton width="40%" />
        </div>
      ))}
    </div>
  );
}

function Surface({ state }: { state: AsyncState<string[]> }) {
  return (
    <AsyncSurface
      state={state}
      label="Loading pieces"
      skeleton={<ProductSkeleton />}
      empty={{
        title: "No pieces match those filters.",
        hint: "Removing the price filter returns 128 pieces.",
        action: <Button variant="outline">Clear filters</Button>,
      }}
      error={{
        title: "The catalogue could not be loaded.",
        body: "The connection did not complete. Try again, or contact support with the reference below.",
        retry: <Button variant="primary">Try again</Button>,
        secondaryAction: <Button variant="outline">Contact support</Button>,
      }}
    >
      {(data) => (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "var(--space-4)" }}>
          {data.map((name) => (
            <div key={name} style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
              <div style={{ aspectRatio: "3 / 4", background: "var(--bg-surface-sunken)", borderRadius: "var(--radius-media)" }} />
              <p style={{ font: "var(--type-ui)" }}>{name}</p>
              <p style={{ font: "var(--type-ui-sm)", color: "var(--commerce-price)" }}>৳2,450</p>
            </div>
          ))}
        </div>
      )}
    </AsyncSurface>
  );
}

/* A dismiss control that works without JS: inside a form it submits, outside one
   it is still a real, focusable, 44px button. */
function ToastDismiss() {
  return (
    <button
      type="button"
      aria-label="Dismiss notification"
      className="void-touch-safe"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flex: "none",
        border: "none",
        background: "transparent",
        color: "var(--fg-secondary)",
        cursor: "pointer",
        padding: 0,
        fontSize: "var(--text-md)",
        lineHeight: "var(--leading-none)",
      }}
    >
      <span aria-hidden="true">×</span>
    </button>
  );
}

export default function Preview() {
  return (
    <main
      style={{
        maxInlineSize: "var(--layout-max-editorial)",
        marginInline: "auto",
        paddingInline: "var(--space-6)",
        paddingBlock: "var(--space-8)",
      }}
    >
      <p style={eyebrow}>Preview surface · UI-SRC-8</p>
      <h1 style={{ font: "var(--type-h1)", marginBlockStart: "var(--space-2)" }}>Void</h1>

      <Section title="Button — variants">
        <div style={row}>
          <Button variant="primary">Add to bag</Button>
          <Button variant="secondary">Save for later</Button>
          <Button variant="outline">Size guide</Button>
          <Button variant="ghost">Cancel</Button>
          <Button variant="destructive">Remove</Button>
          <Button variant="accent">Order this design</Button>
          <Button variant="link">Track your order</Button>
        </div>
      </Section>

      <Section title="Button — sizes and states">
        <div style={row}>
          <Button size="lg">Large</Button>
          <Button size="md">Medium</Button>
          {/* sm is pointer-only and allowlisted; shown here for review, not for a
              storefront surface. */}
          <Button size="sm" className="void-touch-safe">Small</Button>
          <Button disabled>Disabled</Button>
          <Button loading>Placing order</Button>
        </div>
        <Button block variant="primary">Block</Button>
      </Section>

      <Section title="Button — 40% text expansion (UI-INV-6)">
        <div style={row}>
          <Button variant="primary">Add to bag</Button>
          <Button variant="primary">Add this piece to your shopping bag now</Button>
        </div>
      </Section>

      <Section title={`Icon — ${ICON_NAMES.length} symbols, four sizes`}>
        <div style={row}>
          <Icon name="search" size="sm" label="Search" />
          <Icon name="shopping-bag" size="md" label="Bag" />
          <Icon name="truck" size="lg" label="Delivery" />
          <Icon name="shirt" size="xl" label="Garment" />
        </div>
        <div style={{ ...row, gap: "var(--space-2)", color: "var(--fg-secondary)" }}>
          {ICON_NAMES.map((n) => (
            <Icon key={n} name={n} size="sm" />
          ))}
        </div>
      </Section>

      <Section title="Four states (UI-GLOB-1) — populated">
        <Surface state={READY} />
      </Section>
      <Section title="Four states — loading skeleton, mirroring the populated layout">
        <Surface state={LOADING} />
      </Section>
      <Section title="Four states — empty">
        <Surface state={EMPTY} />
      </Section>
      <Section title="Four states — error with retry">
        <Surface state={ERRORED} />
      </Section>

      <Section title="IconButton — variants, sizes, active">
        <div style={row}>
          <IconButton icon={<Icon name="search" />} label="Search" />
          <IconButton icon={<Icon name="heart" />} label="Save to wishlist" variant="outline" />
          <IconButton icon={<Icon name="shopping-bag" />} label="Open bag" variant="solid" />
          <IconButton icon={<Icon name="sliders-horizontal" />} label="Filters" active />
          <IconButton icon={<Icon name="trash-2" />} label="Remove" variant="outline" disabled />
        </div>
        <div style={row}>
          {/* sm and md are under 44px and carry .void-touch-safe automatically. */}
          <IconButton icon={<Icon name="pencil" size="sm" />} label="Edit" size="sm" variant="outline" />
          <IconButton icon={<Icon name="pencil" />} label="Edit" size="md" variant="outline" />
          <IconButton icon={<Icon name="pencil" size="lg" />} label="Edit" size="lg" variant="outline" />
        </div>
      </Section>

      <Section title="Badge — tones and sizes">
        <div style={row}>
          <Badge>Draft</Badge>
          <Badge tone="solid">New</Badge>
          <Badge tone="outline">Made to order</Badge>
          <Badge tone="success" dot>Delivered</Badge>
          <Badge tone="warning" dot>Customs clearance</Badge>
          <Badge tone="danger">Payment failed</Badge>
          <Badge tone="info">Awaiting review</Badge>
        </div>
        <div style={row}>
          <Badge size="sm" tone="success">Small</Badge>
          <Badge size="md" tone="success">Medium</Badge>
        </div>
      </Section>

      <Section title="Tag — filter chips, as links and as form controls">
        <div style={row}>
          <Tag href="?size=s">S</Tag>
          <Tag href="?size=m" selected>M</Tag>
          <Tag href="?size=l">L</Tag>
        </div>
        <form action="/preview" style={row}>
          <Tag selected removeName="clear" removeValue="handloom" removeLabel="Remove the Handloom filter">
            Handloom
          </Tag>
          <Tag selected removeName="clear" removeValue="under-3000" removeLabel="Remove the under ৳3,000 filter">
            Under ৳3,000
          </Tag>
          <Tag href="?f=dhaka" removeHref="?clear=dhaka" removeLabel="Remove the Made in Dhaka filter">
            Made in Dhaka
          </Tag>
        </form>
      </Section>

      <Section title="Card — padding, elevation, header">
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-4)" }}>
          <Card style={{ flex: "1 1 auto", minInlineSize: 0 }}>
            <CardHeader title="Order VD-2451" meta="Placed 4 Oct · Dhaka" action={<Badge tone="success" dot>Delivered</Badge>} />
          </Card>
          <Card interactive style={{ flex: "1 1 auto", minInlineSize: 0 }}>
            <CardHeader title="Interactive" meta="Border moves on hover. No shadow growth." />
          </Card>
          <Card elevated style={{ flex: "1 1 auto", minInlineSize: 0 }}>
            <CardHeader title="Elevated" meta="--shadow-md. For a panel that floats." />
          </Card>
        </div>
      </Section>

      <Section title="Input — label, hint, error, affixes, multiline">
        <div style={{ display: "grid", gap: "var(--space-5)", maxInlineSize: "var(--measure-default)" }}>
          <Input name="full-name" label="Full name" hint="As it appears on your ID." required />
          <Input name="postcode" label="Postcode" error="Enter a 4-digit postcode." defaultValue="12" />
          <Input name="amount" label="Amount" prefix="৳" suffix="BDT" defaultValue="2,450" />
          <Input name="disabled-field" label="Disabled" defaultValue="Not editable" disabled />
          <Input name="note" label="Delivery note" multiline hint="Optional." />
        </div>
      </Section>

      <Section title="Select — native, four or more options">
        <div style={{ display: "grid", gap: "var(--space-5)", maxInlineSize: "var(--measure-default)" }}>
          <Select
            name="division"
            label="Division"
            placeholder="Choose a division"
            required
            options={["Dhaka", "Chattogram", "Khulna", "Rajshahi", "Sylhet"]}
          />
          <Select
            name="market"
            label="Market"
            error="Choose a market to see delivery options."
            options={[
              { value: "bd", label: "Bangladesh" },
              { value: "in", label: "India" },
              { value: "ae", label: "United Arab Emirates" },
              { value: "uk", label: "United Kingdom" },
            ]}
          />
        </div>
      </Section>

      <Section title="Checkbox, Radio, Switch">
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          <Checkbox name="terms" label="Save this address" />
          <Checkbox name="marketing" label="Send delivery updates by SMS" description="Standard rates apply." />
          {/* Not pre-ticked: UI-INV-11 prohibits pre-ticked consent. */}
          <Checkbox name="mixed" label="Partial selection" indeterminate />
          <Checkbox name="cb-disabled" label="Unavailable in this market" disabled />
        </div>
        <fieldset style={{ border: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          <legend style={eyebrow}>Delivery method</legend>
          <Radio name="delivery" value="standard" label="Standard" description="3–5 days." defaultChecked />
          <Radio name="delivery" value="express" label="Express" description="Next day in 14 districts." />
          <Radio name="delivery" value="pickup" label="Collect in store" disabled />
        </fieldset>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          <Switch name="sw-a" label="Show prices with duty included" defaultChecked />
          <Switch name="sw-b" label="Email me about restocks" />
          <Switch name="sw-c" label="Small" size="sm" />
          <Switch name="sw-d" label="Unavailable" disabled />
        </div>
      </Section>

      <Section title="Tooltip — names things, never explains them">
        <div style={row}>
          <Tooltip label="Search">
            <IconButton icon={<Icon name="search" />} label="Search" variant="outline" />
          </Tooltip>
          <Tooltip label="Save to wishlist" placement="bottom">
            <IconButton icon={<Icon name="heart" />} label="Save to wishlist" variant="outline" />
          </Tooltip>
          <Tooltip label="Filters" placement="end">
            <IconButton icon={<Icon name="sliders-horizontal" />} label="Filters" variant="outline" />
          </Tooltip>
        </div>
      </Section>

      <Section title="Toast — tone selects the announcement, not just the colour">
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          <Toast title="Saved to your wishlist." dismiss={<ToastDismiss />} />
          <Toast
            tone="success"
            title="Order placed."
            description="VD-2451. A confirmation is on its way to your email."
            action={<Button variant="link">View order</Button>}
            dismiss={<ToastDismiss />}
          />
          <Toast
            tone="warning"
            title="Delivery may take longer."
            description="Customs clearance is running two days behind for UK shipments."
            dismiss={<ToastDismiss />}
          />
          <Toast
            tone="danger"
            title="bKash rejected the transfer."
            description="Update the account number and retry."
            dismiss={<ToastDismiss />}
          />
        </div>
      </Section>

      <Section title="Dialog — native <dialog>, so focus and Escape come from the browser">
        <DialogDemo />
      </Section>

      {/* The live region in its real fixed position, so the gate measures it at
          320 where a 360px toast does not fit. */}
      <ToastRegion>
        <Toast
          tone="success"
          title="Added to your bag."
          action={<Button variant="link">View bag</Button>}
          dismiss={<ToastDismiss />}
        />
      </ToastRegion>

      <Section title="Tabs — in-page panels, ARIA pattern with roving tabindex">
        <TabsDemo />
      </Section>

      <Section title="TabLinks — the same look for ROUTES, as a nav of links">
        <TabLinks
          label="Account sections"
          current="/preview"
          items={[
            { href: "/preview", label: "Orders", count: 3 },
            { href: "?s=addresses", label: "Addresses" },
            { href: "?s=designs", label: "My designs" },
            { href: "?s=settings", label: "Settings" },
          ]}
        />
      </Section>

      <Section title="SideNav — links with aria-current, 44px rows">
        {/* SideNav is a 248px desktop surface. At 320 the real portal shell swaps
            it for a bottom bar (readme.md) — that is the shell's job, not this
            component's — so the preview scrolls it rather than clipping it. */}
        <div style={{ display: "flex", blockSize: "var(--layout-max-prose)", maxBlockSize: "var(--measure-tight)", border: "var(--border-width-thin) solid var(--border-default)", borderRadius: "var(--radius-lg)", overflowX: "auto" }}>
          <SideNav
            label="Back office"
            current="/preview"
            brand={<span style={{ font: "var(--type-label)", textTransform: "uppercase", letterSpacing: "var(--tracking-widest)" }}>Void</span>}
            sections={[
              {
                title: "Operations",
                items: [
                  { href: "/preview", label: "Orders", icon: <Icon name="package" size="sm" />, badge: 12 },
                  { href: "?n=customs", label: "Customs queue", icon: <Icon name="globe" size="sm" />, badge: 4 },
                  { href: "?n=returns", label: "Returns", icon: <Icon name="rotate-ccw" size="sm" /> },
                ],
              },
              {
                title: "Catalogue",
                items: [
                  { href: "?n=products", label: "Products", icon: <Icon name="shirt" size="sm" /> },
                  { href: "?n=markets", label: "Markets", icon: <Icon name="map-pin" size="sm" /> },
                ],
              },
            ]}
          />
          <div style={{ flex: 1, padding: "var(--space-5)", minInlineSize: 0 }}>
            <p style={{ font: "var(--type-ui-sm)", color: "var(--fg-secondary)" }}>
              Content pane. The sidebar is a navigation landmark of links; the active row carries
              aria-current=&quot;page&quot;.
            </p>
          </div>
        </div>
      </Section>

      <Section title="ProductCard — grid tile, price via @void/market">
        <div style={{ display: "grid", gap: "var(--space-5)", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, var(--measure-tight)), 1fr))" }}>
          <ProductCard
            href="?p=1"
            title="Autumn handloom shirt"
            designer="Void"
            sku="VD-2451-BLK"
            price={money(245_000, "BDT")}
            market={marketByCode("bd")!}
            locale="en"
            sizes={["S", "M", "L", "XL"]}
            rating={4.6}
            reviewCount={38}
            badge="New in"
            ratingLabel="4.6"
          />
          <ProductCard
            href="?p=2"
            title="Jamdani panel dress"
            designer="Rina Ahmed"
            sku="RA-1180-IND"
            price={money(685_000, "BDT")}
            compareAt={money(845_000, "BDT")}
            market={marketByCode("bd")!}
            locale="en"
            sizes={["S", "M", "L"]}
            badge="Sale"
            badgeTone="sale"
          />
          <ProductCard
            href="?p=3"
            title="Indigo field jacket"
            designer="Void"
            sku="VD-5120-IND"
            price={money(920_000, "BDT")}
            market={marketByCode("bd")!}
            locale="bn"
            badge="Sold out"
            badgeTone="soldout"
          />
        </div>
      </Section>

      <Section title="CostBreakdown — UI-CHK-8, domestic and cross-border">
        <div style={{ display: "flex", gap: "var(--space-8)", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 var(--measure-tight)", minInlineSize: 0 }}>
            <CostBreakdown
              market={marketByCode("bd")!}
              locale="en"
              open
              summaryLabel="Cost breakdown"
              rows={[
                { key: "g", label: "Goods", amount: money(646_000, "BDT") },
                { key: "s", label: "Shipping", amount: money(6_000, "BDT") },
                { key: "t", label: "VAT included in the price", amount: money(84_300, "BDT"), included: true },
              ]}
              totalLabel="Total"
              total={money(652_000, "BDT")}
              deliveryTerms={{ label: "Delivery terms", statement: "Delivered within Bangladesh." }}
            />
          </div>
          <div style={{ flex: "1 1 var(--measure-tight)", minInlineSize: 0 }}>
            <CostBreakdown
              market={marketByCode("bd")!}
              locale="en"
              open
              summaryLabel="Cost breakdown"
              rows={[
                { key: "g", label: "Goods", amount: money(2_055_000, "BDT") },
                { key: "s", label: "Shipping", amount: money(6_000, "BDT") },
                { key: "d", label: "Duty", amount: money(247_320, "BDT"), onDelivery: true },
                { key: "t", label: "Import tax", amount: money(461_664, "BDT"), onDelivery: true },
                { key: "f", label: "Brokerage and disbursement", amount: money(168_000, "BDT"), onDelivery: true },
              ]}
              totalLabel="Total"
              total={money(2_937_984, "BDT")}
              deliveryTerms={{
                label: "Delivery terms",
                statement: "The carrier will ask you for duty and import tax before delivery.",
              }}
              wideDisclosure="This estimate uses our own duty table because the rate provider was unavailable. The amount assessed on arrival may differ."
              payable={{
                atCheckoutLabel: "You pay now",
                atCheckout: money(2_061_000, "BDT"),
                onDeliveryLabel: "The carrier will ask you for",
                onDelivery: money(876_984, "BDT"),
              }}
            />
          </div>
        </div>
      </Section>

      <Section title="Skeleton primitives">
        <SkeletonText lines={3} />
      </Section>

      <Section title="Type specimen">
        <p style={{ font: "var(--type-display)" }}>Void</p>
        <p style={{ font: "var(--type-h2)" }}>Autumn handloom</p>
        <p style={{ font: "var(--type-body)", maxInlineSize: "var(--layout-max-prose)" }}>
          Made to order in Dhaka. 7–10 days.
        </p>
        <p style={{ font: "var(--type-mono)" }}>VD-2451-BLK · ৳2,450</p>
        {/* Bengali type specimen, not translated interface copy. It exercises
            conjunct formation and Bengali numerals under :lang(bn); the interface
            strings remain untranslated and must not be machine-translated. */}
        <p lang="bn" style={{ font: "var(--type-body)" }}>
          হ্যান্ডলুম স্টুডিওতে ৳২,৪৫০
        </p>
      </Section>
    </main>
  );
}
