import type { JSX } from "solid-js";
import { twMerge } from "tailwind-merge";

import type { IComponentBaseProps } from "../types";

export type CollapseTitleProps<T extends HTMLElement = HTMLDivElement> =
  JSX.HTMLAttributes<T> & IComponentBaseProps;

export const classesFn = ({ className }: { className?: string }) =>
  twMerge("collapse-title", className);

export function CollapseTitle(props: CollapseTitleProps): JSX.Element {
  return <div {...props} class={classesFn({ className: props.class })} />;
}

export type SummaryProps = JSX.HTMLAttributes<HTMLElement> &
  IComponentBaseProps;

export function Summary(props: SummaryProps): JSX.Element {
  return <summary {...props} class={classesFn({ className: props.class })} />;
}
