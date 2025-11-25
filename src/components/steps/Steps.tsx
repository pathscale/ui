import { type JSX, splitProps, createMemo } from "solid-js";
import { Dynamic } from "solid-js/web";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";

import type { IComponentBaseProps } from "../types";
import Step from "./Step";

type ElementType = keyof JSX.IntrinsicElements;

type StepsBaseProps = {
  vertical?: boolean;
  horizontal?: boolean;
  as?: ElementType;
  class?: string;
  className?: string;
  style?: JSX.CSSProperties;
  children?: JSX.Element;
};

type PropsOf<E extends ElementType> = JSX.IntrinsicElements[E];

export type StepsProps<E extends ElementType = "ul"> = Omit<
  PropsOf<E>,
  keyof StepsBaseProps
> &
  StepsBaseProps &
  IComponentBaseProps;

// Void elements rarely used here, but included for completeness
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

const Steps = <E extends ElementType = "ul">(
  props: StepsProps<E>,
): JSX.Element => {
  const [local, others] = splitProps(
    props as StepsBaseProps & Record<string, unknown>,
    [
      "children",
      "vertical",
      "horizontal",
      "as",
      "class",
      "className",
      "style",
      "dataTheme",
    ],
  );

  const Tag = createMemo(() => local.as || ("ul" as ElementType));

  const classes = createMemo(() =>
    twMerge(
      "steps",
      local.class,
      local.className,
      clsx({
        "steps-vertical": local.vertical,
        "steps-horizontal": local.horizontal,
      }),
    ),
  );

  if (VoidElementList.includes(Tag())) {
    return (
      <Dynamic
        component={Tag()}
        {...others}
        role="group"
        aria-label="Steps"
        data-theme={local.dataTheme}
        class={classes()}
        style={local.style}
      />
    );
  }

  return (
    <Dynamic
      component={Tag()}
      {...others}
      role="group"
      aria-label="Steps"
      data-theme={local.dataTheme}
      class={classes()}
      style={local.style}
    >
      {local.children}
    </Dynamic>
  );
};

export default Object.assign(Steps, { Step });
