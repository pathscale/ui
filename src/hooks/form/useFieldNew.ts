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
 * Field components own their own presentation; this supplies the state they
 * need to show it.
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

  const value = createMemo(() => form.getFieldValue(name));
  const meta = createMemo(() => form.getFieldMeta(name));
  const touched = createMemo(() => meta().isTouched);

  // Gated on `isTouched` so a form does not open covered in errors for fields
  // nobody has reached yet. `submit()` touches everything, which is what makes
  // a failed submit show all of them at once.
  const error = createMemo((): string | undefined =>
    meta().isTouched ? getFirstFieldError(meta().errors) : undefined,
  );

  const invalid = createMemo(() => Boolean(error()));

  const handleChange = (next: unknown) => form.setFieldValue(name, next);
  const handleBlur = () => form.validateField(name, "blur");

  return { value, error, touched, invalid, handleChange, handleBlur };
};
