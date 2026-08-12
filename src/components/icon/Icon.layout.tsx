import "./Icon.css";
import { createMemo } from "solid-js";
import { twMerge } from "tailwind-merge";
import type { Layout } from "../../lib/layouts";
import type { IComponentBaseProps } from "../types";
import type { ComponentColor } from "../types";
import { icon } from "./Icon.recipe";

export type IconProps = IComponentBaseProps & {
  width?: number;
  height?: number;
  color?: ComponentColor;
  name?: string;
};

const Icon: Layout<typeof icon, IconProps> = () => {
  const width = local.width ?? 24;
  const height = local.height ?? 24;

  const classes = createMemo(() =>
    twMerge(slot.root.class, local.name, local.class, local.className),
  );

  return (
    <span
      {...slot.root}
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

export const IconLayout = Icon;
export default Icon;
