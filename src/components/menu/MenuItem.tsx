import { type JSX, splitProps, type Component } from "solid-js";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";

import type { IComponentBaseProps } from "../types";

export type MenuItemProps = JSX.LiHTMLAttributes<HTMLLIElement> &
  IComponentBaseProps & {
    focus?: boolean;
    active?: boolean;
    disabled?: boolean;
  };

const MenuItem: Component<MenuItemProps> = (props) => {
  const [local, others] = splitProps(props, [
    "class",
    "className",
    "focus",
    "active",
    "disabled",
    "children",
    "style",
    "dataTheme",
  ]);

  const classes = () =>
    twMerge(
      local.class,
      local.className,
      clsx({
        "menu-focus": local.focus,
        "menu-active": local.active,
        "menu-disabled": local.disabled,
      })
    );

  return (
    <li
      role="menuitem"
      class={classes()}
      style={local.style}
      data-theme={local.dataTheme}
      {...others}
    >
      {local.children}
    </li>
  );
};

export default MenuItem;
