import "./AuthErrorMessage.css";
import { Show, type JSX } from "solid-js";
import Alert from "../alert";
import type { IComponentBaseProps } from "../types";
import type { Layout } from "../../lib/layouts";
import { authErrorMessage } from "./AuthErrorMessage.recipe";

/* -------------------------------------------------------------------------------------------------
 * Types
 * -----------------------------------------------------------------------------------------------*/
export type AuthErrorMessageProps = IComponentBaseProps & {
  message?: JSX.Element | string | null;
};

/* -------------------------------------------------------------------------------------------------
 * AuthErrorMessage
 * -----------------------------------------------------------------------------------------------*/
export const AuthErrorMessageLayout: Layout<typeof authErrorMessage, AuthErrorMessageProps> = () => (
  <Show when={local.message != null && local.message !== ""}>
    <Alert {...slot.root} status="danger" role="alert">
      {local.message}
    </Alert>
  </Show>
);
