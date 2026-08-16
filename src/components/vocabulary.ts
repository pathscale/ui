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
 * They form a priority chain — hidden, disabled, loading, error, invalid,
 * default — which is what lets them share one prop.
 *
 * `error` and `invalid` are different failures and both are needed.
 * `invalid` means the value broke a rule we know about and the user can fix
 * it. `error` means something we do not understand went wrong: the options
 * never loaded, the stream dropped, the submit handler threw. The case that
 * forces the distinction is async validation that cannot reach the server —
 * the value is not invalid, its validity is *unknown*, and showing it red
 * saying "too short" would be a lie.
 *
 * `error` beats `invalid` for the same reason: if the validator could not
 * run, whatever `issues` still holds is stale and must not be trusted.
 *
 * `invalid` is **derived by default and settable when you need it**, which is
 * the same controlled/uncontrolled shape as `value` elsewhere in this
 * vocabulary: leave `state` alone and a field goes invalid because it has
 * error-severity issues; set it and yours wins.
 *
 * An earlier draft split this into a settable `State` and a rendered
 * `ResolvedState`. That was two types for one axis — the duplication this
 * release exists to remove — and it was asymmetric, since `data-state`
 * reported a value the prop would not accept.
 *
 * `hidden` pairs with `keepMounted`: with it, `display: none`; without it,
 * the content unmounts.
 */
export type State = "default" | "loading" | "error" | "invalid" | "disabled" | "hidden";

/** How much emphasis, and what shape. */
export type Variant = "solid" | "soft" | "outline" | "ghost" | "plain";

/**
 * What a surface is made of.
 *
 * Orthogonal to `variant`, which is how much emphasis it carries. A glass card
 * and a solid card can both be `outline`; the difference is whether the fill is
 * a colour or a blurred view of whatever is behind it.
 *
 * `glass` reads the `--glass-*` family, which `src/styles/glass.ts` derives
 * from three numbers. Every read carries a fallback, so a theme that sets none
 * of them still renders — an undefined custom property makes CSS drop the whole
 * declaration rather than fall back, which is how a partial set produced a card
 * with no background at all.
 *
 * Only surfaces that can hold content take this. A `Button` is not made of
 * anything: it is a control, and blurring what is behind a 32px pill reads as a
 * smudge rather than as material.
 */
export type Material = "solid" | "glass";

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
 * `onChange` receives the value, not the event. Dialog carried three competing
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
/**
 * Something went wrong that is not the user's fault.
 *
 * Distinct from validation on purpose: `onChange` carries a value the user
 * chose, this carries a thing that was thrown. A caller wants to retry, log or
 * surface a toast, none of which is what you do with a validation issue.
 */
export type ErrorHandler = (error: unknown, context?: { retry?: () => void }) => void;

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

/**
 * A rule shown to the user *before* they break it.
 *
 * The counterpart to `Issue`, and the same rule at a different moment. "At
 * least 8 characters" is a constraint while it is unmet and neutral, and an
 * issue only once the user has been given a fair chance to satisfy it.
 *
 * Constraints render live from the first keystroke, because ticking a
 * requirement off as you type is help, whereas "too short" flashed at you
 * mid-word is nagging.
 */
export interface Constraint {
  code: string;
  params?: Record<string, unknown>;
  label?: JSX.Element;
  /** Recomputed on every change. */
  satisfied: boolean;
}

/**
 * When issues become visible.
 *
 * The default is `touched`, which is the only timing that is not hostile:
 * say nothing while the user is first typing, surface issues when they leave
 * the field, and from then on revalidate on every keystroke so they can see
 * themselves fixing it. Reward early, punish late.
 *
 *   change   every keystroke, from the start. Rarely right; nags.
 *   blur     only on leaving the field. Misses the correction feedback.
 *   touched  blur, then live once the field has errored once. The default.
 *   submit   only when the form is submitted.
 */
export type ValidateOn = "change" | "blur" | "touched" | "submit";

export type Validate<T> = (value: T) => Issue[] | Promise<Issue[]>;

/**
 * The validation surface every input-capable component carries.
 *
 * `issues` is controlled: a parent form or a server response can put issues on
 * a field directly, and they merge with whatever `validate` produces. That is
 * what makes a server-side "these credentials do not match" land in the same
 * place as a client-side "too short", instead of in a separate banner.
 */
export interface Validatable<T> {
  validate?: Validate<T>;
  validateOn?: ValidateOn;
  /** Controlled issues — from a form, or from the server. Merged with `validate`. */
  issues?: Issue[];
  /** Live, positive requirements. Shown while unmet rather than after failure. */
  constraints?: Constraint[];
  showConstraints?: "always" | "focus" | "unsatisfied" | "never";
  /** Shorthand for a single issue. Sugar for `issues={[{ code: "custom", message }]}`. */
  errorMessage?: JSX.Element;
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
  "default", "loading", "error", "invalid", "disabled", "hidden",
] as const;

/**
 * Is this field invalid? Derived, never set.
 *
 * Warnings deliberately do not count: "weak password" colours the message
 * without reddening the field or blocking submission.
 */
export const isInvalid = (issues: Issue[] | undefined): boolean =>
  Boolean(issues?.some((i) => i.severity !== "warning"));

/**
 * Resolve what the component renders as, and write it to `data-state`.
 *
 * An explicit `state` always wins — a caller who says `disabled` means it,
 * even while issues exist, because you cannot fix what you cannot edit. With
 * nothing set, error-severity issues make it `invalid`.
 *
 * So "what state is an input with invalid input?" has one answer: `invalid`,
 * on the same prop and readable from `data-state`.
 */
export const resolveState = (state: State | undefined, issues?: Issue[]): State => {
  if (state) return state;
  return isInvalid(issues) ? "invalid" : "default";
};

/** Components that do async work expose this alongside `state="error"`. */
export interface Failable {
  onError?: ErrorHandler;
}

export const VARIANTS: readonly Variant[] = [
  "solid", "soft", "outline", "ghost", "plain",
] as const;

export const SIZES: readonly Size[] = ["xs", "sm", "md", "lg", "xl"] as const;

export const SPACES: readonly Space[] = ["none", "xs", "sm", "md", "lg", "xl"] as const;
