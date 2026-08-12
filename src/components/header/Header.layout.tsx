import "./Header.css";
import { splitProps, type Component, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";

import type { IComponentBaseProps } from "../types";
import { CLASSES } from "./Header.recipe";
import type { Layout } from "../../lib/layouts";
import { componentRecipe } from "./Header.recipe";

export type HeaderRootProps = JSX.HTMLAttributes<HTMLDivElement> & IComponentBaseProps;

const HeaderRoot: Layout<typeof componentRecipe, HeaderRootProps> = () => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "style",
  ]);

  return (
    <div
      {...others}
      {...{ class: twMerge(CLASSES.base, local.class, local.className) }}
      data-slot="header"
      data-theme={local.dataTheme}
      style={local.style}
    >
      {local.children}
    </div>
  );
};

const Header = HeaderRoot;

export default Header;
export { Header, HeaderRoot };
export type { HeaderRootProps as HeaderProps };
