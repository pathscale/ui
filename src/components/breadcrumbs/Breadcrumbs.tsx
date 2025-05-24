import { splitProps, type JSX, type Component } from "solid-js";
import { twMerge } from "tailwind-merge";

import type { IComponentBaseProps } from "../types";

type BreadcrumbProps = IComponentBaseProps &
  JSX.HTMLAttributes<HTMLDivElement> & {
    innerProps?: JSX.HTMLAttributes<HTMLUListElement>;
  };

const Breadcrumbs: Component<BreadcrumbProps> = (props) => {
  const [local, others] = splitProps(props, [
    "dataTheme",
    "class",
    "className",
    "style",
    "innerProps",
  ]);

  const classes = () =>
    twMerge("breadcrumbs text-sm", local.class, local.className);

  return (
    <div
      {...others}
      role="navigation"
      aria-label="Breadcrumbs"
      data-theme={local.dataTheme}
      class={classes()}
      style={local.style}
    >
      <ul {...local.innerProps}>{props.children}</ul>
    </div>
  );
};

export default Breadcrumbs;
