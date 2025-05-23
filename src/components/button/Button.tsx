import { type JSX, splitProps, Show } from "solid-js";
import { Dynamic } from "solid-js/web";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";

import Loading from "../loading/Loading";
import type {
  IComponentBaseProps,
  ComponentColor,
  ComponentShape,
  ComponentVariant,
  ComponentSize,
} from "../types";

type ElementType = keyof JSX.IntrinsicElements;

type ButtonBaseProps = {
  shape?: ComponentShape;
  size?: ComponentSize;
  color?: ComponentColor;
  variant?: ComponentVariant | "link";
  glass?: boolean;
  wide?: boolean;
  fullWidth?: boolean;
  responsive?: boolean;
  animation?: boolean;
  loading?: boolean;
  active?: boolean;
  startIcon?: JSX.Element;
  endIcon?: JSX.Element;
  disabled?: boolean;
  as?: ElementType;
  children?: JSX.Element;
  dataTheme?: string;
  class?: string;
  className?: string;
  style?: JSX.CSSProperties;
};

type PropsOf<E extends ElementType> = JSX.IntrinsicElements[E];

export type ButtonProps<E extends ElementType = "button"> = Omit<
  PropsOf<E>,
  keyof ButtonBaseProps | "color" | "size"
> &
  ButtonBaseProps &
  IComponentBaseProps;

// https://developer.mozilla.org/en-US/docs/Glossary/Void_element
const VoidElementList: ElementType[] = [
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "keygen",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
];

const Button = <E extends ElementType = "button">(
  props: ButtonProps<E>
): JSX.Element => {
  const [local, others] = splitProps(
    props as ButtonBaseProps & Record<string, unknown>,
    [
      "children",
      "shape",
      "size",
      "variant",
      "color",
      "glass",
      "startIcon",
      "endIcon",
      "wide",
      "fullWidth",
      "responsive",
      "animation",
      "loading",
      "active",
      "disabled",
      "dataTheme",
      "class",
      "className",
      "style",
      "as",
    ]
  );

  const classes = () =>
    twMerge(
      "btn",
      local.class,
      local.className,
      clsx(((local.startIcon && !local.loading) || local.endIcon) && "gap-2", {
        "btn-xl": local.size === "xl",
        "btn-lg": local.size === "lg",
        "btn-md": local.size === "md",
        "btn-sm": local.size === "sm",
        "btn-xs": local.size === "xs",
        "btn-circle": local.shape === "circle",
        "btn-square": local.shape === "square",
        "btn-soft": local.variant === "soft",
        "btn-dash": local.variant === "dash",
        "btn-outline": local.variant === "outline",
        "btn-link": local.variant === "link",
        "btn-neutral": local.color === "neutral",
        "btn-primary": local.color === "primary",
        "btn-secondary": local.color === "secondary",
        "btn-accent": local.color === "accent",
        "btn-info": local.color === "info",
        "btn-success": local.color === "success",
        "btn-warning": local.color === "warning",
        "btn-error": local.color === "error",
        "btn-ghost": local.color === "ghost",
        glass: local.glass,
        "btn-wide": local.wide,
        "btn-block": local.fullWidth,
        "btn-xs sm:btn-sm md:btn-md lg:btn-lg": local.responsive,
        "no-animation": !local.animation,
        "btn-active": local.active,
        "btn-disabled": local.disabled,
      })
    );

  const Tag = local.as || "button";

  if (VoidElementList.includes(Tag as ElementType)) {
    return (
      <Dynamic
        component={Tag}
        {...others}
        data-theme={local.dataTheme}
        class={classes()}
        style={local.style}
        disabled={local.disabled}
      />
    );
  }

  return (
    <Dynamic
      component={Tag}
      {...others}
      data-theme={local.dataTheme}
      class={classes()}
      style={local.style}
      disabled={local.disabled}
    >
      <Show when={local.loading}>
        <Loading size={local.size} color={local.color} variant="spinner" />
      </Show>
      <Show when={local.startIcon && !local.loading}>{local.startIcon}</Show>
      {local.children}
      <Show when={local.endIcon}>{local.endIcon}</Show>
    </Dynamic>
  );
};

export default Button;
