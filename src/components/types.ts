import type { JSX } from "solid-js";

export interface IComponentBaseProps {
  dataTheme?: string;
  class?: string;
  className?: string;
  style?: JSX.CSSProperties;
}

export type ResponsiveBreakpoints = "base" | "sm" | "md" | "lg" | "xl";
export type ResponsiveProp<T> = T | Partial<Record<ResponsiveBreakpoints, T>>;

export const breakpoints = ["base", "sm", "md", "lg", "xl"] as const;

export function mapResponsiveProp<T extends string | boolean>(
  prop: ResponsiveProp<T> | undefined,
  classMap: Record<string, string>
) {
  if (prop === undefined) return [];
  if (typeof prop === "string" || typeof prop === "boolean") {
    return [classMap[String(prop)]];
  }
  return breakpoints.flatMap((bp) => {
    const value = prop[bp];
    if (value === undefined) return [];
    const className = classMap[String(value)];
    return bp === "base" ? [className] : [`${bp}:${className}`];
  });
}

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
