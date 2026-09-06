import * as React from "react";

/** Transient confirmation. Bottom-right, one at a time, 360px wide. */
export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Sets the 3px accent bar. @default "neutral" */
  tone?: "neutral" | "success" | "warning" | "danger";
  icon?: React.ReactNode;
  /** Single inline action, e.g. Undo. */
  action?: React.ReactNode;
  onDismiss?: () => void;
}
export declare function Toast(props: ToastProps): JSX.Element;
