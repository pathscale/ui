import "./AuthSubmitButton.css";
import type { JSX } from "solid-js";
import type { Size, Tone, Variant, Width } from "../vocabulary";
import Button from "../button";
import type { IComponentBaseProps } from "../types";
import type { Layout } from "../../lib/layouts";
import { authSubmitButton } from "./AuthSubmitButton.recipe";

/* -------------------------------------------------------------------------------------------------
 * Types
 * -----------------------------------------------------------------------------------------------*/
export type AuthSubmitButtonProps = Omit<
  JSX.ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "disabled" | "type"
> &
  IComponentBaseProps & {
    children: JSX.Element;
    isLoading?: boolean;
    isDisabled?: boolean;
    type?: "button" | "submit" | "reset";
    variant?: Variant;
    tone?: Tone;
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
    tone={local.tone ?? "primary"}
    size={local.size}
    width={local.width ?? "full"}
    isLoading={Boolean(local.isLoading)}
    isDisabled={Boolean(local.isDisabled)}
  >
    {children}
  </Button>
);
