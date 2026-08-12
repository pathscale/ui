import "./Surface.css";
import { splitProps, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";

import type { IComponentBaseProps } from "../types";
import { CLASSES } from "./Surface.recipe";
import type { Layout } from "../../lib/layouts";
import { componentRecipe } from "./Surface.recipe";

export type SurfaceVariant = "default" | "secondary" | "tertiary" | "transparent";

export type SurfaceVariants = {
  variant?: SurfaceVariant;
};

export type SurfaceProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  IComponentBaseProps &
  SurfaceVariants & {
    children?: JSX.Element;
  };

export const Surface: Layout<typeof componentRecipe, SurfaceProps> = () => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "style",
    "variant",
  ]);

  const variant = () => local.variant ?? "default";

  return (
    <div
      {...others}
      {...{ class: twMerge(CLASSES.base, CLASSES.variant[variant()], local.class, local.className) }}
      data-slot="surface"
      data-theme={local.dataTheme}
      style={local.style}
    >
      {local.children}
    </div>
  );
}

export default Surface;
