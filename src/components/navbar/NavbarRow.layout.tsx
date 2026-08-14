import {
  type JSX,
  splitProps,
  createMemo,
  children as resolveChildren,
} from "solid-js";
import { twMerge } from "tailwind-merge";
import type { UIBaseProps, Flavor, Variant } from "../vocabulary";
import type { ComponentColor } from "../types";
import { CLASSES } from "./Navbar.recipe";
import type { Layout } from "../../lib/layouts";
import { componentRecipe } from "./Navbar.recipe";

export type NavbarRowProps = JSX.HTMLAttributes<HTMLDivElement> &
  UIBaseProps & {
    bordered?: boolean;
    padded?: boolean;
    flavor?: Flavor;
    /** Ghost is transparent chrome. It used to be a colour named `ghost`. */
    variant?: Extract<Variant, "solid" | "ghost">;
  };

const NavbarRow: Layout<typeof componentRecipe, NavbarRowProps> = () => {
  const [local, others] = splitProps(props, [
    "variant",
    "children",
    "bordered",
    "padded",
    "flavor",
    "class",
    "style",
    "dataTheme",
  ]);

  const resolvedChildren = resolveChildren(() => local.children);

  /* Ghost was a colour and is a variant: it is transparent chrome, not a tint. */
  const flavorClass = () =>
    CLASSES.row.flavor[(local.flavor ?? "neutral") as keyof typeof CLASSES.row.flavor] ??
    `navbar__row--flavor-${local.flavor}`;

  const classes = createMemo(() =>
    twMerge(
      CLASSES.row.base,
      local.bordered === true && CLASSES.row.flag.bordered,
      local.padded !== false && CLASSES.row.flag.padded,
      flavorClass(),
      local.variant === "ghost" && CLASSES.row.variant.ghost,
      local.class,
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
