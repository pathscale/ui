import type { JSX } from "solid-js";

type JSXElement = JSX.Element;

/**
 * CloseButton's behaviour.
 *
 * `isPending` disables the button as well as `isDisabled` does: a button whose
 * action is already running should not take a second click. Both are folded
 * into one `disabled` here rather than being re-derived in the markup.
 */
/**
 * The props the logic consumes. Declared here because nothing else can know:
 * they are not presentation and not attributes the element accepts.
 */
export const behaviour = [
  "isDisabled",
  "isPending",
  "startIcon",
  "endIcon",
  "type",
  "aria-label",
] as const;

export type Props = {
  isDisabled?: boolean;
  isPending?: boolean;
  startIcon?: JSXElement;
  endIcon?: JSXElement;
};

export function createCloseButton(behaviour: Record<string, unknown>) {
  return {
    disabled: () =>
      Boolean(behaviour.isDisabled) || Boolean(behaviour.isPending),
    pending: () => Boolean(behaviour.isPending),
    startIcon: behaviour.startIcon,
    endIcon: behaviour.endIcon,
    type: behaviour.type,
    label: behaviour["aria-label"],
  };
}
