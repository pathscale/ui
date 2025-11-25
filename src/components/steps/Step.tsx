import { type JSX, splitProps, createMemo } from "solid-js";
import { Dynamic } from "solid-js/web";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";

import type { IComponentBaseProps, ComponentColor } from "../types";

type ElementType = keyof JSX.IntrinsicElements;

type StepBaseProps = {
  /** Label for the step indicator */
  value?: string;
  /** Color variant */
  color?: "neutral" | ComponentColor;
  /** Custom element tag */
  as?: ElementType;
  class?: string;
  className?: string;
  style?: JSX.CSSProperties;
  children?: JSX.Element;
};

type PropsOf<E extends ElementType> = JSX.IntrinsicElements[E];

export type StepProps<E extends ElementType = "li"> = Omit<
  PropsOf<E>,
  keyof StepBaseProps | "color"
> &
  StepBaseProps &
  IComponentBaseProps;

// Common void elements, unlikely for <li>
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

const Step = <E extends ElementType = "li">(
  props: StepProps<E>,
): JSX.Element => {
  const [local, others] = splitProps(
    props as StepBaseProps & Record<string, unknown>,
    [
      "value",
      "color",
      "as",
      "class",
      "className",
      "style",
      "children",
      "dataTheme",
    ],
  );

  const Tag = createMemo(() => local.as || ("li" as ElementType));

  const classes = createMemo(() =>
    twMerge(
      "step",
      local.class,
      local.className,
      clsx({
        "step-neutral": local.color === "neutral",
        "step-primary": local.color === "primary",
        "step-secondary": local.color === "secondary",
        "step-accent": local.color === "accent",
        "step-info": local.color === "info",
        "step-success": local.color === "success",
        "step-warning": local.color === "warning",
        "step-error": local.color === "error",
      }),
    ),
  );

  // Even if Tag is a void element, render without children
  if (VoidElementList.includes(Tag())) {
    return (
      <Dynamic
        component={Tag()}
        {...others}
        aria-label="Step"
        data-theme={local.dataTheme}
        data-content={local.value}
        class={classes()}
        style={local.style}
      />
    );
  }

  return (
    <Dynamic
      component={Tag()}
      {...others}
      aria-label="Step"
      data-theme={local.dataTheme}
      data-content={local.value}
      class={classes()}
      style={local.style}
    >
      {local.children}
    </Dynamic>
  );
};

export default Step;
