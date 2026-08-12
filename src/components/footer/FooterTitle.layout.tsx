import type { IComponentBaseProps } from "../types";
import { type JSX, type ParentComponent, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";
import { CLASSES } from "./Footer.recipe";
import type { Layout } from "../../lib/layouts";
import { componentRecipe } from "./Footer.recipe";

export type FooterTitleProps = IComponentBaseProps & { children?: JSX.Element };

export const FooterTitle: Layout<typeof componentRecipe, FooterTitleProps> = () => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
  ]);

  const classes = () => twMerge(CLASSES.title, local.class, local.className);
  return (
    <h6
      {...others}
      data-theme={local.dataTheme}
      {...{ class: classes() }}
    >
      {local.children}
    </h6>
  );
};
