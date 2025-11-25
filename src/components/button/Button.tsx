import { clsx } from "clsx";
import { type JSX, Show, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";
import { twMerge } from "tailwind-merge";

import Loading from "../loading/Loading";
import type {
  ComponentColor,
  ComponentShape,
  ComponentSize,
  ComponentVariant,
  IComponentBaseProps,
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
  // ARIA attributes
  "aria-label"?: string;
  "aria-describedby"?: string;
  "aria-pressed"?: boolean;
  "aria-expanded"?: boolean;
  "aria-controls"?: string;
  "aria-haspopup"?: string;
  "aria-role"?: string;
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
  props: ButtonProps<E>,
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
      "aria-label",
      "aria-describedby",
      "aria-pressed",
      "aria-expanded",
      "aria-controls",
      "aria-haspopup",
      "aria-role",
    ],
  );

  const normalizeAriaValue = (value: unknown) => {
    return typeof value === "boolean" ? String(value) : value;
  };

  const classes = () =>
    twMerge(
      "btn",
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
        "cursor-not-allowed": local.disabled,
      }),
      local.class,
      local.className,
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
        aria-label={local["aria-label"]}
        aria-describedby={local["aria-describedby"]}
        aria-pressed={normalizeAriaValue(local["aria-pressed"])}
        aria-expanded={normalizeAriaValue(local["aria-expanded"])}
        aria-controls={local["aria-controls"]}
        aria-haspopup={normalizeAriaValue(local["aria-haspopup"])}
        aria-disabled={local.disabled}
        role={local["aria-role"]}
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
      aria-label={local["aria-label"]}
      aria-describedby={local["aria-describedby"]}
      aria-pressed={normalizeAriaValue(local["aria-pressed"])}
      aria-expanded={normalizeAriaValue(local["aria-expanded"])}
      aria-controls={local["aria-controls"]}
      aria-haspopup={normalizeAriaValue(local["aria-haspopup"])}
      aria-disabled={local.disabled}
      role={local["aria-role"]}
    >
      <Show when={local.loading}>
        <Loading
          size={local.size}
          color={local.color}
          variant="spinner"
        />
      </Show>
      <Show when={local.startIcon && !local.loading}>{local.startIcon}</Show>
      {local.children}
      <Show when={local.endIcon}>{local.endIcon}</Show>
    </Dynamic>
  );
};

export default Button;
