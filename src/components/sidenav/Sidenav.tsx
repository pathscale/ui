import {
  type JSX,
  splitProps,
  Show,
  children as resolveChildren,
  createMemo,
} from "solid-js";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";
import { useDesktop } from "../utils";

import type { IComponentBaseProps } from "../types";

type SidenavBaseProps = {
  title?: string;
  isOpen?: boolean;
  onClose?: () => void;
  collapsed?: boolean;
  children?: JSX.Element;
  footer?: JSX.Element;
  desktopBreakpoint?: number;
};

export type SidenavProps = JSX.HTMLAttributes<HTMLElement> &
  SidenavBaseProps &
  IComponentBaseProps;

const Sidenav = (props: SidenavProps): JSX.Element => {
  const [local, others] = splitProps(props, [
    "title",
    "isOpen",
    "onClose",
    "collapsed",
    "children",
    "footer",
    "class",
    "className",
    "dataTheme",
    "style",
    "desktopBreakpoint",
  ]);

  const resolvedChildren = resolveChildren(() => local.children);
  const isDesktop = useDesktop(local.desktopBreakpoint || 1024);

  const classes = createMemo(() =>
    twMerge(
      "sidenav",
      local.class,
      local.className,
      clsx({
        "sidenav-collapsed": local.collapsed,
        "sidenav-closed": !local.isOpen,
        "sidenav-desktop": isDesktop(),
      }),
    ),
  );

  return (
    <nav
      {...others}
      class={classes()}
      data-theme={local.dataTheme}
      style={local.style}
    >
      <Show when={local.title && !local.collapsed}>
        <div class="sidenav-header">
          <h2 class="sidenav-title">{local.title}</h2>
        </div>
      </Show>

      <div class="sidenav-content">{resolvedChildren()}</div>

      <Show when={local.footer}>
        <div class="sidenav-footer">{local.footer}</div>
      </Show>
    </nav>
  );
};

export default Sidenav;
