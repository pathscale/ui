import "./CloseButton.css";
import type { JSX } from "solid-js";
import { defineComponent } from "solid-layouts";

import type { IComponentBaseProps } from "../types";
import { CloseButtonLayout } from "./CloseButton.layout";
import { createCloseButton } from "./CloseButton.logic";
import { closeButton } from "./CloseButton.recipe";

export type CloseButtonVariant = "default";

export type CloseButtonProps = Omit<
  JSX.ButtonHTMLAttributes<HTMLButtonElement>,
  "disabled"
> &
  IComponentBaseProps & {
    variant?: CloseButtonVariant;
    isDisabled?: boolean;
    isPending?: boolean;
    startIcon?: JSX.Element;
    endIcon?: JSX.Element;
    className?: string;
  };

/**
 * `type` and `aria-label` are declared as behaviour because the component
 * supplies defaults for both; left as plain HTML they would reach the element
 * first and the defaults would overwrite whatever the caller set.
 */
const CloseButton = defineComponent({
  recipe: closeButton,
  name: "CloseButton",
  defaults: { variant: "default" },
  behaviour: [
    "isDisabled",
    "isPending",
    "startIcon",
    "endIcon",
    "type",
    "aria-label",
  ],
  setup: createCloseButton,
  layout: CloseButtonLayout,
}) as unknown as (props: CloseButtonProps) => JSX.Element;

export default CloseButton;
export { CloseButton };
