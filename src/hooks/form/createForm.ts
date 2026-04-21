import { createForm as createTSForm } from "@tanstack/solid-form";
import type { StandardSchemaV1 } from "@standard-schema/spec";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

type AnyValues = Record<string, unknown>;

export type AsyncValidatorFn<TValues extends AnyValues> = (context: {
  value: TValues;
}) => Promise<Partial<Record<keyof TValues, string>> | undefined>;

export type CreateFormOptions<TValues extends AnyValues = AnyValues> = {
  /**
   * Initial values for every field. Used to infer the form's value type and
   * to determine whether a field is "dirty".
   */
  defaultValues: TValues;

  /**
   * Any Standard Schema-compatible schema (Zod, Valibot, Arktype, …).
   * Applied as `validators.onBlur` and `validators.onSubmit` by default.
   */
  schema?: StandardSchemaV1<TValues>;

  /**
   * Additional async validators for fields that need server-side validation
   * (e.g. username availability). These run *after* the synchronous schema.
   */
  asyncValidators?: {
    onBlur?: AsyncValidatorFn<TValues>;
    onSubmit?: AsyncValidatorFn<TValues>;
  };

  /**
   * Called when the form is submitted and all validators pass.
   */
  onSubmit?: (value: TValues) => void | Promise<void>;
};

/**
 * The form API returned by `createForm`.
 *
 * Consumers should use `<Form form={api}>` to wire it into the component tree.
 * For advanced use, access the raw TanStack Form instance via `api._tsForm`.
 */
export type FormApi<TValues extends AnyValues = AnyValues> = {
  /**
   * Raw TanStack Form instance. Intended as an escape hatch for cases not
   * covered by the library's abstractions (custom field rendering, `<form.Subscribe>`, etc.).
   * Prefixed with `_` to signal that it's an internal detail.
   *
   * TanStack Form's type has 12 generic parameters — we intentionally erase
   * them here to keep the public API simple. Use `form._tsForm` to access the
   * full typed instance in advanced scenarios.
   */
  // biome-ignore lint/suspicious/noExplicitAny: TanStack Form has 12 generic params; erased for public API simplicity
  _tsForm: any;
  /** Phantom field: preserves TValues for type inference in consuming hooks. */
  _values?: TValues;
};

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Creates a new form instance backed by TanStack Form.
 *
 * ```tsx
 * const form = createForm({
 *   defaultValues: { email: "", password: "" },
 *   schema: loginSchema,          // Zod or Valibot — both work
 *   onSubmit: async (values) => { await login(values); },
 * });
 *
 * return (
 *   <Form form={form}>
 *     <FormField name="email" label="Email" />
 *     <FormField name="password" label="Password" inputProps={{ type: "password" }} />
 *     <FormSubmitButton>Log in</FormSubmitButton>
 *   </Form>
 * );
 * ```
 */
export const createForm = <TValues extends AnyValues = AnyValues>(
  options: CreateFormOptions<TValues>,
): FormApi<TValues> => {
  // biome-ignore lint/suspicious/noExplicitAny: TanStack Form generics are erased at our wrapper boundary
  const tsForm: any = createTSForm(() => ({
    defaultValues: options.defaultValues as Record<string, unknown>,

    validators: options.schema
      ? {
          // biome-ignore lint/suspicious/noExplicitAny: Standard Schema bridges Zod/Valibot/etc.
          onChange: options.schema as any,
          // biome-ignore lint/suspicious/noExplicitAny: Standard Schema bridges Zod/Valibot/etc.
          onBlur: options.schema as any,
          // biome-ignore lint/suspicious/noExplicitAny: Standard Schema bridges Zod/Valibot/etc.
          onSubmit: options.schema as any,
        }
      : undefined,

    onSubmit: async ({ value }: { value: unknown }) => {
      await options.onSubmit?.(value as TValues);
    },
  }));

  return { _tsForm: tsForm };
};
