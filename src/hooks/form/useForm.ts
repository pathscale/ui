import { createForm as createFelteForm } from "@felte/solid";
import { safeParse, type GenericSchema } from "valibot";
import type { ObjectSetter, Paths } from "@felte/common";
import type { Accessor } from "solid-js";

type AnyValues = Record<string, unknown>;

export type FormPathQuery<TValues extends AnyValues = AnyValues> =
  | string
  | ((data: TValues) => unknown);

export type FormDirective = (
  element: HTMLFormElement,
  accessor?: Accessor<unknown>,
) => void | (() => void);

export type UseFormOptions<TValues extends AnyValues = AnyValues> = {
  schema?: GenericSchema;
  initialValues?: TValues;
  onSubmit?: (values: TValues) => void | Promise<void>;
};

export type FormController<TValues extends AnyValues = AnyValues> = FormDirective & {
  errors: (path?: FormPathQuery<TValues>) => unknown;
  touched: (path?: FormPathQuery<TValues>) => unknown;
  data: (path?: FormPathQuery<TValues>) => unknown;
  isValid: () => boolean;
  isSubmitting: () => boolean;
  setData: ObjectSetter<TValues, Paths<TValues>>;
  setErrors: (...args: unknown[]) => unknown;
  setWarnings: (...args: unknown[]) => unknown;
  setTouched: (...args: unknown[]) => unknown;
  reset: () => void;
  setFieldValue: (name: string, value: unknown) => void;
};

const FORM_CONTROLLER_REGISTRY = new WeakMap<
  HTMLFormElement,
  FormController<AnyValues>
>();

const getClosestFormElement = (
  element?: Element | null,
): HTMLFormElement | undefined => {
  if (!element) {
    return undefined;
  }

  if (element instanceof HTMLFormElement) {
    return element;
  }

  const closest = element.closest("form");
  if (closest instanceof HTMLFormElement) {
    return closest;
  }

  return undefined;
};

export const getFormControllerFromElement = (
  element?: Element | null,
): FormController<AnyValues> | undefined => {
  const formElement = getClosestFormElement(element);

  if (!formElement) {
    return undefined;
  }

  return FORM_CONTROLLER_REGISTRY.get(formElement);
};

export const useForm = <TValues extends AnyValues = AnyValues>(
  options: UseFormOptions<TValues> = {},
): FormController<TValues> => {
  const formConfig: Parameters<typeof createFelteForm<TValues>>[0] = {
    initialValues: options.initialValues,
    onSubmit: async (values) => {
      await options.onSubmit?.(values);
    },
  };

  if (options.schema) {
    (formConfig as any).validate = (values: TValues) => {
      const result = safeParse(options.schema!, values);
      if (result.success) return;
      const errors: Record<string, string> = {};
      for (const issue of result.issues) {
        if (issue.path) {
          const path = issue.path.map((p) => p.key).join(".");
          if (!errors[path]) errors[path] = issue.message;
        }
      }
      return errors;
    };
  }

  const {
    form: felteForm,
    errors,
    touched,
    data,
    isValid,
    isSubmitting,
    setData,
    setErrors,
    setWarnings,
    setTouched,
    reset,
  } = createFelteForm<TValues>(formConfig);

  let controller: FormController<TValues>;

  const directive: FormDirective = (element, accessor) => {
    FORM_CONTROLLER_REGISTRY.set(
      element,
      controller as unknown as FormController<AnyValues>,
    );

    const cleanup = (
      felteForm as unknown as (
        node: HTMLFormElement,
        currentAccessor?: Accessor<unknown>,
      ) => void | (() => void)
    )(element, accessor);

    return () => {
      FORM_CONTROLLER_REGISTRY.delete(element);

      if (typeof cleanup === "function") {
        cleanup();
      }
    };
  };

  controller = Object.assign(directive, {
    errors,
    touched,
    data,
    isValid,
    isSubmitting,
    setData,
    setErrors,
    setWarnings,
    setTouched,
    reset,
    setFieldValue: (name: string, value: unknown) => {
      (
        setData as unknown as (path: string, nextValue: unknown) => void
      )(name, value);
    },
  });

  return controller;
};
