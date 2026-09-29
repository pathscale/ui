import "./footer.css";
import type { JSX } from "@solidjs/web";
import {type ParentComponent, omit} from "solid-js";
import { twMerge } from "../../lib/twMerge";
import "../_shared/material.css";
import type { Material, UIBaseProps } from "../vocabulary";
import { FooterTitle } from "./FooterTitle.generated";
import { CLASSES } from "./Footer.recipe";
import type { Layout } from "../../lib/layouts";
import { componentRecipe } from "./Footer.recipe";

export type FooterProps = UIBaseProps & {
  children?: JSX.Element;
  center?: boolean;
  horizontal?: boolean;
  vertical?: boolean;
  /** What the footer is made of. Unset keeps the footer's own background. */
  material?: Material;
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
    "material",
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
      data-material={props.material}
      data-material-explicit={props.material ? "" : undefined}
      {...{ class: classes() }}
    >
      {props.children}
    </footer>
  );
};

const FooterNamespaces = Object.assign(Footer, { Title: FooterTitle });

export default FooterNamespaces;
