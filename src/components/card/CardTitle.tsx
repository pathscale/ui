import type { JSX, ValidComponent } from "solid-js";
import { Dynamic } from "solid-js/web";
import { twMerge } from "tailwind-merge";

import type { IComponentBaseProps } from "../types";

export type CardTitleProps = IComponentBaseProps &
  JSX.HTMLAttributes<HTMLElement> & {
    tag?: ValidComponent;
  };

export default function CardTitle(props: CardTitleProps): JSX.Element {
  const {
    tag = "div",
    class: className,
    className: _className,
    ...rest
  } = props;

  return (
    <Dynamic
      component={tag}
      {...rest}
      class={twMerge("card-title", className, _className)}
    />
  );
}
