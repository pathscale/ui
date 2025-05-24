import { type JSX, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";

import type { IComponentBaseProps, ComponentSize } from "../types";
import MenuTitle from "./MenuTitle";
import type { MenuTitleProps } from "./MenuTitle";
import MenuItem from "./MenuItem";
import type { MenuItemProps } from "./MenuItem";
import MenuDropdown from "./MenuDropdown";
import type { MenuDropdownProps } from "./MenuDropdown";
import MenuDetails from "./MenuDetails";
import type { MenuDetailsProps } from "./MenuDetails";

export type {
  MenuTitleProps,
  MenuItemProps,
  MenuDropdownProps,
  MenuDetailsProps,
};
export type MenuProps = JSX.HTMLAttributes<HTMLUListElement> &
  IComponentBaseProps & {
    vertical?: boolean; // Vertical menu (default)
    horizontal?: boolean; // Horizontal menu
    responsive?: boolean;
    size?: ComponentSize;
  };

const Menu = (props: MenuProps): JSX.Element => {
  const [local, others] = splitProps(props, [
    "responsive",
    "horizontal",
    "vertical",
    "size",
    "class",
    "className",
    "dataTheme",
  ]);

  const classes = () =>
    twMerge(
      "menu",
      local.class,
      local.className,
      clsx({
        "menu-vertical lg:menu-horizontal": local.responsive,
        "menu-xl": local.size === "xl",
        "menu-lg": local.size === "lg",
        "menu-md": local.size === "md",
        "menu-sm": local.size === "sm",
        "menu-xs": local.size === "xs",
        "menu-vertical": local.vertical,
        "menu-horizontal": local.horizontal,
      })
    );

  return (
    <ul
      role="menu"
      data-theme={local.dataTheme}
      class={classes()}
      {...others}
    />
  );
};

export default Object.assign(Menu, {
  Title: MenuTitle,
  Item: MenuItem,
  Dropdown: MenuDropdown,
  Details: MenuDetails,
  Menu: Menu,
});
