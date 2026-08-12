import type { JSX } from "solid-js";
import { defineComponent } from "solid-layouts";
import type { IComponentBaseProps } from "../types";
import type { ComponentColor } from "../types";
import { IconLayout } from "./Icon.layout";
import { icon } from "./Icon.recipe";

export type IconProps = IComponentBaseProps & {
  width?: number;
  height?: number;
  color?: ComponentColor;
  name?: string;
};

const Icon = defineComponent({ recipe: icon, layout: IconLayout }) as unknown as (
  props: IconProps,
) => JSX.Element;

export default Icon;
