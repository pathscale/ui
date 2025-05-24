import type { JSX } from "solid-js";

export interface IComponentBaseProps {
  dataTheme?: string;
  class?: string;
  className?: string;
  style?: JSX.CSSProperties;
}

export type ComponentSize = "xs" | "sm" | "md" | "lg" | "xl";

export type ComponentShape = "circle" | "square";

export type ComponentColor =
  | "neutral"
  | "primary"
  | "secondary"
  | "accent"
  | "info"
  | "success"
  | "warning"
  | "error"
  | "ghost";

export type ComponentVariant = "soft" | "dash" | "outline";

export type ComponentPosition = "top" | "bottom" | "left" | "right";
