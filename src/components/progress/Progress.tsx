import type { JSX } from "solid-js";
import { splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";
import type { ComponentColor, IComponentBaseProps } from "../types";

export type ProgressProps = Omit<
  JSX.ProgressHTMLAttributes<HTMLProgressElement>,
  "color"
> &
  IComponentBaseProps & {
    color?: ComponentColor;
  };

const Progress = (props: ProgressProps) => {
  const [local, others] = splitProps(props, [
    "color",
    "class",
    "className",
    "dataTheme",
  ]);

  const classes = twMerge(
    "progress",
    clsx({
      "progress-primary": local.color === "primary",
      "progress-secondary": local.color === "secondary",
      "progress-accent": local.color === "accent",
      "progress-info": local.color === "info",
      "progress-success": local.color === "success",
      "progress-warning": local.color === "warning",
      "progress-error": local.color === "error",
      "progress-ghost": local.color === "ghost",
    }),
    local.class,
    local.className
  );

  return <progress {...others} class={classes} data-theme={local.dataTheme} />;
};

export default Progress;
