import { Show, splitProps, type Component, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";
import Alert from "../alert";
import type { IComponentBaseProps } from "../types";

export type AuthErrorMessageProps = IComponentBaseProps & {
  message?: JSX.Element | string | null;
};

const AuthErrorMessage: Component<AuthErrorMessageProps> = (props) => {
  const [local, others] = splitProps(props, ["message", "class", "className", "dataTheme"]);

  return (
    <Show when={local.message != null && local.message !== ""}>
      <Alert
        {...others}
        status="danger"
        {...{ class: twMerge("text-sm", local.class, local.className) }}
        data-theme={local.dataTheme}
        data-slot="auth-error-message"
        role="alert"
      >
        {local.message}
      </Alert>
    </Show>
  );
};

export default AuthErrorMessage;
