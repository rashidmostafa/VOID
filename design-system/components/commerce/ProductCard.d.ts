import * as React from "react";

/**
 * Product tile for storefront and marketplace grids.
 */
export interface ProductCardProps extends React.HTMLAttributes<HTMLElement> {
  title: React.ReactNode;
  /** Designer or vendor name; rendered as the uppercase eyebrow. */
  designer?: React.ReactNode;
  price: number;
  /** Struck-through original price. */
  compareAt?: number;
  /** @default "BDT" */
  currency?: string;
  /** Number formatting locale. @default "en" */
  locale?: "en" | "bn";
  /** Photograph URL; omit for the flat --muted plate. */
  image?: string;
  /** CSS aspect-ratio. @default "3 / 4" */
  ratio?: string;
  /** Editorial flag, e.g. "New in". */
  badge?: React.ReactNode;
  /** Which commerce badge token pair the flag uses. @default "new" */
  badgeTone?: "new" | "sale" | "lowstock" | "soldout";
  /** 0–5; renders the rating bar in --commerce-rating. */
  rating?: number;
  /** Review count shown beside the rating. */
  reviewCount?: number;
  /** SKU shown right-aligned against the designer eyebrow. */
  sku?: string;
  /** Sizes revealed on hover. */
  sizes?: string[];
}
export declare function ProductCard(props: ProductCardProps): JSX.Element;
