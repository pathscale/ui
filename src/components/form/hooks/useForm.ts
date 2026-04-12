import { createForm as createFelteForm } from "@felte/solid";
import { validator } from "@felte/validator-zod";
import type { ObjectSetter, Paths } from "@felte/common";
import type { Accessor } from "solid-js";
import type { z } from "zod";

type AnyValues = Record<string, unknown>;

export type FormPathQuery<TValues extends AnyValues = AnyValues> =
  | string
  | ((data: TValues) => unknown);

export type FormDirective = (
  element: HTMLFormElement,
  accessor?: Accessor<unknown>,
) => void | (() => void);

export type UseFormOptions<TValues extends AnyValues = AnyValues> = {
  schema?: z.ZodType<TValues>;
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
  getFieldValue: (name: string) => unknown;
  getFieldError: (name: string) => unknown;
  getFieldTouched: (name: string) => boolean;
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
    (formConfig as any).extend = [validator({ schema: options.schema })];
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
    getFieldValue: (name: string) => data(name),
    getFieldError: (name: string) => errors(name),
    getFieldTouched: (name: string) => Boolean(touched(name)),
    setFieldValue: (name: string, value: unknown) => {
      (
        setData as unknown as (path: string, nextValue: unknown) => void
      )(name, value);
    },
  });

  return controller;
};
