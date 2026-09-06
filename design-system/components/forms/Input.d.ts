import * as React from "react";

/**
 * Text field with label, hint, error and affix slots. Also the textarea (multiline).
 */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  /** Helper text under the field. */
  hint?: React.ReactNode;
  /** Error message; also turns the border --destructive. */
  error?: React.ReactNode;
  /** @default "md" */
  size?: "sm" | "md" | "lg";
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  /** Render a textarea. @default false */
  multiline?: boolean;
  rows?: number;
}
export declare function Input(props: InputProps): JSX.Element;
