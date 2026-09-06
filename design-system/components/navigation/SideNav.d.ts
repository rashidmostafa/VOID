import * as React from "react";

/**
 * Persistent left navigation for the vendor portal and admin back office.
 */
export interface SideNavItem {
  value: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  /** Trailing count. */
  badge?: React.ReactNode;
}
export interface SideNavSection {
  title?: string;
  items?: SideNavItem[];
}
export interface SideNavProps {
  /** Wordmark row above the nav. */
  brand?: React.ReactNode;
  sections?: SideNavSection[];
  value?: string;
  onChange?: (value: string) => void;
  footer?: React.ReactNode;
  /** @default "var(--sidebar-width)" (248px) */
  width?: string;
}
export declare function SideNav(props: SideNavProps): JSX.Element;
