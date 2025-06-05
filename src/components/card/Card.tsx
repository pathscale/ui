import { clsx } from "clsx";
import { splitProps, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";

import type {
  ComponentSize,
  ComponentVariant,
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
    clsx({
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
    local.class,
    local.className
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
