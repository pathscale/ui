import "./CloseButton.css";
import { splitProps, type Component, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";

import type { IComponentBaseProps } from "../types";
import { CLASSES } from "./CloseButton.classes";

export type CloseButtonVariant = "default";

export type CloseButtonProps = Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, "disabled"> &
  IComponentBaseProps & {
    variant?: CloseButtonVariant;
    isDisabled?: boolean;
    isPending?: boolean;
    startIcon?: JSX.Element;
    endIcon?: JSX.Element;
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
    "startIcon",
    "endIcon",
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
      {...{ class: twMerge(
        CLASSES.base,
        CLASSES.variant[variant()],
        local.class,
        local.className,
      ) }}
      data-slot="close-button"
      data-pending={local.isPending ? "true" : "false"}
      data-theme={local.dataTheme}
      style={local.style}
      disabled={disabled()}
      aria-disabled={disabled() ? "true" : "false"}
    >
      {local.startIcon ? (
        <span
          {...{ class: twMerge(CLASSES.slot.icon, CLASSES.slot.iconStart) }}
          data-slot="close-button-start-icon"
        >
          {local.startIcon}
        </span>
      ) : null}
      {local.children}
      {local.endIcon ? (
        <span
          {...{ class: twMerge(CLASSES.slot.icon, CLASSES.slot.iconEnd) }}
          data-slot="close-button-end-icon"
        >
          {local.endIcon}
        </span>
      ) : null}
    </button>
  );
};

export default CloseButton;
