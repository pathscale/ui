import "./Link.css";
import { splitProps, type Component, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";

import type { IComponentBaseProps } from "../types";
import { CLASSES } from "./Link.classes";

export type LinkVariant = "default";
export type LinkUnderline = "always" | "hover" | "none";

export type LinkRootProps = Omit<JSX.AnchorHTMLAttributes<HTMLAnchorElement>, "color"> &
  IComponentBaseProps & {
    variant?: LinkVariant;
    underline?: LinkUnderline;
    isExternal?: boolean;
    isDisabled?: boolean;
  };

export type LinkIconProps = JSX.HTMLAttributes<HTMLSpanElement> & IComponentBaseProps;

const ensureExternalRel = (value: string | undefined) => {
  const relTokens = new Set((value ?? "").split(/\s+/).filter(Boolean));
  relTokens.add("noopener");
  relTokens.add("noreferrer");
  return Array.from(relTokens).join(" ");
};

const LinkRoot: Component<LinkRootProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "href",
    "class",
    "className",
    "dataTheme",
    "style",
    "variant",
    "underline",
    "isExternal",
    "isDisabled",
    "target",
    "rel",
    "tabIndex",
  ]);

  const variant = () => local.variant ?? "default";
  const underline = () => local.underline ?? "always";
  const isDisabled = () => Boolean(local.isDisabled);
  const isExternal = () => Boolean(local.isExternal);

  return (
    <a
      {...others}
      href={isDisabled() ? undefined : local.href}
      target={isExternal() ? "_blank" : local.target}
      rel={isExternal() ? ensureExternalRel(local.rel) : local.rel}
      tabIndex={isDisabled() ? -1 : local.tabIndex}
      class={twMerge(
        CLASSES.base,
        CLASSES.variant[variant()],
        CLASSES.underline[underline()],
        isExternal() && CLASSES.flag.external,
        isDisabled() && CLASSES.flag.disabled,
        local.class,
        local.className,
      )}
      data-slot="link"
      data-theme={local.dataTheme}
      data-external={isExternal() ? "true" : "false"}
      data-disabled={isDisabled() ? "true" : "false"}
      aria-disabled={isDisabled() ? "true" : undefined}
      style={local.style}
    >
      {local.children}
    </a>
  );
};

const LinkIcon: Component<LinkIconProps> = (props) => {
  const [local, others] = splitProps(props, [
    "class",
    "className",
    "children",
    "dataTheme",
    "style",
  ]);

  const hasCustomIcon = () => local.children != null;

  return (
    <span
      {...others}
      class={twMerge(CLASSES.slot.icon, local.class, local.className)}
      data-slot="link-icon"
      data-default-icon={hasCustomIcon() ? "false" : "true"}
      data-theme={local.dataTheme}
      style={local.style}
    >
      {local.children ?? (
        <svg
          class={CLASSES.slot.iconDefault}
          data-slot="link-default-icon"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M7 1H11V5M11 1L5 7"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M10 7.5V9.5C10 10.3284 9.32843 11 8.5 11H2.5C1.67157 11 1 10.3284 1 9.5V3.5C1 2.67157 1.67157 2 2.5 2H4.5"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      )}
    </span>
  );
};

type LinkComponent = Component<LinkRootProps> & {
  Root: Component<LinkRootProps>;
  Icon: Component<LinkIconProps>;
};

const Link = Object.assign(LinkRoot, {
  Root: LinkRoot,
  Icon: LinkIcon,
}) as LinkComponent;

export type LinkProps = LinkRootProps;
export { LinkRoot, LinkIcon };
export default Link;
