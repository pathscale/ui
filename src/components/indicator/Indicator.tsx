import { clsx } from "clsx";
import { type JSX, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";
import { twMerge } from "tailwind-merge";

import type { IComponentBaseProps } from "../types";

type ElementType = keyof JSX.IntrinsicElements;

type IndicatorBaseProps = {
  horizontal?: "start" | "center" | "end";
  vertical?: "top" | "middle" | "bottom";
  as?: ElementType;
  children?: JSX.Element;
  dataTheme?: string;
  class?: string;
  className?: string;
  style?: JSX.CSSProperties;
};

type PropsOf<E extends ElementType> = JSX.IntrinsicElements[E];

export type IndicatorProps<E extends ElementType = "div"> = Omit<
  PropsOf<E>,
  keyof IndicatorBaseProps
> &
  IndicatorBaseProps &
  IComponentBaseProps;

const Indicator = <E extends ElementType = "div">(
  props: IndicatorProps<E>,
): JSX.Element => {
  const [local, others] = splitProps(
    props as IndicatorBaseProps & Record<string, unknown>,
    [
      "children",
      "horizontal",
      "vertical",
      "dataTheme",
      "class",
      "className",
      "style",
      "as",
    ],
  );

  const classes = () => twMerge("indicator", local.class, local.className);

  const Tag = local.as || "div";

  return (
    <Dynamic
      component={Tag}
      {...others}
      data-theme={local.dataTheme}
      class={classes()}
      style={local.style}
    >
      {local.children}
    </Dynamic>
  );
};

type IndicatorItemBaseProps = {
  horizontal?: "start" | "center" | "end";
  vertical?: "top" | "middle" | "bottom";
  as?: ElementType;
  children?: JSX.Element;
  dataTheme?: string;
  class?: string;
  className?: string;
  style?: JSX.CSSProperties;
};

export type IndicatorItemProps<E extends ElementType = "span"> = Omit<
  PropsOf<E>,
  keyof IndicatorItemBaseProps
> &
  IndicatorItemBaseProps &
  IComponentBaseProps;

const IndicatorItem = <E extends ElementType = "span">(
  props: IndicatorItemProps<E>,
): JSX.Element => {
  const [local, others] = splitProps(
    props as IndicatorItemBaseProps & Record<string, unknown>,
    [
      "children",
      "horizontal",
      "vertical",
      "dataTheme",
      "class",
      "className",
      "style",
      "as",
    ],
  );

  const classes = () =>
    twMerge(
      "indicator-item",
      local.class,
      local.className,
      clsx({
        "indicator-start": local.horizontal === "start",
        "indicator-center": local.horizontal === "center",
        "indicator-end": local.horizontal === "end",
        "indicator-top": local.vertical === "top",
        "indicator-middle": local.vertical === "middle",
        "indicator-bottom": local.vertical === "bottom",
      }),
    );

  const Tag = local.as || "span";

  return (
    <Dynamic
      component={Tag}
      {...others}
      data-theme={local.dataTheme}
      class={classes()}
      style={local.style}
    >
      {local.children}
    </Dynamic>
  );
};

export default Object.assign(Indicator, {
  Item: IndicatorItem,
});
