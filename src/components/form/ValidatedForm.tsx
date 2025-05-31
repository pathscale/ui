import {
  createContext,
  createMemo,
  splitProps,
  useContext,
  type JSX,
} from "solid-js";
import { createForm } from "@felte/solid";
import { validator } from "@felte/validator-zod";
import { z } from "zod";
import Form, { type FormProps } from "./Form";

export type ValidatedFormProps<T extends z.ZodTypeAny> = Omit<
  FormProps,
  "onSubmit"
> & {
  schema: T;
  onSubmit: (values: z.infer<T>) => void | Promise<void>;
  initialValues?: z.infer<T>;
};

interface FormValidationContext {
  errors: (path?: string | ((data: any) => any)) => any;
  touched: (path?: string | ((data: any) => any)) => any;
  data: (path?: string | ((data: any) => any)) => any;
  isValid: () => boolean;
  isSubmitting: () => boolean;
}

const FormValidationContext = createContext<FormValidationContext>();

export function useFormValidation() {
  const context = useContext(FormValidationContext);
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

  const { form, errors, touched, data, isValid, isSubmitting } = createForm<
    z.infer<T>
  >({
    initialValues: local.initialValues,
    extend: [validator({ schema: local.schema })],
    onSubmit: local.onSubmit,
  });

  const contextValue = createMemo(
    (): FormValidationContext => ({
      errors,
      touched,
      data,
      isValid,
      isSubmitting,
    })
  );

  return (
    <FormValidationContext.Provider value={contextValue()}>
      <Form {...others} ref={form}>
        {local.children}
      </Form>
    </FormValidationContext.Provider>
  );
}

export default ValidatedForm;
