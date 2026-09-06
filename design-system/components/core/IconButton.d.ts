import * as React from "react";

/** Square icon-only control — toolbars, Studio tool rail, table row actions. */
export interface IconButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  /** Required accessible name. */
  label: string;
  /** @default "ghost" */
  variant?: "ghost" | "outline" | "solid";
  /** 32 / 38 / 44px square. @default "md" */
  size?: "sm" | "md" | "lg";
  /** Sticky selected state (tool rail). @default false */
  active?: boolean;
  disabled?: boolean;
}
export declare function IconButton(props: IconButtonProps): JSX.Element;
