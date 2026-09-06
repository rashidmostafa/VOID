# Contrast report — Void token set v1.1

Measured, not estimated: every ratio is computed from the exact `oklch()` string in `tokens/`
— OKLCH → linear sRGB → gamut-clipped sRGB → WCAG 2.1 relative luminance → ratio. Both
colour schemes, and the Option B accent palette, are evaluated.

Thresholds (SRS Appendix I, rules V2 / V3): text 4.5:1; meaningful non-text and focus
indicators 3:1; `color.text.disabled` exempt (UI-INV-1).

## Result: 0 failures across 92 pairings

## Light scheme

**Text**

| Pairing | Fg | Bg | Measured | Required | Result |
| --- | --- | --- | --- | --- | --- |
| text.primary on bg.canvas | `#0a0a0a` | `#ffffff` | **19.79:1** | 4.5:1 | PASS |
| text.secondary on bg.canvas | `#696969` | `#ffffff` | **5.51:1** | 4.5:1 | PASS |
| text.primary on bg.surface | `#0a0a0a` | `#ffffff` | **19.79:1** | 4.5:1 | PASS |
| text.secondary on bg.surface | `#696969` | `#ffffff` | **5.51:1** | 4.5:1 | PASS |
| text.primary on bg.sunken | `#0a0a0a` | `#f5f5f5` | **18.15:1** | 4.5:1 | PASS |
| text.secondary on bg.sunken | `#696969` | `#f5f5f5` | **5.05:1** | 4.5:1 | PASS |
| text.primary on bg.sidebar | `#0a0a0a` | `#fafafa` | **18.96:1** | 4.5:1 | PASS |
| text.secondary on bg.sidebar | `#696969` | `#fafafa` | **5.28:1** | 4.5:1 | PASS |
| text.link on bg.canvas | `#0a0a0a` | `#ffffff` | **19.79:1** | 4.5:1 | PASS |
| text.link.hover on bg.canvas | `#424242` | `#ffffff` | **10.01:1** | 4.5:1 | PASS |
| text.disabled on bg.canvas — exempt (UI-INV-1) | `#989898` | `#ffffff` | **2.88:1** | exempt | PASS |

**Action**

| Pairing | Fg | Bg | Measured | Required | Result |
| --- | --- | --- | --- | --- | --- |
| action.primary.text on .bg | `#fafafa` | `#171717` | **17.16:1** | 4.5:1 | PASS |
| action.primary.text on .hover | `#fafafa` | `#2e2e2e` | **13.06:1** | 4.5:1 | PASS |
| action.secondary.text on .bg | `#171717` | `#f5f5f5` | **16.42:1** | 4.5:1 | PASS |
| action.danger.text on .bg | `#fafafa` | `#bb0916` | **6.38:1** | 4.5:1 | PASS |

**Non-text**

| Pairing | Fg | Bg | Measured | Required | Result |
| --- | --- | --- | --- | --- | --- |
| focus.ring vs bg.canvas | `#7a7a7a` | `#ffffff` | **4.28:1** | 3:1 | PASS |
| focus.ring vs bg.surface | `#7a7a7a` | `#ffffff` | **4.28:1** | 3:1 | PASS |
| focus.ring vs bg.sunken | `#7a7a7a` | `#f5f5f5` | **3.93:1** | 3:1 | PASS |
| border.control vs bg.canvas | `#868686` | `#ffffff` | **3.64:1** | 3:1 | PASS |
| border.control vs bg.sunken | `#868686` | `#f5f5f5` | **3.34:1** | 3:1 | PASS |
| border.strong vs bg.canvas — decorative divider, exempt | `#d4d4d4` | `#ffffff` | **1.48:1** | exempt | PASS |

**Feedback**

| Pairing | Fg | Bg | Measured | Required | Result |
| --- | --- | --- | --- | --- | --- |
| feedback.success.text on bg.canvas | `#006c35` | `#ffffff` | **6.57:1** | 4.5:1 | PASS |
| feedback.success.text on feedback.success.bg | `#006c35` | `#e3f8e9` | **5.91:1** | 4.5:1 | PASS |
| feedback.success.on-solid on .solid | `#fafafa` | `#007840` | **5.36:1** | 4.5:1 | PASS |
| feedback.warning.text on bg.canvas | `#784500` | `#ffffff` | **7.94:1** | 4.5:1 | PASS |
| feedback.warning.text on feedback.warning.bg | `#784500` | `#fff3d4` | **7.17:1** | 4.5:1 | PASS |
| feedback.warning.on-solid on .solid | `#171717` | `#f5af20` | **9.41:1** | 4.5:1 | PASS |
| feedback.error.text on bg.canvas | `#bb0916` | `#ffffff` | **6.66:1** | 4.5:1 | PASS |
| feedback.error.text on feedback.error.bg | `#bb0916` | `#ffebe7` | **5.79:1** | 4.5:1 | PASS |
| feedback.error.on-solid on .solid | `#fafafa` | `#bb0916` | **6.38:1** | 4.5:1 | PASS |
| feedback.info.text on bg.canvas | `#005fad` | `#ffffff` | **6.49:1** | 4.5:1 | PASS |
| feedback.info.text on feedback.info.bg | `#005fad` | `#e3f4ff` | **5.76:1** | 4.5:1 | PASS |
| feedback.info.on-solid on .solid | `#fafafa` | `#005fad` | **6.21:1** | 4.5:1 | PASS |

**Commerce**

| Pairing | Fg | Bg | Measured | Required | Result |
| --- | --- | --- | --- | --- | --- |
| commerce.price on bg.canvas | `#0a0a0a` | `#ffffff` | **19.79:1** | 4.5:1 | PASS |
| commerce.price.original on bg.canvas | `#696969` | `#ffffff` | **5.51:1** | 4.5:1 | PASS |
| commerce.badge.new.text on .bg | `#fafafa` | `#171717` | **17.16:1** | 4.5:1 | PASS |
| commerce.badge.lowstock.text on .bg | `#784500` | `#fff3d4` | **7.17:1** | 4.5:1 | PASS |
| commerce.badge.soldout.text on .bg | `#696969` | `#f5f5f5` | **5.05:1** | 4.5:1 | PASS |
| commerce.rating vs rating.empty — non-text | `#0a0a0a` | `#d4d4d4` | **13.36:1** | 3:1 | PASS |
| commerce.trust on bg.canvas | `#006c35` | `#ffffff` | **6.57:1** | 4.5:1 | PASS |

**Accent (B)**

| Pairing | Fg | Bg | Measured | Required | Result |
| --- | --- | --- | --- | --- | --- |
| accent.text on bg.canvas | `#ba3100` | `#ffffff` | **5.94:1** | 4.5:1 | PASS |
| accent.text on bg.surface | `#ba3100` | `#ffffff` | **5.94:1** | 4.5:1 | PASS |
| accent.text on accent.bg tint | `#ba3100` | `#fff0df` | **5.30:1** | 4.5:1 | PASS |
| accent.on-fill on accent.fill | `#171717` | `#ed6100` | **5.39:1** | 4.5:1 | PASS |
| accent.fill vs bg.canvas — non-text boundary | `#ed6100` | `#ffffff` | **3.33:1** | 3:1 | PASS |
| commerce.badge.sale.text on .bg (accent) | `#171717` | `#ed6100` | **5.39:1** | 4.5:1 | PASS |

## Dark scheme

**Text**

| Pairing | Fg | Bg | Measured | Required | Result |
| --- | --- | --- | --- | --- | --- |
| text.primary on bg.canvas | `#fafafa` | `#0a0a0a` | **18.96:1** | 4.5:1 | PASS |
| text.secondary on bg.canvas | `#a4a4a4` | `#0a0a0a` | **7.98:1** | 4.5:1 | PASS |
| text.primary on bg.surface | `#fafafa` | `#171717` | **17.16:1** | 4.5:1 | PASS |
| text.secondary on bg.surface | `#a4a4a4` | `#171717` | **7.22:1** | 4.5:1 | PASS |
| text.primary on bg.sunken | `#fafafa` | `#262626` | **14.48:1** | 4.5:1 | PASS |
| text.secondary on bg.sunken | `#a4a4a4` | `#262626` | **6.09:1** | 4.5:1 | PASS |
| text.primary on bg.sidebar | `#fafafa` | `#171717` | **17.16:1** | 4.5:1 | PASS |
| text.secondary on bg.sidebar | `#a4a4a4` | `#171717` | **7.22:1** | 4.5:1 | PASS |
| text.link on bg.canvas | `#fafafa` | `#0a0a0a` | **18.96:1** | 4.5:1 | PASS |
| text.link.hover on bg.canvas | `#bebebe` | `#0a0a0a` | **10.59:1** | 4.5:1 | PASS |
| text.disabled on bg.canvas — exempt (UI-INV-1) | `#636363` | `#0a0a0a` | **3.30:1** | exempt | PASS |

**Action**

| Pairing | Fg | Bg | Measured | Required | Result |
| --- | --- | --- | --- | --- | --- |
| action.primary.text on .bg | `#171717` | `#e5e5e5` | **14.22:1** | 4.5:1 | PASS |
| action.primary.text on .hover | `#171717` | `#cacaca` | **10.96:1** | 4.5:1 | PASS |
| action.secondary.text on .bg | `#fafafa` | `#262626` | **14.48:1** | 4.5:1 | PASS |
| action.danger.text on .bg | `#0d0d0d` | `#ea3d38` | **4.82:1** | 4.5:1 | PASS |

**Non-text**

| Pairing | Fg | Bg | Measured | Required | Result |
| --- | --- | --- | --- | --- | --- |
| focus.ring vs bg.canvas | `#a4a4a4` | `#0a0a0a` | **7.98:1** | 3:1 | PASS |
| focus.ring vs bg.surface | `#a4a4a4` | `#171717` | **7.22:1** | 3:1 | PASS |
| focus.ring vs bg.sunken | `#a4a4a4` | `#262626` | **6.09:1** | 3:1 | PASS |
| border.control vs bg.canvas | `#717171` | `#0a0a0a` | **4.08:1** | 3:1 | PASS |
| border.control vs bg.sunken | `#717171` | `#262626` | **3.11:1** | 3:1 | PASS |
| border.strong vs bg.canvas — decorative divider, exempt | `#585858` | `#0a0a0a` | **2.78:1** | exempt | PASS |

**Feedback**

| Pairing | Fg | Bg | Measured | Required | Result |
| --- | --- | --- | --- | --- | --- |
| feedback.success.text on bg.canvas | `#63d99b` | `#0a0a0a` | **11.21:1** | 4.5:1 | PASS |
| feedback.success.text on feedback.success.bg | `#63d99b` | `#0e2b1b` | **8.66:1** | 4.5:1 | PASS |
| feedback.success.on-solid on .solid | `#070707` | `#37c080` | **8.65:1** | 4.5:1 | PASS |
| feedback.warning.text on bg.canvas | `#fbc456` | `#0a0a0a` | **12.39:1** | 4.5:1 | PASS |
| feedback.warning.text on feedback.warning.bg | `#fbc456` | `#352607` | **9.17:1** | 4.5:1 | PASS |
| feedback.warning.on-solid on .solid | `#171717` | `#fab72a` | **10.09:1** | 4.5:1 | PASS |
| feedback.error.text on bg.canvas | `#ff8179` | `#0a0a0a` | **8.16:1** | 4.5:1 | PASS |
| feedback.error.text on feedback.error.bg | `#ff8179` | `#3c1715` | **6.54:1** | 4.5:1 | PASS |
| feedback.error.on-solid on .solid | `#070707` | `#ea3d38` | **4.99:1** | 4.5:1 | PASS |
| feedback.info.text on bg.canvas | `#7fc5ff` | `#0a0a0a` | **10.69:1** | 4.5:1 | PASS |
| feedback.info.text on feedback.info.bg | `#7fc5ff` | `#0f253b` | **8.38:1** | 4.5:1 | PASS |
| feedback.info.on-solid on .solid | `#070707` | `#2389e2` | **5.53:1** | 4.5:1 | PASS |

**Commerce**

| Pairing | Fg | Bg | Measured | Required | Result |
| --- | --- | --- | --- | --- | --- |
| commerce.price on bg.canvas | `#fafafa` | `#0a0a0a` | **18.96:1** | 4.5:1 | PASS |
| commerce.price.original on bg.canvas | `#a4a4a4` | `#0a0a0a` | **7.98:1** | 4.5:1 | PASS |
| commerce.badge.new.text on .bg | `#171717` | `#e5e5e5` | **14.22:1** | 4.5:1 | PASS |
| commerce.badge.lowstock.text on .bg | `#fbc456` | `#352607` | **9.17:1** | 4.5:1 | PASS |
| commerce.badge.soldout.text on .bg | `#a4a4a4` | `#262626` | **6.09:1** | 4.5:1 | PASS |
| commerce.rating vs rating.empty — non-text | `#fafafa` | `#585858` | **6.83:1** | 3:1 | PASS |
| commerce.trust on bg.canvas | `#63d99b` | `#0a0a0a` | **11.21:1** | 4.5:1 | PASS |

**Accent (B)**

| Pairing | Fg | Bg | Measured | Required | Result |
| --- | --- | --- | --- | --- | --- |
| accent.text on bg.canvas | `#ff9845` | `#0a0a0a` | **9.28:1** | 4.5:1 | PASS |
| accent.text on bg.surface | `#ff9845` | `#171717` | **8.40:1** | 4.5:1 | PASS |
| accent.text on accent.bg tint | `#ff9845` | `#3d1c08` | **7.18:1** | 4.5:1 | PASS |
| accent.on-fill on accent.fill | `#0d0d0d` | `#ff8101` | **7.73:1** | 4.5:1 | PASS |
| accent.fill vs bg.canvas — non-text boundary | `#ff8101` | `#0a0a0a` | **7.89:1** | 3:1 | PASS |
| commerce.badge.sale.text on .bg (accent) | `#0d0d0d` | `#ff8101` | **7.73:1** | 4.5:1 | PASS |

## Two classification calls you should sanity-check

1. **Decorative borders are exempt, control borders are not.** A divider or a tint edge on a
   status chip is not a "meaningful non-text pairing": the meaning is carried by the tint and
   the label, and removing the edge loses no information. So `--border-strong`,
   `--success-border` and friends sit below 3:1 by design. Where a border *is* the only thing
   defining an interactive control — a text input, an unfilled checkbox, an outline button —
   it must clear 3:1, which is why `--border-control` exists as a separate token at
   3.64:1 on the canvas and 3.34:1 on a sunken field. If your auditor treats every border as
   meaningful, promote `--border-default` to `--border-control` globally and the forms get
   visibly heavier; say the word.
2. **The accent fill is a control boundary.** At the brightness that reads as signal orange it
   was 2.64:1 against white, so the fill was darkened to `oklch(0.66 0.20 50)` —
   3.33:1 against the page, still carrying near-black type at 5.39:1.

## What changed from v1.0, and why

| Token | v1.0 | v1.1 | Reason |
| --- | --- | --- | --- |
| `--ring` → `--focus-ring-color` | `oklch(0.708 0 0)` · 2.59:1 | `oklch(0.58 0 0)` · 4.28:1 canvas, 3.93:1 field | Failed the 3:1 non-text threshold (V3) against both canvas and card. |
| `--muted-foreground` → `--fg-secondary` | `oklch(0.556 0 0)` · 4.34:1 on sunken | `oklch(0.52 0 0)` · 5.05:1 sunken, 5.51:1 canvas | Secondary text must pass 4.5:1 on canvas *and* surface. |
| `--input` → `--border-control` | `oklch(0.922 0 0)` · 1.48:1 | `oklch(0.62 0 0)` · 3.64:1 | Genuine failure you did not flag: an input's only boundary was a 1.48:1 hairline. |
| `--success` | `oklch(0.6 0.118 184.7)`, borrowed from `--chart-2` · 3.66:1 | four roles: `-text` 6.57:1, `-solid` carrying white at 5.36:1, `-bg`, `-border` | Chart hues are tuned for adjacent fills, not for type. Status tones are now derived per scheme. |
| `--success-foreground` | 3.50:1 on the fill | `oklch(0.985 0 0)` · 5.36:1 | Fill darkened until white type clears 4.5:1. |
| `--warning` | `oklch(0.828 0.189 84.4)`, borrowed from `--chart-4` · 1.72:1 | `-text` 7.94:1 for type; `-solid` carries dark type at 9.41:1 | Amber cannot pass 4.5:1 as type on white at any usable chroma. The role is split by lightness: dark amber for type, bright amber as a fill that only ever carries dark type. |
| `--info-*` | absent | added, four roles, both schemes | Required by Appendix I §I.2.3. |
| commerce group | absent | 13 tokens: price, price.sale, price.original, four badge pairs, rating, rating.empty, trust | Appendix I §I.2.4. |
| `--text-base` | `0.875rem` (14px) and `body` resolved to it | `1rem` (16px), fluid above; `--text-ui` (14px) added for dense portal work | V4 / UI-INV-4. |
| `--control-h-sm` / `-md` | 32 / 38px | 36 / 44 / 52px, `--touch-target-min: 44px` | V5 / UI-GLOB-7. See the dense-surface allowlist in readme.md. |
| z-index, breakpoints | absent | `--z-dropdown` 1000 → `--z-toast` 1400, strictly ordered; `--breakpoint-xs…xl` | V10 and §9.4. |
| `--fg-disabled`, `--fg-link`, `--fg-link-hover` | absent | added, both schemes | Appendix I §I.2.1. |
| fonts | Google Fonts `@import` | five self-hosted `@font-face` rules, subset, `font-display: swap` | V8 / UI-INV-13. Binaries still needed — see assets/fonts/README.md. |
| icons | Lucide via unpkg | local sprite via `<use>` | V8 / UI-INV-13. Sprite still needed — see assets/icons/README.md. |

## Provenance

OKLab conversion per CSS Color 4; contrast per WCAG 2.1 §1.4.3. Chart tokens
(`--chart-1`…`--chart-5`) are excluded: they are adjacent-fill data colours, never type or
chrome. Where a chart series carries meaning by colour alone it must also pass 3:1 against its
neighbours — that check belongs to the charting work, which does not exist yet.
