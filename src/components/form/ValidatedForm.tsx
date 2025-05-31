import { type JSX, splitProps, createMemo } from "solid-js";
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
  onError?: (errors: Record<string, string>) => void;
  initialValues?: z.infer<T>;
};

function ValidatedForm<T extends z.ZodTypeAny>(
  props: ValidatedFormProps<T>
): JSX.Element {
  const [local, others] = splitProps(props, [
    "children",
    "schema",
    "onSubmit",
    "onError",
    "initialValues",
  ]);

  const formConfig = createMemo(() => ({
    initialValues: local.initialValues,
    extend: [validator({ schema: local.schema })],
    onSubmit: (values: any) => local.onSubmit(values),
    onError: (errors: unknown) => {
      if (local.onError) {
        const flatErrors: Record<string, string> = {};

        function flattenErrors(obj: any, prefix = "") {
          for (const key in obj) {
            const value = obj[key];
            const newKey = prefix ? `${prefix}.${key}` : key;

            if (typeof value === "string") {
              flatErrors[newKey] = value;
            } else if (Array.isArray(value)) {
              flatErrors[newKey] = value.join(", ");
            } else if (typeof value === "object" && value !== null) {
              flattenErrors(value, newKey);
            }
          }
        }

        flattenErrors(errors);
        local.onError(flatErrors);
      }
    },
  }));

  const { form } = createForm(formConfig());

  return (
    <Form {...others} ref={form}>
      {local.children}
    </Form>
  );
}

export default ValidatedForm;
