import clsx from "clsx";
import { splitProps, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";

export type ComponentColor =
  | "primary"
  | "secondary"
  | "accent"
  | "info"
  | "success"
  | "warning"
  | "error";

export type ComponentSize = "xs" | "sm" | "md" | "lg" | "xl";

export type RadioProps = Omit<
  JSX.InputHTMLAttributes<HTMLInputElement>,
  "size"
> & {
  color?: ComponentColor;
  size?: ComponentSize;
  "data-theme"?: string;
  // ARIA attributes
  "aria-label"?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
  "aria-required"?: boolean;
  "aria-labelledby"?: string;
  "aria-checked"?: boolean;
};

const Radio = (props: RadioProps) => {
  const [local, rest] = splitProps(props, [
    "class",
    "color",
    "size",
    "name",
    "type",
    "data-theme",
    "aria-label",
    "aria-describedby",
    "aria-invalid",
    "aria-required",
    "aria-labelledby",
    "aria-checked",
  ]);

  const classes = twMerge(
    "radio",
    local.class,
    clsx({
      "radio-xs": local.size === "xs",
      "radio-sm": local.size === "sm",
      "radio-md": local.size === "md",
      "radio-lg": local.size === "lg",
      "radio-xl": local.size === "xl",
      "radio-primary": local.color === "primary",
      "radio-secondary": local.color === "secondary",
      "radio-accent": local.color === "accent",
      "radio-info": local.color === "info",
      "radio-success": local.color === "success",
      "radio-warning": local.color === "warning",
      "radio-error": local.color === "error",
    })
  );

  return (
    <input
      {...rest}
      name={local.name}
      type="radio"
      class={classes}
      data-theme={local["data-theme"]}
      aria-label={local["aria-label"]}
      aria-describedby={local["aria-describedby"]}
      aria-invalid={local["aria-invalid"]}
      aria-required={local["aria-required"]}
      aria-labelledby={local["aria-labelledby"]}
      aria-checked={local["aria-checked"]}
    />
  );
};

export default Radio;
