import { Show } from "solid-js";
import type { Layout } from "solid-layouts";

import type { closeButton } from "./CloseButton.recipe";

/**
 * CloseButton's markup. `aria-label` defaults to "Close" because the button
 * has no text of its own — without it a screen reader announces an empty
 * button.
 */
export const CloseButtonLayout: Layout<typeof closeButton> = (
  { slot, children },
  props,
) => (
  <button
    {...slot.root}
    type={(props.type as "button" | "submit" | "reset") ?? "button"}
    aria-label={(props.label as string) ?? "Close"}
    disabled={props.disabled as boolean}
    aria-disabled={props.disabled ? "true" : "false"}
  >
    <Show when={props.startIcon}>
      <span {...slot.iconStart}>{props.startIcon as never}</span>
    </Show>
    {children}
    <Show when={props.endIcon}>
      <span {...slot.iconEnd}>{props.endIcon as never}</span>
    </Show>
  </button>
);
