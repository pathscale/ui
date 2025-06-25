import { type JSX, splitProps, type Component, createMemo } from "solid-js";
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
  };

const MenuDropdown: Component<MenuDropdownProps> = (props): JSX.Element => {
  const [local, others] = splitProps(props, [
    "label",
    "open",
    "class",
    "className",
    "style",
    "children",
    "dataTheme",
  ]);

  const spanClasses = createMemo(() =>
    twMerge(
      "menu-dropdown-toggle",
      local.class,
      local.className,
      clsx({ "menu-dropdown-show": local.open })
    )
  );

  const ulClasses = createMemo(() =>
    clsx("menu-dropdown", { "menu-dropdown-show": local.open })
  );

  return (
    <>
      <span
        {...others}
        class={spanClasses()}
        style={local.style}
        data-theme={local.dataTheme}
      >
        {local.label}
      </span>
      <ul class={ulClasses()}>{local.children}</ul>
    </>
  );
};

export default MenuDropdown;
