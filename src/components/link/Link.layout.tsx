import "./Link.css";
import type { JSX } from "@solidjs/web";
import {omit, type Component} from "solid-js";
import { twMerge } from "../../lib/twMerge";

import type { UIBaseProps, State } from "../vocabulary";
import { CLASSES } from "./Link.recipe";
import type { Layout } from "../../lib/layouts";
import { componentRecipe } from "./Link.recipe";

export type LinkVariant = "default";
export type LinkUnderline = "always" | "hover" | "none";

export type LinkRootProps = Omit<JSX.AnchorHTMLAttributes<HTMLAnchorElement>, "color"> &
  UIBaseProps & {
    variant?: LinkVariant;
    underline?: LinkUnderline;
    isExternal?: boolean;
    state?: State;
  };

export type LinkIconProps = JSX.HTMLAttributes<HTMLSpanElement> & UIBaseProps;

// `string | false | undefined`: Solid 2 lets any attribute be `false` to mean
// "remove it", so that is what a `rel` prop can now hold.
const ensureExternalRel = (value: string | false | undefined) => {
  const relTokens = new Set((typeof value === "string" ? value : "").split(/\s+/).filter(Boolean));
  relTokens.add("noopener");
  relTokens.add("noreferrer");
  return Array.from(relTokens).join(" ");
};

const LinkRoot: Layout<typeof componentRecipe, LinkRootProps> = () => {
  const others = omit(
    props,
    "children",
    "href",
    "class",
    "dataTheme",
    "style",
    "variant",
    "underline",
    "isExternal",
    "state",
    "target",
    "rel",
    "tabindex",
  );

  const variant = () => props.variant ?? "default";
  const underline = () => props.underline ?? "always";
  const isDisabled = () => Boolean((props.state === "disabled"));
  const isExternal = () => Boolean(props.isExternal);

  return (
    <a
      {...others}
      href={isDisabled() ? undefined : props.href}
      target={isExternal() ? "_blank" : props.target}
      rel={isExternal() ? ensureExternalRel(props.rel) : props.rel}
      tabindex={isDisabled() ? -1 : props.tabindex}
      {...{ class: twMerge(
        CLASSES.base,
        CLASSES.variant[variant()],
        CLASSES.underline[underline()],
        isExternal() && CLASSES.flag.external,
        isDisabled() && CLASSES.flag.disabled,
        props.class,
      ) }}
      data-slot="link"
      data-theme={props.dataTheme}
      data-external={isExternal() ? "true" : "false"}
      data-disabled={isDisabled() ? "true" : "false"}
      aria-disabled={isDisabled() ? "true" : undefined}
      style={props.style}
    >
      {props.children}
    </a>
  );
};

const LinkIcon: Layout<typeof componentRecipe, LinkIconProps> = () => {
  const others = omit(props, "class", "children", "dataTheme", "style");

  const hasCustomIcon = () => props.children != null;

  return (
    <span
      {...others}
      {...{ class: twMerge(CLASSES.slot.icon, props.class) }}
      data-slot="link-icon"
      data-default-icon={hasCustomIcon() ? "false" : "true"}
      data-theme={props.dataTheme}
      style={props.style}
    >
      {props.children ?? (
        <svg
          {...{ class: CLASSES.slot.iconDefault }}
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
