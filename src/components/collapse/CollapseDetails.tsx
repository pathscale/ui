import type { JSX } from "solid-js";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";

import type { IComponentBaseProps } from "../types";
import { Summary } from "./CollapseTitle";

export type CollapseDetailsProps = JSX.HTMLAttributes<HTMLDetailsElement> &
  IComponentBaseProps & {
    icon?: "arrow" | "plus";
    open?: boolean;
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
  const classes = classesFn({
    className: props.class,
    icon: props.icon,
    open: props.open,
  });

  return (
    <details {...props} class={classes} open={props.open}>
      {props.children}
    </details>
  );
}

CollapseDetails.Title = Summary;
