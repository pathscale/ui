import "./Button.css";
import { Dynamic, type JSX } from "@solidjs/web";
import { Show } from "solid-js";
import type { Layout } from "../../lib/layouts";
import type {
  Flavor,
  IconSlotProps,
  Radius,
  Size,
  State,
  UIBaseProps,
  Variant,
  Width,
} from "../vocabulary";
import { buttonElement, buttonHref, buttonRel } from "./Button.interactions";
import type { button } from "./Button.recipe";

/* -------------------------------------------------------------------------------------------------
 * Types
 * -----------------------------------------------------------------------------------------------*/
export type ButtonProps = Omit<
  JSX.ButtonHTMLAttributes<HTMLButtonElement>,
  "color" | "type"
> &
  UIBaseProps &
  IconSlotProps & {
    variant?: Variant;
    flavor?: Flavor;
    state?: State;
    size?: Size;
    /** `square` is icon-only: as wide as it is tall, at whatever size it is. */
    width?: Width | "square";
    radius?: Radius;
    type?: "button" | "submit" | "reset";
    /**
     * Renders an anchor instead of a button, and navigates.
     *
     * A link that looks like a button is the single most common thing every
     * app in the fleet was reaching outside the library for, because `Button`
     * was a `<button>` and `Link`'s variants are underline treatments rather
     * than fills. Both spellings existed and neither was this one, so call
     * sites wrote the raw classes instead.
     *
     * It is a real anchor: middle-click, right-click, open-in-new-tab and
     * "copy link address" all work, which is exactly what a `<button>` with an
     * onClick handler takes away.
     */
    href?: string;
    target?: JSX.AnchorHTMLAttributes<HTMLAnchorElement>["target"];
    rel?: string;
    children?: JSX.Element;
  };

/* -------------------------------------------------------------------------------------------------
 * Button
 *
 * `type` defaults to "button". A bare <button> inside a <form> submits it,
 * which is almost never what a call site that omitted the attribute meant.
 *
 * Loading implies disabled: a button mid-request must not accept a second
 * click, and every app in the fleet was pairing the two by hand. It stays one
 * prop rather than two, because `isLoading` and `isDisabled` could disagree and
 * `state` cannot.
 *
 * The native `disabled` attribute still works and still wins, so a form control
 * that has always spelled it that way does not have to change.
 * -----------------------------------------------------------------------------------------------*/
export const ButtonLayout: Layout<typeof button, ButtonProps> = () => {
  const loading = () => local.state === "loading";
  const inert = () =>
    loading() || local.state === "disabled" || Boolean(local.disabled);
  const element = () => buttonElement(local.href);

  /*
   * An inert link drops its `href` rather than keeping it and refusing the
   * click. There is no `disabled` on an anchor, and an anchor that still has a
   * destination is still focusable, still activatable by Enter, and still
   * offers "open in new tab" from the context menu. Removing the attribute is
   * what actually makes it inert; `aria-disabled` is how it is announced.
   *
   * `rel` is filled in for `target="_blank"` unless the caller said otherwise:
   * a new tab without `noopener` hands the opener to the destination.
   */
  return (
    <Dynamic
      component={element()}
      {...slot.root}
      type={element() === "a" ? undefined : (local.type ?? "button")}
      href={buttonHref(local.href, inert())}
      target={element() === "a" ? local.target : undefined}
      rel={element() === "a" ? buttonRel(local.rel, local.target) : undefined}
      disabled={element() === "a" ? undefined : inert()}
      aria-disabled={inert() ? "true" : "false"}
      aria-busy={loading() ? "true" : undefined}
      data-state={local.state ?? "default"}
      data-flavor={local.flavor ?? "primary"}
    >
      <Show when={loading()}>
        <span
          {...slot.spinner}
          aria-hidden="true"
        />
      </Show>
      <Show when={local.startIcon}>
        <span {...slot.startIcon}>{local.startIcon}</span>
      </Show>
      {children}
      <Show when={local.endIcon}>
        <span {...slot.endIcon}>{local.endIcon}</span>
      </Show>
    </Dynamic>
  );
};
