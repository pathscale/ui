import { type Component, splitProps, type JSX, useContext } from "solid-js";
import { Dynamic } from "solid-js/web";
import { NavbarContext } from "./NavbarContext";
import { navbarItemClass } from "./Navbar.styles";
import { classes, type ClassProps } from "@src/lib/style";

type NavbarColor =
  | "primary"
  | "info"
  | "success"
  | "danger"
  | "warning"
  | "light";
const allowedColors: NavbarColor[] = [
  "primary",
  "info",
  "success",
  "danger",
  "warning",
  "light",
];

type NavbarItemProps = {
  label: string;
  tag?: "a" | "div";
  href?: string;
  children: JSX.Element;
  color?: NavbarColor;
} & ClassProps;

const NavbarItem: Component<NavbarItemProps> = (props) => {
  const context = useContext(NavbarContext);

  const [local, rest] = splitProps(props, [
    "tag",
    "href",
    "label",
    "children",
    "class",
    "color",
  ]);

  const Tag = local.tag || (local.href ? "a" : "div");
  const isActive = () => context?.selected?.() === local.label;

  const resolveColor = (input?: string): NavbarColor | undefined => {
    return allowedColors.includes(input as NavbarColor)
      ? (input as NavbarColor)
      : undefined;
  };

  return (
    <Dynamic
      component={Tag}
      href={local.href}
      onClick={() => context?.setSelected?.(local.label)}
      class={classes(
        navbarItemClass({
          active: isActive(),
          color: resolveColor(local.color ?? context?.color),
        }),
        local.class
      )}
      {...rest}
    >
      {local.children}
    </Dynamic>
  );
};

export default NavbarItem;
