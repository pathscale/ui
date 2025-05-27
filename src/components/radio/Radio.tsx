import { splitProps, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";

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
};

const Radio = (props: RadioProps) => {
  const [local, rest] = splitProps(props, [
    "class",
    "color",
    "size",
    "name",
    "type",
    "data-theme",
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
    />
  );
};

export default Radio;
