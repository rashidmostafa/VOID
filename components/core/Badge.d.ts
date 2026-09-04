import * as React from "react";

/** Status label — order state, moderation state, stock. Text only, no icons. */
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** @default "neutral" */
  tone?: "neutral" | "solid" | "outline" | "success" | "warning" | "danger" | "info";
  /** 20 / 24px tall. @default "md" */
  size?: "sm" | "md";
  /** Leading 5px dot for live states. @default false */
  dot?: boolean;
  children?: React.ReactNode;
}
export declare function Badge(props: BadgeProps): JSX.Element;
