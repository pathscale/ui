import { type JSX, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";
import { CLASSES } from "./Navbar.classes";

export type NavbarSectionProps = JSX.HTMLAttributes<HTMLDivElement> & {
  section: "start" | "center" | "end";
  dataTheme?: string;
  className?: string;
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
      CLASSES.Section.variant[local.section],
      local.class,
      local.className,
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
