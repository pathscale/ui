import "./Description.css";
import { splitProps, type Component, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";

import type { IComponentBaseProps } from "../types";
import { CLASSES } from "./Description.recipe";
import type { Layout } from "../../lib/layouts";
import { componentRecipe } from "./Description.recipe";

export type DescriptionRootProps = JSX.HTMLAttributes<HTMLSpanElement> & IComponentBaseProps;

const DescriptionRoot: Layout<typeof componentRecipe, DescriptionRootProps> = () => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "style",
    "slot",
  ]);

  return (
    <span
      {...others}
      {...{ class: twMerge(CLASSES.base, local.class, local.className) }}
      data-slot="description"
      slot={local.slot ?? "description"}
      data-theme={local.dataTheme}
      style={local.style}
    >
      {local.children}
    </span>
  );
};

const Description = Object.assign(DescriptionRoot, {
  Root: DescriptionRoot,
});

export default Description;
export { Description, DescriptionRoot };
export type { DescriptionRootProps as DescriptionProps };
