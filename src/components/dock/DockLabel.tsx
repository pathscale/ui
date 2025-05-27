import type { JSX, Component } from "solid-js";
import { splitProps, useContext, createMemo } from "solid-js";
import { twMerge } from "tailwind-merge";
import { IComponentBaseProps, ComponentColor } from "../types";
import { DockContext } from "./DockContext";
import { dockLabelClass } from "./Dock.styles";

export type DockLabelProps = JSX.HTMLAttributes<HTMLSpanElement> &
  IComponentBaseProps & {
    position?: "top" | "bottom" | "left" | "right";
    color?: ComponentColor;
    size?: "xs" | "sm" | "md" | "lg";
    variant?: "default" | "tooltip" | "badge";
  };

const DockLabel: Component<DockLabelProps> = (props) => {
  const context = useContext(DockContext);

  const [local, others] = splitProps(props, [
    "position",
    "color",
    "size",
    "variant",
    "dataTheme",
    "class",
    "className",
    "children",
  ]);

  const labelColor = () => local.color || context?.color || "neutral";
  const labelSize = () => local.size || "md";

  const classes = createMemo(() =>
    twMerge(
      dockLabelClass({
        position: local.position,
        color: labelColor(),
        size: labelSize(),
        variant: local.variant,
      }),
      local.class,
      local.className
    )
  );

  const accessibilityProps = () => {
    if (local.variant === "tooltip") {
      return {
        role: "tooltip" as const,
        "aria-hidden": true,
      };
    }
    return {};
  };

  return (
    <span
      {...others}
      {...accessibilityProps()}
      data-theme={local.dataTheme}
      class={classes()}
    >
      {local.children}
    </span>
  );
};

export default DockLabel;
