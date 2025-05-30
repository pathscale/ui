import { splitProps, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";

export type ComponentColor =
  | "primary"
  | "secondary"
  | "accent"
  | "info"
  | "success"
  | "warning"
  | "error"
  | "neutral";

export type LinkProps = JSX.AnchorHTMLAttributes<HTMLAnchorElement> & {
  "data-theme"?: string;
  color?: ComponentColor;
  hover?: boolean;
  className?: string;
};

const colorClassMap = {
  neutral: "link-neutral",
  primary: "link-primary",
  secondary: "link-secondary",
  accent: "link-accent",
  info: "link-info",
  success: "link-success",
  warning: "link-warning",
  error: "link-error",
} as const;

const Link = (props: LinkProps) => {
  const mergedProps = {
    hover: true,
    ...props,
  };

  const [local, rest] = splitProps(mergedProps, [
    "children",
    "href",
    "color",
    "hover",
    "class",
    "className",
    "data-theme",
  ]);

  const colorClass = colorClassMap[local.color ?? "neutral"];

  const classes = twMerge(
    "link",
    local.hover ? "link-hover" : "",
    colorClass,
    local.class,
    local.className
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
