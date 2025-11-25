import type { JSX } from "solid-js";
import { twMerge } from "tailwind-merge";

import type { IComponentBaseProps } from "../types";

export type CardActionsProps = JSX.HTMLAttributes<HTMLDivElement> &
  IComponentBaseProps;

export default function CardActions(props: CardActionsProps): JSX.Element {
  return (
    <div
      {...props}
      class={twMerge("card-actions", props.class)}
    />
  );
}
