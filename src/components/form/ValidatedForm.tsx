import {
  children as resolveChildren,
  createContext,
  createMemo,
  splitProps,
  useContext,
  type JSX,
} from "solid-js";
import { createForm } from "@felte/solid";
import { validator } from "@felte/validator-zod";
import { z } from "zod";
import type { ObjectSetter, Paths } from "@felte/common";
import Form, { type FormProps } from "./Form";

export type ValidatedFormProps<T extends z.ZodTypeAny> = Omit<
  FormProps,
  "onSubmit"
> & {
  schema: T;
  onSubmit: (values: z.infer<T>) => void | Promise<void>;
  initialValues?: z.infer<T>;
  children?: JSX.Element | (() => JSX.Element);
};

interface FormValidationContext<T extends z.ZodTypeAny = z.ZodTypeAny> {
  errors: (path?: string | ((data: any) => any)) => any;
  touched: (path?: string | ((data: any) => any)) => any;
  data: (path?: string | ((data: any) => any)) => any;
  isValid: () => boolean;
  isSubmitting: () => boolean;
  setData: ObjectSetter<z.infer<T>, Paths<z.infer<T>>>;
  setErrors: (errors: any) => void;
  setWarnings: (warnings: any) => void;
  setTouched: (touched: any) => void;
  reset: () => void;
}

const FormValidationContext = createContext<FormValidationContext>();

export function useFormValidation<T extends z.ZodTypeAny = z.ZodTypeAny>() {
  const context = useContext(FormValidationContext) as FormValidationContext<T> | undefined;
  if (!context) {
    throw new Error("useFormValidation must be used within a ValidatedForm");
  }
  return context;
}

function ValidatedForm<T extends z.ZodTypeAny>(
  props: ValidatedFormProps<T>
): JSX.Element {
  const [local, others] = splitProps(props, [
    "children",
    "schema",
    "onSubmit",
    "initialValues",
  ]);

  const {
    form,
    errors,
    touched,
    data,
    isValid,
    isSubmitting,
    setData,
    setErrors,
    setWarnings,
    setTouched,
    reset
  } = createForm<z.infer<T>>({
    initialValues: local.initialValues,
    extend: [validator({ schema: local.schema })],
    onSubmit: local.onSubmit,
  });

  const contextValue = createMemo(
    (): FormValidationContext<T> => ({
      errors,
      touched,
      data,
      isValid,
      isSubmitting,
      setData,
      setErrors,
      setWarnings,
      setTouched,
      reset
    })
  );

  return (
    <FormValidationContext.Provider value={contextValue()}>
      <Form {...others} ref={form}>
        {typeof local.children === "function"
          ? local.children()
          : local.children}
      </Form>
    </FormValidationContext.Provider>
  );
}

export default ValidatedForm;
