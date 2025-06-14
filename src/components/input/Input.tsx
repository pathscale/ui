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

  const colorFocusMap: Record<string, string> = {
    primary: "focus-within:border-primary",
    success: "focus-within:border-success",
    warning: "focus-within:border-warning",
    error: "focus-within:border-error",
    info: "focus-within:border-info",
    default: "focus-within:border-base-content",
  };

  const labelClasses = () =>
    twMerge(
      "input input-bordered w-full items-center gap-2 focus-within:outline-none",
      colorFocusMap[local.color || "default"],
      local.class,
      local.className
    );

  const inputClasses = () => "grow bg-transparent focus:outline-none";

  return (
    <label class={labelClasses()} data-theme={local.dataTheme}>
      <Show when={local.leftIcon}>{local.leftIcon}</Show>
      <input
        {...others}
        type={inputType()}
        aria-label={local["aria-label"]}
        aria-describedby={local["aria-describedby"]}
        aria-invalid={local["aria-invalid"]}
        aria-required={local["aria-required"]}
        placeholder={local["placeholder"]}
        style={local.style}
        class={inputClasses()}
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
