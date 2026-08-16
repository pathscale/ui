import type { JSX } from "@solidjs/web";

export type ResponsiveBreakpoints = "base" | "sm" | "md" | "lg" | "xl";
export type ResponsiveProp<T> = T | Partial<Record<ResponsiveBreakpoints, T>>;

export const breakpoints = ["base", "sm", "md", "lg", "xl"] as const;

export type ComponentSize = "xs" | "sm" | "md" | "lg" | "xl";

export type ComponentShape = "circle" | "square" | "rounded";

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

export type ComponentVariant =
  | "soft"
  | "dash"
  | "outline"
  | "filled"
  | "ghost"
  | "outlined";
export type ComponentPosition = "top" | "bottom" | "left" | "right";
