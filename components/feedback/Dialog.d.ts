import * as React from "react";

/** Centered modal over a blurred scrim. Confirmations and short forms only. */
export interface DialogProps {
  open?: boolean;
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** 400 / 520 / 720px. @default "md" */
  size?: "sm" | "md" | "lg";
  onClose?: () => void;
  /** Right-aligned action row. */
  footer?: React.ReactNode;
  children?: React.ReactNode;
}
export declare function Dialog(props: DialogProps): JSX.Element | null;
