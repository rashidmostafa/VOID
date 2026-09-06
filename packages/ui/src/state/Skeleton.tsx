import * as React from "react";

/* Skeleton — the loading state of UI-GLOB-1.
 *
 * "Loading is a skeleton that mirrors the real layout so nothing reflows when
 *  data lands — never a spinner alone."
 *
 * The mirroring is the caller's job and cannot be automated: a skeleton is only
 * worth having if its blocks sit where the real content will. What these
 * primitives guarantee is that the blocks reserve space before load (UI-INV-10,
 * so the theme cannot push CLS), that the shimmer is suppressed under
 * prefers-reduced-motion, and that a screen reader is told the region is busy
 * rather than being read a wall of empty boxes.
 *
 * The visual treatment lives in the theme's base layer as .void-skeleton, not
 * here, so the central reduced-motion rule reaches it.
 */

export interface SkeletonProps {
  /** Inline size. Defaults to filling the container. */
  width?: string;
  /** Block size. Defaults to one line of body text. */
  height?: string;
  radius?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({
  width = "100%",
  height = "var(--text-base)",
  radius = "var(--radius-sm)",
  className = "",
  style,
}: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`void-skeleton ${className}`.trim()}
      style={{ inlineSize: width, blockSize: height, borderRadius: radius, ...style }}
    />
  );
}

export interface SkeletonTextProps {
  /** Number of lines. The last is short, the way a real paragraph ends. */
  lines?: number;
  width?: string;
  style?: React.CSSProperties;
}

export function SkeletonText({ lines = 3, width = "100%", style }: SkeletonTextProps) {
  return (
    <div
      aria-hidden="true"
      style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", inlineSize: width, ...style }}
    >
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} width={i === lines - 1 ? "60%" : "100%"} />
      ))}
    </div>
  );
}

/* Media plates reserve their real aspect ratio — 3:4 portrait in grids, 1:1 for
   thumbnails — so composition holds before the photograph lands and nothing
   shifts when it does (UI-INV-10). Product imagery is never rounded:
   --radius-media is 0 deliberately. */
export interface SkeletonMediaProps {
  ratio?: string;
  style?: React.CSSProperties;
}

export function SkeletonMedia({ ratio = "3 / 4", style }: SkeletonMediaProps) {
  return (
    <div
      aria-hidden="true"
      className="void-skeleton"
      style={{ aspectRatio: ratio, inlineSize: "100%", borderRadius: "var(--radius-media)", ...style }}
    />
  );
}

/* Wraps a skeleton composition so assistive tech is told the region is loading
   instead of reading the decorative blocks inside it. */
export function SkeletonRegion({
  label,
  children,
  style,
}: {
  label: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div role="status" aria-busy="true" aria-live="polite" style={style}>
      <span className="void-visually-hidden">{label}</span>
      {children}
    </div>
  );
}
