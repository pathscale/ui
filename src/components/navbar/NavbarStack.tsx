import {
  type JSX,
  type ParentProps,
  splitProps,
  createMemo,
  children as resolveChildren,
} from "solid-js";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";
import type { IComponentBaseProps } from "../types";
import NavbarRow from "./NavbarRow";

export type NavbarStackProps = JSX.HTMLAttributes<HTMLDivElement> &
  IComponentBaseProps & {
    sticky?: boolean;
    container?: boolean;
    className?: string;
    dataTheme?: string;
  };

const NavbarStack = (props: NavbarStackProps): JSX.Element => {
  const [local, others] = splitProps(props, [
    "children",
    "sticky",
    "container",
    "class",
    "className",
    "style",
    "dataTheme",
  ]);

  const resolvedChildren = resolveChildren(() => local.children);

  const classes = createMemo(() =>
    twMerge(
      "navbar-stack",
      local.class,
      local.className,
      clsx({
        "sticky top-0 z-30": local.sticky,
        "max-w-screen-xl mx-auto px-4": local.container,
      }),
    ),
  );

  return (
    <div
      class={classes()}
      style={local.style}
      data-theme={local.dataTheme}
      {...others}
    >
      {resolvedChildren()}
    </div>
  );
};

export default NavbarStack;
