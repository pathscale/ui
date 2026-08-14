import "./CloseButton.css";
import { splitProps, type Component, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";

import type { UIBaseProps, State } from "../vocabulary";
import { CLASSES } from "./CloseButton.recipe";
import type { Layout } from "../../lib/layouts";
import { componentRecipe } from "./CloseButton.recipe";

export type CloseButtonVariant = "default";

export type CloseButtonProps = Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, "disabled"> &
  UIBaseProps & {
    variant?: CloseButtonVariant;
    state?: State;
    isPending?: boolean;
    startIcon?: JSX.Element;
    endIcon?: JSX.Element;
  };

const CloseButton: Layout<typeof componentRecipe, CloseButtonProps> = () => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "variant",
    "state",
    "isPending",
    "startIcon",
    "endIcon",
    "type",
    "dataTheme",
    "style",
    "aria-label",
  ]);

  const variant = () => local.variant ?? "default";
  const disabled = () => Boolean((local.state === "disabled")) || Boolean(local.isPending);

  return (
    <button
      {...others}
      type={local.type ?? "button"}
      aria-label={local["aria-label"] ?? "Close"}
      {...{ class: twMerge(
        CLASSES.base,
        CLASSES.variant[variant()],
        local.class,
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
