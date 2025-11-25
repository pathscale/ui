import type { JSX } from "solid-js";
import { twMerge } from "tailwind-merge";

import type { IComponentBaseProps } from "../types";

export type CardBodyProps = JSX.HTMLAttributes<HTMLDivElement> &
  IComponentBaseProps;

export default function CardBody(props: CardBodyProps): JSX.Element {
  return (
    <div
      {...props}
      class={twMerge("card-body", props.class)}
    />
  );
}
