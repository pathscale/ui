import type { StandardSchemaV1 } from "@standard-schema/spec";
import { createStore, flush } from "solid-js";
import { getFirstFieldError } from "./getFirstFieldError";

// biome-ignore lint/suspicious/noExplicitAny: a form's values are the caller's shape
type AnyValues = Record<string, any>;

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
   * Runs on change, on blur and on submit.
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

/** What a field tracks besides its value. */
type FieldMeta = {
  isTouched: boolean;
  errors: string[];
};

/**
 * The form API returned by `createForm`.
 *
 * Consumers should use `<Form form={api}>` to wire it into the component tree,
 * and read individual fields with `useField(name)`.
 */
export type FormApi<TValues extends AnyValues = AnyValues> = {
  /** Every field's current value. */
  values: () => TValues;
  /** One field's current value. */
  getFieldValue: (name: string) => unknown;
  /** One field's touched flag and errors. */
  getFieldMeta: (name: string) => FieldMeta;
  /** Write a value and re-run the synchronous schema. */
  setFieldValue: (name: string, value: unknown) => void;
  /** Mark touched and validate, which is what a blur means. */
  validateField: (
    name: string,
    cause: "change" | "blur",
  ) => void | Promise<void>;
  /** Validate everything, run async validators, then `onSubmit` if clean. */
  submit: () => Promise<void>;
  /** True while `submit()` is awaiting. */
  isSubmitting: () => boolean;
  /** True when no field holds an error. */
  isValid: () => boolean;
  /** Phantom field: preserves TValues for type inference in consuming hooks. */
  _values?: TValues;
};

/**
 * Read a Standard Schema's issues into a per-field error map.
 *
 * The spec puts the field on `issue.path`, which is a list of keys or of
 * `{ key }` segments depending on the library. Only the first segment is used:
 * this form is flat, and a nested path would key an error to a field name that
 * does not exist rather than to its parent.
 */
const issuesToErrors = (
  issues: readonly StandardSchemaV1.Issue[],
): Record<string, string[]> => {
  const errors: Record<string, string[]> = {};
  for (const issue of issues) {
    const head = issue.path?.[0];
    const name =
      typeof head === "object" && head !== null && "key" in head
        ? String(head.key)
        : String(head ?? "");
    if (!name) continue;
    (errors[name] ??= []).push(issue.message);
  }
  return errors;
};

/**
 * A form, without TanStack.
 *
 * The engine is deliberately small because the field components already carry
 * the hard parts: `Input`, `Select`, `Checkbox` and the rest own their own
 * presentation, `state="invalid"` and error slot. What was missing is
 * bookkeeping — values, touched, errors, and when to run the schema — and that
 * is what this is.
 *
 * `@tanstack/solid-form` used to supply it, through a `_tsForm` escape hatch
 * that leaked its twelve erased generics into this library's public type. It
 * also peer-pinned Solid 1, which made it one of three packages standing
 * between this library and Solid 2.
 *
 * Validation runs on change and on blur, and errors are only *shown* once a
 * field is touched — the display gate lives in `useField`, so a submit can
 * surface every error at once by touching every field.
 */
export const createForm = <TValues extends AnyValues = AnyValues>(
  options: CreateFormOptions<TValues>,
): FormApi<TValues> => {
  // `NoFn` rejects a callable initial value, which a generic `TValues` cannot
  // prove it is not. The values are a plain object by construction.
  const [values, setValues] = createStore<TValues>({
    ...options.defaultValues,
  } as never);
  const [meta, setMeta] = createStore<Record<string, FieldMeta>>({});
  const [status, setStatus] = createStore({ isSubmitting: false });

  const metaFor = (name: string): FieldMeta =>
    meta[name] ?? { isTouched: false, errors: [] };

  /** Replace every field's errors with the schema's verdict, keeping touched. */
  const applyErrors = (
    errors: Record<string, string[]>,
    touchAll: boolean,
  ): void => {
    setMeta((draft) => {
      for (const name of new Set([
        ...Object.keys(draft),
        ...Object.keys(errors),
      ])) {
        draft[name] = {
          isTouched: touchAll || (draft[name]?.isTouched ?? false),
          errors: errors[name] ?? [],
        };
      }
    });
    // `isValid()` reads this store, and a caller asking right after a change
    // expects the answer to describe the change it just made.
    flush();
  };

  /** Run the schema synchronously. Returns false when it found problems. */
  const runSchema = (): boolean => {
    const schema = options.schema;
    if (!schema) return true;
    const result = schema["~standard"].validate(values as TValues);
    // A Standard Schema may validate asynchronously. The synchronous callers
    // here (change, blur) cannot wait for one, and treating a pending result as
    // "no errors" would clear real ones, so it is left to `submit()`.
    if (result instanceof Promise) return true;
    applyErrors(result.issues ? issuesToErrors(result.issues) : {}, false);
    return !result.issues?.length;
  };

  const setFieldValue = (name: string, value: unknown): void => {
    // Cast at the boundary: the store is typed by the caller's values, and a
    // field name is a string the caller chose, so this is the one place the two
    // cannot be related without making `name` a keyof and losing dotted paths.
    (setValues as unknown as (fn: (draft: AnyValues) => void) => void)(
      (draft) => {
        draft[name] = value;
      },
    );
    // Solid 2 batches writes and flushes on a microtask, so the schema would
    // otherwise validate the value from before this call. The form's whole job
    // is to answer "is this valid now", which means now rather than next tick.
    flush();
    runSchema();
  };

  const validateField = (name: string, cause: "change" | "blur"): void => {
    if (cause === "blur") {
      setMeta((draft) => {
        draft[name] = { isTouched: true, errors: draft[name]?.errors ?? [] };
      });
      flush();
    }
    runSchema();
  };

  const submit = async (): Promise<void> => {
    // Touch everything first: an untouched field hides its error, and a submit
    // that silently does nothing because of an error you cannot see is the
    // worst version of this.
    setMeta((draft) => {
      for (const name of Object.keys(values as AnyValues)) {
        draft[name] = { isTouched: true, errors: draft[name]?.errors ?? [] };
      }
    });
    flush();

    let ok = runSchema();

    // An async schema is resolved here, where there is somewhere to await it.
    const schema = options.schema;
    if (schema) {
      const result = schema["~standard"].validate(values as TValues);
      if (result instanceof Promise) {
        const resolved = await result;
        applyErrors(
          resolved.issues ? issuesToErrors(resolved.issues) : {},
          true,
        );
        ok = !resolved.issues?.length;
      }
    }

    if (!ok) return;

    setStatus((draft) => {
      draft.isSubmitting = true;
    });
    try {
      const asyncSubmit = options.asyncValidators?.onSubmit;
      if (asyncSubmit) {
        const serverErrors = await asyncSubmit({ value: values as TValues });
        if (serverErrors && Object.keys(serverErrors).length > 0) {
          setMeta((draft) => {
            for (const [name, message] of Object.entries(serverErrors)) {
              if (!message) continue;
              draft[name] = { isTouched: true, errors: [String(message)] };
            }
          });
          return;
        }
      }
      await options.onSubmit?.(values as TValues);
    } finally {
      setStatus((draft) => {
        draft.isSubmitting = false;
      });
    }
  };

  return {
    values: () => values as TValues,
    getFieldValue: (name) => (values as AnyValues)[name],
    getFieldMeta: metaFor,
    setFieldValue,
    validateField,
    submit,
    isSubmitting: () => status.isSubmitting,
    isValid: () =>
      Object.values(meta).every((m) => (m?.errors.length ?? 0) === 0),
  };
};

export { getFirstFieldError };
