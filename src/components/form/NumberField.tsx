import { Component, JSX, Show, createMemo, splitProps } from "solid-js";
import Input from "../input";
import type { InputProps } from "../input";
import { useFormValidation } from "./ValidatedForm";
import { twMerge } from "tailwind-merge";
import Form from "./Form";

export interface NumberFieldProps extends Omit<InputProps, "type" | "ref"> {
  label?: string;
  name: string;
  required?: boolean;
  labelClass?: string;
  errorClass?: string;
  containerClass?: string;
  description?: string;
  descriptionClass?: string;
  min?: number;
  max?: number;
  step?: number;
  allowDecimals?: boolean;
  formatter?: (value: string) => string;
}

export const NumberField: Component<NumberFieldProps> = (props) => {
  const { errors, touched } = useFormValidation();

  const [local, inputProps] = splitProps(props, [
    "label",
    "required",
    "labelClass",
    "errorClass",
    "containerClass",
    "description",
    "descriptionClass",
    "min",
    "max",
    "step",
    "allowDecimals",
    "formatter",
    "class",
    "className",
    "onInput",
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

  const stepValue = createMemo(
    () => local.step || (local.allowDecimals !== false ? "any" : 1)
  );

  const handleInput = (event: InputEvent) => {
    const target = event.target as HTMLInputElement;
    let value = target.value;

    // Handle decimal restriction
    if (local.allowDecimals === false && value.includes(".")) {
      value = value.replace(/\./g, "");
      target.value = value;
    }

    // Apply custom formatter if provided
    if (local.formatter) {
      target.value = local.formatter(value);
    }

    // Call the original onInput handler if provided
    if (local.onInput) {
      local.onInput(event);
    }
  };

  return (
    <div class={containerClasses()}>
      {local.label && (
        <Form.Label title={local.label} class={local.labelClass}>
          {local.required && <span class="text-error ml-1">*</span>}
        </Form.Label>
      )}

      {local.description && (
        <p class={descriptionClasses()}>{local.description}</p>
      )}

      <Input
        id={props.name}
        type="number"
        min={local.min}
        max={local.max}
        step={stepValue()}
        aria-invalid={hasError()}
        aria-required={local.required}
        onInput={handleInput}
        class={inputClasses()}
        {...inputProps}
      />

      <Show when={hasError()}>
        <p class={errorClasses()}>{errors(props.name)}</p>
      </Show>
    </div>
  );
};

export default NumberField;
