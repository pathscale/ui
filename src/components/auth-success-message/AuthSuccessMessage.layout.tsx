import "./AuthSuccessMessage.css";
import { Show, type JSX } from "solid-js";
import Alert from "../alert";
import type { IComponentBaseProps } from "../types";
import type { Layout } from "../../lib/layouts";
import { authSuccessMessage } from "./AuthSuccessMessage.recipe";

/* -------------------------------------------------------------------------------------------------
 * Types
 * -----------------------------------------------------------------------------------------------*/
export type AuthSuccessMessageProps = IComponentBaseProps & {
  message?: JSX.Element | string | null;
};

/* -------------------------------------------------------------------------------------------------
 * AuthSuccessMessage
 * -----------------------------------------------------------------------------------------------*/
export const AuthSuccessMessageLayout: Layout<
  typeof authSuccessMessage,
  AuthSuccessMessageProps
> = () => (
  <Show when={local.message != null && local.message !== ""}>
    <Alert {...slot.root} status="success" role="status" aria-live="polite">
      {local.message}
    </Alert>
  </Show>
);
