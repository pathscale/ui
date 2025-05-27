import type { JSX } from "solid-js";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";

import type { IComponentBaseProps } from "../types";

export type ModalLegacyProps = JSX.HTMLAttributes<HTMLDivElement> &
  IComponentBaseProps & {
    open?: boolean;
    responsive?: boolean;
    onClickBackdrop?: () => void;
  };

export default function ModalLegacy(props: ModalLegacyProps): JSX.Element {
  const {
    children,
    open,
    responsive,
    onClickBackdrop,
    dataTheme,
    class: classProp,
    className,
    ...rest
  } = props;

  const containerClasses = twMerge(
    "modal",
    clsx({
      "modal-open": open,
      "modal-bottom sm:modal-middle": responsive,
    })
  );

  const bodyClasses = twMerge("modal-box", classProp, className);

  return (
    <div
      aria-label="Modal"
      aria-hidden={!open}
      aria-modal={open}
      data-theme={dataTheme}
      class={containerClasses}
      onClick={(e) => {
        e.stopPropagation();
        if (e.target === e.currentTarget) {
          e.stopPropagation();
          onClickBackdrop?.();
        }
      }}
    >
      <div {...rest} data-theme={dataTheme} class={bodyClasses}>
        {children}
      </div>
    </div>
  );
}
