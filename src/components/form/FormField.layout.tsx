import type { JSX } from "@solidjs/web";
import { type Component, omit, Show } from "solid-js";
import type { AnyFormApi } from "../../hooks/form/FormContext";
import { useFormContext } from "../../hooks/form/FormContext";
import { getFirstFieldError } from "../../hooks/form/getFirstFieldError";
import type { Layout } from "../../lib/layouts";
import { twMerge } from "../../lib/twMerge";
import type { InputFieldProps } from "../input";
import Input from "../input";
import Label from "../label";
import { FieldErrorMessage } from "./FieldErrorMessage.generated";
import type { componentRecipe } from "./Form.recipe";

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
  inputProps?: Omit<
    InputFieldProps,
    "name" | "value" | "onInput" | "onBlur" | "aria-invalid" | "isInvalid"
  >;
  /** Container class override. */
  class?: string;
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
const FormField: Layout<typeof componentRecipe, FormFieldProps> = () => {
  const _rest = omit(props, "name", "label", "inputProps", "class", "form");

  // Resolve form: explicit prop takes priority over context.
  const resolveForm = (): AnyFormApi => {
    if (props.form != null) return props.form;
    return useFormContext();
  };

  const form = resolveForm();

  // Read straight off the form rather than through a render-prop child. The
  // engine is ours now, so field state is just three accessors, and a wrapper
  // component that exists only to hand them down would be a layer with no job.
  const meta = () => form.getFieldMeta(props.name);
  const errorMessage = () =>
    meta().isTouched ? getFirstFieldError(meta().errors) : undefined;

  return (
    <div
      {...{ class: twMerge("flex flex-col gap-1", props.class) }}
      data-slot="form-field"
    >
      <Show when={props.label}>
        <Label
          for={props.name}
          data-invalid={errorMessage() ? "true" : undefined}
        >
          {props.label}
        </Label>
      </Show>

      <Input.Field
        {...props.inputProps}
        id={props.name}
        name={props.name}
        value={String(form.getFieldValue(props.name) ?? "")}
        onInput={(e: InputEvent & { currentTarget: HTMLInputElement }) => {
          form.setFieldValue(props.name, e.currentTarget.value);
        }}
        onBlur={() => form.validateField(props.name, "blur")}
        aria-invalid={errorMessage() ? "true" : undefined}
        issues={
          errorMessage()
            ? [{ code: "invalid", message: String(errorMessage()) }]
            : undefined
        }
      />

      <FieldErrorMessage message={errorMessage()} />
    </div>
  );
};

export default FormField;
export { FormField };
