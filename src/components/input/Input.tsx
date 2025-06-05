import { clsx } from "clsx";
import { type JSX, Show, createMemo, createSignal, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";

import type {
  ComponentColor,
  ComponentSize,
  IComponentBaseProps,
} from "../types";

type InputBaseProps = {
  size?: ComponentSize;
  color?: ComponentColor;
  dataTheme?: string;
  class?: string;
  className?: string;
  style?: JSX.CSSProperties;
  rightIcon?: JSX.Element;
  leftIcon?: JSX.Element;
  placeholder?: string;
  // ARIA attributes
  "aria-label"?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
  "aria-required"?: boolean;
};

export type InputProps = InputBaseProps &
  IComponentBaseProps &
  Omit<JSX.InputHTMLAttributes<HTMLInputElement>, keyof InputBaseProps>;

const Input = (props: InputProps): JSX.Element => {
  const [local, others] = splitProps(props, [
    "size",
    "color",
    "dataTheme",
    "class",
    "className",
    "style",
    "leftIcon",
    "rightIcon",
    "placeholder",
    "type",
    "aria-label",
    "aria-describedby",
    "aria-invalid",
    "aria-required",
  ]);
  const [passwordVisible, setPasswordVisible] = createSignal(false);
  const inputType = createMemo(() => {
    if (local.type === "password") {
      return passwordVisible() ? "text" : "password";
    }
    return local.type;
  });

  const classes = () =>
    twMerge(
      "input",
      local.class,
      local.className,
      clsx({
        "input-xl": local.size === "xl",
        "input-lg": local.size === "lg",
        "input-md": local.size === "md",
        "input-sm": local.size === "sm",
        "input-xs": local.size === "xs",
        "input-primary": local.color === "primary",
        "input-secondary": local.color === "secondary",
        "input-accent": local.color === "accent",
        "input-ghost": local.color === "ghost",
        "input-info": local.color === "info",
        "input-success": local.color === "success",
        "input-warning": local.color === "warning",
        "input-error": local.color === "error",
      })
    );

  return (
    <label class={classes()} style={local.style} data-theme={local.dataTheme}>
      <Show when={local.leftIcon}>{local.leftIcon}</Show>
      <input
        {...others}
        type={inputType()}
        aria-label={local["aria-label"]}
        aria-describedby={local["aria-describedby"]}
        aria-invalid={local["aria-invalid"]}
        aria-required={local["aria-required"]}
        placeholder={local["placeholder"]}
      />
      <Show when={local.rightIcon}>
        <span
          onClick={() => setPasswordVisible(!passwordVisible())}
          class={local.type === "password" ? "cursor-pointer" : ""}
          role={local.type === "password" ? "button" : undefined}
          aria-label={
            local.type === "password"
              ? passwordVisible()
                ? "Hide password"
                : "Show password"
              : undefined
          }
          tabIndex={local.type === "password" ? 0 : undefined}
        >
          {local.rightIcon}
        </span>
      </Show>
    </label>
  );
};

export default Input;
