import "./AuthForm.css";
import type { JSX } from "solid-js";
import type { IComponentBaseProps } from "../types";
import type { Layout } from "../../lib/layouts";
import { authForm } from "./AuthForm.recipe";

/* -------------------------------------------------------------------------------------------------
 * Types
 * -----------------------------------------------------------------------------------------------*/
export type AuthFormProps = Omit<JSX.FormHTMLAttributes<HTMLFormElement>, "onSubmit" | "children"> &
  IComponentBaseProps & {
    children: JSX.Element;
    onSubmit?: (event: SubmitEvent) => void | Promise<void>;
    ariaLabel?: string;
  };

/* -------------------------------------------------------------------------------------------------
 * AuthForm
 * -----------------------------------------------------------------------------------------------*/
export const AuthFormLayout: Layout<typeof authForm, AuthFormProps> = () => {
  const handleSubmit: JSX.EventHandlerUnion<HTMLFormElement, SubmitEvent> = (event) => {
    void local.onSubmit?.(event as SubmitEvent);
  };

  return (
    <form {...slot.root} aria-label={local.ariaLabel} onSubmit={handleSubmit}>
      {children}
    </form>
  );
};
