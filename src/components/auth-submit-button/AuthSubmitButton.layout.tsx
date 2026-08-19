import "./AuthSubmitButton.css";
import type { JSX } from "@solidjs/web";
import Button from "../button";
import type { Layout } from "../../lib/layouts";
import { authSubmitButton } from "./AuthSubmitButton.recipe";
import type { Flavor, Size, State, Variant, Width, UIBaseProps } from "../vocabulary";

/* -------------------------------------------------------------------------------------------------
 * Types
 * -----------------------------------------------------------------------------------------------*/
export type AuthSubmitButtonProps = Omit<
  JSX.ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "disabled" | "type"
> &
  UIBaseProps & {
    children: JSX.Element;
    type?: "button" | "submit" | "reset";
    variant?: Variant;
    flavor?: Flavor;
    state?: State;
    size?: Size;
    width?: Width;
  };

/* -------------------------------------------------------------------------------------------------
 * AuthSubmitButton
 *
 * The four accepted variants are named exactly as Button names them, so this
 * forwards rather than translating. Pending implies disabled: a submit button
 * that is spinning must not accept a second submission.
 * -----------------------------------------------------------------------------------------------*/
export const AuthSubmitButtonLayout: Layout<
  typeof authSubmitButton,
  AuthSubmitButtonProps
> = () => (
  <Button
    {...slot.root}
    type={local.type ?? "submit"}
    variant={local.variant ?? "solid"}
    flavor={local.flavor ?? "primary"}
    size={local.size}
    width={local.width ?? "full"}
    state={local.state ?? "default"}
  >
    {children}
  </Button>
);
