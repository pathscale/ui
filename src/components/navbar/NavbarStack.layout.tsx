import {omit, createMemo, children as resolveChildren} from "solid-js";
import type { JSX } from "@solidjs/web";
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
  const others = omit(props, "children", "sticky", "container", "class", "style", "dataTheme");

  const resolvedChildren = resolveChildren(() => props.children);

  const classes = createMemo(() =>
    twMerge(
      CLASSES.stack.base,
      props.sticky && CLASSES.stack.flag.sticky,
      props.container && CLASSES.stack.flag.container,
      props.class,
    ),
  );

  return (
    <div
      {...{ class: classes() }}
      style={props.style}
      data-theme={props.dataTheme}
      {...others}
    >
      {resolvedChildren()}
    </div>
  );
};

export default NavbarStack;
