import * as React from "react";

/** Hairline surface container. Elevation is opt-in; the default card is border-only. */
export interface CardProps extends React.HTMLAttributes<HTMLElement> {
  /** 0 / 16 / 20 / 32px. @default "md" */
  padding?: "none" | "sm" | "md" | "lg";
  /** Adds --shadow-md for floating panels. @default false */
  elevated?: boolean;
  /** Enables hover border/shadow response. @default false */
  interactive?: boolean;
  as?: keyof JSX.IntrinsicElements;
  children?: React.ReactNode;
}
export declare function Card(props: CardProps): JSX.Element;

export interface CardHeaderProps {
  title: React.ReactNode;
  meta?: React.ReactNode;
  action?: React.ReactNode;
}
export declare function CardHeader(props: CardHeaderProps): JSX.Element;
