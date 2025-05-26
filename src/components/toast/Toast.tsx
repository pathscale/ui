import { type JSX, splitProps } from "solid-js";
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
  IComponentBaseProps &
  Omit<JSX.HTMLAttributes<HTMLDivElement>, keyof ToastPosition>;

const Toast = (props: ToastProps): JSX.Element => {
  const [local, others] = splitProps(props, [
    "horizontal",
    "vertical",
    "class",
    "className",
    "style",
    "dataTheme",
  ]);

  const positionClasses = [
    horizontalOptions[local.horizontal || "end"],
    verticalOptions[local.vertical || "bottom"],
  ];

  return (
    <div
      {...others}
      role="status"
      class={twMerge("toast", ...positionClasses, local.class, local.className)}
      data-theme={local.dataTheme}
      style={local.style}
    >
      {props.children}
    </div>
  );
};

export default Toast;
