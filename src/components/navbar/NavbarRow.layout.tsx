import {omit, createMemo, children as resolveChildren} from "solid-js";
import type { JSX } from "@solidjs/web";
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
  const others = omit(
    props,
    "variant",
    "children",
    "bordered",
    "padded",
    "flavor",
    "class",
    "style",
    "dataTheme",
  );

  const resolvedChildren = resolveChildren(() => props.children);

  /* Ghost was a colour and is a variant: it is transparent chrome, not a tint. */
  const flavorClass = () =>
    CLASSES.row.flavor[(props.flavor ?? "neutral") as keyof typeof CLASSES.row.flavor] ??
    `navbar__row--flavor-${props.flavor}`;

  const classes = createMemo(() =>
    twMerge(
      CLASSES.row.base,
      props.bordered === true && CLASSES.row.flag.bordered,
      props.padded !== false && CLASSES.row.flag.padded,
      flavorClass(),
      props.variant === "ghost" && CLASSES.row.variant.ghost,
      props.class,
    ),
  );

  return (
    <div
      {...{ class: classes() }}
      style={props.style}
      data-theme={props.dataTheme}
      {...others}
    >
      {resolvedChildren()}
    </div>
  );
};

export default NavbarRow;
