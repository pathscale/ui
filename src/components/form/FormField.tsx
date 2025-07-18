import { Component, Show, createMemo, splitProps } from "solid-js";
import Input from "../input";
import type { InputProps } from "../input";
import { useFormValidation } from "./ValidatedForm";
import { twMerge } from "tailwind-merge";
import Form from "./Form";

export interface FormFieldProps extends Omit<InputProps, "ref"> {
  label: string;
  name: string;
  required?: boolean;
  labelClass?: string;
  errorClass?: string;
  containerClass?: string;
  description?: string;
  descriptionClass?: string;
}

export const FormField: Component<FormFieldProps> = (props) => {
  const { errors, touched } = useFormValidation();

  const [local, inputProps] = splitProps(props, [
    "label",
    "required",
    "labelClass",
    "errorClass",
    "containerClass",
    "description",
    "descriptionClass",
    "class",
    "className",
  ]);

  const containerClasses = createMemo(() =>
    twMerge("flex flex-col gap-2", local.containerClass)
  );

  const descriptionClasses = createMemo(() =>
    twMerge("text-sm text-base-content/70", local.descriptionClass)
  );

  const errorClasses = createMemo(() =>
    twMerge("text-error text-sm", local.errorClass)
  );

  const inputClasses = createMemo(() => twMerge(local.class, local.className));

  const hasError = createMemo(
    () => touched(props.name) && !!errors(props.name)
  );

  return (
    <div class={containerClasses()}>
      <Form.Label title={local.label} class={local.labelClass}>
        {local.required && <span class="text-error ml-1">*</span>}
      </Form.Label>

      {local.description && (
        <p class={descriptionClasses()}>{local.description}</p>
      )}

      <Input
        id={props.name}
        aria-invalid={hasError()}
        aria-required={local.required}
        class={inputClasses()}
        {...inputProps}
      />

      <Show when={hasError()}>
        <p class={errorClasses()}>{errors(props.name)}</p>
      </Show>
    </div>
  );
};

export default FormField;
