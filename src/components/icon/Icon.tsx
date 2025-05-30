import clsx from "clsx";
import { type JSX, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";
import type { IComponentBaseProps } from "../types";
import { ComponentColor } from "../types";

export type IconProps = IComponentBaseProps & {
  width?: number;
  height?: number;
  color?: ComponentColor;
  name?: string;
};

const Icon = (props: IconProps): JSX.Element => {
  const [local, others] = splitProps(props, [
    "width",
    "height",
    "className",
    "class",
    "name",
    "style",
    "dataTheme",
  ]);

  const width = local.width ?? 24;
  const height = local.height ?? 24;
  const name = local.name;

  const sizeClass = () => `${name} w-${width / 4} h-${height / 4}`;

  const classes = () => {
    return twMerge(
      clsx(
        local.className ?? local.class,
        sizeClass(),
      )
    );
  };

  return (
    <span
      {...others}
      class={classes()}
      style={local.style}
      data-theme={local.dataTheme}
    />
  );
};

export default Icon;
