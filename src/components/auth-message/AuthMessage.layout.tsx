import "./AuthMessage.css";
import type { JSX } from "@solidjs/web";
import {Show} from "solid-js";
import Alert from "../alert";
import type { Flavor, UIBaseProps } from "../vocabulary";
import type { Layout } from "../../lib/layouts";
import { authMessage } from "./AuthMessage.recipe";

/* -------------------------------------------------------------------------------------------------
 * Types
 * -----------------------------------------------------------------------------------------------*/
export type AuthMessageProps = UIBaseProps & {
  message?: JSX.Element | string | null;
  flavor?: Flavor;
};

/* -------------------------------------------------------------------------------------------------
 * AuthMessage
 *
 * Replaces AuthErrorMessage and AuthSuccessMessage, which were the same markup
 * with a different state baked into the component name. Alert already picks
 * the right ARIA role from the state, so danger and warning interrupt while
 * success and info do not.
 * -----------------------------------------------------------------------------------------------*/
export const AuthMessageLayout: Layout<typeof authMessage, AuthMessageProps> = () => (
  <Show when={local.message != null && local.message !== ""}>
    <Alert {...slot.root} flavor={local.flavor ?? "destructive"}>
      {local.message}
    </Alert>
  </Show>
);
