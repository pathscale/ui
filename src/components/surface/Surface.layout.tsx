import "./Surface.css";
import { splitProps, type JSX } from "solid-js";
import { Dynamic } from "solid-js/web";
import { twMerge } from "tailwind-merge";

import type { IComponentBaseProps, ResponsiveProp } from "../types";
import { mapResponsiveProp } from "../utils";
import { CLASSES } from "./Surface.recipe";
import type { Layout } from "../../lib/layouts";
import { componentRecipe } from "./Surface.recipe";

export type SurfaceVariant =
  | "default"
  | "secondary"
  | "tertiary"
  | "transparent";
export type SurfaceMaterial = "solid" | "glass";
export type SurfaceElevation = "base" | "raised";
export type SurfacePadding = "none" | "sm" | "md" | "lg" | "xl";
export type SurfaceBorder = "none" | "subtle" | "default";
export type SurfaceRadius = "none" | "sm" | "md" | "lg" | "xl" | "full";

export type SurfaceVariants = {
  as?: keyof JSX.IntrinsicElements;
  variant?: SurfaceVariant;
  material?: SurfaceMaterial;
  elevation?: SurfaceElevation;
  padding?: ResponsiveProp<SurfacePadding>;
  paddingInline?: ResponsiveProp<SurfacePadding>;
  paddingBlock?: ResponsiveProp<SurfacePadding>;
  border?: SurfaceBorder;
  radius?: SurfaceRadius;
};

export type SurfaceProps = Omit<JSX.HTMLAttributes<HTMLElement>, "children"> &
  IComponentBaseProps &
  SurfaceVariants & {
    children?: JSX.Element;
  };

export const Surface: Layout<typeof componentRecipe, SurfaceProps> = () => {
  const [local, others] = splitProps(props, [
    "children",
    "as",
    "class",
    "className",
    "dataTheme",
    "style",
    "variant",
    "material",
    "elevation",
    "padding",
    "paddingInline",
    "paddingBlock",
    "border",
    "radius",
  ]);

  const variant = () => local.variant ?? "default";
  const material = () => local.material ?? "solid";
  const elevation = () => local.elevation ?? "base";

  return (
    <Dynamic
      component={local.as ?? "div"}
      {...others}
      {...{
        class: twMerge(
          CLASSES.base,
          CLASSES.variant[variant()],
          CLASSES.material[material()],
          CLASSES.elevation[elevation()],
          mapResponsiveProp(local.padding, CLASSES.padding),
          mapResponsiveProp(local.paddingInline, CLASSES.paddingInline),
          mapResponsiveProp(local.paddingBlock, CLASSES.paddingBlock),
          local.border && CLASSES.border[local.border],
          local.radius && CLASSES.radius[local.radius],
          local.class,
          local.className,
        ),
      }}
      data-slot="surface"
      data-theme={local.dataTheme}
      style={local.style}
    >
      {local.children}
    </Dynamic>
  );
};

/* TAILWIND_CLASSES
 * p-0 p-2 p-4 p-6 p-8
 * px-0 px-2 px-4 px-6 px-8
 * py-0 py-2 py-4 py-6 py-8
 * sm:p-0 sm:p-2 sm:p-4 sm:p-6 sm:p-8
 * sm:px-0 sm:px-2 sm:px-4 sm:px-6 sm:px-8
 * sm:py-0 sm:py-2 sm:py-4 sm:py-6 sm:py-8
 * md:p-0 md:p-2 md:p-4 md:p-6 md:p-8
 * md:px-0 md:px-2 md:px-4 md:px-6 md:px-8
 * md:py-0 md:py-2 md:py-4 md:py-6 md:py-8
 * lg:p-0 lg:p-2 lg:p-4 lg:p-6 lg:p-8
 * lg:px-0 lg:px-2 lg:px-4 lg:px-6 lg:px-8
 * lg:py-0 lg:py-2 lg:py-4 lg:py-6 lg:py-8
 * xl:p-0 xl:p-2 xl:p-4 xl:p-6 xl:p-8
 * xl:px-0 xl:px-2 xl:px-4 xl:px-6 xl:px-8
 * xl:py-0 xl:py-2 xl:py-4 xl:py-6 xl:py-8
 */

export default Surface;
