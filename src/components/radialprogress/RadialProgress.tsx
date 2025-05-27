import type { JSX } from "solid-js";
import { splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";
import type { IComponentBaseProps, ComponentColor } from "../types";

export type RadialProgressProps = JSX.HTMLAttributes<HTMLDivElement> &
  IComponentBaseProps & {
    value: number;
    size?: string;
    thickness?: string;
    color?: ComponentColor;
  };

const RadialProgress = (props: RadialProgressProps): JSX.Element => {
  const [local, others] = splitProps(props, [
    "value",
    "size",
    "thickness",
    "color",
    "dataTheme",
    "class",
    "className",
    "children",
  ]);

  const displayedValue = Math.min(100, Math.max(0, local.value));

  const classes = twMerge(
    "radial-progress",
    clsx({
      "text-primary": local.color === "primary",
      "text-secondary": local.color === "secondary",
      "text-accent": local.color === "accent",
      "text-info": local.color === "info",
      "text-success": local.color === "success",
      "text-warning": local.color === "warning",
      "text-error": local.color === "error",
    }),
    local.class,
    local.className
  );

  const progressStyle: JSX.CSSProperties = {
    "--value": displayedValue,
    "--size": local.size ?? "4rem",
    "--thickness": local.thickness ?? "4px",
  };

  return (
    <div
      role="progressbar"
      aria-valuenow={displayedValue}
      aria-valuemin={0}
      aria-valuemax={100}
      data-theme={local.dataTheme}
      class={classes}
      style={progressStyle}
      {...others}
    >
      {local.children ?? `${displayedValue}%`}
    </div>
  );
};

export default RadialProgress;
