import "./Surface.css";
import { splitProps, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";

import type { IComponentBaseProps } from "../types";

export type SurfaceVariant = "default" | "secondary" | "tertiary" | "transparent";

export type SurfaceVariants = {
  variant?: SurfaceVariant;
};

const SURFACE_VARIANT_CLASS: Record<SurfaceVariant, string> = {
  default: "surface--default",
  secondary: "surface--secondary",
  tertiary: "surface--tertiary",
  transparent: "surface--transparent",
};

export type SurfaceProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  IComponentBaseProps &
  SurfaceVariants & {
    children?: JSX.Element;
  };

export function Surface(props: SurfaceProps) {
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
      class={twMerge("surface", SURFACE_VARIANT_CLASS[variant()], local.class, local.className)}
      data-slot="surface"
      data-theme={local.dataTheme}
      style={local.style}
    >
      {local.children}
    </div>
  );
}

export default Surface;
