import * as React from "react";

/**
 * Dense record table for the vendor portal and admin back office.
 */
export interface DataTableColumn {
  key: string;
  label: React.ReactNode;
  align?: "left" | "right" | "center";
  width?: number | string;
  /** Tabular numerals. */
  numeric?: boolean;
  /** Render in the mono face (IDs, SKUs). */
  mono?: boolean;
  /** Muted text colour. */
  muted?: boolean;
  /** Custom cell renderer. */
  render?: (row: any) => React.ReactNode;
}
export interface DataTableProps {
  columns?: DataTableColumn[];
  rows?: any[];
  /** Leading checkbox column. @default false */
  selectable?: boolean;
  /** 38px rows instead of 48px. @default false */
  dense?: boolean;
  /** Empty-state copy. @default "No records" */
  empty?: React.ReactNode;
  onRowClick?: (row: any) => void;
}
export declare function DataTable(props: DataTableProps): JSX.Element;
