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
   * Any Standard Schema-compatible schema (Zod, Valibot, Arktype, ...).
   * Applied as `validators.onChange`, `validators.onBlur` and
   * `validators.onSubmit`.
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
// Internal validation logic
// ---------------------------------------------------------------------------

type ValidationCause = "change" | "blur" | "submit" | "mount" | "server";

type ValidationLogicProps = {
  // biome-ignore lint/suspicious/noExplicitAny: TanStack Form validator map shape is internal
  validators?: any;
  // biome-ignore lint/suspicious/noExplicitAny: TanStack Form API type is intentionally erased in wrapper
  form: any;
  event: {
    type: ValidationCause;
    async: boolean;
  };
  runValidation: (props: {
    validators: Array<
      | {
          // biome-ignore lint/suspicious/noExplicitAny: validator function types are internal
          fn: any;
          cause: ValidationCause;
        }
      | undefined
    >;
    // biome-ignore lint/suspicious/noExplicitAny: TanStack Form API type is intentionally erased in wrapper
    form: any;
  }) => void;
};

const createValidationLogic = (props: ValidationLogicProps) => {
  if (!props.validators) {
    return props.runValidation({
      validators: [],
      form: props.form,
    });
  }

  const isAsync = props.event.async;

  const onMountValidator = isAsync
    ? undefined
    : ({ fn: props.validators.onMount, cause: "mount" as const });

  const onChangeValidator = {
    fn: isAsync ? props.validators.onChangeAsync : props.validators.onChange,
    cause: "change" as const,
  };

  const onBlurValidator = {
    fn: isAsync ? props.validators.onBlurAsync : props.validators.onBlur,
    cause: "blur" as const,
  };

  const onSubmitValidator = {
    fn: isAsync ? props.validators.onSubmitAsync : props.validators.onSubmit,
    cause: "submit" as const,
  };

  const onServerValidator = isAsync
    ? undefined
    : ({
        fn: () => undefined,
        cause: "server" as const,
      });

  switch (props.event.type) {
    case "mount": {
      return props.runValidation({
        validators: [onMountValidator],
        form: props.form,
      });
    }
    case "submit": {
      return props.runValidation({
        validators: [
          onChangeValidator,
          onBlurValidator,
          onSubmitValidator,
          onServerValidator,
        ],
        form: props.form,
      });
    }
    case "server": {
      return props.runValidation({
        validators: [],
        form: props.form,
      });
    }
    case "blur": {
      return props.runValidation({
        validators: [onBlurValidator, onServerValidator],
        form: props.form,
      });
    }
    case "change": {
      // Re-run blur validators on each change so blur-origin errors are cleared
      // immediately when the value becomes valid again.
      return props.runValidation({
        validators: [onChangeValidator, onBlurValidator, onServerValidator],
        form: props.form,
      });
    }
    default: {
      throw new Error(`Unknown validation event type: ${props.event.type}`);
    }
  }
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
  const hasSchema = Boolean(options.schema);
  const hasAsyncValidators = Boolean(options.asyncValidators);

  // biome-ignore lint/suspicious/noExplicitAny: TanStack Form generics are erased at our wrapper boundary
  const tsForm: any = createTSForm(() => ({
    defaultValues: options.defaultValues as Record<string, unknown>,

    validators: hasSchema || hasAsyncValidators
      ? {
          // biome-ignore lint/suspicious/noExplicitAny: Standard Schema bridges Zod/Valibot/etc.
          onChange: options.schema as any,
          // biome-ignore lint/suspicious/noExplicitAny: Standard Schema bridges Zod/Valibot/etc.
          onBlur: options.schema as any,
          // biome-ignore lint/suspicious/noExplicitAny: Standard Schema bridges Zod/Valibot/etc.
          onSubmit: options.schema as any,
          onBlurAsync: options.asyncValidators?.onBlur as any,
          onSubmitAsync: options.asyncValidators?.onSubmit as any,
        }
      : undefined,

    validationLogic: createValidationLogic,

    onSubmit: async ({ value }: { value: unknown }) => {
      await options.onSubmit?.(value as TValues);
    },
  }));

  return { _tsForm: tsForm };
};
