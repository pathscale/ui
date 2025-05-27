import { splitProps, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";

export type ComponentColor =
  | "primary"
  | "secondary"
  | "accent"
  | "info"
  | "success"
  | "warning"
  | "error";

export type LinkProps = JSX.AnchorHTMLAttributes<HTMLAnchorElement> & {
  "data-theme"?: string;
  color?: ComponentColor | "neutral";
  hover?: boolean;
};

const Link = (props: LinkProps) => {
  const [local, rest] = splitProps(props, [
    "children",
    "href",
    "color",
    "hover",
    "class",
    "data-theme",
  ]);

  const classes = twMerge(
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
    }),
    local.class
  );

  return (
    <a
      {...rest}
      href={local.href}
      class={classes}
      data-theme={local["data-theme"]}
      rel="noopener noreferrer"
    >
      {local.children}
    </a>
  );
};

export default Link;
