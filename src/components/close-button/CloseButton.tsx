import "./CloseButton.css";
import { splitProps, type Component, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";

import type { IComponentBaseProps } from "../types";

export type CloseButtonVariant = "default";

const VARIANT_CLASS_MAP: Record<CloseButtonVariant, string> = {
  default: "close-button--default",
};

export type CloseButtonProps = Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, "disabled"> &
  IComponentBaseProps & {
    variant?: CloseButtonVariant;
    isDisabled?: boolean;
    isPending?: boolean;
    className?: string;
  };

const CloseButton: Component<CloseButtonProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "variant",
    "isDisabled",
    "isPending",
    "type",
    "dataTheme",
    "style",
    "aria-label",
  ]);

  const variant = () => local.variant ?? "default";
  const disabled = () => Boolean(local.isDisabled) || Boolean(local.isPending);

  return (
    <button
      {...others}
      type={local.type ?? "button"}
      aria-label={local["aria-label"] ?? "Close"}
      class={twMerge(
        "close-button",
        VARIANT_CLASS_MAP[variant()],
        local.class,
        local.className,
      )}
      data-slot="close-button"
      data-pending={local.isPending ? "true" : "false"}
      data-theme={local.dataTheme}
      style={local.style}
      disabled={disabled()}
      aria-disabled={disabled() ? "true" : "false"}
    >
      {local.children ?? (
        <svg
          aria-hidden="true"
          data-slot="close-button-icon"
          fill="none"
          role="presentation"
          viewBox="0 0 16 16"
        >
          <path
            clip-rule="evenodd"
            d="M3.47 3.47a.75.75 0 0 1 1.06 0L8 6.94l3.47-3.47a.75.75 0 1 1 1.06 1.06L9.06 8l3.47 3.47a.75.75 0 1 1-1.06 1.06L8 9.06l-3.47 3.47a.75.75 0 0 1-1.06-1.06L6.94 8 3.47 4.53a.75.75 0 0 1 0-1.06Z"
            fill="currentColor"
            fill-rule="evenodd"
          />
        </svg>
      )}
    </button>
  );
};

export default CloseButton;
