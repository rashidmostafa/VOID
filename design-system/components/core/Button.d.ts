import * as React from "react";

/**
 * Primary action control. Six variants, three heights; press feedback is a
 * 0.985 scale, hover is a one-step value shift — never a color change.
 */
export interface ButtonProps extends React.HTMLAttributes<HTMLElement> {
  /** Visual weight. @default "primary" */
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive" | "link";
  /** Control height: 32 / 38 / 44px. @default "md" */
  size?: "sm" | "md" | "lg";
  /** Stretch to the container width. @default false */
  block?: boolean;
  disabled?: boolean;
  /** Swaps iconLeft for a spinner and blocks interaction. @default false */
  loading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  /** Render as an anchor instead of a button. @default "button" */
  as?: "button" | "a";
  href?: string;
  type?: "button" | "submit" | "reset";
  children?: React.ReactNode;
}
export declare function Button(props: ButtonProps): JSX.Element;
