import "./Navbar.css";
import { type JSX, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";
import { twMerge } from "tailwind-merge";
import NavbarSection from "./NavbarSection.generated";
import NavbarStack from "./NavbarStack.generated";
import NavbarRow from "./NavbarRow.generated";
import type { UIBaseProps } from "../vocabulary";
import { CLASSES } from "./Navbar.recipe";
import type { Layout } from "../../lib/layouts";
import { componentRecipe } from "./Navbar.recipe";

export type NavbarProps = JSX.HTMLAttributes<HTMLElement> &
  UIBaseProps & {
    as?: keyof JSX.IntrinsicElements;
    dataTheme?: string;
  };

const Navbar: Layout<typeof componentRecipe, NavbarProps> = () => {
  const [local, others] = splitProps(props, [
    "as",
    "class",
    "style",
    "children",
    "dataTheme",
  ]);

  const Tag = (local.as || "div") as keyof JSX.IntrinsicElements;
  const classes = () => twMerge(CLASSES.navbar.base, local.class);

  return (
    <Dynamic
      component={Tag}
      role="navigation"
      aria-label="Navbar"
      {...others}
      data-theme={local.dataTheme}
      {...{ class: classes() }}
      style={local.style}
    >
      {local.children}
    </Dynamic>
  );
};

const NavbarStart: Layout<typeof componentRecipe, JSX.HTMLAttributes<HTMLDivElement>> = () => (
  <NavbarSection
    section="start"
    {...props}
  />
);

const NavbarCenter: Layout<typeof componentRecipe, JSX.HTMLAttributes<HTMLDivElement>> = () => (
  <NavbarSection
    section="center"
    {...props}
  />
);

const NavbarEnd: Layout<typeof componentRecipe, JSX.HTMLAttributes<HTMLDivElement>> = () => (
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
