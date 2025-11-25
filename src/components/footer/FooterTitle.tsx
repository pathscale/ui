import type { IComponentBaseProps } from "../types";
import { type ParentComponent, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";

export type FooterTitleProps = IComponentBaseProps;

export const FooterTitle: ParentComponent<FooterTitleProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
  ]);

  const classes = () => twMerge("footer-title", local.class, local.className);
  return (
    <h6
      {...others}
      data-theme={local.dataTheme}
      class={classes()}
    >
      {local.children}
    </h6>
  );
};
