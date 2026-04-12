import "./Header.css";
import { splitProps, type Component, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";

import type { IComponentBaseProps } from "../types";
import { CLASSES } from "./Header.classes";

export type HeaderRootProps = JSX.HTMLAttributes<HTMLDivElement> & IComponentBaseProps;

const HeaderRoot: Component<HeaderRootProps> = (props) => {
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
      class={twMerge(CLASSES.base, local.class, local.className)}
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
