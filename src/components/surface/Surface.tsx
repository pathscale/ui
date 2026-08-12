import "./Surface.css";
import type { JSX } from "solid-js";
import { defineComponent } from "solid-layouts";

import type { IComponentBaseProps } from "../types";
import { surface } from "./Surface.recipe";

export type SurfaceVariant =
  | "default"
  | "secondary"
  | "tertiary"
  | "transparent";

export type SurfaceVariants = {
  variant?: SurfaceVariant;
};

export type SurfaceProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "children"
> &
  IComponentBaseProps &
  SurfaceVariants & {
    children?: JSX.Element;
  };

/**
 * No layout: one element, one slot, nothing to arrange. The runtime renders
 * the recipe's element directly, which is what `element: "div"` in the recipe
 * is for.
 */
const Surface = defineComponent({
  recipe: surface,
  name: "Surface",
  defaults: { variant: "default" },
}) as unknown as (props: SurfaceProps) => JSX.Element;

export default Surface;
export { Surface };
