import {
  type JSX,
  splitProps,
  createMemo,
  children as resolveChildren,
} from "solid-js";
import { twMerge } from "tailwind-merge";
import type { IComponentBaseProps, ComponentColor } from "../types";
import { CLASSES } from "./Navbar.classes";

export type NavbarRowProps = JSX.HTMLAttributes<HTMLDivElement> &
  IComponentBaseProps & {
    bordered?: boolean;
    padded?: boolean;
    color?: ComponentColor;
  };

const NavbarRow = (props: NavbarRowProps): JSX.Element => {
  const [local, others] = splitProps(props, [
    "children",
    "bordered",
    "padded",
    "color",
    "class",
    "className",
    "style",
    "dataTheme",
  ]);

  const resolvedChildren = resolveChildren(() => local.children);

  const colorKey = (): keyof typeof CLASSES.row.color =>
    !local.color || local.color === "ghost" ? "ghost" : local.color;

  const classes = createMemo(() =>
    twMerge(
      CLASSES.row.base,
      local.bordered === true && CLASSES.row.flag.bordered,
      local.padded !== false && CLASSES.row.flag.padded,
      CLASSES.row.color[colorKey()],
      local.class,
      local.className,
    ),
  );

  return (
    <div
      {...{ class: classes() }}
      style={local.style}
      data-theme={local.dataTheme}
      {...others}
    >
      {resolvedChildren()}
    </div>
  );
};

export default NavbarRow;
