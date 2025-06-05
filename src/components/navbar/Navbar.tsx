import { type JSX, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";
import { twMerge } from "tailwind-merge";
import NavbarSection from "./NavbarSection";
import NavbarStack from "./NavbarStack";
import NavbarRow from "./NavbarRow";
import type { IComponentBaseProps } from "../types";

export type NavbarProps = JSX.HTMLAttributes<HTMLElement> &
  IComponentBaseProps & {
    as?: keyof JSX.IntrinsicElements;
    dataTheme?: string;
    className?: string;
  };

const Navbar = (props: NavbarProps): JSX.Element => {
  const [local, others] = splitProps(props, [
    "as",
    "class",
    "className",
    "style",
    "children",
    "dataTheme",
  ]);

  const Tag = (local.as || "div") as keyof JSX.IntrinsicElements;
  const classes = () => twMerge("navbar", local.class, local.className);

  return (
    <Dynamic
      component={Tag}
      role="navigation"
      aria-label="Navbar"
      {...others}
      data-theme={local.dataTheme}
      class={classes()}
      style={local.style}
    >
      {local.children}
    </Dynamic>
  );
};

const NavbarStart = (
  props: JSX.HTMLAttributes<HTMLDivElement>
): JSX.Element => <NavbarSection section="start" {...props} />;

const NavbarCenter = (
  props: JSX.HTMLAttributes<HTMLDivElement>
): JSX.Element => <NavbarSection section="center" {...props} />;

const NavbarEnd = (props: JSX.HTMLAttributes<HTMLDivElement>): JSX.Element => (
  <NavbarSection section="end" {...props} />
);

export default Object.assign(Navbar, {
  Start: NavbarStart,
  Center: NavbarCenter,
  End: NavbarEnd,
  Stack: NavbarStack,
  Row: NavbarRow,
});
