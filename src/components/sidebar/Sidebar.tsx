import { splitProps, JSX } from "solid-js";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import type { IComponentBaseProps } from "../types";
import Flex from "../flex";

export interface SidenavProps extends IComponentBaseProps {
  children?: JSX.Element;
  position?: "left" | "right";
  width?: string;
}

const Sidenav = (props: SidenavProps) => {
  const [local, rest] = splitProps(props, [
    "children",
    "class",
    "position",
    "width",
  ]);

  const classes = twMerge(
    "sticky top-0 h-screen border-base-300 p-4",
    clsx([
      local.position === "right" ? "border-l" : "border-r",
      local.position === "right" ? "order-last" : "order-first",
    ]),
    local.width ?? "w-48",
    local.class
  );

  return (
    <Flex direction="col" as="aside" class={classes} {...rest}>
      {local.children}
    </Flex>
  );
};

export default Sidenav;
