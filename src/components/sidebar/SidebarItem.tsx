import { JSX, splitProps, Show } from "solid-js";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";
import type { IComponentBaseProps } from "../types";

export interface NavItemProps extends IComponentBaseProps {
  icon?: JSX.Element;
  active?: boolean;
  disabled?: boolean;
  children?: JSX.Element;
  onClick?: () => void;
}

export const NavItem = (props: NavItemProps) => {
  const [local, rest] = splitProps(props, [
    "icon",
    "active",
    "disabled",
    "children",
    "class",
    "onClick",
  ]);

  const classes = twMerge(
    "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
    clsx({
      "bg-base-300 text-base-content font-medium": local.active,
      "text-base-content hover:bg-base-200": !local.active && !local.disabled,
      "opacity-50 pointer-events-none cursor-not-allowed": local.disabled,
    }),
    local.class
  );

  return (
    <button
      type="button"
      onClick={local.onClick}
      class={classes}
      disabled={local.disabled}
      {...rest}
    >
      <Show when={local.icon}>
        <span class="text-lg">{local.icon}</span>
      </Show>
      <span>{local.children}</span>
    </button>
  );
};

export default NavItem;
