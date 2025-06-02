import {
  type JSX,
  splitProps,
  children as resolveChildren,
  createMemo,
} from "solid-js";
import { twMerge } from "tailwind-merge";

import type { IComponentBaseProps } from "../types";

type SidenavLinkBaseProps = {
  asChild?: boolean;
};

export type SidenavLinkProps = JSX.HTMLAttributes<HTMLDivElement> &
  SidenavLinkBaseProps &
  IComponentBaseProps;

const SidenavLink = (props: SidenavLinkProps): JSX.Element => {
  const [local, others] = splitProps(props, [
    "children",
    "asChild",
    "class",
    "className",
    "dataTheme",
    "style",
  ]);

  const resolvedChildren = resolveChildren(() => local.children);

  const classes = createMemo(() =>
    twMerge("sidenav-item-link", local.class, local.className)
  );

  if (local.asChild) {
    return resolvedChildren() as JSX.Element;
  }

  return (
    <div
      {...others}
      class={classes()}
      data-theme={local.dataTheme}
      style={local.style}
    >
      {resolvedChildren()}
    </div>
  );
};

export default SidenavLink;
