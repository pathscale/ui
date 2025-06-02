import { type JSX, splitProps, children as resolveChildren } from "solid-js";
import { twMerge } from "tailwind-merge";

import type { IComponentBaseProps } from "../types";

export type SidenavMenuProps = JSX.HTMLAttributes<HTMLUListElement> &
  IComponentBaseProps;

const SidenavMenu = (props: SidenavMenuProps): JSX.Element => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "style",
  ]);

  const resolvedChildren = resolveChildren(() => local.children);
  const classes = twMerge("sidenav-menu", local.class, local.className);

  return (
    <ul
      {...others}
      class={classes}
      data-theme={local.dataTheme}
      style={local.style}
    >
      {resolvedChildren()}
    </ul>
  );
};

export default SidenavMenu;
