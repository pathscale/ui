import { ParentComponent, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";
import type { IComponentBaseProps } from "../types";

export type FooterProps = IComponentBaseProps & {
  center?: boolean;
  horizontal?: boolean;
  vertical?: boolean;
};

const Footer: ParentComponent<FooterProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "center",
    "horizontal",
    "vertical",
  ]);

  const classes = () =>
    twMerge(
      "footer",
      local.class,
      local.className,
      clsx({
        "footer-center": local.center,
        "footer-horizontal": local.horizontal,
        "footer-vertical": local.vertical,
      })
    );

  return (
    <footer {...others} data-theme={local.dataTheme} class={classes()}>
      {local.children}
    </footer>
  );
};

export interface FooterTitleProps extends IComponentBaseProps {}

export const FooterTitle: ParentComponent<FooterTitleProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
  ]);

  const classes = () => twMerge("footer-title", local.class, local.className);

  return (
    <h6 {...others} data-theme={local.dataTheme} class={classes()}>
      {local.children}
    </h6>
  );
};

export default Footer;
