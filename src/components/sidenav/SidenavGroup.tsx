import {
  type JSX,
  splitProps,
  Show,
  children as resolveChildren,
  createMemo,
} from "solid-js";
import { twMerge } from "tailwind-merge";

import type { IComponentBaseProps } from "../types";

type SidenavGroupBaseProps = {
  label?: string;
  children: JSX.Element;
  collapsed?: boolean;
};

export type SidenavGroupProps = JSX.HTMLAttributes<HTMLDivElement> &
  SidenavGroupBaseProps &
  IComponentBaseProps;

const SidenavGroup = (props: SidenavGroupProps): JSX.Element => {
  const [local, others] = splitProps(props, [
    "label",
    "children",
    "collapsed",
    "class",
    "className",
    "dataTheme",
    "style",
  ]);

  const resolvedChildren = resolveChildren(() => local.children);

  const classes = createMemo(() =>
    twMerge("sidenav-group", local.class, local.className),
  );

  return (
    <div
      {...others}
      class={classes()}
      data-theme={local.dataTheme}
      style={local.style}
    >
      <Show when={local.label && !local.collapsed}>
        <div class="sidenav-group-label">{local.label}</div>
      </Show>
      <ul class="sidenav-group-items">{resolvedChildren()}</ul>
    </div>
  );
};

export default SidenavGroup;
