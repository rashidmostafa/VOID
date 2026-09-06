import * as React from "react";

/**
 * In-page view switch. Underline for page-level sections, segmented for
 * filters inside a panel.
 */
export interface TabItem {
  value: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  /** Trailing count, e.g. open orders. */
  count?: number;
}
export interface TabsProps {
  items?: Array<string | TabItem>;
  value?: string;
  onChange?: (value: string) => void;
  /** @default "underline" */
  variant?: "underline" | "segmented";
  /** @default "md" */
  size?: "sm" | "md";
}
export declare function Tabs(props: TabsProps): JSX.Element;
