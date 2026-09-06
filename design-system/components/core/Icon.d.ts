import * as React from "react";

/** Lucide glyph at the brand's 1.5px stroke, read from the local sprite at assets/icons/void-icons.svg. */
export interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Symbol id in the sprite — kebab-case Lucide name ("shopping-bag"). Must be one of the 44 subset symbols. */
  name: string;
  /** Pixel box. @default 16 */
  size?: number;
  /** @default 1.5 */
  strokeWidth?: number;
  /** @default "currentColor" */
  color?: string;
}
export declare function Icon(props: IconProps): JSX.Element;
