import "./Header.css";
import type { JSX } from "@solidjs/web";
import {omit, type Component} from "solid-js";
import { twMerge } from "../../lib/twMerge";

import type { UIBaseProps } from "../vocabulary";
import { CLASSES } from "./Header.recipe";
import type { Layout } from "../../lib/layouts";
import { componentRecipe } from "./Header.recipe";

export type HeaderRootProps = JSX.HTMLAttributes<HTMLDivElement> & UIBaseProps;

const HeaderRoot: Layout<typeof componentRecipe, HeaderRootProps> = () => {
  const others = omit(props, "children", "class", "dataTheme", "style");

  return (
    <div
      {...others}
      {...{ class: twMerge(CLASSES.base, props.class) }}
      data-slot="header"
      data-theme={props.dataTheme}
      style={props.style}
    >
      {props.children}
    </div>
  );
};

const Header = HeaderRoot;

export default Header;
export { Header, HeaderRoot };
export type { HeaderRootProps as HeaderProps };
