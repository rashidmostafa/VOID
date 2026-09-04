import * as React from "react";

/** Short label on hover/focus. Names things, never explains them. */
export interface TooltipProps {
  label: React.ReactNode;
  /** @default "top" */
  placement?: "top" | "bottom" | "left" | "right";
  children?: React.ReactNode;
}
export declare function Tooltip(props: TooltipProps): JSX.Element;
