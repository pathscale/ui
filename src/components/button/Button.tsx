import "./Button.css";
import { Show, splitProps, useContext, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";
import { ButtonGroupContext } from "../button-group/context";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "tertiary"
  | "outline"
  | "ghost"
  | "danger"
  | "danger-soft";

type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, "disabled"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isIconOnly?: boolean;
  fullWidth?: boolean;
  isDisabled?: boolean;
  isPending?: boolean;
  className?: string;
};

const VARIANT_CLASS_MAP: Record<ButtonVariant, string> = {
  primary: "button--primary",
  secondary: "button--secondary",
  tertiary: "button--tertiary",
  outline: "button--outline",
  ghost: "button--ghost",
  danger: "button--danger",
  "danger-soft": "button--danger-soft",
};

const SIZE_CLASS_MAP: Record<ButtonSize, string> = {
  sm: "button--sm",
  md: "button--md",
  lg: "button--lg",
};

const Button = (props: ButtonProps): JSX.Element => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "variant",
    "size",
    "isIconOnly",
    "fullWidth",
    "isDisabled",
    "isPending",
    "type",
  ]);

  const buttonGroupContext = useContext(ButtonGroupContext);

  const variant = () => local.variant ?? buttonGroupContext?.variant() ?? "primary";
  const size = () => local.size ?? buttonGroupContext?.size() ?? "md";
  const fullWidth = () => local.fullWidth ?? buttonGroupContext?.fullWidth();
  const disabled = () =>
    Boolean(local.isDisabled ?? buttonGroupContext?.isDisabled()) || Boolean(local.isPending);

  const classes = () =>
    twMerge(
      "button",
      VARIANT_CLASS_MAP[variant()],
      SIZE_CLASS_MAP[size()],
      local.isIconOnly && "button--icon-only",
      fullWidth() && "button--full-width",
      local.class,
      local.className,
    );

  return (
    <button
      {...others}
      type={local.type ?? "button"}
      class={classes()}
      data-slot="button"
      data-pending={local.isPending ? "true" : "false"}
      disabled={disabled()}
      aria-disabled={disabled() ? "true" : "false"}
    >
      <Show when={local.isPending}>
        <span class="button__spinner" data-slot="spinner" aria-hidden="true" />
      </Show>
      {local.children}
    </button>
  );
};

export default Button;

export type { ButtonProps, ButtonVariant, ButtonSize };
