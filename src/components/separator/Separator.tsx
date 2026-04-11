import "./Separator.css";
import { splitProps, type Component, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";

import type { IComponentBaseProps } from "../types";

export type SeparatorOrientation = "horizontal" | "vertical";
export type SeparatorVariant = "default" | "secondary" | "tertiary";

const ORIENTATION_CLASS: Record<SeparatorOrientation, string> = {
  horizontal: "separator--horizontal",
  vertical: "separator--vertical",
};

const VARIANT_CLASS: Record<SeparatorVariant, string> = {
  default: "separator--default",
  secondary: "separator--secondary",
  tertiary: "separator--tertiary",
};

export type SeparatorProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  IComponentBaseProps & {
    orientation?: SeparatorOrientation;
    variant?: SeparatorVariant;
  };

const Separator: Component<SeparatorProps> = (props) => {
  const [local, others] = splitProps(props, [
    "class",
    "className",
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
        "separator",
        ORIENTATION_CLASS[orientation()],
        VARIANT_CLASS[variant()],
        local.class,
        local.className,
      )}
      data-theme={local.dataTheme}
      style={local.style}
    />
  );
};

export default Separator;
export { Separator };
