import {
  type JSX,
  splitProps,
  createMemo,
  children as resolveChildren,
} from "solid-js";
import { twMerge } from "tailwind-merge";
import type { IComponentBaseProps } from "../types";
import { CLASSES } from "./Navbar.classes";

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
      CLASSES.Stack.base,
      local.sticky && CLASSES.Stack.flag.sticky,
      local.container && CLASSES.Stack.flag.container,
      local.class,
      local.className,
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
