/**
 * Apply one requested controlled/uncontrolled boolean-state transition.
 *
 * Capture whether the request changes the current value before mutating local
 * state. Reactive setters may update synchronously; checking again afterwards
 * can incorrectly suppress the owner's change callback.
 */
export function applyBooleanStateRequest(options: {
  current: boolean;
  next: boolean;
  controlled: boolean;
  setInternal: (next: boolean) => void;
  onChange?: (next: boolean) => void;
}): boolean {
  if (options.current === options.next) return false;

  if (!options.controlled) options.setInternal(options.next);
  options.onChange?.(options.next);
  return true;
}
