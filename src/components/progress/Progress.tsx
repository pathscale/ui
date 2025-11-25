import clsx from "clsx";
import type { JSX } from "solid-js";
import { splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";
import type { ComponentColor, IComponentBaseProps } from "../types";

export type ProgressProps = Omit<
  JSX.ProgressHTMLAttributes<HTMLProgressElement>,
  "color"
> &
  IComponentBaseProps & {
    color?: ComponentColor;
    // ARIA attributes
    "aria-label"?: string;
    "aria-describedby"?: string;
    "aria-valuenow"?: number;
    "aria-valuemin"?: number;
    "aria-valuemax"?: number;
    "aria-valuetext"?: string;
    "aria-labelledby"?: string;
  };

const Progress = (props: ProgressProps) => {
  const [local, others] = splitProps(props, [
    "color",
    "class",
    "className",
    "dataTheme",
    "aria-label",
    "aria-describedby",
    "aria-valuenow",
    "aria-valuemin",
    "aria-valuemax",
    "aria-valuetext",
    "aria-labelledby",
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
    local.className,
  );

  // Helper to get proper aria-valuenow value
  const getAriaValueNow = (): number | string | undefined => {
    if (local["aria-valuenow"] !== undefined) {
      return local["aria-valuenow"];
    }
    const value = others.value;
    if (typeof value === "number" || typeof value === "string") {
      return value;
    }
    return undefined;
  };

  return (
    <progress
      {...others}
      class={classes}
      data-theme={local.dataTheme}
      role="progressbar"
      aria-label={local["aria-label"]}
      aria-describedby={local["aria-describedby"]}
      aria-valuenow={getAriaValueNow()}
      aria-valuemin={local["aria-valuemin"] || 0}
      aria-valuemax={local["aria-valuemax"] || others.max || 100}
      aria-valuetext={local["aria-valuetext"]}
      aria-labelledby={local["aria-labelledby"]}
    />
  );
};

export default Progress;
