import type { JSX } from "@solidjs/web";
import { omit, type ParentComponent } from "solid-js";
import type { Layout } from "../../lib/layouts";
import { twMerge } from "../../lib/twMerge";
import type { UIBaseProps } from "../vocabulary";
import { CLASSES, type componentRecipe } from "./Footer.recipe";

export type FooterTitleProps = UIBaseProps & { children?: JSX.Element };

export const FooterTitle: Layout<
  typeof componentRecipe,
  FooterTitleProps
> = () => {
  const others = omit(props, "children", "class", "dataTheme");

  const classes = () => twMerge(CLASSES.title, props.class);
  return (
    <h6
      {...others}
      data-theme={props.dataTheme}
      {...{ class: classes() }}
    >
      {props.children}
    </h6>
  );
};
