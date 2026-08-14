import "./Button.css";
import { Show, type JSX } from "solid-js";
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
import type { Layout } from "../../lib/layouts";
import { button } from "./Button.recipe";

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
  const inert = () => loading() || local.state === "disabled" || Boolean(local.disabled);

  return (
    <button
      {...slot.root}
      type={local.type ?? "button"}
      disabled={inert()}
      aria-disabled={inert() ? "true" : "false"}
      aria-busy={loading() ? "true" : undefined}
      data-state={local.state ?? "default"}
      data-flavor={local.flavor ?? "primary"}
    >
      <Show when={loading()}>
        <span {...slot.spinner} aria-hidden="true" />
      </Show>
      <Show when={local.startIcon}>
        <span {...slot.startIcon}>{local.startIcon}</span>
      </Show>
      {children}
      <Show when={local.endIcon}>
        <span {...slot.endIcon}>{local.endIcon}</span>
      </Show>
    </button>
  );
};
