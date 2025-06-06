import {
  type JSX,
  splitProps,
  children as resolveChildren,
  createMemo,
} from "solid-js";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";

import type { IComponentBaseProps } from "../types";

type SidenavItemBaseProps = {
  active?: boolean;
};

export type SidenavItemProps = JSX.HTMLAttributes<HTMLLIElement> &
  SidenavItemBaseProps &
  IComponentBaseProps;

const SidenavItem = (props: SidenavItemProps): JSX.Element => {
  const [local, others] = splitProps(props, [
    "children",
    "active",
    "class",
    "className",
    "dataTheme",
    "style",
  ]);

  const resolvedChildren = resolveChildren(() => local.children);

  const classes = createMemo(() => {
    return twMerge(
      "sidenav-item",
      local.class,
      local.className,
      clsx({
        "sidenav-item-active": local.active,
      })
    );
  });

  return (
    <li
      {...others}
      class={classes()}
      data-theme={local.dataTheme}
      style={local.style}
    >
      {resolvedChildren()}
    </li>
  );
};

export default SidenavItem;
