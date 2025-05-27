import { type JSX, splitProps } from "solid-js";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

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
