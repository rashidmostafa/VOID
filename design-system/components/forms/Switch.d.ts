import * as React from "react";

/** Immediate on/off toggle. No Save step. */
export interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  checked?: boolean;
  /** 32×18 / 40×22. @default "md" */
  size?: "sm" | "md";
}
export declare function Switch(props: SwitchProps): JSX.Element;
