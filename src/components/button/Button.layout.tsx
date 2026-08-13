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
  "disabled" | "color" | "type"
> &
  UIBaseProps &
  IconSlotProps & {
    variant?: Variant;
    flavor?: Flavor;
    state?: State;
    size?: Size;
    width?: Width;
    radius?: Radius;
    isDisabled?: boolean;
    isLoading?: boolean;
    isIconOnly?: boolean;
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
 * click, and every app in the fleet was pairing the two by hand.
 * -----------------------------------------------------------------------------------------------*/
export const ButtonLayout: Layout<typeof button, ButtonProps> = () => {
  const isDisabled = () => Boolean(local.isDisabled) || Boolean(local.isLoading);

  return (
    <button
      {...slot.root}
      type={local.type ?? "button"}
      disabled={isDisabled()}
      aria-disabled={isDisabled() ? "true" : "false"}
      data-loading={local.isLoading ? "true" : "false"}
    >
      <Show when={local.isLoading}>
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
