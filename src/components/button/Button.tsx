import "./Button.css";
import { Show, splitProps, useContext, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";
import { ButtonGroupContext } from "../button-group/context";
import { CLASSES } from "./Button.classes";

export type ButtonVariant = keyof typeof CLASSES.variant;
export type ButtonSize = keyof typeof CLASSES.size;

type ButtonProps = Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, "disabled"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isIconOnly?: boolean;
  fullWidth?: boolean;
  isDisabled?: boolean;
  isPending?: boolean;
  startIcon?: JSX.Element;
  endIcon?: JSX.Element;
  className?: string;
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
    "startIcon",
    "endIcon",
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
      CLASSES.base,
      CLASSES.variant[variant()],
      CLASSES.size[size()],
      local.isIconOnly && CLASSES.flag.isIconOnly,
      fullWidth() && CLASSES.flag.fullWidth,
      local.class,
      local.className,
    );

  return (
    <button
      {...others}
      type={local.type ?? "button"}
      {...{ class: classes() }}
      data-slot="button"
      data-pending={local.isPending ? "true" : "false"}
      disabled={disabled()}
      aria-disabled={disabled() ? "true" : "false"}
    >
      <Show when={local.isPending}>
        <span {...{ class: CLASSES.slot.spinner }} data-slot="spinner" aria-hidden="true" />
      </Show>
      <Show when={local.startIcon}>
        <span {...{ class: twMerge(CLASSES.slot.icon, CLASSES.slot.iconStart) }} data-slot="button-start-icon">
          {local.startIcon}
        </span>
      </Show>
      {local.children}
      <Show when={local.endIcon}>
        <span {...{ class: twMerge(CLASSES.slot.icon, CLASSES.slot.iconEnd) }} data-slot="button-end-icon">
          {local.endIcon}
        </span>
      </Show>
    </button>
  );
};

export default Button;

export type { ButtonProps };
