import {
  type JSX,
  splitProps,
  createMemo,
  children as resolveChildren,
} from "solid-js";
import { twMerge } from "tailwind-merge";
import { Dynamic } from "solid-js/web";

import type { IComponentBaseProps } from "../types";

type SidenavLinkBaseProps = {
  asChild?: boolean;
  as?: string;
};

export type SidenavLinkProps = JSX.HTMLAttributes<HTMLDivElement> &
  SidenavLinkBaseProps &
  IComponentBaseProps;

const SidenavLink = (props: SidenavLinkProps): JSX.Element => {
  const [local, others] = splitProps(props, [
    "children",
    "asChild",
    "as",
    "class",
    "className",
    "dataTheme",
    "style",
  ]);

  const resolvedChildren = resolveChildren(() => local.children);

  const classes = createMemo(() =>
    twMerge("sidenav-item-link", local.class, local.className),
  );

  if (local.asChild) {
    return resolvedChildren() as JSX.Element;
  }

  const Tag = local.as || "div";

  return (
    <Dynamic
      component={Tag}
      {...others}
      class={classes()}
      data-theme={local.dataTheme}
      style={local.style}
    >
      {resolvedChildren()}
    </Dynamic>
  );
};

export default SidenavLink;
