import {omit} from "solid-js";
import type { JSX } from "@solidjs/web";
import { twMerge } from "tailwind-merge";
import { CLASSES } from "./Navbar.recipe";
import type { Layout } from "../../lib/layouts";
import { componentRecipe } from "./Navbar.recipe";

export type NavbarSectionProps = JSX.HTMLAttributes<HTMLDivElement> & {
  section: "start" | "center" | "end";
  dataTheme?: string;
};

const NavbarSection: Layout<typeof componentRecipe, NavbarSectionProps> = () => {
  const others = omit(props, "children", "section", "dataTheme", "class", "style");

  const classes = () =>
    twMerge(
      CLASSES.section.base,
      CLASSES.section.variant[props.section],
      props.class,
    );

  return (
    <div
      {...others}
      data-theme={props.dataTheme}
      {...{ class: classes() }}
      style={props.style}
    >
      {props.children}
    </div>
  );
};

export default NavbarSection;
