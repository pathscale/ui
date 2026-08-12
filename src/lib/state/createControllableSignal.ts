import { createSignal, untrack } from "solid-js";

export type ControllableSignalOptions<T> = {
  /** Controlled value. Passing anything other than `undefined` takes control. */
  value?: () => T | undefined;
  /** Initial value used only while uncontrolled. */
  defaultValue?: () => T | undefined;
  /** Notified on every change, controlled or not. */
  onChange?: (value: T) => void;
  /**
   * Applied to every value before it is stored or reported, so a controlled
   * consumer and the internal signal cannot disagree about what a value means
   * (e.g. an accordion in single mode truncating an array to one entry).
   */
  normalize?: (value: T) => T;
};

/**
 * One signal that is controlled or uncontrolled depending on whether `value`
 * resolves to `undefined`, which is the rule the whole library already follows.
 *
 * 27 components re-implemented this by hand. The recurring mistake was reading
 * `props.value` once instead of per-read, which pins a component to whatever it
 * was on the first render, and the second was calling `onChange` only on the
 * uncontrolled path, so controlled consumers never heard about their own
 * changes.
 */
export function createControllableSignal<T>(
  options: ControllableSignalOptions<T>,
): [() => T | undefined, (next: T) => void] {
  const normalize = (value: T) => options.normalize?.(value) ?? value;

  const [internal, setInternal] = createSignal<T | undefined>(
    untrack(() => {
      const initial = options.defaultValue?.();
      return initial === undefined ? undefined : normalize(initial);
    }),
  );

  // Read per-call, never cached: control can be handed over at any time, and a
  // component that decided once would ignore it.
  const isControlled = () => options.value?.() !== undefined;

  const value = () => {
    const controlled = options.value?.();
    if (controlled !== undefined) return normalize(controlled);
    const current = internal();
    return current === undefined ? undefined : normalize(current);
  };

  const setValue = (next: T) => {
    const normalized = normalize(next);
    // The internal signal is only the source of truth while uncontrolled, but
    // `onChange` fires either way: a controlled parent learns about the change
    // it is expected to apply.
    if (!isControlled()) {
      setInternal(() => normalized);
    }
    options.onChange?.(normalized);
  };

  return [value, setValue];
}
