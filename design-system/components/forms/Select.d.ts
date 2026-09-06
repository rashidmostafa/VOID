import * as React from "react";

/** Native select in Void's control shell. Use for 4+ mutually exclusive options. */
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  /** @default "md" */
  size?: "sm" | "md" | "lg";
  /** Strings, or {value,label} objects. */
  options?: Array<string | { value: string; label: string }>;
  /** Empty leading option. */
  placeholder?: string;
}
export declare function Select(props: SelectProps): JSX.Element;
