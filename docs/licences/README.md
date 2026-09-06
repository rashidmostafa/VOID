# Licence record

Referenced by `tokens.json` → `meta.licenceRef`. Appendix I rule **V11** rejects a non-placeholder
token set whose licence reference does not resolve, so this file is part of the activation gate,
not documentation.

Every asset the themed build loads is listed. If an asset is not here, it does not ship.

## Shipped assets

| Asset | Licence | File | Permits self-hosting | Permits commercial use | Attribution required in product |
| --- | --- | --- | --- | --- | --- |
| Geist 400, 500 (`Void Sans`) | SIL OFL 1.1 — Vercel, Inc. | **missing — see below** | Yes | Yes | No |
| Geist Mono 400 (`Void Mono`) | SIL OFL 1.1 — Vercel, Inc. | **missing — see below** | Yes | Yes | No |
| Anek Bangla 400, 500 (`Void Bengali`) | SIL OFL 1.1 — Ek Type | `OFL-1.1-AnekBangla.txt` | Yes | Yes | No |
| Lucide icon subset (44 symbols) | ISC — Lucide Contributors | `ISC-lucide.txt` | Yes | Yes | No, but the notice must travel with any redistributed copy of the sprite |

**Redistribution.** OFL-1.1 permits bundling and serving the fonts. Both families are subset
(`pyftsubset`, commands in `assets/fonts/README.md`); OFL treats a subset as a Modified Version, so
the reserved font names matter: the CSS families are **`Void Sans`, `Void Mono` and `Void
Bengali`**, not `Geist` or `Anek Bangla`. That is a licence requirement satisfied by the naming
already in `tokens/fonts.css`, and it is why the token names look the way they do. Do not rename
them back.

## Outstanding — Geist OFL text

The Geist licence file is **not in this project** and must be dropped in before release. Outbound
fetches are blocked from the environment this system was authored in, and a licence file is not
something to reconstruct from memory: the copyright line is the operative part and asserting one I
have not read would be worse than a missing file.

Drop both of these in, unmodified, from the upstream repository (`vercel/geist-font`, the
`OFL.txt` at its root):

```
docs/licences/OFL-1.1-Geist.txt
```

One file covers all three Geist faces. Then delete this section and fill in the table above.

Until it lands, V11 is **not satisfied for the Geist faces**. The licence position is not in doubt
— Geist is OFL-1.1 and permits exactly what this build does — but the record does not resolve, and
the SRS gates on the record.

## Not shipped, licence noted for the file

| Asset | Licence | Why it is here |
| --- | --- | --- |
| AdminCN free admin template | MIT | Supplied 2026-09-05 as the back office's *layout vocabulary*. No file from it is copied into the project or redistributed; every colour, size and radius in the built admin resolves through a Void token. Lives in `uploads/` as supplied material. See ADR-0007. |
| Two reference screenshots | Product Owner's own material | Supplied as references for the feel. Not reproduced; see ADR-0007, "Trade dress". |
| Source theme block (Tailwind/shadcn `@theme` CSS) | Supplied by the Product Owner as their own | The primitive tier traces to it. No third-party licence attaches to a set of CSS custom property values supplied by the client. |

## Third-party origins

None. No font, icon, stylesheet or script in `tokens/`, `components/` or `templates/` loads from a
third-party origin (UI-INV-13, NFR-SEC-20, rule V8).

One exception exists **outside** the shipped closure and must not be inherited: the `@dsCard`
specimen previews and the `templates/*/…dc.html` harness files load React and Babel from a pinned
CDN, because that is how this environment renders JSX previews. The product build takes the tokens,
the components and the layouts — not the harness's script tags.
