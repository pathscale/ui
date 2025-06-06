import {
  splitProps,
  type JSX,
  children as resolveChildren,
  createMemo,
} from "solid-js";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";

import type { ComponentColor, IComponentBaseProps } from "../types";

export type LinkProps = JSX.AnchorHTMLAttributes<HTMLAnchorElement> &
  IComponentBaseProps & {
    color?: ComponentColor;
    hover?: boolean;
    asChild?: boolean;
    "aria-current"?: "page" | "step" | "location" | "date" | "time" | boolean;
    "aria-label"?: string;
    "aria-describedby"?: string;
  };

const Link = (props: LinkProps) => {
  const [local, rest] = splitProps(props, [
    "children",
    "href",
    "color",
    "hover",
    "class",
    "className",
    "dataTheme",
    "style",
    "asChild",
    "aria-current",
    "aria-label",
    "aria-describedby",
  ]);

  const resolvedChildren = resolveChildren(() => local.children);

  const classes = createMemo(() =>
    twMerge(
      "link",
      clsx({
        "link-hover": local.hover !== false,
        "link-neutral": local.color === "neutral",
        "link-primary": local.color === "primary",
        "link-secondary": local.color === "secondary",
        "link-accent": local.color === "accent",
        "link-info": local.color === "info",
        "link-success": local.color === "success",
        "link-warning": local.color === "warning",
        "link-error": local.color === "error",
        "link-ghost": local.color === "ghost",
      }),
      local.class,
      local.className
    )
  );

  const ariaCurrent = createMemo(() => local["aria-current"]);
  const ariaLabel = createMemo(() => local["aria-label"]);
  const ariaDescribedby = createMemo(() => local["aria-describedby"]);

  if (local.asChild) {
    return resolvedChildren() as JSX.Element;
  }

  return (
    <a
      {...rest}
      href={local.href}
      class={classes()}
      style={local.style}
      data-theme={local.dataTheme}
      aria-current={ariaCurrent()}
      aria-label={ariaLabel()}
      aria-describedby={ariaDescribedby()}
      rel="noopener noreferrer"
    >
      {resolvedChildren()}
    </a>
  );
};

export default Link;
