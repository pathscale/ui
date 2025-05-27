import type { JSX } from "solid-js";
import { splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";
import { IComponentBaseProps } from "../types";
import {
  DockItemProps as ItemProps
  // DockLabelProps as LabelProps,
} from "./DockItem";
import { dockClass } from "./Dock.styles";

export type DockItemProps = ItemProps;
// export type DockLabelProps = LabelProps;

type DockSize = "xs" | "sm" | "md" | "lg";

export type DockProps = JSX.HTMLAttributes<HTMLDivElement> &
  IComponentBaseProps & {
    size?: DockSize;
    position?: "top" | "bottom" | "left" | "right";
    variant?: "default" | "floating" | "minimal";
    spacing?: "compact" | "normal" | "relaxed";
  };

const Dock = (props: DockProps): JSX.Element => {
  const [local, others] = splitProps(props, [
    "size",
    "position",
    "variant",
    "spacing",
    "dataTheme",
    "class",
    "className",
    "children",
  ]);

  const classes = twMerge(
    dockClass({
      size: local.size,
      position: local.position,
      variant: local.variant,
    }),
    local.class,
    local.className
  );

  return (
    <div
      {...others}
      role="navigation"
      data-theme={local.dataTheme}
      class={classes}
    >
      {local.children}
    </div>
  );
};

export default Dock;
