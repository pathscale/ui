import { children, createMemo, type JSX, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";

import type { IComponentBaseProps } from "../types";

const horizontalOptions = {
  start: "toast-start",
  center: "toast-center",
  end: "toast-end",
} as const;

const verticalOptions = {
  top: "toast-top",
  middle: "toast-middle",
  bottom: "toast-bottom",
} as const;

type ToastPosition = {
  horizontal?: keyof typeof horizontalOptions;
  vertical?: keyof typeof verticalOptions;
};

export type ToastProps = ToastPosition &
  IComponentBaseProps & {
    max?: number;
  } & Omit<JSX.HTMLAttributes<HTMLDivElement>, keyof ToastPosition | "max">;

const Toast = (props: ToastProps): JSX.Element => {
  const [local, others] = splitProps(props, [
    "horizontal",
    "vertical",
    "class",
    "className",
    "style",
    "dataTheme",
    "max",
  ]);

  const positionClasses = [
    horizontalOptions[local.horizontal || "end"],
    verticalOptions[local.vertical || "bottom"],
  ];

  const limitedChildren = createMemo(() => {
    const childrenArray = children(() => props.children).toArray();

    if (local.max && local.max > 0) {
      return childrenArray.slice(-local.max);
    }

    return childrenArray;
  });

  return (
    <div
      {...others}
      role="status"
      class={twMerge("toast", ...positionClasses, local.class, local.className)}
      data-theme={local.dataTheme}
      style={local.style}
    >
      {limitedChildren()}
    </div>
  );
};

export default Toast;
