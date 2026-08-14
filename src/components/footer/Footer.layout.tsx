import "./footer.css";
import { type JSX, type ParentComponent, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";
import type { UIBaseProps } from "../vocabulary";
import { FooterTitle } from "./FooterTitle.generated";
import { CLASSES } from "./Footer.recipe";
import type { Layout } from "../../lib/layouts";
import { componentRecipe } from "./Footer.recipe";

export type FooterProps = UIBaseProps & {
  children?: JSX.Element;
  center?: boolean;
  horizontal?: boolean;
  vertical?: boolean;
};

const Footer: Layout<typeof componentRecipe, FooterProps> = () => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "dataTheme",
    "center",
    "horizontal",
    "vertical",
  ]);

  const classes = () =>
    twMerge(
      CLASSES.base,
      local.center && CLASSES.flag.center,
      local.horizontal && CLASSES.flag.horizontal,
      local.vertical && CLASSES.flag.vertical,
      local.class,
    );

  return (
    <footer
      {...others}
      data-theme={local.dataTheme}
      {...{ class: classes() }}
    >
      {local.children}
    </footer>
  );
};

const FooterNamespaces = Object.assign(Footer, { Title: FooterTitle });

export default FooterNamespaces;
