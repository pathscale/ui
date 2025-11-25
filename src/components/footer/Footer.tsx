import { type ParentComponent, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";
import type { IComponentBaseProps } from "../types";
import { FooterTitle } from "./FooterTitle";

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
      }),
    );

  return (
    <footer
      {...others}
      data-theme={local.dataTheme}
      class={classes()}
    >
      {local.children}
    </footer>
  );
};

const FooterNamespaces = Object.assign(Footer, { Title: FooterTitle });

export default FooterNamespaces;
