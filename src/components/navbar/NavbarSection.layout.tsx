import type { JSX } from "@solidjs/web";
import { omit } from "solid-js";
import type { Layout } from "../../lib/layouts";
import { twMerge } from "../../lib/twMerge";
import { CLASSES, type componentRecipe } from "./Navbar.recipe";

export type NavbarSectionProps = JSX.HTMLAttributes<HTMLDivElement> & {
  section: "start" | "center" | "end";
  dataTheme?: string;
};

const NavbarSection: Layout<
  typeof componentRecipe,
  NavbarSectionProps
> = () => {
  const others = omit(
    props,
    "children",
    "section",
    "dataTheme",
    "class",
    "style",
  );

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
