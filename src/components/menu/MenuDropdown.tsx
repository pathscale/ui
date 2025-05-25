import { type JSX, splitProps, type Component } from "solid-js";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";

import type { IComponentBaseProps } from "../types";

export type MenuDropdownProps = JSX.HTMLAttributes<HTMLSpanElement> &
  IComponentBaseProps & {
    label: JSX.Element;
    open?: boolean;
    class?: string;
    className?: string;
    style?: JSX.CSSProperties;
    children?: JSX.Element;
    "data-theme"?: string;
  };

const MenuDropdown: Component<MenuDropdownProps> = (props) => {
  const [local, others] = splitProps(props, [
    "label",
    "open",
    "class",
    "className",
    "style",
    "children",
    "data-theme",
  ]);

  const spanClasses = () =>
    twMerge(
      "menu-dropdown-toggle",
      local.class,
      local.className,
      clsx({ "menu-dropdown-show": local.open })
    );

  const ulClasses = () =>
    clsx("menu-dropdown", { "menu-dropdown-show": local.open });

  return (
    <>
      <span
        {...others}
        class={spanClasses()}
        style={local.style}
        data-theme={local["data-theme"]}
      >
        {local.label}
      </span>
      <ul class={ulClasses()}>{local.children}</ul>
    </>
  );
};

export default MenuDropdown;
