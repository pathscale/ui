import { Show, splitProps, type Component, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";
import type { FieldApi } from "@tanstack/solid-form";

import Input from "../input";
import type { InputFieldProps } from "../input";
import Label from "../label";
import { useFormContext } from "../../hooks/form/FormContext";
import { getFirstFieldError } from "../../hooks/form/getFirstFieldError";
import { FieldErrorMessage } from "./FieldErrorMessage";
import type { AnyFormApi } from "../../hooks/form/FormContext";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Props accepted by `<FormField>`.
 *
 * The component reads the form from context automatically (no `form` prop
 * needed in normal usage). Pass `form` explicitly only when rendering outside
 * the `<Form>` tree, e.g. inside a Portal or a Dialog.
 */
export type FormFieldProps = {
  /** Field name — must match a key in `createForm({ defaultValues })`. */
  name: string;
  /** Rendered above the input. Optional — omit for unlabelled fields. */
  label?: JSX.Element;
  /**
   * Props forwarded to the underlying `<Input.Field>` element.
   * Use this to set `type`, `placeholder`, `autocomplete`, `startIcon`, etc.
   */
  inputProps?: Omit<InputFieldProps, "name" | "value" | "onInput" | "onBlur" | "aria-invalid" | "isInvalid">;
  /** Container class override. */
  class?: string;
  className?: string;
  /**
   * Escape hatch: explicit form override for Portal / out-of-tree usage.
   * When provided, the component does NOT read from context.
   */
  form?: AnyFormApi;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Compound field primitive: Label + Input + error message.
 *
 * Reads the form instance from `<Form form={...}>` context automatically.
 * Pass `form` explicitly only when rendering inside a Portal.
 *
 * ```tsx
 * <Form form={form} class="space-y-4">
 *   <FormField name="email" label="Email address" />
 *   <FormField name="password" label="Password" inputProps={{ type: "password" }} />
 * </Form>
 * ```
 */
const FormField: Component<FormFieldProps> = (props) => {
  const [local, _rest] = splitProps(props, [
    "name",
    "label",
    "inputProps",
    "class",
    "className",
    "form",
  ]);

  // Resolve form: explicit prop takes priority over context.
  const resolveForm = (): AnyFormApi => {
    if (local.form != null) return local.form;
    return useFormContext();
  };

  const form = resolveForm();
  const tsForm = form._tsForm;

  return (
    <tsForm.Field
      name={local.name as never}
      children={(field: () => FieldApi<any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any>) => {
        const errorMessage = () =>
          field().state.meta.isTouched
            ? getFirstFieldError((field().state.meta.errors ?? []) as unknown[])
            : undefined;

        return (
          <div
            {...{ class: twMerge("flex flex-col gap-1", local.class, local.className) }}
            data-slot="form-field"
          >
            <Show when={local.label}>
              <Label
                for={local.name}
                data-invalid={Boolean(errorMessage()) ? "true" : undefined}
              >
                {local.label}
              </Label>
            </Show>

            <Input.Field
              {...local.inputProps}
              id={local.name}
              name={local.name}
              value={String(field().state.value ?? "")}
              onInput={(e: InputEvent & { currentTarget: HTMLInputElement }) => {
                field().handleChange(e.currentTarget.value as never);
              }}
              onBlur={() => field().handleBlur()}
              aria-invalid={Boolean(errorMessage()) ? true : undefined}
              isInvalid={Boolean(errorMessage())}
            />

            <FieldErrorMessage message={errorMessage()} />
          </div>
        );
      }}
    />
  );
};

export default FormField;
export { FormField };
