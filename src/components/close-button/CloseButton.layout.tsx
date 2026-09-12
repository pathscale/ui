import "./CloseButton.css";
import type { JSX } from "@solidjs/web";
import { Show } from "solid-js";

import type { UIBaseProps, State } from "../vocabulary";
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
  const disabled = () => Boolean((props.state === "disabled")) || Boolean(props.isPending);

  return (
    <button
      {...slot.root}
      type={props.type ?? "button"}
      aria-label={local["aria-label"] ?? "Close"}
      onClick={props.onClick}
      data-pending={props.isPending ? "true" : "false"}
      data-theme={props.dataTheme}
      style={props.style}
      disabled={disabled()}
      aria-disabled={disabled() ? "true" : "false"}
    >
      <Show when={props.startIcon}>
        <span {...slot.startIcon}>{props.startIcon}</span>
      </Show>
      {props.children}
      <Show when={props.endIcon}>
        <span {...slot.endIcon}>{props.endIcon}</span>
      </Show>
    </button>
  );
};

export default CloseButton;
