import { type JSX, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";

import type { NavbarProps } from "./Navbar";

export type NavbarSectionProps = NavbarProps & {
  section: "start" | "center" | "end";
};

const NavbarSection = (props: NavbarSectionProps): JSX.Element => {
  const [local, others] = splitProps(props, [
    "children",
    "section",
    "dataTheme",
    "class",
    "className",
    "style",
  ]);

  const classes = () =>
    twMerge(
      local.class,
      local.className,
      clsx({
        "navbar-start": local.section === "start",
        "navbar-center": local.section === "center",
        "navbar-end": local.section === "end",
      })
    );

  return (
    <div
      {...others}
      data-theme={local.dataTheme}
      class={classes()}
      style={local.style}
    >
      {local.children}
    </div>
  );
};

export default NavbarSection;
