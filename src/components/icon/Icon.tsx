import { type JSX, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";
import type { IComponentBaseProps } from "../types";

type ElementType = keyof JSX.IntrinsicElements;

type ColorType =
  | "default"
  | "neutral"
  | "primary"
  | "secondary"
  | "accent"
  | "success"
  | "warning"
  | "info"
  | "error";

type IconBaseProps = {
  width?: number;
  height?: number;
  dataTheme?: string;
  class?: string;
  className?: string;
  style?: JSX.CSSProperties;
  color?: ColorType;
  name?: string;
};

type PropsOf<E extends ElementType> = JSX.IntrinsicElements[E];

export type IconProps<E extends ElementType = "span"> = Omit<
  PropsOf<E>,
  keyof IconBaseProps
> &
  IconBaseProps &
  IComponentBaseProps;

const Icon = <E extends ElementType = "span">(
  props: IconProps<E>
): JSX.Element => {
  const [local, others] = splitProps(
    props as IconBaseProps & Record<string, unknown>,
    ["width", "height", "className", "class", "name", "style", "dataTheme"]
  );

  const width = local.width ?? 24;
  const height = local.height ?? 24;

  const classes = () =>
    twMerge(
      clsx(
        local.className ?? local.class,
        local.name && `icon-[${local.name}]`,
        `w-${width / 4} h-${height / 4}`
      )
    );

  return (
    <>
      <span
        {...others}
        class={classes()}
        style={local.style}
        data-theme={local.dataTheme}
      />
    </>
  );
};

export default Icon;
