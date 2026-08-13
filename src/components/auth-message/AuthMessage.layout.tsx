import "./AuthMessage.css";
import { Show, type JSX } from "solid-js";
import Callout from "../callout";
import type { State, UIBaseProps } from "../vocabulary";
import type { Layout } from "../../lib/layouts";
import { authMessage } from "./AuthMessage.recipe";

/* -------------------------------------------------------------------------------------------------
 * Types
 * -----------------------------------------------------------------------------------------------*/
export type AuthMessageProps = UIBaseProps & {
  message?: JSX.Element | string | null;
  state?: State;
};

/* -------------------------------------------------------------------------------------------------
 * AuthMessage
 *
 * Replaces AuthErrorMessage and AuthSuccessMessage, which were the same markup
 * with a different state baked into the component name. Callout already picks
 * the right ARIA role from the state, so danger and warning interrupt while
 * success and info do not.
 * -----------------------------------------------------------------------------------------------*/
export const AuthMessageLayout: Layout<typeof authMessage, AuthMessageProps> = () => (
  <Show when={local.message != null && local.message !== ""}>
    <Callout {...slot.root} state={local.state ?? "danger"}>
      {local.message}
    </Callout>
  </Show>
);
