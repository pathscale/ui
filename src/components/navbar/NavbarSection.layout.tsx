import { type JSX, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";
import { CLASSES } from "./Navbar.recipe";
import type { Layout } from "../../lib/layouts";
import { componentRecipe } from "./Navbar.recipe";

export type NavbarSectionProps = JSX.HTMLAttributes<HTMLDivElement> & {
  section: "start" | "center" | "end";
  dataTheme?: string;
  className?: string;
};

const NavbarSection: Layout<typeof componentRecipe, NavbarSectionProps> = () => {
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
      CLASSES.section.base,
      CLASSES.section.variant[local.section],
      local.class,
      local.className,
    );

  return (
    <div
      {...others}
      data-theme={local.dataTheme}
      {...{ class: classes() }}
      style={local.style}
    >
      {local.children}
    </div>
  );
};

export default NavbarSection;
