import "./Icon.css";
import { type JSX, mergeProps } from "solid-js";
import { defineComponent } from "solid-layouts";

import type { ComponentColor, IComponentBaseProps } from "../types";
import { IconLayout } from "./Icon.layout";
import { icon } from "./Icon.recipe";

export type IconProps = IComponentBaseProps & {
  width?: number;
  height?: number;
  color?: ComponentColor;
  name?: string;
};

const Base = defineComponent({
  recipe: icon,
  name: "Icon",
  layout: IconLayout,
});

/**
 * Two props that are neither presentation nor behaviour, folded into the
 * escape hatches they belong to.
 *
 * `name` is an iconify class, so it joins `class`: a recipe axis enumerates
 * its values, and the set of icon names is the whole of iconify. `width` and
 * `height` are free numbers for the same reason, so they join `style`.
 *
 * `mergeProps` rather than a spread, because props are getters and spreading
 * reads each once at call time.
 */
const Icon = ((props: IconProps) =>
  Base(
    mergeProps(props, {
      get class() {
        return [props.class, props.name].filter(Boolean).join(" ");
      },
      get style(): JSX.CSSProperties {
        return {
          width: `${props.width ?? 24}px`,
          height: `${props.height ?? 24}px`,
          ...(typeof props.style === "object" ? props.style : {}),
        };
      },
    }) as Record<string, unknown>,
  )) as (props: IconProps) => JSX.Element;

export default Icon;
export { Icon };
