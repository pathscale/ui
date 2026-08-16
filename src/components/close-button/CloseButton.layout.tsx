import "./CloseButton.css";
import type { JSX } from "@solidjs/web";
import {omit, type Component} from "solid-js";
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
  const others = omit(
    props,
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
  );

  const variant = () => props.variant ?? "default";
  const disabled = () => Boolean((props.state === "disabled")) || Boolean(props.isPending);

  return (
    <button
      {...others}
      type={props.type ?? "button"}
      aria-label={local["aria-label"] ?? "Close"}
      {...{ class: twMerge(
        CLASSES.base,
        CLASSES.variant[variant()],
        props.class,
      ) }}
      data-slot="close-button"
      data-pending={props.isPending ? "true" : "false"}
      data-theme={props.dataTheme}
      style={props.style}
      disabled={disabled()}
      aria-disabled={disabled() ? "true" : "false"}
    >
      {props.startIcon ? (
        <span
          {...{ class: twMerge(CLASSES.slot.icon, CLASSES.slot.iconStart) }}
          data-slot="close-button-start-icon"
        >
          {props.startIcon}
        </span>
      ) : null}
      {props.children}
      {props.endIcon ? (
        <span
          {...{ class: twMerge(CLASSES.slot.icon, CLASSES.slot.iconEnd) }}
          data-slot="close-button-end-icon"
        >
          {props.endIcon}
        </span>
      ) : null}
    </button>
  );
};

export default CloseButton;
