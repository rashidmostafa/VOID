import * as React from "react";
import { EmptyState, type EmptyStateProps } from "./EmptyState";
import { ErrorState, type ErrorStateProps } from "./ErrorState";
import { SkeletonRegion } from "./Skeleton";

/* AsyncSurface — UI-GLOB-1, made structural.
 *
 * "Four states on every async surface. Loading is a skeleton that mirrors the
 *  real layout so nothing reflows when data lands — never a spinner alone. Plus
 *  empty, error-with-retry, and populated. A blank screen is never acceptable."
 *
 * SRS Build-Agent Protocol rule 4 is blunt about why this exists: "An agent will
 * reliably produce a plausible-looking implementation that omits error states,
 * locales, object-level authorisation, audit trails and observability unless
 * those are demanded explicitly."
 *
 * So they are demanded by the type. Every prop below is required. There is no
 * way to render an async surface through this component while leaving a state
 * out — omitting one is a compile error, not a code-review note someone might
 * catch. That is the whole design; the rendering it does is trivial by
 * comparison.
 *
 * `skeleton` is a node rather than something generated, because a skeleton is
 * only useful if it mirrors THIS surface's layout. A generic one reflows on
 * arrival, which is the failure the requirement names.
 */

export type AsyncState<T> =
  | { status: "loading" }
  | { status: "empty" }
  | { status: "error"; diagnostic?: string }
  | { status: "ready"; data: T };

export interface AsyncSurfaceProps<T> {
  state: AsyncState<T>;
  /** Names the region for assistive tech while loading. "Loading your orders". */
  label: string;
  /** Must mirror the populated layout. Never a spinner alone. */
  skeleton: React.ReactNode;
  empty: EmptyStateProps;
  /** `diagnostic` is supplied by the error state itself when present. */
  error: Omit<ErrorStateProps, "diagnostic">;
  children: (data: T) => React.ReactNode;
}

export function AsyncSurface<T>({
  state,
  label,
  skeleton,
  empty,
  error,
  children,
}: AsyncSurfaceProps<T>) {
  switch (state.status) {
    case "loading":
      return <SkeletonRegion label={label}>{skeleton}</SkeletonRegion>;
    case "empty":
      return <EmptyState {...empty} />;
    case "error":
      return <ErrorState {...error} diagnostic={state.diagnostic} />;
    case "ready":
      return <>{children(state.data)}</>;
  }
}

/* Narrows a fetch result to the four states in one place, so "an empty array is
   the empty state, not a populated one with nothing in it" is decided once
   rather than per screen. */
export function asyncStateOf<T>(
  result: { data?: T; error?: unknown; loading?: boolean },
  isEmpty: (data: T) => boolean
): AsyncState<T> {
  if (result.loading) return { status: "loading" };
  if (result.error) {
    return {
      status: "error",
      diagnostic: result.error instanceof Error ? result.error.message : undefined,
    };
  }
  if (result.data === undefined) return { status: "loading" };
  return isEmpty(result.data) ? { status: "empty" } : { status: "ready", data: result.data };
}
