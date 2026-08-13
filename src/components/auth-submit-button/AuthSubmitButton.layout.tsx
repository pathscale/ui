import "./AuthSubmitButton.css";
import type { JSX } from "solid-js";
import Button from "../button";
import type { IComponentBaseProps } from "../types";
import type { Layout } from "../../lib/layouts";
import { authSubmitButton } from "./AuthSubmitButton.recipe";

/* -------------------------------------------------------------------------------------------------
 * Types
 * -----------------------------------------------------------------------------------------------*/
export type AuthSubmitButtonVariant = "primary" | "secondary" | "ghost" | "danger";

export type AuthSubmitButtonProps = Omit<
  JSX.ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "disabled"
> &
  IComponentBaseProps & {
    children: JSX.Element;
    pending?: boolean;
    disabled?: boolean;
    variant?: AuthSubmitButtonVariant;
    fullWidth?: boolean;
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
    variant={local.variant ?? "primary"}
    fullWidth={local.fullWidth ?? true}
    isPending={Boolean(local.pending)}
    isDisabled={Boolean(local.disabled) || Boolean(local.pending)}
  >
    {children}
  </Button>
);
