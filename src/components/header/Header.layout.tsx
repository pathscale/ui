import "./Header.css";
import type { JSX } from "@solidjs/web";
import { type Component, omit } from "solid-js";
import type { Layout } from "../../lib/layouts";
import { twMerge } from "../../lib/twMerge";
import type { UIBaseProps } from "../vocabulary";
import { CLASSES, type componentRecipe } from "./Header.recipe";

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
export type { HeaderRootProps as HeaderProps };
export { Header, HeaderRoot };
