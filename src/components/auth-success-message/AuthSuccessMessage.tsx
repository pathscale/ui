import { Show, splitProps, type Component, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";
import Alert from "../alert";
import type { IComponentBaseProps } from "../types";

export type AuthSuccessMessageProps = IComponentBaseProps & {
  message?: JSX.Element | string | null;
};

const AuthSuccessMessage: Component<AuthSuccessMessageProps> = (props) => {
  const [local, others] = splitProps(props, ["message", "class", "className", "dataTheme"]);

  return (
    <Show when={local.message != null && local.message !== ""}>
      <Alert
        {...others}
        status="success"
        {...{ class: twMerge("text-sm", local.class, local.className) }}
        data-theme={local.dataTheme}
        data-slot="auth-success-message"
        role="status"
        aria-live="polite"
      >
        {local.message}
      </Alert>
    </Show>
  );
};

export default AuthSuccessMessage;
