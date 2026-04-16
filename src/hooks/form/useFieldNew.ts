import { createMemo, type Accessor } from "solid-js";
import { useFormContext } from "./FormContext";
import { getFirstFieldError } from "./getFirstFieldError";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type UseFieldResult = {
  /** Current field value as an unknown (cast as needed). */
  value: Accessor<unknown>;
  /** Normalized first error string, gated by `isTouched`. `undefined` if clean. */
  error: Accessor<string | undefined>;
  /** Whether the field has been blurred at least once. */
  touched: Accessor<boolean>;
  /** `true` when `error()` is non-empty. */
  invalid: Accessor<boolean>;
  /** Call when the field value changes (accepts the new value directly). */
  handleChange: (value: unknown) => void;
  /** Call when the field loses focus. */
  handleBlur: () => void;
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Reads live field state for `name` from the nearest `<Form>` context.
 *
 * Must be called **inside** a `<Form form={...}>` descendant component.
 * For fields that need fine-grained rendering, prefer using `form._tsForm.Field`
 * render prop directly.
 *
 * ```tsx
 * // Inside a child of <Form form={form}>
 * const email = useField("email");
 *
 * <Input
 *   value={String(email.value() ?? "")}
 *   onInput={(e) => email.handleChange(e.currentTarget.value)}
 *   onBlur={email.handleBlur}
 *   aria-invalid={email.invalid()}
 * />
 * ```
 */
export const useField = (name: string): UseFieldResult => {
  const form = useFormContext();
  const tsForm = form._tsForm;

  const value = createMemo(() => tsForm.getFieldValue(name as never));

  const meta = createMemo(() => tsForm.getFieldMeta(name as never));

  const touched = createMemo(() => Boolean(meta()?.isTouched));

  const error = createMemo((): string | undefined => {
    const m = meta();
    if (!m?.isTouched) return undefined;
    return getFirstFieldError((m.errors ?? []) as unknown[]);
  });

  const invalid = createMemo(() => Boolean(error()));

  const handleChange = (value: unknown) => {
    tsForm.setFieldValue(name as never, value as never);
  };

  const handleBlur = () => {
    tsForm.validateField(name as never, "blur");
  };

  return { value, error, touched, invalid, handleChange, handleBlur };
};
