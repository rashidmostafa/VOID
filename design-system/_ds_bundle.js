/* @ds-bundle: {"format":4,"namespace":"VoidDesignSystem_980885","components":[{"name":"ProductCard","sourcePath":"components/commerce/ProductCard.jsx"},{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"CardHeader","sourcePath":"components/core/Card.jsx"},{"name":"Icon","sourcePath":"components/core/Icon.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"Tag","sourcePath":"components/core/Tag.jsx"},{"name":"DataTable","sourcePath":"components/data/DataTable.jsx"},{"name":"Dialog","sourcePath":"components/feedback/Dialog.jsx"},{"name":"Toast","sourcePath":"components/feedback/Toast.jsx"},{"name":"Tooltip","sourcePath":"components/feedback/Tooltip.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Radio","sourcePath":"components/forms/Radio.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"Switch","sourcePath":"components/forms/Switch.jsx"},{"name":"SideNav","sourcePath":"components/navigation/SideNav.jsx"},{"name":"Tabs","sourcePath":"components/navigation/Tabs.jsx"}],"sourceHashes":{"components/commerce/ProductCard.jsx":"8c83184ae79b","components/core/Badge.jsx":"e8758beb9e78","components/core/Button.jsx":"bf143cafde25","components/core/Card.jsx":"e0d95ddd6b69","components/core/Icon.jsx":"e0d337260a07","components/core/IconButton.jsx":"f05a570423c7","components/core/Tag.jsx":"cdf43234df71","components/data/DataTable.jsx":"8856654705ff","components/feedback/Dialog.jsx":"7959c4498a3a","components/feedback/Toast.jsx":"402d7954b669","components/feedback/Tooltip.jsx":"38bf4674e0dd","components/forms/Checkbox.jsx":"20a4690d6ede","components/forms/Input.jsx":"d6baa2cad271","components/forms/Radio.jsx":"ec6655a683a5","components/forms/Select.jsx":"afd6082e285b","components/forms/Switch.jsx":"dd6970165fb8","components/navigation/SideNav.jsx":"c5da006d3af5","components/navigation/Tabs.jsx":"80a04e075ed7"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.VoidDesignSystem_980885 = window.VoidDesignSystem_980885 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/commerce/ProductCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Product tile for the storefront and marketplace grids.
   `image` takes a real photograph URL; with none, a flat --bg-surface-sunken
   plate stands in (never a drawn illustration). Every colour resolves through a
   commerce token, so the tile is correct under both palettes and both schemes. */

const BADGE = {
  new: {
    background: "var(--commerce-badge-new-bg)",
    color: "var(--commerce-badge-new-text)",
    borderColor: "transparent"
  },
  sale: {
    background: "var(--commerce-badge-sale-bg)",
    color: "var(--commerce-badge-sale-text)",
    borderColor: "var(--commerce-badge-sale-border)"
  },
  lowstock: {
    background: "var(--commerce-badge-lowstock-bg)",
    color: "var(--commerce-badge-lowstock-text)",
    borderColor: "var(--commerce-badge-lowstock-border)"
  },
  soldout: {
    background: "var(--commerce-badge-soldout-bg)",
    color: "var(--commerce-badge-soldout-text)",
    borderColor: "var(--commerce-badge-soldout-border)"
  }
};
function ProductCard({
  title,
  designer,
  price,
  compareAt,
  currency = "BDT",
  locale = "en",
  image,
  ratio = "3 / 4",
  badge,
  badgeTone = "new",
  sizes = [],
  rating,
  reviewCount,
  sku,
  onClick,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const loc = locale === "bn" ? "bn-BD" : "en-US";
  const fmt = n => currency === "BDT" ? "৳" + Number(n).toLocaleString(loc) : new Intl.NumberFormat(loc, {
    style: "currency",
    currency
  }).format(n);
  const onSale = compareAt != null;
  return /*#__PURE__*/React.createElement("article", _extends({
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-3)",
      cursor: onClick ? "pointer" : "default",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      aspectRatio: ratio,
      background: "var(--bg-surface-sunken)",
      borderRadius: "var(--radius-media)",
      overflow: "hidden"
    }
  }, image ? /*#__PURE__*/React.createElement("img", {
    src: image,
    alt: title,
    style: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      transform: hover ? "scale(1.03)" : "none",
      transition: "transform var(--duration-editorial) var(--motion-easing-standard)"
    }
  }) : null, badge ? /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      insetBlockStart: "var(--space-3)",
      insetInlineStart: "var(--space-3)",
      display: "inline-flex",
      alignItems: "center",
      height: 22,
      paddingInline: "var(--space-2)",
      borderStyle: "solid",
      borderWidth: "var(--border-width-thin)",
      fontSize: "var(--text-2xs)",
      fontWeight: "var(--weight-medium)",
      textTransform: "uppercase",
      letterSpacing: "var(--tracking-wide)",
      ...BADGE[badgeTone]
    }
  }, badge) : null, sizes.length && hover ? /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: "auto 0 0 0",
      display: "flex",
      gap: "var(--space-2)",
      justifyContent: "center",
      padding: "var(--space-3)",
      background: "linear-gradient(to top, var(--bg-canvas) 20%, transparent)"
    }
  }, sizes.map(s => /*#__PURE__*/React.createElement("span", {
    key: s,
    style: {
      minWidth: 28,
      textAlign: "center",
      fontSize: "var(--text-2xs)",
      fontWeight: "var(--weight-medium)",
      letterSpacing: "var(--tracking-wide)",
      padding: "4px var(--space-2)",
      background: "var(--bg-surface)",
      border: "var(--border-width-thin) solid var(--border-control)"
    }
  }, s))) : null), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-1)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      gap: "var(--space-3)",
      fontSize: "var(--text-2xs)",
      textTransform: "uppercase",
      letterSpacing: "var(--tracking-widest)",
      color: "var(--fg-secondary)"
    }
  }, designer ? /*#__PURE__*/React.createElement("span", null, designer) : /*#__PURE__*/React.createElement("span", null), sku ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      letterSpacing: "var(--tracking-normal)"
    }
  }, sku) : null), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-base)",
      lineHeight: "var(--leading-snug)",
      textDecoration: hover ? "underline" : "none",
      textUnderlineOffset: 3
    }
  }, title), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      alignItems: "baseline",
      gap: "var(--space-2)",
      fontSize: "var(--text-base)",
      fontVariantNumeric: "tabular-nums"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: onSale ? "var(--commerce-price-sale)" : "var(--commerce-price)",
      fontWeight: onSale ? "var(--weight-medium)" : "var(--weight-regular)"
    }
  }, fmt(price)), onSale ? /*#__PURE__*/React.createElement("s", {
    style: {
      color: "var(--commerce-price-original)",
      fontSize: "var(--text-ui)"
    }
  }, fmt(compareAt)) : null), rating != null ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-2)",
      marginBlockStart: "var(--space-1)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      position: "relative",
      width: 56,
      height: 3,
      background: "var(--commerce-rating-empty)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      inset: "0 auto 0 0",
      width: rating / 5 * 100 + "%",
      background: "var(--commerce-rating)"
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-2xs)",
      color: "var(--fg-secondary)",
      fontVariantNumeric: "tabular-nums"
    }
  }, rating.toFixed(1), reviewCount != null ? " · " + reviewCount : "")) : null));
}
Object.assign(__ds_scope, { ProductCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/commerce/ProductCard.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const TONES = {
  neutral: {
    background: "var(--action-secondary-bg)",
    color: "var(--action-secondary-text)",
    border: "1px solid transparent"
  },
  solid: {
    background: "var(--action-primary-bg)",
    color: "var(--action-primary-text)",
    border: "1px solid var(--action-primary-bg)"
  },
  outline: {
    background: "transparent",
    color: "var(--fg-primary)",
    border: "1px solid var(--border-default)"
  },
  success: {
    background: "var(--success-bg)",
    color: "var(--success-text)",
    border: "1px solid var(--success-border)"
  },
  warning: {
    background: "var(--warning-bg)",
    color: "var(--warning-text)",
    border: "1px solid var(--warning-border)"
  },
  danger: {
    background: "var(--error-bg)",
    color: "var(--error-text)",
    border: "1px solid var(--error-border)"
  },
  info: {
    background: "var(--info-bg)",
    color: "var(--info-text)",
    border: "1px solid var(--info-border)"
  }
};
function Badge({
  tone = "neutral",
  size = "md",
  dot = false,
  style,
  children,
  ...rest
}) {
  const s = size === "sm" ? {
    height: 20,
    padding: "0 var(--space-2)",
    fontSize: "var(--text-2xs)"
  } : {
    height: 24,
    padding: "0 var(--space-2)",
    fontSize: "var(--text-xs)"
  };
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "var(--space-2)",
      borderRadius: "var(--radius-sm)",
      fontFamily: "var(--font-sans)",
      fontWeight: "var(--weight-medium)",
      letterSpacing: "var(--tracking-normal)",
      whiteSpace: "nowrap",
      ...s,
      ...(TONES[tone] || TONES.neutral),
      ...style
    }
  }, rest), dot ? /*#__PURE__*/React.createElement("span", {
    style: {
      width: 5,
      height: 5,
      borderRadius: "var(--radius-full)",
      background: "currentColor",
      flex: "none"
    }
  }) : null, children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const SIZES = {
  sm: {
    height: "var(--control-h-sm)",
    padding: "0 var(--control-pad-x-sm)",
    fontSize: "var(--text-sm)",
    gap: "var(--space-2)"
  },
  md: {
    height: "var(--control-h-md)",
    padding: "0 var(--control-pad-x-md)",
    fontSize: "var(--text-base)",
    gap: "var(--space-2)"
  },
  lg: {
    height: "var(--control-h-lg)",
    padding: "0 var(--control-pad-x-lg)",
    fontSize: "var(--text-md)",
    gap: "var(--space-3)"
  }
};
const VARIANTS = {
  primary: {
    rest: {
      background: "var(--action-primary-bg)",
      color: "var(--action-primary-text)",
      border: "1px solid var(--action-primary-bg)"
    },
    hover: {
      background: "var(--action-primary-hover)",
      borderColor: "var(--action-primary-hover)"
    }
  },
  secondary: {
    rest: {
      background: "var(--action-secondary-bg)",
      color: "var(--action-secondary-text)",
      border: "1px solid var(--action-secondary-bg)"
    },
    hover: {
      background: "var(--action-secondary-hover)",
      borderColor: "var(--action-secondary-hover)"
    }
  },
  outline: {
    rest: {
      background: "transparent",
      color: "var(--fg-primary)",
      border: "1px solid var(--border-control)"
    },
    hover: {
      background: "var(--action-tertiary-hover)",
      borderColor: "var(--fg-primary)"
    }
  },
  ghost: {
    rest: {
      background: "transparent",
      color: "var(--action-tertiary-text)",
      border: "1px solid transparent"
    },
    hover: {
      background: "var(--action-tertiary-hover)"
    }
  },
  destructive: {
    rest: {
      background: "var(--action-danger-bg)",
      color: "var(--action-danger-text)",
      border: "1px solid var(--action-danger-bg)"
    },
    hover: {
      background: "var(--action-danger-hover)",
      borderColor: "var(--action-danger-hover)"
    }
  },
  link: {
    rest: {
      background: "transparent",
      color: "var(--fg-link)",
      border: "1px solid transparent",
      padding: 0,
      height: "auto",
      minHeight: "var(--touch-target-min)",
      textDecoration: "underline",
      textUnderlineOffset: 3,
      borderRadius: 0
    },
    hover: {
      color: "var(--fg-link-hover)",
      textDecorationThickness: 2
    }
  },
  accent: {
    rest: {
      background: "var(--action-accent-bg)",
      color: "var(--action-accent-text)",
      border: "1px solid var(--action-accent-bg)"
    },
    hover: {
      background: "var(--action-accent-hover)",
      borderColor: "var(--action-accent-hover)"
    }
  }
};
function Button({
  variant = "primary",
  size = "md",
  block = false,
  disabled = false,
  loading = false,
  iconLeft = null,
  iconRight = null,
  type = "button",
  as = "button",
  href,
  onClick,
  style,
  children,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  const v = VARIANTS[variant] || VARIANTS.primary;
  const s = SIZES[size] || SIZES.md;
  const inactive = disabled || loading;
  const Tag = as === "a" || href ? "a" : as;
  const styles = {
    display: block ? "flex" : "inline-flex",
    width: block ? "100%" : "auto",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "var(--font-sans)",
    fontWeight: "var(--weight-medium)",
    letterSpacing: "var(--tracking-tight)",
    lineHeight: 1,
    borderRadius: "var(--radius-md)",
    cursor: inactive ? "not-allowed" : "pointer",
    whiteSpace: "nowrap",
    transition: "var(--transition-control), transform var(--duration-instant) var(--ease-standard)",
    transform: press && !inactive ? "scale(var(--press-scale))" : "none",
    opacity: inactive ? 0.45 : 1,
    ...s,
    ...v.rest,
    ...(hover && !inactive ? v.hover : null),
    ...style
  };
  return /*#__PURE__*/React.createElement(Tag, _extends({
    type: Tag === "button" ? type : undefined,
    href: Tag === "a" ? href : undefined,
    disabled: Tag === "button" ? inactive : undefined,
    "aria-busy": loading || undefined,
    onClick: inactive ? undefined : onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => {
      setHover(false);
      setPress(false);
    },
    onMouseDown: () => setPress(true),
    onMouseUp: () => setPress(false),
    style: styles
  }, rest), loading ? /*#__PURE__*/React.createElement(Spinner, null) : iconLeft, children, iconRight);
}
function Spinner() {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      width: 13,
      height: 13,
      borderRadius: "var(--radius-full)",
      border: "1.5px solid currentColor",
      borderTopColor: "transparent",
      animation: "void-spin 700ms linear infinite",
      flex: "none"
    }
  }, /*#__PURE__*/React.createElement("style", null, "@keyframes void-spin{to{transform:rotate(360deg)}}"));
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Card({
  padding = "md",
  elevated = false,
  interactive = false,
  as = "div",
  style,
  children,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const pad = {
    none: 0,
    sm: "var(--space-4)",
    md: "var(--space-5)",
    lg: "var(--space-8)"
  }[padding];
  const Tag = as;
  return /*#__PURE__*/React.createElement(Tag, _extends({
    onMouseEnter: interactive ? () => setHover(true) : undefined,
    onMouseLeave: interactive ? () => setHover(false) : undefined,
    style: {
      background: "var(--surface-card)",
      color: "var(--card-foreground)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-lg)",
      padding: pad,
      boxShadow: elevated ? "var(--shadow-md)" : "var(--shadow-none)",
      transition: "var(--transition-control)",
      ...(interactive ? {
        cursor: "pointer"
      } : null),
      ...(hover ? {
        borderColor: "var(--line-strong)",
        boxShadow: "var(--shadow-sm)"
      } : null),
      ...style
    }
  }, rest), children);
}
function CardHeader({
  title,
  meta,
  action,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: "var(--space-4)",
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-1)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: "var(--type-h3)",
      fontSize: "var(--text-md)"
    }
  }, title), meta ? /*#__PURE__*/React.createElement("div", {
    style: {
      font: "var(--type-ui-sm)",
      color: "var(--text-muted)"
    }
  }, meta) : null), action);
}
Object.assign(__ds_scope, { Card, CardHeader });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/Icon.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Icon renders a glyph from Void's own self-hosted SVG sprite — no third-party
   origin, no icon CDN, no icon font (UI-INV-13 / NFR-SEC-20).

   The sprite ships 57 symbols drawn from lucide-static (ISC, see
   assets/icons/LICENSE-lucide.txt). `name` must match a symbol id in that file;
   an unknown name renders an empty box of the right size rather than throwing.

   The sprite is fetched once, parsed into a name → path-markup map, and each
   instance inlines its own paths. Two <use>-based approaches were tried first and
   both failed: referencing the file across documents
   (<use href="sprite.svg#name">) does not render in Chromium at all, and
   referencing an injected copy same-document leaves the shadow tree unable to
   inherit fill or stroke from the instance — glyphs came out as solid black blobs,
   or vanished, or ignored currentColor on a dark button. Inlining sidesteps the
   shadow tree entirely, so stroke weight and currentColor behave like any other
   attribute.

   Pages that sit at a depth other than the project root set the path once,
   before render:
     window.VOID_ICON_SPRITE = "../../assets/icons/void-icons.svg"; */

const SPRITE_URL = () => typeof window !== "undefined" && window.VOID_ICON_SPRITE || "assets/icons/void-icons.svg";
let symbols = null;
let loading = null;
function loadSprite() {
  if (symbols) return Promise.resolve(symbols);
  if (loading) return loading;
  loading = fetch(SPRITE_URL()).then(r => r.ok ? r.text() : Promise.reject(new Error(String(r.status)))).then(text => {
    const map = {};
    const re = /<symbol id="([^"]+)"[^>]*>([\s\S]*?)<\/symbol>/g;
    let m;
    while (m = re.exec(text)) map[m[1]] = m[2];
    symbols = map;
    return map;
  }).catch(() => {
    symbols = {};
    return symbols;
  });
  return loading;
}
function Icon({
  name,
  size = 16,
  strokeWidth = 1.5,
  color = "currentColor",
  label,
  style,
  ...rest
}) {
  const [glyphs, setGlyphs] = React.useState(symbols);
  React.useEffect(() => {
    if (glyphs) return;
    let live = true;
    loadSprite().then(map => {
      if (live) setGlyphs(map);
    });
    return () => {
      live = false;
    };
  }, [glyphs]);
  const markup = glyphs && glyphs[name];
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    role: label ? "img" : undefined,
    "aria-label": label,
    "aria-hidden": label ? undefined : "true",
    focusable: "false",
    style: {
      display: "block",
      flex: "none",
      color,
      ...style
    },
    dangerouslySetInnerHTML: markup ? {
      __html: (label ? `<title>${label}</title>` : "") + markup
    } : undefined
  }, rest));
}
Object.assign(__ds_scope, { Icon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Icon.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const SIZES = {
  sm: 32,
  md: 38,
  lg: 44
};
function IconButton({
  icon,
  label,
  variant = "ghost",
  size = "md",
  disabled = false,
  active = false,
  onClick,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const dim = SIZES[size] || SIZES.md;
  const base = {
    ghost: {
      background: "transparent",
      border: "1px solid transparent",
      color: "var(--foreground)"
    },
    outline: {
      background: "var(--background)",
      border: "1px solid var(--border)",
      color: "var(--foreground)"
    },
    solid: {
      background: "var(--primary)",
      border: "1px solid var(--primary)",
      color: "var(--primary-foreground)"
    }
  }[variant];
  const hovered = {
    ghost: {
      background: "var(--muted)"
    },
    outline: {
      background: "var(--muted)",
      borderColor: "var(--line-strong)"
    },
    solid: {
      background: "oklch(0.30 0 0)",
      borderColor: "oklch(0.30 0 0)"
    }
  }[variant];
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    "aria-label": label,
    "aria-pressed": active || undefined,
    disabled: disabled,
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: dim,
      height: dim,
      borderRadius: "var(--radius-md)",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.45 : 1,
      transition: "var(--transition-control)",
      ...base,
      ...(active ? {
        background: "var(--muted)",
        borderColor: "var(--line-strong)"
      } : null),
      ...(hover && !disabled ? hovered : null),
      ...style
    }
  }, rest), icon);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/core/Tag.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Tag({
  selected = false,
  removable = false,
  onRemove,
  onClick,
  style,
  children,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("span", _extends({
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "var(--space-2)",
      height: 28,
      padding: "0 var(--space-3)",
      /* The height is fixed, so the label must never wrap — under any squeeze it
         would spill out of the pill instead of the pill growing. */
      whiteSpace: "nowrap",
      flex: "0 0 auto",
      borderRadius: "var(--radius-full)",
      border: "1px solid " + (selected ? "var(--primary)" : "var(--border)"),
      background: selected ? "var(--primary)" : hover ? "var(--muted)" : "transparent",
      color: selected ? "var(--primary-foreground)" : "var(--foreground)",
      fontSize: "var(--text-xs)",
      fontWeight: "var(--weight-medium)",
      letterSpacing: "var(--tracking-normal)",
      cursor: onClick ? "pointer" : "default",
      transition: "var(--transition-control)",
      ...style
    }
  }, rest), children, removable ? /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": "Remove",
    onClick: e => {
      e.stopPropagation();
      onRemove && onRemove(e);
    },
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: 14,
      height: 14,
      flex: "none",
      border: "none",
      background: "transparent",
      color: "inherit",
      cursor: "pointer",
      opacity: 0.6,
      padding: 0,
      fontSize: 13,
      lineHeight: 1
    }
  }, "\xD7") : null);
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Tag.jsx", error: String((e && e.message) || e) }); }

// components/data/DataTable.jsx
try { (() => {
/* Dense record table shared by the vendor portal and admin back office. */

function DataTable({
  columns = [],
  rows = [],
  selectable = false,
  dense = false,
  empty = "No records",
  onRowClick,
  style
}) {
  const [selected, setSelected] = React.useState([]);
  const rowH = dense ? 38 : 48;
  const toggle = i => setSelected(s => s.includes(i) ? s.filter(x => x !== i) : s.concat(i));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-lg)",
      overflow: "hidden",
      background: "var(--surface-card)",
      ...style
    }
  }, /*#__PURE__*/React.createElement("table", {
    style: {
      width: "100%",
      borderCollapse: "collapse",
      fontFamily: "var(--font-sans)"
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    style: {
      background: "var(--muted)"
    }
  }, selectable ? /*#__PURE__*/React.createElement("th", {
    style: {
      width: 40,
      padding: "0 var(--space-4)"
    }
  }) : null, columns.map(c => /*#__PURE__*/React.createElement("th", {
    key: c.key,
    style: {
      textAlign: c.align || "left",
      padding: "var(--space-3) var(--space-4)",
      fontSize: "var(--text-2xs)",
      fontWeight: "var(--weight-medium)",
      textTransform: "uppercase",
      letterSpacing: "var(--tracking-widest)",
      color: "var(--text-muted)",
      whiteSpace: "nowrap",
      width: c.width
    }
  }, c.label)))), /*#__PURE__*/React.createElement("tbody", null, rows.length === 0 ? /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    colSpan: columns.length + (selectable ? 1 : 0),
    style: {
      padding: "var(--space-10)",
      textAlign: "center",
      color: "var(--text-muted)",
      fontSize: "var(--text-sm)"
    }
  }, empty)) : rows.map((row, i) => /*#__PURE__*/React.createElement("tr", {
    key: row.id || i,
    onClick: () => onRowClick && onRowClick(row),
    style: {
      height: rowH,
      borderTop: "1px solid var(--border)",
      cursor: onRowClick ? "pointer" : "default",
      background: selected.includes(i) ? "var(--muted)" : "transparent"
    }
  }, selectable ? /*#__PURE__*/React.createElement("td", {
    style: {
      padding: "0 var(--space-4)"
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: selected.includes(i),
    onChange: () => toggle(i),
    onClick: e => e.stopPropagation(),
    style: {
      accentColor: "var(--primary)"
    }
  })) : null, columns.map(c => /*#__PURE__*/React.createElement("td", {
    key: c.key,
    style: {
      padding: "0 var(--space-4)",
      textAlign: c.align || "left",
      fontSize: "var(--text-sm)",
      color: c.muted ? "var(--text-muted)" : "var(--foreground)",
      fontVariantNumeric: c.numeric ? "tabular-nums" : "normal",
      fontFamily: c.mono ? "var(--font-mono)" : "inherit",
      whiteSpace: "nowrap"
    }
  }, c.render ? c.render(row) : row[c.key])))))));
}
Object.assign(__ds_scope, { DataTable });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/DataTable.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Dialog.jsx
try { (() => {
function Dialog({
  open = false,
  title,
  description,
  size = "md",
  onClose,
  footer,
  children
}) {
  if (!open) return null;
  const width = {
    sm: 400,
    md: 520,
    lg: 720
  }[size] || 520;
  return /*#__PURE__*/React.createElement("div", {
    role: "dialog",
    "aria-modal": "true",
    "aria-label": typeof title === "string" ? title : undefined,
    onClick: onClose,
    style: {
      position: "fixed",
      inset: 0,
      zIndex: 60,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "var(--space-6)",
      background: "var(--overlay-scrim)",
      backdropFilter: "blur(var(--blur-scrim))",
      animation: "void-fade var(--duration-base) var(--ease-out)"
    }
  }, /*#__PURE__*/React.createElement("style", null, "@keyframes void-fade{from{opacity:0}to{opacity:1}}@keyframes void-rise{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}"), /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      width: "100%",
      maxWidth: width,
      background: "var(--popover)",
      color: "var(--popover-foreground)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-xl)",
      boxShadow: "var(--shadow-overlay)",
      animation: "void-rise var(--duration-base) var(--ease-out)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: "var(--space-4)",
      padding: "var(--space-5) var(--space-5) 0"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-2)"
    }
  }, title ? /*#__PURE__*/React.createElement("div", {
    style: {
      font: "var(--type-h3)"
    }
  }, title) : null, description ? /*#__PURE__*/React.createElement("div", {
    style: {
      font: "var(--type-ui-sm)",
      color: "var(--text-muted)"
    }
  }, description) : null), onClose ? /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": "Close",
    onClick: onClose,
    style: {
      border: "none",
      background: "transparent",
      cursor: "pointer",
      color: "var(--text-muted)",
      fontSize: 18,
      lineHeight: 1,
      padding: 2
    }
  }, "\xD7") : null), children ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "var(--space-5)"
    }
  }, children) : /*#__PURE__*/React.createElement("div", {
    style: {
      height: "var(--space-5)"
    }
  }), footer ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "flex-end",
      gap: "var(--space-3)",
      padding: "var(--space-4) var(--space-5)",
      borderTop: "1px solid var(--border)"
    }
  }, footer) : null));
}
Object.assign(__ds_scope, { Dialog });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Dialog.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Toast.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const TONE_ACCENT = {
  neutral: "var(--foreground)",
  success: "var(--success)",
  warning: "var(--warning)",
  danger: "var(--destructive)"
};
function Toast({
  title,
  description,
  tone = "neutral",
  icon = null,
  action = null,
  onDismiss,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    role: "status",
    style: {
      display: "flex",
      alignItems: "flex-start",
      gap: "var(--space-3)",
      width: 360,
      maxWidth: "100%",
      padding: "var(--space-4)",
      background: "var(--popover)",
      color: "var(--popover-foreground)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-lg)",
      boxShadow: "var(--shadow-lg)",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 3,
      alignSelf: "stretch",
      borderRadius: "var(--radius-full)",
      background: TONE_ACCENT[tone] || TONE_ACCENT.neutral,
      flex: "none"
    }
  }), icon ? /*#__PURE__*/React.createElement("span", {
    style: {
      marginTop: 1,
      color: TONE_ACCENT[tone]
    }
  }, icon) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-1)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-base)",
      fontWeight: "var(--weight-medium)"
    }
  }, title), description ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-sm)",
      color: "var(--text-muted)",
      lineHeight: "var(--leading-normal)"
    }
  }, description) : null, action ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "var(--space-2)"
    }
  }, action) : null), onDismiss ? /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": "Dismiss",
    onClick: onDismiss,
    style: {
      border: "none",
      background: "transparent",
      cursor: "pointer",
      color: "var(--text-muted)",
      fontSize: 16,
      lineHeight: 1,
      padding: 0
    }
  }, "\xD7") : null);
}
Object.assign(__ds_scope, { Toast });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Toast.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Tooltip.jsx
try { (() => {
function Tooltip({
  label,
  placement = "top",
  children,
  style
}) {
  const [open, setOpen] = React.useState(false);
  const pos = {
    top: {
      bottom: "calc(100% + 6px)",
      left: "50%",
      transform: "translateX(-50%)"
    },
    bottom: {
      top: "calc(100% + 6px)",
      left: "50%",
      transform: "translateX(-50%)"
    },
    left: {
      right: "calc(100% + 6px)",
      top: "50%",
      transform: "translateY(-50%)"
    },
    right: {
      left: "calc(100% + 6px)",
      top: "50%",
      transform: "translateY(-50%)"
    }
  }[placement];
  return /*#__PURE__*/React.createElement("span", {
    onMouseEnter: () => setOpen(true),
    onMouseLeave: () => setOpen(false),
    onFocus: () => setOpen(true),
    onBlur: () => setOpen(false),
    style: {
      position: "relative",
      display: "inline-flex",
      ...style
    }
  }, children, open ? /*#__PURE__*/React.createElement("span", {
    role: "tooltip",
    style: {
      position: "absolute",
      zIndex: 70,
      ...pos,
      padding: "var(--space-1) var(--space-2)",
      background: "var(--primary)",
      color: "var(--primary-foreground)",
      fontSize: "var(--text-2xs)",
      fontWeight: "var(--weight-medium)",
      letterSpacing: "var(--tracking-normal)",
      whiteSpace: "nowrap",
      borderRadius: "var(--radius-sm)",
      boxShadow: "var(--shadow-md)",
      pointerEvents: "none"
    }
  }, label) : null);
}
Object.assign(__ds_scope, { Tooltip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Tooltip.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Checkbox({
  label,
  description,
  checked = false,
  indeterminate = false,
  disabled = false,
  onChange,
  id,
  style,
  ...rest
}) {
  const uid = React.useId();
  const fieldId = id || uid;
  const on = checked || indeterminate;
  return /*#__PURE__*/React.createElement("label", {
    htmlFor: fieldId,
    style: {
      display: "inline-flex",
      alignItems: description ? "flex-start" : "center",
      gap: "var(--space-3)",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1,
      ...style
    }
  }, /*#__PURE__*/React.createElement("input", _extends({
    id: fieldId,
    type: "checkbox",
    checked: checked,
    disabled: disabled,
    onChange: onChange,
    style: {
      position: "absolute",
      opacity: 0,
      width: 0,
      height: 0
    }
  }, rest)), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: 16,
      height: 16,
      flex: "none",
      marginTop: description ? 2 : 0,
      borderRadius: "var(--radius-sm)",
      border: "1px solid " + (on ? "var(--primary)" : "var(--input)"),
      background: on ? "var(--primary)" : "var(--background)",
      color: "var(--primary-foreground)",
      transition: "var(--transition-control)"
    }
  }, indeterminate ? /*#__PURE__*/React.createElement("span", {
    style: {
      width: 8,
      height: 1.5,
      background: "currentColor"
    }
  }) : checked ? /*#__PURE__*/React.createElement("svg", {
    width: "10",
    height: "10",
    viewBox: "0 0 10 10",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M1.5 5.2 3.8 7.5 8.5 2.5",
    stroke: "currentColor",
    strokeWidth: "1.6",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  })) : null), label ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-base)"
    }
  }, label), description ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-xs)",
      color: "var(--text-muted)"
    }
  }, description) : null) : null);
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Input({
  label,
  hint,
  error,
  size = "md",
  prefix = null,
  suffix = null,
  disabled = false,
  multiline = false,
  rows = 3,
  id,
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const uid = React.useId();
  const fieldId = id || uid;
  const h = {
    sm: "var(--control-h-sm)",
    md: "var(--control-h-md)",
    lg: "var(--control-h-lg)"
  }[size];
  const fs = {
    sm: "var(--text-sm)",
    md: "var(--text-base)",
    lg: "var(--text-md)"
  }[size];
  const shell = {
    display: "flex",
    alignItems: "center",
    gap: "var(--space-2)",
    height: multiline ? "auto" : h,
    padding: multiline ? "var(--space-3)" : "0 var(--space-3)",
    background: disabled ? "var(--muted)" : "var(--background)",
    border: "1px solid " + (error ? "var(--destructive)" : focus ? "var(--ring)" : "var(--input)"),
    borderRadius: "var(--radius-md)",
    boxShadow: focus && !error ? "var(--focus-ring)" : "none",
    transition: "var(--transition-control)",
    opacity: disabled ? 0.6 : 1
  };
  const control = {
    flex: 1,
    minWidth: 0,
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: fs,
    fontFamily: "var(--font-sans)",
    color: "var(--foreground)",
    resize: multiline ? "vertical" : undefined,
    lineHeight: multiline ? "var(--leading-normal)" : undefined
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-2)",
      ...style
    }
  }, label ? /*#__PURE__*/React.createElement("label", {
    htmlFor: fieldId,
    style: {
      font: "var(--type-label)",
      color: "var(--foreground)"
    }
  }, label) : null, /*#__PURE__*/React.createElement("div", {
    style: shell
  }, prefix ? /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-muted)",
      display: "inline-flex"
    }
  }, prefix) : null, multiline ? /*#__PURE__*/React.createElement("textarea", _extends({
    id: fieldId,
    rows: rows,
    disabled: disabled,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: control
  }, rest)) : /*#__PURE__*/React.createElement("input", _extends({
    id: fieldId,
    disabled: disabled,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: control
  }, rest)), suffix ? /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-muted)",
      display: "inline-flex",
      fontSize: "var(--text-xs)"
    }
  }, suffix) : null), error || hint ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-xs)",
      color: error ? "var(--destructive)" : "var(--text-muted)"
    }
  }, error || hint) : null);
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Radio.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Radio({
  label,
  description,
  checked = false,
  disabled = false,
  name,
  value,
  onChange,
  id,
  style,
  ...rest
}) {
  const uid = React.useId();
  const fieldId = id || uid;
  return /*#__PURE__*/React.createElement("label", {
    htmlFor: fieldId,
    style: {
      display: "inline-flex",
      alignItems: description ? "flex-start" : "center",
      gap: "var(--space-3)",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1,
      ...style
    }
  }, /*#__PURE__*/React.createElement("input", _extends({
    id: fieldId,
    type: "radio",
    name: name,
    value: value,
    checked: checked,
    disabled: disabled,
    onChange: onChange,
    style: {
      position: "absolute",
      opacity: 0,
      width: 0,
      height: 0
    }
  }, rest)), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: 16,
      height: 16,
      flex: "none",
      marginTop: description ? 2 : 0,
      borderRadius: "var(--radius-full)",
      border: "1px solid " + (checked ? "var(--primary)" : "var(--input)"),
      background: "var(--background)",
      transition: "var(--transition-control)"
    }
  }, checked ? /*#__PURE__*/React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      borderRadius: "var(--radius-full)",
      background: "var(--primary)"
    }
  }) : null), label ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-base)"
    }
  }, label), description ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-xs)",
      color: "var(--text-muted)"
    }
  }, description) : null) : null);
}
Object.assign(__ds_scope, { Radio });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Radio.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Select({
  label,
  hint,
  error,
  size = "md",
  options = [],
  placeholder,
  disabled = false,
  id,
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const uid = React.useId();
  const fieldId = id || uid;
  const h = {
    sm: "var(--control-h-sm)",
    md: "var(--control-h-md)",
    lg: "var(--control-h-lg)"
  }[size];
  const fs = {
    sm: "var(--text-sm)",
    md: "var(--text-base)",
    lg: "var(--text-md)"
  }[size];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-2)",
      ...style
    }
  }, label ? /*#__PURE__*/React.createElement("label", {
    htmlFor: fieldId,
    style: {
      font: "var(--type-label)"
    }
  }, label) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      display: "flex"
    }
  }, /*#__PURE__*/React.createElement("select", _extends({
    id: fieldId,
    disabled: disabled,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      appearance: "none",
      width: "100%",
      height: h,
      padding: "0 var(--space-8) 0 var(--space-3)",
      fontSize: fs,
      fontFamily: "var(--font-sans)",
      color: "var(--foreground)",
      background: disabled ? "var(--muted)" : "var(--background)",
      border: "1px solid " + (error ? "var(--destructive)" : focus ? "var(--ring)" : "var(--input)"),
      borderRadius: "var(--radius-md)",
      boxShadow: focus && !error ? "var(--focus-ring)" : "none",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.6 : 1,
      transition: "var(--transition-control)"
    }
  }, rest), placeholder ? /*#__PURE__*/React.createElement("option", {
    value: ""
  }, placeholder) : null, options.map(o => {
    const value = typeof o === "string" ? o : o.value;
    const text = typeof o === "string" ? o : o.label;
    return /*#__PURE__*/React.createElement("option", {
      key: value,
      value: value
    }, text);
  })), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      position: "absolute",
      right: "var(--space-3)",
      top: "50%",
      transform: "translateY(-50%)",
      pointerEvents: "none",
      color: "var(--text-muted)",
      fontSize: 10
    }
  }, "\u25BE")), error || hint ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-xs)",
      color: error ? "var(--destructive)" : "var(--text-muted)"
    }
  }, error || hint) : null);
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/Switch.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Switch({
  label,
  checked = false,
  disabled = false,
  size = "md",
  onChange,
  id,
  style,
  ...rest
}) {
  const uid = React.useId();
  const fieldId = id || uid;
  const w = size === "sm" ? 32 : 40;
  const h = size === "sm" ? 18 : 22;
  const knob = h - 6;
  return /*#__PURE__*/React.createElement("label", {
    htmlFor: fieldId,
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "var(--space-3)",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1,
      ...style
    }
  }, /*#__PURE__*/React.createElement("input", _extends({
    id: fieldId,
    type: "checkbox",
    role: "switch",
    checked: checked,
    disabled: disabled,
    onChange: onChange,
    style: {
      position: "absolute",
      opacity: 0,
      width: 0,
      height: 0
    }
  }, rest)), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      position: "relative",
      width: w,
      height: h,
      flex: "none",
      borderRadius: "var(--radius-full)",
      background: checked ? "var(--primary)" : "var(--border)",
      transition: "background-color var(--duration-base) var(--ease-standard)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: 3,
      left: checked ? w - knob - 3 : 3,
      width: knob,
      height: knob,
      borderRadius: "var(--radius-full)",
      background: "var(--background)",
      boxShadow: "var(--shadow-xs)",
      transition: "left var(--duration-base) var(--ease-standard)"
    }
  })), label ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-base)"
    }
  }, label) : null);
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Switch.jsx", error: String((e && e.message) || e) }); }

// components/navigation/SideNav.jsx
try { (() => {
function SideNav({
  brand,
  sections = [],
  value,
  onChange,
  footer,
  width = "var(--sidebar-width)",
  style
}) {
  return /*#__PURE__*/React.createElement("nav", {
    style: {
      display: "flex",
      flexDirection: "column",
      width,
      flex: "none",
      height: "100%",
      background: "var(--sidebar)",
      borderRight: "1px solid var(--sidebar-border)",
      color: "var(--sidebar-foreground)",
      ...style
    }
  }, brand ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      height: "var(--topbar-height)",
      padding: "0 var(--space-4)",
      borderBottom: "1px solid var(--sidebar-border)"
    }
  }, brand) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-6)",
      padding: "var(--space-4)",
      overflowY: "auto",
      flex: 1
    }
  }, sections.map((section, i) => /*#__PURE__*/React.createElement("div", {
    key: section.title || i,
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-1)"
    }
  }, section.title ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-2xs)",
      textTransform: "uppercase",
      letterSpacing: "var(--tracking-widest)",
      color: "var(--text-muted)",
      padding: "0 var(--space-2) var(--space-2)"
    }
  }, section.title) : null, (section.items || []).map(item => /*#__PURE__*/React.createElement(NavItem, {
    key: item.value,
    item: item,
    active: item.value === value,
    onChange: onChange
  }))))), footer ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "var(--space-4)",
      borderTop: "1px solid var(--sidebar-border)"
    }
  }, footer) : null);
}
function NavItem({
  item,
  active,
  onChange
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => onChange && onChange(item.value),
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-3)",
      width: "100%",
      height: 34,
      padding: "0 var(--space-2)",
      border: "none",
      borderRadius: "var(--radius-md)",
      background: active ? "var(--sidebar-accent)" : hover ? "var(--sidebar-accent)" : "transparent",
      color: active ? "var(--sidebar-accent-foreground)" : "var(--sidebar-foreground)",
      fontFamily: "var(--font-sans)",
      fontSize: "var(--text-base)",
      fontWeight: active ? "var(--weight-medium)" : "var(--weight-regular)",
      textAlign: "left",
      cursor: "pointer",
      transition: "var(--transition-control)"
    }
  }, item.icon ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      color: active ? "var(--foreground)" : "var(--text-muted)"
    }
  }, item.icon) : null, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }, item.label), item.badge != null ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-2xs)",
      color: "var(--text-muted)",
      fontVariantNumeric: "tabular-nums"
    }
  }, item.badge) : null);
}
Object.assign(__ds_scope, { SideNav });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/SideNav.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Tabs.jsx
try { (() => {
function Tabs({
  items = [],
  value,
  onChange,
  variant = "underline",
  size = "md",
  style
}) {
  const active = value ?? (items[0] && (items[0].value ?? items[0]));
  const fs = size === "sm" ? "var(--text-sm)" : "var(--text-base)";
  const wrap = variant === "segmented" ? {
    display: "inline-flex",
    gap: 2,
    padding: 2,
    background: "var(--muted)",
    borderRadius: "var(--radius-md)"
  } : {
    display: "flex",
    gap: "var(--space-6)",
    borderBottom: "1px solid var(--border)"
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      ...wrap,
      ...style
    }
  }, items.map(raw => {
    const item = typeof raw === "string" ? {
      value: raw,
      label: raw
    } : raw;
    const on = item.value === active;
    const seg = {
      padding: "0 var(--space-3)",
      height: 28,
      display: "inline-flex",
      alignItems: "center",
      gap: "var(--space-2)",
      borderRadius: "var(--radius-sm)",
      background: on ? "var(--background)" : "transparent",
      color: on ? "var(--foreground)" : "var(--text-muted)",
      boxShadow: on ? "var(--shadow-xs)" : "none"
    };
    const und = {
      padding: "0 0 var(--space-3)",
      display: "inline-flex",
      alignItems: "center",
      gap: "var(--space-2)",
      color: on ? "var(--foreground)" : "var(--text-muted)",
      borderBottom: "1px solid " + (on ? "var(--foreground)" : "transparent"),
      marginBottom: -1
    };
    return /*#__PURE__*/React.createElement("button", {
      key: item.value,
      type: "button",
      role: "tab",
      "aria-selected": on,
      onClick: () => onChange && onChange(item.value),
      style: {
        border: "none",
        background: "transparent",
        cursor: "pointer",
        fontFamily: "var(--font-sans)",
        fontSize: fs,
        fontWeight: on ? "var(--weight-medium)" : "var(--weight-regular)",
        transition: "var(--transition-control)",
        ...(variant === "segmented" ? seg : und)
      }
    }, item.icon, item.label, item.count != null ? /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-2xs)",
        color: "var(--text-muted)",
        fontVariantNumeric: "tabular-nums"
      }
    }, item.count) : null);
  }));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Tabs.jsx", error: String((e && e.message) || e) }); }

__ds_ns.ProductCard = __ds_scope.ProductCard;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.CardHeader = __ds_scope.CardHeader;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.DataTable = __ds_scope.DataTable;

__ds_ns.Dialog = __ds_scope.Dialog;

__ds_ns.Toast = __ds_scope.Toast;

__ds_ns.Tooltip = __ds_scope.Tooltip;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Radio = __ds_scope.Radio;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.SideNav = __ds_scope.SideNav;

__ds_ns.Tabs = __ds_scope.Tabs;

})();
