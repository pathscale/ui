import type { JSX } from "solid-js";
import { twMerge } from "tailwind-merge";
import { splitProps } from "solid-js";

import type { IComponentBaseProps } from "../types";

export type CollapseTitleProps<T extends HTMLElement = HTMLDivElement> =
  JSX.HTMLAttributes<T> &
    IComponentBaseProps & {
      "aria-expanded"?: boolean;
      "aria-controls"?: string;
    };

export const classesFn = ({ className }: { className?: string }) =>
  twMerge("collapse-title", className);

export function CollapseTitle(props: CollapseTitleProps): JSX.Element {
  const [local, others] = splitProps(props, [
    "class",
    "children",
    "aria-expanded",
    "aria-controls",
  ]);

  const ariaExpanded = local["aria-expanded"];
  const ariaControls = local["aria-controls"];

  const role = "button";
  const tabIndex = 0;

  const className = classesFn({ className: local.class });

  return (
    <div
      {...others}
      class={className}
      role={role}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
      tabIndex={tabIndex}
    >
      {local.children}
    </div>
  );
}

export type SummaryProps = JSX.HTMLAttributes<HTMLElement> &
  IComponentBaseProps & {
    "aria-expanded"?: boolean;
    "aria-controls"?: string;
  };

export function Summary(props: SummaryProps): JSX.Element {
  const [local, others] = splitProps(props, [
    "class",
    "children",
    "aria-expanded",
    "aria-controls",
  ]);

  const ariaExpanded = local["aria-expanded"];
  const ariaControls = local["aria-controls"];

  const className = classesFn({ className: local.class });

  return (
    <summary
      {...others}
      class={className}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
    >
      {local.children}
    </summary>
  );
}
