/**
 * CloseButton's behaviour.
 *
 * `isPending` disables the button as well as `isDisabled` does: a button whose
 * action is already running should not take a second click. Both are folded
 * into one `disabled` here rather than being re-derived in the markup.
 */
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
