import type { JSX } from "solid-js";
import { twMerge } from "tailwind-merge";
import { splitProps } from "solid-js";

import type { IComponentBaseProps } from "../types";

export type CollapseContentProps = JSX.HTMLAttributes<HTMLDivElement> &
  IComponentBaseProps & {
    "aria-labelledby"?: string;
    "aria-hidden"?: boolean;
  };

export default function CollapseContent(
  props: CollapseContentProps
): JSX.Element {
  const [local, others] = splitProps(props, [
    "class",
    "children",
    "id",
    "aria-labelledby",
    "aria-hidden",
  ]);

  const className = twMerge("collapse-content", local.class);

  const contentId =
    local.id || `content-${Math.random().toString(36).slice(2, 11)}`;

  const ariaLabelledby = local["aria-labelledby"];
  const ariaHidden = local["aria-hidden"];

  const role = "region";

  return (
    <div
      {...others}
      class={className}
      id={contentId}
      role={role}
      aria-labelledby={ariaLabelledby}
      aria-hidden={ariaHidden}
    >
      {local.children}
    </div>
  );
}
