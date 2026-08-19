import "./footer.css";
import type { JSX } from "@solidjs/web";
import { omit, type ParentComponent } from "solid-js";
import type { Layout } from "../../lib/layouts";
import { twMerge } from "../../lib/twMerge";
import type { UIBaseProps } from "../vocabulary";
import { CLASSES, type componentRecipe } from "./Footer.recipe";
import { FooterTitle } from "./FooterTitle.generated";

export type FooterProps = UIBaseProps & {
  children?: JSX.Element;
  center?: boolean;
  horizontal?: boolean;
  vertical?: boolean;
};

const Footer: Layout<typeof componentRecipe, FooterProps> = () => {
  const others = omit(
    props,
    "children",
    "class",
    "dataTheme",
    "center",
    "horizontal",
    "vertical",
  );

  const classes = () =>
    twMerge(
      CLASSES.base,
      props.center && CLASSES.flag.center,
      props.horizontal && CLASSES.flag.horizontal,
      props.vertical && CLASSES.flag.vertical,
      props.class,
    );

  return (
    <footer
      {...others}
      data-theme={props.dataTheme}
      {...{ class: classes() }}
    >
      {props.children}
    </footer>
  );
};

const FooterNamespaces = Object.assign(Footer, { Title: FooterTitle });

export default FooterNamespaces;
