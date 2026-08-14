import "./Separator.css";
import { splitProps, type Component, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";

import type { UIBaseProps } from "../vocabulary";
import { CLASSES } from "./Separator.recipe";
import type { Layout } from "../../lib/layouts";
import { componentRecipe } from "./Separator.recipe";

export type SeparatorOrientation = "horizontal" | "vertical";
export type SeparatorVariant = "default" | "secondary" | "tertiary";

export type SeparatorProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  UIBaseProps & {
    orientation?: SeparatorOrientation;
    variant?: SeparatorVariant;
  };

const Separator: Layout<typeof componentRecipe, SeparatorProps> = () => {
  const [local, others] = splitProps(props, [
    "class",
    "dataTheme",
    "style",
    "orientation",
    "variant",
    "role",
  ]);

  const orientation = () => local.orientation ?? "horizontal";
  const variant = () => local.variant ?? "default";

  return (
    <div
      {...others}
      role={local.role ?? "separator"}
      aria-orientation={orientation()}
      data-slot="separator"
      data-orientation={orientation()}
      data-variant={variant()}
      class={twMerge(
        CLASSES.base,
        CLASSES.orientation[orientation()],
        CLASSES.variant[variant()],
        local.class,
      )}
      data-theme={local.dataTheme}
      style={local.style}
    />
  );
};

export default Separator;
export { Separator };
