import "./Navbar.css";
import { Dynamic, type JSX } from "@solidjs/web";
import { omit } from "solid-js";
import { twMerge } from "../../lib/twMerge";
import NavbarRow from "./NavbarRow.generated";
import NavbarSection from "./NavbarSection.generated";
import NavbarStack from "./NavbarStack.generated";
import "../_shared/material.css";
import type { Layout } from "../../lib/layouts";
import type { Material, UIBaseProps } from "../vocabulary";
import { CLASSES, type componentRecipe } from "./Navbar.recipe";

export type NavbarProps = JSX.HTMLAttributes<HTMLElement> &
  UIBaseProps & {
    as?: keyof JSX.IntrinsicElements;
    dataTheme?: string;
    /** What the bar is made of. `solid` by default. */
    material?: Material;
  };

const Navbar: Layout<typeof componentRecipe, NavbarProps> = () => {
  const others = omit(
    props,
    "as",
    "class",
    "style",
    "children",
    "dataTheme",
    "material",
  );

  const Tag = (props.as || "div") as keyof JSX.IntrinsicElements;
  const classes = () => twMerge(CLASSES.navbar.base, props.class);

  return (
    <Dynamic
      component={Tag}
      role="navigation"
      aria-label="Navbar"
      {...others}
      data-theme={props.dataTheme}
      data-material={props.material ?? "solid"}
      data-material-explicit={props.material ? "" : undefined}
      {...{ class: classes() }}
      style={props.style}
    >
      {props.children}
    </Dynamic>
  );
};

const NavbarStart: Layout<
  typeof componentRecipe,
  JSX.HTMLAttributes<HTMLDivElement>
> = () => (
  <NavbarSection
    section="start"
    {...props}
  />
);

const NavbarCenter: Layout<
  typeof componentRecipe,
  JSX.HTMLAttributes<HTMLDivElement>
> = () => (
  <NavbarSection
    section="center"
    {...props}
  />
);

const NavbarEnd: Layout<
  typeof componentRecipe,
  JSX.HTMLAttributes<HTMLDivElement>
> = () => (
  <NavbarSection
    section="end"
    {...props}
  />
);

export default Object.assign(Navbar, {
  Start: NavbarStart,
  Center: NavbarCenter,
  End: NavbarEnd,
  Stack: NavbarStack,
  Row: NavbarRow,
});
