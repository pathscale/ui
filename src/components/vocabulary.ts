import type { JSX } from "solid-js";

/**
 * The shared parameter vocabulary.
 *
 * A name in here means the same thing on every component, or it does not
 * belong in here. Derived from the 2026-08-14 fleet inventory (13 apps, 199
 * components, every call site parsed); see `UI-2.2-API.md`.
 *
 * The split between `State` and `Variant` is the point. The old
 * `ComponentColor` mixed meanings (`primary`, `success`) with a shape
 * (`ghost`), which is why a second axis grew beside it: across the fleet
 * `Button.variant` carried `ghost` 275 times and `primary` 99 times, while
 * `Button.color` carried `primary` 116 times and `ghost` 34. One axis was
 * answering two questions.
 */

/**
 * What is true about this thing.
 *
 * A danger button is a dangerous action; a danger callout is an error. Same
 * word, same meaning, so there is no second colour axis that could contradict
 * it. Components that report a condition take `state` and nothing else.
 */
export type State =
  | "neutral"
  | "primary"
  | "secondary"
  | "accent"
  | "success"
  | "warning"
  | "danger"
  | "info";

/** How much emphasis, and what shape. */
export type Variant = "solid" | "soft" | "outline" | "ghost" | "plain";

/** One scale, everywhere. */
export type Size = "xs" | "sm" | "md" | "lg" | "xl";

export type Radius = "none" | "sm" | "md" | "lg" | "full";

/** Spacing scale, shared by `gap` and every `padding*`. */
export type Space = "none" | "xs" | "sm" | "md" | "lg" | "xl";

/**
 * Named sizing, so `w-full` stops being written by hand. It appears at 384
 * call sites across 9 of 13 apps today, which is this type missing.
 */
export type Width = "auto" | "full" | "fit" | "screen";
export type Height = Width;
export type MaxWidth = "none" | "xs" | "sm" | "md" | "lg" | "xl" | "prose";

export type Align = "start" | "center" | "end" | "baseline" | "stretch";
export type Justify = "start" | "center" | "end" | "between" | "around";

export type Direction = "row" | "col";

/**
 * Base props every component accepts.
 *
 * `className` is deliberately absent: it appeared at 7 call sites fleet-wide
 * against 302 for `class` on Button alone, so carrying both bought nothing
 * but a coin flip at the call site.
 */
export interface UIBaseProps {
  dataTheme?: string;
  class?: string;
  style?: JSX.CSSProperties;
}

/** Icon slots. Never `leftIcon`/`rightIcon`; Input shipped both, 20 sites against 13. */
export interface IconSlotProps {
  startIcon?: JSX.Element;
  endIcon?: JSX.Element;
}

/**
 * The controlled/uncontrolled triple, in one shape.
 *
 * `onChange` receives the value, not the event. Modal carried three competing
 * pairs for this (`open`/`isOpen`, `onClose`/`onOpenChange`,
 * `closeOnEsc`/`shouldCloseOnEsc`) across ten total call sites.
 */
export interface Controlled<T> {
  value?: T;
  defaultValue?: T;
  onChange?: (value: T) => void;
}

export interface Disclosable {
  isOpen?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

/**
 * Condition flags. All booleans are `is*`.
 *
 * Deliberately not called `State`: these are interaction conditions, while
 * `State` above is what the thing means. A button can be `state="danger"`
 * and `isDisabled` at once.
 */
export interface FlagProps {
  isDisabled?: boolean;
  isInvalid?: boolean;
  isRequired?: boolean;
  isReadOnly?: boolean;
  isLoading?: boolean;
}

export const STATES: readonly State[] = [
  "neutral", "primary", "secondary", "accent", "success", "warning", "danger", "info",
] as const;

export const VARIANTS: readonly Variant[] = [
  "solid", "soft", "outline", "ghost", "plain",
] as const;

export const SIZES: readonly Size[] = ["xs", "sm", "md", "lg", "xl"] as const;

export const SPACES: readonly Space[] = ["none", "xs", "sm", "md", "lg", "xl"] as const;
