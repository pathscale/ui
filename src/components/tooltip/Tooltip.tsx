import {
  type JSX,
  splitProps,
  mergeProps,
  type Component,
  Show,
} from "solid-js";
import { tooltipVariants } from "./Tooltip.styles";
import type { VariantProps } from "@src/lib/style";

export type TooltipProps = {
  label: string;
  delay?: number;
  always?: boolean;
  children?: JSX.Element;
} & VariantProps<typeof tooltipVariants> &
  JSX.HTMLAttributes<HTMLSpanElement>;

const Tooltip: Component<TooltipProps> = (props) => {
  const [local, variantProps, otherProps] = splitProps(
    props,
    ["label", "delay", "always", "children"],
    ["type", "size", "position", "rounded", "dashed", "multilined", "animated"]
  );
  return (
    <span class="relative inline-block group" {...otherProps}>
      {local.children}
      <Show when={local.label}>
        <span
          class={tooltipVariants(variantProps)}
          style={{
            "transition-delay": `${local.delay ?? 0}ms`,
            opacity: local.always ? 1 : undefined,
            "pointer-events": "none",
          }}
        >
          {local.label}
        </span>
      </Show>
    </span>
  );
};

export default Tooltip;
