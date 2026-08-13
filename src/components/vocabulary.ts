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
 * A styling preference: a named look, resolved somewhere else.
 *
 * `primary` is not a state — nothing is ever "in the primary state" — it is a
 * choice about prominence and brand. That is why `state="primary"` had no
 * honest call site.
 *
 * Deliberately **open**. `color` was the obvious industry name and was
 * rejected for it: `color` promises a literal, and someone will eventually
 * write `color="#f00"` and be annoyed. `flavor` promises a name that resolves
 * elsewhere, so a theme can define `flavor="hip"` and style
 * `[data-flavor="hip"]` in its own stylesheet, with no library change.
 *
 * The built-ins are listed for autocomplete; `(string & {})` keeps that
 * working while still accepting anything.
 */
export type Flavor =
  | "neutral"
  | "primary"
  | "secondary"
  | "accent"
  | "destructive"
  | "success"
  | "warning"
  | "info"
  // eslint-disable-next-line @typescript-eslint/ban-types
  | (string & {});

/**
 * What is happening to this component right now.
 *
 * Transient, and one at a time. `isDisabled`, `isLoading`, `isInvalid` and
 * friends were a bag of booleans pretending to be independent dimensions —
 * nothing stopped `isLoading && isHidden`, which is not a thing a component
 * can be. A dialog is `loading`, then `hidden`, then it unmounts; that is one
 * lifecycle, so it is one prop.
 *
 * Closed on purpose. Which conditions a component can be in is the library's
 * to define; which *looks* exist is the theme's, and that is `Flavor`.
 *
 * `hidden` pairs with `keepMounted`: with it, `display: none`; without it,
 * the content unmounts.
 */
export type State = "default" | "loading" | "disabled" | "invalid" | "hidden";

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
/**
 * Why a value changed, or why a disclosure opened or closed.
 *
 * Optional and last, so `onOpenChange={(open) => …}` is unaffected. It exists
 * because the library already drew this distinction — Drawer shipped
 * `DrawerCloseReason` — and collapsing `onClose` into `onOpenChange(boolean)`
 * would have thrown it away. Whether a dialog closed by Escape or by a
 * backdrop click is exactly what a caller needs to decide whether to warn
 * about unsaved work.
 */
export type OpenChangeReason = "escape" | "backdrop" | "trigger" | "api" | "select" | "submit";
export type ChangeReason = "input" | "paste" | "clear" | "step" | "select" | "api";

/**
 * A validation result, not a validation message.
 *
 * `passwordRules.ts` had the right idea and the wrong shape: a structured
 * `key` beside a `message` hardcoded in English inside the library, so every
 * non-English app either showed English or rebuilt the result. And a single
 * message cannot say that a password is both too short and missing a digit.
 *
 * `code` is stable and translatable; `params` interpolate into it from i18n
 * context. "password too short" is `{ code: "too_small", params: { minimum: 8 } }`.
 *
 * `severity` exists because not every issue blocks submission: "weak" is a
 * warning, "too short" is an error, and a field can show both.
 *
 * Compatible with Standard Schema, which `createForm` already uses through
 * TanStack Form: its issues carry `message` and `path`, and Zod adds `code`.
 */
export interface Issue {
  code: string;
  params?: Record<string, unknown>;
  /** Skips the i18n lookup when supplied. */
  message?: JSX.Element;
  severity?: "error" | "warning";
  path?: (string | number)[];
}

export interface Controlled<T> {
  value?: T;
  defaultValue?: T;
  onChange?: (value: T, reason?: ChangeReason) => void;
}

export interface Disclosable {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, reason?: OpenChangeReason) => void;
}

/**
 * Capabilities, not conditions.
 *
 * What remains after the `is*` audit: these say what a component *can* do,
 * which is not something `state` can express. `required` and `readonly` are
 * deliberately absent — they are native HTML attributes and pass straight
 * through, which is what should have happened instead of inventing
 * `isRequired` and `isReadOnly`.
 */
export interface CapabilityProps {
  /** Can be activated by click or keyboard. */
  isInteractive?: boolean;
  /** Can be dismissed by the user. */
  isDismissable?: boolean;
  /** Keep content in the DOM when `state="hidden"` rather than unmounting. */
  keepMounted?: boolean;
}

/** The built-in flavors. A theme may define more; these are the ones the library styles. */
export const FLAVORS = [
  "neutral", "primary", "secondary", "accent",
  "destructive", "success", "warning", "info",
] as const;

export const STATES: readonly State[] = [
  "default", "loading", "disabled", "invalid", "hidden",
] as const;

export const VARIANTS: readonly Variant[] = [
  "solid", "soft", "outline", "ghost", "plain",
] as const;

export const SIZES: readonly Size[] = ["xs", "sm", "md", "lg", "xl"] as const;

export const SPACES: readonly Space[] = ["none", "xs", "sm", "md", "lg", "xl"] as const;
