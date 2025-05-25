import { type JSX, splitProps, type Component } from "solid-js";
import type { IComponentBaseProps } from "../types";

export type MenuDetailsProps = JSX.DetailsHtmlAttributes<HTMLDetailsElement> &
  IComponentBaseProps & {
    label: JSX.Element;
    open?: boolean;
  };

const MenuDetails: Component<MenuDetailsProps> = (props) => {
  const [local, others] = splitProps(props, [
    "label",
    "open",
    "class",
    "className",
    "style",
    "children",
    "dataTheme",
  ]);

  const classAttr = () => local.class ?? local.className;

  return (
    <details
      {...others}
      open={local.open}
      class={classAttr()}
      style={local.style}
      data-theme={local.dataTheme}
    >
      <summary>{local.label}</summary>
      <ul>{local.children}</ul>
    </details>
  );
};

export default MenuDetails;
