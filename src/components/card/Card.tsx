import { clsx } from "clsx";
import { splitProps, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";

import type {
  ComponentSize,
  ComponentVariant,
  ComponentColor,
  IComponentBaseProps,
} from "../types";
import CardActions from "./CardActions";
import CardBody from "./CardBody";
import CardImage from "./CardImage";
import CardTitle from "./CardTitle";

export type CardProps = IComponentBaseProps &
  JSX.HTMLAttributes<HTMLDivElement> & {
    size?: ComponentSize;
    border?: boolean;
    variant?: Exclude<ComponentVariant, "soft"> | "border";
    imageFull?: boolean;
    side?: ComponentSize | boolean;
    background?: ComponentColor | "base-100" | "base-200" | "base-300";
    shadow?: "none" | "sm" | "md" | "lg" | "xl";
    fullWidth?: boolean;
    "aria-label"?: string;
    "aria-describedby"?: string;
    "aria-labelledby"?: string;
    role?: string;
  };

const DYNAMIC_MODIFIERS = {
  side: {
    true: "card-side",
    xs: "xs:card-side",
    sm: "sm:card-side",
    md: "md:card-side",
    lg: "lg:card-side",
  },
} as const;

const Card = (props: CardProps): JSX.Element => {
  const [local, others] = splitProps(props, [
    "size",
    "border",
    "variant",
    "imageFull",
    "side",
    "background",
    "shadow",
    "fullWidth",
    "class",
    "className",
    "dataTheme",
    "style",
    "aria-label",
    "aria-describedby",
    "aria-labelledby",
    "role",
  ]);

  const classes = twMerge(
    "card",
    local.class,
    local.className,
    clsx({
      "w-full": local.fullWidth,
      "shadow-sm": local.shadow === "sm",
      "shadow-md": local.shadow === "md",
      "shadow-lg": local.shadow === "lg",
      "shadow-xl": local.shadow === "xl",
      "shadow-none": local.shadow === "none",
      "bg-base-100": local.background === "base-100",
      "bg-base-200": local.background === "base-200",
      "bg-base-300": local.background === "base-300",
      "bg-primary": local.background === "primary",
      "bg-secondary": local.background === "secondary",
      "bg-accent": local.background === "accent",
      "bg-neutral": local.background === "neutral",
      "bg-info": local.background === "info",
      "bg-success": local.background === "success",
      "bg-warning": local.background === "warning",
      "bg-error": local.background === "error",
      "card-xl": local.size === "xl",
      "card-lg": local.size === "lg",
      "card-md": local.size === "md",
      "card-sm": local.size === "sm",
      "card-xs": local.size === "xs",
      "card-dash": local.variant === "dash",
      "card-border":
        local.border !== false ||
        local.variant === "outline" ||
        local.variant === "border",
      "image-full": local.imageFull,
      [DYNAMIC_MODIFIERS.side[
        local.side?.toString() as keyof typeof DYNAMIC_MODIFIERS.side
      ] ?? ""]: !!local.side,
    }),
  );

  return (
    <div
      {...others}
      class={classes}
      data-theme={local.dataTheme}
      style={local.style}
      role={local.role}
      aria-label={local["aria-label"]}
      aria-describedby={local["aria-describedby"]}
      aria-labelledby={local["aria-labelledby"]}
    />
  );
};

Card.Actions = CardActions;
Card.Body = CardBody;
Card.Title = CardTitle;
Card.Image = CardImage;

export default Card;
