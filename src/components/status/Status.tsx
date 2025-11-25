import { createMemo, type ParentComponent, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";

import type { ComponentColor, IComponentBaseProps } from "../types";

export interface StatusProps extends IComponentBaseProps {
  color?: ComponentColor;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

const Status: ParentComponent<StatusProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "color",
    "size",
  ]);

  const className = createMemo(() =>
    twMerge(
      "status",
      local.color && `status-${local.color}`,
      local.size && `status-${local.size}`,
      local.class,
      local.className,
    ),
  );

  return (
    <span
      {...others}
      data-theme={local.dataTheme}
      class={className()}
    >
      {local.children}
    </span>
  );
};

export default Status;
