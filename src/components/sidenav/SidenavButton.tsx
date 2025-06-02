import {
  type JSX,
  splitProps,
  children as resolveChildren,
  createMemo,
} from "solid-js";
import { twMerge } from "tailwind-merge";

import type { IComponentBaseProps } from "../types";

type SidenavButtonBaseProps = {
  onClick?: () => void;
  title?: string;
};

export type SidenavButtonProps = JSX.HTMLAttributes<HTMLButtonElement> &
  SidenavButtonBaseProps &
  IComponentBaseProps;

const SidenavButton = (props: SidenavButtonProps): JSX.Element => {
  const [local, others] = splitProps(props, [
    "children",
    "onClick",
    "title",
    "class",
    "className",
    "dataTheme",
    "style",
  ]);

  const resolvedChildren = resolveChildren(() => local.children);

  const classes = createMemo(() =>
    twMerge("sidenav-item-button", local.class, local.className)
  );

  return (
    <button
      type="button"
      {...others}
      class={classes()}
      onClick={local.onClick}
      title={local.title}
      data-theme={local.dataTheme}
      style={local.style}
    >
      {resolvedChildren()}
    </button>
  );
};

export default SidenavButton;
