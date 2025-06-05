import type { JSX } from "solid-js";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";
import { splitProps } from "solid-js";

import type { IComponentBaseProps } from "../types";
import { Summary } from "./CollapseTitle";

export type CollapseDetailsProps = JSX.HTMLAttributes<HTMLDetailsElement> &
  IComponentBaseProps & {
    icon?: "arrow" | "plus";
    open?: boolean;
    "aria-label"?: string;
    "aria-expanded"?: boolean;
    "aria-controls"?: string;
  };

export function classesFn({
  className,
  icon,
  open,
}: {
  className?: string;
  icon?: "arrow" | "plus";
  open?: boolean;
}) {
  return twMerge(
    "collapse",
    className,
    clsx({
      "collapse-arrow": icon === "arrow",
      "collapse-plus": icon === "plus",
      "collapse-open": open === true,
      "collapse-close": open === false,
    })
  );
}

export default function CollapseDetails(
  props: CollapseDetailsProps
): JSX.Element {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "icon",
    "open",
    "aria-label",
    "aria-expanded",
    "aria-controls",
  ]);

  const detailsId =
    others.id || `details-${Math.random().toString(36).slice(2, 11)}`;

  const className = classesFn({
    className: local.class,
    icon: local.icon,
    open: local.open,
  });

  const ariaLabel = local["aria-label"];
  const ariaExpanded =
    local["aria-expanded"] !== undefined ? local["aria-expanded"] : local.open;
  const ariaControls = local["aria-controls"];

  return (
    <details
      {...others}
      id={detailsId}
      class={className}
      open={local.open}
      aria-label={ariaLabel}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
    >
      {local.children}
    </details>
  );
}

CollapseDetails.Title = Summary;
