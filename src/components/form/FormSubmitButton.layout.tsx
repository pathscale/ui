import { omit, type ParentComponent } from "solid-js";
import Button from "../button";
import type { ButtonProps } from "../button";
import { useFormContext } from "../../hooks/form/FormContext";
import type { AnyFormApi } from "../../hooks/form/FormContext";
import type { Layout } from "../../lib/layouts";
import { componentRecipe } from "./Form.recipe";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type FormSubmitButtonProps = Omit<ButtonProps, "type" | "isDisabled" | "isLoading"> & {
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
 * Submit button that subscribes to form state and disables/shows pending
 * automatically.
 *
 * Must be rendered inside a `<Form form={...}>` component (or receive an
 * explicit `form` prop).
 *
 * ```tsx
 * <Form form={form}>
 *   ...
 *   <FormSubmitButton>Log in</FormSubmitButton>
 * </Form>
 * ```
 */
const FormSubmitButton: Layout<typeof componentRecipe, FormSubmitButtonProps> = () => {
  const others = omit(props, "form", "children");

  const resolveForm = (): AnyFormApi => {
    if (props.form != null) return props.form;
    return useFormContext();
  };

  const form = resolveForm();

  // `<tsForm.Subscribe>` was a render prop whose only job was to deliver two
  // booleans. Both are accessors on the form now, so the component reads them
  // directly and Solid tracks them the same way.
  return (
    <Button
      {...others}
      type="submit"
      state={form.isSubmitting() ? "loading" : form.isValid() ? "default" : "disabled"}
    >
      {props.children}
    </Button>
  );
};

export default FormSubmitButton;
export { FormSubmitButton };
