/* Authentication — FR-AUTH-1..19.

   One centred column on a plain ground, no storefront chrome: every screen here is a
   dead end until it resolves, and navigation away from it is a decision, not a browse.

   Two requirements shape the copy more than the layout, and are worth naming:
   - FR-AUTH-4/5 forbid composition rules. The only hard rule is 10 characters, and a
     rejection must say WHY — so the strength meter reports the real reason (breach list,
     length) rather than scolding the user about symbols they are not required to use.
   - AUTH_INVALID_CREDENTIALS must never reveal whether an account exists, so the failed
     sign-in and the reset-sent screens are both deliberately non-committal. */

const DS = () => window.VoidDesignSystem_980885 || {};

const Badge = React.forwardRef((p, ref) => React.createElement(DS().Badge, { ...p, ref }));
const Button = React.forwardRef((p, ref) => React.createElement(DS().Button, { ...p, ref }));
const Checkbox = React.forwardRef((p, ref) => React.createElement(DS().Checkbox, { ...p, ref }));
const Icon = React.forwardRef((p, ref) => React.createElement(DS().Icon, { ...p, ref }));
const IconButton = React.forwardRef((p, ref) => React.createElement(DS().IconButton, { ...p, ref }));
const Input = React.forwardRef((p, ref) => React.createElement(DS().Input, { ...p, ref }));

function useDesignSystemReady() {
  const [ready, setReady] = React.useState(() => !!window.VoidDesignSystem_980885);
  React.useEffect(() => {
    if (ready) return;
    let live = true;
    const id = setInterval(() => { if (window.VoidDesignSystem_980885) { clearInterval(id); if (live) setReady(true); } }, 24);
    return () => { live = false; clearInterval(id); };
  }, [ready]);
  return ready;
}

const eyebrow = { font: "var(--type-label)", textTransform: "uppercase", letterSpacing: "var(--tracking-widest)", color: "var(--fg-secondary)" };
const monoMeta = { fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)", color: "var(--fg-secondary)" };
const hint = { font: "var(--type-ui-sm)", color: "var(--fg-secondary)", textWrap: "pretty" };

function Wordmark() {
  return <span style={{ fontFamily: "var(--font-heading)", fontWeight: "var(--weight-medium)", fontSize: "var(--text-lg)", letterSpacing: "var(--tracking-widest)", textTransform: "uppercase" }}>Void</span>;
}

function Shell({ children, aside, narrow }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-8)", padding: narrow ? "var(--space-6) var(--space-4)" : "var(--space-16) var(--space-6)", background: "var(--bg-canvas)", color: "var(--fg-primary)", font: "var(--type-ui-dense)" }}>
      <Wordmark />
      <main style={{ width: "min(420px, 100%)", display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>{children}</main>
      {aside ? <div style={{ width: "min(420px, 100%)", ...hint, textAlign: "center" }}>{aside}</div> : null}
    </div>
  );
}

function Head({ title, body }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
      <h1 style={{ font: "var(--type-h2)", margin: 0, textWrap: "balance" }}>{title}</h1>
      {body ? <p style={{ ...hint, margin: 0 }}>{body}</p> : null}
    </div>
  );
}

function Field({ label, children, note, error }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
      <span style={{ font: "var(--type-ui-sm)", fontWeight: "var(--weight-medium)" }}>{label}</span>
      {children}
      {error ? (
        <span style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-2)", font: "var(--type-ui-sm)", color: "var(--error-text)" }}>
          <Icon name="circle-alert" size={13} style={{ marginBlockStart: 2, flex: "none" }} />{error}
        </span>
      ) : note ? <span style={hint}>{note}</span> : null}
    </label>
  );
}

/* FR-AUTH-2. Third-party buttons carry no vendor artwork here — the marks are supplied by
   the provider's own brand kit at build time, and drawing an approximation would be wrong
   both legally and visually. The slot is sized for the real asset. */
function Federated() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
      {[["Google", "google"], ["Facebook", "facebook"]].map(([name, slug]) => (
        <Button key={slug} variant="outline" block size="lg"
          iconLeft={<span aria-hidden="true" style={{ display: "inline-block", width: 18, height: 18, borderRadius: "var(--radius-xs, 2px)", background: "var(--bg-surface-sunken)", border: "var(--border-width-thin) solid var(--border-default)" }} />}>
          Continue with {name}
        </Button>
      ))}
    </div>
  );
}

function Divider({ label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
      <span aria-hidden="true" style={{ flex: 1, height: 1, background: "var(--border-default)" }} />
      <span style={eyebrow}>{label}</span>
      <span aria-hidden="true" style={{ flex: 1, height: 1, background: "var(--border-default)" }} />
    </div>
  );
}

/* FR-AUTH-5. The meter reports length and breach status, because those are the only two
   things that can actually reject a password. */
function Strength({ value }) {
  const len = value.length;
  const breached = value.toLowerCase() === "password12" || value.toLowerCase() === "bangladesh1";
  const level = breached ? 0 : len === 0 ? 0 : len < 10 ? 1 : len < 14 ? 2 : 3;
  const label = breached ? "Found in a breach list — pick another"
    : len === 0 ? "At least 10 characters"
    : len < 10 ? (10 - len) + " more character" + (10 - len === 1 ? "" : "s")
    : len < 14 ? "Long enough" : "Strong";
  const tone = breached || (len > 0 && len < 10) ? "var(--error-text)" : len >= 14 ? "var(--success-text, var(--fg-primary))" : "var(--fg-primary)";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
      <div style={{ display: "flex", gap: 3 }} role="presentation">
        {[1, 2, 3].map((i) => (
          <span key={i} style={{ flex: 1, height: 3, background: level >= i ? tone : "var(--border-default)" }} />
        ))}
      </div>
      <span aria-live="polite" style={{ font: "var(--type-ui-sm)", color: breached || (len > 0 && len < 10) ? "var(--error-text)" : "var(--fg-secondary)" }}>{label}</span>
    </div>
  );
}

function PasswordInput({ value, onChange, autoComplete, placeholder }) {
  const [show, setShow] = React.useState(false);
  return (
    <span style={{ display: "flex", gap: "var(--space-2)" }}>
      <Input type={show ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)} autoComplete={autoComplete} placeholder={placeholder} style={{ flex: 1 }} />
      <IconButton variant="outline" icon={<Icon name={show ? "eye-off" : "eye"} size={16} />} label={show ? "Hide password" : "Show password"} onClick={() => setShow((s) => !s)} />
    </span>
  );
}

/* ---------- screens ---------- */

function SignIn({ narrow, failed }) {
  return (
    <Shell narrow={narrow} aside={<>New to Void? <a href="#">Create an account</a></>}>
      <Head title="Sign in" body="Orders, saved designs and addresses, in one place." />
      {/* AUTH_INVALID_CREDENTIALS: identical wording whether or not the account exists. */}
      {failed ? (
        <div role="alert" style={{ display: "flex", gap: "var(--space-3)", padding: "var(--space-4)", background: "var(--error-bg, var(--bg-surface-sunken))", border: "var(--border-width-thin) solid var(--error-border, var(--border-default))", borderRadius: "var(--radius-md)" }}>
          <Icon name="circle-alert" size={15} color="var(--error-text)" style={{ marginBlockStart: 2, flex: "none" }} />
          <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ font: "var(--type-ui-dense)", fontWeight: "var(--weight-medium)", color: "var(--error-text)" }}>That email and password do not match</span>
            <span style={hint}>Two attempts left before the account locks for 15 minutes.</span>
          </span>
        </div>
      ) : null}
      <Federated />
      <Divider label="or" />
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        <Field label="Email"><Input type="email" autoComplete="email" placeholder="you@example.com" /></Field>
        <Field label="Password"><PasswordInput value="" onChange={() => {}} autoComplete="current-password" /></Field>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-3)", flexWrap: "wrap" }}>
          <Checkbox label="Keep me signed in" />
          <a href="#" style={{ font: "var(--type-ui-sm)" }}>Forgot password?</a>
        </div>
        <Button size="lg" block style={{ background: "var(--action-accent-bg)", color: "var(--action-accent-text)", borderColor: "var(--action-accent-bg)" }}>Sign in</Button>
        {/* FR-AUTH-18 */}
        <Button size="lg" block variant="ghost" iconLeft={<Icon name="mail" size={16} />}>Email me a sign-in link instead</Button>
      </div>
    </Shell>
  );
}

function SignUp({ narrow }) {
  const [pw, setPw] = React.useState("");
  return (
    <Shell narrow={narrow} aside={<>Already have an account? <a href="#">Sign in</a></>}>
      <Head title="Create an account" body="You can also check out as a guest and create the account afterwards." />
      <Federated />
      <Divider label="or" />
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        <Field label="Email" note="We send one verification link here. Saved designs and stored payment methods stay locked until you use it.">
          <Input type="email" autoComplete="email" placeholder="you@example.com" />
        </Field>
        <Field label="Password">
          <PasswordInput value={pw} onChange={setPw} autoComplete="new-password" />
        </Field>
        <Strength value={pw} />
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", paddingBlockStart: "var(--space-1)" }}>
          {/* FR-AUTH-8b: affirmative acceptance, with the version recorded. */}
          <Checkbox label="I accept the Terms of Service and Privacy Policy" description="Version 2026-04 · recorded with the time and your IP address" />
          {/* FR-AUTH-8c */}
          <Checkbox label="I am 18 or older" />
        </div>
        <Button size="lg" block style={{ background: "var(--action-accent-bg)", color: "var(--action-accent-text)", borderColor: "var(--action-accent-bg)" }}>Create account</Button>
      </div>
    </Shell>
  );
}

/* FR-AUTH-6 / FR-AUTH-9. Validity, attempts and resend budget are all stated, because a
   silent OTP that has quietly expired is the single most common dead end in this flow. */
function CodeBoxes({ n = 6, filled = 3 }) {
  return (
    <div style={{ display: "flex", gap: "var(--space-2)" }} role="group" aria-label="Verification code">
      {Array.from({ length: n }).map((_, i) => (
        <span key={i} style={{ flex: 1, display: "grid", placeItems: "center", aspectRatio: "3 / 4", maxHeight: 56, background: "var(--bg-surface)", border: "var(--border-width-thin) solid " + (i === filled ? "var(--indicator-active)" : "var(--border-control)"), borderRadius: "var(--radius-sm)", fontFamily: "var(--font-mono)", fontSize: "var(--text-xl)" }}>
          {i < filled ? "•" : ""}
        </span>
      ))}
    </div>
  );
}

function Otp({ narrow, mode = "sms" }) {
  const sms = mode === "sms";
  return (
    <Shell narrow={narrow} aside={<a href="#">Use a different {sms ? "number" : "method"}</a>}>
      <Head title={sms ? "Enter the code we sent" : "Enter your authenticator code"}
        body={sms ? "Six digits, sent to +880 17•• ••4417. It expires five minutes after it was sent." : "Six digits from your authenticator app. The code rotates every 30 seconds."} />
      <CodeBoxes />
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", ...hint }}>
          <Icon name="clock" size={13} /><span>Expires in 3:42 · 4 attempts left</span>
        </div>
        <Button size="lg" block style={{ background: "var(--action-accent-bg)", color: "var(--action-accent-text)", borderColor: "var(--action-accent-bg)" }}>Verify</Button>
        {sms ? <Button size="lg" block variant="ghost" disabled>Resend code in 0:48 · 3 of 5 used this hour</Button> : null}
      </div>
      {/* FR-AUTH-17 */}
      <div style={{ display: "flex", gap: "var(--space-3)", padding: "var(--space-4)", background: "var(--bg-surface-sunken)", borderRadius: "var(--radius-md)" }}>
        <Icon name="circle-help" size={15} color="var(--fg-secondary)" style={{ marginBlockStart: 2, flex: "none" }} />
        <span style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          <span style={hint}>Lost your phone? Use one of your ten single-use recovery codes.</span>
          <a href="#" style={{ font: "var(--type-ui-sm)" }}>Enter a recovery code</a>
        </span>
      </div>
    </Shell>
  );
}

function Reset({ narrow, sent }) {
  if (sent) {
    return (
      <Shell narrow={narrow} aside={<a href="#">Back to sign in</a>}>
        <Head title="Check your email"
          body="If an account exists for that address, a sign-in link is on its way. The link works once and expires in 30 minutes; asking again cancels the previous one." />
        <div style={{ display: "flex", gap: "var(--space-3)", padding: "var(--space-4)", background: "var(--bg-surface-sunken)", borderRadius: "var(--radius-md)" }}>
          <Icon name="mail" size={15} color="var(--fg-secondary)" style={{ marginBlockStart: 2, flex: "none" }} />
          <span style={hint}>We do not say whether the address is registered. That is deliberate — it stops anyone using this page to discover who has an account.</span>
        </div>
        <Button size="lg" block variant="outline">Resend the link</Button>
      </Shell>
    );
  }
  return (
    <Shell narrow={narrow} aside={<a href="#">Back to sign in</a>}>
      <Head title="Reset your password" body="Enter the email on the account and we will send a single-use link." />
      <Field label="Email"><Input type="email" autoComplete="email" placeholder="you@example.com" /></Field>
      <Button size="lg" block style={{ background: "var(--action-accent-bg)", color: "var(--action-accent-text)", borderColor: "var(--action-accent-bg)" }}>Send the link</Button>
    </Shell>
  );
}

/* FR-AUTH-10. The lock is temporary and self-lifting, so the screen says when — an
   unqualified "locked" reads as permanent and drives support tickets. */
function Locked({ narrow }) {
  return (
    <Shell narrow={narrow} aside={<a href="#">Contact support</a>}>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", padding: "var(--space-6)", background: "var(--bg-surface)", border: "var(--border-width-thin) solid var(--error-border, var(--border-default))", borderRadius: "var(--radius-lg)" }}>
        <span style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", ...eyebrow, color: "var(--error-text)" }}>
          <Icon name="lock" size={14} />Locked for 15 minutes
        </span>
        <h1 style={{ font: "var(--type-h2)", margin: 0, textWrap: "balance" }}>Too many failed attempts</h1>
        <p style={{ ...hint, margin: 0 }}>
          Five sign-ins failed in a row, so the account is locked until 14:38. We have emailed the address on the account. If that was not you, reset the password — the lock lifts as soon as a reset succeeds.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          <Button size="lg" block>Reset my password</Button>
          <Button size="lg" block variant="ghost">Try again at 14:38</Button>
        </div>
      </div>
    </Shell>
  );
}

/* FR-AUTH-19. Order ID plus the contact used at purchase, then a one-time code to that
   same contact — so knowing an order number alone is not enough. */
function GuestLookup({ narrow }) {
  return (
    <Shell narrow={narrow} aside={<>Have an account? <a href="#">Sign in instead</a></>}>
      <Head title="Track an order" body="No account needed. Use the order number from your confirmation email, and the email or phone you gave at checkout." />
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        <Field label="Order number" note="Six digits after VD-, as printed on your confirmation.">
          <Input placeholder="VD-24817" style={{ fontFamily: "var(--font-mono)" }} />
        </Field>
        <Field label="Email or phone used at checkout"><Input placeholder="you@example.com or +880…" /></Field>
        <Button size="lg" block style={{ background: "var(--action-accent-bg)", color: "var(--action-accent-text)", borderColor: "var(--action-accent-bg)" }}>Send me a code</Button>
        <span style={hint}>We send a one-time code to that contact before showing the order. Five lookups per hour.</span>
      </div>
    </Shell>
  );
}

/* FR-AUTH-14. Device, approximate location, IP and last seen, with per-session and
   bulk termination. The current session is marked and cannot be ended from here. */
const SESSIONS = [
  { device: "Chrome on macOS", where: "Dhaka, Bangladesh", ip: "103.108.•.•", seen: "Now", current: true },
  { device: "Void app on Android 15", where: "Dhaka, Bangladesh", ip: "103.108.•.•", seen: "2 hours ago" },
  { device: "Safari on iPhone", where: "Chattogram, Bangladesh", ip: "45.125.•.•", seen: "Yesterday, 21:14" },
  { device: "Firefox on Windows", where: "Manchester, United Kingdom", ip: "81.132.•.•", seen: "24 Aug, 08:02", flag: true },
];

function Sessions({ narrow }) {
  return (
    <Shell narrow={narrow}>
      <Head title="Where you are signed in" body="Ending a session signs that device out immediately. Changing your password ends all of them except this one." />
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
        {SESSIONS.map((s) => (
          <div key={s.device + s.ip} style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-4)", padding: "var(--space-4)", background: "var(--bg-surface)", border: "var(--border-width-thin) solid " + (s.flag ? "var(--warning-border, var(--border-default))" : "var(--border-default)"), borderRadius: "var(--radius-md)" }}>
            <Icon name={s.device.includes("Android") || s.device.includes("iPhone") ? "phone" : "grid-2x2"} size={16} color="var(--fg-secondary)" style={{ marginBlockStart: 2, flex: "none" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1, minWidth: 0 }}>
              <span style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", flexWrap: "wrap" }}>
                <span style={{ font: "var(--type-ui-dense)", fontWeight: "var(--weight-medium)" }}>{s.device}</span>
                {s.current ? <Badge tone="success" size="sm">This device</Badge> : null}
                {s.flag ? <Badge tone="warning" size="sm">New location</Badge> : null}
              </span>
              <span style={hint}>{s.where} · {s.seen}</span>
              <span style={monoMeta}>{s.ip}</span>
            </div>
            {s.current ? null : <Button variant="outline" size="sm">End</Button>}
          </div>
        ))}
      </div>
      <Button size="lg" block variant="destructive" iconLeft={<Icon name="log-out" size={16} />}>End all other sessions</Button>
    </Shell>
  );
}

/* ---------- harness ---------- */

const SCREENS = {
  signin: ["Sign in", (p) => <SignIn {...p} />],
  signin_failed: ["Sign in — failed", (p) => <SignIn {...p} failed />],
  signup: ["Create account", (p) => <SignUp {...p} />],
  otp: ["SMS code", (p) => <Otp {...p} mode="sms" />],
  totp: ["Authenticator", (p) => <Otp {...p} mode="totp" />],
  reset: ["Reset password", (p) => <Reset {...p} />],
  reset_sent: ["Reset — sent", (p) => <Reset {...p} sent />],
  locked: ["Locked out", (p) => <Locked {...p} />],
  guest: ["Guest order lookup", (p) => <GuestLookup {...p} />],
  sessions: ["Active sessions", (p) => <Sessions {...p} />],
};

function Group({ legend, value, options, onChange }) {
  return (
    <fieldset><legend>{legend}</legend>
      {options.map(([v, l]) => <button key={v} type="button" aria-pressed={value === v} onClick={() => onChange(v)}>{l}</button>)}
    </fieldset>
  );
}

function AuthApp({ screen = "signin", scheme = "light", width = "1440", chrome = true }) {
  const dsReady = useDesignSystemReady();
  const [s, setS] = React.useState({ screen, scheme, width });
  React.useEffect(() => { setS({ screen, scheme, width }); }, [screen, scheme, width]);
  const set = (k) => (v) => setS((p) => ({ ...p, [k]: v }));

  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", s.scheme === "dark");
  }, [s.scheme]);

  if (!dsReady) return <div style={{ minHeight: "100vh" }} />;
  const [, Screen] = SCREENS[s.screen] || SCREENS.signin;
  const narrow = s.width === "320";

  return (
    <>
      {chrome ? (
        <div className="vd-bar">
          <Wordmark />
          <Group legend="Screen" value={s.screen} onChange={set("screen")} options={Object.entries(SCREENS).map(([k, v]) => [k, v[0]])} />
          <Group legend="Scheme" value={s.scheme} onChange={set("scheme")} options={[["light", "Light"], ["dark", "Dark"]]} />
          <Group legend="Width" value={s.width} onChange={set("width")} options={[["1440", "1440"], ["320", "320"]]} />
        </div>
      ) : null}
      <div className="vd-frame" data-w={s.width}>{Screen({ narrow })}</div>
    </>
  );
}

Object.assign(window, { AuthApp });
