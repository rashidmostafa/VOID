import { Button } from "@void/ui/core/Button";
import { Icon } from "@void/ui/core/Icon";
import { AsyncSurface, type AsyncState } from "@void/ui/state/AsyncSurface";
import { Skeleton, SkeletonMedia, SkeletonText } from "@void/ui/state/Skeleton";
import { IconButton } from "@void/ui/core/IconButton";
import { Card, CardHeader } from "@void/ui/core/Card";
import { Badge } from "@void/ui/core/Badge";
import { Tag } from "@void/ui/core/Tag";
import { Input } from "@void/ui/forms/Input";
import { Select } from "@void/ui/forms/Select";
import { Checkbox } from "@void/ui/forms/Checkbox";
import { Radio } from "@void/ui/forms/Radio";
import { Switch } from "@void/ui/forms/Switch";
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
