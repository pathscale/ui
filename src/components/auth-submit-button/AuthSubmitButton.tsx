import { splitProps, type Component, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";
import Button from "../button";
import type { ButtonVariant } from "../button";
import type { IComponentBaseProps } from "../types";

export type AuthSubmitButtonProps = Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, "children" | "disabled"> &
  IComponentBaseProps & {
    children: JSX.Element;
    pending?: boolean;
    disabled?: boolean;
    variant?: "primary" | "secondary" | "ghost" | "danger";
    fullWidth?: boolean;
  };

const toButtonVariant = (variant: NonNullable<AuthSubmitButtonProps["variant"]>): ButtonVariant => {
  if (variant === "danger") return "danger";
  if (variant === "ghost") return "ghost";
  if (variant === "secondary") return "secondary";
  return "primary";
};

const AuthSubmitButton: Component<AuthSubmitButtonProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "pending",
    "disabled",
    "variant",
    "fullWidth",
    "class",
    "className",
    "dataTheme",
  ]);

  return (
    <Button
      {...others}
      type={others.type ?? "submit"}
      variant={toButtonVariant(local.variant ?? "primary")}
      fullWidth={local.fullWidth ?? true}
      isPending={Boolean(local.pending)}
      isDisabled={Boolean(local.disabled) || Boolean(local.pending)}
      {...{ class: twMerge(local.class, local.className) }}
      data-theme={local.dataTheme}
      data-slot="auth-submit-button"
    >
      {local.children}
    </Button>
  );
};

export default AuthSubmitButton;
