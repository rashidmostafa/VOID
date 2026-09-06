# Fonts — self-hosted

`tokens/fonts.css` declares five faces and points at this directory. All five binaries are
present and served from this origin; no third-party font origin appears anywhere in the token
closure (rule V8).

## Files, exactly these names

| Path | Family | Weight | Subset |
| --- | --- | --- | --- |
| `geist-400-latin.woff2` | Void Sans | 400 | Latin + Latin-1 |
| `geist-500-latin.woff2` | Void Sans | 500 | Latin + Latin-1 |
| `geist-mono-400-latin.woff2` | Void Mono | 400 | Latin |
| `anek-bangla-400-bengali.woff2` | Void Bengali | 400 | Bengali block |
| `anek-bangla-500-bengali.woff2` | Void Bengali | 500 | Bengali block |

Weights 300, 600 and 700 are deliberately not shipped. Nothing in the system references them.

## Subsetting

`fonttools` (`pip install fonttools brotli`), from the full-weight source files:

```
pyftsubset Geist-Regular.ttf --output-file=geist-400-latin.woff2 --flavor=woff2 \
  --layout-features='*' --unicodes="U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD"

pyftsubset AnekBangla-Regular.ttf --output-file=anek-bangla-400-bengali.woff2 --flavor=woff2 \
  --layout-features='*' --unicodes="U+0964-0965,U+0980-09FF,U+200C-200D,U+20B9,U+25CC,U+A8F1"
```

`--layout-features='*'` is not optional for Bengali: dropping GSUB/GPOS breaks conjunct
formation and matra positioning, which fails validation rule V6.

## Licences

Geist is OFL-1.1 (Vercel). Anek Bangla is OFL-1.1 (Ek Type). Both permit self-hosting and
commercial use. Record the licence files under `docs/licences/` per UI-SRC-3 — the SRS
requires the licence reference to resolve before a token set can be activated (rule V11).

## Verification after the files land

1. Bengali conjunct test string renders with no fallback substitution at every scale step
   (rule V6): `ক্ষ্ম ন্ত্র জ্ঞ ক্ট্র শ্রী দ্ধ` plus matras `কি কী কু কূ কৃ কে কৈ কো কৌ`.
2. Total critical-path font payload within the performance budget (rule V7).
3. No remote URL anywhere in the token closure (rule V8) — `grep -r "https\?://" tokens/`
   should return nothing but comments.
