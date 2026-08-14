import {
  type JSX,
  splitProps,
  createMemo,
  children as resolveChildren,
} from "solid-js";
import { twMerge } from "tailwind-merge";
import type { UIBaseProps } from "../vocabulary";
import { CLASSES } from "./Navbar.recipe";
import type { Layout } from "../../lib/layouts";
import { componentRecipe } from "./Navbar.recipe";

export type NavbarStackProps = JSX.HTMLAttributes<HTMLDivElement> &
  UIBaseProps & {
    sticky?: boolean;
    container?: boolean;
    dataTheme?: string;
  };

const NavbarStack: Layout<typeof componentRecipe, NavbarStackProps> = () => {
  const [local, others] = splitProps(props, [
    "children",
    "sticky",
    "container",
    "class",
    "style",
    "dataTheme",
  ]);

  const resolvedChildren = resolveChildren(() => local.children);

  const classes = createMemo(() =>
    twMerge(
      CLASSES.stack.base,
      local.sticky && CLASSES.stack.flag.sticky,
      local.container && CLASSES.stack.flag.container,
      local.class,
    ),
  );

  return (
    <div
      {...{ class: classes() }}
      style={local.style}
      data-theme={local.dataTheme}
      {...others}
    >
      {resolvedChildren()}
    </div>
  );
};

export default NavbarStack;
