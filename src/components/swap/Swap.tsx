import { createMemo, type JSX, splitProps } from "solid-js";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import { wrapWithElementIfInvalid } from "../utils";
import type { IComponentBaseProps } from "../types";

export type SwapProps = Omit<
  JSX.LabelHTMLAttributes<HTMLLabelElement>,
  "onClick" | "onChange"
> &
  IComponentBaseProps & {
    onElement: JSX.Element;
    offElement: JSX.Element;
    active?: boolean;
    rotate?: boolean;
    flip?: boolean;
    onClick?: JSX.EventHandlerUnion<HTMLInputElement, MouseEvent>;
    onChange?: JSX.EventHandlerUnion<HTMLInputElement, Event>;
  };

export default function Swap(props: SwapProps): JSX.Element {
  const [local, others] = splitProps(props, [
    "onElement",
    "offElement",
    "active",
    "rotate",
    "flip",
    "dataTheme",
    "class",
    "className",
    "onClick",
    "onChange",
  ]);

  const className = createMemo(() =>
    twMerge(
      "swap",
      clsx({
        "swap-active": local.active,
        "swap-rotate": local.rotate,
        "swap-flip": local.flip,
      }),
      local.class,
      local.className,
    ),
  );

  const onEl = createMemo(() =>
    wrapWithElementIfInvalid({
      node: local.onElement,
      wrapper: "div",
      className: "swap-on",
    }),
  );

  const offEl = createMemo(() =>
    wrapWithElementIfInvalid({
      node: local.offElement,
      wrapper: "div",
      className: "swap-off",
    }),
  );

  return (
    <label
      {...others}
      data-theme={local.dataTheme}
      class={className()}
      role="switch"
    >
      <input
        type="checkbox"
        onClick={local.onClick}
        onChange={local.onChange}
      />
      {onEl()}
      {offEl()}
    </label>
  );
}
