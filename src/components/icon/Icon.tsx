import "./Icon.css";
import { createMemo, type JSX, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";
import type { IComponentBaseProps } from "../types";
import type { ComponentColor } from "../types";
import { CLASSES } from "./Icon.classes";

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

  const classes = createMemo(() =>
    twMerge(CLASSES.base, local.name, local.class, local.className),
  );

  return (
    <span
      {...others}
      {...{ class: classes() }}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        ...(typeof local.style === "object" ? local.style : {}),
      }}
      data-theme={local.dataTheme}
    />
  );
};

export default Icon;
