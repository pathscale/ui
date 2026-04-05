import type { JSX } from "solid-js";
import { twMerge } from "tailwind-merge";

import type { IComponentBaseProps } from "../types";

export type CollapseContentProps = JSX.HTMLAttributes<HTMLDivElement> &
  IComponentBaseProps;

export default function CollapseContent(
  props: CollapseContentProps,
): JSX.Element {
  const classes = twMerge("collapse-content", props.class);

  return (
    <div
      {...props}
      data-collapse-part="content"
      class={classes}
    />
  );
}
