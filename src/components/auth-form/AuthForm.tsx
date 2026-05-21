import { splitProps, type Component, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";
import type { IComponentBaseProps } from "../types";

export type AuthFormProps = Omit<JSX.FormHTMLAttributes<HTMLFormElement>, "onSubmit" | "children"> &
  IComponentBaseProps & {
    children: JSX.Element;
    onSubmit?: (event: SubmitEvent) => void | Promise<void>;
    ariaLabel?: string;
  };

const AuthForm: Component<AuthFormProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "onSubmit",
    "ariaLabel",
    "class",
    "className",
    "dataTheme",
  ]);

  const handleSubmit: JSX.EventHandlerUnion<HTMLFormElement, SubmitEvent> = (event) => {
    local.onSubmit?.(event as SubmitEvent);
  };

  return (
    <form
      {...others}
      {...{ class: twMerge("flex w-full flex-col gap-4", local.class, local.className) }}
      data-theme={local.dataTheme}
      data-slot="auth-form"
      aria-label={local.ariaLabel}
      onSubmit={handleSubmit}
    >
      {local.children}
    </form>
  );
};

export default AuthForm;
