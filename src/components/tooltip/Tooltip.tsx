import { splitProps, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";

import type {
  ComponentColor,
  ComponentPosition,
  IComponentBaseProps,
} from "../types";

type TooltipBaseProps = {
  message: string;
  open?: boolean;
  color?: ComponentColor;
  position?: ComponentPosition;
  dataTheme?: string;
  class?: string;
  className?: string;
  style?: JSX.CSSProperties;
};

export type TooltipProps = TooltipBaseProps &
  IComponentBaseProps &
  Omit<JSX.HTMLAttributes<HTMLDivElement>, keyof TooltipBaseProps>;

const Tooltip = (props: TooltipProps): JSX.Element => {
  const [local, others] = splitProps(props, [
    "message",
    "open",
    "color",
    "position",
    "dataTheme",
    "class",
    "className",
    "style",
  ]);

  const classes = () =>
    twMerge(
      "tooltip",
      "[&::before]:!z-[9999]",
      "[&::after]:!z-[9999]",
      local.class,
      local.className,
      clsx({
        "tooltip-open": local.open,
        "tooltip-primary": local.color === "primary",
        "tooltip-secondary": local.color === "secondary",
        "tooltip-accent": local.color === "accent",
        "tooltip-info": local.color === "info",
        "tooltip-success": local.color === "success",
        "tooltip-warning": local.color === "warning",
        "tooltip-error": local.color === "error",
        "tooltip-top": local.position === "top",
        "tooltip-bottom": local.position === "bottom",
        "tooltip-left": local.position === "left",
        "tooltip-right": local.position === "right",
      }),
    );

  return (
    <div
      {...others}
      role="tooltip"
      data-theme={local.dataTheme}
      data-tip={local.message}
      class={classes()}
      style={local.style}
    >
      {props.children}
    </div>
  );
};

export default Tooltip;
