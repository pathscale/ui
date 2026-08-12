import type { JSX } from "solid-js";

import { invokeEventHandler } from "../../lib/events";

/**
 * Card's behaviour: a pressable card activates on Enter and Space.
 *
 * `onKeyDown`, `role` and `tabIndex` are declared as behaviour rather than left
 * to the plain-HTML bucket because the component has an opinion about all three
 * — it composes the caller's handler and supplies defaults for the other two.
 * Left as HTML they would land on the element first and be overwritten.
 */
export function createCard(behaviour: Record<string, unknown>) {
  return {
    onKeyDown: behaviour.onKeyDown,
    role: behaviour.role,
    tabIndex: behaviour.tabIndex,
  };
}

/**
 * The caller's handler runs first and can cancel ours, which is why this is a
 * composition rather than a replacement.
 *
 * `isPressable` is a presentation prop — it decides a class — so it is not
 * available to `createCard`, which only ever sees behaviour. It is applied here
 * instead, at the one place where presentation and the DOM meet.
 */
export function pressableKeyDown(
  callers: unknown,
  isPressable: () => boolean,
): JSX.EventHandler<HTMLDivElement, KeyboardEvent> {
  return (event) => {
    invokeEventHandler(callers as never, event);
    if (event.defaultPrevented || !isPressable()) return;
    if (event.key !== "Enter" && event.key !== " ") return;
    // Only when the card itself has focus. A keypress bubbling up from a
    // button inside it must not click the card as well.
    if (event.target !== event.currentTarget) return;

    event.preventDefault();
    event.currentTarget.click();
  };
}
