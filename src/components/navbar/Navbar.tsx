import { type JSX, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";

import type { IComponentBaseProps } from "../types";
import NavbarSection, { type NavbarSectionProps } from "./NavbarSection";
import { Dynamic } from "solid-js/web";

type ElementType = keyof JSX.IntrinsicElements;

type NavbarBaseProps = {
  as?: ElementType;
  class?: string;
  className?: string;
  style?: JSX.CSSProperties;
  "data-theme"?: string;
  children?: JSX.Element;
};

type PropsOf<E extends ElementType> = JSX.IntrinsicElements[E];

export type NavbarProps<E extends ElementType = "div"> = Omit<
  PropsOf<E>,
  keyof NavbarBaseProps
> &
  NavbarBaseProps &
  IComponentBaseProps;

const Navbar = <E extends ElementType = "div">(
  props: NavbarProps<E>
): JSX.Element => {
  const [local, others] = splitProps(props as NavbarBaseProps & Record<string, unknown>, [
    "as",
    "class",
    "className",
    "style",
    "children",
    "data-theme",
  ]);

  const Tag = (local.as || "div") as ElementType;
  const classes = () => twMerge("navbar", local.class, local.className);

  return (
    <Dynamic
      component={Tag}
      role="navigation"
      aria-label="Navbar"
      {...others}
      data-theme={local["data-theme"]}
      class={classes()}
      style={local.style}
    >
      {local.children}
    </Dynamic>
  );
};

const NavbarStart = (props: Omit<NavbarSectionProps, "section">): JSX.Element => (
  <NavbarSection {...props} section="start" />
);

const NavbarCenter = (props: Omit<NavbarSectionProps, "section">): JSX.Element => (
  <NavbarSection {...props} section="center" />
);

const NavbarEnd = (props: Omit<NavbarSectionProps, "section">): JSX.Element => (
  <NavbarSection {...props} section="end" />
);

export default Object.assign(Navbar, {
  Start: NavbarStart,
  Center: NavbarCenter,
  End: NavbarEnd,
  Navbar: Navbar,
});
