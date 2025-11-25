import { splitProps, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";
import type {
  IComponentBaseProps,
  ComponentSize,
  ComponentPosition,
} from "../types";

import Tab from "./Tab";
import RadioTab from "./RadioTab";

export type TabsProps = JSX.HTMLAttributes<HTMLDivElement> &
  IComponentBaseProps & {
    variant?: "bordered" | "lift" | "boxed";
    size?: ComponentSize;
    position?: Extract<ComponentPosition, "top" | "bottom">;
  };

const Tabs = (props: TabsProps): JSX.Element => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "variant",
    "size",
    "position",
  ]);

  const classes = () =>
    twMerge(
      "tabs",
      local.class,
      local.className,
      clsx({
        "tabs-boxed": local.variant === "boxed",
        "tabs-bordered": local.variant === "bordered",
        "tabs-lift": local.variant === "lift",
        "tabs-xl": local.size === "xl",
        "tabs-lg": local.size === "lg",
        "tabs-md": local.size === "md",
        "tabs-sm": local.size === "sm",
        "tabs-xs": local.size === "xs",
        "tabs-top": local.position === "top",
        "tabs-bottom": local.position === "bottom",
      }),
    );

  return (
    <div
      role="tablist"
      class={classes()}
      {...others}
    >
      {local.children}
    </div>
  );
};

export default Object.assign(Tabs, { Tab, RadioTab });
