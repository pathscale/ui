import "./Separator.css";
import type { JSX } from "@solidjs/web";
import { type Component, omit } from "solid-js";
import type { Layout } from "../../lib/layouts";
import { twMerge } from "../../lib/twMerge";
import type { UIBaseProps } from "../vocabulary";
import { CLASSES, type componentRecipe } from "./Separator.recipe";

export type SeparatorOrientation = "horizontal" | "vertical";
export type SeparatorVariant = "default" | "secondary" | "tertiary";

export type SeparatorProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "children"
> &
  UIBaseProps & {
    orientation?: SeparatorOrientation;
    variant?: SeparatorVariant;
  };

const Separator: Layout<typeof componentRecipe, SeparatorProps> = () => {
  const others = omit(
    props,
    "class",
    "dataTheme",
    "style",
    "orientation",
    "variant",
    "role",
  );

  const orientation = () => props.orientation ?? "horizontal";
  const variant = () => props.variant ?? "default";

  return (
    <div
      {...others}
      role={props.role ?? "separator"}
      aria-orientation={orientation()}
      data-slot="separator"
      data-orientation={orientation()}
      data-variant={variant()}
      class={twMerge(
        CLASSES.base,
        CLASSES.orientation[orientation()],
        CLASSES.variant[variant()],
        props.class,
      )}
      data-theme={props.dataTheme}
      style={props.style}
    />
  );
};

export default Separator;
export { Separator };
