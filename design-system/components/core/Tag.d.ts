import * as React from "react";

/** Pill-shaped filter or attribute chip. Interactive counterpart to Badge. */
export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Filled selected state. @default false */
  selected?: boolean;
  /** Shows the × affordance. @default false */
  removable?: boolean;
  onRemove?: (e: React.MouseEvent) => void;
  children?: React.ReactNode;
}
export declare function Tag(props: TagProps): JSX.Element;
