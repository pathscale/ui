import { type JSX, splitProps, type Component } from "solid-js";
import { twMerge } from "tailwind-merge";

import type { IComponentBaseProps } from "../types";

export type MenuTitleProps = JSX.LiHTMLAttributes<HTMLLIElement> &
  IComponentBaseProps & {
    class?: string;
    className?: string;
  };

const MenuTitle: Component<MenuTitleProps> = (props) => {
  const [local, others] = splitProps(props, ["class", "className"]);

  const classes = () => twMerge("menu-title", local.class, local.className);

  return <li {...others} class={classes()} />;
};

export default MenuTitle;
