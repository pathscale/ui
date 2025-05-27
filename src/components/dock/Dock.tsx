import type { JSX } from "solid-js";
import { splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";
import { IComponentBaseProps, ComponentSize } from "../types";
import DockItem, { type DockItemProps as ItemProps } from "./DockItem";
import DockLabel, { type DockLabelProps as LabelProps } from "./DockLabel";

export type DockItemProps = ItemProps;
export type DockLabelProps = LabelProps;

export type DockProps = JSX.HTMLAttributes<HTMLDivElement> &
  IComponentBaseProps & {
    size?: ComponentSize;
  };

const Dock = (props: DockProps): JSX.Element => {
  const [local, others] = splitProps(props, [
    "size",
    "dataTheme",
    "class",
    "className",
    "children",
  ]);

  const classes = twMerge(
    "dock",
    clsx({
      "dock-lg": local.size === "lg",
      "dock-md": local.size === "md",
      "dock-sm": local.size === "sm",
      "dock-xs": local.size === "xs",
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

export default Object.assign(Dock, {
  Item: DockItem,
  Label: DockLabel,
});
